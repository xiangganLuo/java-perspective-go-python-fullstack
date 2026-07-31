# Java 视角下的 Go 与 Python 全栈协同实战

副标题：从 Java 经验到 Go 网关、Python 数据辅助层与多语言企业架构

作者：luoxianggan

这是《Java 视角下的 Go 与 Python 全栈协同实战》的阶段 1~3 交付仓库，覆盖书籍规划、正文初稿、配套源码、联调协议、技术校验和验收资料。

## 快速入口

| 入口 | 说明 |
| --- | --- |
| [site](site) | VitePress 静态站源码，适合部署到 Cloudflare Pages |
| [book/chapters](book/chapters) | 唯一人工维护的分章正文源 |
| [book/appendices](book/appendices) | 唯一人工维护的附录源 |
| `book/manuscript.md` | 由 `npm run book:build` 生成的全书合并稿 |
| [docs/planning/book-blueprint.md](docs/planning/book-blueprint.md) | 顶层规划、章节标准、交付边界 |
| [docs/writing-template.md](docs/writing-template.md) | 统一写作模板 |
| [project/pricing-platform](project/pricing-platform) | 多语言协同电商价格计算平台源码 |
| [docs/validation](docs/validation) | 技术校验、实战验收、章节质量记录 |

## 当前交付状态

- 阶段 1：书籍规划与准备已完成。
- 阶段 2：13 章 Markdown 正文、图表、章节案例说明已完成。
- 阶段 3：技术校验报告、实战验收报告、排版导出准备已完成。
- 阶段 4：公开发布、平台分发、视频录制留待人工验收后推进。

## 本地验证

```powershell
cd project/pricing-platform/java-price-service
javac src/com/javago/pricing/PriceService.java
java -cp src com.javago.pricing.PriceService
```

另开终端可用：

```powershell
Invoke-RestMethod -Method Post -Uri http://localhost:8081/api/v1/price/calculate -ContentType 'application/json' -Body '{"sku":"SKU-1001","memberLevel":"GOLD"}'
```

Go 与 Python 服务代码也已放入仓库。若本机安装 Go/Python，可按 [project/pricing-platform/README.md](project/pricing-platform/README.md) 启动完整链路。

## 静态站部署

本项目已配置 VitePress，可直接部署到 Cloudflare Pages、Netlify、Vercel 或 GitHub Pages。

```powershell
npm install
npm run docs:build
```

部署平台配置：

| 配置项 | 值 |
| --- | --- |
| Build command | `npm run docs:build` |
| Output directory | `site/.vitepress/dist` |
| Node version | `22` |

本地预览：

```powershell
npm run docs:dev
```

## 内容维护约定

`book/chapters/` 和 `book/appendices/` 是唯一人工维护源。

以下文件/目录均为生成物，不需要手工修改：

- `book/manuscript.md`
- `site/ebook/chapters/`
- `site/ebook/appendices/`
- `site/ebook/full-manuscript.md`
- `dist/`

修改书稿后运行：

```powershell
npm run docs:build
```

## 版权协议

Copyright © 2026 luoxianggan

本仓库采用双协议：

| 范围 | 协议 |
| --- | --- |
| 书稿正文、图表、站点文字与其他非代码内容 | [CC BY-NC-SA 4.0](LICENSE-CONTENT.md) |
| 示例代码、脚本、配置文件与实战项目源码 | [Apache License 2.0](LICENSE-CODE) |

引用或改编书稿内容时，请署名：luoxianggan，《Java 视角下的 Go 与 Python 全栈协同实战》。
