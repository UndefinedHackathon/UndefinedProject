// [AI-Agent: Skills] Satışlar sayfası — Tarih seçimi, satış girişi, günlük özet
import { useState, useEffect } from 'react';
import { Loader2, TrendingUp, RefreshCw, CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import SalesForm from '@/components/sales/SalesForm';
import SalesTable from '@/components/sales/SalesTable';
import api from '@/lib/api';
import type { Product, DailySale } from '@/types/stockpilot.types';

function getTodayStr() {
  return new Date().toISOString().split('T')[0];
}

export default function SalesPage() {
  const [sales, setSales] = useState<DailySale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedDate, setSelectedDate] = useState(getTodayStr());
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  const fetchData = async (date: string) => {
    setLoading(true);
    try {
      const [salesRes, prodRes] = await Promise.all([
        api.get(`/sales?date=${date}`),
        api.get('/products'),
      ]);
      setSales(salesRes.data.data ?? []);
      setProducts(prodRes.data.data ?? []);
    } catch {
      setSales([]);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(selectedDate);
  }, [selectedDate]);

  const handleAdd = (newSale: DailySale) => {
    setSales((prev) => [...prev, newSale]);
  };

  const handleDelete = async (id: number) => {
    setDeleting(true);
    try {
      await api.delete(`/sales/${id}`);
      setSales((prev) => prev.filter((s) => s.id !== id));
    } catch {
      // Sessizce geç
    } finally {
      setDeleting(false);
    }
  };

  // Özet hesapları
  const totalQuantity = sales.reduce((sum, s) => sum + Number(s.quantity), 0);
  const totalRevenue = sales.reduce((sum, s) => {
    const prod = products.find((p) => p.id === s.product_id);
    return sum + (Number(s.quantity) * Number(prod?.price ?? 0));
  }, 0);
  const uniqueProducts = new Set(sales.map((s) => s.product_id)).size;

  return (
    <div className="space-y-6">
      {/* Başlık + Aksiyon */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <TrendingUp className="h-8 w-8 text-primary" />
            Satışlar
          </h1>
          <p className="text-muted-foreground mt-1">
            Günlük satış girişi ve takibi. Tarih seçerek geçmiş verileri görüntüleyin.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => fetchData(selectedDate)} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Yenile
          </Button>
          <SalesForm
            products={products}
            onSuccess={handleAdd}
            selectedDate={selectedDate}
          />
        </div>
      </div>

      {/* Tarih Seçimi */}
      <div className="flex items-center gap-3">
        <CalendarDays className="h-5 w-5 text-muted-foreground" />
        <Input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="w-48"
        />
        {selectedDate !== getTodayStr() && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedDate(getTodayStr())}
          >
            Bugüne dön
          </Button>
        )}
      </div>

      {/* Özet Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Toplam Satış Adedi</CardDescription>
            <CardTitle className="text-2xl">{totalQuantity}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Toplam Gelir</CardDescription>
            <CardTitle className="text-2xl">₺{totalRevenue.toFixed(2)}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Satılan Ürün Çeşidi</CardDescription>
            <CardTitle className="text-2xl">{uniqueProducts}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Satış Tablosu */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-3 text-muted-foreground">Satışlar yükleniyor...</span>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>
              {selectedDate === getTodayStr() ? 'Bugünkü Satışlar' : `${selectedDate} Satışları`}
            </CardTitle>
            <CardDescription>
              Seçili tarihteki tüm satış kayıtları.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SalesTable
              sales={sales}
              products={products}
              onDelete={handleDelete}
              loading={deleting}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
