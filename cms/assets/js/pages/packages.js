/**
 * Packages CRUD Page
 */
const PagePackages = {
    async render() {
        Utils.loading();
        const res = await API.get('packages.php?action=list');
        const items = res.success ? res.data : [];
        const el = document.getElementById('pageContent');

        el.innerHTML = `
            <div class="page-header">
                <h2 class="page-title">Paket Camping</h2>
                <a href="#/packages-add" class="btn btn-primary"><i class="fas fa-plus"></i> Tambah</a>
            </div>
            <div class="card">
                ${items.length ? `
                <div class="table-responsive">
                    <table class="table">
                        <thead><tr>
                            <th>Icon</th><th>Nama</th><th>Harga</th><th>Durasi</th><th>Orang</th><th>Populer</th><th>Status</th><th>Aksi</th>
                        </tr></thead>
                        <tbody>
                            ${items.map(i => `<tr>
                                <td><i class="${Utils.escapeHtml(i.icon || 'fas fa-box')}" style="font-size:24px;color:var(--primary)"></i></td>
                                <td><strong>${Utils.escapeHtml(i.name)}</strong></td>
                                <td>${Utils.formatPrice(i.price)}</td>
                                <td>${Utils.escapeHtml(i.duration || '-')}</td>
                                <td>${Utils.escapeHtml(i.person_count || '-')}</td>
                                <td>${i.is_popular == 1 ? '<span class="badge badge-active">Ya</span>' : '<span class="badge badge-inactive">Tidak</span>'}</td>
                                <td>${Utils.statusBadge(i.status)}</td>
                                <td class="actions">
                                    <a href="#/packages-edit/${i.id}" class="btn btn-sm btn-warning"><i class="fas fa-edit"></i></a>
                                    <button class="btn btn-sm btn-danger" onclick="PagePackages.delete(${i.id})"><i class="fas fa-trash"></i></button>
                                </td>
                            </tr>`).join('')}
                        </tbody>
                    </table>
                </div>` : '<div class="empty-state"><i class="fas fa-box-open"></i><p>Belum ada paket</p></div>'}
            </div>`;
    },

    async renderForm(id) {
        Utils.loading();
        let item = {};
        if (id) {
            const res = await API.get(`packages.php?action=get&id=${id}`);
            if (!res.success) { Utils.notify(res.message, 'error'); window.location.hash = '#/packages'; return; }
            item = res.data;
        }
        const el = document.getElementById('pageContent');

        el.innerHTML = `
            <div class="page-header">
                <h2 class="page-title">${id ? 'Edit' : 'Tambah'} Paket</h2>
                <a href="#/packages" class="btn btn-secondary"><i class="fas fa-arrow-left"></i> Kembali</a>
            </div>
            <div class="card">
                <form id="pkgForm" class="form-grid">
                    <div class="form-group">
                        <label>Nama Paket *</label>
                        <input type="text" name="name" value="${Utils.escapeHtml(item.name || '')}" required>
                    </div>
                    <div class="form-group">
                        <label>Harga (Rp) *</label>
                        <input type="number" name="price" value="${item.price || ''}" required min="0">
                    </div>
                    <div class="form-group">
                        <label>Icon (Font Awesome class)</label>
                        <input type="text" name="icon" value="${Utils.escapeHtml(item.icon || '')}" placeholder="fas fa-campground">
                    </div>
                    <div class="form-group">
                        <label>Jumlah Orang</label>
                        <input type="text" name="person_count" value="${Utils.escapeHtml(item.person_count || '')}">
                    </div>
                    <div class="form-group">
                        <label>Durasi</label>
                        <input type="text" name="duration" value="${Utils.escapeHtml(item.duration || '')}" placeholder="2 Hari 1 Malam">
                    </div>
                    <div class="form-group">
                        <label>Status</label>
                        <select name="status">
                            <option value="active" ${item.status === 'active' ? 'selected' : ''}>Aktif</option>
                            <option value="inactive" ${item.status === 'inactive' ? 'selected' : ''}>Nonaktif</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Populer?</label>
                        <select name="is_popular">
                            <option value="0" ${item.is_popular != 1 ? 'selected' : ''}>Tidak</option>
                            <option value="1" ${item.is_popular == 1 ? 'selected' : ''}>Ya</option>
                        </select>
                    </div>
                    <div class="form-group full-width">
                        <label>Deskripsi</label>
                        <textarea name="description" rows="3">${Utils.escapeHtml(item.description || '')}</textarea>
                    </div>
                    <div class="form-group full-width">
                        <label>Termasuk (pisahkan dengan koma)</label>
                        <textarea name="includes" rows="2" placeholder="Tenda, Sleeping Bag, Makan 3x">${(() => { try { const f = JSON.parse(item.includes || '[]'); return Array.isArray(f) ? f.join(', ') : (item.includes || ''); } catch(e) { return item.includes || ''; } })()}</textarea>
                    </div>
                    <div class="form-actions full-width">
                        <button type="submit" class="btn btn-primary"><i class="fas fa-save"></i> Simpan</button>
                        <a href="#/packages" class="btn btn-secondary">Batal</a>
                    </div>
                </form>
            </div>`;

        document.getElementById('pkgForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const form = e.target;
            const fd = new FormData(form);
            fd.append('action', id ? 'update' : 'create');
            if (id) fd.append('id', id);

            const btn = form.querySelector('button[type="submit"]');
            btn.disabled = true;
            const res = await API.post(`packages.php?action=${id ? 'update' : 'create'}${id ? '&id=' + id : ''}`, fd);
            if (res.success) { Utils.notify(res.message); window.location.hash = '#/packages'; }
            else { Utils.notify(res.message, 'error'); btn.disabled = false; }
        });
    },

    async delete(id) {
        const ok = await Utils.confirm('Hapus Paket?', 'Data yang dihapus tidak bisa dikembalikan.');
        if (!ok) return;
        const res = await API.get(`packages.php?action=delete&id=${id}`);
        if (res.success) { Utils.notify(res.message); this.render(); }
        else { Utils.notify(res.message, 'error'); }
    }
};
