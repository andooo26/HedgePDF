# HedgePDF

## 概要
HedgeDoc内のドキュメントをPDF化する拡張機能です。

## 使用技術
### Markdown化
- marked.js（marked.min.js）
## MarkdownをHTML,PDFへ変換
- html2pdf.js（html2pdf.bundle.min.js）
- html2canvas
- jsPDF

## 仕組み
### PDFへ変換
- Markdown(HedgeDoc) → HTML(marked.js) → PDF(html2pdf.js)
### Markdownをダウンロード
- HedgeDocのAPIを使用(/download)
