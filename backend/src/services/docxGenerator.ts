import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import type { Env, UserRecord, LhkRecord } from '../types';

interface FetchedImage {
  relId: string;
  docPrId: number;
  widthEmus: number;
  heightEmus: number;
}

export class DocxGeneratorService {
  /**
   * Helper untuk mengunduh foto dari Google Drive ID dengan timeout
   */
  private static async fetchDrivePhoto(photoId: string): Promise<ArrayBuffer | null> {
    if (!photoId || photoId.trim() === '') return null;
    const cleanId = photoId.trim();

    const candidateUrls = [
      `https://lh3.googleusercontent.com/d/${cleanId}`,
      `https://drive.google.com/thumbnail?id=${cleanId}&sz=w800`,
      `https://drive.usercontent.google.com/download?id=${cleanId}`
    ];

    for (const url of candidateUrls) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);

        const res = await fetch(url, {
          signal: controller.signal,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });
        clearTimeout(timeoutId);

        if (res.ok) {
          const buf = await res.arrayBuffer();
          if (buf.byteLength > 500) {
            return buf;
          }
        }
      } catch (_) {
        // Coba url alternatif berikutnya
      }
    }
    return null;
  }

  /**
   * Format teks Non Tatap Muka agar diawali tanda strip (-) per baris kegiatan
   */
  private static formatNonTatapMuka(raw?: string): string {
    if (!raw || raw.trim() === '' || raw.trim() === '-') return '-';
    const lines = raw.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    if (lines.length === 0) return '-';
    return lines.map(l => (l.startsWith('-') ? l : `- ${l}`)).join('\n');
  }

  /**
   * Menghasilkan berkas .docx LHK berdasarkan template dari Cloudflare R2
   */
  static async generate(
    env: Env,
    user: UserRecord,
    bulan: string,
    tahunAjaran: string,
    records: LhkRecord[]
  ): Promise<Uint8Array> {
    // 1. Ambil template .docx dari Cloudflare R2
    let templateBytes: ArrayBuffer | null = null;

    // Prioritas 1: Template khusus guru jika diatur oleh Admin
    if (user.custom_template_r2_key) {
      const customObj = await env.STORAGE.get(user.custom_template_r2_key);
      if (customObj) {
        templateBytes = await customObj.arrayBuffer();
      }
    }

    // Prioritas 2: Template master default di R2
    if (!templateBytes) {
      const settingObj = await env.DB.prepare(
        "SELECT value FROM system_settings WHERE key = 'r2_master_template_key'"
      ).first<{ value: string }>();
      const masterKey = settingObj?.value || 'templates/master_template_lhk.docx';

      const masterObj = await env.STORAGE.get(masterKey);
      if (masterObj) {
        templateBytes = await masterObj.arrayBuffer();
      }
    }

    if (!templateBytes) {
      throw new Error(
        'Template DOCX LHK tidak ditemukan di Cloudflare R2. Pastikan Admin telah mengunggah template master di Pengaturan.'
      );
    }

    const zip = new PizZip(templateBytes);
    let xml = zip.file('word/document.xml')?.asText();
    if (!xml) {
      throw new Error('Berkas template DOCX tidak valid (word/document.xml tidak ditemukan).');
    }

    // Persiapan rels untuk menyematkan gambar ke media/
    let relsXml = zip.file('word/_rels/document.xml.rels')?.asText() || '';
    let maxRId = 100;
    const rIdMatches = relsXml.match(/Id="rId(\d+)"/g);
    if (rIdMatches) {
      rIdMatches.forEach(m => {
        const num = parseInt(m.match(/\d+/)![0], 10);
        if (num > maxRId) maxRId = num;
      });
    }

    // Urutkan agenda secara kronologis
    const sortedRecords = [...records].sort((a, b) => {
      const tA = new Date(a.tanggal).getTime() || 0;
      const tB = new Date(b.tanggal).getTime() || 0;
      return tA - tB;
    });

    // Tentukan tanggal cetak
    const tglTerakhir = sortedRecords.length > 0 ? (sortedRecords[sortedRecords.length - 1].tanggal_teks || sortedRecords[sortedRecords.length - 1].tanggal) : '';
    const tanggalCetak = tglTerakhir || new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    // 2. Unduh foto untuk seluruh baris kegiatan secara paralel
    const recordPhotosMap = new Map<string, FetchedImage[]>();

    for (let i = 0; i < sortedRecords.length; i++) {
      const rec = sortedRecords[i];
      const rawFotoIds = [
        rec.foto_tm_id,
        rec.foto_ntm1_id,
        rec.foto_ntm2_id,
        rec.foto_ntm3_id,
        rec.foto_ntm4_id,
        rec.foto_ntm5_id
      ].filter((id): id is string => !!id && id.trim() !== '');

      const fetchedForRec: FetchedImage[] = [];

      // Unduh foto-foto dalam baris ini
      const downloadPromises = rawFotoIds.map(async (fId) => {
        return await this.fetchDrivePhoto(fId);
      });

      const photoBuffers = await Promise.all(downloadPromises);

      for (let pIdx = 0; pIdx < photoBuffers.length; pIdx++) {
        const pBuf = photoBuffers[pIdx];
        if (pBuf) {
          maxRId++;
          const relId = `rIdImg${maxRId}`;
          const mediaName = `img_lhk_${Date.now()}_${maxRId}.jpg`;

          zip.file(`word/media/${mediaName}`, pBuf);

          const newRel = `<Relationship Id="${relId}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/${mediaName}"/>`;
          relsXml = relsXml.replace('</Relationships>', `${newRel}</Relationships>`);

          // Lebar kolom dokumentasi sekitar 3.6 cm = 1.300.000 EMUs
          fetchedForRec.push({
            relId,
            docPrId: maxRId,
            widthEmus: 1300000,
            heightEmus: 975000
          });
        }
      }

      recordPhotosMap.set(rec.id, fetchedForRec);
    }

    if (relsXml) {
      zip.file('word/_rels/document.xml.rels', relsXml);
    }

    // 3. Duplikasi baris tabel agenda (<w:tr>)
    const trMarker = xml.indexOf('Non_Tatap_Muka') !== -1 ? 'Non_Tatap_Muka' : (xml.indexOf('&lt;&lt;Tanggal&gt;&gt;') !== -1 ? '&lt;&lt;Tanggal&gt;&gt;' : '');

    if (trMarker) {
      const trIdx = xml.indexOf(trMarker);
      const trStart = xml.lastIndexOf('<w:tr ', trIdx);
      const trEnd = xml.indexOf('</w:tr>', trIdx) + 7;

      if (trStart !== -1 && trEnd > trStart) {
        const templateTr = xml.substring(trStart, trEnd);
        let generatedRows = '';

        function setCellText(tcXml: string, text: string): string {
          const tcPrMatch = tcXml.match(/<w:tcPr>[\s\S]*?<\/w:tcPr>/);
          const tcPr = tcPrMatch ? tcPrMatch[0] : '';
          const pPr = '<w:pPr><w:spacing w:after="0" w:line="240" w:lineRule="auto"/></w:pPr>';
          const rPr = '<w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/></w:rPr>';

          const lines = String(text || '').split('\n');
          const paragraphs = lines.map(line => {
            const safeText = line
              .replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;');
            return '<w:p>' + pPr + '<w:r>' + rPr + '<w:t xml:space="preserve">' + safeText + '</w:t></w:r></w:p>';
          }).join('');

          return '<w:tc>' + tcPr + paragraphs + '</w:tc>';
        }

        function setCellImages(tcXml: string, photos: FetchedImage[]): string {
          const tcPrMatch = tcXml.match(/<w:tcPr>[\s\S]*?<\/w:tcPr>/);
          const tcPr = tcPrMatch ? tcPrMatch[0] : '';

          if (!photos || photos.length === 0) {
            return setCellText(tcXml, '-');
          }

          const paragraphs = photos.map(img => {
            return `<w:p><w:pPr><w:jc w:val="center"/><w:spacing w:before="60" w:after="60"/></w:pPr><w:r><w:drawing><wp:inline distT="0" distB="0" distL="0" distR="0"><wp:extent cx="${img.widthEmus}" cy="${img.heightEmus}"/><wp:effectExtent l="0" t="0" r="0" b="0"/><wp:docPr id="${img.docPrId}" name="Picture ${img.docPrId}"/><wp:cNvGraphicFramePr><a:graphicFrameLocks xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" noChangeAspect="1"/></wp:cNvGraphicFramePr><a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:nvPicPr><pic:cNvPr id="${img.docPrId}" name="Picture ${img.docPrId}"/><pic:cNvPicPr/></pic:nvPicPr><pic:blipFill><a:blip r:embed="${img.relId}" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill><pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="${img.widthEmus}" cy="${img.heightEmus}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr></pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r></w:p>`;
          }).join('');

          return '<w:tc>' + tcPr + paragraphs + '</w:tc>';
        }

        sortedRecords.forEach((rec, idx) => {
          let row = templateTr;
          const cells = row.match(/<w:tc[\s\S]*?<\/w:tc>/g);

          if (cells && cells.length >= 7) {
            // Teks materi CP & TP
            const cpTpKelas = [
              rec.cp ? `CP: ${rec.cp}` : '',
              rec.tp ? `TP: ${rec.tp}` : '',
              rec.kelas ? `Kelas: ${rec.kelas}` : ''
            ].filter(Boolean).join('\n') || '-';

            // Ambil gambar foto yang telah diunduh
            const photos = recordPhotosMap.get(rec.id) || [];

            // Format Non Tatap Muka dengan tanda strip (-)
            const formattedNtm = this.formatNonTatapMuka(rec.non_tatap_muka);

            const newCells = [
              setCellText(cells[0], String(idx + 1)),
              setCellText(cells[1], rec.tanggal_teks || rec.tanggal),
              setCellText(cells[2], cpTpKelas),
              setCellText(cells[3], formattedNtm),
              setCellImages(cells[4], photos),
              setCellText(cells[5], String(rec.volume || 0)),
              setCellText(cells[6], rec.keterangan || 'Terlaksana')
            ];

            let newRow = row;
            cells.forEach((oldCell, i) => {
              newRow = newRow.replace(oldCell, newCells[i]);
            });
            generatedRows += newRow;
          }
        });

        xml = xml.substring(0, trStart) + generatedRows + xml.substring(trEnd);
        zip.file('word/document.xml', xml);
      }
    }

    // 4. Render Docxtemplater untuk Header, Identitas Guru, dan Tanda Tangan
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
      delimiters: { start: '<<', end: '>>' }
    });

    doc.render({
      Nama_Guru: user.nama_lengkap || '',
      NIP_Guru: user.nip || '',
      Bulan: bulan || '',
      Tahun_Ajaran: tahunAjaran || '',
      Tanggal_Cetak: tanggalCetak || '',
      Mapel: user.mapel || '',
      Sekolah: user.nama_sekolah || '',
      Pangkat: user.pangkat_golongan || '',
      NIP: user.nip || ''
    });

    const outBuf = doc.getZip().generate({
      type: 'uint8array',
      compression: 'DEFLATE'
    });

    return outBuf;
  }
}
