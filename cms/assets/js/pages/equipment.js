/**
 * Equipment CRUD Page
 */
const PageEquipment = {
    async render() {
        Utils.loading();
        const res = await API.get('equipment.php?action=list');
        const items = res.success ? res.data : [];
        const el = document.getElementById('pageContent');

        el.innerHTML = `
            <div class="page-header">
                <h2 class="page-title">Peralatan Camping</h2>
                <a href="#/equipment-add" class="btn btn-primary"><i class="fas fa-plus"></i> Tambah</a>
            </div>
            <div class="card">
                ${items.length ? `
                <div class="table-responsive">
                    <table class="table">
                        <thead><tr>
                            <th>Gambar</th><th>Nama</th><th>Kategori</th><th>Harga/Hari</th><th>Stok</th><th>Status</th><th>Aksi</th>
                        </tr></thead>
                        <tbody>
                            ${items.map(i => `<tr>
                                <td><img src="${Utils.imagePath(i.image)}" class="table-img" alt=""></td>
                                <td><strong>${Utils.escapeHtml(i.name)}</strong></td>
                                <td>${Utils.escapeHtml(i.category)}</td>
                                <td>${Utils.formatPrice(i.price_per_day)}</td>
                                <td>${i.stock}</td>
                                <td>${Utils.statusBadge(i.status)}</td>
                                <td class="actions">
                                    <a href="#/equipment-edit/${i.id}" class="btn btn-sm btn-warning"><i class="fas fa-edit"></i></a>
                                    <button class="btn btn-sm btn-danger" onclick="PageEquipment.delete(${i.id})"><i class="fas fa-trash"></i></button>
                                </td>
                            </tr>`).join('')}
                        </tbody>
                    </table>
                </div>` : '<div class="empty-state"><i class="fas fa-tools"></i><p>Belum ada peralatan</p></div>'}
            </div>`;
    },

    async renderForm(id) {
        Utils.loading();
        let item = {};
        if (id) {
            const res = await API.get(`equipment.php?action=get&id=${id}`);
            if (!res.success) { Utils.notify(res.message, 'error'); window.location.hash = '#/equipment'; return; }
            item = res.data;
        }
        // Fetch categories from API
        const catRes = await API.get('categories.php?action=active');
        const categories = catRes.success ? catRes.data : [];
        const el = document.getElementById('pageContent');

        el.innerHTML = `
            <div class="page-header">
                <h2 class="page-title">${id ? 'Edit' : 'Tambah'} Peralatan</h2>
                <a href="#/equipment" class="btn btn-secondary"><i class="fas fa-arrow-left"></i> Kembali</a>
            </div>
            <div class="card">
                <form id="equipmentForm" class="form-grid">
                    <div class="form-group">
                        <label>Nama Peralatan *</label>
                        <input type="text" name="name" value="${Utils.escapeHtml(item.name || '')}" required>
                    </div>
                    <div class="form-group">
                        <label>Kategori</label>
                        <select name="category">
                            ${categories.map(c => `<option value="${c.slug}" ${item.category === c.slug ? 'selected' : ''}>${Utils.escapeHtml(c.name)}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Harga Per Hari (Rp) *</label>
                        <input type="number" name="price_per_day" value="${item.price_per_day || ''}" required min="0">
                    </div>
                    <div class="form-group">
                        <label>Stok</label>
                        <input type="number" name="stock" value="${item.stock || 1}" min="0">
                    </div>
                    <div class="form-group">
                        <label>Kapasitas</label>
                        <input type="text" name="capacity" value="${Utils.escapeHtml(item.capacity || '')}">
                    </div>
                    <div class="form-group">
                        <label>Status</label>
                        <select name="status">
                            <option value="available" ${item.status === 'available' ? 'selected' : ''}>Tersedia</option>
                            <option value="rented" ${item.status === 'rented' ? 'selected' : ''}>Disewa</option>
                            <option value="maintenance" ${item.status === 'maintenance' ? 'selected' : ''}>Maintenance</option>
                        </select>
                    </div>
                    <div class="form-group full-width">
                        <label>Deskripsi</label>
                        <textarea name="description" rows="3">${Utils.escapeHtml(item.description || '')}</textarea>
                    </div>
                    <div class="form-group full-width">
                        <label>Fitur (pisahkan dengan koma)</label>
                        <textarea name="features" rows="2" placeholder="Tahan air, Ringan, Mudah dilipat">${(() => { try { const f = JSON.parse(item.features || '[]'); return Array.isArray(f) ? f.join(', ') : (item.features || ''); } catch(e) { return item.features || ''; } })()}</textarea>
                    </div>
                    <div class="form-group full-width">
                        <label>Gambar</label>
                        <input type="file" id="imageFile" accept="image/*">
                        ${item.image ? `<div class="current-image"><img src="${Utils.imagePath(item.image)}" alt=""><input type="hidden" name="image" value="${item.image}"></div>` : ''}
                    </div>
                    <div class="form-actions full-width">
                        <button type="submit" class="btn btn-primary"><i class="fas fa-save"></i> Simpan</button>
                        <a href="#/equipment" class="btn btn-secondary">Batal</a>
                    </div>
                </form>
            </div>`;

        document.getElementById('equipmentForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const form = e.target;
            const fd = new FormData(form);
            fd.append('action', id ? 'update' : 'create');
            if (id) fd.append('id', id);

            // Handle image upload
            const fileInput = document.getElementById('imageFile');
            if (fileInput.files.length > 0) {
                const uploadRes = await API.upload(fileInput.files[0], 'equipment');
                if (uploadRes.success) {
                    fd.set('image', uploadRes.data.path || uploadRes.path);
                } else {
                    Utils.notify('Gagal upload gambar: ' + uploadRes.message, 'error');
                    return;
                }
            }

            const btn = form.querySelector('button[type="submit"]');
            btn.disabled = true;
            const res = await API.post(`equipment.php?action=${id ? 'update' : 'create'}${id ? '&id=' + id : ''}`, fd);
            if (res.success) {
                Utils.notify(res.message);
                window.location.hash = '#/equipment';
            } else {
                Utils.notify(res.message, 'error');
                btn.disabled = false;
            }
        });
    },

    async delete(id) {
        const ok = await Utils.confirm('Hapus Peralatan?', 'Data yang dihapus tidak bisa dikembalikan.');
        if (!ok) return;
        const res = await API.get(`equipment.php?action=delete&id=${id}`);
        if (res.success) {
            Utils.notify(res.message);
            this.render();
        } else {
            Utils.notify(res.message, 'error');
        }
    }
};
