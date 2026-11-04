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

  const thnSlug = String(tahunAjaran).replace(/[\/\\]/g, '-');
  const namaFileDocx = `Laporan_Agenda_${user.nama_lengkap.replace(/[^\w.-]/g, '_')}_${bulan}_${thnSlug}.docx`;

  // === 2A. FORMAT DOCX (100% NATIVE CLOUDFLARE WORKER & R2) ===
  if (format === 'docx') {
    try {
      const docxBytes = await DocxGeneratorService.generate(c.env, user, bulan, tahunAjaran, records);
      const storageKey = `generated/${targetUserId}/${Date.now()}_${namaFileDocx}`;

      await c.env.STORAGE.put(storageKey, docxBytes, {
        httpMetadata: {
          contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          contentDisposition: `attachment; filename="${namaFileDocx}"`
        }
      });

      const downloadUrl = `/api/documents/download/${storageKey}`;

      const newDoc: UserDocument = {
        user_id: targetUserId,
        bulan,
        tahun_ajaran: tahunAjaran,
        format: 'docx',
        nama_file: namaFileDocx,
        doc_url: downloadUrl,
        view_url: downloadUrl,
        total_kegiatan: records.length
      };

      const docId = await db.saveUserDocument(newDoc);
      newDoc.id = docId;

      return c.json({
        sukses: true,
        pesan: 'Dokumen Word (.docx) berhasil dibuat secara instan dari Cloudflare R2!',
        document: newDoc
      });
    } catch (docxErr: any) {
      console.error('Gagal render DOCX:', docxErr);
      return c.json({
        sukses: false,
        pesan: `Gagal memproses DOCX di Cloudflare: ${docxErr.message}`
      }, 500);
    }
  }

  // === 2B. FORMAT PDF (HYBRID VIA GAS BRIDGE) ===
  try {
    const docxBytes = await DocxGeneratorService.generate(c.env, user, bulan, tahunAjaran, records);

    // Konversi Uint8Array ke Base64
    let binary = '';
    const bytes = new Uint8Array(docxBytes);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const docxBase64 = btoa(binary);

    const gas = await GasBridgeService.create(c.env);
    const pdfRes = await gas.convertDocxToPdf({
      folderDokLaporanId: user.folder_dok_laporan_id || user.folder_guru_id || '',
      namaFile: namaFileDocx,
      docxBase64
    });

    if (!pdfRes || !pdfRes.sukses) {
      // Fallback jika action convert_docx_to_pdf di GAS belum ter-deploy
      const gasFallback = await gas.buatLaporanBulanan({
        templateDocId: user.template_doc_id || '',
        folderDokLaporanId: user.folder_dok_laporan_id || user.folder_guru_id || '',
        bulan,
        tahunAjaran,
        format: 'pdf',
        records,
        guru: {
          nama_lengkap: user.nama_lengkap,
          nip: user.nip,
          pangkat_golongan: user.pangkat_golongan,
          mapel: user.mapel,
          nama_sekolah: user.nama_sekolah
        }
      });

      if (!gasFallback || !gasFallback.sukses) {
        return c.json({
          sukses: false,
          pesan: pdfRes?.pesan || gasFallback?.pesan || 'Gagal mengekspor PDF ke Google Drive.'
        }, 500);
      }

      const newDocFallback: UserDocument = {
        user_id: targetUserId,
        bulan,
        tahun_ajaran: tahunAjaran,
        format: 'pdf',
        nama_file: gasFallback.namaFile || `Laporan_Agenda_${bulan}_${thnSlug}.pdf`,
        doc_url: gasFallback.url || gasFallback.downloadUrl,
        view_url: gasFallback.viewUrl || gasFallback.url,
        total_kegiatan: records.length
      };

      const docId = await db.saveUserDocument(newDocFallback);
      newDocFallback.id = docId;

      return c.json({
        sukses: true,
        pesan: 'Dokumen PDF berhasil dibuat!',
        document: newDocFallback
      });
    }

    const newDoc: UserDocument = {
      user_id: targetUserId,
      bulan,
      tahun_ajaran: tahunAjaran,
      format: 'pdf',
      nama_file: pdfRes.namaFile || namaFileDocx.replace(/\.docx$/i, '.pdf'),
      doc_url: pdfRes.url || pdfRes.downloadUrl,
      view_url: pdfRes.viewUrl || pdfRes.url,
      total_kegiatan: records.length
    };

    const docId = await db.saveUserDocument(newDoc);
    newDoc.id = docId;

    return c.json({
      sukses: true,
      pesan: 'Dokumen PDF berhasil dibuat via GAS Bridge!',
      document: newDoc
    });
  } catch (pdfErr: any) {
    console.error('Gagal render PDF:', pdfErr);
    return c.json({
      sukses: false,
      pesan: `Gagal membuat PDF: ${pdfErr.message}`
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

