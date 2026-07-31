import fs from "node:fs";
import path from "node:path";
import { appendices, chapters, manuscript } from "./book-structure.mjs";

const root = process.cwd();
const required = [
  "README.md",
  manuscript.target,
  "docs/planning/book-blueprint.md",
  "docs/writing-template.md",
  "docs/protocols/api-contract.md",
  "project/pricing-platform/README.md",
  "project/pricing-platform/java-price-service/src/com/javago/pricing/PriceService.java",
  "project/pricing-platform/go-gateway/main.go",
  "project/pricing-platform/python-analysis-service/app.py",
  "project/pricing-platform/docker-compose.yml",
  "project/pricing-platform/sql/schema.sql",
  "docs/validation/technical-review-report.md",
  "docs/validation/integration-acceptance-report.md"
];

const missing = required.filter((file) => !fs.existsSync(path.join(root, file)));
const manuscriptContent = fs.readFileSync(path.join(root, manuscript.target), "utf8");

const checks = [
  ["required files", missing.length === 0, missing.join(", ")],
  ["chapter count", chapters.length === 14, String(chapters.length)],
  ["appendix count", appendices.length === 5, String(appendices.length)],
  ["mermaid diagrams", (manuscriptContent.match(/```mermaid/g) || []).length >= 13, String((manuscriptContent.match(/```mermaid/g) || []).length)],
  ["java mentions", manuscriptContent.includes("Java"), ""],
  ["go mentions", manuscriptContent.includes("Go"), ""],
  ["python mentions", manuscriptContent.includes("Python"), ""],
  ["traceId contract", manuscriptContent.includes("traceId"), ""]
];

let ok = true;
for (const [name, pass, detail] of checks) {
  console.log(`${pass ? "PASS" : "FAIL"} ${name}${detail ? `: ${detail}` : ""}`);
  if (!pass) ok = false;
}

process.exit(ok ? 0 : 1);
