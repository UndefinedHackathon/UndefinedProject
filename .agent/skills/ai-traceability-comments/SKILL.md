---
name: ai-traceability-comments
description: Şartnamedeki "Süreç Şeffaflığı" kriteri gereği AI'ın yazdığı veya optimize ettiği kod bloklarına eklenecek zorunlu yorum satırı kuralları.
---

# AI Traceability (İzlenebilirlik) Kuralları

## Hackathon Şartname Kuralları
Jüri değerlendirmesinde (Süreç Şeffaflığı - 10 Puan) "Hangi kısımların yapay zeka desteğiyle, hangi kısımların manuel yapıldığı net bir şekilde takip edilebiliyor mu?" sorusuna yanıt verebilmek için kod bloklarına AI imzasının bırakılması zorunludur.

## 1. Kod İçi Yorum Satırları
Karmaşık bir algoritma, güvenlik katmanı veya optimizasyon "Skills Agent" (AI) tarafından yapıldığında, ilgili fonksiyonun hemen üstüne şu formatta bir yorum eklenmelidir:

**TypeScript/JavaScript Örneği:**
```typescript
// [AI-Agent: Skills] ERP hesaplama motoru performans ve bellek kullanımı için optimize edildi.
// Manuel revizyon: Samet tarafından test edilip onaylandı.
export function hesaplaGunlukAnaliz(...) { ... }
```

**SQL Örneği:**
```sql
-- [AI-Agent: Plan] Bu şema yapısı Plan Agent tarafından normalize edilerek oluşturulmuştur.
CREATE TABLE products ( ... );
```

## 2. PR (Pull Request) Açıklamaları
Kod depoya atılırken açılan PR'da mutlaka bir "AI Contribution" bölümü olmalıdır:
```markdown
## AI Contribution
- **Plan Agent:** Görev alt başlıklara ayrıldı ve ROADMAP.md güncellendi.
- **Skills Agent:** Veritabanı bağlantı optimizasyonları ve Zod validasyon kuralları eklendi.
```

Bu kural, jürinin şeffaflık ve kalite değerlendirmesinde tam puan vermesini sağlayacaktır.
