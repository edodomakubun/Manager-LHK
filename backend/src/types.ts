export interface Env {
  DB: D1Database;
  JWT_SECRET: string;
  ENVIRONMENT?: string;
  ASSETS?: Fetcher;
}

export interface UserSession {
  id: string;
  username: string;
  role: 'admin' | 'guru';
  nama_lengkap: string;
  nip?: string;
}

export interface UserRecord {
  id: string;
  username: string;
  password_hash: string;
  role: 'admin' | 'guru';
  nama_lengkap: string;
  nip?: string;
  pangkat_golongan?: string;
  jabatan?: string;
  mapel?: string;
  nama_sekolah?: string;
  folder_guru_id?: string;
  folder_dokumentasi_id?: string;
  folder_dok_laporan_id?: string;
  folder_template_id?: string;
  folder_db_id?: string;
  spreadsheet_id?: string;
  template_doc_id?: string;
  foto_profil?: string;
  is_active: number;
  created_at: string;
  updated_at: string;
}

export interface LhkRecord {
  id: string;
  user_id: string;
  tanggal: string;
  tanggal_teks: string;
  bulan: string;
  tahun_ajaran: string;
  cp?: string;
  tp?: string;
  kelas?: string;
  non_tatap_muka?: string;
  volume: number;
  keterangan?: string;
  foto_tm_id?: string;
  foto_ntm1_id?: string;
  foto_ntm2_id?: string;
  foto_ntm3_id?: string;
  foto_ntm4_id?: string;
  foto_ntm5_id?: string;
  synced_to_sheet?: number;
  created_at?: string;
  updated_at?: string;
}

export interface UserDocument {
  id?: number;
  user_id: string;
  bulan: string;
  tahun_ajaran: string;
  format: 'pdf' | 'docx';
  nama_file: string;
  doc_url: string;
  view_url?: string;
  total_kegiatan: number;
  generated_at?: string;
}

