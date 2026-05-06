// [AI-Agent: Skills] ERP hesaplama motoru Skills Agent tarafından oluşturulmuştur.
// Saf algoritmik hesaplama — hiçbir dış servise veya DB'ye bağlanmaz.
// Manuel revizyon: Samet tarafından test edilip onaylanacak.

import type {
  Urun, Malzeme, ReceteKalemi, StokKalemi, GunlukSatis,
  AnalizSonucu, UrunSatisOzeti, TeorikTuketim,
  KritikStok, SatinAlmaOnerisi, ReceteSapmasi, StokSeviyesi,
} from '../types/stockpilot.types';

// Sabitler
const GUVENLIK_PAYI_CARPANI = 1.5;
const SARI_ESIK_CARPANI = 1.5;

/**
 * Günlük analiz hesaplama — ERP motorunun kalbi.
 * databaseService'den gelen formatlı veriyi alır, saf algoritmik
 * hesaplama yapar ve AnalizSonucu döndürür.
 */
export function hesaplaGunlukAnaliz(
  urunler: Urun[],
  malzemeler: Malzeme[],
  receteler: ReceteKalemi[],
  stoklar: StokKalemi[],
  gunlukSatislar: GunlukSatis[],
  fizikselStoklar?: StokKalemi[]
): AnalizSonucu {
  const baslangicZamani = Date.now();

  // 1. Ürün satış özeti, ciro ve kâr hesaplama
  const urunSatisOzeti = hesaplaUrunSatisOzeti(urunler, gunlukSatislar, malzemeler, receteler);
  const toplamSatisAdedi = urunSatisOzeti.reduce((t, u) => t + u.quantity, 0);
  const toplamGelir = urunSatisOzeti.reduce((t, u) => t + u.revenue, 0);
  const toplamMaliyet = urunSatisOzeti.reduce((t, u) => t + u.cost, 0);
  const toplamKar = urunSatisOzeti.reduce((t, u) => t + u.profit, 0);

  // 2. Teorik malzeme tüketimi
  const teorikTuketim = hesaplaTeorikTuketim(malzemeler, receteler, stoklar, gunlukSatislar);

  // 3. Kritik stok tespiti (Kırmızı / Sarı)
  const kritikStoklar = tespiKritikStoklar(teorikTuketim, malzemeler);

  // 4. Satın alma önerisi
  const satinAlmaOnerisi = hesaplaSatinAlmaOnerisi(kritikStoklar, malzemeler);

  // 5. Reçete sapması (opsiyonel)
  const receteSapmasi = fizikselStoklar
    ? hesaplaReceteSapmasi(teorikTuketim, fizikselStoklar, malzemeler)
    : undefined;

  // 6. Tedarikçi mesaj taslağı
  const tedarikciMesajTaslagi = olusturTedarikciMesaji(satinAlmaOnerisi);

  const pisinmeSuresi = Date.now() - baslangicZamani;
  console.log(`✅ ERP Analiz tamamlandı: ${toplamSatisAdedi} satış, ${kritikStoklar.length} kritik stok, ${pisinmeSuresi}ms`);

  return {
    toplamSatisAdedi, toplamGelir, toplamMaliyet, toplamKar,
    urunSatisOzeti, teorikTuketim,
    kritikStoklar, satinAlmaOnerisi, receteSapmasi,
    tedarikciMesajTaslagi, analizTarihi: new Date().toISOString(), pisinmeSuresi,
  };
}

// ============================================================
// Yardımcı Hesaplama Fonksiyonları
// ============================================================

/** Ürün bazlı satış özeti — hangi üründen kaç adet, ne kadar gelir ve kâr */
function hesaplaUrunSatisOzeti(
  urunler: Urun[], 
  gunlukSatislar: GunlukSatis[],
  malzemeler: Malzeme[],
  receteler: ReceteKalemi[]
): UrunSatisOzeti[] {
  const satisMap = new Map<number, number>();
  for (const satis of gunlukSatislar) {
    satisMap.set(satis.productId, (satisMap.get(satis.productId) || 0) + satis.quantity);
  }

  // Her ürünün birim maliyetini reçetelerden hesapla
  const urunBirimMaliyetleri = new Map<number, number>();
  for (const recete of receteler) {
    const malzeme = malzemeler.find(m => m.id === recete.ingredientId);
    if (malzeme) {
      const mevcutMaliyet = urunBirimMaliyetleri.get(recete.productId) || 0;
      urunBirimMaliyetleri.set(
        recete.productId, 
        mevcutMaliyet + (recete.quantityPerUnit * malzeme.unitCost)
      );
    }
  }

  const ozet: UrunSatisOzeti[] = [];
  for (const [productId, quantity] of satisMap.entries()) {
    const urun = urunler.find((u) => u.id === productId);
    if (!urun) { console.warn(`⚠️ Satışı olan ürün bulunamadı: productId=${productId}`); continue; }
    
    const birimMaliyet = urunBirimMaliyetleri.get(productId) || 0;
    const revenue = quantity * urun.price;
    const cost = quantity * birimMaliyet;
    
    ozet.push({ 
      productId, 
      productName: urun.name, 
      quantity, 
      revenue,
      cost: Math.round(cost * 100) / 100,
      profit: Math.round((revenue - cost) * 100) / 100
    });
  }
  ozet.sort((a, b) => b.quantity - a.quantity);
  return ozet;
}

/** Reçetelere göre teorik malzeme tüketimi hesaplar */
function hesaplaTeorikTuketim(
  malzemeler: Malzeme[], receteler: ReceteKalemi[],
  stoklar: StokKalemi[], gunlukSatislar: GunlukSatis[]
): TeorikTuketim[] {
  const urunSatisAdetleri = new Map<number, number>();
  for (const s of gunlukSatislar) {
    urunSatisAdetleri.set(s.productId, (urunSatisAdetleri.get(s.productId) || 0) + s.quantity);
  }

  const tuketimMap = new Map<number, number>();
  for (const r of receteler) {
    const adet = urunSatisAdetleri.get(r.productId) || 0;
    if (adet === 0) continue;
    tuketimMap.set(r.ingredientId, (tuketimMap.get(r.ingredientId) || 0) + adet * r.quantityPerUnit);
  }

  return malzemeler.map((m) => {
    const theoreticalUsage = tuketimMap.get(m.id) || 0;
    const currentStock = stoklar.find((s) => s.ingredientId === m.id)?.currentStock ?? 0;
    return {
      ingredientId: m.id, ingredientName: m.name, unit: m.unit,
      theoreticalUsage, currentStock, remainingStock: currentStock - theoreticalUsage,
    };
  });
}

/** Kritik stok tespiti — Kırmızı (bitmiş/acil), Sarı (azalıyor) */
function tespiKritikStoklar(teorikTuketim: TeorikTuketim[], malzemeler: Malzeme[]): KritikStok[] {
  const kritikler: KritikStok[] = [];

  for (const t of teorikTuketim) {
    const m = malzemeler.find((mal) => mal.id === t.ingredientId);
    if (!m) continue;
    const { remainingStock } = t;

    let level: StokSeviyesi;
    let message: string;

    if (remainingStock <= 0) {
      level = 'Kırmızı';
      message = `🔴 ${m.name} tükendi! Acil tedarik gerekli.`;
    } else if (remainingStock < m.minStockLevel) {
      level = 'Kırmızı';
      message = `🔴 ${m.name} kritik seviyede: ${remainingStock.toFixed(1)} ${m.unit} kaldı (eşik: ${m.minStockLevel} ${m.unit}).`;
    } else if (remainingStock < m.minStockLevel * SARI_ESIK_CARPANI) {
      level = 'Sarı';
      message = `🟡 ${m.name} azalıyor: ${remainingStock.toFixed(1)} ${m.unit} kaldı.`;
    } else {
      continue; // Yeşil — sorun yok
    }

    kritikler.push({
      ingredientId: t.ingredientId, ingredientName: m.name, unit: m.unit,
      currentStock: t.currentStock, theoreticalUsage: t.theoreticalUsage,
      remainingStock, minStockLevel: m.minStockLevel, level, message,
    });
  }

  kritikler.sort((a, b) => {
    if (a.level === 'Kırmızı' && b.level !== 'Kırmızı') return -1;
    if (a.level !== 'Kırmızı' && b.level === 'Kırmızı') return 1;
    return a.remainingStock - b.remainingStock;
  });
  return kritikler;
}

/** Satın alma önerisi — eksik miktara güvenlik payı ekleyerek sipariş miktarı önerir */
function hesaplaSatinAlmaOnerisi(kritikStoklar: KritikStok[], malzemeler: Malzeme[]): SatinAlmaOnerisi[] {
  return kritikStoklar.map((stok) => {
    const unitCost = malzemeler.find((m) => m.id === stok.ingredientId)?.unitCost ?? 0;
    const requiredAmount = Math.max(0, stok.minStockLevel - stok.remainingStock);
    const suggestedOrder = Math.ceil(requiredAmount * GUVENLIK_PAYI_CARPANI);
    const estimatedCost = Math.round(suggestedOrder * unitCost * 100) / 100;
    return {
      ingredientId: stok.ingredientId, ingredientName: stok.ingredientName,
      unit: stok.unit, currentStock: stok.currentStock,
      requiredAmount: Math.round(requiredAmount * 100) / 100,
      suggestedOrder, estimatedCost, priority: stok.level,
    };
  });
}

/** Reçete sapması — teorik vs fiziksel stok farkı (fire/kayıp tespiti) */
function hesaplaReceteSapmasi(
  teorikTuketim: TeorikTuketim[], fizikselStoklar: StokKalemi[], malzemeler: Malzeme[]
): ReceteSapmasi[] {
  const sapmalar: ReceteSapmasi[] = [];
  for (const t of teorikTuketim) {
    const fiziksel = fizikselStoklar.find((s) => s.ingredientId === t.ingredientId);
    const m = malzemeler.find((mal) => mal.id === t.ingredientId);
    if (!fiziksel || !m) continue;

    const deviation = t.remainingStock - fiziksel.currentStock;
    if (Math.abs(deviation) < 0.01) continue;

    const deviationPercent = t.remainingStock > 0 ? (deviation / t.remainingStock) * 100 : (deviation > 0 ? 100 : 0);
    sapmalar.push({
      ingredientId: t.ingredientId, ingredientName: m.name, unit: m.unit,
      theoreticalRemaining: Math.round(t.remainingStock * 100) / 100,
      actualRemaining: Math.round(fiziksel.currentStock * 100) / 100,
      deviation: Math.round(deviation * 100) / 100,
      deviationPercent: Math.round(deviationPercent * 10) / 10,
      estimatedLoss: Math.round(deviation * m.unitCost * 100) / 100,
    });
  }
  sapmalar.sort((a, b) => b.estimatedLoss - a.estimatedLoss);
  return sapmalar;
}

/** Tedarikçiye WhatsApp formatında sipariş mesajı oluşturur */
function olusturTedarikciMesaji(satinAlmaOnerisi: SatinAlmaOnerisi[]): string {
  if (satinAlmaOnerisi.length === 0) {
    return 'Bugün tedarik ihtiyacı bulunmamaktadır. Tüm stoklar yeterli seviyede.';
  }
  const tarih = new Date().toLocaleDateString('tr-TR');
  const satirlar = satinAlmaOnerisi
    .map((o, i) => `${i + 1}. ${o.ingredientName}: ${o.suggestedOrder} ${o.unit} (${o.priority === 'Kırmızı' ? '⚠️ ACİL' : 'Normal'})`)
    .join('\n');
  const toplam = satinAlmaOnerisi.reduce((t, o) => t + o.estimatedCost, 0);

  return `📋 StockPilot AI — Sipariş Talebi\n📅 Tarih: ${tarih}\n\nMerhaba,\nAşağıdaki malzemeleri sipariş etmek istiyoruz:\n\n${satirlar}\n\n💰 Tahmini Toplam: ${toplam.toFixed(2)} TL\n\nSaygılarımızla,\nStockPilot AI Sipariş Sistemi`;
}
