const pool = require('../config/db');

async function updateSchema() {
  try {
    console.log('🔄 Atualizando colunas da tabela titulos...');
    await pool.query("ALTER TABLE titulos MODIFY COLUMN tipo VARCHAR(30) NOT NULL DEFAULT 'filme'");
    await pool.query("ALTER TABLE titulos MODIFY COLUMN poster_url VARCHAR(500) NULL");
    await pool.query("ALTER TABLE titulos MODIFY COLUMN banner_url VARCHAR(500) NULL");
    await pool.query("ALTER TABLE titulos MODIFY COLUMN video_url VARCHAR(500) NULL");

    const [cols] = await pool.query('SHOW COLUMNS FROM titulos');
    const colNames = cols.map((c) => c.Field);

    if (!colNames.includes('embed_url')) {
      await pool.query('ALTER TABLE titulos ADD COLUMN embed_url VARCHAR(500) NULL');
      console.log('✅ Coluna embed_url adicionada.');
    }
    if (!colNames.includes('tmdb_id')) {
      await pool.query('ALTER TABLE titulos ADD COLUMN tmdb_id INT NULL');
      console.log('✅ Coluna tmdb_id adicionada.');
    }
    if (!colNames.includes('imdb_id')) {
      await pool.query('ALTER TABLE titulos ADD COLUMN imdb_id VARCHAR(50) NULL');
      console.log('✅ Coluna imdb_id adicionada.');
    }

    console.log('🎉 Tabela titulos atualizada com sucesso!');
  } catch (err) {
    console.error('❌ Erro ao atualizar schema:', err);
  } finally {
    process.exit(0);
  }
}

updateSchema();
