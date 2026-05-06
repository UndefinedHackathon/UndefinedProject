// [AI-Agent: Plan] Sidebar navigasyon komponenti — tüm sayfalar arası geçiş
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingBasket,
  BookOpen,
  DollarSign,
  Bot,
} from 'lucide-react';

const MENU_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: Package, label: 'Malzemeler', path: '/materials' },
  { icon: ShoppingBasket, label: 'Ürünler', path: '/products' },
  { icon: BookOpen, label: 'Reçeteler', path: '/recipes' },
  { icon: DollarSign, label: 'Satışlar', path: '/sales' },
  { icon: Bot, label: 'Copilot', path: '/copilot' },
];

export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col bg-sidebar-background text-sidebar-foreground">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary text-white font-bold text-sm">
          SP
        </div>
        <span className="text-lg font-semibold">StockPilot AI</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {MENU_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-sidebar-accent text-sidebar-foreground'
                  : 'text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
              }`
            }
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-sidebar-border p-4">
        <p className="text-xs text-sidebar-foreground/40">
          StockPilot AI v1.0 — MVP
        </p>
      </div>
    </aside>
  );
}
