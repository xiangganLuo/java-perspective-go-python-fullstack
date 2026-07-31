# 附录 E：延伸学习资源推荐

本附录按主题分组，每条给出「名称 + 一句话为什么值得读 + 链接」。只收录长期稳定、可信的官方文档、规范与公认经典；对不确定是否长期存续的地址，只写名称不附链接。技术基线为 JDK 21 / Go 1.22+ / Python 3.11+，各资源请以其站点上对应版本为准。

## E.1 语言基础

- Go 官方站与标准库文档 —— Go 语法、工具链与包 API 的权威入口。https://go.dev/
- A Tour of Go —— 交互式速通 Go 核心语法，Java 工程师入门最快路径。https://go.dev/tour/
- Effective Go —— 讲清 Go 的惯用写法与设计取向（零值、组合、命名）。https://go.dev/doc/effective_go
- The Go Programming Language Specification —— 语言规范本身，查零值/类型/泛型细节的最终依据。https://go.dev/ref/spec
- Python 官方教程与语言参考 —— 语法、数据模型、标准库的权威来源。https://docs.python.org/3/
- PEP 8 – Style Guide for Python Code —— Python 代码风格的事实标准。https://peps.python.org/pep-0008/
- PEP 484 – Type Hints —— type hints 的规范源头，理解 `Optional`/`Protocol` 的基础。https://peps.python.org/pep-0484/
- Java Platform, Standard Edition Documentation（Oracle）—— JDK 语言与 API 的官方文档。https://docs.oracle.com/en/java/javase/

## E.2 并发

- Go: Concurrency（Effective Go 章节）—— goroutine 与 channel 的官方讲法。https://go.dev/doc/effective_go#concurrency
- Go by Example: Goroutines / Channels / Select —— 以可运行示例讲并发原语，便于对照实验。https://gobyexample.com/
- pkg.go.dev: context —— `context.Context` 取消与超时的 API 与用法说明。https://pkg.go.dev/context
- Python: asyncio 文档 —— 事件循环、协程、任务与超时的官方参考。https://docs.python.org/3/library/asyncio.html
- Python: threading 与 GIL 说明 —— 理解 GIL 为何让线程无法并行 CPU 任务。https://docs.python.org/3/library/threading.html
- Java: java.util.concurrent（JUC）包文档 —— 线程池、并发容器与同步器的官方 API。（见 Oracle JDK 文档中的 `java.util.concurrent`）

## E.3 Web 框架

- Spring Boot Reference Documentation —— 自动配置、Actuator、优雅停机等能力的官方手册。https://docs.spring.io/spring-boot/
- Spring Framework Documentation —— Spring MVC/WebFlux、DI 容器的底层参考。https://docs.spring.io/spring-framework/reference/
- Gin Web Framework 文档 —— 路由、中间件、绑定校验的官方说明。https://gin-gonic.com/docs/
- FastAPI 文档 —— 类型驱动路由、依赖注入、自动 OpenAPI 的权威教程。https://fastapi.tiangolo.com/
- Pydantic 文档（v2）—— 校验模型、序列化、`BaseSettings` 的官方文档。https://docs.pydantic.dev/
- Starlette 文档 —— FastAPI 的底层 ASGI 框架，理解中间件与请求模型。https://www.starlette.io/
- Uvicorn 文档 —— ASGI 服务器启动参数（端口/日志/优雅停机）的参考。https://www.uvicorn.org/

## E.4 契约与协议

- OpenAPI Specification —— 三端对齐 API 契约的规范源头。https://spec.openapis.org/
- swaggo/swag —— 从 Go 注释生成 OpenAPI 文档的工具，对应正文 Gin 侧文档方案。https://github.com/swaggo/swag
- springdoc-openapi —— Spring Boot 侧生成 OpenAPI 的库，对应 Java 侧文档方案。https://springdoc.org/
- Protocol Buffers 文档 —— 跨语言序列化与 IDL 的官方参考。https://protobuf.dev/
- gRPC 文档 —— 基于 HTTP/2 的跨语言 RPC 框架官方文档。https://grpc.io/docs/
- JSON 数据交换格式（RFC 8259）—— JSON 的规范定义，跨语言序列化的共同底座。https://www.rfc-editor.org/rfc/rfc8259

## E.5 可观测性与部署

- OpenTelemetry 文档 —— 跨语言的追踪/指标/日志标准，正文 traceId 透传的进阶方向。https://opentelemetry.io/docs/
- Docker 文档 —— 镜像构建与运行时的官方参考。https://docs.docker.com/
- Docker Compose 文档 —— 本书多服务本地编排（网关+价格+分析）的依据。https://docs.docker.com/compose/
- Kubernetes 文档 —— 优雅停机（`terminationGracePeriodSeconds`）与探针等部署概念的权威来源。https://kubernetes.io/docs/
- Twelve-Factor App —— 配置外置、环境等价等部署原则，呼应附录 C 的环境变量注入。https://12factor.net/
- Spring Boot Actuator 文档 —— 健康检查与运行时指标端点的官方说明。（见 Spring Boot Reference 中的 Actuator 章节）

---

使用建议：E.1/E.2 对应正文的语言特性主线，遇到某个语言点（零值、GIL、asyncio）先回到官方规范核对；E.3/E.4/E.5 对应实战平台主线，配置与契约问题优先查各框架官方文档，再回到附录 C 取最小片段落地。上文未附链接的条目（如 JUC、Actuator）请从其所属的官方文档站内检索对应章节，以避免引用不稳定的深层地址。
