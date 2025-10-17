const btnPickFolder = document.getElementById("btnPickFolder");
const projectPathEl = document.getElementById("projectPath");
const btnScan = document.getElementById("btnScan");
const fileList = document.getElementById("fileList");
const btnExport = document.getElementById("btnExport");
const statusEl = document.getElementById("status");
const selectAllBtn = document.getElementById("selectAll");
const clearSelectionBtn = document.getElementById("clearSelection");
const selectByFolderBtn = document.getElementById("selectByFolder");

let projectPath = null;
let files = [];
let selected = new Set();

function renderList() {
  fileList.innerHTML = "";
  files.forEach((relPath, idx) => {
    const li = document.createElement("li");
    const cb = document.createElement("input");
    cb.type = "checkbox";
    cb.checked = selected.has(relPath);
    cb.addEventListener("change", () => {
      if (cb.checked) selected.add(relPath);
      else selected.delete(relPath);
    });
    li.appendChild(cb);
    li.appendChild(document.createTextNode(" " + (idx + 1) + ". " + relPath));
    fileList.appendChild(li);
  });
}

btnPickFolder.addEventListener("click", async () => {
  projectPath = await window.api.selectProjectFolder();
  projectPathEl.textContent = projectPath || "";
  files = [];
  selected.clear();
  renderList();
});

btnScan.addEventListener("click", async () => {
  if (!projectPath) {
    statusEl.textContent = "Сначала выбери папку проекта.";
    return;
  }
  files = await window.api.scanFiles(projectPath);
  selected = new Set(files);
  renderList();
});

btnExport.addEventListener("click", async () => {
  const chosen = Array.from(selected);
  const format = document.querySelector("input[name='format']:checked").value;
  const suggested = `project_code.${format}`;
  const outputPath = await window.api.selectOutputFile(suggested);
  if (!outputPath) return;

  if (format === "docx") {
    await window.api.exportDocx(projectPath, chosen, outputPath);
  } else {
    await window.api.exportHtml(projectPath, chosen, outputPath);
  }
  statusEl.textContent = `Готово: ${outputPath}`;
});

selectAllBtn.addEventListener("click", () => {
  selected = new Set(files);
  renderList();
});

clearSelectionBtn.addEventListener("click", () => {
  selected.clear();
  renderList();
});

selectByFolderBtn.addEventListener("click", () => {
  if (files.length === 0) {
    statusEl.textContent = "Нет файлов для выбора.";
    return;
  }

  // собираем список папок
  const folders = Array.from(
    new Set(files.map(f => f.split(path.sep)[0]))
  );

  // простое окно выбора папки
  const folder = prompt("Введите имя папки для выбора:\n" + folders.join("\n"));
  if (!folder) return;

  const matched = files.filter(f => f.startsWith(folder + path.sep) || f === folder);
  matched.forEach(f => selected.add(f));
  renderList();
});