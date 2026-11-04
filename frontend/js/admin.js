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
            <div class="d-flex align-items-center gap-2">
              ${u.foto_profil ? `
                <img src="${u.foto_profil}" class="rounded-circle border object-fit-cover flex-shrink-0" width="42" height="42" alt="Foto">
              ` : `
                <div class="rounded-circle bg-success-subtle text-success border border-success-subtle d-flex align-items-center justify-content-center fw-bold flex-shrink-0" style="width: 42px; height: 42px; font-size: 0.95rem;">
                  ${(u.nama_lengkap || 'G').substring(0, 1).toUpperCase()}
                </div>
              `}
              <div>
                <div class="fw-bold text-dark">${u.nama_lengkap}</div>
                <small class="text-muted">${u.nip ? `NIP. ${u.nip}` : 'NIP. -'} • <strong>${u.nama_sekolah || 'SD Inpres Leling'}</strong></small>
              </div>
            </div>
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
            <button class="btn btn-sm btn-outline-primary me-1" onclick="AdminManager.openEditUserModal('${u.id}')" title="Edit Profil & Drive Guru">
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
            <div class="d-flex align-items-center gap-2 mb-2">
              ${u.foto_profil ? `
                <img src="${u.foto_profil}" class="rounded-circle border object-fit-cover flex-shrink-0" width="46" height="46" alt="Foto">
              ` : `
                <div class="rounded-circle bg-success-subtle text-success border border-success-subtle d-flex align-items-center justify-content-center fw-bold flex-shrink-0" style="width: 46px; height: 46px; font-size: 1.1rem;">
                  ${(u.nama_lengkap || 'G').substring(0, 1).toUpperCase()}
                </div>
              `}
              <div class="flex-grow-1">
                <h6 class="fw-bold mb-0 text-dark">${u.nama_lengkap}</h6>
                <small class="text-muted d-block">${u.nip ? `NIP. ${u.nip}` : 'NIP. -'} • ${u.nama_sekolah || 'SD Inpres Leling'}</small>
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
      const sekolah = document.getElementById('adminInputSekolah')?.value || 'SD Inpres Leling';
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
        nama_sekolah: sekolah,
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

  handleFotoSelected: async function (inputEl) {
    const file = inputEl.files[0];
    if (!file) return;

    const preview = document.getElementById('editUserFotoPreview');
    const hiddenFoto = document.getElementById('editUserFotoData');
    const infoFoto = document.getElementById('editUserFotoInfo');

    if (infoFoto) infoFoto.innerHTML = '<span class="spinner-border spinner-border-sm text-success me-1"></span>Mengompresi foto profil...';

    try {
      // Kompresi foto menjadi avatar berkualitas tinggi maksimal dimensi 400px (~25KB)
      const res = await ImageCompressor.compress(file, 400, 0.82);
      if (preview) preview.src = res.dataUrl;
      if (hiddenFoto) hiddenFoto.value = res.dataUrl;
      if (infoFoto) infoFoto.innerHTML = `<span class="badge bg-success text-white"><i class="bi bi-check-circle me-1"></i>Foto baru dipilih (${res.compressedKb} KB)</span>`;
    } catch (err) {
      alert('Gagal memproses foto: ' + err.message);
      inputEl.value = '';
      if (infoFoto) infoFoto.innerText = 'Format didukung: JPG, JPEG, PNG, WEBP, HEIC';
    }
  },

  hapusFotoProfil: function () {
    const preview = document.getElementById('editUserFotoPreview');
    const hiddenFoto = document.getElementById('editUserFotoData');
    const fileInput = document.getElementById('editUserFotoInput');
    const infoFoto = document.getElementById('editUserFotoInfo');

    if (fileInput) fileInput.value = '';
    if (hiddenFoto) hiddenFoto.value = '__DELETE__';
    if (preview) preview.src = 'https://placehold.co/100x100?text=Tanpa+Foto';
    if (infoFoto) infoFoto.innerHTML = '<span class="badge bg-secondary-subtle text-muted border">Foto profil akan dihapus saat disimpan</span>';
  },

  openEditUserModal: function (id) {
    const user = AdminManager.teachers.find(u => u.id === id);
    if (!user) return;

    document.getElementById('editUserId').value = user.id;
    document.getElementById('editUserNama').value = user.nama_lengkap || '';
    document.getElementById('editUserNip').value = user.nip || '';
    document.getElementById('editUserSekolah').value = user.nama_sekolah || 'SD Inpres Leling';
    document.getElementById('editUserMapel').value = user.mapel || '';
    document.getElementById('editUserPangkat').value = user.pangkat_golongan || '';
    document.getElementById('editUserJabatan').value = user.jabatan || 'Guru Mata Pelajaran';
    document.getElementById('editUserKelas').value = (user.classes || []).join(', ');

    // Google Drive Aset IDs
    document.getElementById('editUserFolderGuru').value = user.folder_guru_id || '';
    document.getElementById('editUserFolderDokumentasi').value = user.folder_dokumentasi_id || '';
    document.getElementById('editUserFolderDokLaporan').value = user.folder_dok_laporan_id || '';
    document.getElementById('editUserFolderDb').value = user.folder_db_id || '';
    document.getElementById('editUserSheetId').value = user.spreadsheet_id || '';
    if (document.getElementById('editUserFolderTemplate')) document.getElementById('editUserFolderTemplate').value = user.folder_template_id || '';
    if (document.getElementById('editUserTemplateDocId')) document.getElementById('editUserTemplateDocId').value = user.template_doc_id || '';

    // Foto Profil
    const preview = document.getElementById('editUserFotoPreview');
    const hiddenFoto = document.getElementById('editUserFotoData');
    const fileInput = document.getElementById('editUserFotoInput');
    const infoFoto = document.getElementById('editUserFotoInfo');

    if (fileInput) fileInput.value = '';

    if (user.foto_profil && user.foto_profil.trim() !== '') {
      if (preview) preview.src = user.foto_profil;
      if (hiddenFoto) hiddenFoto.value = user.foto_profil;
      if (infoFoto) infoFoto.innerHTML = '<span class="badge bg-success-subtle text-success border border-success"><i class="bi bi-image me-1"></i>Foto profil tersimpan</span>';
    } else {
      const initial = (user.nama_lengkap || 'G').substring(0, 2).toUpperCase();
      if (preview) preview.src = `https://placehold.co/100x100?text=${encodeURIComponent(initial)}`;
      if (hiddenFoto) hiddenFoto.value = '';
      if (infoFoto) infoFoto.innerText = 'Dukungan: JPG, JPEG, PNG, WEBP, HEIC';
    }

    // Status Template Cloudflare R2 Guru
    const badgeTpl = document.getElementById('badgeTemplateUserStatus');
    const btnResetTpl = document.getElementById('btnResetTemplateUser');
    const infoUploadTpl = document.getElementById('infoUploadUserTemplate');
    if (infoUploadTpl) infoUploadTpl.innerHTML = '';

    if (user.custom_template_r2_key) {
      if (badgeTpl) {
        badgeTpl.className = 'badge bg-success-subtle text-success border border-success';
        badgeTpl.innerText = 'Template Kustom R2 Aktif';
      }
      if (btnResetTpl) btnResetTpl.classList.remove('d-none');
    } else {
      if (badgeTpl) {
        badgeTpl.className = 'badge bg-secondary-subtle text-secondary border border-secondary';
        badgeTpl.innerText = 'Master Template R2';
      }
      if (btnResetTpl) btnResetTpl.classList.add('d-none');
    }

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
      btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Menyimpan Perubahan...';
    }

    try {
      const classesRaw = document.getElementById('editUserKelas').value;
      const classes = classesRaw ? classesRaw.split(',').map(s => s.trim()).filter(Boolean) : [];
      const hiddenFoto = document.getElementById('editUserFotoData')?.value;

      let fotoVal = undefined;
      if (hiddenFoto === '__DELETE__') {
        fotoVal = '';
      } else if (hiddenFoto && (hiddenFoto.startsWith('data:image') || hiddenFoto.startsWith('http'))) {
        fotoVal = hiddenFoto;
      }

      const payload = {
        nama_lengkap: document.getElementById('editUserNama').value,
        nip: document.getElementById('editUserNip').value,
        nama_sekolah: document.getElementById('editUserSekolah').value,
        mapel: document.getElementById('editUserMapel').value,
        pangkat_golongan: document.getElementById('editUserPangkat').value,
        jabatan: document.getElementById('editUserJabatan').value,
        folder_guru_id: document.getElementById('editUserFolderGuru').value,
        folder_dokumentasi_id: document.getElementById('editUserFolderDokumentasi').value,
        folder_dok_laporan_id: document.getElementById('editUserFolderDokLaporan').value,
        folder_db_id: document.getElementById('editUserFolderDb').value,
        spreadsheet_id: document.getElementById('editUserSheetId').value,
        folder_template_id: document.getElementById('editUserFolderTemplate')?.value || '',
        template_doc_id: document.getElementById('editUserTemplateDocId')?.value || '',
        classes
      };

      if (fotoVal !== undefined) {
        payload.foto_profil = fotoVal;
      }

      const res = await Api.updateAdminUser(id, payload);
      if (res && res.sukses) {
        alert('Data dan profil guru berhasil diperbarui! 🎉');
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
        btn.innerHTML = 'Simpan Perubahan Profil';
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
  formatTanggalSingkat: function (tglStr) {
    if (!tglStr) return '-';
    try {
      const parts = tglStr.split('-');
      if (parts.length === 3) {
        const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        const hArr = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
        const bArr = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
        return `${hArr[d.getDay()]}, ${parts[2]} ${bArr[d.getMonth()]} ${parts[0]}`;
      }
    } catch (_) {}
    return tglStr;
  },

  loadRekap: async function () {
    const selectBulan = document.getElementById('filterRekapBulan');
    const selectTahun = document.getElementById('filterRekapTahun');

    // Otomatis pilih bulan sekarang jika baru pertama dibuka
    if (selectBulan && !selectBulan.dataset.initialized) {
      const namaBulanArr = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
      ];
      const curMonth = namaBulanArr[new Date().getMonth()];
      selectBulan.value = curMonth;
      selectBulan.dataset.initialized = 'true';
    }

    const bulan = selectBulan?.value || '';
    const tahun = selectTahun?.value || '2026/2027';

    const tableContainer = document.getElementById('adminRekapTableBody');
    const mobileContainer = document.getElementById('adminRekapMobileCards');

    if (tableContainer) {
      tableContainer.innerHTML = '<tr><td colspan="6" class="text-center py-4"><span class="spinner-border spinner-border-sm text-success me-2"></span>Menghitung rekapitulasi sekolah...</td></tr>';
    }
    if (mobileContainer) {
      mobileContainer.innerHTML = '<div class="text-center py-4 text-muted"><span class="spinner-border spinner-border-sm text-success me-2"></span>Menghitung rekapitulasi...</div>';
    }

    try {
      const res = await Api.getAdminRekap(bulan, tahun);
      if (res && res.sukses) {
        AdminManager.renderRekap(res.rekap || [], bulan, tahun);
      } else {
        throw new Error(res.pesan || 'Gagal mengambil data rekapitulasi.');
      }
    } catch (err) {
      if (tableContainer) {
        tableContainer.innerHTML = `<tr><td colspan="6" class="text-center text-danger py-4"><i class="bi bi-exclamation-triangle me-1"></i>Gagal memuat rekap: ${err.message}</td></tr>`;
      }
      if (mobileContainer) {
        mobileContainer.innerHTML = `<div class="alert alert-danger text-center small"><i class="bi bi-exclamation-triangle me-1"></i>Gagal memuat rekap: ${err.message}</div>`;
      }
    }
  },

  renderRekap: function (rekap, bulan, tahun) {
    const tableContainer = document.getElementById('adminRekapTableBody');
    const mobileContainer = document.getElementById('adminRekapMobileCards');

    // 1. Hitung Akumulasi Statistik
    let totalGuru = rekap.length;
    let guruMengisi = 0;
    let grandTotalHari = 0;
    let grandTotalVol = 0;

    rekap.forEach(r => {
      if ((r.total_hari || 0) > 0) guruMengisi++;
      grandTotalHari += (r.total_hari || 0);
      grandTotalVol += (r.total_volume || 0);
    });

    const persen = totalGuru > 0 ? Math.round((guruMengisi / totalGuru) * 100) : 0;

    // Update Kartu Statistik di Bagian Atas
    if (document.getElementById('rekapStatTotalGuru')) document.getElementById('rekapStatTotalGuru').innerText = totalGuru;
    if (document.getElementById('rekapStatGuruMengisi')) document.getElementById('rekapStatGuruMengisi').innerText = `${guruMengisi} Guru`;
    if (document.getElementById('rekapStatPersen')) document.getElementById('rekapStatPersen').innerText = `${persen}% berpartisipasi`;
    if (document.getElementById('rekapStatTotalHari')) document.getElementById('rekapStatTotalHari').innerText = `${grandTotalHari} Hari`;
    if (document.getElementById('rekapStatTotalVolume')) document.getElementById('rekapStatTotalVolume').innerText = `${grandTotalVol} Kegiatan`;

    if (!rekap || rekap.length === 0) {
      const emptyMsg = `<tr><td colspan="6" class="text-center py-4 text-muted">Belum ada akun guru aktif yang terdaftar.</td></tr>`;
      if (tableContainer) tableContainer.innerHTML = emptyMsg;
      if (mobileContainer) mobileContainer.innerHTML = '<div class="text-center py-4 text-muted">Belum ada akun guru aktif.</div>';
      return;
    }

    // 2. Render Tabel Desktop
    if (tableContainer) {
      let dskHtml = '';
      rekap.forEach((r, idx) => {
        const isFilled = (r.total_hari || 0) > 0;
        const tglFormatted = AdminManager.formatTanggalSingkat(r.tanggal_terakhir);

        dskHtml += `
          <tr>
            <td class="text-center">${idx + 1}</td>
            <td>
              <strong class="text-dark">${r.nama_lengkap}</strong>
              <div class="small text-muted">
                ${r.nip ? `NIP. ${r.nip}` : 'NIP. -'} • <span class="badge bg-light text-secondary border">${r.mapel || 'Guru'}</span>
              </div>
            </td>
            <td class="text-center">
              <span class="badge ${isFilled ? 'bg-success px-2 py-1' : 'bg-secondary-subtle text-muted border'}">
                <i class="bi ${isFilled ? 'bi-check-circle-fill' : 'bi-dash-circle'} me-1"></i>${r.total_hari || 0} Hari
              </span>
            </td>
            <td class="text-center">
              <span class="fw-bold ${isFilled ? 'text-success' : 'text-muted'}">${r.total_volume || 0} Kegiatan</span>
            </td>
            <td>
              ${isFilled ? `
                <div class="small fw-semibold text-dark"><i class="bi bi-clock-history me-1 text-success"></i>${tglFormatted}</div>
              ` : '<span class="text-muted small">-</span>'}
            </td>
            <td class="text-end">
              ${r.spreadsheet_id ? `
                <a href="https://docs.google.com/spreadsheets/d/${r.spreadsheet_id}" target="_blank" class="btn btn-sm btn-outline-success rounded-pill py-1 px-3" title="Buka Google Spreadsheet Guru">
                  <i class="bi bi-file-earmark-spreadsheet me-1"></i> Buka Sheet
                </a>
              ` : '<span class="text-muted small">Belum ada Sheet</span>'}
            </td>
          </tr>
        `;
      });
      tableContainer.innerHTML = dskHtml;
    }

    // 3. Render Kartu Mobile
    if (mobileContainer) {
      let mobHtml = '';
      rekap.forEach((r, idx) => {
        const isFilled = (r.total_hari || 0) > 0;
        const tglFormatted = AdminManager.formatTanggalSingkat(r.tanggal_terakhir);

        mobHtml += `
          <div class="card-cms p-3 mb-2 shadow-sm border-start border-4 ${isFilled ? 'border-success' : 'border-secondary'}">
            <div class="d-flex justify-content-between align-items-start mb-2">
              <div>
                <strong class="text-dark fs-6 d-block">${r.nama_lengkap}</strong>
                <small class="text-muted">${r.nip ? `NIP. ${r.nip}` : 'NIP. -'} • ${r.mapel || 'Guru'}</small>
              </div>
              <span class="badge ${isFilled ? 'bg-success' : 'bg-secondary'} rounded-pill px-2 py-1">
                ${isFilled ? 'Aktif Mengisi' : 'Belum Mengisi'}
              </span>
            </div>

            <div class="row g-2 py-2 border-top border-bottom my-2 bg-light rounded text-center">
              <div class="col-4 border-end">
                <small class="text-muted d-block" style="font-size: 0.72rem;">Hari Terisi</small>
                <strong class="${isFilled ? 'text-success' : 'text-muted'} fs-6">${r.total_hari || 0}</strong> <small class="text-muted">Hari</small>
              </div>
              <div class="col-4 border-end">
                <small class="text-muted d-block" style="font-size: 0.72rem;">Total Volume</small>
                <strong class="${isFilled ? 'text-success' : 'text-muted'} fs-6">${r.total_volume || 0}</strong> <small class="text-muted">Keg.</small>
              </div>
              <div class="col-4">
                <small class="text-muted d-block" style="font-size: 0.72rem;">Terakhir Isi</small>
                <small class="fw-semibold text-dark d-block text-truncate">${tglFormatted}</small>
              </div>
            </div>

            <div class="d-flex justify-content-end gap-2 pt-1">
              ${r.spreadsheet_id ? `
                <a href="https://docs.google.com/spreadsheets/d/${r.spreadsheet_id}" target="_blank" class="btn btn-sm btn-outline-success rounded-pill px-3 py-1 fw-semibold w-100 text-center">
                  <i class="bi bi-file-earmark-spreadsheet me-1"></i> Buka Google Spreadsheet Guru
                </a>
              ` : '<span class="text-muted small">Folder/Sheet belum diatur</span>'}
            </div>
          </div>
        `;
      });
      mobileContainer.innerHTML = mobHtml;
    }
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
        if (document.getElementById('settingWhatsappGroupUrl')) document.getElementById('settingWhatsappGroupUrl').value = s.whatsapp_group_url || '';
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
        master_template_doc_id: document.getElementById('settingTemplateDocId') ? document.getElementById('settingTemplateDocId').value : '',
        gas_bridge_url: document.getElementById('settingGasUrl').value,
        gas_secret_token: document.getElementById('settingGasToken').value,
        whatsapp_group_url: document.getElementById('settingWhatsappGroupUrl') ? document.getElementById('settingWhatsappGroupUrl').value.trim() : ''
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
  },

  // ========================================================
  // 4. MANAJEMEN LANGGANAN & PEMBAYARAN (BILLING)
  // ========================================================
  subscriptions: [],
  currentPaymentDetail: null,
  cachedBase64Qr: '',

  loadBilling: async function () {
    const tableBody = document.getElementById('adminBillingTableBody');
    const mobileContainer = document.getElementById('adminBillingMobileCards');
    if (tableBody) {
      tableBody.innerHTML = '<tr><td colspan="6" class="text-center py-4"><span class="spinner-border spinner-border-sm text-success me-2"></span>Memuat data langganan guru...</td></tr>';
    }

    try {
      const res = await Api.getAdminSubscriptions();
      if (res && res.sukses) {
        AdminManager.subscriptions = res.users || [];

        // Render Summary
        const s = res.summary || {};
        if (document.getElementById('billingTotalGuru')) document.getElementById('billingTotalGuru').innerText = s.totalGuru || 0;
        if (document.getElementById('billingActiveCount')) document.getElementById('billingActiveCount').innerText = s.activeCount || 0;
        if (document.getElementById('billingPendingCount')) document.getElementById('billingPendingCount').innerText = s.pendingCount || 0;
        if (document.getElementById('billingFrozenCount')) document.getElementById('billingFrozenCount').innerText = s.frozenCount || 0;

        // Badge pending di menu jika ada
        const navBadge = document.getElementById('billingNavPendingBadge');
        if (navBadge) {
          if (s.pendingCount > 0) {
            navBadge.textContent = s.pendingCount;
            navBadge.classList.remove('d-none');
          } else {
            navBadge.classList.add('d-none');
          }
        }

        // Render Status Toggle QR di UI
        const toggleQr = document.getElementById('togglePaymentFeature');
        if (toggleQr && res.settings) {
          toggleQr.checked = res.settings.enabled;
        }

        AdminManager.renderBillingList(AdminManager.subscriptions);
      }
    } catch (err) {
      if (tableBody) {
        tableBody.innerHTML = `<tr><td colspan="6" class="text-center text-danger py-4">Gagal memuat: ${err.message}</td></tr>`;
      }
    }
  },

  renderBillingList: function (users) {
    const tableBody = document.getElementById('adminBillingTableBody');
    const mobileContainer = document.getElementById('adminBillingMobileCards');
    if (!tableBody) return;

    if (users.length === 0) {
      tableBody.innerHTML = '<tr><td colspan="6" class="text-center py-4 text-muted">Belum ada akun guru.</td></tr>';
      if (mobileContainer) mobileContainer.innerHTML = '<div class="text-center py-4 text-muted">Belum ada akun guru.</div>';
      return;
    }

    // 1. Desktop Table
    let html = '';
    users.forEach((u, idx) => {
      const isFrozen = u.is_frozen === 1;
      const isPending = u.subscription_status === 'pending_verification';

      let statusBadge = '<span class="badge bg-success-subtle text-success border border-success-subtle px-2 py-1"><i class="bi bi-check-circle-fill me-1"></i>Lunas / Aktif</span>';
      if (isPending) {
        statusBadge = '<span class="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle px-2 py-1"><i class="bi bi-clock-history me-1"></i>Menunggu Verifikasi</span>';
      } else if (isFrozen) {
        statusBadge = '<span class="badge bg-danger-subtle text-danger border border-danger-subtle px-2 py-1"><i class="bi bi-lock-fill me-1"></i>Dibekukan</span>';
      }

      html += `
        <tr>
          <td class="text-center">${idx + 1}</td>
          <td>
            <div class="d-flex align-items-center gap-2">
              ${u.foto_profil ? `
                <img src="${u.foto_profil}" class="rounded-circle border object-fit-cover flex-shrink-0" width="38" height="38" alt="Foto">
              ` : `
                <div class="rounded-circle bg-success-subtle text-success border border-success-subtle d-flex align-items-center justify-content-center fw-bold flex-shrink-0" style="width: 38px; height: 38px; font-size: 0.9rem;">
                  ${(u.nama_lengkap || 'G').substring(0, 1).toUpperCase()}
                </div>
              `}
              <div>
                <div class="fw-bold text-dark">${u.nama_lengkap}</div>
                <small class="text-muted">${u.nip ? `NIP. ${u.nip}` : 'NIP. -'}</small>
              </div>
            </div>
          </td>
          <td>
            <span class="badge bg-light text-primary border">${u.mapel || 'Guru'}</span>
          </td>
          <td class="text-center">
            ${statusBadge}
          </td>
          <td>
            ${u.last_payment_id ? `
              <button class="btn btn-sm ${isPending ? 'btn-warning text-dark fw-bold' : 'btn-outline-secondary'} py-1 px-2" onclick="AdminManager.openBuktiModal('${u.last_payment_id}')">
                <i class="bi bi-receipt me-1"></i> ${isPending ? 'Periksa Bukti (Baru!)' : 'Lihat Bukti'}
              </button>
            ` : `
              <span class="text-muted small">Belum ada bukti</span>
            `}
          </td>
          <td class="text-end text-nowrap">
            ${isFrozen ? `
              <button class="btn btn-sm btn-success px-3" onclick="AdminManager.toggleFreeze('${u.id}', 1, '${u.nama_lengkap}')" title="Buka Pembekuan Akun">
                <i class="bi bi-unlock-fill me-1"></i> Buka Akses
              </button>
            ` : `
              <button class="btn btn-sm btn-outline-danger px-3" onclick="AdminManager.toggleFreeze('${u.id}', 0, '${u.nama_lengkap}')" title="Bekukan Tampilan Akun">
                <i class="bi bi-lock-fill me-1"></i> Bekukan
              </button>
            `}
          </td>
        </tr>
      `;
    });
    tableBody.innerHTML = html;

    // 2. Mobile Cards
    if (mobileContainer) {
      let mHtml = '';
      users.forEach(u => {
        const isFrozen = u.is_frozen === 1;
        const isPending = u.subscription_status === 'pending_verification';

        mHtml += `
          <div class="card-cms p-3 mb-3 border ${isFrozen ? 'border-danger-subtle bg-danger-subtle bg-opacity-10' : ''}">
            <div class="d-flex align-items-center justify-content-between mb-2">
              <div class="fw-bold text-dark">${u.nama_lengkap}</div>
              <div>
                ${isPending ? '<span class="badge bg-warning text-dark">Perlu Verifikasi</span>' : isFrozen ? '<span class="badge bg-danger">Dibekukan</span>' : '<span class="badge bg-success">Aktif</span>'}
              </div>
            </div>
            <div class="small text-muted mb-3">${u.nip ? `NIP. ${u.nip}` : 'NIP. -'} • ${u.mapel || 'Guru'}</div>
            <div class="d-flex gap-2">
              ${u.last_payment_id ? `
                <button class="btn btn-sm ${isPending ? 'btn-warning text-dark fw-bold' : 'btn-outline-secondary'} flex-fill" onclick="AdminManager.openBuktiModal('${u.last_payment_id}')">
                  <i class="bi bi-receipt me-1"></i> Bukti Bayar
                </button>
              ` : ''}
              ${isFrozen ? `
                <button class="btn btn-sm btn-success flex-fill" onclick="AdminManager.toggleFreeze('${u.id}', 1, '${u.nama_lengkap}')">
                  <i class="bi bi-unlock-fill me-1"></i> Buka Akses
                </button>
              ` : `
                <button class="btn btn-sm btn-outline-danger flex-fill" onclick="AdminManager.toggleFreeze('${u.id}', 0, '${u.nama_lengkap}')">
                  <i class="bi bi-lock-fill me-1"></i> Bekukan
                </button>
              `}
            </div>
          </div>
        `;
      });
      mobileContainer.innerHTML = mHtml;
    }
  },

  toggleFreeze: async function (userId, currentlyFrozen, nama) {
    const actionText = currentlyFrozen ? 'membuka pembekuan akses akun' : 'membekukan tampilan akun';
    if (!confirm(`Apakah Anda yakin ingin ${actionText} untuk ${nama}?`)) return;

    try {
      const res = await Api.freezeUser(userId, currentlyFrozen ? 0 : 1);
      if (res && res.sukses) {
        alert(res.pesan);
        AdminManager.loadBilling();
      } else {
        throw new Error(res.pesan || 'Gagal mengubah status pembekuan.');
      }
    } catch (err) {
      alert('Error: ' + err.message);
    }
  },

  openBuktiModal: async function (paymentId) {
    try {
      const res = await Api.getAdminPaymentDetail(paymentId);
      if (!res || !res.sukses || !res.payment) {
        throw new Error(res ? res.pesan : 'Data bukti tidak ditemukan.');
      }

      const p = res.payment;
      AdminManager.currentPaymentDetail = p;

      document.getElementById('modalBuktiNama').textContent = p.nama_lengkap || '-';
      document.getElementById('modalBuktiNip').textContent = p.nip ? `NIP. ${p.nip}` : '-';
      document.getElementById('modalBuktiPeriode').textContent = `${p.bulan} ${p.tahun}`;
      document.getElementById('modalBuktiNominal').textContent = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(p.nominal || 50000);
      document.getElementById('modalBuktiTanggal').textContent = p.created_at ? new Date(p.created_at).toLocaleString('id-ID') : '-';
      document.getElementById('modalBuktiCatatan').textContent = p.catatan_user || 'Tidak ada catatan.';

      const imgEl = document.getElementById('modalBuktiImg');
      if (imgEl) imgEl.src = p.bukti_bayar || '';

      const badgeStatus = document.getElementById('modalBuktiStatusBadge');
      if (badgeStatus) {
        if (p.status === 'approved') {
          badgeStatus.innerHTML = '<span class="badge bg-success"><i class="bi bi-check-circle-fill me-1"></i>Sudah Diverifikasi (Lunas)</span>';
        } else if (p.status === 'rejected') {
          badgeStatus.innerHTML = '<span class="badge bg-danger"><i class="bi bi-x-circle-fill me-1"></i>Bukti Ditolak</span>';
        } else {
          badgeStatus.innerHTML = '<span class="badge bg-warning text-dark"><i class="bi bi-clock-history me-1"></i>Menunggu Verifikasi</span>';
        }
      }

      // Tampilkan tombol aksi jika masih pending
      const btnApprove = document.getElementById('btnApprovePayment');
      const btnReject = document.getElementById('btnRejectPayment');
      if (btnApprove) btnApprove.disabled = (p.status === 'approved');
      if (btnReject) btnReject.disabled = (p.status === 'rejected');

      const modalEl = document.getElementById('modalBuktiBayar');
      const modal = new bootstrap.Modal(modalEl);
      modal.show();
    } catch (err) {
      alert('Gagal memuat bukti pembayaran: ' + err.message);
    }
  },

  verifyCurrentPayment: async function (status) {
    if (!AdminManager.currentPaymentDetail) return;
    const paymentId = AdminManager.currentPaymentDetail.id;

    let notes = '';
    if (status === 'rejected') {
      notes = prompt('Masukkan alasan penolakan bukti pembayaran:', 'Nominal tidak sesuai / Bukti tidak jelas');
      if (notes === null) return; // Batal
    } else {
      if (!confirm('Verifikasi bukti transfer ini sah dan buka pembekuan akun guru sekarang?')) return;
    }

    try {
      const res = await Api.verifyPayment(paymentId, status, notes);
      if (res && res.sukses) {
        alert(res.pesan);
        const modalEl = document.getElementById('modalBuktiBayar');
        const modal = bootstrap.Modal.getInstance(modalEl);
        if (modal) modal.hide();
        AdminManager.loadBilling();
      } else {
        throw new Error(res.pesan || 'Gagal memverifikasi bukti.');
      }
    } catch (err) {
      alert('Error: ' + err.message);
    }
  },

  openPaymentSettingsModal: async function () {
    try {
      const res = await Api.getPaymentSettings();
      if (res && res.sukses && res.settings) {
        const s = res.settings;
        document.getElementById('settingPayEnabled').checked = s.enabled;
        document.getElementById('settingPayAmount').value = s.amount || 50000;
        document.getElementById('settingPayInstructions').value = s.instructions || '';

        AdminManager.cachedBase64Qr = s.qr_code || '';
        const qrPreview = document.getElementById('settingQrPreview');
        const qrPlaceholder = document.getElementById('settingQrPlaceholder');

        if (s.qr_code) {
          if (qrPreview) {
            qrPreview.src = s.qr_code;
            qrPreview.classList.remove('d-none');
          }
          if (qrPlaceholder) qrPlaceholder.classList.add('d-none');
        } else {
          if (qrPreview) qrPreview.classList.add('d-none');
          if (qrPlaceholder) qrPlaceholder.classList.remove('d-none');
        }

        const modalEl = document.getElementById('modalSettingPayment');
        const modal = new bootstrap.Modal(modalEl);
        modal.show();
      }
    } catch (err) {
      alert('Gagal memuat pengaturan pembayaran: ' + err.message);
    }
  },

  handleQrUpload: async function (inputEl) {
    const file = inputEl.files[0];
    if (!file) return;

    try {
      let base64 = '';
      if (window.ImageCompressor && typeof ImageCompressor.compressImage === 'function') {
        const compressed = await ImageCompressor.compressImage(file, { maxWidth: 800, quality: 0.85 });
        base64 = compressed.base64;
      } else {
        base64 = await SubscriptionManager.fileToBase64(file);
      }

      AdminManager.cachedBase64Qr = base64;
      const qrPreview = document.getElementById('settingQrPreview');
      const qrPlaceholder = document.getElementById('settingQrPlaceholder');

      if (qrPreview) {
        qrPreview.src = base64;
        qrPreview.classList.remove('d-none');
      }
      if (qrPlaceholder) qrPlaceholder.classList.add('d-none');
    } catch (err) {
      alert('Gagal memproses QR Code: ' + err.message);
    }
  },

  savePaymentSettings: async function () {
    const btn = document.getElementById('btnSavePaymentSettings');
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Menyimpan...';
    }

    try {
      const payload = {
        enabled: document.getElementById('settingPayEnabled').checked,
        amount: parseInt(document.getElementById('settingPayAmount').value || '50000', 10),
        qr_code: AdminManager.cachedBase64Qr || '',
        instructions: document.getElementById('settingPayInstructions').value.trim()
      };

      const res = await Api.savePaymentSettings(payload);
      if (res && res.sukses) {
        alert(res.pesan || 'Pengaturan pembayaran berhasil disimpan!');
        const modalEl = document.getElementById('modalSettingPayment');
        const modal = bootstrap.Modal.getInstance(modalEl);
        if (modal) modal.hide();
        AdminManager.loadBilling();
      } else {
        throw new Error(res.pesan || 'Gagal menyimpan pengaturan.');
      }
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = 'Simpan Pengaturan Pembayaran';
      }
    }
  },

  toggleQuickPaymentFeature: async function (checkboxEl) {
    try {
      const isEnabled = checkboxEl.checked;
      await Api.savePaymentSettings({ enabled: isEnabled });
      AdminManager.loadBilling();
    } catch (err) {
      alert('Gagal memperbarui status: ' + err.message);
      checkboxEl.checked = !checkboxEl.checked;
    }
  },

  // --- TEMPLATE CLOUDFLARE R2 ACTIONS ---
  downloadMasterTemplate: function () {
    Api.downloadMasterTemplate();
  },

  triggerUploadMasterTemplate: function () {
    const input = document.getElementById('inputUploadMasterTemplate');
    if (input) input.click();
  },

  handleUploadMasterTemplate: async function (event) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.docx')) {
      alert('Hanya file Microsoft Word (.docx) yang diperbolehkan.');
      return;
    }

    const info = document.getElementById('infoUploadMasterTemplate');
    if (info) info.innerHTML = '<span class="spinner-border spinner-border-sm text-primary me-2"></span>Mengunggah Master Template ke Cloudflare R2...';

    try {
      const formData = new FormData();
      formData.append('template', file);

      const res = await Api.uploadMasterTemplate(formData);
      if (res && res.sukses) {
        if (info) info.innerHTML = `<span class="text-success"><i class="bi bi-check-circle-fill me-1"></i>${res.pesan}</span>`;
        alert(res.pesan || 'Master Template berhasil diperbarui di Cloudflare R2!');
      } else {
        throw new Error(res?.pesan || 'Gagal mengunggah template.');
      }
    } catch (err) {
      if (info) info.innerHTML = `<span class="text-danger"><i class="bi bi-exclamation-triangle-fill me-1"></i>${err.message}</span>`;
      alert('Gagal unggah template: ' + err.message);
    } finally {
      event.target.value = '';
    }
  },

  downloadUserTemplate: function () {
    const userId = document.getElementById('editUserId').value;
    if (!userId) return;
    Api.downloadUserTemplate(userId);
  },

  triggerUploadUserTemplate: function () {
    const input = document.getElementById('inputUploadUserTemplate');
    if (input) input.click();
  },

  handleUploadUserTemplate: async function (event) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.docx')) {
      alert('Hanya file Microsoft Word (.docx) yang diperbolehkan.');
      return;
    }

    const userId = document.getElementById('editUserId').value;
    if (!userId) return;

    const info = document.getElementById('infoUploadUserTemplate');
    if (info) info.innerHTML = '<span class="spinner-border spinner-border-sm text-primary me-2"></span>Mengunggah template guru ke Cloudflare R2...';

    try {
      const formData = new FormData();
      formData.append('template', file);

      const res = await Api.uploadUserTemplate(userId, formData);
      if (res && res.sukses) {
        if (info) info.innerHTML = `<span class="text-success"><i class="bi bi-check-circle-fill me-1"></i>${res.pesan}</span>`;
        alert(res.pesan);

        // Update badge
        const badgeTpl = document.getElementById('badgeTemplateUserStatus');
        const btnResetTpl = document.getElementById('btnResetTemplateUser');
        if (badgeTpl) {
          badgeTpl.className = 'badge bg-success-subtle text-success border border-success';
          badgeTpl.innerText = 'Template Kustom R2 Aktif';
        }
        if (btnResetTpl) btnResetTpl.classList.remove('d-none');

        await AdminManager.loadUsers();
      } else {
        throw new Error(res?.pesan || 'Gagal mengunggah template guru.');
      }
    } catch (err) {
      if (info) info.innerHTML = `<span class="text-danger"><i class="bi bi-exclamation-triangle-fill me-1"></i>${err.message}</span>`;
      alert('Gagal unggah template guru: ' + err.message);
    } finally {
      event.target.value = '';
    }
  },

  resetUserTemplate: async function () {
    const userId = document.getElementById('editUserId').value;
    if (!userId) return;

    if (!confirm('Kembalikan template guru ini ke Master Template Cloudflare R2 bawaan? Template kustom di R2 akan dihapus.')) {
      return;
    }

    try {
      const res = await Api.resetUserTemplate(userId);
      if (res && res.sukses) {
        alert(res.pesan);
        const badgeTpl = document.getElementById('badgeTemplateUserStatus');
        const btnResetTpl = document.getElementById('btnResetTemplateUser');
        if (badgeTpl) {
          badgeTpl.className = 'badge bg-secondary-subtle text-secondary border border-secondary';
          badgeTpl.innerText = 'Master Template R2';
        }
        if (btnResetTpl) btnResetTpl.classList.add('d-none');
        await AdminManager.loadUsers();
      } else {
        alert(res?.pesan || 'Gagal mereset template.');
      }
    } catch (e) {
      alert('Gagal mereset template: ' + e.message);
    }
  }
};

window.AdminManager = AdminManager;

