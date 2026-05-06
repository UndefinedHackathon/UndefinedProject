// [AI-Agent: Skills] Copilot servisi — stockpilot-copilot, error-handling-patterns ve coding-standards skill'lerine uygun.
// Sorumlu: Samet
// System prompt hazırlama, context minimizasyonu ve fallback cevap mekanizması.
// Son Güncelleme: 2026-05-06

import { callGemma } from './gemmaService';
import { getLastAnalysis } from './databaseService';
import type {
  AnalizSonucu, CopilotCevap,
} from '../types/stockpilot.types';

// ═══════════════════════════════════════════════════════
// Sabitler
// ═══════════════════════════════════════════════════════

/** Hazır soru butonları — Frontend ile senkronize */
export const QUICK_QUESTIONS = [
  { id: 'biggest_loss',     label: '💸 En büyük kâr kaybım nerede?' },
  { id: 'critical_items',   label: '🔴 Hangi malzemeler kritik?' },
  { id: 'tomorrows_prep',   label: '📋 Yarın için ne hazırlamalıyım?' },
  { id: 'top_seller',       label: '🏆 En çok satan ürünüm ne?' },
  { id: 'purchase_summary', label: '🛒 Bugün ne satın almalıyım?' },
  { id: 'waste_summary',    label: '🗑️ Fire maliyetim ne kadar?' },
] as const;

/** System prompt — Gemma'nın nasıl davranacağını tanımlar */
const SYSTEM_PROMPT = `Sen StockPilot AI'ın akıllı, yardımsever ve sohbetkar asistanısın (Copilot).
Kafe ve restoran operasyon verilerini analiz eden bir sistemin parçasısın.

Kurallar:
1. SADECE SELAMLAŞMA: Eğer kullanıcı SADECE "merhaba", "selam" yazarsa ve başka bir şey sormazsa, sadece "Merhaba, size nasıl yardımcı olabilirim?" yaz.
2. DİREKT YANIT: Kullanıcı bir soru sorarsa (örneğin "kaşar peyniri ne durumda?"), cevabına ASLA "Merhaba, size nasıl yardımcı olabilirim?" diye başlama! Lafı uzatmadan doğrudan soruyu yanıtla.
3. HESAPLAMA VE PROJEKSİYON YAP: Kullanıcı "X malzemesi kaç gün yeter?" veya "ne zaman biter" gibi bir soru sorarsa, malzemenin kalan stoğunu, o günkü günlük kullanım (gunlukKullanim) miktarına bölerek kaç gün dayanacağını mantıklı bir şekilde hesapla. Kâr sorularında "gelir - maliyet = kâr" formülünü kullanarak verileri açıkla. Matematiğini adım adım açıkla.
4. UYDURMA: Yeni sayı, tahmin veya veri uydurma. Sadece elindeki güncel operasyon datasına güven.
5. Verilen datada olmayan bir şey sorulursa: "Bu bilgi mevcut analizde yok." şeklinde dürüstçe belirt.
6. DİL: Yanıtların Türkçe, akıcı ve bir asistan tonunda olsun. Aşırı uzun makaleler yazma ama tam ve açıklayıcı bilgiler ver.`;

/** Fallback cevaplar — Gemma yanıt vermezse kullanılır */
const FALLBACK_RESPONSES: Record<string, (analiz: AnalizSonucu) => string> = {
  biggest_loss: (a) => {
    if (!a.receteSapmasi || a.receteSapmasi.length === 0) {
      return '📊 Reçete sapması verisi henüz girilmemiş. Fiziksel stok sayımı yapıldığında kâr kaybı analizi mümkün olacak.';
    }
    const top = a.receteSapmasi[0];
    return `💸 En büyük kâr kaybınız **${top.ingredientName}** malzemesinde: ${top.estimatedLoss} TL tahmini kayıp (%${top.deviationPercent} sapma).`;
  },
  critical_items: (a) => {
    const kirmizi = a.kritikStoklar.filter((k) => k.level === 'Kırmızı');
    if (kirmizi.length === 0) return '✅ Kritik seviyede malzeme bulunmuyor.';
    return `🔴 Kritik malzemeler:\n${kirmizi.map((k) => `• ${k.ingredientName}: ${k.remainingStock.toFixed(1)} ${k.unit} kaldı`).join('\n')}`;
  },
  tomorrows_prep: (a) => {
    if (a.satinAlmaOnerisi.length === 0) return '✅ Tüm stoklar yeterli, ekstra hazırlık gerekmiyor.';
    return `📋 Yarın için hazırlanması gerekenler:\n${a.satinAlmaOnerisi.slice(0, 5).map((s) => `• ${s.ingredientName}: ${s.suggestedOrder} ${s.unit} sipariş et`).join('\n')}`;
  },
  top_seller: (a) => {
    if (a.urunSatisOzeti.length === 0) return '📊 Henüz satış verisi yok.';
    const top = a.urunSatisOzeti[0];
    return `🏆 En çok satan ürün: **${top.productName}** — ${top.quantity} adet, ${top.revenue} TL gelir.`;
  },
  purchase_summary: (a) => {
    if (a.satinAlmaOnerisi.length === 0) return '✅ Bugün satın alma ihtiyacı yok.';
    const toplam = a.satinAlmaOnerisi.reduce((t, s) => t + s.estimatedCost, 0);
    return `🛒 Satın alma özeti:\n${a.satinAlmaOnerisi.map((s) => `• ${s.ingredientName}: ${s.suggestedOrder} ${s.unit} (~${s.estimatedCost} TL)`).join('\n')}\n\n💰 Toplam: ${toplam.toFixed(2)} TL`;
  },
  waste_summary: (a) => {
    if (!a.receteSapmasi || a.receteSapmasi.length === 0) {
      return '📊 Fire verisi henüz mevcut değil. Fiziksel stok sayımı yapılmalı.';
    }
    const toplam = a.receteSapmasi.reduce((t, r) => t + r.estimatedLoss, 0);
    return `🗑️ Fire maliyeti:\n${a.receteSapmasi.map((r) => `• ${r.ingredientName}: ${r.deviation} ${r.unit} fark → ${r.estimatedLoss} TL`).join('\n')}\n\n💸 Toplam tahmini kayıp: ${toplam.toFixed(2)} TL`;
  },
};

/** Genel fallback — tanınmayan soru için */
const GENERIC_FALLBACK = '🤖 Şu an AI asistanı yanıt veremiyor. Analiz sonuçlarını dashboard\'dan inceleyebilirsiniz.';

// ═══════════════════════════════════════════════════════
// Yardımcı Fonksiyonlar
// ═══════════════════════════════════════════════════════

// [AI-Agent: Skills] getLastAnalysis() artık databaseService.ts'den import ediliyor.
// Tek kaynak prensibi: analysis_results sorguları databaseService üzerinden yapılır.

/**
 * Analiz verisini Gemma context'i için minimize eder.
 * Token limiti aşmamak için sadece ilk 3-5 item gösterir.
 *
 * @param analiz - Tam analiz sonucu
 * @returns Minimized JSON string
 */
function minimizeContext(analiz: AnalizSonucu): string {
  // [AI-Agent: Skills] Token optimizasyonu — stockpilot-copilot skill'ine uygun.
  // Context JSON'u minimize et (sadece ilk 3-5 item), toplam token < 800 tut.
  const ozet = {
    toplamSatis: analiz.toplamSatisAdedi,
    toplamGelir: analiz.toplamGelir,
    toplamKar: analiz.toplamKar,
    enCokSatan: analiz.urunSatisOzeti.slice(0, 5).map((u) => ({
      urun: u.productName,
      adet: u.quantity,
      gelir: u.revenue,
      kar: u.profit,
    })),
    stokDurumu: analiz.teorikTuketim.map((t) => ({
      malzeme: t.ingredientName,
      kalan: t.remainingStock,
      gunlukKullanim: t.theoreticalUsage,
      birim: t.unit
    })),
    kritikStoklar: analiz.kritikStoklar.slice(0, 5).map((k) => ({
      malzeme: k.ingredientName,
      kalan: `${k.remainingStock.toFixed(1)} ${k.unit}`,
      seviye: k.level,
    })),
    satinAlma: analiz.satinAlmaOnerisi.slice(0, 5).map((s) => ({
      malzeme: s.ingredientName,
      miktar: `${s.suggestedOrder} ${s.unit}`,
      maliyet: s.estimatedCost,
    })),
    receteSapmasi: analiz.receteSapmasi?.slice(0, 3).map((r) => ({
      malzeme: r.ingredientName,
      sapma: `${r.deviation} ${r.unit}`,
      kayip: r.estimatedLoss,
    })) || [],
  };

  return JSON.stringify(ozet, null, 0);
}

/**
 * Hazır soru ID'sini kullanıcı dostu soruya çevirir.
 */
function resolveQuickQuestion(questionText: string): string | null {
  const match = QUICK_QUESTIONS.find((q) => q.label === questionText || q.id === questionText);
  return match ? match.label : null;
}

// ═══════════════════════════════════════════════════════
// Ana Fonksiyon — Copilot Sorusunu Cevapla
// ═══════════════════════════════════════════════════════

/**
 * Kullanıcının sorusunu son analiz verisi context'inde Gemma ile cevaplar.
 * Gemma yanıt vermezse (timeout/hata) fallback cevap üretir.
 *
 * @param question - Kullanıcının sorusu
 * @param type - 'quick' (hazır buton) veya 'free' (serbest soru)
 * @returns CopilotCevap
 */
export async function askCopilot(
  question: string,
  type: 'quick' | 'free' = 'free'
): Promise<CopilotCevap> {
  const baslangic = Date.now();

  // 1. Son analizi çek
  const analiz = await getLastAnalysis();

  if (!analiz) {
    console.warn('⚠️ Copilot: Henüz analiz sonucu yok.');
    return {
      answer: '📊 Henüz analiz yapılmamış. Önce Dashboard\'dan "Analiz Et" butonuna basın.',
      isFromFallback: true,
      timestamp: new Date().toISOString(),
    };
  }

  // 2. Context hazırla (minimize edilmiş)
  const context = minimizeContext(analiz);

  // 3. Prompt oluştur
  const fullPrompt = `${SYSTEM_PROMPT}

Bugünün operasyon verisi:
${context}

Kullanıcı Sorusu: ${question}`;

  console.log(`🤖 Copilot sorusu: "${question}" (${type})`);

  // 4. Gemma'ya gönder
  const gemmaResponse = await callGemma(fullPrompt);

  // 5. Fallback kontrolü
  if (gemmaResponse.isFromFallback || !gemmaResponse.text.trim()) {
    console.warn('⚠️ Gemma yanıt vermedi, fallback kullanılıyor.');

    // Hazır soru ise spesifik fallback dön
    const quickQ = resolveQuickQuestion(question);
    let fallbackAnswer: string;

    if (quickQ) {
      // Hazır sorunun ID'sini bul
      const qId = QUICK_QUESTIONS.find((q) => q.label === question || q.id === question)?.id;
      const fallbackFn = qId ? FALLBACK_RESPONSES[qId] : undefined;
      fallbackAnswer = fallbackFn ? fallbackFn(analiz) : GENERIC_FALLBACK;
    } else {
      // Serbest soru için genel fallback
      fallbackAnswer = GENERIC_FALLBACK;
    }

    const sure = Date.now() - baslangic;
    console.log(`📝 Copilot fallback cevap verildi (${sure}ms)`);

    return {
      answer: fallbackAnswer,
      isFromFallback: true,
      timestamp: new Date().toISOString(),
    };
  }

  // 6. Gemma cevabı başarılı
  const sure = Date.now() - baslangic;
  console.log(`✅ Copilot cevap verildi (${sure}ms)`);

  return {
    answer: gemmaResponse.text,
    isFromFallback: false,
    timestamp: new Date().toISOString(),
  };
}
