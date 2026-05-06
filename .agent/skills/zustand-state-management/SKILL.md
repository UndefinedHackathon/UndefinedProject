---
name: zustand-state-management
description: StockPilot AI frontend state yönetimi. Zustand store yapısı, slice pattern, async actions, loading/error states ve persist middleware.
---

# Zustand State Management

## Ne Zaman Kullan
- Frontend'de herhangi bir global state gerektiğinde
- API çağrıları yapılırken loading/error yönetimi
- Dashboard, analiz, copilot gibi sayfalar arası veri paylaşımı

## Store Yapısı (Slice Pattern)
```typescript
// src/store/useStore.ts
import { create } from 'zustand';
import { api } from '../lib/api';

// ─── Tipler ──────────────────────────────────────
interface DashboardSlice {
  summary: DashboardSummary | null;
  isLoadingDashboard: boolean;
  fetchDashboard: (date?: string) => Promise<void>;
}

interface AnalysisSlice {
  result: AnalysisResult | null;
  isAnalyzing: boolean;
  runAnalysis: (date?: string) => Promise<void>;
}

interface CopilotSlice {
  messages: CopilotMessage[];
  isThinking: boolean;
  askCopilot: (question: string) => Promise<void>;
  clearChat: () => void;
}

interface AuthSlice {
  user: UserInfo | null;
  isDemoMode: boolean;
  setUser: (user: UserInfo | null) => void;
  setDemoMode: (mode: boolean) => void;
}

interface UISlice {
  sidebarOpen: boolean;
  activeTab: string;
  toasts: Toast[];
  toggleSidebar: () => void;
  setActiveTab: (tab: string) => void;
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

// ─── Birleşik Store ──────────────────────────────
type StockPilotStore = DashboardSlice & AnalysisSlice & CopilotSlice & AuthSlice & UISlice;

export const useStore = create<StockPilotStore>((set, get) => ({
  // ─── Dashboard ───
  summary: null,
  isLoadingDashboard: false,
  fetchDashboard: async (date) => {
    set({ isLoadingDashboard: true });
    try {
      const today = date || new Date().toISOString().split('T')[0];
      const res = await api.get(`/dashboard?date=${today}`);
      set({ summary: res.data.data, isLoadingDashboard: false });
    } catch {
      set({ isLoadingDashboard: false });
      get().addToast({ type: 'error', message: 'Dashboard verisi alınamadı' });
    }
  },

  // ─── Analysis ───
  result: null,
  isAnalyzing: false,
  runAnalysis: async (date) => {
    set({ isAnalyzing: true });
    try {
      const today = date || new Date().toISOString().split('T')[0];
      const res = await api.post('/analyze', { date: today });
      set({ result: res.data.data, isAnalyzing: false });
      get().addToast({ type: 'success', message: 'Analiz tamamlandı ✅' });
      // Analiz sonrası dashboard'u da güncelle
      get().fetchDashboard(today);
    } catch {
      set({ isAnalyzing: false });
      get().addToast({ type: 'error', message: 'Analiz başarısız oldu' });
    }
  },

  // ─── Copilot ───
  messages: [],
  isThinking: false,
  askCopilot: async (question) => {
    const userMsg: CopilotMessage = { role: 'user', content: question, timestamp: Date.now() };
    set((s) => ({ messages: [...s.messages, userMsg], isThinking: true }));
    try {
      const res = await api.post('/copilot', { question });
      const aiMsg: CopilotMessage = { role: 'ai', content: res.data.data.answer, timestamp: Date.now() };
      set((s) => ({ messages: [...s.messages, aiMsg], isThinking: false }));
    } catch {
      const errMsg: CopilotMessage = { role: 'ai', content: 'Şu an yanıt veremiyorum. Dashboard\'dan inceleyin.', timestamp: Date.now() };
      set((s) => ({ messages: [...s.messages, errMsg], isThinking: false }));
    }
  },
  clearChat: () => set({ messages: [] }),

  // ─── Auth ───
  user: null,
  isDemoMode: false,
  setUser: (user) => set({ user }),
  setDemoMode: (mode) => set({ isDemoMode: mode }),

  // ─── UI ───
  sidebarOpen: true,
  activeTab: 'dashboard',
  toasts: [],
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setActiveTab: (tab) => set({ activeTab: tab }),
  addToast: (toast) => set((s) => ({
    toasts: [...s.toasts, { ...toast, id: crypto.randomUUID() }],
  })),
  removeToast: (id) => set((s) => ({
    toasts: s.toasts.filter(t => t.id !== id),
  })),
}));
```

## Kullanım Örnekleri
```tsx
// Sadece ihtiyacın olan parçayı seç (selector)
const summary = useStore((s) => s.summary);
const isLoading = useStore((s) => s.isLoadingDashboard);
const fetchDashboard = useStore((s) => s.fetchDashboard);

// useEffect'te çağır
useEffect(() => { fetchDashboard(); }, []);
```

## Performans Kuralları
- Her zaman **selector** kullan — tüm store'u çekme
- Obje yerine primitif değerler seç: `s.isLoading` > `s.dashboard`
- Ağır objeler için `useShallow` kullanabilirsin:
```tsx
import { useShallow } from 'zustand/react/shallow';
const { result, isAnalyzing } = useStore(useShallow((s) => ({
  result: s.result,
  isAnalyzing: s.isAnalyzing,
})));
```

## Toast Sistemi
```tsx
// components/ToastContainer.tsx
export function ToastContainer() {
  const toasts = useStore((s) => s.toasts);
  const removeToast = useStore((s) => s.removeToast);

  return (
    <div className="fixed bottom-4 right-4 space-y-2 z-50">
      {toasts.map(toast => (
        <div key={toast.id}
             className={`toast toast-${toast.type}`}
             onClick={() => removeToast(toast.id)}>
          {toast.message}
        </div>
      ))}
    </div>
  );
}
```
