// [AI-Agent: Skills] Malzeme ekleme formu — Dialog içinde açılır, API'ye POST atar
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
import type { Ingredient } from '@/types/stockpilot.types';

const UNITS = ['kg', 'gr', 'lt', 'ml', 'adet'];

interface MaterialFormProps {
  onSuccess: (material: Ingredient) => void;
}

export default function MaterialForm({ onSuccess }: MaterialFormProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [name, setName] = useState('');
  const [unit, setUnit] = useState('kg');
  const [unitCost, setUnitCost] = useState('');
  const [minStockLevel, setMinStockLevel] = useState('');

  const resetForm = () => {
    setName('');
    setUnit('kg');
    setUnitCost('');
    setMinStockLevel('');
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Malzeme adı gereklidir.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/ingredients', {
        name: name.trim(),
        unit,
        unit_cost: parseFloat(unitCost) || 0,
        min_stock_level: parseFloat(minStockLevel) || 0,
      });
      onSuccess(res.data.data);
      resetForm();
      setOpen(false);
    } catch {
      setError('Malzeme eklenemedi. Lütfen tekrar deneyin.');
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
            Malzeme Ekle
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Yeni Malzeme Ekle</DialogTitle>
          <DialogDescription>
            Ham madde bilgilerini girerek yeni bir malzeme tanımlayın.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} id="material-form">
          <div className="space-y-4 py-2">
            {error && (
              <div className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="mat-name">Malzeme Adı</Label>
              <Input
                id="mat-name"
                placeholder="Örn: Süt, Un, Tereyağı"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="mat-unit">Birim</Label>
                <Select value={unit} onValueChange={(v) => { if (v !== null) setUnit(v); }}>
                  <SelectTrigger className="w-full h-9">
                    <SelectValue placeholder="Birim seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {UNITS.map((u) => (
                      <SelectItem key={u} value={u}>
                        {u}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="mat-cost">Birim Maliyet (₺)</Label>
                <Input
                  id="mat-cost"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={unitCost}
                  onChange={(e) => setUnitCost(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="mat-min-stock">Minimum Stok Seviyesi</Label>
              <Input
                id="mat-min-stock"
                type="number"
                step="0.001"
                min="0"
                placeholder="0"
                value={minStockLevel}
                onChange={(e) => setMinStockLevel(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>
        </form>

        <DialogFooter>
          <Button type="submit" form="material-form" disabled={loading}>
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
