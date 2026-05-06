// [AI-Agent: Skills] Firebase Auth middleware — firebase-auth-setup skill'ine uygun.
// Sorumlu: Samet
// Firebase token doğrulama, DEMO_MODE bypass sistemi dahil.
// Son Güncelleme: 2026-05-06

import { Request, Response, NextFunction } from 'express';
import admin from 'firebase-admin';

// Firebase admin kurulumu (Eğer credentials varsa)
// Hackathon MVP'si için auth genelde bypass ile test edilecek, 
// o yüzden sadece config varsa başlatıyoruz.
if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(require(process.env.FIREBASE_SERVICE_ACCOUNT_PATH)),
    });
    console.log('✅ Firebase Admin başlatıldı.');
  } catch (err) {
    console.error('❌ Firebase Admin başlatılamadı:', err);
  }
}

const DEMO_USER = {
  uid: 'demo-admin-001',
  email: 'demo@stockpilot.ai',
  displayName: 'Demo Admin',
};

// Request tipini extend ederek user propertysini ekleyelim
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export async function authMiddleware(req: Request, res: Response, next: NextFunction): Promise<void> {
  const token = req.headers.authorization?.replace('Bearer ', '');

  // 1. Demo Mode Bypass
  if (!token && process.env.DEMO_MODE === 'true') {
    req.user = DEMO_USER;
    return next();
  }

  // 2. Token Eksik
  if (!token) {
    res.status(401).json({ success: false, error: 'Yetkilendirme tokeni gerekli' });
    return;
  }

  // 3. Token Doğrulama
  try {
    // Eğer firebase app başlatılmadıysa ve demo mode ise izin ver
    if (admin.apps.length === 0 && process.env.DEMO_MODE === 'true') {
      req.user = DEMO_USER;
      return next();
    }
    
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
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
