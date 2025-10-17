import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("api", {
  selectProjectFolder: () => ipcRenderer.invoke("select-project-folder"),
  selectOutputFile: (name) => ipcRenderer.invoke("select-output-file", name)
});
