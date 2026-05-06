// [AI-Agent: Skills] Ürün ekleme formu — Dialog içinde açılır, API'ye POST atar
import { useState } from 'react';
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
import type { Product } from '@/types/stockpilot.types';

const CATEGORIES = [
  'Sıcak İçecek',
  'Soğuk İçecek',
  'Yiyecek',
  'Tatlı',
  'Kahvaltı',
  'Genel',
];

interface ProductFormProps {
  onSuccess: (product: Product) => void;
}

export default function ProductForm({ onSuccess }: ProductFormProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Genel');

  const resetForm = () => {
    setName('');
    setPrice('');
    setCategory('Genel');
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Ürün adı gereklidir.');
      return;
    }

    if (!price || parseFloat(price) <= 0) {
      setError('Geçerli bir fiyat girin.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/products', {
        name: name.trim(),
        price: parseFloat(price),
        category,
      });
      onSuccess(res.data.data);
      resetForm();
      setOpen(false);
    } catch {
      setError('Ürün eklenemedi. Lütfen tekrar deneyin.');
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
            Ürün Ekle
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Yeni Ürün Ekle</DialogTitle>
          <DialogDescription>
            Menüdeki ürünün bilgilerini girin.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} id="product-form">
          <div className="space-y-4 py-2">
            {error && (
              <div className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="prod-name">Ürün Adı</Label>
              <Input
                id="prod-name"
                placeholder="Örn: Latte, Cheesecake, Tost"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="prod-price">Satış Fiyatı (₺)</Label>
                <Input
                  id="prod-price"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="prod-category">Kategori</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="w-full h-9">
                    <SelectValue placeholder="Kategori seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </form>

        <DialogFooter>
          <Button type="submit" form="product-form" disabled={loading}>
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
