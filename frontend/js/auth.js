/**
 * ========================================================
 * 🔐 AUTH CONTROLLER - CMS MANAGER LHK
 * Menangani Halaman Login Penuh & Sesi Pengguna
 * ========================================================
 */

const Auth = {
  currentUser: null,

  init: async function () {
    const token = Api.getToken();
    if (!token) {
      Auth.showLoginScreen();
      return;
    }

    try {
      const res = await Api.getMe();
      if (res && res.sukses && res.user) {
        Auth.setUser(res.user);
        Auth.hideLoginScreen();
        // Muat data awal router
        if (window.CmsRouter) {
          window.CmsRouter.navigate('dashboard');
        }
      } else {
        Auth.showLoginScreen();
      }
    } catch (err) {
      Auth.showLoginScreen();
    }
  },

  setUser: function (user) {
    Auth.currentUser = user;
    window.currentUser = user;

    // Update elemen UI Profil di Topbar & Sidebar
    const elName = document.querySelectorAll('.user-display-name');
    const elRole = document.querySelectorAll('.user-display-role');
    const elNip = document.querySelectorAll('.user-display-nip');
    const elSchool = document.querySelectorAll('.user-display-school');

    elName.forEach(el => el.innerText = user.nama_lengkap || user.username);
    elRole.forEach(el => {
      el.innerText = user.role === 'admin' ? 'Administrator' : (user.mapel || 'Guru Mata Pelajaran');
    });
    elNip.forEach(el => el.innerText = user.nip ? `NIP. ${user.nip}` : 'NIP. -');
    elSchool.forEach(el => el.innerText = user.nama_sekolah || 'SMA / SMK Negeri');

    // Tampilkan / Sembunyikan Menu Admin
    const adminNavs = document.querySelectorAll('.admin-only');
    adminNavs.forEach(el => {
      if (user.role === 'admin') {
        el.classList.remove('d-none');
      } else {
        el.classList.add('d-none');
      }
    });
  },

  login: async function (username, password) {
    const btn = document.getElementById('btnLoginSubmit');
    const errAlert = document.getElementById('loginErrorAlert');
    if (errAlert) errAlert.classList.add('d-none');

    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Memverifikasi...';
    }

    try {
      const res = await Api.login(username, password);
      if (res && res.sukses) {
        Api.setToken(res.token);
        Auth.setUser(res.user);
        Auth.hideLoginScreen();
        if (window.CmsRouter) {
          window.CmsRouter.navigate('dashboard');
        }
      } else {
        throw new Error(res.pesan || 'Login gagal.');
      }
    } catch (err) {
      if (errAlert) {
        errAlert.innerText = err.message || 'Username atau kata sandi salah.';
        errAlert.classList.remove('d-none');
      } else {
        alert(err.message || 'Login gagal.');
      }
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = '<i class="bi bi-box-arrow-in-right me-2"></i> Masuk ke CMS';
      }
    }
  },

  logout: function () {
    if (confirm('Apakah Anda yakin ingin keluar dari akun CMS?')) {
      Api.setToken(null);
      Auth.currentUser = null;
      window.currentUser = null;
      Auth.showLoginScreen();
    }
  },

  showLoginScreen: function () {
    const pageLogin = document.getElementById('pageLogin');
    const appContainer = document.getElementById('appContainer');

    if (pageLogin) pageLogin.classList.remove('d-none');
    if (appContainer) appContainer.classList.add('d-none');

    // Kosongkan form error
    const errAlert = document.getElementById('loginErrorAlert');
    if (errAlert) errAlert.classList.add('d-none');
  },

  hideLoginScreen: function () {
    const pageLogin = document.getElementById('pageLogin');
    const appContainer = document.getElementById('appContainer');

    if (pageLogin) pageLogin.classList.add('d-none');
    if (appContainer) appContainer.classList.remove('d-none');
  },

  // Helper cepat uji coba akun demo di halaman login
  fillDemo: function (role) {
    const userInp = document.getElementById('loginUsername');
    const passInp = document.getElementById('loginPassword');
    if (role === 'admin') {
      if (userInp) userInp.value = 'admin';
      if (passInp) passInp.value = 'admin123';
    } else {
      if (userInp) userInp.value = 'kormasela';
      if (passInp) passInp.value = 'guru123';
    }
  },

  togglePassword: function () {
    const passInp = document.getElementById('loginPassword');
    const eyeIcon = document.getElementById('loginPasswordEye');
    if (!passInp || !eyeIcon) return;

    if (passInp.type === 'password') {
      passInp.type = 'text';
      eyeIcon.className = 'bi bi-eye-slash text-muted';
    } else {
      passInp.type = 'password';
      eyeIcon.className = 'bi bi-eye text-muted';
    }
  }
};

window.Auth = Auth;
window.addEventListener('auth:expired', () => {
  Auth.showLoginScreen();
});
