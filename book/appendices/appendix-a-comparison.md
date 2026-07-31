# 附录 A：Java、Go、Python 核心技术特性对比表

| 维度 | Java | Go | Python |
| --- | --- | --- | --- |
| 类型系统 | 静态强类型，面向对象完整 | 静态强类型，结构体与接口组合 | 动态类型，鸭子类型 |
| 并发模型 | OS 线程、线程池、JUC | Goroutine、Channel、Context | 线程受 GIL 影响，多进程/协程常用 |
| Web 入口 | Spring MVC/WebFlux | Gin/标准库 net/http | FastAPI/Flask |
| 部署方式 | Jar/镜像，依赖 JVM | 单二进制/镜像 | 解释器/虚拟环境/镜像 |
| 最适合场景 | 核心业务、一致性、复杂领域模型 | 网关、聚合、云原生组件 | 数据分析、脚本、AI 生态 |
