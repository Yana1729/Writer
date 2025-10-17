import fs from "fs";
import path from "path";
import { Document, Packer, Paragraph, TextRun } from "docx";
import { readFileSafe, cleanText } from "./fileScanner.js";

export async function exportDocx(projectPath, selectedFiles, outputPath) {
  const children = [];

  for (const rel of selectedFiles) {
    const full = path.join(projectPath, rel);
    const content = readFileSafe(full);
    if (!content) continue;

    // Заголовок с именем файла
    children.push(
      new Paragraph({
        children: [new TextRun({ text: rel + ":", bold: true })],
      })
    );

    // Содержимое файла построчно
    const lines = cleanText(content).split(/\r?\n/);
    lines.forEach((line) =>
      children.push(
        new Paragraph({
          children: [new TextRun({ text: line, font: "Consolas" })],
        })
      )
    );

    // Пустая строка-разделитель
    children.push(new Paragraph(""));
  }

  const doc = new Document({
    sections: [{ children }],
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(outputPath, buffer);
}
