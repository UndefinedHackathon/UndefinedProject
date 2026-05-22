# StockPilot AI - Backend Sunum ve Mimari Raporu

Bu rapor, StockPilot AI (Undefined) projesinin backend mimarisini, teknoloji seçimlerinin nedenlerini, çalışma prensiplerini ve jüri sunumunda gelebilecek olası teknik sorulara verilecek cevapları detaylı bir şekilde içermektedir.

---

## 1. Backend Mimarisi ve Kullanılan Teknolojiler

Backend sistemimiz, uygulamanın beyni olan ERP Hesaplama Motorunu, veritabanı yönetimini ve Yapay Zeka entegrasyonunu barındıran modüler ve ölçeklenebilir bir yapı olarak tasarlandı.

### Temel Teknolojiler ve Seçim Nedenleri

| Teknoloji | Kullanım Amacı | Neden Bu Teknolojiyi Seçtik? |
| :--- | :--- | :--- |
| **Node.js & Express.js** | REST API Sunucusu ve Core Backend | Asenkron I/O işlemleri (veritabanı sorguları, AI istekleri) için idealdir. Hızlı prototipleme imkanı sunar ve geniş ekosistemi (npm) sayesinde dış entegrasyonları kolaylaştırır. MVP (Minimum Viable Product) için en hızlı ve performanslı çözümdür. |
| **TypeScript** | Statik Tip Denetimi | Javascript'in esnekliğinden kaynaklanan çalışma zamanı hatalarını derleme zamanında yakalamak için kullandık. Frontend ve Backend arasında (`stockpilot.types.ts`) ortak tip (interface) tanımları kullanarak veri bütünlüğünü %100 sağladık. Bu, veri uyumsuzluklarını tamamen ortadan kaldırdı. |
| **PostgreSQL & `pg` modülü** | İlişkisel Veritabanı | Ürünler, reçeteler, ham maddeler ve satışlar birbiriyle sıkı ilişki içindedir (Relational Data). Veri bütünlüğünü (Data Integrity) korumak, JOIN sorgularını performanslı çalıştırmak ve ACID özelliklerinden faydalanmak için NoSQL yerine ilişkisel bir veritabanı olan PostgreSQL'i tercih ettik. |
| **Zod** | Şema Doğrulama (Validation) | İstemciden (Frontend) gelen verilerin doğruluğunu tip güvenli (type-safe) bir şekilde kontrol etmek için kullandık. Yanlış veri girişlerinin veritabanına veya ERP motoruna ulaşmadan yakalanmasını sağlar. Hata yönetimini standartlaştırdık. |
| **Gemma 3 4B (Local AI)** | Copilot ve Yönetici Özeti | Yapay zeka süreçlerini lokalde çalıştırmak (Ollama üzerinden) hem veri gizliliğini (işletme verileri dışarı çıkmıyor) sağladı hem de dış API maliyetlerini sıfıra indirdi. |
| **Firebase Admin SDK** | Kimlik Doğrulama | Kullanıcı yönetimi, şifre sıfırlama, güvenli JWT tabanlı oturum yönetimi süreçlerini baştan yazmak yerine, endüstri standardı ve yüksek güvenlikli olan Firebase'i backend middleware'i ile entegre ederek zaman kazandık. |

---

## 2. Sistemin Çalışma Mantığı ve Kritik Mimari Kararlar

### Kritik Karar: Yapay Zekaya Hesap Yaptırmamak!
Projeyi geliştirirken aldığımız en önemli ve sektörel gerçeklere en uygun karar budur.
**Neden?** LLM'ler (Büyük Dil Modelleri) doğaları gereği matematiksel işlemlerde ve deterministik sonuçlar üretmede (hallucination - halüsinasyon yapma eğilimlerinden dolayı) güvenilir değildir. İşletmelerin stok ve maliyet gibi hassas verilerinde %1 hata payı bile kabul edilemez.
**Nasıl Çözdük?** 
1. `databaseService` üzerinden ham verileri PostgreSQL'den çekeriz.
2. Tüm hesaplamaları (Teorik tüketim, kritik stok, reçete sapması, kâr/zarar vb.) saf TypeScript ile yazdığımız algoritmik **ERP Hesap Motoru** (`erpHesapMotoru.ts`) yapar. Bu motor deterministiktir, hep aynı veriye aynı kesin sonucu verir.
3. Çıkan kesin sonuçlar, `gemmaService` aracılığıyla Gemma modeline sadece **"context" (bağlam)** olarak verilir. Gemma, bu doğru verileri alıp sadece insan dilinde, anlaşılır bir şekilde "yorumlar" ve işletmeci diliyle özetler.

### Veri Akışı (Data Flow)
1. **İstek Gelir:** Kullanıcı dashboard'da "Analiz Et" butonuna basar. (POST `/api/analyze`)
2. **Veri Toplama:** `databaseService`, veritabanından (PostgreSQL) o günün satışlarını, reçeteleri, malzemeleri ve stokları çeker (snake_case to camelCase dönüşümü yaparak).
3. **Analiz:** `erpHesapMotoru` bu verileri alır, matematiksel olarak işler ve `AnalizSonucu` objesini döner.
4. **AI Yorumu:** Bu sonuç AI modeline (Gemma) gönderilir ve 2-3 cümlelik bir "Yönetici Özeti" üretilir.
5. **Kayıt ve Yanıt:** Sonuçlar `analysis_results` tablosuna kaydedilir ve Frontend'e dönülür. Copilot (Soru-Cevap) sistemi de her zaman en son kaydedilen bu kesin verilere dayanarak cevap üretir.

---

## 3. Yapay Zeka Entegrasyonu: Neden Gemma 3 4B?

Jüri sunumunda AI modeli seçimimiz üzerine gelebilecek sorular için temel savlarımız şunlardır:

1. **Lokal Çalışabilme (Privacy & Security):** İşletmelerin günlük ciro, stok maliyeti, satılan ürün adetleri gibi verileri çok kritiktir. OpenAI/ChatGPT veya Claude gibi cloud tabanlı API'ler kullanmak veri gizliliği endişeleri yaratır. Gemma'yı Ollama ile tamamen lokalimizde (offline bile çalışabilecek şekilde) koşturarak işletme verisinin cihazdan çıkmamasını sağladık.
2. **Performans ve Boyut Dengesi (4B Parametre):** 4 Milyar parametreli bu model, bir dizüstü bilgisayarda veya küçük bir sunucuda hızlıca çalışacak (düşük RAM/VRAM tüketimi) kadar hafif, ancak verdiğimiz ERP JSON datalarını anlayıp düzgün Türkçe yorumlayabilecek kadar akıllıdır. Llama 3 8B'ye göre daha az kaynak tüketir.
3. **Maliyet (Zero-Cost):** Cloud API'ler token bazlı ücretlendirilirken, sistemi tamamen lokal open-source (açık kaynak) modellerle kurmak sürekli operasyon maliyetlerini (OPEX) sıfıra indirir.
4. **Fallback (Hata Toleransı) Mekanizması:** Sistemimizde AI çökerse, zaman aşımına uğrarsa veya Ollama kapanırsa sistem hata vermez. `gemmaService.ts` içerisinde yazdığımız fallback mekanizması devreye girer ve hard-coded şablonlarla sistemi ayakta tutar. AI, sistemin çökme noktası (single point of failure) değildir, sadece bir "artı değerdir".

---

## 4. Jüri Soru ve Cevapları (Q&A Hazırlığı)

Aşağıda jürinin sorabileceği zorlayıcı sorular ve verebileceğiniz doyurucu, mühendislik vizyonu içeren cevaplar listelenmiştir.

### Q1: Neden AI modeline direkt hesap yaptırmadınız? Gelişmiş modeller artık matematik yapabiliyor.
**Cevap:** Gelişmiş modeller bile zaman zaman "halüsinasyon" (hallucination) görebiliyor. Bir kafe işletmecisine "10 kg kaşar kaldı" yerine yanlışlıkla "1 kg kaldı" dediğimiz an işletmenin tüm satın alma süreci bozulur ve uygulamaya güven biter. Finansal ve stok tabanlı işlemlerde deterministik (kesin) sonuçlar şarttır. Biz AI'ı hesap makinesi olarak değil, doğru hesaplanmış veriyi anlayan ve işletmeciye aksiyon öneren bir asistan olarak konumlandırdık. Bu, sektördeki en güvenilir yapay zeka entegrasyon desenlerinden (pattern) biridir.

### Q2: Copilot her şoruya cevap verebiliyor mu? Örneğin "Dün hava nasıldı?" dersem ne olur?
**Cevap:** Hayır, veremez. System Prompt'umuzu (AI'a verdiğimiz ana talimatlar) çok sıkı tasarladık. Copilot'a sadece en son yapılan ERP analizinin sonucunu (minimize edilmiş bir JSON olarak) veriyoruz ve "Sadece elindeki bu güncel operasyon datasına dayanarak cevap ver, veri dışında bir şey uydurma" diyoruz. Bilmediği bir şey sorulursa "Bu bilgi mevcut analizde yok" diyecek şekilde sınırlandırdık. Bu sayede modelin gereksiz çıktılar üretmesini (jailbreak) engelledik.

### Q3: Projede veritabanı olarak neden NoSQL (örneğin MongoDB) değil de PostgreSQL kullandınız?
**Cevap:** Projemizin veri yapısı son derece ilişkiseldir. Bir "Sipariş", bir "Ürüne" bağlıdır; o ürün bir "Reçeteye", reçete ise "Ham Maddelere" bağlıdır. Stok düşümü hesaplarken bu tabloları birleştirmemiz (JOIN) gerekir. PostgreSQL, hem veri bütünlüğünü (referential integrity) zorunlu kılmasıyla hem de karmaşık sorgulardaki yüksek performansıyla bu tip ERP/Stok sistemleri için endüstri standardıdır. NoSQL kullansaydık veri tekrarı (data duplication) yapmamız gerekecekti ve veri tutarsızlıkları riski artacaktı.

### Q4: Sistemin çökmesini engelleyen ne gibi mimari önlemleriniz var? (Resilience)
**Cevap:** Backendimizde üç aşamalı bir güvenlik/hata yönetim mekanizması var:
1. **Zod Validasyonu:** Gelen tüm veriler API katmanında doğrulanır. Hatalı veri motorlara ulaşmaz.
2. **AI Fallback:** Gemma modeli ağırlaşırsa (biz 15 sn timeout koyduk) veya çökerse, sistem hata patlatmaz. Yazılım tarafında hazırladığımız hazır şablon cevaplar (fallback) devreye girer. Kullanıcı kesinti hissetmez.
3. **Global Error Handling:** Express tarafında yazdığımız global error middleware sayesinde hiçbir hata sunucuyu (Node.js process) çökertmez, düzgün bir HTTP 500 yanıtı olarak Frontend'e raporlanır.

### Q5: "Reçete Sapması" dediğiniz özellik nasıl çalışıyor?
**Cevap:** Reçete sapması (fire/kayıp) restoranların en büyük problemidir. Sistemimizde ERP motoru, satılan ürünler üzerinden "Kağıt üstünde ne kadar malzeme tüketilmeliydi?" (Teorik Tüketim) hesabını yapıyor. Eğer işletmeci gün sonu fiziksel stok sayımını sisteme girerse, ERP motorumuz teorik ile fizikseli karşılaştırır. Aradaki farkı birim maliyetle çarparak "X malzemesinde bugün %Y oranında (Z TL) görünmeyen bir kayıp/fire var" tespitini yapar. Copilot da bu veriyi alıp "Bugün en büyük kâr kaybımız kaşar peynirinde" diyerek yöneticiyi uyarır.

### Q6: Ortak tipleri (Interfaces) hem frontend hem backend'de nasıl tuttunuz?
**Cevap:** `stockpilot.types.ts` isimli bir dosyamız var. API istek/cevap modelleri, veritabanı satır tipleri ve ERP motoru objeleri bu dosyadan türer. Projede herhangi bir yerde (örneğin ürün ismini) değiştirirsek, TypeScript derleyicisi anında hem Frontend'de hem Backend'de bize hata gösteriyor. Bu sayede "undefined is not a function" veya veri uyuşmazlığı hatalarını %100 engelledik.

---

## Özet Kapanış Cümlesi (Sunum İçin Tavsiye)
*"StockPilot AI, teknolojiyi karmaşıklaştırmak için değil, bir kafe sahibinin günlük kaosunu çözmek için tasarlandı. Hesabı şaşmaz algoritmalarımıza, yorumlamayı ve iletişimi ise lokal yapay zekamıza bıraktık. Hem güvenilir, hem akıllı, hem de veri gizliliğine saygılı bir MVP ürettik."*
