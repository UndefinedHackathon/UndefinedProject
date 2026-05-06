// [AI-Agent: Skills] Database Service ↔ ERP Motoru uyumluluk doğrulama testi.
// Sorumlu: Emre
// Kullanım: npx ts-node src/services/databaseService.test.ts
// Seed data yüklendikten sonra çalıştırılmalı.

import { getErpVerileri, kaydetAnalizSonucu, sonAnaliziGetir, runAnalizWithErp } from './databaseService';
import { hesaplaGunlukAnaliz } from './erpHesapMotoru';
import type { ErpGirdiVerileri, AnalizSonucu } from '../types/stockpilot.types';

// ─── Sabitler (seed.sql'deki beklenen değerler) ──────
const BEKLENEN_URUN_SAYISI = 6;
const BEKLENEN_MALZEME_SAYISI = 10;
const BEKLENEN_RECETE_SAYISI = 14;   // 2+2+3+2+1+4 = 14
const BEKLENEN_STOK_SAYISI = 10;
const BEKLENEN_SATIS_SAYISI = 6;     // 6 ürün × 1 gün
const BEKLENEN_TOPLAM_ADET = 108;    // 35+20+12+18+15+8
const BEKLENEN_TOPLAM_GELIR = 5535;  // seed.sql'de hesaplanan

let testSayaci = 0;
let basarili = 0;
let basarisiz = 0;

function assert(kosul: boolean, mesaj: string): void {
  testSayaci++;
  if (kosul) {
    basarili++;
    console.log(`  ✅ #${testSayaci} ${mesaj}`);
  } else {
    basarisiz++;
    console.error(`  ❌ #${testSayaci} ${mesaj}`);
  }
}

async function testGetErpVerileri(): Promise<ErpGirdiVerileri> {
  console.log('\n══ TEST 1: getErpVerileri() ══════════════════════════');

  const veriler = await getErpVerileri();

  // Yapısal doğrulama
  assert(veriler.urunler !== undefined, 'urunler alanı mevcut');
  assert(veriler.malzemeler !== undefined, 'malzemeler alanı mevcut');
  assert(veriler.receteler !== undefined, 'receteler alanı mevcut');
  assert(veriler.stoklar !== undefined, 'stoklar alanı mevcut');
  assert(veriler.gunlukSatislar !== undefined, 'gunlukSatislar alanı mevcut');

  // Sayı doğrulama (seed data ile eşleşmeli)
  assert(veriler.urunler.length === BEKLENEN_URUN_SAYISI, `Ürün sayısı: ${veriler.urunler.length} (beklenen: ${BEKLENEN_URUN_SAYISI})`);
  assert(veriler.malzemeler.length === BEKLENEN_MALZEME_SAYISI, `Malzeme sayısı: ${veriler.malzemeler.length} (beklenen: ${BEKLENEN_MALZEME_SAYISI})`);
  assert(veriler.receteler.length === BEKLENEN_RECETE_SAYISI, `Reçete sayısı: ${veriler.receteler.length} (beklenen: ${BEKLENEN_RECETE_SAYISI})`);
  assert(veriler.stoklar.length === BEKLENEN_STOK_SAYISI, `Stok sayısı: ${veriler.stoklar.length} (beklenen: ${BEKLENEN_STOK_SAYISI})`);
  assert(veriler.gunlukSatislar.length === BEKLENEN_SATIS_SAYISI, `Satış sayısı: ${veriler.gunlukSatislar.length} (beklenen: ${BEKLENEN_SATIS_SAYISI})`);

  return veriler;
}

function testSnakeToCamelCase(veriler: ErpGirdiVerileri): void {
  console.log('\n══ TEST 2: snake_case → camelCase Dönüşüm ═══════════');

  // Ürün tiplerini doğrula
  const urun = veriler.urunler[0];
  assert(typeof urun.id === 'number', 'Urun.id number');
  assert(typeof urun.name === 'string', 'Urun.name string');
  assert(typeof urun.price === 'number', 'Urun.price number (DECIMAL→number dönüşümü)');
  assert(typeof urun.category === 'string', 'Urun.category string');
  assert(!('created_at' in urun), 'created_at filtrelendi (DB-only alan)');

  // Malzeme tiplerini doğrula
  const malzeme = veriler.malzemeler[0];
  assert(typeof malzeme.unitCost === 'number', 'Malzeme.unitCost camelCase + number');
  assert(typeof malzeme.minStockLevel === 'number', 'Malzeme.minStockLevel camelCase + number');
  assert(!('unit_cost' in malzeme), 'snake_case unit_cost mevcut değil');
  assert(!('min_stock_level' in malzeme), 'snake_case min_stock_level mevcut değil');

  // Reçete tiplerini doğrula
  const recete = veriler.receteler[0];
  assert(typeof recete.productId === 'number', 'ReceteKalemi.productId camelCase');
  assert(typeof recete.ingredientId === 'number', 'ReceteKalemi.ingredientId camelCase');
  assert(typeof recete.quantityPerUnit === 'number', 'ReceteKalemi.quantityPerUnit camelCase + number');
  assert(!('product_id' in recete), 'snake_case product_id mevcut değil');

  // Stok tiplerini doğrula
  const stok = veriler.stoklar[0];
  assert(typeof stok.ingredientId === 'number', 'StokKalemi.ingredientId camelCase');
  assert(typeof stok.currentStock === 'number', 'StokKalemi.currentStock camelCase + number');
  assert(!('ingredient_id' in stok), 'snake_case ingredient_id mevcut değil');

  // physicalStock opsiyonel doğrulama
  const fizikselStok = veriler.stoklar.find(s => s.physicalStock !== undefined);
  if (fizikselStok) {
    assert(typeof fizikselStok.physicalStock === 'number', 'StokKalemi.physicalStock opsiyonel number');
  }

  // Satış tiplerini doğrula
  const satis = veriler.gunlukSatislar[0];
  assert(typeof satis.productId === 'number', 'GunlukSatis.productId camelCase');
  assert(typeof satis.quantity === 'number', 'GunlukSatis.quantity number');
  assert(typeof satis.saleDate === 'string', 'GunlukSatis.saleDate string');
  assert(!('product_id' in satis), 'snake_case product_id mevcut değil');
}

function testErpMotorUyumu(veriler: ErpGirdiVerileri): AnalizSonucu {
  console.log('\n══ TEST 3: ERP Motoru Uyum Doğrulaması ═══════════════');

  // Fiziksel stokları ayır
  const fizikselStoklar = veriler.stoklar.filter(s => s.physicalStock !== undefined);

  // ERP motorunu çağır — bu çağrı başarılıysa format uyumlu demektir
  let sonuc: AnalizSonucu;
  try {
    sonuc = hesaplaGunlukAnaliz(
      veriler.urunler,
      veriler.malzemeler,
      veriler.receteler,
      veriler.stoklar,
      veriler.gunlukSatislar,
      fizikselStoklar.length > 0 ? fizikselStoklar : undefined
    );
    assert(true, 'hesaplaGunlukAnaliz() başarıyla çağrıldı — format uyumlu ✓');
  } catch (err) {
    assert(false, `hesaplaGunlukAnaliz() HATA: ${err}`);
    throw err;
  }

  // Sonuç doğrulama
  assert(sonuc.toplamSatisAdedi === BEKLENEN_TOPLAM_ADET, `Toplam satış: ${sonuc.toplamSatisAdedi} (beklenen: ${BEKLENEN_TOPLAM_ADET})`);
  assert(sonuc.toplamGelir === BEKLENEN_TOPLAM_GELIR, `Toplam gelir: ${sonuc.toplamGelir}₺ (beklenen: ${BEKLENEN_TOPLAM_GELIR}₺)`);
  assert(sonuc.urunSatisOzeti.length > 0, `Ürün satış özeti: ${sonuc.urunSatisOzeti.length} ürün`);
  assert(sonuc.teorikTuketim.length > 0, `Teorik tüketim: ${sonuc.teorikTuketim.length} malzeme`);
  assert(sonuc.kritikStoklar.length > 0, `Kritik stoklar: ${sonuc.kritikStoklar.length} adet`);
  assert(sonuc.satinAlmaOnerisi.length > 0, `Satın alma önerileri: ${sonuc.satinAlmaOnerisi.length} adet`);
  assert(sonuc.tedarikciMesajTaslagi.length > 0, 'Tedarikçi mesaj taslağı oluşturuldu');

  // Reçete sapması (fiziksel stok varsa)
  if (sonuc.receteSapmasi) {
    assert(sonuc.receteSapmasi.length > 0, `Reçete sapması: ${sonuc.receteSapmasi.length} sapma tespit edildi`);
  }

  // Kırmızı stok doğrulama (seed senaryosu)
  const kirmiziStoklar = sonuc.kritikStoklar.filter(k => k.level === 'Kırmızı');
  assert(kirmiziStoklar.length >= 2, `🔴 Kırmızı stok sayısı: ${kirmiziStoklar.length} (beklenen: ≥2)`);

  return sonuc;
}

async function testKaydetVeGetir(sonuc: AnalizSonucu): Promise<void> {
  console.log('\n══ TEST 4: kaydetAnalizSonucu() & sonAnaliziGetir() ══');

  // Kaydet
  const kayitId = await kaydetAnalizSonucu(sonuc, 'Test AI özeti', '2026-01-01');
  assert(typeof kayitId === 'number' && kayitId > 0, `Analiz kaydedildi (id: ${kayitId})`);

  // Getir
  const getirilen = await sonAnaliziGetir('2026-01-01');
  assert(getirilen !== null, 'Kaydedilen analiz geri getirildi');
  if (getirilen) {
    assert(getirilen.sonuc.toplamSatisAdedi === sonuc.toplamSatisAdedi, 'Getirilen toplamSatisAdedi eşleşiyor');
    assert(getirilen.sonuc.toplamGelir === sonuc.toplamGelir, 'Getirilen toplamGelir eşleşiyor');
    assert(getirilen.aiOzet === 'Test AI özeti', 'AI özeti doğru kaydedildi');
  }

  // Temizle (test verisini sil)
  const { query: q } = await import('../db/pool.js');
  await q('DELETE FROM analysis_results WHERE date = $1', ['2026-01-01']);
  console.log('  🧹 Test verisi temizlendi');
}

async function testRunAnalizWithErp(): Promise<void> {
  console.log('\n══ TEST 5: runAnalizWithErp() — Uçtan Uca ═══════════');

  const sonuc = await runAnalizWithErp();
  assert(sonuc.toplamSatisAdedi === BEKLENEN_TOPLAM_ADET, `Toplam satış: ${sonuc.toplamSatisAdedi}`);
  assert(sonuc.toplamGelir === BEKLENEN_TOPLAM_GELIR, `Toplam gelir: ${sonuc.toplamGelir}₺`);
  assert(true, 'runAnalizWithErp() uçtan uca başarılı ✓');
}

// ─── Ana Test Çalıştırıcı ────────────────────────────
async function main(): Promise<void> {
  console.log('╔══════════════════════════════════════════════════════╗');
  console.log('║ 🧪 databaseService ↔ ERP Motoru Doğrulama Testi    ║');
  console.log('╚══════════════════════════════════════════════════════╝');

  try {
    // Test 1: Veri çekme
    const veriler = await testGetErpVerileri();

    // Test 2: snake_case → camelCase dönüşüm
    testSnakeToCamelCase(veriler);

    // Test 3: ERP motoru uyumu
    const sonuc = testErpMotorUyumu(veriler);

    // Test 4: Kaydet & getir
    await testKaydetVeGetir(sonuc);

    // Test 5: Uçtan uca
    await testRunAnalizWithErp();

  } catch (err) {
    console.error('\n💥 KRİTİK HATA:', err);
  }

  // Sonuç özeti
  console.log('\n╔══════════════════════════════════════════════════════╗');
  console.log(`║ 📊 Sonuç: ${basarili}/${testSayaci} başarılı, ${basarisiz} başarısız${basarisiz > 0 ? ' ⚠️' : ' ✅'}`.padEnd(55) + '║');
  console.log('╚══════════════════════════════════════════════════════╝\n');

  // Pool'u kapat
  const { pool } = await import('../db/pool.js');
  await pool.end();

  process.exit(basarisiz > 0 ? 1 : 0);
}

main();
