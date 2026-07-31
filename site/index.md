---
layout: home

hero:
  name: "Java 视角下的 Go 与 Python 全栈协同实战"
  text: "从 Java 经验到 Go 网关、Python 数据辅助层与多语言企业架构"
  tagline: "luoxianggan 著。用 Java 经验低成本掌握 Go 网关、Python 数据辅助层，以及 Java+Go+Python 企业级协同链路。"
  image:
    src: /architecture-cover.svg
    alt: Java Go Python 多语言协同架构图
  actions:
    - theme: brand
      text: 开始阅读
      link: /ebook/
    - theme: alt
      text: 查看实战项目
      link: /project/

features:
  - title: Java 视角
    details: 每个知识点先对标 Spring Boot、Spring MVC、Maven、JUC 等 Java 经验，再解释 Go/Python 的设计差异。
  - title: 场景驱动
    details: Go 聚焦高并发入口、API 网关和云原生组件；Python 聚焦数据处理、自动化脚本和 AI 生态适配。
  - title: 企业实战
    details: 全书收束到电商价格计算平台，覆盖 Go 网关、Java 价格服务、Python 分析服务和跨语言协议规范。
---

## 交付内容

| 模块 | 内容 |
| --- | --- |
| 电子书正文 | 前言、13 章正文、5 个附录 |
| 实战项目 | Go 网关、Java 价格服务、Python 分析服务 |
| 工程规范 | OpenAPI 契约、错误码、日志字段、Docker Compose |
| 验收资料 | 技术校验报告、实战验收报告、导出指南 |

## 架构链路

```mermaid
flowchart LR
  Reader[读者] --> Book[电子书章节]
  Book --> Go[Go 流量网关]
  Book --> Java[Java 核心服务]
  Book --> Python[Python 分析服务]
  Go --> Java
  Java --> Python
  Java --> DB[(价格数据)]
```

## 版权协议

Copyright © 2026 luoxianggan

书稿正文、图表与站点内容采用 CC BY-NC-SA 4.0；示例代码、脚本、配置文件与实战项目源码采用 Apache License 2.0。
