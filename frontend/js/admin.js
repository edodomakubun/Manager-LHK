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
    document.getElementById('editUserFolderTemplate').value = user.folder_template_id || '';
    document.getElementById('editUserFolderDb').value = user.folder_db_id || '';
    document.getElementById('editUserSheetId').value = user.spreadsheet_id || '';
    document.getElementById('editUserTemplateDocId').value = user.template_doc_id || '';

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
        folder_template_id: document.getElementById('editUserFolderTemplate').value,
        folder_db_id: document.getElementById('editUserFolderDb').value,
        spreadsheet_id: document.getElementById('editUserSheetId').value,
        template_doc_id: document.getElementById('editUserTemplateDocId').value,
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

