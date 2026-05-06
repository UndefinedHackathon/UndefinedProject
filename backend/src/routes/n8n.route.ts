// [AI-Agent: Skills] n8n Webhook route — n8n-webhook-integration skill'ine uygun.
// Sorumlu: Samet
// POST /api/n8n/supplier-message — Tedarikçi mesajını webhook'a gönderir.
// Son Güncelleme: 2026-05-06

import { Router, Request, Response } from 'express';
import axios from 'axios';
import { z } from 'zod';

const router = Router();

const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || 'https://le7ox3ro.rcld.app/webhook-test/react-telegram-trigger';

/** Tedarikçi mesajı request validasyonu */
const SupplierMessageSchema = z.object({
  businessName: z.string().optional().default('StockPilot Cafe'),
  date: z.string().optional(),
  supplierMessage: z.string().min(1, 'Mesaj içeriği boş olamaz'),
  items: z.array(z.object({
    name: z.string(),
    amount: z.number(),
    unit: z.string()
  })).optional().default([]),
});

/**
 * POST /api/n8n/supplier-message
 * Tedarikçi sipariş mesajını n8n webhook'una gönderir.
 */
router.post('/supplier-message', async (req: Request, res: Response) => {
  try {
    const data = SupplierMessageSchema.parse(req.body);

    console.log('🔄 n8n webhook tetikleniyor...');

    // N8n sunucusuna POST isteği at
    await axios.post(N8N_WEBHOOK_URL, data, {
      timeout: 5000 // 5 saniye zaman aşımı
    });

    console.log('✅ n8n webhook başarıyla tetiklendi');
    res.json({
      success: true,
      data: { message: 'Sipariş listesi otomasyona gönderildi.' }
    });
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      const zodErr = err as any;
      res.status(400).json({
        success: false,
        error: 'Geçersiz veri',
        details: zodErr.errors.map((e: any) => ({ field: e.path.join('.'), message: e.message }))
      });
      return;
    }

    console.error('❌ n8n webhook hatası:', err instanceof Error ? err.message : 'Bilinmeyen hata');
    res.status(500).json({
      success: false,
      error: 'n8n servisine bağlanılamadı. Otomasyon devre dışı olabilir.'
    });
  }
});

export default router;
