// [AI-Agent: Skills] PostgreSQL bağlantı havuzu — environment-setup-guide ve postgresql-patterns skill'lerine uygun.
// Manuel revizyon: Emre tarafından kontrol edilecek.

import { Pool, QueryResult, QueryResultRow } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

/**
 * PostgreSQL bağlantı havuzu.
 * DATABASE_URL ortam değişkeninden bağlantı bilgilerini alır.
 */
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

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
