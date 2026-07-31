import fs from "node:fs";
import path from "node:path";
import { appendices, chapters, manuscript } from "./book-structure.mjs";

const root = process.cwd();

function copyMarkdown(source, target) {
  const from = path.join(root, source);
  const to = path.join(root, target);
  fs.mkdirSync(path.dirname(to), { recursive: true });
  const content = fs.readFileSync(from, "utf8")
    .replace(/^# /, "# ")
    .replaceAll("```mermaid", "```mermaid");
  fs.writeFileSync(to, content, "utf8");
}

for (const { source, site } of [...chapters, ...appendices]) {
  copyMarkdown(source, site);
}

fs.mkdirSync(path.join(root, "site/ebook"), { recursive: true });
fs.copyFileSync(path.join(root, manuscript.target), path.join(root, manuscript.site));

console.log(`Synced ${chapters.length} chapters and ${appendices.length} appendices into site/.`);
