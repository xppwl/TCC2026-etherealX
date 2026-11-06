// Configuração de conexão com o banco de dados (Neon DB PostgreSQL ou MySQL local)
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

let pool;

if (process.env.DATABASE_URL) {
  // Conexão com Neon DB (PostgreSQL)
  const { Pool } = require('pg');

  const pgPool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  });

  // Adapter que emula a interface do mysql2/promise para que nenhuma rota quebre
  pool = {
    isPostgres: true,

    async query(sql, params = []) {
      let paramIdx = 1;
      let pgSql = sql;

      // 1. Substitui GROUP_CONCAT por STRING_AGG
      pgSql = pgSql.replace(/GROUP_CONCAT\((.*?)\s+SEPARATOR\s+['"](.*?)['"]\)/gi, 'STRING_AGG($1, \'$2\')');

      // 2. Substitui INSERT IGNORE INTO
      const isInsertIgnore = /INSERT\s+IGNORE\s+INTO\s+/i.test(pgSql);
      if (isInsertIgnore) {
        pgSql = pgSql.replace(/INSERT\s+IGNORE\s+INTO\s+/gi, 'INSERT INTO ');
        if (!/ON\s+CONFLICT/i.test(pgSql)) {
          pgSql += ' ON CONFLICT DO NOTHING';
        }
      }

      // 3. Substitui ON DUPLICATE KEY UPDATE do histórico
      if (/ON\s+DUPLICATE\s+KEY\s+UPDATE/i.test(pgSql)) {
        pgSql = pgSql.replace(
          /ON\s+DUPLICATE\s+KEY\s+UPDATE[\s\S]*$/i,
          'ON CONFLICT (id_usuario, id_titulo) DO UPDATE SET progresso_segundos = EXCLUDED.progresso_segundos, duracao_segundos = EXCLUDED.duracao_segundos, atualizado_em = CURRENT_TIMESTAMP'
        );
      }

      // 4. Substitui comparações booleanas legado de 0 e 1
      pgSql = pgSql.replace(/\busado\s*=\s*0\b/gi, 'usado = FALSE');
      pgSql = pgSql.replace(/\busado\s*=\s*1\b/gi, 'usado = TRUE');

      // 5. Substitui ? por $1, $2, etc.
      pgSql = pgSql.replace(/\?/g, () => `$${paramIdx++}`);

      // 6. Se for INSERT e não tiver RETURNING nem ON CONFLICT DO NOTHING, adiciona RETURNING *
      const isInsert = /^\s*INSERT\s+INTO/i.test(pgSql);
      if (isInsert && !/RETURNING/i.test(pgSql) && !/ON\s+CONFLICT\s+DO\s+NOTHING/i.test(pgSql)) {
        pgSql += ' RETURNING *';
      }

      const res = await pgPool.query(pgSql, params);

      if (isInsert) {
        const firstRow = res.rows[0] || {};
        const insertId =
          firstRow.id_usuario ||
          firstRow.id_titulo ||
          firstRow.id_verificacao ||
          firstRow.id_recuperacao ||
          firstRow.id_genero ||
          firstRow.id_episodio ||
          0;

        const resultHeader = {
          insertId,
          affectedRows: res.rowCount,
          rows: res.rows,
        };
        return [resultHeader, res.fields];
      }

      return [res.rows, res.fields];
    },

    async getConnection() {
      const client = await pgPool.connect();
      return {
        query: (sql, params) => pool.query(sql, params),
        release: () => client.release(),
      };
    },

    async end() {
      return pgPool.end();
    },
  };

  (async () => {
    try {
      const conn = await pool.getConnection();
      console.log('✅ Conectado com sucesso ao Neon DB (PostgreSQL)!');
      conn.release();
    } catch (err) {
      console.error('❌ Falha ao conectar ao Neon DB:', err.message);
    }
  })();
} else {
  // Fallback MySQL local
  const mysql = require('mysql2/promise');

  pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'etherealx',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    dateStrings: true,
  });

  (async () => {
    try {
      const conn = await pool.getConnection();
      console.log('✅ Conectado ao MySQL (banco: %s)', process.env.DB_NAME || 'etherealx');
      conn.release();
    } catch (err) {
      console.error('❌ Não foi possível conectar ao MySQL:', err.message);
    }
  })();
}

module.exports = pool;
