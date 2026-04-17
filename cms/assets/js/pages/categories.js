/**
 * Categories CRUD Page
 */
const PageCategories = {
    async render() {
        Utils.loading();
        const res = await API.get('categories.php?action=list');
        const items = res.success ? res.data : [];
        const el = document.getElementById('pageContent');

        el.innerHTML = `
            <div class="page-header">
                <h2 class="page-title">Kategori Peralatan</h2>
                <a href="#/categories-add" class="btn btn-primary"><i class="fas fa-plus"></i> Tambah Kategori</a>
            </div>
            <div class="card">
                ${items.length ? `
                <div class="table-responsive">
                    <table class="table">
                        <thead><tr>
                            <th>Icon</th><th>Nama</th><th>Slug</th><th>Status</th><th>Urutan</th><th>Aksi</th>
                        </tr></thead>
                        <tbody>
                            ${items.map(i => `<tr>
                                <td><i class="fas ${Utils.escapeHtml(i.icon || 'fa-box')}" style="font-size:1.5rem;color:var(--primary)"></i></td>
                                <td><strong>${Utils.escapeHtml(i.name)}</strong></td>
                                <td><code>${Utils.escapeHtml(i.slug)}</code></td>
                                <td>${Utils.statusBadge(i.status)}</td>
                                <td>${i.sort_order}</td>
                                <td class="actions">
                                    <a href="#/categories-edit/${i.id}" class="btn btn-sm btn-warning"><i class="fas fa-edit"></i></a>
                                    <button class="btn btn-sm btn-danger" onclick="PageCategories.delete(${i.id})"><i class="fas fa-trash"></i></button>
                                </td>
                            </tr>`).join('')}
                        </tbody>
                    </table>
                </div>` : '<div class="empty-state"><i class="fas fa-tags"></i><p>Belum ada kategori</p></div>'}
            </div>`;
    },

    async renderForm(id) {
        Utils.loading();
        let item = {};
        if (id) {
            const res = await API.get(`categories.php?action=get&id=${id}`);
            if (!res.success) { Utils.notify(res.message, 'error'); window.location.hash = '#/categories'; return; }
            item = res.data;
        }
        const el = document.getElementById('pageContent');

        el.innerHTML = `
            <div class="page-header">
                <h2 class="page-title">${id ? 'Edit' : 'Tambah'} Kategori</h2>
                <a href="#/categories" class="btn btn-secondary"><i class="fas fa-arrow-left"></i> Kembali</a>
            </div>
            <div class="card">
                <form id="catForm" class="form-grid">
                    <div class="form-group">
                        <label>Nama Kategori *</label>
                        <input type="text" name="name" value="${Utils.escapeHtml(item.name || '')}" required onblur="this.form.slug.value=this.value.toLowerCase().replace(/[^a-z0-9-]/g,'-').replace(/-+/g,'-').replace(/^-|-$/g,'')">
                    </div>
                    <div class="form-group">
                        <label>Slug *</label>
                        <input type="text" name="slug" value="${Utils.escapeHtml(item.slug || '')}" required placeholder="nama-kategori">
                    </div>
                    <div class="form-group">
                        <label>Icon FontAwesome</label>
                        <div class="icon-picker" style="display:flex;gap:10px;align-items:center">
                            <input type="text" name="icon" id="iconInput" value="${Utils.escapeHtml(item.icon || 'fa-box')}" placeholder="fa-box" readonly style="flex:1">
                            <button type="button" class="btn btn-secondary" onclick="PageCategories.openIconModal()">
                                <i class="fas ${Utils.escapeHtml(item.icon || 'fa-box')}" id="iconPreview"></i> Pilih Icon
                            </button>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Urutan</label>
                        <input type="number" name="sort_order" value="${item.sort_order || 0}" min="0">
                    </div>
                    <div class="form-group">
                        <label>Status</label>
                        <select name="status">
                            <option value="active" ${item.status === 'active' ? 'selected' : ''}>Aktif</option>
                            <option value="inactive" ${item.status === 'inactive' ? 'selected' : ''}>Nonaktif</option>
                        </select>
                    </div>
                    <div class="form-group full-width">
                        <label>Deskripsi</label>
                        <textarea name="description" rows="2">${Utils.escapeHtml(item.description || '')}</textarea>
                    </div>
                    <div class="form-actions full-width">
                        <button type="submit" class="btn btn-primary"><i class="fas fa-save"></i> Simpan</button>
                        <a href="#/categories" class="btn btn-secondary">Batal</a>
                    </div>
                </form>
            </div>`;

        document.getElementById('catForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const form = e.target;
            const fd = new FormData(form);
            fd.append('action', id ? 'update' : 'create');
            if (id) fd.append('id', id);

            const btn = form.querySelector('button[type="submit"]');
            btn.disabled = true;
            const res = await API.post(`categories.php?action=${id ? 'update' : 'create'}${id ? '&id=' + id : ''}`, fd);
            if (res.success) { Utils.notify(res.message); window.location.hash = '#/categories'; }
            else { Utils.notify(res.message, 'error'); btn.disabled = false; }
        });
    },

    async delete(id) {
        const ok = await Utils.confirm('Hapus Kategori?', 'Data yang dihapus tidak bisa dikembalikan.');
        if (!ok) return;
        const res = await API.get(`categories.php?action=delete&id=${id}`);
        if (res.success) { Utils.notify(res.message); this.render(); }
        else { Utils.notify(res.message, 'error'); }
    },

    openIconModal() {
        const icons = [
            'fa-campground', 'fa-tent', 'fa-bed', 'fa-fire', 'fa-hiking', 'fa-lightbulb', 
            'fa-layer-group', 'fa-box', 'fa-tools', 'fa-toolbox', 'fa-wrench', 'fa-hammer',
            'fa-utensils', 'fa-mug-hot', 'fa-blender', 'fa-thermometer-half', 'fa-snowflake',
            'fa-sun', 'fa-cloud', 'fa-wind', 'fa-water', 'fa-mountain', 'fa-tree',
            'fa-leaf', 'fa-seedling', 'fa-car', 'fa-bus', 'fa-bicycle', 'fa-walking',
            'fa-map', 'fa-map-marker-alt', 'fa-compass', 'fa-binoculars', 'fa-camera',
            'fa-first-aid', 'fa-medkit', 'fa-heart', 'fa-star', 'fa-thumbs-up',
            'fa-check', 'fa-check-circle', 'fa-times', 'fa-times-circle', 'fa-plus',
            'fa-minus', 'fa-arrow-right', 'fa-arrow-left', 'fa-chevron-right', 'fa-chevron-left'
        ];
        
        const modal = document.createElement('div');
        modal.id = 'iconModal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content" style="max-width:600px">
                <div class="modal-header">
                    <h3>Pilih Icon</h3>
                    <button type="button" class="btn-close" onclick="PageCategories.closeIconModal()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="icon-grid" style="display:grid;grid-template-columns:repeat(8,1fr);gap:15px;padding:20px">
                        ${icons.map(icon => `
                            <button type="button" class="icon-item" data-icon="${icon}" 
                                style="background:#f8f9fa;border:2px solid #e9ecef;border-radius:8px;padding:15px;cursor:pointer;transition:all 0.2s"
                                onmouseover="this.style.background='#e9ecef';this.style.borderColor='#6c757d'" 
                                onmouseout="this.style.background='#f8f9fa';this.style.borderColor='#e9ecef'"
                                onclick="PageCategories.selectIcon('${icon}')">
                                <i class="fas ${icon}" style="font-size:24px;color:#495057"></i>
                            </button>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
        
        modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:9999;display:flex;align-items:center;justify-content:center';
        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';
        
        // Close on backdrop click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) this.closeIconModal();
        });
    },

    closeIconModal() {
        const modal = document.getElementById('iconModal');
        if (modal) {
            modal.remove();
            document.body.style.overflow = '';
        }
    },

    selectIcon(icon) {
        const input = document.getElementById('iconInput');
        const preview = document.getElementById('iconPreview');
        if (input) input.value = icon;
        if (preview) preview.className = `fas ${icon}`;
        this.closeIconModal();
    }
};
