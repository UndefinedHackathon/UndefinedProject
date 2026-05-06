-- [AI-Agent: Skills] Demo seed verisi — seed-demo-data skill'ine uygun.
-- Min. 2 ürün, 4 malzeme, kritik stok + reçete sapması senaryosu içerir.
-- Manuel revizyon: Emre tarafından zenginleştirilecek.

-- ═══════════════════════════════════════════════════════
-- StockPilot AI — Demo Seed Data
-- Senaryo: Bir kafe — Latte, Türk Kahvesi, Cheesecake, Tost
-- ═══════════════════════════════════════════════════════

-- Mevcut veriyi temizle
TRUNCATE products, ingredients, recipe_items, inventory, daily_sales, analysis_results RESTART IDENTITY CASCADE;

-- ─── ÜRÜNLER ─────────────────────────────────────────
INSERT INTO products (name, price, category) VALUES
  ('Latte',           45.00,  'İçecek'),
  ('Türk Kahvesi',    35.00,  'İçecek'),
  ('Cheesecake',      85.00,  'Tatlı'),
  ('Tost (Kaşarlı)',  60.00,  'Yiyecek'),
  ('Americano',       40.00,  'İçecek'),
  ('Brownie',         70.00,  'Tatlı');

-- ─── MALZEMELER ──────────────────────────────────────
INSERT INTO ingredients (name, unit, unit_cost, min_stock_level) VALUES
  ('Espresso Çekirdeği', 'kg',   320.00,  2.000),   -- id=1
  ('Süt',                'lt',    28.00,  10.000),   -- id=2
  ('Türk Kahvesi',       'kg',   280.00,  1.000),    -- id=3
  ('Krem Peynir',        'kg',   180.00,  1.500),    -- id=4
  ('Tost Ekmeği',        'adet',   5.00,  30.000),   -- id=5
  ('Kaşar Peyniri',      'kg',   200.00,  2.000),    -- id=6
  ('Şeker',              'kg',    45.00,  3.000),    -- id=7
  ('Kakao Tozu',         'kg',   150.00,  0.500),    -- id=8
  ('Un',                 'kg',    30.00,  2.000),    -- id=9
  ('Tereyağı',           'kg',   250.00,  1.000);    -- id=10

-- ─── REÇETELER (Ürün-Malzeme İlişkisi) ──────────────
-- Latte: 0.02 kg espresso + 0.25 lt süt
INSERT INTO recipe_items (product_id, ingredient_id, quantity_per_unit) VALUES
  (1, 1, 0.0200),   -- Latte → Espresso
  (1, 2, 0.2500);   -- Latte → Süt

-- Türk Kahvesi: 0.01 kg türk kahvesi + 0.005 kg şeker
INSERT INTO recipe_items (product_id, ingredient_id, quantity_per_unit) VALUES
  (2, 3, 0.0100),   -- Türk Kahvesi → Türk Kahvesi tozu
  (2, 7, 0.0050);   -- Türk Kahvesi → Şeker

-- Cheesecake (dilim): 0.08 kg krem peynir + 0.03 kg şeker + 0.02 kg tereyağı
INSERT INTO recipe_items (product_id, ingredient_id, quantity_per_unit) VALUES
  (3, 4, 0.0800),   -- Cheesecake → Krem Peynir
  (3, 7, 0.0300),   -- Cheesecake → Şeker
  (3, 10, 0.0200);  -- Cheesecake → Tereyağı

-- Tost: 2 adet tost ekmeği + 0.06 kg kaşar
INSERT INTO recipe_items (product_id, ingredient_id, quantity_per_unit) VALUES
  (4, 5, 2.0000),   -- Tost → Tost Ekmeği
  (4, 6, 0.0600);   -- Tost → Kaşar

-- Americano: 0.02 kg espresso
INSERT INTO recipe_items (product_id, ingredient_id, quantity_per_unit) VALUES
  (5, 1, 0.0200);   -- Americano → Espresso

-- Brownie: 0.04 kg kakao + 0.03 kg un + 0.03 kg tereyağı + 0.04 kg şeker
INSERT INTO recipe_items (product_id, ingredient_id, quantity_per_unit) VALUES
  (6, 8, 0.0400),   -- Brownie → Kakao Tozu
  (6, 9, 0.0300),   -- Brownie → Un
  (6, 10, 0.0300),  -- Brownie → Tereyağı
  (6, 7, 0.0400);   -- Brownie → Şeker

-- ─── ENVANTER (STOK DURUMLARI) ───────────────────────
-- Senaryo: Espresso çekirdeği ve krem peynir KRİTİK seviyede,
--          Süt SARI uyarı seviyesinde, diğerleri normal.
INSERT INTO inventory (ingredient_id, current_stock) VALUES
  (1,  1.500),   -- Espresso: 1.5 kg (min 2.0 → 🔴 KRİTİK!)
  (2, 11.000),   -- Süt: 11 lt (min 10.0 → 🟡 dikkat, yakın)
  (3,  2.500),   -- Türk Kahvesi: 2.5 kg (normal)
  (4,  0.800),   -- Krem Peynir: 0.8 kg (min 1.5 → 🔴 KRİTİK!)
  (5, 45.000),   -- Tost Ekmeği: 45 adet (normal)
  (6,  3.000),   -- Kaşar: 3 kg (normal)
  (7,  4.000),   -- Şeker: 4 kg (normal)
  (8,  0.600),   -- Kakao Tozu: 0.6 kg (min 0.5 → 🟡 dikkat)
  (9,  3.000),   -- Un: 3 kg (normal)
  (10, 1.200);   -- Tereyağı: 1.2 kg (normal)

-- ─── GÜNLÜK SATIŞLAR (BUGÜN) ─────────────────────────
-- Senaryo: Yoğun bir gün — espresso ve krem peynir tüketimi yüksek
INSERT INTO daily_sales (product_id, quantity, sale_date) VALUES
  (1, 35, CURRENT_DATE),   -- 35 Latte satıldı
  (2, 20, CURRENT_DATE),   -- 20 Türk Kahvesi
  (3, 12, CURRENT_DATE),   -- 12 Cheesecake
  (4, 18, CURRENT_DATE),   -- 18 Tost
  (5, 15, CURRENT_DATE),   -- 15 Americano
  (6,  8, CURRENT_DATE);   -- 8 Brownie

-- ═══════════════════════════════════════════════════════
-- Beklenen Senaryo Sonuçları:
-- 🔴 Espresso Çekirdeği: Stok 1.5 kg, Min 2.0 kg → KRİTİK
--    Günlük teorik tüketim: (35+15) × 0.02 = 1.0 kg
--    Kalan stok: 1.5 - 1.0 = 0.5 kg (çok düşük!)
-- 🔴 Krem Peynir: Stok 0.8 kg, Min 1.5 kg → KRİTİK
--    Günlük teorik tüketim: 12 × 0.08 = 0.96 kg
--    Kalan stok: 0.8 - 0.96 = -0.16 kg (EKSİ! Zaten yetmemiş!)
-- 🟡 Süt: Stok 11 lt, Min 10 lt → DİKKAT
--    Günlük teorik tüketim: 35 × 0.25 = 8.75 lt
--    Kalan stok: 11 - 8.75 = 2.25 lt (yarın sorun olabilir)
-- 🟡 Kakao Tozu: Stok 0.6 kg, Min 0.5 → DİKKAT
-- Toplam gelir: 35×45 + 20×35 + 12×85 + 18×60 + 15×40 + 8×70 = 5,875 TL
-- ═══════════════════════════════════════════════════════
