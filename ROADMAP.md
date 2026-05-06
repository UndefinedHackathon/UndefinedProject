# StockPilot AI — ROADMAP.md

> **[AI-Agent: Plan]** Bu dosya Plan Agent tarafından oluşturulmuştur. Proje mimarisi, görev dağılımı ve geliştirme aşamaları hackathon şartnamesine uygun şekilde planlanmıştır.

---

## 📌 Proje Özeti

**StockPilot AI**, kafe ve restoranların günlük stok, satış, reçete ve fire verilerini analiz eden AI destekli mini ERP/SaaS MVP'sidir. Satıştan stok tüketimini hesaplayan, kritik stokları bulan ve satın alma aksiyonu öneren bir karar destek sistemidir.

**Kritik Mimari Karar:** AI hesap yapmaz. Hesaplar ERP motorunda (`erpHesapMotoru.ts`) algoritmik olarak yapılır. Gemma 3 4B sadece hesaplanmış sonuçları Türkçe açıklar.

---

## 🏗️ Mimari ve Teknoloji Yapısı

```
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND (Taha)                        │
│  React 18 + Vite + TypeScript + Tailwind + shadcn/ui        │
│  Zustand (State) | Recharts (Grafik) | Axios (HTTP)         │
│  Firebase Auth | React Router DOM                           │
├─────────────────────────────────────────────────────────────┤
│                     REST API (Express)                      │
├──────────────┬──────────────────────┬───────────────────────┤
│  CRUD Routes │   Analyze + Copilot  │   Database Service    │
│   (Emre)     │      (Samet)         │      (Emre)           │
├──────────────┴──────────────────────┴───────────────────────┤
│              ERP Hesap Motoru (Samet)                        │
│          Saf TypeScript — DB bağlantısı yok                 │
├─────────────────────────────────────────────────────────────┤
│          PostgreSQL (Emre) │ Gemma 3 4B / Ollama (Samet)    │
└─────────────────────────────────────────────────────────────┘
```

### Ana Veri Akışı
```
PostgreSQL → databaseService (Emre) → ERP Motoru (Samet) → analyze.route
    → analysis_results (DB) → React Dashboard (Taha) → Copilot (Samet+Taha)
```

---

## 📁 Dosya Yapısı

```
UndefinedProject/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/        (Sidebar, Topbar, AppLayout)
│   │   │   ├── dashboard/     (StatCards, CriticalStockCards, ProfitLeakCards, PurchaseRecommendations)
│   │   │   ├── materials/     (MaterialForm, MaterialTable)
│   │   │   ├── products/      (ProductForm, ProductTable)
│   │   │   ├── recipes/       (RecipeForm, RecipeTable)
│   │   │   ├── sales/         (SalesForm, SalesTable)
│   │   │   ├── copilot/       (CopilotPanel, QuickQuestionButtons, ChatMessage)
│   │   │   └── ui/            (shadcn/ui bileşenleri)
│   │   ├── pages/             (Login, Register, Dashboard, Materials, Products, Recipes, Sales, Copilot)
│   │   ├── lib/               (firebase.ts, api.ts, utils.ts)
│   │   ├── store/             (stockPilotStore.ts)
│   │   ├── types/             (stockpilot.types.ts)
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── .env
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── db/                (pool.ts, schema.sql, seed.sql)
│   │   ├── routes/            (materials, products, recipes, sales, analyze, copilot, n8n)
│   │   ├── services/          (databaseService, erpHesapMotoru, gemmaService, copilotService, n8nService)
│   │   ├── schemas/           (Zod validation dosyaları)
│   │   ├── middleware/        (auth.ts)
│   │   ├── types/             (stockpilot.types.ts)
│   │   └── index.ts
│   ├── .env
│   └── package.json
│
├── docs/
├── .agent/skills/
├── .clauderules
└── ROADMAP.md                 ← Bu dosya
```

---

## 🔀 Git Branch Stratejisi

| Branch | Sorumlu | Açıklama 
|--------|---------|----------|
| `main` | Korumalı | Doğrudan push yasak. Sadece PR ile merge. |
| `dev` | Ortak | Geliştirme ana dalı |
| `feat/Taha` | Taha | Frontend, Auth, n8n UI |
| `feat/Samet` | Samet | ERP motoru, Analyze, Gemma, Copilot |
| `feat/Emre` | Emre | PostgreSQL, CRUD, Seed, databaseService |

---

## ⏱️ Geliştirme Aşamaları (5 Saat)

## AŞAMA 1 — Temel Kurulum (0:00–0:45)

#### 🟢 Emre — PostgreSQL & Backend Kurulumu
- [ ] Express + TypeScript projesi oluştur (`backend/`)
- [ ] `pool.ts` ile PostgreSQL bağlantısını kur
- [ ] `schema.sql` dosyasını hazırla (products, ingredients, recipe_items, inventory, daily_sales, analysis_results)
- [ ] `seed.sql` ile güçlü demo verisi oluştur (min. 2 ürün, 4 malzeme, kritik stok + reçete sapması senaryosu)
- [ ] `backend/src/types/stockpilot.types.ts` — ortak tip tanımları (Urun, Malzeme, ReceteKalemi, StokKalemi, GunlukSatis, AnalizSonucu)
- [ ] `backend/src/index.ts` — Express sunucu, CORS, middleware

#### 🔵 Taha — Frontend Kurulumu
- [ ] React + Vite + TypeScript projesi oluştur (`frontend/`)
- [ ] Tailwind CSS + shadcn/ui kurulumu
- [ ] React Router DOM ile sayfa routing yapısı
- [ ] `frontend/src/types/stockpilot.types.ts` — backend ile senkronize tipler
- [ ] `frontend/src/lib/api.ts` — Axios instance + interceptor'lar
- [ ] `frontend/src/lib/firebase.ts` — Firebase config
- [ ] `frontend/src/store/stockPilotStore.ts` — Zustand store taslağı
- [ ] AppLayout (Sidebar + Topbar) iskelet

#### 🟠 Samet — ERP Motoru Taslağı
- [ ] `erpHesapMotoru.ts` fonksiyon iskeleti ve tip tanımları
- [ ] Gemma/Ollama bağlantı testi (`ollama run gemma3:4b`)
- [ ] `gemmaService.ts` taslağı (callGemma + fallback)

---

### AŞAMA 2 — CRUD & Formlar (0:45–1:45)

#### 🟢 Emre — CRUD Route'ları & Database Service
- [ ] `materials.route.ts` — GET /api/materials, POST /api/materials, PUT /api/materials/:id
- [ ] `products.route.ts` — GET /api/products, POST /api/products, PUT /api/products/:id, DELETE /api/products/:id
- [ ] `recipes.route.ts` — GET /api/recipes, POST /api/recipes, DELETE /api/recipes/:id
- [ ] `sales.route.ts` — GET /api/sales/today, POST /api/sales
- [ ] Zod validation şemaları (material.schema.ts, product.schema.ts, recipe.schema.ts, sale.schema.ts)
- [ ] `databaseService.ts` — `getErpVerileri()` fonksiyonu (ERP motoruna uyumlu format)
- [ ] `databaseService.ts` — `kaydetAnalizSonucu()` fonksiyonu

#### 🔵 Taha — Form Sayfaları
- [ ] MaterialsPage — Malzeme ekleme formu + liste tablosu
- [ ] ProductsPage — Ürün ekleme formu + liste tablosu
- [ ] RecipesPage — Reçete oluşturma formu + tablo
- [ ] SalesPage — Günlük satış giriş formu + bugünkü satışlar tablosu
- [ ] Tüm formları Zustand store üzerinden backend API'ye bağla

#### 🟠 Samet — ERP Motoru Geliştirme
- [x] `hesaplaGunlukAnaliz()` fonksiyonunu tamamla:
  - [x] Toplam satış adedi ve gelir hesaplama
  - [x] Ürün satış özeti
  - [x] Teorik malzeme tüketimi (reçetelere göre)
  - [x] Kritik stok tespiti (Kırmızı/Sarı trafik ışığı)
  - [x] Satın alma önerisi
  - [x] Reçete sapması (opsiyonel fiziksel stok)
  - [x] Tedarikçi mesaj taslağı

---

### AŞAMA 3 — Analyze Akışı & Dashboard (1:45–2:45)

#### 🟢 Emre — Database Service Stabilizasyonu
- [ ] `databaseService.ts` çıktısını ERP motoru input formatıyla birebir doğrula
- [ ] snake_case → camelCase dönüşüm fonksiyonlarını (mapProducts, mapIngredients vb.) tamamla
- [ ] Seed data ile uçtan uca test

#### 🔵 Taha — Dashboard Sayfası
- [ ] DashboardPage ana yapısı (grid layout)
- [ ] StatCards — toplam satış, toplam gelir, ürün sayısı
- [ ] CriticalStockCards — kırmızı/sarı trafik ışıklı stok kartları
- [ ] ProfitLeakCards — reçete sapması / gizli kayıp kartları
- [ ] PurchaseRecommendations — satın alma önerisi tablosu
- [ ] Recharts grafikleri (SalesTrendChart, StockDistributionChart, ProfitLeakChart)
- [ ] "Analiz Et" butonu → POST /api/analyze → sonuçları göster
- [ ] Loading state ve hata gösterimi

#### 🟠 Samet — Analyze Route
- [x] `analyze.route.ts` — POST /api/analyze endpoint'i
  - [x] databaseService.getErpVerileri() çağır
  - [x] erpHesapMotoru.hesaplaGunlukAnaliz() çalıştır
  - [x] Sonucu analysis_results tablosuna kaydet
  - [x] Gemma ile yönetici özeti oluştur (fallback dahil)
  - [x] Response olarak AnalizSonucu döndür

---

### AŞAMA 4 — AI Copilot (2:45–3:30)

#### 🔵 Taha — Copilot UI
- [ ] CopilotPage / CopilotPanel komponenti
- [ ] QuickQuestionButtons (6 hazır soru butonu)
- [ ] ChatMessage komponenti (user/ai mesajları)
- [ ] Serbest soru input alanı
- [ ] Loading (thinking) state animasyonu
- [ ] Zustand store copilot slice'ı bağla

#### 🟠 Samet — Copilot Backend
- [ ] `copilotService.ts` — system prompt + context hazırlama
- [ ] `copilot.route.ts` — POST /api/copilot endpoint'i
  - [ ] Son analysis_results'u context olarak al
  - [ ] Gemma'ya gönder, cevap al
  - [ ] Fallback cevap mekanizması
- [ ] copilot.schema.ts — Zod validation

#### 🟢 Emre — Destek
- [ ] analysis_results için helper query (son analiz çekme)

---

### AŞAMA 5 — Auth & n8n Bonus & Polish (3:30–4:15)

#### 🔵 Taha — Firebase Auth & n8n UI
- [ ] LoginPage — email/password giriş formu
- [ ] RegisterPage — kayıt formu
- [ ] "Demo Admin olarak devam et" bypass butonu
- [ ] AuthGuard komponenti
- [ ] Axios interceptor'a token ekleme
- [ ] n8n "Tedarikçiye Gönder" butonu (Dashboard'da)
- [ ] Toast notification sistemi

#### 🟠 Samet — Auth Middleware & n8n Backend
- [ ] `middleware/auth.ts` — Firebase token doğrulama + DEMO_MODE bypass
- [ ] `n8n.route.ts` — POST /api/n8n/supplier-message (opsiyonel)
- [ ] Gemma fallback cevaplarını son kez kontrol et

#### 🟢 Emre — Son Kontroller
- [ ] Seed data ile tam senaryo testi
- [ ] Tüm CRUD endpoint'lerinin çalıştığını doğrula
- [ ] Environment değişkenlerini kontrol et

---

### AŞAMA 6 — Test & Demo Hazırlığı (4:15–5:00)

#### 🔵 Taha
- [ ] UI polish — responsive kontrol, hover efektleri, animasyonlar
- [ ] Demo akışını baştan sona test et (Login → Veri Giriş → Analiz → Dashboard → Copilot)
- [ ] Grafik animasyonları aktif mi kontrol et

#### 🟠 Samet
- [ ] ERP motoru doğru hesap yapıyor mu son test
- [ ] Copilot hallucination kontrolü — sadece ERP verisinden mi cevap veriyor?
- [ ] AI fallback testleri (Gemma kapalıyken)

#### 🟢 Emre
- [ ] DB'de seed verisi hazır mı?
- [ ] Kırmızı stok, sarı stok, reçete sapması senaryoları mevcut mu?

#### 🔴 HERKES — Final Review Agent
- [ ] Tüm kod tabanında `// [AI-Agent: ...]` traceability yorumları var mı?
- [ ] Kullanılmayan değişkenler / console.log temizliği
- [ ] SQL injection koruması (parameterized queries)
- [ ] `docs/review_summary.md` raporu oluştur

---

## ⚠️ Kritik Uyum Noktaları

### 1. Ortak Tip Sözleşmesi
`stockpilot.types.ts` dosyası frontend ve backend'de **birebir aynı** olmalı:
```typescript
interface Urun { id: number; name: string; price: number; category: string; }
interface Malzeme { id: number; name: string; unit: string; unitCost: number; minStockLevel: number; }
interface ReceteKalemi { id: number; productId: number; ingredientId: number; quantityPerUnit: number; }
interface StokKalemi { id: number; ingredientId: number; currentStock: number; }
interface GunlukSatis { id: number; productId: number; quantity: number; saleDate: string; }
interface AnalizSonucu { toplamSatisAdedi: number; toplamGelir: number; urunSatisOzeti: any[]; teorikTuketim: any[]; kritikStoklar: any[]; satinAlmaOnerisi: any[]; receteSapmasi?: any[]; tedarikciMesajTaslagi: string; }
```

### 2. API Response Formatı
Tüm endpoint'ler aynı format döner:
```json
{ "success": true, "data": { ... } }
{ "success": false, "error": "Hata mesajı" }
```

### 3. databaseService ↔ ERP Motoru Uyumu
Emre'nin `getErpVerileri()` çıktısı, Samet'in `hesaplaGunlukAnaliz()` parametreleriyle **birebir** eşleşmeli.

---

## 🚫 Yapılmaması Gerekenler
- ❌ Gerçek POS entegrasyonu
- ❌ Gerçek WhatsApp/e-posta gönderimi
- ❌ Çok şubeli yapı
- ❌ Role-based authorization
- ❌ AI'a sayısal hesap yaptırmak
- ❌ n8n'i ana sistem bitmeden başlatmak

---

## 🎯 Demo Akışı (Sunum Sırası)
1. **Problem tanıtımı** (30 sn) — "Kafe yönetimi zorluğu"
2. **Kayıt/Giriş** — Firebase Auth veya Demo Admin
3. **Veri Girişi** — Malzeme, ürün, reçete, satış
4. **Analiz Et** — ERP motoru çalışır, dashboard dolar
5. **Kritik Stoklar** — Kırmızı/sarı trafik ışıkları
6. **Reçete Sapması** — Gizli kayıp tespiti
7. **Copilot** — AI ile soru-cevap
8. **Tedarikçi Mesajı** — n8n webhook (bonus)
9. **Kapanış** — "Veriyi aksiyona dönüştürür"

---

## 📊 Değerlendirme Puan Hedefleri

| Kriter | Puan | Strateji |
|--------|------|----------|
| Plan Agent Kullanımı | /15 | ✅ Bu ROADMAP.md dosyası |
| Skills Agent Entegrasyonu | /15 | Kod içi `[AI-Agent: Skills]` yorumları |
| Araç Yetkinliği | /15 | Antigravity ile hızlı geliştirme |
| Düzenli Çalışma | /10 | Branch stratejisi + PR'lar |
| Hata Denetimi | /10 | Code Review + Final Review Agent |
| Takip Edilebilirlik | /10 | AI traceability yorumları |
| Son Kontrol | /10 | Final Review Agent taraması |
| Çalışır MVP | /15 | Uçtan uca demo akışı |

---

*Bu plan, SolveX AI Hackathon 2026 şartnamesine ve StockPilot AI proje dokümanlarına uygun olarak Plan Agent tarafından oluşturulmuştur.*
