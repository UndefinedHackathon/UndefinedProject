// [AI-Agent: Plan] Ortak tip tanımları Plan Agent tarafından oluşturulmuştur.
// Manuel revizyon: Samet tarafından kontrol edilecek.

// ============================================================
// StockPilot AI — Ortak Tip Tanımları
// Bu dosya frontend ve backend'de BİREBİR AYNI olmalıdır.
// ============================================================

/** Ürün bilgisi (Menü kalemi) */
export interface Urun {
  id: number;
  name: string;
  price: number;
  category: string;
}

/** Ham madde / Malzeme bilgisi */
export interface Malzeme {
  id: number;
  name: string;
  unit: string;       // 'kg', 'lt', 'adet' vb.
  unitCost: number;   // Birim maliyet (TL)
  minStockLevel: number; // Kritik stok eşiği
}

/** Reçete kalemi — bir ürünün hangi malzemeden ne kadar kullandığı */
export interface ReceteKalemi {
  id: number;
  productId: number;
  ingredientId: number;
  quantityPerUnit: number; // Bir ürün başına kullanılan miktar (gram, ml, adet)
}

/** Anlık stok durumu */
export interface StokKalemi {
  id: number;
  ingredientId: number;
  currentStock: number; // Mevcut stok miktarı
}

/** Günlük satış kaydı */
export interface GunlukSatis {
  id: number;
  productId: number;
  quantity: number;
  saleDate: string; // 'YYYY-MM-DD' formatında
}

// ============================================================
// ERP Motoru Çıktı Tipleri
// ============================================================

/** Ürün bazlı satış özeti */
export interface UrunSatisOzeti {
  productId: number;
  productName: string;
  quantity: number;
  revenue: number; // adet × birim fiyat
}

/** Malzeme bazlı teorik tüketim */
export interface TeorikTuketim {
  ingredientId: number;
  ingredientName: string;
  unit: string;
  theoreticalUsage: number;  // Reçeteye göre kullanılması gereken miktar
  currentStock: number;      // Mevcut stok
  remainingStock: number;    // currentStock - theoreticalUsage
}

/** Kritik stok durumu — trafik ışığı sistemi */
export type StokSeviyesi = 'Kırmızı' | 'Sarı' | 'Yeşil';

export interface KritikStok {
  ingredientId: number;
  ingredientName: string;
  unit: string;
  currentStock: number;
  theoreticalUsage: number;
  remainingStock: number;
  minStockLevel: number;
  level: StokSeviyesi;     // 'Kırmızı' = bitmiş/acil, 'Sarı' = azalıyor
  message: string;         // Türkçe uyarı mesajı
}

/** Satın alma önerisi */
export interface SatinAlmaOnerisi {
  ingredientId: number;
  ingredientName: string;
  unit: string;
  currentStock: number;
  requiredAmount: number;    // Eksik miktar
  suggestedOrder: number;    // Önerilen sipariş (eksik + güvenlik payı)
  estimatedCost: number;     // Tahmini maliyet (TL)
  priority: StokSeviyesi;    // 'Kırmızı' = acil, 'Sarı' = yakında gerekli
}

/** Reçete sapması (opsiyonel — fiziksel stok sayımı girilmişse) */
export interface ReceteSapmasi {
  ingredientId: number;
  ingredientName: string;
  unit: string;
  theoreticalRemaining: number; // Teorik kalan stok
  actualRemaining: number;      // Fiziksel sayım sonucu
  deviation: number;            // Fark (fire/kayıp)
  deviationPercent: number;     // Yüzde sapma
  estimatedLoss: number;        // Tahmini kayıp (TL)
}

/** ERP Hesap Motoru Ana Çıktısı */
export interface AnalizSonucu {
  toplamSatisAdedi: number;
  toplamGelir: number;
  urunSatisOzeti: UrunSatisOzeti[];
  teorikTuketim: TeorikTuketim[];
  kritikStoklar: KritikStok[];
  satinAlmaOnerisi: SatinAlmaOnerisi[];
  receteSapmasi?: ReceteSapmasi[];
  tedarikciMesajTaslagi: string;
  analizTarihi: string;          // ISO date
  pisinmeSuresi: number;         // Hesaplama süresi (ms)
}

// ============================================================
// API Response Formatı
// ============================================================

/** Standart başarılı API yanıtı */
export interface ApiResponse<T> {
  success: true;
  data: T;
}

/** Standart hata API yanıtı */
export interface ApiErrorResponse {
  success: false;
  error: string;
  details?: Array<{ field: string; message: string }>;
}

// ============================================================
// Gemma / Copilot Tipleri
// ============================================================

/** Gemma servisine gönderilen istek */
export interface GemmaRequest {
  prompt: string;
  context?: string;
}

/** Gemma servisinden gelen yanıt */
export interface GemmaResponse {
  text: string;
  isFromFallback: boolean; // Fallback mekanizması mı kullanıldı?
}

/** Copilot soru-cevap */
export interface CopilotSoru {
  question: string;
  analysisContext?: AnalizSonucu;
}

export interface CopilotCevap {
  answer: string;
  isFromFallback: boolean;
  timestamp: string;
}
