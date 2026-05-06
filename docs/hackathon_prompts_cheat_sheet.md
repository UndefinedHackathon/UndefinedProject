# Hackathon Prompt Kopya Kağıdı (Cheat Sheet)

Yarın hackathon başladığında, Claude'u en verimli şekilde yönetmek ve jürinin istediği **Plan Agent, Skills Agent, Traceability** gibi tüm puanları toplamak için bu komutları sırasıyla kullanabilirsiniz.

---

## 🛑 Adım 0: Branch (Dal) Açmayı Unutmayın!
İlk kodu yazdırmadan önce terminalden yeni bir dal açın:
```bash
git checkout -b feat/initial-architecture
```

---

## 🏗️ Adım 1: Plan Agent ve Mimari Kurulum (15 Puan)
**Claude'a Yazılacak İlk Prompt:**
> "Merhaba Claude, SolveX AI Hackathon süremiz başladı. Lütfen önce ana dizindeki `.clauderules` dosyasını ve ardından `.agent/skills` klasöründeki tüm yetenekleri oku. Şimdi **Plan Agent** rolünü üstlenmeni istiyorum. Proje dokümanlarımızı analiz et ve ana dizine detaylı bir `ROADMAP.md` dosyası oluştur. Bu dosyada projenin mimarisini belirle ve Taha, Samet, Emre'nin yapacağı işleri checklist (alt görevler) halinde hazırla."

*(Bu komuttan sonra `ROADMAP.md` oluşacak. Değişiklikleri commit atıp `feat/database-layer` dalına geçin.)*

---

## 🗄️ Adım 2: Emre'nin Görevi - Veritabanı ve Seed Data (Skills Agent)
**Claude'a Yazılacak İkinci Prompt:**
> "Harika. Şimdi `ROADMAP.md` üzerinden Emre'nin görevlerine başlıyoruz. Lütfen PostgreSQL için `backend/src/db/schema.sql` dosyasını oluştur. Ardından hackathon sunumunda jüriye şov yapmamızı sağlayacak, kırmızı stok ve reçete sapması senaryolarını barındıran `seed.sql` dosyasını yaz. Son olarak, bu verileri ERP motoruna hazırlayacak `backend/src/services/databaseService.ts` dosyasını kodla. 
> **DİKKAT:** Bu işlemler veritabanı optimizasyonu gerektirdiği için **Skills Agent** yetkinliğinde çalışmalısın. Şartnamedeki Süreç Şeffaflığı (Traceability) kuralı gereği, SQL ve TypeScript dosyalarının başına AI imzanı (`// [AI-Agent: Skills] ...` formatında) atmayı sakın unutma!"

---

## 🧠 Adım 3: Samet'in Görevi - ERP Motoru ve AI Bağlantısı (Skills Agent)
**Claude'a Yazılacak Üçüncü Prompt:**
> "Şimdi projenin beyni olan Samet'in görevine geçiyoruz. `backend/src/services/erpHesapMotoru.ts` dosyasını yaz. Bu fonksiyon hiçbir dış api'ye bağlanmadan, saf algoritmik olarak çalışmalı; teorik tüketim, kritik stok eşiği, reçete sapması ve satın alma önerisini hesaplamalıdır. 
> Ardından `analyze.route.ts` ve local Gemma modeline bağlanacak `copilot.route.ts` API uç noktalarını hazırla. 
> **DİKKAT:** ERP algoritması çok kritik olduğu için **Skills Agent** rolünü kullanıyorsun. Lütfen kodların başına AI optimizasyon imzanı bırakmayı unutma."

---

## 🎨 Adım 4: Taha'nın Görevi - Frontend ve Dashboard
**Claude'a Yazılacak Dördüncü Prompt:**
> "Sıra Taha'nın Frontend UI görevlerinde. `react-ui-patterns` kurallarına uyarak React, Tailwind ve shadcn/ui ile arayüzü inşa et. 
> 1. Dashboard sayfasını yap: Kırmızı/Sarı trafik ışığı olan kritik stok kartları ve reçete sapması kâr/zarar kartları olsun.
> 2. Form sayfalarını (Malzemeler, Ürünler, Satışlar) oluştur ve Zustand store üzerinden backend'e bağla.
> 3. Copilot panelini tasarla ve hazır soru butonlarını ekle.
> Temiz kod standartlarına dikkat et."

---

## 🛡️ Adım 5: Final Review ve Optimizasyon (Son Kontrol - 10 Puan)
**Claude'a Yazılacak Son Prompt (Sunuma Geçmeden Önce):**
> "Tüm MVP'miz çalışır duruma geldi, ellerine sağlık. Ancak kodları teslim etmeden önce şartnamedeki 'Son Kontrol' kriterini yerine getirmeliyiz. Senden **Final Review Agent** rolünü üstlenmeni istiyorum. Lütfen `frontend` ve `backend` klasörlerindeki tüm kod tabanını refactoring, performans, kullanılmayan değişken temizliği ve güvenlik (örneğin SQL injection koruması) taramasından geçir. Yaptığın tüm düzeltmeleri bana `docs/review_summary.md` adında bir rapor olarak sun. Bu raporu jüriye kanıt olarak göstereceğiz."

---

## 💡 Ekstra Taktikler:
1. **Hata mı aldınız?** Claude'a şunu yazın: *"Terminalde şu hatayı aldım: [hatayı yapıştır]. Lütfen Fix dalında olduğumuzu varsayarak problemi çöz."*
2. **Commit Attırırken:** Kodu yazdıktan sonra Claude'a *"Bu değişiklikler için Github Flow standartlarına uygun, şimdiki zaman kipiyle bir commit mesajı öner"* demeyi unutmayın. (10 puan kazandırır)
