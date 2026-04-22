import { supabase } from './supabase.js';

/**
 * Fetch all provinces
 */
export async function fetchProvinces() {
  const { data, error } = await supabase
    .from('tani_provinces')
    .select('id, name, code')
    .order('name');
  
  if (error) {
    console.error('Error fetching provinces:', error);
    return [];
  }
  return data || [];
}

/**
 * Fetch cities for a given province
 */
export async function fetchCities(provinceId) {
  if (!provinceId) return [];
  
  const { data, error } = await supabase
    .from('tani_cities')
    .select('id, name')
    .eq('province_id', provinceId)
    .order('name');
  
  if (error) {
    console.error('Error fetching cities:', error);
    return [];
  }
  return data || [];
}

/**
 * Fetch all commodities
 */
export async function fetchCommodities() {
  const { data, error } = await supabase
    .from('tani_commodities')
    .select('id, name, category, unit, icon')
    .order('category, name');
  
  if (error) {
    console.error('Error fetching commodities:', error);
    return [];
  }
  return data || [];
}

/**
 * Fetch reference prices, optionally filtered by commodity
 */
export async function fetchReferencePrices(commodityId = null) {
  let query = supabase
    .from('tani_reference_prices')
    .select(`
      id, price_type, price_per_unit, effective_date, source, notes,
      tani_commodities (id, name, unit, icon, category)
    `)
    .order('commodity_id');
  
  if (commodityId) {
    query = query.eq('commodity_id', commodityId);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching reference prices:', error);
    return [];
  }
  return data || [];
}

/**
 * Fetch PIHPS prices representing crowdsourced data from BI
 */
export async function fetchCrowdsourcedPrices(provinceId, commodityId, limit = 10) {
  let commodityName = 'Beras';
  let provinceName = 'Nasional';

  if (commodityId) {
    const { data: com } = await supabase.from('tani_commodities').select('name').eq('id', commodityId).single();
    if (com) commodityName = com.name;
  }
  if (provinceId) {
    const { data: prov } = await supabase.from('tani_provinces').select('name').eq('id', provinceId).single();
    if (prov) provinceName = prov.name;
  }

  const proxyKey = localStorage.getItem('tanicerdas_pihps_proxy');

  const { data, error } = await supabase.functions.invoke('sync-pihps', {
    body: { commodityName, provinceName, limit, scraperApiKey: proxyKey || undefined }
  });
  
  if (error) {
    console.error('Error fetching PIHPS data via Edge Function:', error);
    return [];
  }
  return data || [];
}

/**
 * Submit a crowdsourced price report
 */
export async function submitPriceReport({
  commodityId,
  provinceId,
  cityId,
  reportedPrice,
  buyerType,
  reporterName,
  notes
}) {
  const { data, error } = await supabase
    .from('tani_crowdsourced_prices')
    .insert({
      commodity_id: commodityId,
      province_id: provinceId,
      city_id: cityId || null,
      reported_price: reportedPrice,
      buyer_type: buyerType,
      reporter_name: reporterName || null,
      notes: notes || null
    })
    .select();
  
  if (error) {
    console.error('Error submitting price report:', error);
    throw error;
  }
  return data;
}

/**
 * Fetch B2B Marketplace Listings from Supabase (using crowdsourced_prices table as a hack)
 */
export async function fetchMarketplaceListings() {
  const { data, error } = await supabase
    .from('tani_crowdsourced_prices')
    .select('*')
    .eq('buyer_type', 'B2B_LISTING')
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    console.error('Error fetching marketplace:', error);
    return [];
  }

  // Parse notes JSON back to listing objects
  return data.map(item => {
    try {
      const details = JSON.parse(item.notes);
      return {
        id: item.id,
        commodity: details.commodity || 'Komoditas',
        qty: details.qty || 0,
        price: item.reported_price,
        location: details.location || 'Indonesia',
        contact: item.reporter_name || '',
        status: details.status || 'available',
        timestamp: item.created_at
      };
    } catch (e) {
      return null;
    }
  }).filter(Boolean);
}

/**
 * Submit B2B Marketplace Listing to Supabase
 */
export async function submitMarketplaceListing(listing) {
  // Use commodity_id 1 and province_id 31 as dummies to bypass constraints
  const { data, error } = await supabase
    .from('tani_crowdsourced_prices')
    .insert({
      commodity_id: 1, 
      province_id: 31,
      reported_price: listing.price,
      buyer_type: 'B2B_LISTING',
      reporter_name: listing.contact,
      notes: JSON.stringify({
        commodity: listing.commodity,
        qty: listing.qty,
        location: listing.location,
        status: listing.status
      })
    });

  if (error) throw error;
  return data;
}

/**
 * Format currency to Indonesian Rupiah
 */
export function formatRupiah(amount) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

/**
 * Translate price_type to friendly label
 */
export function priceTypeLabel(type) {
  const labels = {
    'hpp_produsen': 'HPP Produsen',
    'hap_produsen': 'HAP Produsen',
    'hap_konsumen': 'HAP Konsumen',
    'hpp_konsumen': 'HPP Konsumen'
  };
  return labels[type] || type;
}
