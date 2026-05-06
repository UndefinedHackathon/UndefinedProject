---
name: axios-api-integration
description: Frontend-backend API bağlantısı. Axios instance, interceptor'lar, auth token yönetimi, error handling ve API çağrı kalıpları.
---

# Axios API Entegrasyonu

## Ne Zaman Kullan
- Frontend'den backend'e API çağrısı yapılırken
- Auth token gönderirken
- Global error handling kurulurken
- Loading state yönetimi

## Axios Instance
```typescript
// src/lib/api.ts
import axios from 'axios';
import { auth } from './firebase';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000, // Gemma çağrıları yavaş olabilir
  headers: { 'Content-Type': 'application/json' },
});

// ─── Request Interceptor: Auth Token ────────────
api.interceptors.request.use(async (config) => {
  // Demo mode ise token ekleme
  const isDemoMode = localStorage.getItem('demo_mode') === 'true';
  if (isDemoMode) return config;

  try {
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch {
    console.warn('⚠️ Token alınamadı');
  }
  return config;
});

// ─── Response Interceptor: Error Handling ───────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.error || 'Bilinmeyen hata';

    if (status === 400) {
      console.warn('⚠️ Validation hatası:', message);
    } else if (status === 401) {
      console.error('❌ Yetkilendirme hatası — Tekrar giriş yapın');
      // İsteğe bağlı: logout ve login'e yönlendir
    } else if (status === 500) {
      console.error('❌ Sunucu hatası:', message);
    } else if (!error.response) {
      console.error('❌ Bağlantı hatası — Backend çalışıyor mu?');
    }

    return Promise.reject(error);
  }
);
```

## API Çağrı Kalıpları

### Dashboard
```typescript
// GET /api/dashboard
const res = await api.get('/dashboard', { params: { date: '2024-01-15' } });
const summary: DashboardSummary = res.data.data;
```

### Analiz
```typescript
// POST /api/analyze
const res = await api.post('/analyze', {
  date: '2024-01-15',
  include: ['critical_stock', 'profit_leak', 'recipe_deviation'],
});
const result: AnalysisResult = res.data.data;
```

### Copilot
```typescript
// POST /api/copilot
const res = await api.post('/copilot', {
  question: 'En büyük kâr kaybım nerede?',
  context_date: '2024-01-15',
});
const answer: string = res.data.data.answer;
```

### Demo Seed
```typescript
// GET /api/demo/seed
const res = await api.get('/demo/seed', { params: { scenario: 'high_loss' } });
// Seed sonrası dashboard'u yenile
```

### Tedarikçi Mesajı
```typescript
// POST /api/supplier-message
const res = await api.post('/supplier-message', {
  purchase_list: items,
  supplier_name: 'Ahmet Bey',
});
const message: string = res.data.data.message;
```

## Standart API Response Formatı
```typescript
// Her endpoint bu formatta döner
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  details?: any;
}
```

## Environment Variable
```env
# Frontend .env
VITE_API_URL=http://localhost:3001/api
```

## Timeout Ayarları
| Endpoint | Timeout |
|----------|---------|
| Dashboard, Seed | 5000ms |
| Analyze | 10000ms |
| Copilot, Supplier | 15000ms (Gemma bekleme) |

```typescript
// Endpoint bazlı timeout override
const copilotRes = await api.post('/copilot', payload, { timeout: 15000 });
```
