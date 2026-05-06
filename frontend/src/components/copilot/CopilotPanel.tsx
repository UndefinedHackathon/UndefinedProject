// [AI-Agent: Skills] Copilot panel — chat arayüzü, mesaj listesi, input ve hazır soru butonları
import { useState, useRef, useEffect } from 'react';
import { Send, Trash2, Loader2, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useStore } from '@/store/stockPilotStore';
import ChatMessage from './ChatMessage';
import QuickQuestionButtons from './QuickQuestionButtons';

export default function CopilotPanel() {
  const { messages, isThinking, askCopilot, clearChat } = useStore();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Yeni mesajda otomatik scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    const question = input.trim();
    if (!question || isThinking) return;
    setInput('');
    await askCopilot(question);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleQuickQuestion = async (question: string) => {
    await askCopilot(question);
  };

  return (
    <Card className="flex flex-col h-[calc(100vh-10rem)] border-border/50">
      {/* Header */}
      <CardHeader className="pb-3 border-b shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="p-1.5 rounded-lg bg-indigo-500/15">
              <Bot className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            StockPilot Copilot
          </CardTitle>
          {messages.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearChat}
              className="text-muted-foreground hover:text-destructive text-xs"
            >
              <Trash2 className="h-3.5 w-3.5 mr-1.5" />
              Temizle
            </Button>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          ERP analiz sonuçlarınıza dayalı AI asistanınız. Sadece verilerinizden cevap verir.
        </p>
      </CardHeader>

      {/* Mesajlar */}
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full space-y-6">
            {/* Hoşgeldin mesajı */}
            <div className="text-center space-y-2">
              <div className="mx-auto w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center">
                <Bot className="h-6 w-6 text-indigo-500" />
              </div>
              <h3 className="font-semibold text-sm">Merhaba! 👋</h3>
              <p className="text-xs text-muted-foreground max-w-xs">
                Size stok durumu, satış analizi ve satın alma önerileri hakkında yardımcı olabilirim.
              </p>
            </div>
            {/* Hazır sorular */}
            <QuickQuestionButtons onAsk={handleQuickQuestion} disabled={isThinking} />
          </div>
        ) : (
          <>
            {messages.map((msg, idx) => (
              <ChatMessage
                key={idx}
                role={msg.role}
                content={msg.content}
                timestamp={msg.timestamp}
              />
            ))}
            {isThinking && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-xs">Copilot düşünüyor...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </CardContent>

      {/* Hazır Sorular (mesaj varken de göster — aşağıda) */}
      {messages.length > 0 && (
        <div className="px-4 pb-2 shrink-0">
          <QuickQuestionButtons onAsk={handleQuickQuestion} disabled={isThinking} />
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t shrink-0">
        <div className="flex items-center gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Bir soru sorun..."
            disabled={isThinking}
            className="flex-1"
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isThinking}
            size="icon"
            className="shrink-0"
          >
            {isThinking ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
}
