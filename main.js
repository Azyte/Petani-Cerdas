import './style.css';
import { fetchProvinces, fetchCities, fetchCommodities, fetchReferencePrices, fetchCrowdsourcedPrices, submitPriceReport, fetchMarketplaceListings, submitMarketplaceListing, formatRupiah, priceTypeLabel } from './src/data.js';
import { sendMessage, buildContext } from './src/chat.js';
import { registerSW } from 'virtual:pwa-register';
import { queueReport, getPendingReports, removeFromQueue, cacheData, getCachedData, isOnline, onConnectivityChange } from './src/offline.js';
import { getCurrentLang, setLang, t, getLanguages, getAILanguageInstruction } from './src/i18n.js';

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
  chartInstance: null,
  // New feature state
  listings: JSON.parse(localStorage.getItem('tc_listings') || '[]'),
  points: JSON.parse(localStorage.getItem('tc_points') || '{"xp":0,"reports":0,"logins":0}'),
  weather: null
};

// DOM References
const $ = (sel) => document.querySelector(sel);

const dom = {
  splash: $('#splash-screen'),
  mainApp: $('#main-app'),
  
  // Navigation
  navDashboard: $('#nav-dashboard'),
  navTrend: $('#nav-trend'),
  navMarketplace: $('#nav-marketplace'),
  navCommunity: $('#nav-community'),
  navRewards: $('#nav-rewards'),
  
  // Views
  viewDashboard: $('#view-dashboard'),
  viewTrend: $('#view-trend'),
  viewMarketplace: $('#view-marketplace'),
  viewCommunity: $('#view-community'),
  viewRewards: $('#view-rewards'),
  
  // Selectors
  selectProvince: $('#select-province'),
  selectCity: $('#select-city'),
  selectCommodity: $('#select-commodity'),
  btnRefresh: $('#btn-refresh'),
  
  // Dashboard Areas
  emptyState: $('#empty-state'),
  commandCenter: $('.command-center'),
  
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
  reportBuyer: $('#report-buyer'),
  reportPhoto: $('#report-photo'),
  photoPreview: $('#photo-preview'),
  
  // Marketplace
  marketplaceGrid: $('#marketplace-grid'),
  btnAddListing: $('#btn-add-listing'),
  listingModal: $('#listing-modal'),
  listingForm: $('#listing-form'),
  btnCloseListing: $('#btn-close-listing'),
  btnCancelListing: $('#btn-cancel-listing'),
  
  // Community
  leaderboardList: $('#leaderboard-list'),
  
  // Rewards
  rewardsLevelName: $('#rewards-level-name'),
  xpBar: $('#xp-bar'),
  xpLabel: $('#xp-label'),
  pointsNumber: $('#points-number'),
  achievementsGrid: $('#achievements-grid'),
  
  // Navbar extras
  connectivityBadge: $('#connectivity-badge'),
  langPicker: $('#lang-picker'),
  btnOpenSettings: $('#btn-open-settings'),
  
  // Settings Modal
  settingsModal: $('#settings-modal'),
  btnCloseSettings: $('#btn-close-settings'),
  btnCancelSettings: $('#btn-cancel-settings'),
  btnSaveSettings: $('#btn-save-settings'),
  inputProxyKey: $('#input-proxy-key')
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

    // Load weather data (non-blocking)
    fetchWeather();

    // Apply translations
    applyTranslations();

    // Sync any offline reports
    if (isOnline()) syncOfflineQueue();
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
  // Unified Navigation - Sidebar
  var sidebarNavs = document.querySelectorAll('#layout-menu .menu-item[data-view]');
  sidebarNavs.forEach(function(item) {
    item.addEventListener('click', function(e) {
      e.preventDefault();
      switchView(item.getAttribute('data-view'));
      sidebarNavs.forEach(function(n) { n.classList.remove('active'); });
      item.classList.add('active');
    });
  });

  // Unified Navigation - Mobile Bottom Nav
  var viewMap = { dashboardContent:'dashboard', trenPasarContent:'trend', marketplaceContent:'marketplace', communityContent:'community', rewardsContent:'rewards' };
  var mobileNavItems = document.querySelectorAll('.mobile-bottom-nav .nav-item');
  mobileNavItems.forEach(function(item) {
    item.addEventListener('click', function(e) {
      e.preventDefault();
      var target = item.getAttribute('data-target');
      if (viewMap[target]) {
        switchView(viewMap[target]);
        mobileNavItems.forEach(function(n) { n.classList.remove('active'); });
        item.classList.add('active');
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
  
  // Settings modal events
  if (dom.btnOpenSettings) {
    dom.btnOpenSettings.addEventListener('click', function() {
      dom.inputProxyKey.value = localStorage.getItem('tanicerdas_pihps_proxy') || '';
      dom.settingsModal.classList.remove('hidden');
    });
  }
  if (dom.btnCloseSettings) dom.btnCloseSettings.addEventListener('click', function() { dom.settingsModal.classList.add('hidden'); });
  if (dom.btnCancelSettings) dom.btnCancelSettings.addEventListener('click', function() { dom.settingsModal.classList.add('hidden'); });
  if (dom.btnSaveSettings) dom.btnSaveSettings.addEventListener('click', handleSettingsSave);

  // Photo preview
  if (dom.reportPhoto) {
    dom.reportPhoto.addEventListener('change', function(e) {
      var file = e.target.files[0];
      if (file) {
        var reader = new FileReader();
        reader.onload = function(ev) {
          dom.photoPreview.innerHTML = '<img src="' + ev.target.result + '" alt="preview">';
          dom.photoPreview.classList.remove('hidden');
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // Marketplace modal events
  if (dom.btnAddListing) dom.btnAddListing.addEventListener('click', function() { dom.listingModal.classList.remove('hidden'); });
  if (dom.btnCloseListing) dom.btnCloseListing.addEventListener('click', function() { dom.listingModal.classList.add('hidden'); });
  if (dom.btnCancelListing) dom.btnCancelListing.addEventListener('click', function() { dom.listingModal.classList.add('hidden'); });
  if (dom.listingForm) dom.listingForm.addEventListener('submit', handleListingSubmit);

  // Language picker
  if (dom.langPicker) {
    dom.langPicker.value = getCurrentLang();
    dom.langPicker.addEventListener('change', function() {
      setLang(dom.langPicker.value);
      applyTranslations();
    });
  }

  // Offline connectivity
  onConnectivityChange(function(online) {
    updateConnectivityBadge(online);
    if (online) syncOfflineQueue();
  });
  updateConnectivityBadge(isOnline());
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
    dom.emptyState.querySelector('h3').textContent = t('ai_loading');
    dom.emptyState.querySelector('p').textContent = t('hero_desc');

    try {
      // Fetch data
      const [refPrices, crowdPrices] = await Promise.all([
        fetchReferencePrices(commodityId),
        fetchCrowdsourcedPrices(state.selectedProvince?.id, commodityId, 50)
      ]);
      
      state.referencePrices = refPrices;
      state.crowdsourcedPrices = crowdPrices;

      // Cache for offline use
      if (isOnline()) {
        cacheData('last_ref_prices_' + commodityId, refPrices);
        cacheData('last_crowd_prices_' + commodityId + '_' + (state.selectedProvince?.id || 'nas'), crowdPrices);
      }
    } catch (error) {
      console.warn('Online fetch failed, trying cache...', error);
      const cachedRef = await getCachedData('last_ref_prices_' + commodityId);
      const cachedCrowd = await getCachedData('last_crowd_prices_' + commodityId + '_' + (state.selectedProvince?.id || 'nas'));
      if (cachedRef) state.referencePrices = cachedRef;
      if (cachedCrowd) state.crowdsourcedPrices = cachedCrowd;
    }
    
    updateViews();
}

function switchView(viewName) {
  state.currentView = viewName;
  // Hide all views
  var allViews = [dom.viewDashboard, dom.viewTrend, dom.viewMarketplace, dom.viewCommunity, dom.viewRewards];
  allViews.forEach(function(v) { if (v) v.classList.add('hidden'); });
  
  // Show/hide command center & empty state based on view type
  var dataViews = ['dashboard', 'trend'];
  if (dom.commandCenter) dom.commandCenter.style.display = dataViews.indexOf(viewName) >= 0 ? '' : 'none';
  if (dom.emptyState) dom.emptyState.style.display = dataViews.indexOf(viewName) >= 0 ? '' : 'none';

  if (viewName === 'dashboard' || viewName === 'trend') {
    if (state.selectedCommodity) updateViews();
    else {
      dom.emptyState.classList.remove('hidden');
      dom.emptyState.style.display = '';
    }
  } else if (viewName === 'marketplace') {
    dom.viewMarketplace.classList.remove('hidden');
    renderMarketplace();
  } else if (viewName === 'community') {
    dom.viewCommunity.classList.remove('hidden');
    renderCommunity();
  } else if (viewName === 'rewards') {
    dom.viewRewards.classList.remove('hidden');
    renderRewards();
  }
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

  // Render Weather at the top of trend view
  renderWeatherWidget(dom.viewTrend);

  // Prepare data (Reverse so oldest is first)
  const chartDataReversed = [...state.crowdsourcedPrices].reverse();
  
  const labels = chartDataReversed.map(p => {
     return new Date(p.reported_at).toLocaleDateString('id-ID', {day: 'numeric', month: 'short'});
  });
  
  const dataPoints = chartDataReversed.map(p => p.reported_price);

  // Add 3 days prediction (dashed line)
  const predictionLabels = ['T+1', 'T+2', 'T+3'];
  const lastPrice = dataPoints[dataPoints.length - 1] || 0;
  const predictionPoints = dataPoints.map(() => null); // padding for existing data
  
  // Simple "AI" prediction logic for demo (fluctuation around last price)
  const p1 = lastPrice * (1 + (Math.random() * 0.04 - 0.01));
  const p2 = p1 * (1 + (Math.random() * 0.04 - 0.01));
  const p3 = p2 * (1 + (Math.random() * 0.04 - 0.01));
  
  const fullLabels = [...labels, ...predictionLabels];
  const predictionLine = [...predictionPoints.slice(0, -1), lastPrice, p1, p2, p3];

  if (labels.length === 0) {
    labels.push("Tak ada data");
    dataPoints.push(0);
  }

  const ctx = dom.trendChart.getContext('2d');
  const gradient = ctx.createLinearGradient(0, 0, 0, 400);
  gradient.addColorStop(0, 'rgba(5, 150, 105, 0.5)'); 
  gradient.addColorStop(1, 'rgba(5, 150, 105, 0.0)');

  state.chartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: fullLabels,
      datasets: [
        {
          label: `Harga Realitas`,
          data: dataPoints,
          borderColor: '#059669',
          backgroundColor: gradient,
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointBackgroundColor: '#059669'
        },
        {
          label: `Prediksi AI (7 Hari Ke Depan)`,
          data: predictionLine,
          borderColor: '#f59e0b', // Gold
          borderDash: [5, 5],
          backgroundColor: 'transparent',
          fill: false,
          tension: 0.4,
          pointRadius: 4,
          pointBackgroundColor: '#f59e0b'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: true, position: 'top', labels: { font: { family: 'Inter', weight: '600' } } },
        tooltip: {
          backgroundColor: '#0f172a',
          titleFont: { family: 'Outfit', size: 14 },
          bodyFont: { family: 'Inter', size: 14 },
          padding: 12,
          displayColors: true
        }
      },
      scales: {
        y: {
          beginAtZero: false,
          grid: { color: '#f1f5f9' },
          ticks: { font: { family: 'Inter' }, callback: (v) => 'Rp ' + v.toLocaleString() }
        },
        x: {
          grid: { display: false },
          ticks: { font: { family: 'Inter' } }
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

  var context = buildContext({
    province: state.selectedProvince,
    city: state.selectedCity,
    commodity: state.selectedCommodity,
    referencePrices: state.referencePrices,
    crowdsourcedPrices: state.crowdsourcedPrices
  });

  // Add weather data to context if available
  if (state.weather) {
    context.weather = state.weather;
  }

  var langInstruction = getAILanguageInstruction();
  var prompt = langInstruction + "Buat laporan singkat bergaya profesional. Beri kesimpulan di baris pertama (gunakan badge Wajar/Perlu Negosiasi/Tidak Wajar). Berikan minimal 1 target harga konkrit, dan 2 poin ringkas strategi penjualan untuk petani pada komoditas ini di area ini. Jika ada data cuaca, sebutkan dampaknya ke harga.";

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

  var price = parseFloat(dom.reportPrice.value);
  var buyerType = dom.reportBuyer.value;
  if (!price || price <= 0) return;

  var reportData = {
    commodityId: state.selectedCommodity.id,
    provinceId: state.selectedProvince.id,
    cityId: state.selectedCity ? state.selectedCity.id : null,
    reportedPrice: price,
    buyerType: buyerType,
    reporterName: null,
    notes: null
  };

  try {
    var submitBtn = dom.reportForm.querySelector('button[type="submit"]');
    var originalBtnText = submitBtn.textContent;
    submitBtn.textContent = 'Enkripsi Data...';
    submitBtn.disabled = true;

    if (isOnline()) {
      await submitPriceReport(reportData);
    } else {
      await queueReport(reportData);
      alert(t('offline_queued'));
    }

    // Award points for reporting
    addPoints(10, 'report');

    dom.reportModal.classList.add('hidden');
    dom.reportForm.reset();
    if (dom.photoPreview) { dom.photoPreview.innerHTML = ''; dom.photoPreview.classList.add('hidden'); }
    submitBtn.textContent = originalBtnText;
    submitBtn.disabled = false;
    
    if (state.selectedCommodity && isOnline()) await loadDashboardData(state.selectedCommodity.id);

  } catch (error) {
    alert('Gagal menyimpan data. Coba lagi.');
    dom.reportForm.querySelector('button[type="submit"]').disabled = false;
  }
}

// =============================================
// MARKETPLACE — Listing CRUD (localStorage)
// =============================================

async function renderMarketplace() {
  if (!dom.marketplaceGrid) return;
  
  dom.marketplaceGrid.innerHTML = '<div class="marketplace-empty"><div class="pulse-ring" style="position:relative; width:40px; height:40px; margin: 0 auto; border-color:var(--emerald-500)"></div><p class="mt-4">Memuat pasar...</p></div>';
  
  let listings = [];
  try {
    if (isOnline()) {
      listings = await fetchMarketplaceListings();
      // Cache the listings just in case
      cacheData('cached_b2b_market', listings);
    } else {
      listings = await getCachedData('cached_b2b_market') || state.listings;
    }
  } catch (err) {
    console.error("Gagal memuat pasar:", err);
    listings = state.listings; // fallback to local state
  }
  
  if (!listings || listings.length === 0) {
    dom.marketplaceGrid.innerHTML = '<div class="marketplace-empty"><div class="marketplace-empty-icon">🏪</div><h3>Belum Ada Listing</h3><p>Jadilah yang pertama memasang komoditas Anda di pasar digital!</p></div>';
    return;
  }

  dom.marketplaceGrid.innerHTML = listings.map(function(item, idx) {
    var statusLabel = item.status === 'ready' ? 'Siap Panen' : 'Tersedia';
    var statusClass = item.status === 'ready' ? 'ready' : 'available';
    return '<div class="listing-card interactive-el">' +
      '<div class="listing-header"><span class="listing-commodity">' + item.commodity + '</span><span class="listing-status-badge ' + statusClass + '">' + statusLabel + '</span></div>' +
      '<div class="listing-price">' + formatRupiah(item.price) + '/kg</div>' +
      '<div class="listing-detail">' +
        '<div class="listing-detail-row"><span>Jumlah</span><strong>' + item.qty + ' kg</strong></div>' +
        '<div class="listing-detail-row"><span>Lokasi</span><strong>' + item.location + '</strong></div>' +
      '</div>' +
      '<div class="listing-footer">' +
        '<button class="btn-contact interactive-el" onclick="window.open(\'https://wa.me/' + item.contact.replace(/^0/,'62') + '\',\'_blank\')">Hubungi via WA</button>' +
      '</div>' +
    '</div>';
  }).join('');
  
  // Re-init ripples for new elements
  initRipples();
}

async function handleListingSubmit(e) {
  e.preventDefault();
  
  var submitBtn = dom.listingForm.querySelector('button[type="submit"]');
  var originalBtnText = submitBtn.textContent;
  submitBtn.textContent = 'Memproses...';
  submitBtn.disabled = true;

  var newListing = {
    commodityId: state.selectedCommodity ? state.selectedCommodity.id : 1,
    provinceId: state.selectedProvince ? state.selectedProvince.id : 31,
    commodity: document.getElementById('listing-commodity').value,
    qty: parseInt(document.getElementById('listing-qty').value),
    price: parseInt(document.getElementById('listing-price').value),
    location: document.getElementById('listing-location').value,
    contact: document.getElementById('listing-contact').value,
    status: document.getElementById('listing-status').value
  };
  
  try {
    if (isOnline()) {
      await submitMarketplaceListing(newListing);
    } else {
      // Fallback local state if offline
      newListing.id = Date.now();
      state.listings.push(newListing);
      localStorage.setItem('tc_listings', JSON.stringify(state.listings));
      alert('Anda sedang offline. Listing disimpan lokal.');
    }
    
    addPoints(15, 'listing');
    
    dom.listingModal.classList.add('hidden');
    dom.listingForm.reset();
    renderMarketplace();
    
    // Add success toast/alert
    if (isOnline()) alert("✅ Lapak berhasil tayang di Pasar B2B secara Global!");
    
  } catch (error) {
    console.error("Gagal submit listing:", error);
    alert("Gagal memposting lapak: " + (error.message || "Kesalahan koneksi ke Supabase."));
  } finally {
    submitBtn.textContent = originalBtnText;
    submitBtn.disabled = false;
  }
}

// =============================================
// COMMUNITY — Leaderboard
// =============================================

function renderCommunity() {
  if (!dom.leaderboardList) return;
  
  var reporters = generateLeaderboardData();
  
  dom.leaderboardList.innerHTML = reporters.map(function(r, idx) {
    var rankClass = idx < 3 ? ' lb-rank-' + (idx+1) : '';
    var medal = idx === 0 ? '\ud83e\udd47' : idx === 1 ? '\ud83e\udd48' : idx === 2 ? '\ud83e\udd49' : (idx+1);
    var level = getLevel(r.reports);
    return '<li class="leaderboard-item">' +
      '<span class="lb-rank' + rankClass + '">' + medal + '</span>' +
      '<div class="lb-avatar">\ud83e\uddd1\u200d\ud83c\udf3e</div>' +
      '<div class="lb-info"><div class="lb-name">' + r.name + '</div><div class="lb-stats">' + r.reports + ' laporan</div></div>' +
      '<span class="lb-badge ' + level.css + '">' + level.name + '</span>' +
    '</li>';
  }).join('');
}

function generateLeaderboardData() {
  var names = ['Pak Suharto', 'Bu Siti Aminah', 'Mas Budi Prasetyo', 'Pak Joko Widodo', 'Bu Mega Lestari', 'Pak Ahmad Dahlan', 'Bu Kartini', 'Mas Rudi Hartono', 'Pak Surya Darma', 'Bu Anisa Rahma'];
  var myReports = state.points.reports || 0;
  var data = names.map(function(name, i) {
    return { name: name, reports: Math.max(1, 50 - i * 5 + Math.floor(Math.random() * 3)) };
  });
  data.push({ name: 'Anda \u2b50', reports: myReports });
  data.sort(function(a, b) { return b.reports - a.reports; });
  return data.slice(0, 10);
}

function getLevel(reports) {
  if (reports >= 50) return { name: t('community_level_legenda'), css: 'legenda' };
  if (reports >= 20) return { name: t('community_level_ahli'), css: 'ahli' };
  if (reports >= 5) return { name: t('community_level_aktif'), css: 'aktif' };
  return { name: t('community_level_pemula'), css: 'pemula' };
}

// =============================================
// REWARDS & GAMIFICATION
// =============================================

var ACHIEVEMENTS = [
  { id: 'first_report', icon: '\ud83d\udcdd', name: 'Laporan Pertama', desc: 'Kirim 1 laporan harga', need: 1, type: 'reports' },
  { id: 'active_5', icon: '\ud83d\udd25', name: 'Petani Aktif', desc: 'Kirim 5 laporan harga', need: 5, type: 'reports' },
  { id: 'expert_20', icon: '\ud83c\udf1f', name: 'Ahli Pasar', desc: 'Kirim 20 laporan harga', need: 20, type: 'reports' },
  { id: 'legend_50', icon: '\ud83d\udc51', name: 'Legenda Tani', desc: 'Kirim 50 laporan harga', need: 50, type: 'reports' },
  { id: 'first_listing', icon: '\ud83c\udfea', name: 'Pedagang Pertama', desc: 'Pasang 1 listing di pasar', need: 1, type: 'listings' },
  { id: 'trader_5', icon: '\ud83d\udcb0', name: 'Pengusaha Tani', desc: 'Pasang 5 listing di pasar', need: 5, type: 'listings' }
];

function addPoints(amount, type) {
  state.points.xp = (state.points.xp || 0) + amount;
  if (type === 'report') state.points.reports = (state.points.reports || 0) + 1;
  if (type === 'listing') state.points.listings = (state.points.listings || 0) + 1;
  localStorage.setItem('tc_points', JSON.stringify(state.points));
}

function renderRewards() {
  var xp = state.points.xp || 0;
  var levelThresholds = [
    { name: t('community_level_pemula'), min: 0, max: 100 },
    { name: t('community_level_aktif'), min: 100, max: 300 },
    { name: t('community_level_ahli'), min: 300, max: 700 },
    { name: t('community_level_legenda'), min: 700, max: 9999 }
  ];
  
  var currentLevel = levelThresholds[0];
  for (var i = 0; i < levelThresholds.length; i++) {
    if (xp >= levelThresholds[i].min) currentLevel = levelThresholds[i];
  }
  
  var progress = Math.min(100, ((xp - currentLevel.min) / (currentLevel.max - currentLevel.min)) * 100);
  
  if (dom.rewardsLevelName) dom.rewardsLevelName.textContent = currentLevel.name;
  if (dom.xpBar) dom.xpBar.style.width = progress + '%';
  if (dom.xpLabel) dom.xpLabel.textContent = xp + ' / ' + currentLevel.max + ' XP';
  if (dom.pointsNumber) dom.pointsNumber.textContent = xp;

  // Achievements
  if (dom.achievementsGrid) {
    dom.achievementsGrid.innerHTML = ACHIEVEMENTS.map(function(a) {
      var current = a.type === 'reports' ? (state.points.reports || 0) : (state.points.listings || 0);
      var unlocked = current >= a.need;
      return '<div class="achievement-card' + (unlocked ? '' : ' locked') + '">' +
        '<div class="achievement-icon">' + a.icon + '</div>' +
        '<div class="achievement-name">' + a.name + '</div>' +
        '<div class="achievement-desc">' + (unlocked ? '\u2705 Tercapai!' : current + '/' + a.need) + '</div>' +
      '</div>';
    }).join('');
  }
}

// =============================================
// OFFLINE SYNC
// =============================================

function updateConnectivityBadge(online) {
  if (!dom.connectivityBadge) return;
  if (online) {
    dom.connectivityBadge.textContent = '\ud83d\udfe2 ' + t('online_badge');
    dom.connectivityBadge.className = 'connectivity-badge online';
  } else {
    dom.connectivityBadge.textContent = '\ud83d\udd34 ' + t('offline_badge');
    dom.connectivityBadge.className = 'connectivity-badge offline';
  }
}

async function syncOfflineQueue() {
  try {
    var pending = await getPendingReports();
    for (var i = 0; i < pending.length; i++) {
      var report = pending[i];
      try {
        await submitPriceReport(report);
        await removeFromQueue(report.id);
        console.log('Synced offline report:', report.id);
      } catch (err) {
        console.error('Failed to sync report:', err);
      }
    }
  } catch (err) {
    console.error('Error reading offline queue:', err);
  }
}

// =============================================
// WEATHER (Open-Meteo API — free, no key needed)
// =============================================

async function fetchWeather() {
  try {
    var lat = -6.2; var lon = 106.8; // Default: Jakarta
    var resp = await fetch('https://api.open-meteo.com/v1/forecast?latitude=' + lat + '&longitude=' + lon + '&current=temperature_2m,relative_humidity_2m,precipitation&timezone=Asia/Jakarta');
    var data = await resp.json();
    if (data && data.current) {
      state.weather = {
        temp: data.current.temperature_2m,
        humidity: data.current.relative_humidity_2m,
        rain: data.current.precipitation
      };
    }
  } catch (err) {
    console.error('Weather fetch error:', err);
  }
}

function renderWeatherWidget(container) {
  if (!state.weather || !container) return;
  var w = state.weather;
  var existing = container.querySelector('.weather-widget');
  if (existing) existing.remove();
  
  var div = document.createElement('div');
  div.className = 'weather-widget';
  div.innerHTML = '<div class="weather-item"><div class="weather-value">' + w.temp + '\u00b0C</div><div class="weather-label">' + t('weather_temp') + '</div></div>' +
    '<div class="weather-item"><div class="weather-value">' + w.rain + ' mm</div><div class="weather-label">' + t('weather_rain') + '</div></div>' +
    '<div class="weather-item"><div class="weather-value">' + w.humidity + '%</div><div class="weather-label">' + t('weather_humidity') + '</div></div>';
  container.insertBefore(div, container.firstChild);
}

// =============================================
// i18n — Apply Translations to UI
// =============================================

function applyTranslations() {
  // Mobile nav labels
  var mobileNavLabels = document.querySelectorAll('.mobile-bottom-nav .nav-item span');
  var navKeys = ['nav_home', 'nav_trend', 'nav_market', 'nav_community', 'nav_rewards'];
  mobileNavLabels.forEach(function(el, i) {
    if (navKeys[i]) el.textContent = t(navKeys[i]);
  });
  
  // Data-i18n elements
  document.querySelectorAll('[data-i18n]').forEach(function(el) {
    el.textContent = t(el.getAttribute('data-i18n'));
  });
  
  // Connectivity badge
  updateConnectivityBadge(isOnline());
}

function handleSettingsSave() {
  var key = dom.inputProxyKey.value.trim();
  localStorage.setItem('tanicerdas_pihps_proxy', key);
  dom.settingsModal.classList.add('hidden');
  
  if (key) {
    alert('✅ API Key berhasil disimpan! Koneksi ke data BI sekarang aktif melalui proxy.');
  } else {
    alert('ℹ️ API Key dihapus. Aplikasi kembali menggunakan mode simulasi.');
  }
}

// =============================================
// RIPPLE EFFECT LOGIC
// =============================================
function createRipple(event) {
  const button = event.currentTarget;
  const circle = document.createElement("span");
  const diameter = Math.max(button.clientWidth, button.clientHeight);
  const radius = diameter / 2;

  const rect = button.getBoundingClientRect();
  circle.style.width = circle.style.height = `${diameter}px`;
  circle.style.left = `${event.clientX - rect.left - radius}px`;
  circle.style.top = `${event.clientY - rect.top - radius}px`;
  circle.classList.add("ripple");

  const ripple = button.getElementsByClassName("ripple")[0];
  if (ripple) { ripple.remove(); }
  button.appendChild(circle);
}

function initRipples() {
  const buttons = document.querySelectorAll('.btn-emerald, .btn-ghost, .nav-item, .listing-card, .btn-contact');
  buttons.forEach(btn => {
    btn.classList.add('interactive-el');
    btn.addEventListener('click', createRipple);
  });
}

// Override Init
const originalInit = init;
init = async function() {
  await originalInit();
  initRipples();
}

document.addEventListener('DOMContentLoaded', init);
