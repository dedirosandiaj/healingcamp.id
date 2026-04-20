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
        
        // Fetch categories
        const catRes = await API.get('categories.php?action=list');
        const categories = catRes.success ? catRes.data : [];
        
        // Parse existing includes
        let existingIncludes = [];
        try {
            existingIncludes = JSON.parse(item.includes || '[]');
        } catch (e) {}
        
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
                        <label>Icon</label>
                        <div style="display:flex;gap:10px;align-items:center">
                            <button type="button" id="pkgIconBtn" onclick="PagePackages.openIconModal()" style="min-width:140px;padding:10px 16px;background:#f3f4f6;border:2px solid #e5e7eb;border-radius:8px;cursor:pointer;display:flex;align-items:center;gap:8px;font-size:14px">
                                <i class="${item.icon || 'fas fa-campground'}" style="font-size:18px"></i>
                                <span>Pilih Icon</span>
                            </button>
                            <input type="hidden" name="icon" id="pkgIconInput" value="${Utils.escapeHtml(item.icon || 'fas fa-campground')}">
                        </div>
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
                        <label>Termasuk (pilih dari kategori)</label>
                        <div id="includesContainer" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:10px;margin-top:8px">
                            ${categories.map(cat => `
                                <label style="display:flex;align-items:center;gap:8px;padding:10px;background:#f9fafb;border:2px solid #e5e7eb;border-radius:8px;cursor:pointer;transition:all 0.2s" 
                                       onmouseover="this.style.borderColor='#10b981';this.style.background='#f0fdf4'" 
                                       onmouseout="if(!this.querySelector('input').checked){this.style.borderColor='#e5e7eb';this.style.background='#f9fafb'}">
                                    <input type="checkbox" name="includes[]" value="${Utils.escapeHtml(cat.name)}" 
                                           ${existingIncludes.includes(cat.name) ? 'checked' : ''}
                                           onchange="this.parentElement.style.borderColor=this.checked?'#10b981':'#e5e7eb';this.parentElement.style.background=this.checked?'#f0fdf4':'#f9fafb'"
                                           style="width:18px;height:18px;cursor:pointer">
                                    <i class="${cat.icon || 'fas fa-folder'}" style="color:#10b981"></i>
                                    <span style="font-size:14px">${Utils.escapeHtml(cat.name)}</span>
                                </label>
                            `).join('')}
                        </div>
                        <input type="hidden" name="includes" id="includesInput">
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
            
            // Convert includes checkboxes to JSON
            const includesCheckboxes = form.querySelectorAll('input[name="includes[]"]:checked');
            const includes = Array.from(includesCheckboxes).map(cb => cb.value);
            fd.set('includes', JSON.stringify(includes));
            
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
    },

    openIconModal() {
        const icons = [
            'fa-campground','fa-tent','fa-bed','fa-house','fa-home','fa-building',
            'fa-star','fa-heart','fa-check','fa-trophy','fa-medal','fa-award',
            'fa-users','fa-user-check','fa-shield-alt','fa-crown','fa-gem','fa-thumbs-up',
            'fa-mountain','fa-tree','fa-leaf','fa-sun','fa-cloud-sun','fa-fire',
            'fa-map-marker-alt','fa-location-arrow','fa-compass','fa-globe',
            'fa-clock','fa-calendar','fa-phone','fa-envelope',
            'fa-camera','fa-image','fa-video','fa-music','fa-book','fa-pen',
            'fa-bolt','fa-flag','fa-bell','fa-gift','fa-tag',
            'fa-rocket','fa-plane','fa-car','fa-bus','fa-bicycle','fa-hiking',
            'fa-fish','fa-paw','fa-binoculars','fa-first-aid','fa-toolbox','fa-utensils',
            'fa-coffee','fa-glass-water','fa-burger','fa-pizza-slice','fa-ice-cream'
        ];

        const overlay = document.createElement('div');
        overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:9999;display:flex;align-items:center;justify-content:center;';
        overlay.id = 'pkgIconPickerModal';
        
        const modal = document.createElement('div');
        modal.style.cssText = 'background:white;border-radius:16px;max-width:700px;width:90%;max-height:85vh;overflow-y:auto;padding:24px;box-shadow:0 20px 60px rgba(0,0,0,0.3);';
        
        modal.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
                <h3 style="font-size:20px;font-weight:700;margin:0">Pilih Icon Paket</h3>
                <button onclick="PagePackages.closeIconModal()" style="background:#f3f4f6;border:none;width:36px;height:36px;border-radius:8px;cursor:pointer;font-size:20px;display:flex;align-items:center;justify-content:center">&times;</button>
            </div>
            <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(60px,1fr));gap:10px">
                ${icons.map(icon => `
                    <button type="button" data-icon="${icon}" 
                            style="aspect-ratio:1;display:flex;align-items:center;justify-content:center;background:#f9fafb;border:2px solid #e5e7eb;border-radius:10px;cursor:pointer;font-size:24px;color:#374151;transition:all 0.2s;padding:0"
                            onmouseover="this.style.borderColor='#10b981';this.style.background='#d1fae5';this.style.color='#059669';this.style.transform='scale(1.1)'" 
                            onmouseout="this.style.borderColor='#e5e7eb';this.style.background='#f9fafb';this.style.color='#374151';this.style.transform='scale(1)'">
                        <i class="fas ${icon}"></i>
                    </button>
                `).join('')}
            </div>
        `;
        
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
        
        // Add click handlers
        overlay.querySelectorAll('[data-icon]').forEach(iconBtn => {
            iconBtn.onclick = function() {
                const icon = this.dataset.icon;
                PagePackages.selectIcon(icon);
            };
        });
        
        overlay.onclick = (e) => { if (e.target === overlay) PagePackages.closeIconModal(); };
    },

    closeIconModal() {
        const modal = document.getElementById('pkgIconPickerModal');
        if (modal) modal.remove();
    },

    selectIcon(icon) {
        const btn = document.getElementById('pkgIconBtn');
        const input = document.getElementById('pkgIconInput');
        
        if (btn) {
            const iconEl = btn.querySelector('i');
            if (iconEl) iconEl.className = `fas ${icon}`;
        }
        if (input) input.value = `fas ${icon}`;
        
        this.closeIconModal();
    }
};
