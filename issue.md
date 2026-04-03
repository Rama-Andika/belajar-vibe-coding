# Panduan Inisiasi Proyek: ElysiaJS + Drizzle + MySQL

Dokumen ini berisi deskripsi dan perencanaan langkah-langkah *high-level* untuk melakukan inisiasi proyek backend baru menggunakan Bun, ElysiaJS, Drizzle ORM, dan MySQL. Panduan ini dirancang untuk dapat diikuti oleh *junior developer* atau sebagai *prompt instuction* untuk *AI coding assistant*.

## 1. Persiapan & Inisiasi Proyek
- Pastikan **Bun** sudah terinstal di sistem.
- Buka terminal di dalam folder ini (`d:\belajar\belajar-vibe-coding`).
- Jalankan `bun init` untuk membuat kerangka dasar proyek Bun.
- Tambahkan dependensi ElysiaJS: `bun add elysia`.

## 2. Pengaturan Database (Drizzle ORM & MySQL)
- Instal core Drizzle dan driver MySQL: `bun add drizzle-orm mysql2`.
- Instal Drizzle Kit untuk keperluan *dependency* proses *development*: `bun add -D drizzle-kit`.
- Siapkan file `.env` di *root folder* proyek untuk menyimpan string koneksi database (contoh variabel: `DATABASE_URL`).
- Buat file konfigurasi Drizzle (`drizzle.config.ts`) dengan mengatur `dialect` ke `mysql` dan menyesuaikan rujukan skema.

## 3. Desain Struktur Direktori
Buat struktur direktori untuk menjaga kerapian alur kerja dasar:
- `src/db/`: Berisi file konfigurasi koneksi *database* (`index.ts`) dan *schema* Drizzle (`schema.ts`).
- `src/index.ts`: Sebagai *entry point* utama server ElysiaJS.

## 4. Pembuatan Skema Awal & Eksekusi Migrasi
- Isi `src/db/schema.ts` dengan desain satu tabel contoh sederhana (misalnya tabel `users` dengan kolom ID, nama, dan email).
- Lakukan sinkronisasi atau eksekusi migrasi menggunakan Drizzle Kit (`drizzle-kit push` atau `drizzle-kit generate` & `migrate`) untuk mereplikasikan skema tersebut ke database MySQL secara langsung.

## 5. Implementasi Route Elysia Dasar
- Konfigurasikan koneksi Drizzle di `src/db/index.ts` menggunakan *connection string* dari `.env`.
- Integrasikan *database* ke dalam aplikasi Elysia pada file `src/index.ts`.
- Tambahkan beberapa *endpoint* API (misalnya: `GET /` untuk memastikan server berjalan, dan `GET /users` untuk menguji *query SELECT* ke *database* MySQL melalui Drizzle).

## Poin Penting
- Pastikan bahwa database lokal MySQL Anda aktif saat menguji koneksi (jika menggunakan instalasi lokal).
- Fokus pada implementasi *high level* terlebih dahulu agar infrastruktur dasar *routing* dan komunikasi database dapat diuji secepatnya.
