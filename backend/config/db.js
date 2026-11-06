// Pool de conexões com o MySQL (banco criado no MySQL Workbench: ethereal_streaming)
const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const pool = mysql.createPool({
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

// Testa a conexão assim que o servidor sobe, pra dar um erro claro se algo estiver errado
(async () => {
  try {
    const conn = await pool.getConnection();
    console.log('✅ Conectado ao MySQL (banco: %s)', process.env.DB_NAME || 'etherealx');
    conn.release();
  } catch (err) {
    console.error('❌ Não foi possível conectar ao MySQL. Confira o .env e se o MySQL Workbench/servidor está rodando.');
    console.error(err.message);
  }
})();

module.exports = pool;
