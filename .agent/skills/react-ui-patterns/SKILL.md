---
name: react-ui-patterns
description: StockPilot AI frontend component yapısı, Tailwind + shadcn/ui kullanım kuralları, Zustand store yapısı, Recharts grafik kalıpları ve responsive tasarım kuralları.
---

# React UI Kalıpları

## Component Hiyerarşisi
```
App.tsx
├── components/
│   ├── layout/ (Sidebar, Topbar, AppLayout)
│   ├── dashboard/ (StatCards, CriticalStockCards, ProfitLeakCards, PurchaseRecommendations)
│   ├── materials/ (MaterialForm, MaterialTable)
│   ├── products/ (ProductForm, ProductTable)
│   ├── recipes/ (RecipeForm, RecipeTable)
│   ├── sales/ (SalesForm, SalesTable)
│   ├── copilot/ (CopilotPanel, QuickQuestionButtons, ChatMessage)
│   └── ui/ (shadcn/ui bileşenleri)
└── pages/
    ├── LoginPage.tsx
    ├── RegisterPage.tsx
    ├── DashboardPage.tsx
    ├── MaterialsPage.tsx
    ├── ProductsPage.tsx
    ├── RecipesPage.tsx
    ├── SalesPage.tsx
    └── CopilotPage.tsx
```

## Zustand Store Yapısı
```typescript
import { create } from 'zustand';

interface StockPilotState {
  // Data
  dashboardSummary: DashboardSummary | null;
  analysisResult: AnalysisResult | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchDashboard: (date: string) => Promise<void>;
  runAnalysis: (date: string) => Promise<void>;
  clearError: () => void;
}

export const useStore = create<StockPilotState>((set) => ({
  dashboardSummary: null,
  analysisResult: null,
  isLoading: false,
  error: null,

  fetchDashboard: async (date) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get(`/dashboard?date=${date}`);
      set({ dashboardSummary: res.data.data, isLoading: false });
    } catch (err) {
      set({ error: 'Dashboard verisi alınamadı', isLoading: false });
    }
  },

  runAnalysis: async (date) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post('/analyze', { date });
      set({ analysisResult: res.data.data, isLoading: false });
    } catch (err) {
      set({ error: 'Analiz başarısız', isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
```

## Trafik Işığı Komponenti
```tsx
interface TrafficLightProps {
  status: 'green' | 'yellow' | 'red';
  label?: string;
}

export function TrafficLight({ status, label }: TrafficLightProps) {
  const colors = {
    green: 'bg-emerald-500',
    yellow: 'bg-amber-400',
    red: 'bg-red-500 animate-pulse',  // kırmızı = yanıp sönme
  };

  return (
    <span className={`inline-block w-3 h-3 rounded-full ${colors[status]}`}
          title={label} />
  );
}
```

## Dashboard Kart Renkleri
```typescript
const CARD_THEMES = {
  revenue:       'bg-gradient-to-br from-blue-500 to-blue-700',
  critical:      'bg-gradient-to-br from-red-500 to-rose-700',
  profit_leak:   'bg-gradient-to-br from-amber-500 to-orange-700',
  top_seller:    'bg-gradient-to-br from-purple-500 to-violet-700',
};
```

## Recharts Grafik Şablonu
```tsx
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export function SalesChart({ data }: { data: SalesData[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <XAxis dataKey="product_name" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="quantity" fill="#6366f1" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
```

## Responsive Kurallar
- Mobil: 1 kolon (Dashboard kartları alt alta)
- Tablet: 2 kolon
- Desktop: 4 kolon kartlar + sidebar
```tsx
// Grid sistemi
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  {cards.map(card => <DashboardCard key={card.id} {...card} />)}
</div>
```

## Loading States
```tsx
// Her sayfada loading state olmalı
{isLoading ? (
  <div className="flex items-center justify-center h-64">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
    <span className="ml-3 text-gray-400">Analiz çalıştırılıyor...</span>
  </div>
) : (
  <AnalysisResults data={analysisResult} />
)}
```

## Sidebar Navigasyon Menüsü
```typescript
const MENU_ITEMS = [
  { icon: '📊', label: 'Dashboard',  path: '/' },
  { icon: '🧀', label: 'Malzemeler', path: '/materials' },
  { icon: '🍔', label: 'Ürünler',    path: '/products' },
  { icon: '📝', label: 'Reçeteler',  path: '/recipes' },
  { icon: '💰', label: 'Satışlar',   path: '/sales' },
  { icon: '🤖', label: 'Copilot',    path: '/copilot' },
];
```
