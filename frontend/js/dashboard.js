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

      // Muat ringkasan 3 agenda terakhir
      const lhkRes = await Api.getLhkList({ limit: 3 });
      if (lhkRes && lhkRes.sukses) {
        Dashboard.renderRecentLhk(lhkRes.records);
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
    if (elVol) elVol.innerText = (m.totalVolumeBulanIni || 0) + ' Jam';
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
  },

  renderRecentLhk: function (records) {
    const container = document.getElementById('dashRecentLhkContainer');
    if (!container) return;

    if (!records || records.length === 0) {
      container.innerHTML = `
        <div class="text-center py-4 text-muted">
          <i class="bi bi-journal-x fs-1 text-secondary opacity-50 d-block mb-2"></i>
          <p class="mb-0">Belum ada agenda yang tercatat.</p>
        </div>
      `;
      return;
    }

    let html = '';
    records.forEach(r => {
      html += `
        <div class="d-flex align-items-center justify-content-between p-3 border-bottom">
          <div class="me-3">
            <span class="badge bg-light text-success fw-bold border mb-1">${r.tanggal_teks || r.tanggal}</span>
            <div class="fw-semibold text-dark">${r.kelas ? '<span class="badge bg-secondary me-1">' + r.kelas + '</span> ' : ''}${r.cp || r.non_tatap_muka || 'Kegiatan LHK'}</div>
            <small class="text-muted">${r.keterangan || 'Terlaksana'} • Volume: <strong>${r.volume || 0}</strong></small>
          </div>
          <button class="btn btn-outline-success btn-sm rounded-pill px-3" onclick="CmsRouter.navigate('riwayat')">
            Detail <i class="bi bi-arrow-right ms-1"></i>
          </button>
        </div>
      `;
    });

    container.innerHTML = html;
  }
};

window.Dashboard = Dashboard;

