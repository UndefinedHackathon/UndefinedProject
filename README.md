<p align="center">
  <img src="https://img.shields.io/badge/StockPilot-AI-6366f1?style=for-the-badge&logo=robot&logoColor=white" alt="StockPilot AI" />
  <img src="https://img.shields.io/badge/Hackathon-5.%20Sıra-f59e0b?style=for-the-badge&logo=trophy&logoColor=white" alt="5th Place" />
  <img src="https://img.shields.io/badge/SolveX%20AI-2026-10b981?style=for-the-badge&logo=sparkles&logoColor=white" alt="SolveX AI 2026" />
</p>

<h1 align="center">🤖 StockPilot AI</h1>

<p align="center">
  <strong>Kafe ve restoranlar için yapay zekâ destekli akıllı stok yönetim ve karar destek sistemi</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61dafb?style=flat-square&logo=react" />
  <img src="https://img.shields.io/badge/Vite-8-646cff?style=flat-square&logo=vite" />
  <img src="https://img.shields.io/badge/TypeScript-6-3178c6?style=flat-square&logo=typescript" />
  <img src="https://img.shields.io/badge/Express-5-000000?style=flat-square&logo=express" />
  <img src="https://img.shields.io/badge/PostgreSQL-16-4169e1?style=flat-square&logo=postgresql&logoColor=white" />
  <img src="https://img.shields.io/badge/Gemma%203-4B-4285f4?style=flat-square&logo=google&logoColor=white" />
  <img src="https://img.shields.io/badge/Firebase-Auth-ffca28?style=flat-square&logo=firebase" />
</p>

---

## 📌 Proje Hakkında

**StockPilot AI**, kafe ve restoranların günlük satış, stok, reçete/gramaj ve fire verilerini analiz eden **AI destekli mini ERP/SaaS MVP**'sidir.

> 🏆 **SolveX AI Hackathon 2026** — T.C. Gençlik ve Spor Bakanlığı ÜNİDES projesi kapsamında, 40+ takım arasında **5.'lik** derecesi ile ödüllendirilmiştir.

### Ana Değer Önerisi

| Özellik | Açıklama |
|---------|----------|
| 📊 **Teorik Tüketim Hesabı** | Satış × reçete formülüyle her malzemenin günlük tüketimini hesaplar |
| 🚦 **Kritik Stok Tespiti** | Kırmızı / Sarı trafik ışığı sistemiyle riskli malzemeleri işaretler |
| 🛒 **Satın Alma Önerisi** | Güvenlik payı dahil otomatik sipariş miktarı önerir |
| 💸 **Kâr Kaçağı Analizi** | Teorik vs fiziksel stok karşılaştırmasıyla fire ve kayıpları tespit eder |
| 🤖 **AI Copilot** | Operasyon verilerine dayalı Türkçe soru-cevap asistanı |
| 📨 **Tedarikçi Mesajı** | Otomatik sipariş talebi oluşturma + n8n webhook entegrasyonu |

### Kritik Mimari Karar

> ⚠️ **AI hesap yapmaz.** Tüm hesaplamalar ERP motorunda (`erpHesapMotoru.ts`) saf algoritmik olarak yapılır. Gemma 3 4B yalnızca hesaplanmış sonuçları Türkçe olarak açıklar (Copilot, yönetici özeti, tedarikçi mesajı).

---

## 🏗️ Mimari

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React + Vite)                   │
│  TypeScript │ Tailwind + shadcn/ui │ Zustand │ Recharts      │
│  Firebase Auth │ React Router DOM │ Axios                    │
├─────────────────────────────────────────────────────────────┤
│                     REST API (Express 5)                     │
├──────────────┬──────────────────────┬───────────────────────┤
│  CRUD Routes │   Analyze + Copilot  │   Database Service    │
│  (Malzeme,   │   (ERP Motoru +      │   (PostgreSQL →       │
│   Ürün,      │    Gemma AI)         │    ERP format)        │
│   Reçete,    │                      │                       │
│   Satış)     │                      │                       │
├──────────────┴──────────────────────┴───────────────────────┤
│              ERP Hesap Motoru (Saf TypeScript)               │
│          Algoritmik — DB bağlantısı yok — Testlenebilir      │
├─────────────────────────────────────────────────────────────┤
│     PostgreSQL (Veri Katmanı)  │  Gemma 3 4B / Ollama (AI)  │
└─────────────────────────────────────────────────────────────┘
```

### Veri Akışı

```
PostgreSQL → databaseService → ERP Motoru → analyze.route
    → analysis_results (DB) → React Dashboard → Copilot (AI)
```

---

## 🛠️ Tech Stack

| Katman | Teknoloji | Versiyon |
|--------|-----------|----------|
| Frontend | React + Vite + TypeScript | React 19, Vite 8 |
| UI/CSS | Tailwind CSS + shadcn/ui | Tailwind 4 |
| State Management | Zustand | 5.x |
| Grafikler | Recharts | 3.x |
| Backend | Node.js + Express + TypeScript | Express 5 |
| Veritabanı | PostgreSQL + pg | PG 8.x |
| Kimlik Doğrulama | Firebase Authentication | 12.x |
| AI (Local LLM) | Gemma 3 4B via Ollama | gemma3:4b |
| Validation | Zod | 4.x |
| Otomasyon | n8n Webhook (Opsiyonel) | — |

---

## 📁 Proje Yapısı

```
UndefinedProject/
├── frontend/                      # React + Vite uygulaması
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/            # Sidebar, Topbar, AppLayout
│   │   │   ├── dashboard/         # StatCards, CriticalStockCards, Charts
│   │   │   ├── copilot/           # CopilotPanel, ChatMessage, QuickQuestions
│   │   │   ├── materials/         # Malzeme CRUD bileşenleri
│   │   │   ├── products/          # Ürün CRUD bileşenleri
│   │   │   ├── recipes/           # Reçete CRUD bileşenleri
│   │   │   ├── sales/             # Satış CRUD bileşenleri
│   │   │   └── ui/                # shadcn/ui bileşenleri
│   │   ├── pages/                 # Login, Register, Dashboard, CRUD sayfaları
│   │   ├── lib/                   # firebase.ts, api.ts (Axios), utils
│   │   ├── store/                 # Zustand store (stockPilotStore.ts)
│   │   ├── types/                 # TypeScript tip tanımları
│   │   └── data/                  # Mock/demo verileri
│   └── package.json
│
├── backend/                       # Node.js + Express API
│   ├── src/
│   │   ├── db/
│   │   │   ├── pool.ts            # PostgreSQL bağlantı havuzu
│   │   │   ├── schema.sql         # Veritabanı şeması (6 tablo)
│   │   │   ├── seed.sql           # Demo verisi (kafe senaryosu)
│   │   │   └── seed.ts            # Seed runner
│   │   ├── routes/
│   │   │   ├── materials.route.ts # GET, POST, PUT /api/materials
│   │   │   ├── products.route.ts  # GET, POST, PUT, DELETE /api/products
│   │   │   ├── recipes.route.ts   # GET, POST, DELETE /api/recipes
│   │   │   ├── sales.route.ts     # GET, POST /api/sales
│   │   │   ├── analyze.route.ts   # POST /api/analyze — ERP analiz
│   │   │   ├── copilot.route.ts   # POST /api/copilot — AI asistan
│   │   │   └── n8n.route.ts       # POST /api/n8n — Webhook
│   │   ├── services/
│   │   │   ├── erpHesapMotoru.ts   # 🧠 Algoritmik ERP motoru
│   │   │   ├── databaseService.ts  # DB → ERP format dönüştürücü
│   │   │   ├── gemmaService.ts     # Ollama/Gemma API istemcisi
│   │   │   ├── copilotService.ts   # AI Copilot iş mantığı
│   │   │   └── n8nService.ts       # n8n webhook servisi
│   │   ├── schemas/               # Zod validation şemaları
│   │   ├── middleware/            # Firebase Auth middleware
│   │   ├── types/                 # Ortak TypeScript tipleri
│   │   └── index.ts               # Express sunucu giriş noktası
│   └── package.json
│
├── docs/                          # Proje dokümantasyonu
├── .env                           # Ortam değişkenleri (örnek)
└── ROADMAP.md                     # Geliştirme yol haritası
```

---

## ⚡ Hızlı Başlangıç

### Ön Gereksinimler

| Araç | Versiyon | Açıklama |
|------|----------|----------|
| **Node.js** | ≥ 18 | Backend ve Frontend çalıştırmak için |
| **npm** | ≥ 9 | Paket yöneticisi |
| **PostgreSQL** | ≥ 14 | Veritabanı (Docker ile de kurulabilir) |
| **Ollama** | ≥ 0.3 | Local LLM çalıştırmak için (opsiyonel) |

### 1. Repoyu Klonla

```bash
git clone https://github.com/UndefinedHackathon/UndefinedProject.git
cd UndefinedProject
```

### 2. Ortam Değişkenlerini Ayarla

Proje kök dizininde `.env` dosyası zaten mevcuttur. İhtiyaca göre düzenleyin:

```env
# ── Backend ──
PORT=3001
NODE_ENV=development
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/stockpilot
DB_HOST=127.0.0.1
DB_PORT=5432
DB_NAME=stockpilot
DB_USER=postgres
DB_PASSWORD=postgres

# ── Gemma / Ollama (opsiyonel) ──
GEMMA_BASE_URL=http://localhost:11434
GEMMA_MODEL=gemma3:4b
GEMMA_TIMEOUT=15000

# ── Demo Mode ──
DEMO_MODE=true

# ── Frontend ──
VITE_API_URL=http://localhost:3001/api
```

> 💡 `DEMO_MODE=true` ayarı ile Firebase Authentication olmadan da sisteme giriş yapabilirsiniz.

### 3. PostgreSQL Veritabanını Kur

#### Seçenek A — Docker ile (Önerilen)

```bash
docker run --name stockpilot-db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=stockpilot \
  -p 5432:5432 \
  -d postgres:16-alpine
```

#### Seçenek B — Yerel PostgreSQL

```sql
CREATE DATABASE stockpilot;
```

#### Şemayı ve Demo Verisini Yükle

```bash
# Şemayı oluştur
psql -U postgres -d stockpilot -f backend/src/db/schema.sql

# Demo verisini yükle (6 ürün, 10 malzeme, tam kafe senaryosu)
psql -U postgres -d stockpilot -f backend/src/db/seed.sql
```

Veya TypeScript seed runner ile:

```bash
cd backend
npm run seed
```

### 4. Backend'i Kur ve Çalıştır

```bash
cd backend
npm install
npm run dev
```

Başarılıysa şu çıktıyı görmelisiniz:

```
╔══════════════════════════════════════════╗
║   🚀 StockPilot AI Backend Çalışıyor    ║
║   📡 Port: 3001                         ║
║   🗄️  DB: PostgreSQL                    ║
║   🔧 Mod: DEMO                          ║
╚══════════════════════════════════════════╝
```

### 5. Frontend'i Kur ve Çalıştır

Yeni bir terminal penceresi açın:

```bash
cd frontend
npm install
npm run dev
```

Uygulama varsayılan olarak **http://localhost:5173** adresinde açılacaktır.

### 6. Ollama / Gemma Kurulumu (Opsiyonel)

AI Copilot ve yönetici özeti özellikleri için:

```bash
# Ollama'yı kur (https://ollama.ai)
# Gemma 3 4B modelini indir
ollama pull gemma3:4b

# Çalıştığını doğrula
ollama list
```

> ⚠️ Gemma kurulmamışsa sistem **fallback modda** çalışır — şablon cevaplar üretir, uygulama yine de sorunsuz kullanılabilir.

---

## 🚀 Kullanım

### Demo Akışı

1. **Giriş** → `http://localhost:5173/login` → "Demo Admin olarak devam et" butonuna tıklayın
2. **Malzemeler** → `/materials` — Ham maddeleri görüntüleyin veya yeni ekleyin
3. **Ürünler** → `/products` — Menü ürünlerini yönetin
4. **Reçeteler** → `/recipes` — Ürün-malzeme ilişkilerini tanımlayın
5. **Satışlar** → `/sales` — Günlük satış verilerini girin
6. **Dashboard** → `/` → **"Analizi Başlat"** butonuna tıklayın
   - 📊 İstatistik kartları
   - 📈 Satış trend grafikleri
   - 🚦 Kritik stok uyarıları (Kırmızı/Sarı)
   - 💸 Kâr kaçağı analizi
   - 🛒 Satın alma önerileri
   - 🤖 AI Yönetici Özeti
7. **Copilot** → `/copilot` — AI asistana sorular sorun

---

## 🔌 API Endpoints

Tüm endpoint'ler `/api` prefix'i altındadır. Response formatı:

```json
// Başarılı
{ "success": true, "data": { ... } }

// Hatalı
{ "success": false, "error": "Hata mesajı" }
```

| Method | Endpoint | Açıklama |
|--------|----------|----------|
| `GET` | `/api/health` | Sunucu + DB sağlık kontrolü |
| `GET` | `/api/materials` | Tüm malzemeleri listele |
| `POST` | `/api/materials` | Yeni malzeme ekle |
| `PUT` | `/api/materials/:id` | Malzeme güncelle |
| `GET` | `/api/products` | Tüm ürünleri listele |
| `POST` | `/api/products` | Yeni ürün ekle |
| `PUT` | `/api/products/:id` | Ürün güncelle |
| `DELETE` | `/api/products/:id` | Ürün sil |
| `GET` | `/api/recipes` | Tüm reçeteleri listele |
| `POST` | `/api/recipes` | Yeni reçete oluştur |
| `DELETE` | `/api/recipes/:id` | Reçete sil |
| `GET` | `/api/sales/today` | Bugünkü satışları getir |
| `POST` | `/api/sales` | Satış kaydet |
| `POST` | `/api/analyze` | ERP analizi çalıştır |
| `GET` | `/api/analyze/latest` | Son analiz sonucunu getir |
| `POST` | `/api/copilot` | AI Copilot'a soru sor |
| `POST` | `/api/n8n/supplier-message` | n8n webhook tetikle |

---

## 🗄️ Veritabanı Şeması

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   products   │────▶│ recipe_items │◀────│ ingredients  │
│──────────────│     │──────────────│     │──────────────│
│ id           │     │ product_id   │     │ id           │
│ name         │     │ ingredient_id│     │ name         │
│ price        │     │ quantity_per │     │ unit         │
│ category     │     │ _unit        │     │ unit_cost    │
└──────┬───────┘     └──────────────┘     │ min_stock    │
       │                                   └──────┬───────┘
       ▼                                          ▼
┌──────────────┐                          ┌──────────────┐
│ daily_sales  │                          │  inventory   │
│──────────────│                          │──────────────│
│ product_id   │                          │ ingredient_id│
│ quantity     │                          │ current_stock│
│ sale_date    │                          │ physical_stck│
└──────────────┘                          └──────────────┘

┌───────────────────┐
│ analysis_results  │
│───────────────────│
│ date              │
│ result_data (JSON)│
│ ai_summary        │
└───────────────────┘
```

---

## 🧠 ERP Hesap Motoru

ERP motoru (`erpHesapMotoru.ts`) saf TypeScript fonksiyonlardan oluşur ve hiçbir dış servise bağlı değildir:

```
hesaplaGunlukAnaliz()
├── hesaplaUrunSatisOzeti()      → Ürün bazlı satış, ciro ve kâr
├── hesaplaTeorikTuketim()       → Reçetelere göre malzeme tüketimi
├── tespiKritikStoklar()         → Kırmızı/Sarı stok uyarıları
├── hesaplaSatinAlmaOnerisi()    → Güvenlik payılı sipariş miktarı
├── hesaplaReceteSapmasi()       → Teorik vs fiziksel fark (fire tespiti)
└── olusturTedarikciMesaji()     → WhatsApp formatında sipariş mesajı
```

### Demo Senaryo Sonuçları

Seed verisindeki kafe senaryosu (108 adet satış, 5.535₺ günlük ciro):

| Stok Durumu | Malzeme | Detay |
|-------------|---------|-------|
| 🔴 KRİTİK | Espresso Çekirdeği | 0.5 kg kaldı (min: 2.0 kg) |
| 🔴 KRİTİK | Krem Peynir | -0.16 kg (gün içinde tükendi!) |
| 🟡 DİKKAT | Süt | 2.25 lt kaldı (yarın risk) |
| 🟡 DİKKAT | Kakao Tozu | 0.28 kg kaldı |

**Tahmini günlük kâr kaçağı:** ~177₺ (fire + reçete sapması)

---

## 🤖 AI Copilot

Gemma 3 4B tabanlı sohbet asistanı — **yalnızca ERP verisinden** cevap verir:

| Hazır Soru | Açıklama |
|------------|----------|
| 💸 En büyük kâr kaybım nerede? | Reçete sapması analizi |
| 🔴 Hangi malzemeler kritik? | Trafik ışığı bazlı stok raporu |
| 📋 Yarın için ne hazırlamalıyım? | Satın alma önerisi özeti |
| 🏆 En çok satan ürünüm ne? | Satış sıralaması |
| 🛒 Bugün ne satın almalıyım? | Detaylı sipariş listesi |
| 🗑️ Fire maliyetim ne kadar? | Kayıp/fire maliyet raporu |

> Gemma çalışmazsa otomatik **fallback modu** devreye girer ve şablon cevaplar üretilir.

---

## 🔧 Geliştirme

### Scriptler

```bash
# Backend
cd backend
npm run dev        # Development sunucusu (hot-reload)
npm run build      # TypeScript derleme
npm run start      # Production sunucusu
npm run seed       # Demo verisini yükle

# Frontend
cd frontend
npm run dev        # Vite dev sunucusu (HMR)
npm run build      # Production build
npm run preview    # Production build önizleme
npm run lint       # ESLint kontrolü
```

### Branch Stratejisi

| Branch | Açıklama |
|--------|----------|
| `main` | Korumalı — sadece PR ile merge |
| `dev` | Geliştirme ana dalı |
| `feat/Taha` | Frontend, Auth, UI |
| `feature/SametWorkSpace` | ERP Motoru, AI, Copilot |
| `feature/EmreWorkSpace` | PostgreSQL, CRUD, Seed |

---

## 👥 Takım — Undefined

| Üye | Rol | Sorumluluklar |
|-----|------|---------------|
| **Samet Yalçın** | Backend & AI | ERP Hesap Motoru, Gemma/Ollama entegrasyonu, Copilot servisi, Analyze endpoint, Auth middleware |
| **Emre Ölmez** | Backend & Database | PostgreSQL şeması, seed data, databaseService, CRUD endpoint'leri, Zod validation |
| **M. Taha Cevher** | Frontend | React UI, Firebase Auth, Dashboard, Recharts grafikleri, Zustand store, n8n UI entegrasyonu |

---

## 🏆 Etkinlik

**SolveX AI Hackathon 2026**
- 🏛️ Organizatör: T.C. Gençlik ve Spor Bakanlığı — ÜNİDES Projesi
- 🎓 Ev sahibi: Isparta Uygulamalı Bilimler Üniversitesi
- 👥 Katılım: 40+ takım, farklı üniversitelerden
- 🏅 Derece: **5.'lik**

---

## 📄 Lisans

Bu proje eğitim ve hackathon amaçlı geliştirilmiştir.

---

<p align="center">
  <sub>Built with ❤️ by Team Undefined — SolveX AI Hackathon 2026</sub>
</p>