// [AI-Agent: Skills] Analyze route — erp-engine-core, coding-standards ve error-handling-patterns skill'lerine uygun.
// Sorumlu: Samet
// POST /api/analyze — ERP motorunu çalıştırır, analiz sonucunu DB'ye kaydeder ve Gemma ile yönetici özeti oluşturur.
// Son Güncelleme: 2026-05-06

import { Router, Request, Response } from 'express';

// Proje dosyaları
import { hesaplaGunlukAnaliz } from '../services/erpHesapMotoru';
import { generateYoneticiOzeti } from '../services/gemmaService';
import { getLastAnalysis } from '../services/databaseService';
import { query } from '../db/pool';
import type {
  Urun, Malzeme, ReceteKalemi, StokKalemi, GunlukSatis,
  ProductRow, IngredientRow, RecipeItemRow, InventoryRow, DailySaleRow,
  AnalizSonucu, AnalysisResultRow,
} from '../types/stockpilot.types';

const router = Router();

// ═══════════════════════════════════════════════════════
// Yardımcı: snake_case → camelCase Dönüşüm Fonksiyonları
// ═══════════════════════════════════════════════════════

// [AI-Agent: Skills] DB row dönüşümleri — database-service-layer skill'ine uygun.
// PostgreSQL'den gelen snake_case verileri, ERP motorunun beklediği camelCase formata çevirir.

/** products tablosundan → Urun[] */
function mapProducts(rows: ProductRow[]): Urun[] {
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    price: parseFloat(String(r.price)),
    category: r.category,
  }));
}

/** ingredients tablosundan → Malzeme[] */
function mapIngredients(rows: IngredientRow[]): Malzeme[] {
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    unit: r.unit,
    unitCost: parseFloat(String(r.unit_cost)),
    minStockLevel: parseFloat(String(r.min_stock_level)),
  }));
}

/** recipe_items tablosundan → ReceteKalemi[] */
function mapRecipeItems(rows: RecipeItemRow[]): ReceteKalemi[] {
  return rows.map((r) => ({
    id: r.id,
    productId: r.product_id,
    ingredientId: r.ingredient_id,
    quantityPerUnit: parseFloat(String(r.quantity_per_unit)),
  }));
}

/** inventory tablosundan → StokKalemi[] */
function mapInventory(rows: InventoryRow[]): StokKalemi[] {
  return rows.map((r) => ({
    id: r.id,
    ingredientId: r.ingredient_id,
    currentStock: parseFloat(String(r.current_stock)),
    physicalStock: r.physical_stock ? parseFloat(String(r.physical_stock)) : undefined,
  }));
}

/** daily_sales tablosundan → GunlukSatis[] */
function mapDailySales(rows: DailySaleRow[]): GunlukSatis[] {
  return rows.map((r) => ({
    id: r.id,
    productId: r.product_id,
    quantity: r.quantity,
    saleDate: String(r.sale_date),
  }));
}

// ═══════════════════════════════════════════════════════
// Yardımcı: DB'den ERP Verilerini Çekme
// ═══════════════════════════════════════════════════════

/**
 * PostgreSQL'den ERP motorunun ihtiyaç duyduğu tüm verileri çeker.
 * databaseService.getErpVerileri() fonksiyonunun görevini burada inline olarak yapar.
 * (Emre databaseService.ts'i doldurunca oraya taşınabilir)
 *
 * @param saleDate - Satış tarihi (YYYY-MM-DD), varsayılan bugün
 */
async function getErpVerileri(saleDate?: string) {
  const tarih = saleDate || new Date().toISOString().split('T')[0];

  console.log(`📦 ERP verileri çekiliyor (tarih: ${tarih})...`);

  // Paralel sorgu — performans için tüm verileri aynı anda çek
  const [productsRes, ingredientsRes, recipeItemsRes, inventoryRes, salesRes] = await Promise.all([
    query<ProductRow>('SELECT * FROM products ORDER BY id'),
    query<IngredientRow>('SELECT * FROM ingredients ORDER BY id'),
    query<RecipeItemRow>('SELECT * FROM recipe_items ORDER BY id'),
    query<InventoryRow>('SELECT * FROM inventory ORDER BY id'),
    query<DailySaleRow>('SELECT * FROM daily_sales WHERE sale_date = $1 ORDER BY id', [tarih]),
  ]);

  const urunler = mapProducts(productsRes.rows);
  const malzemeler = mapIngredients(ingredientsRes.rows);
  const receteler = mapRecipeItems(recipeItemsRes.rows);
  const stoklar = mapInventory(inventoryRes.rows);
  const gunlukSatislar = mapDailySales(salesRes.rows);

  // Fiziksel stokları ayrıca çıkar (reçete sapması için)
  const fizikselStoklar: StokKalemi[] = inventoryRes.rows
    .filter((r) => r.physical_stock !== null)
    .map((r) => ({
      id: r.id,
      ingredientId: r.ingredient_id,
      currentStock: parseFloat(String(r.physical_stock!)),
    }));

  console.log(`✅ ERP verileri hazır: ${urunler.length} ürün, ${malzemeler.length} malzeme, ${gunlukSatislar.length} satış`);

  return { urunler, malzemeler, receteler, stoklar, gunlukSatislar, fizikselStoklar };
}

/**
 * Analiz sonucunu analysis_results tablosuna kaydeder.
 */
async function kaydetAnalizSonucu(analiz: AnalizSonucu, aiSummary?: string): Promise<number> {
  const tarih = new Date().toISOString().split('T')[0];

  // Aynı gün için varsa güncelle, yoksa ekle (UPSERT)
  const result = await query<AnalysisResultRow>(
    `INSERT INTO analysis_results (date, result_data, ai_summary)
     VALUES ($1, $2, $3)
     ON CONFLICT (date) DO UPDATE SET
       result_data = $2,
       ai_summary = $3,
       created_at = NOW()
     RETURNING id`,
    [tarih, JSON.stringify(analiz), aiSummary || null]
  );

  console.log(`💾 Analiz sonucu kaydedildi (id: ${result.rows[0]?.id})`);
  return result.rows[0]?.id ?? 0;
}

// ═══════════════════════════════════════════════════════
// POST /api/analyze — Ana Analiz Endpoint'i
// ═══════════════════════════════════════════════════════

/**
 * Günlük analiz çalıştırır:
 * 1. databaseService'den tüm ERP verilerini çeker
 * 2. erpHesapMotoru.hesaplaGunlukAnaliz() ile saf hesaplama yapar
 * 3. Sonucu analysis_results tablosuna kaydeder
 * 4. Gemma ile yönetici özeti oluşturur (fallback dahil)
 * 5. Response olarak tam AnalizSonucu döndürür
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { date } = req.body as { date?: string };

    // 1. DB'den ERP verilerini çek
    const { urunler, malzemeler, receteler, stoklar, gunlukSatislar, fizikselStoklar } =
      await getErpVerileri(date);

    // Satış verisi yoksa uyar
    if (gunlukSatislar.length === 0) {
      console.warn('⚠️ Bugün için satış verisi bulunamadı. Analiz boş sonuç döndürebilir.');
    }

    // 2. ERP motorunu çalıştır (saf algoritmik hesaplama)
    const analizSonucu = hesaplaGunlukAnaliz(
      urunler,
      malzemeler,
      receteler,
      stoklar,
      gunlukSatislar,
      fizikselStoklar.length > 0 ? fizikselStoklar : undefined
    );

    // 3. Gemma ile yönetici özeti oluştur
    const gemmaOzet = await generateYoneticiOzeti(analizSonucu);
    analizSonucu.yoneticiyeOzet = gemmaOzet.text;

    // 4. Sonucu DB'ye kaydet
    await kaydetAnalizSonucu(analizSonucu, gemmaOzet.text);

    // 5. Response döndür
    console.log('✅ Analiz başarıyla tamamlandı ve kaydedildi.');
    res.json({
      success: true,
      data: analizSonucu,
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Bilinmeyen hata';
    console.error('❌ Analiz hatası:', errorMessage);

    res.status(500).json({
      success: false,
      error: `Analiz sırasında hata oluştu: ${errorMessage}`,
    });
  }
});

// ═══════════════════════════════════════════════════════
// GET /api/analyze/latest — Son Analiz Sonucunu Getir
// ═══════════════════════════════════════════════════════

// [AI-Agent: Skills] databaseService.getLastAnalysis() helper'ı kullanılıyor.
// Tek kaynak prensibi: analysis_results sorguları databaseService üzerinden yapılır.
/**
 * En son kaydedilen analiz sonucunu döndürür.
 * Dashboard ilk yüklendiğinde veya Copilot context için kullanılır.
 */
router.get('/latest', async (_req: Request, res: Response) => {
  try {
    const analizSonucu = await getLastAnalysis();

    res.json({
      success: true,
      data: analizSonucu,
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Bilinmeyen hata';
    console.error('❌ Son analiz çekme hatası:', errorMessage);

    res.status(500).json({
      success: false,
      error: `Son analiz alınamadı: ${errorMessage}`,
    });
  }
});

export default router;
