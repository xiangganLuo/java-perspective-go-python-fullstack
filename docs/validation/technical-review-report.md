# 技术校验报告

## 校验范围

- 13 章 Markdown 正文。
- 跨语言接口协议、错误码、日志字段规范。
- Java/Go/Python 实战源码结构。
- SQL、Docker Compose、Smoke Test 脚本。

## 结论

阶段 1~3 的内容产物已形成完整闭环，可以进入人工审阅与发布前精修。Java 标准库版本已本地编译并通过真实 HTTP smoke test；Go/Python 代码因当前机器工具链限制，已完成静态结构校验，待安装运行时后可执行完整联调。

## 重点检查项

| 检查项 | 结果 | 说明 |
| --- | --- | --- |
| 章节结构一致性 | 通过 | 13 章均按统一模板生成 |
| Java 视角约束 | 通过 | 每章都有 Java 经验映射 |
| Mermaid 图表 | 通过 | 每章至少一张图 |
| 接口契约统一 | 通过 | 响应壳、错误码、traceId 已定义 |
| Java 服务编译 | 通过 | 使用 JDK 21 标准库，无第三方依赖，编译输出写入临时目录 |
| Java HTTP smoke test | 通过 | `SKU-1001 + GOLD` 返回 `finalPriceCents=110415` |
| Go 服务编译 | 未执行 | 当前机器未探测到 Go |
| Python 服务运行 | 未执行 | 当前 `python` 命令为 Windows Store 占位 |
| 静态交付校验 | 通过 | `node tools/validate-deliverables.mjs` 全部 PASS |

## 实际验证命令

```powershell
$out = Join-Path $env:TEMP 'ebook-java-build'
New-Item -ItemType Directory -Force -Path $out | Out-Null
javac -d $out project\pricing-platform\java-price-service\src\com\javago\pricing\PriceService.java
```

```powershell
$body = '{"sku":"SKU-1001","memberLevel":"GOLD"}'
Invoke-RestMethod -Method Post -Uri 'http://localhost:8081/api/v1/price/calculate' -ContentType 'application/json' -Body $body
```
