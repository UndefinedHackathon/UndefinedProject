// [AI-Agent: Skills] Satış tablosu — Günlük satışları listeler, toplam geliri gösterir
import { Trash2, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { DailySale, Product } from '@/types/stockpilot.types';

interface SalesTableProps {
  sales: DailySale[];
  products: Product[];
  onDelete: (id: number) => void;
  loading?: boolean;
}

export default function SalesTable({ sales, products, onDelete, loading }: SalesTableProps) {
  if (sales.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
        <TrendingUp className="h-12 w-12 text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-semibold">Bu tarihte satış kaydı yok</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Satış ekle butonuna tıklayarak günlük satış girişi yapın.
        </p>
      </div>
    );
  }

  // Ürün bilgilerini eşleştir
  const getProduct = (productId: number) => products.find((p) => p.id === productId);

  const totalQuantity = sales.reduce((sum, s) => sum + Number(s.quantity), 0);
  const totalRevenue = sales.reduce((sum, s) => {
    const prod = getProduct(s.product_id);
    return sum + (Number(s.quantity) * Number(prod?.price ?? 0));
  }, 0);

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">#</TableHead>
            <TableHead>Ürün</TableHead>
            <TableHead>Kategori</TableHead>
            <TableHead className="text-right">Adet</TableHead>
            <TableHead className="text-right">Birim Fiyat</TableHead>
            <TableHead className="text-right">Toplam</TableHead>
            <TableHead className="w-12 text-right">Sil</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sales.map((sale, idx) => {
            const prod = getProduct(sale.product_id);
            const productName = sale.product_name || prod?.name || 'Bilinmeyen Ürün';
            const price = Number(prod?.price ?? 0);
            const lineTotal = Number(sale.quantity) * price;

            return (
              <TableRow key={sale.id}>
                <TableCell className="font-mono text-muted-foreground text-xs">
                  {idx + 1}
                </TableCell>
                <TableCell className="font-medium">{productName}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{prod?.category ?? '—'}</Badge>
                </TableCell>
                <TableCell className="text-right font-mono">{sale.quantity}</TableCell>
                <TableCell className="text-right font-mono">
                  ₺{price.toFixed(2)}
                </TableCell>
                <TableCell className="text-right font-mono font-medium">
                  ₺{lineTotal.toFixed(2)}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => onDelete(sale.id)}
                    disabled={loading}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={3} className="font-semibold">
              Toplam
            </TableCell>
            <TableCell className="text-right font-mono font-semibold">{totalQuantity}</TableCell>
            <TableCell />
            <TableCell className="text-right font-mono font-semibold">
              ₺{totalRevenue.toFixed(2)}
            </TableCell>
            <TableCell />
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
}
