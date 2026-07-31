import fs from "node:fs";
import path from "node:path";
import { manuscript, sourceFiles } from "./book-structure.mjs";

const root = process.cwd();

const content = sourceFiles
  .map((file) => fs.readFileSync(path.join(root, file), "utf8").trim())
  .join("\n\n---\n\n");

const target = path.join(root, manuscript.target);
fs.mkdirSync(path.dirname(target), { recursive: true });
fs.writeFileSync(target, content + "\n", "utf8");

console.log(`Built ${manuscript.target} from ${sourceFiles.length} source files.`);
