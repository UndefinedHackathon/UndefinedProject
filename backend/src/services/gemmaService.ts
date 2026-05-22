// [AI-Agent: Skills] Gemma/Ollama servisi Skills Agent tarafından oluşturulmuştur.
// Timeout, fallback ve hata yönetimi dahil.
// Manuel revizyon: Samet tarafından test edilip onaylanacak.

import axios from 'axios';
import type { GemmaResponse, AnalizSonucu } from '../types/stockpilot.types';

// ============================================================
// Konfigürasyon
// ============================================================

const GEMMA_BASE_URL = process.env.GEMMA_BASE_URL || 'http://localhost:11434';
const GEMMA_MODEL = process.env.GEMMA_MODEL || 'gemma3:4b';
const GEMMA_TIMEOUT = Number(process.env.GEMMA_TIMEOUT) || 15000; // 15 sn

// ============================================================
// Ana Fonksiyon — callGemma
// ============================================================

/**
 * Gemma modeline prompt gönderir ve yanıt alır.
 * Timeout veya hata durumunda otomatik fallback cevap üretir.
 *
 * @param prompt - Gemma'ya gönderilecek metin
 * @returns GemmaResponse — { text, isFromFallback }
 */
export async function callGemma(prompt: string): Promise<GemmaResponse> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), GEMMA_TIMEOUT);

    console.log(`🤖 Gemma'ya istek gönderiliyor (model: ${GEMMA_MODEL})...`);

    const response = await axios.post(
      `${GEMMA_BASE_URL}/api/generate`,
      {
        model: GEMMA_MODEL,
        prompt,
        stream: false,
      },
      {
        signal: controller.signal,
        timeout: GEMMA_TIMEOUT,
      }
    );

    clearTimeout(timeout);
    console.log('✅ Gemma yanıt verdi.');

    return {
      text: response.data.response || response.data.message || '',
      isFromFallback: false,
    };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Bilinmeyen hata';

    if (axios.isCancel(err)) {
      console.warn(`⚠️ Gemma ${GEMMA_TIMEOUT}ms içinde yanıt vermedi (timeout).`);
    } else {
      console.warn(`⚠️ Gemma bağlantı hatası: ${errorMessage}`);
    }

    return {
      text: '',
      isFromFallback: true,
    };
  }
}

// ============================================================
// Özelleştirilmiş Gemma Çağrıları
// ============================================================

/**
 * Yönetici özeti oluşturur — Analiz sonuçlarını Türkçe özetleyen prompt.
 * Dashboard'da gösterilecek AI açıklaması.
 */
export async function generateYoneticiOzeti(analiz: AnalizSonucu): Promise<GemmaResponse> {
  const kirmizi = analiz.kritikStoklar.filter((k) => k.level === 'Kırmızı').length;
  const sari = analiz.kritikStoklar.filter((k) => k.level === 'Sarı').length;
  const toplamKayip = analiz.receteSapmasi
    ? analiz.receteSapmasi.reduce((t, r) => t + r.estimatedLoss, 0)
    : 0;

  const prompt = `Sen bir restoran yönetim asistanısın. Aşağıdaki günlük analiz sonuçlarını kısa ve öz Türkçe özetle. Jargon kullanma, patron gibi konuş.

Veriler:
- Bugün toplam ${analiz.toplamSatisAdedi} ürün satıldı, toplam gelir: ${analiz.toplamGelir.toFixed(2)} TL
- ${kirmizi} malzeme KRİTİK seviyede (tükendi veya tükenmek üzere)
- ${sari} malzeme DİKKAT seviyesinde (azalıyor)
- Tahmini kayıp/fire: ${toplamKayip.toFixed(2)} TL
- Satın alma gereken malzeme sayısı: ${analiz.satinAlmaOnerisi.length}

En çok satan ürün: ${analiz.urunSatisOzeti[0]?.productName || 'Veri yok'} (${analiz.urunSatisOzeti[0]?.quantity || 0} adet)

2-3 cümlelik kısa bir yönetici özeti yaz. Emoji kullanabilirsin.`;

  const response = await callGemma(prompt);

  // Fallback ise şablon kullan
  if (response.isFromFallback) {
    return {
      text: `📊 Bugün ${analiz.toplamSatisAdedi} ürün satıldı, toplam gelir ${analiz.toplamGelir.toFixed(2)} TL. ` +
        `${kirmizi} kritik, ${sari} dikkat gerektiren stok var. ` +
        (toplamKayip > 0 ? `Tahmini kayıp: ${toplamKayip.toFixed(2)} TL. ` : '') +
        `Detaylar için analiz sekmesine göz atın.`,
      isFromFallback: true,
    };
  }

  return response;
}

/**
 * Gemma sağlık kontrolü — Ollama çalışıyor mu test eder.
 */
export async function checkGemmaHealth(): Promise<boolean> {
  try {
    const response = await axios.get(`${GEMMA_BASE_URL}/api/tags`, {
      timeout: 5000,
    });
    const models = response.data?.models || [];
    const gemmaFound = models.some((m: { name: string }) =>
      m.name.includes('gemma')
    );

    if (gemmaFound) {
      console.log('✅ Ollama çalışıyor, Gemma modeli mevcut.');
    } else {
      console.warn('⚠️ Ollama çalışıyor ama Gemma modeli bulunamadı.');
    }
    return gemmaFound;
  } catch {
    console.error('❌ Ollama erişilemedi. Gemma fallback modunda çalışacak.');
    return false;
  }
}