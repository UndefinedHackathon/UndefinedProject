---
name: stockpilot-ai-context
description: StockPilot AI projesinin genel bağlamı ve güncel proje yapısı. Bu projeye her kod yazacağında önce bunu oku.
---

# StockPilot AI — Proje Bağlamı

## Proje Nedir?
Kafe ve restoranların günlük stok, satış, reçete/gramaj ve fire verilerini analiz eden AI destekli mini ERP/SaaS MVP'si.
Ana değer önerisi: Satıştan stok tüketimini hesaplayan, kritik stokları bulan ve satın alma aksiyonu öneren AI destekli sistem.

## Temel Mimari Kural ⚠️
> **AI hesap yapmaz. Hesaplar ERP motorunda (`erpHesapMotoru.ts`) algoritmik olarak yapılır.**
> Gemma 3 4B sadece hesaplanmış sonuçları Türkçe açıklar (Copilot paneli ve tedarikçi mesajı üzerinden).

## Tech Stack
| Katman | Teknoloji | Görev |
|--------|-----------|-------|
| Frontend | React + Vite + TypeScript | Web arayüz, sayfalar, formlar, dashboard ve Copilot paneli |
| UI/CSS | Tailwind CSS + shadcn/ui | Modern arayüz |
| State | Zustand | Form ve analiz sonuçları yönetimi |
| Grafik | Recharts | Satış, stok riski grafikleri |
| Backend | Node.js + Express + TypeScript | REST API, ERP motoru, DB servisleri |
| DB | PostgreSQL + pg | Ürünler, malzemeler, reçeteler, stoklar, satışlar |
| Auth | Firebase Authentication | Kayıt, giriş ve çıkış işlemleri |
| AI (Local) | Local Gemma 3 4B + Ollama API | Copilot, yönetici özeti ve tedarikçi mesajı |
| Validation | Zod | Backend request doğrulama |
| Otomasyon | n8n Webhook (Opsiyonel) | Tedarikçi mesajı workflow tetikleme |

## Dosya Yapısı (Ana Dizinler)
```text
undefined/
├── frontend/
│   ├── src/
│   │   ├── components/ (dashboard, materials, products, recipes, sales, copilot, ui)
│   │   ├── pages/
│   │   ├── lib/ (firebase.ts, api.ts)
│   │   ├── store/ (stockPilotStore.ts)
│   │   └── types/ (stockpilot.types.ts)
├── backend/
│   ├── src/
│   │   ├── db/ (pool.ts, schema.sql, seed.sql)
│   │   ├── routes/ (materials, products, recipes, sales, analyze, copilot, n8n)
│   │   ├── services/ (databaseService.ts, erpHesapMotoru.ts, gemmaService.ts, copilotService.ts, n8nService.ts)
│   │   ├── schemas/ (zod validation)
│   │   ├── types/ (stockpilot.types.ts)
│   │   └── index.ts
└── docs/
```

## Görev Dağılımı ve Roller
1. **Taha (Frontend):** React + Vite kurulumu, Firebase Auth, UI akışları, dashboard veri gösterimi, n8n webhook entegrasyonu, formlardan backend'e istek atılması.
2. **Samet (Backend ERP/AI):** `erpHesapMotoru.ts`, `analyze.route.ts`, local Gemma / Ollama bağlantısı, Copilot uç noktası ve AI promptları. ERP sonucunu analysis_results tablosuna kaydetmek.
3. **Emre (Backend DB):** PostgreSQL DB şeması, SQL seed datası, `databaseService.ts` (ERP motoruna veri sağlama), CRUD (Malzeme, ürün, reçete, satış) endpointleri ve Zod validasyonu.

## 6 Saatlik MVP Kapsamı
✅ Firebase Auth
✅ Malzeme, Ürün, Reçete ve Günlük Satış CRUD Formları
✅ ERP Hesap Motoru (Teorik tüketim, kritik stok, reçete sapması, satın alma önerisi)
✅ Dashboard ve Analiz Sonuç Ekranı
✅ Copilot Soru-Cevap (Hesaplanmış veri bazlı)
✅ Opsiyonel n8n Webhook ile tedarikçi mesajı tetikleme

❌ Gerçek POS entegrasyonu
❌ WhatsApp/e-posta gönderimi (backend üzerinde, sadece webhook var)
❌ Çok şubeli yapı
❌ Production deploy
❌ Role-based authorization

## Ortak Tip Sözleşmesi Uyarısı
Emre'nin `databaseService.ts` çıktısı ile Samet'in `erpHesapMotoru.ts` girdi formatı BİREBİR aynı olmalıdır. `stockpilot.types.ts` dosyasında `Urun`, `Malzeme`, `ReceteKalemi`, `StokKalemi`, `GunlukSatis`, `AnalizSonucu` arayüzleri frontend ve backend'de senkronize edilmelidir.
