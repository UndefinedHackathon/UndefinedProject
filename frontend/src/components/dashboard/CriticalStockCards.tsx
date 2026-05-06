// [AI-Agent: Skills] Kritik stok kartları — kırmızı/sarı trafik ışığı ile stok durumu gösterimi
import { AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface CriticalStockItem {
  id: number;
  name: string;
  current: number;
  min: number;
  unit: string;
  status: 'red' | 'yellow';
}

interface CriticalStockCardsProps {
  items: CriticalStockItem[];
}

/** Trafik ışığı göstergesi — kırmızı yanıp söner */
function TrafficLight({ status }: { status: 'red' | 'yellow' | 'green' }) {
  const colorMap = {
    red: 'bg-red-500 animate-pulse shadow-red-500/50',
    yellow: 'bg-amber-400 shadow-amber-400/50',
    green: 'bg-emerald-500 shadow-emerald-500/50',
  };

  return (
    <span
      className={`inline-block w-3 h-3 rounded-full ${colorMap[status]} shadow-lg`}
      title={status === 'red' ? 'Kritik' : status === 'yellow' ? 'Dikkat' : 'Normal'}
    />
  );
}

export function CriticalStockCards({ items }: CriticalStockCardsProps) {
  const criticalCount = items.filter((i) => i.status === 'red').length;
  const warningCount = items.filter((i) => i.status === 'yellow').length;

  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Kritik Stok Durumu
          </CardTitle>
          <div className="flex items-center gap-2">
            {criticalCount > 0 && (
              <Badge variant="destructive" className="text-xs font-semibold">
                {criticalCount} Kritik
              </Badge>
            )}
            {warningCount > 0 && (
              <Badge className="bg-amber-500/15 text-amber-600 border-amber-500/30 text-xs font-semibold">
                {warningCount} Dikkat
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {items.map((item) => {
            const percentage = Math.round((item.current / item.min) * 100);
            const isRed = item.status === 'red';

            return (
              <div
                key={item.id}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 hover:shadow-sm ${
                  isRed
                    ? 'border-red-500/30 bg-red-500/5'
                    : 'border-amber-500/30 bg-amber-500/5'
                }`}
              >
                <TrafficLight status={item.status} />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{item.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {Number(item.current).toFixed(2)} / {Number(item.min).toFixed(2)} {item.unit}
                  </p>
                </div>
                {/* Stok yüzdesi progress bar */}
                <div className="w-16">
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isRed ? 'bg-red-500' : 'bg-amber-400'
                      }`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>
                  <p className={`text-[10px] mt-0.5 text-right font-medium ${
                    isRed ? 'text-red-500' : 'text-amber-500'
                  }`}>
                    %{percentage}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
