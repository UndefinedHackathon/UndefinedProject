// [AI-Agent: Skills] StockPilot AI frontend tip tanımları — Backend stockpilot.types.ts ile senkronize
// Hem CRUD formları hem de ERP analiz sonuçları için gerekli tipler.

// ═══════════════════════════════════════════════════════
// CRUD Form Tipleri (Sayfalar tarafından kullanılır)
// ═══════════════════════════════════════════════════════

// ─── Malzeme (Ingredient) ────────────────────────────
export interface Ingredient {
  id: number;
  name: string;
  unit: string; // kg, lt, adet, gr
  unit_cost: number;
  min_stock_level: number;
  current_stock?: number;
  physical_stock?: string | null;
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
  product_price?: string;
  revenue?: string;
  quantity: number;
  sale_date: string;
}

export interface DailySaleFormData {
  product_id: number;
  quantity: number;
  sale_date: string;
}

// ═══════════════════════════════════════════════════════
// ERP Analiz Sonucu Tipleri (Dashboard tarafından kullanılır)
// Backend stockpilot.types.ts ile BİREBİR eşleşir.
// ═══════════════════════════════════════════════════════

/** Stok seviye göstergesi — trafik ışığı */
export type StokSeviyesi = 'Kırmızı' | 'Sarı' | 'Yeşil';

/** Ürün satış özeti */
export interface UrunSatisOzeti {
  productId: number;
  productName: string;
  quantity: number;
  revenue: number;
  cost: number;
  profit: number;
}

/** Teorik malzeme tüketimi */
export interface TeorikTuketim {
  ingredientId: number;
  ingredientName: string;
  unit: string;
  theoreticalUsage: number;
  currentStock: number;
  remainingStock: number;
}

/** Kritik stok uyarısı */
export interface KritikStok {
  ingredientId: number;
  ingredientName: string;
  currentStock: number;
  theoreticalUsage: number;
  remainingStock: number;
  minStockLevel: number;
  unit: string;
  level: StokSeviyesi;
  message: string;
}

/** Satın alma önerisi */
export interface SatinAlmaOnerisi {
  ingredientId: number;
  ingredientName: string;
  unit: string;
  currentStock: number;
  requiredAmount: number;
  suggestedOrder: number;
  estimatedCost: number;
  priority?: StokSeviyesi;
}

/** Reçete sapması */
export interface ReceteSapmasi {
  ingredientId: number;
  ingredientName: string;
  unit: string;
  theoreticalRemaining: number;
  actualRemaining: number;
  deviation: number;
  deviationPercent: number;
  estimatedLoss: number;
}

/** Tam ERP analiz sonucu — backend AnalizSonucu ile birebir */
export interface AnalizSonucu {
  toplamSatisAdedi: number;
  toplamGelir: number;
  toplamMaliyet: number;
  toplamKar: number;
  urunSatisOzeti: UrunSatisOzeti[];
  teorikTuketim: TeorikTuketim[];
  kritikStoklar: KritikStok[];
  satinAlmaOnerisi: SatinAlmaOnerisi[];
  receteSapmasi?: ReceteSapmasi[];
  tedarikciMesajTaslagi: string;
  yoneticiyeOzet?: string;
  analizTarihi?: string;
  pisinmeSuresi?: number;
}

// ─── API Response ────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

// ─── Copilot Tipleri ─────────────────────────────────
export interface CopilotQuestion {
  id: string;
  text: string;
  icon?: string;
}

export interface CopilotResponse {
  answer: string;
  isFromFallback: boolean;
  timestamp: string;
  source: 'gemma' | 'fallback';
  basedOnAnalysis: boolean;
}
