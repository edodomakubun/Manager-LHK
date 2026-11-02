import { createMiddleware } from 'hono/factory';
import { verifyToken } from '../utils/crypto';
import type { Env, UserSession } from '../types';

export const authMiddleware = createMiddleware<{
  Bindings: Env;
  Variables: { user: UserSession };
}>(async (c, next) => {
  const authHeader = c.req.header('Authorization');
  let token = '';

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else {
    // Coba baca dari cookie jika ada
    const cookieHeader = c.req.header('Cookie') || '';
    const match = cookieHeader.match(/lhk_auth_token=([^;]+)/);
    if (match) {
      token = match[1];
    }
  }

  if (!token) {
    return c.json({ sukses: false, pesan: 'Akses ditolak: Token autentikasi tidak ditemukan.' }, 401);
  }

  const secret = c.env.JWT_SECRET || 'LHK_SUPER_SECRET_JWT_KEY_2026_CHANGEME';
  const user = await verifyToken(token, secret);

  if (!user) {
    return c.json({ sukses: false, pesan: 'Sesi login telah kedaluwarsa atau tidak valid. Silakan login kembali.' }, 401);
  }

  c.set('user', user);
  await next();
});

export const requireAdmin = createMiddleware<{
  Bindings: Env;
  Variables: { user: UserSession };
}>(async (c, next) => {
  const user = c.get('user');
  if (!user || user.role !== 'admin') {
    return c.json({ sukses: false, pesan: 'Akses ditolak: Menu ini hanya untuk Administrator.' }, 403);
  }
  await next();
});

