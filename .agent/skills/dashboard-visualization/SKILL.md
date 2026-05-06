---
name: dashboard-visualization
description: Recharts kullanarak satış trendleri, kâr kaçağı analizi ve stok dağılımı görselleştirmeleri. StockPilot AI'nın "WOW" etkisini yaratan grafik katmanı.
---

# Dashboard Görselleştirme (Recharts)

## Ne Zaman Kullan
- Dashboard sayfasındaki ana grafikleri oluştururken
- Profit Leak Radar sayfasında kayıp analizi yaparken
- Stok durumunu görselleştirirken

## Tasarım Prensipleri
- **Renk Paleti:**
  - Satışlar: `#6366f1` (Indigo)
  - Kâr Kaybı: `#f59e0b` (Amber)
  - Kritik Stok: `#ef4444` (Red)
  - Karşılaştırma: `#10b981` (Emerald)
- **Responsive:** Tüm grafikler `ResponsiveContainer` içinde olmalı.
- **Etkileşim:** Tooltip'ler özelleştirilmeli (TL simgesi, birimler).

## 1. Satış Trend Grafiği (AreaChart)
```tsx
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function SalesTrendChart({ data }) {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <XAxis dataKey="date" axisLine={false} tickLine={false} />
          <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `₺${val}`} />
          <Tooltip 
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            formatter={(val) => [`₺${val}`, 'Satış']}
          />
          <Area type="monotone" dataKey="amount" stroke="#6366f1" fillOpacity={1} fill="url(#colorSales)" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
```

## 2. Profit Leak Radar (ComposedChart)
Teorik vs Gerçek tüketimi yan yana gösterir.
```tsx
import { ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export function ProfitLeakChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <ComposedChart data={data}>
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="theoretical" name="Beklenen (Reçete)" fill="#10b981" radius={[4, 4, 0, 0]} />
        <Bar dataKey="actual" name="Gerçek (Tüketim)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
        <Line type="monotone" dataKey="leak_amount" name="Kayıp TL" stroke="#ef4444" strokeWidth={3} dot={{ r: 6 }} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
```

## 3. Stok Dağılımı (PieChart)
Kritik, Dikkat ve Normal stokların oranını gösterir.
```tsx
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const COLORS = {
  red: '#ef4444',
  yellow: '#f59e0b',
  green: '#10b981'
};

export function StockDistributionChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie
          data={data}
          innerRadius={60}
          outerRadius={80}
          paddingAngle={5}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[entry.status]} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );
}
```

## Hackathon İpucu: Dashboard Animasyonları
Grafiklerin `isAnimationActive={true}` olduğundan emin ol. Dashboard ilk açıldığında grafiklerin "yükselmesi" demoda profesyonel bir hava katar.

## Veri Hazırlama (Zustand Store)
API'den gelen ham veriyi Recharts'ın anlayacağı `Array<{name: string, value: number}>` formatına çeviren selector'lar yazılmalıdır.
