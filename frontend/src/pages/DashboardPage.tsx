// [AI-Agent: Skills] Dashboard sayfası — Backend analiz sonucu + mock data fallback ile tam entegrasyon
// POST /api/analyze → analiz çalıştır, GET /api/analyze/latest → son sonucu çek
import { useEffect, useMemo } from 'react';
import { CalendarDays, RefreshCw, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useStore } from '@/store/stockPilotStore';

// Dashboard bileşenleri
import { StatCards } from '@/components/dashboard/StatCards';
import { CriticalStockCards } from '@/components/dashboard/CriticalStockCards';
import { ProfitLeakCards } from '@/components/dashboard/ProfitLeakCards';
import { PurchaseRecommendations } from '@/components/dashboard/PurchaseRecommendations';
import { SalesTrendChart } from '@/components/dashboard/SalesTrendChart';
import { StockDistributionChart } from '@/components/dashboard/StockDistributionChart';
import { ProfitLeakChart } from '@/components/dashboard/ProfitLeakChart';

// Mock data — backend verisi yoksa fallback olarak kullanılır
import {
  MOCK_STATS,
  MOCK_SALES_TREND,
  MOCK_CRITICAL_STOCKS,
  MOCK_PROFIT_LEAK,
  MOCK_STOCK_DISTRIBUTION,
  MOCK_PURCHASE_SUGGESTIONS,
} from '@/data/mockDashboard';

export default function DashboardPage() {
  const { analysisResult, isAnalyzing, isLoadingAnalysis, runAnalysis, fetchLatestAnalysis } = useStore();

  const today = new Date().toLocaleDateString('tr-TR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Sayfa yüklendiğinde son analiz sonucunu çek
  useEffect(() => {
    fetchLatestAnalysis();
  }, [fetchLatestAnalysis]);

  // Backend verisini dashboard bileşenlerine dönüştür
  const hasBackendData = analysisResult !== null;

  const stats = useMemo(() => {
    if (!analysisResult) return MOCK_STATS;
    return {
      totalSales: analysisResult.toplamSatisAdedi,
      totalRevenue: analysisResult.toplamGelir,
      totalProducts: analysisResult.urunSatisOzeti.length,
      totalIngredients: analysisResult.teorikTuketim.length,
    };
  }, [analysisResult]);

  // Kritik stokları trafik ışığı formatına dönüştür
  const criticalStocks = useMemo(() => {
    if (!analysisResult) return MOCK_CRITICAL_STOCKS;
    return analysisResult.kritikStoklar.map((k, idx) => ({
      id: k.ingredientId || idx + 1,
      name: k.ingredientName,
      current: k.currentStock,
      min: k.minStockLevel,
      unit: k.unit,
      status: (k.level === 'Kırmızı' ? 'red' : 'yellow') as 'red' | 'yellow',
    }));
  }, [analysisResult]);

  // Kâr kaçağı verisi
  const profitLeakData = useMemo(() => {
    if (!analysisResult?.receteSapmasi) return MOCK_PROFIT_LEAK;
    return analysisResult.receteSapmasi.map((r) => ({
      name: r.ingredientName,
      theoretical: r.theoreticalRemaining,
      actual: r.actualRemaining,
      leak_amount: r.estimatedLoss,
    }));
  }, [analysisResult]);

  // Stok dağılımı (pie chart)
  const stockDistribution = useMemo(() => {
    if (!analysisResult) return MOCK_STOCK_DISTRIBUTION;
    const red = analysisResult.kritikStoklar.filter((k) => k.level === 'Kırmızı').length;
    const yellow = analysisResult.kritikStoklar.filter((k) => k.level === 'Sarı').length;
    const green = analysisResult.teorikTuketim.length - red - yellow;
    return [
      { name: 'Kritik', value: red, status: 'red' as const },
      { name: 'Dikkat', value: yellow, status: 'yellow' as const },
      { name: 'Normal', value: Math.max(0, green), status: 'green' as const },
    ];
  }, [analysisResult]);

  // Satın alma önerileri
  const purchaseSuggestions = useMemo(() => {
    if (!analysisResult) return MOCK_PURCHASE_SUGGESTIONS;
    return analysisResult.satinAlmaOnerisi.map((s) => ({
      ingredient: s.ingredientName,
      current: s.currentStock,
      needed: s.requiredAmount + s.currentStock,
      order: s.suggestedOrder,
      unit: s.unit,
      estimatedCost: s.estimatedCost,
    }));
  }, [analysisResult]);

  // Satış trend verisini oluştur (ürün satış özeti kullanılır)
  const salesTrend = useMemo(() => {
    if (!analysisResult) return MOCK_SALES_TREND;
    return analysisResult.urunSatisOzeti.map((u) => ({
      date: u.productName,
      amount: u.revenue,
    }));
  }, [analysisResult]);

  return (
    <div className="space-y-6">
      {/* ─── Başlık ve Tarih ─────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-1">
            <CalendarDays className="h-4 w-4" />
            {today}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {!hasBackendData && (
            <span className="text-xs text-amber-500 font-medium">Demo verisi gösteriliyor</span>
          )}
          <Button
            onClick={() => runAnalysis()}
            disabled={isAnalyzing}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
            {isAnalyzing ? 'Analiz Çalışıyor...' : 'Analizi Başlat'}
          </Button>
        </div>
      </div>

      {/* ─── Loading State ────────────────────────── */}
      {isLoadingAnalysis && (
        <Card className="border-dashed">
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary mr-3" />
            <span className="text-muted-foreground">Son analiz sonucu yükleniyor...</span>
          </CardContent>
        </Card>
      )}

      {/* ─── Yönetici Özeti (Gemma) ──────────────── */}
      {analysisResult?.yoneticiyeOzet && (
        <Card className="border-indigo-500/30 bg-indigo-500/5">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-indigo-500 mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold text-sm text-indigo-600 dark:text-indigo-400 mb-1">
                  🤖 AI Yönetici Özeti
                </p>
                <p className="text-sm text-foreground/80 whitespace-pre-line">
                  {analysisResult.yoneticiyeOzet}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ─── İstatistik Kartları ──────────────────── */}
      <StatCards
        totalSales={stats.totalSales}
        totalRevenue={stats.totalRevenue}
        totalProducts={stats.totalProducts}
        totalIngredients={stats.totalIngredients}
      />

      {/* ─── Grafikler (2 sütun) ─────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SalesTrendChart data={salesTrend} />
        </div>
        <div>
          <StockDistributionChart data={stockDistribution} />
        </div>
      </div>

      {/* ─── Kâr Kaçağı Grafiği ──────────────────── */}
      {profitLeakData.length > 0 && (
        <ProfitLeakChart data={profitLeakData} />
      )}

      {/* ─── Kritik Stok ve Kâr Kaçağı Kartları ──── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {criticalStocks.length > 0 && (
          <CriticalStockCards items={criticalStocks} />
        )}
        {profitLeakData.length > 0 && (
          <ProfitLeakCards items={profitLeakData} />
        )}
      </div>

      {/* ─── Satın Alma Önerileri ─────────────────── */}
      {purchaseSuggestions.length > 0 && (
        <PurchaseRecommendations suggestions={purchaseSuggestions} />
      )}
    </div>
  );
}
