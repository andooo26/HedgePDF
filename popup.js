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

  // 原文表示
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>preview</title>
      <style>
        body {
          margin: 0;
          padding: 20px;
          font-family: monospace, "Noto Sans JP";
          background: #fafafa;
          white-space: pre-wrap;
          font-size: 14px;
        }
      </style>
    </head>
    <body>${escapeHTML(md)}</body>
    </html>
  `;

  // エスケープを埋め込むため
  function escapeHTML(str) {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  const blob = new Blob([html], { type: "text/html" });
  const newTab = URL.createObjectURL(blob);

  chrome.tabs.create({ url: newTab });
});