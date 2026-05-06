// [AI-Agent: Skills] Copilot Zod validasyon şeması — zod-validation-schemas ve stockpilot-copilot skill'lerine uygun.
// Sorumlu: Samet
// POST /api/copilot request body validasyonu.
// Son Güncelleme: 2026-05-06

import { z } from 'zod';

// ═══════════════════════════════════════════════════════
// Copilot Request Validasyon Şeması
// ═══════════════════════════════════════════════════════

/** Tarih formatı: YYYY-MM-DD */
const DateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Tarih formatı: YYYY-MM-DD');

/** Chat geçmişi mesaj şeması */
const ChatHistoryItemSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().min(1, 'Mesaj içeriği boş olamaz'),
});

/**
 * POST /api/copilot request body şeması.
 * - question: Kullanıcının sorusu (min 3, max 300 karakter)
 * - type: 'quick' (hazır soru butonu) veya 'free' (serbest soru)
 * - contextDate: Hangi günün analizi context olarak kullanılacak (opsiyonel, varsayılan bugün)
 * - chatHistory: Önceki mesajlar (opsiyonel)
 */
export const CopilotSchema = z.object({
  question: z.string()
    .min(3, 'Soru en az 3 karakter olmalı')
    .max(300, 'Soru en fazla 300 karakter olabilir'),
  type: z.enum(['quick', 'free']).optional().default('free'),
  contextDate: DateSchema.optional(),
  chatHistory: z.array(ChatHistoryItemSchema).optional().default([]),
});

/** Copilot request tipi (şemadan türetilen) */
export type CopilotInput = z.infer<typeof CopilotSchema>;
