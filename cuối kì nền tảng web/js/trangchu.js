// chế độ tối
let cheDo = document.getElementById("mode"); 

cheDo.addEventListener("change", function(){
    const selectedMode = this.value;
    if (selectedMode === "dark"){
        document.body.classList.add("dark");
        localStorage.setItem("theme", "dark");
    }
    else{
        document.body.classList.remove("dark");
        localStorage.setItem("theme", "light");
    }
});
document.addEventListener("DOMContentLoaded", () => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
        document.body.classList.add("dark");
        document.getElementById("mode").value = "dark";
    } else {
         document.getElementById("mode").value = "light";
    }
});

// quản lý tài khoản
let dangKy = document.getElementById("dangky");
let dangNhap = document.getElementById("dangnhap");
let dalogin = document.getElementById("dalogin");
let khach = document.getElementById("khach");
let tenUser = document.getElementById("tenuser");
let dangXuat = document.getElementById("dangxuat");
let quanLyTaiKhoan = document.getElementById("qltk");

dangKy.addEventListener("click", () => {
    window.location.href = "../html/sign-up.html";
});
dangNhap.addEventListener("click", () => {
    window.location.href = "../html/sign-in.html";
});

let adminlogin = JSON.parse(localStorage.getItem("sign-in")); 
let userlogin = JSON.parse(localStorage.getItem("sign_in")); 
let account = null;

if (adminlogin) {
    account = { ...adminlogin, role: 'admin' };
} else if (userlogin) {
    account = { ...userlogin, role: 'user' };
}

if (account) {
    dalogin.style.display = "flex";
    tenUser.innerText = account.email + " (" + account.role.toUpperCase() + ")";
    khach.style.display = "none";
    
    if (account.role === 'admin') {
        quanLyTaiKhoan.style.display = 'block'; 
        quanLyTaiKhoan.onclick = showAccountManagement;
    } else {
        quanLyTaiKhoan.style.display = 'none'; 
    }

} else {
    khach.style.display = "flex";
    dalogin.style.display = "none";
    quanLyTaiKhoan.style.display = 'none';
}

dangXuat.onclick = () => {
    localStorage.removeItem("sign-in");
    localStorage.removeItem("sign_in");
    window.location.reload();
};

// tạo file
const CAY_BAN_DAU = {
    id: "root",
    name: "root",
    type: "folder",
    children: [
        {id: Date.now(), name: "document", type: "folder", children: []},
        {id: Date.now(), name: "picture", type: "folder", children: []}
    ]};

function getFSKey() {
    if (account && account.email) {
        return `filesystem_${account.email}`;
    }
    return null; 
}

function layFS() {
    const fsKey = getFSKey();
    if (!fsKey) {
        return CAY_BAN_DAU;
    }
    let duLieu = localStorage.getItem(fsKey);
    if (!duLieu) {
        return CAY_BAN_DAU;
    }
    return JSON.parse(duLieu);
}

function luuFS() {
    const fsKey = getFSKey();
    if (fsKey) {
        localStorage.setItem(fsKey, JSON.stringify(filesystem));
    }
}

let filesystem = layFS();
let currentFolder = filesystem; 
function findNodeById(id, node = filesystem) {
    if (node.id === id) {
        return node;
    }
    if (node.type === 'folder' && node.children) {
        for (const child of node.children) {
            const found = findNodeById(id, child);
            if (found) {
                return found;
            }
        }
    }
    return null;
}

function renderNode(node, depth) {
    const isFolder = node.type === 'folder';
    const nodeElement = document.createElement('div');
    nodeElement.className = 'node-item';
    nodeElement.setAttribute('data-id', node.id);
    nodeElement.style.paddingLeft = `${depth * 15}px`;

    const icon = isFolder ? '📁' : '📄';
    nodeElement.innerHTML = `${icon} ${node.name}`;

    nodeElement.onclick = () => {
        if (isFolder) {
            currentFolder = node;
            document.querySelectorAll('.node-item').forEach(el => el.style.backgroundColor = 'transparent');
            nodeElement.style.backgroundColor = 'lightblue';
        } 
        // nhập nội dung file
        else {
            const oldContent = node.content || "";
            const newContent = prompt(`[${node.name}] - Nhập/Chỉnh sửa nội dung file:`, oldContent);
            
            if (newContent !== null) { 
                node.content = newContent;
                luuFS();
                alert(`[${node.name}] - Nội dung file đã được lưu thành công:\n\n${newContent}`);
            } else {
                alert(`[${node.name}] - Nội dung hiện tại (Chưa thay đổi):\n\n${oldContent}`);
            }
        }
    };
    // chuột phải
    nodeElement.oncontextmenu = (event) => {
        event.preventDefault();
        showContextMenu(event.pageX, event.pageY, node);
    };
    return nodeElement;
}

const contextMenu = document.getElementById("contextMenu");
let selectedNode = null;
// hiện menu chuột phải
function showContextMenu(x, y, node) {
    selectedNode = node;
    contextMenu.style.left = x + "px";
    contextMenu.style.top = y + "px";
    contextMenu.style.display = "block";
}

document.addEventListener("click", () => {
    contextMenu.style.display = "none";
});
// đổi tên
document.getElementById("renameOption").onclick = function () {
    if (!selectedNode) return;

    const newName = prompt("Nhập tên mới:", selectedNode.name);
    if (newName && newName.trim() !== "") {
        selectedNode.name = newName.trim();
        luuFS();
        renderTree();
    }

    contextMenu.style.display = "none";
};
// xoá tên
document.getElementById("deleteOption").onclick = function () {
    if (!selectedNode) return;

    if (selectedNode.id === "root") {
        alert("Không thể xóa thư mục gốc (root).");
        return;
    }

    if (!confirm(`Bạn có chắc muốn xóa "${selectedNode.name}"?`)) return;

    deleteNode(selectedNode.id);
    contextMenu.style.display = "none";
};

function deleteNode(id, parent = filesystem) {
    if (!parent.children) return;

    for (let i = 0; i < parent.children.length; i++) {
        if (parent.children[i].id === id) {
            parent.children.splice(i, 1);
            luuFS();
            renderTree();
            return;
        }
        if (parent.children[i].type === "folder") {
            deleteNode(id, parent.children[i]);
        }
    }
}


function renderTree() {
    const dsFileContainer = document.getElementById('dsFile');
    dsFileContainer.innerHTML = ''; 

    const treeWrapper = document.createElement('div');
    treeWrapper.className = 'treefile'; 

    const stack = [{ node: filesystem, depth: 0 }];

    while (stack.length > 0) {
        const currentItem = stack.pop(); 
        const node = currentItem.node;
        const depth = currentItem.depth;

        if (node.id !== 'root') {
            treeWrapper.appendChild(renderNode(node, depth));
        }
        
        if (node.type === 'folder' && node.children) {
            for (let i = node.children.length - 1; i >= 0; i--) {
                const child = node.children[i];
                stack.push({ node: child, depth: depth + 1 });
            }
        }   
    }
    dsFileContainer.appendChild(treeWrapper);
}

let newFileBtn = document.getElementById("newfile");
let newFolderBtn = document.getElementById("newfolder");

const generateId = () => 'id_' + Math.random().toString(36).substring(2, 9);

function createNewItem(type) {
    if (!account) {
        alert("Vui lòng đăng nhập để tạo file/folder.");
        return;
    }
    
    const name = prompt(`Nhập tên ${type}:`);
    if (!name) return;

    if (currentFolder.type !== 'folder') {
        alert("Không thể tạo trong file. Vui lòng chọn một thư mục.");
        return;
    }

    const newItem = {
        id: generateId(),
        name: name,
        type: type
    };

    if (type === 'folder') {
        newItem.children = [];
    }

    currentFolder.children.push(newItem);
    luuFS(); 
    renderTree(); 
    
    alert(`Đã tạo ${type}: ${name} trong ${currentFolder.name}`);
}

newFileBtn.addEventListener('click', () => createNewItem('file'));
newFolderBtn.addEventListener('click', () => createNewItem('folder'));


if (account) {
        renderTree();
        showFolderContent(filesystem); 
    }

//quyền quản lý tài khoản(admin)
function getAllAccounts() {
    let allAccounts = [];
    const admin = JSON.parse(localStorage.getItem("admin"));
    if (admin) {
        allAccounts.push({ 
            email: admin.email, 
            role: admin.role || 'admin',

        });
    }
    const users = JSON.parse(localStorage.getItem("users")) || [];
    users.forEach(user => {
        allAccounts.push({
            email: user.email, 
            role: user.role || 'user',

        });
    });
    return allAccounts; 
}
function deleteAccount(emailToDelete) {
    if (!account || account.role !== 'admin') {
        alert("Bạn không có quyền thực hiện thao tác này.");
        return;
    }
    if (emailToDelete === account.email) {
         alert("Không thể tự xóa tài khoản Admin đang đăng nhập.");
         return;
    }
    const adminDefault = JSON.parse(localStorage.getItem("admin"));
    if (adminDefault && emailToDelete === adminDefault.email) {
        alert("Không thể xóa tài khoản Admin mặc định.");
        return;
    }
    if (!confirm(`Xác nhận xóa tài khoản: ${emailToDelete}? Thao tác này không thể hoàn tác.`)) {
        return;
    }

    let users = JSON.parse(localStorage.getItem("users")) || [];
    const initialLength = users.length;

    users = users.filter(acc => acc.email !== emailToDelete);
    if (users.length < initialLength) {
        localStorage.setItem("users", JSON.stringify(users));
        alert(`Đã xóa thành công tài khoản User: ${emailToDelete}`);
        showAccountManagement(); 
    } else {
        alert(`Không tìm thấy tài khoản User ${emailToDelete} để xóa.`);
    }
}

function showAccountManagement() {
    if (!account || account.role !== 'admin') {
        document.querySelector('.benphai').innerHTML = `
            <div style="padding: 20px;">
                <h3>Truy Cập Bị Từ Chối</h3>
                <p>Bạn không có quyền quản lý tài khoản.</p>
            </div>
        `;
        return;
    }
    document.querySelectorAll('.node-item').forEach(el => el.style.backgroundColor = 'transparent');
    document.querySelectorAll('.quanly > div').forEach(el => el.style.backgroundColor = 'transparent');
    document.getElementById('qltk').style.backgroundColor = 'lightblue';

    const benPhai = document.querySelector('.benphai');
    const accounts = getAllAccounts(); 
    const adminDefault = JSON.parse(localStorage.getItem("admin"));


    let tableRows = accounts.map((acc, index) => {
        const isDefaultAdmin = adminDefault && acc.email === adminDefault.email;
        const isCurrentUser = account && acc.email === account.email;
        return `
            <tr>
                <td>${index + 1}</td>
                <td>${acc.email}</td>
                <td><span style="color: ${acc.role === 'admin' ? 'red' : 'green'}; font-weight: bold;">${acc.role.toUpperCase()}</span></td>
                <td>${acc.registeredAt || 'N/A'}</td>
                <td>
                    <button 
                        onclick="deleteAccount('${acc.email}')" 
                        ${isDefaultAdmin || isCurrentUser ? 'disabled' : ''} 
                        style="background-color: ${isDefaultAdmin || isCurrentUser ? 'gray' : '#f44336'}; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: ${isDefaultAdmin || isCurrentUser ? 'not-allowed' : 'pointer'};"
                    >
                        ${isDefaultAdmin ? 'Admin Mặc Định' : isCurrentUser ? 'Đang Đăng Nhập' : 'Xóa'}
                    </button>
                </td>
            </tr>
        `;
    }).join('');

    benPhai.innerHTML = `
        <div style="padding: 10px;">
            <h3> Quản Lý Tài Khoản</h3>
            <p style="margin-bottom: 20px; color: gray;">Tổng số tài khoản: ${accounts.length}</p>
            <table border="1" style="width: 100%; border-collapse: collapse; text-align: left; font-size: 14px;">
                <thead>
                    <tr style=>
                        <th style="padding: 8px;">STT</th>
                        <th style="padding: 8px;">Email</th>
                        <th style="padding: 8px;">Vai trò</th>
                        <th style="padding: 8px;">Ngày Đăng ký</th>
                        <th style="padding: 8px;">Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    ${tableRows}
                </tbody>
            </table>
        </div>
    `;
}

