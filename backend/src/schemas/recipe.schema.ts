// [AI-Agent: Skills] Reçete Zod validasyon şeması — zod-validation-schemas skill'ine uygun.
// Sorumlu: Emre

import { z } from 'zod';

/** Yeni reçete kalemi ekleme şeması (tekli ürün) */
export const CreateRecipeSchema = z.object({
  product_id: z.number().int().positive('Ürün ID pozitif tam sayı olmalı'),
  ingredient_id: z.number().int().positive('Malzeme ID pozitif tam sayı olmalı'),
  quantity_per_unit: z.number().positive('Birim miktar pozitif olmalı'),
});

/** Toplu reçete ekleme şeması — tek ürüne birden fazla malzeme */
export const CreateBulkRecipeSchema = z.object({
  product_id: z.number().int().positive('Ürün ID pozitif tam sayı olmalı'),
  items: z.array(
    z.object({
      ingredient_id: z.number().int().positive('Malzeme ID pozitif tam sayı olmalı'),
      quantity_per_unit: z.number().positive('Birim miktar pozitif olmalı'),
    })
  ).min(1, 'En az 1 reçete kalemi gerekli'),
});

/** Çoklu ürün reçete ekleme şeması — birden fazla ürüne aynı malzeme+miktar */
export const CreateMultiProductRecipeSchema = z.object({
  product_ids: z.array(
    z.number().int().positive('Ürün ID pozitif tam sayı olmalı')
  ).min(1, 'En az 1 ürün seçilmeli'),
  ingredient_id: z.number().int().positive('Malzeme ID pozitif tam sayı olmalı'),
  quantity_per_unit: z.number().positive('Birim miktar pozitif olmalı'),
});

/** URL parametresi id doğrulama */
export const IdParamSchema = z.object({
  id: z.string().regex(/^\d+$/, 'Geçersiz ID').transform(Number),
});

export type CreateRecipeInput = z.infer<typeof CreateRecipeSchema>;
export type CreateBulkRecipeInput = z.infer<typeof CreateBulkRecipeSchema>;
export type CreateMultiProductRecipeInput = z.infer<typeof CreateMultiProductRecipeSchema>;

