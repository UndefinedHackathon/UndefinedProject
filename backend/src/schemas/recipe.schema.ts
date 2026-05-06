// [AI-Agent: Skills] Reçete Zod validasyon şeması — zod-validation-schemas skill'ine uygun.
// Sorumlu: Emre

import { z } from 'zod';

/** Yeni reçete kalemi ekleme şeması */
export const CreateRecipeSchema = z.object({
  product_id: z.number().int().positive('Ürün ID pozitif tam sayı olmalı'),
  ingredient_id: z.number().int().positive('Malzeme ID pozitif tam sayı olmalı'),
  quantity_per_unit: z.number().positive('Birim miktar pozitif olmalı'),
});

/** Toplu reçete ekleme şeması (birden fazla kalemi tek seferde ekle) */
export const CreateBulkRecipeSchema = z.object({
  product_id: z.number().int().positive('Ürün ID pozitif tam sayı olmalı'),
  items: z.array(
    z.object({
      ingredient_id: z.number().int().positive('Malzeme ID pozitif tam sayı olmalı'),
      quantity_per_unit: z.number().positive('Birim miktar pozitif olmalı'),
    })
  ).min(1, 'En az 1 reçete kalemi gerekli'),
});

/** URL parametresi id doğrulama */
export const IdParamSchema = z.object({
  id: z.string().regex(/^\d+$/, 'Geçersiz ID').transform(Number),
});

export type CreateRecipeInput = z.infer<typeof CreateRecipeSchema>;
export type CreateBulkRecipeInput = z.infer<typeof CreateBulkRecipeSchema>;
