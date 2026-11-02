import { Hono } from 'hono';
import { DatabaseQueries } from '../db/queries';
import { verifyPassword, hashPassword, createToken } from '../utils/crypto';
import { authMiddleware } from '../middleware/authMiddleware';
import type { Env, UserSession } from '../types';

export const authRoutes = new Hono<{
  Bindings: Env;
  Variables: { user: UserSession };
}>();

/**
 * POST /api/auth/login
 */
authRoutes.post('/login', async (c) => {
  const body = await c.req.json();
  const { username, password } = body;

  if (!username || !password) {
    return c.json({ sukses: false, pesan: 'Username dan password wajib diisi.' }, 400);
  }

  const db = new DatabaseQueries(c.env.DB);
  const user = await db.getUserByUsername(username.trim());

  if (!user) {
    return c.json({ sukses: false, pesan: 'Username atau password salah.' }, 401);
  }

  const isMatch = await verifyPassword(password, user.password_hash);
  if (!isMatch) {
    return c.json({ sukses: false, pesan: 'Username atau password salah.' }, 401);
  }

  const session: UserSession = {
    id: user.id,
    username: user.username,
    role: user.role,
    nama_lengkap: user.nama_lengkap,
    nip: user.nip
  };

  const secret = c.env.JWT_SECRET || 'LHK_SUPER_SECRET_JWT_KEY_2026_CHANGEME';
  const token = await createToken(session, secret);

  const classes = await db.getClassesByUserId(user.id);

  return c.json({
    sukses: true,
    pesan: 'Login berhasil!',
    token,
    user: {
      id: user.id,
      username: user.username,
      role: user.role,
      nama_lengkap: user.nama_lengkap,
      nip: user.nip,
      pangkat_golongan: user.pangkat_golongan,
      jabatan: user.jabatan,
      mapel: user.mapel,
      nama_sekolah: user.nama_sekolah,
      classes,
      folder_guru_id: user.folder_guru_id,
      spreadsheet_id: user.spreadsheet_id,
      template_doc_id: user.template_doc_id
    }
  });
});

/**
 * GET /api/auth/me
 */
authRoutes.get('/me', authMiddleware, async (c) => {
  const session = c.get('user');
  const db = new DatabaseQueries(c.env.DB);
  const user = await db.getUserById(session.id);

  if (!user) {
    return c.json({ sukses: false, pesan: 'Pengguna tidak ditemukan.' }, 404);
  }

  const classes = await db.getClassesByUserId(user.id);

  return c.json({
    sukses: true,
    user: {
      id: user.id,
      username: user.username,
      role: user.role,
      nama_lengkap: user.nama_lengkap,
      nip: user.nip,
      pangkat_golongan: user.pangkat_golongan,
      jabatan: user.jabatan,
      mapel: user.mapel,
      nama_sekolah: user.nama_sekolah,
      classes,
      folder_guru_id: user.folder_guru_id,
      folder_dokumentasi_id: user.folder_dokumentasi_id,
      folder_dok_laporan_id: user.folder_dok_laporan_id,
      folder_template_id: user.folder_template_id,
      folder_db_id: user.folder_db_id,
      spreadsheet_id: user.spreadsheet_id,
      template_doc_id: user.template_doc_id
    }
  });
});

/**
 * POST /api/auth/change-password
 */
authRoutes.post('/change-password', authMiddleware, async (c) => {
  const session = c.get('user');
  const body = await c.req.json();
  const { oldPassword, newPassword } = body;

  if (!oldPassword || !newPassword || newPassword.length < 6) {
    return c.json({ sukses: false, pesan: 'Kata sandi baru minimal 6 karakter.' }, 400);
  }

  const db = new DatabaseQueries(c.env.DB);
  const user = await db.getUserById(session.id);
  if (!user) {
    return c.json({ sukses: false, pesan: 'Pengguna tidak ditemukan.' }, 404);
  }

  const isMatch = await verifyPassword(oldPassword, user.password_hash);
  if (!isMatch) {
    return c.json({ sukses: false, pesan: 'Kata sandi lama salah.' }, 400);
  }

  const newHash = await hashPassword(newPassword);
  await db.updateUser(user.id, { password_hash: newHash });

  return c.json({ sukses: true, pesan: 'Kata sandi berhasil diperbarui!' });
});

