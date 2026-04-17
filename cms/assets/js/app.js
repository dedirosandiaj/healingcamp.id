/**
 * Healing Camp CMS - Main Application
 * Hash-based SPA router + sidebar + header
 */
const App = {
    currentUser: null,
    currentPage: '',

    async init() {
        // Check auth first
        const res = await API.get('auth.php?action=check');
        if (res.success) {
            this.currentUser = res.data;
            this.renderShell();
            window.addEventListener('hashchange', () => this.route());
            this.route();
        } else {
            this.showLogin();
            window.addEventListener('hashchange', () => this.route());
        }
    },

    route() {
        const hash = window.location.hash || '#/login';
        const parts = hash.replace('#/', '').split('/');
        const page = parts[0] || 'login';
        const param = parts[1] || null;

        if (!this.currentUser && page !== 'login') {
            window.location.hash = '#/login';
            return;
        }

        if (this.currentUser && page === 'login') {
            window.location.hash = '#/dashboard';
            return;
        }

        if (page === 'login') {
            this.showLogin();
            return;
        }

        this.currentPage = page;
        this.updateSidebar();
        this.updateTitle(page);

        const pageMap = {
            'dashboard': () => PageDashboard.render(),
            'equipment': () => PageEquipment.render(),
            'equipment-add': () => PageEquipment.renderForm(),
            'equipment-edit': () => PageEquipment.renderForm(param),
            'categories': () => PageCategories.render(),
            'categories-add': () => PageCategories.renderForm(),
            'categories-edit': () => PageCategories.renderForm(param),
            'locations': () => PageLocations.render(),
            'locations-add': () => PageLocations.renderForm(),
            'locations-edit': () => PageLocations.renderForm(param),
            'packages': () => PagePackages.render(),
            'packages-add': () => PagePackages.renderForm(),
            'packages-edit': () => PagePackages.renderForm(param),
            'bookings': () => PageBookings.render(),
            'bookings-add': () => PageBookings.renderForm(),
            'bookings-edit': () => PageBookings.renderForm(param),
            'testimonials': () => PageTestimonials.render(),
            'testimonials-add': () => PageTestimonials.renderForm(),
            'testimonials-edit': () => PageTestimonials.renderForm(param),
            'users': () => PageUsers.render(),
            'users-add': () => PageUsers.renderForm(),
            'users-edit': () => PageUsers.renderForm(param),
            'settings': () => PageSettings.render()
        };

        const handler = pageMap[page];
        if (handler) {
            handler();
        } else {
            document.getElementById('pageContent').innerHTML = '<div class="empty-state"><i class="fas fa-exclamation-triangle"></i><p>Halaman tidak ditemukan</p></div>';
        }
    },

    showLogin() {
        document.body.classList.add('auth-page');
        document.getElementById('app').innerHTML = '';
        document.getElementById('app').appendChild(this.createLoginPage());
    },

    createLoginPage() {
        const div = document.createElement('div');
        div.className = 'login-container';
        div.innerHTML = `
            <div class="login-box">
                <div class="login-header">
                    <h1>Healing Camp</h1>
                    <p>CMS Admin Panel</p>
                </div>
                <form id="loginForm" class="login-form">
                    <div class="form-group">
                        <label for="username">Username</label>
                        <input type="text" id="username" name="username" placeholder="Masukkan username" required autofocus>
                    </div>
                    <div class="form-group">
                        <label for="password">Password</label>
                        <input type="password" id="password" name="password" placeholder="Masukkan password" required>
                    </div>
                    <div class="form-group">
                        <button type="submit" class="btn-login" id="btnLogin">Masuk</button>
                    </div>
                </form>
                <div class="login-footer">
                    <p>Default: admin / admin123</p>
                </div>
            </div>`;

        setTimeout(() => {
            const form = document.getElementById('loginForm');
            if (form) {
                form.addEventListener('submit', async (e) => {
                    e.preventDefault();
                    const btn = document.getElementById('btnLogin');
                    btn.disabled = true;
                    btn.textContent = 'Memproses...';

                    const fd = new FormData();
                    fd.append('action', 'login');
                    fd.append('username', document.getElementById('username').value);
                    fd.append('password', document.getElementById('password').value);

                    const res = await API.post('auth.php', fd);
                    if (res.success) {
                        App.currentUser = res.data;
                        App.renderShell();
                        window.location.hash = '#/dashboard';
                    } else {
                        Swal.fire({ icon: 'error', title: 'Login Gagal', text: res.message, confirmButtonColor: '#166534' });
                        btn.disabled = false;
                        btn.textContent = 'Masuk';
                    }
                });
            }
        }, 50);

        return div;
    },

    renderShell() {
        document.body.classList.remove('auth-page');
        const app = document.getElementById('app');
        app.innerHTML = `
            <div class="dashboard-container">
                <aside class="sidebar" id="sidebar">
                    <div class="sidebar-header">
                        <div class="logo">
                            <i class="fas fa-campground"></i>
                            <div>
                                <h2>Healing Camp</h2>
                                <p>CMS Admin</p>
                            </div>
                        </div>
                    </div>
                    <nav class="sidebar-nav">
                        <div class="nav-section">
                            <span class="nav-label">Menu Utama</span>
                            <ul>
                                <li data-page="dashboard"><a href="#/dashboard"><i class="fas fa-home"></i><span>Dashboard</span></a></li>
                            </ul>
                        </div>
                        <div class="nav-section">
                            <span class="nav-label">Manajemen Konten</span>
                            <ul>
                                <li data-page="bookings"><a href="#/bookings"><i class="fas fa-calendar-check"></i><span>Bookings</span></a></li>
                                <li data-page="locations"><a href="#/locations"><i class="fas fa-map-marker-alt"></i><span>Lokasi Camping</span></a></li>
                                <li data-page="packages"><a href="#/packages"><i class="fas fa-box-open"></i><span>Paket Camping</span></a></li>
                                <li data-page="equipment"><a href="#/equipment"><i class="fas fa-tools"></i><span>Peralatan Camping</span></a></li>
                                <li data-page="categories"><a href="#/categories"><i class="fas fa-tags"></i><span>Kategori</span></a></li>
                                <li data-page="testimonials"><a href="#/testimonials"><i class="fas fa-comment"></i><span>Testimoni</span></a></li>
                                <li data-page="users"><a href="#/users"><i class="fas fa-users"></i><span>Users</span></a></li>
                            </ul>
                        </div>
                        <div class="nav-section">
                            <span class="nav-label">Pengaturan</span>
                            <ul>
                                <li data-page="settings"><a href="#/settings"><i class="fas fa-cog"></i><span>Settings</span></a></li>
                            </ul>
                        </div>
                    </nav>
                    <div class="sidebar-footer">
                        <a href="#" class="logout-btn" id="logoutBtn"><i class="fas fa-sign-out-alt"></i><span>Logout</span></a>
                    </div>
                </aside>
                <main class="main-content">
                    <header class="header">
                        <div class="header-left">
                            <button class="menu-toggle" id="menuToggle"><i class="fas fa-bars"></i></button>
                            <h1 id="pageTitle">Dashboard</h1>
                        </div>
                        <div class="header-right">
                            <div class="header-actions">
                                <a href="../index.html" target="_blank" class="btn-view-site"><i class="fas fa-external-link-alt"></i><span>Lihat Website</span></a>
                            </div>
                            <div class="user-menu">
                                <div class="user-info">
                                    <span class="user-name">${Utils.escapeHtml(this.currentUser?.nama || 'Admin')}</span>
                                    <span class="user-role">${Utils.escapeHtml(this.currentUser?.role || 'admin')}</span>
                                </div>
                                <div class="user-avatar">${(this.currentUser?.nama || 'A').charAt(0).toUpperCase()}</div>
                            </div>
                        </div>
                    </header>
                    <div class="content" id="pageContent"></div>
                </main>
            </div>`;

        // Mobile sidebar toggle
        const toggle = document.getElementById('menuToggle');
        const sidebar = document.getElementById('sidebar');
        const overlay = document.createElement('div');
        overlay.className = 'sidebar-overlay';
        document.body.appendChild(overlay);

        toggle.addEventListener('click', () => {
            sidebar.classList.toggle('active');
            overlay.classList.toggle('active');
        });
        overlay.addEventListener('click', () => {
            sidebar.classList.remove('active');
            overlay.classList.remove('active');
        });

        // Logout
        document.getElementById('logoutBtn').addEventListener('click', async (e) => {
            e.preventDefault();
            const ok = await Utils.confirm('Konfirmasi Logout', 'Apakah Anda yakin ingin keluar?');
            if (ok) {
                await API.post('auth.php', { action: 'logout' });
                App.currentUser = null;
                window.location.hash = '#/login';
                App.showLogin();
            }
        });
    },

    updateSidebar() {
        document.querySelectorAll('.sidebar-nav li').forEach(li => {
            const page = li.dataset.page;
            if (page && this.currentPage.startsWith(page)) {
                li.classList.add('active');
            } else {
                li.classList.remove('active');
            }
        });
    },

    updateTitle(page) {
        const titles = {
            'dashboard': 'Dashboard',
            'equipment': 'Peralatan Camping', 'equipment-add': 'Tambah Peralatan', 'equipment-edit': 'Edit Peralatan',
            'categories': 'Kategori', 'categories-add': 'Tambah Kategori', 'categories-edit': 'Edit Kategori',
            'locations': 'Lokasi Camping', 'locations-add': 'Tambah Lokasi', 'locations-edit': 'Edit Lokasi',
            'packages': 'Paket Camping', 'packages-add': 'Tambah Paket', 'packages-edit': 'Edit Paket',
            'bookings': 'Bookings', 'bookings-add': 'Tambah Booking', 'bookings-edit': 'Edit Booking',
            'testimonials': 'Testimoni', 'testimonials-add': 'Tambah Testimoni', 'testimonials-edit': 'Edit Testimoni',
            'users': 'Users', 'users-add': 'Tambah User', 'users-edit': 'Edit User',
            'settings': 'Settings'
        };
        const el = document.getElementById('pageTitle');
        if (el) el.textContent = titles[page] || 'Dashboard';
        document.title = (titles[page] || 'Dashboard') + ' - Healing Camp CMS';
    }
};

// Start app
document.addEventListener('DOMContentLoaded', () => App.init());
