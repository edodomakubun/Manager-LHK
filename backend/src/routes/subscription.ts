import { Hono } from 'hono';
import { DatabaseQueries } from '../db/queries';
import { authMiddleware } from '../middleware/authMiddleware';
import type { Env, UserSession } from '../types';

export const subscriptionRoutes = new Hono<{
  Bindings: Env;
  Variables: { user: UserSession };
}>();

subscriptionRoutes.use('*', authMiddleware);

/**
 * GET /api/subscription/status - Status langganan & informasi QR Code pembayaran guru
 */
subscriptionRoutes.get('/status', async (c) => {
  const session = c.get('user');
  const db = new DatabaseQueries(c.env.DB);

  const user = await db.getUserById(session.id);
  if (!user) {
    return c.json({ sukses: false, pesan: 'Pengguna tidak ditemukan.' }, 404);
  }

  const settings = await db.getAllSettings();
  const paymentFeatureEnabled = settings['payment_feature_enabled'] !== 'false';
  const paymentAmount = parseInt(settings['payment_amount'] || '50000', 10);
  const paymentQrCode = settings['payment_qr_code'] || '';
  const paymentInstructions = settings['payment_instructions'] || 'Biaya langganan CMS Rp 50.000/bulan. Silakan scan QR Code di atas dan unggah bukti transfer.';

  // Dapatkan bukti pembayaran terakhir yang diajukan user ini
  const lastPayment = await db.getLatestUserPayment(session.id);

  // Dapatkan bulan & tahun saat ini dalam Bahasa Indonesia
  const namaBulanArr = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  const now = new Date();
  const currentMonth = namaBulanArr[now.getMonth()];
  const currentYear = now.getFullYear().toString();

  return c.json({
    sukses: true,
    user: {
      id: user.id,
      nama_lengkap: user.nama_lengkap,
      nip: user.nip,
      is_frozen: user.is_frozen || 0,
      subscription_status: user.subscription_status || 'active',
      subscription_period: user.subscription_period || `${currentMonth} ${currentYear}`
    },
    settings: {
      enabled: paymentFeatureEnabled,
      amount: paymentAmount,
      qr_code: paymentQrCode,
      instructions: paymentInstructions
    },
    currentPeriod: {
      bulan: currentMonth,
      tahun: currentYear
    },
    lastPayment
  });
});

/**
 * POST /api/subscription/submit-payment - Kirim bukti pembayaran oleh guru
 */
subscriptionRoutes.post('/submit-payment', async (c) => {
  try {
    const session = c.get('user');
    const body = await c.req.json();
    const { bulan, tahun, nominal, bukti_bayar, catatan_user } = body;

    if (!bukti_bayar || typeof bukti_bayar !== 'string' || bukti_bayar.trim().length === 0) {
      return c.json({ sukses: false, pesan: 'Foto struk / bukti pembayaran wajib diunggah.' }, 400);
    }

    const db = new DatabaseQueries(c.env.DB);

    // Ambil pengaturan nominal aktif
    const settings = await db.getAllSettings();
    const defaultAmount = parseInt(settings['payment_amount'] || '50000', 10);
    const nominalFinal = nominal ? parseInt(nominal, 10) : defaultAmount;

    // Dapatkan bulan & tahun default jika tidak disertakan
    const namaBulanArr = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    const now = new Date();
    const bulanFinal = bulan || namaBulanArr[now.getMonth()];
    const tahunFinal = tahun || now.getFullYear().toString();

    const paymentId = 'pay_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);

    await db.createPaymentSubmission({
      id: paymentId,
      user_id: session.id,
      bulan: bulanFinal,
      tahun: tahunFinal,
      nominal: nominalFinal,
      bukti_bayar,
      catatan_user: catatan_user || ''
    });

    return c.json({
      sukses: true,
      pesan: 'Bukti pembayaran berhasil dikirim! Mohon tunggu verifikasi oleh Administrator untuk pembukaan akses.',
      paymentId
    });
  } catch (err: any) {
    console.error('Error submit payment:', err);
    return c.json({ sukses: false, pesan: err.message || 'Terjadi kesalahan pada server.' }, 500);
  }
});
