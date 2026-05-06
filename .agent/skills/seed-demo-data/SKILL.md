---
name: seed-demo-data
description: Emre'nin hazırlayacağı seed.sql dosyası ile projeye gerçekçi demo verisi yükleme kuralları.
---

# Demo Veri Seed Sistemi (seed.sql)

## Sorumlu: Emre

## Görevi
Hackathon sunumunda dashboard'un dolu ve etkileyici görünmesi için `schema.sql` çalıştıktan sonra veritabanına eklenecek varsayılan verileri (`seed.sql` dosyası) hazırlamaktır.

## Beklenen Minimum Veri Seti
Sunumun başarılı geçmesi için şu veriler kesinlikle eklenmelidir:
1. **Ürünler:** En az 2 ürün (Örn: Kaşarlı Tost, Sucuklu Tost).
2. **Malzemeler:** En az 4 ham madde (Örn: Kaşar, Tost Ekmeği, Sucuk, Domates).
3. **Reçeteler:** Ürünlerin reçeteleri tam ve doğru oranlarla girilmelidir.
4. **Kritik Stok (Kırmızı & Sarı):** Satın alma önerisi üretebilmesi için stokta az kalmış malzemeler.
5. **Reçete Sapması (Gizli Kayıp):** Teorik tüketimden daha fazla harcanmış olan malzeme durumu.
6. **Günlük Satışlar:** O gün satılmış olan ürünlerin adetleri.

## Örnek `seed.sql` Mantığı
```sql
-- 1. Malzemeler
INSERT INTO ingredients (name, unit, unit_cost, min_stock) VALUES
('Kaşar', 'dilim', 8, 50),
('Tost Ekmeği', 'adet', 3, 40),
('Sucuk', 'dilim', 5, 60);

-- 2. Ürünler
INSERT INTO products (name, price) VALUES
('Kaşarlı Tost', 90),
('Karışık Tost', 120);

-- 3. Reçeteler
INSERT INTO recipe_items (product_id, ingredient_id, quantity) VALUES
(1, 1, 1), -- 1 Kaşarlı Tost = 1 dilim kaşar
(1, 2, 2); -- 1 Kaşarlı Tost = 2 dilim ekmek

-- 4. Stok Durumu (Kritik Stok oluşturacak şekilde)
INSERT INTO inventory (ingredient_id, current_stock) VALUES
(1, 10), -- Kritik! 50'nin altında.
(2, 20);

-- 5. Satışlar
INSERT INTO daily_sales (product_id, quantity, sale_date) VALUES
(1, 40, CURRENT_DATE);
```

## Dikkat Edilmesi Gerekenler
- Birimler birbirine uymalıdır (Örn: Reçetede dilim yazıyorsa stokta da dilim olmalıdır).
- Satış adedi, mevcut stok ve reçete miktarları mantıklı ayarlanmalıdır ki ERP motoru doğru sonuç üretsin.
