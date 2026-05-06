---
name: stockpilot-copilot
description: StockPilot AI Copilot — kullanıcının operasyon sorularını son analiz verisiyle birlikte cevaplar. Hazır soru butonları ve sınırlı serbest soru desteği. Sadece verilen datadan cevap verir.
---

# StockPilot Copilot

## Ne Zaman Kullan
- Kullanıcı Copilot panelinden soru sorduğunda
- Hazır soru butonlarından biri tıklandığında
- POST /api/copilot endpoint'i çağrıldığında

## System Prompt (Her Zaman Ekle)
```
Sen StockPilot AI'ın Copilot'usun.
Kafe ve restoran operasyon verilerini analiz eden bir sistemin parçasısın.

Kurallar:
1. SADECE aşağıda sana verilen hesaplanmış operasyon verisini kullan.
2. Yeni sayı, tahmin veya hesap uydurma.
3. Cevaplar kısa, net ve Türkçe olsun.
4. Bullet point kullan.
5. Verilen datada olmayan bir şey sorulursa: "Bu bilgi mevcut analizde yok." de.
6. Maksimum 150 kelime ile cevap ver.

Bugünün operasyon verisi:
{analysis_context_json}
```

## Hazır Soru Butonları

```typescript
const QUICK_QUESTIONS = [
  { id: 'biggest_loss',      label: '💸 En büyük kâr kaybım nerede?' },
  { id: 'critical_items',    label: '🔴 Hangi malzemeler kritik?' },
  { id: 'tomorrows_prep',    label: '📋 Yarın için ne hazırlamalıyım?' },
  { id: 'top_seller',        label: '🏆 En çok satan ürünüm ne?' },
  { id: 'purchase_summary',  label: '🛒 Bugün ne satın almalıyım?' },
  { id: 'waste_summary',     label: '🗑️ Fire maliyetim ne kadar?' },
];
```

## Context Hazırlama
Her soru için `analysis_results` tablosundaki en son analizi çekip direkt string olarak ver:
```typescript
const lastAnalysis = await db.query('SELECT result_data FROM analysis_results ORDER BY date DESC LIMIT 1');
const context = lastAnalysis.rows[0].result_data;
```

## Parametreler (POST /api/copilot)
```json
{
  "question": "En büyük kâr kaybım nerede?",
  "context_date": "2024-01-15",
  "chat_history": []
}
```

## Hız Optimizasyonu
- Context JSON'u minimize et (sadece ilk 3-5 item)
- Gemma'ya gönderilecek toplam token < 800 tut
- Serbest sorularda kullanıcıya "Sadece bugünün verisi hakkında soru sorabilirsiniz" uyarısı göster
