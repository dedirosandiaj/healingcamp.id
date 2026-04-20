/**
 * Settings Page
 */
const PageSettings = {
    async render() {
        Utils.loading();
        const res = await API.get('settings.php?action=list');
        const settings = res.success ? res.data : {};
        const el = document.getElementById('pageContent');

        const getVal = (key) => settings[key]?.setting_value || '';

        // Parse existing badges
        let existingBadges = [];
        try {
            const badgesJson = getVal('hero_badges');
            if (badgesJson) {
                existingBadges = JSON.parse(badgesJson) || [];
                // Normalisasi format icon
                existingBadges = existingBadges.map(b => {
                    let icon = b.icon || '';
                    // Jika icon sudah ada, pastikan formatnya benar
                    if (icon) {
                        console.log('Loading badge icon:', icon);
                    }
                    return { ...b, icon: icon };
                });
            }
        } catch (e) {
            console.error('Error parsing badges:', e);
        }

        el.innerHTML = `
            <div class="page-header">
                <h2 class="page-title">Settings</h2>
            </div>

            <div class="card" style="margin-bottom:24px">
                <h3 class="section-title">Hero Section</h3>
                <form id="heroForm" class="form-grid">
                    <div class="form-group">
                        <label>Badge Text</label>
                        <input type="text" name="hero_badge_text" value="${Utils.escapeHtml(getVal('hero_badge_text'))}" placeholder="#1 Camping Rental di Indonesia">
                    </div>
                    <div class="form-group">
                        <label>Main Heading</label>
                        <input type="text" name="hero_heading" value="${Utils.escapeHtml(getVal('hero_heading'))}" placeholder="Sewa Alat Camping & Tempat Camping Terbaik">
                    </div>
                    <div class="form-group full-width">
                        <label>Subtitle</label>
                        <textarea name="hero_subtitle" rows="2">${Utils.escapeHtml(getVal('hero_subtitle'))}</textarea>
                    </div>
                    <div class="form-group">
                        <label>Button 1 Text</label>
                        <input type="text" name="hero_btn1_text" value="${Utils.escapeHtml(getVal('hero_btn1_text'))}">
                    </div>
                    <div class="form-group">
                        <label>Button 1 Link</label>
                        <input type="text" name="hero_btn1_link" value="${Utils.escapeHtml(getVal('hero_btn1_link'))}">
                    </div>
                    <div class="form-group">
                        <label>Button 2 Text</label>
                        <input type="text" name="hero_btn2_text" value="${Utils.escapeHtml(getVal('hero_btn2_text'))}">
                    </div>
                    <div class="form-group">
                        <label>Button 2 Link</label>
                        <input type="text" name="hero_btn2_link" value="${Utils.escapeHtml(getVal('hero_btn2_link'))}">
                    </div>
                    <div class="form-group full-width">
                        <label>Hero Image</label>
                        <input type="file" id="heroImageFile" accept="image/*">
                        ${getVal('hero_image') ? `<div class="current-image"><img src="${Utils.imagePath(getVal('hero_image'))}" alt=""><input type="hidden" name="hero_image" value="${getVal('hero_image')}"></div>` : ''}
                    </div>
                    <div class="form-group full-width">
                        <label>Hero Badges</label>
                        <div id="badgesContainer">
                            ${existingBadges.length ? existingBadges.map(b => {
                                // Normalisasi icon class
                                let iconClass = b.icon || '';
                                
                                // Jika kosong, pakai default
                                if (!iconClass) {
                                    iconClass = 'fas fa-icons';
                                }
                                // Jika sudah ada 'fas ' atau 'far ', gunakan langsung
                                else if (!iconClass.startsWith('fas ') && !iconClass.startsWith('far ') && !iconClass.startsWith('fab ')) {
                                    // Jika dimulai dengan 'fa-', tambahkan 'fas '
                                    if (iconClass.startsWith('fa-')) {
                                        iconClass = 'fas ' + iconClass;
                                    } 
                                    // Jika tidak ada prefix, tambahkan 'fas fa-'
                                    else {
                                        iconClass = 'fas fa-' + iconClass;
                                    }
                                }
                                
                                console.log('Badge icon from DB (normalized):', iconClass, 'original:', b.icon);
                                
                                return `
                                <div style="display:flex;gap:10px;align-items:center;margin-bottom:10px">
                                    <button type="button" onclick="PageSettings.openIconModalForBadge(this)" style="min-width:140px;padding:10px 16px;background:#f3f4f6;border:2px solid #e5e7eb;border-radius:8px;cursor:pointer;display:flex;align-items:center;gap:8px;font-size:14px">
                                        <i class="${iconClass}" style="font-size:18px"></i>
                                        <span>Pilih Icon</span>
                                    </button>
                                    <input type="hidden" class="badge-icon" name="badge_icon[]" value="${b.icon || ''}">
                                    <input type="text" class="badge-text" value="${Utils.escapeHtml(b.text || '')}" placeholder="Text badge" style="flex:1;padding:10px 14px;border:2px solid #e5e7eb;border-radius:8px;font-size:14px">
                                    <button type="button" onclick="this.parentElement.remove()" style="padding:10px 14px;background:#fee2e2;color:#dc2626;border:none;border-radius:8px;cursor:pointer;font-size:16px"><i class="fas fa-trash"></i></button>
                                </div>
                                `;
                            }).join('') : `
                                <div style="display:flex;gap:10px;align-items:center;margin-bottom:10px">
                                    <button type="button" onclick="PageSettings.openIconModalForBadge(this)" style="min-width:140px;padding:10px 16px;background:#f3f4f6;border:2px solid #e5e7eb;border-radius:8px;cursor:pointer;display:flex;align-items:center;gap:8px;font-size:14px">
                                        <i class="fas fa-icons" style="font-size:18px"></i>
                                        <span>Pilih Icon</span>
                                    </button>
                                    <input type="hidden" class="badge-icon" name="badge_icon[]" value="">
                                    <input type="text" class="badge-text" placeholder="Text badge" style="flex:1;padding:10px 14px;border:2px solid #e5e7eb;border-radius:8px;font-size:14px">
                                    <button type="button" onclick="this.parentElement.remove()" style="padding:10px 14px;background:#fee2e2;color:#dc2626;border:none;border-radius:8px;cursor:pointer;font-size:16px"><i class="fas fa-trash"></i></button>
                                </div>
                            `}
                        </div>
                        <button type="button" onclick="PageSettings.addBadge()" style="margin-top:12px;padding:10px 20px;background:#f3f4f6;border:2px dashed #d1d5db;border-radius:8px;cursor:pointer;display:flex;align-items:center;gap:8px;color:#374151;font-size:14px">
                            <i class="fas fa-plus"></i> Tambah Badge
                        </button>
                    </div>
                    <div class="form-actions full-width">
                        <button type="submit" class="btn btn-primary"><i class="fas fa-save"></i> Simpan Hero</button>
                    </div>
                </form>
            </div>

            <div class="card" style="margin-bottom:24px">
                <h3 class="section-title">Features Section</h3>
                <div id="featuresContainer">
                    <div style="margin-bottom:16px">
                        <h4 style="font-size:14px;font-weight:600;margin-bottom:8px">Feature 1</h4>
                        <div style="display:flex;gap:10px;align-items:center;margin-bottom:10px">
                            <button type="button" onclick="PageSettings.openIconModalForFeature(this, 1)" style="min-width:140px;padding:10px 16px;background:#f3f4f6;border:2px solid #e5e7eb;border-radius:8px;cursor:pointer;display:flex;align-items:center;gap:8px;font-size:14px">
                                <i class="fas fa-campground" style="font-size:18px"></i>
                                <span>Pilih Icon</span>
                            </button>
                            <input type="hidden" name="feature1_icon" value="fas fa-campground">
                            <input type="text" name="feature1_title" value="${Utils.escapeHtml(getVal('feature1_title'))}" placeholder="Judul feature" style="flex:1;padding:10px 14px;border:2px solid #e5e7eb;border-radius:8px;font-size:14px">
                        </div>
                        <textarea name="feature1_desc" rows="2" placeholder="Deskripsi feature" style="width:100%;padding:10px 14px;border:2px solid #e5e7eb;border-radius:8px;font-size:14px;resize:vertical">${Utils.escapeHtml(getVal('feature1_desc'))}</textarea>
                    </div>
                    <div style="margin-bottom:16px">
                        <h4 style="font-size:14px;font-weight:600;margin-bottom:8px">Feature 2</h4>
                        <div style="display:flex;gap:10px;align-items:center;margin-bottom:10px">
                            <button type="button" onclick="PageSettings.openIconModalForFeature(this, 2)" style="min-width:140px;padding:10px 16px;background:#f3f4f6;border:2px solid #e5e7eb;border-radius:8px;cursor:pointer;display:flex;align-items:center;gap:8px;font-size:14px">
                                <i class="fas fa-map-marker-alt" style="font-size:18px"></i>
                                <span>Pilih Icon</span>
                            </button>
                            <input type="hidden" name="feature2_icon" value="fas fa-map-marker-alt">
                            <input type="text" name="feature2_title" value="${Utils.escapeHtml(getVal('feature2_title'))}" placeholder="Judul feature" style="flex:1;padding:10px 14px;border:2px solid #e5e7eb;border-radius:8px;font-size:14px">
                        </div>
                        <textarea name="feature2_desc" rows="2" placeholder="Deskripsi feature" style="width:100%;padding:10px 14px;border:2px solid #e5e7eb;border-radius:8px;font-size:14px;resize:vertical">${Utils.escapeHtml(getVal('feature2_desc'))}</textarea>
                    </div>
                    <div>
                        <h4 style="font-size:14px;font-weight:600;margin-bottom:8px">Feature 3</h4>
                        <div style="display:flex;gap:10px;align-items:center;margin-bottom:10px">
                            <button type="button" onclick="PageSettings.openIconModalForFeature(this, 3)" style="min-width:140px;padding:10px 16px;background:#f3f4f6;border:2px solid #e5e7eb;border-radius:8px;cursor:pointer;display:flex;align-items:center;gap:8px;font-size:14px">
                                <i class="fas fa-tags" style="font-size:18px"></i>
                                <span>Pilih Icon</span>
                            </button>
                            <input type="hidden" name="feature3_icon" value="fas fa-tags">
                            <input type="text" name="feature3_title" value="${Utils.escapeHtml(getVal('feature3_title'))}" placeholder="Judul feature" style="flex:1;padding:10px 14px;border:2px solid #e5e7eb;border-radius:8px;font-size:14px">
                        </div>
                        <textarea name="feature3_desc" rows="2" placeholder="Deskripsi feature" style="width:100%;padding:10px 14px;border:2px solid #e5e7eb;border-radius:8px;font-size:14px;resize:vertical">${Utils.escapeHtml(getVal('feature3_desc'))}</textarea>
                    </div>
                </div>
                <div style="margin-top:16px">
                    <button type="button" onclick="PageSettings.saveFeatures()" class="btn btn-primary"><i class="fas fa-save"></i> Simpan Features</button>
                </div>
            </div>

            <div class="card">
                <h3 class="section-title">Kontak & Sosial Media</h3>
                <form id="contactForm" class="form-grid">
                    <div class="form-group full-width">
                        <label>Alamat</label>
                        <textarea name="contact_address" rows="2">${Utils.escapeHtml(getVal('contact_address'))}</textarea>
                    </div>
                    <div class="form-group">
                        <label>Telepon</label>
                        <input type="text" name="contact_phone" value="${Utils.escapeHtml(getVal('contact_phone'))}">
                    </div>
                    <div class="form-group">
                        <label>Email</label>
                        <input type="email" name="contact_email" value="${Utils.escapeHtml(getVal('contact_email'))}">
                    </div>
                    <div class="form-group">
                        <label>Instagram</label>
                        <input type="text" name="social_instagram" value="${Utils.escapeHtml(getVal('social_instagram'))}">
                    </div>
                    <div class="form-group">
                        <label>Facebook</label>
                        <input type="text" name="social_facebook" value="${Utils.escapeHtml(getVal('social_facebook'))}">
                    </div>
                    <div class="form-group">
                        <label>WhatsApp</label>
                        <input type="text" name="social_whatsapp" value="${Utils.escapeHtml(getVal('social_whatsapp'))}">
                    </div>
                    <div class="form-group">
                        <label>YouTube</label>
                        <input type="text" name="social_youtube" value="${Utils.escapeHtml(getVal('social_youtube'))}">
                    </div>
                    <div class="form-actions full-width">
                        <button type="submit" class="btn btn-primary"><i class="fas fa-save"></i> Simpan Kontak</button>
                    </div>
                </form>
            </div>`;

        // Hero form submit
        document.getElementById('heroForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const form = e.target;
            const fd = new FormData(form);

            // Handle hero image upload
            const fileInput = document.getElementById('heroImageFile');
            if (fileInput.files.length > 0) {
                const uploadRes = await API.upload(fileInput.files[0], 'hero');
                if (uploadRes.success) { fd.set('hero_image', uploadRes.data.path || uploadRes.path); }
                else { Utils.notify('Gagal upload gambar', 'error'); return; }
            }

            // Convert badges to JSON
            const badgeIcons = form.querySelectorAll('.badge-icon');
            const badgeTexts = form.querySelectorAll('.badge-text');
            const badges = [];
            badgeIcons.forEach((iconInput, i) => {
                const text = badgeTexts[i]?.value.trim();
                const icon = iconInput.value.trim();
                if (text) badges.push({ icon: icon || 'fas fa-check', text });
            });
            fd.set('hero_badges', JSON.stringify(badges));

            const data = {};
            fd.forEach((v, k) => { data[k] = v; });
            data.action = 'bulk_update';

            const btn = form.querySelector('button[type="submit"]');
            btn.disabled = true;
            const res = await API.post('settings.php?action=bulk_update', data);
            if (res.success) { Utils.notify(res.message); }
            else { Utils.notify(res.message, 'error'); }
            btn.disabled = false;
        });

        // Contact form submit
        document.getElementById('contactForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const form = e.target;
            const fd = new FormData(form);
            const data = {};
            fd.forEach((v, k) => { data[k] = v; });
            data.action = 'bulk_update';

            const btn = form.querySelector('button[type="submit"]');
            btn.disabled = true;
            const res = await API.post('settings.php?action=bulk_update', data);
            if (res.success) { Utils.notify(res.message); }
            else { Utils.notify(res.message, 'error'); }
            btn.disabled = false;
        });
    },

    addBadge() {
        const container = document.getElementById('badgesContainer');
        const entry = document.createElement('div');
        entry.style.cssText = 'display:flex;gap:10px;align-items:center;margin-bottom:10px';
        entry.innerHTML = `
            <button type="button" onclick="PageSettings.openIconModalForBadge(this)" style="min-width:140px;padding:10px 16px;background:#f3f4f6;border:2px solid #e5e7eb;border-radius:8px;cursor:pointer;display:flex;align-items:center;gap:8px;font-size:14px">
                <i class="fas fa-icons" style="font-size:18px"></i>
                <span>Pilih Icon</span>
            </button>
            <input type="hidden" class="badge-icon" name="badge_icon[]" value="">
            <input type="text" class="badge-text" placeholder="Text badge" style="flex:1;padding:10px 14px;border:2px solid #e5e7eb;border-radius:8px;font-size:14px">
            <button type="button" onclick="this.parentElement.remove()" style="padding:10px 14px;background:#fee2e2;color:#dc2626;border:none;border-radius:8px;cursor:pointer;font-size:16px"><i class="fas fa-trash"></i></button>
        `;
        container.appendChild(entry);
    },

    openIconModalForBadge(btn) {
        const icons = [
            'fa-star','fa-heart','fa-check','fa-trophy','fa-medal','fa-award',
            'fa-users','fa-user-check','fa-shield-alt','fa-crown','fa-gem','fa-thumbs-up',
            'fa-campground','fa-mountain','fa-tree','fa-leaf','fa-sun','fa-cloud-sun',
            'fa-fire','fa-map-marker-alt','fa-location-arrow','fa-compass','fa-globe',
            'fa-clock','fa-calendar','fa-phone','fa-envelope','fa-home','fa-building',
            'fa-camera','fa-image','fa-video','fa-music','fa-book','fa-pen',
            'fa-bolt','fa-flag','fa-bell','fa-gift','fa-tag',
            'fa-rocket','fa-plane','fa-car','fa-bus','fa-bicycle','fa-hiking',
            'fa-fish','fa-paw','fa-binoculars','fa-first-aid','fa-toolbox','fa-utensils'
        ];

        const overlay = document.createElement('div');
        overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:9999;display:flex;align-items:center;justify-content:center;';
        overlay.id = 'iconPickerModal';
        
        const modal = document.createElement('div');
        modal.style.cssText = 'background:white;border-radius:16px;max-width:700px;width:90%;max-height:85vh;overflow-y:auto;padding:24px;box-shadow:0 20px 60px rgba(0,0,0,0.3);';
        
        modal.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
                <h3 style="font-size:20px;font-weight:700;margin:0">Pilih Icon</h3>
                <button onclick="PageSettings.closeIconModal()" style="background:#f3f4f6;border:none;width:36px;height:36px;border-radius:8px;cursor:pointer;font-size:20px;display:flex;align-items:center;justify-content:center">&times;</button>
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
        
        // Simpan currentBtn di global variable
        window._currentBadgeBtn = btn;
        
        // Add click handlers untuk icon buttons
        overlay.querySelectorAll('[data-icon]').forEach(iconBtn => {
            iconBtn.onclick = function() {
                const icon = this.dataset.icon;
                PageSettings.selectIconForBadge(this, icon);
            };
        });
        
        overlay.onclick = (e) => { if (e.target === overlay) PageSettings.closeIconModal(); };
    },

    closeIconModal() {
        const modal = document.getElementById('iconPickerModal');
        if (modal) modal.remove();
    },

    openIconModalForFeature(btn, featureNum) {
        // Gunakan fungsi yang sama dengan badge
        window._currentBadgeBtn = btn;
        this.openIconModalForBadge(btn);
    },

    async saveFeatures() {
        const data = {
            action: 'bulk_update',
            feature1_icon: document.querySelector('[name="feature1_icon"]').value,
            feature1_title: document.querySelector('[name="feature1_title"]').value,
            feature1_desc: document.querySelector('[name="feature1_desc"]').value,
            feature2_icon: document.querySelector('[name="feature2_icon"]').value,
            feature2_title: document.querySelector('[name="feature2_title"]').value,
            feature2_desc: document.querySelector('[name="feature2_desc"]').value,
            feature3_icon: document.querySelector('[name="feature3_icon"]').value,
            feature3_title: document.querySelector('[name="feature3_title"]').value,
            feature3_desc: document.querySelector('[name="feature3_desc"]').value
        };

        const res = await API.post('settings.php?action=bulk_update', data);
        if (res.success) { Utils.notify(res.message); }
        else { Utils.notify(res.message, 'error'); }
    },

    selectIconForBadge(btn, icon) {
        console.log('selectIconForBadge called with icon:', icon);
        
        const currentBtn = window._currentBadgeBtn;
        console.log('Current button:', currentBtn);
        
        if (!currentBtn) {
            console.error('Current button not found!');
            return;
        }
        
        // Update icon di button - PENTING: gunakan 'fas fa-xxx' format
        const iconEl = currentBtn.querySelector('i');
        if (iconEl) {
            iconEl.className = `fas ${icon}`;
            console.log('Icon element updated to:', iconEl.className);
        }
        
        // Cari hidden input untuk icon (bisa badge-icon atau feature*_icon)
        let entry = currentBtn.parentElement;
        while (entry && !entry.querySelector('[name*="icon"]')) {
            entry = entry.parentElement;
        }
        
        if (entry) {
            const hiddenInput = entry.querySelector('[name*="icon"]');
            if (hiddenInput) {
                // Simpan dengan format 'fa-xxx' saja (tanpa fas)
                const cleanIcon = icon.startsWith('fa-') ? icon : `fa-${icon.replace('fa-', '')}`;
                hiddenInput.value = cleanIcon;
                console.log('Hidden input updated to:', hiddenInput.value);
            }
        }
        
        console.log('SUCCESS: Selected icon:', icon);
        this.closeIconModal();
    }
};
