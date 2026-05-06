// [AI-Agent: Skills] Hazır soru butonları — backend GET /api/copilot/questions ile entegre
import { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';

interface QuickQuestion {
  id: string;
  text: string;
  icon?: string;
}

// Backend erişilemezse fallback sorular
const FALLBACK_QUESTIONS: QuickQuestion[] = [
  { id: '1', text: 'Bugün en çok satan ürün hangisi?', icon: '🏆' },
  { id: '2', text: 'Kritik stok durumunu özetle', icon: '🔴' },
  { id: '3', text: 'Kâr kaçağı var mı?', icon: '💸' },
  { id: '4', text: 'Hangi malzemeleri sipariş etmeliyim?', icon: '📦' },
  { id: '5', text: 'Reçete sapması tespit edilen malzemeler?', icon: '⚠️' },
  { id: '6', text: 'Günlük satış özetini ver', icon: '📊' },
];

interface QuickQuestionButtonsProps {
  onAsk: (question: string) => void;
  disabled?: boolean;
}

export default function QuickQuestionButtons({ onAsk, disabled }: QuickQuestionButtonsProps) {
  const [questions, setQuestions] = useState<QuickQuestion[]>(FALLBACK_QUESTIONS);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await api.get('/copilot/questions');
        if (res.data.data && Array.isArray(res.data.data)) {
          setQuestions(res.data.data);
        }
      } catch {
        // Fallback sorular zaten yüklü
      }
    };
    fetchQuestions();
  }, []);

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground flex items-center gap-1.5 font-medium">
        <Sparkles className="h-3.5 w-3.5" />
        Hazır Sorular
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {questions.map((q) => (
          <Button
            key={q.id}
            variant="outline"
            size="sm"
            className="justify-start text-left h-auto py-2.5 px-3 text-xs font-normal hover:bg-accent/80 transition-colors"
            onClick={() => onAsk(q.text)}
            disabled={disabled}
          >
            {q.icon && <span className="mr-2 text-sm">{q.icon}</span>}
            {q.text}
          </Button>
        ))}
      </div>
    </div>
  );
}
