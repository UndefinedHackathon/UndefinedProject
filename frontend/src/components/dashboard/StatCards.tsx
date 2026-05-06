// [AI-Agent: Skills] Dashboard istatistik kartları — toplam satış, gelir, ürün ve malzeme sayısı
import { ShoppingCart, TrendingUp, Package, Leaf } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface StatCardsProps {
  totalSales: number;
  totalRevenue: number;
  totalProducts: number;
  totalIngredients: number;
}

interface StatItem {
  label: string;
  value: string;
  icon: React.ReactNode;
  gradient: string;
  textColor: string;
}

export function StatCards({ totalSales, totalRevenue, totalProducts, totalIngredients }: StatCardsProps) {
  const stats: StatItem[] = [
    {
      label: 'Toplam Satış',
      value: totalSales.toLocaleString('tr-TR'),
      icon: <ShoppingCart className="h-5 w-5" />,
      gradient: 'from-indigo-500 to-indigo-700',
      textColor: 'text-white',
    },
    {
      label: 'Toplam Gelir',
      value: `₺${totalRevenue.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`,
      icon: <TrendingUp className="h-5 w-5" />,
      gradient: 'from-emerald-500 to-emerald-700',
      textColor: 'text-white',
    },
    {
      label: 'Ürün Sayısı',
      value: totalProducts.toLocaleString('tr-TR'),
      icon: <Package className="h-5 w-5" />,
      gradient: 'from-purple-500 to-violet-700',
      textColor: 'text-white',
    },
    {
      label: 'Malzeme Sayısı',
      value: totalIngredients.toLocaleString('tr-TR'),
      icon: <Leaf className="h-5 w-5" />,
      gradient: 'from-amber-500 to-orange-600',
      textColor: 'text-white',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card
          key={stat.label}
          className={`bg-gradient-to-br ${stat.gradient} border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}
        >
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${stat.textColor} opacity-80`}>{stat.label}</p>
                <p className={`text-2xl font-bold mt-1 ${stat.textColor}`}>{stat.value}</p>
              </div>
              <div className={`p-3 rounded-xl bg-white/20 backdrop-blur-sm ${stat.textColor}`}>
                {stat.icon}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
