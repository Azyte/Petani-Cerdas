import './style.css';
import { fetchProvinces, fetchCities, fetchCommodities, fetchReferencePrices, fetchCrowdsourcedPrices, submitPriceReport, formatRupiah, priceTypeLabel } from './src/data.js';
import { sendMessage, buildContext } from './src/chat.js';
import { registerSW } from 'virtual:pwa-register';

// Initialize PWA Service Worker
const updateSW = registerSW({
  onNeedRefresh() {
    console.log('Update available. Please refresh.');
  },
  onOfflineReady() {
    console.log('App ready to work offline.');
  },
});

// =============================================
// TaniCerdas AI — Premium UI/UX Logic
// =============================================

// App State
const state = {
  provinces: [],
  cities: [],
  commodities: [],
  referencePrices: [],
  crowdsourcedPrices: [],
  selectedProvince: null,
  selectedCity: null,
  selectedCommodity: null,
  isAnalyzing: false,
  currentView: 'dashboard',
  chartInstance: null
};

// DOM References
const $ = (sel) => document.querySelector(sel);

const dom = {
  splash: $('#splash-screen'),
  mainApp: $('#main-app'),
  
  // Navigation
  navDashboard: $('#nav-dashboard'),
  navTrend: $('#nav-trend'),
  
  // Views
  viewDashboard: $('#view-dashboard'),
  viewTrend: $('#view-trend'),
  
  // Selectors
  selectProvince: $('#select-province'),
  selectCity: $('#select-city'),
  selectCommodity: $('#select-commodity'),
  btnRefresh: $('#btn-refresh'),
  
  // Dashboard Areas
  emptyState: $('#empty-state'),
  
  // Hero
  heroCommodityName: $('#hero-commodity-name'),
  
  // Stats
  statHapValue: $('#stat-hap-value'),
  statHapLabel: $('#stat-hap-label'),
  statMarketValue: $('#stat-market-value'),
  statMarketLabel: $('#stat-market-label'),
  
  // AI Card
  aiPanel: $('#ai-panel'),
  aiLoading: $('#ai-loading'),
  aiContent: $('#ai-content'),
  
  // Trend Chart
  trendChart: $('#trendChart'),
  
  // Reports
  reportsList: $('#reports-list'),
  btnReportAction: $('#btn-report-action'),
  btnSideLapor: $('#btn-side-lapor'),
  btnSidebarLapor: $('#btn-sidebar-lapor'),
  
  // Modal
  reportModal: $('#report-modal'),
  btnCloseModal: $('#btn-close-modal'),
  reportForm: $('#report-form'),
  btnCancelReport: $('#btn-cancel-report'),
  reportPrice: $('#report-price'),
  reportBuyer: $('#report-buyer')
};

// =============================================
// Initialization
// =============================================

async function init() {
  try {
    // Load initial data
    const [provinces, commodities, referencePrices] = await Promise.all([
      fetchProvinces(),
      fetchCommodities(),
      fetchReferencePrices()
    ]);

    state.provinces = provinces;
    state.commodities = commodities;
    state.referencePrices = referencePrices;

    // Populate selectors
    populateSelect(dom.selectProvince, provinces, 'name', 'id');
    populateCommoditySelect(dom.selectCommodity, commodities);

    // Bind events
    bindEvents();
  } catch (error) {
    console.error('Initialization error:', error);
    alert('Terjadi kesalahan saat memuat data aplikasi. Silakan muat ulang halaman.');
  } finally {
    // Hide splash, show app (always execute this even if error occurs)
    setTimeout(() => {
      if (dom.splash) dom.splash.classList.add('fade-out');
      if (dom.mainApp) dom.mainApp.classList.remove('hidden');
      setTimeout(() => { if (dom.splash) dom.splash.remove(); }, 600);
    }, 1800); // Slightly longer splash for dramatic effect
  }
}

// =============================================
// UI Population
// =============================================

function populateSelect(selectEl, items, labelKey, valueKey) {
  const firstOption = selectEl.querySelector('option');
  selectEl.innerHTML = '';
  selectEl.appendChild(firstOption);
  
  items.forEach(item => {
    const opt = document.createElement('option');
    opt.value = item[valueKey];
    opt.textContent = item[labelKey];
    selectEl.appendChild(opt);
  });
}

function populateCommoditySelect(selectEl, commodities) {
  const firstOption = selectEl.querySelector('option');
  selectEl.innerHTML = '';
  selectEl.appendChild(firstOption);

  const categories = {
    'pangan': 'Pangan Pokok',
    'hortikultura': 'Hortikultura Utama',
    'peternakan': 'Peternakan',
    'perkebunan': 'Perkebunan'
  };

  Object.entries(categories).forEach(([cat, label]) => {
    const group = document.createElement('optgroup');
    group.label = label;
    commodities.filter(c => c.category === cat).forEach(item => {
      const opt = document.createElement('option');
      opt.value = item.id;
      opt.textContent = `${item.icon || ''} ${item.name}`;
      group.appendChild(opt);
    });
    if (group.children.length > 0) selectEl.appendChild(group);
  });
}

// =============================================
// Event Binding
// =============================================

function bindEvents() {
  // Navigation Events
  dom.navDashboard.addEventListener('click', (e) => {
    e.preventDefault();
    state.currentView = 'dashboard';
    dom.navDashboard.classList.add('active');
    dom.navTrend.classList.remove('active');
    if (state.selectedCommodity) updateViews();
  });

  dom.navTrend.addEventListener('click', (e) => {
    e.preventDefault();
    state.currentView = 'trend';
    dom.navTrend.classList.add('active');
    dom.navDashboard.classList.remove('active');
    if (state.selectedCommodity) updateViews();
  });

  // Mobile Nav Events
  const mobileNavItems = document.querySelectorAll('.mobile-bottom-nav .nav-item');
  mobileNavItems.forEach(item => {
    item.addEventListener('click', (e) => {
      const target = e.currentTarget.getAttribute('data-target');
      if(target === 'dashboardContent') {
        state.currentView = 'dashboard';
        mobileNavItems.forEach(nav => nav.classList.remove('active'));
        e.currentTarget.classList.add('active');
        if (state.selectedCommodity) updateViews();
      } else if(target === 'trenPasarContent') {
        state.currentView = 'trend';
        mobileNavItems.forEach(nav => nav.classList.remove('active'));
        e.currentTarget.classList.add('active');
        if (state.selectedCommodity) updateViews();
      }
    });
  });

  dom.selectProvince.addEventListener('change', async (e) => {
    const id = parseInt(e.target.value);
    state.selectedProvince = state.provinces.find(p => p.id === id) || null;
    state.selectedCity = null;
    dom.selectCity.innerHTML = '<option value="">Seluruh Kota</option>';
    
    if (id) {
      dom.selectCity.disabled = true;
      const cities = await fetchCities(id);
      state.cities = cities;
      populateSelect(dom.selectCity, cities, 'name', 'id');
      dom.selectCity.disabled = false;
    } else {
      dom.selectCity.disabled = true;
    }
  });

  dom.selectCity.addEventListener('change', (e) => {
    const id = parseInt(e.target.value);
    state.selectedCity = state.cities.find(c => c.id === id) || null;
  });

  dom.selectCommodity.addEventListener('change', async (e) => {
    const id = parseInt(e.target.value);
    state.selectedCommodity = state.commodities.find(c => c.id === id) || null;
    if (id) {
        await loadDashboardData(id);
    } else {
        dom.emptyState.classList.remove('hidden');
        dom.viewDashboard.classList.add('hidden');
        dom.viewTrend.classList.add('hidden');
    }
  });

  dom.btnRefresh.addEventListener('click', async () => {
     if (state.selectedCommodity) {
         await loadDashboardData(state.selectedCommodity.id);
     } else {
         alert('Tentukan prioritas komoditas Anda terlebih dahulu di area Filter!');
     }
  });

  // Modal events
  const openModal = (e) => { e.preventDefault(); dom.reportModal.classList.remove('hidden'); };
  const closeModal = () => dom.reportModal.classList.add('hidden');

  if(dom.btnReportAction) dom.btnReportAction.addEventListener('click', openModal);
  if(dom.btnSideLapor) dom.btnSideLapor.addEventListener('click', openModal);
  if(dom.btnSidebarLapor) dom.btnSidebarLapor.addEventListener('click', openModal);
  
  if(dom.btnCloseModal) dom.btnCloseModal.addEventListener('click', closeModal);
  if(dom.btnCancelReport) dom.btnCancelReport.addEventListener('click', closeModal);

  if(dom.reportForm) dom.reportForm.addEventListener('submit', handleReportSubmit);

  const btnProfileSettings = document.getElementById('btn-profile-settings');
  if (btnProfileSettings) {
    btnProfileSettings.addEventListener('click', () => {
      const currentProxy = localStorage.getItem('tanicerdas_pihps_proxy') || '';
      const proxyKey = prompt('⚙️ [Opsi A] Pengaturan ScraperAPI Proxy\n\nUntuk mengambil data asli dari BI, masukkan API Key ScraperAPI Anda:\n(Kosongkan untuk menggunakan data simulasi)', currentProxy);
      
      if (proxyKey !== null) {
        localStorage.setItem('tanicerdas_pihps_proxy', proxyKey.trim());
        alert(proxyKey.trim() ? 'Proxy API Key disimpan! Data sekarang menggunakan koneksi proxy ScraperAPI.' : 'Proxy API Key dihapus. Menggunakan data simulasi fallback.');
      }
    });
  }
}

// =============================================
// Dashboard & View Logic
// =============================================

async function loadDashboardData(commodityId) {
    dom.viewDashboard.classList.add('hidden');
    dom.viewTrend.classList.add('hidden');
    dom.emptyState.classList.remove('hidden');
    
    // Animate loader within empty state
    const pulseRing = dom.emptyState.querySelector('.pulse-ring');
    if(pulseRing) pulseRing.style.borderColor = 'var(--emerald-500)';
    dom.emptyState.querySelector('h3').textContent = "Memproses Data Intelijen...";
    dom.emptyState.querySelector('p').textContent = "Menarik data pasar historis dari jaringan TaniCerdas...";

    // Fetch 50 items for the chart (the API supports a limit argument if we modify it, but fetchCrowdsourcedPrices uses default 10 if not provided. We will request 50)
    const [refPrices, crowdPrices] = await Promise.all([
      fetchReferencePrices(commodityId),
      fetchCrowdsourcedPrices(state.selectedProvince?.id, commodityId, 50)
    ]);
    
    state.referencePrices = refPrices;
    state.crowdsourcedPrices = crowdPrices;
    
    updateViews();
}

function updateViews() {
  if (!state.selectedCommodity) return;

  dom.emptyState.classList.add('hidden');
  
  if (state.currentView === 'dashboard') {
     dom.viewTrend.classList.add('hidden');
     dom.viewDashboard.classList.remove('hidden');
     renderDashboardMode();
  } else if (state.currentView === 'trend') {
     dom.viewDashboard.classList.add('hidden');
     dom.viewTrend.classList.remove('hidden');
     renderTrendMode();
  }
}

function renderDashboardMode() {
  // Uppercase for hero punch
  dom.heroCommodityName.textContent = state.selectedCommodity.name.toUpperCase();

  // 1. Calculate and Update HAP/HPP Stat
  if (state.referencePrices.length > 0) {
    const hap = state.referencePrices.find(p => p.price_type === 'hpp_produsen') || state.referencePrices[0];
    dom.statHapValue.textContent = formatRupiah(hap.price_per_unit);
    dom.statHapLabel.textContent = `${priceTypeLabel(hap.price_type)} / ${state.selectedCommodity.unit}`;
  } else {
    dom.statHapValue.textContent = "Data Nol";
    dom.statHapLabel.textContent = "HAP Belum Diatur Bapanas";
  }

  // 2. Calculate and Update Market/Crowdsourced Stat
  if (state.crowdsourcedPrices.length > 0) {
    const recentPrices = state.crowdsourcedPrices.slice(0, 10); // Use only top 10 for dashboard avg
    const sum = recentPrices.reduce((acc, curr) => acc + curr.reported_price, 0);
    const avg = sum / recentPrices.length;
    dom.statMarketValue.textContent = formatRupiah(avg);
    dom.statMarketLabel.textContent = `Valid dari ${recentPrices.length} narasumber terakhir`;
  } else {
    dom.statMarketValue.textContent = "Kosong";
    dom.statMarketLabel.textContent = "Belum ada penetrasi harga";
  }

  // 3. Update Recent Reports List
  dom.reportsList.innerHTML = '';
  if (state.crowdsourcedPrices.length === 0) {
    dom.reportsList.innerHTML = '<li style="padding: 2rem; text-align:center; color: var(--slate-500); font-size:0.9rem;">Radar belum menangkap aktivitas di wilayah ini.</li>';
  } else {
    state.crowdsourcedPrices.slice(0, 10).forEach(p => {
      const li = document.createElement('li');
      li.className = 'report-item';
      const loc = p.tani_cities?.name || p.tani_provinces?.name || 'Daerah ini';
      const dateStr = new Date(p.reported_at).toLocaleDateString('id-ID', {day:'numeric', month:'long'});
      
      li.innerHTML = `
        <div>
          <div class="ri-title">${p.buyer_type.toUpperCase()} di Wilayah ${loc}</div>
          <div class="ri-sub">${dateStr} ${p.reporter_name ? `• Reporter: ${p.reporter_name}` : ''}</div>
        </div>
        <div class="ri-price">${formatRupiah(p.reported_price)}</div>
      `;
      dom.reportsList.appendChild(li);
    });
  }

  // 4. Trigger Auto AI Analysis
  triggerAutoAnalysis();
}

function renderTrendMode() {
  if (state.chartInstance) {
    state.chartInstance.destroy();
  }

  // Prepare data (Reverse so oldest is first)
  const chartDataReversed = [...state.crowdsourcedPrices].reverse();
  
  const labels = chartDataReversed.map(p => {
     return new Date(p.reported_at).toLocaleDateString('id-ID', {day: 'numeric', month: 'short'});
  });
  
  const dataPoints = chartDataReversed.map(p => p.reported_price);

  if (labels.length === 0) {
    labels.push("Tak ada data");
    dataPoints.push(0);
  }

  const ctx = dom.trendChart.getContext('2d');
  
  // Create gradient
  const gradient = ctx.createLinearGradient(0, 0, 0, 400);
  gradient.addColorStop(0, 'rgba(5, 150, 105, 0.5)'); // Emerald 600
  gradient.addColorStop(1, 'rgba(5, 150, 105, 0.0)');

  state.chartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: `Pergerakan Harga ${state.selectedCommodity.name}`,
        data: dataPoints,
        borderColor: '#059669', // Emerald
        backgroundColor: gradient,
        borderWidth: 3,
        pointBackgroundColor: '#ffffff',
        pointBorderColor: '#059669',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        fill: true,
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#0f172a',
          titleFont: { family: 'Outfit', size: 14 },
          bodyFont: { family: 'Inter', size: 14 },
          padding: 12,
          displayColors: false,
          callbacks: {
            label: function(context) { return formatRupiah(context.parsed.y); }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: false,
          grid: { color: '#f1f5f9', drawBorder: false },
          ticks: {
            font: { family: 'Inter', size: 12 },
            color: '#64748b',
            callback: function(value) { return 'Rp ' + (value/1000) + 'k'; }
          }
        },
        x: {
          grid: { display: false, drawBorder: false },
          ticks: { font: { family: 'Inter', size: 12 }, color: '#64748b', maxRotation: 45, minRotation: 45 }
        }
      }
    }
  });
}

async function triggerAutoAnalysis() {
  if (state.isAnalyzing) return;
  state.isAnalyzing = true;
  
  // Show skeleton loading structure
  dom.aiContent.innerHTML = `
    <div class="skeleton-line full"></div>
    <div class="skeleton-line long"></div>
    <div class="skeleton-line medium mt-4"></div>
  `;
  dom.aiLoading.classList.remove('hidden');

  const context = buildContext({
    province: state.selectedProvince,
    city: state.selectedCity,
    commodity: state.selectedCommodity,
    referencePrices: state.referencePrices,
    crowdsourcedPrices: state.crowdsourcedPrices
  });

  const prompt = "Buat laporan singkat bergaya profesional. Beri kesimpulan di baris pertama (gunakan badge Wajar/Perlu Negosiasi/Tidak Wajar). Berikan minimal 1 target harga konkrit, dan 2 poin ringkas strategi penjualan untuk petani pada komoditas ini di area ini.";

  try {
    await sendMessage({
      message: prompt,
      context,
      onChunk: (chunk, fullText) => {
        dom.aiContent.innerHTML = formatAIResponse(fullText);
      },
      onDone: (fullText) => {
        dom.aiContent.innerHTML = formatAIResponse(fullText);
        dom.aiLoading.classList.add('hidden');
        state.isAnalyzing = false;
      },
      onError: (err) => {
        dom.aiContent.innerHTML = `<p style="color:var(--danger)">Gagal memuat intelijen buatan: ${err.message}</p>`;
        dom.aiLoading.classList.add('hidden');
        state.isAnalyzing = false;
      }
    });
  } catch (e) {
    state.isAnalyzing = false;
  }
}

// =============================================
// Formatting Utilities
// =============================================

function formatAIResponse(text) {
  let html = text
    .replace(/🟢\s*HARGA WAJAR/g, '<div class="verdict-badge verdict-fair">🟢 HARGA WAJAR & AMAN</div>')
    .replace(/🟡\s*PERLU NEGOSIASI/g, '<div class="verdict-badge verdict-negotiate">🟡 STATUS: HARUS NEGOSIASI</div>')
    .replace(/🔴\s*HARGA TIDAK WAJAR/g, '<div class="verdict-badge verdict-unfair">🔴 PERINGATAN: HARGA EKSTREM RENDAH</div>');
  
  html = html
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>');
  
  if (!html.startsWith('<')) html = `<p>${html}</p>`;
  return html;
}

// =============================================
// Price Report Submission
// =============================================

async function handleReportSubmit(e) {
  e.preventDefault();
  if (!state.selectedProvince || !state.selectedCommodity) {
    alert('Pilih provinsi dan komoditas terlebih dahulu di Command Center.'); return;
  }

  const price = parseFloat(dom.reportPrice.value);
  const buyerType = dom.reportBuyer.value;
  if (!price || price <= 0) return;

  try {
    const originalBtnText = dom.reportForm.querySelector('button[type="submit"]').textContent;
    dom.reportForm.querySelector('button[type="submit"]').textContent = 'Enkripsi Data...';
    dom.reportForm.querySelector('button[type="submit"]').disabled = true;

    await submitPriceReport({
      commodityId: state.selectedCommodity.id,
      provinceId: state.selectedProvince.id,
      cityId: state.selectedCity?.id,
      reportedPrice: price,
      buyerType,
      reporterName: null,
      notes: null
    });

    dom.reportModal.classList.add('hidden');
    dom.reportForm.reset();
    dom.reportForm.querySelector('button[type="submit"]').textContent = originalBtnText;
    dom.reportForm.querySelector('button[type="submit"]').disabled = false;
    
    // Refresh Dashbaod Automatically
    await loadDashboardData(state.selectedCommodity.id);

  } catch (error) {
    alert('Autentikasi gagal saat menyimpan data. Coba lagi.');
    dom.reportForm.querySelector('button[type="submit"]').disabled = false;
  }
}

document.addEventListener('DOMContentLoaded', init);
