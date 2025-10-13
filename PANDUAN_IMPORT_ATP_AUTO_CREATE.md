# PANDUAN IMPORT ATP DENGAN AUTO-CREATE

## Fitur Baru: Auto-Create Elemen dan ACP

Sistem import ATP sekarang dapat **otomatis membuat Elemen dan ACP** jika belum ada dalam database. Ini memudahkan proses import tanpa perlu membuat data hierarkis secara manual.

## Cara Kerja

### 1. **Prioritas Pencarian**

- Sistem akan mencari Elemen dan ACP yang sudah ada terlebih dahulu
- Jika ditemukan, akan menggunakan data yang sudah ada
- Jika tidak ditemukan, akan membuat data baru secara otomatis

### 2. **Hierarchi Auto-Creation**

```
1. Cek Elemen → Jika tidak ada, buat Elemen baru
2. Cek ACP → Jika tidak ada, buat ACP baru (terkait Elemen)
3. Buat ATP → Terkait dengan ACP (dan otomatis ke Elemen)
```

### 3. **Data Yang Wajib Sudah Ada**

Sebelum import, pastikan data master berikut sudah ada:

- ✅ **Tahun Ajaran** (contoh: "2025/2026")
- ✅ **Semester** (contoh: "Ganjil", "Genap")
- ✅ **Kelas** (contoh: "X", "XI", "XII")
- ✅ **Mata Pelajaran** (contoh: "Matematika", "Informatika")
- ✅ **Konsentrasi Keahlian Sekolah** (contoh: "Desain Komunikasi Visual")

### 4. **Data Yang Bisa Auto-Create**

- 🆕 **Elemen** - Akan dibuat otomatis jika tidak ada
- 🆕 **ACP (Capaian Pembelajaran)** - Akan dibuat otomatis jika tidak ada
- 🆕 **ATP (Tujuan Pembelajaran)** - Selalu dibuat dari import

## Format File Import

### Kolom Wajib dalam CSV/Excel:

```
namaAtp,jumlahJpl,tahunAjaran,namaSemester,namaKelas,namaMapel,namaElemen,namaAcp,namaKonsentrasiSekolah,idSchool
```

### Contoh Data:

```csv
namaAtp,jumlahJpl,tahunAjaran,namaSemester,namaKelas,namaMapel,namaElemen,namaAcp,namaKonsentrasiSekolah,idSchool
"Memahami konsep geometri","4","2025/2026","Ganjil","X","Matematika","Geometri","Peserta didik mampu menerapkan konsep geometri","Desain Komunikasi Visual","RWK001"
"Menguasai logika pemrograman","6","2025/2026","Genap","XI","Informatika","Pemrograman Dasar","Peserta didik dapat membuat program sederhana","Teknik Komputer dan Jaringan","RWK001"
```

## Skenario Import

### ✅ Skenario 1: Semua Data Sudah Ada

- Elemen "Geometri" sudah ada ✓
- ACP "Peserta didik mampu..." sudah ada ✓
- **Result**: ATP langsung dibuat dengan relasi ke data existing

### ✅ Skenario 2: Elemen Baru, ACP Lama

- Elemen "Trigonometri" belum ada ❌
- ACP "Peserta didik dapat..." sudah ada ✓
- **Result**:
  1. Buat Elemen "Trigonometri" baru
  2. ATP dibuat dengan relasi ke ACP lama

### ✅ Skenario 3: Elemen Lama, ACP Baru

- Elemen "Geometri" sudah ada ✓
- ACP "Peserta didik mampu menghitung luas..." belum ada ❌
- **Result**:
  1. Buat ACP baru yang terkait Elemen "Geometri"
  2. ATP dibuat dengan relasi ke ACP baru

### ✅ Skenario 4: Semua Baru (Most Common)

- Elemen "Statistika" belum ada ❌
- ACP "Peserta didik dapat menganalisis data..." belum ada ❌
- **Result**:
  1. Buat Elemen "Statistika" baru
  2. Buat ACP baru yang terkait Elemen "Statistika"
  3. ATP dibuat dengan relasi lengkap ke hierarki baru

## Error Handling

### ❌ Import Gagal Jika:

1. **Data Master Tidak Lengkap**:

   ```
   Error: "ATP 'Kongruen' gagal diimpor karena data tidak ditemukan: Tahun Ajaran, Mapel"
   ```

2. **Field Wajib Kosong**:

   ```
   Error: "Field wajib kosong: namaAtp atau jumlahJpl"
   ```

3. **Gagal Buat Elemen/ACP**:
   ```
   Error: "ATP 'Kongruen' gagal diimpor karena gagal membuat Elemen 'Geometri': [detail error]"
   ```

### ✅ Import Berhasil:

```
Success: "Import berhasil! 15 ATP berhasil ditambahkan."
Info: "Auto-created: 3 Elemen baru, 8 ACP baru"
```

## Tips Penggunaan

### 1. **Persiapan File**

- Gunakan format CSV untuk menghindari corrupt file
- Pastikan nama kolom persis seperti template
- Isi semua kolom wajib dengan data yang valid

### 2. **Pengisian Data**

- **namaElemen**: Nama singkat dan jelas (contoh: "Geometri", "Aljabar")
- **namaAcp**: Deskripsi lengkap capaian pembelajaran
- **namaAtp**: Nama tujuan pembelajaran yang spesifik
- **jumlahJpl**: Angka saja (contoh: "4", "6")

### 3. **Validasi Sebelum Import**

- Cek data master sudah ada di sistem
- Pastikan nama Konsentrasi Sekolah sesuai dengan yang ada
- Verifikasi format Tahun Ajaran (YYYY/YYYY)

### 4. **Monitoring Hasil**

- Perhatikan pesan sukses/error setelah import
- Check data yang berhasil dibuat di tabel ATP
- Verifikasi relasi Elemen → ACP → ATP sudah benar

## Keuntungan Fitur Auto-Create

1. **Efisiensi Tinggi**: Import sekali jalan untuk semua hierarki
2. **Konsistensi Data**: Relasi antar entitas dijamin benar
3. **User Friendly**: Tidak perlu setup manual data Elemen/ACP
4. **Batch Processing**: Import ratusan ATP sekaligus dengan auto-create
5. **Error Recovery**: Skip data bermasalah, lanjut ke data berikutnya

---

**Catatan**: Fitur auto-create ini memastikan data ATP Anda memiliki hierarki lengkap dan relasi yang benar tanpa setup manual yang rumit.
