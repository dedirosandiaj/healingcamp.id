/**
 * Healing Camp CMS - API Wrapper
 * Handles all fetch requests with session management
 */
const API = {
    baseUrl: 'api/',

    async request(endpoint, options = {}) {
        const url = this.baseUrl + endpoint;
        const config = {
            credentials: 'same-origin',
            ...options
        };

        try {
            const response = await fetch(url, config);

            if (response.status === 401) {
                window.location.hash = '#/login';
                return { success: false, message: 'Session expired' };
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('API Error:', error);
            return { success: false, message: 'Koneksi gagal. Coba lagi.' };
        }
    },

    async get(endpoint) {
        return this.request(endpoint);
    },

    async post(endpoint, formData) {
        if (!(formData instanceof FormData)) {
            const fd = new FormData();
            for (const key in formData) {
                if (formData[key] !== undefined && formData[key] !== null) {
                    fd.append(key, formData[key]);
                }
            }
            formData = fd;
        }
        return this.request(endpoint, {
            method: 'POST',
            body: formData
        });
    },

    async upload(file, folder) {
        const fd = new FormData();
        fd.append('image', file);
        fd.append('folder', folder);
        return this.request('upload.php', {
            method: 'POST',
            body: fd
        });
    }
};
