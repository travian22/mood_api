# Mood Check-In API

Backend API untuk sistem mood check-in harian. Dibangun menggunakan **Node.js**, **Express**, **PostgreSQL**, dan **Prisma ORM**.

## Tech Stack

* **Runtime:** Node.js
* **Framework:** Express.js
* **Database:** PostgreSQL
* **ORM:** Prisma
* **Validasi:** express-validator

## Arsitektur Request Flow

1. Client mengirim request dengan header `x-api-key`
2. Middleware autentikasi memvalidasi API key
3. Middleware validasi memeriksa input data
4. Controller memproses logic
5. Prisma berkomunikasi dengan PostgreSQL
6. Response dikembalikan dalam format JSON yang konsisten

## Setup & Instalasi

1. Clone repository:
   ```bash
   git clone [URL_REPOSITORY]
   cd mood-checkin-api
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Buat file `.env`:
   ```env
   DATABASE_URL="postgresql://postgres:password@localhost:5432/mood_api?schema=public"
   ```

4. Jalankan migrasi database:
   ```bash
   npx prisma migrate dev --name init-mood-entries
   ```

5. Jalankan server:
   ```bash
   npm run dev
   ```
   Server akan berjalan di `http://localhost:3000`

## API Endpoints

Semua endpoint memerlukan header: `x-api-key: 12345-ABCDE`

### 1. POST /mood
Menyimpan mood entry baru.

**Request Body:**
```json
{
  "user_id": 101,
  "date": "2025-10-28",
  "mood_score": 5,
  "mood_label": "Luar biasa",
  "notes": "Hari yang produktif!"
}
```

**Response (201):**
```json
{
  "status": "success",
  "message": "Mood entry created successfully",
  "data": {
    "id": "1",
    "userId": "101",
    "date": "2025-10-28T00:00:00.000Z",
    "moodScore": 5,
    "moodLabel": "Luar biasa",
    "notes": "Hari yang produktif!",
    "createdAt": "2025-10-28T12:00:00.000Z"
  }
}
```

**Error Response (400):**
```json
{
  "status": "fail",
  "errors": {
    "mood_score": "mood_score must be an integer between 1 and 5"
  }
}
```

### 2. GET /mood/:user_id
Mengambil riwayat mood user (diurutkan dari terbaru).

**Request:** `GET /mood/101`

**Response (200):**
```json
{
  "status": "success",
  "message": "Success",
  "data": [
    {
      "id": "1",
      "userId": "101",
      "date": "2025-10-28T00:00:00.000Z",
      "moodScore": 5,
      "moodLabel": "Luar biasa",
      "notes": "Hari yang produktif!",
      "createdAt": "2025-10-28T12:00:00.000Z"
    }
  ]
}
```

### 3. GET /summary/:user_id
Menghitung total entries dan rata-rata mood score.

**Request:** `GET /summary/101`

**Response (200):**
```json
{
  "status": "success",
  "message": "Success",
  "data": {
    "user_id": "101",
    "total_entries": 15,
    "average_mood": "4.20"
  }
}
```

## Keamanan

* **API Key Authentication** - Semua endpoint dilindungi middleware autentikasi
* **Input Validation** - Validasi di application layer sebelum data masuk database
* **SQL Injection Prevention** - Prisma ORM menggunakan parameterized queries

## Optimasi & Skalabilitas

* **Database Indexing** - Index pada kolom `userId` untuk query cepat
* **Connection Pooling** - Prisma mengelola connection pool secara efisien
* **Stateless Design** - Mudah untuk horizontal scaling

## Struktur Database

```prisma
model MoodEntry {
  id        BigInt   @id @default(autoincrement())
  userId    BigInt   
  date      DateTime @db.Date
  moodScore Int      @db.SmallInt
  moodLabel String?  @db.VarChar(100)
  notes     String?  @db.Text
  createdAt DateTime @default(now())

  @@index([userId])
  @@map("mood_entries")
}
```

## Alasan Teknis & Justifikasi Desain

Setiap pilihan teknologi diambil untuk memenuhi kebutuhan keamanan, skalabilitas, dan integrasi AI.

1. **Node.js (Express):** Dipilih karena sifat non-blocking I/O-nya. Sangat ideal untuk aplikasi API yang I/O-intensive (banyak membaca/menulis ke database), memungkinkan menangani banyak koneksi bersamaan dengan efisien.

2. **PostgreSQL:** Dipilih mengalahkan MySQL karena dua alasan utama:
   * **Kekuatan Analitik:** Fitur analitik bawaannya (seperti `AVG`, `DATE_TRUNC`) sangat kuat, memudahkan implementasi endpoint `/summary`.
   * **Kesiapan Integrasi AI:** PostgreSQL memiliki ekstensi `pgvector` yang populer. Ini memungkinkan kita menyimpan vector embeddings (data dari model AI) langsung di database, memenuhi syarat "fleksibel untuk diintegrasikan dengan sistem rekomendasi AI".

3. **Prisma ORM:** Dipilih sebagai data access layer untuk:
   * **Keamanan:** Memberikan perlindungan 100% dari serangan SQL Injection secara default, karena semua query dibuat secara terprogram dan di-parameterisasi.
   * **Developer Experience:** Menulis query type-safe jauh lebih cepat dan mengurangi bug dibanding menulis SQL mentah.
   * **Migrasi:** `prisma migrate` menyediakan sistem migrasi skema database yang robust dan declarative.

4. **Validasi (express-validator):**
   * Memisahkan logic validasi (aturan bisnis, misal: mood 1-5) dari logic database. Ini membuat controller tetap bersih dan fokus pada tugasnya.

## Pertimbangan Keamanan & Skalabilitas

### Keamanan

* **Akses Terbatas:** Seluruh API dilindungi oleh middleware `authenticateApiKey`.
* **Validasi Input:** Validasi data diterapkan di application layer (Express) untuk menolak data tidak valid sebelum menyentuh database.
* **Pencegahan SQL Injection:** Ditangani sepenuhnya oleh Prisma.

### Skalabilitas

* **Database Index:** Index (`@@index([userId])`) dibuat pada kolom `userId` di tabel `mood_entries`. Tanpa index, query `GET /mood/:user_id` akan memindai seluruh tabel (O(n)) dan menjadi lambat. Dengan index, pencarian data pengguna spesifik menjadi sangat cepat (O(log n)), bahkan dengan miliaran baris data.
* **Stateless Design:** API ini bersifat stateless. Kita dapat dengan mudah melakukan horizontal scaling (menjalankan banyak instance aplikasi) di belakang Load Balancer untuk menangani lonjakan traffic.
* **Connection Pooling:** Prisma (dan driver `pg`) mengelola connection pool secara efisien, menggunakan kembali koneksi yang ada untuk mengurangi overhead pembuatan koneksi baru pada setiap request.

## Rencana Pengembangan

1. **Autentikasi Penuh (JWT/OAuth 2.0):**
   * Mengganti API Key sederhana dengan sistem autentikasi penuh.
   * Membuat tabel `Users` baru dan menghubungkan `userId` di `MoodEntry` sebagai foreign key. Ini memungkinkan endpoint seperti `GET /mood/me` (mengambil data user yang sedang login).

2. **Integrasi AI:**
   * Menggunakan ekstensi `pgvector` di PostgreSQL.
   * Saat pengguna mengirim `notes` di `POST /mood`, sebuah background job akan meng-generasi vector embedding dari teks tersebut dan menyimpannya.
   * Membuat endpoint baru `GET /recommendation/:user_id` yang akan:
     1. Menganalisis mood pengguna saat ini.
     2. Melakukan vector search untuk menemukan notes atau mood serupa di masa lalu.
     3. Mengirimkan data ini ke sistem AI untuk memberikan rekomendasi tindak lanjut yang relevan.

3. **Testing & CI/CD:**
   * Menulis unit test dan integration test menggunakan Jest dan Supertest.
   * Membuat pipeline GitHub Actions untuk menjalankan tes dan linting secara otomatis pada setiap push atau pull request.

4. **Observability & Monitoring:**
   * Implementasi logger (seperti Winston) untuk logging terstruktur.
   * Menambahkan monitoring (seperti Prometheus/Grafana) untuk melacak performa API, rate error, dan latensi query database.

5. **Rate Limiting & Keamanan Lanjutan:**
   * Menambahkan rate limiter (misal: `express-rate-limit`) untuk mencegah serangan brute force atau spam ke API.

## Development Roadmap

- [ ] Implementasi JWT/OAuth 2.0
- [ ] User management system
- [ ] AI integration untuk mood analysis
- [ ] Unit & integration testing
- [ ] CI/CD pipeline
- [ ] Rate limiting
- [ ] Logging & monitoring