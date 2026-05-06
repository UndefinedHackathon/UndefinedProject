// [AI-Agent: Skills] Ürünler sayfası — Form + Tablo ile CRUD operasyonları
import { useState, useEffect } from 'react';
import { Loader2, ShoppingBag, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import ProductForm from '@/components/products/ProductForm';
import ProductTable from '@/components/products/ProductTable';
import api from '@/lib/api';
import type { Product } from '@/types/stockpilot.types';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/products');
      setProducts(res.data.data ?? []);
    } catch {
      // Backend henüz hazır değilse boş liste göster
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleAdd = (newProduct: Product) => {
    setProducts((prev) => [...prev, newProduct]);
  };

  const handleDelete = async (id: number) => {
    setDeleting(true);
    try {
      await api.delete(`/products/${id}`);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch {
      // Hata durumunda sessizce geç
    } finally {
      setDeleting(false);
    }
  };

  // Kategori bazlı ürün sayısı
  const categoryCount = products.reduce<Record<string, number>>((acc, p) => {
    acc[p.category] = (acc[p.category] || 0) + 1;
    return acc;
  }, {});

  const topCategory = Object.entries(categoryCount).sort((a, b) => b[1] - a[1])[0];

  return (
    <div className="space-y-6">
      {/* Başlık + Aksiyon */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <ShoppingBag className="h-8 w-8 text-primary" />
            Ürünler
          </h1>
          <p className="text-muted-foreground mt-1">
            Menü ürünlerini tanımlayın ve yönetin. Reçetelerle ilişkilendirin.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchProducts} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Yenile
          </Button>
          <ProductForm onSuccess={handleAdd} />
        </div>
      </div>

      {/* Özet Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Toplam Ürün</CardDescription>
            <CardTitle className="text-2xl">{products.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Ort. Fiyat</CardDescription>
            <CardTitle className="text-2xl">
              ₺{products.length > 0
                ? (products.reduce((sum, p) => sum + Number(p.price), 0) / products.length).toFixed(2)
                : '0.00'}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>En Fazla Kategori</CardDescription>
            <CardTitle className="text-2xl">
              {topCategory ? `${topCategory[0]} (${topCategory[1]})` : '—'}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Tablo */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-3 text-muted-foreground">Ürünler yükleniyor...</span>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Ürün Listesi</CardTitle>
            <CardDescription>
              Tüm menü ürünlerinin listesi. Reçetesi olmayan ürünleri tanımlayın.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProductTable
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
