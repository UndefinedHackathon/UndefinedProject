// [AI-Agent: Skills] Reçeteler sayfası — Ürün-malzeme ilişkisi, maliyet analizi
import { useState, useEffect } from 'react';
import { Loader2, BookOpen, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import RecipeForm from '@/components/recipes/RecipeForm';
import RecipeTable from '@/components/recipes/RecipeTable';
import api from '@/lib/api';
import type { Product, Ingredient, RecipeItem } from '@/types/stockpilot.types';

export default function RecipesPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [prodRes, ingRes] = await Promise.all([
        api.get('/products'),
        api.get('/ingredients'),
      ]);
      setProducts(prodRes.data.data ?? []);
      setIngredients(ingRes.data.data ?? []);
    } catch {
      setProducts([]);
      setIngredients([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAdd = (_newItem: RecipeItem) => {
    // Reçete eklendikten sonra tüm veriyi yenile (JOIN sorgusu nedeniyle)
    fetchData();
  };

  const handleDelete = async (id: number) => {
    setDeleting(true);
    try {
      await api.delete(`/recipes/${id}`);
      // Silme sonrası yenile
      await fetchData();
    } catch {
      // Sessizce geç
    } finally {
      setDeleting(false);
    }
  };

  // Özet istatistikler
  const totalRecipeItems = products.reduce((sum, p) => sum + (p.recipe?.length ?? 0), 0);
  const productsWithRecipe = products.filter((p) => p.recipe && p.recipe.length > 0);
  const avgCost = productsWithRecipe.length > 0
    ? productsWithRecipe.reduce((sum, p) => {
        const cost = (p.recipe ?? []).reduce(
          (s, r) => s + Number(r.quantity_per_unit) * Number(r.unit_cost ?? 0), 0
        );
        return sum + cost;
      }, 0) / productsWithRecipe.length
    : 0;

  return (
    <div className="space-y-6">
      {/* Başlık + Aksiyon */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <BookOpen className="h-8 w-8 text-primary" />
            Reçeteler
          </h1>
          <p className="text-muted-foreground mt-1">
            Ürün reçeteleri ve gramaj yönetimi. Her ürüne malzeme ve miktar tanımlayın.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchData} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Yenile
          </Button>
          <RecipeForm
            products={products}
            ingredients={ingredients}
            onSuccess={handleAdd}
          />
        </div>
      </div>

      {/* Özet Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Reçeteli Ürünler</CardDescription>
            <CardTitle className="text-2xl">
              {productsWithRecipe.length} / {products.length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Toplam Reçete Satırı</CardDescription>
            <CardTitle className="text-2xl">{totalRecipeItems}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Ort. Ürün Maliyeti</CardDescription>
            <CardTitle className="text-2xl">₺{avgCost.toFixed(2)}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Reçete Tablosu */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-3 text-muted-foreground">Reçeteler yükleniyor...</span>
        </div>
      ) : (
        <RecipeTable
          products={products}
          onDelete={handleDelete}
          loading={deleting}
        />
      )}
    </div>
  );
}
