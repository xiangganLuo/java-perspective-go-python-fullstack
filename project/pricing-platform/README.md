# 多语言协同电商价格计算平台

本项目是全书贯穿实战：Go 网关承载入口，Java 服务计算核心价格，Python 服务提供价格分析。

## 服务职责

| 服务 | 目录 | 端口 | 职责 |
| --- | --- | ---: | --- |
| Go 网关 | go-gateway | 8080 | 鉴权、traceId、转发/聚合 |
| Java 价格服务 | java-price-service | 8081 | 商品原价、优惠、会员权益、最终价 |
| Python 分析服务 | python-analysis-service | 8082 | 历史趋势、波动率、价格分 |

## 启动 Java 服务

```powershell
cd java-price-service
javac src/com/javago/pricing/PriceService.java
java -cp src com.javago.pricing.PriceService
```

## 调用示例

```powershell
Invoke-RestMethod -Method Post -Uri http://localhost:8081/api/v1/price/calculate -ContentType 'application/json' -Body '{"sku":"SKU-1001","memberLevel":"GOLD"}'
```

## 完整链路

安装 Go 和 Python 后，可分别启动：

```powershell
cd python-analysis-service
python app.py

cd ../go-gateway
go run main.go
```

网关会聚合 Java 价格与 Python 分析两段数据：

```powershell
Invoke-RestMethod -Method Get -Uri "http://localhost:8080/api/v1/prices/SKU-1001?memberLevel=GOLD"
```

返回 `data.price`（Java 计算结果）与 `data.analysis`（Python 分析结果）。Python 服务未启动时网关自动降级，`data.analysis` 为 `null`，网关日志记录错误码 50002，主链路不受影响。

下游地址可用环境变量覆盖（默认 localhost，docker-compose 内用服务名）：

| 环境变量 | 默认值 |
| --- | --- |
| `JAVA_SERVICE_URL` | `http://localhost:8081` |
| `PYTHON_SERVICE_URL` | `http://localhost:8082` |

一键编排与全链路验证：

```powershell
docker compose up
.\scripts\smoke-test.ps1
```
