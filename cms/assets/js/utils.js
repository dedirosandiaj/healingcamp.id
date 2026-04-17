/**
 * Healing Camp CMS - Utility Functions
 */
const Utils = {
    formatPrice(price) {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);
    },

    formatDate(dateStr) {
        if (!dateStr) return '-';
        const d = new Date(dateStr);
        return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    },

    formatDateTime(dateStr) {
        if (!dateStr) return '-';
        const d = new Date(dateStr);
        return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    },

    escapeHtml(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    },

    truncate(str, len = 50) {
        if (!str) return '';
        return str.length > len ? str.substring(0, len) + '...' : str;
    },

    imagePath(path) {
        if (!path) return 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect fill="%23e2e8f0" width="100" height="100"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%2394a3b8" font-size="14">No Image</text></svg>';
        if (path.startsWith('http')) return path;
        if (path.startsWith('uploads/')) return path;
        return path;
    },

    statusBadge(status) {
        const map = {
            active: { cls: 'badge-active', label: 'Aktif' },
            inactive: { cls: 'badge-inactive', label: 'Nonaktif' },
            available: { cls: 'badge-active', label: 'Tersedia' },
            rented: { cls: 'badge-warning', label: 'Disewa' },
            maintenance: { cls: 'badge-warning', label: 'Maintenance' },
            pending: { cls: 'badge-warning', label: 'Pending' },
            confirmed: { cls: 'badge-info', label: 'Dikonfirmasi' },
            paid: { cls: 'badge-active', label: 'Dibayar' },
            cancelled: { cls: 'badge-danger', label: 'Dibatalkan' },
            completed: { cls: 'badge-active', label: 'Selesai' }
        };
        const s = map[status] || { cls: 'badge-inactive', label: status || '-' };
        return `<span class="badge ${s.cls}">${s.label}</span>`;
    },

    notify(message, type = 'success') {
        Swal.fire({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
            icon: type,
            title: message,
            didOpen: (toast) => {
                toast.addEventListener('mouseenter', Swal.stopTimer);
                toast.addEventListener('mouseleave', Swal.resumeTimer);
            }
        });
    },

    async confirm(title, text = '') {
        const result = await Swal.fire({
            title,
            text,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#166534',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Ya',
            cancelButtonText: 'Batal'
        });
        return result.isConfirmed;
    },

    loading(show = true) {
        const el = document.getElementById('pageContent');
        if (!el) return;
        if (show) {
            el.innerHTML = '<div class="loading-state"><i class="fas fa-spinner fa-spin fa-2x"></i><p>Memuat data...</p></div>';
        }
    }
};
