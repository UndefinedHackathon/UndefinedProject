// [AI-Agent: Skills] Ortak tip tanımları — ROADMAP.md, stockpilot-ai-context ve coding-standards skill'lerine uygun.
// Sorumlu: Emre + Samet (merge conflict sonrası birleştirildi ve uyumlu hale getirildi)
// Bu dosya frontend ve backend'de BİREBİR AYNI olmalıdır.
// Son Güncelleme: 2026-05-06

// ═══════════════════════════════════════════════════════
// Temel Veri Modelleri
// ═══════════════════════════════════════════════════════

/** Ürün (Kafe menü ürünü) */
export interface Urun {
  id: number;
  name: string;
  price: number;
  category: string;
}

/** Malzeme (Ham madde / Envanter kalemi) */
export interface Malzeme {
  id: number;
  name: string;
  unit: string;        // kg, lt, adet, gr
  unitCost: number;    // Birim maliyet (TL)
  minStockLevel: number; // Kritik stok eşiği
}

/** Reçete Kalemi (Ürün-Malzeme ilişkisi) */
export interface ReceteKalemi {
  id: number;
  productId: number;
  ingredientId: number;
  quantityPerUnit: number;  // 1 ürün için gerekli miktar
}

/** Stok Kalemi (Mevcut envanter durumu) */
export interface StokKalemi {
  id: number;
  ingredientId: number;
  currentStock: number;
  physicalStock?: number;  // Fiziksel sayım (reçete sapması hesabı için, opsiyonel)
}

/** Günlük Satış Kaydı */
export interface GunlukSatis {
  id: number;
  productId: number;
  quantity: number;
  saleDate: string;   // YYYY-MM-DD
}

// ═══════════════════════════════════════════════════════
// ERP Motoru Arayüzleri
// ═══════════════════════════════════════════════════════

/** databaseService.getErpVerileri() çıktısı — ERP motoruna girdi */
export interface ErpGirdiVerileri {
  urunler: Urun[];
  malzemeler: Malzeme[];
  receteler: ReceteKalemi[];
  stoklar: StokKalemi[];
  gunlukSatislar: GunlukSatis[];
}

/** Ürün satış özeti (ERP motoru çıktısı) */
export interface UrunSatisOzeti {
  productId: number;
  productName: string;
  quantity: number;
  revenue: number;
  cost: number;
  profit: number;
}

/** Teorik malzeme tüketimi (ERP motoru çıktısı) */
export interface TeorikTuketim {
  ingredientId: number;
  ingredientName: string;
  unit: string;
  theoreticalUsage: number;   // Reçeteye göre kullanılması gereken miktar
  currentStock: number;
  remainingStock: number;
}

/** Kritik stok seviyesi — trafik ışığı sistemi */
export type StokSeviyesi = 'Kırmızı' | 'Sarı' | 'Yeşil';

/** Kritik stok uyarısı */
export interface KritikStok {
  ingredientId: number;
  ingredientName: string;
  currentStock: number;
  theoreticalUsage: number;
  remainingStock: number;
  minStockLevel: number;
  unit: string;
  level: StokSeviyesi;        // 'Kırmızı' = acil, 'Sarı' = dikkat
  message: string;
}

/** Satın alma önerisi */
export interface SatinAlmaOnerisi {
  ingredientId: number;
  ingredientName: string;
  unit: string;
  currentStock: number;
  requiredAmount: number;      // Eksik miktar
  suggestedOrder: number;      // Önerilen sipariş (eksik + güvenlik payı)
  estimatedCost: number;       // Tahmini maliyet (TL)
  priority?: StokSeviyesi;     // 'Kırmızı' = acil, 'Sarı' = yakında gerekli
}

/** Reçete sapması (fiziksel stok karşılaştırması) */
export interface ReceteSapmasi {
  ingredientId: number;
  ingredientName: string;
  unit: string;
  theoreticalRemaining: number;  // Teorik kalan stok
  actualRemaining: number;       // Fiziksel sayım sonucu
  deviation: number;             // Fark (fire/kayıp)
  deviationPercent: number;      // Yüzde sapma
  estimatedLoss: number;         // Tahmini kayıp (TL)
}

/** Tam analiz sonucu (ERP motoru çıktısı) */
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
  yoneticiyeOzet?: string;        // Gemma tarafından oluşturulan özet
  analizTarihi?: string;          // ISO tarih
  pisinmeSuresi?: number;         // Hesaplama süresi (ms)
}

// ═══════════════════════════════════════════════════════
// Gemma / Copilot Tipleri
// ═══════════════════════════════════════════════════════

/** Gemma servisine gönderilen istek */
export interface GemmaRequest {
  prompt: string;
  context?: string;
}

/** Gemma servisinden gelen yanıt */
export interface GemmaResponse {
  text: string;
  isFromFallback: boolean;
}

/** Copilot soru isteği */
export interface CopilotRequest {
  question: string;
  type: 'quick' | 'free';
}

/** Copilot mesaj tipi (chat geçmişi) */
export interface CopilotMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

/** Copilot yanıt */
export interface CopilotResponse {
  answer: string;
  source: 'gemma' | 'fallback';
  basedOnAnalysis: boolean;
}

/** Copilot soru-cevap (alternatif arayüz) */
export interface CopilotSoru {
  question: string;
  analysisContext?: AnalizSonucu;
}

export interface CopilotCevap {
  answer: string;
  isFromFallback: boolean;
  timestamp: string;
}

// ═══════════════════════════════════════════════════════
// n8n Webhook Arayüzü (Opsiyonel)
// ═══════════════════════════════════════════════════════

/** n8n tedarikçi mesaj isteği */
export interface N8nSupplierPayload {
  supplierName: string;
  message: string;
  items: Array<{
    ingredientName: string;
    amount: number;
    unit: string;
  }>;
}

// ═══════════════════════════════════════════════════════
// Dashboard Özet Tipi
// ═══════════════════════════════════════════════════════

/** Dashboard'da gösterilecek özet kartlar için tip */
export interface DashboardOzet {
  toplamUrunSayisi: number;
  toplamMalzemeSayisi: number;
  bugunSatilanAdet: number;
  bugunGelir: number;
  kritikStokSayisi: number;
  sonAnalizTarihi: string | null;
}

// ═══════════════════════════════════════════════════════
// API Response Formatı
// ═══════════════════════════════════════════════════════

/** Standart API başarılı yanıt */
export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data: T;
}

/** Standart API hata yanıtı */
export interface ApiErrorResponse {
  success: false;
  error: string;
  details?: Array<{ field: string; message: string }>;
}

/** Birleşik API yanıt tipi */
export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

// ═══════════════════════════════════════════════════════
// DB Row Tipleri (snake_case — PostgreSQL'den gelen ham veri)
// ═══════════════════════════════════════════════════════

export interface ProductRow {
  id: number;
  name: string;
  price: string;       // DECIMAL PostgreSQL'den string gelir
  category: string;
  created_at: Date;
}

export interface IngredientRow {
  id: number;
  name: string;
  unit: string;
  unit_cost: string;
  min_stock_level: string;
  created_at: Date;
}

export interface RecipeItemRow {
  id: number;
  product_id: number;
  ingredient_id: number;
  quantity_per_unit: string;
}

export interface InventoryRow {
  id: number;
  ingredient_id: number;
  current_stock: string;
  physical_stock: string | null;
  updated_at: Date;
}

export interface DailySaleRow {
  id: number;
  product_id: number;
  quantity: number;
  sale_date: string;
}

export interface AnalysisResultRow {
  id: number;
  date: string;
  result_data: AnalizSonucu;
  ai_summary: string | null;
  created_at: Date;
}
