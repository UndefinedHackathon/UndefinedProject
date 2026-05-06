// [AI-Agent: Skills] Satın alma önerisi tablosu — sipariş edilmesi gereken malzeme ve tahmini maliyet
import { ShoppingBag } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface PurchaseSuggestion {
  ingredient: string;
  current: number;
  needed: number;
  order: number;
  unit: string;
  estimatedCost: number;
}

interface PurchaseRecommendationsProps {
  suggestions: PurchaseSuggestion[];
}

export function PurchaseRecommendations({ suggestions }: PurchaseRecommendationsProps) {
  const totalCost = suggestions.reduce((sum, s) => sum + s.estimatedCost, 0);

  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <ShoppingBag className="h-5 w-5 text-indigo-500" />
            Satın Alma Önerileri
          </CardTitle>
          <Badge className="bg-indigo-500/15 text-indigo-600 border-indigo-500/30 text-sm font-semibold">
            Toplam: ₺{totalCost.toLocaleString('tr-TR')}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border border-border/50 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold text-xs">Malzeme</TableHead>
                <TableHead className="font-semibold text-xs text-right">Mevcut</TableHead>
                <TableHead className="font-semibold text-xs text-right">Gerekli</TableHead>
                <TableHead className="font-semibold text-xs text-right">Sipariş</TableHead>
                <TableHead className="font-semibold text-xs text-right">Tahmini Maliyet</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {suggestions.map((s) => (
                <TableRow
                  key={s.ingredient}
                  className="hover:bg-accent/50 transition-colors"
                >
                  <TableCell className="font-medium text-sm">{s.ingredient}</TableCell>
                  <TableCell className="text-right text-sm text-muted-foreground">
                    {s.current} {s.unit}
                  </TableCell>
                  <TableCell className="text-right text-sm text-muted-foreground">
                    {s.needed} {s.unit}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant="outline" className="font-semibold text-xs">
                      {s.order} {s.unit}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-semibold text-sm text-indigo-600 dark:text-indigo-400">
                    ₺{s.estimatedCost.toLocaleString('tr-TR')}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
