/**
 * Testimonials CRUD Page
 */
const PageTestimonials = {
    async render() {
        Utils.loading();
        const res = await API.get('testimonials.php?action=list');
        const items = res.success ? res.data : [];
        const el = document.getElementById('pageContent');

        el.innerHTML = `
            <div class="page-header">
                <h2 class="page-title">Testimoni</h2>
                <a href="#/testimonials-add" class="btn btn-primary"><i class="fas fa-plus"></i> Tambah</a>
            </div>
            <div class="card">
                ${items.length ? `
                <div class="table-responsive">
                    <table class="table">
                        <thead><tr>
                            <th>Foto</th><th>Nama</th><th>Lokasi</th><th>Rating</th><th>Teks</th><th>Status</th><th>Aksi</th>
                        </tr></thead>
                        <tbody>
                            ${items.map(i => `<tr>
                                <td><img src="${Utils.imagePath(i.image)}" class="table-img table-img-round" alt=""></td>
                                <td><strong>${Utils.escapeHtml(i.name)}</strong></td>
                                <td>${Utils.escapeHtml(i.location || '-')}</td>
                                <td>${'⭐'.repeat(parseInt(i.rating) || 0)}</td>
                                <td>${Utils.truncate(i.text, 60)}</td>
                                <td>${Utils.statusBadge(i.status)}</td>
                                <td class="actions">
                                    <a href="#/testimonials-edit/${i.id}" class="btn btn-sm btn-warning"><i class="fas fa-edit"></i></a>
                                    <button class="btn btn-sm btn-danger" onclick="PageTestimonials.delete(${i.id})"><i class="fas fa-trash"></i></button>
                                </td>
                            </tr>`).join('')}
                        </tbody>
                    </table>
                </div>` : '<div class="empty-state"><i class="fas fa-comment"></i><p>Belum ada testimoni</p></div>'}
            </div>`;
    },

    async renderForm(id) {
        Utils.loading();
        let item = {};
        if (id) {
            const res = await API.get(`testimonials.php?action=get&id=${id}`);
            if (!res.success) { Utils.notify(res.message, 'error'); window.location.hash = '#/testimonials'; return; }
            item = res.data;
        }
        const el = document.getElementById('pageContent');

        el.innerHTML = `
            <div class="page-header">
                <h2 class="page-title">${id ? 'Edit' : 'Tambah'} Testimoni</h2>
                <a href="#/testimonials" class="btn btn-secondary"><i class="fas fa-arrow-left"></i> Kembali</a>
            </div>
            <div class="card">
                <form id="testiForm" class="form-grid">
                    <div class="form-group">
                        <label>Nama *</label>
                        <input type="text" name="name" value="${Utils.escapeHtml(item.name || '')}" required>
                    </div>
                    <div class="form-group">
                        <label>Lokasi</label>
                        <input type="text" name="location" value="${Utils.escapeHtml(item.location || '')}">
                    </div>
                    <div class="form-group">
                        <label>Rating (1-5)</label>
                        <select name="rating">
                            ${[5,4,3,2,1].map(r => `<option value="${r}" ${(item.rating || 5) == r ? 'selected' : ''}>${r} ⭐</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Status</label>
                        <select name="status">
                            <option value="active" ${item.status === 'active' ? 'selected' : ''}>Aktif</option>
                            <option value="inactive" ${item.status === 'inactive' ? 'selected' : ''}>Nonaktif</option>
                        </select>
                    </div>
                    <div class="form-group full-width">
                        <label>Teks Testimoni *</label>
                        <textarea name="text" rows="4" required>${Utils.escapeHtml(item.text || '')}</textarea>
                    </div>
                    <div class="form-group full-width">
                        <label>Foto</label>
                        <input type="file" id="imageFile" accept="image/*">
                        ${item.image ? `<div class="current-image"><img src="${Utils.imagePath(item.image)}" alt=""><input type="hidden" name="image" value="${item.image}"></div>` : ''}
                    </div>
                    <div class="form-actions full-width">
                        <button type="submit" class="btn btn-primary"><i class="fas fa-save"></i> Simpan</button>
                        <a href="#/testimonials" class="btn btn-secondary">Batal</a>
                    </div>
                </form>
            </div>`;

        document.getElementById('testiForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const form = e.target;
            const fd = new FormData(form);
            fd.append('action', id ? 'update' : 'create');
            if (id) fd.append('id', id);

            const fileInput = document.getElementById('imageFile');
            if (fileInput.files.length > 0) {
                const uploadRes = await API.upload(fileInput.files[0], 'testimonials');
                if (uploadRes.success) { fd.set('image', uploadRes.data.path || uploadRes.path); }
                else { Utils.notify('Gagal upload gambar', 'error'); return; }
            }

            const btn = form.querySelector('button[type="submit"]');
            btn.disabled = true;
            const res = await API.post(`testimonials.php?action=${id ? 'update' : 'create'}${id ? '&id=' + id : ''}`, fd);
            if (res.success) { Utils.notify(res.message); window.location.hash = '#/testimonials'; }
            else { Utils.notify(res.message, 'error'); btn.disabled = false; }
        });
    },

    async delete(id) {
        const ok = await Utils.confirm('Hapus Testimoni?', 'Data yang dihapus tidak bisa dikembalikan.');
        if (!ok) return;
        const res = await API.get(`testimonials.php?action=delete&id=${id}`);
        if (res.success) { Utils.notify(res.message); this.render(); }
        else { Utils.notify(res.message, 'error'); }
    }
};
