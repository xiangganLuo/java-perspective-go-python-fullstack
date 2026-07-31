# 部署指南

推荐部署组合：VitePress + Cloudflare Pages。

## Cloudflare Pages

| 配置项 | 值 |
| --- | --- |
| Framework preset | VitePress |
| Build command | `npm run docs:build` |
| Build output directory | `site/.vitepress/dist` |
| Node version | 20 或 22 |

## GitHub Pages

如果使用 GitHub Pages，可以在 CI 中执行：

```bash
npm ci
npm run docs:build
```

然后将 `site/.vitepress/dist` 发布到 Pages。

## 内容更新流程

1. 修改 `book/chapters` 或 `book/appendices`。
2. 运行 `npm run docs:build`，它会自动生成合并稿并同步 VitePress 页面。
3. 推送到托管平台触发部署。
