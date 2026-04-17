/**
 * Locations CRUD Page
 */
const PageLocations = {
    async render() {
        Utils.loading();
        const res = await API.get('locations.php?action=list');
        const items = res.success ? res.data : [];
        const el = document.getElementById('pageContent');

        el.innerHTML = `
            <div class="page-header">
                <h2 class="page-title">Lokasi Camping</h2>
                <a href="#/locations-add" class="btn btn-primary"><i class="fas fa-plus"></i> Tambah</a>
            </div>
            <div class="card">
                ${items.length ? `
                <div class="table-responsive">
                    <table class="table">
                        <thead><tr>
                            <th>Gambar</th><th>Nama</th><th>Region</th><th>Harga/Malam</th><th>Status</th><th>Aksi</th>
                        </tr></thead>
                        <tbody>
                            ${items.map(i => `<tr>
                                <td><img src="${Utils.imagePath(i.image)}" class="table-img" alt=""></td>
                                <td><strong>${Utils.escapeHtml(i.name)}</strong></td>
                                <td>${Utils.escapeHtml(i.region || '-')}</td>
                                <td>${Utils.formatPrice(i.price_per_night)}</td>
                                <td>${Utils.statusBadge(i.status)}</td>
                                <td class="actions">
                                    <a href="#/locations-edit/${i.id}" class="btn btn-sm btn-warning"><i class="fas fa-edit"></i></a>
                                    <button class="btn btn-sm btn-danger" onclick="PageLocations.delete(${i.id})"><i class="fas fa-trash"></i></button>
                                </td>
                            </tr>`).join('')}
                        </tbody>
                    </table>
                </div>` : '<div class="empty-state"><i class="fas fa-map-marker-alt"></i><p>Belum ada lokasi</p></div>'}
            </div>`;
    },

    async renderForm(id) {
        Utils.loading();
        let item = {};
        if (id) {
            const res = await API.get(`locations.php?action=get&id=${id}`);
            if (!res.success) { Utils.notify(res.message, 'error'); window.location.hash = '#/locations'; return; }
            item = res.data;
        }
        const el = document.getElementById('pageContent');

        el.innerHTML = `
            <div class="page-header">
                <h2 class="page-title">${id ? 'Edit' : 'Tambah'} Lokasi</h2>
                <a href="#/locations" class="btn btn-secondary"><i class="fas fa-arrow-left"></i> Kembali</a>
            </div>
            <div class="card">
                <form id="locForm" class="form-grid">
                    <div class="form-group">
                        <label>Nama Lokasi *</label>
                        <input type="text" name="name" value="${Utils.escapeHtml(item.name || '')}" required>
                    </div>
                    <div class="form-group">
                        <label>Region</label>
                        <input type="text" name="region" value="${Utils.escapeHtml(item.region || '')}">
                    </div>
                    <div class="form-group">
                        <label>Harga Per Malam (Rp) *</label>
                        <input type="number" name="price_per_night" value="${item.price_per_night || ''}" required min="0">
                    </div>
                    <div class="form-group">
                        <label>Status</label>
                        <select name="status">
                            <option value="active" ${item.status === 'active' ? 'selected' : ''}>Aktif</option>
                            <option value="inactive" ${item.status === 'inactive' ? 'selected' : ''}>Nonaktif</option>
                            <option value="maintenance" ${item.status === 'maintenance' ? 'selected' : ''}>Maintenance</option>
                        </select>
                    </div>
                    <div class="form-group full-width">
                        <label>Deskripsi</label>
                        <textarea name="description" rows="3">${Utils.escapeHtml(item.description || '')}</textarea>
                    </div>
                    <div class="form-group full-width">
                        <label>Fasilitas (pisahkan dengan koma)</label>
                        <textarea name="facilities" rows="2" placeholder="WiFi, Toilet, Parkir">${(() => { try { const f = JSON.parse(item.facilities || '[]'); return Array.isArray(f) ? f.join(', ') : (item.facilities || ''); } catch(e) { return item.facilities || ''; } })()}</textarea>
                    </div>
                    <div class="form-group full-width">
                        <label>Koordinat</label>
                        <input type="text" name="coordinates" value="${Utils.escapeHtml(item.coordinates || '')}" placeholder="-6.123,106.456">
                    </div>
                    <div class="form-group full-width">
                        <label>Gambar</label>
                        <input type="file" id="imageFile" accept="image/*">
                        ${item.image ? `<div class="current-image"><img src="${Utils.imagePath(item.image)}" alt=""><input type="hidden" name="image" value="${item.image}"></div>` : ''}
                    </div>
                    <div class="form-actions full-width">
                        <button type="submit" class="btn btn-primary"><i class="fas fa-save"></i> Simpan</button>
                        <a href="#/locations" class="btn btn-secondary">Batal</a>
                    </div>
                </form>
            </div>`;

        document.getElementById('locForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const form = e.target;
            const fd = new FormData(form);
            fd.append('action', id ? 'update' : 'create');
            if (id) fd.append('id', id);

            const fileInput = document.getElementById('imageFile');
            if (fileInput.files.length > 0) {
                const uploadRes = await API.upload(fileInput.files[0], 'locations');
                if (uploadRes.success) { fd.set('image', uploadRes.data.path || uploadRes.path); }
                else { Utils.notify('Gagal upload gambar', 'error'); return; }
            }

            const btn = form.querySelector('button[type="submit"]');
            btn.disabled = true;
            const res = await API.post(`locations.php?action=${id ? 'update' : 'create'}${id ? '&id=' + id : ''}`, fd);
            if (res.success) { Utils.notify(res.message); window.location.hash = '#/locations'; }
            else { Utils.notify(res.message, 'error'); btn.disabled = false; }
        });
    },

    async delete(id) {
        const ok = await Utils.confirm('Hapus Lokasi?', 'Data yang dihapus tidak bisa dikembalikan.');
        if (!ok) return;
        const res = await API.get(`locations.php?action=delete&id=${id}`);
        if (res.success) { Utils.notify(res.message); this.render(); }
        else { Utils.notify(res.message, 'error'); }
    }
};
