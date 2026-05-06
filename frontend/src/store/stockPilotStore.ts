// [AI-Agent: Skills] StockPilot AI Zustand store — Backend API ile entegre, AnalizSonucu tipi ile senkronize
import { create } from 'zustand';
import api from '@/lib/api';
import type { AnalizSonucu } from '@/types/stockpilot.types';

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

// ─── Slice Tanımları ─────────────────────────────
interface AnalysisSlice {
  analysisResult: AnalizSonucu | null;
  isAnalyzing: boolean;
  isLoadingAnalysis: boolean;
  runAnalysis: (date?: string) => Promise<void>;
  fetchLatestAnalysis: () => Promise<void>;
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
type StockPilotStore = AnalysisSlice & CopilotSlice & AuthSlice & UISlice;

export const useStore = create<StockPilotStore>((set, get) => ({
  // ─── Analysis (Dashboard + Analyze) ──────────
  analysisResult: null,
  isAnalyzing: false,
  isLoadingAnalysis: false,

  /** POST /api/analyze — yeni analiz çalıştır */
  runAnalysis: async (date) => {
    set({ isAnalyzing: true });
    try {
      const today = date || new Date().toISOString().split('T')[0];
      const res = await api.post('/analyze', { date: today });
      set({ analysisResult: res.data.data as AnalizSonucu, isAnalyzing: false });
      get().addToast({ type: 'success', message: 'Analiz tamamlandı ✅' });
    } catch {
      set({ isAnalyzing: false });
      get().addToast({ type: 'error', message: 'Analiz başarısız oldu' });
    }
  },

  /** GET /api/analyze/latest — son analiz sonucunu çek */
  fetchLatestAnalysis: async () => {
    set({ isLoadingAnalysis: true });
    try {
      const res = await api.get('/analyze/latest');
      const data = res.data.data;
      set({ analysisResult: data as AnalizSonucu | null, isLoadingAnalysis: false });
    } catch {
      set({ isLoadingAnalysis: false });
      // İlk açılışta analiz yoksa hata gösterme
    }
  },

  // ─── Copilot ─────────────────────────────────
  messages: [],
  isThinking: false,
  askCopilot: async (question) => {
    const userMsg: CopilotMessage = { role: 'user', content: question, timestamp: Date.now() };
    set((s) => ({ messages: [...s.messages, userMsg], isThinking: true }));
    try {
      const res = await api.post('/copilot', { question, type: 'free' });
      const aiMsg: CopilotMessage = { role: 'ai', content: res.data.data.answer, timestamp: Date.now() };
      set((s) => ({ messages: [...s.messages, aiMsg], isThinking: false }));
    } catch {
      const errMsg: CopilotMessage = { role: 'ai', content: 'Şu an yanıt veremiyorum. Lütfen daha sonra tekrar deneyin.', timestamp: Date.now() };
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
