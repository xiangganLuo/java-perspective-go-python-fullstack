# 附录 A：Java、Go、Python 核心技术特性对比表

本附录以查阅手册的形式，把全书正文中反复对照的语言特性汇总为多张分主题表，供你在阅读或实战时快速定位差异。技术基线为 JDK 21（Spring Boot 3.x）、Go 1.22+（Gin v1.10）、Python 3.11+（FastAPI 0.115 + Pydantic v2）。表中不给出具体性能数字，涉及资源与体积处仅用量级描述。

阅读约定：每张表一行一个可对照维度，同一行三列描述同一件事在三种语言里的做法或取舍。

## A.1 总览

这张表沿用正文的五维速记，作为后续分主题表的索引。

| 维度 | Java | Go | Python |
| --- | --- | --- | --- |
| 类型系统 | 静态强类型，面向对象完整 | 静态强类型，结构体与接口组合 | 动态类型，鸭子类型 |
| 并发模型 | OS 线程、线程池、JUC | Goroutine、Channel、Context | 线程受 GIL 影响，多进程/协程常用 |
| Web 入口 | Spring MVC/WebFlux | Gin/标准库 net/http | FastAPI/Flask |
| 部署方式 | Jar/镜像，依赖 JVM | 单二进制/镜像 | 解释器/虚拟环境/镜像 |
| 最适合场景 | 核心业务、一致性、复杂领域模型 | 网关、聚合、云原生组件 | 数据分析、脚本、AI 生态 |

在本书的实战平台里，这条对照直接映射为分工：Go 网关（:8080）负责聚合与转发，Java 价格服务（:8081）承载核心业务，Python 分析服务（:8082）处理数据与画像。

## A.2 类型系统

| 维度 | Java | Go | Python |
| --- | --- | --- | --- |
| 泛型实现 | 编译期类型擦除，运行时无类型参数 | 编译期单态化的类型参数（1.18+） | 运行时不强制，`typing` 提供静态提示 |
| 空值语义 | `null` 引用，易触发 NPE | 类型零值（`nil`/`0`/`""`），无独立 null | `None` 单例，需显式判空 |
| 未初始化变量 | 局部变量必须先赋值 | 声明即得零值，无未初始化状态 | 未绑定名字访问即抛 `NameError` |
| 接口/多态 | 显式 `implements`，名义子类型 | 隐式满足，结构化（duck typing 编译期版） | 运行时鸭子类型，可用 `Protocol` 约束 |
| 类型标注时机 | 强制，编译器检查 | 强制，编译器检查 | 可选 type hints，由 mypy/IDE 检查 |
| 不可变表达 | `final`、record | 无内建不可变，靠约定与未导出字段 | `@dataclass(frozen=True)`、`tuple` |
| 结构承载 | class/record | struct + 方法集 | class/dataclass/`Protocol` |

对 Java 工程师最需要重估的一点：Go 的零值不是「空」，而是「有意义的默认」，因此正文强调「零值可用」的设计；Python 的 `None` 更接近 Java 的 `null`，但需要你自己在类型提示里用 `Optional` 标出来。

## A.3 并发

| 维度 | Java | Go | Python |
| --- | --- | --- | --- |
| 执行单元 | OS 线程 / 虚拟线程（21） | Goroutine（用户态，M:N 调度） | 线程（受 GIL 限制）/ asyncio 协程 |
| 通信原语 | 共享内存 + `synchronized`/JUC | Channel 传递所有权，`select` 多路复用 | `queue`、`asyncio.Queue`、锁 |
| 取消/超时 | `Future.cancel`、中断标志 | `context.Context` 贯穿调用链 | `asyncio.CancelledError`/超时上下文 |
| CPU 并行 | 真并行（多核） | 真并行（多核） | GIL 下线程不并行，多进程才并行 |
| IO 并发 | 线程池 / 虚拟线程 | 海量 goroutine 廉价并发 | asyncio 单线程事件循环 |
| 背压/同步 | 阻塞队列、信号量 | 有缓冲 channel、`WaitGroup` | `Semaphore`、`gather` 并发度控制 |
| 典型陷阱 | 死锁、可见性、线程泄漏 | goroutine 泄漏、忘记 `close`、竞态 | 误以为线程能提速 CPU 任务、阻塞事件循环 |

正文用「X-Trace-Id 透传」串起三段并发模型：Go 用 `context` 携带 traceId 并控制超时，Java 靠线程上下文（MDC）传递，Python 在 asyncio 任务间显式传参或用 contextvars。

## A.4 错误处理

| 维度 | Java | Go | Python |
| --- | --- | --- | --- |
| 基本机制 | 异常（checked/unchecked） | 多返回值 `(T, error)` | 异常 `raise`/`except` |
| 传播方式 | `throws` 声明或向上冒泡 | 显式 `if err != nil` 逐层返回 | 未捕获即向上冒泡 |
| 上下文附加 | 异常链 `cause` | `fmt.Errorf("...: %w", err)` 包装 | `raise ... from e` 链接 |
| 分类判断 | `instanceof`/catch 分支 | `errors.Is`/`errors.As` | 异常类型层级匹配 |
| 资源清理 | try-with-resources | `defer` | `with` 上下文管理器 |
| 断言/不可恢复 | `Error`/`assert` | `panic`/`recover`（仅边界用） | `assert`、致命异常 |
| 落到响应壳 | `@ControllerAdvice` 收敛 | error middleware 收敛 | `exception_handler` 收敛 |

三种机制最终都汇入统一响应壳 `{code,message,data,traceId}`：无论内部是异常还是 error，对外都翻译成一致的 `code` 与 `message`，这一收敛点正是附录 C 中「统一异常」一行的落地。

## A.5 工程化

| 维度 | Java | Go | Python |
| --- | --- | --- | --- |
| 构建工具 | Maven / Gradle | `go build`（内建工具链） | pip / Poetry / uv |
| 依赖清单 | pom.xml / build.gradle | go.mod + go.sum | requirements.txt / pyproject.toml |
| 部署产物 | 可执行 Jar（需 JVM） | 静态单二进制 | 源码 + 解释器 + 虚拟环境 |
| 运行前置 | 需 JVM 运行时 | 无运行时依赖（CGO 关闭时） | 需 Python 解释器 |
| 镜像体积量级 | 较大（含 JVM 层） | 小（MB 级单二进制可 distroless） | 中（含解释器与依赖） |
| 启动特征 | JVM 预热后稳定 | 冷启动快、无预热 | 解释器启动，导入成本随依赖增长 |
| 交叉编译 | 字节码天然跨平台 | `GOOS`/`GOARCH` 一键交叉编译 | 依赖平台相关的二进制 wheel |

这张表解释了本书为何让 Go 承担网关：单二进制、冷启动快、镜像小，天然适合部署为云原生的边缘组件；而 Java 的预热成本换来长时运行的稳定吞吐，适合常驻的核心服务。

## A.6 Web 生态

| 维度 | Java（Spring Boot） | Go（Gin） | Python（FastAPI） |
| --- | --- | --- | --- |
| 主框架 | Spring MVC / WebFlux | Gin（基于 net/http） | FastAPI（基于 Starlette） |
| 路由声明 | 注解 `@GetMapping` | `r.GET("/path", handler)` | 装饰器 `@app.get` |
| 参数校验 | Bean Validation（JSR 380） | binding tag + validator | Pydantic v2 模型 |
| 依赖注入 | 容器管理、注解装配 | 无内建 DI，靠构造与显式传参 | `Depends()` 函数式注入 |
| 中间件/拦截 | `HandlerInterceptor`/Filter | `r.Use(middleware)` | `@app.middleware`/依赖 |
| API 文档 | springdoc-openapi | swaggo 注释生成 | 由类型自动生成 OpenAPI |
| 异步支持 | WebFlux（Reactor） | 天生并发，handler 即 goroutine | `async def` 原生协程 |

三框架都能产出 OpenAPI，这是正文「契约先行」的基础：FastAPI 从类型直接推导，Spring 与 Gin 分别靠 springdoc 与 swaggo 生成，最终对齐同一份契约。

## A.7 序列化

| 维度 | Java | Go | Python |
| --- | --- | --- | --- |
| JSON 库 | Jackson（Spring 默认） | 标准库 `encoding/json` | Pydantic / `json` |
| 字段命名习惯 | camelCase | Go 字段大写导出，靠 tag 映射 | snake_case，靠别名映射 |
| 命名映射手段 | `@JsonProperty` | `json:"fieldName"` tag | `Field(alias=...)`/model config |
| 缺失与可空 | `null`/`Optional` 序列化策略 | 零值与 `omitempty` | `None` 与 `exclude_none` |
| 时间表示 | `Instant`/ISO-8601 字符串 | `time.Time`，RFC3339 | `datetime`，ISO-8601 |
| 金额表示 | 整数分（`long`）避免浮点 | 整数分（`int64`） | 整数分（`int`） |
| 未知字段 | 可配置忽略/报错 | 默认忽略未知字段 | 可配 `extra` 忽略/禁止 |

正文统一约定「金额一律整数分」，正是为了绕开三种语言各自的浮点序列化差异；三端在契约层都以 `int` 传递分值，展示层再各自换算，避免跨语言的精度漂移。

---

三张核心表（类型系统、并发、错误处理）对应正文的语言特性主线，另外三张（工程化、Web 生态、序列化）对应实战平台的落地主线。建议把本附录与附录 C（框架配置对照）配合使用：A 讲「为什么不同」，C 讲「配置怎么写」。
