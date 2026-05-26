// [AI-Agent: Skills] Database Service — database-service-layer, postgresql-patterns, coding-standards skill'lerine uygun.
// Sorumlu: Emre
// PostgreSQL verilerini ERP motorunun beklediği camelCase TypeScript arayüzlerine dönüştürür.
// Kritik: getErpVerileri() çıktısı ile erpHesapMotoru.hesaplaGunlukAnaliz() girdi formatı BİREBİR eşleşmeli.

// 1. Üçüncü parti
// (yok)

// 2. Proje dosyaları
import { query, getClient } from '../db/pool';
import type {
  // Hedef camelCase tipler (ERP motoruna girdi)
  Urun,
  Malzeme,
  ReceteKalemi,
  StokKalemi,
  GunlukSatis,
  ErpGirdiVerileri,
  AnalizSonucu,
  // DB Row tipleri (snake_case — PostgreSQL'den gelen ham veri)
  ProductRow,
  IngredientRow,
  RecipeItemRow,
  InventoryRow,
  DailySaleRow,
  AnalysisResultRow,
} from '../types/stockpilot.types';

// ═══════════════════════════════════════════════════════
// snake_case → camelCase Dönüşüm Fonksiyonları
// (export: test ve doğrulama amaçlı dışa açık)
// ═══════════════════════════════════════════════════════

/**
 * ProductRow (DB) → Urun (ERP)
 * DECIMAL string → number dönüşümü yapılır.
 */
export function mapProducts(rows: ProductRow[]): Urun[] {
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    price: parseFloat(row.price),
    category: row.category,
  }));
}

/**
 * IngredientRow (DB) → Malzeme (ERP)
 * DECIMAL string → number dönüşümü yapılır.
 */
export function mapIngredients(rows: IngredientRow[]): Malzeme[] {
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    unit: row.unit,
    unitCost: parseFloat(row.unit_cost),
    minStockLevel: parseFloat(row.min_stock_level),
  }));
}

/**
 * RecipeItemRow (DB) → ReceteKalemi (ERP)
 * snake_case → camelCase + DECIMAL string → number.
 */
export function mapRecipes(rows: RecipeItemRow[]): ReceteKalemi[] {
  return rows.map((row) => ({
    id: row.id,
    productId: row.product_id,
    ingredientId: row.ingredient_id,
    quantityPerUnit: parseFloat(row.quantity_per_unit),
  }));
}

/**
 * InventoryRow (DB) → StokKalemi (ERP)
 * snake_case → camelCase + DECIMAL string → number.
 * physicalStock opsiyonel (reçete sapması hesabı için).
 */
export function mapInventory(rows: InventoryRow[]): StokKalemi[] {
  return rows.map((row) => ({
    id: row.id,
    ingredientId: row.ingredient_id,
    currentStock: parseFloat(row.current_stock),
    ...(row.physical_stock !== null && {
      physicalStock: parseFloat(row.physical_stock),
    }),
  }));
}

/**
 * DailySaleRow (DB) → GunlukSatis (ERP)
 * snake_case → camelCase.
 */
export function mapSales(rows: DailySaleRow[]): GunlukSatis[] {
  return rows.map((row) => ({
    id: row.id,
    productId: row.product_id,
    quantity: row.quantity,
    saleDate: row.sale_date,
  }));
}

// ═══════════════════════════════════════════════════════
// Ana Servis Fonksiyonları
// ═══════════════════════════════════════════════════════

/**
 * ERP motoru için tüm verileri toplar ve camelCase formatına dönüştürür.
 * Samet'in `hesaplaGunlukAnaliz(veriler: ErpGirdiVerileri)` fonksiyonuna birebir uyumlu çıktı üretir.
 *
 * @param tarih - Satış verilerinin çekileceği tarih (YYYY-MM-DD). Varsayılan: bugün.
 * @returns ErpGirdiVerileri — ERP motorunun beklediği formatta tüm veriler.
 */
export async function getErpVerileri(tarih?: string): Promise<ErpGirdiVerileri> {
  const hedefTarih = tarih || new Date().toISOString().split('T')[0];

  console.log(`🔄 ERP verileri hazırlanıyor (tarih: ${hedefTarih})...`);
  const baslangic = Date.now();

  // Paralel sorgular — performans için aynı anda çalıştır
  const [urunlerResult, malzemelerResult, recetelerResult, stoklarResult, satislarResult] =
    await Promise.all([
      query<ProductRow>('SELECT * FROM products ORDER BY id'),
      query<IngredientRow>('SELECT * FROM ingredients ORDER BY id'),
      query<RecipeItemRow>('SELECT * FROM recipe_items ORDER BY id'),
      query<InventoryRow>('SELECT * FROM inventory ORDER BY id'),
      query<DailySaleRow>(
        'SELECT * FROM daily_sales WHERE sale_date = $1 ORDER BY id',
        [hedefTarih]
      ),
    ]);

  // snake_case → camelCase dönüşümü
  const veriler: ErpGirdiVerileri = {
    urunler: mapProducts(urunlerResult.rows),
    malzemeler: mapIngredients(malzemelerResult.rows),
    receteler: mapRecipes(recetelerResult.rows),
    stoklar: mapInventory(stoklarResult.rows),
    gunlukSatislar: mapSales(satislarResult.rows),
  };

  const sure = Date.now() - baslangic;
  console.log(
    `✅ ERP verileri hazır [${sure}ms] — ` +
    `${veriler.urunler.length} ürün, ` +
    `${veriler.malzemeler.length} malzeme, ` +
    `${veriler.receteler.length} reçete, ` +
    `${veriler.stoklar.length} stok, ` +
    `${veriler.gunlukSatislar.length} satış`
  );

  return veriler;
}

/**
 * ERP motoru tarafından hesaplanan analiz sonucunu veritabanına kaydeder.
 * Dashboard ve Copilot bu kayıtları okuyarak kullanıcıya gösterir.
 *
 * @param sonuc - ERP motorunun ürettiği tam analiz sonucu.
 * @param aiOzet - Gemma tarafından oluşturulan yönetici özeti (opsiyonel).
 * @param tarih - Analiz tarihi (YYYY-MM-DD). Varsayılan: bugün.
 * @returns Kaydedilen satırın id'si.
 */
export async function kaydetAnalizSonucu(
  sonuc: AnalizSonucu,
  aiOzet?: string,
  tarih?: string
): Promise<number> {
  const hedefTarih = tarih || new Date().toISOString().split('T')[0];

  console.log(`💾 Analiz sonucu kaydediliyor (tarih: ${hedefTarih})...`);

  const client = await getClient();
  try {
    await client.query('BEGIN');

    // Aynı tarihte eski analiz varsa sil (son analiz geçerli)
    await client.query(
      'DELETE FROM analysis_results WHERE date = $1',
      [hedefTarih]
    );

    // Yeni analiz sonucunu kaydet
    const result = await client.query<AnalysisResultRow>(
      `INSERT INTO analysis_results (date, result_data, ai_summary)
       VALUES ($1, $2, $3)
       RETURNING id`,
      [hedefTarih, JSON.stringify(sonuc), aiOzet || null]
    );

    await client.query('COMMIT');

    const kayitId = result.rows[0].id;
    console.log(`✅ Analiz sonucu kaydedildi (id: ${kayitId}, tarih: ${hedefTarih})`);
    return kayitId;
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Analiz sonucu kaydetme hatası:', err);
    throw err;
  } finally {
    client.release();
  }
}

/**
 * En son analiz sonucunu getirir.
 * Copilot ve Dashboard tarafından kullanılır.
 *
 * @param tarih - Opsiyonel tarih filtresi (YYYY-MM-DD). Verilmezse en son analiz döner.
 * @returns Analiz sonucu veya null (henüz analiz yapılmamışsa).
 */
export async function sonAnaliziGetir(tarih?: string): Promise<{ sonuc: AnalizSonucu; aiOzet: string | null; tarih: string } | null> {
  let result;

  if (tarih) {
    result = await query<AnalysisResultRow>(
      'SELECT * FROM analysis_results WHERE date = $1 ORDER BY created_at DESC LIMIT 1',
      [tarih]
    );
  } else {
    result = await query<AnalysisResultRow>(
      'SELECT * FROM analysis_results ORDER BY created_at DESC LIMIT 1'
    );
  }

  if (result.rows.length === 0) {
    console.log('ℹ️ Henüz analiz sonucu bulunamadı');
    return null;
  }

  const row = result.rows[0];
  console.log(`📊 Son analiz getirildi (tarih: ${row.date})`);

  return {
    sonuc: row.result_data,
    aiOzet: row.ai_summary,
    tarih: row.date,
  };
}

// ═══════════════════════════════════════════════════════
// ERP Motoru Entegrasyon Helper'ı
// ═══════════════════════════════════════════════════════

/**
 * databaseService → ERP motoru → AnalizSonucu zincirini tek çağrıda çalıştırır.
 * analyze.route.ts tarafından kullanılmak üzere tasarlandı.
 *
 * ERP motorunun hesaplaGunlukAnaliz() fonksiyonu spread parametreler alır,
 * bu helper o dönüşümü yapar.
 *
 * @param tarih - Analiz tarihi (YYYY-MM-DD). Varsayılan: bugün.
 * @returns AnalizSonucu — ERP motorunun ürettiği tam analiz sonucu.
 */
export async function runAnalizWithErp(tarih?: string): Promise<AnalizSonucu> {
  // Lazy import — circular dependency önlemi
  const { hesaplaGunlukAnaliz } = await import('./erpHesapMotoru.js');

  // 1. Verileri çek ve camelCase'e dönüştür
  const veriler = await getErpVerileri(tarih);

  // 2. Fiziksel stok verilerini ayır (reçete sapması hesabı için)
  const fizikselStoklar = veriler.stoklar.filter(
    (s) => s.physicalStock !== undefined
  );

  // 3. ERP motorunu çalıştır (spread parametrelerle)
  const sonuc = hesaplaGunlukAnaliz(
    veriler.urunler,
    veriler.malzemeler,
    veriler.receteler,
    veriler.stoklar,
    veriler.gunlukSatislar,
    fizikselStoklar.length > 0 ? fizikselStoklar : undefined
  );

  console.log(`🎯 Analiz tamamlandı — ${sonuc.toplamSatisAdedi} satış, ${sonuc.toplamGelir.toFixed(2)}₺ gelir, ${sonuc.kritikStoklar.length} kritik stok`);
  return sonuc;
}
