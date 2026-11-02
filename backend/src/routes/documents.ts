import { Hono } from 'hono';
import { DatabaseQueries } from '../db/queries';
import { authMiddleware } from '../middleware/authMiddleware';
import { GasBridgeService } from '../services/gasBridge';
import type { Env, UserSession, UserDocument } from '../types';

export const documentRoutes = new Hono<{
  Bindings: Env;
  Variables: { user: UserSession };
}>();

documentRoutes.use('*', authMiddleware);

/**
 * GET /api/documents - Ambil riwayat arsip dokumen cetak
 */
documentRoutes.get('/', async (c) => {
  const session = c.get('user');
  const targetUserId = (session.role === 'admin' && c.req.query('userId')) ? c.req.query('userId')! : session.id;

  const db = new DatabaseQueries(c.env.DB);
  const docs = await db.getUserDocuments(targetUserId);

  return c.json({ sukses: true, documents: docs });
});

/**
 * POST /api/documents/export - Cetak Laporan Bulanan & Arsipkan Link Dokumen
 */
documentRoutes.post('/export', async (c) => {
  const session = c.get('user');
  const body = await c.req.json();
  const { bulan, tahunAjaran, format = 'pdf', userId } = body;

  if (!bulan || !tahunAjaran) {
    return c.json({ sukses: false, pesan: 'Bulan dan tahun ajaran wajib dipilih.' }, 400);
  }

  const targetUserId = (session.role === 'admin' && userId) ? userId : session.id;
  const db = new DatabaseQueries(c.env.DB);

  const user = await db.getUserById(targetUserId);
  if (!user) {
    return c.json({ sukses: false, pesan: 'Data guru tidak ditemukan.' }, 404);
  }

  if (user.is_frozen && session.role !== 'admin') {
    const settings = await db.getAllSettings();
    if (settings['payment_feature_enabled'] !== 'false') {
      return c.json({
        sukses: false,
        is_frozen: true,
        pesan: 'Akun Anda sedang dibekukan karena belum melakukan pembayaran langganan bulanan. Silakan lakukan pembayaran dan unggah bukti transfer.'
      }, 403);
    }
  }

  // 1. Ambil data baris agenda dari D1
  const records = await db.getLhkRecords({
    userId: targetUserId,
    bulan,
    tahunAjaran
  });

  if (!records || records.length === 0) {
    return c.json({
      sukses: false,
      pesan: `Tidak ditemukan data agenda kegiatan untuk bulan ${bulan} (${tahunAjaran}).`
    }, 400);
  }

  // 2. Hubungi Google Apps Script Bridge untuk kloning template di 'Template' & ekspor ke 'Dok_Laporan'
  const gas = await GasBridgeService.create(c.env);
  const gasRes = await gas.buatLaporanBulanan({
    templateDocId: user.template_doc_id || '',
    folderDokLaporanId: user.folder_dok_laporan_id || user.folder_guru_id || '',
    bulan,
    tahunAjaran,
    format: (format === 'docx' ? 'docx' : 'pdf'),
    records,
    guru: {
      nama_lengkap: user.nama_lengkap,
      nip: user.nip,
      pangkat_golongan: user.pangkat_golongan,
      mapel: user.mapel,
      nama_sekolah: user.nama_sekolah
    }
  });

  if (!gasRes || !gasRes.sukses) {
    return c.json({
      sukses: false,
      pesan: gasRes?.pesan || 'Gagal memproses dokumen di Google Drive.'
    }, 500);
  }

  // 3. Simpan tautan berkas ke tabel user_documents (Arsip Dokumen)
  const newDoc: UserDocument = {
    user_id: targetUserId,
    bulan,
    tahun_ajaran: tahunAjaran,
    format: gasRes.format || format,
    nama_file: gasRes.namaFile || `Laporan_Agenda_${bulan}_${tahunAjaran}.${format}`,
    doc_url: gasRes.url || gasRes.downloadUrl,
    view_url: gasRes.viewUrl || gasRes.url,
    total_kegiatan: gasRes.totalKegiatan || records.length
  };

  const docId = await db.saveUserDocument(newDoc);
  newDoc.id = docId;

  return c.json({
    sukses: true,
    pesan: 'Dokumen laporan berhasil dibuat dan tautannya disimpan di Arsip Dokumen!',
    document: newDoc
  });
});

/**
 * DELETE /api/documents/:id - Hapus catatan arsip dokumen
 */
documentRoutes.delete('/:id', async (c) => {
  const id = parseInt(c.req.param('id'), 10);
  const db = new DatabaseQueries(c.env.DB);
  await db.deleteUserDocument(id);

  return c.json({ sukses: true, pesan: 'Catatan arsip dokumen berhasil dihapus!' });
});

