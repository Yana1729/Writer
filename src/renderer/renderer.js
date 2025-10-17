const btnPickFolder = document.getElementById("btnPickFolder");
const projectPathEl = document.getElementById("projectPath");
const btnScan = document.getElementById("btnScan");
const fileList = document.getElementById("fileList");
const btnExport = document.getElementById("btnExport");
const statusEl = document.getElementById("status");

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
