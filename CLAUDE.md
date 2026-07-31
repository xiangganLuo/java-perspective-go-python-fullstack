# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repository is

A VitePress documentation site for the Chinese ebook *《Java 视角下的 Go 与 Python 全栈协同实战》* plus a companion multi-language demo project (`project/pricing-platform`). The prose is written in Chinese; the codebase and tooling are the deliverable's supporting infrastructure.

## Commands

```powershell
npm install              # first-time setup

npm run book:build       # concatenate book/ sources -> book/manuscript.md
npm run site:sync        # book:build, then copy sources into site/ebook/ (English slugs)
npm run docs:dev         # site:sync, then live VitePress dev server (host 0.0.0.0)
npm run docs:build       # site:sync, then production build into site/.vitepress/dist
npm run docs:preview      # preview the built site
npm run export:html      # book:build, then render a single standalone HTML into dist/

node tools/validate-deliverables.mjs   # deliverable checks (no npm script; run directly)
```

`validate-deliverables.mjs` verifies required files exist, chapter/appendix counts, mermaid diagram count, and that the last `docs:build` transformed mermaid fences. Its mermaid check reads `site/.vitepress/dist/`, so run `npm run docs:build` before validating.

## Content pipeline (the core architecture)

The site content is **generated**. Understanding the one-way flow is essential before editing anything under `site/`:

```
book/chapters/*.md          (hand-edited, Chinese filenames)
book/appendices/*.md        (hand-edited)
        │  build-book.mjs  — concatenates all sources with "---" separators
        ▼
book/manuscript.md          (generated: full merged manuscript)
        │  sync-vitepress-site.mjs — copies each source to its English-slug path
        ▼
site/ebook/chapters/*.md    (generated: English slugs, e.g. 03-go-syntax-java-mapping.md)
site/ebook/appendices/*.md  (generated)
site/ebook/full-manuscript.md (generated: copy of manuscript.md)
        │  vitepress build
        ▼
site/.vitepress/dist/       (generated static site)
dist/                       (generated standalone HTML from export:html)
```

**Only `book/chapters/` and `book/appendices/` are hand-edited.** Everything downstream (`book/manuscript.md`, all of `site/ebook/`, `site/.vitepress/dist/`, `dist/`) is regenerated and must not be edited by hand — changes there are overwritten on the next build.

### `tools/book-structure.mjs` is the single source of truth

This module holds the ordered `chapters` and `appendices` arrays mapping each `source` (Chinese path) → `site` (English-slug path) → `label`. Every tool imports it. To add, remove, or reorder a chapter you must edit this file, **and** separately update the sidebar in `site/.vitepress/config.mts` (the sidebar is maintained by hand, not derived from `book-structure.mjs`). Filenames diverge on purpose: sources use Chinese names, site targets use English slugs.

## Mermaid rendering

Diagrams are authored as ```` ```mermaid ```` fenced blocks in the Markdown sources. `site/.vitepress/config.mts` installs a custom markdown-it fence rule that rewrites mermaid fences into a `<MermaidDiagram code="..." />` Vue component (`site/.vitepress/theme/components/MermaidDiagram.vue`), which renders client-side. Do not expect mermaid to render as a plain code block.

## Companion demo: `project/pricing-platform`

A three-service demo referenced throughout the book (Chapter 13). It is illustrative source, not wired into the site build. Services: Go gateway (`go-gateway`, :8080), Java price service (`java-price-service`, :8081), Python analysis service (`python-analysis-service`, :8082). The Java service is runnable with just a JDK (`javac`/`java`, no build tool); Go/Python services need their respective toolchains. See `project/pricing-platform/README.md`.

## Conventions

- Chapter/appendix prose is Chinese; keep new content consistent with `docs/writing-template.md` and the standards in `docs/planning/book-blueprint.md`.
- After editing any `book/` source, run `npm run docs:build` (or `docs:dev`) to regenerate site content — never edit the generated copies.
- Dual license: prose/content under CC BY-NC-SA 4.0 (`LICENSE-CONTENT.md`); code/scripts/config under Apache 2.0 (`LICENSE-CODE`).
