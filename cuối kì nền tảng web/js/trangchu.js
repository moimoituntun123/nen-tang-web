// helpers
const el = id => document.getElementById(id);
const q = s => document.querySelector(s);
const generateId = () => 'id_' + Math.random().toString(36).slice(2,9);

// theme
const mode = el('mode');
if (mode) {
  mode.addEventListener('change', () => {
    if (mode.value === 'dark') document.body.classList.add('dark');
    else document.body.classList.remove('dark');
    localStorage.setItem('theme', mode.value);
  });
}
document.addEventListener('DOMContentLoaded', () => {
  const t = localStorage.getItem('theme') || 'light';
  if (mode) mode.value = t;
  if (t === 'dark') document.body.classList.add('dark');
});

const dalogin = el('dalogin');
const tenUser = el('tenuser');
const dangXuat = el('dangxuat');
const quanLyTaiKhoan = el('qltk');
if (dangXuat) dangXuat.addEventListener('click', () => { 
  localStorage.removeItem('sign_in');
  window.location.href = '/html/sign-in.html';

});

// đọc phiên login từ localStorage
let account = JSON.parse(localStorage.getItem('sign_in'));

function ensureLoggedIn() {
  if (!account) {
    alert('Vui lòng đăng nhập để truy cập trang này!');
    window.location.href = '/html/sign-in.html';
    throw new Error('No active session. Redirecting to sign-in.');
  }
  return true;
}
ensureLoggedIn();

if (account) {
  if (dalogin) dalogin.style.display = 'flex';
  if (tenUser) tenUser.textContent = account.email + ' (' + account.role.toUpperCase() + ')';
  if (account.role === 'admin' && quanLyTaiKhoan) { quanLyTaiKhoan.style.display = 'block'; }
} else {
  if (dalogin) dalogin.style.display = 'none';
}

// filesystem default
const CAY_BAN_DAU = {
  id: 'root',
  name: 'root',
  type: 'folder',
  children: []
};

function getFSKey() { return account && account.email ? 'filesystem_' + account.email : null; }
function layFS() {
  const key = getFSKey();
  if (!key) return structuredClone(CAY_BAN_DAU);
  const s = localStorage.getItem(key);
  try { return s ? JSON.parse(s) : structuredClone(CAY_BAN_DAU); }
  catch (e) { console.error(e); return structuredClone(CAY_BAN_DAU); }
}
function luuFS() { const key = getFSKey(); if (!key) return; localStorage.setItem(key, JSON.stringify(filesystem)); }

let filesystem = layFS();
let currentFolder = filesystem;
let selectedNode = null;

function findNodeById(id, node = filesystem) {
  if (node.id === id) return node;
  if (node.children) for (const c of node.children) {
    const f = findNodeById(id, c);
    if (f) return f;
  }
  return null;
}

function renderTree() {
  const container = el('dsFile');
  if (!container) return;
  container.innerHTML = '';

  // Tạo label root (click được)
  const rootEl = document.createElement('div');
  rootEl.className = 'root-label';
  rootEl.style.padding = '6px 10px';
  rootEl.textContent = 'Root';
  rootEl.addEventListener('click', (ev) => {
    ev.stopPropagation();
    // về root
    currentFolder = filesystem;
    // highlight: remove active class then add to root label
    document.querySelectorAll('.node-item').forEach(n => n.classList.remove('active'));
    // xử lý active cho root label
    document.querySelectorAll('#dsFile .root-label').forEach(r => r.classList.remove('active'));
    rootEl.classList.add('active');
    showFolderContent(filesystem);
  });
  container.appendChild(rootEl);

  function walk(node, depth = 0) {
    if (!node.children) return;
    node.children.forEach(child => {
      const item = document.createElement('div');
      item.className = 'node-item';
      item.style.paddingLeft = (12 + depth * 12) + 'px';
      item.dataset.id = child.id;
      item.innerHTML = `${child.type === 'folder' ? '📁' : '📄'} <span style="margin-left:6px">${child.name}</span>`;

      item.addEventListener('click', (ev) => {
        ev.stopPropagation();
        // remove active from others
        document.querySelectorAll('.node-item').forEach(n => n.classList.remove('active'));
        document.querySelectorAll('#dsFile .root-label').forEach(r => r.classList.remove('active'));
        item.classList.add('active');

        if (child.type === 'folder') {
          currentFolder = child;
          showFolderContent(child);
        } else openFile(child);
      });

      item.addEventListener('contextmenu', (ev) => {
        ev.preventDefault();
        ev.stopPropagation();
        showContextMenu(ev.pageX, ev.pageY, child);
      });

      container.appendChild(item);
      if (child.type === 'folder') walk(child, depth + 1);
    });
  }

  walk(filesystem, 0);
}


function showFolderContent(folder) {
  if (!folder) return;
  currentFolder = folder;
  if (el('panelTitle')) el('panelTitle').textContent = 'Thư mục: ' + folder.name;
  const area = el('filesArea');
  if (!area) return;
  area.innerHTML = '';
  if (!folder.children || !folder.children.length) {
    area.innerHTML = '<div class="muted">(Không có file hoặc thư mục con)</div>';
    return;
  }

  folder.children.forEach(child => {
    const card = document.createElement('div');
    card.className = 'file-card';

    const meta = document.createElement('div');
    meta.className = 'meta';
    const left = document.createElement('div');
    left.innerHTML = `${child.type === 'folder' ? '📁' : '📄'} <div class="name">${child.name}</div>`;
    const right = document.createElement('div');
    right.innerHTML = `<small>${child.type}</small>`;
    meta.appendChild(left); meta.appendChild(right);
    card.appendChild(meta);

    const actions = document.createElement('div');
    actions.style.display = 'flex';
    actions.style.gap = '8px';

    const openBtn = document.createElement('button'); openBtn.className = 'ghost'; openBtn.textContent = 'Mở';
    openBtn.onclick = () => { if (child.type === 'folder') { currentFolder = child; renderTree(); showFolderContent(child); } else openFile(child); };

    const delBtn = document.createElement('button'); delBtn.className = 'ghost'; delBtn.textContent = 'Xóa';
    delBtn.onclick = () => { if (confirm('Xóa ' + child.name + '?')) deleteNode(child.id); };

    // append buttons to actions and card
    actions.appendChild(openBtn);
    actions.appendChild(delBtn);
    card.appendChild(actions);
    area.appendChild(card);
  });
}

function openFile(node) {
  selectedNode = node;
  const modalTitle = el('modalTitle');
  if (modalTitle) modalTitle.textContent = node.name;
  const fileContent = el('fileContent');
  if (fileContent) fileContent.value = node.content || '';
  const modal = el('modalBackdrop');
  if (modal) modal.style.display = 'flex';
}

// context menu
const context = el('contextMenu');
function showContextMenu(x, y, node) {
  selectedNode = node;
  if (!context) return;
  context.style.left = Math.min(x, window.innerWidth - 200) + 'px';
  context.style.top = Math.min(y, window.innerHeight - 140) + 'px';
  context.style.display = 'block';
  context.setAttribute('aria-hidden', 'false');
}
document.addEventListener('click', (e) => { if (context && !context.contains(e.target)) { context.style.display = 'none'; context.setAttribute('aria-hidden', 'true'); } });

if (el('openOption')) {
  el('openOption').addEventListener('click', () => {
    if (selectedNode) {
      if (selectedNode.type === 'folder') { currentFolder = selectedNode; renderTree(); showFolderContent(selectedNode); }
      else openFile(selectedNode);
    }
    if (context) context.style.display = 'none';
  });
}
if (el('renameOption')) {
  el('renameOption').addEventListener('click', () => {
    if (!selectedNode) return;
    const n = prompt('Tên mới:', selectedNode.name);
    if (n && n.trim()) { selectedNode.name = n.trim(); luuFS(); renderTree(); showFolderContent(currentFolder); }
    if (context) context.style.display = 'none';
  });
}
if (el('deleteOption')) {
  el('deleteOption').addEventListener('click', () => {
    if (!selectedNode) return;
    if (selectedNode.id === 'root') { alert('Không thể xóa root'); return; }
    if (confirm('Xóa ' + selectedNode.name + '?')) { deleteNode(selectedNode.id); }
    if (context) context.style.display = 'none';
  });
}

function deleteNode(id, parent = filesystem) {
  if (!parent.children) return false;
  for (let i = 0; i < parent.children.length; i++) {
    if (parent.children[i].id === id) {
      parent.children.splice(i, 1);
      luuFS();
      renderTree();
      showFolderContent(currentFolder);
      return true;
    }
    if (parent.children[i].type === 'folder') {
      const r = deleteNode(id, parent.children[i]);
      if (r) return true;
    }
  }
  return false;
}

// create
if (el('newfile')) {
  el('newfile').addEventListener('click', () => {
    if (!account) { alert('Đăng nhập để tạo'); return; }
    const name = prompt('Tên file:'); if (!name) return;
    if (currentFolder.type !== 'folder') { alert('Chọn thư mục để tạo'); return; }
    currentFolder.children = currentFolder.children || [];
    const item = { id: generateId(), name: name, type: 'file', content: '' };
    currentFolder.children.push(item); luuFS(); renderTree(); showFolderContent(currentFolder);
  });
}
if (el('newfolder')) {
  el('newfolder').addEventListener('click', () => {
    if (!account) { alert('Đăng nhập để tạo'); return; }
    const name = prompt('Tên thư mục:'); if (!name) return;
    if (currentFolder.type !== 'folder') { alert('Chọn thư mục để tạo'); return; }
    currentFolder.children = currentFolder.children || [];
    const item = { id: generateId(), name: name, type: 'folder', children: [] };
    currentFolder.children.push(item); luuFS(); renderTree(); showFolderContent(currentFolder);
  });
}

// modal save
if (el('modalClose')) el('modalClose').addEventListener('click', () => { const m = el('modalBackdrop'); if (m) m.style.display = 'none'; });
if (el('saveContent')) el('saveContent').addEventListener('click', () => {
  if (!selectedNode) { alert('Không có file'); return; }
  const fc = el('fileContent');
  selectedNode.content = fc ? fc.value : (selectedNode.content || '');
  luuFS();
  const m = el('modalBackdrop'); if (m) m.style.display = 'none';
  alert('Đã lưu');
});

// initial
renderTree(); showFolderContent(filesystem);

// thongke
function countFiles(node) {
  if (!node) return 0;
  if (node.type === "file") return 1;

  let total = 0;
  if (Array.isArray(node.children)) {
    for (const child of node.children) {
      total += countFiles(child);
    }
  }
  return total;
}


function countFolders(node) {
  if (!node) return 0;

  let total = 0;

  if (Array.isArray(node.children)) {
    for (const child of node.children) {
      if (child.type === "folder") {
        total += 1;                     
        total += countFolders(child);   
      }
    }
  }
  return total;
}

function getFsStats(root) {
  return {
    files: countFiles(root),
    folders: countFolders(root)
  };
}

if (q('#thongke')) {
  q('#thongke').addEventListener('click', () => {
    const stats = getFsStats(filesystem);

    alert(
      ` Thống kê hệ thống:
- Tổng FILE: ${stats.files}
- Tổng FOLDER: ${stats.folders}`
    );
  });
}

// search filter
if (el('globalSearch')) {
  el('globalSearch').addEventListener('input', (e) => {
    const qv = e.target.value.toLowerCase();
    if (!qv) { renderTree(); showFolderContent(filesystem); return; }
    const matches = [];
    function walk(n) { if (n.name && n.name.toLowerCase().includes(qv)) matches.push(n); if (n.children) n.children.forEach(ch => walk(ch)); }
    walk(filesystem);
    if (matches.length) {
      el('panelTitle').textContent = `Kết quả: ${matches.length}`;
      const area = el('filesArea'); area.innerHTML = '';
      matches.forEach(m => {
        const c = document.createElement('div'); c.className = 'file-card'; c.innerHTML = `<div class="name">${m.name}</div><small>${m.type}</small>`; area.appendChild(c);
      });
    } else {
      el('panelTitle').textContent = 'Không tìm thấy';
      el('filesArea').innerHTML = '<div class="muted">Không có kết quả</div>';
    }
  });
}

