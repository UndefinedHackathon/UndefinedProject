// [AI-Agent: Skills] Reçete CRUD route'ları — coding-standards ve error-handling-patterns skill'lerine uygun.
// Sorumlu: Emre
// Endpoint'ler: GET /api/recipes, POST /api/recipes, DELETE /api/recipes/:id

// 1. Üçüncü parti
import { Router, Request, Response } from 'express';
import { z } from 'zod';

// 2. Proje dosyaları
import { query, getClient } from '../db/pool';
import { CreateRecipeSchema, CreateBulkRecipeSchema, CreateMultiProductRecipeSchema, IdParamSchema } from '../schemas/recipe.schema';
import type { RecipeItemRow } from '../types/stockpilot.types';

const router = Router();

// ─── Reçete satırı için genişletilmiş tip (JOIN sonucu) ─────
interface RecipeDetailRow extends RecipeItemRow {
  product_name: string;
  ingredient_name: string;
  ingredient_unit: string;
}

// ─── GET /api/recipes ───────────────────────────────────────
/**
 * Tüm reçete kalemlerini listeler.
 * Ürün adı ve malzeme adı ile birlikte döner.
 * Opsiyonel: ?product_id=X ile ürüne göre filtreleme.
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const productIdParam = req.query.product_id;

    let sql = `
      SELECT ri.*,
             p.name  AS product_name,
             i.name  AS ingredient_name,
             i.unit  AS ingredient_unit
      FROM recipe_items ri
      JOIN products    p ON ri.product_id    = p.id
      JOIN ingredients i ON ri.ingredient_id = i.id
    `;
    const params: number[] = [];

    // Ürüne göre filtreleme (opsiyonel)
    if (productIdParam) {
      const productId = Number(productIdParam);
      if (isNaN(productId) || productId <= 0) {
        res.status(400).json({ success: false, error: 'Geçersiz product_id parametresi' });
        return;
      }
      sql += ` WHERE ri.product_id = $1`;
      params.push(productId);
    }

    sql += ` ORDER BY p.name ASC, i.name ASC`;

    const result = await query<RecipeDetailRow>(sql, params);

    console.log(`📋 ${result.rows.length} reçete kalemi listelendi`);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('❌ Reçete listeleme hatası:', err);
    res.status(500).json({ success: false, error: 'Reçeteler yüklenirken hata oluştu' });
  }
});

// ─── POST /api/recipes ──────────────────────────────────────
/**
 * Yeni reçete kalemi ekler.
 * Üç mod destekler:
 * 1. Çoklu ürün: { product_ids: [...], ingredient_id, quantity_per_unit }
 * 2. Toplu malzeme: { product_id, items: [{ ingredient_id, quantity_per_unit }, ...] }
 * 3. Tekli: { product_id, ingredient_id, quantity_per_unit }
 */
// [AI-Agent: Skills] Çoklu ürün reçete desteği — product-recipe-management skill'ine uygun.
router.post('/', async (req: Request, res: Response) => {
  try {
    // ─── Mod 1: Çoklu Ürün Ekleme (product_ids) ────────────
    if (req.body.product_ids && Array.isArray(req.body.product_ids)) {
      const validated = CreateMultiProductRecipeSchema.parse(req.body);

      const client = await getClient();
      try {
        await client.query('BEGIN');

        const insertedRows: RecipeItemRow[] = [];

        for (const pid of validated.product_ids) {
          const result = await client.query<RecipeItemRow>(
            `INSERT INTO recipe_items (product_id, ingredient_id, quantity_per_unit)
             VALUES ($1, $2, $3)
             ON CONFLICT (product_id, ingredient_id)
             DO UPDATE SET quantity_per_unit = EXCLUDED.quantity_per_unit
             RETURNING *`,
            [pid, validated.ingredient_id, validated.quantity_per_unit]
          );
          insertedRows.push(result.rows[0]);
        }

        await client.query('COMMIT');

        console.log(`✅ ${insertedRows.length} ürüne reçete kalemi eklendi (malzeme id: ${validated.ingredient_id})`);
        res.status(201).json({ success: true, data: insertedRows });
      } catch (innerErr) {
        await client.query('ROLLBACK');
        throw innerErr;
      } finally {
        client.release();
      }
    }
    // ─── Mod 2: Toplu Malzeme Ekleme (items array) ────────────
    else if (req.body.items && Array.isArray(req.body.items)) {
      const validated = CreateBulkRecipeSchema.parse(req.body);

      const client = await getClient();
      try {
        await client.query('BEGIN');

        const insertedRows: RecipeItemRow[] = [];

        for (const item of validated.items) {
          const result = await client.query<RecipeItemRow>(
            `INSERT INTO recipe_items (product_id, ingredient_id, quantity_per_unit)
             VALUES ($1, $2, $3)
             ON CONFLICT (product_id, ingredient_id)
             DO UPDATE SET quantity_per_unit = EXCLUDED.quantity_per_unit
             RETURNING *`,
            [validated.product_id, item.ingredient_id, item.quantity_per_unit]
          );
          insertedRows.push(result.rows[0]);
        }

        await client.query('COMMIT');

        console.log(`✅ ${insertedRows.length} reçete kalemi eklendi/güncellendi (ürün id: ${validated.product_id})`);
        res.status(201).json({ success: true, data: insertedRows });
      } catch (innerErr) {
        await client.query('ROLLBACK');
        throw innerErr;
      } finally {
        client.release();
      }
    }
    // ─── Mod 3: Tekli Reçete Ekleme ────────────────────────
    else {
      const validated = CreateRecipeSchema.parse(req.body);

      const result = await query<RecipeItemRow>(
        `INSERT INTO recipe_items (product_id, ingredient_id, quantity_per_unit)
         VALUES ($1, $2, $3)
         ON CONFLICT (product_id, ingredient_id)
         DO UPDATE SET quantity_per_unit = EXCLUDED.quantity_per_unit
         RETURNING *`,
        [validated.product_id, validated.ingredient_id, validated.quantity_per_unit]
      );

      const newItem = result.rows[0];
      console.log(`✅ Reçete kalemi eklendi: ürün=${validated.product_id}, malzeme=${validated.ingredient_id}, miktar=${validated.quantity_per_unit}`);
      res.status(201).json({ success: true, data: newItem });
    }
  } catch (err) {
    if (err instanceof z.ZodError) {
      const zodErr = err as any;
      console.warn('⚠️ Reçete validasyon hatası:', zodErr.errors);
      res.status(400).json({
        success: false,
        error: 'Geçersiz veri',
        details: zodErr.errors.map((e: any) => ({ field: e.path.join('.'), message: e.message })),
      });
      return;
    }
    console.error('❌ Reçete ekleme hatası:', err);
    res.status(500).json({ success: false, error: 'Reçete eklenirken hata oluştu' });
  }
});

// ─── DELETE /api/recipes/:id ────────────────────────────────
/**
 * Reçete kalemini siler.
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    // ID doğrulama
    const { id } = IdParamSchema.parse(req.params);

    const result = await query<RecipeItemRow>(
      `DELETE FROM recipe_items WHERE id = $1 RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ success: false, error: 'Reçete kalemi bulunamadı' });
      return;
    }

    console.log(`🗑️ Reçete kalemi silindi: id=${id}`);
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
    console.error('❌ Reçete silme hatası:', err);
    res.status(500).json({ success: false, error: 'Reçete silinirken hata oluştu' });
  }
});

export default router;
