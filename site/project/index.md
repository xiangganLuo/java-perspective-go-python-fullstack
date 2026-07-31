# 实战项目

全书实战项目是“多语言协同电商价格计算平台”。源码已放在 GitHub 仓库中，建议直接进入项目目录查看代码、协议和本地运行说明。

[前往 GitHub 实战项目](https://github.com/xiangganLuo/java-perspective-go-python-fullstack/tree/main/project/pricing-platform)

## 服务拆分

| 服务 | 职责 | 默认端口 |
| --- | --- | ---: |
| Go 网关 | 鉴权、traceId、限流、转发/聚合 | 8080 |
| Java 价格服务 | 商品原价、优惠、会员权益、最终价 | 8081 |
| Python 分析服务 | 历史趋势、波动率、价格分 | 8082 |

## 本地验证

```powershell
cd project/pricing-platform/java-price-service
javac src/com/javago/pricing/PriceService.java
java -cp src com.javago.pricing.PriceService
```

另开终端：

```powershell
Invoke-RestMethod -Method Post -Uri http://localhost:8081/api/v1/price/calculate -ContentType 'application/json' -Body '{"sku":"SKU-1001","memberLevel":"GOLD"}'
```

期望返回：

```json
{
  "code": 0,
  "data": {
    "sku": "SKU-1001",
    "finalPriceCents": 110415
  }
}
```

源码目录位于仓库根目录的 `project/pricing-platform/`。
