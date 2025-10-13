# DEBUG IMPORT ATP - AUTO CREATE TROUBLESHOOTING

## Masalah yang Dilaporkan

```
3 ATP gagal diimpor:
- ATP "Sumpah Pemuda" dengan Elemen "Kelompok Pemuda" gagal diimpor karena Elemen tidak dapat ditemukan atau dibuat
- ATP "Proklamasi" dengan Elemen "Kemerdekaan" gagal diimpor karena Elemen tidak dapat ditemukan atau dibuat
- ATP "PPUPKI" dengan Elemen "Kemerdekaan" gagal diimpor karena Elemen tidak dapat ditemukan atau dibuat
```

## ✅ Urutan Proses Auto-Creation: ELEMEN → ACP → ATP

### Hierarchy Flow yang Benar:

```
STEP 1: ELEMEN PROCESSING
├── 🔍 Cari Elemen yang sudah ada
├── ❌ Jika tidak ada: Buat Elemen baru
├── ✅ Validasi Elemen ID tersedia
└── 🔗 Siap untuk step berikutnya

STEP 2: ACP PROCESSING
├── 🔍 Cari ACP yang sudah ada
├── ❌ Jika tidak ada: Buat ACP baru (linked to Elemen)
├── ✅ Validasi ACP ID tersedia
└── 🔗 Siap untuk step berikutnya

STEP 3: ATP PROCESSING
├── 🆕 Buat ATP baru
├── 🔗 Link ke ACP (yang otomatis link ke Elemen)
└── 🎉 Hierarchy Complete: Elemen → ACP → ATP
```

### Log Output yang Diharapkan:

```
🔄 STEP 1/3: ELEMEN PROCESSING
✅ STEP 1 COMPLETED: Elemen "Kemerdekaan" ready with ID: 123

🔄 STEP 2/3: ACP PROCESSING
✅ STEP 2 COMPLETED: ACP ready with ID: 456 (linked to Elemen ID: 123)

🔄 STEP 3/3: ATP PROCESSING
✅ STEP 3 COMPLETED: ATP "Proklamasi" created successfully!
🎉 HIERARCHY COMPLETE: Elemen(123) → ACP(456) → ATP(Proklamasi)
```

## Perbaikan yang Telah Dilakukan

### 1. Enhanced Response Handling

**Problem**: API response structure mungkin berbeda dari yang diantisipasi

**Fix**: Menambahkan multiple fallback untuk mendapatkan ID dari response

```javascript
// Sebelum:
return result.data.content?.idElemen || result.data.idElemen;

// Sesudah:
let newElemenId = null;
if (result.data) {
  newElemenId =
    result.data.content?.idElemen ||
    result.data.idElemen ||
    result.data.data?.idElemen ||
    result.data.content ||
    result.data.id;
}

if (!newElemenId) {
  // Fallback: search by name after creation
  newElemenId = mapElemenNameToId(elemenName);
}
```

### 2. Comprehensive Debug Logging

**Problem**: Tidak ada visibility ke dalam proses auto-creation

**Fix**: Menambahkan extensive logging untuk troubleshooting:

- Master data mapping results
- API request/response details
- Step-by-step creation process
- Error details dengan context lengkap

### 3. Enhanced Error Messages

**Problem**: Error messages tidak cukup informatif

**Fix**: Error messages sekarang menunjukkan:

- Data master mana yang missing
- Struktur response API
- Exact point of failure

## Cara Debug Import Error

### Step 1: Buka Developer Console

1. Buka browser DevTools (F12)
2. Go to Console tab
3. Lakukan import ATP
4. Lihat log messages yang muncul

### Step 2: Analisa Debug Output

Cari log messages berikut:

#### A. Master Data Mapping

```
🔍 Debug Master Data Mapping for "Kelompok Pemuda":
  tahunAjaranId: 123 (2025/2026)
  semesterId: 45 (Ganjil)
  kelasId: 67 (X)
  mapelId: null (Sejarah) ← MASALAH DI SINI
  konsentrasiId: 89 (Desain Komunikasi Visual)
```

#### B. Elemen Creation Attempt

```
🔄 Auto-creating Elemen: "Kelompok Pemuda"
📋 Elemen Data to be created: {...}
✅ Elemen API Response: {...}
❌ Failed to create Elemen: [error details]
```

### Step 3: Identifikasi Root Cause

#### Kemungkinan Penyebab & Solusi:

1. **Master Data Missing**

   ```
   Error: Data master tidak lengkap untuk membuat Elemen: Mapel "Sejarah"
   ```

   **Solusi**: Tambahkan data master yang missing ke database

2. **API Response Structure Issue**

   ```
   ✅ Elemen API Response: {statusCode: 200, data: {...}}
   ❌ Cannot get Elemen ID from response
   ```

   **Solusi**: Check struktur response API, adjust parsing logic

3. **Permission/Authorization Issue**

   ```
   ❌ Failed to create Elemen: 403 Forbidden
   ```

   **Solusi**: Check user permissions untuk create Elemen/ACP

4. **Network/Server Issue**
   ```
   ❌ Failed to create Elemen: Network Error
   ```
   **Solusi**: Check koneksi server, API endpoints

## Langkah Troubleshooting Spesifik

### 1. Verifikasi Data Master

Pastikan data berikut ada di database:

```sql
-- Check Tahun Ajaran
SELECT * FROM tahun_ajaran WHERE tahun_ajaran = '2025/2026';

-- Check Semester
SELECT * FROM semester WHERE nama_semester = 'Ganjil';

-- Check Kelas
SELECT * FROM kelas WHERE nama_kelas = 'X';

-- Check Mapel (KEMUNGKINAN MASALAH DI SINI)
SELECT * FROM mapel WHERE name = 'Sejarah';

-- Check Konsentrasi Sekolah
SELECT * FROM konsentrasi_keahlian_sekolah WHERE nama_konsentrasi_sekolah = 'Desain Komunikasi Visual';
```

### 2. Test Manual Creation

Coba buat Elemen secara manual di frontend:

1. Go to Elemen page
2. Click "Tambahkan Elemen"
3. Fill form dengan data yang sama
4. Check apakah berhasil atau ada error

### 3. Check API Response Structure

Dari console log, copy response dari `addElemen` call:

```javascript
// Expected structure salah satu dari:
response.data.content.idElemen
response.data.idElemen
response.data.data.idElemen
response.data.content (jika content langsung adalah ID)
response.data.id
```

### 4. Network Tab Analysis

1. Buka Network tab di DevTools
2. Filter by "elemen" or "acp"
3. Check API calls saat import
4. Lihat request payload & response

## Debugging Commands

### Console Commands untuk Manual Test:

```javascript
// Test mapping functions
console.log("Tahun Ajaran:", mapTahunAjaranToId("2025/2026"));
console.log("Semester:", mapSemesterNameToId("Ganjil"));
console.log("Kelas:", mapKelasNameToId("X"));
console.log("Mapel:", mapMapelNameToId("Sejarah")); // ← Likely issue
console.log("Konsentrasi:", mapKonsentrasiNameToId("Desain Komunikasi Visual"));

// Check mapping data
console.log("Mapping Data:", mappingData);
console.log(
  "Available Mapels:",
  mappingData.mapelList.map((m) => m.name)
);
```

## Expected Fix Flow

1. **Identify Missing Master Data**: Log akan show data mana yang null
2. **Add Missing Data**: Tambahkan data master yang missing via admin
3. **Retest Import**: Import ulang dengan data master lengkap
4. **Verify Creation**: Check apakah Elemen/ACP berhasil dibuat dan ATP terhubung

## Monitoring Success

Setelah perbaikan, log success akan tampil:

```
🔍 Initial Elemen search: "Kelompok Pemuda" → ID: null
🔄 Auto-creating Elemen: "Kelompok Pemuda"
✅ Elemen created with ID: 456
✅ ACP created with ID: 789
✅ ATP created successfully
```

---

**Next Action**: Jalankan import ulang dan bagikan log console untuk analysis lebih lanjut.
