---
name: n8n-webhook-integration
description: Tedarikçi mesajının Opsiyonel olarak n8n webhook'una gönderilmesi için frontend veya backend entegrasyonu.
---

# n8n Webhook Integration

## Sorumlu: Taha (Frontend UI), Samet (Backend Route - Opsiyonel)

## Görevi
ERP motorunun ürettiği tedarikçi sipariş listesi (veya tedarikçi mesaj metni) kullanıcı onayından sonra bir `POST` isteği ile n8n Webhook uç noktasına gönderilir. N8n üzerinden WhatsApp, E-Posta veya Telegram bildirimi yapılabilir.

Bu özellik **opsiyoneldir** ve MVP'nin ana işlevleri (Dashboard, ERP, Copilot) tam olarak çalışana kadar başlanmamalıdır.

## Veri Formatı
```json
{
  "businessName": "StockPilot Cafe",
  "date": "2026-05-05",
  "supplierMessage": "Merhaba, bugünkü sipariş listemiz: 5 Paket Kaşar, 2 Kutu Tost Ekmeği.",
  "items": [
    { "name": "Kaşar", "amount": 5, "unit": "Paket" },
    { "name": "Tost Ekmeği", "amount": 2, "unit": "Kutu" }
  ]
}
```

## Uygulama Adımları
1. Frontend'de Dashboard üzerinde "Tedarikçiye Gönder" butonu oluştur.
2. Butona basılınca n8n Webhook URL'sine bir POST isteği at.
3. Başarılı dönerse toast ile "Sipariş listesi otomasyona gönderildi" mesajı göster.
4. (Alternatif) Frontend sadece backend `POST /api/n8n/supplier-message` endpointine istek atar, backend n8n'e iletir. İki yöntem de geçerlidir, basit olan tercih edilir.
