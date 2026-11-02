/**
 * PWA Installer & Service Worker Manager
 * CMS Manager LHK
 */

const PwaInstaller = {
  deferredPrompt: null,
  isInstalled: false,

  init: function () {
    // 1. Cek apakah sudah berjalan di mode aplikasi terpasang (Standalone)
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true) {
      PwaInstaller.isInstalled = true;
      document.body.classList.add('app-mode-standalone');
      console.log('Manager LHK berjalan dalam mode aplikasi mandiri (PWA Standalone)');
    }

    // 2. Daftarkan Service Worker
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then((reg) => {
            console.log('Service Worker LHK berhasil terdaftar:', reg.scope);
          })
          .catch((err) => {
            console.warn('Pendaftaran Service Worker gagal:', err);
          });
      });
    }

    // 3. Tangkap Event `beforeinstallprompt` (Chrome, Edge, Android)
    window.addEventListener('beforeinstallprompt', (e) => {
      // Mencegah prompt bawaan mini-infobar muncul otomatis di mobile
      e.preventDefault();
      PwaInstaller.deferredPrompt = e;

      // Munculkan tombol / banner pasang aplikasi
      PwaInstaller.showInstallUi();
    });

    // 4. Tangkap Event `appinstalled`
    window.addEventListener('appinstalled', () => {
      PwaInstaller.deferredPrompt = null;
      PwaInstaller.isInstalled = true;
      PwaInstaller.hideInstallUi();
      console.log('Aplikasi Manager LHK telah sukses terpasang!');
    });

    // Render UI elemen jika ada tombol pasang
    PwaInstaller.setupTriggers();
  },

  showInstallUi: function () {
    if (PwaInstaller.isInstalled) return;

    // Tampilkan tombol pasang di sidebar dan drawer
    document.querySelectorAll('.pwa-install-trigger').forEach(el => {
      el.classList.remove('d-none');
    });

    // Tampilkan floating banner di mobile jika belum pernah ditutup
    const dismissed = sessionStorage.getItem('pwa_banner_dismissed');
    const banner = document.getElementById('pwaInstallBanner');
    if (banner && !dismissed) {
      banner.classList.remove('d-none');
    }
  },

  hideInstallUi: function () {
    document.querySelectorAll('.pwa-install-trigger').forEach(el => {
      el.classList.add('d-none');
    });
    const banner = document.getElementById('pwaInstallBanner');
    if (banner) banner.classList.add('d-none');
  },

  dismissBanner: function () {
    sessionStorage.setItem('pwa_banner_dismissed', 'true');
    const banner = document.getElementById('pwaInstallBanner');
    if (banner) banner.classList.add('d-none');
  },

  setupTriggers: function () {
    // Tombol-tombol dengan class .btn-install-pwa
    document.querySelectorAll('.btn-install-pwa').forEach(btn => {
      btn.addEventListener('click', () => {
        PwaInstaller.promptInstall();
      });
    });
  },

  promptInstall: async function () {
    // Deteksi jika pengguna membuka di perangkat iOS (iPhone / iPad Safari)
    const isIos = /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());
    const isStandalone = window.navigator.standalone === true || window.matchMedia('(display-mode: standalone)').matches;

    if (isIos && !isStandalone) {
      const modalIos = document.getElementById('modalInstallIos');
      if (modalIos) {
        const bsModal = bootstrap.Modal.getOrCreateInstance(modalIos);
        bsModal.show();
      } else {
        alert("Cara Pasang di iPhone/iPad:\n1. Ketuk ikon Bagikan (Share / [^]) di menu Safari bawah.\n2. Gulir ke bawah lalu pilih 'Tambahkan ke Layar Utama' (Add to Home Screen).\n3. Ketuk 'Tambah' di pojok kanan atas.");
      }
      return;
    }

    // Jika prompt instalasi Chromium tersedia
    if (PwaInstaller.deferredPrompt) {
      PwaInstaller.deferredPrompt.prompt();
      const choiceResult = await PwaInstaller.deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        console.log('Pengguna menyetujui pemasangan aplikasi.');
        PwaInstaller.hideInstallUi();
      } else {
        console.log('Pengguna menunda pemasangan aplikasi.');
      }
      PwaInstaller.deferredPrompt = null;
    } else {
      // Browser lain / panduan umum jika prompt belum siap
      const modalGeneral = document.getElementById('modalInstallPanduan');
      if (modalGeneral) {
        const bsModal = bootstrap.Modal.getOrCreateInstance(modalGeneral);
        bsModal.show();
      } else {
        alert("Untuk memasang aplikasi:\nBuka menu browser Anda (ikon titik tiga di kanan atas), lalu pilih 'Pasang Aplikasi' atau 'Tambahkan ke Layar Utama'.");
      }
    }
  }
};

window.PwaInstaller = PwaInstaller;

// Inisialisasi PWA saat DOM siap
document.addEventListener('DOMContentLoaded', () => {
  PwaInstaller.init();
});

