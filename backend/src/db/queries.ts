import type { UserRecord, LhkRecord, UserDocument } from '../types';

export class DatabaseQueries {
  private db: D1Database;

  constructor(db: D1Database) {
    this.db = db;
  }

  // ========================================================
  // USERS
  // ========================================================
  async getUserByUsername(username: string): Promise<UserRecord | null> {
    return await this.db.prepare('SELECT * FROM users WHERE username = ? AND is_active = 1').bind(username).first<UserRecord>();
  }

  async getUserById(id: string): Promise<UserRecord | null> {
    return await this.db.prepare('SELECT * FROM users WHERE id = ?').bind(id).first<UserRecord>();
  }

  async listUsers(roleFilter?: string): Promise<UserRecord[]> {
    if (roleFilter) {
      const res = await this.db.prepare('SELECT * FROM users WHERE role = ? ORDER BY nama_lengkap ASC').bind(roleFilter).all<UserRecord>();
      return res.results;
    }
    const res = await this.db.prepare('SELECT * FROM users ORDER BY role ASC, nama_lengkap ASC').all<UserRecord>();
    return res.results;
  }

  async createUser(user: Partial<UserRecord>): Promise<void> {
    await this.db.prepare(`
      INSERT INTO users (
        id, username, password_hash, role, nama_lengkap, nip, pangkat_golongan, jabatan, mapel, nama_sekolah,
        folder_guru_id, folder_dokumentasi_id, folder_dok_laporan_id, folder_template_id, folder_db_id,
        spreadsheet_id, template_doc_id, foto_profil, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      user.id,
      user.username,
      user.password_hash,
      user.role || 'guru',
      user.nama_lengkap,
      user.nip || '',
      user.pangkat_golongan || '',
      user.jabatan || 'Guru Mata Pelajaran',
      user.mapel || '',
      user.nama_sekolah || '',
      user.folder_guru_id || '',
      user.folder_dokumentasi_id || '',
      user.folder_dok_laporan_id || '',
      user.folder_template_id || '',
      user.folder_db_id || '',
      user.spreadsheet_id || '',
      user.template_doc_id || '',
      user.foto_profil || '',
      user.is_active !== undefined ? user.is_active : 1
    ).run();
  }

  async updateUser(id: string, data: Partial<UserRecord>): Promise<void> {
    const fields: string[] = [];
    const values: any[] = [];

    const allowed = [
      'nama_lengkap', 'nip', 'pangkat_golongan', 'jabatan', 'mapel', 'nama_sekolah',
      'folder_guru_id', 'folder_dokumentasi_id', 'folder_dok_laporan_id', 'folder_template_id', 'folder_db_id',
      'spreadsheet_id', 'template_doc_id', 'custom_template_r2_key', 'foto_profil', 'is_active', 'password_hash',
      'is_frozen', 'subscription_status', 'subscription_period'
    ];

    for (const key of allowed) {
      if ((data as any)[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push((data as any)[key]);
      }
    }

    if (fields.length === 0) return;
    fields.push("updated_at = CURRENT_TIMESTAMP");
    values.push(id);

    await this.db.prepare(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`).bind(...values).run();
  }

  async deleteUser(id: string): Promise<void> {
    await this.db.prepare('DELETE FROM users WHERE id = ?').bind(id).run();
  }

  // ========================================================
  // KELAS GURU (USER_CLASSES)
  // ========================================================
  async getClassesByUserId(userId: string): Promise<string[]> {
    const res = await this.db.prepare('SELECT nama_kelas FROM user_classes WHERE user_id = ? ORDER BY nama_kelas ASC').bind(userId).all<{ nama_kelas: string }>();
    return res.results.map(r => r.nama_kelas);
  }

  async setClassesForUser(userId: string, classes: string[]): Promise<void> {
    await this.db.prepare('DELETE FROM user_classes WHERE user_id = ?').bind(userId).run();
    for (const k of classes) {
      if (k && k.trim()) {
        await this.db.prepare('INSERT INTO user_classes (user_id, nama_kelas) VALUES (?, ?)').bind(userId, k.trim()).run();
      }
    }
  }

  // ========================================================
  // CP & TP (USER_CP_TP)
  // ========================================================
  async getCpTpList(userId: string, namaKelas?: string): Promise<any[]> {
    if (namaKelas && namaKelas !== 'Semua') {
      const res = await this.db.prepare('SELECT * FROM user_cp_tp WHERE user_id = ? AND nama_kelas = ? ORDER BY id DESC').bind(userId, namaKelas).all();
      return res.results;
    }
    const res = await this.db.prepare('SELECT * FROM user_cp_tp WHERE user_id = ? ORDER BY nama_kelas ASC, id DESC').bind(userId).all();
    return res.results;
  }

  async addCpTp(userId: string, namaKelas: string, cp: string, tp: string, createdBy: string = 'user'): Promise<number> {
    const res = await this.db.prepare('INSERT INTO user_cp_tp (user_id, nama_kelas, cp, tp, created_by) VALUES (?, ?, ?, ?, ?)').bind(userId, namaKelas, cp, tp, createdBy).run();
    return res.meta.last_row_id as number;
  }

  async updateCpTp(id: number, cp: string, tp: string): Promise<void> {
    await this.db.prepare('UPDATE user_cp_tp SET cp = ?, tp = ? WHERE id = ?').bind(cp, tp, id).run();
  }

  async deleteCpTp(id: number): Promise<void> {
    await this.db.prepare('DELETE FROM user_cp_tp WHERE id = ?').bind(id).run();
  }

  // ========================================================
  // LAPORAN LHK (LHK_RECORDS)
  // ========================================================
  async getLhkRecords(params: {
    userId?: string;
    bulan?: string;
    tahunAjaran?: string;
    kelas?: string;
    limit?: number;
    offset?: number;
  }): Promise<LhkRecord[]> {
    let query = 'SELECT * FROM lhk_records WHERE 1=1';
    const bindings: any[] = [];

    if (params.userId) {
      query += ' AND user_id = ?';
      bindings.push(params.userId);
    }
    if (params.bulan && params.bulan !== 'semua' && params.bulan !== 'terakhir') {
      query += ' AND LOWER(bulan) = LOWER(?)';
      bindings.push(params.bulan);
    }
    if (params.tahunAjaran && params.tahunAjaran !== 'semua') {
      query += ' AND tahun_ajaran = ?';
      bindings.push(params.tahunAjaran);
    }
    if (params.kelas && params.kelas !== 'semua') {
      query += ' AND kelas = ?';
      bindings.push(params.kelas);
    }

    query += ' ORDER BY tanggal DESC, id DESC';

    if (params.limit) {
      query += ' LIMIT ?';
      bindings.push(params.limit);
      if (params.offset) {
        query += ' OFFSET ?';
        bindings.push(params.offset);
      }
    }

    const res = await this.db.prepare(query).bind(...bindings).all<LhkRecord>();
    return res.results;
  }

  async getLhkById(id: string): Promise<LhkRecord | null> {
    return await this.db.prepare('SELECT * FROM lhk_records WHERE id = ?').bind(id).first<LhkRecord>();
  }

  async createLhkRecord(record: LhkRecord): Promise<void> {
    await this.db.prepare(`
      INSERT INTO lhk_records (
        id, user_id, tanggal, tanggal_teks, bulan, tahun_ajaran, cp, tp, kelas, non_tatap_muka,
        volume, keterangan, foto_tm_id, foto_ntm1_id, foto_ntm2_id, foto_ntm3_id, foto_ntm4_id, foto_ntm5_id, synced_to_sheet
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      record.id,
      record.user_id,
      record.tanggal,
      record.tanggal_teks,
      record.bulan,
      record.tahun_ajaran,
      record.cp || '',
      record.tp || '',
      record.kelas || '',
      record.non_tatap_muka || '',
      record.volume || 0,
      record.keterangan || 'Terlaksana',
      record.foto_tm_id || '',
      record.foto_ntm1_id || '',
      record.foto_ntm2_id || '',
      record.foto_ntm3_id || '',
      record.foto_ntm4_id || '',
      record.foto_ntm5_id || '',
      record.synced_to_sheet || 0
    ).run();
  }

  async updateLhkRecord(id: string, record: Partial<LhkRecord>): Promise<void> {
    const fields: string[] = [];
    const values: any[] = [];

    const allowed = [
      'tanggal', 'tanggal_teks', 'bulan', 'tahun_ajaran', 'cp', 'tp', 'kelas',
      'non_tatap_muka', 'volume', 'keterangan', 'foto_tm_id', 'foto_ntm1_id',
      'foto_ntm2_id', 'foto_ntm3_id', 'foto_ntm4_id', 'foto_ntm5_id', 'synced_to_sheet'
    ];

    for (const key of allowed) {
      if ((record as any)[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push((record as any)[key]);
      }
    }

    if (fields.length === 0) return;
    fields.push("updated_at = CURRENT_TIMESTAMP");
    values.push(id);

    await this.db.prepare(`UPDATE lhk_records SET ${fields.join(', ')} WHERE id = ?`).bind(...values).run();
  }

  async deleteLhkRecord(id: string): Promise<void> {
    await this.db.prepare('DELETE FROM lhk_records WHERE id = ?').bind(id).run();
  }

  // ========================================================
  // ARSIP DOKUMEN CETAK (USER_DOCUMENTS)
  // ========================================================
  async getUserDocuments(userId: string): Promise<UserDocument[]> {
    const res = await this.db.prepare('SELECT * FROM user_documents WHERE user_id = ? ORDER BY id DESC').bind(userId).all<UserDocument>();
    return res.results;
  }

  async saveUserDocument(doc: UserDocument): Promise<number> {
    const res = await this.db.prepare(`
      INSERT INTO user_documents (user_id, bulan, tahun_ajaran, format, nama_file, doc_url, view_url, total_kegiatan)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      doc.user_id,
      doc.bulan,
      doc.tahun_ajaran,
      doc.format,
      doc.nama_file,
      doc.doc_url,
      doc.view_url || doc.doc_url,
      doc.total_kegiatan || 0
    ).run();
    return res.meta.last_row_id as number;
  }

  async deleteUserDocument(id: number, userId?: string, role?: string): Promise<void> {
    if (role === 'admin' || !userId) {
      await this.db.prepare('DELETE FROM user_documents WHERE id = ?').bind(id).run();
    } else {
      await this.db.prepare('DELETE FROM user_documents WHERE id = ? AND user_id = ?').bind(id, userId).run();
    }
  }

  // ========================================================
  // PENGATURAN SISTEM & REKAP
  // ========================================================
  async getAllSettings(): Promise<Record<string, string>> {
    const res = await this.db.prepare('SELECT key, value FROM system_settings').all<{ key: string; value: string }>();
    const map: Record<string, string> = {};
    for (const r of res.results) {
      map[r.key] = r.value;
    }
    return map;
  }

  async updateSetting(key: string, value: string): Promise<void> {
    await this.db.prepare('INSERT INTO system_settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value').bind(key, value).run();
  }

  async getAdminRekap(bulan?: string, tahunAjaran?: string): Promise<any[]> {
    let query = `
      SELECT 
        u.id, u.nama_lengkap, u.nip, u.mapel, u.spreadsheet_id, u.folder_guru_id,
        COUNT(l.id) as total_hari,
        COALESCE(SUM(l.volume), 0) as total_volume,
        MAX(l.tanggal) as tanggal_terakhir
      FROM users u
      LEFT JOIN lhk_records l ON u.id = l.user_id
    `;
    const bindings: any[] = [];
    const conditions: string[] = [];

    if (bulan && bulan.trim() !== '' && bulan.toLowerCase() !== 'semua') {
      conditions.push('LOWER(l.bulan) = LOWER(?)');
      bindings.push(bulan.trim());
    }
    if (tahunAjaran && tahunAjaran.trim() !== '' && tahunAjaran.toLowerCase() !== 'semua') {
      conditions.push('l.tahun_ajaran = ?');
      bindings.push(tahunAjaran.trim());
    }

    if (conditions.length > 0) {
      query += ` AND ${conditions.join(' AND ')}`;
    }

    query += `
      WHERE u.role = 'guru' AND u.is_active = 1
      GROUP BY u.id
      ORDER BY u.nama_lengkap ASC
    `;

    const res = await this.db.prepare(query).bind(...bindings).all();
    return res.results;
  }

  async getTeacherDashboardMetrics(userId: string, bulan: string, tahunAjaran: string) {
    const today = new Date().toISOString().split('T')[0];
    
    // Total hari & volume bulan ini
    const stats = await this.db.prepare(`
      SELECT COUNT(id) as total_hari, COALESCE(SUM(volume), 0) as total_volume
      FROM lhk_records
      WHERE user_id = ? AND LOWER(bulan) = LOWER(?) AND tahun_ajaran = ?
    `).bind(userId, bulan, tahunAjaran).first<{ total_hari: number; total_volume: number }>();

    // Cek apakah hari ini sudah isi
    const todayRecord = await this.db.prepare(`
      SELECT id FROM lhk_records WHERE user_id = ? AND tanggal = ? LIMIT 1
    `).bind(userId, today).first();

    // Total arsip berkas
    const docsCount = await this.db.prepare(`
      SELECT COUNT(id) as total_dokumen FROM user_documents WHERE user_id = ?
    `).bind(userId).first<{ total_dokumen: number }>();

    // Total kelas diampu
    const classCount = await this.db.prepare(`
      SELECT COUNT(id) as total_kelas FROM user_classes WHERE user_id = ?
    `).bind(userId).first<{ total_kelas: number }>();

    return {
      totalHariBulanIni: stats?.total_hari || 0,
      totalVolumeBulanIni: stats?.total_volume || 0,
      sudahIsiHariIni: !!todayRecord,
      totalDokumen: docsCount?.total_dokumen || 0,
      totalKelas: classCount?.total_kelas || 0
    };
  }

  // ==========================================
  // SUBSCRIPTION & PAYMENT QUERIES
  // ==========================================

  async freezeUser(userId: string, isFrozen: number, status?: string): Promise<void> {
    const subStatus = status || (isFrozen ? 'frozen' : 'active');
    await this.db.prepare(`
      UPDATE users 
      SET is_frozen = ?, subscription_status = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `).bind(isFrozen, subStatus, userId).run();
  }

  async getSubscriptionsList(): Promise<any[]> {
    const query = `
      SELECT 
        u.id, u.username, u.nama_lengkap, u.nip, u.mapel, u.nama_sekolah, u.foto_profil,
        u.is_active, u.is_frozen, u.subscription_status, u.subscription_period,
        p.id as last_payment_id,
        p.bulan as last_payment_bulan,
        p.tahun as last_payment_tahun,
        p.nominal as last_payment_nominal,
        p.bukti_bayar as last_payment_bukti,
        p.status as last_payment_status,
        p.catatan_user as last_payment_catatan,
        p.created_at as last_payment_date
      FROM users u
      LEFT JOIN (
        SELECT sp1.*
        FROM subscription_payments sp1
        INNER JOIN (
          SELECT user_id, MAX(created_at) as max_created
          FROM subscription_payments
          GROUP BY user_id
        ) sp2 ON sp1.user_id = sp2.user_id AND sp1.created_at = sp2.max_created
      ) p ON u.id = p.user_id
      WHERE u.role = 'guru'
      ORDER BY u.is_frozen DESC, p.created_at DESC, u.nama_lengkap ASC
    `;
    const res = await this.db.prepare(query).all();
    return res.results;
  }

  async createPaymentSubmission(data: {
    id: string;
    user_id: string;
    bulan: string;
    tahun: string;
    nominal: number;
    bukti_bayar: string;
    catatan_user?: string;
  }): Promise<void> {
    await this.db.prepare(`
      INSERT INTO subscription_payments (id, user_id, bulan, tahun, nominal, bukti_bayar, catatan_user, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')
    `).bind(
      data.id,
      data.user_id,
      data.bulan,
      data.tahun,
      data.nominal,
      data.bukti_bayar,
      data.catatan_user || ''
    ).run();

    // Perbarui status langganan user menjadi pending_verification
    await this.db.prepare(`
      UPDATE users 
      SET subscription_status = 'pending_verification', updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `).bind(data.user_id).run();
  }

  async getPaymentsList(statusFilter?: string): Promise<any[]> {
    let sql = `
      SELECT 
        sp.*,
        u.nama_lengkap, u.nip, u.username, u.nama_sekolah, u.foto_profil
      FROM subscription_payments sp
      JOIN users u ON sp.user_id = u.id
    `;
    if (statusFilter) {
      sql += ` WHERE sp.status = ? ORDER BY sp.created_at DESC`;
      const res = await this.db.prepare(sql).bind(statusFilter).all();
      return res.results;
    }
    sql += ` ORDER BY sp.created_at DESC`;
    const res = await this.db.prepare(sql).all();
    return res.results;
  }

  async getPaymentById(id: string): Promise<any | null> {
    const sql = `
      SELECT 
        sp.*,
        u.nama_lengkap, u.nip, u.username, u.nama_sekolah, u.foto_profil, u.is_frozen
      FROM subscription_payments sp
      JOIN users u ON sp.user_id = u.id
      WHERE sp.id = ?
    `;
    return await this.db.prepare(sql).bind(id).first();
  }

  async verifyPayment(
    paymentId: string, 
    status: 'approved' | 'rejected', 
    adminId: string, 
    notes?: string
  ): Promise<void> {
    const payment = await this.getPaymentById(paymentId);
    if (!payment) throw new Error('Data pembayaran tidak ditemukan.');

    await this.db.prepare(`
      UPDATE subscription_payments 
      SET status = ?, catatan_admin = ?, verified_at = CURRENT_TIMESTAMP, verified_by = ?
      WHERE id = ?
    `).bind(status, notes || '', adminId, paymentId).run();

    if (status === 'approved') {
      // Buka pembekuan akun user, status menjadi active
      const periode = `${payment.bulan} ${payment.tahun}`;
      await this.db.prepare(`
        UPDATE users 
        SET is_frozen = 0, subscription_status = 'active', subscription_period = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).bind(periode, payment.user_id).run();
    } else {
      // Jika ditolak, akun tetap dibekukan atau kembali ke status frozen
      await this.db.prepare(`
        UPDATE users 
        SET is_frozen = 1, subscription_status = 'frozen', updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).bind(payment.user_id).run();
    }
  }

  async getLatestUserPayment(userId: string): Promise<any | null> {
    return await this.db.prepare(`
      SELECT * FROM subscription_payments 
      WHERE user_id = ? 
      ORDER BY created_at DESC 
      LIMIT 1
    `).bind(userId).first();
  }
}

