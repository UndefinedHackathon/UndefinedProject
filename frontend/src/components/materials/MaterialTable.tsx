// [AI-Agent: Skills] Malzeme tablosu — Mevcut malzemeleri listeler, silme işlemi yapar
import { Trash2, Package } from 'lucide-react';
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
import type { Ingredient } from '@/types/stockpilot.types';

interface MaterialTableProps {
  materials: Ingredient[];
  onDelete: (id: number) => void;
  loading?: boolean;
}

export default function MaterialTable({ materials, onDelete, loading }: MaterialTableProps) {
  if (materials.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
        <Package className="h-12 w-12 text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-semibold">Henüz malzeme yok</h3>
        <p className="text-sm text-muted-foreground mt-1">
          İlk malzemenizi ekleyerek başlayın.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">#</TableHead>
            <TableHead>Malzeme Adı</TableHead>
            <TableHead>Birim</TableHead>
            <TableHead className="text-right">Birim Maliyet</TableHead>
            <TableHead className="text-right">Min. Stok</TableHead>
            <TableHead className="w-16 text-right">İşlem</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {materials.map((mat, idx) => (
            <TableRow key={mat.id}>
              <TableCell className="font-mono text-muted-foreground text-xs">
                {idx + 1}
              </TableCell>
              <TableCell className="font-medium">{mat.name}</TableCell>
              <TableCell>
                <Badge variant="secondary">{mat.unit}</Badge>
              </TableCell>
              <TableCell className="text-right font-mono">
                ₺{Number(mat.unit_cost).toFixed(2)}
              </TableCell>
              <TableCell className="text-right font-mono">
                {Number(mat.min_stock_level).toFixed(1)} {mat.unit}
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() => onDelete(mat.id)}
                  disabled={loading}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
