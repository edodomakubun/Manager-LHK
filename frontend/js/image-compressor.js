/**
 * ========================================================
 * 📷 KOMPRESOR FOTO OTOMATIS & PENDETEKSI DUPLIKAT DI HP
 * ========================================================
 * Berjalan di browser klien (HP Guru) sebelum foto dikirim ke server.
 * Mengurangi ukuran foto dari 5MB-10MB menjadi ~300KB-600KB,
 * sangat menghemat kuota internet dan mempercepat upload.
 */

const ImageCompressor = {
  /**
   * Kompresi 1 file gambar menjadi Base64 JPEG yang ringan
   * @param {File} file - File dari input kamera / galeri
   * @param {number} maxDimension - Ukuran maksimal sisi terpanjang (default 1600px)
   * @param {number} quality - Kualitas kompresi JPEG 0.1 - 1.0 (default 0.78)
   */
  compress: function (file, maxDimension = 1600, quality = 0.78) {
    return new Promise((resolve, reject) => {
      if (!file || !file.type.startsWith('image/')) {
        return reject(new Error('File yang dipilih bukan gambar yang valid.'));
      }

      const reader = new FileReader();
      reader.onload = function (e) {
        const img = new Image();
        img.onload = async function () {
          try {
            let width = img.width;
            let height = img.height;

            // Hitung skala jika dimensi melebihi batas maksimal
            if (width > maxDimension || height > maxDimension) {
              if (width > height) {
                height = Math.round((height * maxDimension) / width);
                width = maxDimension;
              } else {
                width = Math.round((width * maxDimension) / height);
                height = maxDimension;
              }
            }

            // Gambar ke canvas
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);

            // Ekspor hasil kompresi sebagai DataURL JPEG
            const dataUrl = canvas.toDataURL('image/jpeg', quality);
            const base64Data = dataUrl.split(',')[1];

            // Hitung hash / sidik jari visual untuk deteksi duplikasi
            const hash = await ImageCompressor.calculateHash(base64Data);

            const originalKb = Math.round(file.size / 1024);
            const compressedKb = Math.round((base64Data.length * 3) / 4 / 1024);

            resolve({
              base64: base64Data,
              dataUrl: dataUrl,
              hash: hash,
              nama: file.name.replace(/\.[^/.]+$/, "") + ".jpg",
              tipe: 'image/jpeg',
              originalKb: originalKb,
              compressedKb: compressedKb
            });
          } catch (err) {
            reject(err);
          }
        };
        img.onerror = () => reject(new Error('Gagal memuat elemen gambar.'));
        img.src = e.target.result;
      };
      reader.onerror = () => reject(new Error('Gagal membaca file gambar.'));
      reader.readAsDataURL(file);
    });
  },

  /**
   * Menghasilkan hash SHA-256 sederhana dari data base64 untuk deteksi foto kembar
   */
  calculateHash: async function (base64Str) {
    try {
      const msgUint8 = new TextEncoder().encode(base64Str.substring(0, 10000) + base64Str.slice(-10000));
      const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (e) {
      // Fallback hash jika crypto.subtle gagal
      let hash = 0;
      for (let i = 0; i < base64Str.length; i += 50) {
        hash = ((hash << 5) - hash) + base64Str.charCodeAt(i);
        hash |= 0;
      }
      return String(hash);
    }
  },

  /**
   * Deteksi apakah ada foto duplikat di antara array slot foto yang diinputkan
   * @param {Array} fotoSlotArr - Array data foto [{ hash, label }, ...]
   */
  findDuplicates: function (fotoSlotArr) {
    const seen = new Map();
    const duplicates = [];

    for (let i = 0; i < fotoSlotArr.length; i++) {
      const item = fotoSlotArr[i];
      if (item && item.hash) {
        if (seen.has(item.hash)) {
          duplicates.push({
            firstIndex: seen.get(item.hash).index,
            firstLabel: seen.get(item.hash).label,
            duplicateIndex: i,
            duplicateLabel: item.label
          });
        } else {
          seen.set(item.hash, { index: i, label: item.label });
        }
      }
    }

    return duplicates;
  }
};

window.ImageCompressor = ImageCompressor;

