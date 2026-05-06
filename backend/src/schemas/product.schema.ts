// [AI-Agent: Skills] Ürün Zod validasyon şeması — zod-validation-schemas skill'ine uygun.
// Sorumlu: Emre

import { z } from 'zod';

/** Geçerli ürün kategorileri */
const VALID_CATEGORIES = ['İçecek', 'Yiyecek', 'Tatlı', 'genel'] as const;

/** Yeni ürün ekleme şeması */
export const CreateProductSchema = z.object({
  name: z.string().min(2, 'Ürün adı en az 2 karakter olmalı').max(100),
  price: z.number().positive('Fiyat pozitif olmalı'),
  category: z.enum(VALID_CATEGORIES).default('genel'),
});

/** Ürün güncelleme şeması (tüm alanlar opsiyonel) */
export const UpdateProductSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  price: z.number().positive().optional(),
  category: z.enum(VALID_CATEGORIES).optional(),
}).refine((data) => Object.keys(data).length > 0, {
  message: 'En az bir alan güncellenmeli',
});

/** URL parametresi id doğrulama */
export const IdParamSchema = z.object({
  id: z.string().regex(/^\d+$/, 'Geçersiz ID').transform(Number),
});

export type CreateProductInput = z.infer<typeof CreateProductSchema>;
export type UpdateProductInput = z.infer<typeof UpdateProductSchema>;
