---
name: firebase-auth-setup
description: Firebase Authentication kurulumu, kayıt/giriş ekranları, token doğrulama middleware'i ve Demo Admin bypass sistemi. Auth çalışmazsa fallback mekanizması dahil.
---

# Firebase Authentication

## Ne Zaman Kullan
- Login / Register ekranları oluşturulurken
- Backend'de auth middleware yazarken
- Token doğrulama gerektiğinde
- Demo modda auth bypass edilirken

## Firebase Kurulumu

### Frontend (React)
```typescript
// src/lib/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
```

### Kayıt (Register)
```typescript
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '../lib/firebase';

const register = async (email: string, password: string, name: string) => {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(credential.user, { displayName: name });
  return credential.user;
};
```

### Giriş (Login)
```typescript
import { signInWithEmailAndPassword } from 'firebase/auth';

const login = async (email: string, password: string) => {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
};
```

### Çıkış (Logout)
```typescript
import { signOut } from 'firebase/auth';
const logout = () => signOut(auth);
```

## Backend Auth Middleware
```typescript
// src/middleware/auth.ts
import admin from 'firebase-admin';

const DEMO_USER = {
  uid: 'demo-admin-001',
  email: 'demo@stockpilot.ai',
  displayName: 'Demo Admin',
};

export async function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');

  // Demo mode bypass
  if (!token && process.env.DEMO_MODE === 'true') {
    req.user = DEMO_USER;
    return next();
  }

  if (!token) {
    return res.status(401).json({ success: false, error: 'Token gerekli' });
  }

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    console.warn('⚠️ Token doğrulanamadı, demo mod kontrol ediliyor');
    if (process.env.DEMO_MODE === 'true') {
      req.user = DEMO_USER;
      return next();
    }
    res.status(401).json({ success: false, error: 'Geçersiz token' });
  }
}
```

## Frontend Auth Guard
```tsx
// src/components/AuthGuard.tsx
import { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../lib/firebase';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
  }, []);

  if (loading) return <LoadingSpinner />;
  if (!user) return <LoginPage />;
  return <>{children}</>;
}
```

## Demo Admin Bypass Butonu
```tsx
// LoginPage.tsx içinde
<button
  className="text-sm text-gray-400 hover:text-white underline"
  onClick={() => {
    // Demo modda direkt giriş
    localStorage.setItem('demo_mode', 'true');
    navigate('/dashboard');
  }}
>
  🔓 Demo Admin olarak devam et
</button>
```

## Axios Token Interceptor
```typescript
// Her API isteğinde token gönder
api.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

## Environment Variables
```env
# Frontend (.env)
VITE_FIREBASE_API_KEY=xxx
VITE_FIREBASE_AUTH_DOMAIN=stockpilot-ai.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=stockpilot-ai

# Backend (.env)
FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json
DEMO_MODE=true
```

## Risk Azaltma
- Firebase config eksikse veya çalışmıyorsa → "Demo Admin" bypass butonu aktif
- `DEMO_MODE=true` ise backend tüm istekleri kabul eder
- Hackathon'da zaman kaybetmemek için AUTH'u en son kur; önce demo mod ile geliştir
