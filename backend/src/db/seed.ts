// [AI-Agent: Skills] Seed script — seed.sql dosyasını PostgreSQL'e yükler.
// Kullanım: npm run seed

import fs from 'fs';
import path from 'path';
import pool from './pool';

/**
 * seed.sql dosyasını okuyarak veritabanına demo verisi yükler.
 * Transaction içinde çalışır — herhangi bir hata olursa tüm işlem geri alınır.
 */
async function runSeed(): Promise<void> {
  const seedPath = path.join(__dirname, 'seed.sql');
  const seedSQL = fs.readFileSync(seedPath, 'utf-8');

  const client = await pool.connect();

  try {
    console.log('🌱 Seed verisi yükleniyor...');
    await client.query('BEGIN');
    await client.query(seedSQL);
    await client.query('COMMIT');
    console.log('✅ Seed verisi başarıyla yüklendi!');
    console.log('🌱 Demo verisi yüklendi: 6 ürün, 10 malzeme, reçeteler, stoklar, fiziksel sayım ve satışlar');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Seed verisi yüklenirken hata:', err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

// Doğrudan çalıştırıldığında seed'i başlat
runSeed()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
