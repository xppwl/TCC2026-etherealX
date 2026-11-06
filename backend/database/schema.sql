-- ============================================================
-- ETHEREAL X - Schema do banco de dados
-- Rode este script no MySQL Workbench, conectado ao banco
-- "ethereal_streaming" que você já criou.
-- Se você já tinha uma tabela "usuarios" antiga e diferente,
-- pode rodar "DROP TABLE IF EXISTS usuarios;" antes, ou ajustar
-- o script conforme o que já existe.
-- ============================================================

USE ethereal_streaming;

SET FOREIGN_KEY_CHECKS = 0;

-- Remove tabelas antigas para evitar conflito de constraints
DROP TABLE IF EXISTS titulo_genero;
DROP TABLE IF EXISTS episodios;
DROP TABLE IF EXISTS favoritos;
DROP TABLE IF EXISTS minha_lista;
DROP TABLE IF EXISTS historico;
DROP TABLE IF EXISTS titulos;
DROP TABLE IF EXISTS generos;
DROP TABLE IF EXISTS usuarios;

-- ---------------------------------------------------------
-- USUÁRIOS
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS usuarios (
  id_usuario        INT AUTO_INCREMENT PRIMARY KEY,
  nome              VARCHAR(100)  NOT NULL,
  email             VARCHAR(150)  NOT NULL UNIQUE,
  senha       VARCHAR(255)  NULL,                 -- NULL quando o login é feito só via Google
  google_id         VARCHAR(100)  NULL UNIQUE,
  avatar_url        VARCHAR(255)  NULL,
  autoplay          BOOLEAN       NOT NULL DEFAULT TRUE,
  qualidade_padrao  ENUM('auto','480p','720p','1080p','4k') NOT NULL DEFAULT 'auto',
  legendas_padrao   BOOLEAN       NOT NULL DEFAULT FALSE,
  notificacoes_email BOOLEAN      NOT NULL DEFAULT TRUE,
  criado_em         TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- GÊNEROS
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS generos (
  id_genero   INT AUTO_INCREMENT PRIMARY KEY,
  nome        VARCHAR(60) NOT NULL UNIQUE,
  slug        VARCHAR(60) NOT NULL UNIQUE,
  icone       VARCHAR(10) NULL      -- emoji simples usado no card do gênero
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- TÍTULOS (filmes e séries na mesma tabela, diferenciados por "tipo")
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS titulos (
  id_titulo         INT AUTO_INCREMENT PRIMARY KEY,
  tipo              ENUM('filme','serie') NOT NULL,
  titulo            VARCHAR(150) NOT NULL,
  sinopse           TEXT NULL,
  ano_lancamento    YEAR NULL,
  classificacao     VARCHAR(10) NULL,     -- ex: "12", "16", "18", "Livre"
  duracao_minutos   INT NULL,             -- usado quando tipo = 'filme'
  nota              DECIMAL(3,1) NULL,    -- ex: 8.7
  poster_url        VARCHAR(255) NULL,    -- capa vertical (cards)
  banner_url        VARCHAR(255) NULL,    -- capa horizontal (destaque/hero)
  video_url         VARCHAR(255) NULL,    -- usado quando tipo = 'filme'
  destaque          BOOLEAN NOT NULL DEFAULT FALSE,
  em_alta           BOOLEAN NOT NULL DEFAULT FALSE,
  criado_em         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Relação N:N entre títulos e gêneros
CREATE TABLE IF NOT EXISTS titulo_genero (
  id_titulo   INT NOT NULL,
  id_genero   INT NOT NULL,
  PRIMARY KEY (id_titulo, id_genero),
  FOREIGN KEY (id_titulo) REFERENCES titulos(id_titulo) ON DELETE CASCADE,
  FOREIGN KEY (id_genero) REFERENCES generos(id_genero) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- EPISÓDIOS (apenas para títulos do tipo 'serie')
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS episodios (
  id_episodio         INT AUTO_INCREMENT PRIMARY KEY,
  id_titulo           INT NOT NULL,
  numero_temporada    INT NOT NULL DEFAULT 1,
  numero_episodio     INT NOT NULL,
  titulo_episodio     VARCHAR(150) NOT NULL,
  duracao_minutos     INT NULL,
  video_url           VARCHAR(255) NULL,
  FOREIGN KEY (id_titulo) REFERENCES titulos(id_titulo) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- FAVORITOS
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS favoritos (
  id_usuario  INT NOT NULL,
  id_titulo   INT NOT NULL,
  criado_em   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_usuario, id_titulo),
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
  FOREIGN KEY (id_titulo) REFERENCES titulos(id_titulo) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- MINHA LISTA
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS minha_lista (
  id_usuario  INT NOT NULL,
  id_titulo   INT NOT NULL,
  criado_em   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_usuario, id_titulo),
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
  FOREIGN KEY (id_titulo) REFERENCES titulos(id_titulo) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- HISTÓRICO (progresso de reprodução, "Continuar assistindo")
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS historico (
  id_usuario          INT NOT NULL,
  id_titulo           INT NOT NULL,
  progresso_segundos  INT NOT NULL DEFAULT 0,
  duracao_segundos    INT NOT NULL DEFAULT 0,
  atualizado_em       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id_usuario, id_titulo),
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
  FOREIGN KEY (id_titulo) REFERENCES titulos(id_titulo) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- RECUPERAÇÃO DE SENHA (Tokens e códigos enviados por e-mail)
-- ---------------------------------------------------------
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

-- ---------------------------------------------------------
-- VERIFICAÇÃO DE CADASTRO (Código de 6 dígitos enviado por e-mail)
-- ---------------------------------------------------------
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

SET FOREIGN_KEY_CHECKS = 1;
