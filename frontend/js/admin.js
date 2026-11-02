/**
 * ========================================================
 * 👑 ADMIN MANAGEMENT & MONITORING - CMS MANAGER LHK
 * ========================================================
 */

const AdminManager = {
  teachers: [],

  // ========================================================
  // 1. MANAJEMEN GURU
  // ========================================================
  loadUsers: async function () {
    const container = document.getElementById('adminUsersTableBody');
    if (container) {
      container.innerHTML = '<tr><td colspan="6" class="text-center py-4"><span class="spinner-border spinner-border-sm text-success me-2"></span>Memuat daftar guru...</td></tr>';
    }

    try {
      const res = await Api.getAdminUsers();
      if (res && res.sukses) {
        AdminManager.teachers = res.users || [];
        AdminManager.renderUsers(AdminManager.teachers);
      }
    } catch (err) {
      if (container) {
        container.innerHTML = `<tr><td colspan="6" class="text-center text-danger py-4">Gagal memuat: ${err.message}</td></tr>`;
      }
    }
  },

  renderUsers: function (users) {
    const container = document.getElementById('adminUsersTableBody');
    const mobileContainer = document.getElementById('adminUsersMobileCards');
    if (!container) return;

    const guruUsers = users.filter(u => u.role !== 'admin');

    if (guruUsers.length === 0) {
      container.innerHTML = '<tr><td colspan="6" class="text-center py-4 text-muted">Belum ada akun guru yang terdaftar.</td></tr>';
      if (mobileContainer) mobileContainer.innerHTML = '<div class="text-center py-4 text-muted">Belum ada akun guru.</div>';
      return;
    }

    // 1. Render Tabel Desktop
    let html = '';
    guruUsers.forEach((u, idx) => {
      const hasDrive = !!u.folder_guru_id;
      const hasSheet = !!u.spreadsheet_id;

      html += `
        <tr>
          <td class="text-center">${idx + 1}</td>
          <td>
            <div class="fw-bold text-dark">${u.nama_lengkap}</div>
            <small class="text-muted">Username: <strong>${u.username}</strong> ${u.nip ? `• NIP. ${u.nip}` : ''}</small>
          </td>
          <td>
            <span class="badge bg-light text-primary border">${u.mapel || 'Guru Mapel'}</span>
            <div class="small text-muted mt-1">${(u.classes && u.classes.length > 0) ? u.classes.join(', ') : 'Belum ada kelas'}</div>
          </td>
          <td>
            ${hasDrive ? `
              <div class="d-flex flex-column gap-1">
                <a href="https://drive.google.com/drive/folders/${u.folder_guru_id}" target="_blank" class="btn btn-sm btn-outline-success py-0 px-2 text-start">
                  <i class="bi bi-folder2-open me-1"></i> Buka Folder Guru
                </a>
                ${hasSheet ? `
                <a href="https://docs.google.com/spreadsheets/d/${u.spreadsheet_id}" target="_blank" class="btn btn-sm btn-outline-primary py-0 px-2 text-start">
                  <i class="bi bi-file-earmark-spreadsheet me-1"></i> Buka Spreadsheet
                </a>` : ''}
              </div>
            ` : `
              <button class="btn btn-sm btn-warning text-dark py-0 px-2" onclick="AdminManager.provisionDrive('${u.id}')">
                <i class="bi bi-cloud-plus me-1"></i> Inisialisasi Drive
              </button>
            `}
          </td>
          <td class="text-center">
            <span class="badge ${u.is_active ? 'bg-success' : 'bg-danger'}">${u.is_active ? 'Aktif' : 'Nonaktif'}</span>
          </td>
          <td class="text-end text-nowrap">
            <button class="btn btn-sm btn-outline-primary me-1" onclick="AdminManager.openEditUserModal('${u.id}')" title="Edit Akun & Drive">
              <i class="bi bi-pencil"></i>
            </button>
            <button class="btn btn-sm btn-outline-warning text-dark me-1" onclick="AdminManager.resetPassword('${u.id}', '${u.nama_lengkap}')" title="Reset Kata Sandi">
              <i class="bi bi-key"></i>
            </button>
            <button class="btn btn-sm btn-outline-danger" onclick="AdminManager.deleteUser('${u.id}', '${u.nama_lengkap}')" title="Hapus Akun">
              <i class="bi bi-trash3"></i>
            </button>
          </td>
        </tr>
      `;
    });
    container.innerHTML = html;

    // 2. Render Kartu Mobile
    if (mobileContainer) {
      let mobHtml = '';
      guruUsers.forEach(u => {
        const hasDrive = !!u.folder_guru_id;
        const hasSheet = !!u.spreadsheet_id;

        mobHtml += `
          <div class="card-cms p-3 mb-3">
            <div class="d-flex justify-content-between align-items-start mb-2">
              <div>
                <h6 class="fw-bold mb-0 text-dark">${u.nama_lengkap}</h6>
                <small class="text-muted">NIP. ${u.nip || '-'} • User: ${u.username}</small>
              </div>
              <span class="badge ${u.is_active ? 'bg-success' : 'bg-danger'}">${u.is_active ? 'Aktif' : 'Nonaktif'}</span>
            </div>
            <div class="mb-2">
              <span class="badge bg-light text-primary border">${u.mapel || 'Guru'}</span>
              <small class="text-muted ms-2">${(u.classes || []).join(', ')}</small>
            </div>
            <div class="d-flex flex-wrap gap-2 mb-3">
              ${hasDrive ? `
                <a href="https://drive.google.com/drive/folders/${u.folder_guru_id}" target="_blank" class="btn btn-sm btn-outline-success">
                  <i class="bi bi-folder2-open me-1"></i> Folder Drive
                </a>
              ` : `
                <button class="btn btn-sm btn-warning text-dark" onclick="AdminManager.provisionDrive('${u.id}')">
                  <i class="bi bi-cloud-plus me-1"></i> Buat Drive
                </button>
              `}
              ${hasSheet ? `
                <a href="https://docs.google.com/spreadsheets/d/${u.spreadsheet_id}" target="_blank" class="btn btn-sm btn-outline-primary">
                  <i class="bi bi-file-earmark-spreadsheet me-1"></i> Spreadsheet
                </a>
              ` : ''}
            </div>
            <div class="d-flex justify-content-end gap-2 border-top pt-2">
              <button class="btn btn-sm btn-outline-primary" onclick="AdminManager.openEditUserModal('${u.id}')">
                <i class="bi bi-pencil me-1"></i> Edit
              </button>
              <button class="btn btn-sm btn-outline-warning text-dark" onclick="AdminManager.resetPassword('${u.id}', '${u.nama_lengkap}')">
                <i class="bi bi-key me-1"></i> Reset Pass
              </button>
              <button class="btn btn-sm btn-outline-danger" onclick="AdminManager.deleteUser('${u.id}', '${u.nama_lengkap}')">
                <i class="bi bi-trash3"></i>
              </button>
            </div>
          </div>
        `;
      });
      mobileContainer.innerHTML = mobHtml;
    }
  },

  openAddUserModal: function () {
    document.getElementById('formTambahGuru')?.reset();
    const modalEl = document.getElementById('modalTambahGuru');
    if (modalEl) {
      const bsModal = bootstrap.Modal.getOrCreateInstance(modalEl);
      bsModal.show();
    }
  },

  saveNewUser: async function () {
    const btn = document.getElementById('btnSimpanGuruBaru');
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Membuat Akun & 4 Sub-Folder Drive...';
    }

    try {
      const nama = document.getElementById('adminInputNama').value;
      const nip = document.getElementById('adminInputNip').value;
      const username = document.getElementById('adminInputUsername').value;
      const password = document.getElementById('adminInputPassword').value;
      const mapel = document.getElementById('adminInputMapel').value;
      const pangkat = document.getElementById('adminInputPangkat').value;
      const classesRaw = document.getElementById('adminInputKelas').value;
      const autoDrive = document.getElementById('adminCheckAutoDrive')?.checked !== false;

      if (!nama || !username || !password) {
        alert('Nama, Username, dan Password wajib diisi.');
        return;
      }

      const classes = classesRaw ? classesRaw.split(',').map(s => s.trim()).filter(Boolean) : [];

      const payload = {
        nama_lengkap: nama,
        nip,
        username,
        password,
        mapel,
        pangkat_golongan: pangkat,
        classes,
        auto_provision_drive: autoDrive
      };

      const res = await Api.saveAdminUser(payload);
      if (res && res.sukses) {
        alert('Akun guru berhasil dibuat dan folder Google Drive berhasil diinisialisasi! 🎉');
        const modalEl = document.getElementById('modalTambahGuru');
        const bsModal = bootstrap.Modal.getInstance(modalEl);
        if (bsModal) bsModal.hide();
        AdminManager.loadUsers();
      } else {
        throw new Error(res.pesan || 'Gagal membuat akun guru.');
      }
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = '<i class="bi bi-cloud-arrow-up-fill me-2"></i> Simpan & Buat Drive Otomatis';
      }
    }
  },

  openEditUserModal: function (id) {
    const user = AdminManager.teachers.find(u => u.id === id);
    if (!user) return;

    document.getElementById('editUserId').value = user.id;
    document.getElementById('editUserNama').value = user.nama_lengkap;
    document.getElementById('editUserNip').value = user.nip || '';
    document.getElementById('editUserMapel').value = user.mapel || '';
    document.getElementById('editUserPangkat').value = user.pangkat_golongan || '';
    document.getElementById('editUserKelas').value = (user.classes || []).join(', ');
    document.getElementById('editUserFolderGuru').value = user.folder_guru_id || '';
    document.getElementById('editUserFolderDokumentasi').value = user.folder_dokumentasi_id || '';
    document.getElementById('editUserFolderDokLaporan').value = user.folder_dok_laporan_id || '';
    document.getElementById('editUserFolderTemplate').value = user.folder_template_id || '';
    document.getElementById('editUserFolderDb').value = user.folder_db_id || '';
    document.getElementById('editUserSheetId').value = user.spreadsheet_id || '';
    document.getElementById('editUserTemplateDocId').value = user.template_doc_id || '';

    const modalEl = document.getElementById('modalEditGuru');
    if (modalEl) {
      const bsModal = bootstrap.Modal.getOrCreateInstance(modalEl);
      bsModal.show();
    }
  },

  saveEditUser: async function () {
    const id = document.getElementById('editUserId').value;
    const btn = document.getElementById('btnSimpanEditGuru');
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Menyimpan...';
    }

    try {
      const classesRaw = document.getElementById('editUserKelas').value;
      const classes = classesRaw ? classesRaw.split(',').map(s => s.trim()).filter(Boolean) : [];

      const payload = {
        nama_lengkap: document.getElementById('editUserNama').value,
        nip: document.getElementById('editUserNip').value,
        mapel: document.getElementById('editUserMapel').value,
        pangkat_golongan: document.getElementById('editUserPangkat').value,
        folder_guru_id: document.getElementById('editUserFolderGuru').value,
        folder_dokumentasi_id: document.getElementById('editUserFolderDokumentasi').value,
        folder_dok_laporan_id: document.getElementById('editUserFolderDokLaporan').value,
        folder_template_id: document.getElementById('editUserFolderTemplate').value,
        folder_db_id: document.getElementById('editUserFolderDb').value,
        spreadsheet_id: document.getElementById('editUserSheetId').value,
        template_doc_id: document.getElementById('editUserTemplateDocId').value,
        classes
      };

      const res = await Api.updateAdminUser(id, payload);
      if (res && res.sukses) {
        alert('Data guru berhasil diperbarui!');
        const modalEl = document.getElementById('modalEditGuru');
        const bsModal = bootstrap.Modal.getInstance(modalEl);
        if (bsModal) bsModal.hide();
        AdminManager.loadUsers();
      } else {
        throw new Error(res.pesan || 'Gagal memperbarui data.');
      }
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = 'Simpan Perubahan';
      }
    }
  },

  provisionDrive: async function (id) {
    if (!confirm('Inisialisasi 4 sub-folder Google Drive sekarang untuk guru ini?')) return;
    try {
      const res = await Api.provisionUserDrive(id);
      if (res && res.sukses) {
        alert('Ruang Google Drive guru berhasil dibuat! Folder & Spreadsheet siap digunakan.');
        AdminManager.loadUsers();
      } else {
        throw new Error(res.pesan || 'Gagal membuat Google Drive.');
      }
    } catch (err) {
      alert('Error: ' + err.message);
    }
  },

  resetPassword: async function (id, nama) {
    const newPass = prompt(`Masukkan kata sandi baru untuk ${nama}:`, 'guru123');
    if (!newPass) return;

    try {
      const res = await Api.resetUserPassword(id, newPass);
      alert(res.pesan || 'Kata sandi berhasil direset!');
    } catch (err) {
      alert('Gagal mereset kata sandi: ' + err.message);
    }
  },

  deleteUser: async function (id, nama) {
    if (!confirm(`Hapus akun ${nama}? Seluruh data LHK guru ini di database akan dihapus.`)) return;

    try {
      const res = await Api.deleteAdminUser(id);
      if (res && res.sukses) {
        alert('Akun guru berhasil dihapus.');
        AdminManager.loadUsers();
      }
    } catch (err) {
      alert('Gagal menghapus akun: ' + err.message);
    }
  },

  // ========================================================
  // 2. MONITORING & REKAPITULASI SEKOLAH
  // ========================================================
  loadRekap: async function () {
    const bulan = document.getElementById('filterRekapBulan')?.value || 'Juni';
    const tahun = document.getElementById('filterRekapTahun')?.value || '2026/2027';

    const container = document.getElementById('adminRekapTableBody');
    if (container) {
      container.innerHTML = '<tr><td colspan="6" class="text-center py-4"><span class="spinner-border spinner-border-sm text-success me-2"></span>Menghitung rekapitulasi sekolah...</td></tr>';
    }

    try {
      const res = await Api.getAdminRekap(bulan, tahun);
      if (res && res.sukses) {
        AdminManager.renderRekap(res.rekap || []);
      }
    } catch (err) {
      if (container) {
        container.innerHTML = `<tr><td colspan="6" class="text-center text-danger py-4">Gagal memuat rekap: ${err.message}</td></tr>`;
      }
    }
  },

  renderRekap: function (rekap) {
    const container = document.getElementById('adminRekapTableBody');
    if (!container) return;

    if (!rekap || rekap.length === 0) {
      container.innerHTML = '<tr><td colspan="6" class="text-center py-4 text-muted">Belum ada data guru.</td></tr>';
      return;
    }

    let html = '';
    rekap.forEach((r, idx) => {
      const isFilled = r.total_hari > 0;
      html += `
        <tr>
          <td class="text-center">${idx + 1}</td>
          <td>
            <strong>${r.nama_lengkap}</strong>
            <div class="small text-muted">NIP. ${r.nip || '-'} • ${r.mapel || 'Guru'}</div>
          </td>
          <td class="text-center">
            <span class="badge ${isFilled ? 'bg-success' : 'bg-secondary'}">${r.total_hari || 0} Hari</span>
          </td>
          <td class="text-center fw-bold text-success">${r.total_volume || 0} Jam</td>
          <td class="small text-muted">${r.tanggal_terakhir || '-'}</td>
          <td class="text-end">
            ${r.spreadsheet_id ? `
              <a href="https://docs.google.com/spreadsheets/d/${r.spreadsheet_id}" target="_blank" class="btn btn-sm btn-outline-primary rounded-pill py-0 px-2" title="Buka Spreadsheet">
                <i class="bi bi-file-earmark-spreadsheet me-1"></i> Sheet
              </a>
            ` : '-'}
          </td>
        </tr>
      `;
    });

    container.innerHTML = html;
  },

  // ========================================================
  // 3. PENGATURAN SISTEM
  // ========================================================
  loadSettings: async function () {
    try {
      const res = await Api.getAdminSettings();
      if (res && res.sukses && res.settings) {
        const s = res.settings;
        if (document.getElementById('settingAcademicYear')) document.getElementById('settingAcademicYear').value = s.active_academic_year || '2026/2027';
        if (document.getElementById('settingParentFolderId')) document.getElementById('settingParentFolderId').value = s.master_parent_folder_id || '';
        if (document.getElementById('settingTemplateSheetId')) document.getElementById('settingTemplateSheetId').value = s.master_template_sheet_id || '';
        if (document.getElementById('settingTemplateDocId')) document.getElementById('settingTemplateDocId').value = s.master_template_doc_id || '';
        if (document.getElementById('settingGasUrl')) document.getElementById('settingGasUrl').value = s.gas_bridge_url || '';
        if (document.getElementById('settingGasToken')) document.getElementById('settingGasToken').value = s.gas_secret_token || 'SECRET_LHK_TOKEN_2026';
      }
    } catch (e) {
      console.warn('Gagal memuat setting:', e);
    }
  },

  saveSettings: async function () {
    const btn = document.getElementById('btnSimpanSettings');
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Menyimpan...';
    }

    try {
      const payload = {
        active_academic_year: document.getElementById('settingAcademicYear').value,
        master_parent_folder_id: document.getElementById('settingParentFolderId').value,
        master_template_sheet_id: document.getElementById('settingTemplateSheetId').value,
        master_template_doc_id: document.getElementById('settingTemplateDocId').value,
        gas_bridge_url: document.getElementById('settingGasUrl').value,
        gas_secret_token: document.getElementById('settingGasToken').value
      };

      const res = await Api.saveAdminSettings(payload);
      if (res && res.sukses) {
        alert('Pengaturan sistem berhasil diperbarui!');
      } else {
        throw new Error(res.pesan || 'Gagal menyimpan pengaturan.');
      }
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = '<i class="bi bi-save me-1"></i> Simpan Pengaturan';
      }
    }
  }
};

window.AdminManager = AdminManager;

