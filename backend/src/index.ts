// [AI-Agent: Skills] Express sunucu yapılandırması — coding-standards, error-handling-patterns skill'lerine uygun.
// Sorumlu: Emre
// CORS, helmet, morgan middleware'leri ile güvenli ve loglanabilir API sunucusu.
// Son Güncelleme: 2026-05-06

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
import materialsRouter from './routes/materials.route';
import productsRouter from './routes/products.route';
import recipesRouter from './routes/recipes.route';
import salesRouter from './routes/sales.route';

// .env dosyasını yükle (Global .env root klasöründe)
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// ─── Sabitler ────────────────────────────────────────────────
const PORT = Number(process.env.PORT) || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const IS_DEMO_MODE = process.env.DEMO_MODE === 'true';
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

// ─── Express Uygulaması ─────────────────────────────────────
const app = express();

// ─── Middleware Katmanı ─────────────────────────────────────
app.use(helmet());                              // Güvenlik başlıkları (XSS, clickjacking vb.)
app.use(cors({
  origin: FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(morgan(IS_PRODUCTION ? 'combined' : 'dev'));  // HTTP istek logları
app.use(express.json({ limit: '10mb' }));       // JSON body parser
app.use(express.urlencoded({ extended: true })); // URL-encoded body parser

// ─── Health Check Endpoint ──────────────────────────────────
/**
 * Sunucu ve veritabanı sağlık kontrolü.
 * Frontend bağlantı kontrolü ve monitoring için kullanılır.
 */
app.get('/api/health', async (_req, res) => {
  try {
    const result = await pool.query('SELECT NOW() as current_time');
    res.json({
      success: true,
      data: {
        status: 'healthy',
        timestamp: result.rows[0].current_time,
        uptime: process.uptime(),
        demoMode: IS_DEMO_MODE,
        version: '1.0.0',
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

// ─── API Route'ları ─────────────────────────────────────────
// Aşama 2 — CRUD route'ları (Emre)
app.use('/api/materials',  materialsRouter);
app.use('/api/products',   productsRouter);
app.use('/api/recipes',    recipesRouter);
app.use('/api/sales',      salesRouter);

// Aşama 3 — Samet tarafından eklenecek:
// app.use('/api/analyze',    analyzeRouter);

// Aşama 4 — Samet tarafından eklenecek:
// app.use('/api/copilot',    copilotRouter);

// Aşama 5 — Opsiyonel:
// app.use('/api/n8n',        n8nRouter);

// ─── 404 Handler ────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint bulunamadı',
  });
});

// ─── Global Error Handler ───────────────────────────────────
/**
 * Tüm yakalanmamış Express hatalarını yakalar.
 * Production'da detay göstermez, development'ta gösterir.
 */
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('❌ Sunucu hatası:', err.message);

  // Stack trace sadece development modda logla
  if (!IS_PRODUCTION) {
    console.error(err.stack);
  }

  res.status(500).json({
    success: false,
    error: IS_PRODUCTION ? 'Sunucu hatası' : err.message,
  });
});

// ─── Sunucuyu Başlat ────────────────────────────────────────
const server = app.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════════════╗
  ║   🚀 StockPilot AI Backend Çalışıyor    ║
  ║   📡 Port: ${String(PORT).padEnd(28)}║
  ║   🗄️  DB: PostgreSQL                    ║
  ║   🌐 CORS: ${FRONTEND_URL.padEnd(27)}║
  ║   🔧 Mod: ${(IS_DEMO_MODE ? 'DEMO' : 'PRODUCTION').padEnd(29)}║
  ╚══════════════════════════════════════════╝
  `);
});

// ─── Graceful Shutdown ──────────────────────────────────────
/**
 * Sunucu kapatılırken aktif bağlantıları düzgün biçimde sonlandırır.
 * Ctrl+C veya process.kill sinyallerini yakalar.
 */
function gracefulShutdown(signal: string): void {
  console.log(`\n⚠️ ${signal} sinyali alındı. Sunucu kapatılıyor...`);
  server.close(async () => {
    try {
      await pool.end();
      console.log('✅ PostgreSQL bağlantı havuzu kapatıldı');
    } catch (err) {
      console.error('❌ Pool kapatma hatası:', err);
    }
    console.log('👋 StockPilot AI Backend kapatıldı');
    process.exit(0);
  });

  // 10 saniye içinde kapanmazsa zorla kapat
  setTimeout(() => {
    console.error('❌ Sunucu zamanında kapatılamadı, zorla kapatılıyor...');
    process.exit(1);
  }, 10000);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

export default app;
