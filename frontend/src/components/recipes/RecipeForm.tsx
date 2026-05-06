// [AI-Agent: Skills] Reçete ekleme formu — Ürün + Malzeme seçip miktar girerek reçete satırı oluşturur
import { useState, useEffect } from 'react';
import { Plus, Loader2 } from 'lucide-react';
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

  const [productId, setProductId] = useState('');
  const [ingredientId, setIngredientId] = useState('');
  const [quantity, setQuantity] = useState('');

  const resetForm = () => {
    setProductId('');
    setIngredientId('');
    setQuantity('');
    setError('');
  };

  const selectedIngredient = ingredients.find((i) => i.id === Number(ingredientId));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!productId) {
      setError('Ürün seçiniz.');
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
      const res = await api.post('/recipes', {
        product_id: Number(productId),
        ingredient_id: Number(ingredientId),
        quantity_per_unit: parseFloat(quantity),
      });
      onSuccess(res.data.data);
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reçete Satırı Ekle</DialogTitle>
          <DialogDescription>
            Bir ürüne malzeme ve miktar tanımlayın. 1 adet ürün için gereken miktarı girin.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} id="recipe-form">
          <div className="space-y-4 py-2">
            {error && (
              <div className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label>Ürün</Label>
              <Select value={productId} onValueChange={setProductId}>
                <SelectTrigger className="w-full h-9">
                  <SelectValue placeholder="Ürün seçin" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((p) => (
                    <SelectItem key={p.id} value={String(p.id)}>
                      {p.name} — ₺{Number(p.price).toFixed(2)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Malzeme</Label>
              <Select value={ingredientId} onValueChange={setIngredientId}>
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
            {loading ? 'Ekleniyor...' : 'Ekle'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
