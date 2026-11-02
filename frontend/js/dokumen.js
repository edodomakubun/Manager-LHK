/**
 * ========================================================
 * 📂 ARSIP DOKUMEN LAPORAN & GENERATOR DOKUMEN (PDF/WORD)
 * ========================================================
 */

const Dokumen = {
  activeDocuments: [],
  progressTimer: null,

  load: async function () {
    const container = document.getElementById('arsipDokumenContainer');
    if (container) {
      container.innerHTML = `
        <div class="text-center py-4">
          <span class="spinner-border spinner-border-sm text-success me-2"></span>Memuat arsip berkas laporan...
        </div>
      `;
    }

    try {
      const res = await Api.getDocuments();
      if (res && res.sukses) {
        Dokumen.activeDocuments = res.documents || [];
        Dokumen.render(Dokumen.activeDocuments);
      }
    } catch (err) {
      if (container) {
        container.innerHTML = `
          <div class="alert alert-danger text-center">Gagal memuat arsip: ${err.message}</div>
        `;
      }
    }
  },

  render: function (docs) {
    const container = document.getElementById('arsipDokumenContainer');
    if (!container) return;

    if (!docs || docs.length === 0) {
      container.innerHTML = `
        <div class="text-center py-5 text-muted">
          <i class="bi bi-file-earmark-x fs-1 text-secondary opacity-50 d-block mb-3"></i>
          <p class="mb-2">Belum ada dokumen laporan yang pernah dicetak.</p>
          <button class="btn btn-cms-primary btn-sm rounded-pill" onclick="Dokumen.openExportModal()">
            <i class="bi bi-file-earmark-plus me-1"></i> Buat Laporan Pertama
          </button>
        </div>
      `;
      return;
    }

    let html = `
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h6 class="fw-bold mb-0 text-dark"><i class="bi bi-archive me-2 text-success"></i>Daftar Dokumen Tersimpan (${docs.length})</h6>
        <button class="btn btn-cms-primary btn-sm rounded-pill" onclick="Dokumen.openExportModal()">
          <i class="bi bi-plus-lg me-1"></i> Cetak Laporan Baru
        </button>
      </div>
    `;

    docs.forEach(doc => {
      const isPdf = doc.format === 'pdf';
      html += `
        <div class="card-cms p-3 mb-3">
          <div class="d-flex align-items-center justify-content-between flex-wrap gap-2">
            <div class="d-flex align-items-center gap-3">
              <div class="rounded-3 p-2 ${isPdf ? 'bg-danger-subtle text-danger' : 'bg-primary-subtle text-primary'}" style="font-size: 1.8rem;">
                <i class="bi ${isPdf ? 'bi-file-earmark-pdf-fill' : 'bi-file-earmark-word-fill'}"></i>
              </div>
              <div>
                <h6 class="mb-1 fw-bold text-dark">${doc.nama_file}</h6>
                <div class="small text-muted">
                  <span class="badge ${isPdf ? 'bg-danger' : 'bg-primary'} me-2">${doc.format.toUpperCase()}</span>
                  <span><i class="bi bi-calendar-check me-1"></i>Periode: <strong>${doc.bulan} (${doc.tahun_ajaran})</strong></span> • 
                  <span>${doc.total_kegiatan} Kegiatan</span>
                </div>
              </div>
            </div>
            <div class="d-flex align-items-center gap-2">
              <a href="${doc.doc_url}" target="_blank" class="btn btn-sm btn-outline-success rounded-pill px-3">
                <i class="bi bi-box-arrow-up-right me-1"></i> Buka / Unduh
              </a>
              <button class="btn btn-sm btn-light border rounded-pill px-2" onclick="Dokumen.salinLink('${doc.doc_url}')" title="Salin Tautan">
                <i class="bi bi-clipboard"></i>
              </button>
              <button class="btn btn-sm btn-outline-danger border-0 rounded-pill px-2" onclick="Dokumen.hapusArsip(${doc.id})" title="Hapus dari Arsip">
                <i class="bi bi-trash3"></i>
              </button>
            </div>
          </div>
        </div>
      `;
    });

    container.innerHTML = html;
  },

  salinLink: function (url) {
    if (!url) return;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(() => {
        alert('Tautan dokumen berhasil disalin ke clipboard! 📋');
      }).catch(() => prompt("Salin tautan dokumen:", url));
    } else {
      prompt("Salin tautan dokumen:", url);
    }
  },

  hapusArsip: async function (id) {
    if (!confirm('Hapus catatan arsip dokumen ini? (File di Google Drive tidak terhapus)')) return;
    try {
      await Api.deleteDocument(id);
      Dokumen.load();
    } catch (e) {
      alert('Gagal menghapus arsip: ' + e.message);
    }
  },

  openExportModal: function () {
    const modalEl = document.getElementById('modalCetakLaporan');
    if (modalEl) {
      const bsModal = bootstrap.Modal.getOrCreateInstance(modalEl);
      bsModal.show();
    }
  },

  // --- PROSES GENERATE DOKUMEN DENGAN STEP TRACKER REALTIME ---
  startExport: async function () {
    const bulan = document.getElementById('exportBulan').value;
    const tahun = document.getElementById('exportTahun').value;
    const format = document.querySelector('input[name="exportFormat"]:checked')?.value || 'pdf';

    // Buka Modal Progres
    const modalCetak = bootstrap.Modal.getInstance(document.getElementById('modalCetakLaporan'));
    if (modalCetak) modalCetak.hide();

    const modalProgresEl = document.getElementById('modalProgressUnduh');
    const modalProgres = bootstrap.Modal.getOrCreateInstance(modalProgresEl);

    document.getElementById('wadahProgressState').classList.remove('d-none');
    document.getElementById('wadahSuksesState').classList.add('d-none');
    document.getElementById('wadahErrorState').classList.add('d-none');
    document.getElementById('infoPeriodeUnduh').innerText = `${bulan} (${tahun})`;

    Dokumen.setProgressStep(1, 15, 'Membaca data agenda dari Database Cloudflare D1...');
    modalProgres.show();

    if (Dokumen.progressTimer) clearInterval(Dokumen.progressTimer);
    let stepCount = 1;
    Dokumen.progressTimer = setInterval(() => {
      stepCount++;
      if (stepCount === 2) {
        Dokumen.setProgressStep(2, 40, 'Menghubungi Google Apps Script Bridge & membaca template doc guru...');
      } else if (stepCount === 3) {
        Dokumen.setProgressStep(3, 70, 'Menyusun tabel kegiatan & memproses foto dari folder Dokumentasi...');
      } else if (stepCount === 4) {
        Dokumen.setProgressStep(4, 90, `Mengompilasi dan menyimpan berkas ${format.toUpperCase()} ke Dok_Laporan...`);
      }
    }, 1800);

    try {
      const res = await Api.exportDocument({
        bulan,
        tahunAjaran: tahun,
        format
      });

      if (Dokumen.progressTimer) clearInterval(Dokumen.progressTimer);

      if (res && res.sukses && res.document) {
        Dokumen.setProgressStep(5, 100, 'Dokumen berhasil dibuat dan tersimpan di Google Drive!');

        setTimeout(() => {
          document.getElementById('wadahProgressState').classList.add('d-none');
          document.getElementById('wadahSuksesState').classList.remove('d-none');

          document.getElementById('namaFileSukses').innerText = res.document.nama_file;
          document.getElementById('formatSukses').innerText = res.document.format.toUpperCase();
          document.getElementById('totalKegiatanSukses').innerText = res.document.total_kegiatan + ' Kegiatan';

          const btnBuka = document.getElementById('btnBukaDokumen');
          if (btnBuka) {
            btnBuka.href = res.document.doc_url;
            btnBuka.innerHTML = (format === 'docx' ? '<i class="bi bi-file-earmark-word-fill me-2"></i> Unduh File Word (.docx)' : '<i class="bi bi-file-earmark-pdf-fill me-2"></i> Buka / Unduh PDF');
          }

          // Muat ulang daftar arsip
          Dokumen.load();
        }, 500);
      } else {
        throw new Error(res.pesan || 'Gagal membuat dokumen laporan.');
      }
    } catch (err) {
      if (Dokumen.progressTimer) clearInterval(Dokumen.progressTimer);
      document.getElementById('wadahProgressState').classList.add('d-none');
      document.getElementById('wadahErrorState').classList.remove('d-none');
      document.getElementById('teksErrorUnduh').innerText = err.message || 'Gagal memproses dokumen.';
    }
  },

  setProgressStep: function (stepNum, percent, statusText) {
    const progressBar = document.getElementById('unduhProgressBar');
    const percentLabel = document.getElementById('unduhPercentLabel');
    const statusLabel = document.getElementById('unduhStatusText');

    if (progressBar) progressBar.style.width = percent + '%';
    if (percentLabel) percentLabel.innerText = percent + '%';
    if (statusLabel && statusText) statusLabel.innerText = statusText;

    for (let i = 1; i <= 5; i++) {
      const el = document.getElementById('stepUnduh' + i);
      if (!el) continue;
      const iconSpan = el.querySelector('.step-icon');
      if (i < stepNum) {
        el.className = 'list-group-item d-flex align-items-center py-2 border-0 bg-transparent text-success';
        if (iconSpan) iconSpan.innerHTML = '<i class="bi bi-check-circle-fill text-success"></i>';
      } else if (i === stepNum) {
        el.className = 'list-group-item d-flex align-items-center py-2 border-0 bg-light rounded-3 fw-bold text-success';
        if (iconSpan) iconSpan.innerHTML = '<span class="spinner-border spinner-border-sm text-success"></span>';
      } else {
        el.className = 'list-group-item d-flex align-items-center py-2 border-0 bg-transparent text-muted opacity-50';
        if (iconSpan) iconSpan.innerHTML = '<i class="bi bi-circle"></i>';
      }
    }
  }
};

window.Dokumen = Dokumen;

