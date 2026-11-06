const pool = require('../config/db');
const fs = require('fs');
const path = require('path');

function escapeSql(val) {
  if (val === null || val === undefined) return 'NULL';
  if (typeof val === 'boolean') return val ? 'TRUE' : 'FALSE';
  if (typeof val === 'number') return String(val);
  if (val instanceof Date) return `'${val.toISOString()}'`;
  // String
  return `'${String(val).replace(/'/g, "''")}'`;
}

async function exportPostgres() {
  console.log('📦 Lendo dados do MySQL para gerar script PostgreSQL (Neon DB)...');

  let sql = `-- ============================================================
-- ETHEREAL X - SCRIPT POSTGRESQL PARA NEON DB (neon.tech)
-- Compatível com PostgreSQL 14, 15, 16 e Neon Serverless
-- Todas as tabelas em Português conforme o projeto original.
-- ============================================================

-- Remove tabelas antigas se existirem (ordem inversa de dependência)
DROP TABLE IF EXISTS historico CASCADE;
DROP TABLE IF EXISTS favoritos CASCADE;
DROP TABLE IF EXISTS minha_lista CASCADE;
DROP TABLE IF EXISTS recuperacao_senha CASCADE;
DROP TABLE IF EXISTS verificacao_cadastro CASCADE;
DROP TABLE IF EXISTS episodios CASCADE;
DROP TABLE IF EXISTS titulo_genero CASCADE;
DROP TABLE IF EXISTS titulos CASCADE;
DROP TABLE IF EXISTS generos CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;

-- -------------------------------------------------------------
-- 1. TABELA: usuarios
-- -------------------------------------------------------------
CREATE TABLE usuarios (
  id_usuario         SERIAL PRIMARY KEY,
  nome               VARCHAR(100) NOT NULL,
  email              VARCHAR(150) NOT NULL UNIQUE,
  senha              VARCHAR(255) NULL,
  google_id          VARCHAR(100) NULL UNIQUE,
  avatar_url         VARCHAR(500) NULL,
  autoplay           BOOLEAN NOT NULL DEFAULT TRUE,
  qualidade_padrao   VARCHAR(10) NOT NULL DEFAULT 'auto' CHECK (qualidade_padrao IN ('auto','480p','720p','1080p','4k')),
  legendas_padrao    BOOLEAN NOT NULL DEFAULT FALSE,
  notificacoes_email BOOLEAN NOT NULL DEFAULT TRUE,
  criado_em          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_usuarios_email ON usuarios(email);

-- -------------------------------------------------------------
-- 2. TABELA: generos
-- -------------------------------------------------------------
CREATE TABLE generos (
  id_genero SERIAL PRIMARY KEY,
  nome      VARCHAR(60) NOT NULL UNIQUE,
  slug      VARCHAR(60) NOT NULL UNIQUE,
  icone     VARCHAR(10) NULL
);

-- -------------------------------------------------------------
-- 3. TABELA: titulos (Filmes, Séries e Mangás/Animes)
-- -------------------------------------------------------------
CREATE TABLE titulos (
  id_titulo       SERIAL PRIMARY KEY,
  tipo            VARCHAR(30) NOT NULL DEFAULT 'filme', -- 'filme', 'serie', 'manga', 'anime'
  titulo          VARCHAR(150) NOT NULL,
  sinopse         TEXT NULL,
  ano_lancamento  SMALLINT NULL,
  classificacao   VARCHAR(10) NULL,
  duracao_minutos INT NULL,
  nota            DECIMAL(3,1) NULL,
  poster_url      VARCHAR(500) NULL, -- Capa oficial em alta definição (TMDB CDN)
  banner_url      VARCHAR(500) NULL, -- Imagem de fundo em alta definição (TMDB CDN)
  video_url       VARCHAR(500) NULL, -- Link de vídeo ou stream
  embed_url       VARCHAR(500) NULL, -- Player EmbedMovies (https://myembed.biz)
  tmdb_id         INT NULL,
  imdb_id         VARCHAR(50) NULL,
  destaque        BOOLEAN NOT NULL DEFAULT FALSE,
  em_alta         BOOLEAN NOT NULL DEFAULT FALSE,
  criado_em       TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_titulos_tipo ON titulos(tipo);
CREATE INDEX idx_titulos_titulo ON titulos(titulo);
CREATE INDEX idx_titulos_destaque ON titulos(destaque, em_alta);

-- -------------------------------------------------------------
-- 4. TABELA: titulo_genero (Relação N:N)
-- -------------------------------------------------------------
CREATE TABLE titulo_genero (
  id_titulo INT NOT NULL REFERENCES titulos(id_titulo) ON DELETE CASCADE,
  id_genero INT NOT NULL REFERENCES generos(id_genero) ON DELETE CASCADE,
  PRIMARY KEY (id_titulo, id_genero)
);

CREATE INDEX idx_titulo_genero_genero ON titulo_genero(id_genero);

-- -------------------------------------------------------------
-- 5. TABELA: episodios (Apenas para séries e mangás/animes)
-- -------------------------------------------------------------
CREATE TABLE episodios (
  id_episodio      SERIAL PRIMARY KEY,
  id_titulo        INT NOT NULL REFERENCES titulos(id_titulo) ON DELETE CASCADE,
  numero_temporada INT NOT NULL DEFAULT 1,
  numero_episodio  INT NOT NULL,
  titulo_episodio  VARCHAR(150) NOT NULL,
  duracao_minutos  INT NULL,
  video_url        VARCHAR(500) NULL
);

CREATE INDEX idx_episodios_titulo ON episodios(id_titulo, numero_temporada, numero_episodio);

-- -------------------------------------------------------------
-- 6. TABELA: favoritos
-- -------------------------------------------------------------
CREATE TABLE favoritos (
  id_usuario INT NOT NULL REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
  id_titulo  INT NOT NULL REFERENCES titulos(id_titulo) ON DELETE CASCADE,
  criado_em  TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_usuario, id_titulo)
);

-- -------------------------------------------------------------
-- 7. TABELA: minha_lista
-- -------------------------------------------------------------
CREATE TABLE minha_lista (
  id_usuario INT NOT NULL REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
  id_titulo  INT NOT NULL REFERENCES titulos(id_titulo) ON DELETE CASCADE,
  criado_em  TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_usuario, id_titulo)
);

-- -------------------------------------------------------------
-- 8. TABELA: historico (Continue Assistindo)
-- -------------------------------------------------------------
CREATE TABLE historico (
  id_usuario         INT NOT NULL REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
  id_titulo          INT NOT NULL REFERENCES titulos(id_titulo) ON DELETE CASCADE,
  progresso_segundos INT NOT NULL DEFAULT 0,
  duracao_segundos   INT NOT NULL DEFAULT 0,
  atualizado_em      TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_usuario, id_titulo)
);

-- -------------------------------------------------------------
-- 9. TABELA: recuperacao_senha (Redefinição por e-mail)
-- -------------------------------------------------------------
CREATE TABLE recuperacao_senha (
  id_recuperacao SERIAL PRIMARY KEY,
  id_usuario     INT NOT NULL REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
  token          VARCHAR(255) NOT NULL,
  codigo         VARCHAR(10) NOT NULL,
  expira_em      TIMESTAMPTZ NOT NULL,
  usado          BOOLEAN NOT NULL DEFAULT FALSE,
  criado_em      TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_recuperacao_token ON recuperacao_senha(token);
CREATE INDEX idx_recuperacao_codigo ON recuperacao_senha(codigo);

-- -------------------------------------------------------------
-- 10. TABELA: verificacao_cadastro (Ativação de conta por e-mail)
-- -------------------------------------------------------------
CREATE TABLE verificacao_cadastro (
  id_verificacao SERIAL PRIMARY KEY,
  nome           VARCHAR(100) NOT NULL,
  email          VARCHAR(150) NOT NULL,
  senha_hash     VARCHAR(255) NOT NULL,
  codigo         VARCHAR(10) NOT NULL,
  expira_em      TIMESTAMPTZ NOT NULL,
  usado          BOOLEAN NOT NULL DEFAULT FALSE,
  criado_em      TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_verificacao_email_codigo ON verificacao_cadastro(email, codigo);

-- =============================================================
-- INSERÇÃO DE DADOS MIGRADOS DO MYSQL (SEED)
-- =============================================================
`;

  // 1. GENEROS
  const [generos] = await pool.query('SELECT * FROM generos ORDER BY id_genero');
  if (generos.length > 0) {
    sql += `\n-- Gêneros\nINSERT INTO generos (id_genero, nome, slug, icone) VALUES\n`;
    const linhas = generos.map(
      (g) => `  (${g.id_genero}, ${escapeSql(g.nome)}, ${escapeSql(g.slug)}, ${escapeSql(g.icone)})`
    );
    sql += linhas.join(',\n') + ';\n';
    sql += `SELECT setval('generos_id_genero_seq', (SELECT MAX(id_genero) FROM generos));\n`;
  }

  // 2. USUARIOS
  const [usuarios] = await pool.query('SELECT * FROM usuarios ORDER BY id_usuario');
  if (usuarios.length > 0) {
    sql += `\n-- Usuários\nINSERT INTO usuarios (id_usuario, nome, email, senha, google_id, avatar_url, autoplay, qualidade_padrao, legendas_padrao, notificacoes_email, criado_em) VALUES\n`;
    const linhas = usuarios.map(
      (u) =>
        `  (${u.id_usuario}, ${escapeSql(u.nome)}, ${escapeSql(u.email)}, ${escapeSql(u.senha)}, ${escapeSql(
          u.google_id
        )}, ${escapeSql(u.avatar_url)}, ${u.autoplay ? 'TRUE' : 'FALSE'}, ${escapeSql(
          u.qualidade_padrao
        )}, ${u.legendas_padrao ? 'TRUE' : 'FALSE'}, ${
          u.notificacoes_email ? 'TRUE' : 'FALSE'
        }, ${escapeSql(u.criado_em)})`
    );
    sql += linhas.join(',\n') + ';\n';
    sql += `SELECT setval('usuarios_id_usuario_seq', (SELECT MAX(id_usuario) FROM usuarios));\n`;
  }

  // 3. TITULOS
  const [titulos] = await pool.query('SELECT * FROM titulos ORDER BY id_titulo');
  if (titulos.length > 0) {
    sql += `\n-- Títulos (Filmes, Séries, Mangás e Animes com Capas Oficiais da EmbedMovies/TMDB)\nINSERT INTO titulos (id_titulo, tipo, titulo, sinopse, ano_lancamento, classificacao, duracao_minutos, nota, poster_url, banner_url, video_url, embed_url, tmdb_id, imdb_id, destaque, em_alta, criado_em) VALUES\n`;
    const linhas = titulos.map(
      (t) =>
        `  (${t.id_titulo}, ${escapeSql(t.tipo)}, ${escapeSql(t.titulo)}, ${escapeSql(
          t.sinopse
        )}, ${t.ano_lancamento || 'NULL'}, ${escapeSql(t.classificacao)}, ${
          t.duracao_minutos || 'NULL'
        }, ${t.nota || 'NULL'}, ${escapeSql(t.poster_url)}, ${escapeSql(t.banner_url)}, ${escapeSql(
          t.video_url
        )}, ${escapeSql(t.embed_url)}, ${t.tmdb_id || 'NULL'}, ${escapeSql(t.imdb_id)}, ${
          t.destaque ? 'TRUE' : 'FALSE'
        }, ${t.em_alta ? 'TRUE' : 'FALSE'}, ${escapeSql(t.criado_em)})`
    );
    sql += linhas.join(',\n') + ';\n';
    sql += `SELECT setval('titulos_id_titulo_seq', (SELECT MAX(id_titulo) FROM titulos));\n`;
  }

  // 4. TITULO_GENERO
  const [tituloGenero] = await pool.query('SELECT * FROM titulo_genero ORDER BY id_titulo, id_genero');
  if (tituloGenero.length > 0) {
    sql += `\n-- Relação Título x Gênero\nINSERT INTO titulo_genero (id_titulo, id_genero) VALUES\n`;
    const linhas = tituloGenero.map((tg) => `  (${tg.id_titulo}, ${tg.id_genero})`);
    sql += linhas.join(',\n') + ';\n';
  }

  // 5. EPISODIOS
  const [episodios] = await pool.query('SELECT * FROM episodios ORDER BY id_episodio');
  if (episodios.length > 0) {
    sql += `\n-- Episódios\nINSERT INTO episodios (id_episodio, id_titulo, numero_temporada, numero_episodio, titulo_episodio, duracao_minutos, video_url) VALUES\n`;
    const linhas = episodios.map(
      (e) =>
        `  (${e.id_episodio}, ${e.id_titulo}, ${e.numero_temporada}, ${e.numero_episodio}, ${escapeSql(
          e.titulo_episodio
        )}, ${e.duracao_minutos || 'NULL'}, ${escapeSql(e.video_url)})`
    );
    sql += linhas.join(',\n') + ';\n';
    sql += `SELECT setval('episodios_id_episodio_seq', (SELECT MAX(id_episodio) FROM episodios));\n`;
  }

  // 6. FAVORITOS
  const [favoritos] = await pool.query('SELECT * FROM favoritos');
  if (favoritos.length > 0) {
    sql += `\n-- Favoritos\nINSERT INTO favoritos (id_usuario, id_titulo, criado_em) VALUES\n`;
    const linhas = favoritos.map((f) => `  (${f.id_usuario}, ${f.id_titulo}, ${escapeSql(f.criado_em)})`);
    sql += linhas.join(',\n') + ';\n';
  }

  // 7. MINHA_LISTA
  const [minhaLista] = await pool.query('SELECT * FROM minha_lista');
  if (minhaLista.length > 0) {
    sql += `\n-- Minha Lista\nINSERT INTO minha_lista (id_usuario, id_titulo, criado_em) VALUES\n`;
    const linhas = minhaLista.map((m) => `  (${m.id_usuario}, ${m.id_titulo}, ${escapeSql(m.criado_em)})`);
    sql += linhas.join(',\n') + ';\n';
  }

  const outputPath = path.resolve(__dirname, 'postgres-neon-db.sql');
  fs.writeFileSync(outputPath, sql, 'utf8');
  console.log('✅ Arquivo SQL gerado com sucesso em:', outputPath);
  console.log(`📊 Total: ${generos.length} gêneros, ${usuarios.length} usuários, ${titulos.length} títulos, ${episodios.length} episódios.`);
  process.exit(0);
}

exportPostgres();

