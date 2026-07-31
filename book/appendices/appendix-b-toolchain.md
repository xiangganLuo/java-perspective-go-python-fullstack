# 附录 B：多语言协同常用工具链配置指南

本附录面向以 Java 为主语言、需要在同一台 Windows 开发机上同时运行 Go 网关、Java 价格服务、Python 分析服务的工程师。全书实战平台 `project/pricing-platform` 的三个服务均为零依赖实现（Go 标准库 `net/http`、Java `com.sun.net.httpserver`、Python `http.server`），因此工具链的目标不是引入框架，而是把三套语言运行时、包管理、启动方式统一到一套可复制的本地流程里。

技术基线：JDK 21 / Go 1.22+ / Python 3.11+ / Docker Compose。开发环境默认 Windows + PowerShell。

---

## B.1 推荐目录

```
project/pricing-platform
├── go-gateway                # Go 网关（:8080 对外入口）
│   ├── go.mod
│   └── main.go
├── java-price-service        # Java 价格服务（:8081）
│   └── src/PriceServer.java
├── python-analysis-service   # Python 分析服务（:8082）
│   └── app.py
├── contracts                 # 统一契约：响应壳、错误码、字段命名
├── sql                       # 建表与样例数据
├── scripts                   # smoke-test.ps1 等运维脚本
└── docker-compose.yml        # 三服务一键编排
```

约定：`contracts` 是三语言共同遵守的唯一事实源，任何字段命名、错误码、响应壳的修改都先落到这里再改代码。

---

## B.2 本地端口与响应契约

| 服务 | 端口 | 说明 |
| --- | ---: | --- |
| Go 网关 | 8080 | 对外入口，聚合 Java + Python |
| Java 价格服务 | 8081 | 核心价格计算 |
| Python 分析服务 | 8082 | 历史价格与评分（失败时网关降级） |

统一响应壳：`{code, message, data, traceId}`。`X-Trace-Id` 请求头在三端透传；网关注入或透传，下游原样回带。错误码：

| 错误码 | 含义 |
| ---: | --- |
| 0 | 成功 |
| 40001 | 请求参数错误（缺字段/格式非法） |
| 40101 | 未认证 |
| 42901 | 触发限流 |
| 50001 | 服务内部错误 |
| 50002 | Python 分析失败，网关降级返回 `analysis:null` |
| 50401 | 下游超时 |

超时预算：网关 1500ms → Java 1200ms → Python 400ms，逐层收敛。

---

## B.3 各语言安装与版本验证

三套运行时安装完成后，用 PowerShell 逐一验证版本，确认满足基线。

```powershell
# JDK 21（推荐 Eclipse Temurin 21）
java -version
javac -version

# Go 1.22+
go version

# Python 3.11+
python --version

# Docker（含 Compose V2 子命令）
docker --version
docker compose version
```

预期输出（版本号以实际安装为准）：

```
openjdk version "21" 2023-09-19
javac 21
go version go1.22.x windows/amd64
Python 3.11.x
Docker version 26.x
Docker Compose version v2.x
```

要点：
- `java -version` 与 `javac -version` 必须同为 21。只装 JRE 会导致 `javac` 缺失、无法编译。
- Compose 用 `docker compose`（V2，空格）而非老的 `docker-compose`（V1，连字符）。本书统一使用 V2。
- Windows 上若命令找不到，检查 `PATH` 是否包含各运行时的 `bin` 目录，改完环境变量需重开 PowerShell 窗口生效。

---

## B.4 包管理与镜像加速（国内可选）

零依赖服务本身不拉第三方包，但 `go mod` 会访问校验和数据库、`pip` 会在你扩展功能时下载依赖。以下镜像配置为**可选项**，仅在网络访问官方源缓慢时启用。

### Go：GOPROXY

```powershell
# 可选：国内代理，加速模块下载
go env -w GOPROXY=https://goproxy.cn,direct

# 可选：零依赖项目可关闭校验和校验以避免访问 sum.golang.org
go env -w GOSUMDB=off

# 查看当前配置
go env GOPROXY GOSUMDB
```

`direct` 兜底表示代理无此模块时回源直连。恢复默认用 `go env -u GOPROXY`。

### Python：pip 镜像

```powershell
# 可选：临时使用清华镜像安装单个包
pip install <package> -i https://pypi.tuna.tsinghua.edu.cn/simple

# 可选：写入用户级配置，永久生效
pip config set global.index-url https://pypi.tuna.tsinghua.edu.cn/simple
```

配置文件位于 `%APPDATA%\pip\pip.ini`。清除用 `pip config unset global.index-url`。

---

## B.5 Python 虚拟环境（Windows）

即便分析服务零依赖，也建议用 venv 隔离，避免污染全局解释器、并让不同项目的 Python 版本互不干扰。

```powershell
# 进入 Python 服务目录
cd project\pricing-platform\python-analysis-service

# 创建虚拟环境（目录名约定为 .venv）
python -m venv .venv

# 激活（PowerShell）
.\.venv\Scripts\Activate.ps1

# 激活后提示符前缀出现 (.venv)，确认解释器路径落在项目内
python -c "import sys; print(sys.executable)"

# 退出虚拟环境
deactivate
```

首次激活若报「无法加载脚本，因为在此系统上禁止运行脚本」，是 PowerShell 执行策略限制，按当前用户放开即可：

```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

要点：安装依赖前务必确认提示符已带 `(.venv)`，否则包会装到全局 `site-packages`，是新手最常见的错位问题（见附录 D）。

---

## B.6 Go 模块初始化

Go 网关首次搭建时初始化模块：

```powershell
cd project\pricing-platform\go-gateway

# 初始化模块，模块名与仓库路径对应
go mod init pricing-platform/go-gateway

# 整理依赖（零依赖项目会保持 require 为空）
go mod tidy
```

生成的 `go.mod` 记录模块名与 Go 版本行 `go 1.22`。零依赖网关仅用标准库，`go mod tidy` 后不会新增 `require`，这是预期结果，不必额外拉包。

---

## B.7 IDE 建议

三语言可用同一编辑器，也可分别用专用 IDE，按团队习惯选择。

| 方案 | 适用场景 | 关键配置 |
| --- | --- | --- |
| VS Code（推荐统一入口） | 一个窗口切三语言 | 安装扩展：Go（golang.go）、Python（ms-python.python）、Extension Pack for Java |
| IntelliJ IDEA | Java 为主，Go/Python 为辅 | Ultimate 版内置 Go/Python 插件；Community 版需另配 |
| GoLand | Go 网关重点开发 | 单独打开 `go-gateway` 目录，避免多语言混合索引 |

VS Code 建议在工作区根目录打开整个 `pricing-platform`，让三个服务共处一个窗口；Python 扩展会自动识别 `.venv` 作为解释器，Go 扩展首次会提示安装 `gopls` 等工具，按提示确认即可。

---

## B.8 本地三服务启动顺序与验证

推荐启动顺序：**先起下游（Java、Python），再起网关（Go）**。网关启动时不强依赖下游存活（下游未起时会返回 50401 或降级），但先起下游能让首个请求就走通全链路。

### 步骤 1：Java 价格服务（:8081）

```powershell
cd project\pricing-platform\java-price-service

# 编译（JDK 21，源码零依赖，直接 javac）
javac -d out src\PriceServer.java

# 运行
java -cp out PriceServer
```

JDK 21 也支持单文件直接运行（无需先 `javac`）：

```powershell
java src\PriceServer.java
```

### 步骤 2：Python 分析服务（:8082）

```powershell
cd project\pricing-platform\python-analysis-service
.\.venv\Scripts\Activate.ps1
python app.py
```

### 步骤 3：Go 网关（:8080）

```powershell
cd project\pricing-platform\go-gateway
go run .
```

网关通过环境变量定位下游（见 B.10），本地默认指向 `localhost`，无需额外设置即可联调。

### 步骤 4：验证

用 `Invoke-RestMethod` 直接打三个端口。先各自单测，再打网关看聚合结果。

```powershell
# 单测 Java 价格服务
Invoke-RestMethod -Uri http://localhost:8081/price `
  -Method Post `
  -ContentType 'application/json' `
  -Headers @{ 'X-Trace-Id' = 'demo-trace-001' } `
  -Body '{"skuId":"SKU-1001"}'

# 单测 Python 分析服务
Invoke-RestMethod -Uri http://localhost:8082/analysis `
  -Method Post `
  -ContentType 'application/json' `
  -Body '{"skuId":"SKU-1001"}'

# 打网关，观察聚合后的 data 同时含 price 与 analysis
Invoke-RestMethod -Uri http://localhost:8080/api/price `
  -Method Post `
  -ContentType 'application/json' `
  -Headers @{ 'X-Trace-Id' = 'demo-trace-001' } `
  -Body '{"skuId":"SKU-1001"}'
```

预期网关返回统一壳，`code` 为 0，`traceId` 与请求头一致；若刻意不起 Python 服务，网关会降级返回 `data.analysis` 为 `null`、`code` 仍为 0，同时网关日志出现 50002 记录。

一键冒烟：

```powershell
.\scripts\smoke-test.ps1
```

该脚本按顺序验证三服务连通性与降级行为，适合每次改动后回归。

---

## B.9 Docker Compose 方式

不想在本机装齐三套运行时时，用 Compose 起容器。`docker-compose.yml` 定义三个服务，分别使用官方镜像并挂载源码目录运行（无需构建自定义镜像）：

```yaml
services:
  java-price-service:
    image: eclipse-temurin:21-jdk
    working_dir: /app
    volumes:
      - ./java-price-service:/app
    command: java src/PriceServer.java
    ports:
      - "8081:8081"

  python-analysis-service:
    image: python:3.12-slim
    working_dir: /app
    volumes:
      - ./python-analysis-service:/app
    command: python app.py
    ports:
      - "8082:8082"

  go-gateway:
    image: golang:1.22
    working_dir: /app
    volumes:
      - ./go-gateway:/app
    command: go run .
    environment:
      JAVA_SERVICE_URL: http://java-price-service:8081
      PYTHON_SERVICE_URL: http://python-analysis-service:8082
    ports:
      - "8080:8080"
    depends_on:
      - java-price-service
      - python-analysis-service
```

启动与观察：

```powershell
# 前台启动（Ctrl+C 停止），首次会拉取镜像
docker compose up

# 后台启动
docker compose up -d

# 查看日志（含降级时的 50002）
docker compose logs -f go-gateway

# 停止并清理
docker compose down
```

关键区别：容器内三服务同处一个 Compose 网络，**互访必须用服务名**（如 `http://java-price-service:8081`），不能用 `localhost`——容器里的 `localhost` 指向容器自身。因此网关在 Compose 中的 `JAVA_SERVICE_URL`/`PYTHON_SERVICE_URL` 用服务名，而本机裸跑时用 `localhost`。对外端口映射后，宿主机仍通过 `localhost:8080` 访问网关。

---

## B.10 环境变量表

网关通过环境变量定位下游服务，实现「本机裸跑」与「Compose 编排」两套地址的无缝切换。

| 变量名 | 默认值 | 本机裸跑取值 | Compose 取值 | 说明 |
| --- | --- | --- | --- | --- |
| `JAVA_SERVICE_URL` | `http://localhost:8081` | 同默认 | `http://java-price-service:8081` | 网关调用价格服务的基址 |
| `PYTHON_SERVICE_URL` | `http://localhost:8082` | 同默认 | `http://python-analysis-service:8082` | 网关调用分析服务的基址 |

本机临时覆盖（当前 PowerShell 会话内有效）：

```powershell
$env:JAVA_SERVICE_URL   = "http://localhost:8081"
$env:PYTHON_SERVICE_URL = "http://localhost:8082"
go run .
```

Compose 中的取值已写在 `docker-compose.yml` 的 `environment` 段，无需手动导出。切换环境只需改这两个变量，网关代码不动——这也是排查「Compose 内 localhost 误用」类问题的首要检查点（见附录 D）。
