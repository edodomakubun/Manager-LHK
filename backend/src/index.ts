import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { authRoutes } from './routes/auth';
import { adminRoutes } from './routes/admin';
import { classRoutes } from './routes/classes';
import { cptpRoutes } from './routes/cptp';
import { lhkRoutes } from './routes/lhk';
import { documentRoutes } from './routes/documents';
import { dashboardRoutes } from './routes/dashboard';
import type { Env } from './types';

const app = new Hono<{ Bindings: Env }>();

// Enable CORS untuk pengembangan lokal & deployment
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization']
}));

// Health check endpoint
app.get('/api/health', (c) => {
  return c.json({
    status: 'ok',
    app: 'CMS Manager LHK Multi-User API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Daftarkan rute-rute API
app.route('/api/auth', authRoutes);
app.route('/api/admin', adminRoutes);
app.route('/api/classes', classRoutes);
app.route('/api/cptp', cptpRoutes);
app.route('/api/lhk', lhkRoutes);
app.route('/api/documents', documentRoutes);
app.route('/api/dashboard', dashboardRoutes);

// Fallback untuk melayani frontend static assets via Cloudflare Worker Assets
app.get('*', async (c) => {
  if (c.env.ASSETS) {
    try {
      const response = await c.env.ASSETS.fetch(c.req.raw);
      if (response.status === 404 && !c.req.path.startsWith('/api/')) {
        // SPA Fallback: arahkan ke index.html jika rute client-side
        const url = new URL(c.req.url);
        url.pathname = '/index.html';
        return await c.env.ASSETS.fetch(new Request(url.toString(), c.req.raw));
      }
      return response;
    } catch (e) {
      // Fallback
    }
  }

  return c.json({
    pesan: 'Selamat datang di API CMS Manager LHK. Gunakan endpoint /api/... atau jalankan frontend.'
  });
});

export default app;

