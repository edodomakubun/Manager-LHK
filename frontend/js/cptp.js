/**
 * ========================================================
 * 📚 MASTER CP & TP MANAGER PER KELAS - CMS MANAGER LHK
 * ========================================================
 */

const CpTpManager = {
  items: [],

  load: async function () {
    await CpTpManager.loadClassFilter();
    await CpTpManager.refreshList();
  },

  loadClassFilter: async function () {
    const filterSelect = document.getElementById('filterKelasCpTp');
    const modalSelect = document.getElementById('inputCpTpKelas');
    if (!filterSelect) return;

    try {
      const res = await Api.getClasses();
      const classes = (res && res.sukses && Array.isArray(res.classes)) ? res.classes : ['Kelas IV', 'Kelas V', 'Kelas VI'];

      filterSelect.innerHTML = '<option value="">-- Semua Kelas --</option>';
      if (modalSelect) modalSelect.innerHTML = '';

      classes.forEach(k => {
        filterSelect.innerHTML += `<option value="${k}">${k}</option>`;
        if (modalSelect) modalSelect.innerHTML += `<option value="${k}">${k}</option>`;
      });
    } catch (e) {
      console.warn('Gagal memuat filter kelas:', e);
    }
  },

  refreshList: async function () {
    const filterKelas = document.getElementById('filterKelasCpTp')?.value || '';
    const container = document.getElementById('cptpListContainer');
    if (container) {
      container.innerHTML = '<div class="text-center py-4"><span class="spinner-border spinner-border-sm text-success me-2"></span>Memuat data CP & TP...</div>';
    }

    try {
      const res = await Api.getCpTpList(filterKelas);
      if (res && res.sukses) {
        CpTpManager.items = res.items || [];
        CpTpManager.render(CpTpManager.items);
      }
    } catch (err) {
      if (container) {
        container.innerHTML = `<div class="alert alert-danger text-center">Gagal memuat: ${err.message}</div>`;
      }
    }
  },

  render: function (items) {
    const container = document.getElementById('cptpListContainer');
    if (!container) return;

    if (!items || items.length === 0) {
      container.innerHTML = `
        <div class="text-center py-5 text-muted">
          <i class="bi bi-journal-x fs-1 text-secondary opacity-50 d-block mb-2"></i>
          <p class="mb-2">Belum ada Capaian & Tujuan Pembelajaran untuk kelas ini.</p>
          <button class="btn btn-cms-primary btn-sm rounded-pill" onclick="CpTpManager.openAddModal()">
            <i class="bi bi-plus-lg me-1"></i> Tambah CP/TP Baru
          </button>
        </div>
      `;
      return;
    }

    let html = '';
    items.forEach((item, idx) => {
      html += `
        <div class="card-cms p-3 mb-3">
          <div class="d-flex justify-content-between align-items-start mb-2">
            <span class="badge bg-light text-primary border fw-bold px-2 py-1">${item.nama_kelas}</span>
            <div>
              <button class="btn btn-sm btn-outline-primary py-0 px-2 me-1" onclick="CpTpManager.openEditModal(${item.id})">
                <i class="bi bi-pencil"></i>
              </button>
              <button class="btn btn-sm btn-outline-danger py-0 px-2" onclick="CpTpManager.deleteItem(${item.id})">
                <i class="bi bi-trash3"></i>
              </button>
            </div>
          </div>
          <div class="mb-2">
            <small class="text-muted fw-bold d-block">Capaian Pembelajaran (CP):</small>
            <div class="text-dark fw-medium">${item.cp}</div>
          </div>
          <div>
            <small class="text-muted fw-bold d-block">Tujuan Pembelajaran (TP):</small>
            <div class="text-muted small">${item.tp}</div>
          </div>
        </div>
      `;
    });

    container.innerHTML = html;
  },

  openAddModal: function () {
    document.getElementById('formTambahCpTp')?.reset();
    const modalEl = document.getElementById('modalTambahCpTp');
    if (modalEl) {
      const bsModal = bootstrap.Modal.getOrCreateInstance(modalEl);
      bsModal.show();
    }
  },

  saveNew: async function () {
    const kelas = document.getElementById('inputCpTpKelas').value;
    const cp = document.getElementById('inputCpTpCP').value;
    const tp = document.getElementById('inputCpTpTP').value;

    if (!kelas || !cp || !tp) {
      alert('Harap lengkapi Kelas, CP, dan TP.');
      return;
    }

    try {
      const res = await Api.saveCpTp({ nama_kelas: kelas, cp, tp });
      if (res && res.sukses) {
        alert('CP & TP berhasil ditambahkan!');
        const modalEl = document.getElementById('modalTambahCpTp');
        const bsModal = bootstrap.Modal.getInstance(modalEl);
        if (bsModal) bsModal.hide();
        CpTpManager.refreshList();
      } else {
        throw new Error(res.pesan || 'Gagal menyimpan.');
      }
    } catch (err) {
      alert('Error: ' + err.message);
    }
  },

  openEditModal: function (id) {
    const item = CpTpManager.items.find(i => i.id === id);
    if (!item) return;

    document.getElementById('editCpTpId').value = item.id;
    document.getElementById('editCpTpCP').value = item.cp;
    document.getElementById('editCpTpTP').value = item.tp;

    const modalEl = document.getElementById('modalEditCpTp');
    if (modalEl) {
      const bsModal = bootstrap.Modal.getOrCreateInstance(modalEl);
      bsModal.show();
    }
  },

  saveEdit: async function () {
    const id = document.getElementById('editCpTpId').value;
    const cp = document.getElementById('editCpTpCP').value;
    const tp = document.getElementById('editCpTpTP').value;

    if (!cp || !tp) {
      alert('Harap lengkapi CP dan TP.');
      return;
    }

    try {
      const res = await Api.updateCpTp(id, cp, tp);
      if (res && res.sukses) {
        alert('CP & TP berhasil diperbarui!');
        const modalEl = document.getElementById('modalEditCpTp');
        const bsModal = bootstrap.Modal.getInstance(modalEl);
        if (bsModal) bsModal.hide();
        CpTpManager.refreshList();
      } else {
        throw new Error(res.pesan || 'Gagal memperbarui.');
      }
    } catch (err) {
      alert('Error: ' + err.message);
    }
  },

  deleteItem: async function (id) {
    if (!confirm('Hapus CP & TP ini dari bank data?')) return;
    try {
      await Api.deleteCpTp(id);
      CpTpManager.refreshList();
    } catch (err) {
      alert('Gagal menghapus: ' + err.message);
    }
  }
};

window.CpTpManager = CpTpManager;

