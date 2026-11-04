/**
 * ========================================================
 * 💬 CMS DIALOG SYSTEM - CUSTOM NATIVE-LIKE MODAL & DIALOG
 * Pengganti window.alert, window.confirm, dan window.prompt
 * ========================================================
 */

const CMSDialog = {
  modalInstance: null,
  resolveHandler: null,
  isPrompt: false,
  eventsBound: false,

  ensureDOM: function () {
    let modalEl = document.getElementById('modalCustomDialog');
    if (!modalEl) {
      modalEl = document.createElement('div');
      modalEl.id = 'modalCustomDialog';
      modalEl.className = 'modal fade';
      modalEl.tabIndex = -1;
      modalEl.setAttribute('data-bs-backdrop', 'static');
      modalEl.setAttribute('data-bs-keyboard', 'false');
      modalEl.setAttribute('aria-hidden', 'true');
      modalEl.style.zIndex = '10600';
      modalEl.innerHTML = `
        <div class="modal-dialog modal-dialog-centered" style="max-width: 420px; margin: 1.25rem auto;">
          <div class="modal-content border-0 shadow-lg rounded-4 p-4 text-center">
            <!-- Icon Box -->
            <div id="dialogIconBox" class="mb-3 d-flex align-items-center justify-content-center" style="font-size: 3.5rem; line-height: 1;">
              <i class="bi bi-info-circle-fill text-primary" id="dialogIcon"></i>
            </div>
            <!-- Title -->
            <h5 class="fw-bold text-dark mb-2" id="dialogTitle">Pemberitahuan</h5>
            <!-- Message -->
            <div class="text-muted small mb-3 text-break" id="dialogMessage" style="white-space: pre-line; line-height: 1.5;"></div>
            <!-- Input field (for prompt) -->
            <div id="dialogInputWrapper" class="mb-3 d-none text-start">
              <input type="text" class="form-control rounded-3" id="dialogInput" autocomplete="off">
            </div>
            <!-- Action Buttons -->
            <div class="d-flex gap-2 justify-content-center" id="dialogActions">
              <button type="button" class="btn btn-light border w-50 py-2 rounded-pill fw-semibold text-muted d-none" id="dialogBtnCancel">Batal</button>
              <button type="button" class="btn btn-cms-primary w-100 py-2 rounded-pill fw-semibold shadow-sm" id="dialogBtnConfirm">OK</button>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(modalEl);
    }

    if (!CMSDialog.eventsBound) {
      // Event listener tombol konfirmasi
      const btnConfirm = document.getElementById('dialogBtnConfirm');
      if (btnConfirm) {
        btnConfirm.addEventListener('click', () => {
          if (CMSDialog.resolveHandler) {
            if (CMSDialog.isPrompt) {
              const inputEl = document.getElementById('dialogInput');
              const val = inputEl ? inputEl.value : '';
              CMSDialog.resolveHandler(val);
            } else {
              CMSDialog.resolveHandler(true);
            }
            CMSDialog.resolveHandler = null;
          }
          CMSDialog.hide();
        });
      }

      // Event listener tombol batal
      const btnCancel = document.getElementById('dialogBtnCancel');
      if (btnCancel) {
        btnCancel.addEventListener('click', () => {
          if (CMSDialog.resolveHandler) {
            if (CMSDialog.isPrompt) {
              CMSDialog.resolveHandler(null);
            } else {
              CMSDialog.resolveHandler(false);
            }
            CMSDialog.resolveHandler = null;
          }
          CMSDialog.hide();
        });
      }

      // Enter / Escape pada input prompt
      const inputEl = document.getElementById('dialogInput');
      if (inputEl) {
        inputEl.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            const btn = document.getElementById('dialogBtnConfirm');
            if (btn) btn.click();
          } else if (e.key === 'Escape') {
            e.preventDefault();
            const btn = document.getElementById('dialogBtnCancel');
            if (btn) btn.click();
          }
        });
      }

      // Pastikan promise ter-resolve jika modal ditutup oleh Bootstrap
      modalEl.addEventListener('hidden.bs.modal', () => {
        if (CMSDialog.resolveHandler) {
          CMSDialog.resolveHandler(CMSDialog.isPrompt ? null : false);
          CMSDialog.resolveHandler = null;
        }
      });

      CMSDialog.eventsBound = true;
    }

    if (!CMSDialog.modalInstance && typeof bootstrap !== 'undefined') {
      CMSDialog.modalInstance = bootstrap.Modal.getOrCreateInstance(modalEl, { backdrop: 'static', keyboard: false });
    }
    return modalEl;
  },

  hide: function () {
    if (CMSDialog.modalInstance) {
      CMSDialog.modalInstance.hide();
    }
  },

  /**
   * Alert Dialog kustom (Pengganti window.alert)
   */
  alert: function (message, options = {}) {
    CMSDialog.ensureDOM();
    CMSDialog.isPrompt = false;

    return new Promise((resolve) => {
      CMSDialog.resolveHandler = resolve;

      let type = options.type;
      let title = options.title;

      const msgStr = String(message || '');
      if (!type) {
        if (/berhasil|sukses|selamat|Puji Tuhan/i.test(msgStr)) {
          type = 'success';
          title = title || 'Berhasil';
        } else if (/gagal|error|salah|ditolak/i.test(msgStr)) {
          type = 'error';
          title = title || 'Terjadi Kesalahan';
        } else if (/peringatan|perhatian|wajib|harus|minimal|maksimal/i.test(msgStr)) {
          type = 'warning';
          title = title || 'Perhatian';
        } else {
          type = 'info';
          title = title || 'Informasi';
        }
      }

      CMSDialog.setIcon(type);
      document.getElementById('dialogTitle').innerText = title || 'Pemberitahuan';
      document.getElementById('dialogMessage').innerText = msgStr;

      // Sembunyikan input prompt
      document.getElementById('dialogInputWrapper').classList.add('d-none');

      // Tombol aksi: hanya tombol konfirmasi (w-100)
      const btnCancel = document.getElementById('dialogBtnCancel');
      btnCancel.classList.add('d-none');
      const btnConfirm = document.getElementById('dialogBtnConfirm');
      btnConfirm.className = 'btn btn-cms-primary w-100 py-2 rounded-pill fw-semibold shadow-sm';
      btnConfirm.innerText = options.confirmText || 'Mengerti';

      CMSDialog.modalInstance.show();
    });
  },

  /**
   * Confirm Dialog kustom (Pengganti window.confirm)
   */
  confirm: function (message, options = {}) {
    CMSDialog.ensureDOM();
    CMSDialog.isPrompt = false;

    return new Promise((resolve) => {
      CMSDialog.resolveHandler = resolve;

      const msgStr = String(message || '');
      const isDelete = /hapus|keluar|reset|tolak|bekukan/i.test(msgStr) || options.isDanger;
      const type = options.type || (isDelete ? 'danger' : 'question');
      const title = options.title || (isDelete ? 'Konfirmasi Tindakan' : 'Konfirmasi');

      CMSDialog.setIcon(type);
      document.getElementById('dialogTitle').innerText = title;
      document.getElementById('dialogMessage').innerText = msgStr;

      // Sembunyikan input prompt
      document.getElementById('dialogInputWrapper').classList.add('d-none');

      // Tombol aksi: Tombol Batal + Tombol Konfirmasi
      const btnCancel = document.getElementById('dialogBtnCancel');
      btnCancel.classList.remove('d-none');
      btnCancel.innerText = options.cancelText || 'Batal';

      const btnConfirm = document.getElementById('dialogBtnConfirm');
      btnConfirm.className = isDelete
        ? 'btn btn-danger w-50 py-2 rounded-pill fw-semibold shadow-sm'
        : 'btn btn-cms-primary w-50 py-2 rounded-pill fw-semibold shadow-sm';
      btnConfirm.innerText = options.confirmText || (isDelete ? 'Ya, Lanjutkan' : 'Ya');

      CMSDialog.modalInstance.show();
    });
  },

  /**
   * Prompt Dialog kustom (Pengganti window.prompt)
   */
  prompt: function (message, defaultValue = '', options = {}) {
    CMSDialog.ensureDOM();
    CMSDialog.isPrompt = true;

    return new Promise((resolve) => {
      CMSDialog.resolveHandler = resolve;

      const title = options.title || 'Masukkan Data';
      CMSDialog.setIcon('prompt');
      document.getElementById('dialogTitle').innerText = title;
      document.getElementById('dialogMessage').innerText = String(message || '');

      // Tampilkan input prompt
      const inputWrapper = document.getElementById('dialogInputWrapper');
      inputWrapper.classList.remove('d-none');
      const inputEl = document.getElementById('dialogInput');
      inputEl.value = defaultValue || '';
      inputEl.placeholder = options.placeholder || '';

      // Tombol aksi
      const btnCancel = document.getElementById('dialogBtnCancel');
      btnCancel.classList.remove('d-none');
      btnCancel.innerText = options.cancelText || 'Batal';

      const btnConfirm = document.getElementById('dialogBtnConfirm');
      btnConfirm.className = 'btn btn-cms-primary w-50 py-2 rounded-pill fw-semibold shadow-sm';
      btnConfirm.innerText = options.confirmText || 'Simpan';

      CMSDialog.modalInstance.show();
      setTimeout(() => inputEl.focus(), 300);
    });
  },

  setIcon: function (type) {
    const iconEl = document.getElementById('dialogIcon');
    if (!iconEl) return;

    iconEl.className = '';
    switch (type) {
      case 'success':
        iconEl.className = 'bi bi-check-circle-fill text-success';
        break;
      case 'error':
      case 'danger':
        iconEl.className = 'bi bi-x-circle-fill text-danger';
        break;
      case 'warning':
        iconEl.className = 'bi bi-exclamation-triangle-fill text-warning';
        break;
      case 'prompt':
        iconEl.className = 'bi bi-pencil-square text-primary';
        break;
      case 'question':
      case 'info':
      default:
        iconEl.className = 'bi bi-question-circle-fill text-info';
        break;
    }
  },

  // Shortcuts
  success: function (message, title = 'Berhasil') {
    return CMSDialog.alert(message, { title, type: 'success' });
  },
  error: function (message, title = 'Terjadi Kesalahan') {
    return CMSDialog.alert(message, { title, type: 'error' });
  },
  warning: function (message, title = 'Peringatan') {
    return CMSDialog.alert(message, { title, type: 'warning' });
  },
  info: function (message, title = 'Informasi') {
    return CMSDialog.alert(message, { title, type: 'info' });
  }
};

// Override window.alert bawaan browser agar seluruh pemanggilan otomatis menggunakan CMSDialog
window.alert = function (message) {
  return CMSDialog.alert(message);
};

// Inisialisasi awal listener dialog saat DOM siap
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => CMSDialog.ensureDOM());
} else {
  CMSDialog.ensureDOM();
}

