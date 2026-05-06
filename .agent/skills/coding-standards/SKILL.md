---
name: coding-standards
description: StockPilot AI projesinin kod yazım kuralları. Her dosya oluştururken veya düzenlerken bu kurallara uy. TypeScript, Express, React ve PostgreSQL için standartlar.
---

# Kod Yazım Standartları

## Genel Kurallar
- Her dosya tek sorumluluk taşır (Single Responsibility)
- Türkçe yorum yaz — takım Türkçe konuşuyor
- Console.log yerine yapılandırılmış loglama kullan (emoji prefix)
- Her public fonksiyon JSDoc ile dokümante edilir
- Magic number kullanma — constant olarak tanımla

## TypeScript Kuralları
```typescript
// ✅ DOĞRU: Strict typing, interface kullan
interface AnalyzeParams {
  date: string;
  include: AnalysisType[];
}

// ❌ YANLIŞ: any kullanma
function analyze(params: any) { ... }

// ✅ DOĞRU: Return tipini belirt
async function getStocks(date: string): Promise<StockStatus[]> { ... }

// ✅ DOĞRU: Zod ile validasyon
const AnalyzeSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  include: z.array(z.enum(['critical_stock', 'profit_leak'])).optional(),
});
```

## Express Route Yapısı
```typescript
// Her route dosyası bu şablonu takip eder
import { Router, Request, Response } from 'express';
import { z } from 'zod';

const router = Router();

// Zod schema → validate → service çağır → response
router.post('/analyze', async (req: Request, res: Response) => {
  try {
    const validated = AnalyzeSchema.parse(req.body);
    const result = await calculationEngine.analyze(validated);
    res.json({ success: true, data: result });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ success: false, error: err.errors });
    } else {
      console.error('❌ Analiz hatası:', err);
      res.status(500).json({ success: false, error: 'Sunucu hatası' });
    }
  }
});

export default router;
```

## React Component Yapısı
```tsx
// Props interface → Component → Export
interface DashboardCardProps {
  title: string;
  value: number | string;
  color: 'green' | 'yellow' | 'red' | 'blue';
  icon: React.ReactNode;
}

export function DashboardCard({ title, value, color, icon }: DashboardCardProps) {
  return (
    <div className={`card card-${color}`}>
      {icon}
      <h3>{title}</h3>
      <p className="card-value">{value}</p>
    </div>
  );
}
```

## Dosya İsimlendirme
| Tür | Format | Örnek |
|-----|--------|-------|
| Route | `kebab-case.route.ts` | `analyze.route.ts` |
| Service | `camelCase.ts` | `calculationEngine.ts` |
| React Page | `PascalCase.tsx` | `ProfitLeakRadar.tsx` |
| React Component | `PascalCase.tsx` | `DashboardCard.tsx` |
| Store | `use + PascalCase.ts` | `useStore.ts` |
| Types | `camelCase.ts` | `stockpilot.ts` |

## Hata Mesajları
Her zaman Türkçe + emoji prefix:
```typescript
console.log('✅ PostgreSQL bağlantısı kuruldu');
console.log('🔍 Query [12ms] SELECT...');
console.error('❌ Analiz hatası:', err.message);
console.warn('⚠️ Gemma yanıt vermedi, fallback kullanılıyor');
console.log('🌱 Demo verisi yüklendi: 6 ürün, 10 malzeme');
```

## Import Sırası
```typescript
// 1. Node.js built-in
import path from 'path';
// 2. Üçüncü parti
import express from 'express';
import { z } from 'zod';
// 3. Proje dosyaları
import { pool } from '../db/pool';
import { StockStatus } from '../types/stockpilot';
```
