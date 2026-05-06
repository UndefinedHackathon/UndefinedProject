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

  // Çoklu ürün ve çoklu malzeme seçimi
  const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);
  const [items, setItems] = useState<Array<{ ingredientId: string; quantity: string }>>([
    { ingredientId: '', quantity: '' }
  ]);

  const resetForm = () => {
    setSelectedProductIds([]);
    setItems([{ ingredientId: '', quantity: '' }]);
    setError('');
  };

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
    
    const validItems = items.filter(i => i.ingredientId && i.quantity && parseFloat(i.quantity) > 0);
    if (validItems.length === 0) {
      setError('En az bir geçerli malzeme ve miktar girin.');
      return;
    }

    setLoading(true);
    try {
      // Çoklu ürün için Promise.all ile ayrı ayrı bulk request atıyoruz
      const promises = selectedProductIds.map((pid) =>
        api.post('/recipes', {
          product_id: pid,
          items: validItems.map(i => ({
            ingredient_id: Number(i.ingredientId),
            quantity_per_unit: parseFloat(i.quantity),
          })),
        })
      );

      const results = await Promise.all(promises);
      
      // Herhangi bir ürün için eklenen ilk kaydı onSuccess'e dön (yenilemeyi tetiklemek için)
      if (results.length > 0 && Array.isArray(results[0].data.data) && results[0].data.data.length > 0) {
        onSuccess(results[0].data.data[0]);
      } else if (results.length > 0 && results[0].data.data) {
        onSuccess(results[0].data.data as any);
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

            {/* Malzeme Listesi */}
            <div className="space-y-4 pt-2 border-t">
              <div className="flex items-center justify-between">
                <Label>Kullanılacak Malzemeler</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs px-2"
                  onClick={() => setItems([...items, { ingredientId: '', quantity: '' }])}
                >
                  <Plus className="mr-1 h-3 w-3" /> Malzeme Ekle
                </Button>
              </div>
              
              <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                {items.map((item, index) => {
                  const selectedIng = ingredients.find(i => i.id === Number(item.ingredientId));
                  return (
                    <div key={index} className="flex flex-col gap-2 p-3 border rounded-md relative group bg-muted/20">
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setItems(items.filter((_, i) => i !== index))}
                          className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                          title="Kaldır"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                        </button>
                      )}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">Malzeme</Label>
                          <Select 
                            value={item.ingredientId} 
                            onValueChange={(v) => {
                              const newItems = [...items];
                              newItems[index].ingredientId = v;
                              setItems(newItems);
                            }}
                          >
                            <SelectTrigger className="w-full h-8 text-sm">
                              <SelectValue placeholder="Seçiniz" />
                            </SelectTrigger>
                            <SelectContent>
                              {ingredients.map((i) => (
                                <SelectItem key={i.id} value={String(i.id)}>
                                  {i.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">
                            Miktar {selectedIng ? `(${selectedIng.unit})` : ''}
                          </Label>
                          <Input
                            type="number"
                            step="0.0001"
                            min="0.0001"
                            placeholder="Örn: 0.25"
                            value={item.quantity}
                            onChange={(e) => {
                              const newItems = [...items];
                              newItems[index].quantity = e.target.value;
                              setItems(newItems);
                            }}
                            className="h-8 text-sm"
                            required
                            disabled={loading}
                          />
                        </div>
                      </div>
                      {selectedIng && item.quantity && parseFloat(item.quantity) > 0 && (
                        <div className="flex justify-between items-center mt-1 pt-1 border-t border-muted">
                          <span className="text-[10px] text-muted-foreground">
                            {selectedIng.unit_cost} ₺ / {selectedIng.unit}
                          </span>
                          <span className="text-xs font-medium text-foreground">
                            Maliyet: ₺{(parseFloat(item.quantity) * Number(selectedIng.unit_cost)).toFixed(2)}
                            {selectedProductIds.length > 1 && (
                              <span className="text-muted-foreground text-[10px] font-normal ml-1">
                                (Ürün başı)
                              </span>
                            )}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
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
