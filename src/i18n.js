// =============================================
// TaniCerdas AI — Multi-Language (i18n) Engine
// Supports: Indonesia, Jawa, Sunda, Bugis
// =============================================

var LANG_KEY = 'tanicerdas_lang';

var dictionaries = {
  id: {
    // Navigation
    nav_home: 'Beranda',
    nav_trend: 'Tren Pasar',
    nav_market: 'Pasar',
    nav_community: 'Komunitas',
    nav_rewards: 'Reward',
    nav_report: 'Lapor',
    // Command Center
    cmd_province: '📍 Provinsi Target',
    cmd_city: '🏘️ Kota/Kabupaten',
    cmd_commodity: '🌽 Komoditas Prioritas',
    cmd_check: 'Cek Data 🚀',
    cmd_all_provinces: 'Semua Provinsi',
    cmd_all_cities: 'Seluruh Kota',
    cmd_select_commodity: 'Tentukan Komoditas...',
    // Hero
    hero_badge: 'AI INSIGHTS ON',
    hero_desc: 'Menganalisis selisih Harga Acuan Pemerintah dengan realita di lapangan. Jangan jual murah, pelajari kekuatan Anda!',
    hero_cta: 'Lihat Rekomendasi ▾',
    // Stats
    stat_hap: 'Harga Acuan / HPP',
    stat_market: 'Rata-Rata Pengepul',
    // AI
    ai_title: 'Analisis TaniAI',
    ai_loading: 'Menganalisis...',
    // Reports
    reports_title: 'Radar Harga Lokasi',
    reports_btn: 'Lapor Data 📝',
    // Community
    community_title: 'Komunitas Petani',
    community_leaderboard: 'Leaderboard Kontributor',
    community_reports: 'laporan',
    community_level_pemula: 'Petani Pemula',
    community_level_aktif: 'Petani Aktif',
    community_level_ahli: 'Petani Ahli',
    community_level_legenda: 'Petani Legenda',
    // Marketplace
    market_title: 'Pasar Komoditas',
    market_subtitle: 'Jual langsung ke pengepul dan restoran tanpa perantara',
    market_add: '+ Pasang Listing',
    market_ready: 'Siap Panen',
    market_available: 'Tersedia',
    market_sold: 'Terjual',
    market_contact: 'Hubungi',
    market_kg: 'kg',
    // Rewards
    rewards_title: 'Pusat Reward',
    rewards_your_points: 'Poin Anda',
    rewards_level: 'Level',
    rewards_next: 'Poin menuju level berikutnya',
    rewards_achievements: 'Pencapaian',
    // Report Modal
    modal_title: '📝 Bagikan Info Harga',
    modal_instruction: 'Informasi yang benar membantu petani lain terhindar dari permainan harga tengkulak.',
    modal_price: 'Penawaran Harga (Rp/kg)',
    modal_buyer: 'Tipe Pembeli',
    modal_photo: '📸 Foto Bukti (Opsional)',
    modal_cancel: 'Batal',
    modal_submit: 'Simpan Data',
    // Weather
    weather_title: '🌤️ Cuaca & Dampak Pertanian',
    weather_temp: 'Suhu',
    weather_rain: 'Curah Hujan',
    weather_humidity: 'Kelembaban',
    // Offline
    offline_badge: 'Offline',
    online_badge: 'Online',
    offline_queued: 'Data tersimpan offline, akan dikirim otomatis saat online.',
    // General
    loading: 'Memuat...',
    empty_title: 'Siap Mengeksekusi Pasar?',
    empty_desc: 'Pilih provinsi dan komoditas di "Command Center" atas untuk membongkar rahasia harga pasar.',
    lang_label: '🌐 Bahasa',
  },

  jw: {
    nav_home: 'Beranda',
    nav_trend: 'Tren Pasar',
    nav_market: 'Pasar',
    nav_community: 'Komunitas',
    nav_rewards: 'Hadiah',
    nav_report: 'Lapor',
    cmd_province: '📍 Provinsi Tujuan',
    cmd_city: '🏘️ Kutha/Kabupaten',
    cmd_commodity: '🌽 Komoditas Utama',
    cmd_check: 'Deleng Data 🚀',
    cmd_all_provinces: 'Kabeh Provinsi',
    cmd_all_cities: 'Kabeh Kutha',
    cmd_select_commodity: 'Pilih Komoditas...',
    hero_badge: 'AI INSIGHTS ON',
    hero_desc: 'Nganalisa selisih Rego Acuan Pemerintah karo kasunyatan neng lapangan. Aja adol murah, sinau kekuatanmu!',
    hero_cta: 'Deleng Rekomendasi ▾',
    stat_hap: 'Rego Acuan / HPP',
    stat_market: 'Rata-Rata Pengepul',
    ai_title: 'Analisis TaniAI',
    ai_loading: 'Lagi nganalisa...',
    reports_title: 'Radar Rego Lokasi',
    reports_btn: 'Lapor Data 📝',
    community_title: 'Komunitas Tani',
    community_leaderboard: 'Papan Peringkat Kontributor',
    community_reports: 'laporan',
    community_level_pemula: 'Tani Pemula',
    community_level_aktif: 'Tani Aktif',
    community_level_ahli: 'Tani Ahli',
    community_level_legenda: 'Tani Legenda',
    market_title: 'Pasar Komoditas',
    market_subtitle: 'Adol langsung menyang pengepul lan restoran tanpa perantara',
    market_add: '+ Pasang Listing',
    market_ready: 'Siap Panen',
    market_available: 'Tersedia',
    market_sold: 'Wis Payu',
    market_contact: 'Hubungi',
    market_kg: 'kg',
    rewards_title: 'Pusat Hadiah',
    rewards_your_points: 'Poin Sampeyan',
    rewards_level: 'Level',
    rewards_next: 'Poin menyang level sabanjure',
    rewards_achievements: 'Pencapaian',
    modal_title: '📝 Bagi Info Rego',
    modal_instruction: 'Informasi sing bener mbantu tani liyane ben ora kena permainan rego tengkulak.',
    modal_price: 'Penawaran Rego (Rp/kg)',
    modal_buyer: 'Tipe Pembeli',
    modal_photo: '📸 Foto Bukti (Opsional)',
    modal_cancel: 'Batal',
    modal_submit: 'Simpen Data',
    weather_title: '🌤️ Cuaca & Dampak Pertanian',
    weather_temp: 'Suhu',
    weather_rain: 'Curah Udan',
    weather_humidity: 'Kelembaban',
    offline_badge: 'Offline',
    online_badge: 'Online',
    offline_queued: 'Data kesimpen offline, bakal dikirim otomatis pas online.',
    loading: 'Lagi dimuat...',
    empty_title: 'Siap Ngeksekusi Pasar?',
    empty_desc: 'Pilih provinsi lan komoditas neng "Command Center" ndhuwur kanggo mbongkar rahasia rego pasar.',
    lang_label: '🌐 Basa',
  },

  su: {
    nav_home: 'Beranda',
    nav_trend: 'Trén Pasar',
    nav_market: 'Pasar',
    nav_community: 'Komunitas',
    nav_rewards: 'Hadiah',
    nav_report: 'Lapor',
    cmd_province: '📍 Provinsi Tujuan',
    cmd_city: '🏘️ Kota/Kabupatén',
    cmd_commodity: '🌽 Komoditas Utama',
    cmd_check: 'Tingali Data 🚀',
    cmd_all_provinces: 'Sadaya Provinsi',
    cmd_all_cities: 'Sadaya Kota',
    cmd_select_commodity: 'Pilih Komoditas...',
    hero_badge: 'AI INSIGHTS ON',
    hero_desc: 'Nganalisis salésih Harga Acuan Pamaréntah sareng kanyataan di lapangan. Entong jual murah, diajar kakuatan anjeun!',
    hero_cta: 'Tingali Rekomendasi ▾',
    stat_hap: 'Harga Acuan / HPP',
    stat_market: 'Rata-Rata Pangepul',
    ai_title: 'Analisis TaniAI',
    ai_loading: 'Keur nganalisis...',
    reports_title: 'Radar Harga Lokasi',
    reports_btn: 'Lapor Data 📝',
    community_title: 'Komunitas Patani',
    community_leaderboard: 'Papan Peringkat Kontributor',
    community_reports: 'laporan',
    community_level_pemula: 'Patani Pemula',
    community_level_aktif: 'Patani Aktif',
    community_level_ahli: 'Patani Ahli',
    community_level_legenda: 'Patani Legenda',
    market_title: 'Pasar Komoditas',
    market_subtitle: 'Jual langsung ka pangepul sareng réstoran tanpa perantara',
    market_add: '+ Pasang Listing',
    market_ready: 'Siap Panén',
    market_available: 'Sayagi',
    market_sold: 'Parantos Pajeng',
    market_contact: 'Hubungi',
    market_kg: 'kg',
    rewards_title: 'Pusat Hadiah',
    rewards_your_points: 'Poin Anjeun',
    rewards_level: 'Level',
    rewards_next: 'Poin ka level salajéngna',
    rewards_achievements: 'Pencapaian',
    modal_title: '📝 Bagikeun Info Harga',
    modal_instruction: 'Informasi nu leres ngabantosan patani sanés supados teu kaganggu ku permainan harga pangepul.',
    modal_price: 'Tawaran Harga (Rp/kg)',
    modal_buyer: 'Tipe Pangmeuli',
    modal_photo: '📸 Poto Bukti (Opsional)',
    modal_cancel: 'Batal',
    modal_submit: 'Simpen Data',
    weather_title: '🌤️ Cuaca & Dampak Tatanén',
    weather_temp: 'Suhu',
    weather_rain: 'Curah Hujan',
    weather_humidity: 'Kalémbaban',
    offline_badge: 'Offline',
    online_badge: 'Online',
    offline_queued: 'Data disimpen offline, bakal dikirim otomatis pas online.',
    loading: 'Keur dimuat...',
    empty_title: 'Siap Ngaéksékusi Pasar?',
    empty_desc: 'Pilih provinsi sareng komoditas di "Command Center" luhur kanggo muka rahasia harga pasar.',
    lang_label: '🌐 Basa',
  },

  bug: {
    nav_home: 'Beranda',
    nav_trend: 'Tren Pasar',
    nav_market: 'Pasareng',
    nav_community: 'Komunitas',
    nav_rewards: 'Hadiah',
    nav_report: 'Lapor',
    cmd_province: '📍 Provinsi',
    cmd_city: '🏘️ Kota/Kabupaten',
    cmd_commodity: '🌽 Komoditas',
    cmd_check: 'Itai Data 🚀',
    cmd_all_provinces: 'Sininna Provinsi',
    cmd_all_cities: 'Sininna Kota',
    cmd_select_commodity: 'Pilei Komoditas...',
    hero_badge: 'AI INSIGHTS ON',
    hero_desc: 'Menganalisis salésihna Ella Acuan Pamarenta sibawa kenyataang ri lapangeng. Aja majjual mura, assampéang kakuatammu!',
    hero_cta: 'Itai Rekomendasi ▾',
    stat_hap: 'Ella Acuan / HPP',
    stat_market: 'Rata-Rata Pallaoang',
    ai_title: 'Analisis TaniAI',
    ai_loading: 'Lagi menganalisis...',
    reports_title: 'Radar Ella Lokasi',
    reports_btn: 'Lapor Data 📝',
    community_title: 'Komunitas Pallaong',
    community_leaderboard: 'Papan Peringkat',
    community_reports: 'laporan',
    community_level_pemula: 'Pallaong Pemula',
    community_level_aktif: 'Pallaong Aktif',
    community_level_ahli: 'Pallaong Ahli',
    community_level_legenda: 'Pallaong Legenda',
    market_title: 'Pasareng Komoditas',
    market_subtitle: 'Majjual langsung lao pallaoang sibawa restoran dé perantara',
    market_add: '+ Pasang Listing',
    market_ready: 'Siap Paneng',
    market_available: 'Engka',
    market_sold: 'Pura Labu',
    market_contact: 'Hubungi',
    market_kg: 'kg',
    rewards_title: 'Pusat Hadiah',
    rewards_your_points: 'Poin Ta',
    rewards_level: 'Level',
    rewards_next: 'Poin menuju level manengnga',
    rewards_achievements: 'Pencapaian',
    modal_title: '📝 Bagi Info Ella',
    modal_instruction: 'Informasi tongeng mbantu pallaong laingé nawwi permainang ella tengkulak.',
    modal_price: 'Tawaran Ella (Rp/kg)',
    modal_buyer: 'Tipe Pangelli',
    modal_photo: '📸 Foto Bukti (Opsional)',
    modal_cancel: 'Batal',
    modal_submit: 'Taroi Data',
    weather_title: '🌤️ Cuaca & Dampak Pallaongang',
    weather_temp: 'Suhu',
    weather_rain: 'Curah Bosi',
    weather_humidity: 'Kelembaban',
    offline_badge: 'Offline',
    online_badge: 'Online',
    offline_queued: 'Data tesimpa offline, laoni dikirim otomatis punna online.',
    loading: 'Lagi dimuat...',
    empty_title: 'Siap Mengeksekusi Pasareng?',
    empty_desc: 'Pilei provinsi sibawa komoditas ri "Command Center" coppo untuk mbongkar rahasia ella pasareng.',
    lang_label: '🌐 Basa',
  }
};

/**
 * Get current language
 */
export function getCurrentLang() {
  return localStorage.getItem(LANG_KEY) || 'id';
}

/**
 * Set language
 */
export function setLang(langCode) {
  if (dictionaries[langCode]) {
    localStorage.setItem(LANG_KEY, langCode);
  }
}

/**
 * Translate a key
 */
export function t(key) {
  var lang = getCurrentLang();
  var dict = dictionaries[lang] || dictionaries['id'];
  return dict[key] || dictionaries['id'][key] || key;
}

/**
 * Get available languages
 */
export function getLanguages() {
  return [
    { code: 'id', label: '🇮🇩 Indonesia' },
    { code: 'jw', label: '🏛️ Jawa' },
    { code: 'su', label: '🌸 Sunda' },
    { code: 'bug', label: '⛵ Bugis' }
  ];
}

/**
 * Get AI language instruction for prompt
 */
export function getAILanguageInstruction() {
  var lang = getCurrentLang();
  var instructions = {
    id: '',
    jw: 'PENTING: Jawab dalam Bahasa Jawa (Ngoko/Krama Madya). ',
    su: 'PENTING: Jawab dalam Bahasa Sunda (Loma). ',
    bug: 'PENTING: Jawab dalam Bahasa Bugis. '
  };
  return instructions[lang] || '';
}
