import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const input = path.join(root, "book/manuscript.md");
const output = path.join(root, "dist/Java视角下的Go与Python全栈协同实战.html");
const markdown = fs.readFileSync(input, "utf8");

function escapeHtml(text) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function inline(text) {
  return escapeHtml(text)
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
}

const lines = markdown.split(/\r?\n/);
let html = "";
let inCode = false;
let codeLang = "";
let codeBuffer = [];
let inTable = false;
let tableRows = [];

function flushCode() {
  html += `<pre><code class="language-${escapeHtml(codeLang)}">${escapeHtml(codeBuffer.join("\n"))}</code></pre>\n`;
  codeBuffer = [];
  codeLang = "";
}

function flushTable() {
  if (!tableRows.length) return;
  html += "<table>\n";
  for (let i = 0; i < tableRows.length; i++) {
    if (i === 1 && tableRows[i].every((cell) => /^:?-{3,}:?$/.test(cell.trim()))) continue;
    const tag = i === 0 ? "th" : "td";
    html += "<tr>" + tableRows[i].map((cell) => `<${tag}>${inline(cell.trim())}</${tag}>`).join("") + "</tr>\n";
  }
  html += "</table>\n";
  tableRows = [];
  inTable = false;
}

for (const line of lines) {
  const fence = line.match(/^```(.*)$/);
  if (fence) {
    if (inTable) flushTable();
    if (inCode) {
      flushCode();
      inCode = false;
    } else {
      inCode = true;
      codeLang = fence[1].trim();
    }
    continue;
  }

  if (inCode) {
    codeBuffer.push(line);
    continue;
  }

  if (/^\|.*\|$/.test(line)) {
    inTable = true;
    tableRows.push(line.replace(/^\||\|$/g, "").split("|"));
    continue;
  }
  if (inTable) flushTable();

  if (!line.trim()) {
    html += "\n";
    continue;
  }
  if (line === "---") {
    html += "<hr>\n";
    continue;
  }
  const heading = line.match(/^(#{1,6})\s+(.*)$/);
  if (heading) {
    const level = heading[1].length;
    html += `<h${level}>${inline(heading[2])}</h${level}>\n`;
    continue;
  }
  if (/^\d+\.\s+/.test(line)) {
    html += `<p class="list">${inline(line)}</p>\n`;
    continue;
  }
  if (/^[-*]\s+/.test(line)) {
    html += `<p class="list">${inline(line)}</p>\n`;
    continue;
  }
  if (line.startsWith("> ")) {
    html += `<blockquote>${inline(line.slice(2))}</blockquote>\n`;
    continue;
  }
  html += `<p>${inline(line)}</p>\n`;
}

if (inCode) flushCode();
if (inTable) flushTable();

const page = `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Java 视角下的 Go 与 Python 全栈协同实战</title>
  <style>
    :root { color-scheme: light; --ink: #202124; --muted: #5f6368; --line: #d9dde3; --code: #f6f8fa; }
    body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Microsoft YaHei", sans-serif; color: var(--ink); background: #fff; }
    main { max-width: 920px; margin: 0 auto; padding: 48px 28px 96px; line-height: 1.72; font-size: 16px; }
    h1 { margin: 48px 0 18px; padding-bottom: 12px; border-bottom: 1px solid var(--line); font-size: 2rem; }
    h2 { margin: 36px 0 12px; font-size: 1.45rem; }
    h3 { margin: 24px 0 8px; font-size: 1.15rem; }
    p { margin: 10px 0; }
    blockquote { margin: 16px 0; padding: 10px 16px; color: var(--muted); border-left: 4px solid var(--line); background: #fafafa; }
    code { font-family: "Cascadia Mono", Consolas, monospace; background: var(--code); padding: 0 4px; border-radius: 3px; }
    pre { overflow: auto; padding: 16px; background: var(--code); border: 1px solid var(--line); border-radius: 6px; line-height: 1.45; }
    pre code { padding: 0; background: transparent; }
    table { width: 100%; border-collapse: collapse; margin: 18px 0; font-size: 14px; }
    th, td { border: 1px solid var(--line); padding: 8px 10px; vertical-align: top; }
    th { background: #f1f3f4; text-align: left; }
    hr { border: 0; border-top: 1px solid var(--line); margin: 44px 0; }
    .list { padding-left: 18px; }
    @media print { main { max-width: none; padding: 0; } h1 { page-break-before: always; } }
  </style>
</head>
<body>
<main>
${html}
</main>
</body>
</html>`;

fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, page, "utf8");
console.log(output);
