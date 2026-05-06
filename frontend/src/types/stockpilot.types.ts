// [AI-Agent: Skills] StockPilot AI frontend tip tanımları — PostgreSQL şeması ile senkronize

// ─── Malzeme (Ingredient) ────────────────────────────
export interface Ingredient {
  id: number;
  name: string;
  unit: string; // kg, lt, adet, gr
  unit_cost: number;
  min_stock_level: number;
  created_at?: string;
}

export interface IngredientFormData {
  name: string;
  unit: string;
  unit_cost: number;
  min_stock_level: number;
}

// ─── Ürün (Product) ──────────────────────────────────
export interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  created_at?: string;
  recipe?: RecipeItem[];
}

export interface ProductFormData {
  name: string;
  price: number;
  category: string;
}

// ─── Reçete Kalemi (Recipe Item) ─────────────────────
export interface RecipeItem {
  id: number;
  product_id: number;
  ingredient_id: number;
  ingredient_name?: string;
  quantity_per_unit: number;
  unit?: string;
  unit_cost?: number;
}

// ─── Envanter (Inventory / Stok Durumu) ──────────────
export interface InventoryItem {
  id: number;
  ingredient_id: number;
  ingredient_name?: string;
  current_stock: number;
  unit?: string;
  updated_at?: string;
}

// ─── Günlük Satış ────────────────────────────────────
export interface DailySale {
  id: number;
  product_id: number;
  product_name?: string;
  quantity: number;
  sale_date: string;
}

export interface DailySaleFormData {
  product_id: number;
  quantity: number;
  sale_date: string;
}

// ─── API Response ────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}
