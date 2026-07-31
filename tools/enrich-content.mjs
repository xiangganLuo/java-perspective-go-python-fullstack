import fs from "node:fs";
import path from "node:path";
import { manuscript as manuscriptTarget, sourceFiles } from "./book-structure.mjs";

const root = process.cwd();

const enrichments = [
  {
    file: "book/chapters/01-为什么-java-工程师要掌握多语言？.md",
    title: "第 1 章落地设计卡",
    body: `## 第 1 章落地设计卡：技术栈拆分决策表

| 判断问题 | 继续使用 Java | 引入 Go | 引入 Python |
| --- | --- | --- | --- |
| 是否包含复杂交易规则 | 是 | 否 | 否 |
| 是否处在高并发入口 | 可用但成本较高 | 是 | 否 |
| 是否以数据清洗、统计、模型适配为主 | 可用但样板较多 | 否 | 是 |
| 是否需要强团队约束和长期演进 | 是 | 视团队经验 | 视边界清晰度 |

企业采用多语言时，第一步不是引入运行时，而是写清楚服务边界。Java 服务持有订单、价格、权益等核心领域状态；Go 网关只做入口治理和聚合；Python 分析服务只返回建议型结果，不直接修改交易状态。`
  },
  {
    file: "book/chapters/02-从-java-视角学习新语言的高效方法.md",
    title: "第 2 章工具链检查表",
    body: `## 第 2 章工具链检查表

| 工具 | 作用 | 验收方式 |
| --- | --- | --- |
| JDK 21 | 编译 Java 标准库示例 | \`javac -version\` |
| Go 1.22+ | 运行网关和并发示例 | \`go version\` |
| Python 3.11+ | 运行分析服务和脚本 | \`python --version\` |
| Docker Compose | 本地编排多服务 | \`docker compose version\` |
| Postman/curl | 接口联调 | 能携带 \`X-Trace-Id\` 请求 |

学习路径建议是先跑通标准库版本，再替换为 Spring Boot/Gin/FastAPI。这样读者能先看清跨语言链路，再理解框架帮我们省掉了哪些工程样板。`
  },
  {
    file: "book/chapters/03-go-基础语法-与-java-的核心差异映射.md",
    title: "第 3 章代码迁移提示",
    body: `## 第 3 章代码迁移提示：从类模型到组合模型

Java 中的 \`UserServiceImpl extends BaseService implements UserService\`，迁移到 Go 时不要急着寻找继承替代品。更自然的写法是用结构体持有依赖，用接口描述行为，用构造函数显式装配。

\`\`\`go
type UserRepository interface {
    FindByID(id int64) (User, error)
}

type UserService struct {
    repo UserRepository
}

func NewUserService(repo UserRepository) *UserService {
    return &UserService{repo: repo}
}
\`\`\`

这段代码对标 Spring 的构造器注入，但依赖关系在普通代码里直接可见。`
  },
  {
    file: "book/chapters/04-go-的并发模型-java-开发者必须掌握的核心差异.md",
    title: "第 4 章并发验收指标",
    body: `## 第 4 章并发验收指标

| 指标 | Java 线程池关注点 | Go 网关关注点 |
| --- | --- | --- |
| 并发上限 | core/max pool size、队列长度 | goroutine 数、下游并发阈值 |
| 超时控制 | Future timeout、WebClient timeout | context deadline |
| 泄漏风险 | 线程池队列堆积 | goroutine 阻塞、channel 无消费者 |
| 排查手段 | jstack、线程池监控 | pprof、请求 traceId |

Go 并发示例的验收标准不是“能并发”，而是每个下游调用都能被 Context 取消，任何失败都能汇总到统一错误结构。`
  },
  {
    file: "book/chapters/05-go-web-框架-gin-对标-spring-mvc-的技术映射.md",
    title: "第 5 章框架映射表",
    body: `## 第 5 章框架映射表

| Spring MVC 心智 | Gin 对应能力 | 迁移提醒 |
| --- | --- | --- |
| DispatcherServlet | Engine/Router | Gin 更轻，路由注册更显式 |
| HandlerInterceptor | Middleware | 中间件顺序直接影响结果 |
| @RequestBody | ShouldBindJSON | 校验依赖结构体 tag |
| @ControllerAdvice | 统一错误中间件 | 需要团队自行约定响应壳 |
| @Autowired | 构造函数/手动装配 | 避免全局变量式依赖 |

Gin 项目要保持轻，不要把 Java 分层全部复制过来。接口、服务、仓储三层足够表达大多数网关和聚合场景。`
  },
  {
    file: "book/chapters/06-go-与-java-的协同通信机制.md",
    title: "第 6 章通信契约示例",
    body: `## 第 6 章通信契约示例

\`\`\`http
POST /api/v1/price/calculate
X-Trace-Id: trace-20260731-001
Content-Type: application/json

{"sku":"SKU-1001","memberLevel":"GOLD"}
\`\`\`

\`\`\`json
{
  "code": 0,
  "message": "OK",
  "data": {
    "sku": "SKU-1001",
    "basePriceCents": 129900,
    "finalPriceCents": 110415
  },
  "traceId": "trace-20260731-001"
}
\`\`\`

Go 侧要把 Java 的 HTTP 状态、业务错误码、网络错误分开处理。不要把所有异常都折叠成 500，否则联调时很难判断是参数问题、业务失败，还是网络超时。`
  },
  {
    file: "book/chapters/07-go-在全栈架构下的落地场景实战.md",
    title: "第 7 章网关职责边界",
    body: `## 第 7 章网关职责边界

Go 网关可以做：

1. 统一鉴权、限流、traceId 注入。
2. 对 Java/Python 下游做超时隔离。
3. 聚合多个只读接口，减少前端请求次数。
4. 将下游错误映射成统一响应。

Go 网关不应该做：

1. 维护订单状态。
2. 计算复杂优惠规则。
3. 直接写核心交易数据库。
4. 绕过 Java 服务调用 Python 修改业务结果。

这个边界一旦写清楚，多语言架构就会变得可控。`
  },
  {
    file: "book/chapters/08-python-基础语法-与-java-的核心差异映射.md",
    title: "第 8 章 Python 数据处理范式",
    body: `## 第 8 章 Python 数据处理范式

Java 开发者看到 Python 的动态类型时，容易误以为它“不适合工程化”。更准确的理解是：Python 适合在边界清楚的输入输出内快速处理数据。

\`\`\`python
def score_price(base_price_cents: int, final_price_cents: int) -> int:
    discount = final_price_cents / base_price_cents
    if discount <= 0.85:
        return 92
    if discount <= 0.95:
        return 84
    return 70
\`\`\`

类型提示不是强制运行时约束，但能帮助 IDE、审查和团队协作。面向 Java 团队交付 Python 服务时，应把类型提示、单元测试和接口契约作为最低工程标准。`
  },
  {
    file: "book/chapters/09-python-web-框架-对标-spring-boot-的技术映射.md",
    title: "第 9 章 FastAPI 对标 Spring Boot",
    body: `## 第 9 章 FastAPI 对标 Spring Boot

FastAPI 的自动 OpenAPI 文档，对 Java 团队很友好，因为它让 Python 服务不再是“脚本接口黑盒”。Pydantic 模型相当于 DTO + Bean Validation 的组合。

\`\`\`python
from pydantic import BaseModel, Field

class AnalyzeRequest(BaseModel):
    sku: str = Field(min_length=1)
    basePriceCents: int = Field(gt=0)
    finalPriceCents: int = Field(gt=0)
\`\`\`

生产落地时，Python 服务仍需统一响应壳、traceId、超时、缓存和降级，不要因为框架轻量就省掉工程治理。`
  },
  {
    file: "book/chapters/10-python-与-java-的协同通信机制.md",
    title: "第 10 章 Java 调 Python 的保护策略",
    body: `## 第 10 章 Java 调 Python 的保护策略

| 风险 | 保护策略 |
| --- | --- |
| Python 分析慢 | Java 侧 300-800ms 超时 |
| Python 结果不稳定 | 缓存最近一次可用结果 |
| Python 服务不可用 | 返回默认分析分，不阻断交易 |
| 参数版本不一致 | OpenAPI 契约和兼容字段 |

Java 调 Python 时要牢记：价格分析是增强能力，不是交易前置条件。只要业务允许，就应该把 Python 调用设计成可降级。`
  },
  {
    file: "book/chapters/11-python-在全栈架构下的落地场景实战.md",
    title: "第 11 章日志分析脚本输出样例",
    body: `## 第 11 章日志分析脚本输出样例

\`\`\`markdown
# Java 服务运行分析报告

- 最大 GC 暂停：182ms
- 线程池峰值队列长度：240
- 慢接口 Top 1：POST /api/v1/price/calculate
- 建议：将会员权益查询拆入并行调用，并给 Python 分析接口增加短 TTL 缓存。
\`\`\`

Python 脚本的价值是把零散日志转成工程判断。它不替代 APM，但能让团队快速把一次故障复盘沉淀成可执行的排查工具。`
  },
  {
    file: "book/chapters/12-全栈架构设计-java+go+python-技术栈整合.md",
    title: "第 12 章工程规范基线",
    body: `## 第 12 章工程规范基线

1. 所有接口必须有版本前缀，例如 \`/api/v1\`。
2. 所有响应必须包含 \`code/message/data/traceId\`。
3. 所有跨语言调用必须设置超时，禁止无限等待。
4. 金额统一使用整数分传输，避免浮点精度漂移。
5. 服务日志必须包含 \`service/traceId/endpoint/latencyMs/code\`。
6. Docker Compose 只用于本地联调，生产部署需接入正式配置与密钥管理。

规范是多语言架构的地基。没有统一规范，多语言只会放大沟通成本。`
  },
  {
    file: "book/chapters/13-企业级实战项目-多语言协同电商价格计算平台.md",
    title: "第 13 章实战验收清单",
    body: `## 第 13 章实战验收清单

| 验收项 | 通过标准 |
| --- | --- |
| Java 价格服务 | \`SKU-1001 + GOLD\` 返回 \`finalPriceCents=110415\` |
| Go 网关 | 能透传 \`X-Trace-Id\` 并转发 Java 响应 |
| Python 分析服务 | 能返回 \`trend/volatility/priceScore\` |
| 错误码 | 参数缺失返回 \`40001\` |
| 日志 | 三端都能按 traceId 排查 |
| 部署 | Docker Compose 能启动 Java/Python 基础服务 |

本章交付的重点是可解释、可联调、可替换。标准库版本用于理解链路，后续可以逐步替换成 Spring Boot、Gin、FastAPI 的生产版实现。`
  }
];

for (const item of enrichments) {
  const full = path.join(root, item.file);
  let content = fs.readFileSync(full, "utf8");
  if (!content.includes(`## ${item.title}`)) {
    content = content.trimEnd() + "\n\n" + item.body.trim() + "\n";
    fs.writeFileSync(full, content, "utf8");
  }
}

const manuscript = sourceFiles
  .map((file) => fs.readFileSync(path.join(root, file), "utf8").trim())
  .join("\n\n---\n\n");
fs.writeFileSync(path.join(root, manuscriptTarget.target), manuscript + "\n", "utf8");

console.log("Enriched chapter content and rebuilt manuscript.");
