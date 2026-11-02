import { Hono } from 'hono';
import { DatabaseQueries } from '../db/queries';
import { authMiddleware } from '../middleware/authMiddleware';
import type { Env, UserSession } from '../types';

export const cptpRoutes = new Hono<{
  Bindings: Env;
  Variables: { user: UserSession };
}>();

cptpRoutes.use('*', authMiddleware);

/**
 * GET /api/cptp - Ambil bank data CP & TP
 */
cptpRoutes.get('/', async (c) => {
  const session = c.get('user');
  const targetUserId = (session.role === 'admin' && c.req.query('userId')) ? c.req.query('userId')! : session.id;
  const kelas = c.req.query('kelas');

  const db = new DatabaseQueries(c.env.DB);
  const items = await db.getCpTpList(targetUserId, kelas);

  return c.json({ sukses: true, items });
});

/**
 * POST /api/cptp - Tambah CP & TP baru (Bisa oleh Guru untuk kelasnya, atau oleh Admin)
 */
cptpRoutes.post('/', async (c) => {
  const session = c.get('user');
  const body = await c.req.json();
  const { nama_kelas, cp, tp, userId } = body;

  if (!nama_kelas || !cp || !tp) {
    return c.json({ sukses: false, pesan: 'Kelas, CP, dan TP wajib diisi.' }, 400);
  }

  const targetUserId = (session.role === 'admin' && userId) ? userId : session.id;
  const createdBy = session.role;

  const db = new DatabaseQueries(c.env.DB);
  const newId = await db.addCpTp(targetUserId, nama_kelas.trim(), cp.trim(), tp.trim(), createdBy);

  return c.json({ sukses: true, pesan: 'CP & TP berhasil ditambahkan!', id: newId });
});

/**
 * PUT /api/cptp/:id - Update CP & TP
 */
cptpRoutes.put('/:id', async (c) => {
  const id = parseInt(c.req.param('id'), 10);
  const body = await c.req.json();
  const { cp, tp } = body;

  if (!cp || !tp) {
    return c.json({ sukses: false, pesan: 'CP dan TP wajib diisi.' }, 400);
  }

  const db = new DatabaseQueries(c.env.DB);
  await db.updateCpTp(id, cp.trim(), tp.trim());

  return c.json({ sukses: true, pesan: 'CP & TP berhasil diperbarui!' });
});

/**
 * DELETE /api/cptp/:id - Hapus CP & TP
 */
cptpRoutes.delete('/:id', async (c) => {
  const id = parseInt(c.req.param('id'), 10);
  const db = new DatabaseQueries(c.env.DB);
  await db.deleteCpTp(id);

  return c.json({ sukses: true, pesan: 'CP & TP berhasil dihapus!' });
});

