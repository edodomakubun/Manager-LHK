/**
 * ========================================================
 * 📂 ARSIP DOKUMEN LAPORAN & GENERATOR DOKUMEN WORD (.DOCX)
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

  formatWaktuLengkap: function (dateStr) {
    if (!dateStr) return { tgl: '-', jam: '-', full: '-' };
    let d = new Date(dateStr.includes('T') || dateStr.endsWith('Z') ? dateStr : dateStr.replace(' ', 'T') + 'Z');
    if (isNaN(d.getTime())) {
      d = new Date(dateStr);
    }
    if (isNaN(d.getTime())) return { tgl: dateStr, jam: '-', full: dateStr };

    const jam = String(d.getHours()).padStart(2, '0');
    const menit = String(d.getMinutes()).padStart(2, '0');
    const detik = String(d.getSeconds()).padStart(2, '0');
    const waktuJam = `${jam}:${menit}:${detik}`;

    const tgl = d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });

    return { tgl, jam: waktuJam, full: `${tgl} • ${waktuJam}` };
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
      const timeInfo = Dokumen.formatWaktuLengkap(doc.generated_at);
      html += `
        <div class="card-cms p-3 mb-3">
          <div class="d-flex align-items-center justify-content-between flex-wrap gap-2">
            <div class="d-flex align-items-center gap-3">
              <div class="rounded-3 p-2 bg-primary-subtle text-primary" style="font-size: 1.8rem;">
                <i class="bi bi-file-earmark-word-fill"></i>
              </div>
              <div>
                <h6 class="mb-1 fw-bold text-dark">${doc.nama_file}</h6>
                <div class="small text-muted d-flex flex-wrap align-items-center gap-2">
                  <span class="badge bg-primary">${(doc.format || 'docx').toUpperCase()}</span>
                  <span><i class="bi bi-calendar-check me-1 text-success"></i>Periode: <strong>${doc.bulan} (${doc.tahun_ajaran})</strong></span>
                  <span>•</span>
                  <span><i class="bi bi-layers me-1 text-info"></i>${doc.total_kegiatan} Kegiatan</span>
                  <span>•</span>
                  <span class="badge bg-light text-dark border">
                    <i class="bi bi-clock-history me-1 text-primary"></i>Waktu Download: <strong class="text-primary">${timeInfo.jam}</strong> <small class="text-muted">(${timeInfo.tgl})</small>
                  </span>
                </div>
              </div>
            </div>
            <div class="d-flex align-items-center gap-2">
              <a href="${doc.doc_url.startsWith('/') ? doc.doc_url + '?token=' + encodeURIComponent(Api.getToken()) : doc.doc_url}" target="_blank" class="btn btn-sm btn-outline-primary rounded-pill px-3" title="Unduh File Word (.docx)">
                <i class="bi bi-file-earmark-word-fill me-1"></i> Word (.docx)
              </a>
              <button class="btn btn-sm btn-light border rounded-pill px-2" onclick="Dokumen.salinLink('${doc.doc_url.startsWith('/') ? window.location.origin + doc.doc_url + '?token=' + encodeURIComponent(Api.getToken()) : doc.doc_url}')" title="Salin Tautan">
                <i class="bi bi-clipboard"></i>
              </button>
              <button class="btn btn-sm btn-outline-danger border-0 rounded-pill px-2" onclick="Dokumen.hapusArsip('${doc.id}')" title="Hapus dari Arsip">
                <i class="bi bi-trash3"></i>
              </button>
            </div>
          </div>
        </div>
      `;
    });

    container.innerHTML = html;
  },

  salinLink: async function (url) {
    if (!url) return;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(() => {
        CMSDialog.success('Tautan dokumen berhasil disalin ke clipboard! 📋');
      }).catch(async () => {
        await CMSDialog.prompt("Salin tautan dokumen berikut:", url, { title: "Tautan Dokumen" });
      });
    } else {
      await CMSDialog.prompt("Salin tautan dokumen berikut:", url, { title: "Tautan Dokumen" });
    }
  },

  hapusArsip: async function (id) {
    const yakin = await CMSDialog.confirm('Hapus catatan arsip dokumen ini? (File di Google Drive tidak terhapus)', {
      title: 'Hapus Catatan Arsip',
      confirmText: 'Ya, Hapus',
      cancelText: 'Batal',
      isDanger: true
    });
    if (!yakin) return;
    try {
      const res = await Api.deleteDocument(id);
      if (res && res.sukses) {
        Dokumen.load();
      } else {
        throw new Error((res && res.pesan) || 'Gagal menghapus arsip.');
      }
    } catch (e) {
      CMSDialog.error('Gagal menghapus arsip: ' + (e.message || e));
    }
  },

  openExportModal: function () {
    const modalEl = document.getElementById('modalCetakLaporan');
    if (modalEl) {
      const bsModal = bootstrap.Modal.getOrCreateInstance(modalEl);
      bsModal.show();
    }
  },

  // --- PROSES GENERATE DOKUMEN WORD (.DOCX) SECARA INSTAN ---
  startExport: async function () {
    const bulan = document.getElementById('exportBulan').value;
    const tahun = document.getElementById('exportTahun').value;

    // Buka Modal Progres
    const modalCetak = bootstrap.Modal.getInstance(document.getElementById('modalCetakLaporan'));
    if (modalCetak) modalCetak.hide();

    const modalProgresEl = document.getElementById('modalProgressUnduh');
    const modalProgres = bootstrap.Modal.getOrCreateInstance(modalProgresEl);

    document.getElementById('wadahProgressState').classList.remove('d-none');
    document.getElementById('wadahSuksesState').classList.add('d-none');
    document.getElementById('wadahErrorState').classList.add('d-none');
    document.getElementById('infoPeriodeUnduh').innerText = `${bulan} (${tahun})`;

    Dokumen.setProgressStep(1, 25, 'Membaca data agenda dari Database Cloudflare D1...');
    modalProgres.show();

    if (Dokumen.progressTimer) clearInterval(Dokumen.progressTimer);
    let stepCount = 1;
    Dokumen.progressTimer = setInterval(() => {
      stepCount++;
      if (stepCount === 2) {
        Dokumen.setProgressStep(2, 50, 'Membaca template master DOCX dari Cloudflare R2...');
      } else if (stepCount === 3) {
        Dokumen.setProgressStep(3, 75, 'Menyusun tabel kegiatan & menyisipkan foto...');
      } else if (stepCount === 4) {
        Dokumen.setProgressStep(4, 90, 'Mengompilasi berkas Word (.docx) & menyimpan ke Google Drive...');
      }
    }, 700);

    try {
      // Backend memproses data, foto, dan template DOCX lalu menyimpannya langsung ke Google Drive
      const res = await Api.exportDocument({
        bulan,
        tahunAjaran: tahun,
        format: 'docx'
      });

      if (Dokumen.progressTimer) clearInterval(Dokumen.progressTimer);

      if (!res || !res.sukses || !res.document) {
        throw new Error(res?.pesan || 'Gagal membuat dokumen laporan.');
      }

      let finalDownloadUrl = res.document.doc_url;
      if (finalDownloadUrl.startsWith('/')) {
        finalDownloadUrl += (finalDownloadUrl.includes('?') ? '&' : '?') + `token=${encodeURIComponent(Api.getToken())}`;
      }
      const finalFileName = res.document.nama_file;

      // Otomatis picu download berkas .docx di browser
      const link = document.createElement('a');
      link.href = finalDownloadUrl;
      link.download = finalFileName;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Tampilkan status sukses
      Dokumen.setProgressStep(5, 100, 'Dokumen Word (.docx) berhasil disimpan di Google Drive & diunduh!');

      setTimeout(() => {
        document.getElementById('wadahProgressState').classList.add('d-none');
        document.getElementById('wadahSuksesState').classList.remove('d-none');

        document.getElementById('namaFileSukses').innerText = finalFileName;
        document.getElementById('formatSukses').innerText = 'WORD (.DOCX)';
        document.getElementById('formatSukses').className = 'badge bg-primary';
        document.getElementById('totalKegiatanSukses').innerText = res.document.total_kegiatan + ' Kegiatan';

        const now = new Date();
        const jam = String(now.getHours()).padStart(2, '0');
        const menit = String(now.getMinutes()).padStart(2, '0');
        const detik = String(now.getSeconds()).padStart(2, '0');
        const elWaktu = document.getElementById('waktuUnduhSukses');
        if (elWaktu) elWaktu.innerText = `${jam}:${menit}:${detik}`;

        const btnBuka = document.getElementById('btnBukaDokumen');
        if (btnBuka) {
          btnBuka.href = finalDownloadUrl;
          btnBuka.download = finalFileName;
          btnBuka.innerHTML = '<i class="bi bi-file-earmark-word-fill me-2"></i> Unduh Ulang File Word (.docx)';
        }

        // Muat ulang daftar arsip
        Dokumen.load();
      }, 400);

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

