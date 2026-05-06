// [AI-Agent: Skills] StockPilot AI Zustand store — Slice pattern ile global state yönetimi
import { create } from 'zustand';
import api from '@/lib/api';

// ─── Yardımcı Tipler ─────────────────────────────
interface UserInfo {
  uid: string;
  email: string | null;
  displayName: string | null;
}

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface CopilotMessage {
  role: 'user' | 'ai';
  content: string;
  timestamp: number;
}

interface DashboardSummary {
  totalProducts: number;
  totalIngredients: number;
  totalSales: number;
  totalRevenue: number;
  criticalStockItems: number;
  date: string;
}

interface AnalysisResult {
  date: string;
  theoreticalConsumption: Record<string, number>;
  criticalStockAlerts: string[];
  purchaseSuggestions: string[];
  summary: string;
}

// ─── Slice Tanımları ─────────────────────────────
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
  // ─── Dashboard ───────────────────────────────
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

  // ─── Analysis ────────────────────────────────
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

  // ─── Copilot ─────────────────────────────────
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

  // ─── Auth ────────────────────────────────────
  user: null,
  isDemoMode: false,
  setUser: (user) => set({ user }),
  setDemoMode: (mode) => set({ isDemoMode: mode }),

  // ─── UI ──────────────────────────────────────
  sidebarOpen: true,
  activeTab: 'dashboard',
  toasts: [],
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setActiveTab: (tab) => set({ activeTab: tab }),
  addToast: (toast) => set((s) => ({
    toasts: [...s.toasts, { ...toast, id: crypto.randomUUID() }],
  })),
  removeToast: (id) => set((s) => ({
    toasts: s.toasts.filter((t) => t.id !== id),
  })),
}));
