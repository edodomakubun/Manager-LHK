import { Hono } from 'hono';
import { DatabaseQueries } from '../db/queries';
import { authMiddleware } from '../middleware/authMiddleware';
import type { Env, UserSession } from '../types';

export const classRoutes = new Hono<{
  Bindings: Env;
  Variables: { user: UserSession };
}>();

classRoutes.use('*', authMiddleware);

/**
 * GET /api/classes - Ambil daftar kelas yang diampu
 */
classRoutes.get('/', async (c) => {
  const session = c.get('user');
  const targetUserId = (session.role === 'admin' && c.req.query('userId')) ? c.req.query('userId')! : session.id;

  const db = new DatabaseQueries(c.env.DB);
  const classes = await db.getClassesByUserId(targetUserId);

  return c.json({ sukses: true, userId: targetUserId, classes });
});

/**
 * POST /api/classes - Atur daftar kelas (Khusus Admin)
 */
classRoutes.post('/', async (c) => {
  const session = c.get('user');
  if (session.role !== 'admin') {
    return c.json({ sukses: false, pesan: 'Hanya Administrator yang dapat mengatur daftar kelas.' }, 403);
  }

  const body = await c.req.json();
  const { userId, classes } = body;

  if (!userId || !Array.isArray(classes)) {
    return c.json({ sukses: false, pesan: 'userId dan classes array wajib diisi.' }, 400);
  }

  const db = new DatabaseQueries(c.env.DB);
  await db.setClassesForUser(userId, classes);

  return c.json({ sukses: true, pesan: 'Daftar kelas berhasil diperbarui!' });
});

