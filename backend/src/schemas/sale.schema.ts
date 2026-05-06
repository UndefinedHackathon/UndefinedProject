// [AI-Agent: Skills] Satış Zod validasyon şeması — zod-validation-schemas skill'ine uygun.
// Sorumlu: Emre

import { z } from 'zod';

/** Tarih formatı doğrulama (YYYY-MM-DD) */
const DateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Tarih formatı: YYYY-MM-DD');

/** Yeni satış kaydı ekleme şeması */
export const CreateSaleSchema = z.object({
  product_id: z.number().int().positive('Ürün ID pozitif tam sayı olmalı'),
  quantity: z.number().int().positive('Satış adedi pozitif tam sayı olmalı'),
  sale_date: DateSchema.optional().default(() => new Date().toISOString().split('T')[0]),
});

/** Toplu satış ekleme şeması (birden fazla ürün satışını tek seferde ekle) */
export const CreateBulkSaleSchema = z.object({
  sales: z.array(
    z.object({
      product_id: z.number().int().positive('Ürün ID pozitif tam sayı olmalı'),
      quantity: z.number().int().positive('Satış adedi pozitif tam sayı olmalı'),
    })
  ).min(1, 'En az 1 satış kaydı gerekli'),
  sale_date: DateSchema.optional().default(() => new Date().toISOString().split('T')[0]),
});

/** Tarih query parametresi doğrulama */
export const SaleDateQuerySchema = z.object({
  date: DateSchema.optional().default(() => new Date().toISOString().split('T')[0]),
});

export type CreateSaleInput = z.infer<typeof CreateSaleSchema>;
export type CreateBulkSaleInput = z.infer<typeof CreateBulkSaleSchema>;
