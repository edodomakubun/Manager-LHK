/**
 * ========================================================
 * 🧭 SPA ROUTER - CMS MANAGER LHK
 * ========================================================
 */

const CmsRouter = {
  currentView: 'dashboard',

  navigate: function (viewName) {
    if (!viewName) return;

    // Sembunyikan semua view container
    const views = document.querySelectorAll('.cms-view');
    views.forEach(v => v.classList.add('d-none'));

    // Tampilkan view target
    const targetEl = document.getElementById(`view-${viewName}`);
    if (targetEl) {
      targetEl.classList.remove('d-none');
      CmsRouter.currentView = viewName;
    } else {
      console.warn(`View "view-${viewName}" tidak ditemukan.`);
      return;
    }

    // Update status aktif pada Bottom Navigation Bar
    const bottomNavs = document.querySelectorAll('.bottom-nav-item');
    bottomNavs.forEach(btn => {
      if (btn.getAttribute('data-view') === viewName) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Update status aktif pada Desktop Sidebar
    const sidebarLinks = document.querySelectorAll('.sidebar-nav-link');
    sidebarLinks.forEach(link => {
      if (link.getAttribute('data-view') === viewName) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    // Update judul di Topbar
    const titleMap = {
      'dashboard': 'Dashboard Beranda',
      'input': 'Input Agenda LHK',
      'riwayat': 'Riwayat Agenda',
      'arsip': 'Arsip Dokumen Laporan',
      'cptp': 'Master CP & TP Kelas',
      'profil': 'Profil Pengguna',
      'admin-users': 'Manajemen Akun Guru',
      'admin-rekap': 'Monitoring & Rekapitulasi',
      'admin-settings': 'Pengaturan Sistem'
    };
    const titleEl = document.getElementById('currentViewTitle');
    if (titleEl) titleEl.innerText = titleMap[viewName] || 'E-Agenda LHK';

    // Tampilkan / sembunyikan floating volume
    const floatVol = document.getElementById('floatVolume');
    if (floatVol) {
      floatVol.style.display = (viewName === 'input') ? 'flex' : 'none';
    }

    // Tutup drawer offcanvas di HP jika terbuka
    const offcanvasEl = document.getElementById('drawerMenu');
    if (offcanvasEl) {
      const bsOffcanvas = bootstrap.Offcanvas.getInstance(offcanvasEl);
      if (bsOffcanvas) bsOffcanvas.hide();
    }

    // Scroll ke atas
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Panggil event loader per view
    CmsRouter.onViewLoaded(viewName);
  },

  onViewLoaded: function (viewName) {
    switch (viewName) {
      case 'dashboard':
        if (window.Dashboard) window.Dashboard.load();
        break;
      case 'input':
        if (window.Wizard) window.Wizard.init();
        break;
      case 'riwayat':
        if (window.Riwayat) window.Riwayat.load();
        break;
      case 'arsip':
        if (window.Dokumen) window.Dokumen.load();
        break;
      case 'cptp':
        if (window.CpTpManager) window.CpTpManager.load();
        break;
      case 'profil':
        if (window.Profil) window.Profil.load();
        break;
      case 'admin-users':
        if (window.AdminManager) window.AdminManager.loadUsers();
        break;
      case 'admin-rekap':
        if (window.AdminManager) window.AdminManager.loadRekap();
        break;
      case 'admin-settings':
        if (window.AdminManager) window.AdminManager.loadSettings();
        break;
    }
  }
};

window.CmsRouter = CmsRouter;

