---
name: zod-validation-schemas
description: Backend API request validasyonu için Zod şemaları. Tüm endpoint input validasyonu ve reusable schema kalıpları.
---

# Zod Validation Şemaları

## Ne Zaman Kullan
- Her backend route'unda req.body veya req.query validasyonu
- Yeni endpoint oluştururken

## Ortak Şemalar
```typescript
// src/schemas/common.ts
import { z } from 'zod';

export const DateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Tarih: YYYY-MM-DD');
export const PositiveNumber = z.number().positive('Pozitif sayı olmalı');
export const IdSchema = z.number().int().positive();
```

## Endpoint Şemaları

### POST /api/analyze
```typescript
export const AnalyzeSchema = z.object({
  date: DateSchema.optional().default(() => new Date().toISOString().split('T')[0]),
  include: z.array(
    z.enum(['critical_stock', 'profit_leak', 'recipe_deviation', 'waste_cost', 'purchase_plan'])
  ).optional(),
});
```

### POST /api/copilot
```typescript
export const CopilotSchema = z.object({
  question: z.string().min(3).max(300),
  context_date: DateSchema.optional(),
  chat_history: z.array(z.object({
    role: z.enum(['user', 'ai']),
    content: z.string(),
  })).optional().default([]),
});
```

### POST /api/supplier-message
```typescript
export const SupplierMessageSchema = z.object({
  purchase_list: z.array(z.object({
    ingredient_name: z.string().min(1),
    quantity: PositiveNumber,
    unit: z.string().min(1),
  })).min(1, 'En az 1 malzeme seçin'),
  supplier_name: z.string().optional().default('Sayın Tedarikçi'),
});
```

### GET /api/demo/seed
```typescript
export const SeedSchema = z.object({
  scenario: z.enum(['normal', 'high_loss', 'critical']).optional().default('high_loss'),
});
```

### Ürün ve Reçete
```typescript
export const ProductSchema = z.object({
  name: z.string().min(2).max(100),
  price: z.number().positive(),
  category: z.enum(['yemek', 'içecek', 'tatlı', 'genel']).optional().default('genel'),
});

export const RecipeItemSchema = z.object({
  product_id: IdSchema,
  ingredient_id: IdSchema,
  quantity_per_unit: z.number().positive(),
});
```

## Route'da Kullanım
```typescript
router.post('/analyze', async (req, res) => {
  try {
    const input = AnalyzeSchema.parse(req.body);
    const result = await calculationEngine.analyze(input);
    res.json({ success: true, data: result });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Geçersiz veri',
        details: err.errors.map(e => ({ field: e.path.join('.'), message: e.message })),
      });
    }
    res.status(500).json({ success: false, error: 'Sunucu hatası' });
  }
});
```
