const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const pool = require('../config/db');

async function sync() {
  console.log('🔄 Verificando e criando tabela recuperacao_senha...');
  await pool.query(`
    CREATE TABLE IF NOT EXISTS recuperacao_senha (
      id_recuperacao INT AUTO_INCREMENT PRIMARY KEY,
      id_usuario     INT NOT NULL,
      token          VARCHAR(255) NOT NULL,
      codigo         VARCHAR(10)  NOT NULL,
      expira_em      DATETIME     NOT NULL,
      usado          BOOLEAN      NOT NULL DEFAULT FALSE,
      criado_em      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE
    ) ENGINE=InnoDB;
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS verificacao_cadastro (
      id_verificacao INT AUTO_INCREMENT PRIMARY KEY,
      nome           VARCHAR(100) NOT NULL,
      email          VARCHAR(150) NOT NULL,
      senha_hash     VARCHAR(255) NOT NULL,
      codigo         VARCHAR(10)  NOT NULL,
      expira_em      DATETIME     NOT NULL,
      usado          BOOLEAN      NOT NULL DEFAULT FALSE,
      criado_em      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;
  `);
  console.log('✅ Tabelas recuperacao_senha e verificacao_cadastro prontas!');
  await pool.end();
  process.exit(0);
}

sync().catch(err => {
  console.error('❌ Erro:', err.message);
  process.exit(1);
});
