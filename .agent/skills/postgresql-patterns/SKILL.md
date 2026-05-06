---
name: postgresql-patterns
description: StockPilot AI PostgreSQL şema tasarımı, seed data yapısı, sorgu kalıpları ve index stratejisi. Her DB işleminde bu kurallara uy.
---

# PostgreSQL Kalıpları ve Şema

## Şema Kuralları
- Tablo isimleri: `snake_case`, çoğul (products, ingredients)
- Kolon isimleri: `snake_case`
- Her tabloda: `id SERIAL PRIMARY KEY`, `created_at TIMESTAMPTZ DEFAULT NOW()`
- Fiyatlar `DECIMAL(10,2)` — float kullanma
- Miktarlar `DECIMAL(10,3)` — 3 ondalık (gram hassasiyet)
- JSONB sadece `analysis_results` tablosunda

## Tam Şema

```sql
-- ─── Ürünler ─────────────────────────────────────────
CREATE TABLE products (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  price       DECIMAL(10,2) NOT NULL,
  category    VARCHAR(50) NOT NULL DEFAULT 'genel',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Malzemeler ──────────────────────────────────────
CREATE TABLE ingredients (
  id              SERIAL PRIMARY KEY,
  name            VARCHAR(100) NOT NULL,
  unit            VARCHAR(20) NOT NULL,  -- kg, lt, adet, gr
  unit_cost       DECIMAL(10,2) NOT NULL,
  min_stock_level DECIMAL(10,3) NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Reçete (Ürün-Malzeme İlişkisi) ─────────────────
CREATE TABLE recipe_items (
  id                SERIAL PRIMARY KEY,
  product_id        INTEGER REFERENCES products(id) ON DELETE CASCADE,
  ingredient_id     INTEGER REFERENCES ingredients(id) ON DELETE CASCADE,
  quantity_per_unit DECIMAL(10,4) NOT NULL,  -- 1 ürün için ne kadar
  UNIQUE(product_id, ingredient_id)
);

-- ─── Envanter (Stok Durumu) ───────────────────────────
CREATE TABLE inventory (
  id              SERIAL PRIMARY KEY,
  ingredient_id   INTEGER REFERENCES ingredients(id) ON DELETE CASCADE,
  current_stock   DECIMAL(10,3) NOT NULL DEFAULT 0,
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(ingredient_id)
);

-- ─── Günlük Satışlar ─────────────────────────────────
CREATE TABLE daily_sales (
  id          SERIAL PRIMARY KEY,
  product_id  INTEGER REFERENCES products(id) ON DELETE CASCADE,
  quantity    INTEGER NOT NULL DEFAULT 0,
  sale_date   DATE NOT NULL DEFAULT CURRENT_DATE,
  UNIQUE(product_id, sale_date)
);

-- ─── Analiz Sonuçları (ERP + AI Çıktısı) ────────────
CREATE TABLE analysis_results (
  id          SERIAL PRIMARY KEY,
  date        DATE NOT NULL,
  result_data JSONB NOT NULL,  -- tam analiz sonucu
  ai_summary  TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Performans İndexleri ────────────────────────────
CREATE INDEX idx_daily_sales_date      ON daily_sales(sale_date);
CREATE INDEX idx_analysis_results_date ON analysis_results(date);
CREATE INDEX idx_recipe_product        ON recipe_items(product_id);
CREATE INDEX idx_recipe_ingredient     ON recipe_items(ingredient_id);
```

## Sorgu Kalıpları

-- (ERP motoru `erpHesapMotoru.ts` içinde TypeScript ile hesaplanır, SQL'de değil.)

### Dashboard Özet
```sql
SELECT
  COALESCE(SUM(ds.quantity * p.price), 0) AS total_revenue,
  COALESCE(SUM(ds.quantity), 0) AS total_items_sold
FROM daily_sales ds
JOIN products p ON ds.product_id = p.id
WHERE ds.date = $1;
```

## Transaction Kullanımı
Seed ve analiz kaydetme işlemleri transaction içinde yapılmalı:
```typescript
const client = await pool.connect();
try {
  await client.query('BEGIN');
  // ... birden fazla INSERT/UPDATE
  await client.query('COMMIT');
} catch (err) {
  await client.query('ROLLBACK');
  throw err;
} finally {
  client.release();
}
```

## Parameterized Query — SQL Injection Koruması
```typescript
// ✅ DOĞRU
await query('SELECT * FROM products WHERE id = $1', [productId]);

// ❌ YANLIŞ — SQL Injection açığı
await query(`SELECT * FROM products WHERE id = ${productId}`);
```
