/**
 * ========================================================
 * 📊 DASHBOARD CONTROLLER - CMS MANAGER LHK
 * ========================================================
 */

const Dashboard = {
  load: async function () {
    try {
      const res = await Api.getDashboardMetrics();
      if (res && res.sukses) {
        Dashboard.renderMetrics(res);
      }

      // Muat ringkasan 5 agenda terbaru bulan ini
      const lhkRes = await Api.getLhkList({
        bulan: res.bulanIni,
        limit: 5
      });
      if (lhkRes && lhkRes.sukses) {
        Dashboard.renderRecentLhk(lhkRes.records, res.bulanIni);
      }
    } catch (err) {
      console.error('Gagal memuat dashboard:', err);
    }
  },

  renderMetrics: function (data) {
    const m = data.metrics || {};

    const elHari = document.getElementById('dashMetricHari');
    const elVol = document.getElementById('dashMetricVolume');
    const elStatus = document.getElementById('dashMetricStatus');
    const elDocs = document.getElementById('dashMetricDocs');
    const elKelas = document.getElementById('dashMetricKelas');
    const elPeriode = document.getElementById('dashPeriodeBulan');

    if (elHari) elHari.innerText = m.totalHariBulanIni || 0;
    if (elVol) elVol.innerText = (m.totalVolumeBulanIni || 0) + ' Kegiatan';
    if (elDocs) elDocs.innerText = m.totalDokumen || 0;
    if (elKelas) elKelas.innerText = m.totalKelas || 0;
    if (elPeriode) elPeriode.innerText = `${data.bulanIni || ''} (${data.tahunAjaranAktif || ''})`;

    if (elStatus) {
      if (m.sudahIsiHariIni) {
        elStatus.innerHTML = '<span class="badge bg-success"><i class="bi bi-check-circle-fill me-1"></i>Sudah Terisi Hari Ini</span>';
      } else {
        elStatus.innerHTML = '<span class="badge bg-warning text-dark"><i class="bi bi-exclamation-triangle-fill me-1"></i>Belum Terisi Hari Ini</span>';
      }
    }

    // Tampilkan Link Group WhatsApp jika Admin sudah mengaturnya
    const cardWa = document.getElementById('dashWaGroupCard');
    const linkWa = document.getElementById('dashWaGroupLink');
    if (cardWa && linkWa) {
      if (data.whatsappGroupUrl && data.whatsappGroupUrl.trim().length > 0) {
        linkWa.href = data.whatsappGroupUrl.trim();
        cardWa.classList.remove('d-none');
      } else {
        cardWa.classList.add('d-none');
      }
    }
  },

  renderRecentLhk: function (records, bulan) {
    const container = document.getElementById('dashRecentLhkContainer');
    if (!container) return;

    if (!records || records.length === 0) {
      container.innerHTML = `
        <div class="text-center py-5 text-muted">
          <i class="bi bi-journal-x fs-1 text-secondary opacity-50 d-block mb-2"></i>
          <p class="mb-1 fw-semibold">Belum ada agenda pada bulan ${bulan || 'ini'}.</p>
          <small class="text-muted d-block mb-3">Mulai isi kegiatan harian Anda melalui tombol di bawah ini.</small>
          <button class="btn btn-sm btn-cms-primary rounded-pill px-3" onclick="CmsRouter.navigate('input')">
            <i class="bi bi-pencil-square me-1"></i> Input Agenda Baru
          </button>
        </div>
      `;
      return;
    }

    let rowsHtml = '';
    records.forEach(r => {
      const hasTM = (r.cp && r.cp.trim() !== '') || (r.tp && r.tp.trim() !== '');
      const ntmLines = r.non_tatap_muka ? r.non_tatap_muka.split('\n').map(s => s.trim()).filter(Boolean) : [];
      const hasNTM = ntmLines.length > 0;

      let kegiatanHtml = '';

      if (hasTM) {
        kegiatanHtml += `
          <div class="mb-1">
            <span class="badge bg-success-subtle text-success border border-success fw-bold px-2 py-1">
              <i class="bi bi-check-circle-fill text-success me-1"></i>Tatap Muka (1 Kegiatan)
            </span>
            <div class="small mt-1 text-dark">
              ${r.cp ? `<div><strong class="text-secondary">CP:</strong> ${r.cp}</div>` : ''}
              ${r.tp ? `<div class="text-muted"><strong class="text-secondary">TP:</strong> ${r.tp}</div>` : ''}
            </div>
          </div>
        `;
      }

      if (hasNTM) {
        kegiatanHtml += `
          <div class="${hasTM ? 'pt-2 mt-2 border-top' : ''}">
            <span class="badge bg-primary-subtle text-primary border border-primary fw-bold px-2 py-1">
              <i class="bi bi-check-circle-fill text-primary me-1"></i>Non Tatap Muka (${ntmLines.length} Kegiatan)
            </span>
            <ul class="small text-muted mb-0 ps-3 mt-1">
              ${ntmLines.map(line => `<li>${line}</li>`).join('')}
            </ul>
          </div>
        `;
      }

      if (!hasTM && !hasNTM) {
        kegiatanHtml = `<span class="text-muted">-</span>`;
      }

      rowsHtml += `
        <tr>
          <td class="text-nowrap align-top py-3">
            <div class="fw-bold text-dark"><i class="bi bi-calendar-event text-success me-1"></i>${r.tanggal_teks || r.tanggal}</div>
            <div class="small text-muted mt-1"><i class="bi bi-layers me-1 text-secondary"></i>${r.volume ? r.volume + ' Total Kegiatan' : ''}</div>
          </td>
          <td class="align-top py-3 text-center">
            ${r.kelas ? `
              <span class="badge bg-success-subtle text-success border border-success px-2 py-1 fw-bold">
                <i class="bi bi-mortarboard-fill me-1"></i>${r.kelas}
              </span>
            ` : '<span class="badge bg-light text-muted border">-</span>'}
          </td>
          <td class="align-top py-3">
            ${kegiatanHtml}
          </td>
          <td class="align-top py-3 text-center text-nowrap">
            <span class="badge bg-success px-2 py-1 mb-2 d-inline-block">
              <i class="bi bi-check2-circle me-1"></i>${r.keterangan || 'Terlaksana'}
            </span>
            <div>
              <button class="btn btn-outline-success rounded-pill px-3 py-1" style="font-size: 0.78rem;" onclick="CmsRouter.navigate('riwayat')" title="Buka Detail di Riwayat">
                Detail <i class="bi bi-arrow-right"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    });

    container.innerHTML = `
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-light border-bottom">
            <tr class="small text-muted text-uppercase" style="font-size: 0.78rem; letter-spacing: 0.5px;">
              <th style="min-width: 170px;"><i class="bi bi-calendar3 me-1"></i>Hari Tanggal</th>
              <th class="text-center" style="width: 110px;"><i class="bi bi-mortarboard me-1"></i>Kelas</th>
              <th style="min-width: 280px;"><i class="bi bi-card-checklist me-1"></i>Kegiatan</th>
              <th class="text-center" style="width: 120px;"><i class="bi bi-check-all me-1"></i>Terlaksana</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
      </div>
    `;
  }
};

window.Dashboard = Dashboard;

