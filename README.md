# Portal Absensi Sekolah - TKS PGRI 05 KLABANG

Portal Absensi Sekolah yang modern dan premium, dibangun menggunakan **Next.js 15**, **Prisma**, dan **Tailwind CSS**. Dilengkapi dengan fitur absensi real-time, manajemen akun, dan dashboard statistik yang informatif.

## Fitur Utama

- 🔐 **Autentikasi Aman:** Sistem login untuk Admin, Guru, dan Murid.
- 👨‍🏫 **Manajemen Absensi:** Guru dapat mengabsen siswa secara real-time dengan status yang jelas.
- 📊 **Dashboard Statistik:** Visualisasi data kehadiran yang interaktif.
- 📱 **Desain Responsive:** Antarmuka premium dengan Glassmorphism dan dukungan Mode Gelap (Dark Mode).
- 💾 **Ingat Saya:** Fitur untuk menyimpan kredensial login di browser.

## Cara Menjalankan Project dari Awal

### 1. Prasyarat
Pastikan Anda sudah menginstal:
- [Node.js](https://nodejs.org/) (Versi 18 atau terbaru)
- npm (biasanya terinstal bersama Node.js)

### 2. Instalasi Dependensi
Clone repository ini atau download source code-nya, lalu buka terminal di folder project dan jalankan:
```bash
npm install
```

### 3. Konfigurasi Environment
Buat file bernama `.env` di direktori utama (root) dan tambahkan baris berikut:
```env
DATABASE_URL="file:./dev.db"
```
*Catatan: Project ini menggunakan SQLite untuk kemudahan setup.*

### 4. Setup Database (Prisma)
Jalankan perintah berikut untuk mensinkronkan skema database dan membuat file database lokal (`dev.db`):
```bash
npx prisma generate
npx prisma db push
```

### 5. Menjalankan Server Pengembangan
Setelah setup selesai, jalankan perintah berikut:
```bash
npm run dev
```
Buka [http://localhost:3000](http://localhost:3000) di browser Anda.

### 6. Testing dengan Ngrok (Public URL)
Jika Anda ingin mengetes website ini di handphone atau perangkat lain melalui internet, Anda dapat menggunakan Ngrok yang sudah terinstal:
```bash
npm run tunnel
```
*Catatan: Anda mungkin perlu menjalankan `npx ngrok config add-authtoken <TOKEN>` jika ini pertama kalinya Anda menggunakan Ngrok.*


## Teknologi yang Digunakan
- **Framework:** Next.js 15 (App Router)
- **Styling:** Tailwind CSS & Framer Motion
- **ORM:** Prisma
- **Database:** SQLite
- **Icons:** Lucide React

---
© 2026 TKS PGRI 05 KLABANG. All Rights Reserved.
