// [AI-Agent: Skills] Reçete tablosu — Ürün bazlı gruplanmış reçete satırları, maliyet hesabı
import { Trash2, BookOpen } from 'lucide-react';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Product } from '@/types/stockpilot.types';

interface RecipeTableProps {
  products: Product[];
  onDelete: (id: number) => void;
  loading?: boolean;
}

export default function RecipeTable({ products, onDelete, loading }: RecipeTableProps) {
  // Reçetesi olan ürünleri filtrele
  const productsWithRecipe = products.filter((p) => p.recipe && p.recipe.length > 0);
  const productsWithoutRecipe = products.filter((p) => !p.recipe || p.recipe.length === 0);

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
        <BookOpen className="h-12 w-12 text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-semibold">Henüz ürün yok</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Önce ürün ve malzeme ekleyin, sonra reçete tanımlayın.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Reçetesi olan ürünler */}
      {productsWithRecipe.map((product) => {
        const totalCost = (product.recipe ?? []).reduce((sum, item) => {
          return sum + (Number(item.quantity_per_unit) * Number(item.unit_cost ?? 0));
        }, 0);
        const profitMargin = product.price > 0
          ? ((Number(product.price) - totalCost) / Number(product.price)) * 100
          : 0;

        return (
          <Card key={product.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  {product.name}
                  <Badge variant="secondary">₺{Number(product.price).toFixed(2)}</Badge>
                </CardTitle>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    Maliyet: ₺{totalCost.toFixed(2)}
                  </span>
                  <Badge
                    variant={
                      profitMargin < 15 ? 'destructive'
                      : profitMargin < 30 ? 'outline'
                      : 'default'
                    }
                  >
                    %{profitMargin.toFixed(0)} kâr
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Malzeme</TableHead>
                    <TableHead className="text-right">Miktar</TableHead>
                    <TableHead>Birim</TableHead>
                    <TableHead className="text-right">Birim Maliyet</TableHead>
                    <TableHead className="text-right">Ürün Başı Maliyet</TableHead>
                    <TableHead className="w-12 text-right">Sil</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(product.recipe ?? []).map((item) => {
                    const itemCost = Number(item.quantity_per_unit) * Number(item.unit_cost ?? 0);
                    return (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.ingredient_name}</TableCell>
                        <TableCell className="text-right font-mono">
                          {Number(item.quantity_per_unit).toFixed(4)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{item.unit}</Badge>
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          ₺{Number(item.unit_cost ?? 0).toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          ₺{itemCost.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="text-muted-foreground hover:text-destructive"
                            onClick={() => onDelete(item.id)}
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
            </CardContent>
          </Card>
        );
      })}

      {/* Reçetesi olmayan ürünler uyarısı */}
      {productsWithoutRecipe.length > 0 && (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-amber-600 flex items-center gap-2">
              ⚠️ Reçetesi Tanımlanmamış Ürünler ({productsWithoutRecipe.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex flex-wrap gap-2">
              {productsWithoutRecipe.map((p) => (
                <Badge key={p.id} variant="outline" className="text-amber-600 border-amber-500/30">
                  {p.name}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
