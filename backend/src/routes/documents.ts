import { Hono } from 'hono';
import { DatabaseQueries } from '../db/queries';
import { authMiddleware } from '../middleware/authMiddleware';
import { GasBridgeService } from '../services/gasBridge';
import { DocxGeneratorService } from '../services/docxGenerator';
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
  const { bulan, tahunAjaran, format = 'docx', userId } = body;

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

  const folderDokLaporanId = user.folder_dok_laporan_id || user.folder_guru_id;
  if (!folderDokLaporanId) {
    return c.json({
      sukses: false,
      pesan: 'Folder Dok_Laporan guru di Google Drive belum diatur. Silakan atur di data pengguna.'
    }, 400);
  }

  const thnSlug = String(tahunAjaran).replace(/[\/\\]/g, '-');
  const namaFileDocx = `Laporan_Agenda_${user.nama_lengkap.replace(/[^\w.-]/g, '_')}_${bulan}_${thnSlug}.docx`;

  try {
    // 1. Generate berkas Word (.docx) secara rapi (Ukuran Legal, foto Google Drive, tabel rapi)
    const docxBytes = await DocxGeneratorService.generate(c.env, user, bulan, tahunAjaran, records);

    // 2. Konversi Uint8Array ke Base64
    let binary = '';
    const bytes = new Uint8Array(docxBytes);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const docxBase64 = btoa(binary);

    // 3. Simpan berkas DOCX langsung ke Google Drive (Folder Dok_Laporan) via GAS Bridge
    const gas = await GasBridgeService.create(c.env);
    const driveRes = await gas.simpanDocxKeDrive({
      folderDokLaporanId,
      namaFile: namaFileDocx,
      docxBase64
    });

    if (!driveRes || !driveRes.sukses) {
      return c.json({
        sukses: false,
        pesan: driveRes?.pesan || 'Gagal menyimpan berkas Word (.docx) ke Google Drive.'
      }, 500);
    }

    // 4. Simpan catatan dokumen ke database D1
    const newDoc: UserDocument = {
      user_id: targetUserId,
      bulan,
      tahun_ajaran: tahunAjaran,
      format: 'docx',
      nama_file: namaFileDocx,
      doc_url: driveRes.url || driveRes.downloadUrl,
      view_url: driveRes.viewUrl || driveRes.url,
      total_kegiatan: records.length
    };

    const docId = await db.saveUserDocument(newDoc);
    newDoc.id = docId;

    return c.json({
      sukses: true,
      pesan: 'Dokumen Word (.docx) berhasil dibuat dan tersimpan di Google Drive!',
      document: newDoc
    });
  } catch (err: any) {
    console.error('Gagal memproses dokumen Word ke Google Drive:', err);
    return c.json({
      sukses: false,
      pesan: `Gagal memproses dokumen: ${err.message}`
    }, 500);
  }
});

/**
 * GET /api/documents/download/* - Unduh berkas dari Cloudflare R2
 */
documentRoutes.get('/download/*', async (c) => {
  const path = c.req.path.replace(/^\/api\/documents\/download\//, '');
  if (!path) {
    return c.text('Path berkas tidak valid', 400);
  }

  const object = await c.env.STORAGE.get(path);
  if (!object) {
    return c.text('Berkas tidak ditemukan di Cloudflare R2', 404);
  }

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set('etag', object.httpEtag);
  if (!headers.has('content-type')) {
    headers.set('content-type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
  }

  return new Response(object.body, { headers });
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

