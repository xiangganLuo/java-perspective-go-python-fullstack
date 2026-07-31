# 附录 C：核心框架常用配置对照表

| 能力 | Spring MVC | Gin | FastAPI |
| --- | --- | --- | --- |
| 路由 | @GetMapping/@PostMapping | r.GET/r.POST | @app.get/@app.post |
| 参数校验 | Bean Validation | binding tag | Pydantic model |
| 拦截器 | HandlerInterceptor | middleware | middleware/dependency |
| 统一异常 | @ControllerAdvice | error middleware | exception_handler |
| 文档 | springdoc-openapi | swaggo | OpenAPI 自动生成 |
