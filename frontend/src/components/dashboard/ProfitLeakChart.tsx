// [AI-Agent: Skills] Kâr kaçağı grafiği — Recharts ComposedChart ile teorik vs gerçek tüketim
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingDown } from 'lucide-react';

interface ProfitLeakData {
  name: string;
  theoretical: number;
  actual: number;
  leak_amount: number;
}

interface ProfitLeakChartProps {
  data: ProfitLeakData[];
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border/50 bg-popover p-3 shadow-xl space-y-1">
      <p className="text-xs font-semibold">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="text-xs" style={{ color: p.color }}>
          {p.name}: {p.dataKey === 'leak_amount' ? `₺${p.value}` : p.value}
        </p>
      ))}
    </div>
  );
}

export function ProfitLeakChart({ data }: ProfitLeakChartProps) {
  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <TrendingDown className="h-5 w-5 text-amber-500" />
          Teorik vs Gerçek Tüketim
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                className="text-xs fill-muted-foreground"
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                className="text-xs fill-muted-foreground"
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: '12px' }}
                iconType="circle"
              />
              <Bar
                dataKey="theoretical"
                name="Beklenen (Reçete)"
                fill="#10b981"
                radius={[4, 4, 0, 0]}
                isAnimationActive={true}
                animationDuration={1000}
              />
              <Bar
                dataKey="actual"
                name="Gerçek (Tüketim)"
                fill="#f59e0b"
                radius={[4, 4, 0, 0]}
                isAnimationActive={true}
                animationDuration={1000}
              />
              <Line
                type="monotone"
                dataKey="leak_amount"
                name="Kayıp (₺)"
                stroke="#ef4444"
                strokeWidth={3}
                dot={{ r: 5, fill: '#ef4444', stroke: '#fff', strokeWidth: 2 }}
                activeDot={{ r: 7 }}
                isAnimationActive={true}
                animationDuration={1200}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
