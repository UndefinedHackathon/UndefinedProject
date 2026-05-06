// [AI-Agent: Skills] Malzeme CRUD route'ları — coding-standards ve error-handling-patterns skill'lerine uygun.
// Sorumlu: Emre
// Endpoint'ler: GET /api/materials, POST /api/materials, PUT /api/materials/:id

// 1. Üçüncü parti
import { Router, Request, Response } from 'express';
import { z } from 'zod';

// 2. Proje dosyaları
import { query } from '../db/pool';
import { CreateMaterialSchema, UpdateMaterialSchema, IdParamSchema } from '../schemas/material.schema';
import type { IngredientRow } from '../types/stockpilot.types';

const router = Router();

// ─── GET /api/materials ─────────────────────────────────────
/**
 * Tüm malzemeleri listeler.
 * Stok durumu ile birlikte döner (inventory tablosundan JOIN).
 */
router.get('/', async (_req: Request, res: Response) => {
  try {
    const result = await query<IngredientRow>(
      `SELECT i.*, inv.current_stock, inv.physical_stock
       FROM ingredients i
       LEFT JOIN inventory inv ON i.id = inv.ingredient_id
       ORDER BY i.name ASC`
    );

    console.log(`📦 ${result.rows.length} malzeme listelendi`);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('❌ Malzeme listeleme hatası:', err);
    res.status(500).json({ success: false, error: 'Malzemeler yüklenirken hata oluştu' });
  }
});

// ─── POST /api/materials ────────────────────────────────────
/**
 * Yeni malzeme ekler.
 * Otomatik olarak inventory tablosuna da 0 stokla kayıt oluşturur.
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    // Zod validasyonu
    const validated = CreateMaterialSchema.parse(req.body);

    // Malzemeyi ekle
    const ingredientResult = await query<IngredientRow>(
      `INSERT INTO ingredients (name, unit, unit_cost, min_stock_level)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [validated.name, validated.unit, validated.unit_cost, validated.min_stock_level]
    );

    const newIngredient = ingredientResult.rows[0];

    // Otomatik inventory kaydı oluştur (0 stok)
    await query(
      `INSERT INTO inventory (ingredient_id, current_stock)
       VALUES ($1, 0)
       ON CONFLICT (ingredient_id) DO NOTHING`,
      [newIngredient.id]
    );

    console.log(`✅ Yeni malzeme eklendi: ${validated.name} (id: ${newIngredient.id})`);
    res.status(201).json({ success: true, data: newIngredient });
  } catch (err) {
    if (err instanceof z.ZodError) {
      const zodErr = err as any;
      console.warn('⚠️ Malzeme validasyon hatası:', zodErr.errors);
      res.status(400).json({
        success: false,
        error: 'Geçersiz veri',
        details: zodErr.errors.map((e: any) => ({ field: e.path.join('.'), message: e.message })),
      });
      return;
    }
    console.error('❌ Malzeme ekleme hatası:', err);
    res.status(500).json({ success: false, error: 'Malzeme eklenirken hata oluştu' });
  }
});

// ─── PUT /api/materials/:id ─────────────────────────────────
/**
 * Var olan malzemeyi günceller.
 * Sadece gönderilen alanlar güncellenir (partial update).
 */
router.put('/:id', async (req: Request, res: Response) => {
  try {
    // ID doğrulama
    const { id } = IdParamSchema.parse(req.params);

    // Body doğrulama
    const validated = UpdateMaterialSchema.parse(req.body);

    // Dinamik SET clause oluştur
    const updates: string[] = [];
    const values: (string | number)[] = [];
    let paramIndex = 1;

    if (validated.name !== undefined) {
      updates.push(`name = $${paramIndex++}`);
      values.push(validated.name);
    }
    if (validated.unit !== undefined) {
      updates.push(`unit = $${paramIndex++}`);
      values.push(validated.unit);
    }
    if (validated.unit_cost !== undefined) {
      updates.push(`unit_cost = $${paramIndex++}`);
      values.push(validated.unit_cost);
    }
    if (validated.min_stock_level !== undefined) {
      updates.push(`min_stock_level = $${paramIndex++}`);
      values.push(validated.min_stock_level);
    }

    // ID'yi son parametre olarak ekle
    values.push(id);

    const result = await query<IngredientRow>(
      `UPDATE ingredients SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      res.status(404).json({ success: false, error: 'Malzeme bulunamadı' });
      return;
    }

    console.log(`✅ Malzeme güncellendi: id=${id}`);
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    if (err instanceof z.ZodError) {
      const zodErr = err as any;
      console.warn('⚠️ Malzeme güncelleme validasyon hatası:', zodErr.errors);
      res.status(400).json({
        success: false,
        error: 'Geçersiz veri',
        details: zodErr.errors.map((e: any) => ({ field: e.path.join('.'), message: e.message })),
      });
      return;
    }
    console.error('❌ Malzeme güncelleme hatası:', err);
    res.status(500).json({ success: false, error: 'Malzeme güncellenirken hata oluştu' });
  }
});

export default router;
