/**
 * subscription.js - Manajemen Langganan & Pembekuan Akun Guru (Client Side)
 */

const SubscriptionManager = {
  currentStatus: null,
  cachedBase64Bukti: '',

  /**
   * Periksa status akun guru saat startup / login
   */
  checkAccountStatus: async function (user) {
    if (!user || user.role === 'admin') {
      SubscriptionManager.hideFreezeOverlay();
      return;
    }

    try {
      const res = await Api.getSubscriptionStatus();
      if (res && res.sukses) {
        SubscriptionManager.currentStatus = res;
        const isFrozen = res.user && res.user.is_frozen === 1;
        const isEnabled = res.settings ? (res.settings.enabled !== false) : true;

        if (isFrozen && isEnabled) {
          SubscriptionManager.showFreezeOverlay(res);
        } else {
          SubscriptionManager.hideFreezeOverlay();
        }
      }
    } catch (e) {
      console.warn('Gagal memuat status langganan:', e);
    }
  },

  /**
   * Tampilkan Layar Pembekuan & Formulir Pembayaran
   */
  showFreezeOverlay: function (data) {
    const overlay = document.getElementById('freezeScreenOverlay');
    if (!overlay) return;

    overlay.classList.remove('d-none');
    document.body.classList.add('overflow-hidden');

    const u = data.user || {};
    const s = data.settings || {};
    const lastPay = data.lastPayment;

    // Info Nama & NIP
    const elName = document.getElementById('freezeUserName');
    if (elName) elName.textContent = u.nama_lengkap || 'Bapak/Ibu Guru';

    const elNip = document.getElementById('freezeUserNip');
    if (elNip) elNip.textContent = u.nip ? `NIP. ${u.nip}` : '';

    // Nominal
    const amount = s.amount || 50000;
    const formattedAmount = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);
    const elAmount = document.getElementById('freezePaymentAmount');
    if (elAmount) elAmount.textContent = formattedAmount;

    // Instruksi
    const elInst = document.getElementById('freezeInstructions');
    if (elInst) elInst.textContent = s.instructions || `Biaya langganan CMS ${formattedAmount}/bulan. Silakan scan QR Code di bawah ini dan unggah foto bukti transfer.`;

    // QR Code
    const elQr = document.getElementById('freezeQrCodeImg');
    const elQrPlaceholder = document.getElementById('freezeQrPlaceholder');
    if (s.qr_code && s.qr_code.trim().length > 0) {
      if (elQr) {
        elQr.src = s.qr_code;
        elQr.classList.remove('d-none');
      }
      if (elQrPlaceholder) elQrPlaceholder.classList.add('d-none');
    } else {
      if (elQr) elQr.classList.add('d-none');
      if (elQrPlaceholder) elQrPlaceholder.classList.remove('d-none');
    }

    // Cek apakah ada bukti pembayaran yang sedang menunggu verifikasi
    const boxPending = document.getElementById('freezePendingBox');
    const boxForm = document.getElementById('freezePaymentFormBox');
    const boxRejected = document.getElementById('freezeRejectedAlert');

    if (lastPay && lastPay.status === 'pending') {
      if (boxPending) boxPending.classList.remove('d-none');
      if (boxForm) boxForm.classList.add('d-none');
      if (boxRejected) boxRejected.classList.add('d-none');

      const elTgl = document.getElementById('freezePendingDate');
      if (elTgl) elTgl.textContent = lastPay.created_at ? new Date(lastPay.created_at).toLocaleString('id-ID') : '-';

      const elBuktiPreview = document.getElementById('freezePendingPreview');
      if (elBuktiPreview && lastPay.bukti_bayar) {
        elBuktiPreview.src = lastPay.bukti_bayar;
        elBuktiPreview.classList.remove('d-none');
      }
    } else {
      if (boxPending) boxPending.classList.add('d-none');
      if (boxForm) boxForm.classList.remove('d-none');

      // Tampilkan alert jika bukti sebelumnya ditolak
      if (lastPay && lastPay.status === 'rejected') {
        if (boxRejected) {
          boxRejected.classList.remove('d-none');
          const elNote = document.getElementById('freezeRejectedNote');
          if (elNote) elNote.textContent = lastPay.catatan_admin || 'Bukti pembayaran sebelumnya ditolak oleh admin. Silakan periksa kembali dan unggah struk transfer yang sah.';
        }
      } else {
        if (boxRejected) boxRejected.classList.add('d-none');
      }
    }
  },

  /**
   * Sembunyikan Layar Pembekuan
   */
  hideFreezeOverlay: function () {
    const overlay = document.getElementById('freezeScreenOverlay');
    if (overlay) overlay.classList.add('d-none');
    document.body.classList.remove('overflow-hidden');
  },

  /**
   * Handle pemilihan gambar bukti pembayaran oleh guru
   */
  handleBuktiSelected: async function (inputEl) {
    const file = inputEl.files[0];
    if (!file) return;

    const previewImg = document.getElementById('freezeBuktiPreview');
    const previewContainer = document.getElementById('freezeBuktiPreviewContainer');
    const hintText = document.getElementById('freezeUploadHint');

    try {
      if (hintText) hintText.innerHTML = '<span class="spinner-border spinner-border-sm me-1 text-success"></span>Mengompresi gambar...';

      let base64 = '';
      if (window.ImageCompressor && typeof ImageCompressor.compressImage === 'function') {
        const compressed = await ImageCompressor.compressImage(file, { maxWidth: 1000, quality: 0.8 });
        base64 = compressed.base64;
      } else {
        base64 = await SubscriptionManager.fileToBase64(file);
      }

      SubscriptionManager.cachedBase64Bukti = base64;

      if (previewImg) {
        previewImg.src = base64;
      }
      if (previewContainer) {
        previewContainer.classList.remove('d-none');
      }
      if (hintText) {
        hintText.innerHTML = '<span class="text-success fw-bold"><i class="bi bi-check-circle-fill me-1"></i>Foto berhasil dipilih & siap dikirim</span>';
      }
    } catch (err) {
      alert('Gagal memproses file foto: ' + err.message);
      if (hintText) hintText.textContent = 'Gagal memuat foto.';
    }
  },

  fileToBase64: function (file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  },

  /**
   * Kirim bukti pembayaran ke server
   */
  submitPayment: async function () {
    if (!SubscriptionManager.cachedBase64Bukti) {
      alert('Silakan pilih foto struk / bukti pembayaran terlebih dahulu.');
      return;
    }

    const btn = document.getElementById('btnSubmitBuktiBayar');
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Mengirim Bukti...';
    }

    const note = document.getElementById('freezeCatatanInput') ? document.getElementById('freezeCatatanInput').value.trim() : '';

    try {
      const payload = {
        bukti_bayar: SubscriptionManager.cachedBase64Bukti,
        catatan_user: note
      };

      const res = await Api.submitSubscriptionPayment(payload);
      if (res && res.sukses) {
        alert(res.pesan || 'Bukti transfer berhasil dikirim! Menunggu konfirmasi Admin.');
        SubscriptionManager.cachedBase64Bukti = '';
        // Muat ulang status
        const statusRes = await Api.getSubscriptionStatus();
        if (statusRes && statusRes.sukses) {
          SubscriptionManager.showFreezeOverlay(statusRes);
        }
      } else {
        throw new Error(res.pesan || 'Gagal mengirim bukti pembayaran.');
      }
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = '<i class="bi bi-send-fill me-2"></i> Kirim Bukti Pembayaran';
      }
    }
  },

  /**
   * Tombol "Cek Status Verifikasi Sekarang"
   */
  recheckStatus: async function () {
    const btn = document.getElementById('btnRecheckStatus');
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>Memeriksa...';
    }

    try {
      const res = await Api.getSubscriptionStatus();
      if (res && res.sukses) {
        if (res.user && res.user.is_frozen === 1) {
          SubscriptionManager.showFreezeOverlay(res);
          alert('Status: Masih dalam proses antrean verifikasi oleh Admin. Silakan hubungi operator sekolah jika perlu konfirmasi cepat.');
        } else {
          SubscriptionManager.hideFreezeOverlay();
          alert('🎉 Selamat! Pembayaran Anda telah diverifikasi oleh Admin. Akses akun Anda telah dibuka penuh kembali.');
          // Reload dashboard
          if (window.CmsRouter) {
            CmsRouter.navigate('dashboard');
          }
        }
      }
    } catch (err) {
      alert('Gagal memeriksa status: ' + err.message);
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = '<i class="bi bi-arrow-repeat me-1"></i> Cek Status Sekarang';
      }
    }
  }
};

window.SubscriptionManager = SubscriptionManager;
