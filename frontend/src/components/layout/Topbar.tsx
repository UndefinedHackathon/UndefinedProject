// [AI-Agent: Plan] Topbar komponenti — sayfa başlığı ve kullanıcı bilgisi
export default function Topbar() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/80 px-6 backdrop-blur-sm">
      <div />
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground">Demo Admin</span>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
          DA
        </div>
      </div>
    </header>
  );
}
