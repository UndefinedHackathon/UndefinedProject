Undefined
Proje Yapısı, Görev Dağılımı ve Geliştirme Planı
StockPilot AI fikrinin güncel teknik kararlarına göre hazırlanmıştır.
Ekip içi paylaşım raporu


Başlık	Karar
Uygulama Adı	Undefined
Uygulama Türü	Web tabanlı mini ERP ve AI destekli karar destek sistemi
Ana Problem	Kafe/restoranlarda günlük satış, stok ve satın alma planlama sürecinin manuel ve zaman alıcı olması
Ana Çözüm	Ürün reçetesi, ham madde, stok ve günlük satış verilerinden otomatik tüketim analizi ve satın alma önerisi üretmek
AI Rolü	Hesap yapmak değil; ERP motoru sonucunu işletmeci dilinde açıklamak
MVP Odak Noktası	Malzeme, ürün, reçete, satış, ERP analiz, dashboard, Copilot ve opsiyonel n8n tetikleme

 
1. Projenin Genel Özeti
Undefined, kafe ve restoran gibi küçük işletmelerin günlük stok, reçete, satış ve satın alma kararlarını otomatikleştirmek için geliştirilecek web tabanlı mini ERP uygulamasıdır. Sistem, işletmecinin günlük olarak yaptığı stok kontrolü, hangi malzemelerin azaldığını hesaplama, ne sipariş edileceğini belirleme ve reçeteye göre fazla tüketim olup olmadığını anlama süreçlerini azaltmayı hedefler.
Uygulamanın merkezinde bir ERP hesap motoru bulunur. Bu motor, veritabanındaki ürün, ham madde, reçete, stok ve günlük satış verilerini algoritmik olarak işler. AI katmanı ise bu hesaplanmış sonuçları açıklanabilir özetlere, Copilot cevaplarına ve tedarikçi mesajlarına dönüştürür.
1.1. En Net Değer Önerisi
Undefined, satıştan stok tüketimini hesaplayan, kritik stokları bulan ve işletmeciye satın alma aksiyonu öneren AI destekli mini ERP sistemidir.
1.2. Ana Sistem Akışı
1. Yönetici ham madde / malzeme ekler. Örn: Kaşar, dilim, 8 TL, mevcut stok 120 dilim.
2. Yönetici ürün ekler. Örn: Kaşarlı Tost, satış fiyatı 90 TL.
3. Yönetici ürün reçetesi oluşturur. Örn: Kaşarlı Tost = 1 dilim kaşar + 2 adet tost ekmeği.
4. Yönetici günlük satış girer. Örn: Bugün 40 adet Kaşarlı Tost satıldı.
5. Backend PostgreSQL verilerini çeker ve ERP motorunun beklediği formata dönüştürür.
6. ERP motoru teorik tüketim, kritik stok, satın alma önerisi ve reçete sapması hesaplar.
7. Gemma / Copilot bu sonucu işletmeci dilinde açıklar.
8. Dashboard üzerinde kritik aksiyonlar, tedarikçi mesajı ve gün sonu checklist gösterilir.
2. Onaylanan Teknoloji Yapısı
Katman	Teknolojiler	Kullanım Amacı
Frontend	React + Vite + TypeScript	Web arayüz, sayfalar, formlar, dashboard ve Copilot paneli
UI	Tailwind CSS + shadcn/ui + Lucide React	Modern dashboard, kartlar, tablolar, butonlar, ikonlar
Grafikler	Recharts	Satış, stok riski ve kayıp grafiklerinin gösterimi
State	Zustand	Frontend tarafında analiz sonuçları ve form verilerinin yönetimi
HTTP	Axios	Frontend-backend istekleri
Auth	Firebase Authentication	Kayıt, giriş ve çıkış işlemleri
Backend	Node.js + Express + TypeScript	REST API, veritabanı işlemleri, ERP motoru ve AI bağlantıları
Database	PostgreSQL + pg	Ürünler, malzemeler, reçeteler, stoklar, satışlar ve analiz sonuçları
Validation	Zod	Backend request doğrulama
AI	Local Gemma 3 4B + Ollama API	Copilot, yönetici özeti ve tedarikçi mesajı
Otomasyon	n8n Webhook	Opsiyonel: tedarikçi mesajı workflow tetikleme

2.1. Kritik Mimari Karar
AI hesap yapmaz. Hesapları ERP motoru algoritmik olarak yapar. AI sadece hesaplanmış sonucu açıklar.
3. Dosya Yapısı
3.1. Genel Proje Yapısı
undefined/
├── frontend/
│   └── React + Vite + TypeScript uygulaması
│
├── backend/
│   └── Express + TypeScript API
│
└── docs/
    ├── proje-raporu.docx
    ├── demo-senaryosu.md
    └── api-contract.md
3.2. Frontend Dosya Yapısı
frontend/
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Topbar.tsx
│   │   │   └── AppLayout.tsx
│   │   ├── dashboard/
│   │   │   ├── StatCards.tsx
│   │   │   ├── CriticalStockCards.tsx
│   │   │   ├── ProfitLeakCards.tsx
│   │   │   ├── PurchaseRecommendations.tsx
│   │   │   └── ClosingChecklist.tsx
│   │   ├── materials/
│   │   │   ├── MaterialForm.tsx
│   │   │   └── MaterialTable.tsx
│   │   ├── products/
│   │   │   ├── ProductForm.tsx
│   │   │   └── ProductTable.tsx
│   │   ├── recipes/
│   │   │   ├── RecipeForm.tsx
│   │   │   └── RecipeTable.tsx
│   │   ├── sales/
│   │   │   ├── SalesForm.tsx
│   │   │   └── SalesTable.tsx
│   │   ├── copilot/
│   │   │   ├── CopilotPanel.tsx
│   │   │   ├── QuickQuestionButtons.tsx
│   │   │   └── ChatMessage.tsx
│   │   └── ui/
│   ├── pages/
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── MaterialsPage.tsx
│   │   ├── ProductsPage.tsx
│   │   ├── RecipesPage.tsx
│   │   ├── SalesPage.tsx
│   │   └── CopilotPage.tsx
│   ├── lib/
│   │   ├── firebase.ts
│   │   ├── api.ts
│   │   └── utils.ts
│   ├── store/
│   │   └── stockPilotStore.ts
│   ├── types/
│   │   └── stockpilot.types.ts
│   ├── App.tsx
│   └── main.tsx
├── .env
├── package.json
└── vite.config.ts
3.3. Backend Dosya Yapısı
backend/
├── src/
│   ├── db/
│   │   ├── pool.ts
│   │   ├── schema.sql
│   │   └── seed.sql
│   ├── routes/
│   │   ├── materials.route.ts
│   │   ├── products.route.ts
│   │   ├── recipes.route.ts
│   │   ├── sales.route.ts
│   │   ├── analyze.route.ts
│   │   ├── copilot.route.ts
│   │   └── n8n.route.ts
│   ├── services/
│   │   ├── databaseService.ts
│   │   ├── erpHesapMotoru.ts
│   │   ├── gemmaService.ts
│   │   ├── copilotService.ts
│   │   └── n8nService.ts
│   ├── schemas/
│   │   ├── material.schema.ts
│   │   ├── product.schema.ts
│   │   ├── recipe.schema.ts
│   │   ├── sale.schema.ts
│   │   └── copilot.schema.ts
│   ├── types/
│   │   └── stockpilot.types.ts
│   └── index.ts
├── .env
├── package.json
└── tsconfig.json
4. Görev Dağılımı
Bu bölümde görevler çakışma yaşanmayacak şekilde ayrılmıştır. Samet ve Emre’nin görevleri önceki plandan farklı olarak değiştirilmiştir.
4.1. Taha - Frontend & Firebase + n8n Bağlantıları
•	Ana alan: Frontend arayüz, Firebase Authentication, n8n tetikleme bağlantıları ve API entegrasyonu.
•	React + Vite projesini kurmak ve Tailwind / shadcn/ui altyapısını hazırlamak.
•	Login, Register ve Logout akışlarını Firebase Authentication ile yapmak.
•	Dashboard, Malzemeler, Ürünler, Reçeteler, Satışlar ve Copilot sayfalarını hazırlamak.
•	Malzeme, ürün, reçete ve satış formlarını backend endpointlerine bağlamak.
•	Analiz sonucu gelen verileri dashboard kartlarına, tablolara ve grafiklere basmak.
•	Copilot paneli, quick question butonları ve chat mesaj komponentlerini hazırlamak.
•	Opsiyonel olarak n8n webhook tetikleme butonunu veya backend bağlantısını frontend akışına eklemek.
Taha'nın dokunmaması gereken alanlar:
- backend/src/services/erpHesapMotoru.ts
- backend/src/db/schema.sql
- backend/src/services/databaseService.ts

Taha'nın ana sorumluluğu:
Frontend düzgün çalışmalı, formlar backend'e veri göndermeli, dashboard analiz sonucunu anlaşılır göstermeli.
4.2. Samet - Backend / ERP Motoru / Analyze / Gemma + Copilot
•	Ana alan: ERP hesap motoru, analiz endpointi, Gemma bağlantısı, Copilot endpointi ve AI promptları.
•	erpHesapMotoru.ts dosyasını yazmak ve test etmek.
•	Ürün satış özeti, teorik tüketim, kritik stok, reçete sapması, satın alma önerisi ve tedarikçi mesajı fonksiyonlarını oluşturmak.
•	analyze.route.ts içinde Emre’nin databaseService fonksiyonlarını çağırarak ERP motorunu çalıştırmak.
•	ERP motoru sonucunu analysis_results tablosuna kaydetmek.
•	gemmaService.ts ile local Gemma 3 4B / Ollama API bağlantısını hazırlamak.
•	copilot.route.ts yazarak kullanıcının sorularına son ERP analiz sonucuna göre cevap üretmek.
•	AI promptlarında sayı uydurmama, veride olmayan konuya cevap vermeme ve kısa işletmeci dili kullanma kurallarını uygulamak.
•	Gemma yavaş veya kapalı olursa fallback cevap mantığını hazırlamak.
Samet'in dokunmaması gereken alanlar:
- backend/src/db/schema.sql
- backend/src/routes/materials.route.ts
- backend/src/routes/products.route.ts
- backend/src/routes/recipes.route.ts
- backend/src/routes/sales.route.ts
- frontend/

Samet'in ana sorumluluğu:
ERP motoru doğru hesap yapmalı, analyze endpoint çalışmalı, Copilot sadece ERP sonucuna göre cevap vermeli.
4.3. Emre - Backend / PostgreSQL / CRUD API / Database Service
•	Ana alan: PostgreSQL, database schema, seed data, CRUD endpointleri ve databaseService.
•	schema.sql dosyasını hazırlamak: products, ingredients, recipe_items, inventory, daily_sales, analysis_results.
•	seed.sql ile güçlü demo verisi oluşturmak: en az 2 ürün, 4 malzeme, 2 reçete, kritik stok, reçete sapması ve satın alma önerisi oluşturacak satış/stok verileri.
•	pool.ts ile PostgreSQL bağlantısını kurmak.
•	materials.route.ts dosyasında ham madde ve stok ekleme/listeleme/güncelleme işlemlerini yazmak.
•	products.route.ts dosyasında ürün ekleme ve listeleme işlemlerini yazmak.
•	recipes.route.ts dosyasında ürün reçetesi kalemi ekleme ve listeleme işlemlerini yazmak.
•	sales.route.ts dosyasında günlük satış ekleme ve bugünkü satışları listeleme işlemlerini yazmak.
•	databaseService.ts dosyasında ERP motorunun beklediği veri formatını döndüren fonksiyonları yazmak.
•	Zod validation ile request body hatalarını azaltmak.
Emre'nin dokunmaması gereken alanlar:
- backend/src/services/erpHesapMotoru.ts
- backend/src/services/gemmaService.ts
- backend/src/routes/copilot.route.ts
- frontend/

Emre'nin ana sorumluluğu:
Veritabanı stabil olmalı, CRUD endpointleri çalışmalı, databaseService ERP motoruna temiz ve uyumlu veri sağlamalı.
5. Çakışmayı Önlemek İçin Net Sınırlar
Kişi	Sorumluluk Alanı	Dokunmaması Gereken Ana Alan
Taha	Frontend, Firebase Auth, n8n tetikleme ve API bağlantıları	ERP motoru, DB schema, databaseService
Samet	ERP motoru, analyze route, Gemma, Copilot, AI promptları	DB schema, CRUD route, frontend
Emre	PostgreSQL, CRUD route, seed data, databaseService	ERP motoru, Gemma, Copilot, frontend

5.1. Ortak Karar Gerektiren Dosyalar
•	backend/src/types/stockpilot.types.ts
•	frontend/src/types/stockpilot.types.ts
•	backend/src/index.ts
•	.env dosyaları
•	API endpoint isimleri
•	ERP input-output contract yapısı
5.2. En Kritik Uyum Noktası
Emre'nin databaseService çıktısı ile Samet'in ERP motoru input formatı aynı olmalıdır.
Kesinleşmesi gereken ortak tipler:
- Urun
- Malzeme
- ReceteKalemi
- StokKalemi
- GunlukSatis
- AnalizSonucu
6. Projenin Genel Fonksiyonları ve Özellikleri
Modül	Fonksiyon	Açıklama
Auth	Kayıt / Giriş / Çıkış	Firebase Authentication ile kullanıcı oturumu yönetilir.
Malzemeler	Ham madde ekleme	Kaşar, tost ekmeği, sucuk gibi ham maddeler ve stok bilgileri girilir.
Ürünler	Ürün ekleme	Kaşarlı Tost, Sucuklu Tost gibi satılan ürünler tanımlanır.
Reçeteler	Ürün reçetesi oluşturma	Ürünün hangi malzemelerden oluştuğu girilir. Örn: 1 dilim kaşar + 2 adet ekmek.
Satışlar	Günlük satış girişi	Bugün hangi üründen kaç adet satıldığı girilir.
ERP Analiz	Algoritmik hesaplama	Teorik tüketim, kritik stok, reçete sapması ve satın alma önerileri hesaplanır.
Dashboard	Görsel karar ekranı	Kritik stoklar, toplam satış, gelir, tahmini kayıp ve satın alma listesi gösterilir.
Copilot	AI destekli soru-cevap	Yönetici ERP sonucu üzerinden soru sorar; AI hesap yapmaz, açıklama yapar.
n8n	Opsiyonel otomasyon	Tedarikçi mesajı webhook ile workflow’a gönderilebilir.

6.1. ERP Motorunun Üreteceği Çıktılar
•	Bugünkü toplam satış adedi
•	Bugünkü toplam gelir
•	Ürün bazlı satış özeti
•	Reçeteye göre teorik malzeme tüketimi
•	Kritik stok durumu ve trafik ışığı rengi
•	Satın alma önerisi
•	Gerçek tüketim girilmişse reçete sapması ve tahmini gizli kayıp
•	Tedarikçi mesaj taslağı
•	Gün sonu kontrol listesi
7. İşlerin Yapılma Sırası
Aşama	Taha	Samet	Emre	Beklenen Çıktı
1. Kurulum	React + Vite, Tailwind, shadcn/ui, Firebase config	ERP motoru taslağı, Gemma/Ollama test	Express, PostgreSQL, pool.ts, schema.sql	Projeler ayağa kalkar.
2. Veri ve formlar	Malzeme, ürün, reçete, satış formları	ERP motorunu test datasıyla çalıştırır	CRUD route ve databaseService yazar	Database’e veri girilebilir.
3. Analyze akışı	Dashboard /api/analyze sonucunu gösterir	Analyze route yazar, ERP motorunu bağlar	databaseService çıktısını stabil hale getirir	Analiz butonu dashboard’u doldurur.
4. AI / Copilot	Copilot paneli ve quick question butonları	Gemma service, copilot.route ve promptlar	Son analysis_result helper query gerekiyorsa destekler	Copilot ERP sonucuna göre cevap verir.
5. n8n Bonus	n8n tetikleme butonu / UI akışı	Gerekirse backend tetikleme endpointi	Webhook için veri formatı desteği	Tedarikçi mesajı workflow’a gönderilir.
6. Test	UI polish ve akış testi	ERP + AI fallback testi	DB, endpoint ve seed testi	Demo baştan sona çalışır.

7.1. Öncelik Sırası
1. Database schema ve seed data hazırlanmalı.
2. Malzeme, ürün, reçete ve satış CRUD endpointleri çalışmalı.
3. Frontend formları backend’e bağlanmalı.
4. ERP motoru test verisiyle doğru hesap yapmalı.
5. Analyze route database’den veri çekip ERP motorunu çalıştırmalı.
6. Dashboard analiz sonucunu göstermeli.
7. Copilot quick question butonları eklenmeli.
8. n8n webhook sadece ana sistem çalıştıktan sonra eklenmeli.
9. Son aşamada UI polish ve demo testi yapılmalı.
7.2. Yapılmaması Gerekenler
•	Gerçek POS entegrasyonuna girilmemeli.
•	Gerçek WhatsApp entegrasyonu yapılmaya çalışılmamalı.
•	Çok şubeli yapı MVP’ye dahil edilmemeli.
•	Full role-based authorization yapılmamalı.
•	Karmaşık n8n workflow’ları ana hedef yapılmamalı.
•	AI’a sayısal hesap yaptırılmamalı.
•	Backend ve frontend aynı dosya/tip yapısını bağımsız değiştirmemeli.
8. Eksikler, Riskler ve Öneriler
Konu	Risk / Eksik	Öneri
n8n rolü	Ana sistem bitmeden n8n’e girilirse zaman kaybettirebilir.	n8n sadece tedarikçi mesajı webhook bonusu olarak kalsın.
Firebase backend güvenliği	Frontend auth çalışsa bile backend token doğrulaması yok olabilir.	MVP’de kabul edilebilir. Sunumda production’da Firebase ID token doğrulaması eklenecek denebilir.
Gerçek tüketim alanı	Kullanıcı için kafa karıştırabilir.	Formda “Opsiyonel - girilirse reçete sapması hesaplanır” açıklaması olmalı.
Birim uyumu	dilim, adet, kg gibi birimler yanlış eşleşirse hesap bozulabilir.	MVP’de demo için ağırlıklı olarak dilim/adet/litre kullanılmalı.
Gemma performansı	Local model yavaş cevap verebilir.	Fallback AI cevabı hazırlanmalı; hesaplar zaten ERP motorunda yapılmalı.
Seed data	Demo verisi zayıfsa dashboard boş görünür.	Kırmızı stok, sarı stok, reçete sapması ve satın alma önerisi üreten seed hazırlanmalı.
API contract	Frontend ve backend farklı isimlendirme kullanırsa entegrasyon gecikir.	Tipler ve endpoint response yapısı ilk aşamada netleştirilmeli.
Zod validation	Yoksa hatalı form verisi backend’i bozabilir.	CRUD route’lara minimum Zod validation eklenmeli.

8.1. Güçlü Demo İçin Gerekli Veri Seti
•	En az 2 ürün: Kaşarlı Tost, Sucuklu Tost.
•	En az 4 malzeme: Kaşar, tost ekmeği, sucuk, süt veya domates.
•	En az 2 reçete.
•	En az 1 kırmızı kritik stok.
•	En az 1 sarı takip stoku.
•	En az 1 reçete sapması.
•	Satın alma önerisi çıkaracak stok durumu.
•	Tedarikçi mesajı oluşturacak öneri listesi.
9. API ve Veri Akışı Özeti
Endpoint	Sorumlu	Amaç
GET /api/materials	Emre	Ham maddeleri ve stok bilgilerini listelemek
POST /api/materials	Emre	Ham madde + stok kaydı oluşturmak
PUT /api/materials/:id	Emre	Ham madde ve stok bilgisi güncellemek
GET /api/products	Emre	Ürünleri listelemek
POST /api/products	Emre	Ürün eklemek
GET /api/recipes	Emre	Reçete kalemlerini listelemek
POST /api/recipes	Emre	Reçete kalemi eklemek
GET /api/sales/today	Emre	Bugünkü satışları listelemek
POST /api/sales	Emre	Günlük satış eklemek
POST /api/analyze	Samet	Database verilerini ERP motoruna gönderip analiz üretmek
POST /api/copilot	Samet	Son ERP analiz sonucuna göre Copilot cevabı üretmek
POST /api/n8n/supplier-message	Taha + Samet	Opsiyonel n8n webhook tetiklemek

9.1. Ana Veri Akışı
PostgreSQL
   ↓
Emre: databaseService
   ↓
Samet: ERP Hesap Motoru
   ↓
Samet: Analyze Route
   ↓
PostgreSQL: analysis_results
   ↓
Taha: React Dashboard
   ↓
Samet: Gemma / Copilot açıklaması
   ↓
Taha: Copilot Paneli ve n8n tetikleme
10. Sonuç ve Uygulama Kararı
Undefined projesi, mevcut kapsamıyla 6 saatlik MVP için yönetilebilir durumdadır. Başarı için en önemli şart; kapsamın büyütülmemesi, görev sınırlarının korunması ve ERP motoru ile databaseService arasındaki veri formatının erken netleştirilmesidir.
10.1. Final Görev Özeti
Taha:
Frontend + Firebase Authentication + n8n bağlantı arayüzü

Samet:
ERP motoru + Analyze Route + Gemma + Copilot + AI promptları

Emre:
PostgreSQL + CRUD API + Seed Data + Database Service
10.2. En Doğru Geliştirme Sırası
Database → CRUD → Frontend Forms → ERP Motoru → Analyze Route → Dashboard → Copilot → n8n Bonus → Test


