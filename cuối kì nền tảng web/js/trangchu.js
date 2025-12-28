// theme
const mode = document.getElementById("mode");
if (mode){
    mode.addEventListener("change", () => {
        if (mode.value === "dark"){
            document.body.classList.add("dark");
        }
        else {
            document.body.classList.remove("dark");
        }
        localStorage.setItem("theme", mode.value);
    });
}
document.addEventListener("DOMContentLoaded", () => {
    const t = localStorage.getItem("theme") || "light";
    if(mode){
        mode.value = t;         
    }
    if (t === "dark") {
        document.body.classList.add("dark");
    }
});

const dalogin = document.getElementById("dalogin");
const tenUser = document.getElementById("tenuser");
const dangXuat = document.getElementById("dangxuat");
const quanLyTaiKhoan = document.getElementById("qltk");

let account = JSON.parse(localStorage.getItem("sign_in"));
function ensureLoggedIn() {
    if (!account) {
        alert("Vui lòng đăng nhập để truy cập trang này!");
        window.location.href = "/html/sign-in.html";
        throw new Error("Chưa đăng nhập");
    }
}
ensureLoggedIn();
function hienThongTinUser() {
    if (!account) return;
    dalogin.style.display = "flex";
    tenUser.textContent = `${account.email} (${account.role.toUpperCase()})`;
    if (account.role === "admin") {
        quanLyTaiKhoan.style.display = "block";
    }
}
if (dangXuat) {
    dangXuat.addEventListener("click", () => {
        localStorage.removeItem("sign_in");
        window.location.href = "/html/sign-in.html";
    });
}
hienThongTinUser();
// filesystem
// cây thư mục ban đầu
const CAY_BAN_DAU = {
    id: "root",
    name: "root",
    type: "folder",
    children: []
};

let filesystem;
let currentFolder;
let selectedNode = null;
let nodeDangChuotPhai = null;
let tuKhoaTimKiem = "";
function getFSKey() {
    return account?.email ? "filesystem_" + account.email : null;
}

function loadFS() {
    const key = getFSKey();
    if (!key) return structuredClone(CAY_BAN_DAU);
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : structuredClone(CAY_BAN_DAU);
    } catch {
        return structuredClone(CAY_BAN_DAU);
    }
}

function luuFS() {
    const key = getFSKey();
    if (key) {
        localStorage.setItem(key, JSON.stringify(filesystem));
    }
}
filesystem = loadFS();
currentFolder = filesystem;


// tạo file/folder
function renderTree() {
    const container = document.getElementById("dsFile");
    if (!container) return;
    container.innerHTML = "";
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

    function walk(node, depth) {
        if (!node.children) return;
        for (let i = 0; i < node.children.length; i++) {
            const child = node.children[i];
            // tìm kiếm
            let coConKhop = false;
            if (child.type === "folder") {
                for (let j = 0; j < child.children.length; j++) {
                    if (tenKhop(child.children[j])) {
                        coConKhop = true;
                        break;
                    }
                }
            }
            if (!tenKhop(child) && !coConKhop) continue;

            const item = document.createElement("div");
            item.textContent = (child.type === "folder" ? "📁 " : "📄 ") + child.name;
            item.style.paddingLeft = (12 + depth * 12) + "px";
            item.addEventListener("click", () => {
                if (child.type === "folder") {
                    currentFolder = child;
                    showFolderContent(child);
                }
            });

            item.addEventListener("dblclick", () => {
                if (child.type === "file") moFile(child);
            });

            item.addEventListener("contextmenu", (e) => {
                e.preventDefault();
                nodeDangChuotPhai = child;
                hienContextMenu(e.pageX, e.pageY);
            });

            container.appendChild(item);
            if (child.type === "folder") {
                walk(child, depth + 1);
            }
        }
    }
    walk(filesystem, 0);
}
renderTree();
// hiển thị folder/file
function showFolderContent(folder){
    const area = document.getElementById("filesArea");
    if (!area){
        return;
    }
    area.innerHTML = "";
    selectedNode = null;

    if (!folder.children || folder.children.length === 0){
        area.textContent = "Thư mục trống";
        return;
    }
    for (let i = 0; i < folder.children.length; i++){
        const child = folder.children[i];
        const line = document.createElement("div");
        line.addEventListener("contextmenu", (e) => {
            e.preventDefault();
            nodeDangChuotPhai = child;
            hienContextMenu(e.pageX, e.pageY);
        });
        if (child.type === "folder"){
            line.textContent = "📁 " + child.name;
        }
        else {
            line.textContent = "📄 " + child.name;
        }
        line.style.cursor = "pointer";
        line.style.padding = "4px";

        line.addEventListener("click", () => {
            const allLines = area.children;
            for (let j = 0; j < allLines.length; j++){
                allLines[j].style.background = "";
            }
            line.style.background = "#d0ebff";
            selectedNode = child;
            console.log("Đã chọn:", child.name);
        });
        // thêm sk doubleclick
        line.addEventListener("dblclick", () => {
            if (child.type === "file"){
                moFile(child);
            }
        });
        area.appendChild(line);
    }
}
// mo file
function moFile(file){
    selectedNode = file;
    const modal = document.getElementById("modalBackdrop");
    const tieuDe = document.getElementById("modalTitle");
    const oNhap = document.getElementById("fileContent");

    if (!modal || !oNhap){
        return;
    }
    tieuDe.textContent = "Chỉnh sửa: " + file.name;
    if (file.content){
        oNhap.value = file.content;
    }
    else {
        oNhap.value = "";
    }
    modal.style.display = "flex";
    modal.setAttribute("aria-hidden", "false");
    console.log("Đang mở file:", file.name);
}
// đóng file
const nutDong = document.getElementById("modalClose");
if (nutDong){
    nutDong.addEventListener("click", () => {
        const modal = document.getElementById("modalBackdrop");
        if (modal){
            modal.style.display = "none";
            modal.setAttribute("aria-hidden", "true");
        }
    });
}
// lưu nội dung file
const nutLuu = document.getElementById("saveContent");
if (nutLuu){
    nutLuu.addEventListener("click", () => {
        if (!selectedNode || selectedNode.type !== "file"){
            alert("Không có file nào được chọn");
            return;
        }
        const oNhap = document.getElementById("fileContent");
        selectedNode.content = oNhap.value;
        luuFS();

        const modal = document.getElementById("modalBackdrop");
        modal.style.display = "none";
        modal.setAttribute("aria-hidden", "true");

        alert("Đã lưu file");
        console.log("Đã lưu:", selectedNode.name);
    });
}
// hiện contextmenu
function hienContextMenu(x, y) {
    const menu = document.getElementById("contextMenu");
    if (!menu) return;
    menu.style.display = "block";
    menu.style.left = x + "px";
    menu.style.top = y + "px";
    menu.setAttribute("aria-hidden", "false");
}
// ẩn contextmenu
document.addEventListener("click", () => {
    const menu = document.getElementById("contextMenu");
    if (menu) {
        menu.style.display = "none";
        menu.setAttribute("aria-hidden", "true");
    }
});

function taoId(){
    return "id_" + Date.now();
}
function taoThuMucMoi(){
    if (!currentFolder){
        alert("Không xác định được thư mục hiện tại");
        return;
    }

    const ten = prompt("Nhập tên thư mục mới:");
    if (ten === null){
        return; // bấm Cancel
    }
    const tenThuMuc = ten.trim();
    if (tenThuMuc === ""){
        alert("Tên thư mục không được để trống");
        return;
    }
    for (let i = 0; i < currentFolder.children.length; i++){
        if (currentFolder.children[i].name === tenThuMuc){
            alert("Tên thư mục đã tồn tại");
            return;
        }
    }
    const thuMucMoi = {
        id: taoId(),
        name: tenThuMuc,
        type: "folder",
        children: []
    };
    currentFolder.children.push(thuMucMoi);
    luuFS();
    renderTree();
    showFolderContent(currentFolder);
    console.log("Đã tạo thư mục:", tenThuMuc);
}

const nutThuMucMoi = document.getElementById("newfolder");
if (nutThuMucMoi){
    nutThuMucMoi.addEventListener("click", () => {
        taoThuMucMoi();
    });
}
function taoFileMoi(){
    if (!currentFolder || currentFolder.type !== "folder"){
        alert("Vui lòng chọn một thư mục");
        return;
    }

    const ten = prompt("Nhập tên file mới:");
    if (ten === null){
        return; // bấm Cancel
    }

    const tenFile = ten.trim();
    if (tenFile === ""){
        alert("Tên file không được để trống");
        return;
    }

    for (let i = 0; i < currentFolder.children.length; i++){
        if (currentFolder.children[i].name === tenFile){
            alert("Tên file đã tồn tại");
            return;
        }
    }
    const fileMoi = {
        id: taoId(),
        name: tenFile,
        type: "file",
        content: ""
    };
    currentFolder.children.push(fileMoi);
    luuFS();
    renderTree();
    showFolderContent(currentFolder);

    console.log("Đã tạo file:", tenFile);
}
const nutFileMoi = document.getElementById("newfile");
if (nutFileMoi){
    nutFileMoi.addEventListener("click", () => {
        taoFileMoi();
    });
}
//contextmenu: xoá
function xoaNodeTrongCay(nodeCha) {
    if (!nodeCha.children) return false;

    for (let i = 0; i < nodeCha.children.length; i++) {
        if (nodeCha.children[i].id === nodeDangChuotPhai.id) {
            nodeCha.children.splice(i, 1);
            return true;
        }

        if (nodeCha.children[i].type === "folder") {
            const daXoa = xoaNodeTrongCay(nodeCha.children[i]);
            if (daXoa) return true;
        }
    }
    return false;
}
const nutXoa = document.getElementById("deleteOption");
if (nutXoa) {
    nutXoa.addEventListener("click", () => {
        if (!nodeDangChuotPhai) return;

        if (!confirm("Bạn có chắc muốn xóa?")) return;

        xoaNodeTrongCay(filesystem);

        nodeDangChuotPhai = null;
        luuFS();
        renderTree();
        showFolderContent(currentFolder);
    });
}
//contextmenu: đổi tên
const nutDoiTen = document.getElementById("renameOption");

if (nutDoiTen) {
    nutDoiTen.addEventListener("click", () => {
        if (!nodeDangChuotPhai) return;

        const tenMoi = prompt("Nhập tên mới:", nodeDangChuotPhai.name);
        if (tenMoi === null) return;

        const tenMoiTrim = tenMoi.trim();
        if (tenMoiTrim === "") {
            alert("Tên không hợp lệ");
            return;
        }

        nodeDangChuotPhai.name = tenMoiTrim;

        nodeDangChuotPhai = null;
        luuFS();
        renderTree();
        showFolderContent(currentFolder);
    });
}
//contextmenu: mở file
const nutMo = document.getElementById("openOption");
if (nutMo) {
    nutMo.addEventListener("click", () => {
        if (!nodeDangChuotPhai) return;

        if (nodeDangChuotPhai.type === "folder") {
            currentFolder = nodeDangChuotPhai;
            showFolderContent(currentFolder);
        } else {
            moFile(nodeDangChuotPhai);
        }
        nodeDangChuotPhai = null;
    });
}
// tìm kiếm
function tenKhop(node) {    
    if (tuKhoaTimKiem === "") return true;
    return node.name.toLowerCase().includes(tuKhoaTimKiem);
}
const oTimKiem = document.getElementById("globalSearch");
if (oTimKiem) {
    oTimKiem.addEventListener("input", () => {
        tuKhoaTimKiem = oTimKiem.value.trim().toLowerCase();
        renderTree();
    });
}
