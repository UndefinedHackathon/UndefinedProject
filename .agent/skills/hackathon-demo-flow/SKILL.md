---
name: hackathon-demo-flow
description: 6 saatlik MVP sonunda yapılacak sunum için ideal akış.
---

# Hackathon Sunum Akışı (Storytelling)

## 1. Giriş: Problem (30 Saniye)
"Küçük bir kafeyi yönetiyorsunuz. Gün sonunda ne kadar satış yaptınız, hangi malzemeniz azaldı, yarın tedarikçiden ne istemelisiniz ve reçetelere göre ne kadar gizli fire verdiniz? Bunları hesaplamak saatler alır. Karşınızda AI destekli mini ERP: **StockPilot AI**."

## 2. Çözüm: Veri Girişi ve Analiz (1 Dakika)
- **Kayıt ve Login:** Firebase auth ile giriş yap.
- **Malzemeler & Ürünler:** Kaşar ve Sucuk malzemelerini göster. Kaşarlı Tost ürününü ve reçetesini göster. (1 Dilim Kaşar + 2 Ekmek).
- **Satış:** "Bugün 40 adet Kaşarlı Tost sattığımızı sisteme giriyoruz."
- "Analiz Et" butonuna bas.

## 3. WOW Özelliği: ERP Hesap Motoru & Reçete Sapması (1 Dakika)
- Dashboard'da analiz sonuçları belirir.
- **Kritik Stoklar:** "Sistem, 40 satılan tosttan yola çıkarak 40 dilim kaşarın stoku erittiğini buldu ve stok kritik seviyeye indiği için kırmızı yandı."
- **Gizli Kayıp/Reçete Sapması:** "Sayım yaptık ve stoktan 45 dilim eksilmiş. Teorik olarak 40 eksilmeliydi. Sistem aradaki 5 dilimlik sapmayı 'Kayıp/Fire' olarak tespit etti ve TL bazında bize raporladı."

## 4. AI Katmanı: Copilot ile Veriyi Yorumlama (1 Dakika)
- Copilot sayfasına geç veya paneli aç.
- Hazır soruya tıkla: *"Satın alma önerim nedir ve neden?"*
- AI Cevabı (Local Gemma): *"ERP analizine göre Kaşar stoğunuz kritik seviyede. Satış hızınıza ve mevcut stok durumuna göre 5 paket Kaşar sipariş vermeniz önerilir."*
- Vurgu: "AI hesap yapmaz, halüsinasyon görmez. Sadece kesinleşmiş ERP verisini açıklar."

## 5. Aksiyon: n8n ile Tedarikçiye Sipariş (Opsiyonel) (30 Saniye)
- "Tedarikçiye Mesaj Gönder" butonuna bas.
- Sistemin n8n webhook'unu tetikleyip siparişi WhatsApp/Email otomasyonuna ilettiğini göster (veya JSON logu göster).

## 6. Kapanış
"StockPilot AI, küçük işletmeler için veriyi bilgiye, bilgiyi ise tedarik aksiyonuna dönüştürür. Teşekkürler."

---
## Demo Hazırlığı (Checklist)
1. Veritabanında (PostgreSQL) seed datası hazır olsun (kırmızı stok, sarı stok ve reçete sapması oluşturacak veriler).
2. Local Gemma açık olsun (`ollama run gemma3:4b`). Hızlı çalışmıyorsa fallback cevapları göster.
3. n8n workflow hazır veya en azından mock webhook çalışıyor olsun.
4. Çökmeye karşı masaüstünde 2 dakikalık video kaydınız hazır bulunsun.
