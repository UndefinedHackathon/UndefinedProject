// [AI-Agent: Skills] Chat mesaj komponenti — kullanıcı ve AI mesajlarını gösterir
import { Bot, User } from 'lucide-react';

interface ChatMessageProps {
  role: 'user' | 'ai';
  content: string;
  timestamp: number;
}

export default function ChatMessage({ role, content, timestamp }: ChatMessageProps) {
  const isAI = role === 'ai';
  const time = new Date(timestamp).toLocaleTimeString('tr-TR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className={`flex gap-3 ${isAI ? '' : 'flex-row-reverse'}`}>
      {/* Avatar */}
      <div
        className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isAI
            ? 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400'
            : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
        }`}
      >
        {isAI ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
      </div>

      {/* Mesaj Balonu */}
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
          isAI
            ? 'bg-muted rounded-tl-sm'
            : 'bg-primary text-primary-foreground rounded-tr-sm'
        }`}
      >
        <p className="text-sm whitespace-pre-line leading-relaxed">{content}</p>
        <p
          className={`text-[10px] mt-1.5 ${
            isAI ? 'text-muted-foreground' : 'text-primary-foreground/60'
          }`}
        >
          {time}
        </p>
      </div>
    </div>
  );
}
