<div align="center">
  <img src="./public/assets/icon-512.png" alt="TaniCerdas Logo" width="150"/>
  <h1>🌾 TaniCerdas AI</h1>
  <p><strong>Dashboard Intelijen Harga & Tren Pasar Agritech</strong></p>

  <p>
    <a href="#-fitur-unggulan">Fitur Unggulan</a> •
    <a href="#%EF%B8%8F-teknologi-yang-digunakan">Teknologi</a> •
    <a href="#-panduan-instalasi">Panduan Instalasi</a> •
    <a href="#-arsitektur-sistem">Arsitektur Sistem</a>
  </p>

  <p>
    <img src="https://img.shields.io/badge/Status-Production_Ready-success?style=for-the-badge" alt="Status" />
    <img src="https://img.shields.io/badge/PWA-Supported-blue?style=for-the-badge" alt="PWA" />
    <img src="https://img.shields.io/badge/AI-Gemini_Powered-orange?style=for-the-badge" alt="AI Powered" />
  </p>
</div>

---

## 📖 Tentang Proyek

**TaniCerdas AI** adalah sebuah platform aplikasi *Mobile-First Progressive Web App (PWA)* yang dirancang untuk membantu para petani memantau harga acuan pasar, melihat tren komoditas, dan melawan permainan harga dari tengkulak. Aplikasi ini dilengkapi dengan **Kecerdasan Buatan (AI)** yang dapat memberikan saran dan strategi penjualan komoditas secara *real-time*.

Platform ini dirancang dengan antarmuka yang sangat premium (Glassmorphism UI), responsif penuh untuk *smartphone*, dan didukung arsitektur *backend* yang tangguh.

---

## ✨ Fitur Unggulan

- 🤖 **Analisis AI Tani (Gemini AI):** Memberikan rekomendasi strategis apakah harga saat ini tergolong *Harga Wajar*, *Perlu Negosiasi*, atau *Tidak Wajar*.
- 📊 **Visualisasi Tren Pasar:** Menampilkan pergerakan grafik harga historis komoditas (*crowdsourced*) menggunakan Chart.js yang memanjakan mata.
- 📱 **Progressive Web App (PWA):** Dapat diunduh (*install*) langsung ke *Home Screen Smartphone* tanpa melalui Play Store, dengan dukungan *Offline Mode* dasar.
- 📡 **Bypass Sinkronisasi Data:** Terintegrasi dengan mekanisme *Proxy Scraper* untuk menarik data otentik dari Bank Indonesia / Badan Pangan Nasional secara aman.
- 🤝 **Crowdsource Pelaporan Harga:** Memungkinkan pengguna (petani) melaporkan penawaran harga langsung dari lapangan untuk membantu petani lainnya.
- 🎨 **Premium UI/UX:** Antarmuka dengan sistem tata letak modern bergaya *Glassmorphism* dan palet *Emerald Green* khas agrikultur.

---

## 🛠️ Teknologi yang Digunakan

### Frontend
- **HTML5 & Vanilla JS** (Sangat ringan dan cepat)
- **Vanilla CSS3** (Tanpa *framework* berat, murni *custom design system*)
- **Vite** (Build Tool & PWA Plugin)
- **Chart.js** (Visualisasi data grafis)

### Backend & Database
- **Supabase** (PostgreSQL Database & Edge Functions)
- **Deno** (Runtime untuk Supabase Edge Functions)
- **Google Gemini AI** (Engine untuk Analisis Intelijen Pasar)

---

## 🚀 Panduan Instalasi

Ikuti langkah-langkah di bawah ini untuk menjalankan TaniCerdas secara lokal di mesin Anda.

### 1. Persiapan Awal
Pastikan Anda sudah menginstal **Node.js** (versi 18 ke atas) dan **NPM**.

### 2. Kloning Repositori
```bash
git clone https://github.com/username/tanicerdas-ai.git
cd tanicerdas-ai
```

### 3. Instalasi Dependensi
```bash
npm install
```

### 4. Menjalankan Server Lokal (Development)
```bash
npm run dev
```
Aplikasi akan berjalan di `http://localhost:5173/`. 
*(Note: Jika terjadi isu modul PWA, Anda mungkin perlu melakukan restart pada perintah ini).*

### 5. Membangun Aplikasi (Production Build)
Untuk melakukan kompilasi file aset untuk siap unggah ke *server* produksi:
```bash
npm run build
```

---

## 📡 Arsitektur Sistem (Pengambilan Data PIHPS)

TaniCerdas mengambil data menggunakan kombinasi metode untuk menghindari pemblokiran *firewall*:

1. **Opsi A (Cloud Proxy):** *Frontend* akan mengirimkan permintaan ke *Supabase Edge Function* dengan menyertakan *API Key* pihak ketiga (misalnya ScraperAPI) yang diatur oleh pengguna melalui menu profil di aplikasi.
2. **Opsi B (Local Fetcher):** Jika Anda berperan sebagai admin dan ingin memperbarui *database* secara manual dari komputer rumah Anda (tanpa perlu *Proxy API*), Anda dapat menjalankan skrip khusus:
   ```bash
   npm run sync-pihps
   ```

---

<div align="center">
  <i>"Menghubungkan petani tradisional dengan kekuatan intelijen data modern."</i>
  <br>
  <b>Dibuat untuk kesejahteraan Petani Nusantara.</b>
</div>
