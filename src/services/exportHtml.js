import fs from "fs";
import path from "path";
import { readFileSafe, cleanText } from "./fileScanner.js";

export async function exportHtml(projectPath, selectedFiles, outputPath) {
  const parts = [];
  parts.push(`<!doctype html><html lang="ru"><head><meta charset="utf-8">
  <title>Project Export</title>
  <style>
    body { font-family: monospace; padding: 20px; color:#222; }
    h2 { margin-top: 24px; font-size: 16px; }
    pre { background: #f7f7f7; border: 1px solid #eee; padding: 12px; overflow: auto; }
  </style>
  </head><body><h1>Экспорт кода проекта</h1>`);

  for (const rel of selectedFiles) {
    const full = path.join(projectPath, rel);
    const content = readFileSafe(full);
    if (!content) continue;

    const safe = cleanText(content)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    parts.push(`<h2>${rel}</h2><pre>${safe}</pre>`);
  }

  parts.push(`</body></html>`);

  fs.writeFileSync(outputPath, parts.join(""), "utf8");
}
