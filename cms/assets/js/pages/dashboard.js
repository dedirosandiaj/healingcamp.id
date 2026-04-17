/**
 * Dashboard Page
 */
const PageDashboard = {
    async render() {
        Utils.loading();
        const res = await API.get('dashboard.php?action=stats');
        const data = res.success ? res.data : {};
        const stats = data.stats || {};
        const el = document.getElementById('pageContent');

        el.innerHTML = `
            <div class="welcome-banner">
                <div class="welcome-content">
                    <h2>Selamat Datang Kembali, ${Utils.escapeHtml(App.currentUser?.nama || 'Admin')}! 👋</h2>
                    <p>Kelola website Healing Camp dengan mudah. Pantau booking, kelola peralatan, dan update konten dari satu tempat.</p>
                </div>
                <div class="welcome-illustration"><i class="fas fa-campground"></i></div>
            </div>

            <div class="stats-grid">
                <div class="stat-card equipment">
                    <div class="stat-icon"><i class="fas fa-tools"></i></div>
                    <div class="stat-info">
                        <h3>Total Peralatan</h3>
                        <p class="stat-number" data-target="${stats.equipment || 0}">${stats.equipment || 0}</p>
                        <span class="stat-label">Item tersedia</span>
                    </div>
                </div>
                <div class="stat-card locations">
                    <div class="stat-icon"><i class="fas fa-map-marker-alt"></i></div>
                    <div class="stat-info">
                        <h3>Lokasi Camping</h3>
                        <p class="stat-number" data-target="${stats.locations || 0}">${stats.locations || 0}</p>
                        <span class="stat-label">Spot terdaftar</span>
                    </div>
                </div>
                <div class="stat-card packages">
                    <div class="stat-icon"><i class="fas fa-box-open"></i></div>
                    <div class="stat-info">
                        <h3>Paket Camping</h3>
                        <p class="stat-number" data-target="${stats.packages || 0}">${stats.packages || 0}</p>
                        <span class="stat-label">Paket aktif</span>
                    </div>
                </div>
                <div class="stat-card bookings">
                    <div class="stat-icon"><i class="fas fa-calendar-check"></i></div>
                    <div class="stat-info">
                        <h3>Total Booking</h3>
                        <p class="stat-number" data-target="${stats.bookings || 0}">${stats.bookings || 0}</p>
                        <span class="stat-label">Booking masuk</span>
                    </div>
                </div>
            </div>

            <div class="section">
                <h3 class="section-title">Aksi Cepat</h3>
                <div class="quick-actions">
                    <a href="#/equipment-add" class="action-card">
                        <div class="action-icon equipment"><i class="fas fa-plus"></i></div>
                        <span>Tambah Peralatan</span>
                    </a>
                    <a href="#/locations-add" class="action-card">
                        <div class="action-icon locations"><i class="fas fa-plus"></i></div>
                        <span>Tambah Lokasi</span>
                    </a>
                    <a href="#/packages-add" class="action-card">
                        <div class="action-icon packages"><i class="fas fa-plus"></i></div>
                        <span>Tambah Paket</span>
                    </a>
                    <a href="#/testimonials-add" class="action-card">
                        <div class="action-icon testimonials"><i class="fas fa-plus"></i></div>
                        <span>Tambah Testimoni</span>
                    </a>
                </div>
            </div>

            <div class="section">
                <h3 class="section-title">Booking Terbaru</h3>
                <div class="activity-list" id="recentBookings">
                    ${this.renderRecentBookings(data.recent_bookings || [])}
                </div>
            </div>`;

        this.animateStats();
    },

    renderRecentBookings(bookings) {
        if (!bookings.length) {
            return '<div class="activity-item"><div class="activity-content"><p>Belum ada booking</p></div></div>';
        }
        return bookings.map(b => `
            <div class="activity-item">
                <div class="activity-icon ${b.status === 'confirmed' || b.status === 'paid' ? 'success' : b.status === 'pending' ? 'warning' : 'info'}">
                    <i class="fas fa-calendar"></i>
                </div>
                <div class="activity-content">
                    <p><strong>${Utils.escapeHtml(b.customer_name)}</strong> - ${Utils.escapeHtml(b.booking_code)}</p>
                    <span class="activity-time">${Utils.formatDate(b.created_at)} ${Utils.statusBadge(b.status)}</span>
                </div>
            </div>`).join('');
    },

    animateStats() {
        document.querySelectorAll('.stat-number[data-target]').forEach(el => {
            const target = parseInt(el.dataset.target);
            if (isNaN(target) || target === 0) return;
            el.textContent = '0';
            let current = 0;
            const increment = target / 60;
            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    el.textContent = target.toLocaleString();
                    clearInterval(timer);
                } else {
                    el.textContent = Math.floor(current).toLocaleString();
                }
            }, 16);
        });
    }
};
