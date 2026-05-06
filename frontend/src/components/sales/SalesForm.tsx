// [AI-Agent: Skills] Satış giriş formu — Ürün seç, adet gir, tarih seç ve kaydet
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
import type { Product, DailySale } from '@/types/stockpilot.types';

interface SalesFormProps {
  products: Product[];
  onSuccess: (sale: DailySale) => void;
  selectedDate: string;
}

export default function SalesForm({ products, onSuccess, selectedDate }: SalesFormProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState('');

  const selectedProduct = products.find((p) => p.id === Number(productId));

  const resetForm = () => {
    setProductId('');
    setQuantity('');
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!productId) {
      setError('Ürün seçiniz.');
      return;
    }
    if (!quantity || parseInt(quantity) <= 0) {
      setError('Geçerli bir adet girin.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/sales', {
        product_id: Number(productId),
        quantity: parseInt(quantity),
        sale_date: selectedDate,
      });
      onSuccess(res.data.data);
      resetForm();
      setOpen(false);
    } catch {
      setError('Satış kaydedilemedi. Bu ürün-tarih kombinasyonu zaten var olabilir.');
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
            Satış Ekle
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Satış Girişi</DialogTitle>
          <DialogDescription>
            {selectedDate} tarihi için satış kaydı ekleyin.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} id="sales-form">
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
              <Label htmlFor="sale-qty">Satış Adedi</Label>
              <Input
                id="sale-qty"
                type="number"
                step="1"
                min="1"
                placeholder="Örn: 25"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
                disabled={loading}
              />
              {selectedProduct && quantity && parseInt(quantity) > 0 && (
                <p className="text-xs text-muted-foreground">
                  Tahmini gelir: ₺{(parseInt(quantity) * Number(selectedProduct.price)).toFixed(2)}
                </p>
              )}
            </div>
          </div>
        </form>

        <DialogFooter>
          <Button type="submit" form="sales-form" disabled={loading}>
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Plus className="mr-2 h-4 w-4" />
            )}
            {loading ? 'Kaydediliyor...' : 'Kaydet'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
