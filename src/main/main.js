import { app, BrowserWindow, dialog, ipcMain } from "electron";
import path from "path";
import { fileURLToPath } from "url";
import { scanFiles } from "../services/fileScanner.js";
import { exportDocx } from "../services/exportDocx.js";
import { exportHtml } from "../services/exportHtml.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function createWindow() {
  const win = new BrowserWindow({
    width: 1100,
    height: 750,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true
    }
  });

  win.loadFile(path.join(__dirname, "../renderer/index.html"));
}

app.whenReady().then(() => {
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

// IPC: выбор папки
ipcMain.handle("select-project-folder", async () => {
  const result = await dialog.showOpenDialog({ properties: ["openDirectory"] });
  if (result.canceled || result.filePaths.length === 0) return null;
  return result.filePaths[0];
});

// IPC: выбор файла для сохранения
ipcMain.handle("select-output-file", async (_, suggestedName) => {
  const result = await dialog.showSaveDialog({ defaultPath: suggestedName });
  return result.canceled ? null : result.filePath;
});

ipcMain.handle("scan-files", (_, projectPath) => {
  return scanFiles(projectPath);
});

ipcMain.handle("export-docx", async (_, { projectPath, files, out }) => {
  await exportDocx(projectPath, files, out);
  return true;
});

ipcMain.handle("export-html", async (_, { projectPath, files, out }) => {
  await exportHtml(projectPath, files, out);
  return true;
});