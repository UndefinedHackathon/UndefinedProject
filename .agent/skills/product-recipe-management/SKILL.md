---
name: product-recipe-management
description: Ürün ve reçete/gramaj CRUD operasyonları. Ürün ekleme, malzeme tanımlama, reçete ilişkilendirme ve Products & Recipes sayfası veri akışı.
---

# Ürün ve Reçete Yönetimi

## Ne Zaman Kullan
- Products & Recipes sayfası oluşturulurken
- Ürün, malzeme veya reçete CRUD işlemlerinde
- Reçete-stok ilişkisi kurulurken

## Veri Modeli
```
products (1) ──→ (N) recipe_items (N) ←── (1) ingredients
   ↓                                           ↓
daily_sales                                inventory + waste_records
```

## Backend Endpoint'leri
```typescript
// src/routes/products.route.ts
GET    /api/products              → Tüm ürünler + reçeteleri
GET    /api/products/:id          → Tek ürün detayı
POST   /api/products              → Yeni ürün ekle
PUT    /api/products/:id          → Ürün güncelle
DELETE /api/products/:id          → Ürün sil (cascade)

GET    /api/ingredients           → Tüm malzemeler
POST   /api/ingredients           → Yeni malzeme ekle

POST   /api/recipes               → Reçete satırı ekle
DELETE /api/recipes/:id           → Reçete satırı sil
```

## Ürün + Reçete JOIN Sorgusu
```sql
SELECT 
  p.id, p.name, p.price, p.category,
  json_agg(json_build_object(
    'ingredient_id', i.id,
    'ingredient_name', i.name,
    'quantity_per_unit', ri.quantity_per_unit,
    'unit', i.unit
  )) AS recipe
FROM products p
LEFT JOIN recipe_items ri ON ri.product_id = p.id
LEFT JOIN ingredients i ON ri.ingredient_id = i.id
GROUP BY p.id, p.name, p.price, p.category
ORDER BY p.name;
```

## Frontend Sayfası
```tsx
// pages/Products.tsx
// 1. Sol taraf: Ürün listesi (tablo)
// 2. Sağ taraf veya modal: Seçili ürünün reçetesi

// Tablo kolonları:
// | Ürün Adı | Kategori | Fiyat | Malzeme Sayısı | İşlem |

// Reçete detayında:
// | Malzeme | Miktar | Birim | Birim Maliyet | Ürün Başı Maliyet |
// Ürün başı maliyet = quantity_per_unit × unit_cost
```

## Ürün Maliyeti Hesaplama
```typescript
// Bir ürünün toplam malzeme maliyeti
const productCost = recipe.reduce((sum, item) => {
  return sum + (item.quantity_per_unit * item.unit_cost);
}, 0);

// Kâr marjı
const profitMargin = ((product.price - productCost) / product.price) * 100;
```

## UI Notu
- Her ürünün yanında kâr marjı göster (badge)
- Kâr marjı < %30 ise sarı uyarı
- Kâr marjı < %15 ise kırmızı uyarı
- Reçetesi olmayan ürünleri "⚠️ Reçete tanımla" butonu ile göster
