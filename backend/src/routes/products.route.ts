// [AI-Agent: Skills] Ürün CRUD route'ları — coding-standards ve error-handling-patterns skill'lerine uygun.
// Sorumlu: Emre
// Endpoint'ler: GET /api/products, POST /api/products, PUT /api/products/:id, DELETE /api/products/:id

// 1. Üçüncü parti
import { Router, Request, Response } from 'express';
import { z } from 'zod';

// 2. Proje dosyaları
import { query } from '../db/pool';
import { CreateProductSchema, UpdateProductSchema, IdParamSchema } from '../schemas/product.schema';
import type { ProductRow } from '../types/stockpilot.types';

const router = Router();

// ─── GET /api/products ──────────────────────────────────────
/**
 * Tüm ürünleri listeler.
 * Reçete kalemi sayısı ile birlikte döner.
 */
router.get('/', async (_req: Request, res: Response) => {
  try {
    const result = await query<ProductRow & { recipe_count: string }>(
      `SELECT p.*, COUNT(ri.id)::text AS recipe_count
       FROM products p
       LEFT JOIN recipe_items ri ON p.id = ri.product_id
       GROUP BY p.id
       ORDER BY p.name ASC`
    );

    console.log(`📦 ${result.rows.length} ürün listelendi`);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('❌ Ürün listeleme hatası:', err);
    res.status(500).json({ success: false, error: 'Ürünler yüklenirken hata oluştu' });
  }
});

// ─── POST /api/products ─────────────────────────────────────
/**
 * Yeni ürün ekler.
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    // Zod validasyonu
    const validated = CreateProductSchema.parse(req.body);

    const result = await query<ProductRow>(
      `INSERT INTO products (name, price, category)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [validated.name, validated.price, validated.category]
    );

    const newProduct = result.rows[0];
    console.log(`✅ Yeni ürün eklendi: ${validated.name} — ${validated.price}₺ (id: ${newProduct.id})`);
    res.status(201).json({ success: true, data: newProduct });
  } catch (err) {
    if (err instanceof z.ZodError) {
      const zodErr = err as any;
      console.warn('⚠️ Ürün validasyon hatası:', zodErr.errors);
      res.status(400).json({
        success: false,
        error: 'Geçersiz veri',
        details: zodErr.errors.map((e: any) => ({ field: e.path.join('.'), message: e.message })),
      });
      return;
    }
    console.error('❌ Ürün ekleme hatası:', err);
    res.status(500).json({ success: false, error: 'Ürün eklenirken hata oluştu' });
  }
});

// ─── PUT /api/products/:id ──────────────────────────────────
/**
 * Var olan ürünü günceller.
 * Sadece gönderilen alanlar güncellenir (partial update).
 */
router.put('/:id', async (req: Request, res: Response) => {
  try {
    // ID doğrulama
    const { id } = IdParamSchema.parse(req.params);

    // Body doğrulama
    const validated = UpdateProductSchema.parse(req.body);

    // Dinamik SET clause oluştur
    const updates: string[] = [];
    const values: (string | number)[] = [];
    let paramIndex = 1;

    if (validated.name !== undefined) {
      updates.push(`name = $${paramIndex++}`);
      values.push(validated.name);
    }
    if (validated.price !== undefined) {
      updates.push(`price = $${paramIndex++}`);
      values.push(validated.price);
    }
    if (validated.category !== undefined) {
      updates.push(`category = $${paramIndex++}`);
      values.push(validated.category);
    }

    // ID'yi son parametre olarak ekle
    values.push(id);

    const result = await query<ProductRow>(
      `UPDATE products SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      res.status(404).json({ success: false, error: 'Ürün bulunamadı' });
      return;
    }

    console.log(`✅ Ürün güncellendi: id=${id}`);
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    if (err instanceof z.ZodError) {
      const zodErr = err as any;
      console.warn('⚠️ Ürün güncelleme validasyon hatası:', zodErr.errors);
      res.status(400).json({
        success: false,
        error: 'Geçersiz veri',
        details: zodErr.errors.map((e: any) => ({ field: e.path.join('.'), message: e.message })),
      });
      return;
    }
    console.error('❌ Ürün güncelleme hatası:', err);
    res.status(500).json({ success: false, error: 'Ürün güncellenirken hata oluştu' });
  }
});

// ─── DELETE /api/products/:id ───────────────────────────────
/**
 * Ürünü siler.
 * CASCADE: İlişkili reçete kalemleri ve satışlar da silinir.
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    // ID doğrulama
    const { id } = IdParamSchema.parse(req.params);

    const result = await query<ProductRow>(
      `DELETE FROM products WHERE id = $1 RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ success: false, error: 'Ürün bulunamadı' });
      return;
    }

    console.log(`🗑️ Ürün silindi: ${result.rows[0].name} (id: ${id})`);
    res.json({ success: true, data: { deleted: result.rows[0] } });
  } catch (err) {
    if (err instanceof z.ZodError) {
      const zodErr = err as any;
      console.warn('⚠️ Geçersiz ID:', zodErr.errors);
      res.status(400).json({
        success: false,
        error: 'Geçersiz ID',
        details: zodErr.errors.map((e: any) => ({ field: e.path.join('.'), message: e.message })),
      });
      return;
    }
    console.error('❌ Ürün silme hatası:', err);
    res.status(500).json({ success: false, error: 'Ürün silinirken hata oluştu' });
  }
});

export default router;
