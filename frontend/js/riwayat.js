/**
 * ========================================================
 * 📑 RIWAYAT AGENDA & DATA TABLE - CMS MANAGER LHK
 * ========================================================
 */

const Riwayat = {
  activeRecords: [],
  selectedDeleteId: null,

  load: async function () {
    const filterBulan = document.getElementById('filterBulan')?.value || '';
    const filterTahun = document.getElementById('filterTahun')?.value || '2026/2027';

    Riwayat.renderSkeleton();

    try {
      const res = await Api.getLhkList({
        bulan: filterBulan,
        tahunAjaran: filterTahun
      });

      if (res && res.sukses) {
        Riwayat.activeRecords = res.records || [];
        Riwayat.render(Riwayat.activeRecords);
      } else {
        throw new Error(res.pesan || 'Gagal memuat riwayat.');
      }
    } catch (err) {
      const container = document.getElementById('riwayatMobileContainer');
      if (container) {
        container.innerHTML = `
          <div class="alert alert-danger text-center">
            <i class="bi bi-exclamation-triangle-fill me-2"></i>Gagal memuat data: ${err.message}
          </div>
        `;
      }
    }
  },

  renderSkeleton: function () {
    const mobContainer = document.getElementById('riwayatMobileContainer');
    const dskContainer = document.getElementById('riwayatDesktopBody');

    if (mobContainer) {
      let html = '';
      for (let i = 0; i < 3; i++) {
        html += `
          <div class="card-cms p-3 mb-3">
            <div class="skeleton-box mb-2" style="height: 20px; width: 45%;"></div>
            <div class="skeleton-box mb-2" style="height: 16px; width: 90%;"></div>
            <div class="skeleton-box" style="height: 14px; width: 60%;"></div>
          </div>
        `;
      }
      mobContainer.innerHTML = html;
    }

    if (dskContainer) {
      dskContainer.innerHTML = `
        <tr><td colspan="7" class="text-center py-4"><span class="spinner-border spinner-border-sm text-success me-2"></span>Memuat data agenda...</td></tr>
      `;
    }
  },

  render: function (records) {
    const mobContainer = document.getElementById('riwayatMobileContainer');
    const dskContainer = document.getElementById('riwayatDesktopBody');
    const statSection = document.getElementById('riwayatStatSection');

    // Update Ringkasan Statistik
    if (statSection) {
      let totalVol = 0;
      records.forEach(r => totalVol += (r.volume || 0));
      document.getElementById('riwayatStatHari').innerText = records.length;
      document.getElementById('riwayatStatVolume').innerText = totalVol + ' Jam';
      statSection.style.display = records.length > 0 ? 'flex' : 'none';
    }

    if (!records || records.length === 0) {
      const emptyHtml = `
        <div class="text-center py-5 text-muted">
          <i class="bi bi-folder-x fs-1 text-secondary opacity-50 d-block mb-3"></i>
          <p class="mb-0">Tidak ada agenda pada periode bulan yang dipilih.</p>
        </div>
      `;
      if (mobContainer) mobContainer.innerHTML = emptyHtml;
      if (dskContainer) dskContainer.innerHTML = `<tr><td colspan="7" class="text-center py-5 text-muted">Tidak ada data ditemukan.</td></tr>`;
      return;
    }

    // 1. RENDER KARTU TIMELINE MOBILE
    if (mobContainer) {
      let mobHtml = '';
      records.forEach(r => {
        const fotoArr = [r.foto_tm_id, r.foto_ntm1_id, r.foto_ntm2_id, r.foto_ntm3_id, r.foto_ntm4_id, r.foto_ntm5_id].filter(id => id && id.trim() !== '');
        const ntmLines = r.non_tatap_muka ? r.non_tatap_muka.split('\n').filter(Boolean) : [];

        mobHtml += `
          <div class="timeline-card-mobile">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <span class="timeline-date-badge"><i class="bi bi-calendar3 me-1"></i>${r.tanggal_teks || r.tanggal}</span>
              <span class="badge bg-light text-dark border">Vol: <strong>${r.volume || 0} Jam</strong></span>
            </div>

            ${r.cp || r.tp || r.kelas ? `
            <div class="mb-2 p-2 rounded bg-light border-start border-3 border-success">
              <div class="fw-bold text-success small"><i class="bi bi-person-video3 me-1"></i>Tatap Muka ${r.kelas ? `(${r.kelas})` : ''}</div>
              ${r.cp ? `<div class="small text-dark"><strong>CP:</strong> ${r.cp}</div>` : ''}
              ${r.tp ? `<div class="small text-muted"><strong>TP:</strong> ${r.tp}</div>` : ''}
            </div>` : ''}

            ${ntmLines.length > 0 ? `
            <div class="mb-2">
              <div class="small fw-bold text-primary"><i class="bi bi-briefcase me-1"></i>Non Tatap Muka:</div>
              <ul class="small text-muted ps-3 mb-0">
                ${ntmLines.map(line => `<li>${line}</li>`).join('')}
              </ul>
            </div>` : ''}

            ${fotoArr.length > 0 ? `
            <div class="timeline-photos-grid">
              ${fotoArr.map(id => `
                <img src="https://lh3.googleusercontent.com/d/${id}" class="timeline-photo-thumb" 
                     onerror="this.src='https://placehold.co/100x100?text=Foto'" 
                     onclick="Riwayat.openPhotoModal('${id}')" title="Klik untuk perbesar">
              `).join('')}
            </div>` : ''}

            <div class="timeline-card-actions">
              <button class="btn btn-outline-primary btn-touch-sm" onclick="Riwayat.openEditModal('${r.id}')">
                <i class="bi bi-pencil"></i> Edit
              </button>
              <button class="btn btn-outline-danger btn-touch-sm" onclick="Riwayat.confirmDelete('${r.id}')">
                <i class="bi bi-trash3"></i> Hapus
              </button>
            </div>
          </div>
        `;
      });
      mobContainer.innerHTML = mobHtml;
    }

    // 2. RENDER TABEL DESKTOP
    if (dskContainer) {
      let dskHtml = '';
      records.forEach((r, idx) => {
        const fotoArr = [r.foto_tm_id, r.foto_ntm1_id, r.foto_ntm2_id, r.foto_ntm3_id, r.foto_ntm4_id, r.foto_ntm5_id].filter(id => id && id.trim() !== '');

        dskHtml += `
          <tr>
            <td class="text-center">${idx + 1}</td>
            <td class="fw-semibold text-nowrap">${r.tanggal_teks || r.tanggal}</td>
            <td>
              ${r.kelas ? `<span class="badge bg-secondary me-1">${r.kelas}</span>` : ''}
              <strong>${r.cp || '-'}</strong>
              ${r.tp ? `<div class="small text-muted">${r.tp}</div>` : ''}
            </td>
            <td>
              <small class="text-muted">${r.non_tatap_muka ? r.non_tatap_muka.replace(/\n/g, '<br>') : '-'}</small>
            </td>
            <td class="text-center">
              ${fotoArr.length > 0 ? `
                <button class="btn btn-outline-success btn-sm rounded-pill px-2 py-0" onclick="Riwayat.openGalleryModal('${r.id}')">
                  <i class="bi bi-images me-1"></i>${fotoArr.length} Foto
                </button>
              ` : '<span class="text-muted">-</span>'}
            </td>
            <td class="text-center fw-bold text-success">${r.volume || 0}</td>
            <td class="text-end text-nowrap">
              <button class="btn btn-sm btn-outline-primary me-1" onclick="Riwayat.openEditModal('${r.id}')" title="Edit Agenda">
                <i class="bi bi-pencil"></i>
              </button>
              <button class="btn btn-sm btn-outline-danger" onclick="Riwayat.confirmDelete('${r.id}')" title="Hapus Agenda">
                <i class="bi bi-trash3"></i>
              </button>
            </td>
          </tr>
        `;
      });
      dskContainer.innerHTML = dskHtml;
    }
  },

  openPhotoModal: function (driveId) {
    const modalEl = document.getElementById('modalGaleriFoto');
    const imgEl = document.getElementById('galeriModalImg');
    if (modalEl && imgEl) {
      imgEl.src = `https://lh3.googleusercontent.com/d/${driveId}`;
      const bsModal = bootstrap.Modal.getOrCreateInstance(modalEl);
      bsModal.show();
    }
  },

  openGalleryModal: function (recordId) {
    const record = Riwayat.activeRecords.find(r => r.id === recordId);
    if (!record) return;
    const fotoArr = [record.foto_tm_id, record.foto_ntm1_id, record.foto_ntm2_id, record.foto_ntm3_id, record.foto_ntm4_id, record.foto_ntm5_id].filter(id => id && id.trim() !== '');
    if (fotoArr.length > 0) {
      Riwayat.openPhotoModal(fotoArr[0]);
    }
  },

  // --- EDIT AGENDA ---
  openEditModal: async function (id) {
    const record = Riwayat.activeRecords.find(r => r.id === id);
    if (!record) return;

    document.getElementById('editAgendaId').value = record.id;
    document.getElementById('editTanggal').value = record.tanggal;
    document.getElementById('editBulan').value = record.bulan;
    document.getElementById('editTahun').value = record.tahun_ajaran;
    document.getElementById('editKelas').value = record.kelas || '';
    document.getElementById('editCP').value = record.cp || '';
    document.getElementById('editTP').value = record.tp || '';
    document.getElementById('editNTM').value = record.non_tatap_muka || '';
    document.getElementById('editVolume').value = record.volume || 0;
    document.getElementById('editKeterangan').value = record.keterangan || 'Terlaksana';

    const modalEl = document.getElementById('modalEditData');
    if (modalEl) {
      const bsModal = bootstrap.Modal.getOrCreateInstance(modalEl);
      bsModal.show();
    }
  },

  saveEdit: async function () {
    const id = document.getElementById('editAgendaId').value;
    const btn = document.getElementById('btnSimpanEdit');
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Menyimpan...';
    }

    try {
      const payload = {
        tanggal: document.getElementById('editTanggal').value,
        bulan: document.getElementById('editBulan').value,
        tahunAjaran: document.getElementById('editTahun').value,
        kelas: document.getElementById('editKelas').value,
        cp: document.getElementById('editCP').value,
        tp: document.getElementById('editTP').value,
        nonTatapMuka: document.getElementById('editNTM').value,
        volume: parseInt(document.getElementById('editVolume').value || '0', 10),
        keterangan: document.getElementById('editKeterangan').value
      };

      const res = await Api.updateLhk(id, payload);
      if (res && res.sukses) {
        alert('Perubahan agenda berhasil disimpan!');
        const modalEl = document.getElementById('modalEditData');
        const bsModal = bootstrap.Modal.getInstance(modalEl);
        if (bsModal) bsModal.hide();
        Riwayat.load();
      } else {
        throw new Error(res.pesan || 'Gagal menyimpan perubahan.');
      }
    } catch (err) {
      alert('Error saat mengedit: ' + err.message);
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = 'Simpan Perubahan';
      }
    }
  },

  // --- HAPUS AGENDA ---
  confirmDelete: function (id) {
    Riwayat.selectedDeleteId = id;
    const modalEl = document.getElementById('modalHapusData');
    if (modalEl) {
      const bsModal = bootstrap.Modal.getOrCreateInstance(modalEl);
      bsModal.show();
    }
  },

  executeDelete: async function () {
    if (!Riwayat.selectedDeleteId) return;
    const btn = document.getElementById('btnConfirmDelete');
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Menghapus...';
    }

    try {
      const res = await Api.deleteLhk(Riwayat.selectedDeleteId);
      if (res && res.sukses) {
        alert('Data agenda berhasil dihapus!');
        const modalEl = document.getElementById('modalHapusData');
        const bsModal = bootstrap.Modal.getInstance(modalEl);
        if (bsModal) bsModal.hide();
        Riwayat.load();
      } else {
        throw new Error(res.pesan || 'Gagal menghapus data.');
      }
    } catch (err) {
      alert('Error saat menghapus: ' + err.message);
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = 'Ya, Hapus Data';
      }
    }
  }
};

window.Riwayat = Riwayat;

