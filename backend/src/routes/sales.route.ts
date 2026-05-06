// [AI-Agent: Skills] Satış CRUD route'ları — coding-standards ve error-handling-patterns skill'lerine uygun.
// Sorumlu: Emre
// Endpoint'ler: GET /api/sales/today, POST /api/sales

// 1. Üçüncü parti
import { Router, Request, Response } from 'express';
import { z } from 'zod';

// 2. Proje dosyaları
import { query, getClient } from '../db/pool';
import { CreateSaleSchema, CreateBulkSaleSchema, SaleDateQuerySchema } from '../schemas/sale.schema';
import type { DailySaleRow } from '../types/stockpilot.types';

const router = Router();

// ─── Satış satırı için genişletilmiş tip (JOIN sonucu) ──────
interface SaleDetailRow extends DailySaleRow {
  product_name: string;
  product_price: string;
  revenue: string;
}

// ─── GET /api/sales/today ───────────────────────────────────
/**
 * Bugünkü (veya belirtilen tarihteki) satışları listeler.
 * Ürün adı, fiyat ve gelir bilgisi ile birlikte döner.
 * Opsiyonel: ?date=YYYY-MM-DD ile tarih filtreleme.
 */
router.get('/today', async (req: Request, res: Response) => {
  try {
    // Tarih parametresini doğrula (yoksa bugün)
    const { date } = SaleDateQuerySchema.parse(req.query);

    const result = await query<SaleDetailRow>(
      `SELECT ds.*,
              p.name  AS product_name,
              p.price AS product_price,
              (ds.quantity * p.price)::text AS revenue
       FROM daily_sales ds
       JOIN products p ON ds.product_id = p.id
       WHERE ds.sale_date = $1
       ORDER BY ds.id DESC`,
      [date]
    );

    // Toplam istatistikleri hesapla
    const totalQuantity = result.rows.reduce((sum, row) => sum + row.quantity, 0);
    const totalRevenue = result.rows.reduce((sum, row) => sum + parseFloat(row.revenue || '0'), 0);

    console.log(`📊 ${date} tarihli ${result.rows.length} satış kaydı listelendi (toplam: ${totalQuantity} adet, ${totalRevenue.toFixed(2)}₺)`);
    res.json({
      success: true,
      data: {
        date,
        sales: result.rows,
        summary: {
          totalItems: totalQuantity,
          totalRevenue: parseFloat(totalRevenue.toFixed(2)),
          uniqueProducts: result.rows.length,
        },
      },
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      const zodErr = err as any;
      console.warn('⚠️ Satış tarih parametresi hatası:', zodErr.errors);
      res.status(400).json({
        success: false,
        error: 'Geçersiz tarih formatı',
        details: zodErr.errors.map((e: any) => ({ field: e.path.join('.'), message: e.message })),
      });
      return;
    }
    console.error('❌ Satış listeleme hatası:', err);
    res.status(500).json({ success: false, error: 'Satışlar yüklenirken hata oluştu' });
  }
});

// ─── POST /api/sales ────────────────────────────────────────
/**
 * Yeni satış kaydı ekler.
 * İki mod destekler:
 * 1. Tekli: { product_id, quantity, sale_date? }
 * 2. Toplu: { sales: [{ product_id, quantity }, ...], sale_date? }
 *
 * UPSERT: Aynı ürün + tarih kombinasyonu varsa miktarı TOPLAR (+=).
 * Satış sonrası envanter otomatik olarak güncellenir (stok düşürme).
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    // Toplu satış mı kontrol et
    if (req.body.sales && Array.isArray(req.body.sales)) {
      // ─── Toplu Satış Ekleme ─────────────────────────────
      const validated = CreateBulkSaleSchema.parse(req.body);

      const client = await getClient();
      try {
        await client.query('BEGIN');

        const insertedRows: DailySaleRow[] = [];

        for (const sale of validated.sales) {
          const result = await client.query<DailySaleRow>(
            `INSERT INTO daily_sales (product_id, quantity, sale_date)
             VALUES ($1, $2, $3)
             ON CONFLICT (product_id, sale_date)
             DO UPDATE SET quantity = daily_sales.quantity + EXCLUDED.quantity
             RETURNING *`,
            [sale.product_id, sale.quantity, validated.sale_date]
          );
          insertedRows.push(result.rows[0]);

          // Envanter güncelle — reçeteye göre stok düş
          await client.query(
            `UPDATE inventory inv
             SET current_stock = inv.current_stock - (ri.quantity_per_unit * $1),
                 updated_at = NOW()
             FROM recipe_items ri
             WHERE ri.product_id = $2
               AND inv.ingredient_id = ri.ingredient_id`,
            [sale.quantity, sale.product_id]
          );
        }

        await client.query('COMMIT');

        console.log(`✅ ${insertedRows.length} satış kaydı eklendi (tarih: ${validated.sale_date})`);
        res.status(201).json({ success: true, data: insertedRows });
      } catch (innerErr) {
        await client.query('ROLLBACK');
        throw innerErr;
      } finally {
        client.release();
      }
    } else {
      // ─── Tekli Satış Ekleme ─────────────────────────────
      const validated = CreateSaleSchema.parse(req.body);

      const client = await getClient();
      try {
        await client.query('BEGIN');

        const result = await client.query<DailySaleRow>(
          `INSERT INTO daily_sales (product_id, quantity, sale_date)
           VALUES ($1, $2, $3)
           ON CONFLICT (product_id, sale_date)
           DO UPDATE SET quantity = daily_sales.quantity + EXCLUDED.quantity
           RETURNING *`,
          [validated.product_id, validated.quantity, validated.sale_date]
        );

        // Envanter güncelle — reçeteye göre stok düş
        await client.query(
          `UPDATE inventory inv
           SET current_stock = inv.current_stock - (ri.quantity_per_unit * $1),
               updated_at = NOW()
           FROM recipe_items ri
           WHERE ri.product_id = $2
             AND inv.ingredient_id = ri.ingredient_id`,
          [validated.quantity, validated.product_id]
        );

        await client.query('COMMIT');

        const newSale = result.rows[0];
        console.log(`✅ Satış kaydı eklendi: ürün=${validated.product_id}, adet=${validated.quantity}, tarih=${validated.sale_date}`);
        res.status(201).json({ success: true, data: newSale });
      } catch (innerErr) {
        await client.query('ROLLBACK');
        throw innerErr;
      } finally {
        client.release();
      }
    }
  } catch (err) {
    if (err instanceof z.ZodError) {
      const zodErr = err as any;
      console.warn('⚠️ Satış validasyon hatası:', zodErr.errors);
      res.status(400).json({
        success: false,
        error: 'Geçersiz veri',
        details: zodErr.errors.map((e: any) => ({ field: e.path.join('.'), message: e.message })),
      });
      return;
    }
    console.error('❌ Satış ekleme hatası:', err);
    res.status(500).json({ success: false, error: 'Satış eklenirken hata oluştu' });
  }
});

export default router;
