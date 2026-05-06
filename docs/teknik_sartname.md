SolveX AI Hackathon 2026
TEKNİK UYGULAMA ŞARTNAMESİ
(nocodearea.com)
1. AMAÇ VE KAPSAM
Modern AI-Augmented Development metodolojisini projeye entegre etmek sadece kod
yazmak değil süreci bir mühendislik disiplini içinde yönettiğinizi göstermenizi
amaçlamaktadır.
Bu şartname yarışma projesinin geliştirilme sürecinde kullanılacak olan versiyon kontrol
sistemleri, takım içi görev dağılımı ve AI araçlarının entegrasyonuna dair teknik standartları
belirlemek amacıyla hazırlanmıştır.
2. PROJE KONUSU VE BEKLENEN ÇIKTI
Takım, kendisine sunulan aşağıdaki temel problemi çözmekle yükümlüdür.
Problem: Yarışmadan 1 gün önce eğitimlerden hemen sonra web sayfamızda ilan
edilecektir.
Çıktı Formatı:Çözüm; bir Mobil Uygulama, Web Platformu, Masaüstü Yazılımı veya uçtan
uca kurgulanmış bir Workflow (İş Akışı) ürünü olabilir.
Temel Kriter: Geliştirilen ürünün, manuel emeği minimize ettiğini ve AI ajanlarının
otomasyon sürecindeki verimliliğini kanıtlaması beklenmektedir.
3. TAKIM YAPILANDIRMASI VE ROL DAĞILIMI
• Takım sadece 3 üyeden oluşur.
• Yarışmacılar takımları kendisi oluşturacaktır.
• Her takım üyesi kişisel bilgisayarlarını getirerek yarışmaya katılacaktır.
• Takım adına 1 kişi başvuru yapması yeterlidir.
• Başvurular https://nocodearea.com/ adresinden yapılacaktır.
Süreç yönetimi için aşağıdaki roller tanımlanmıştır.
Lead Developer / Maintainer (1 Kişi): GitHub Main Repository yönetiminden, kod
standartlarının denetlenmesinden ve Pull Request (PR) onay süreçlerinden sorumludur.
Feature Developers (2 Kişi): Belirlenen Issue’lar doğrultusunda modüler geliştirme
yapmak, birim testleri hazırlamak ve kodlarını depoya iletmekle yükümlüdür.
4. VERSİYON KONTROL SİSTEMİ (GITHUB) STANDARTLARI
• Proje geliştirme sürecinde GitHub Flow mimarisi benimsenecektir.
• Repo yarışma günü takım lead’i tarafından oluşturulacaktır.
Repository Yönetimi: Proje, organizasyon veya takım lideri adına açılmış bir public/private
depoda barındırılacaktır.
Branching : * main dalı projenin dağıtıma hazır sürümünü temsil eder. Bu dala doğrudan
push yapılamaz.
Her yeni özellik veya hata düzeltme için feature/görev-adi veya fix/hata-adi formatında dallar
açılmalıdır.
Commit Mesajları: Mesajlar; yapılan değişikliği özetleyen, şimdiki zaman kipiyle yazılmış
teknik ifadeler içermelidir (Örn: feat: add user authentication layer).
Merge: Kod birleştirme işlemleri yalnızca Pull Request (PR) üzerinden gerçekleştirilir. PR’lar
en az bir takım üyesinin teknik incelemesinden (Code Review) geçmeli ve onay almalıdır.
5. AI-AUGMENTED DEVELOPMENT
Yarışma puanlamasında kritik öneme sahip olan AI araçlarının kullanımı zorunludur. Takım,
aşağıdaki ekosistemlerden birini seçerek süreci yönetecektir:
5.1. Araç Seçimi
Takım, geliştirme ortamı olarak aşağıdaki araçlardan birini veya birkaçı tercih etmekte
özgürdür.
1. Cursor
2. Google Antigravity
3. Claude Code by Anthropic vb.
5.2. Agent Yapılarının Entegrasyonu
Jüri değerlendirmesinde avantaj sağlamak adına süreçte şu iki yapı simüle edilmelidir:
Plan Agent: Geliştirme başlamadan önce seçilen AI aracına projenin mimari planı
hazırlatılmalıdır. Bu plan; ARCHITECTURE.md veya ROADMAP.md dosyası olarak repoda
saklanmalı, görevlerin sub-tasks’ları bu ajanlar tarafından belirlenmelidir.
Skills Agent: Karmaşık algoritmalar, güvenlik katmanları veya veritabanı optimizasyonları
gibi özel yetkinlik gerektiren kısımlarda AI, Uzman Yazılımcı rolüyle çalıştırılmalı ve bu
etkileşimlerin çıktıları kod yorumlarında belirtilmelidir.
6. İŞ TAKİBİ VE DOKÜMANTASYON
GitHub Issues: Her bir görev, bir Issue olarak tanımlanmalı ve ilgili geliştiriciye atanmalıdır.
AI Traceability: Kod dosyalarının başında veya PR açıklamalarında, hangi kısımların AI
ajanları (Plan/Skills) tarafından optimize edildiği kısaca not edilmelidir.
Final Review: Proje tesliminden önce kodun tamamı seçilen AI aracıyla Refactoring ve
Optimization taramasından geçirilmiş olmalıdır.
Yazılım Geliştirme ve AI-Agentic Süreç Terimleri Sözlüğü
Kategori Terim Teknik Açıklama
Versiyon
Kontrol
Repository
(Repo)
Proje dosyalarının, geçmişinin ve tüm versiyonlarının
saklandığı merkezi depo olarak bilinir.
Versiyon
Kontrol Main / Master
Projenin çalışan, stabil ve dağıtıma hazır en güncel ana
dalıdır.
Versiyon
Kontrol Feature Branch
Ana koda dokunmadan, yeni bir özellik geliştirmek için
açılan bağımsız çalışma dalıdır.
Versiyon
Kontrol
Pull Request
(PR)
Geliştirilen kodun incelenmesi ve main’e dahil edilmesi
için yapılan resmi taleptir.
Versiyon
Kontrol Code Review
Yazılan kodun kalite, güvenlik ve standartlar açısından bir
ekip arkadaşı tarafından denetlenmesi.
Versiyon
Kontrol Merge
Dalların birleştirilmesi, Merge ile tüm ara kayıtlar (commit)
tek bir özet halinde birleştirilir.
Versiyon
Kontrol Conflict
İki farklı geliştiricinin aynı dosya satırında yaptığı çakışan
değişikliklerin uyuşmazlığı.
AI Geliştirme AI-Native IDE
Yapay zekanın editörün çekirdeğine entegre olduğu (Cursor
vb.) yeni nesil geliştirme ortamı.
AI Geliştirme Context-Aware
Yapay zekanın sadece aktif dosyayı değil, projenin tüm
mimarisini ve bağımlılıklarını bilmesi.
AI Geliştirme Indexing
Proje kodlarının AI tarafından taranarak bir bilgi haritası
(vektör veri tabanı) oluşturulması.
AI Geliştirme .cursorrules
Proje başında tanımlanan; AI'ın uyacağı kodlama
standartlarını belirleyen kurallar dosyası.
AI Geliştirme
Prompt
Engineering
Yapay zekadan en verimli ve doğru çıktıyı almak için
kullanılan teknik komut tasarımı.
Agentic
Workflow Plan Agent
Proje isterlerini analiz ederek teknik yol haritası (Roadmap)
ve görev dağılımı oluşturan üst akıl.
Agentic
Workflow Skills Agent
Belirli bir uzmanlık alanında (Veritabanı, Güvenlik)
özelleşmiş yeteneklere sahip yapay zeka birimi.
Agentic
Workflow Reasoning
AI modelinin bir sorunu çözmeden önce adım adım mantık
yürütme ve planlama süreci.
Mühendislik Boilerplate
Projenin başlangıcında kullanılan standart, tekrar eden
hazır kod blokları ve yapılandırmalar.
Mühendislik Refactoring
Kodun işlevini değiştirmeden daha performanslı, temiz ve
okunabilir hale getirilmesi işlemi.
Mühendislik Traceability
Bir feature hangi ihtiyaçla başladığının ve hangi
aşamalardan geçtiğinin takip edilebilirliğidir.