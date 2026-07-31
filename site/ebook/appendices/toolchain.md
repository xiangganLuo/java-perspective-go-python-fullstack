# 附录 B：多语言协同常用工具链配置指南

## 推荐目录

```
project/pricing-platform
├── go-gateway
├── java-price-service
├── python-analysis-service
├── contracts
├── sql
└── scripts
```

## 本地端口

| 服务 | 端口 | 说明 |
| --- | ---: | --- |
| Go 网关 | 8080 | 对外入口 |
| Java 价格服务 | 8081 | 核心价格计算 |
| Python 分析服务 | 8082 | 历史价格与评分 |
