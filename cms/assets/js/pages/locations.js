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
                            ${items.map(i => {
                                let imageUrl = '';
                                try {
                                    const images = i.images ? JSON.parse(i.images) : [];
                                    imageUrl = images.length > 0 ? images[0] : '';
                                } catch(e) {
                                    imageUrl = i.image || '';
                                }
                                return `<tr>
                                    <td><img src="${Utils.imagePath(imageUrl)}" class="table-img" alt="${Utils.escapeHtml(i.name)}"></td>
                                    <td><strong>${Utils.escapeHtml(i.name)}</strong></td>
                                    <td>${Utils.escapeHtml(i.region || '-')}</td>
                                    <td>${Utils.formatPrice(i.price_per_night)}</td>
                                    <td>${Utils.statusBadge(i.status)}</td>
                                    <td class="actions">
                                        <a href="#/locations-edit/${i.id}" class="btn btn-sm btn-warning"><i class="fas fa-edit"></i></a>
                                        <button class="btn btn-sm btn-danger" onclick="PageLocations.delete(${i.id})"><i class="fas fa-trash"></i></button>
                                    </td>
                                </tr>`;
                            }).join('')}
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
        
        // Fetch categories
        const catRes = await API.get('categories.php?action=list');
        const categories = catRes.success ? catRes.data : [];
        
        // Parse existing facilities
        let existingFacilities = [];
        try {
            existingFacilities = JSON.parse(item.facilities || '[]');
        } catch (e) {}
        
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
                        <label>Fasilitas (pilih dari kategori)</label>
                        <div id="facilitiesContainer" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:10px;margin-top:8px">
                            ${categories.map(cat => `
                                <label style="display:flex;align-items:center;gap:8px;padding:10px;background:#f9fafb;border:2px solid #e5e7eb;border-radius:8px;cursor:pointer;transition:all 0.2s" 
                                       onmouseover="this.style.borderColor='#10b981';this.style.background='#f0fdf4'" 
                                       onmouseout="if(!this.querySelector('input').checked){this.style.borderColor='#e5e7eb';this.style.background='#f9fafb'}">
                                    <input type="checkbox" name="facilities[]" value="${Utils.escapeHtml(cat.name)}" 
                                           ${existingFacilities.includes(cat.name) ? 'checked' : ''}
                                           onchange="this.parentElement.style.borderColor=this.checked?'#10b981':'#e5e7eb';this.parentElement.style.background=this.checked?'#f0fdf4':'#f9fafb'"
                                           style="width:18px;height:18px;cursor:pointer">
                                    <i class="${cat.icon || 'fas fa-folder'}" style="color:#10b981"></i>
                                    <span style="font-size:14px">${Utils.escapeHtml(cat.name)}</span>
                                </label>
                            `).join('')}
                        </div>
                        <input type="hidden" name="facilities" id="facilitiesInput">
                    </div>
                    <div class="form-group full-width">
                        <label>Koordinat</label>
                        <div style="margin-bottom:10px;position:relative">
                            <input type="text" id="locationSearch" placeholder="Ketik alamat untuk mencari lokasi..." style="width:100%;padding:12px 14px;border:2px solid #e5e7eb;border-radius:8px;font-size:14px">
                            <div id="searchResults" style="position:absolute;top:100%;left:0;right:0;max-height:300px;overflow-y:auto;z-index:1000;background:white;border:2px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px;box-shadow:0 4px 6px rgba(0,0,0,0.1);display:none"></div>
                        </div>
                        <div style="display:flex;gap:10px;align-items:center">
                            <input type="text" name="coordinates" id="coordinatesInput" value="${Utils.escapeHtml(item.coordinates || '')}" placeholder="Koordinat akan terisi otomatis setelah memilih lokasi" style="flex:1;padding:10px 14px;border:2px solid #e5e7eb;border-radius:8px;font-size:14px" readonly>
                            <button type="button" onclick="PageLocations.useCurrentLocation()" class="btn btn-sm btn-secondary"><i class="fas fa-location-crosshairs"></i> Lokasi Saya</button>
                        </div>
                        <small style="color:#6b7280;margin-top:4px;display:block">Ketik alamat di atas, pilih dari hasil pencarian, atau gunakan tombol "Lokasi Saya"</small>
                    </div>
                    <div class="form-group full-width">
                        <label>Gambar (bisa lebih dari 1)</label>
                        <input type="file" id="imageFiles" accept="image/*" multiple onchange="PageLocations.previewImages(this)">
                        <div id="imagePreview" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:10px;margin-top:10px">
                            ${(() => {
                                let images = [];
                                try {
                                    images = item.images ? JSON.parse(item.images) : [];
                                } catch(e) {
                                    if (item.image) images = [item.image];
                                }
                                return images.map((img, idx) => `
                                    <div style="position:relative;border-radius:8px;overflow:hidden;border:2px solid #e5e7eb">
                                        <img src="${Utils.imagePath(img)}" alt="" style="width:100%;height:150px;object-fit:cover">
                                        <button type="button" onclick="PageLocations.removeImage(${idx})" style="position:absolute;top:5px;right:5px;background:rgba(239,68,68,0.9);color:white;border:none;width:28px;height:28px;border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:16px">&times;</button>
                                        ${idx === 0 ? '<div style="position:absolute;bottom:0;left:0;right:0;background:rgba(16,185,129,0.9);color:white;padding:4px;text-align:center;font-size:12px;font-weight:600">Utama</div>' : ''}
                                        <input type="hidden" name="existing_images[]" value="${img}">
                                    </div>
                                `).join('');
                            })()}
                        </div>
                        <small style="color:#6b7280;margin-top:4px;display:block">Gambar pertama akan menjadi thumbnail utama. Format: JPG, PNG, WebP (Max 5MB per file)</small>
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

            // Convert facilities checkboxes to JSON
            const facilitiesCheckboxes = form.querySelectorAll('input[name="facilities[]"]:checked');
            const facilities = Array.from(facilitiesCheckboxes).map(cb => cb.value);
            fd.set('facilities', JSON.stringify(facilities));

            // Check if images were removed
            const existingInputs = form.querySelectorAll('[name="existing_images[]"]');
            const currentImages = Array.from(existingInputs).map(input => input.value);
            const fileInput = document.getElementById('imageFiles');
            const previewDiv = document.getElementById('imagePreview');
            const remainingImages = previewDiv ? previewDiv.querySelectorAll('div').length : 0;
            
            // If editing
            if (id) {
                // If new files uploaded, mark old images for deletion
                if (fileInput.files.length > 0) {
                    fd.set('old_images', JSON.stringify(currentImages));
                    
                    const uploadedPaths = [];
                    for (const file of Array.from(fileInput.files)) {
                        const uploadRes = await API.upload(file, 'locations');
                        if (uploadRes.success) {
                            uploadedPaths.push(uploadRes.data.path || uploadRes.path);
                        } else {
                            Utils.notify('Gagal upload gambar: ' + file.name, 'error');
                            return;
                        }
                    }
                    fd.set('new_images', JSON.stringify(uploadedPaths));
                } 
                // If no new files and images were removed, mark removed images for deletion
                else if (remainingImages < currentImages.length) {
                    const removedImages = currentImages.filter(img => {
                        // Check if this image is still in the preview
                        const stillExists = previewDiv && Array.from(previewDiv.querySelectorAll('input[type="hidden"]')).some(input => input.value === img);
                        return !stillExists;
                    });
                    if (removedImages.length > 0) {
                        fd.set('removed_images', JSON.stringify(removedImages));
                    }
                }
            }

            const btn = form.querySelector('button[type="submit"]');
            btn.disabled = true;
            const res = await API.post(`locations.php?action=${id ? 'update' : 'create'}${id ? '&id=' + id : ''}`, fd);
            if (res.success) { Utils.notify(res.message); window.location.hash = '#/locations'; }
            else { Utils.notify(res.message, 'error'); btn.disabled = false; }
        });

        // Initialize Google Places autocomplete
        this.initGoogleSearch();
    },

    initGoogleSearch() {
        const searchInput = document.getElementById('locationSearch');
        const resultsDiv = document.getElementById('searchResults');
        let debounceTimer;

        searchInput.addEventListener('input', (e) => {
            clearTimeout(debounceTimer);
            const query = e.target.value.trim();
            
            if (query.length < 3) {
                resultsDiv.style.display = 'none';
                return;
            }

            debounceTimer = setTimeout(() => {
                this.searchAddress(query);
            }, 500);
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('#locationSearch') && !e.target.closest('#searchResults')) {
                resultsDiv.style.display = 'none';
            }
        });
    },

    async searchAddress(query) {
        const resultsDiv = document.getElementById('searchResults');
        
        try {
            console.log('Searching for:', query);
            
            // Cek apakah input adalah koordinat (lat,lng) atau Plus Code
            const coordMatch = query.match(/(-?\d+\.\d+)[,\s]+(-?\d+\.\d+)/);
            const plusCodeMatch = query.match(/^([A-Z0-9]{2,8}\+[A-Z0-9]{2,3})/);
            
            let directResults = [];
            
            // Jika koordinat langsung
            if (coordMatch) {
                const lat = parseFloat(coordMatch[1]);
                const lng = parseFloat(coordMatch[2]);
                directResults.push({
                    type: 'coordinate',
                    lat: lat,
                    lng: lng,
                    name: `Koordinat: ${lat.toFixed(6)}, ${lng.toFixed(6)}`
                });
            }
            // Jika Plus Code (contoh: 9W2G+8P3)
            else if (plusCodeMatch) {
                try {
                    const plusCode = plusCodeMatch[1];
                    console.log('Searching Plus Code:', plusCode);
                    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(plusCode + ' Bogor, Indonesia')}&limit=1`);
                    const results = await response.json();
                    console.log('Plus Code results:', results);
                    
                    if (results.length > 0) {
                        directResults.push({
                            type: 'pluscode',
                            lat: parseFloat(results[0].lat),
                            lng: parseFloat(results[0].lon),
                            name: `Plus Code: ${plusCode}`
                        });
                    }
                } catch (e) {
                    console.error('Plus Code error:', e);
                }
            }
            
            // Jika ada hasil langsung (koordinat atau plus code), tampilkan
            if (directResults.length > 0) {
                resultsDiv.innerHTML = directResults.map(r => `
                    <div onclick="PageLocations.selectLocation(${r.lat}, ${r.lng}, '${r.name}')" 
                         style="padding:12px;border-bottom:1px solid #f3f4f6;cursor:pointer;transition:all 0.2s;background:#f0fdf4"
                         onmouseover="this.style.background='#d1fae5'" 
                         onmouseout="this.style.background='#f0fdf4'">
                        <div style="display:flex;align-items:start;gap:8px">
                            <i class="fas fa-crosshairs" style="color:#10b981;margin-top:3px"></i>
                            <div>
                                <div style="font-size:14px;font-weight:600;color:#1f2937">${r.name}</div>
                                <div style="font-size:12px;color:#6b7280;margin-top:2px">Klik untuk menggunakan koordinat ini</div>
                            </div>
                        </div>
                    </div>
                `).join('');
                resultsDiv.style.display = 'block';
                return;
            }
            
            // Jika tidak ada hasil langsung, cari dari database dan OSM
            let filteredDbResults = [];
            let osmResults = [];
            
            // Cari dari database lokasi yang sudah ada
            try {
                const dbResponse = await API.get(`locations.php?action=list&search=${encodeURIComponent(query)}`);
                console.log('DB Response:', dbResponse);
                
                const dbResults = dbResponse.success && dbResponse.data ? dbResponse.data : [];
                
                // Filter yang sesuai dengan query
                filteredDbResults = dbResults.filter(loc => 
                    loc.name && loc.name.toLowerCase().includes(query.toLowerCase())
                ).slice(0, 5);
                
                console.log('Filtered DB results:', filteredDbResults);
            } catch (dbError) {
                console.error('DB search error:', dbError);
            }
            
            // Juga cari dari OpenStreetMap
            try {
                const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`);
                osmResults = await response.json();
                console.log('OSM Results:', osmResults);
            } catch (e) {
                console.error('OSM Error:', e);
            }
            
            if (filteredDbResults.length === 0 && osmResults.length === 0) {
                resultsDiv.innerHTML = '<div style="padding:12px;color:#6b7280;text-align:center">Lokasi tidak ditemukan. Coba gunakan Plus Code atau koordinat dari Google Maps</div>';
                resultsDiv.style.display = 'block';
                return;
            }

            let html = '';
            
            // Tampilkan hasil dari database
            if (filteredDbResults.length > 0) {
                html += '<div style="padding:8px 12px;font-size:12px;font-weight:600;color:#10b981;background:#f0fdf4">Dari Database</div>';
                html += filteredDbResults.map(loc => `
                    <div onclick="PageLocations.selectLocation(${loc.lat || 0}, ${loc.lng || 0}, '${Utils.escapeHtml(loc.name).replace(/'/g, "\\'")}')" 
                         style="padding:12px;border-bottom:1px solid #f3f4f6;cursor:pointer;transition:all 0.2s"
                         onmouseover="this.style.background='#f0fdf4'" 
                         onmouseout="this.style.background='white'">
                        <div style="display:flex;align-items:start;gap:8px">
                            <i class="fas fa-campground" style="color:#10b981;margin-top:3px"></i>
                            <div>
                                <div style="font-size:14px;font-weight:500;color:#1f2937">${loc.name}</div>
                                ${loc.coordinates ? `<div style="font-size:12px;color:#6b7280;margin-top:2px">${loc.coordinates}</div>` : ''}
                            </div>
                        </div>
                    </div>
                `).join('');
            }
            
            // Tampilkan hasil dari OpenStreetMap
            if (osmResults.length > 0) {
                html += '<div style="padding:8px 12px;font-size:12px;font-weight:600;color:#3b82f6;background:#eff6ff">Dari Peta</div>';
                html += osmResults.map(r => `
                    <div onclick="PageLocations.selectLocation(${r.lat}, ${r.lon}, '${Utils.escapeHtml(r.display_name).replace(/'/g, "\\'")}')" 
                         style="padding:12px;border-bottom:1px solid #f3f4f6;cursor:pointer;transition:all 0.2s"
                         onmouseover="this.style.background='#f0fdf4'" 
                         onmouseout="this.style.background='white'">
                        <div style="display:flex;align-items:start;gap:8px">
                            <i class="fas fa-map-marker-alt" style="color:#3b82f6;margin-top:3px"></i>
                            <div>
                                <div style="font-size:14px;font-weight:500;color:#1f2937">${r.display_name.split(',')[0]}</div>
                                <div style="font-size:12px;color:#6b7280;margin-top:2px">${r.display_name}</div>
                            </div>
                        </div>
                    </div>
                `).join('');
            }
            
            resultsDiv.innerHTML = html;
            resultsDiv.style.display = 'block';
        } catch (error) {
            console.error('Search error:', error);
            resultsDiv.innerHTML = '<div style="padding:12px;color:#ef4444;text-align:center">Gagal mencari lokasi</div>';
            resultsDiv.style.display = 'block';
        }
    },

    selectLocation(lat, lng, address) {
        const coordsStr = `${parseFloat(lat).toFixed(6)}, ${parseFloat(lng).toFixed(6)}`;
        document.getElementById('coordinatesInput').value = coordsStr;
        document.getElementById('locationSearch').value = address.split(',')[0];
        document.getElementById('searchResults').style.display = 'none';
        
        Utils.notify('Lokasi berhasil dipilih!', 'success');
    },

    useCurrentLocation() {
        if (!navigator.geolocation) {
            Utils.notify('Browser tidak mendukung geolocation', 'error');
            return;
        }

        Utils.notify('Mendapatkan lokasi...', 'info');

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                const coordsStr = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
                document.getElementById('coordinatesInput').value = coordsStr;
                Utils.notify('Lokasi berhasil didapatkan!', 'success');
            },
            (error) => {
                Utils.notify('Gagal mendapatkan lokasi. Pastikan GPS aktif.', 'error');
            },
            { enableHighAccuracy: true }
        );
    },

    async delete(id) {
        const ok = await Utils.confirm('Hapus Lokasi?', 'Data yang dihapus tidak bisa dikembalikan.');
        if (!ok) return;
        const res = await API.get(`locations.php?action=delete&id=${id}`);
        if (res.success) { Utils.notify(res.message); this.render(); }
        else { Utils.notify(res.message, 'error'); }
    },
    
    previewImages(input) {
        const preview = document.getElementById('imagePreview');
        const files = input.files;
            
        Array.from(files).forEach(file => {
            if (!file.type.startsWith('image/')) return;
                
            const reader = new FileReader();
            reader.onload = (e) => {
                const idx = preview.querySelectorAll('div').length;
                const div = document.createElement('div');
                div.style.cssText = 'position:relative;border-radius:8px;overflow:hidden;border:2px solid #e5e7eb';
                div.innerHTML = `
                    <img src="${e.target.result}" alt="" style="width:100%;height:150px;object-fit:cover">
                    <button type="button" onclick="this.parentElement.remove()" style="position:absolute;top:5px;right:5px;background:rgba(239,68,68,0.9);color:white;border:none;width:28px;height:28px;border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:16px">&times;</button>
                    ${idx === 0 ? '<div style="position:absolute;bottom:0;left:0;right:0;background:rgba(16,185,129,0.9);color:white;padding:4px;text-align:center;font-size:12px;font-weight:600">Utama</div>' : ''}
                `;
                preview.appendChild(div);
            };
            reader.readAsDataURL(file);
        });
    },
    
    removeImage(idx) {
        const preview = document.getElementById('imagePreview');
        const images = preview.querySelectorAll('div');
        if (images[idx]) {
            images[idx].remove();
        }
    },
};
