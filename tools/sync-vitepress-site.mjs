import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const chapters = [
  ["book/chapters/00-preface.md", "site/ebook/chapters/00-preface.md"],
  ["book/chapters/01-为什么-java-工程师要掌握多语言？.md", "site/ebook/chapters/01-why-java-engineers-need-multilingual.md"],
  ["book/chapters/02-从-java-视角学习新语言的高效方法.md", "site/ebook/chapters/02-java-perspective-learning-method.md"],
  ["book/chapters/03-go-基础语法-与-java-的核心差异映射.md", "site/ebook/chapters/03-go-syntax-java-mapping.md"],
  ["book/chapters/04-go-的并发模型-java-开发者必须掌握的核心差异.md", "site/ebook/chapters/04-go-concurrency-model.md"],
  ["book/chapters/05-go-web-框架-gin-对标-spring-mvc-的技术映射.md", "site/ebook/chapters/05-gin-vs-spring-mvc.md"],
  ["book/chapters/06-go-与-java-的协同通信机制.md", "site/ebook/chapters/06-go-java-communication.md"],
  ["book/chapters/07-go-在全栈架构下的落地场景实战.md", "site/ebook/chapters/07-go-fullstack-scenarios.md"],
  ["book/chapters/08-python-基础语法-与-java-的核心差异映射.md", "site/ebook/chapters/08-python-syntax-java-mapping.md"],
  ["book/chapters/09-python-web-框架-对标-spring-boot-的技术映射.md", "site/ebook/chapters/09-python-web-vs-spring-boot.md"],
  ["book/chapters/10-python-与-java-的协同通信机制.md", "site/ebook/chapters/10-python-java-communication.md"],
  ["book/chapters/11-python-在全栈架构下的落地场景实战.md", "site/ebook/chapters/11-python-fullstack-scenarios.md"],
  ["book/chapters/12-全栈架构设计-java+go+python-技术栈整合.md", "site/ebook/chapters/12-architecture-integration.md"],
  ["book/chapters/13-企业级实战项目-多语言协同电商价格计算平台.md", "site/ebook/chapters/13-pricing-platform.md"]
];

const appendices = [
  ["book/appendices/appendix-a-comparison.md", "site/ebook/appendices/comparison.md"],
  ["book/appendices/appendix-b-toolchain.md", "site/ebook/appendices/toolchain.md"],
  ["book/appendices/appendix-c-config-reference.md", "site/ebook/appendices/config-reference.md"],
  ["book/appendices/appendix-d-troubleshooting.md", "site/ebook/appendices/troubleshooting.md"],
  ["book/appendices/appendix-e-resources.md", "site/ebook/appendices/resources.md"]
];

function copyMarkdown(source, target) {
  const from = path.join(root, source);
  const to = path.join(root, target);
  fs.mkdirSync(path.dirname(to), { recursive: true });
  const content = fs.readFileSync(from, "utf8")
    .replace(/^# /, "# ")
    .replaceAll("```mermaid", "```mermaid");
  fs.writeFileSync(to, content, "utf8");
}

for (const [source, target] of [...chapters, ...appendices]) {
  copyMarkdown(source, target);
}

fs.mkdirSync(path.join(root, "site/ebook"), { recursive: true });
fs.copyFileSync(path.join(root, "book/manuscript.md"), path.join(root, "site/ebook/full-manuscript.md"));

console.log(`Synced ${chapters.length} chapters and ${appendices.length} appendices into site/.`);
