---
name: github-flow-standards
description: Hackathon kuralları gereği uyulması zorunlu olan Git/GitHub standartları. Dal isimleri, commit mesajları ve PR kurallarını içerir.
---

# GitHub Flow Standartları

## Hackathon Şartname Kuralları
Jüri değerlendirme formuna göre "Düzenli Çalışma" ve "Hata Denetimi" kriterlerinden tam puan almak için aşağıdaki standartlar zorunludur.

## 1. Branch (Dal) İsimlendirmeleri
- `main` dalına doğrudan commit (push) **kesinlikle yapılamaz**.
- Yeni özellikler için: `feat/görev-adi` (Örn: `feat/add-user-authentication`)
- Hata düzeltmeleri için: `fix/hata-adi` (Örn: `fix/dashboard-calculation-error`)

## 2. Commit Mesajları
Commit mesajları yapılan işlemi özetleyen, şimdiki zaman kipiyle ve İngilizce teknik ifadelerle yazılmalıdır:
- **Doğru:** `feat: add user authentication layer`
- **Doğru:** `fix: resolve calculation bug in ERP engine`
- **Yanlış:** `auth eklendi`, `bug fixed`, `updated`

## 3. Pull Request (PR) ve Code Review Süreci
- Her dal `main`'e bir Pull Request (PR) ile birleştirilmelidir (Merge işlemi).
- Her PR açıklamasına AI ajanlarının yaptığı katkı not edilmelidir (Bkz: Traceability kuralı).
- Kod birleştirilmeden önce mutlaka bir ekip arkadaşı (veya AI Code Reviewer) tarafından denetlenmiş (Review) olmalıdır.
