document.getElementById("export").addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  const url = new URL(tab.url);
  // ID取得
  const parts = url.pathname.split("/").filter(Boolean);
  const noteid = parts.pop();

  // xxxx/noteid/downloadでmd落とす
  const apiUrl = `${url.origin}/${noteid}/download`;
  const md = await fetch(apiUrl).then(r => r.text()).catch(e => {
    alert("md取得失敗");
  });

  if (!md) return;

  try {
    // MarkdownをHTMLに変換
    const htmlContent = marked.parse(md);

    // PDF変換用のHTMLを作成
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>PDF Export</title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;700&display=swap" rel="stylesheet">
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          html {
            font-size: 14px !important;
          }
          body {
            font-family: "Noto Sans JP", "Hiragino Kaku Gothic ProN", "Hiragino Sans", Meiryo, sans-serif !important;
            font-size: 14px !important;
            line-height: 1.8;
            color: #333;
            background: #fff;
            padding: 20px;
            max-width: 800px;
            margin: 0 auto;
          }
          h1, h2, h3, h4, h5, h6 {
            margin-top: 1.5em;
            margin-bottom: 0.8em;
            font-weight: 700;
            line-height: 1.4;
          }
          h1 { font-size: 2em; border-bottom: 2px solid #eee; padding-bottom: 0.3em; }
          h2 { font-size: 1.6em; border-bottom: 1px solid #eee; padding-bottom: 0.3em; }
          h3 { font-size: 1.3em; }
          h4 { font-size: 1.1em; }
          p {
            font-size: 14px !important;
            margin-bottom: 1em;
          }
          ul, ol {
            margin-left: 2em;
            margin-bottom: 1em;
          }
          li {
            font-size: 14px !important;
            margin-bottom: 0.5em;
          }
          div, span {
            font-size: 14px !important;
          }
          code {
            font-family: "Courier New", "Monaco", "Consolas", monospace;
            background-color: #f6f8fa;
            padding: 2px 6px;
            border-radius: 3px;
            font-size: 0.9em;
            border: 1px solid #e1e4e8;
            color: #e83e8c;
          }
          pre {
            background-color: #f6f8fa;
            padding: 16px;
            border-radius: 6px;
            overflow-x: auto;
            margin-bottom: 1em;
            border: 1px solid #e1e4e8;
            border-left: 4px solid #0366d6;
          }
          pre code {
            background-color: transparent;
            padding: 0;
            border: none;
            color: #24292e;
            font-size: 0.9em;
          }
          blockquote {
            font-size: 14px !important;
            border-left: 4px solid #dfe2e5;
            background-color: #f6f8fa;
            padding: 0 16px;
            margin-left: 0;
            margin-right: 0;
            color: #6a737d;
            margin-bottom: 1em;
            border-radius: 0 3px 3px 0;
          }
          blockquote p {
            margin-bottom: 0.5em;
          }
          blockquote p:last-child {
            margin-bottom: 0;
          }
          table {
            border-collapse: collapse;
            width: 100%;
            margin-bottom: 1em;
            border: 1px solid #dfe2e5;
            border-radius: 3px;
            overflow: hidden;
          }
          th, td {
            font-size: 14px !important;
            border: 1px solid #dfe2e5;
            padding: 10px 13px;
            text-align: left;
          }
          th {
            background-color: #f6f8fa;
            font-weight: 700;
            border-bottom: 2px solid #dfe2e5;
          }
          tr:nth-child(even) {
            background-color: #fafbfc;
          }
          tr:hover {
            background-color: #f1f3f5;
          }
          img {
            max-width: 100%;
            height: auto;
            margin: 1em 0;
          }
          a {
            color: #0066cc;
            text-decoration: none;
          }
          a:hover {
            text-decoration: underline;
          }
          hr {
            border: none;
            border-top: 2px solid #eaecef;
            margin: 2em 0;
            height: 0;
          }
          strong {
            font-weight: 700;
          }
          em {
            font-style: italic;
          }
          del {
            text-decoration: line-through;
            color: #6a737d;
          }
        </style>
      </head>
      <body>${htmlContent}</body>
      </html>
    `;

    // iframeを作成してHTMLを表示
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.left = '-9999px';
    iframe.style.top = '0';
    iframe.style.width = '800px';
    iframe.style.height = '10000px';
    document.body.appendChild(iframe);

    const blob = new Blob([html], { type: "text/html" });
    const blobUrl = URL.createObjectURL(blob);
    
    iframe.src = blobUrl;

    // iframeの読み込み
    await new Promise((resolve) => {
      iframe.onload = resolve;
    });

    // フォントの読み込み
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    // JSでスタイルを適用
    const doc = iframe.contentDocument;
    const bodyElement = doc.body;
    const htmlElement = doc.documentElement;
    
    htmlElement.style.fontSize = '14px';
    bodyElement.style.fontSize = '14px';
    bodyElement.style.fontFamily = '"Noto Sans JP", "Hiragino Kaku Gothic ProN", "Hiragino Sans", Meiryo, sans-serif';
    
    // テキスト要素にフォントサイズを適用
    const allElements = bodyElement.querySelectorAll('p, li, td, th, div, span, blockquote');
    allElements.forEach(el => {
      if (!el.matches('h1, h2, h3, h4, h5, h6') && !el.closest('h1, h2, h3, h4, h5, h6')) {
        if (!el.style.fontSize) {
          el.style.fontSize = '14px';
        }
      }
    });
    
    // 表のスタイルを適用
    const tables = bodyElement.querySelectorAll('table');
    tables.forEach(table => {
      table.style.borderCollapse = 'collapse';
      table.style.width = '100%';
      table.style.marginBottom = '1em';
      table.style.border = '1px solid #dfe2e5';
      table.style.borderRadius = '3px';
      table.style.overflow = 'hidden';
    });
    
    // 表のセルにスタイルを適用
    const tableCells = bodyElement.querySelectorAll('th, td');
    tableCells.forEach(cell => {
      cell.style.fontSize = '14px';
      cell.style.border = '1px solid #dfe2e5';
      cell.style.padding = '10px 13px';
      cell.style.textAlign = 'left';
    });
    
    // 表の見出し行にスタイルを適用
    const tableHeaders = bodyElement.querySelectorAll('th');
    tableHeaders.forEach(th => {
      th.style.backgroundColor = '#f6f8fa';
      th.style.fontWeight = '700';
      th.style.borderBottom = '2px solid #dfe2e5';
    });
    
    // 表の偶数行に背景色を適用
    tables.forEach(table => {
      const rows = table.querySelectorAll('tr');
      rows.forEach((row, index) => {
        if (index % 2 === 1) {
          row.style.backgroundColor = '#fafbfc';
        }
      });
    });
    
    // 引用にスタイルを適用
    const blockquotes = bodyElement.querySelectorAll('blockquote');
    blockquotes.forEach(blockquote => {
      blockquote.style.fontSize = '14px';
      blockquote.style.borderLeft = '4px solid #dfe2e5';
      blockquote.style.backgroundColor = '#f6f8fa';
      blockquote.style.padding = '0 16px';
      blockquote.style.marginLeft = '0';
      blockquote.style.marginRight = '0';
      blockquote.style.color = '#6a737d';
      blockquote.style.marginBottom = '1em';
      blockquote.style.borderRadius = '0 3px 3px 0';
    });
    
    // コードブロックにスタイルを適用
    const codeBlocks = bodyElement.querySelectorAll('pre');
    codeBlocks.forEach(pre => {
      pre.style.backgroundColor = '#f6f8fa';
      pre.style.padding = '16px';
      pre.style.borderRadius = '6px';
      pre.style.overflowX = 'auto';
      pre.style.marginBottom = '1em';
      pre.style.border = '1px solid #e1e4e8';
      pre.style.borderLeft = '4px solid #0366d6';
    });
    
    // インラインコードにスタイルを適用
    const inlineCodes = bodyElement.querySelectorAll('code:not(pre code)');
    inlineCodes.forEach(code => {
      code.style.fontFamily = '"Courier New", "Monaco", "Consolas", monospace';
      code.style.backgroundColor = '#f6f8fa';
      code.style.padding = '2px 6px';
      code.style.borderRadius = '3px';
      code.style.fontSize = '0.9em';
      code.style.border = '1px solid #e1e4e8';
      code.style.color = '#e83e8c';
    });
    
    // pre内のcodeは別
    const preCodes = bodyElement.querySelectorAll('pre code');
    preCodes.forEach(code => {
      code.style.backgroundColor = 'transparent';
      code.style.padding = '0';
      code.style.border = 'none';
      code.style.color = '#24292e';
      code.style.fontSize = '0.9em';
    });
    
    // 水平線にスタイルを適用
    const horizontalRules = bodyElement.querySelectorAll('hr');
    horizontalRules.forEach(hr => {
      hr.style.border = 'none';
      hr.style.borderTop = '2px solid #eaecef';
      hr.style.margin = '2em 0';
      hr.style.height = '0';
    });
    
    // html2pdf.jsでPDF化
    const element = bodyElement;
    
    const opt = {
      margin: [5, 5, 5, 5],
      filename: `${noteid || 'document'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: 800,
      },
      jsPDF: { 
        unit: 'mm', 
        format: 'a4', 
        orientation: 'portrait',
        compress: true,
      },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };

    await html2pdf().set(opt).from(element).save();

    setTimeout(() => {
      document.body.removeChild(iframe);
      URL.revokeObjectURL(blobUrl);
    }, 1000);

  } catch (error) {
    console.error('error:', error);
    alert('PDF変換に失敗: ' + error.message);
  }
});