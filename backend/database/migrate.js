const pool = require('../config/db');

async function migrate() {
  console.log('🔄 Iniciando migração e sincronização do banco...');
  await pool.query('SET FOREIGN_KEY_CHECKS = 0');

  // Salva usuários antigos se existirem
  let oldUsers = [];
  try {
    const [u] = await pool.query('SELECT * FROM usuarios');
    oldUsers = u;
    console.log(`Preservando ${oldUsers.length} usuário(s) existente(s)...`);
  } catch (e) {
    // tabela não existia
  }

  const dropTables = [
    'avaliacoes',
    'filme_genero',
    'serie_genero',
    'filmes',
    'series',
    'titulo_genero',
    'episodios',
    'favoritos',
    'minha_lista',
    'historico',
    'recuperacao_senha',
    'titulos',
    'generos',
    'usuarios'
  ];

  for (const t of dropTables) {
    await pool.query(`DROP TABLE IF EXISTS ${t}`);
  }

  await pool.query(`
    CREATE TABLE usuarios (
      id_usuario        INT AUTO_INCREMENT PRIMARY KEY,
      nome              VARCHAR(100)  NOT NULL,
      email             VARCHAR(150)  NOT NULL UNIQUE,
      senha             VARCHAR(255)  NULL,
      google_id         VARCHAR(100)  NULL UNIQUE,
      avatar_url        VARCHAR(255)  NULL,
      autoplay          BOOLEAN       NOT NULL DEFAULT TRUE,
      qualidade_padrao  ENUM('auto','480p','720p','1080p','4k') NOT NULL DEFAULT 'auto',
      legendas_padrao   BOOLEAN       NOT NULL DEFAULT FALSE,
      notificacoes_email BOOLEAN      NOT NULL DEFAULT TRUE,
      criado_em         TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;
  `);

  for (const u of oldUsers) {
    await pool.query(
      'INSERT IGNORE INTO usuarios (id_usuario, nome, email, senha, avatar_url) VALUES (?, ?, ?, ?, ?)',
      [u.id_usuario || u.id, u.nome, u.email, u.senha, u.foto_perfil || u.avatar_url || null]
    );
  }

  await pool.query(`
    CREATE TABLE generos (
      id_genero   INT AUTO_INCREMENT PRIMARY KEY,
      nome        VARCHAR(60) NOT NULL UNIQUE,
      slug        VARCHAR(60) NOT NULL UNIQUE,
      icone       VARCHAR(10) NULL
    ) ENGINE=InnoDB;
  `);

  await pool.query(`
    CREATE TABLE titulos (
      id_titulo         INT AUTO_INCREMENT PRIMARY KEY,
      tipo              ENUM('filme','serie') NOT NULL,
      titulo            VARCHAR(150) NOT NULL,
      sinopse           TEXT NULL,
      ano_lancamento    YEAR NULL,
      classificacao     VARCHAR(10) NULL,
      duracao_minutos   INT NULL,
      nota              DECIMAL(3,1) NULL,
      poster_url        VARCHAR(255) NULL,
      banner_url        VARCHAR(255) NULL,
      video_url         VARCHAR(255) NULL,
      destaque          BOOLEAN NOT NULL DEFAULT FALSE,
      em_alta           BOOLEAN NOT NULL DEFAULT FALSE,
      criado_em         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;
  `);

  await pool.query(`
    CREATE TABLE titulo_genero (
      id_titulo   INT NOT NULL,
      id_genero   INT NOT NULL,
      PRIMARY KEY (id_titulo, id_genero),
      FOREIGN KEY (id_titulo) REFERENCES titulos(id_titulo) ON DELETE CASCADE,
      FOREIGN KEY (id_genero) REFERENCES generos(id_genero) ON DELETE CASCADE
    ) ENGINE=InnoDB;
  `);

  await pool.query(`
    CREATE TABLE episodios (
      id_episodio         INT AUTO_INCREMENT PRIMARY KEY,
      id_titulo           INT NOT NULL,
      numero_temporada    INT NOT NULL DEFAULT 1,
      numero_episodio     INT NOT NULL,
      titulo_episodio     VARCHAR(150) NOT NULL,
      duracao_minutos     INT NULL,
      video_url           VARCHAR(255) NULL,
      FOREIGN KEY (id_titulo) REFERENCES titulos(id_titulo) ON DELETE CASCADE
    ) ENGINE=InnoDB;
  `);

  await pool.query(`
    CREATE TABLE favoritos (
      id_usuario  INT NOT NULL,
      id_titulo   INT NOT NULL,
      criado_em   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id_usuario, id_titulo),
      FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
      FOREIGN KEY (id_titulo) REFERENCES titulos(id_titulo) ON DELETE CASCADE
    ) ENGINE=InnoDB;
  `);

  await pool.query(`
    CREATE TABLE minha_lista (
      id_usuario  INT NOT NULL,
      id_titulo   INT NOT NULL,
      criado_em   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id_usuario, id_titulo),
      FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
      FOREIGN KEY (id_titulo) REFERENCES titulos(id_titulo) ON DELETE CASCADE
    ) ENGINE=InnoDB;
  `);

  await pool.query(`
    CREATE TABLE historico (
      id_usuario          INT NOT NULL,
      id_titulo           INT NOT NULL,
      progresso_segundos  INT NOT NULL DEFAULT 0,
      duracao_segundos    INT NOT NULL DEFAULT 0,
      atualizado_em       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id_usuario, id_titulo),
      FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
      FOREIGN KEY (id_titulo) REFERENCES titulos(id_titulo) ON DELETE CASCADE
    ) ENGINE=InnoDB;
  `);

  await pool.query(`
    CREATE TABLE recuperacao_senha (
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

  await pool.query('SET FOREIGN_KEY_CHECKS = 1');
  console.log('✅ Tabelas criadas com sucesso!');
}

migrate()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Erro na migração:', err);
    process.exit(1);
  });
