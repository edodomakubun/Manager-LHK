import { Hono } from 'hono';
import { DatabaseQueries } from '../db/queries';
import { authMiddleware } from '../middleware/authMiddleware';
import { GasBridgeService } from '../services/gasBridge';
import type { Env, UserSession, LhkRecord } from '../types';

export const lhkRoutes = new Hono<{
  Bindings: Env;
  Variables: { user: UserSession };
}>();

lhkRoutes.use('*', authMiddleware);

/**
 * GET /api/lhk - Riwayat Laporan Harian
 */
lhkRoutes.get('/', async (c) => {
  const session = c.get('user');
  const targetUserId = (session.role === 'admin' && c.req.query('userId')) ? c.req.query('userId')! : session.id;
  const bulan = c.req.query('bulan');
  const tahunAjaran = c.req.query('tahunAjaran');
  const kelas = c.req.query('kelas');
  const limit = c.req.query('limit') ? parseInt(c.req.query('limit')!, 10) : undefined;
  const offset = c.req.query('offset') ? parseInt(c.req.query('offset')!, 10) : undefined;

  const db = new DatabaseQueries(c.env.DB);
  const records = await db.getLhkRecords({
    userId: targetUserId,
    bulan: bulan || undefined,
    tahunAjaran: tahunAjaran || undefined,
    kelas: kelas || undefined,
    limit,
    offset
  });

  return c.json({ sukses: true, records });
});

/**
 * GET /api/lhk/:id - Detail 1 Laporan
 */
lhkRoutes.get('/:id', async (c) => {
  const id = c.req.param('id');
  const session = c.get('user');
  const db = new DatabaseQueries(c.env.DB);

  const record = await db.getLhkById(id);
  if (!record) {
    return c.json({ sukses: false, pesan: 'Data laporan tidak ditemukan.' }, 404);
  }

  // Guru hanya bisa melihat miliknya, kecuali admin
  if (session.role !== 'admin' && record.user_id !== session.id) {
    return c.json({ sukses: false, pesan: 'Akses ditolak.' }, 403);
  }

  return c.json({ sukses: true, record });
});

/**
 * POST /api/lhk - Simpan Agenda LHK Baru (D1 + Google Drive/Spreadsheet)
 */
lhkRoutes.post('/', async (c) => {
  const session = c.get('user');
  const body = await c.req.json();
  const db = new DatabaseQueries(c.env.DB);

  const user = await db.getUserById(session.id);
  if (!user) {
    return c.json({ sukses: false, pesan: 'Profil pengguna tidak ditemukan.' }, 404);
  }

  const {
    tanggal,
    tanggalTeks,
    bulan,
    tahunAjaran,
    cp,
    tp,
    kelas,
    nonTatapMuka,
    volume,
    keterangan,
    fotoArr
  } = body;

  if (!tanggal || !bulan || !tahunAjaran) {
    return c.json({ sukses: false, pesan: 'Tanggal, bulan, dan tahun ajaran wajib diisi.' }, 400);
  }

  const lhkId = 'AGR-' + Date.now();

  // 1. Format tanggal teks jika belum ada
  let tglFormat = tanggalTeks;
  if (!tglFormat && tanggal) {
    const bagianTgl = tanggal.split('-');
    const tglObj = new Date(parseInt(bagianTgl[0]), parseInt(bagianTgl[1]) - 1, parseInt(bagianTgl[2]));
    const hArr = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    const mArr = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
    tglFormat = `${hArr[tglObj.getDay()]}, ${bagianTgl[2]} ${mArr[tglObj.getMonth()]} ${bagianTgl[0]}`;
  }

  // 2. Hubungi Google Apps Script Bridge untuk simpan foto ke 'Dokumentasi' & append baris ke 'SpreadsheetDB'
  let fotoIds = ['', '', '', '', '', ''];
  let syncedToSheet = 0;

  try {
    const gas = await GasBridgeService.create(c.env);
    const gasRes = await gas.uploadFotoDanSimpan({
      folderDokumentasiId: user.folder_dokumentasi_id || '',
      spreadsheetId: user.spreadsheet_id || '',
      fotoArr: Array.isArray(fotoArr) ? fotoArr : [],
      id: lhkId,
      tanggal,
      tanggalTeks: tglFormat,
      bulan,
      tahunAjaran,
      cp: cp || '',
      tp: tp || '',
      kelas: kelas || '',
      nonTatapMuka: nonTatapMuka || '',
      volume: volume || 0,
      keterangan: keterangan || 'Terlaksana'
    });

    if (gasRes && gasRes.sukses) {
      if (Array.isArray(gasRes.fotoIds)) {
        fotoIds = gasRes.fotoIds;
      }
      syncedToSheet = 1;
    }
  } catch (gasErr) {
    console.error('Peringatan Apps Script Bridge saat upload:', gasErr);
  }

  // 3. Simpan data agenda ke Cloudflare D1
  const newRecord: LhkRecord = {
    id: lhkId,
    user_id: user.id,
    tanggal,
    tanggal_teks: tglFormat || tanggal,
    bulan,
    tahun_ajaran: tahunAjaran,
    cp: cp || '',
    tp: tp || '',
    kelas: kelas || '',
    non_tatap_muka: nonTatapMuka || '',
    volume: parseInt(volume || '0', 10),
    keterangan: keterangan || 'Terlaksana',
    foto_tm_id: fotoIds[0] || '',
    foto_ntm1_id: fotoIds[1] || '',
    foto_ntm2_id: fotoIds[2] || '',
    foto_ntm3_id: fotoIds[3] || '',
    foto_ntm4_id: fotoIds[4] || '',
    foto_ntm5_id: fotoIds[5] || '',
    synced_to_sheet: syncedToSheet
  };

  await db.createLhkRecord(newRecord);

  return c.json({
    sukses: true,
    pesan: 'Laporan agenda harian berhasil disimpan ke Database & Google Drive!',
    id: lhkId,
    record: newRecord
  });
});

/**
 * PUT /api/lhk/:id - Update Agenda LHK
 */
lhkRoutes.put('/:id', async (c) => {
  const id = c.req.param('id');
  const session = c.get('user');
  const body = await c.req.json();
  const db = new DatabaseQueries(c.env.DB);

  const existing = await db.getLhkById(id);
  if (!existing) {
    return c.json({ sukses: false, pesan: 'Data laporan tidak ditemukan.' }, 404);
  }

  if (session.role !== 'admin' && existing.user_id !== session.id) {
    return c.json({ sukses: false, pesan: 'Akses ditolak.' }, 403);
  }

  let tglFormat = body.tanggalTeks;
  if (!tglFormat && body.tanggal && body.tanggal.includes('-')) {
    const bagianTgl = body.tanggal.split('-');
    const tglObj = new Date(parseInt(bagianTgl[0]), parseInt(bagianTgl[1]) - 1, parseInt(bagianTgl[2]));
    const hArr = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    const mArr = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
    tglFormat = `${hArr[tglObj.getDay()]}, ${bagianTgl[2]} ${mArr[tglObj.getMonth()]} ${bagianTgl[0]}`;
  }

  const user = await db.getUserById(existing.user_id);
  let updatedFotoIds = [
    existing.foto_tm_id,
    existing.foto_ntm1_id,
    existing.foto_ntm2_id,
    existing.foto_ntm3_id,
    existing.foto_ntm4_id,
    existing.foto_ntm5_id
  ];

  // Sinkronisasi ke Google Apps Script (Update SpreadsheetDB & ganti foto di Google Drive)
  if (user && user.spreadsheet_id && Array.isArray(body.fotoArr)) {
    try {
      const gas = await GasBridgeService.create(c.env);
      const gasRes = await gas.updateLhk({
        id,
        spreadsheetId: user.spreadsheet_id,
        folderDokumentasiId: user.folder_dokumentasi_id || '',
        tanggal: body.tanggal || existing.tanggal,
        tanggalTeks: tglFormat || existing.tanggal_teks,
        bulan: body.bulan || existing.bulan,
        tahunAjaran: body.tahunAjaran || existing.tahun_ajaran,
        cp: body.cp !== undefined ? body.cp : existing.cp,
        tp: body.tp !== undefined ? body.tp : existing.tp,
        kelas: body.kelas !== undefined ? body.kelas : existing.kelas,
        nonTatapMuka: body.nonTatapMuka !== undefined ? body.nonTatapMuka : existing.non_tatap_muka,
        volume: body.volume !== undefined ? parseInt(body.volume, 10) : existing.volume,
        keterangan: body.keterangan !== undefined ? body.keterangan : existing.keterangan,
        fotoArr: body.fotoArr
      });

      if (gasRes && gasRes.sukses && Array.isArray(gasRes.fotoIds)) {
        updatedFotoIds = gasRes.fotoIds;
      }
    } catch (gasErr) {
      console.warn('Gagal sinkronisasi update Drive/Sheet:', gasErr);
    }
  }

  await db.updateLhkRecord(id, {
    tanggal: body.tanggal || existing.tanggal,
    tanggal_teks: tglFormat || existing.tanggal_teks,
    bulan: body.bulan || existing.bulan,
    tahun_ajaran: body.tahunAjaran || existing.tahun_ajaran,
    cp: body.cp !== undefined ? body.cp : existing.cp,
    tp: body.tp !== undefined ? body.tp : existing.tp,
    kelas: body.kelas !== undefined ? body.kelas : existing.kelas,
    non_tatap_muka: body.nonTatapMuka !== undefined ? body.nonTatapMuka : existing.non_tatap_muka,
    volume: body.volume !== undefined ? parseInt(body.volume, 10) : existing.volume,
    keterangan: body.keterangan !== undefined ? body.keterangan : existing.keterangan,
    foto_tm_id: updatedFotoIds[0] || '',
    foto_ntm1_id: updatedFotoIds[1] || '',
    foto_ntm2_id: updatedFotoIds[2] || '',
    foto_ntm3_id: updatedFotoIds[3] || '',
    foto_ntm4_id: updatedFotoIds[4] || '',
    foto_ntm5_id: updatedFotoIds[5] || ''
  });

  return c.json({
    sukses: true,
    pesan: 'Data agenda dan foto berhasil diperbarui di Web, Database, dan Google Drive!'
  });
});

/**
 * DELETE /api/lhk/:id - Hapus Agenda LHK
 */
lhkRoutes.delete('/:id', async (c) => {
  const id = c.req.param('id');
  const session = c.get('user');
  const db = new DatabaseQueries(c.env.DB);

  const existing = await db.getLhkById(id);
  if (!existing) {
    return c.json({ sukses: false, pesan: 'Data laporan tidak ditemukan.' }, 404);
  }

  if (session.role !== 'admin' && existing.user_id !== session.id) {
    return c.json({ sukses: false, pesan: 'Akses ditolak.' }, 403);
  }

  // Ambil data user pemilik LHK untuk mendapatkan spreadsheet_id
  const user = await db.getUserById(existing.user_id);
  const fotoIds = [
    existing.foto_tm_id,
    existing.foto_ntm1_id,
    existing.foto_ntm2_id,
    existing.foto_ntm3_id,
    existing.foto_ntm4_id,
    existing.foto_ntm5_id
  ].filter(Boolean) as string[];

  // Hubungi Google Apps Script Bridge untuk menghapus baris di Google Spreadsheet & hapus foto di Drive
  if (user && user.spreadsheet_id) {
    try {
      const gas = await GasBridgeService.create(c.env);
      await gas.hapusLhk({
        spreadsheetId: user.spreadsheet_id,
        lhkId: id,
        fotoIds: fotoIds
      });
    } catch (gasErr) {
      console.warn('Gagal sinkronisasi hapus Drive/Sheet:', gasErr);
    }
  }

  await db.deleteLhkRecord(id);
  return c.json({ sukses: true, pesan: 'Data agenda berhasil dihapus dari sistem dan Google Drive!' });
});
