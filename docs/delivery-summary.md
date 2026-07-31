# 阶段 1~3 交付说明

## 明早验收入口

1. 分章维护源：`book/chapters/`
2. 附录维护源：`book/appendices/`
3. 全书合并稿：`book/manuscript.md`（生成物）
4. HTML 阅读版：`dist/Java视角下的Go与Python全栈协同实战.html`（生成物）
3. 分章正文：`book/chapters/`
4. 附录：`book/appendices/`
5. 实战源码：`project/pricing-platform/`
6. 技术校验：`docs/validation/technical-review-report.md`
7. 实战验收：`docs/validation/integration-acceptance-report.md`

## 已完成范围

- 阶段 1：书籍规划、章节目录、写作模板、协议标准、实战项目架构。
- 阶段 2：前言、13 章正文、5 个附录、每章 Mermaid 图表、章节案例、配套源码。
- 阶段 3：静态交付校验、Java 服务编译和 HTTP smoke test、HTML 阅读版、导出指南、验收报告。

## 待人工介入范围

- 发布平台选择与账号发布。
- PDF/EPUB/MOBI 的正式排版导出。当前机器未安装 Pandoc/Calibre，已提供一键导出命令。
- Go/Python 完整联调。当前机器未安装 Go，可用 Python 命令为 Windows Store 占位；源码与启动说明已交付。

## 验收建议

先运行 `npm run docs:build` 生成最新站点，再抽查第 3、6、9、12、13 章。源码侧优先验证 Java 价格服务，因为它已通过本机真实请求测试。
