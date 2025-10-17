import fs from "fs";
import path from "path";
import { Document, Packer, Paragraph, TextRun } from "docx";

function cleanText(text) {
    return text.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F]/g, "");
}

function listCodeFiles(projectPath, extensions = [".ts", ".js", ".md", ".env", ".sql", ".json", ".gitignore"]) {
    const excludeDirs = new Set([".vscode", "dist", "node_modules"]);
    let filesList = [];

    function walk(dir) {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                if (!excludeDirs.has(entry.name)) {
                    walk(fullPath);
                }
            } else {
                if (extensions.some(ext => entry.name.endsWith(ext))) {
                    filesList.push(path.relative(projectPath, fullPath));
                }
            }
        }
    }

    walk(projectPath);
    return filesList.sort();
}

async function copySelectedFilesToWord(projectPath, selectedFiles, outputFile = "project_code.docx") {
    const doc = new Document();
    const children = [];

    for (const relPath of selectedFiles) {
        const fullPath = path.join(projectPath, relPath);
        let content;
        try {
            content = fs.readFileSync(fullPath, "utf8");
        } catch (e) {
            console.error(`Не удалось прочитать файл ${fullPath}: ${e}`);
            continue;
        }

        content = cleanText(content);

        children.push(new Paragraph({ children: [new TextRun({ text: `${relPath}:`, bold: true })] }));
        children.push(new Paragraph(content));
        children.push(new Paragraph("")); // пустая строка
    }

    doc.addSection({ children });

    const buffer = await Packer.toBuffer(doc);
    fs.writeFileSync(outputFile, buffer);

    console.log(`Документ сохранен как ${outputFile}`);
}

// === Запуск ===
const projectPath = "C:/Users/yana2/Desktop/STP/STP"; // поменяй под себя
const allFiles = listCodeFiles(projectPath);

console.log("Найденные файлы:");
allFiles.forEach((f, i) => console.log(`${i + 1}. ${f}`));