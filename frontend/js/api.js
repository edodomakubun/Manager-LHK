/**
 * ========================================================
 * 🌐 API CLIENT WRAPPER - CMS MANAGER LHK
 * ========================================================
 */

const Api = {
  // Ganti baseUrl jika dipanggil dari domain terpisah, atau biarkan kosong jika 1 origin
  baseUrl: window.location.origin.includes(':8787') || window.location.origin.includes(':3000') || window.location.origin.includes(':5500') || window.location.origin.includes('file:')
    ? 'http://127.0.0.1:8787'
    : '',

  getToken: function () {
    return localStorage.getItem('lhk_token') || '';
  },

  setToken: function (token) {
    if (token) {
      localStorage.setItem('lhk_token', token);
    } else {
      localStorage.removeItem('lhk_token');
    }
  },

  request: async function (endpoint, options = {}) {
    const url = (endpoint.startsWith('http') ? endpoint : (Api.baseUrl + endpoint));
    const token = Api.getToken();

    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers
      });

      // Handle 401 Unauthorized
      if (response.status === 401 && !endpoint.includes('/api/auth/login')) {
        Api.setToken(null);
        window.dispatchEvent(new CustomEvent('auth:expired'));
        throw new Error('Sesi Anda telah kedaluwarsa. Silakan login kembali.');
      }

      const data = await response.json();
      if (!response.ok && !data.sukses) {
        throw new Error(data.pesan || `HTTP Error ${response.status}`);
      }

      return data;
    } catch (err) {
      console.error(`API Error [${endpoint}]:`, err);
      throw err;
    }
  },

  // --- AUTH ---
  login: (username, password) => Api.request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password })
  }),

  getMe: () => Api.request('/api/auth/me'),

  changePassword: (oldPassword, newPassword) => Api.request('/api/auth/change-password', {
    method: 'POST',
    body: JSON.stringify({ oldPassword, newPassword })
  }),

  // --- DASHBOARD ---
  getDashboardMetrics: () => Api.request('/api/dashboard/metrics'),

  // --- LHK RECORDS ---
  getLhkList: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return Api.request(`/api/lhk?${q}`);
  },

  getLhkDetail: (id) => Api.request(`/api/lhk/${id}`),

  saveLhk: (dataForm) => Api.request('/api/lhk', {
    method: 'POST',
    body: JSON.stringify(dataForm)
  }),

  updateLhk: (id, dataEdit) => Api.request(`/api/lhk/${id}`, {
    method: 'PUT',
    body: JSON.stringify(dataEdit)
  }),

  deleteLhk: (id) => Api.request(`/api/lhk/${id}`, {
    method: 'DELETE'
  }),

  // --- CLASSES ---
  getClasses: (userId) => Api.request(`/api/classes${userId ? '?userId=' + userId : ''}`),

  setClasses: (userId, classes) => Api.request('/api/classes', {
    method: 'POST',
    body: JSON.stringify({ userId, classes })
  }),

  // --- CP & TP ---
  getCpTpList: (kelas, userId) => {
    const q = new URLSearchParams();
    if (kelas) q.append('kelas', kelas);
    if (userId) q.append('userId', userId);
    return Api.request(`/api/cptp?${q.toString()}`);
  },

  saveCpTp: (data) => Api.request('/api/cptp', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  updateCpTp: (id, cp, tp) => Api.request(`/api/cptp/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ cp, tp })
  }),

  deleteCpTp: (id) => Api.request(`/api/cptp/${id}`, {
    method: 'DELETE'
  }),

  // --- ARSIP DOKUMEN CETAK ---
  getDocuments: (userId) => Api.request(`/api/documents${userId ? '?userId=' + userId : ''}`),

  exportDocument: (params) => Api.request('/api/documents/export', {
    method: 'POST',
    body: JSON.stringify(params)
  }),

  deleteDocument: (id) => Api.request(`/api/documents/${id}`, {
    method: 'DELETE'
  }),

  // --- ADMIN MANAGEMENT ---
  getAdminUsers: () => Api.request('/api/admin/users'),

  saveAdminUser: (userData) => Api.request('/api/admin/users', {
    method: 'POST',
    body: JSON.stringify(userData)
  }),

  updateAdminUser: (id, userData) => Api.request(`/api/admin/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(userData)
  }),

  deleteAdminUser: (id) => Api.request(`/api/admin/users/${id}`, {
    method: 'DELETE'
  }),

  resetUserPassword: (id, newPassword) => Api.request(`/api/admin/users/${id}/reset-password`, {
    method: 'POST',
    body: JSON.stringify({ newPassword })
  }),

  provisionUserDrive: (id) => Api.request(`/api/admin/users/${id}/provision-drive', {
    method: 'POST'
  }),

  getAdminRekap: (bulan, tahunAjaran) => Api.request(`/api/admin/rekap?bulan=${encodeURIComponent(bulan)}&tahunAjaran=${encodeURIComponent(tahunAjaran)}`),

  getAdminSettings: () => Api.request('/api/admin/settings'),

  saveAdminSettings: (settings) => Api.request('/api/admin/settings', {
    method: 'PUT',
    body: JSON.stringify(settings)
  })
};

window.Api = Api;

