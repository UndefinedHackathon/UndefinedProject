// [AI-Agent: Skills] Malzeme Zod validasyon şeması — zod-validation-schemas skill'ine uygun.
// Sorumlu: Emre

import { z } from 'zod';

/** Yeni malzeme ekleme şeması */
export const CreateMaterialSchema = z.object({
  name: z.string().min(2, 'Malzeme adı en az 2 karakter olmalı').max(100),
  unit: z.string().min(1, 'Birim zorunlu').max(20),          // kg, lt, adet, gr
  unit_cost: z.number().positive('Birim maliyet pozitif olmalı'),
  min_stock_level: z.number().min(0, 'Kritik stok eşiği negatif olamaz').default(0),
});

/** Malzeme güncelleme şeması (tüm alanlar opsiyonel) */
export const UpdateMaterialSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  unit: z.string().min(1).max(20).optional(),
  unit_cost: z.number().positive().optional(),
  min_stock_level: z.number().min(0).optional(),
}).refine((data) => Object.keys(data).length > 0, {
  message: 'En az bir alan güncellenmeli',
});

/** URL parametresi id doğrulama */
export const IdParamSchema = z.object({
  id: z.string().regex(/^\d+$/, 'Geçersiz ID').transform(Number),
});

export type CreateMaterialInput = z.infer<typeof CreateMaterialSchema>;
export type UpdateMaterialInput = z.infer<typeof UpdateMaterialSchema>;
