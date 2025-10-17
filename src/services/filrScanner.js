import fs from "fs";
import path from "path";

export function cleanText(text) {
  return text.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F]/g, "");
}

export function scanFiles(projectPath, extensions = [".ts", ".js", ".json"], excludeDirs = new Set(["node_modules", "dist", ".vscode"])) {
  const result = [];
  function walk(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (!excludeDirs.has(entry.name)) walk(full);
      } else {
        if (extensions.some(ext => entry.name.endsWith(ext))) {
          result.push(path.relative(projectPath, full));
        }
      }
    }
  }
  walk(projectPath);
  return result.sort();
}

export function readFileSafe(fullPath) {
  try {
    return fs.readFileSync(fullPath, "utf8");
  } catch {
    try {
      return fs.readFileSync(fullPath, { encoding: "latin1" });
    } catch {
      return null;
    }
  }
}
