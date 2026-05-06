---
name: error-handling-patterns
description: StockPilot AI'daki hata yönetimi ve fallback stratejileri. Gemma timeout, PostgreSQL hatası, validation hatası ve network hatalarının nasıl ele alınacağını tanımlar.
---

# Hata Yönetimi ve Fallback Stratejileri

## Neden Önemli?
Demo sırasında hiçbir şey crash etmemeli. Her hata güzelce yakalanmalı ve kullanıcıya anlaşılır mesaj gösterilmeli.

## Hata Katmanları

### 1. Zod Validation Hatası (400)
```typescript
// Route'da yakala, kullanıcıya açık hata döndür
if (err instanceof z.ZodError) {
  return res.status(400).json({
    success: false,
    error: 'Geçersiz veri',
    details: err.errors.map(e => ({
      field: e.path.join('.'),
      message: e.message,
    })),
  });
}
```

### 2. PostgreSQL Hatası (500)
```typescript
// DB bağlantı hatası varsa demo modda devam et
try {
  const result = await query(sql, params);
  return result.rows;
} catch (dbErr) {
  console.error('❌ PostgreSQL hatası:', dbErr);
  // Fallback: in-memory demo data döndür
  if (process.env.DEMO_MODE === 'true') {
    console.warn('⚠️ DB erişilemedi, demo veri kullanılıyor');
    return getDemoFallbackData();
  }
  throw dbErr;
}
```

### 3. Gemma/Ollama Timeout (AI Hatası)
```typescript
// Gemma 5 saniyeden uzun sürerse fallback cevap ver
const GEMMA_TIMEOUT = 5000;

async function callGemma(prompt: string): Promise<string> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), GEMMA_TIMEOUT);

    const response = await axios.post(
      `${GEMMA_BASE_URL}/api/generate`,
      { model: GEMMA_MODEL, prompt, stream: false },
      { signal: controller.signal }
    );

    clearTimeout(timeout);
    return response.data.response;
  } catch (err) {
    console.warn('⚠️ Gemma yanıt vermedi, fallback kullanılıyor');
    return generateFallbackSummary();
  }
}
```

### 4. Fallback Cevap Şablonları
```typescript
const FALLBACK_RESPONSES: Record<string, string> = {
  daily_summary:
    'Bugün {red_count} kritik, {yellow_count} dikkat gerektiren stok var. ' +
    'Toplam kayıp {loss_tl} TL. Detaylar için analiz sekmesine geçin.',
  copilot_answer:
    'Şu an AI asistan yanıt veremiyor. Analiz sonuçlarını dashboard\'dan inceleyebilirsiniz.',
  supplier_message:
    'Merhaba, aşağıdaki malzemeleri sipariş etmek istiyoruz:\n' +
    '{items_list}\nSaygılarımla.',
};
```

### 5. Firebase Auth Hatası
```typescript
// Auth çalışmazsa "Demo Admin" bypass butonu aktif olsun
const DEMO_USER = {
  uid: 'demo-admin-001',
  email: 'demo@stockpilot.ai',
  displayName: 'Demo Admin',
};

// middleware: token yoksa ve DEMO_MODE=true ise bypass
if (!token && process.env.DEMO_MODE === 'true') {
  req.user = DEMO_USER;
  return next();
}
```

## Frontend Hata Gösterimi
```tsx
// Toast notification sistemi kullan
// Kırmızı toast: hata, sarı: uyarı, mavi: bilgi

function showError(message: string) {
  toast.error(message, { duration: 5000 });
}

function showWarning(message: string) {
  toast.warning(message, { duration: 3000 });
}

// API çağrılarında global error handler
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 400) {
      showError('Geçersiz veri: ' + err.response.data.error);
    } else if (err.response?.status === 500) {
      showError('Sunucu hatası — Demo mod aktif edildi');
    } else {
      showError('Bağlantı hatası — İnternet bağlantınızı kontrol edin');
    }
    return Promise.reject(err);
  }
);
```

## Altın Kural
> Demo'da hiçbir ekranda "Unhandled Error" veya beyaz ekran olmamalı.
> Her zaman bir fallback cevap, bir uyarı mesajı veya demo modu hazır olsun.
