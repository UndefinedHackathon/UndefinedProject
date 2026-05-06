// [AI-Agent: Skills] Login sayfası — Firebase Email/Password auth
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { LogIn, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/');
    } catch (err: unknown) {
      const firebaseError = err as { code?: string };
      switch (firebaseError.code) {
        case 'auth/user-not-found':
          setError('Bu e-posta ile kayıtlı kullanıcı bulunamadı.');
          break;
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          setError('E-posta veya şifre hatalı.');
          break;
        case 'auth/invalid-email':
          setError('Geçersiz e-posta formatı.');
          break;
        case 'auth/too-many-requests':
          setError('Çok fazla deneme yapıldı. Lütfen biraz bekleyin.');
          break;
        default:
          setError('Giriş yapılamadı. Lütfen tekrar deneyin.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo & Başlık */}
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-xl shadow-lg">
            SP
          </div>
          <h1 className="text-2xl font-bold tracking-tight">StockPilot</h1>
          <p className="text-sm text-muted-foreground">
            Kafe & Restoran Stok Yönetim Sistemi
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Giriş Yap</CardTitle>
            <CardDescription>
              E-posta ve şifrenizle hesabınıza giriş yapın.
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4">
              {/* Error mesajı */}
              {error && (
                <div className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">E-posta</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="ornek@restoran.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Şifre</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  minLength={6}
                  disabled={loading}
                />
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-3">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <LogIn className="mr-2 h-4 w-4" />
                )}
                {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Hesabınız yok mu?{' '}
                <Link
                  to="/register"
                  className="font-medium text-primary underline-offset-4 hover:underline"
                >
                  Kayıt Ol
                </Link>
              </p>

              {/* Demo Admin bypass — hackathon sunumu için */}
              <div className="w-full border-t pt-3">
                <button
                  type="button"
                  className="w-full text-sm text-muted-foreground hover:text-primary transition-colors underline underline-offset-4"
                  onClick={() => {
                    localStorage.setItem('demo_mode', 'true');
                    navigate('/');
                  }}
                >
                  🔓 Demo Admin olarak devam et
                </button>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
