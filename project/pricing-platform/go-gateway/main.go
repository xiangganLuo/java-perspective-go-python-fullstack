package main

import (
	"bytes"
	"context"
	"encoding/json"
	"io"
	"log"
	"net/http"
	"os"
	"strconv"
	"time"
)

// 统一响应壳，与 docs/protocols/api-contract.md 对齐。
type apiResponse struct {
	Code    int             `json:"code"`
	Message string          `json:"message"`
	Data    json.RawMessage `json:"data,omitempty"`
	TraceID string          `json:"traceId"`
}

func envOr(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

func main() {
	// 下游地址通过环境变量注入，便于 docker-compose 内用服务名互访。
	javaBase := envOr("JAVA_SERVICE_URL", "http://localhost:8081")
	pythonBase := envOr("PYTHON_SERVICE_URL", "http://localhost:8082")

	// 超时预算：网关整体 1500ms，Java 核心 1200ms，Python 分析 400ms（可降级）。
	client := &http.Client{}

	postJSON := func(ctx context.Context, timeout time.Duration, url string, payload []byte, traceID string) (*apiResponse, error) {
		callCtx, cancel := context.WithTimeout(ctx, timeout)
		defer cancel()
		req, err := http.NewRequestWithContext(callCtx, http.MethodPost, url, bytes.NewReader(payload))
		if err != nil {
			return nil, err
		}
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("X-Trace-Id", traceID)
		resp, err := client.Do(req)
		if err != nil {
			return nil, err
		}
		defer resp.Body.Close()
		body, err := io.ReadAll(resp.Body)
		if err != nil {
			return nil, err
		}
		var envelope apiResponse
		if err := json.Unmarshal(body, &envelope); err != nil {
			return nil, err
		}
		return &envelope, nil
	}

	http.HandleFunc("/api/v1/prices/", func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		traceID := r.Header.Get("X-Trace-Id")
		if traceID == "" {
			traceID = "trace-go-" + time.Now().Format("20060102150405")
		}

		ctx, cancel := context.WithTimeout(r.Context(), 1500*time.Millisecond)
		defer cancel()

		sku := r.URL.Path[len("/api/v1/prices/"):]
		member := r.URL.Query().Get("memberLevel")
		if member == "" {
			member = "NORMAL"
		}

		// 第一步：调用 Java 核心价格服务（失败则整体失败，50401）。
		priceBody := []byte(`{"sku":"` + sku + `","memberLevel":"` + member + `"}`)
		price, err := postJSON(ctx, 1200*time.Millisecond, javaBase+"/api/v1/price/calculate", priceBody, traceID)
		if err != nil {
			logLine(traceID, "/api/v1/prices/", 50401, "java price service timeout", start)
			writeJSON(w, http.StatusGatewayTimeout, apiResponse{Code: 50401, Message: "java price service timeout", TraceID: traceID})
			return
		}
		if price.Code != 0 {
			// 业务错误原样透传，保持 Java 侧错误码语义。
			logLine(traceID, "/api/v1/prices/", price.Code, price.Message, start)
			writeJSON(w, http.StatusOK, *price)
			return
		}

		// 第二步：调用 Python 分析服务（失败仅降级，记 50002，不阻断主链路）。
		analysis := json.RawMessage("null")
		if base, ok := extractInt(price.Data, "basePriceCents"); ok {
			analyzeBody := []byte(`{"sku":"` + sku + `","basePriceCents":` + strconv.Itoa(base) + `}`)
			if result, err := postJSON(ctx, 400*time.Millisecond, pythonBase+"/api/v1/analyze", analyzeBody, traceID); err == nil && result.Code == 0 {
				analysis = result.Data
			} else {
				logLine(traceID, "/api/v1/analyze", 50002, "python analysis degraded", start)
			}
		}

		// 第三步：聚合响应，data 分为 price 与 analysis 两段。
		aggregated := apiResponse{
			Code:    0,
			Message: "OK",
			Data:    json.RawMessage(`{"price":` + string(price.Data) + `,"analysis":` + string(analysis) + `}`),
			TraceID: traceID,
		}
		logLine(traceID, "/api/v1/prices/", 0, "OK", start)
		writeJSON(w, http.StatusOK, aggregated)
	})

	http.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		writeJSON(w, http.StatusOK, apiResponse{Code: 0, Message: "OK", Data: json.RawMessage(`{"status":"UP"}`), TraceID: "health"})
	})

	log.Println("go-gateway started on http://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}

// extractInt 从响应 data 中取整数字段（如 basePriceCents）。
func extractInt(data json.RawMessage, field string) (int, bool) {
	var m map[string]any
	if err := json.Unmarshal(data, &m); err != nil {
		return 0, false
	}
	if v, ok := m[field].(float64); ok {
		return int(v), true
	}
	return 0, false
}

// logLine 输出统一日志字段：traceId、endpoint、code、message、latencyMs。
func logLine(traceID, endpoint string, code int, message string, start time.Time) {
	log.Printf(`{"traceId":%q,"service":"go-gateway","endpoint":%q,"latencyMs":%d,"code":%d,"message":%q}`,
		traceID, endpoint, time.Since(start).Milliseconds(), code, message)
}

func writeJSON(w http.ResponseWriter, status int, body apiResponse) {
	raw, _ := json.Marshal(body)
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(status)
	_, _ = w.Write(raw)
}
