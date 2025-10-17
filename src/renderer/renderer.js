const btnPickFolder = document.getElementById("btnPickFolder");
const projectPathEl = document.getElementById("projectPath");
const btnScan = document.getElementById("btnScan");
const btnExport = document.getElementById("btnExport");
const statusEl = document.getElementById("status");
const selectAllBtn = document.getElementById("selectAll");
const clearSelectionBtn = document.getElementById("clearSelection");
const folderTreeEl = document.getElementById("folderTree");

let projectPath = null;
let files = [];
let selected = new Set();

// Подсветка выбранных элементов
function highlightSelection() {
  const lis = folderTreeEl.querySelectorAll("li");
  lis.forEach(li => {
    const fullPath = li.dataset.fullPath;
    if (selected.has(fullPath)) li.classList.add("selected");
    else li.classList.remove("selected");
  });
}

// Построение дерева из списка файлов
function buildTree(paths) {
  const root = {};
  for (const file of paths) {
    const parts = file.split("/");
    let node = root;
    for (const part of parts) {
      if (!node[part]) node[part] = {};
      node = node[part];
    }
  }
  return root;
}

function renderTree(node, basePath = "") {
  const ul = document.createElement("ul");
  for (const key of Object.keys(node).sort()) {
    const li = document.createElement("li");
    li.textContent = key;
    li.style.cursor = "pointer";

    const fullPath = basePath ? `${basePath}/${key}` : key;
    li.dataset.fullPath = fullPath;

    const hasChildren = Object.keys(node[key]).length > 0;

    if (hasChildren) {
      // Папка — переключатель
      li.addEventListener("click", (e) => {
        e.stopPropagation();
        const prefix = fullPath + "/";
        const matched = files.filter(f => f.startsWith(prefix));

        if (selected.has(fullPath)) {
          // папка уже выбрана → снимаем выбор у папки и её файлов
          selected.delete(fullPath);
          matched.forEach(f => selected.delete(f));
        } else {
          // папка не выбрана → добавляем папку и все её файлы
          selected.add(fullPath);
          matched.forEach(f => selected.add(f));
        }

        highlightSelection();
      });

      li.appendChild(renderTree(node[key], fullPath));
    } else {
      // Файл — переключатель
      li.addEventListener("click", (e) => {
        e.stopPropagation();
        if (selected.has(fullPath)) {
          selected.delete(fullPath);
        } else {
          selected.add(fullPath);
        }
        highlightSelection();
      });
    }

    ul.appendChild(li);
  }
  return ul;
}

function renderFolderTree() {
  const tree = buildTree(files);
  folderTreeEl.innerHTML = "";
  folderTreeEl.appendChild(renderTree(tree));
  highlightSelection();
}

// --- Кнопки управления ---

btnPickFolder.addEventListener("click", async () => {
  projectPath = await window.api.selectProjectFolder();
  projectPathEl.textContent = projectPath || "";
  files = [];
  selected.clear();
  folderTreeEl.innerHTML = "";
});

btnScan.addEventListener("click", async () => {
  if (!projectPath) {
    statusEl.textContent = "Сначала выбери папку проекта.";
    return;
  }
  const raw = await window.api.scanFiles(projectPath);
  // Нормализуем в формат с прямым слэшем
  files = raw.map(f => f.replace(/\\/g, "/"));
  selected.clear();
  renderFolderTree();
});


btnExport.addEventListener("click", async () => {
  if (!projectPath) {
    statusEl.textContent = "Нет папки проекта.";
    return;
  }

  // Нормализуем набор выбранного до файлов:
  const selectedList = Array.from(selected);
  const selectedFiles = new Set();

  // 3.1. Явно выбранные файлы
  selectedList.forEach(item => {
    if (files.includes(item)) selectedFiles.add(item);
  });

  // 3.2. Файлы из выбранных папок
  selectedList.forEach(item => {
    // если это не файл, трактуем как папку
    if (!files.includes(item)) {
      const prefix = item.replace(/\\/g, "/") + "/";
      files.forEach(f => {
        if (f.startsWith(prefix)) selectedFiles.add(f);
      });
    }
  });

  const chosen = Array.from(selectedFiles);
  if (chosen.length === 0) {
    statusEl.textContent = "Не выбрано файлов.";
    return;
  }

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
  highlightSelection();
});

clearSelectionBtn.addEventListener("click", () => {
  selected.clear();
  highlightSelection();
});
