# 附录 C：核心框架常用配置对照表

本附录把 Spring Boot、Gin、FastAPI 三套框架在同一件事上的配置写法并列，方便你把正文第 5 章（Web 入口与中间件）与第 9 章（部署与优雅停机）的做法迁移到另一门语言。技术基线为 Spring Boot 3.x（JDK 21）、Gin v1.10（Go 1.22+）、FastAPI 0.115 + uvicorn（Python 3.11+）。每个能力先给对照表，再给三端最小真实配置片段。

## C.1 能力对照总表

| 能力 | Spring Boot | Gin | FastAPI + uvicorn |
| --- | --- | --- | --- |
| 路由 | `@GetMapping`/`@PostMapping` | `r.GET`/`r.POST` | `@app.get`/`@app.post` |
| 端口 | `server.port` | `r.Run(":8080")`/`http.Server.Addr` | uvicorn `--port` |
| 请求超时 | `server.tomcat.connection-timeout` | `http.Server` 读写超时字段 | uvicorn `--timeout-keep-alive` |
| 日志级别 | `logging.level.*` | slog/zap 的 level | uvicorn `--log-level` + logging |
| 参数校验 | Bean Validation | binding tag | Pydantic 模型 |
| 健康检查 | Actuator `/actuator/health` | 自定义 `/healthz` 路由 | 自定义 `/healthz` 路由 |
| CORS | `CorsConfiguration`/注解 | `cors.New(...)` 中间件 | `CORSMiddleware` |
| 统一异常 | `@ControllerAdvice` | error middleware | `exception_handler` |
| 优雅停机 | `server.shutdown=graceful` | `srv.Shutdown(ctx)` | uvicorn 处理 SIGTERM |
| 环境变量注入 | `${ENV:default}` 占位符 | `os.Getenv` | Pydantic `BaseSettings` |
| API 文档 | springdoc-openapi | swaggo | 自动生成 OpenAPI |

以下按能力给出最小片段，端口沿用正文实战平台：Java :8081、Go :8080、Python :8082。

## C.2 端口与超时

Spring Boot（`application.yml`）：

```yaml
server:
  port: 8081
  shutdown: graceful
  tomcat:
    connection-timeout: 5s
    keep-alive-timeout: 15s
```

Gin（显式使用 `http.Server` 以便配置超时与停机）：

```go
srv := &http.Server{
    Addr:         ":8080",
    Handler:      r, // *gin.Engine
    ReadTimeout:  5 * time.Second,
    WriteTimeout: 10 * time.Second,
    IdleTimeout:  60 * time.Second,
}
_ = srv.ListenAndServe()
```

FastAPI + uvicorn（命令行）：

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8082 \
  --timeout-keep-alive 15 --workers 1
```

Gin 的超时是 `http.Server` 的字段而非 Gin 独有；uvicorn 只暴露 keep-alive 超时，业务级读超时需在应用内用 asyncio 超时上下文实现。

## C.3 日志级别

Spring Boot：

```yaml
logging:
  level:
    root: INFO
    com.example.price: DEBUG
  pattern:
    level: "%5p [traceId=%X{traceId}]"
```

Gin（结构化日志，Go 1.21+ 标准库 `slog`）：

```go
logger := slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{
    Level: slog.LevelInfo,
}))
slog.SetDefault(logger)
```

FastAPI + uvicorn：

```bash
uvicorn app.main:app --port 8082 --log-level info
```

正文约定日志中带 `traceId`：Spring 用 MDC（`%X{traceId}`），Go 在 slog 里以属性形式附加，Python 用 logging 的 filter 或 contextvars 注入，三端都从 `X-Trace-Id` 请求头取值。

## C.4 健康检查

Spring Boot 用 Actuator（引入 `spring-boot-starter-actuator`）：

```yaml
management:
  endpoints:
    web:
      exposure:
        include: health,info
  endpoint:
    health:
      probes:
        enabled: true   # 暴露 liveness/readiness
```

默认提供 `/actuator/health`。Gin 与 FastAPI 无内建端点，按正文统一响应壳自建：

```go
r.GET("/healthz", func(c *gin.Context) {
    c.JSON(200, gin.H{"code": 0, "message": "ok", "data": gin.H{"status": "UP"}})
})
```

```python
@app.get("/healthz")
async def healthz():
    return {"code": 0, "message": "ok", "data": {"status": "UP"}}
```

## C.5 CORS

Spring Boot（全局配置类）：

```java
@Bean
CorsFilter corsFilter() {
    CorsConfiguration cfg = new CorsConfiguration();
    cfg.setAllowedOrigins(List.of("https://example.com"));
    cfg.setAllowedMethods(List.of("GET", "POST"));
    cfg.setAllowedHeaders(List.of("X-Trace-Id", "Content-Type"));
    UrlBasedCorsConfigurationSource src = new UrlBasedCorsConfigurationSource();
    src.registerCorsConfiguration("/**", cfg);
    return new CorsFilter(src);
}
```

Gin（`github.com/gin-contrib/cors`）：

```go
r.Use(cors.New(cors.Config{
    AllowOrigins: []string{"https://example.com"},
    AllowMethods: []string{"GET", "POST"},
    AllowHeaders: []string{"X-Trace-Id", "Content-Type"},
}))
```

FastAPI：

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://example.com"],
    allow_methods=["GET", "POST"],
    allow_headers=["X-Trace-Id", "Content-Type"],
)
```

三端都显式放行 `X-Trace-Id`，否则跨域场景下正文的链路透传会被浏览器拦掉。

## C.6 统一异常与响应壳

三端都把内部错误收敛成 `{code,message,data,traceId}`。

Spring Boot：

```java
@RestControllerAdvice
class ApiExceptionHandler {
    @ExceptionHandler(BusinessException.class)
    ResponseEntity<ApiResponse> handle(BusinessException e) {
        return ResponseEntity.ok(ApiResponse.error(e.getCode(), e.getMessage()));
    }
}
```

Gin（错误中间件，放在 `r.Use` 链尾）：

```go
func ErrorMiddleware() gin.HandlerFunc {
    return func(c *gin.Context) {
        c.Next()
        if len(c.Errors) > 0 {
            c.JSON(200, gin.H{
                "code": 5000, "message": c.Errors.Last().Error(),
                "data": nil, "traceId": c.GetString("traceId"),
            })
        }
    }
}
```

FastAPI：

```python
@app.exception_handler(BusinessError)
async def business_handler(request: Request, exc: BusinessError):
    return JSONResponse(status_code=200, content={
        "code": exc.code, "message": str(exc),
        "data": None, "traceId": request.headers.get("X-Trace-Id"),
    })
```

## C.7 优雅停机

Spring Boot 只需一行配置（见 C.2 的 `server.shutdown: graceful`），容器收到 SIGTERM 后停止接客并等待在途请求，配合：

```yaml
spring:
  lifecycle:
    timeout-per-shutdown-phase: 20s
```

Gin 需手写信号监听：

```go
quit := make(chan os.Signal, 1)
signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
<-quit
ctx, cancel := context.WithTimeout(context.Background(), 20*time.Second)
defer cancel()
_ = srv.Shutdown(ctx) // 停止接客并等待在途请求
```

uvicorn 默认响应 SIGTERM 做优雅退出，Kubernetes 部署时通过 `terminationGracePeriodSeconds` 给足等待窗口即可；应用内长任务需自行监听取消。

## C.8 环境变量注入

Spring Boot（占位符带默认值）：

```yaml
app:
  price-service-url: ${PRICE_SERVICE_URL:http://localhost:8081}
```

Gin：

```go
url := os.Getenv("PRICE_SERVICE_URL")
if url == "" {
    url = "http://localhost:8081"
}
```

FastAPI（Pydantic v2 的 `BaseSettings`，来自 `pydantic-settings`）：

```python
class Settings(BaseSettings):
    price_service_url: str = "http://localhost:8081"
    model_config = SettingsConfigDict(env_prefix="", env_file=".env")

settings = Settings()  # 自动读取环境变量 PRICE_SERVICE_URL
```

三端的取值优先级都遵循「环境变量 > 配置文件默认值」，这与正文第 9 章的多环境部署约定一致：镜像不变，靠注入的环境变量切换目标地址。

---

对照使用建议：Spring Boot 的能力多为声明式配置（`application.yml`），Gin 多为显式代码（`http.Server` 字段 + 中间件），FastAPI 介于两者之间（命令行参数 + 代码 + `BaseSettings`）。当你把一处配置从一门语言迁到另一门时，先在 C.1 总表定位能力行，再取对应片段落地。
