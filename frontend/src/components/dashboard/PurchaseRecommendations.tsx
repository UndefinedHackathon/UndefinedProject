// [AI-Agent: Skills] Satın alma önerisi tablosu — sipariş edilmesi gereken malzeme ve tahmini maliyet
import { useState } from 'react';
import { ShoppingBag, Send, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import api from '@/lib/api';
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
  const [isSending, setIsSending] = useState(false);
  const totalCost = suggestions.reduce((sum, s) => sum + s.estimatedCost, 0);

  const handleSendToSupplier = async () => {
    setIsSending(true);
    try {
      const items = suggestions.map((s) => ({
        name: s.ingredient,
        amount: s.order,
        unit: s.unit,
      }));

      const payload = {
        supplierMessage: 'Merhaba, aşağıdaki malzemeler için sipariş oluşturmak istiyoruz.',
        items,
      };

      await api.post('/n8n/supplier-message', payload);
      toast.success('Sipariş listesi tedarikçiye gönderildi', {
        description: 'n8n otomasyonu üzerinden mesaj iletildi.',
      });
    } catch (error) {
      toast.error('Gönderim başarısız', {
        description: 'Tedarikçiye mesaj gönderilirken bir hata oluştu.',
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <ShoppingBag className="h-5 w-5 text-indigo-500" />
            Satın Alma Önerileri
          </CardTitle>
          <div className="flex items-center gap-3">
            <Badge className="bg-indigo-500/15 text-indigo-600 border-indigo-500/30 text-sm font-semibold">
              Toplam: ₺{totalCost.toLocaleString('tr-TR')}
            </Badge>
            <Button
              size="sm"
              variant="outline"
              className="gap-2 border-indigo-500/30 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10"
              onClick={handleSendToSupplier}
              disabled={isSending || suggestions.length === 0}
            >
              {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Tedarikçiye Gönder
            </Button>
          </div>
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
