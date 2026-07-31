import { defineConfig } from "vitepress";
import type MarkdownIt from "markdown-it";

function renderMermaid(md: MarkdownIt) {
  const defaultFence = md.renderer.rules.fence?.bind(md.renderer.rules);

  md.renderer.rules.fence = (tokens, idx, options, env, self) => {
    const token = tokens[idx];
    const language = token.info.trim().split(/\s+/)[0];

    if (language === "mermaid") {
      return `<MermaidDiagram code="${encodeURIComponent(token.content)}" />`;
    }

    return defaultFence ? defaultFence(tokens, idx, options, env, self) : self.renderToken(tokens, idx, options);
  };
}

export default defineConfig({
  title: "Java 视角下的 Go 与 Python 全栈协同实战",
  description: "从 Java 经验到 Go 网关、Python 数据辅助层与多语言企业架构",
  lang: "zh-CN",
  cleanUrls: true,
  lastUpdated: true,
  ignoreDeadLinks: true,
  themeConfig: {
    logo: "/architecture-cover.svg",
    siteTitle: "Java Go Python",
    nav: [
      { text: "电子书", link: "/ebook/" },
      { text: "实战项目", link: "/project/" },
      { text: "部署", link: "/deploy/" }
    ],
    outline: {
      level: [2, 3],
      label: "本页目录"
    },
    docFooter: {
      prev: "上一篇",
      next: "下一篇"
    },
    footer: {
      message: "书稿内容采用 CC BY-NC-SA 4.0；配套源码采用 Apache License 2.0。",
      copyright: "Copyright © 2026 luoxianggan"
    },
    lastUpdated: {
      text: "最后更新",
      formatOptions: {
        dateStyle: "short",
        timeStyle: "medium"
      }
    },
    search: {
      provider: "local"
    },
    sidebar: {
      "/ebook/": [
        {
          text: "开始",
          items: [
            { text: "电子书目录", link: "/ebook/" },
            { text: "前言", link: "/ebook/chapters/00-preface" },
            { text: "全书合并稿", link: "/ebook/full-manuscript" }
          ]
        },
        {
          text: "第一篇：认知篇",
          items: [
            { text: "1. 为什么 Java 工程师要掌握多语言？", link: "/ebook/chapters/01-why-java-engineers-need-multilingual" },
            { text: "2. 从 Java 视角学习新语言", link: "/ebook/chapters/02-java-perspective-learning-method" }
          ]
        },
        {
          text: "第二篇：Go 世界",
          collapsed: false,
          items: [
            { text: "3. Go 基础语法", link: "/ebook/chapters/03-go-syntax-java-mapping" },
            { text: "4. Go 并发模型", link: "/ebook/chapters/04-go-concurrency-model" },
            { text: "5. Gin 对标 Spring MVC", link: "/ebook/chapters/05-gin-vs-spring-mvc" },
            { text: "6. Go 与 Java 通信", link: "/ebook/chapters/06-go-java-communication" },
            { text: "7. Go 落地场景", link: "/ebook/chapters/07-go-fullstack-scenarios" }
          ]
        },
        {
          text: "第三篇：Python 世界",
          collapsed: false,
          items: [
            { text: "8. Python 基础语法", link: "/ebook/chapters/08-python-syntax-java-mapping" },
            { text: "9. Python Web 对标 Spring Boot", link: "/ebook/chapters/09-python-web-vs-spring-boot" },
            { text: "10. Python 与 Java 通信", link: "/ebook/chapters/10-python-java-communication" },
            { text: "11. Python 落地场景", link: "/ebook/chapters/11-python-fullstack-scenarios" }
          ]
        },
        {
          text: "第四篇：整合篇",
          items: [
            { text: "12. 全栈架构设计", link: "/ebook/chapters/12-architecture-integration" },
            { text: "13. 电商价格计算平台", link: "/ebook/chapters/13-pricing-platform" }
          ]
        },
        {
          text: "附录",
          items: [
            { text: "技术特性对比", link: "/ebook/appendices/comparison" },
            { text: "工具链配置", link: "/ebook/appendices/toolchain" },
            { text: "框架配置对照", link: "/ebook/appendices/config-reference" },
            { text: "故障排查", link: "/ebook/appendices/troubleshooting" },
            { text: "延伸资源", link: "/ebook/appendices/resources" }
          ]
        }
      ],
      "/project/": [
        {
          text: "实战项目",
          items: [{ text: "项目说明", link: "/project/" }]
        }
      ],
      "/deploy/": [
        {
          text: "部署",
          items: [{ text: "部署指南", link: "/deploy/" }]
        }
      ]
    },
    socialLinks: []
  },
  markdown: {
    lineNumbers: true,
    config(md) {
      renderMermaid(md);
    }
  }
});
