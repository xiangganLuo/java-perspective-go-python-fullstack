# 电子书导出指南

## 源文件

- 合并稿：book/manuscript.md
- 分章稿：book/chapters/*.md
- 附录：book/appendices/*.md

## 推荐导出

Pandoc 可用时：

```powershell
pandoc book/manuscript.md -o dist/Java视角下的Go与Python全栈协同实战.pdf --toc
pandoc book/manuscript.md -o dist/Java视角下的Go与Python全栈协同实战.epub --toc
```

Calibre 可用时，可由 EPUB 转 MOBI：

```powershell
ebook-convert dist/Java视角下的Go与Python全栈协同实战.epub dist/Java视角下的Go与Python全栈协同实战.mobi
```

如果本地没有 Pandoc/Calibre，先使用 Markdown 合并稿作为验收版本，人工审阅通过后再进入正式排版。
