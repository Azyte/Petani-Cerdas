import { SUPABASE_URL, SUPABASE_ANON_KEY } from './supabase.js';

/**
 * Chat engine for TaniCerdas AI
 * Communicates with the Supabase Edge Function which proxies to Gemini AI
 */

/**
 * Send a message to the AI and get a streaming response
 * @param {Object} params - Chat parameters
 * @param {string} params.message - User's message
 * @param {Object} params.context - Contextual data (region, commodity, prices)
 * @param {string} params.image - Base64 encoded image (optional)
 * @param {Function} params.onChunk - Callback for each text chunk
 * @param {Function} params.onDone - Callback when stream is complete
 * @param {Function} params.onError - Callback on error
 */
export async function sendMessage({ message, context, image, onChunk, onDone, onError }) {
  const maxRetries = 3;
  let attempt = 0;
  let response;

  try {
    // 1. Fetch dengan mekanisme Retry
    while (attempt < maxRetries) {
      try {
        response = await fetch(`${SUPABASE_URL}/functions/v1/tani-cerdas-chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
          },
          body: JSON.stringify({ message, context, image })
        });

        if (!response.ok) {
          const errorText = await response.text();
          if (response.status === 503 || errorText.includes('503 Service Unavailable') || errorText.includes('high demand')) {
            attempt++;
            if (attempt >= maxRetries) {
              throw new Error(`Sistem AI sedang sangat sibuk (High Demand). Silakan coba lagi dalam beberapa menit.`);
            }
            if (onChunk && attempt === 1) onChunk(`\n\n_Server AI sedang padat, mencoba ulang (Percobaan ${attempt}/${maxRetries})..._`, '');
            await new Promise(resolve => setTimeout(resolve, 1500 * attempt));
            continue;
          }
          throw new Error(`API Error ${response.status}: ${errorText}`);
        }
        break; // Keluar dari loop jika sukses
      } catch (error) {
        if (attempt >= maxRetries - 1 || (!error.message.includes('503') && !error.message.includes('High Demand'))) {
          throw error;
        }
        attempt++;
        await new Promise(resolve => setTimeout(resolve, 1500 * attempt));
      }
    }

    // 2. Baca response
    const contentType = response.headers.get('content-type') || '';
    
    if (contentType.includes('text/event-stream') || contentType.includes('text/plain')) {
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        fullText += chunk;
        if (onChunk) onChunk(chunk, fullText);
      }
      
      if (onDone) onDone(fullText);
      return fullText;
    } else {
      const data = await response.json();
      const text = data.text || data.reply || data.message || JSON.stringify(data);
      if (onChunk) onChunk(text, text);
      if (onDone) onDone(text);
      return text;
    }

  } catch (error) {
    console.error('Chat error:', error);
    if (onError) onError(error);
    throw error;
  }
}

/**
 * Build context object from current app state
 */
export function buildContext({
  province,
  city,
  commodity,
  referencePrices,
  crowdsourcedPrices,
  offeredPrice
}) {
  return {
    region: {
      province: province?.name || null,
      city: city?.name || null
    },
    commodity: commodity ? {
      name: commodity.name,
      category: commodity.category,
      unit: commodity.unit
    } : null,
    referencePrices: (referencePrices || []).map(rp => ({
      type: rp.price_type,
      price: rp.price_per_unit,
      source: rp.source,
      date: rp.effective_date
    })),
    crowdsourcedPrices: (crowdsourcedPrices || []).map(cp => ({
      price: cp.reported_price,
      buyerType: cp.buyer_type,
      reportedAt: cp.reported_at,
      province: cp.tani_provinces?.name,
      city: cp.tani_cities?.name
    })),
    offeredPrice: offeredPrice || null
  };
}
