import { Hono } from 'hono';
import { DatabaseQueries } from '../db/queries';
import { hashPassword } from '../utils/crypto';
import { authMiddleware, requireAdmin } from '../middleware/authMiddleware';
import { GasBridgeService } from '../services/gasBridge';
import type { Env, UserSession } from '../types';

export const adminRoutes = new Hono<{
  Bindings: Env;
  Variables: { user: UserSession };
}>();

// Semua rute admin diproteksi auth + requireAdmin
adminRoutes.use('*', authMiddleware, requireAdmin);

/**
 * GET /api/admin/users - Daftar seluruh guru
 */
adminRoutes.get('/users', async (c) => {
  const db = new DatabaseQueries(c.env.DB);
  const users = await db.listUsers();

  const enrichedUsers = await Promise.all(
    users.map(async (u) => {
      const classes = await db.getClassesByUserId(u.id);
      return {
        id: u.id,
        username: u.username,
        role: u.role,
        nama_lengkap: u.nama_lengkap,
        nip: u.nip,
        pangkat_golongan: u.pangkat_golongan,
        jabatan: u.jabatan,
        mapel: u.mapel,
        nama_sekolah: u.nama_sekolah,
        foto_profil: u.foto_profil,
        folder_guru_id: u.folder_guru_id,
        folder_dokumentasi_id: u.folder_dokumentasi_id,
        folder_dok_laporan_id: u.folder_dok_laporan_id,
        folder_template_id: u.folder_template_id,
        folder_db_id: u.folder_db_id,
        spreadsheet_id: u.spreadsheet_id,
        template_doc_id: u.template_doc_id,
        is_active: u.is_active,
        created_at: u.created_at,
        classes
      };
    })
  );

  return c.json({ sukses: true, users: enrichedUsers });
});

/**
 * POST /api/admin/users - Tambah guru baru + Otomasi 4 Sub-Folder Drive
 */
adminRoutes.post('/users', async (c) => {
  const body = await c.req.json();
  const {
    username,
    password,
    nama_lengkap,
    nip,
    pangkat_golongan,
    jabatan,
    mapel,
    nama_sekolah,
    classes,
    auto_provision_drive
  } = body;

  if (!username || !password || !nama_lengkap) {
    return c.json({ sukses: false, pesan: 'Username, password, dan nama lengkap wajib diisi.' }, 400);
  }

  const db = new DatabaseQueries(c.env.DB);
  const existing = await db.getUserByUsername(username.trim());
  if (existing) {
    return c.json({ sukses: false, pesan: `Username "${username}" sudah digunakan.` }, 400);
  }

  const userId = 'usr_' + Date.now();
  const passwordHash = await hashPassword(password);

  let folderGuruId = body.folder_guru_id || '';
  let folderDokumentasiId = body.folder_dokumentasi_id || '';
  let folderDokLaporanId = body.folder_dok_laporan_id || '';
  let folderTemplateId = body.folder_template_id || '';
  let folderDbId = body.folder_db_id || '';
  let spreadsheetId = body.spreadsheet_id || '';
  let templateDocId = body.template_doc_id || '';

  let driveResult: any = null;

  // Otomasi Google Drive jika dicentang (default: true)
  if (auto_provision_drive !== false) {
    try {
      const gas = await GasBridgeService.create(c.env);
      const settings = await db.getAllSettings();
      const masterFolderId = settings['master_parent_folder_id'] || '1r271Uodmsj9R645hC__yeG-rU15JGexr';
      const masterSheetId = settings['master_template_sheet_id'] || '';
      const masterDocId = settings['master_template_doc_id'] || '';

      driveResult = await gas.initGuruDrive({
        masterParentFolderId: masterFolderId,
        masterTemplateSheetId: masterSheetId,
        masterTemplateDocId: masterDocId,
        namaGuru: nama_lengkap,
        nip
      });

      if (driveResult && driveResult.sukses) {
        folderGuruId = driveResult.folderGuruId || folderGuruId;
        folderDokumentasiId = driveResult.folderDokumentasiId || folderDokumentasiId;
        folderDokLaporanId = driveResult.folderDokLaporanId || folderDokLaporanId;
        folderTemplateId = driveResult.folderTemplateId || folderTemplateId;
        folderDbId = driveResult.folderDbId || folderDbId;
        spreadsheetId = driveResult.spreadsheetId || spreadsheetId;
        templateDocId = driveResult.templateDocId || templateDocId;
      }
    } catch (driveErr: any) {
      console.error('Gagal inisialisasi Google Drive:', driveErr);
    }
  }

  await db.createUser({
    id: userId,
    username: username.trim(),
    password_hash: passwordHash,
    role: body.role || 'guru',
    nama_lengkap: nama_lengkap.trim(),
    nip: nip ? nip.trim() : '',
    pangkat_golongan: pangkat_golongan || '',
    jabatan: jabatan || 'Guru Mata Pelajaran',
    mapel: mapel || '',
    nama_sekolah: nama_sekolah || '',
    folder_guru_id: folderGuruId,
    folder_dokumentasi_id: folderDokumentasiId,
    folder_dok_laporan_id: folderDokLaporanId,
    folder_template_id: folderTemplateId,
    folder_db_id: folderDbId,
    spreadsheet_id: spreadsheetId,
    template_doc_id: templateDocId,
    is_active: 1
  });

  // Simpan kelas yang diampu
  if (Array.isArray(classes)) {
    await db.setClassesForUser(userId, classes);
  }

  return c.json({
    sukses: true,
    pesan: 'Akun guru berhasil dibuat dan ruang Google Drive berhasil diinisialisasi!',
    userId,
    drive: driveResult
  });
});

/**
 * PUT /api/admin/users/:id - Update data guru
 */
adminRoutes.put('/users/:id', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  const db = new DatabaseQueries(c.env.DB);

  const existing = await db.getUserById(id);
  if (!existing) {
    return c.json({ sukses: false, pesan: 'Pengguna tidak ditemukan.' }, 404);
  }

  await db.updateUser(id, {
    nama_lengkap: body.nama_lengkap,
    nip: body.nip,
    pangkat_golongan: body.pangkat_golongan,
    jabatan: body.jabatan,
    mapel: body.mapel,
    nama_sekolah: body.nama_sekolah,
    foto_profil: body.foto_profil !== undefined ? body.foto_profil : existing.foto_profil,
    folder_guru_id: body.folder_guru_id,
    folder_dokumentasi_id: body.folder_dokumentasi_id,
    folder_dok_laporan_id: body.folder_dok_laporan_id,
    folder_template_id: body.folder_template_id,
    folder_db_id: body.folder_db_id,
    spreadsheet_id: body.spreadsheet_id,
    template_doc_id: body.template_doc_id,
    is_active: body.is_active
  });

  if (Array.isArray(body.classes)) {
    await db.setClassesForUser(id, body.classes);
  }

  return c.json({ sukses: true, pesan: 'Data guru berhasil diperbarui!' });
});

/**
 * DELETE /api/admin/users/:id - Hapus guru
 */
adminRoutes.delete('/users/:id', async (c) => {
  const id = c.req.param('id');
  const db = new DatabaseQueries(c.env.DB);

  const existing = await db.getUserById(id);
  if (!existing) {
    return c.json({ sukses: false, pesan: 'Pengguna tidak ditemukan.' }, 404);
  }

  if (existing.role === 'admin') {
    return c.json({ sukses: false, pesan: 'Tidak dapat menghapus akun Administrator.' }, 400);
  }

  await db.deleteUser(id);
  return c.json({ sukses: true, pesan: 'Akun guru berhasil dihapus!' });
});

/**
 * POST /api/admin/users/:id/reset-password
 */
adminRoutes.post('/users/:id/reset-password', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json().catch(() => ({}));
  const newPassword = body.newPassword || 'guru123';

  const db = new DatabaseQueries(c.env.DB);
  const existing = await db.getUserById(id);
  if (!existing) {
    return c.json({ sukses: false, pesan: 'Pengguna tidak ditemukan.' }, 404);
  }

  const newHash = await hashPassword(newPassword);
  await db.updateUser(id, { password_hash: newHash });

  return c.json({
    sukses: true,
    pesan: `Kata sandi untuk ${existing.nama_lengkap} berhasil direset menjadi "${newPassword}".`
  });
});

/**
 * POST /api/admin/users/:id/provision-drive - Inisialisasi Ulang Drive Guru
 */
adminRoutes.post('/users/:id/provision-drive', async (c) => {
  const id = c.req.param('id');
  const db = new DatabaseQueries(c.env.DB);
  const user = await db.getUserById(id);
  if (!user) {
    return c.json({ sukses: false, pesan: 'Pengguna tidak ditemukan.' }, 404);
  }

  const gas = await GasBridgeService.create(c.env);
  const settings = await db.getAllSettings();
  const masterFolderId = settings['master_parent_folder_id'] || '1r271Uodmsj9R645hC__yeG-rU15JGexr';
  const masterSheetId = settings['master_template_sheet_id'] || '';
  const masterDocId = settings['master_template_doc_id'] || '';

  const res = await gas.initGuruDrive({
    masterParentFolderId: masterFolderId,
    masterTemplateSheetId: masterSheetId,
    masterTemplateDocId: masterDocId,
    namaGuru: user.nama_lengkap,
    nip: user.nip
  });

  if (res && res.sukses) {
    await db.updateUser(id, {
      folder_guru_id: res.folderGuruId,
      folder_dokumentasi_id: res.folderDokumentasiId,
      folder_dok_laporan_id: res.folderDokLaporanId,
      folder_template_id: res.folderTemplateId,
      folder_db_id: res.folderDbId,
      spreadsheet_id: res.spreadsheetId,
      template_doc_id: res.templateDocId
    });
    return c.json({ sukses: true, pesan: 'Ruang Google Drive guru berhasil dibuat!', drive: res });
  }

  return c.json({ sukses: false, pesan: res.pesan || 'Gagal membuat ruang Drive.' }, 400);
});

/**
 * GET /api/admin/rekap - Rekapitulasi Sekolah Bulan Berjalan
 */
adminRoutes.get('/rekap', async (c) => {
  const bulan = c.req.query('bulan');
  const tahunAjaran = c.req.query('tahunAjaran') || '2026/2027';

  const db = new DatabaseQueries(c.env.DB);
  const rekap = await db.getAdminRekap(bulan, tahunAjaran);

  return c.json({ sukses: true, bulan: bulan || 'semua', tahunAjaran, rekap });
});

/**
 * GET & PUT /api/admin/settings - Pengaturan Sistem
 */
adminRoutes.get('/settings', async (c) => {
  const db = new DatabaseQueries(c.env.DB);
  const settings = await db.getAllSettings();
  return c.json({ sukses: true, settings });
});

adminRoutes.put('/settings', async (c) => {
  const body = await c.req.json();
  const db = new DatabaseQueries(c.env.DB);

  for (const [key, value] of Object.entries(body)) {
    if (typeof value === 'string') {
      await db.updateSetting(key, value.trim());
    }
  }

  return c.json({ sukses: true, pesan: 'Pengaturan sistem berhasil disimpan!' });
});

