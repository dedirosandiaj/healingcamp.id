/**
 * Bookings CRUD Page
 */
const PageBookings = {
    async render() {
        Utils.loading();
        const res = await API.get('bookings.php?action=list');
        const items = res.success ? res.data : [];
        const el = document.getElementById('pageContent');

        el.innerHTML = `
            <div class="page-header">
                <h2 class="page-title">Bookings</h2>
                <a href="#/bookings-add" class="btn btn-primary"><i class="fas fa-plus"></i> Tambah</a>
            </div>
            <div class="card">
                ${items.length ? `
                <div class="table-responsive">
                    <table class="table">
                        <thead><tr>
                            <th>Kode</th><th>Customer</th><th>Tipe</th><th>Check In</th><th>Check Out</th><th>Total</th><th>Status</th><th>Aksi</th>
                        </tr></thead>
                        <tbody>
                            ${items.map(i => `<tr>
                                <td><strong>${Utils.escapeHtml(i.booking_code)}</strong></td>
                                <td>${Utils.escapeHtml(i.customer_name)}<br><small>${Utils.escapeHtml(i.customer_phone || '')}</small></td>
                                <td>${Utils.escapeHtml(i.booking_type)}</td>
                                <td>${Utils.formatDate(i.check_in)}</td>
                                <td>${Utils.formatDate(i.check_out)}</td>
                                <td>${Utils.formatPrice(i.total_price)}</td>
                                <td>${Utils.statusBadge(i.status)}</td>
                                <td class="actions">
                                    <a href="#/bookings-edit/${i.id}" class="btn btn-sm btn-warning"><i class="fas fa-edit"></i></a>
                                    <button class="btn btn-sm btn-danger" onclick="PageBookings.delete(${i.id})"><i class="fas fa-trash"></i></button>
                                </td>
                            </tr>`).join('')}
                        </tbody>
                    </table>
                </div>` : '<div class="empty-state"><i class="fas fa-calendar-check"></i><p>Belum ada booking</p></div>'}
            </div>`;
    },

    async renderForm(id) {
        Utils.loading();
        let item = {};
        if (id) {
            const res = await API.get(`bookings.php?action=get&id=${id}`);
            if (!res.success) { Utils.notify(res.message, 'error'); window.location.hash = '#/bookings'; return; }
            item = res.data;
        }
        const el = document.getElementById('pageContent');
        const types = ['equipment','location','package'];
        const statuses = ['pending','confirmed','paid','cancelled','completed'];

        el.innerHTML = `
            <div class="page-header">
                <h2 class="page-title">${id ? 'Edit' : 'Tambah'} Booking</h2>
                <a href="#/bookings" class="btn btn-secondary"><i class="fas fa-arrow-left"></i> Kembali</a>
            </div>
            <div class="card">
                <form id="bookingForm" class="form-grid">
                    <div class="form-group">
                        <label>Nama Customer *</label>
                        <input type="text" name="customer_name" value="${Utils.escapeHtml(item.customer_name || '')}" required>
                    </div>
                    <div class="form-group">
                        <label>Email</label>
                        <input type="email" name="customer_email" value="${Utils.escapeHtml(item.customer_email || '')}">
                    </div>
                    <div class="form-group">
                        <label>Telepon</label>
                        <input type="text" name="customer_phone" value="${Utils.escapeHtml(item.customer_phone || '')}">
                    </div>
                    <div class="form-group">
                        <label>Tipe Booking *</label>
                        <select name="booking_type" id="bookingType" required>
                            <option value="">-- Pilih --</option>
                            ${types.map(t => `<option value="${t}" ${item.booking_type === t ? 'selected' : ''}>${t}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Item ID</label>
                        <input type="number" name="item_id" value="${item.item_id || 0}" min="0">
                    </div>
                    <div class="form-group">
                        <label>Quantity</label>
                        <input type="number" name="quantity" value="${item.quantity || 1}" min="1">
                    </div>
                    <div class="form-group">
                        <label>Check In</label>
                        <input type="date" name="check_in" value="${item.check_in ? item.check_in.split(' ')[0] : ''}">
                    </div>
                    <div class="form-group">
                        <label>Check Out</label>
                        <input type="date" name="check_out" value="${item.check_out ? item.check_out.split(' ')[0] : ''}">
                    </div>
                    <div class="form-group">
                        <label>Total Harga (Rp)</label>
                        <input type="number" name="total_price" value="${item.total_price || 0}" min="0">
                    </div>
                    <div class="form-group">
                        <label>Status</label>
                        <select name="status">
                            ${statuses.map(s => `<option value="${s}" ${item.status === s ? 'selected' : ''}>${s}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group full-width">
                        <label>Catatan</label>
                        <textarea name="notes" rows="3">${Utils.escapeHtml(item.notes || '')}</textarea>
                    </div>
                    <div class="form-actions full-width">
                        <button type="submit" class="btn btn-primary"><i class="fas fa-save"></i> Simpan</button>
                        <a href="#/bookings" class="btn btn-secondary">Batal</a>
                    </div>
                </form>
            </div>`;

        document.getElementById('bookingForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const form = e.target;
            const fd = new FormData(form);
            fd.append('action', id ? 'update' : 'create');
            if (id) fd.append('id', id);

            const btn = form.querySelector('button[type="submit"]');
            btn.disabled = true;
            const res = await API.post(`bookings.php?action=${id ? 'update' : 'create'}${id ? '&id=' + id : ''}`, fd);
            if (res.success) { Utils.notify(res.message); window.location.hash = '#/bookings'; }
            else { Utils.notify(res.message, 'error'); btn.disabled = false; }
        });
    },

    async delete(id) {
        const ok = await Utils.confirm('Hapus Booking?', 'Data yang dihapus tidak bisa dikembalikan.');
        if (!ok) return;
        const res = await API.get(`bookings.php?action=delete&id=${id}`);
        if (res.success) { Utils.notify(res.message); this.render(); }
        else { Utils.notify(res.message, 'error'); }
    }
};
