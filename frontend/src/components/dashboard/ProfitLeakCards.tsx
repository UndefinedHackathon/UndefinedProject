// [AI-Agent: Skills] Kâr kaçağı kartları — reçete sapması ve gizli kayıp gösterimi
import { TrendingDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ProfitLeakItem {
  name: string;
  theoretical: number;
  actual: number;
  leak_amount: number;
}

interface ProfitLeakCardsProps {
  items: ProfitLeakItem[];
}

export function ProfitLeakCards({ items }: ProfitLeakCardsProps) {
  const totalLeak = items.reduce((sum, item) => sum + item.leak_amount, 0);

  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingDown className="h-5 w-5 text-amber-500" />
            Kâr Kaçağı Analizi
          </CardTitle>
          <Badge className="bg-amber-500/15 text-amber-600 border-amber-500/30 text-sm font-semibold">
            Toplam: ₺{totalLeak.toLocaleString('tr-TR', { minimumFractionDigits: 1 })}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {items.map((item) => {
            const deviationPercent = Math.round(((item.actual - item.theoretical) / item.theoretical) * 100);
            const isHigh = deviationPercent > 30;

            return (
              <div
                key={item.name}
                className="flex items-center gap-4 p-3 rounded-lg border border-border/50 bg-card hover:bg-accent/50 transition-colors duration-200"
              >
                {/* Malzeme bilgisi */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm">{item.name}</p>
                    {isHigh && (
                      <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                        Yüksek
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Beklenen: {item.theoretical} → Gerçek: {item.actual}
                  </p>
                </div>

                {/* Sapma yüzdesi */}
                <div className="text-right">
                  <p className={`text-sm font-bold ${isHigh ? 'text-red-500' : 'text-amber-500'}`}>
                    +%{deviationPercent}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    ₺{item.leak_amount.toLocaleString('tr-TR', { minimumFractionDigits: 1 })}
                  </p>
                </div>

                {/* Sapma çubuğu */}
                <div className="w-20">
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        isHigh
                          ? 'bg-gradient-to-r from-red-400 to-red-600'
                          : 'bg-gradient-to-r from-amber-300 to-amber-500'
                      }`}
                      style={{ width: `${Math.min(deviationPercent, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
