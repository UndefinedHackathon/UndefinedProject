---
name: erp-engine-core
description: Samet'in ana sorumluluğundaki ERP Hesap Motoru. Günlük satış, reçete, ham madde ve stok verilerini alarak teorik tüketim, kritik stok ve satın alma önerilerini hesaplar.
---

# ERP Engine Core (erpHesapMotoru.ts)

## Sorumlu: Samet

## Görevi
Bu modül uygulamanın beynidir. Hiçbir dış servise veya veritabanına doğrudan bağlanmaz. Saf bir TypeScript fonksiyonu olarak `databaseService` üzerinden gelen formatlı veriyi alır, hesaplar ve `AnalizSonucu` nesnesini döndürür. AI (Gemma) kesinlikle hesap yapmamalı, sadece bu modülün sonucunu yorumlamalıdır.

## Girdi ve Çıktı Formatı
- **Input:** Tüm ürünler, aktif reçeteler, mevcut malzeme ve stok bilgileri, o günün satışları.
- **Output:**
  - `toplamSatisAdedi`: Günün toplam satılan ürün sayısı.
  - `toplamGelir`: Toplam elde edilen ciro.
  - `urunSatisOzeti`: Hangi üründen kaç adet satıldığı.
  - `teorikTuketim`: Reçetelere göre o gün harcanması gereken malzeme miktarları.
  - `kritikStoklar`: Mevcut stok - teorik tüketim = kalan stok < kritik eşik ise listeye eklenir. Renk kodları: `Kırmızı` (bitmiş/acil), `Sarı` (azalıyor).
  - `satinAlmaOnerisi`: Kırmızı ve sarı stoklar için tedarik edilmesi gereken miktarlar.
  - `receteSapmasi` (Opsiyonel): Eğer fiziksel stok sayımı girilmişse, teorik stok ile fiziksel stok arasındaki fark (tahmini gizli kayıp/fire).
  - `tedarikciMesajTaslagi`: Satın alınacak ürünlerin otomatik WhatsApp formatında metni.

## Örnek Fonksiyon İmzası
```typescript
export function hesaplaGunlukAnaliz(
  urunler: Urun[],
  malzemeler: Malzeme[],
  receteler: ReceteKalemi[],
  stoklar: StokKalemi[],
  gunlukSatislar: GunlukSatis[]
): AnalizSonucu {
  // 1. Toplam ciro ve ürün satış adetlerini hesapla
  // 2. Satılan ürünlerin reçetelerine göre teorik malzeme tüketimini bul
  // 3. Mevcut stoktan teorik tüketimi düşerek kalan stoku bul
  // 4. Kalan stokları, malzemenin kritik eşiğiyle karşılaştır (Kırmızı/Sarı)
  // 5. Kritik stoklar için sipariş miktarı öner
  // 6. Sonuçları AnalizSonucu tipinde döndür
}
```

## Kurallar
1. Sadece matematiksel hesaplar ve veri dönüşümleri yapılır.
2. Async operasyon (DB isteği) içermemelidir, tamamen senkron, test edilebilir olmalıdır.
3. Hata toleransı olmalıdır (Eksik reçeteli ürün satılmışsa hata fırlatmak yerine uyarı logu at ve devam et).
