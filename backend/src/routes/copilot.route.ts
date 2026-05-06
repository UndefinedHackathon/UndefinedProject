// [AI-Agent: Skills] Copilot route — stockpilot-copilot, zod-validation-schemas ve error-handling-patterns skill'lerine uygun.
// Sorumlu: Samet
// POST /api/copilot — Kullanıcının sorusunu son analiz verisiyle Gemma'ya gönderir.
// GET /api/copilot/questions — Hazır soru butonlarını döndürür.
// Son Güncelleme: 2026-05-06

import { Router, Request, Response } from 'express';
import { z } from 'zod';

// Proje dosyaları
import { CopilotSchema } from '../schemas/copilot.schema';
import { askCopilot, QUICK_QUESTIONS } from '../services/copilotService';

const router = Router();

// ═══════════════════════════════════════════════════════
// POST /api/copilot — Copilot Soru-Cevap
// ═══════════════════════════════════════════════════════

/**
 * Kullanıcının sorusunu analiz context'iyle birlikte Gemma'ya gönderir.
 *
 * Request body:
 * - question: string (min 3, max 300 karakter)
 * - type: 'quick' | 'free' (opsiyonel, varsayılan 'free')
 * - contextDate: string (YYYY-MM-DD, opsiyonel)
 * - chatHistory: array (opsiyonel)
 *
 * Response:
 * { success: true, data: { answer, isFromFallback, timestamp } }
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    // 1. Zod validasyonu
    const input = CopilotSchema.parse(req.body);

    // 2. Copilot servisine gönder
    const cevap = await askCopilot(input.question, input.type);

    // 3. Başarılı response
    res.json({
      success: true,
      data: {
        answer: cevap.answer,
        isFromFallback: cevap.isFromFallback,
        timestamp: cevap.timestamp,
        source: cevap.isFromFallback ? 'fallback' : 'gemma',
        basedOnAnalysis: true,
      },
    });
  } catch (err: unknown) {
    // Zod validasyon hatası
    if (err instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        error: 'Geçersiz veri',
        details: err.issues.map((e: any) => ({
          field: e.path.join('.'),
          message: e.message,
        })),
      });
      return;
    }

    // Genel hata
    const errorMessage = err instanceof Error ? err.message : 'Bilinmeyen hata';
    console.error('❌ Copilot hatası:', errorMessage);

    res.status(500).json({
      success: false,
      error: `Copilot yanıt veremedi: ${errorMessage}`,
    });
  }
});

// ═══════════════════════════════════════════════════════
// GET /api/copilot/questions — Hazır Soru Butonları
// ═══════════════════════════════════════════════════════

/**
 * Frontend'deki hazır soru butonlarını döndürür.
 * Taha bu endpoint'ten buton listesini alıp UI'da gösterecek.
 */
router.get('/questions', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: QUICK_QUESTIONS,
  });
});

export default router;
