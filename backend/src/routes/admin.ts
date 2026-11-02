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

/**
 * GET /api/admin/subscriptions - Daftar status langganan seluruh guru (Realtime)
 */
adminRoutes.get('/subscriptions', async (c) => {
  const db = new DatabaseQueries(c.env.DB);
  const list = await db.getSubscriptionsList();
  const settings = await db.getAllSettings();

  const totalGuru = list.length;
  const activeCount = list.filter(u => !u.is_frozen && u.subscription_status === 'active').length;
  const pendingCount = list.filter(u => u.subscription_status === 'pending_verification').length;
  const frozenCount = list.filter(u => u.is_frozen === 1).length;

  return c.json({
    sukses: true,
    summary: {
      totalGuru,
      activeCount,
      pendingCount,
      frozenCount
    },
    settings: {
      enabled: settings['payment_feature_enabled'] !== 'false',
      amount: parseInt(settings['payment_amount'] || '50000', 10),
      qr_code: settings['payment_qr_code'] || '',
      instructions: settings['payment_instructions'] || 'Biaya langganan CMS Rp 50.000/bulan. Silakan scan QR Code di atas dan unggah bukti transfer.'
    },
    users: list
  });
});

/**
 * POST /api/admin/subscriptions/freeze - Bekukan atau buka pembekuan akun guru
 */
adminRoutes.post('/subscriptions/freeze', async (c) => {
  const body = await c.req.json();
  const userId = body.userId || body.user_id;
  const isFrozenInput = body.is_frozen !== undefined ? body.is_frozen : body.freeze;

  if (!userId) {
    return c.json({ sukses: false, pesan: 'User ID wajib disertakan.' }, 400);
  }

  const db = new DatabaseQueries(c.env.DB);
  const user = await db.getUserById(userId);
  if (!user) {
    return c.json({ sukses: false, pesan: 'Pengguna tidak ditemukan.' }, 404);
  }

  if (user.role === 'admin') {
    return c.json({ sukses: false, pesan: 'Akun Administrator tidak dapat dibekukan.' }, 400);
  }

  const freezeVal = (isFrozenInput === 1 || isFrozenInput === true || isFrozenInput === '1' || isFrozenInput === 'true') ? 1 : 0;
  await db.freezeUser(userId, freezeVal);

  const statusTeks = freezeVal ? 'dibekukan' : 'dibuka aksesnya';
  return c.json({
    sukses: true,
    pesan: `Akun ${user.nama_lengkap} berhasil ${statusTeks}.`,
    is_frozen: freezeVal
  });
});

/**
 * GET /api/admin/subscriptions/payments - Daftar seluruh riwayat pengiriman bukti pembayaran
 */
adminRoutes.get('/subscriptions/payments', async (c) => {
  const statusFilter = c.req.query('status'); // 'pending' | 'approved' | 'rejected'
  const db = new DatabaseQueries(c.env.DB);
  const payments = await db.getPaymentsList(statusFilter);

  return c.json({ sukses: true, payments });
});

/**
 * GET /api/admin/subscriptions/payments/:id - Ambil detail spesifik bukti bayar
 */
adminRoutes.get('/subscriptions/payments/:id', async (c) => {
  const id = c.req.param('id');
  const db = new DatabaseQueries(c.env.DB);
  const payment = await db.getPaymentById(id);

  if (!payment) {
    return c.json({ sukses: false, pesan: 'Bukti pembayaran tidak ditemukan.' }, 404);
  }

  return c.json({ sukses: true, payment });
});

/**
 * POST /api/admin/subscriptions/payments/:id/verify - Verifikasi bukti bayar (Approve / Reject)
 */
adminRoutes.post('/subscriptions/payments/:id/verify', async (c) => {
  const id = c.req.param('id');
  const session = c.get('user');
  const body = await c.req.json();
  const { status, notes } = body; // status: 'approved' | 'rejected'

  if (status !== 'approved' && status !== 'rejected') {
    return c.json({ sukses: false, pesan: 'Status verifikasi harus "approved" atau "rejected".' }, 400);
  }

  const db = new DatabaseQueries(c.env.DB);
  try {
    await db.verifyPayment(id, status, session.nama_lengkap || session.username, notes);

    const pesan = status === 'approved' 
      ? 'Pembayaran berhasil diverifikasi! Akun guru telah diaktifkan kembali dan pembekuan dibuka.'
      : 'Bukti pembayaran telah ditolak. Akun guru tetap dibekukan untuk mengunggah bukti yang sah.';

    return c.json({ sukses: true, pesan });
  } catch (err: any) {
    return c.json({ sukses: false, pesan: err.message }, 400);
  }
});

/**
 * GET & PUT /api/admin/payment-settings - Pengaturan QR Code & Nominal Langganan
 */
adminRoutes.get('/payment-settings', async (c) => {
  const db = new DatabaseQueries(c.env.DB);
  const settings = await db.getAllSettings();

  return c.json({
    sukses: true,
    settings: {
      enabled: settings['payment_feature_enabled'] !== 'false',
      amount: parseInt(settings['payment_amount'] || '50000', 10),
      qr_code: settings['payment_qr_code'] || '',
      instructions: settings['payment_instructions'] || 'Biaya langganan CMS Rp 50.000/bulan. Silakan scan QR Code di atas dan unggah bukti transfer.'
    }
  });
});

adminRoutes.put('/payment-settings', async (c) => {
  const body = await c.req.json();
  const db = new DatabaseQueries(c.env.DB);

  if (body.enabled !== undefined) {
    await db.updateSetting('payment_feature_enabled', body.enabled ? 'true' : 'false');
  }
  if (body.amount !== undefined) {
    await db.updateSetting('payment_amount', String(body.amount));
  }
  if (body.qr_code !== undefined) {
    await db.updateSetting('payment_qr_code', body.qr_code);
  }
  if (body.instructions !== undefined) {
    await db.updateSetting('payment_instructions', String(body.instructions).trim());
  }

  return c.json({ sukses: true, pesan: 'Pengaturan pembayaran berhasil disimpan!' });
});

