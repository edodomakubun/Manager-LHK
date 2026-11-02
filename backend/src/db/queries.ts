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
        spreadsheet_id, template_doc_id, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
      user.is_active !== undefined ? user.is_active : 1
    ).run();
  }

  async updateUser(id: string, data: Partial<UserRecord>): Promise<void> {
    const fields: string[] = [];
    const values: any[] = [];

    const allowed = [
      'nama_lengkap', 'nip', 'pangkat_golongan', 'jabatan', 'mapel', 'nama_sekolah',
      'folder_guru_id', 'folder_dokumentasi_id', 'folder_dok_laporan_id', 'folder_template_id', 'folder_db_id',
      'spreadsheet_id', 'template_doc_id', 'is_active', 'password_hash'
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

  async deleteUserDocument(id: number): Promise<void> {
    await this.db.prepare('DELETE FROM user_documents WHERE id = ?').bind(id).run();
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

  async getAdminRekap(bulan: string, tahunAjaran: string): Promise<any[]> {
    const query = `
      SELECT 
        u.id, u.nama_lengkap, u.nip, u.mapel, u.spreadsheet_id, u.folder_guru_id,
        COUNT(l.id) as total_hari,
        COALESCE(SUM(l.volume), 0) as total_volume,
        MAX(l.tanggal) as tanggal_terakhir
      FROM users u
      LEFT JOIN lhk_records l ON u.id = l.user_id 
        AND LOWER(l.bulan) = LOWER(?) 
        AND l.tahun_ajaran = ?
      WHERE u.role = 'guru' AND u.is_active = 1
      GROUP BY u.id
      ORDER BY u.nama_lengkap ASC
    `;
    const res = await this.db.prepare(query).bind(bulan, tahunAjaran).all();
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
}

