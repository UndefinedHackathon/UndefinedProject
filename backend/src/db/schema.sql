-- [AI-Agent: Skills] Bu şema postgresql-patterns ve database-service-layer skill'lerine uygun olarak hazırlanmıştır.
-- Sorumlu: Emre
-- Son Güncelleme: 2026-05-06

-- ═══════════════════════════════════════════════════════
-- StockPilot AI — PostgreSQL Veritabanı Şeması
-- Tablolar: products, ingredients, recipe_items,
--           inventory, daily_sales, analysis_results
-- ═══════════════════════════════════════════════════════

-- Mevcut tabloları temizle (geliştirme ortamı için)
DROP TABLE IF EXISTS analysis_results CASCADE;
DROP TABLE IF EXISTS daily_sales CASCADE;
DROP TABLE IF EXISTS inventory CASCADE;
DROP TABLE IF EXISTS recipe_items CASCADE;
DROP TABLE IF EXISTS ingredients CASCADE;
DROP TABLE IF EXISTS products CASCADE;

-- ─── Ürünler ─────────────────────────────────────────
-- Kafe menüsündeki satılabilir ürünler (Latte, Tost vb.)
CREATE TABLE products (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  price       DECIMAL(10,2) NOT NULL,               -- Satış fiyatı (TL)
  category    VARCHAR(50) NOT NULL DEFAULT 'genel',  -- İçecek, Yiyecek, Tatlı
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE products IS 'Kafe menü ürünleri — satış fiyatı ve kategorisi ile';

-- ─── Malzemeler ──────────────────────────────────────
-- Ham maddeler / envanter kalemleri (Espresso Çekirdeği, Süt vb.)
CREATE TABLE ingredients (
  id              SERIAL PRIMARY KEY,
  name            VARCHAR(100) NOT NULL,
  unit            VARCHAR(20) NOT NULL,                -- kg, lt, adet, gr
  unit_cost       DECIMAL(10,2) NOT NULL,              -- Birim maliyet (TL)
  min_stock_level DECIMAL(10,3) NOT NULL DEFAULT 0,    -- Kritik stok eşiği
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE ingredients IS 'Ham maddeler — birim, maliyet ve kritik stok eşiği ile';

-- ─── Reçete (Ürün-Malzeme İlişkisi) ─────────────────
-- Bir ürün üretmek için hangi malzemeden ne kadar gerektiğini tanımlar.
CREATE TABLE recipe_items (
  id                SERIAL PRIMARY KEY,
  product_id        INTEGER REFERENCES products(id) ON DELETE CASCADE,
  ingredient_id     INTEGER REFERENCES ingredients(id) ON DELETE CASCADE,
  quantity_per_unit DECIMAL(10,4) NOT NULL,            -- 1 adet ürün için gereken miktar
  UNIQUE(product_id, ingredient_id)
);
COMMENT ON TABLE recipe_items IS 'Ürün reçeteleri — her ürün için gerekli malzeme miktarları';

-- ─── Envanter (Stok Durumu) ───────────────────────────
-- Her malzemenin güncel stok durumu ve opsiyonel fiziksel sayım değeri.
-- physical_stock: Gün sonu fiziksel sayım sonucu (reçete sapması hesabı için)
CREATE TABLE inventory (
  id              SERIAL PRIMARY KEY,
  ingredient_id   INTEGER REFERENCES ingredients(id) ON DELETE CASCADE,
  current_stock   DECIMAL(10,3) NOT NULL DEFAULT 0,    -- Sistem stoku (mevcut miktar)
  physical_stock  DECIMAL(10,3) DEFAULT NULL,          -- Fiziksel sayım (opsiyonel, reçete sapması için)
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(ingredient_id)
);
COMMENT ON TABLE inventory IS 'Envanter durumu — sistem stoku ve fiziksel sayım karşılaştırması';

-- ─── Günlük Satışlar ─────────────────────────────────
-- Her gün hangi üründen kaç adet satıldığı
CREATE TABLE daily_sales (
  id          SERIAL PRIMARY KEY,
  product_id  INTEGER REFERENCES products(id) ON DELETE CASCADE,
  quantity    INTEGER NOT NULL DEFAULT 0,
  sale_date   DATE NOT NULL DEFAULT CURRENT_DATE,
  UNIQUE(product_id, sale_date)
);
COMMENT ON TABLE daily_sales IS 'Günlük satış kayıtları — ürün bazında adet';

-- ─── Analiz Sonuçları (ERP + AI Çıktısı) ────────────
-- ERP motorunun ürettiği analiz sonuçları ve Gemma'nın yönetici özeti.
-- result_data JSONB: AnalizSonucu tipindeki tüm hesaplamalar
CREATE TABLE analysis_results (
  id          SERIAL PRIMARY KEY,
  date        DATE NOT NULL UNIQUE,
  result_data JSONB NOT NULL,                          -- Tam analiz sonucu (AnalizSonucu)
  ai_summary  TEXT,                                    -- Gemma tarafından oluşturulan yönetici özeti
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE analysis_results IS 'ERP analiz sonuçları — JSONB olarak tam hesaplama + AI özeti';

-- ─── Performans İndexleri ────────────────────────────
CREATE INDEX idx_daily_sales_date      ON daily_sales(sale_date);
CREATE INDEX idx_analysis_results_date ON analysis_results(date);
CREATE INDEX idx_recipe_product        ON recipe_items(product_id);
CREATE INDEX idx_recipe_ingredient     ON recipe_items(ingredient_id);
