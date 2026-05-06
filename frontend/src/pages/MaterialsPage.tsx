// [AI-Agent: Skills] Malzemeler sayfası — Form + Tablo ile CRUD operasyonları
import { useState, useEffect } from 'react';
import { Loader2, Package, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import MaterialForm from '@/components/materials/MaterialForm';
import MaterialTable from '@/components/materials/MaterialTable';
import api from '@/lib/api';
import type { Ingredient } from '@/types/stockpilot.types';

export default function MaterialsPage() {
  const [materials, setMaterials] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  const fetchMaterials = async () => {
    setLoading(true);
    try {
      const res = await api.get('/ingredients');
      setMaterials(res.data.data ?? []);
    } catch {
      // Backend henüz hazır değilse boş liste göster
      setMaterials([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  const handleAdd = (newMaterial: Ingredient) => {
    setMaterials((prev) => [...prev, newMaterial]);
  };

  const handleDelete = async (id: number) => {
    setDeleting(true);
    try {
      await api.delete(`/ingredients/${id}`);
      setMaterials((prev) => prev.filter((m) => m.id !== id));
    } catch {
      // Hata durumunda sessizce geç
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Başlık + Aksiyon */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Package className="h-8 w-8 text-primary" />
            Malzemeler
          </h1>
          <p className="text-muted-foreground mt-1">
            Ham madde ve stok yönetimi. Reçetelerde kullanılacak malzemeleri tanımlayın.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchMaterials} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Yenile
          </Button>
          <MaterialForm onSuccess={handleAdd} />
        </div>
      </div>

      {/* Özet Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Toplam Malzeme</CardDescription>
            <CardTitle className="text-2xl">{materials.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Birim Türleri</CardDescription>
            <CardTitle className="text-2xl">
              {new Set(materials.map((m) => m.unit)).size}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Ort. Birim Maliyet</CardDescription>
            <CardTitle className="text-2xl">
              ₺{materials.length > 0
                ? (materials.reduce((sum, m) => sum + Number(m.unit_cost), 0) / materials.length).toFixed(2)
                : '0.00'}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Tablo */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-3 text-muted-foreground">Malzemeler yükleniyor...</span>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Malzeme Listesi</CardTitle>
            <CardDescription>
              Tüm ham maddelerin listesi. Reçetelerde bu malzemeleri kullanabilirsiniz.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <MaterialTable
              materials={materials}
              onDelete={handleDelete}
              loading={deleting}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
