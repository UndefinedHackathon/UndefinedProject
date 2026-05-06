// [AI-Agent: Skills] Ana uygulama dosyası — React Router DOM ile sayfa routing yapısı
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { AuthGuard } from '@/components/AuthGuard';
import AppLayout from '@/components/layout/AppLayout';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import DashboardPage from '@/pages/DashboardPage';
import MaterialsPage from '@/pages/MaterialsPage';
import ProductsPage from '@/pages/ProductsPage';
import RecipesPage from '@/pages/RecipesPage';
import SalesPage from '@/pages/SalesPage';
import CopilotPage from '@/pages/CopilotPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth sayfaları — layout dışı */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Ana uygulama — AuthGuard + AppLayout içinde */}
        <Route element={<AuthGuard><AppLayout /></AuthGuard>}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/materials" element={<MaterialsPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/recipes" element={<RecipesPage />} />
          <Route path="/sales" element={<SalesPage />} />
          <Route path="/copilot" element={<CopilotPage />} />
        </Route>
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
}
