// [AI-Agent: Skills] ERP hesap motoru test dosyası — erp-engine-core skill'ine uygun.
// Manuel revizyon: Samet tarafından çalıştırılıp doğrulanacak.
// Bu dosya doğrudan ts-node ile çalıştırılabilir: npx ts-node src/services/erpHesapMotoru.test.ts

import { hesaplaGunlukAnaliz } from './erpHesapMotoru';
import type {
  Urun, Malzeme, ReceteKalemi, StokKalemi, GunlukSatis,
} from '../types/stockpilot.types';

// ═══════════════════════════════════════════════════════
// Test Verisi — Kafe Senaryosu
// ═══════════════════════════════════════════════════════

const urunler: Urun[] = [
  { id: 1, name: 'Latte', price: 45.00, category: 'İçecek' },
  { id: 2, name: 'Americano', price: 40.00, category: 'İçecek' },
  { id: 3, name: 'Tost', price: 55.00, category: 'Yiyecek' },
  { id: 4, name: 'Cheesecake', price: 65.00, category: 'Tatlı' },
];

const malzemeler: Malzeme[] = [
  { id: 1, name: 'Espresso Çekirdeği', unit: 'kg', unitCost: 350, minStockLevel: 2 },
  { id: 2, name: 'Süt', unit: 'lt', unitCost: 25, minStockLevel: 10 },
  { id: 3, name: 'Tost Ekmeği', unit: 'adet', unitCost: 5, minStockLevel: 20 },
  { id: 4, name: 'Kaşar Peynir', unit: 'kg', unitCost: 180, minStockLevel: 1 },
  { id: 5, name: 'Cream Cheese', unit: 'kg', unitCost: 220, minStockLevel: 0.5 },
];

const receteler: ReceteKalemi[] = [
  // Latte: 0.02 kg çekirdek + 0.2 lt süt
  { id: 1, productId: 1, ingredientId: 1, quantityPerUnit: 0.02 },
  { id: 2, productId: 1, ingredientId: 2, quantityPerUnit: 0.2 },
  // Americano: 0.02 kg çekirdek
  { id: 3, productId: 2, ingredientId: 1, quantityPerUnit: 0.02 },
  // Tost: 1 ekmek + 0.05 kg kaşar
  { id: 4, productId: 3, ingredientId: 3, quantityPerUnit: 1 },
  { id: 5, productId: 3, ingredientId: 4, quantityPerUnit: 0.05 },
  // Cheesecake: 0.1 kg cream cheese + 0.05 lt süt
  { id: 6, productId: 4, ingredientId: 5, quantityPerUnit: 0.1 },
  { id: 7, productId: 4, ingredientId: 2, quantityPerUnit: 0.05 },
];

// Stok durumu — kasıtlı olarak süt ve tost ekmeği kritik seviyede
const stoklar: StokKalemi[] = [
  { id: 1, ingredientId: 1, currentStock: 5 },      // Espresso: 5 kg ✅
  { id: 2, ingredientId: 2, currentStock: 8 },       // Süt: 8 lt ⚠️ (eşik 10)
  { id: 3, ingredientId: 3, currentStock: 15 },      // Tost Ekmeği: 15 adet 🔴 (eşik 20)
  { id: 4, ingredientId: 4, currentStock: 2 },       // Kaşar: 2 kg ✅
  { id: 5, ingredientId: 5, currentStock: 0.3 },     // Cream Cheese: 0.3 kg 🔴 (eşik 0.5)
];

// Bugünkü satışlar
const gunlukSatislar: GunlukSatis[] = [
  { id: 1, productId: 1, quantity: 30, saleDate: '2026-05-06' },  // 30 Latte
  { id: 2, productId: 2, quantity: 15, saleDate: '2026-05-06' },  // 15 Americano
  { id: 3, productId: 3, quantity: 12, saleDate: '2026-05-06' },  // 12 Tost
  { id: 4, productId: 4, quantity: 8, saleDate: '2026-05-06' },   // 8 Cheesecake
];

// Fiziksel stok sayımı — reçete sapması testi için
const fizikselStoklar: StokKalemi[] = [
  { id: 1, ingredientId: 1, currentStock: 3.8 },   // Espresso: Teorik 4.1, Fiziksel 3.8 → 0.3 kg kayıp
  { id: 2, ingredientId: 2, currentStock: 1.0 },   // Süt: Teorik 1.6, Fiziksel 1.0 → 0.6 lt kayıp
  { id: 3, ingredientId: 3, currentStock: 2 },     // Tost Ekmeği: Teorik 3, Fiziksel 2 → 1 adet kayıp
  { id: 4, ingredientId: 4, currentStock: 1.3 },   // Kaşar: Teorik 1.4, Fiziksel 1.3 → 0.1 kg kayıp
  { id: 5, ingredientId: 5, currentStock: -0.5 },  // Cream Cheese: Sapma yüksek
];

// ═══════════════════════════════════════════════════════
// Test Çalıştırma
// ═══════════════════════════════════════════════════════

function runTests() {
  console.log('\n' + '═'.repeat(60));
  console.log('🧪 ERP Hesap Motoru — Test Başlatılıyor');
  console.log('═'.repeat(60) + '\n');

  // ── Test 1: Fiziksel stok olmadan temel analiz ──
  console.log('📋 Test 1: Temel Analiz (fiziksel stok yok)');
  console.log('─'.repeat(50));
  const sonuc1 = hesaplaGunlukAnaliz(urunler, malzemeler, receteler, stoklar, gunlukSatislar);

  // Toplam satış kontrolü
  const beklenenSatis = 30 + 15 + 12 + 8; // 65
  console.log(`  Toplam Satış: ${sonuc1.toplamSatisAdedi} (beklenen: ${beklenenSatis}) ${sonuc1.toplamSatisAdedi === beklenenSatis ? '✅' : '❌'}`);

  // Toplam gelir kontrolü
  const beklenenGelir = (30 * 45) + (15 * 40) + (12 * 55) + (8 * 65); // 1350 + 600 + 660 + 520 = 3130
  console.log(`  Toplam Gelir: ${sonuc1.toplamGelir} TL (beklenen: ${beklenenGelir}) ${sonuc1.toplamGelir === beklenenGelir ? '✅' : '❌'}`);

  // Ürün satış özeti
  console.log(`  Ürün Satış Özeti: ${sonuc1.urunSatisOzeti.length} ürün`);
  sonuc1.urunSatisOzeti.forEach((u) => {
    console.log(`    → ${u.productName}: ${u.quantity} adet, ${u.revenue} TL`);
  });

  // Teorik tüketim kontrolü
  console.log(`\n  Teorik Tüketim: ${sonuc1.teorikTuketim.length} malzeme`);
  sonuc1.teorikTuketim.forEach((t) => {
    console.log(`    → ${t.ingredientName}: ${t.theoreticalUsage.toFixed(2)} ${t.unit} kullanım, ${t.remainingStock.toFixed(2)} ${t.unit} kalan`);
  });

  // Kritik stok tespiti
  console.log(`\n  Kritik Stoklar: ${sonuc1.kritikStoklar.length} adet`);
  sonuc1.kritikStoklar.forEach((k) => {
    console.log(`    → ${k.level === 'Kırmızı' ? '🔴' : '🟡'} ${k.ingredientName}: ${k.message}`);
  });

  // Satın alma önerisi
  console.log(`\n  Satın Alma Önerisi: ${sonuc1.satinAlmaOnerisi.length} kalem`);
  sonuc1.satinAlmaOnerisi.forEach((s) => {
    console.log(`    → ${s.ingredientName}: ${s.suggestedOrder} ${s.unit} sipariş, ~${s.estimatedCost} TL`);
  });

  // Reçete sapması (fiziksel stok olmadığı için undefined olmalı)
  console.log(`\n  Reçete Sapması: ${sonuc1.receteSapmasi === undefined ? 'Yok (fiziksel stok girilmemiş) ✅' : '❌ Olmamalıydı!'}`);

  // Tedarikçi mesajı
  console.log(`\n  Tedarikçi Mesaj Taslağı:\n${sonuc1.tedarikciMesajTaslagi}`);

  // ── Test 2: Fiziksel stokla birlikte analiz (reçete sapması) ──
  console.log('\n\n' + '═'.repeat(60));
  console.log('📋 Test 2: Fiziksel Stoklu Analiz (reçete sapması)');
  console.log('─'.repeat(50));
  const sonuc2 = hesaplaGunlukAnaliz(urunler, malzemeler, receteler, stoklar, gunlukSatislar, fizikselStoklar);

  console.log(`  Reçete Sapması: ${sonuc2.receteSapmasi?.length ?? 0} malzeme`);
  sonuc2.receteSapmasi?.forEach((r) => {
    console.log(`    → ${r.ingredientName}: Teorik ${r.theoreticalRemaining} ${r.unit}, Fiziksel ${r.actualRemaining} ${r.unit}, Sapma: ${r.deviation} ${r.unit} (%${r.deviationPercent}), Kayıp: ${r.estimatedLoss} TL`);
  });

  // ── Test 3: Boş satış verisi ──
  console.log('\n\n' + '═'.repeat(60));
  console.log('📋 Test 3: Boş Satış Verisi');
  console.log('─'.repeat(50));
  const sonuc3 = hesaplaGunlukAnaliz(urunler, malzemeler, receteler, stoklar, []);

  console.log(`  Toplam Satış: ${sonuc3.toplamSatisAdedi} (beklenen: 0) ${sonuc3.toplamSatisAdedi === 0 ? '✅' : '❌'}`);
  console.log(`  Toplam Gelir: ${sonuc3.toplamGelir} (beklenen: 0) ${sonuc3.toplamGelir === 0 ? '✅' : '❌'}`);
  console.log(`  Kritik Stoklar: ${sonuc3.kritikStoklar.length} (satış yoksa da eşik altı stoklar çıkabilir)`);
  console.log(`  Tedarikçi Mesaj: ${sonuc3.tedarikciMesajTaslagi.includes('yeterli') ? '✅ İhtiyaç yok mesajı' : sonuc3.tedarikciMesajTaslagi.substring(0, 80)}`);

  // ── Test 4: Reçetesiz ürün satışı (edge case) ──
  console.log('\n\n' + '═'.repeat(60));
  console.log('📋 Test 4: Reçetesiz Ürün Satışı (edge case)');
  console.log('─'.repeat(50));
  const recetesizSatis: GunlukSatis[] = [
    { id: 99, productId: 999, quantity: 5, saleDate: '2026-05-06' }, // Tanımsız ürün
  ];
  const sonuc4 = hesaplaGunlukAnaliz(urunler, malzemeler, receteler, stoklar, recetesizSatis);
  console.log(`  Toplam Satış: ${sonuc4.toplamSatisAdedi} (beklenen: 0, tanımsız ürün atlanır) ${sonuc4.toplamSatisAdedi === 0 ? '✅' : '⚠️'}`);

  // ── Özet ──
  console.log('\n\n' + '═'.repeat(60));
  console.log('✅ ERP Hesap Motoru Testi Tamamlandı');
  console.log(`   Hesaplama Süresi: ${sonuc1.pisinmeSuresi}ms`);
  console.log('═'.repeat(60) + '\n');
}

runTests();
