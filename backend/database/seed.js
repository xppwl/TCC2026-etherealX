const fs = require('fs');
const path = require('path');
const pool = require('../config/db');

async function seed() {
  console.log('🌱 Populando banco com dados de teste (seed)...');
  await pool.query('SET FOREIGN_KEY_CHECKS = 0');

  let sql = fs.readFileSync(path.join(__dirname, 'seed.sql'), 'utf8');
  // Remove comentários de linha inteira
  sql = sql.replace(/^\s*--.*$/gm, '');

  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.toLowerCase().startsWith('use '));

  for (const stmt of statements) {
    try {
      await pool.query(stmt);
    } catch (err) {
      console.error('❌ Erro no comando:', stmt.slice(0, 80));
      console.error(err.message);
      throw err;
    }
  }

  await pool.query('SET FOREIGN_KEY_CHECKS = 1');
  console.log('✅ Seed executado com sucesso!');
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Falha no seed:', err);
    process.exit(1);
  });

