// [AI-Agent: Skills] Ürün tablosu — Mevcut ürünleri listeler, kâr marjı badge'i gösterir
import { Trash2, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { Product } from '@/types/stockpilot.types';

interface ProductTableProps {
  products: Product[];
  onDelete: (id: number) => void;
  loading?: boolean;
}

export default function ProductTable({ products, onDelete, loading }: ProductTableProps) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
        <ShoppingBag className="h-12 w-12 text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-semibold">Henüz ürün yok</h3>
        <p className="text-sm text-muted-foreground mt-1">
          İlk ürününüzü ekleyerek başlayın.
        </p>
      </div>
    );
  }

  // Kategori renklerini belirle
  const categoryVariant = (cat: string): 'default' | 'secondary' | 'outline' => {
    switch (cat) {
      case 'Sıcak İçecek':
        return 'default';
      case 'Soğuk İçecek':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">#</TableHead>
            <TableHead>Ürün Adı</TableHead>
            <TableHead>Kategori</TableHead>
            <TableHead className="text-right">Fiyat</TableHead>
            <TableHead className="text-center">Reçete</TableHead>
            <TableHead className="w-16 text-right">İşlem</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((prod, idx) => {
            const recipeCount = prod.recipe?.length ?? 0;
            return (
              <TableRow key={prod.id}>
                <TableCell className="font-mono text-muted-foreground text-xs">
                  {idx + 1}
                </TableCell>
                <TableCell className="font-medium">{prod.name}</TableCell>
                <TableCell>
                  <Badge variant={categoryVariant(prod.category)}>
                    {prod.category}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-mono">
                  ₺{Number(prod.price).toFixed(2)}
                </TableCell>
                <TableCell className="text-center">
                  {recipeCount > 0 ? (
                    <Badge variant="secondary">
                      {recipeCount} malzeme
                    </Badge>
                  ) : (
                    <span className="text-xs text-amber-500">⚠️ Reçete yok</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => onDelete(prod.id)}
                    disabled={loading}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
