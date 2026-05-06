---
name: database-service-layer
description: Emre'nin ana sorumluluğundaki Database Service. PostgreSQL verilerini ERP motorunun beklediği tipe ve yapıya dönüştürür.
---

# Database Service Layer (databaseService.ts)

## Sorumlu: Emre

## Görevi
`erpHesapMotoru.ts` saf bir hesaplama modülü olduğu için, veritabanındaki ham SQL sonuçlarının bu motorun beklediği TypeScript arayüzlerine dönüştürülmesi gerekir. `databaseService.ts` bu köprü görevini üstlenir. 

Aynı zamanda tüm CRUD operasyonları (Malzemeler, Ürünler, Reçeteler, Satışlar) Emre tarafından PostgreSQL şemasına uygun olarak yazılır.

## Kritik Uyum Noktası
Emre'nin `databaseService` çıktısı ile Samet'in `erpHesapMotoru` girdi formatı **birebir** aynı olmalıdır. İsimlendirmelerde `snake_case` (DB) ile `camelCase` (TS) dönüşümleri burada yapılır.

## Beklenen Fonksiyonlar
```typescript
export async function getErpVerileri() {
  const urunler = await db.query('SELECT * FROM products');
  const malzemeler = await db.query('SELECT * FROM ingredients');
  const receteler = await db.query('SELECT * FROM recipe_items');
  const stoklar = await db.query('SELECT * FROM inventory');
  const satislar = await db.query('SELECT * FROM daily_sales WHERE date = CURRENT_DATE');

  // Dönüşümleri yap ve ERP'nin beklediği formatta dön:
  return {
    urunler: mapProducts(urunler.rows),
    malzemeler: mapIngredients(malzemeler.rows),
    receteler: mapRecipes(receteler.rows),
    stoklar: mapInventory(stoklar.rows),
    gunlukSatislar: mapSales(satislar.rows)
  };
}

export async function kaydetAnalizSonucu(sonuc: AnalizSonucu) {
  // ERP'den dönen sonucu dashboard için veritabanına kaydeder
  await db.query(
    'INSERT INTO analysis_results (result_data) VALUES ($1)',
    [JSON.stringify(sonuc)]
  );
}
```

## Kurallar
1. DB bağlantısı `pool.ts` üzerinden yapılmalıdır.
2. Zod ile gelen request body'ler CRUD işlemlerinden önce doğrulanmalıdır.
3. Test verisi oluşturmak için `seed.sql` güncel tutulmalıdır.
