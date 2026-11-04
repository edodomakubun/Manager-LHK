/**
 * ========================================================
 * 📑 RIWAYAT AGENDA & DATA TABLE - CMS MANAGER LHK
 * ========================================================
 */

const Riwayat = {
  rawRecords: [],
  activeRecords: [],
  selectedDeleteId: null,
  classesLoaded: false,

  initClasses: async function () {
    if (Riwayat.classesLoaded) return;
    const select = document.getElementById('filterKelas');
    if (!select) return;

    try {
      const res = await Api.getClasses();
      const currentVal = select.value;
      if (res && res.sukses && Array.isArray(res.classes) && res.classes.length > 0) {
        select.innerHTML = '<option value="" selected>-- Semua Kelas --</option>';
        res.classes.forEach(k => {
          select.innerHTML += `<option value="${k}">${k}</option>`;
        });
        if (currentVal) select.value = currentVal;
        Riwayat.classesLoaded = true;
      }
    } catch (e) {
      console.warn('Gagal memuat daftar kelas filter:', e);
    }
  },

  populateClassOptions: function (records) {
    const select = document.getElementById('filterKelas');
    if (!select || !Array.isArray(records)) return;

    const currentVal = select.value;
    const existingOptions = new Set(Array.from(select.options).map(o => o.value).filter(Boolean));

    records.forEach(r => {
      if (r.kelas && r.kelas.trim() && !existingOptions.has(r.kelas.trim())) {
        existingOptions.add(r.kelas.trim());
        const opt = document.createElement('option');
        opt.value = r.kelas.trim();
        opt.textContent = r.kelas.trim();
        select.appendChild(opt);
      }
    });

    if (currentVal) select.value = currentVal;
  },

  load: async function () {
    await Riwayat.initClasses();

    const filterBulan = document.getElementById('filterBulan')?.value || '';
    const filterTahun = document.getElementById('filterTahun')?.value || '2026/2027';

    Riwayat.renderSkeleton();

    try {
      const res = await Api.getLhkList({
        bulan: filterBulan,
        tahunAjaran: filterTahun
      });

      if (res && res.sukses) {
        Riwayat.rawRecords = res.records || [];
        Riwayat.populateClassOptions(Riwayat.rawRecords);
        Riwayat.applyFilter();
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

  applyFilter: function () {
    const filterKelas = document.getElementById('filterKelas')?.value || '';
    let filtered = Riwayat.rawRecords || [];

    if (filterKelas && filterKelas.trim() !== '') {
      filtered = filtered.filter(r => r.kelas && r.kelas.trim().toLowerCase() === filterKelas.trim().toLowerCase());
    }

    Riwayat.activeRecords = filtered;
    Riwayat.render(filtered);
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
        <tr><td colspan="8" class="text-center py-4"><span class="spinner-border spinner-border-sm text-success me-2"></span>Memuat data agenda...</td></tr>
      `;
    }
  },

  render: function (records) {
    const mobContainer = document.getElementById('riwayatMobileContainer');
    const dskContainer = document.getElementById('riwayatDesktopBody');
    const statSection = document.getElementById('riwayatStatSection');
    const filterKelas = document.getElementById('filterKelas')?.value || '';

    // Update Ringkasan Statistik
    if (statSection) {
      let totalVol = 0;
      records.forEach(r => totalVol += (r.volume || 0));
      document.getElementById('riwayatStatHari').innerText = records.length;
      document.getElementById('riwayatStatVolume').innerText = totalVol + ' Kegiatan';
      statSection.style.display = records.length > 0 ? 'flex' : 'none';
    }

    if (!records || records.length === 0) {
      const emptyHtml = `
        <div class="text-center py-5 text-muted">
          <i class="bi bi-folder-x fs-1 text-secondary opacity-50 d-block mb-3"></i>
          <p class="mb-0">Tidak ada agenda ${filterKelas ? 'untuk <strong>' + filterKelas + '</strong>' : 'pada periode yang dipilih'}.</p>
        </div>
      `;
      if (mobContainer) mobContainer.innerHTML = emptyHtml;
      if (dskContainer) dskContainer.innerHTML = `<tr><td colspan="8" class="text-center py-5 text-muted">Tidak ada data ditemukan.</td></tr>`;
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
            <!-- Header Kartu: Tanggal, Badge Kelas & Volume -->
            <div class="d-flex justify-content-between align-items-start mb-2 flex-wrap gap-2">
              <div class="d-flex align-items-center gap-1 flex-wrap">
                <span class="timeline-date-badge"><i class="bi bi-calendar3 me-1"></i>${r.tanggal_teks || r.tanggal}</span>
                ${r.kelas
            ? `<span class="badge bg-success text-white px-2 py-1 shadow-sm"><i class="bi bi-mortarboard-fill me-1"></i>${r.kelas}</span>`
            : '<span class="badge bg-secondary-subtle text-secondary border px-2 py-1"><i class="bi bi-briefcase me-1"></i>Non Tatap Muka</span>'}
              </div>
              <span class="badge bg-light text-dark border">Vol: <strong>${r.volume || 0} Kegiatan</strong></span>
            </div>

            ${r.cp || r.tp || r.kelas ? `
            <div class="mb-2 p-2 rounded bg-light border-start border-3 border-success">
              <div class="d-flex justify-content-between align-items-center mb-1">
                <div class="fw-bold text-success small"><i class="bi bi-person-video3 me-1"></i>Pembelajaran Tatap Muka</div>
                ${r.kelas ? `<span class="badge bg-success-subtle text-success border border-success fw-bold">${r.kelas}</span>` : ''}
              </div>
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
              ${fotoArr.map((id, fIdx) => `
                <img src="https://lh3.googleusercontent.com/d/${id}" class="timeline-photo-thumb" 
                     onerror="this.src='https://placehold.co/100x100?text=Foto'" 
                     onclick="Riwayat.openGalleryModal('${r.id}', ${fIdx})" title="Klik untuk perbesar galeri">
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
            <td class="text-center">
              ${r.kelas ? `<span class="badge bg-success-subtle text-success border border-success px-2 py-1 fw-bold"><i class="bi bi-mortarboard-fill me-1"></i>${r.kelas}</span>` : '<span class="badge bg-light text-muted border">-</span>'}
            </td>
            <td>
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

  // --- GALERI FOTO INTERAKTIF DENGAN PREVIEW & NAVIGASI MULTI-FOTO ---
  currentGallery: {
    photos: [],
    currentIndex: 0,
    title: '',
    subtitle: ''
  },

  openPhotoModal: function (driveId) {
    Riwayat.currentGallery = {
      photos: [driveId],
      currentIndex: 0,
      title: 'Dokumentasi Agenda',
      subtitle: ''
    };
    Riwayat.updateGalleryDisplay();
    const modalEl = document.getElementById('modalGaleriFoto');
    if (modalEl) {
      const bsModal = bootstrap.Modal.getOrCreateInstance(modalEl);
      bsModal.show();
    }
  },

  openGalleryModal: function (recordId, startIndex = 0) {
    const record = Riwayat.activeRecords.find(r => r.id === recordId);
    if (!record) return;
    const fotoArr = [
      record.foto_tm_id,
      record.foto_ntm1_id,
      record.foto_ntm2_id,
      record.foto_ntm3_id,
      record.foto_ntm4_id,
      record.foto_ntm5_id
    ].filter(id => id && id.trim() !== '');

    if (fotoArr.length === 0) return;

    Riwayat.currentGallery = {
      photos: fotoArr,
      currentIndex: (startIndex >= 0 && startIndex < fotoArr.length) ? startIndex : 0,
      title: 'Dokumentasi: ' + (record.kelas ? record.kelas + ' - ' : '') + (record.tanggal_teks || record.tanggal || 'Agenda'),
      subtitle: (record.cp ? 'CP: ' + record.cp.substring(0, 60) + (record.cp.length > 60 ? '...' : '') : (record.non_tatap_muka ? 'Non Tatap Muka' : ''))
    };

    Riwayat.updateGalleryDisplay();

    const modalEl = document.getElementById('modalGaleriFoto');
    if (modalEl) {
      const bsModal = bootstrap.Modal.getOrCreateInstance(modalEl);
      bsModal.show();
    }
  },

  nextPhoto: function () {
    const g = Riwayat.currentGallery;
    if (!g.photos || g.photos.length <= 1) return;
    // Opsi A: Infinite loop / carousel
    g.currentIndex = (g.currentIndex + 1) % g.photos.length;
    Riwayat.updateGalleryDisplay();
  },

  prevPhoto: function () {
    const g = Riwayat.currentGallery;
    if (!g.photos || g.photos.length <= 1) return;
    // Opsi A: Infinite loop / carousel
    g.currentIndex = (g.currentIndex - 1 + g.photos.length) % g.photos.length;
    Riwayat.updateGalleryDisplay();
  },

  goToPhoto: function (index) {
    const g = Riwayat.currentGallery;
    if (!g.photos || index < 0 || index >= g.photos.length) return;
    g.currentIndex = index;
    Riwayat.updateGalleryDisplay();
  },

  updateGalleryDisplay: function () {
    const g = Riwayat.currentGallery;
    const total = g.photos.length;
    const currentId = g.photos[g.currentIndex];
    const imgUrl = `https://lh3.googleusercontent.com/d/${currentId}`;

    // Header info
    const elTitle = document.getElementById('galeriModalTitle');
    const elSubtitle = document.getElementById('galeriModalSubtitle');
    if (elTitle) elTitle.innerHTML = `<i class="bi bi-images text-success me-2"></i>${g.title || 'Dokumentasi Agenda'}`;
    if (elSubtitle) elSubtitle.textContent = g.subtitle || '';

    // Gambar Utama
    const imgEl = document.getElementById('galeriModalImg');
    if (imgEl) {
      imgEl.style.opacity = '0.4';
      imgEl.src = imgUrl;

      const onImageLoaded = () => {
        imgEl.style.opacity = '1';
      };

      if (imgEl.complete && imgEl.naturalWidth > 0) {
        onImageLoaded();
      } else {
        imgEl.onload = onImageLoaded;
        imgEl.onerror = () => {
          imgEl.style.opacity = '1';
          imgEl.src = 'https://placehold.co/600x400?text=Gagal+Memuat+Foto';
        };
      }
    }

    // Tombol Download / Buka Asli
    const btnDownload = document.getElementById('btnGaleriDownload');
    if (btnDownload) {
      btnDownload.href = imgUrl;
    }

    // Counter (Foto X dari Y)
    const elCounter = document.getElementById('galeriCounter');
    const counterContainer = document.getElementById('galeriCounterContainer');
    if (total > 1) {
      if (counterContainer) counterContainer.classList.remove('d-none');
      if (elCounter) elCounter.textContent = `Foto ${g.currentIndex + 1} dari ${total}`;
    } else {
      if (counterContainer) counterContainer.classList.add('d-none');
    }

    // Navigasi Prev & Next Buttons (Sembunyikan jika hanya 1 foto)
    const btnPrev = document.getElementById('btnGaleriPrev');
    const btnNext = document.getElementById('btnGaleriNext');
    if (total > 1) {
      if (btnPrev) btnPrev.classList.remove('d-none');
      if (btnNext) btnNext.classList.remove('d-none');
    } else {
      if (btnPrev) btnPrev.classList.add('d-none');
      if (btnNext) btnNext.classList.add('d-none');
    }

    // Thumbnail Strip Preview
    const stripWrapper = document.getElementById('galeriThumbnailStripWrapper');
    const stripContainer = document.getElementById('galeriThumbnailStrip');

    if (total > 1 && stripWrapper && stripContainer) {
      stripWrapper.classList.remove('d-none');
      let thumbHtml = '';
      g.photos.forEach((id, idx) => {
        const isActive = idx === g.currentIndex;
        thumbHtml += `
          <img src="https://lh3.googleusercontent.com/d/${id}" 
               class="galeri-thumb-item ${isActive ? 'active' : ''}" 
               onclick="Riwayat.goToPhoto(${idx})"
               onerror="this.src='https://placehold.co/60x60?text=Foto'"
               title="Foto ke-${idx + 1}">
        `;
      });
      stripContainer.innerHTML = thumbHtml;

      const activeEl = stripContainer.querySelector('.galeri-thumb-item.active');
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    } else if (stripWrapper) {
      stripWrapper.classList.add('d-none');
    }
  },

  adjustGalleryModalSize: function () {
    // Ukuran bingkai kini stabil & foto otomatis menyesuaikan via CSS (object-fit: contain)
  },

  // --- EDIT AGENDA (MEMBUKA FORM WIZARD INPUT DALAM MODE EDIT) ---
  openEditModal: async function (id) {
    if (window.Wizard && typeof window.Wizard.loadForEdit === 'function') {
      await window.Wizard.loadForEdit(id);
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

// Keyboard navigation & resize listener untuk Galeri Foto
document.addEventListener('keydown', function (e) {
  const modalGaleri = document.getElementById('modalGaleriFoto');
  if (modalGaleri && modalGaleri.classList.contains('show')) {
    if (e.key === 'ArrowRight') {
      Riwayat.nextPhoto();
    } else if (e.key === 'ArrowLeft') {
      Riwayat.prevPhoto();
    }
  }
});

window.Riwayat = Riwayat;

