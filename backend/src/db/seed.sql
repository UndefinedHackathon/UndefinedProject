-- [AI-Agent: Skills] Demo seed verisi — seed-demo-data ve postgresql-patterns skill'lerine uygun.
-- Sorumlu: Emre
-- İçerik: 6 ürün, 10 malzeme, tam reçeteler, kritik stok + reçete sapması senaryosu
-- Son Güncelleme: 2026-05-06

-- ═══════════════════════════════════════════════════════
-- StockPilot AI — Demo Seed Data
-- Senaryo: Bir kafe — Latte, Türk Kahvesi, Cheesecake, Tost, Americano, Brownie
-- ═══════════════════════════════════════════════════════

-- Mevcut veriyi temizle (idempotent seed)
TRUNCATE products, ingredients, recipe_items, inventory, daily_sales, analysis_results
  RESTART IDENTITY CASCADE;


-- ─── 1. ÜRÜNLER ──────────────────────────────────────
-- 6 adet kafe menü ürünü: 3 içecek, 1 yiyecek, 2 tatlı
INSERT INTO products (name, price, category) VALUES
  ('Latte',           45.00,  'İçecek'),    -- id=1
  ('Türk Kahvesi',    35.00,  'İçecek'),    -- id=2
  ('Cheesecake',      85.00,  'Tatlı'),     -- id=3
  ('Tost (Kaşarlı)',  60.00,  'Yiyecek'),   -- id=4
  ('Americano',       40.00,  'İçecek'),    -- id=5
  ('Brownie',         70.00,  'Tatlı');     -- id=6


-- ─── 2. MALZEMELER ───────────────────────────────────
-- 10 adet ham madde — birim, maliyet ve kritik stok eşikleri
INSERT INTO ingredients (name, unit, unit_cost, min_stock_level) VALUES
  ('Espresso Çekirdeği',  'kg',    320.00,   2.000),   -- id=1  | Kahve bazlı ürünlerin ana maddesi
  ('Süt',                 'lt',     28.00,  10.000),   -- id=2  | Latte'nin ana malzemesi
  ('Türk Kahvesi',        'kg',    280.00,   1.000),   -- id=3  | Türk kahvesi tozu
  ('Krem Peynir',         'kg',    180.00,   1.500),   -- id=4  | Cheesecake ana malzemesi
  ('Tost Ekmeği',         'adet',    5.00,  30.000),   -- id=5  | Tost için ekmek
  ('Kaşar Peyniri',       'kg',    200.00,   2.000),   -- id=6  | Tost için peynir
  ('Şeker',               'kg',     45.00,   3.000),   -- id=7  | Çoklu ürün: kahve, tatlı
  ('Kakao Tozu',          'kg',    150.00,   0.500),   -- id=8  | Brownie malzemesi
  ('Un',                  'kg',     30.00,   2.000),   -- id=9  | Brownie malzemesi
  ('Tereyağı',            'kg',    250.00,   1.000);   -- id=10 | Cheesecake + Brownie


-- ─── 3. REÇETELER (Ürün-Malzeme İlişkileri) ─────────
-- Her ürünün 1 adedini üretmek için gereken malzeme miktarları

-- Latte (id=1): 0.02 kg espresso + 0.25 lt süt
INSERT INTO recipe_items (product_id, ingredient_id, quantity_per_unit) VALUES
  (1, 1, 0.0200),   -- Latte → Espresso Çekirdeği
  (1, 2, 0.2500);   -- Latte → Süt

-- Türk Kahvesi (id=2): 0.01 kg türk kahvesi + 0.005 kg şeker
INSERT INTO recipe_items (product_id, ingredient_id, quantity_per_unit) VALUES
  (2, 3, 0.0100),   -- Türk Kahvesi → Türk Kahvesi tozu
  (2, 7, 0.0050);   -- Türk Kahvesi → Şeker

-- Cheesecake (id=3): 0.08 kg krem peynir + 0.03 kg şeker + 0.02 kg tereyağı
INSERT INTO recipe_items (product_id, ingredient_id, quantity_per_unit) VALUES
  (3, 4, 0.0800),   -- Cheesecake → Krem Peynir
  (3, 7, 0.0300),   -- Cheesecake → Şeker
  (3, 10, 0.0200);  -- Cheesecake → Tereyağı

-- Tost (id=4): 2 adet tost ekmeği + 0.06 kg kaşar
INSERT INTO recipe_items (product_id, ingredient_id, quantity_per_unit) VALUES
  (4, 5, 2.0000),   -- Tost → Tost Ekmeği
  (4, 6, 0.0600);   -- Tost → Kaşar Peyniri

-- Americano (id=5): 0.02 kg espresso
INSERT INTO recipe_items (product_id, ingredient_id, quantity_per_unit) VALUES
  (5, 1, 0.0200);   -- Americano → Espresso Çekirdeği

-- Brownie (id=6): 0.04 kg kakao + 0.03 kg un + 0.03 kg tereyağı + 0.04 kg şeker
INSERT INTO recipe_items (product_id, ingredient_id, quantity_per_unit) VALUES
  (6, 8, 0.0400),   -- Brownie → Kakao Tozu
  (6, 9, 0.0300),   -- Brownie → Un
  (6, 10, 0.0300),  -- Brownie → Tereyağı
  (6, 7, 0.0400);   -- Brownie → Şeker


-- ─── 4. ENVANTER (STOK DURUMLARI + FİZİKSEL SAYIM) ──
-- 🎯 Senaryo Tasarımı:
--   🔴 KRİTİK: Espresso Çekirdeği, Krem Peynir (min_stock altında)
--   🟡 DİKKAT: Süt, Kakao Tozu (eşiğe çok yakın)
--   ✅ NORMAL: Diğer malzemeler
--
-- 🔍 REÇETE SAPMASI (physical_stock ≠ teorik beklenen):
--   Süt ve Kaşar Peyniri'nde fiziksel sayım, teorik hesaptan düşük çıkıyor.
--   Bu fire/döküntü/hırsızlık senaryosunu tetikler → kâr kaçağı tespiti!

INSERT INTO inventory (ingredient_id, current_stock, physical_stock) VALUES
  -- 🔴 KRİTİK STOK SENARYOLARI
  (1,   1.500,  1.400),    -- Espresso Çekirdeği: 1.5 kg (min 2.0 → KRİTİK!)
                            --   Fiziksel sayım: 1.4 kg → 0.1 kg fire/sapma
  (4,   0.800,  0.700),    -- Krem Peynir: 0.8 kg (min 1.5 → KRİTİK!)
                            --   Fiziksel sayım: 0.7 kg → 0.1 kg fire/sapma

  -- 🟡 DİKKAT SENARYOLARI
  (2,  11.000,  9.500),    -- Süt: 11 lt (min 10 → yaklaşıyor)
                            --   ⚠️ Fiziksel sayım: 9.5 lt → 1.5 lt KAYIP! (döküntü/ölçüm hatası)
  (8,   0.600,  0.550),    -- Kakao Tozu: 0.6 kg (min 0.5 → DİKKAT)
                            --   Fiziksel sayım: 0.55 kg → 0.05 kg sapma

  -- ✅ NORMAL STOK (sayım yok veya sapmasız)
  (3,   2.500,  NULL),     -- Türk Kahvesi: 2.5 kg (normal, sayım yapılmadı)
  (5,  45.000,  44.000),   -- Tost Ekmeği: 45 adet (normal)
                            --   Fiziksel: 44 → 1 adet kayıp
  (6,   3.000,  2.600),    -- Kaşar Peyniri: 3 kg (normal ama...)
                            --   ⚠️ Fiziksel sayım: 2.6 kg → 0.4 kg KAYIP! (en yüksek sapma oranı!)
  (7,   4.000,  NULL),     -- Şeker: 4 kg (normal, sayım yapılmadı)
  (9,   3.000,  NULL),     -- Un: 3 kg (normal, sayım yapılmadı)
  (10,  1.200,  1.150);    -- Tereyağı: 1.2 kg (normal)
                            --   Fiziksel: 1.15 kg → 0.05 kg sapma


-- ─── 5. GÜNLÜK SATIŞLAR (BUGÜN) ─────────────────────
-- Senaryo: Yoğun bir gün — toplam 108 ürün satışı
INSERT INTO daily_sales (product_id, quantity, sale_date) VALUES
  (1, 35, CURRENT_DATE),   -- 35 Latte        → 35 × 45₺ = 1,575₺
  (2, 20, CURRENT_DATE),   -- 20 Türk Kahvesi → 20 × 35₺ =   700₺
  (3, 12, CURRENT_DATE),   -- 12 Cheesecake   → 12 × 85₺ = 1,020₺
  (4, 18, CURRENT_DATE),   -- 18 Tost         → 18 × 60₺ = 1,080₺
  (5, 15, CURRENT_DATE),   -- 15 Americano    → 15 × 40₺ =   600₺
  (6,  8, CURRENT_DATE);   --  8 Brownie      →  8 × 70₺ =   560₺
                            -- ─────────────────────────────────────
                            -- TOPLAM: 108 adet, 5,535₺ gelir


-- ═══════════════════════════════════════════════════════
-- 📊 BEKLENEN SENARYO SONUÇLARI (ERP Motoru doğrulama)
-- ═══════════════════════════════════════════════════════
--
-- ─── TEORİK TÜKETİM ─────────────────────────────────
-- Espresso Çekirdeği: (35 Latte + 15 Americano) × 0.02 = 1.000 kg
-- Süt:               35 Latte × 0.25                   = 8.750 lt
-- Türk Kahvesi:      20 × 0.01                         = 0.200 kg
-- Krem Peynir:       12 Cheesecake × 0.08              = 0.960 kg
-- Tost Ekmeği:       18 Tost × 2                       = 36.000 adet
-- Kaşar Peyniri:     18 Tost × 0.06                    = 1.080 kg
-- Şeker:   (20×0.005) + (12×0.03) + (8×0.04)          = 0.780 kg
-- Kakao Tozu:        8 Brownie × 0.04                  = 0.320 kg
-- Un:                8 Brownie × 0.03                  = 0.240 kg
-- Tereyağı: (12×0.02) + (8×0.03)                      = 0.480 kg
--
-- ─── KRİTİK STOK ANALİZİ ────────────────────────────
-- 🔴 Espresso Çekirdeği:
--    Stok: 1.500 kg, Tüketim: 1.000 kg, Kalan: 0.500 kg
--    Min eşik: 2.000 kg → ZATEN eşiğin altında! ACİL sipariş!
--
-- 🔴 Krem Peynir:
--    Stok: 0.800 kg, Tüketim: 0.960 kg, Kalan: -0.160 kg
--    Min eşik: 1.500 kg → EKSİ stok! Gün içinde yetmemiş!
--
-- 🟡 Süt:
--    Stok: 11.000 lt, Tüketim: 8.750 lt, Kalan: 2.250 lt
--    Min eşik: 10.000 lt → Yarın sorun olabilir
--
-- 🟡 Kakao Tozu:
--    Stok: 0.600 kg, Tüketim: 0.320 kg, Kalan: 0.280 kg
--    Min eşik: 0.500 kg → Eşiğin altına düşmüş!
--
-- ─── REÇETE SAPMASI (GİZLİ KAYIP) ───────────────────
-- 🔍 Süt:
--    Sistem stoku: 11.000 lt, Fiziksel sayım: 9.500 lt
--    Fark: 1.500 lt → Maliyet: 1.5 × 28₺ = 42.00₺ kayıp
--    Olası sebep: Taşma, ölçüm hatası, döküntü
--
-- 🔍 Kaşar Peyniri:
--    Sistem stoku: 3.000 kg, Fiziksel sayım: 2.600 kg
--    Fark: 0.400 kg → Maliyet: 0.4 × 200₺ = 80.00₺ kayıp
--    Olası sebep: Reçeteden fazla kullanım, fire
--
-- 🔍 Espresso Çekirdeği:
--    Sistem stoku: 1.500 kg, Fiziksel sayım: 1.400 kg
--    Fark: 0.100 kg → Maliyet: 0.1 × 320₺ = 32.00₺ kayıp
--
-- 🔍 Krem Peynir:
--    Sistem stoku: 0.800 kg, Fiziksel sayım: 0.700 kg
--    Fark: 0.100 kg → Maliyet: 0.1 × 180₺ = 18.00₺ kayıp
--
-- 🔍 Tost Ekmeği:
--    Sistem stoku: 45.000 adet, Fiziksel: 44.000 adet
--    Fark: 1.000 adet → Maliyet: 1 × 5₺ = 5.00₺ kayıp
--
-- 🔍 Toplam Tahmini Kâr Kaçağı: ~177₺/gün
--
-- ─── TOPLAM GELİR ────────────────────────────────────
-- 35×45 + 20×35 + 12×85 + 18×60 + 15×40 + 8×70 = 5,535₺
-- ═══════════════════════════════════════════════════════
