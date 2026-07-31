export const bookTitle = "Java 视角下的 Go 与 Python 全栈协同实战";
export const bookSubtitle = "从 Java 经验到 Go 网关、Python 数据辅助层与多语言企业架构";
export const author = "luoxianggan";

export const chapters = [
  {
    source: "book/chapters/00-preface.md",
    site: "site/ebook/chapters/00-preface.md",
    label: "前言"
  },
  {
    source: "book/chapters/01-为什么-java-工程师要掌握多语言？.md",
    site: "site/ebook/chapters/01-why-java-engineers-need-multilingual.md",
    label: "1. 为什么 Java 工程师要掌握多语言？"
  },
  {
    source: "book/chapters/02-从-java-视角学习新语言的高效方法.md",
    site: "site/ebook/chapters/02-java-perspective-learning-method.md",
    label: "2. 从 Java 视角学习新语言"
  },
  {
    source: "book/chapters/03-go-基础语法-与-java-的核心差异映射.md",
    site: "site/ebook/chapters/03-go-syntax-java-mapping.md",
    label: "3. Go 基础语法"
  },
  {
    source: "book/chapters/04-go-的并发模型-java-开发者必须掌握的核心差异.md",
    site: "site/ebook/chapters/04-go-concurrency-model.md",
    label: "4. Go 并发模型"
  },
  {
    source: "book/chapters/05-go-web-框架-gin-对标-spring-mvc-的技术映射.md",
    site: "site/ebook/chapters/05-gin-vs-spring-mvc.md",
    label: "5. Gin 对标 Spring MVC"
  },
  {
    source: "book/chapters/06-go-与-java-的协同通信机制.md",
    site: "site/ebook/chapters/06-go-java-communication.md",
    label: "6. Go 与 Java 通信"
  },
  {
    source: "book/chapters/07-go-在全栈架构下的落地场景实战.md",
    site: "site/ebook/chapters/07-go-fullstack-scenarios.md",
    label: "7. Go 落地场景"
  },
  {
    source: "book/chapters/08-python-基础语法-与-java-的核心差异映射.md",
    site: "site/ebook/chapters/08-python-syntax-java-mapping.md",
    label: "8. Python 基础语法"
  },
  {
    source: "book/chapters/09-python-web-框架-对标-spring-boot-的技术映射.md",
    site: "site/ebook/chapters/09-python-web-vs-spring-boot.md",
    label: "9. Python Web 对标 Spring Boot"
  },
  {
    source: "book/chapters/10-python-与-java-的协同通信机制.md",
    site: "site/ebook/chapters/10-python-java-communication.md",
    label: "10. Python 与 Java 通信"
  },
  {
    source: "book/chapters/11-python-在全栈架构下的落地场景实战.md",
    site: "site/ebook/chapters/11-python-fullstack-scenarios.md",
    label: "11. Python 落地场景"
  },
  {
    source: "book/chapters/12-全栈架构设计-java+go+python-技术栈整合.md",
    site: "site/ebook/chapters/12-architecture-integration.md",
    label: "12. 全栈架构设计"
  },
  {
    source: "book/chapters/13-企业级实战项目-多语言协同电商价格计算平台.md",
    site: "site/ebook/chapters/13-pricing-platform.md",
    label: "13. 电商价格计算平台"
  }
];

export const appendices = [
  {
    source: "book/appendices/appendix-a-comparison.md",
    site: "site/ebook/appendices/comparison.md",
    label: "技术特性对比"
  },
  {
    source: "book/appendices/appendix-b-toolchain.md",
    site: "site/ebook/appendices/toolchain.md",
    label: "工具链配置"
  },
  {
    source: "book/appendices/appendix-c-config-reference.md",
    site: "site/ebook/appendices/config-reference.md",
    label: "框架配置对照"
  },
  {
    source: "book/appendices/appendix-d-troubleshooting.md",
    site: "site/ebook/appendices/troubleshooting.md",
    label: "故障排查"
  },
  {
    source: "book/appendices/appendix-e-resources.md",
    site: "site/ebook/appendices/resources.md",
    label: "延伸资源"
  }
];

export const manuscript = {
  target: "book/manuscript.md",
  site: "site/ebook/full-manuscript.md"
};

export const sourceFiles = [...chapters, ...appendices].map((item) => item.source);
