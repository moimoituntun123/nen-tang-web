// js/admin.js (phiên bản dùng biến `account` trực tiếp)

// Helper
const $ = id => document.getElementById(id);
const q = sel => document.querySelector(sel);

// Lấy session hiện tại (chỉ đọc key sign_in như bạn yêu cầu)
const account = JSON.parse(localStorage.getItem('sign_in'));

// Nếu bạn vẫn muốn hỗ trợ cả 2 key (sign-in và sign_in) 
// bạn có thể thay 1 dòng trên bằng code đọc cả hai. 
// Ở đây mình dùng "sign_in" theo yêu cầu.

// Lấy danh sách accounts: admin mặc định + users
function getAllAccounts() {
  const list = [];
  const adminDefault = JSON.parse(localStorage.getItem('admin'));
  if (adminDefault) {
    list.push({ email: adminDefault.email, role: adminDefault.role || 'admin', isDefaultAdmin: true });
  }
  const users = JSON.parse(localStorage.getItem('users')) || [];
  users.forEach(u => {
    list.push({ email: u.email, role: u.role || 'user', isDefaultAdmin: false });
  });
  return list;
}

// Xóa user (chỉ xóa users list, không xóa admin mặc định)
function deleteUserByEmail(email) {
  const users = JSON.parse(localStorage.getItem('users')) || [];
  const filtered = users.filter(u => u.email !== email);
  localStorage.setItem('users', JSON.stringify(filtered));
}

// Render table
function renderAccountsTable() {
  const tbody = q('#accountsTable tbody');
  if (!tbody) return;
  tbody.innerHTML = '';

  // dùng trực tiếp biến account làm current
  const current = account;
  const accounts = getAllAccounts();

  if (accounts.length === 0) {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td colspan="4" style="padding:12px;color:#666">Chưa có tài khoản nào</td>`;
    tbody.appendChild(tr);
    return;
  }

  accounts.forEach((acc, idx) => {
    const tr = document.createElement('tr');

    // STT
    const tdIndex = document.createElement('td');
    tdIndex.textContent = idx + 1;
    tr.appendChild(tdIndex);

    // Email
    const tdEmail = document.createElement('td');
    tdEmail.textContent = acc.email;
    tr.appendChild(tdEmail);

    // Role
    const tdRole = document.createElement('td');
    tdRole.innerHTML = `<span class="${acc.role === 'admin' ? 'role-admin' : 'role-user'}">${acc.role.toUpperCase()}</span>`;
    tr.appendChild(tdRole);

    // Actions
    const tdAction = document.createElement('td');

    const delBtn = document.createElement('button');
    delBtn.className = 'action-btn delete';
    delBtn.textContent = 'Xóa';

    const isDefaultAdmin = !!acc.isDefaultAdmin;
    const isCurrentUser = current && acc.email === current.email;

    if (isDefaultAdmin || isCurrentUser) {
      delBtn.disabled = true;
      delBtn.title = isDefaultAdmin ? 'Không thể xóa admin mặc định' : 'Không thể tự xóa tài khoản đang đăng nhập';
    } else {
      delBtn.addEventListener('click', () => {
        if (!confirm(`Xác nhận xóa tài khoản: ${acc.email} ? Thao tác không thể hoàn tác.`)) return;
        deleteUserByEmail(acc.email);
        renderAccountsTable();
        alert(`Đã xóa tài khoản ${acc.email}`);
      });
    }

    tdAction.appendChild(delBtn);
    tr.appendChild(tdAction);
    tbody.appendChild(tr);
  });
}

// Init page
document.addEventListener('DOMContentLoaded', () => {
  const log_out = $('btn_log_out');
  if (log_out) {
    log_out.addEventListener('click', () => {
      localStorage.removeItem('sign_in');
      window.location.href = '/html/sign-in.html';
    });
  }
  const adminInfo = $('adminInfo');

  if (!account || account.role !== 'admin') {
    if (adminInfo) adminInfo.textContent = 'Bạn chưa đăng nhập bằng tài khoản admin hoặc không có quyền. Vui lòng đăng nhập bằng admin để quản lý tài khoản.';
    const table = $('accountsTable');
    if (table) table.style.display = 'none';
    return;
  } else {
    if (adminInfo) adminInfo.textContent = `Đang đăng nhập: ${account.email} (ADMIN)`;
  }
  

  // render danh sách
  renderAccountsTable();

  const backBtn = $('backBtn');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      window.location.href = '/html/trangchu.html';
    });
  }

});
