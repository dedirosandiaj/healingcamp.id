/**
 * Users CRUD Page
 */
const PageUsers = {
    async render() {
        Utils.loading();
        const res = await API.get('users.php?action=list');
        const items = res.success ? res.data : [];
        const el = document.getElementById('pageContent');

        el.innerHTML = `
            <div class="page-header">
                <h2 class="page-title">Users</h2>
                <a href="#/users-add" class="btn btn-primary"><i class="fas fa-plus"></i> Tambah</a>
            </div>
            <div class="card">
                ${items.length ? `
                <div class="table-responsive">
                    <table class="table">
                        <thead><tr>
                            <th>Username</th><th>Nama</th><th>Email</th><th>Role</th><th>Status</th><th>Last Login</th><th>Aksi</th>
                        </tr></thead>
                        <tbody>
                            ${items.map(i => `<tr>
                                <td><strong>${Utils.escapeHtml(i.username)}</strong></td>
                                <td>${Utils.escapeHtml(i.nama || '-')}</td>
                                <td>${Utils.escapeHtml(i.email || '-')}</td>
                                <td><span class="badge ${i.role === 'admin' ? 'badge-active' : 'badge-inactive'}">${i.role}</span></td>
                                <td>${Utils.statusBadge(i.status)}</td>
                                <td>${Utils.formatDateTime(i.last_login)}</td>
                                <td class="actions">
                                    <a href="#/users-edit/${i.id}" class="btn btn-sm btn-warning"><i class="fas fa-edit"></i></a>
                                    ${i.id != App.currentUser?.id ? `<button class="btn btn-sm btn-danger" onclick="PageUsers.delete(${i.id})"><i class="fas fa-trash"></i></button>` : ''}
                                </td>
                            </tr>`).join('')}
                        </tbody>
                    </table>
                </div>` : '<div class="empty-state"><i class="fas fa-users"></i><p>Belum ada user</p></div>'}
            </div>`;
    },

    async renderForm(id) {
        Utils.loading();
        let item = {};
        if (id) {
            const res = await API.get(`users.php?action=get&id=${id}`);
            if (!res.success) { Utils.notify(res.message, 'error'); window.location.hash = '#/users'; return; }
            item = res.data;
        }
        const el = document.getElementById('pageContent');

        el.innerHTML = `
            <div class="page-header">
                <h2 class="page-title">${id ? 'Edit' : 'Tambah'} User</h2>
                <a href="#/users" class="btn btn-secondary"><i class="fas fa-arrow-left"></i> Kembali</a>
            </div>
            <div class="card">
                <form id="userForm" class="form-grid">
                    <div class="form-group">
                        <label>Username *</label>
                        <input type="text" name="username" value="${Utils.escapeHtml(item.username || '')}" required>
                    </div>
                    <div class="form-group">
                        <label>Email</label>
                        <input type="email" name="email" value="${Utils.escapeHtml(item.email || '')}">
                    </div>
                    <div class="form-group">
                        <label>Password ${id ? '(kosongkan jika tidak diganti)' : '*'}</label>
                        <input type="password" name="password" ${id ? '' : 'required'} minlength="6">
                    </div>
                    <div class="form-group">
                        <label>Nama Lengkap</label>
                        <input type="text" name="nama" value="${Utils.escapeHtml(item.nama || '')}">
                    </div>
                    <div class="form-group">
                        <label>Role</label>
                        <select name="role">
                            <option value="admin" ${item.role === 'admin' ? 'selected' : ''}>Admin</option>
                            <option value="editor" ${item.role === 'editor' ? 'selected' : ''}>Editor</option>
                            <option value="user" ${item.role === 'user' ? 'selected' : ''}>User</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Status</label>
                        <select name="status">
                            <option value="active" ${item.status === 'active' ? 'selected' : ''}>Aktif</option>
                            <option value="inactive" ${item.status === 'inactive' ? 'selected' : ''}>Nonaktif</option>
                        </select>
                    </div>
                    <div class="form-actions full-width">
                        <button type="submit" class="btn btn-primary"><i class="fas fa-save"></i> Simpan</button>
                        <a href="#/users" class="btn btn-secondary">Batal</a>
                    </div>
                </form>
            </div>`;

        document.getElementById('userForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const form = e.target;
            const fd = new FormData(form);
            fd.append('action', id ? 'update' : 'create');
            if (id) fd.append('id', id);

            const btn = form.querySelector('button[type="submit"]');
            btn.disabled = true;
            const res = await API.post(`users.php?action=${id ? 'update' : 'create'}${id ? '&id=' + id : ''}`, fd);
            if (res.success) { Utils.notify(res.message); window.location.hash = '#/users'; }
            else { Utils.notify(res.message, 'error'); btn.disabled = false; }
        });
    },

    async delete(id) {
        const ok = await Utils.confirm('Hapus User?', 'Data yang dihapus tidak bisa dikembalikan.');
        if (!ok) return;
        const res = await API.get(`users.php?action=delete&id=${id}`);
        if (res.success) { Utils.notify(res.message); this.render(); }
        else { Utils.notify(res.message, 'error'); }
    }
};
