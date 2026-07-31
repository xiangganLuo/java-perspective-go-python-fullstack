package main

import (
	"bytes"
	"io"
	"log"
	"net/http"
	"time"
)

func main() {
	client := &http.Client{Timeout: 1500 * time.Millisecond}

	http.HandleFunc("/api/v1/prices/", func(w http.ResponseWriter, r *http.Request) {
		traceID := r.Header.Get("X-Trace-Id")
		if traceID == "" {
			traceID = "trace-go-" + time.Now().Format("20060102150405")
		}

		sku := r.URL.Path[len("/api/v1/prices/"):]
		member := r.URL.Query().Get("memberLevel")
		if member == "" {
			member = "NORMAL"
		}

		body := []byte(`{"sku":"` + sku + `","memberLevel":"` + member + `"}`)
		req, err := http.NewRequest(http.MethodPost, "http://localhost:8081/api/v1/price/calculate", bytes.NewReader(body))
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("X-Trace-Id", traceID)

		resp, err := client.Do(req)
		if err != nil {
			http.Error(w, `{"code":50401,"message":"java price service timeout","traceId":"`+traceID+`"}`, http.StatusGatewayTimeout)
			return
		}
		defer resp.Body.Close()
		w.Header().Set("Content-Type", "application/json; charset=utf-8")
		w.WriteHeader(resp.StatusCode)
		_, _ = io.Copy(w, resp.Body)
	})

	http.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		_, _ = w.Write([]byte(`{"code":0,"message":"OK","data":{"status":"UP"},"traceId":"health"}`))
	})

	log.Println("go-gateway started on http://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
