// preload.js
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  selectProjectFolder: () => ipcRenderer.invoke("select-project-folder"),
  selectOutputFile: (name) => ipcRenderer.invoke("select-output-file", name),
  scanFiles: (projectPath) => ipcRenderer.invoke("scan-files", projectPath),
  exportDocx: (projectPath, files, out) => ipcRenderer.invoke("export-docx", { projectPath, files, out }),
  exportHtml: (projectPath, files, out) => ipcRenderer.invoke("export-html", { projectPath, files, out })
});
