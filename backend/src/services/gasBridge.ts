import type { Env } from '../types';

interface GasResponse {
  sukses: boolean;
  pesan?: string;
  [key: string]: any;
}

/**
 * Service untuk berkomunikasi dengan Google Apps Script Webhook
 */
export class GasBridgeService {
  private bridgeUrl: string;
  private secretToken: string;

  constructor(bridgeUrl: string, secretToken: string) {
    this.bridgeUrl = bridgeUrl;
    this.secretToken = secretToken;
  }

  static async create(env: Env): Promise<GasBridgeService> {
    const urlSetting = await env.DB.prepare("SELECT value FROM system_settings WHERE key = 'gas_bridge_url'").first<{ value: string }>();
    const tokenSetting = await env.DB.prepare("SELECT value FROM system_settings WHERE key = 'gas_secret_token'").first<{ value: string }>();

    const url = (urlSetting && urlSetting.value) ? urlSetting.value.trim() : '';
    const token = (tokenSetting && tokenSetting.value) ? tokenSetting.value.trim() : 'SECRET_LHK_TOKEN_2026';

    return new GasBridgeService(url, token);
  }

  isConfigured(): boolean {
    return !!(this.bridgeUrl && this.bridgeUrl.startsWith('https://script.google.com/'));
  }

  /**
   * 1. Otomasi Inisialisasi Folder Guru & 4 Sub-Folder
   */
  async initGuruDrive(params: {
    masterParentFolderId: string;
    masterTemplateSheetId: string;
    masterTemplateDocId: string;
    namaGuru: string;
    nip?: string;
  }): Promise<GasResponse> {
    if (!this.isConfigured()) {
      return {
        sukses: true,
        pesan: 'Mode Simulasi: URL Google Apps Script belum dikonfigurasi. Folder virtual digunakan.',
        folderGuruId: 'SIMULASI_FOLDER_' + Date.now(),
        folderGuruUrl: 'https://drive.google.com/drive/folders/simulation',
        folderDokumentasiId: 'SIMULASI_FOTO_' + Date.now(),
        folderDokLaporanId: 'SIMULASI_LAPORAN_' + Date.now(),
        folderTemplateId: 'SIMULASI_TEMPLATE_' + Date.now(),
        folderDbId: 'SIMULASI_DB_' + Date.now(),
        spreadsheetId: 'SIMULASI_SHEET_' + Date.now(),
        spreadsheetUrl: 'https://docs.google.com/spreadsheets/d/simulation',
        templateDocId: 'SIMULASI_DOC_' + Date.now(),
        templateDocUrl: 'https://docs.google.com/document/d/simulation'
      };
    }

    return await this.callGas('init_guru_drive', params);
  }

  /**
   * 2. Simpan Foto ke 'Dokumentasi' & Data Baris ke 'SpreadsheetDB'
   */
  async uploadFotoDanSimpan(params: {
    folderDokumentasiId: string;
    spreadsheetId: string;
    fotoArr: Array<{ base64?: string; tipe?: string; nama?: string; existingId?: string }>;
    id: string;
    tanggal: string;
    tanggalTeks?: string;
    bulan: string;
    tahunAjaran: string;
    cp?: string;
    tp?: string;
    kelas?: string;
    nonTatapMuka?: string;
    volume: number | string;
    keterangan?: string;
  }): Promise<GasResponse> {
    if (!this.isConfigured()) {
      // Simulasi ID Foto jika belum setup URL GAS
      const fotoIds = params.fotoArr.map((f, i) => f.existingId || (f.base64 ? `SIMULASI_IMG_${Date.now()}_${i+1}` : ''));
      while (fotoIds.length < 6) fotoIds.push('');
      return {
        sukses: true,
        pesan: 'Mode Simulasi: Foto dan baris spreadsheet dicatat secara lokal.',
        fotoIds
      };
    }

    return await this.callGas('upload_foto_dan_simpan', params);
  }

  /**
   * 3. Buat Laporan Bulanan (PDF/DOCX) ke 'Dok_Laporan'
   */
  async buatLaporanBulanan(params: {
    templateDocId: string;
    folderDokLaporanId: string;
    bulan: string;
    tahunAjaran: string;
    format: 'pdf' | 'docx';
    records: any[];
    guru: {
      nama_lengkap: string;
      nip?: string;
      pangkat_golongan?: string;
      mapel?: string;
      nama_sekolah?: string;
    };
  }): Promise<GasResponse> {
    if (!this.isConfigured()) {
      const format = params.format || 'pdf';
      const namaFile = `Simulasi_Laporan_${params.guru.nama_lengkap}_${params.bulan}.${format}`;
      return {
        sukses: true,
        format,
        namaFile,
        url: 'https://docs.google.com/document/d/simulation/export?format=' + format,
        viewUrl: 'https://docs.google.com/document/d/simulation/view',
        totalKegiatan: params.records.length,
        pesan: 'Mode Simulasi: Berkas laporan berhasil digenerate!'
      };
    }

    return await this.callGas('buat_laporan_bulanan', params);
  }

  /**
   * 4. Hapus Baris di SpreadsheetDB & Hapus File Foto di Google Drive
   */
  async hapusLhk(params: {
    spreadsheetId?: string;
    lhkId: string;
    fotoIds?: string[];
  }): Promise<GasResponse> {
    if (!this.isConfigured()) {
      return {
        sukses: true,
        pesan: 'Mode Simulasi: Data agenda simulasi dihapus.'
      };
    }

    return await this.callGas('hapus_lhk', params);
  }

  /**
   * 5. Update Baris di SpreadsheetDB & Ganti Foto di Google Drive (Hapus Foto Lama)
   */
  async updateLhk(params: {
    id: string;
    spreadsheetId: string;
    folderDokumentasiId: string;
    tanggal: string;
    tanggalTeks?: string;
    bulan: string;
    tahunAjaran: string;
    cp?: string;
    tp?: string;
    kelas?: string;
    nonTatapMuka?: string;
    volume: number | string;
    keterangan?: string;
    fotoArr: Array<{ base64?: string; tipe?: string; nama?: string; oldId?: string; existingId?: string } | null>;
  }): Promise<GasResponse> {
    if (!this.isConfigured()) {
      return {
        sukses: true,
        pesan: 'Mode Simulasi: Data agenda dan foto diperbarui.',
        fotoIds: params.fotoArr.map((f, i) => f?.existingId || `SIMULASI_UPDATED_IMG_${Date.now()}_${i}`)
      };
    }

    return await this.callGas('update_lhk', params);
  }

  /**
   * 6. Simpan Berkas DOCX Base64 ke Google Drive (Dok_Laporan)
   */
  async simpanDocxKeDrive(params: {
    folderDokLaporanId: string;
    namaFile: string;
    docxBase64: string;
  }): Promise<GasResponse> {
    if (!this.isConfigured()) {
      return {
        sukses: true,
        format: 'docx',
        namaFile: params.namaFile,
        url: 'https://docs.google.com/document/d/simulation/export?format=docx',
        viewUrl: 'https://docs.google.com/document/d/simulation/view',
        pesan: 'Mode Simulasi: DOCX berhasil disimpan ke Google Drive!'
      };
    }

    return await this.callGas('simpan_docx_ke_drive', params);
  }

  /**
   * Helper internal untuk memanggil Apps Script doPost
   */
  private async callGas(action: string, data: any): Promise<GasResponse> {
    try {
      const response = await fetch(this.bridgeUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          secretToken: this.secretToken,
          data
        })
      });

      if (!response.ok) {
        throw new Error(`Google Apps Script merespons dengan HTTP ${response.status}`);
      }

      const json = await response.json<GasResponse>();
      return json;
    } catch (err: any) {
      return {
        sukses: false,
        pesan: 'Gagal menghubungi Google Apps Script: ' + (err.message || String(err))
      };
    }
  }
}

