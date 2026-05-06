// [AI-Agent: Skills] PostgreSQL bağlantı havuzu — environment-setup-guide ve postgresql-patterns skill'lerine uygun.
// Manuel revizyon: Emre tarafından kontrol edilecek.

import { Pool, QueryResult, QueryResultRow } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

// Global .env root klasöründe
const envPath = path.resolve(__dirname, '../../../.env');
dotenv.config({ path: envPath });

// Fallback: Eğer dotenv .env'yi bulamadıysa, override ile tekrar dene
if (!process.env.DATABASE_URL) {
  dotenv.config({ path: path.resolve(__dirname, '../../../.env'), override: true });
}

console.log(`🔧 Pool .env path: ${envPath}`);
console.log(`🔧 DATABASE_URL: ${process.env.DATABASE_URL ? '✅ yüklendi' : '❌ bulunamadı'}`);

/**
 * PostgreSQL bağlantı havuzu.
 * DATABASE_URL ortam değişkeninden bağlantı bilgilerini alır.
 * Fallback: Ayrı DB_* env değişkenlerini kullanır.
 */
const pool = new Pool(
  process.env.DATABASE_URL
    ? { connectionString: process.env.DATABASE_URL }
    : {
        host: process.env.DB_HOST || 'localhost',
        port: Number(process.env.DB_PORT) || 5432,
        database: process.env.DB_NAME || 'stockpilot',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
      }
);

// Bağlantı testi
pool.on('connect', () => {
  console.log('✅ PostgreSQL bağlantısı kuruldu');
});

pool.on('error', (err: Error) => {
  console.error('❌ PostgreSQL havuz hatası:', err.message);
  process.exit(-1);
});

/**
 * Parameterized SQL sorgusu çalıştırır.
 * SQL injection koruması için her zaman bu fonksiyonu kullan.
 * @param text - SQL sorgu metni ($1, $2 parametreleri ile)
 * @param params - Sorgu parametreleri
 * @returns QueryResult
 */
export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: (string | number | boolean | null | Date | object)[]
): Promise<QueryResult<T>> {
  const start = Date.now();
  const result = await pool.query<T>(text, params);
  const duration = Date.now() - start;

  // Sadece geliştirme ortamında sorgu logla
  if (process.env.NODE_ENV !== 'production') {
    console.log(`🔍 Query [${duration}ms] ${text.substring(0, 80)}...`);
  }

  return result;
}

/**
 * Transaction işlemleri için pool'dan client alır.
 * Kullanımdan sonra mutlaka release() çağrılmalı.
 */
export async function getClient() {
  const client = await pool.connect();
  return client;
}

export { pool };
export default pool;
