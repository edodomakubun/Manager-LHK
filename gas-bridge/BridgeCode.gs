/**
 * ==============================================================================
 * 🌉 GOOGLE APPS SCRIPT BRIDGE - CMS MANAGER LHK MULTI-USER
 * ==============================================================================
 * Script ini berjalan di akun Google (Email) Admin sebagai Microservice Webhook.
 * Menangani:
 * 1. Otomasi pembuatan Folder Guru beserta 4 Sub-Folder:
 *    [Dokumentasi], [Dok_Laporan], [Template], [SpreadsheetDB]
 * 2. Kloning Master Spreadsheet DB & Master Google Docs Template per guru.
 * 3. Penyimpanan foto dokumentasi harian ke folder [Dokumentasi].
 * 4. Sinkronisasi data agenda LHK harian ke Spreadsheet di [SpreadsheetDB].
 * 5. Pengisian template Google Docs dan pembuatan berkas laporan (PDF/Word)
 *    ke folder [Dok_Laporan].
 * ==============================================================================
 */

// Token keamanan rahasia yang sama dengan yang dikonfigurasi di Cloudflare Workers
const BRIDGE_SECRET_TOKEN = 'SECRET_LHK_TOKEN_2026';

// Zona Waktu Aplikasi
const TIMEZONE = 'Asia/Jayapura';

/**
 * Handle HTTP GET (Healthcheck & Info)
 */
function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: "ok",
    service: "LHK Google Drive & Docs Bridge",
    timestamp: new Date().toISOString()
  })).setMimeType(ContentService.MimeType.JSON);
}

/**
 * Handle HTTP POST (Main Webhook Entrypoint)
 */
function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return responseJson({ sukses: false, pesan: "Data payload kosong." });
    }

    const payload = JSON.parse(e.postData.contents);

    // 1. Validasi Token Keamanan
    if (payload.secretToken !== BRIDGE_SECRET_TOKEN) {
      return responseJson({ sukses: false, pesan: "Unauthorized: Token rahasia tidak valid." });
    }

    const action = payload.action;

    // 2. Routing Aksi
    switch (action) {
      case 'init_guru_drive':
        return responseJson(handleInitGuruDrive(payload.data));

      case 'upload_foto_dan_simpan':
        return responseJson(handleUploadDanSimpanLhk(payload.data));

      case 'buat_laporan_bulanan':
        return responseJson(handleBuatLaporanBulanan(payload.data));

      default:
        return responseJson({ sukses: false, pesan: "Aksi tidak dikenali: " + action });
    }

  } catch (err) {
    return responseJson({ sukses: false, pesan: "Internal Bridge Error: " + err.message });
  }
}

/**
 * Helper kirim balasan JSON
 */
function responseJson(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// ==============================================================================
// 1. OTOMASI PEMBUATAN FOLDER GURU & 4 SUB-FOLDER (ONE-CLICK PROVISIONING)
// ==============================================================================
function handleInitGuruDrive(data) {
  try {
    const masterParentFolderId = data.masterParentFolderId;
    const masterTemplateSheetId = data.masterTemplateSheetId;
    const masterTemplateDocId = data.masterTemplateDocId;
    const namaGuru = data.namaGuru || "Guru";
    const nip = data.nip || "";

    const parentFolder = DriveApp.getFolderById(masterParentFolderId);

    // 1. Buat Folder Utama Guru
    const namaFolderGuru = "LHK - " + namaGuru + (nip ? " (" + nip + ")" : "");
    const folderGuru = parentFolder.createFolder(namaFolderGuru);

    // 2. Buat 4 Sub-Folder Berstandar
    const folderDokumentasi = folderGuru.createFolder("Dokumentasi");
    const folderDokLaporan = folderGuru.createFolder("Dok_Laporan");
    const folderTemplate = folderGuru.createFolder("Template");
    const folderSpreadsheetDB = folderGuru.createFolder("SpreadsheetDB");

    // Atur izin baca publik untuk tautan berkas
    folderDokumentasi.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    folderDokLaporan.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    // 3. Kloning Master Spreadsheet ke dalam sub-folder "SpreadsheetDB"
    let sheetId = "";
    let sheetUrl = "";
    if (masterTemplateSheetId) {
      const masterSheet = DriveApp.getFileById(masterTemplateSheetId);
      const sheetGuru = masterSheet.makeCopy("Database LHK - " + namaGuru, folderSpreadsheetDB);
      sheetGuru.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      sheetId = sheetGuru.getId();
      sheetUrl = sheetGuru.getUrl();
    }

    // 4. Kloning Master Template Google Docs ke dalam sub-folder "Template"
    let docId = "";
    let docUrl = "";
    if (masterTemplateDocId) {
      const masterDoc = DriveApp.getFileById(masterTemplateDocId);
      const docGuru = masterDoc.makeCopy("Template Dokumen - " + namaGuru, folderTemplate);
      docGuru.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      docId = docGuru.getId();
      docUrl = docGuru.getUrl();
    }

    return {
      sukses: true,
      pesan: "Struktur Google Drive berhasil diinisialisasi!",
      folderGuruId: folderGuru.getId(),
      folderGuruUrl: folderGuru.getUrl(),
      folderDokumentasiId: folderDokumentasi.getId(),
      folderDokLaporanId: folderDokLaporan.getId(),
      folderTemplateId: folderTemplate.getId(),
      folderDbId: folderSpreadsheetDB.getId(),
      spreadsheetId: sheetId,
      spreadsheetUrl: sheetUrl,
      templateDocId: docId,
      templateDocUrl: docUrl
    };
  } catch (err) {
    return { sukses: false, pesan: "Gagal inisialisasi folder guru: " + err.message };
  }
}

// ==============================================================================
// 2. SIMPAN FOTO KE 'DOKUMENTASI' & DATA BARIS KE 'SPREADSHEETDB'
// ==============================================================================
function handleUploadDanSimpanLhk(data) {
  try {
    const folderDokumentasiId = data.folderDokumentasiId;
    const spreadsheetId = data.spreadsheetId;
    const fotoArr = data.fotoArr || [];

    const idFotoList = ["", "", "", "", "", ""];

    // 1. Simpan foto ke folder "Dokumentasi" milik guru
    if (folderDokumentasiId && Array.isArray(fotoArr)) {
      const folder = DriveApp.getFolderById(folderDokumentasiId);
      for (let i = 0; i < 6; i++) {
        if (fotoArr[i] && fotoArr[i].base64) {
          const fData = fotoArr[i];
          const blob = Utilities.newBlob(Utilities.base64Decode(fData.base64), fData.tipe || "image/jpeg", fData.nama || `foto_${i+1}.jpg`);
          const file = folder.createFile(blob);
          file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
          idFotoList[i] = file.getId();
        } else if (fotoArr[i] && fotoArr[i].existingId) {
          idFotoList[i] = fotoArr[i].existingId;
        }
      }
    }

    // 2. Simpan baris baru ke Google Spreadsheet di folder "SpreadsheetDB"
    if (spreadsheetId) {
      try {
        const ss = SpreadsheetApp.openById(spreadsheetId);
        const sheet = ss.getSheets()[0];

        // Format tanggal Indonesia
        let tglFormat = data.tanggalTeks || data.tanggal;
        if (!tglFormat && data.tanggal) {
          const bagianTgl = data.tanggal.split('-');
          const tglObj = new Date(parseInt(bagianTgl[0]), parseInt(bagianTgl[1]) - 1, parseInt(bagianTgl[2]));
          const hArr = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
          const mArr = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
          tglFormat = `${hArr[tglObj.getDay()]}, ${bagianTgl[2]} ${mArr[tglObj.getMonth()]} ${bagianTgl[0]}`;
        }

        const barisBaru = [
          data.id,
          tglFormat,
          data.bulan,
          data.tahunAjaran,
          data.cp || "",
          data.tp || "",
          data.kelas || "",
          data.nonTatapMuka || "",
          idFotoList[0], idFotoList[1], idFotoList[2], idFotoList[3], idFotoList[4], idFotoList[5],
          data.volume || "0",
          data.keterangan || "Terlaksana"
        ];

        sheet.appendRow(barisBaru);
        rapikanDanUrutkanSpreadsheet(sheet);
      } catch (sheetErr) {
        Logger.log("Peringatan Sheet: " + sheetErr.message);
      }
    }

    return {
      sukses: true,
      pesan: "Foto dan data agenda berhasil disimpan ke Google Drive & Spreadsheet!",
      fotoIds: idFotoList
    };
  } catch (err) {
    return { sukses: false, pesan: "Gagal menyimpan foto/sheet: " + err.message };
  }
}

// ==============================================================================
// 3. CETAK DOKUMEN LAPORAN BULANAN KE 'DOK_LAPORAN'
// ==============================================================================
function handleBuatLaporanBulanan(data) {
  try {
    const templateDocId = data.templateDocId;
    const folderDokLaporanId = data.folderDokLaporanId;
    const bulanTarget = data.bulan;
    const tahunAjaranTarget = data.tahunAjaran;
    const formatFile = (data.format || 'pdf').toLowerCase();
    const dataLaporan = data.records || []; // Array baris laporan dari D1
    const guru = data.guru || {};

    if (!templateDocId || !folderDokLaporanId) {
      return { sukses: false, pesan: "ID Template Doc atau Folder Dok_Laporan belum diset." };
    }

    if (!dataLaporan || dataLaporan.length === 0) {
      return { sukses: false, pesan: "Tidak ada data agenda untuk periode " + bulanTarget + " (" + tahunAjaranTarget + ")" };
    }

    const folderOutput = DriveApp.getFolderById(folderDokLaporanId);

    // Urutkan data secara kronologis (tanggal awal ke akhir)
    dataLaporan.sort((a, b) => {
      const tA = ekstrakWaktuTanggal(a.tanggal || a.tanggal_teks);
      const tB = ekstrakWaktuTanggal(b.tanggal || b.tanggal_teks);
      return tA - tB;
    });

    // Kloning template Google Docs
    const thnSlug = String(tahunAjaranTarget).replace(/[\/\\]/g, '-');
    const namaDocBaru = "Laporan Agenda - " + (guru.nama_lengkap || "Guru") + " - " + bulanTarget + " " + thnSlug;

    const fileTemplate = DriveApp.getFileById(templateDocId);
    const fileBaru = fileTemplate.makeCopy(namaDocBaru, folderOutput);
    const docBaru = DocumentApp.openById(fileBaru.getId());
    const body = docBaru.getBody();

    // Tentukan tanggal cetak (mengambil tanggal agenda terakhir)
    const barisTerakhir = dataLaporan[dataLaporan.length - 1];
    const tanggalCetak = barisTerakhir.tanggal_teks || barisTerakhir.tanggal || "";

    // Ganti tag header di Google Docs
    body.replaceText("<<Tahun_Ajaran>>", String(tahunAjaranTarget || ""));
    body.replaceText("<<Bulan>>", String(bulanTarget || ""));
    body.replaceText("<<Tanggal_Cetak>>", String(tanggalCetak));
    body.replaceText("<<Nama_Guru>>", String(guru.nama_lengkap || ""));
    body.replaceText("<<NIP>>", String(guru.nip || ""));
    body.replaceText("<<Mapel>>", String(guru.mapel || ""));
    body.replaceText("<<Pangkat>>", String(guru.pangkat_golongan || ""));
    body.replaceText("<<Sekolah>>", String(guru.nama_sekolah || ""));

    // Cari tabel agenda di dokumen
    const tables = body.getTables();
    let table = null;
    for (let t = 0; t < tables.length; t++) {
      if (tables[t].getRow(0).getNumCells() >= 6) {
        table = tables[t];
        break;
      }
    }

    if (!table) throw new Error("Tabel Agenda tidak ditemukan pada template Google Docs!");

    const barisTemplate = table.getRow(1);

    for (let i = 0; i < dataLaporan.length; i++) {
      const row = dataLaporan[i];
      const barisBaru = table.appendTableRow(barisTemplate.copy());

      // Kolom 0: Nomor Urut
      barisBaru.getCell(0).setText(String(i + 1));

      // Kolom Tanggal, CP, TP, Kelas, NTM, Volume, Keterangan
      barisBaru.replaceText("<<Tanggal>>", String(row.tanggal_teks || row.tanggal));
      barisBaru.replaceText("<<CP>>", row.cp ? "CP: " + String(row.cp) : "");
      barisBaru.replaceText("<<TP>>", row.tp ? "TP: " + String(row.tp) : "");
      barisBaru.replaceText("<<Kelas>>", row.kelas ? "Kelas: " + String(row.kelas) : "");
      barisBaru.replaceText("<<Non_Tatap_Muka>>", row.non_tatap_muka ? String(row.non_tatap_muka) : "-");
      barisBaru.replaceText("<<Volume>>", row.volume ? String(row.volume) : "0");
      barisBaru.replaceText("<<Keterangan>>", row.keterangan ? String(row.keterangan) : "Terlaksana");

      // Sisipkan foto ke sel foto (kolom indeks 4)
      const selFoto = barisBaru.getCell(4);
      selFoto.setText("");

      const fotoIds = [row.foto_tm_id, row.foto_ntm1_id, row.foto_ntm2_id, row.foto_ntm3_id, row.foto_ntm4_id, row.foto_ntm5_id];
      const fotoAktif = fotoIds.filter(id => id && String(id).trim() !== "");

      let adaGambar = false;
      for (let f = 0; f < fotoAktif.length; f++) {
        const idFoto = fotoAktif[f];
        try {
          const blob = DriveApp.getFileById(idFoto).getBlob();
          if (adaGambar) selFoto.getChild(0).asParagraph().appendText(" ");
          const img = selFoto.getChild(0).asParagraph().appendInlineImage(blob);
          const rasio = img.getHeight() / img.getWidth();
          const lebarBaru = (fotoAktif.length > 3) ? 85 : 140;
          img.setWidth(lebarBaru);
          img.setHeight(lebarBaru * rasio);
          adaGambar = true;
        } catch (imgErr) {
          Logger.log("Gagal memuat foto ID: " + idFoto + " (" + imgErr.message + ")");
        }
      }

      if (!adaGambar) selFoto.setText("-");
    }

    // Hapus baris template (indeks 1)
    table.removeRow(1);
    docBaru.saveAndClose();

    // Ekspor sesuai format
    if (formatFile === 'docx') {
      fileBaru.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      const downloadDocxUrl = "https://docs.google.com/document/d/" + fileBaru.getId() + "/export?format=docx";
      return {
        sukses: true,
        format: "docx",
        url: downloadDocxUrl,
        viewUrl: fileBaru.getUrl(),
        namaFile: namaDocBaru + ".docx",
        totalKegiatan: dataLaporan.length
      };
    } else {
      const namaFilePdf = "PDF_" + namaDocBaru + ".pdf";
      const filePdf = folderOutput.createFile(docBaru.getAs('application/pdf')).setName(namaFilePdf);
      filePdf.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      return {
        sukses: true,
        format: "pdf",
        url: filePdf.getUrl(),
        viewUrl: filePdf.getUrl(),
        downloadUrl: filePdf.getDownloadUrl(),
        namaFile: namaFilePdf,
        totalKegiatan: dataLaporan.length
      };
    }

  } catch (err) {
    return { sukses: false, pesan: "Gagal membuat dokumen laporan: " + err.message };
  }
}

// ==============================================================================
// 4. HELPER PENGURUTAN TANGGAL & SPREADSHEET
// ==============================================================================
function ekstrakWaktuTanggal(val) {
  if (!val) return 0;
  if (val instanceof Date) return isNaN(val.getTime()) ? 0 : val.getTime();
  const str = String(val).trim();
  if (!str) return 0;

  const daftarBulan = [
    { nama: ["januari", "january", "jan"], idx: 0 },
    { nama: ["februari", "february", "feb"], idx: 1 },
    { nama: ["maret", "march", "mar"], idx: 2 },
    { nama: ["april", "apr"], idx: 3 },
    { nama: ["mei", "may"], idx: 4 },
    { nama: ["juni", "june", "jun"], idx: 5 },
    { nama: ["juli", "july", "jul"], idx: 6 },
    { nama: ["agustus", "august", "agu", "aug"], idx: 7 },
    { nama: ["september", "sep", "sept"], idx: 8 },
    { nama: ["oktober", "october", "okt", "oct"], idx: 9 },
    { nama: ["november", "nov"], idx: 10 },
    { nama: ["desember", "december", "des", "dec"], idx: 11 }
  ];

  const matchIndo = str.match(/(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})/);
  if (matchIndo) {
    const hari = parseInt(matchIndo[1], 10);
    const teksBulan = matchIndo[2].toLowerCase();
    const tahun = parseInt(matchIndo[3], 10);
    for (let b = 0; b < daftarBulan.length; b++) {
      if (daftarBulan[b].nama.some(n => teksBulan.startsWith(n) || n.startsWith(teksBulan))) {
        return new Date(tahun, daftarBulan[b].idx, hari).getTime();
      }
    }
  }

  const matchIso = str.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  if (matchIso) {
    return new Date(parseInt(matchIso[1], 10), parseInt(matchIso[2], 10) - 1, parseInt(matchIso[3], 10)).getTime();
  }

  const parsed = Date.parse(str);
  return isNaN(parsed) ? 0 : parsed;
}

function rapikanDanUrutkanSpreadsheet(sheet) {
  try {
    const lastRow = sheet.getLastRow();
    const lastCol = sheet.getLastColumn() || 16;
    if (lastRow <= 2) return;
    const range = sheet.getRange(2, 1, lastRow - 1, lastCol);
    const rows = range.getValues();
    rows.sort((a, b) => {
      const wA = ekstrakWaktuTanggal(a[1]);
      const wB = ekstrakWaktuTanggal(b[1]);
      return (wA !== wB) ? wA - wB : String(a[0]).localeCompare(String(b[0]));
    });
    range.setValues(rows);
  } catch (err) {
    Logger.log("Peringatan urut sheet: " + err.message);
  }
}

