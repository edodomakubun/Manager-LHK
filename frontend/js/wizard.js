/**
 * ========================================================
 * 📝 FORM WIZARD INPUT LHK (4 LANGKAH) - CMS MANAGER LHK
 * ========================================================
 */

const Wizard = {
  currentStep: 1,
  totalSteps: 4,
  ntmCount: 1,
  fotoSlots: [null, null, null, null, null, null], // 0: TM, 1..5: NTM
  editingId: null,
  editingRecord: null,

  // Saran default kegiatan Non Tatap Muka
  ntmSuggestions: [
    "Menyusun Modul Ajar dan Perangkat Pembelajaran",
    "Memeriksa tugas / asesmen formatif siswa",
    "Menganalisis hasil evaluasi belajar siswa",
    "Melaksanakan bimbingan dan konseling siswa",
    "Mengikuti rapat dinas / briefing dewan guru",
    "Mengikuti kegiatan KKG / MGMP / Webinar",
    "Mempersiapkan media dan alat peraga pembelajaran",
    "Menyusun kisi-kisi dan soal penilaian sumatif",
    "Merekap absensi dan jurnal kelas",
    "Melakukan koordinasi dengan orang tua / wali murid"
  ],

  init: async function () {
    if (!Wizard.editingId) {
      Wizard.resetForm();
      Wizard.populateCurrentDate();
      await Wizard.loadTeacherClasses();
      Wizard.goToStep(1);
    }
  },

  populateCurrentDate: function () {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');

    const inputTgl = document.getElementById('inputTanggal');
    if (inputTgl) inputTgl.value = `${yyyy}-${mm}-${dd}`;

    const namaBulanArr = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    const selectBulan = document.getElementById('inputBulan');
    if (selectBulan) selectBulan.value = namaBulanArr[today.getMonth()];
  },

  loadTeacherClasses: async function () {
    const selectKelas = document.getElementById('inputKelas');
    if (!selectKelas) return;

    try {
      const res = await Api.getClasses();
      selectKelas.innerHTML = '<option value="" selected disabled>-- Pilih Kelas yang Diampu --</option>';

      if (res && res.sukses && Array.isArray(res.classes) && res.classes.length > 0) {
        res.classes.forEach(k => {
          selectKelas.innerHTML += `<option value="${k}">${k}</option>`;
        });
      } else {
        // Fallback kelas umum jika belum diset
        ['Kelas IV', 'Kelas V', 'Kelas VI', 'Kelas VII', 'Kelas VIII', 'Kelas IX', 'Kelas X', 'Kelas XI', 'Kelas XII'].forEach(k => {
          selectKelas.innerHTML += `<option value="${k}">${k}</option>`;
        });
      }
    } catch (err) {
      console.warn('Gagal memuat kelas:', err);
    }
  },

  onKelasChanged: async function () {
    const kelas = document.getElementById('inputKelas').value;
    if (!kelas) return;

    // Muat CP & TP yang sesuai dengan kelas ini
    try {
      const res = await Api.getCpTpList(kelas);
      const cpDatalist = document.getElementById('datalistCP');
      const tpDatalist = document.getElementById('datalistTP');

      if (cpDatalist) cpDatalist.innerHTML = '';
      if (tpDatalist) tpDatalist.innerHTML = '';

      if (res && res.sukses && Array.isArray(res.items)) {
        res.items.forEach(item => {
          if (cpDatalist && item.cp) {
            cpDatalist.innerHTML += `<option value="${item.cp}">`;
          }
          if (tpDatalist && item.tp) {
            tpDatalist.innerHTML += `<option value="${item.tp}">`;
          }
        });
      }
    } catch (e) {
      console.warn('Gagal memuat CP/TP:', e);
    }

    Wizard.updateVolumeCalculation();
  },

  goToStep: function (step) {
    if (step < 1 || step > Wizard.totalSteps) return;

    // Validasi saat maju
    if (step === 2 && !Wizard.validateStep1()) return;
    if (step === 4 && !Wizard.validateStep2And3()) return;

    Wizard.currentStep = step;

    // Update kontainer step
    for (let i = 1; i <= Wizard.totalSteps; i++) {
      const el = document.getElementById(`stepContainer${i}`);
      const ind = document.getElementById(`stepInd${i}`);
      if (el) {
        if (i === step) {
          el.classList.add('active');
        } else {
          el.classList.remove('active');
        }
      }
      if (ind) {
        if (i === step) {
          ind.className = 'active fw-bold text-success';
        } else if (i < step) {
          ind.className = 'done text-muted';
        } else {
          ind.className = 'text-muted opacity-50';
        }
      }
    }

    // Update progress bar wizard
    const bar = document.getElementById('wizardProgressBar');
    if (bar) {
      const pct = (step / Wizard.totalSteps) * 100;
      bar.style.width = pct + '%';
    }

    // Jika masuk ke step 4, render summary
    if (step === 4) {
      Wizard.renderSummary();
    }

    window.scrollTo({ top: 120, behavior: 'smooth' });
  },

  validateStep1: function () {
    const tgl = document.getElementById('inputTanggal').value;
    const bln = document.getElementById('inputBulan').value;
    const thn = document.getElementById('inputTahunAjaran').value;

    if (!tgl || !bln || !thn) {
      alert('Silakan lengkapi Tanggal, Bulan, dan Tahun Ajaran.');
      return false;
    }
    return true;
  },

  validateStep2And3: function () {
    const isTM = document.getElementById('checkTM').checked;
    const ntmInputs = document.querySelectorAll('.input-ntm-val');
    let hasNTM = false;

    ntmInputs.forEach(inp => {
      if (inp.value && inp.value.trim()) hasNTM = true;
    });

    if (!isTM && !hasNTM) {
      alert('Peringatan: Anda harus mengisi minimal 1 kegiatan (Tatap Muka atau Non Tatap Muka).');
      return false;
    }

    // Cek duplikasi foto
    const fotoItems = [];
    if (Wizard.fotoSlots[0]) {
      fotoItems.push({ hash: Wizard.fotoSlots[0].hash, label: 'Foto Tatap Muka' });
    }
    for (let i = 1; i <= 5; i++) {
      if (Wizard.fotoSlots[i]) {
        fotoItems.push({ hash: Wizard.fotoSlots[i].hash, label: `Foto Non Tatap Muka ${i}` });
      }
    }

    const duplicates = ImageCompressor.findDuplicates(fotoItems);
    if (duplicates.length > 0) {
      const dup = duplicates[0];
      Wizard.showDuplicateModal(dup.firstLabel, dup.duplicateLabel);
      return false;
    }

    Wizard.updateVolumeCalculation();
    return true;
  },

  showDuplicateModal: function (label1, label2) {
    const modalEl = document.getElementById('modalFotoGanda');
    if (modalEl) {
      document.getElementById('teksFotoGanda1').innerText = `Terdeteksi foto yang persis sama antara "${label1}" dan "${label2}".`;
      const bsModal = bootstrap.Modal.getOrCreateInstance(modalEl);
      bsModal.show();
    } else {
      alert(`Peringatan: Terdeteksi foto ganda antara "${label1}" dan "${label2}". Harap gunakan foto berbeda.`);
    }
  },

  toggleTatapMuka: function () {
    const isChecked = document.getElementById('checkTM').checked;
    const container = document.getElementById('wadahFormTM');
    if (container) {
      container.style.display = isChecked ? 'block' : 'none';
    }
    Wizard.updateVolumeCalculation();
  },

  // --- NON TATAP MUKA (NTM) MULTI-ROW DINAMIS ---
  tambahNTM: function () {
    if (Wizard.ntmCount >= 5) {
      alert('Maksimal 5 kegiatan Non Tatap Muka per hari.');
      return;
    }

    Wizard.ntmCount++;
    const idx = Wizard.ntmCount;
    const container = document.getElementById('wadahBarisNTM');
    const fotoContainer = document.getElementById('wadahFotoNTM');

    // Tambah input teks NTM
    const div = document.createElement('div');
    div.className = 'mb-3 baris-ntm-item';
    div.id = `barisNtm${idx}`;
    div.innerHTML = `
      <div class="d-flex align-items-center justify-content-between mb-1">
        <label class="form-label text-primary fw-semibold mb-0"><i class="bi bi-card-checklist me-1"></i>Kegiatan Non Tatap Muka ${idx}</label>
        <button type="button" class="btn btn-outline-danger btn-sm border-0 py-0 px-2" onclick="Wizard.hapusNTM(${idx})">
          <i class="bi bi-trash3"></i> Hapus
        </button>
      </div>
      <div class="smart-dropdown-wrapper">
        <div class="input-group">
          <span class="input-group-text bg-light border-end-0 text-muted"><i class="bi bi-search"></i></span>
          <input type="text" class="form-control border-start-0 ps-0 input-ntm-val" placeholder="Ketik atau pilih kegiatan NTM ${idx}..." autocomplete="off" onfocus="Wizard.showNtmSuggestions(this)" onkeyup="Wizard.filterNtmSuggestions(this)">
        </div>
        <ul class="smart-dropdown-list"></ul>
      </div>
    `;
    container.appendChild(div);

    // Tambah slot upload foto NTM
    const fotoDiv = document.createElement('div');
    fotoDiv.className = 'mb-3 pb-3 border-bottom baris-foto-ntm';
    fotoDiv.id = `wadahFotoNtm${idx}`;
    fotoDiv.innerHTML = `
      <label class="form-label text-primary fw-bold"><i class="bi bi-camera me-2"></i>Dokumentasi Non Tatap Muka ${idx}</label>
      <div class="row g-3 align-items-center">
        <div class="col-12 col-md-7">
          <input type="file" class="form-control mb-2 mb-md-0 file-foto-ntm" accept="image/*,image/heic,image/heif,image/webp,.heic,.heif,.webp" onchange="Wizard.handleFileSelected(this, ${idx})">
        </div>
        <div class="col-12 col-md-5 d-flex align-items-center gap-2">
          <img id="previewFoto${idx}" class="img-thumbnail rounded-3 d-none shadow-sm" style="max-height: 120px;">
          <span id="infoKompresi${idx}" class="small text-muted"></span>
        </div>
      </div>
    `;
    fotoContainer.appendChild(fotoDiv);

    Wizard.updateVolumeCalculation();
  },

  hapusNTM: function (idx) {
    const el = document.getElementById(`barisNtm${idx}`);
    const fotoEl = document.getElementById(`wadahFotoNtm${idx}`);
    if (el) el.remove();
    if (fotoEl) fotoEl.remove();

    Wizard.fotoSlots[idx] = null;
    Wizard.updateVolumeCalculation();
  },

  // --- SMART AUTOCOMPLETE NTM ---
  showNtmSuggestions: function (inputEl) {
    const list = inputEl.closest('.smart-dropdown-wrapper').querySelector('.smart-dropdown-list');
    if (!list) return;

    list.innerHTML = '';
    Wizard.ntmSuggestions.forEach(text => {
      const li = document.createElement('li');
      li.className = 'smart-dropdown-item';
      li.innerText = text;
      li.onmousedown = function () {
        inputEl.value = text;
        list.classList.remove('show');
        Wizard.updateVolumeCalculation();
      };
      list.appendChild(li);
    });

    list.classList.add('show');
  },

  filterNtmSuggestions: function (inputEl) {
    const list = inputEl.closest('.smart-dropdown-wrapper').querySelector('.smart-dropdown-list');
    if (!list) return;

    const val = inputEl.value.toLowerCase();
    const items = list.querySelectorAll('.smart-dropdown-item');
    let hasVisible = false;

    items.forEach(li => {
      if (li.innerText.toLowerCase().includes(val)) {
        li.style.display = 'block';
        hasVisible = true;
      } else {
        li.style.display = 'none';
      }
    });

    if (hasVisible) list.classList.add('show');
    Wizard.updateVolumeCalculation();
  },

  // --- HANDLER UPLOAD & KOMPRESI FOTO ---
  handleFileSelected: async function (inputEl, slotIndex) {
    const file = inputEl.files[0];
    const previewImg = document.getElementById(`previewFoto${slotIndex}`);
    const infoSpan = document.getElementById(`infoKompresi${slotIndex}`);

    if (!file) {
      // Jika pengguna membatalkan dialog file, pertahankan foto yang tersimpan jika ada
      if (Wizard.fotoSlots[slotIndex] && Wizard.fotoSlots[slotIndex].existingId) {
        return;
      }
      Wizard.fotoSlots[slotIndex] = null;
      if (previewImg) previewImg.classList.add('d-none');
      if (infoSpan) infoSpan.innerText = '';
      return;
    }

    // Ambil info foto lama jika slot ini sebelumnya memiliki foto dari database/Drive
    const existingOldId = (Wizard.fotoSlots[slotIndex] && (Wizard.fotoSlots[slotIndex].existingId || Wizard.fotoSlots[slotIndex].oldId))
      ? (Wizard.fotoSlots[slotIndex].existingId || Wizard.fotoSlots[slotIndex].oldId)
      : null;

    if (infoSpan) infoSpan.innerHTML = '<span class="spinner-border spinner-border-sm text-success me-1"></span>Mengompresi foto...';

    try {
      const res = await ImageCompressor.compress(file);
      Wizard.fotoSlots[slotIndex] = {
        base64: res.base64,
        tipe: res.tipe,
        nama: res.nama,
        hash: res.hash,
        oldId: existingOldId // Tandai ID foto lama untuk dihapus dari Google Drive!
      };

      if (previewImg) {
        previewImg.src = res.dataUrl;
        previewImg.classList.remove('d-none');
      }

      if (infoSpan) {
        if (existingOldId) {
          infoSpan.innerHTML = `<span class="badge bg-warning text-dark"><i class="bi bi-arrow-repeat me-1"></i>Foto Baru Pengganti</span> <small class="text-muted d-block">Foto lama akan dihapus (${res.compressedKb} KB)</small>`;
        } else {
          infoSpan.innerHTML = `<span class="badge bg-success"><i class="bi bi-check2 me-1"></i>Foto Terkompresi</span> (${res.compressedKb} KB)`;
        }
      }

      Wizard.updateVolumeCalculation();
    } catch (err) {
      alert('Gagal mengompresi gambar: ' + err.message);
      inputEl.value = '';
    }
  },

  // --- KALKULASI VOLUME REALTIME ---
  updateVolumeCalculation: function () {
    let vol = 0;
    const checkTM = document.getElementById('checkTM');
    const isTM = checkTM ? checkTM.checked : true;

    // 1. Kegiatan Pembelajaran Tatap Muka (dihitung 1 kegiatan jika ada tatap muka)
    if (isTM) {
      vol += 1;
    }

    // 2. Kegiatan Non Tatap Muka (dihitung per kegiatan NTM yang diisi, bukan CP/TP)
    const ntmInputs = document.querySelectorAll('.input-ntm-val');
    ntmInputs.forEach(inp => {
      if (inp.value && inp.value.trim() !== '') {
        vol += 1;
      }
    });

    const hiddenVol = document.getElementById('inputFinalVolume');
    const displayVol = document.getElementById('volumeDisplay');
    if (hiddenVol) hiddenVol.value = vol;
    if (displayVol) displayVol.innerText = vol;
  },

  // --- RENDER SUMMARY STEP 4 ---
  renderSummary: function () {
    const container = document.getElementById('summaryContent');
    if (!container) return;

    const tgl = document.getElementById('inputTanggal').value;
    const bln = document.getElementById('inputBulan').value;
    const thn = document.getElementById('inputTahunAjaran').value;
    const isTM = document.getElementById('checkTM').checked;
    const kls = document.getElementById('inputKelas').value;
    const cp = document.getElementById('inputCP').value;
    const tp = document.getElementById('inputTP').value;
    const vol = document.getElementById('inputFinalVolume').value || '0';

    const ntmList = [];
    document.querySelectorAll('.input-ntm-val').forEach((inp, idx) => {
      if (inp.value && inp.value.trim()) {
        ntmList.push(`${idx + 1}. ${inp.value.trim()}`);
      }
    });

    const fotoCount = Wizard.fotoSlots.filter(f => f && (f.base64 || f.existingId)).length;
    const isEdit = !!Wizard.editingId;

    container.innerHTML = `
      <div class="row g-3">
        <div class="col-12 col-md-6">
          <small class="text-muted d-block">Waktu Pelaksanaan</small>
          <strong>${tgl} (${bln} - ${thn})</strong>
        </div>
        <div class="col-12 col-md-6">
          <small class="text-muted d-block">Total Volume</small>
          <span class="badge bg-success fs-6">${vol} Kegiatan</span>
        </div>
        ${isTM ? `
        <div class="col-12 border-top pt-2">
          <small class="text-primary fw-bold d-block"><i class="bi bi-person-video3 me-1"></i>Tatap Muka (${kls || '-'})</small>
          <div><strong>CP:</strong> ${cp || '-'}</div>
          <div><strong>TP:</strong> ${tp || '-'}</div>
        </div>` : ''}
        <div class="col-12 border-top pt-2">
          <small class="text-primary fw-bold d-block"><i class="bi bi-briefcase me-1"></i>Non Tatap Muka</small>
          <div>${ntmList.length > 0 ? ntmList.join('<br>') : '<span class="text-muted">Tidak ada kegiatan NTM</span>'}</div>
        </div>
        <div class="col-12 border-top pt-2">
          <small class="text-muted d-block"><i class="bi bi-camera me-1"></i>Dokumentasi Foto</small>
          <strong>${fotoCount} Foto ${isEdit ? 'Tersimpan / Terpilih' : 'Terkompresi Siap Dikirim.'}</strong>
        </div>
      </div>
    `;
  },

  // --- SUBMIT FINAL KE BACKEND (SIMPAN BARU ATAU UPDATE EDIT) ---
  submitLhk: async function () {
    const btn = document.getElementById('btnSubmitLhk');
    const isEdit = !!Wizard.editingId;

    if (btn) {
      btn.disabled = true;
      btn.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span>${isEdit ? 'Memperbarui agenda...' : 'Menyimpan...'}`;
    }

    try {
      const tgl = document.getElementById('inputTanggal').value;
      const bln = document.getElementById('inputBulan').value;
      const thn = document.getElementById('inputTahunAjaran').value;
      const isTM = document.getElementById('checkTM').checked;
      const kls = isTM ? document.getElementById('inputKelas').value : '';
      const cp = isTM ? document.getElementById('inputCP').value : '';
      const tp = isTM ? document.getElementById('inputTP').value : '';
      const ket = document.getElementById('inputKeterangan').value || 'Terlaksana';
      const vol = document.getElementById('inputFinalVolume').value || 0;

      const ntmArr = [];
      document.querySelectorAll('.input-ntm-val').forEach(inp => {
        if (inp.value && inp.value.trim()) ntmArr.push(inp.value.trim());
      });

      const fotoPayload = Wizard.fotoSlots.map(f => {
        if (!f) return null;
        if (f.base64) {
          return {
            base64: f.base64,
            tipe: f.tipe,
            nama: f.nama,
            oldId: f.oldId || undefined
          };
        }
        if (f.existingId) {
          return {
            existingId: f.existingId
          };
        }
        return null;
      });

      const payload = {
        tanggal: tgl,
        bulan: bln,
        tahunAjaran: thn,
        cp,
        tp,
        kelas: kls,
        nonTatapMuka: ntmArr.join('\n'),
        volume: vol,
        keterangan: ket,
        fotoArr: fotoPayload
      };

      if (isEdit) {
        const res = await Api.updateLhk(Wizard.editingId, payload);
        if (res && res.sukses) {
          alert('Puji Tuhan Perubahan agenda dan foto berhasil diperbarui.');
          Wizard.cancelEdit();
          CmsRouter.navigate('riwayat');
        } else {
          throw new Error(res.pesan || 'Gagal memperbarui agenda.');
        }
      } else {
        const res = await Api.saveLhk(payload);
        if (res && res.sukses) {
          alert('Puji Tuhan Laporan agenda harian berhasil disimpan.');
          Wizard.resetForm();
          CmsRouter.navigate('riwayat');
        } else {
          throw new Error(res.pesan || 'Gagal menyimpan laporan.');
        }
      }
    } catch (err) {
      alert('Error saat memproses agenda: ' + err.message);
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = isEdit
          ? 'Simpan Perubahan Agenda <i class="bi bi-check2-circle ms-2"></i>'
          : 'Kirim Data <i class="bi bi-send-fill ms-2"></i>';
      }
    }
  },

  // --- MEMUAT DATA UNTUK MODE EDIT (IDENTIK DENGAN TAMPILAN INPUT) ---
  loadForEdit: async function (id) {
    let record = null;
    if (window.Riwayat && Array.isArray(window.Riwayat.activeRecords)) {
      record = window.Riwayat.activeRecords.find(r => r.id === id);
    }

    if (!record) {
      try {
        const res = await Api.getLhkDetail(id);
        if (res && res.sukses) record = res.record;
      } catch (e) {
        console.warn('Gagal memuat detail agenda:', e);
      }
    }

    if (!record) {
      alert('Data agenda tidak ditemukan.');
      return;
    }

    // Buka tampilan Input
    CmsRouter.navigate('input');

    Wizard.editingId = id;
    Wizard.editingRecord = record;

    // Update Tampilan Header Wizard
    const title = document.getElementById('wizardHeaderTitle');
    if (title) title.innerHTML = '<i class="bi bi-pencil-square me-2 text-warning"></i>Edit Data Agenda LHK';

    const badge = document.getElementById('wizardModeBadge');
    if (badge) {
      badge.className = 'badge bg-warning text-dark px-3 py-2 rounded-pill fw-semibold';
      badge.innerText = 'Mode Edit Agenda';
    }

    const banner = document.getElementById('bannerEditMode');
    const labelTgl = document.getElementById('labelEditTanggal');
    if (banner) {
      banner.classList.remove('d-none');
      banner.classList.add('d-flex');
    }
    if (labelTgl) labelTgl.innerText = record.tanggal_teks || record.tanggal;

    const btnSubmit = document.getElementById('btnSubmitLhk');
    if (btnSubmit) btnSubmit.innerHTML = 'Simpan Perubahan Agenda <i class="bi bi-check2-circle ms-2"></i>';

    // 1. Reset slot foto
    Wizard.fotoSlots = [null, null, null, null, null, null];

    // 2. Set Step 1: Waktu
    const inputTgl = document.getElementById('inputTanggal');
    const inputBln = document.getElementById('inputBulan');
    const inputThn = document.getElementById('inputTahunAjaran');
    if (inputTgl) inputTgl.value = record.tanggal;
    if (inputBln) inputBln.value = record.bulan;
    if (inputThn) inputThn.value = record.tahun_ajaran;

    // 3. Set Step 2: Tatap Muka
    await Wizard.loadTeacherClasses();
    const hasTM = !!(record.cp || record.tp || record.kelas);
    const checkTM = document.getElementById('checkTM');
    if (checkTM) checkTM.checked = hasTM;
    Wizard.toggleTatapMuka();

    const inputKls = document.getElementById('inputKelas');
    if (inputKls) {
      inputKls.value = record.kelas || '';
      await Wizard.onKelasChanged();
    }
    const inputCP = document.getElementById('inputCP');
    const inputTP = document.getElementById('inputTP');
    if (inputCP) inputCP.value = record.cp || '';
    if (inputTP) inputTP.value = record.tp || '';

    // Foto Tatap Muka
    const tmFotoId = record.foto_tm_id;
    const preview0 = document.getElementById('previewFoto0');
    const info0 = document.getElementById('infoKompresi0');
    if (tmFotoId && String(tmFotoId).trim() !== '') {
      Wizard.fotoSlots[0] = { existingId: tmFotoId, isExisting: true };
      if (preview0) {
        preview0.src = 'https://drive.google.com/thumbnail?id=' + tmFotoId + '&sz=w400';
        preview0.classList.remove('d-none');
      }
      if (info0) {
        info0.innerHTML = '<span class="badge bg-success-subtle text-success border border-success"><i class="bi bi-image me-1"></i>Foto Tersimpan</span> <small class="text-muted d-block">Pilih file baru jika ingin mengganti</small>';
      }
    } else {
      if (preview0) preview0.classList.add('d-none');
      if (info0) info0.innerText = '';
    }

    // 4. Set Step 3: Non Tatap Muka
    const containerNTM = document.getElementById('wadahBarisNTM');
    const containerFotoNTM = document.getElementById('wadahFotoNTM');
    if (containerNTM) containerNTM.innerHTML = '';
    if (containerFotoNTM) containerFotoNTM.innerHTML = '';

    const ntmLines = record.non_tatap_muka ? record.non_tatap_muka.split('\n').map(s => s.trim()).filter(Boolean) : [];
    const fotoNtmIds = [record.foto_ntm1_id, record.foto_ntm2_id, record.foto_ntm3_id, record.foto_ntm4_id, record.foto_ntm5_id];
    Wizard.ntmCount = 0;

    const barisCount = Math.max(ntmLines.length, 1);
    for (let i = 1; i <= barisCount; i++) {
      Wizard.tambahNTM();
      const inputEl = document.querySelector(`#barisNtm${i} .input-ntm-val`);
      if (inputEl && ntmLines[i - 1]) {
        inputEl.value = ntmLines[i - 1];
      }

      const fId = fotoNtmIds[i - 1];
      const prevEl = document.getElementById(`previewFoto${i}`);
      const infoEl = document.getElementById(`infoKompresi${i}`);

      if (fId && String(fId).trim() !== '') {
        Wizard.fotoSlots[i] = { existingId: fId, isExisting: true };
        if (prevEl) {
          prevEl.src = 'https://drive.google.com/thumbnail?id=' + fId + '&sz=w400';
          prevEl.classList.remove('d-none');
        }
        if (infoEl) {
          infoEl.innerHTML = '<span class="badge bg-success-subtle text-success border border-success"><i class="bi bi-image me-1"></i>Foto Tersimpan</span> <small class="text-muted d-block">Pilih file baru jika ingin mengganti</small>';
        }
      }
    }

    // 5. Set Step 4: Keterangan
    const inputKet = document.getElementById('inputKeterangan');
    if (inputKet) inputKet.value = record.keterangan || 'Terlaksana';

    Wizard.updateVolumeCalculation();
    Wizard.goToStep(1);
    window.scrollTo({ top: 100, behavior: 'smooth' });
  },

  // --- BATALKAN MODE EDIT ---
  cancelEdit: function () {
    Wizard.editingId = null;
    Wizard.editingRecord = null;

    const banner = document.getElementById('bannerEditMode');
    if (banner) {
      banner.classList.add('d-none');
      banner.classList.remove('d-flex');
    }

    const title = document.getElementById('wizardHeaderTitle');
    if (title) title.innerHTML = '<i class="bi bi-pencil-square me-2 text-success"></i>Formulir Agenda Harian Guru';

    const badge = document.getElementById('wizardModeBadge');
    if (badge) {
      badge.className = 'badge bg-success-subtle text-success px-3 py-2 rounded-pill';
      badge.innerText = 'Wizard 4 Langkah';
    }

    const btn = document.getElementById('btnSubmitLhk');
    if (btn) btn.innerHTML = 'Kirim Data <i class="bi bi-send-fill ms-2"></i>';

    Wizard.resetForm();
    Wizard.populateCurrentDate();
    Wizard.goToStep(1);
  },

  resetForm: function () {
    const form = document.getElementById('formWizardAgenda');
    if (form) form.reset();
    Wizard.fotoSlots = [null, null, null, null, null, null];
    Wizard.ntmCount = 1;
    document.querySelectorAll('.file-foto-ntm, #fileFotoTM').forEach(inp => inp.value = '');
    document.querySelectorAll('img[id^="previewFoto"]').forEach(img => img.classList.add('d-none'));
    document.querySelectorAll('span[id^="infoKompresi"]').forEach(sp => sp.innerText = '');
    Wizard.updateVolumeCalculation();
  }
};

window.Wizard = Wizard;
// Tutup smart dropdown saat klik di luar
document.addEventListener('click', function (e) {
  if (!e.target.closest('.smart-dropdown-wrapper')) {
    document.querySelectorAll('.smart-dropdown-list.show').forEach(el => el.classList.remove('show'));
  }
});

