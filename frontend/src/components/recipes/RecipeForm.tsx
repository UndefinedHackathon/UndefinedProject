// [AI-Agent: Skills] Reçete ekleme formu — Çoklu ürün seçimi + malzeme + miktar ile reçete satırları oluşturur
// product-recipe-management ve coding-standards skill'lerine uygun.
import { useState } from 'react';
import { Plus, Loader2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import api from '@/lib/api';
import type { Product, Ingredient, RecipeItem } from '@/types/stockpilot.types';

interface RecipeFormProps {
  products: Product[];
  ingredients: Ingredient[];
  onSuccess: (item: RecipeItem) => void;
}

export default function RecipeForm({ products, ingredients, onSuccess }: RecipeFormProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Çoklu ürün seçimi
  const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);
  const [ingredientId, setIngredientId] = useState('');
  const [quantity, setQuantity] = useState('');

  const resetForm = () => {
    setSelectedProductIds([]);
    setIngredientId('');
    setQuantity('');
    setError('');
  };

  const selectedIngredient = ingredients.find((i) => i.id === Number(ingredientId));

  /** Ürün toggle — seçiliyse kaldır, değilse ekle */
  const toggleProduct = (id: number) => {
    setSelectedProductIds((prev) =>
      prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
    );
  };

  /** Tümünü seç / Tümünü kaldır */
  const toggleAll = () => {
    if (selectedProductIds.length === products.length) {
      setSelectedProductIds([]);
    } else {
      setSelectedProductIds(products.map((p) => p.id));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (selectedProductIds.length === 0) {
      setError('En az bir ürün seçiniz.');
      return;
    }
    if (!ingredientId) {
      setError('Malzeme seçiniz.');
      return;
    }
    if (!quantity || parseFloat(quantity) <= 0) {
      setError('Geçerli bir miktar girin.');
      return;
    }

    setLoading(true);
    try {
      if (selectedProductIds.length === 1) {
        // Tekli ürün — eski format
        const res = await api.post('/recipes', {
          product_id: selectedProductIds[0],
          ingredient_id: Number(ingredientId),
          quantity_per_unit: parseFloat(quantity),
        });
        onSuccess(res.data.data);
      } else {
        // Çoklu ürün — yeni format (product_ids)
        const res = await api.post('/recipes', {
          product_ids: selectedProductIds,
          ingredient_id: Number(ingredientId),
          quantity_per_unit: parseFloat(quantity),
        });
        // İlk eklenen satırı callback olarak gönder
        if (Array.isArray(res.data.data) && res.data.data.length > 0) {
          onSuccess(res.data.data[0]);
        }
      }
      resetForm();
      setOpen(false);
    } catch {
      setError('Reçete eklenemedi. Bu kombinasyon zaten var olabilir.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Reçete Satırı Ekle
          </Button>
        }
      />
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Reçete Satırı Ekle</DialogTitle>
          <DialogDescription>
            Bir veya birden fazla ürüne malzeme ve miktar tanımlayın. 1 adet ürün için gereken miktarı girin.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} id="recipe-form">
          <div className="space-y-4 py-2">
            {error && (
              <div className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}

            {/* Çoklu Ürün Seçimi */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>
                  Ürünler{' '}
                  <span className="text-muted-foreground text-xs">
                    ({selectedProductIds.length} seçili)
                  </span>
                </Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs px-2"
                  onClick={toggleAll}
                >
                  {selectedProductIds.length === products.length ? 'Tümünü Kaldır' : 'Tümünü Seç'}
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto rounded-md border p-2">
                {products.map((p) => {
                  const isSelected = selectedProductIds.includes(p.id);
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => toggleProduct(p.id)}
                      className={`
                        flex items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors text-left
                        ${isSelected
                          ? 'border-primary bg-primary/10 text-primary font-medium'
                          : 'border-border hover:border-primary/50 hover:bg-muted/50'
                        }
                      `}
                    >
                      <div
                        className={`
                          flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors
                          ${isSelected
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-muted-foreground/30'
                          }
                        `}
                      >
                        {isSelected && <Check className="h-3 w-3" />}
                      </div>
                      <span className="truncate">{p.name}</span>
                      <span className="ml-auto text-xs text-muted-foreground shrink-0">
                        ₺{Number(p.price).toFixed(2)}
                      </span>
                    </button>
                  );
                })}
              </div>
              {products.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  Henüz ürün eklenmemiş. Önce ürün ekleyin.
                </p>
              )}
            </div>

            {/* Malzeme Seçimi */}
            <div className="space-y-2">
              <Label>Malzeme</Label>
              <Select value={ingredientId} onValueChange={(v) => { if (v !== null) setIngredientId(v); }}>
                <SelectTrigger className="w-full h-9">
                  <SelectValue placeholder="Malzeme seçin" />
                </SelectTrigger>
                <SelectContent>
                  {ingredients.map((i) => (
                    <SelectItem key={i.id} value={String(i.id)}>
                      {i.name} ({i.unit})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Miktar */}
            <div className="space-y-2">
              <Label htmlFor="recipe-qty">
                Miktar (1 ürün için){selectedIngredient ? ` — ${selectedIngredient.unit}` : ''}
              </Label>
              <Input
                id="recipe-qty"
                type="number"
                step="0.0001"
                min="0.0001"
                placeholder="Örn: 0.25"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
                disabled={loading}
              />
              {selectedIngredient && quantity && parseFloat(quantity) > 0 && (
                <p className="text-xs text-muted-foreground">
                  Birim maliyet katkısı: ₺{(parseFloat(quantity) * Number(selectedIngredient.unit_cost)).toFixed(2)}
                  {selectedProductIds.length > 1 && (
                    <span> × {selectedProductIds.length} ürün</span>
                  )}
                </p>
              )}
            </div>
          </div>
        </form>

        <DialogFooter>
          <Button type="submit" form="recipe-form" disabled={loading}>
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Plus className="mr-2 h-4 w-4" />
            )}
            {loading
              ? 'Ekleniyor...'
              : selectedProductIds.length > 1
                ? `${selectedProductIds.length} Ürüne Ekle`
                : 'Ekle'
            }
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
