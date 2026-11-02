-- ========================================================
-- SKEMA DATABASE CLOUDFLARE D1 (SQLITE) - CMS MANAGER LHK
-- ========================================================

-- 1. TABEL PENGGUNA (USERS)
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'guru',        -- 'admin' | 'guru'
    nama_lengkap TEXT NOT NULL,
    nip TEXT,
    pangkat_golongan TEXT,
    jabatan TEXT DEFAULT 'Guru Mata Pelajaran',
    mapel TEXT,
    nama_sekolah TEXT,
    folder_guru_id TEXT,                       -- ID Folder Utama Guru di Drive Admin
    folder_dokumentasi_id TEXT,                -- ID Sub-folder: Dokumentasi (Foto LHK)
    folder_dok_laporan_id TEXT,                -- ID Sub-folder: Dok_Laporan (Berkas PDF/DOCX Cetak)
    folder_template_id TEXT,                   -- ID Sub-folder: Template
    folder_db_id TEXT,                         -- ID Sub-folder: SpreadsheetDB
    spreadsheet_id TEXT,                       -- ID File Google Spreadsheet Guru (di folder SpreadsheetDB)
    template_doc_id TEXT,                      -- ID File Template Google Docs Guru (di folder Template)
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. TABEL KELAS YANG DIAMPU GURU (USER_CLASSES)
CREATE TABLE IF NOT EXISTS user_classes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    nama_kelas TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. TABEL CP & TP (USER_CP_TP)
CREATE TABLE IF NOT EXISTS user_cp_tp (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    nama_kelas TEXT NOT NULL,
    cp TEXT NOT NULL,
    tp TEXT NOT NULL,
    created_by TEXT DEFAULT 'user',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 4. TABEL LAPORAN HARIAN KERJA (LHK_RECORDS)
CREATE TABLE IF NOT EXISTS lhk_records (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    tanggal DATE NOT NULL,
    tanggal_teks TEXT NOT NULL,
    bulan TEXT NOT NULL,
    tahun_ajaran TEXT NOT NULL,
    cp TEXT,
    tp TEXT,
    kelas TEXT,
    non_tatap_muka TEXT,
    volume INTEGER NOT NULL DEFAULT 0,
    keterangan TEXT DEFAULT 'Terlaksana',
    foto_tm_id TEXT,
    foto_ntm1_id TEXT,
    foto_ntm2_id TEXT,
    foto_ntm3_id TEXT,
    foto_ntm4_id TEXT,
    foto_ntm5_id TEXT,
    synced_to_sheet INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_lhk_user_bulan ON lhk_records(user_id, bulan, tahun_ajaran);
CREATE INDEX IF NOT EXISTS idx_lhk_tanggal ON lhk_records(tanggal);

-- 5. TABEL ARSIP BERKAS DOKUMEN CETAK (USER_DOCUMENTS)
CREATE TABLE IF NOT EXISTS user_documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    bulan TEXT NOT NULL,
    tahun_ajaran TEXT NOT NULL,
    format TEXT NOT NULL,
    nama_file TEXT NOT NULL,
    doc_url TEXT NOT NULL,
    view_url TEXT,
    total_kegiatan INTEGER DEFAULT 0,
    generated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 6. TABEL PENGATURAN UMUM SISTEM (SYSTEM_SETTINGS)
CREATE TABLE IF NOT EXISTS system_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    description TEXT
);

-- ========================================================
-- DATA SEED AWAL (DEFAULT SETTINGS & USERS)
-- ========================================================

-- Settings default
INSERT OR IGNORE INTO system_settings (key, value, description) VALUES
('active_academic_year', '2026/2027', 'Tahun ajaran aktif saat ini'),
('master_parent_folder_id', '1r271Uodmsj9R645hC__yeG-rU15JGexr', 'Folder Master Utama LHK di Drive Admin'),
('master_template_sheet_id', '1ADGABBavrjHExqvPRUVCyz8gQXUUPIFgflPHEfiKqJk', 'Master Template Spreadsheet'),
('master_template_doc_id', '1FnlDbYxiQUGOnK8yv4527j2Q_TutNTb_9AQCfO1lOHU', 'Master Template Google Docs'),
('gas_bridge_url', '', 'URL Web App Google Apps Script Bridge'),
('gas_secret_token', 'SECRET_LHK_TOKEN_2026', 'Token Pengaman Webhook Bridge');

-- Default Superadmin: username = admin, password = admin123
INSERT OR IGNORE INTO users (
    id, username, password_hash, role, nama_lengkap, nip, pangkat_golongan, jabatan, mapel, nama_sekolah
) VALUES (
    'usr_admin',
    'admin',
    'pbkdf2:10000:c0ffee1234567890abcdef1234567890:9d3b272392fb64ed4f7a52bf34344a17af9eafc8153fc313ac39e4c7d835fbca',
    'admin',
    'Administrator Utama',
    '198001012005011001',
    'Pembina / IV a',
    'Kepala Sekolah / Admin',
    'Manajemen',
    'SMA / SMK Negeri'
);

-- Default Guru: username = kormasela, password = guru123
INSERT OR IGNORE INTO users (
    id, username, password_hash, role, nama_lengkap, nip, pangkat_golongan, jabatan, mapel, nama_sekolah,
    folder_guru_id, folder_dokumentasi_id, folder_dok_laporan_id, folder_template_id, folder_db_id, spreadsheet_id, template_doc_id
) VALUES (
    'usr_kormasela',
    'kormasela',
    'pbkdf2:10000:c0ffee1234567890abcdef1234567890:a79a0f494430b231b4d0477b07cd41401130e3f95b93d0270322dc6760e70e08',
    'guru',
    'M. Kormasela, S.Pd.',
    '198506122010011005',
    'Penata Muda Tk. I / III b',
    'Guru Mata Pelajaran',
    'Pendidikan Jasmani & Olahraga',
    'SMA / SMK Negeri',
    '1MTawYi7A7ldPvJCxNsqR0iGB2c-dNWUw',
    '1MTawYi7A7ldPvJCxNsqR0iGB2c-dNWUw',
    '1MTawYi7A7ldPvJCxNsqR0iGB2c-dNWUw',
    '1MTawYi7A7ldPvJCxNsqR0iGB2c-dNWUw',
    '1MTawYi7A7ldPvJCxNsqR0iGB2c-dNWUw',
    '1ADGABBavrjHExqvPRUVCyz8gQXUUPIFgflPHEfiKqJk',
    '1FnlDbYxiQUGOnK8yv4527j2Q_TutNTb_9AQCfO1lOHU'
);

-- Kelas yang diampu M. Kormasela
INSERT OR IGNORE INTO user_classes (user_id, nama_kelas) VALUES
('usr_kormasela', 'Kelas IV'),
('usr_kormasela', 'Kelas V'),
('usr_kormasela', 'Kelas VI');

-- Bank CP & TP awal M. Kormasela
INSERT OR IGNORE INTO user_cp_tp (user_id, nama_kelas, cp, tp, created_by) VALUES
('usr_kormasela', 'Kelas IV', 'Menganalisis variasi pola gerak dasar lokomotor dan non-lokomotor', 'Siswa mampu mempraktikkan kombinasi gerak jalan dan lari secara terkoordinasi', 'admin'),
('usr_kormasela', 'Kelas IV', 'Mempraktikkan gerak dasar manipulatif pada permainan bola kecil', 'Siswa mampu melakukan lempar tangkap bola secara berpasangan dengan akurat', 'user'),
('usr_kormasela', 'Kelas V', 'Menjelaskan konsep kebugaran jasmani dan daya tahan jantung', 'Siswa mampu melakukan tes lari bolak-balik untuk mengukur daya tahan', 'user');
