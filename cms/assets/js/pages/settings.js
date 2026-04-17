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

        el.innerHTML = `
            <div class="page-header">
                <h2 class="page-title">Settings</h2>
            </div>

            <div class="card" style="margin-bottom:24px">
                <h3 class="section-title">Hero Section</h3>
                <form id="heroForm" class="form-grid">
                    <div class="form-group">
                        <label>Badge Text</label>
                        <input type="text" name="hero_badge" value="${Utils.escapeHtml(getVal('hero_badge'))}">
                    </div>
                    <div class="form-group">
                        <label>Title</label>
                        <input type="text" name="hero_title" value="${Utils.escapeHtml(getVal('hero_title'))}">
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
                        <label>Badges (JSON)</label>
                        <textarea name="hero_badges" rows="2" placeholder='[{"icon":"fas fa-star","text":"Badge 1"}]'>${Utils.escapeHtml(getVal('hero_badges'))}</textarea>
                    </div>
                    <div class="form-actions full-width">
                        <button type="submit" class="btn btn-primary"><i class="fas fa-save"></i> Simpan Hero</button>
                    </div>
                </form>
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
    }
};
