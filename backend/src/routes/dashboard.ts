import { Hono } from 'hono';
import { DatabaseQueries } from '../db/queries';
import { authMiddleware } from '../middleware/authMiddleware';
import type { Env, UserSession } from '../types';

export const dashboardRoutes = new Hono<{
  Bindings: Env;
  Variables: { user: UserSession };
}>();

dashboardRoutes.use('*', authMiddleware);

/**
 * GET /api/dashboard/metrics - Ringkasan metrik dashboard akun guru
 */
dashboardRoutes.get('/metrics', async (c) => {
  const session = c.get('user');
  const db = new DatabaseQueries(c.env.DB);

  const settings = await db.getAllSettings();
  const activeYear = settings['active_academic_year'] || '2026/2027';
  const whatsappGroupUrl = settings['whatsapp_group_url'] || '';

  // Dapatkan bulan saat ini dalam Bahasa Indonesia
  const namaBulanArr = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  const bulanIni = namaBulanArr[new Date().getMonth()];

  const metrics = await db.getTeacherDashboardMetrics(session.id, bulanIni, activeYear);

  return c.json({
    sukses: true,
    bulanIni,
    tahunAjaranAktif: activeYear,
    whatsappGroupUrl,
    metrics
  });
});

