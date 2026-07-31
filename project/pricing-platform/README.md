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
