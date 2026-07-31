# 附录 D：跨语言通信常见问题排查手册

本附录按「症状 → 可能原因 → 排查命令 → 解决」组织，覆盖在 Windows + PowerShell 环境下联调 `pricing-platform`（Go 网关 :8080 / Java 价格服务 :8081 / Python 分析服务 :8082）时的高频问题。每条给出可直接执行的命令或代码级修复。

排查前先明确一个原则：**三端共用统一响应壳 `{code, message, data, traceId}` 与错误码表（0/40001/40101/42901/50001/50002/50401），任何异常先看 `code` 与 `traceId`**，据此定位到具体是哪一层出的问题，再对症下药。

---

## D.1 速查总表

| 症状 | 可能原因 | 排查命令 | 解决 |
| --- | --- | --- | --- |
| 服务启动报端口被占用 | 端口被上一次未退干净的进程占用 | `netstat -ano \| findstr 8080` | 定位 PID 后 `taskkill /PID <pid> /F` |
| 请求返回 405 | 用 GET 打了只支持 POST 的接口 | 看响应体 `message` 与状态码 | 改用 POST，带正确 Content-Type |
| 返回 40001 | 请求体缺字段或 JSON 非法 | 对照契约检查字段名 | 补齐必填字段，字段名与契约一致 |
| 网关返回 50401 | 下游未启动或超时预算不够 | 逐个 `Invoke-RestMethod` 打下游 | 起下游 / 校正超时预算 |
| `data.analysis` 为 null | Python 服务没起，降级生效 | 网关日志搜 `50002` | 起 Python 服务；若为预期降级则无需处理 |
| Compose 内调用失败 | 容器里误用 localhost | `docker compose logs go-gateway` | 下游地址改用服务名 |
| 请求超时/连接被拒 | Windows 防火墙或系统代理干扰 | `netsh advfirewall` / 查 `$env:HTTP_PROXY` | 放行端口 / 排除 localhost 代理 |
| 日志 traceId 断链 | 中间层没透传 `X-Trace-Id` | 三端 grep 同一 traceId | 每层读入并回带该请求头 |
| 中文显示为乱码 | 响应未声明 UTF-8 | 看响应头 Content-Type | 显式设 `charset=utf-8` |
| `go run` 拉依赖卡住 | GOPROXY 访问官方源慢 | `go env GOPROXY` | 配国内代理，零依赖可 GOSUMDB=off |
| pip 装的包 import 不到 | venv 未激活，装到全局 | `python -c "import sys;print(sys.executable)"` | 先激活 `.venv` 再装 |

---

## D.2 端口被占用

**症状**：启动服务报 `bind: address already in use` / `Address already in use: bind` / `OSError: [Errno 10048]`。

**排查**：查谁占用了目标端口。

```powershell
# 查 8080 端口对应的 PID（最后一列即 PID）
netstat -ano | findstr 8080

# 反查该 PID 是哪个进程
tasklist | findstr <pid>
```

**解决**：确认是残留的旧服务后强制结束。

```powershell
taskkill /PID <pid> /F
```

常见诱因：上一次 `go run` / `java` 用 Ctrl+C 没退干净，或后台 Compose 仍在跑。若是 Compose 占用，先 `docker compose down` 而非直接杀进程。

---

## D.3 Java 服务返回 405 或 40001

**症状 A（405 Method Not Allowed）**：浏览器直接访问 `http://localhost:8081/price`，或用 GET 请求打到只实现了 POST 的处理器。

Java 服务基于 `com.sun.net.httpserver`，处理器内通常按方法分支，非 POST 直接返回 405：

```java
if (!"POST".equals(exchange.getRequestMethod())) {
    exchange.sendResponseHeaders(405, -1);
    return;
}
```

**解决**：改用 POST，并带上 JSON Content-Type。

```powershell
Invoke-RestMethod -Uri http://localhost:8081/price `
  -Method Post `
  -ContentType 'application/json' `
  -Body '{"skuId":"SKU-1001"}'
```

**症状 B（40001 参数错误）**：返回壳 `code=40001`，`message` 提示缺字段。原因是请求体缺必填字段或字段名拼错（如把 `skuId` 写成 `sku_id`）。三端字段命名统一，不得混用 snake_case 与 camelCase。

**解决**：对照 `contracts` 契约补齐字段、纠正命名，确认 `Content-Type: application/json` 已设置——缺这个头会导致服务端按空体解析，同样触发 40001。

---

## D.4 网关返回 50401（下游超时）

**症状**：打网关 `http://localhost:8080/api/price` 返回 `code=50401`，`message` 指向下游超时。

**可能原因**：
1. 下游服务（Java 或 Python）根本没启动，网关连接被拒后按超时处理。
2. 下游响应慢，突破了超时预算（网关 1500ms → Java 1200ms → Python 400ms）。
3. `JAVA_SERVICE_URL`/`PYTHON_SERVICE_URL` 指错地址。

**排查**：绕过网关，逐个直连下游确认存活与耗时。

```powershell
# 直连 Java，看是否有响应、耗时多少
Measure-Command {
  Invoke-RestMethod -Uri http://localhost:8081/price -Method Post `
    -ContentType 'application/json' -Body '{"skuId":"SKU-1001"}'
}

# 直连 Python
Measure-Command {
  Invoke-RestMethod -Uri http://localhost:8082/analysis -Method Post `
    -ContentType 'application/json' -Body '{"skuId":"SKU-1001"}'
}

# 确认网关看到的下游地址
$env:JAVA_SERVICE_URL; $env:PYTHON_SERVICE_URL
```

**解决**：
- 下游没起 → 按附录 B.8 顺序补起。
- 耗时超预算 → 优化下游或上调对应层超时；注意各层预算需逐层收敛，下游预算不能大于上游。
- 地址错 → 校正环境变量（本机用 `localhost`，Compose 用服务名）。

注意区分：Java 层超时通常整体返回 50401；而 **Python 分析超时属于可降级路径**，网关会走降级返回 `analysis:null`（见 D.5），不一定表现为 50401。

---

## D.5 analysis 为 null（降级生效）

**症状**：网关返回 `code=0`（成功），但 `data.analysis` 为 `null`，`data.price` 正常。

**这是设计内的降级行为，不是 bug**：Python 分析服务不可用时，网关不让整个请求失败，而是降级返回价格、把 analysis 置空，并在网关日志记录 50002。

**排查**：确认是降级而非其他问题，去网关日志找 50002。

```powershell
# 本机裸跑：网关日志直接打在控制台，搜 50002
# Compose 方式：
docker compose logs go-gateway | findstr 50002

# 确认 Python 服务是否在监听
netstat -ano | findstr 8082
```

**解决**：
- 若期望有分析数据 → 启动 Python 服务（附录 B.8 步骤 2），重试后 `analysis` 应填充。
- 若本就允许降级（如 Python 服务在维护）→ 无需处理，这正是 50002 降级的目的：保住核心价格能力。

---

## D.6 Compose 内误用 localhost

**症状**：本机裸跑一切正常，一进 `docker compose up` 网关就调不通下游，日志报连接被拒或 50401。

**原因**：容器内的 `localhost` 指向容器自身，而非宿主机或其他容器。网关容器里访问 `http://localhost:8081` 是在找网关容器自己的 8081，自然连不上 Java 容器。

**排查**：

```powershell
docker compose logs go-gateway | findstr -i "connection refused localhost 50401"
```

**解决**：Compose 网络内服务互访用**服务名**，把网关的下游地址改为服务名：

```yaml
environment:
  JAVA_SERVICE_URL: http://java-price-service:8081
  PYTHON_SERVICE_URL: http://python-analysis-service:8082
```

宿主机对网关的访问仍走 `localhost:8080`（因为做了端口映射），两者不冲突。记住规则：**容器间用服务名，宿主机进容器用映射端口**。

---

## D.7 Windows 防火墙 / 代理干扰

**症状**：`Invoke-RestMethod` 报连接超时、被重置，或请求诡异地走了外网代理再回来。

**排查代理**：PowerShell 与部分工具会读系统/环境代理，公司代理常把 localhost 流量也劫持。

```powershell
# 查看是否设了代理环境变量
$env:HTTP_PROXY; $env:HTTPS_PROXY; $env:NO_PROXY
```

**解决代理**：把本地地址加入 NO_PROXY，避免 localhost 走代理。

```powershell
$env:NO_PROXY = "localhost,127.0.0.1"
```

**排查防火墙**：首次运行 `java`/`go`/`python` 监听端口时，Windows 可能弹窗询问是否允许，若误点「取消」会拦截入站连接。

```powershell
# 查看防火墙状态
netsh advfirewall show allprofiles state
```

**解决防火墙**：本机联调走 loopback 通常不受防火墙限制；若确需放行，用管理员 PowerShell 添加入站规则（仅本机开发环境）。

```powershell
New-NetFirewallRule -DisplayName "pricing-8080" -Direction Inbound `
  -Protocol TCP -LocalPort 8080 -Action Allow
```

---

## D.8 traceId 断链

**症状**：某次请求在网关日志能查到 `traceId`，到 Java 或 Python 日志就搜不到，无法把三端日志串成一条链路。

**原因**：中间某层没有把 `X-Trace-Id` 请求头读入并向下游回带。契约要求：网关注入或透传 `X-Trace-Id`，所有下游读入、写日志、并在调用更下游时继续透传，响应壳里回带 `traceId`。

**排查**：拿一个具体 traceId 三端对搜。

```powershell
# 分别在三端日志搜同一 traceId，定位断在哪一层
# 例如 Compose 下：
docker compose logs | findstr demo-trace-001
```

哪一层搜不到，问题就出在它的上游没传或它自己没读。

**解决**：确保每层都从入站请求读 `X-Trace-Id`，缺失时生成新值，并在发起下游请求时把它塞回请求头。以网关调用下游为例：

```go
traceId := r.Header.Get("X-Trace-Id")
if traceId == "" {
    traceId = newTraceId()
}
req.Header.Set("X-Trace-Id", traceId) // 透传给下游
```

Java/Python 同理：入站读头 → 记日志 → 出站回带，链路才完整。

---

## D.9 中文乱码

**症状**：响应里的中文（如 `message` 字段、商品名）在客户端显示为 `????` 或 `æ±‰å­—`。

**原因**：响应未声明 UTF-8，客户端按默认字符集（Windows 常为 GBK）解码；或服务端写出时用了非 UTF-8 编码。

**排查**：看响应头是否带 charset。

```powershell
$resp = Invoke-WebRequest -Uri http://localhost:8081/price -Method Post `
  -ContentType 'application/json' -Body '{"skuId":"SKU-1001"}'
$resp.Headers['Content-Type']   # 应包含 charset=utf-8
```

**解决**：三端都显式声明 UTF-8 响应头，并以 UTF-8 编码写字节。

Java（`com.sun.net.httpserver`）：

```java
byte[] body = json.getBytes(java.nio.charset.StandardCharsets.UTF_8);
exchange.getResponseHeaders().set("Content-Type", "application/json; charset=utf-8");
exchange.sendResponseHeaders(200, body.length);
exchange.getResponseBody().write(body);
```

Python（`http.server`）：

```python
self.send_header("Content-Type", "application/json; charset=utf-8")
self.wfile.write(json.dumps(data, ensure_ascii=False).encode("utf-8"))
```

Go：

```go
w.Header().Set("Content-Type", "application/json; charset=utf-8")
```

注意 Python 的 `json.dumps` 默认 `ensure_ascii=True` 会把中文转义成 `\uXXXX`，虽不算乱码但可读性差，按需设 `ensure_ascii=False`。

---

## D.10 go run 拉依赖卡住

**症状**：首次 `go run .` 或 `go mod tidy` 长时间卡在下载，最终报 `dial tcp ... i/o timeout` 或访问 `sum.golang.org` 失败。

**原因**：默认走官方 `proxy.golang.org` / `sum.golang.org`，国内网络访问慢或不通。

**排查**：

```powershell
go env GOPROXY GOSUMDB
```

**解决**：配置国内代理；零依赖网关还可关闭校验和库访问。

```powershell
go env -w GOPROXY=https://goproxy.cn,direct
go env -w GOSUMDB=off
```

改完重跑 `go run .`。网关是零依赖项目，正常不应触发任何下载，若仍在拉取，检查是否误引入了第三方 import。

---

## D.11 venv 未激活，包装错位置

**症状**：`pip install` 显示成功，但 `python app.py` 报 `ModuleNotFoundError`；或明明装了包却 import 不到。

**原因**：没激活虚拟环境就 `pip install`，包被装进全局 `site-packages`；而运行时用的是另一套解释器，两者不一致。

**排查**：确认当前解释器路径是否落在项目 `.venv` 内。

```powershell
# 提示符前应有 (.venv)；再确认解释器路径
python -c "import sys; print(sys.executable)"
```

若输出的是全局 Python 路径（如 `C:\Python311\python.exe`）而非项目内 `.venv\Scripts\python.exe`，说明没激活。

**解决**：先激活再装包。

```powershell
cd project\pricing-platform\python-analysis-service
.\.venv\Scripts\Activate.ps1
python -m pip install <package>   # 用 python -m pip 确保对应当前解释器
```

若首次激活报「禁止运行脚本」，按当前用户放开执行策略：

```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

---

## D.12 通用排查顺序

遇到不在上表的问题，按这个顺序缩小范围：

1. **看 `code` 与 `traceId`**：定位是哪一层、哪类错误。
2. **绕过网关直连下游**：区分是网关问题还是下游问题。
3. **三端对搜同一 traceId**：找到链路断点。
4. **核对环境变量与端口**：`localhost` vs 服务名、端口是否被占。
5. **跑冒烟脚本**：`.\scripts\smoke-test.ps1` 一次性验证三服务连通与降级，快速回归。
