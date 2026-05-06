-- [AI-Agent: Skills] Bu şema postgresql-patterns skill'ine uygun olarak oluşturulmuştur.
-- Manuel revizyon: Emre tarafından kontrol edilecek.

-- ═══════════════════════════════════════════════════════
-- StockPilot AI — PostgreSQL Veritabanı Şeması
-- ═══════════════════════════════════════════════════════

-- Mevcut tabloları temizle (geliştirme ortamı için)
DROP TABLE IF EXISTS analysis_results CASCADE;
DROP TABLE IF EXISTS daily_sales CASCADE;
DROP TABLE IF EXISTS inventory CASCADE;
DROP TABLE IF EXISTS recipe_items CASCADE;
DROP TABLE IF EXISTS ingredients CASCADE;
DROP TABLE IF EXISTS products CASCADE;

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
  unit            VARCHAR(20) NOT NULL,          -- kg, lt, adet, gr
  unit_cost       DECIMAL(10,2) NOT NULL,
  min_stock_level DECIMAL(10,3) NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Reçete (Ürün-Malzeme İlişkisi) ─────────────────
CREATE TABLE recipe_items (
  id                SERIAL PRIMARY KEY,
  product_id        INTEGER REFERENCES products(id) ON DELETE CASCADE,
  ingredient_id     INTEGER REFERENCES ingredients(id) ON DELETE CASCADE,
  quantity_per_unit DECIMAL(10,4) NOT NULL,      -- 1 ürün için ne kadar
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
  result_data JSONB NOT NULL,                    -- tam analiz sonucu
  ai_summary  TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Performans İndexleri ────────────────────────────
CREATE INDEX idx_daily_sales_date      ON daily_sales(sale_date);
CREATE INDEX idx_analysis_results_date ON analysis_results(date);
CREATE INDEX idx_recipe_product        ON recipe_items(product_id);
CREATE INDEX idx_recipe_ingredient     ON recipe_items(ingredient_id);
