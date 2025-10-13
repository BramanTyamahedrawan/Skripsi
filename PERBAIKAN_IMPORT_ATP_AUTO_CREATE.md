# PERBAIKAN IMPORT ATP - AUTO-CREATE ELEMEN DAN ACP

## Ringkasan Perubahan

### 1. Fitur Auto-Creation yang Ditambahkan

#### Fungsi `createElemenIfNotExists(elemenName, rowData)`

- Membuat Elemen baru secara otomatis jika tidak ditemukan dalam database
- Menggunakan data master yang sudah tersedia (Tahun Ajaran, Semester, Kelas, Mapel, Konsentrasi Sekolah)
- Melakukan refresh mapping data setelah pembuatan berhasil

#### Fungsi `createACPIfNotExists(acpName, elemenId, rowData)`

- Membuat ACP baru secara otomatis jika tidak ditemukan dalam database
- Terkait dengan Elemen yang sudah ada (baik yang lama maupun yang baru dibuat)
- Menggunakan data master yang sudah tersedia
- Melakukan refresh mapping data setelah pembuatan berhasil

### 2. Modifikasi Fungsi Import (`handleImportFile`)

#### Sebelum:

- Import gagal jika Elemen atau ACP tidak ditemukan
- Menampilkan error dan skip ke data berikutnya
- Tidak ada auto-creation, hanya matching data yang sudah ada

#### Sesudah:

- **Smart Auto-Creation**: Sistem akan mencari data yang sudah ada terlebih dahulu
- **Hierarchical Creation**: Jika tidak ditemukan, sistem akan membuat secara otomatis
  1. Buat Elemen jika belum ada
  2. Buat ACP yang terkait dengan Elemen (lama/baru)
  3. Buat ATP yang terkait dengan ACP (lama/baru)
- **Validasi Ketat**: Data master (Tahun Ajaran, Semester, Kelas, Mapel, Konsentrasi) harus sudah ada
- **Error Handling**: Jika gagal membuat Elemen/ACP, akan skip dengan pesan error yang informatif

### 3. Perbaikan Mapping Data

#### Sebelum:

- Hanya mengambil Elemen dari relasi ACP
- Data Elemen tidak lengkap

#### Sesudah:

- Mengambil Elemen dari API dedicated (`getElemen()`)
- Menggabungkan data Elemen langsung + dari relasi ACP
- Menghilangkan duplikasi berdasarkan `idElemen`
- Data mapping lebih lengkap dan akurat

### 4. Dokumentasi dan UI

#### Import Modal Documentation:

- **Fitur Auto-Creation**: Menjelaskan kemampuan sistem membuat Elemen dan ACP otomatis
- **Prioritas Pencarian**: Sistem mencari data lama dulu, baru buat yang baru
- **Validasi Requirements**: Data master harus ada, Elemen dan ACP bisa dibuat otomatis
- **Relasi Otomatis**: Hierarchi Elemen → ACP → ATP dibuat secara benar

## Alur Kerja Baru

### 1. Persiapan Import

```
1. Upload file CSV/Excel
2. Parse data dan extract kolom
3. Load mapping data (refresh untuk data terbaru)
```

### 2. Per Baris Data

```
1. Validasi field wajib (namaAtp, jumlahJpl)
2. Map data master yang wajib ada:
   - Tahun Ajaran
   - Semester
   - Kelas
   - Mapel
   - Konsentrasi Sekolah
3. Skip jika data master tidak lengkap

4. Proses Elemen:
   - Cari Elemen yang sudah ada
   - Jika tidak ada: buat Elemen baru
   - Jika gagal buat: skip dengan error

5. Proses ACP:
   - Cari ACP yang sudah ada
   - Jika tidak ada: buat ACP baru (terkait Elemen)
   - Jika gagal buat: skip dengan error

6. Buat ATP:
   - Menggunakan Elemen dan ACP (lama/baru)
   - Terkait dengan data master
```

### 3. Hasil Import

```
1. Tampilkan jumlah sukses vs error
2. Detail pesan error untuk troubleshooting
3. Refresh data ATP untuk menampilkan hasil terbaru
```

## Keuntungan Perbaikan

### 1. Fleksibilitas Tinggi

- Tidak perlu membuat Elemen dan ACP secara manual sebelum import ATP
- Sistem otomatis membuat hierarchi lengkap dalam satu proses import

### 2. Konsistensi Data

- Relasi antar entitas dijamin benar
- Tidak ada data orphan atau relasi yang rusak

### 3. User Experience

- Import lebih mudah dan cepat
- Tidak perlu bolak-balik antar halaman untuk setup data
- Error handling yang informatif

### 4. Maintainability

- Kode lebih modular dengan fungsi terpisah
- Error handling yang robust
- Dokumentasi yang jelas

## Testing dan Validasi

### Skenario Test:

1. **Import dengan Elemen dan ACP yang sudah ada** ✅
2. **Import dengan Elemen baru, ACP sudah ada** ✅
3. **Import dengan Elemen sudah ada, ACP baru** ✅
4. **Import dengan Elemen dan ACP baru** ✅
5. **Import dengan data master tidak lengkap** ✅ (akan error dengan pesan jelas)
6. **Import dengan field ATP wajib kosong** ✅ (akan skip dengan pesan error)

### Error Handling:

- Gagal buat Elemen: skip dengan error detail
- Gagal buat ACP: skip dengan error detail
- Data master tidak lengkap: skip dengan daftar field yang missing
- Field ATP wajib kosong: skip dengan validasi error

## File yang Dimodifikasi

1. **`/frontend/src/views/atp/index.jsx`**:
   - Tambah import `getElemen, addElemen` dan `addACP`
   - Tambah fungsi `createElemenIfNotExists()`
   - Tambah fungsi `createACPIfNotExists()`
   - Modifikasi `fetchMappingData()` untuk include Elemen langsung
   - Overhaul `handleImportFile()` dengan auto-creation logic
   - Update dokumentasi import modal

## Kompatibilitas

- **Backward Compatible**: Import file lama tetap berfungsi
- **Forward Compatible**: Mendukung kombinasi data lama/baru
- **API Compatible**: Menggunakan API endpoint yang sudah ada
