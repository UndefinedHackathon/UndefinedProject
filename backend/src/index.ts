// [AI-Agent: Skills] Express sunucu yapılandırması — coding-standards ve error-handling-patterns skill'lerine uygun.
// CORS, helmet, morgan middleware'leri ile güvenli ve loglanabilir API sunucusu.

// 1. Node.js built-in
import path from 'path';

// 2. Üçüncü parti
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

// 3. Proje dosyaları
import pool from './db/pool';

// .env dosyasını yükle
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// ─── Middleware ──────────────────────────────────────────────
app.use(helmet());                            // Güvenlik başlıkları
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(morgan('dev'));                       // HTTP istek logları
app.use(express.json({ limit: '10mb' }));     // JSON body parser

// ─── Health Check ───────────────────────────────────────────
app.get('/api/health', async (_req, res) => {
  try {
    const result = await pool.query('SELECT NOW() as current_time');
    res.json({
      success: true,
      data: {
        status: 'healthy',
        timestamp: result.rows[0].current_time,
        demoMode: process.env.DEMO_MODE === 'true',
      },
    });
  } catch (err) {
    console.error('❌ Health check hatası:', err);
    res.status(503).json({
      success: false,
      error: 'Veritabanı bağlantısı kurulamadı',
    });
  }
});

// ─── Route'lar (Aşama 2'de eklenecek) ──────────────────────
// TODO: materials.route.ts
// TODO: products.route.ts
// TODO: recipes.route.ts
// TODO: sales.route.ts
// TODO: analyze.route.ts
// TODO: copilot.route.ts

// ─── 404 Handler ────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint bulunamadı',
  });
});

// ─── Global Error Handler ───────────────────────────────────
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('❌ Sunucu hatası:', err.message);
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'production'
      ? 'Sunucu hatası'
      : err.message,
  });
});

// ─── Sunucuyu Başlat ────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════════════╗
  ║   🚀 StockPilot AI Backend Çalışıyor    ║
  ║   📡 Port: ${String(PORT).padEnd(28)}║
  ║   🗄️  DB: PostgreSQL                    ║
  ║   🔧 Mod: ${process.env.DEMO_MODE === 'true' ? 'DEMO'.padEnd(29) : 'PRODUCTION'.padEnd(29)}║
  ╚══════════════════════════════════════════╝
  `);
});

export default app;
