// [AI-Agent: Skills] Copilot sayfası — AI destekli soru-cevap paneli, backend POST /api/copilot ile entegre
import CopilotPanel from '@/components/copilot/CopilotPanel';

export default function CopilotPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <CopilotPanel />
    </div>
  );
}
