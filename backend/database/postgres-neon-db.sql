-- ============================================================
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

-- Gêneros
INSERT INTO generos (id_genero, nome, slug, icone) VALUES
  (1, 'Ação', 'acao', '⚔️'),
  (2, 'Aventura', 'aventura', '🧭'),
  (3, 'Comédia', 'comedia', '🎭'),
  (4, 'Drama', 'drama', '🎬'),
  (5, 'Fantasia', 'fantasia', '🐉'),
  (6, 'Ficção científica', 'ficcao-cientifica', '🚀'),
  (7, 'Mistério', 'misterio', '🕵️'),
  (8, 'Romance', 'romance', '💜'),
  (9, 'Suspense', 'suspense', '🌀'),
  (10, 'Terror', 'terror', '👁️'),
  (11, 'Documentário', 'documentario', '🎥');
SELECT setval('generos_id_genero_seq', (SELECT MAX(id_genero) FROM generos));

-- Usuários
INSERT INTO usuarios (id_usuario, nome, email, senha, google_id, avatar_url, autoplay, qualidade_padrao, legendas_padrao, notificacoes_email, criado_em) VALUES
  (1, 'Teste Ethereal', 'test_1793705537164@ethereal.com', '$2a$10$VE47auL5AVvkvLKTdVj.FeIRdxeudjNZAA0k8KtSAKK1F0W0Z7h/y', NULL, NULL, TRUE, '1080p', TRUE, FALSE, '2026-11-03 08:32:17'),
  (2, 'o', 'tttt', '$2a$10$RFHngK9zokxDUh9nQUjbveZbpPAA4n7sANtH2gDSHjYkHHfDg0oh2', NULL, NULL, TRUE, '1080p', FALSE, TRUE, '2026-11-03 08:54:35'),
  (3, 'EVELYN SOPHIA SOUZA CROTTI', 'evelyn.crotti@escola.pr.gov.br', NULL, '106196470782458039318', 'https://lh3.googleusercontent.com/a/ACg8ocKWDDxvMP0SW6aMks5cZLG6kLN9eGdj1uj9wjSXIEMhXjrtgWWH=s96-c', TRUE, 'auto', FALSE, TRUE, '2026-11-04 08:16:00'),
  (4, 'Teste Ethereal', 'test_1793791429533@ethereal.com', '$2a$10$pB.YelGC/JEG/WbFGNiRX.3WyCL/XaASdHkRlI3wHsk.rLDrSnVS.', NULL, NULL, TRUE, '1080p', TRUE, FALSE, '2026-11-04 08:23:49'),
  (5, 'Sophia Crotti', 'sophicrotti@gmail.com', '$2a$10$dlsAQn.DzR6RlKEJQSog7uMSmYfEbh3COHPPIyM87MVzCagXA5PN6', NULL, NULL, TRUE, 'auto', FALSE, TRUE, '2026-11-06 08:11:04'),
  (6, 'henrique', 'henriquecassol09@gmail.com', '$2a$10$lCjqNi96VvrTTWCLTEPY.eP6zsMpPcvduToZ04yU7f4YJxaZ67X5q', NULL, NULL, TRUE, 'auto', FALSE, TRUE, '2026-11-06 08:15:55'),
  (7, 'kaua', 'kaua.gabriel.nogueira@escola.pr.gov.br', '$2a$10$dp06vyKBWQ8h41LHmVTdvuJb1J8h/mZcWG5HeIt.xfwdg2gkcgmGS', NULL, NULL, TRUE, 'auto', FALSE, TRUE, '2026-11-06 08:22:24'),
  (9, 'henrique', 'henriquecassol02@gmail.com', '$2a$10$nMWcn6HZ6Ia0vhV46Da/seeFXwnfzmw1zbXm8Y2bezuH0O/OEmCS6', NULL, NULL, TRUE, 'auto', FALSE, TRUE, '2026-11-06 08:53:24');
SELECT setval('usuarios_id_usuario_seq', (SELECT MAX(id_usuario) FROM usuarios));

-- Títulos (Filmes, Séries, Mangás e Animes com Capas Oficiais da EmbedMovies/TMDB)
INSERT INTO titulos (id_titulo, tipo, titulo, sinopse, ano_lancamento, classificacao, duracao_minutos, nota, poster_url, banner_url, video_url, embed_url, tmdb_id, imdb_id, destaque, em_alta, criado_em) VALUES
  (1, 'filme', 'Scream 7', 'Ghostface retorna com uma nova onda de assassinatos implacáveis na era das redes sociais e transmissões ao vivo.', 2026, '18', 114, 7.8, 'https://image.tmdb.org/t/p/w500/wDWAA5QApz5LUK8fUm4SplxYZZP.jpg', 'https://image.tmdb.org/t/p/original/4HodYYKEIsGOdinkGi2Ucz6X9i0.jpg', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4', NULL, NULL, NULL, FALSE, TRUE, '2026-11-03 08:29:05'),
  (2, 'filme', 'Iron Lung', 'Em um oceano de sangue em uma lua alienígena, um prisioneiro pilota um submarino claustrofóbico sem janelas.', 2026, '16', 98, 7.5, 'https://image.tmdb.org/t/p/w500/sIwakdbMGS1krtgendTWpxTY9Hw.jpg', 'https://image.tmdb.org/t/p/original/seuG9UslSFybML8C4enbrE6Hsyz.jpg', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4', 'https://myembed.biz/filme/tt27564844', 1116201, NULL, FALSE, TRUE, '2026-11-03 08:29:05'),
  (3, 'filme', 'Invocação do Mal', 'Investigadores paranormais enfrentam a entidade mais perigosa de suas carreiras em uma residência isolada.', 2021, '16', 112, 8.1, 'https://image.tmdb.org/t/p/w500/wVYREutTvI2tmxr6ujrHT704wGF.jpg', 'https://image.tmdb.org/t/p/original/ecKQlAEG95k62SMGhvX83oEqANK.jpg', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', 'https://myembed.biz/filme/tt1457767', 138843, NULL, FALSE, TRUE, '2026-11-03 08:29:05'),
  (4, 'filme', 'Predador: Terras Selvagens', 'Um novo guerreiro alienígena aterrissa em um ambiente hostil enfrentando perigos mortais da natureza.', 2025, '16', 108, 7.9, 'https://image.tmdb.org/t/p/w500/pHpq9yNUIo6aDoCXEBzjSolywgz.jpg', 'https://image.tmdb.org/t/p/original/82lM4GJ9uuNvNDOEpxFy77uv4Ak.jpg', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4', 'https://myembed.biz/filme/tt31227572', 1242898, NULL, FALSE, TRUE, '2026-11-03 08:29:05'),
  (5, 'filme', 'Avatar: Fogo e Cinzas', 'Jake Sully e Neytiri viajam para regiões inexploradas de Pandora, confrontando uma nova e misteriosa tribo de Na''vi.', 2025, '12', 192, 8.5, 'https://image.tmdb.org/t/p/w500/u62d0BPqsdv2TUDifcMmoePbHPL.jpg', 'https://image.tmdb.org/t/p/original/t2KFGH07Al4XuIZLHRlF1Hj9IJB.jpg', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4', 'https://myembed.biz/serie/284833', 284833, NULL, FALSE, TRUE, '2026-11-03 08:29:05'),
  (6, 'filme', 'Justiça Artificial', 'Um juiz algorítmico assume o controle de sentenças penais em uma metrópole futurista até um erro colocar tudo em cheque.', 2025, '14', 105, 7.4, 'https://image.tmdb.org/t/p/w500/pyok1kZJCfyuFapYXzHcy7BLlQa.jpg', 'https://image.tmdb.org/t/p/original/gIClklFGYBe0uiOoiP2vtocJbss.jpg', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', 'https://myembed.biz/filme/tt31050594', 1236153, NULL, FALSE, TRUE, '2026-11-03 08:29:05'),
  (7, 'filme', 'Resident Evil: Origens', 'Um surto biológico confina sobreviventes em uma instalação secreta cheia de horrores genéticos.', 2024, '18', 103, 7.2, 'https://image.tmdb.org/t/p/w500/i7UyjfPio0VFHB9rBUZSFyhOoM8.jpg', 'https://image.tmdb.org/t/p/original/3icyRAqgakNcQn6aDVz9libFmBA.jpg', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4', 'https://myembed.biz/filme/tt35538033', 1423191, NULL, FALSE, FALSE, '2026-11-03 08:29:05'),
  (8, 'filme', 'Toy Story 5', 'Woody e Buzz precisam lidar com a nova ameaça que atinge os brinquedos: os dispositivos eletrônicos e tablets.', 2026, 'Livre', 95, 8.3, 'https://image.tmdb.org/t/p/w500/sfQtVlIHljToOwYjhe21KPGzZWK.jpg', 'https://image.tmdb.org/t/p/original/qjTqY5coNiz6sVtPng40IzltsoN.jpg', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', 'https://myembed.biz/filme/tt29355505', 1084244, NULL, FALSE, FALSE, '2026-11-03 08:29:05'),
  (9, 'filme', 'Tron: Ares', 'Um programa altamente sofisticado é enviado do mundo digital para o mundo real em uma missão arriscada.', 2025, '12', 118, 7.8, 'https://image.tmdb.org/t/p/w500/ehRRWs1EfeYiX4ysLLapWeKG4Pq.jpg', 'https://image.tmdb.org/t/p/original/9fOsc3Hmvy6G5Hw8tTOGRFGWp73.jpg', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4', 'https://myembed.biz/serie/198182', 198182, NULL, FALSE, FALSE, '2026-11-03 08:29:05'),
  (10, 'filme', 'Jurassic World: Renascimento', 'Cientistas viajam para uma ilha equatorial isolada na esperança de extrair material genético dos três maiores dinossauros.', 2025, '12', 125, 7.6, 'https://image.tmdb.org/t/p/w500/1RICxzeoNCAO5NpcRMIgg1XT6fm.jpg', 'https://image.tmdb.org/t/p/original/zNriRTr0kWwyaXPzdg1EIxf0BWk.jpg', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4', 'https://myembed.biz/filme/tt31036941', 1234821, NULL, FALSE, FALSE, '2026-11-03 08:29:05'),
  (11, 'filme', 'Quarteto Fantástico', 'A primeira família da Marvel precisa unir forças para defender a Terra da ameaça cósmica de Galactus.', 2025, '12', 130, 8.0, 'https://image.tmdb.org/t/p/w500/nf5qaSEvyYSNeFH0YhSs5EsBLX9.jpg', 'https://image.tmdb.org/t/p/original/s94NjfKkcSczZ1FembwmQZwsuwY.jpg', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4', 'https://myembed.biz/filme/tt10676052', 617126, NULL, FALSE, FALSE, '2026-11-03 08:29:05'),
  (12, 'filme', 'Duna: Parte 2', 'Paul Atreides se une a Chani e aos Fremen em busca de vingança contra os conspiradores que destruíram sua família.', 2024, '14', 166, 8.9, 'https://image.tmdb.org/t/p/w500/6izwz7rsy95ARzTR3poZ8H6c5pp.jpg', 'https://image.tmdb.org/t/p/original/eZ239CUp1d6OryZEBPnO2n87gMG.jpg', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', 'https://myembed.biz/filme/tt15239678', 693134, NULL, FALSE, FALSE, '2026-11-03 08:29:05'),
  (13, 'filme', 'Five Nights at Freddy''s', 'Um segurança noturno descobre que os animatrônicos de uma pizzaria abandonada ganham vida após a meia-noite.', 2023, '14', 110, 7.0, 'https://image.tmdb.org/t/p/w500/udAxQEORq2I5wxI97N2TEqdhzBE.jpg', 'https://image.tmdb.org/t/p/original/54BOXpX2ieTXMDzHymdDMnUIzYG.jpg', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', 'https://myembed.biz/filme/tt30274401', 1228246, NULL, FALSE, FALSE, '2026-11-03 08:29:05'),
  (14, 'filme', 'Todo Mundo em Pânico', 'Uma sátira hilária e sem limites dos maiores sucessos de terror e suspense do cinema.', 2000, '16', 88, 7.1, 'https://image.tmdb.org/t/p/w500/znHT8peERZRWG1ME3r0Db0EV8k8.jpg', 'https://image.tmdb.org/t/p/original/xWBiXclrRmTggQHMRsIn84YHavs.jpg', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', 'https://myembed.biz/filme/tt32093575', 1273221, NULL, FALSE, FALSE, '2026-11-03 08:29:05'),
  (15, 'filme', 'Mínimos & Monstros', 'Pequenas criaturas amarelas causam confusões intergalácticas ao tentar domesticar monstros espaciais.', 2025, 'Livre', 90, 7.7, 'https://picsum.photos/seed/minimos/400/600', 'https://picsum.photos/seed/minimos-wide/1600/700', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', NULL, NULL, NULL, FALSE, FALSE, '2026-11-03 08:29:05'),
  (16, 'filme', 'Vingadores: Guerras Secretas', 'Heróis de múltiplos universos se encontram no Mundo Bélico para a maior batalha cósmica de todos os tempos.', 2026, '14', 175, 8.8, 'https://image.tmdb.org/t/p/w500/bR8ISy1O9XQxqiy0fQFw2BX72RQ.jpg', 'https://image.tmdb.org/t/p/original/7RyHsO4yDXtBv1zUU3mTpHeQ0d5.jpg', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4', 'https://myembed.biz/filme/tt4154796', 299534, NULL, FALSE, FALSE, '2026-11-03 08:29:05'),
  (17, 'filme', 'Michael', 'A cinebiografia eletrizante que narra a vida, a genialidade musical e as lutas do Rei do Pop.', 2025, '14', 140, 8.4, 'https://image.tmdb.org/t/p/w500/dueFqKLvjftnELZaGYwY7xinfaI.jpg', 'https://image.tmdb.org/t/p/original/ufSwlnECLoUbBjPrFqEQcWBzHwc.jpg', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4', 'https://myembed.biz/filme/tt11378946', 936075, NULL, FALSE, FALSE, '2026-11-03 08:29:05'),
  (18, 'filme', 'Leviticus', 'Um thriller psicológico sombrio sobre um investigador forense em confronto com mistérios bíblicos.', 2024, '18', 115, 7.9, 'https://image.tmdb.org/t/p/w500/gnAsZvBygplNpp8PtjoTEYv3VPB.jpg', 'https://image.tmdb.org/t/p/original/7y8zWGEjs7tresw4Hzkkf4TdkcL.jpg', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4', 'https://myembed.biz/filme/tt39143902', 1564614, NULL, FALSE, FALSE, '2026-11-03 08:29:05'),
  (19, 'serie', 'South Park', 'Quatro crianças desbocadas enfrentam o caos absoluto em uma cidadezinha do Colorado. De celebridades sem noção a conspirações bizarras, nada é sagrado e ninguém está a salvo nesta sátira ácida e implacável da vida moderna.', 1997, '16', NULL, 8.8, 'https://image.tmdb.org/t/p/w500/k7n2EVge7G77eMr3brztRGG1fFU.jpg', 'https://image.tmdb.org/t/p/original/3UviYOlhn8EgXMBuiT6MnUuo1w9.jpg', NULL, 'https://myembed.biz/serie/2190', 2190, NULL, TRUE, TRUE, '2026-11-03 08:29:05'),
  (20, 'serie', 'The Mandalorian', 'Após a queda do Império Galáctico, um caçador de recompensas solitário viaja pelos confins da galáxia com uma criança misteriosa.', 2019, '14', NULL, 8.7, 'https://image.tmdb.org/t/p/w500/sWgBv7LV2PRoQgkxwlibdGXKz1S.jpg', 'https://image.tmdb.org/t/p/original/9zcbqSxdsRMZWHYtyCd1nXPr2xq.jpg', NULL, 'https://myembed.biz/serie/82856', 82856, NULL, FALSE, TRUE, '2026-11-03 08:29:05'),
  (21, 'serie', 'The Boys', 'Um grupo de justiceiros assume a missão de combater super-heróis corruptos que abusam de seus poderes sob os holofotes corporativos.', 2019, '18', NULL, 8.7, 'https://image.tmdb.org/t/p/w500/in1R2dDc421JxsoRWaIIAqVI2KE.jpg', 'https://image.tmdb.org/t/p/original/bq28ajZaoMyzEIm6REelqyqtEDZ.jpg', NULL, 'https://myembed.biz/serie/76479', 76479, NULL, FALSE, FALSE, '2026-11-03 08:29:05'),
  (22, 'serie', 'The Mentalist', 'Um ex-falso vidente usa suas incríveis habilidades de observação para ajudar o CBI a capturar assassinos em série.', 2008, '14', NULL, 8.2, 'https://picsum.photos/seed/mentalist/400/600', 'https://picsum.photos/seed/mentalist-wide/1600/700', NULL, NULL, NULL, NULL, FALSE, FALSE, '2026-11-03 08:29:05'),
  (23, 'serie', 'Peaky Blinders', 'Na Inglaterra dos anos 1920, Thomas Shelby lidera uma perigosa gangue criminosa disposta a construir um império a qualquer custo.', 2013, '16', NULL, 8.8, 'https://image.tmdb.org/t/p/w500/vUUqzWa2LnHIVqkaKVlVGkVcZIW.jpg', 'https://image.tmdb.org/t/p/original/dzq83RHwQcnP6WGJ6YkenIqeaa5.jpg', NULL, 'https://myembed.biz/serie/60574', 60574, NULL, FALSE, FALSE, '2026-11-03 08:29:05'),
  (24, 'serie', 'The Walking Dead', 'Sobreviventes de um apocalipse zumbi lutam não apenas contra os mortos-vivos, mas contra a brutalidade da própria natureza humana.', 2010, '16', NULL, 8.2, 'https://image.tmdb.org/t/p/w500/ng3cMtxYKt1OSQYqFlnKWnVsqNO.jpg', 'https://image.tmdb.org/t/p/original/rAOjnEFTuNysY7bot8zonhImGMh.jpg', NULL, 'https://myembed.biz/serie/1402', 1402, NULL, FALSE, FALSE, '2026-11-03 08:29:05'),
  (25, 'serie', 'Chainsmoker Cat', 'Em um submundo underground de Tóquio, um gato antropomórfico detetive desvenda casos bizarros entre fumaça e mistério.', 2023, '16', NULL, 8.0, 'https://image.tmdb.org/t/p/w500/m7AnmAtTDC5qfEp3BcLSSJerBzM.jpg', 'https://image.tmdb.org/t/p/original/4ei68OmZr0XHnN82OjiV8GBqfyN.jpg', NULL, 'https://myembed.biz/serie/312949', 312949, NULL, FALSE, FALSE, '2026-11-03 08:29:05'),
  (26, 'filme', 'Shackled', 'In a dystopian future where the parole system has been replaced with R.A.P.P. - the Recidivism Accountability Partnership Program - a white collar ex-con must take drastic measures to ensure his survival when he''s paired with a sociopathic gangster with terminal cancer. One wrong move by either of them could mean the summary execution of them both, via the explosive charges surgically implanted in their hearts as a condition of their release.', 2026, '14', 115, 7.0, 'https://image.tmdb.org/t/p/w500/wJQjU8AvN5Z2USzGseTL98oZSlB.jpg', 'https://image.tmdb.org/t/p/original/vDLHm9JDvLzqzMWyz4PBytS9dTC.jpg', 'https://myembed.biz/filme/tt39445906', 'https://myembed.biz/filme/tt39445906', 1745446, 'tt39445906', FALSE, TRUE, '2026-11-06 09:24:47'),
  (27, 'filme', 'Smalltown Funk Girls', 'A spontaneous road trip to save her medical career with BFF Nessie and Marie''s happy-go-lucky hippie grandma Giselle, ushers the three ''Good Girls'' into breathtaking adventures and ultimately into the perfect chaos.', NULL, '14', 115, 7.5, 'https://image.tmdb.org/t/p/w500/a2c9gis8eUz2AHbfhjhW2xEsor5.jpg', 'https://image.tmdb.org/t/p/w500/a2c9gis8eUz2AHbfhjhW2xEsor5.jpg', 'https://myembed.biz/filme/tt21277184', 'https://myembed.biz/filme/tt21277184', 1754154, 'tt21277184', FALSE, TRUE, '2026-11-06 09:24:47'),
  (28, 'filme', 'The Enemy Within Me', 'The Enemy Within Me', 2025, '14', 115, 7.5, 'https://image.tmdb.org/t/p/w500/g4JSTCo8GWa9bk2hTXt3ck7bq6v.jpg', 'https://image.tmdb.org/t/p/w500/g4JSTCo8GWa9bk2hTXt3ck7bq6v.jpg', 'https://myembed.biz/filme/tt34823072', 'https://myembed.biz/filme/tt34823072', 1755367, 'tt34823072', FALSE, TRUE, '2026-11-06 09:24:47'),
  (29, 'filme', 'Rent Free', 'He thought he found a place to stay rent free… but nothing in life is free.  Marcus, a smooth-talking hustler, moves in with Shay, a quiet therapist hiding a dark past. But when his plan to con her is exposed, he quickly realizes he’s not in control. Trapped inside her apartment, Marcus is forced into a twisted game where every move comes with consequences and escape may cost him everything.', 2026, '14', 115, 7.5, 'https://image.tmdb.org/t/p/w500/k1Nvbvt3pox3k8iypJodUBrQzPI.jpg', 'https://image.tmdb.org/t/p/original/zxTYvGBHlQNZNA2e7MMgFg43dKD.jpg', 'https://myembed.biz/filme/tt38066403', 'https://myembed.biz/filme/tt38066403', 1665710, 'tt38066403', FALSE, TRUE, '2026-11-06 09:24:47'),
  (30, 'filme', 'The Cowboy Killer', 'When a delusional killer in a cowboy costume starts treating a small town like his personal shooting range, two bumbling detectives must track him down and free his captive bride before he kills again.', 2026, '14', 115, 7.0, 'https://image.tmdb.org/t/p/w500/uz2Jsr5yrkiJHuYK4yb8zSOzvJe.jpg', 'https://image.tmdb.org/t/p/original/ic8eJbTQwOVl0z5CseEj8WyLDlQ.jpg', 'https://myembed.biz/filme/tt28211853', 'https://myembed.biz/filme/tt28211853', 1521116, 'tt28211853', FALSE, TRUE, '2026-11-06 09:24:47'),
  (31, 'filme', 'The Deprogrammer', 'A troubled deprogrammer isolates himself with a young cult member to "break" her, but he soon learns her cult''s nightmarish beliefs are real - and he''s their next target.', 2025, '14', 115, 7.5, 'https://image.tmdb.org/t/p/w500/cUaC79ztP8ac6h2n8rYG9xQRbYF.jpg', 'https://image.tmdb.org/t/p/w500/cUaC79ztP8ac6h2n8rYG9xQRbYF.jpg', 'https://myembed.biz/filme/tt20562744', 'https://myembed.biz/filme/tt20562744', 1587440, 'tt20562744', FALSE, TRUE, '2026-11-06 09:24:47'),
  (32, 'manga', 'Emesis Blue', 'When an executive of the BLU Corporation mysteriously vanishes in Mortem, New Mexico, a private detective and washed-up war veteran team up to find him, yet the man they hunt is more dangerous than they can possibly imagine.', 2023, '14', NULL, 10.0, 'https://image.tmdb.org/t/p/w500/laQtzzuynTnTqd3Svy2B167Bjbl.jpg', 'https://image.tmdb.org/t/p/original/8c0mVtiiIgvxXnCnahIx7Q2G9Kv.jpg', 'https://myembed.biz/filme/tt26900526', 'https://myembed.biz/filme/tt26900526', 1811525, 'tt26900526', FALSE, TRUE, '2026-11-06 09:24:47'),
  (33, 'filme', 'The Boy from Below', 'On Halloween night, 1997, a masked killer brings slasher films to life in Carpenter Falls. A video store clerk and her friends must survive his deadly game before they’re picked off one by one.', 2025, '14', 115, 5.0, 'https://image.tmdb.org/t/p/w500/6boCGBq6PYULSraA6PRUt9nuA93.jpg', 'https://image.tmdb.org/t/p/original/6RZaargoD2M9J3w5D9lZ20LJATI.jpg', 'https://myembed.biz/filme/tt27337790', 'https://myembed.biz/filme/tt27337790', 1470031, 'tt27337790', FALSE, TRUE, '2026-11-06 09:24:47'),
  (34, 'filme', 'The Ladder', 'In the twilight of his life, an aging Alaskan fisherman contemplates restarting his life with the help of a mysterious scientific procedure.', 2025, '14', 115, 7.5, 'https://image.tmdb.org/t/p/w500/c5lQIXZZuNRsFUGarBts0fWdLUp.jpg', 'https://image.tmdb.org/t/p/original/eZdd3tuk8juTaTrIJjMx7Os2XVX.jpg', 'https://myembed.biz/filme/tt29629912', 'https://myembed.biz/filme/tt29629912', 1418275, 'tt29629912', FALSE, TRUE, '2026-11-06 09:24:47'),
  (35, 'filme', 'Tempos Duros na Escola Douglass: Nenhuma Criança Fica de Fora', 'As câmeras deste documentário acompanham os alunos de uma escola de Baltimore, que enfrentam problemas e têm um fraco desempenho acadêmico.', 2008, '14', 115, 8.0, 'https://image.tmdb.org/t/p/w500/dxCmaJnLGeXyWjAvvFcTNTp2jCl.jpg', 'https://image.tmdb.org/t/p/original/58X9ppeqzlAEWVrdnAQ9aFuQKvY.jpg', 'https://myembed.biz/filme/tt4797524', 'https://myembed.biz/filme/tt4797524', 355242, 'tt4797524', FALSE, TRUE, '2026-11-06 09:24:47'),
  (36, 'filme', 'Quinze', 'Luiza fará 15 anos. Raquel tem alguns sonhos.', 2014, '14', 115, 3.0, 'https://image.tmdb.org/t/p/w500/45N7BU32cRBQ4olMkfK3Z67BGz.jpg', 'https://image.tmdb.org/t/p/original/1RVY9JrCYZJEiGkCs3mywediN3E.jpg', 'https://myembed.biz/filme/tt7308818', 'https://myembed.biz/filme/tt7308818', 300464, 'tt7308818', FALSE, TRUE, '2026-11-06 09:24:47'),
  (37, 'filme', 'The Dead Place', 'Troubled high school senior Isaac is plagued by visions of the dead. This causes friction in his family and makes him an outcast at school. His only friend Katharine is obsessed with the paranormal and tries desperately to help him, but a ‘New Kid’ pushes him to give in to the demon trying to burrow its way inside him. As he is consumed by the evil feeding off the dead souls that haunt him, Katharine is the only one that stands between Isaac and his darker impulses. To satisfy the bloodlust of the demon that dwells within him.', 2026, '14', 115, 7.0, 'https://image.tmdb.org/t/p/w500/sMYukHBJ5vj01BJhicTO9jZTb58.jpg', 'https://image.tmdb.org/t/p/original/lfvpKUjuQq5QwJbIT4BV9038E9X.jpg', 'https://myembed.biz/filme/tt23018852', 'https://myembed.biz/filme/tt23018852', 1359353, 'tt23018852', FALSE, TRUE, '2026-11-06 09:24:47'),
  (38, 'filme', 'Psychic Storm', 'As psychic waves ravage Earth''s cities, a clairvoyant teams up with an investigator and scientist to prevent global destruction. Their mission uncovers dark conspiracies while reality crumbles around them.', 2025, '14', 115, 5.0, 'https://image.tmdb.org/t/p/w500/2mmygNYWUsRJgJwF79pmScr9KrC.jpg', 'https://image.tmdb.org/t/p/w500/2mmygNYWUsRJgJwF79pmScr9KrC.jpg', 'https://myembed.biz/filme/tt33478014', 'https://myembed.biz/filme/tt33478014', 1360865, 'tt33478014', FALSE, TRUE, '2026-11-06 09:24:47'),
  (39, 'filme', 'Life of Mike', 'Mike Smith, a thriving real estate tycoon, lives a life devoid of close friends or family. As his birthday unfolds, his wife Celeste makes a heartfelt attempt to show him love, setting off a chain of events that shatter his expectations. By day''s end, Mike is confronted with the stark reality of who genuinely cares for him and who does not.', 2025, '14', 115, 10.0, 'https://image.tmdb.org/t/p/w500/ixdlsqNvk1YrHciEOGOLhpN0eqa.jpg', 'https://image.tmdb.org/t/p/original/hLrTs5GmE7Xo5M2u5he4vGGZJvZ.jpg', 'https://myembed.biz/filme/tt31850564', 'https://myembed.biz/filme/tt31850564', 1265971, 'tt31850564', FALSE, TRUE, '2026-11-06 09:24:47'),
  (40, 'serie', 'Fantasmas', 'Samantha e Jay jogam cautela e dinheiro ao vento quando decidem converter uma enorme propriedade rural decadente que herdaram em uma pousada.', 2021, '14', NULL, 8.0, 'https://image.tmdb.org/t/p/w500/8yBQYa6AdvMY5H9CiAv0HkvF3UE.jpg', 'https://image.tmdb.org/t/p/original/p5FOkor90VRBJEEhUMFdFdkixfe.jpg', 'https://myembed.biz/serie/126027', 'https://myembed.biz/serie/126027', 126027, 'tt11379026', TRUE, TRUE, '2026-11-06 09:24:47'),
  (41, 'serie', 'American Horror Story', 'Uma antologia dramática de terror trazendo a cada temporada novas histórias, cenários e personagens perturbadores.', 2011, '14', NULL, 8.0, 'https://image.tmdb.org/t/p/w500/yCkPLQ10qKIUgRBXmQVVMF1h96d.jpg', 'https://image.tmdb.org/t/p/original/5G4Bnc4Q0YUK1bwLEUYmIsmm2Ib.jpg', 'https://myembed.biz/serie/1413', 'https://myembed.biz/serie/1413', 1413, NULL, TRUE, TRUE, '2026-11-06 09:24:47'),
  (42, 'serie', 'Boston Blue', 'Danny Reagan se junta à Polícia de Boston vindo da Polícia de Nova York e faz parceria com a detetive Lena Peters, a filha mais velha de uma notável família policial de Boston.', 2025, '14', NULL, 7.0, 'https://image.tmdb.org/t/p/w500/81IhL3ckAgJ9J8vHazlUA5BNs8G.jpg', 'https://image.tmdb.org/t/p/original/lU3esiXkPlIccL8FUcrSE7LzOzy.jpg', 'https://myembed.biz/serie/284736', 'https://myembed.biz/serie/284736', 284736, 'tt35826715', TRUE, TRUE, '2026-11-06 09:24:47'),
  (43, 'serie', '9-1-1', '9-1-1 mostra a pressão do trabalho da polícia, de paramédicos e de bombeiros que são incumbidos de resolver as situações mais assustadoras e chocantes para salvar vidas.', 2018, '14', NULL, 8.0, 'https://image.tmdb.org/t/p/w500/u6HuWWohheyzAj5PUn4rBd0eH92.jpg', 'https://image.tmdb.org/t/p/original/5QJtEzMR7NxRxBBEdB7JfM1l7Oj.jpg', 'https://myembed.biz/serie/75219', 'https://myembed.biz/serie/75219', 75219, 'tt7235466', TRUE, TRUE, '2026-11-06 09:24:47'),
  (44, 'serie', 'The Rainmaker', 'O jovem advogado Rudy Baylor está enfrentando um dos escritórios de advocacia mais poderosos do país.', 2025, '14', NULL, 7.0, 'https://image.tmdb.org/t/p/w500/q8l0lj20amBFi0SBs8NI9yJpaHq.jpg', 'https://image.tmdb.org/t/p/original/8ZJYKoCmRCdaMDArewEwg3Uy8Bg.jpg', 'https://myembed.biz/serie/256711', 'https://myembed.biz/serie/256711', 256711, 'tt6151526', TRUE, TRUE, '2026-11-06 09:24:47'),
  (45, 'serie', 'Dexter: Ressurreição', 'Dexter Morgan acorda do coma e vai para Nova Iorque, determinado a encontrar Harrison e consertar as coisas, mas quando Angel Batista da Miami Metro chega com perguntas, Dexter percebe que seu passado está mais próximo do que nunca.', 2025, '14', NULL, 8.0, 'https://image.tmdb.org/t/p/w500/o2Oyi3boT100bY5kCP4MBiTeetO.jpg', 'https://image.tmdb.org/t/p/original/vcpj6rRDS93ImHCLPY8bwBuFGjR.jpg', 'https://myembed.biz/serie/259909', 'https://myembed.biz/serie/259909', 259909, 'tt33043892', TRUE, TRUE, '2026-11-06 09:24:47'),
  (46, 'serie', 'Outlander: Blood of My Blood', 'Dos campos de batalha da Primeira Guerra Mundial às montanhas acidentadas da Escócia do século XVIII, dois casais destinados a ficar juntos devem desafiar as forças que procuram separá-los, em uma saga romântica que se desenrola de maneiras surpreendentes e inesperadas ao longo do tempo.', 2025, '14', NULL, 8.0, 'https://image.tmdb.org/t/p/w500/1pGBdq4ssO2p5H2WFMlADH6pwZ6.jpg', 'https://image.tmdb.org/t/p/original/lCnOoI8eYo6sTbnoSI2qwt2ZzVb.jpg', 'https://myembed.biz/serie/207484', 'https://myembed.biz/serie/207484', 207484, 'tt18332852', TRUE, TRUE, '2026-11-06 09:24:47'),
  (47, 'serie', 'Grey''s Anatomy', 'Os médicos do Grey Sloan Memorial Hospital lidam diariamente com casos e consequências de vida ou morte. É um no outro que eles encontram apoio, conforto, amizade e, às vezes, até mais que amizade... Juntos, eles descobrem o quanto a vida profissional e a pessoal podem ser complicadas e se misturarem no meio do caminho.', 2005, '14', NULL, 8.0, 'https://image.tmdb.org/t/p/w500/gO8Fo47KV1opiutRDdBS5jclTQB.jpg', 'https://image.tmdb.org/t/p/original/A4NwkQXTXElE5iAsne5RpvS8R2Z.jpg', 'https://myembed.biz/serie/1416', 'https://myembed.biz/serie/1416', 1416, 'tt0413573', TRUE, TRUE, '2026-11-06 09:24:47'),
  (48, 'serie', 'Terra da Máfia', 'O poder está em disputa quando duas famílias do crime se chocam numa batalha que ameaça derrubar impérios e arruinar vidas. No meio está Harry Da Souza, um "resolvedor de problemas" que sabe bem onde a lealdade está quando as forças opostas colidem.', 2025, '14', NULL, 8.0, 'https://image.tmdb.org/t/p/w500/5Xc7WpWsgflfgEMoBlf9TmWhfbH.jpg', 'https://image.tmdb.org/t/p/original/h0OC7ouop8YLwbAVfS3UUE2Lw4T.jpg', 'https://myembed.biz/serie/247718', 'https://myembed.biz/serie/247718', 247718, 'tt31510819', TRUE, TRUE, '2026-11-06 09:24:47'),
  (49, 'serie', 'Verdade Oculta', 'Acompanha as aventuras do jornalista independente Lee Raybon, um "verdadeirista" de Tulsa, cuja obsessão por desmascarar a corrupção sempre o coloca em apuros. Embora não seja um idealista, Lee está determinado a expor as entranhas da cidade, mesmo que isso o coloque em risco. Quando sua mais recente reportagem, investigando a poderosa família Washberg, é seguida pelo suicídio suspeito de Dale Washberg, Lee sabe que está diante de algo grande. Seguindo pistas deixadas por Dale, Lee descobre que Betty Jo, a viúva, parece mais interessada no cunhado do que no falecido marido. E forças poderosas querem impedi-lo de descobrir mais.', 2025, '14', NULL, 6.0, 'https://image.tmdb.org/t/p/w500/jgfHT7oLJtBDlRABiTTEp2AEret.jpg', 'https://image.tmdb.org/t/p/original/xz9YhlTE5gdr1mrQkY01vDvQF59.jpg', 'https://myembed.biz/serie/273247', 'https://myembed.biz/serie/273247', 273247, 'tt31289994', TRUE, TRUE, '2026-11-06 09:24:47'),
  (50, 'serie', 'Sheriff Country', 'Mickey Fox investiga atividades criminosas e patrulha as ruas da pequena cidade de Edgewater, enquanto enfrenta seu pai ex-presidiário e um misterioso incidente envolvendo sua filha rebelde.', 2025, '14', NULL, 7.0, 'https://image.tmdb.org/t/p/w500/hBrbAYp4SGMkNYZGPeFhEd0xW7Z.jpg', 'https://image.tmdb.org/t/p/original/mhTIUNa9BI019NuXrUBYYCkZ199.jpg', 'https://myembed.biz/serie/253391', 'https://myembed.biz/serie/253391', 253391, 'tt32268630', TRUE, TRUE, '2026-11-06 09:24:47'),
  (51, 'serie', 'Matéria Escura', 'Jason Dessen é sequestrado para uma versão alternativa de sua vida. Em busca de voltar para sua verdadeira família, ele embarca em uma jornada angustiante para salvá-los do inimigo mais terrível que se possa imaginar: ele mesmo.', 2024, '14', NULL, 7.0, 'https://image.tmdb.org/t/p/w500/2DPmTlv8F0V1TQBPmlsGOVOhtWk.jpg', 'https://image.tmdb.org/t/p/original/wFEAy4xRes1eeclsu7Z73Vzz7ET.jpg', 'https://myembed.biz/serie/196322', 'https://myembed.biz/serie/196322', 196322, NULL, TRUE, TRUE, '2026-11-06 09:24:47'),
  (52, 'serie', '1/2', 'Depois de cumprir 25 anos de prisão, Dwight Manfredi é exilado sem cerimônia por seu chefe da máfia para se estabelecer em Oklahoma. Dwight lentamente constrói um novo império criminoso em Tulsa.', 2022, '14', NULL, 8.0, 'https://image.tmdb.org/t/p/w500/rOYLWCdAifpUtPlTf1WHxyaxeMt.jpg', 'https://image.tmdb.org/t/p/original/mNHRGO1gFpR2CYZdANe72kcKq7G.jpg', 'https://myembed.biz/serie/153312', 'https://myembed.biz/serie/153312', 153312, 'tt16358384', TRUE, TRUE, '2026-11-06 09:24:47'),
  (53, 'serie', 'Chef de Alto Nível', 'Durante toda a competição, 24 participantes se dividem em três categorias, os três níveis de cozinha. Cada um terá a oportunidade de mostrar suas habilidades, enfrentando grandes desafios, além de desenvolver seu talento, com direito à mentoria e avaliação de chefs renomados.', 2025, '14', NULL, 7.5, 'https://image.tmdb.org/t/p/w500/8s16MorTyLQ2jYkbEawf2PpN5dX.jpg', 'https://image.tmdb.org/t/p/original/iFTKLgu8On2ugYOyHUJaXMFkeyI.jpg', 'https://myembed.biz/serie/287934', 'https://myembed.biz/serie/287934', 287934, 'tt35400429', FALSE, TRUE, '2026-11-06 09:24:47'),
  (54, 'serie', 'A Nobreza do Amor', 'Ambientada nos anos 20, uma princesa africana deposta por uma convulsão política em seu reino foge para o interior de Pernambuco, no Brasil, onde vive um romance proibido com um trabalhador rural.', 2026, '14', NULL, 5.0, 'https://image.tmdb.org/t/p/w500/eKWeDBBVlFTeBjCJKr9Dc7A1OGz.jpg', 'https://image.tmdb.org/t/p/original/wJybYZUCFj1xUQOjXLyxfVFNKlb.jpg', 'https://myembed.biz/serie/301557', 'https://myembed.biz/serie/301557', 301557, NULL, TRUE, TRUE, '2026-11-06 09:24:47'),
  (55, 'manga', 'Li Xiongmao', 'A história acompanha Li Xiongmao, um garoto humano criado por demônios que, por ordem de seu mestre, parte em uma jornada para matar os três inimigos responsáveis pela ruína da raça demoníaca. Ao longo de sua busca pela verdade, ele começa a desvendar os mistérios por trás do conflito entre humanos e demônios, os segredos da dinastia e o seu próprio destino.', 2026, '14', NULL, 9.0, 'https://image.tmdb.org/t/p/w500/nawBG1OVDR6nF0uoq6jz7MZ4g2H.jpg', 'https://image.tmdb.org/t/p/original/qfbx6Pneo2bp1MHmTWFLlXt0f82.jpg', 'https://myembed.biz/serie/329026', 'https://myembed.biz/serie/329026', 329026, NULL, FALSE, TRUE, '2026-11-06 09:24:47'),
  (56, 'manga', 'Magical Girl Lyrical Nanoha EXCEEDS: Gun Blaze Vengeance', 'A história se passa em um mundo onde a humanidade foi levada à beira da extinção após o surgimento de uma espécie invasora agressiva há 30 anos. Em meio à constante destruição e morte, as Nações Unidas criaram uma organização chamada EXCEEDS para combater essa ameaça. Na nação insular do extremo oriente chamada Mizuho, uma jovem chamada Shiina Kuze caça essas criaturas enquanto tenta sobreviver ao lado de sua irmã mais nova, Setsuna.', 2026, '14', NULL, 5.0, 'https://image.tmdb.org/t/p/w500/l38ipYxoITWQaonHMNbgtWoYhH.jpg', 'https://image.tmdb.org/t/p/original/8oDXuGfRiNPMZc1eYc9O8gIm7nb.jpg', 'https://myembed.biz/serie/287075', 'https://myembed.biz/serie/287075', 287075, NULL, FALSE, TRUE, '2026-11-06 09:24:47'),
  (57, 'manga', 'The Ogre''s Bride', 'Num mundo onde humanos e ayakashi – seres sobrenaturais – coexistem, ser escolhida como noiva de um ayakashi é a maior honra. Yuzu, uma estudante comum, foi ignorada a vida toda, ofuscada pela sombra de sua irmã Karin, uma noiva escolhida. Quando Yuzu já não aguenta mais, ela inesperadamente conquista o coração de Reiya, um ogro galante de um clã poderoso que a reivindica como sua.', 2026, '14', NULL, 9.0, 'https://image.tmdb.org/t/p/w500/oZHzniVRilau9vY7mOe36smC09T.jpg', 'https://image.tmdb.org/t/p/original/o2BUR8LQAVu7oRp76v7jH7ZWpOk.jpg', 'https://myembed.biz/serie/293489', 'https://myembed.biz/serie/293489', 293489, NULL, FALSE, TRUE, '2026-11-06 09:24:47'),
  (58, 'manga', 'Rich Girl Caretaker: I''m Secretly the Caregiver of the Most Popular Girl in This Rich Kid School', 'Konohana Hinako é uma jovem perfeita: graciosa, elegante e impecável. Ao menos, é o que todos pensam. Quando ela está fora de vista, a falta de aptidão dela até em tarefas domésticas básicas é calamitosa! Um estudante comum, o Tomonari Itsuki, se torna cuidador dela pela força da necessidade e precisará garantir que a imagem de sua nova patroa continue imaculada.', 2026, '14', NULL, 7.0, 'https://image.tmdb.org/t/p/w500/5vVcJljxO9z1Y5pt4f2axv4NFpb.jpg', 'https://image.tmdb.org/t/p/original/5GF3fifAe3uElhci6TI09VHBMHA.jpg', 'https://myembed.biz/serie/312849', 'https://myembed.biz/serie/312849', 312849, NULL, FALSE, TRUE, '2026-11-06 09:24:47'),
  (59, 'manga', 'Iron Wok Jan', 'Jan é um mestre-cuca diabólico especializado em culinária chinesa, que não mede esforços para derrotar seus adversários. Uma história cheia de adrenalina, onde os excêntricos personagens desafiam os princípios éticos e encaram a culinária como magia, criando todos os tipos de pratos extravagantes. Jan está preparado para enfrentar a batalha da culinária chinesa e desafiar o mundo!', 2026, '14', NULL, 7.0, 'https://image.tmdb.org/t/p/w500/qD4qUOIX2wF67tnhhCWVbkwQuhs.jpg', 'https://image.tmdb.org/t/p/original/egAGdTC9aR8YJG4dU1OTPf950UP.jpg', 'https://myembed.biz/serie/308403', 'https://myembed.biz/serie/308403', 308403, NULL, FALSE, TRUE, '2026-11-06 09:24:47'),
  (60, 'manga', 'The World''s Strongest Rearguard', 'A vida de Arihito Atobe, um trabalhador corporativo exausto, chega ao fim de forma inesperada após um acidente de ônibus. Contudo, sua morte marca o começo de uma nova jornada: ele renasce num mundo de fantasia como um aventureiro chamado Seeker. Lá, assume uma classe inédita chamada "suporte de retaguarda", uma função essencial que fortalece seu grupo (que é formado apenas por mulheres) com apoio ofensivo, defensivo e de cura. E como se isso não bastasse, estar na retaguarda ainda faz com que suas companheiras gostem e se aproximem cada vez mais dele! Livre da rotina exaustiva do trabalho corporativo, Arihito está pronto para recomeçar e descobrir uma nova vida como Seeker!', 2026, '14', NULL, 6.0, 'https://image.tmdb.org/t/p/w500/l3CzKVe9cUgMuP2EjW6t9F3otFv.jpg', 'https://image.tmdb.org/t/p/original/93G5xLkTan3fdkUzQVvCcf8IAMx.jpg', 'https://myembed.biz/serie/300267', 'https://myembed.biz/serie/300267', 300267, NULL, FALSE, TRUE, '2026-11-06 09:24:47'),
  (61, 'manga', '100 Namoradas Que Te Amam Muuuuuito', 'Rentaro Aijo levou 100 foras ao longo do ensino fundamental. Então, ele visita um santuário e reza por melhor sorte no ensino médio. O Deus do Amor aparece para ele e lhe promete que em breve conhecerá 100 pessoas que está destinado a namorar. Mas há um problema: uma vez que o destino apresenta alguém a ele, os dois precisam se amar alegremente. Caso contrário, eles morrerão. O que acontecerá com Rentaro e suas 100 namoradas no ensino médio?', 2023, '14', NULL, 8.0, 'https://image.tmdb.org/t/p/w500/wr3mS1pifbUVLgCloqf1B9QwZ4E.jpg', 'https://image.tmdb.org/t/p/original/shXdGFZIEaSmiOkVW2BeEaPihuA.jpg', 'https://myembed.biz/serie/223564', 'https://myembed.biz/serie/223564', 223564, NULL, TRUE, TRUE, '2026-11-06 09:24:47'),
  (62, 'manga', 'The Classroom of a Black Cat and a Witch', 'Uma garota que não consegue usar magia sonha em entrar para uma academia mágica. Sua vida muda ao conhecer um misterioso gato preto falante, que na verdade é um poderoso mago amaldiçoado. Em troca de ajuda para quebrar o feitiço, ele se oferece para treiná-la, dando início a uma jornada cheia de magia, mistérios e descobertas.', 2026, '14', NULL, 7.0, 'https://image.tmdb.org/t/p/w500/e850NPQg3a4ZJDWE2EmxmjGa6Ab.jpg', 'https://image.tmdb.org/t/p/original/tR8AoRgTCLS0y0iI1Eou8vZylfq.jpg', 'https://myembed.biz/serie/297557', 'https://myembed.biz/serie/297557', 297557, NULL, FALSE, TRUE, '2026-11-06 09:24:47'),
  (63, 'manga', 'Though I Am an Inept Villainess', 'Enquanto as jovens dos Cinco Clãs lutam pelo coração do príncipe herdeiro, a ciumenta Keigetsu usa magia proibida para trocar de corpo com a amada Reirin. A troca de corpos não garante a felicidade de Keigetsu, já que a saúde frágil de seu novo corpo a deixa à beira da morte. Enquanto isso, Reirin, agora com o rosto de uma pária desprezada, precisa responder pelos crimes de Keigetsu em um julgamento perigoso. A improvável dupla se vê cada vez mais envolvida na vida uma da outra e precisarão trabalhar em conjunto para sobreviver após descobrir as conspirações sombrias que se escondem sob a superfície amena do palácio. Para enfrentar as ameaças mortais que espreitam nas sombras, Reirin precisa abraçar sua nova identidade e desafiar as expectativas que as pessoas têm da vilã inepta da corte.', 2026, '14', NULL, 8.0, 'https://image.tmdb.org/t/p/w500/yZHCMXL2xYS988rYxR1D8YrTzeD.jpg', 'https://image.tmdb.org/t/p/original/iNhtAnOhqQjiw7NMHrWbUw8mh4w.jpg', 'https://myembed.biz/serie/286345', 'https://myembed.biz/serie/286345', 286345, NULL, TRUE, TRUE, '2026-11-06 09:24:47'),
  (64, 'manga', 'AzurLane: Slow Ahead!', 'Este é um mundo levemente peculiar, onde vivem as garotas-barco. A vida escolar animada e divertida das garotas de diferentes facções começa no porto naval de Azur Lane. Aproveitando a vida ao máximo, essas garotas vão se meter em várias confusões - devagar e sempre!', 2021, '14', NULL, 5.0, 'https://image.tmdb.org/t/p/w500/gEl21883FjTCndkAIJCOGZuAT7d.jpg', 'https://image.tmdb.org/t/p/original/kuNbZYiODIgeSwf41ReSWtlcRIz.jpg', 'https://myembed.biz/serie/109805', 'https://myembed.biz/serie/109805', 109805, NULL, FALSE, TRUE, '2026-11-06 09:24:47'),
  (65, 'manga', 'Love Unseen Beneath the Clear Night Sky', 'Kakeru Sorano, um calouro universitário reservado que evita as pessoas, conhece Koharu Fuyutsuki, uma garota cega que encara o mundo com uma alegria discreta. Quando ela diz que quer ver fogos de artifício algum dia, algo dentro de Kakeru muda. À medida que se aproximam por meio de pequenos momentos e da solidão compartilhada, Kakeru busca uma maneira de realizar o desejo de Koharu.', 2026, '14', NULL, 8.0, 'https://image.tmdb.org/t/p/w500/orV0LKMAjKZzY1NJVEIwUFjLvWq.jpg', 'https://image.tmdb.org/t/p/original/g9MeGvfwHXldvVOttIybvaNfLEM.jpg', 'https://myembed.biz/serie/309974', 'https://myembed.biz/serie/309974', 309974, NULL, FALSE, TRUE, '2026-11-06 09:24:47'),
  (66, 'manga', 'Skeleton Knight in Another World', 'A história acompanha um jovem que dormiu enquanto passava a noite jogando, entretanto, ao acordar, percebeu que estava agora no mundo do jogo. Não o bastante, ele ainda foi colocado no corpo de um esqueleto.

A partir de então, ele decide encontrar um lugar seguro onde possa viver naquele mundo, mas ao se deparar com uma jovem elfa sua paz é colocada em jogo, onde acaba sempre se envolvendo em novas batalhas.', 2022, '14', NULL, 7.0, 'https://image.tmdb.org/t/p/w500/qvL6teyHqTemldh30vioZc4Bzo9.jpg', 'https://image.tmdb.org/t/p/original/AfJ0xWaW4ApJ0DOOnl9C3t3g41R.jpg', 'https://myembed.biz/serie/123528', 'https://myembed.biz/serie/123528', 123528, NULL, TRUE, TRUE, '2026-11-06 09:24:47'),
  (67, 'manga', 'The Insipid Prince''s Furtive Grab for the Throne', 'Príncipe Arnold é considerado uma grande piada, inepto e ofuscado por seu irmão gêmeo mais talentoso, Leonard. Mas, em segredo, Arnold opera como Silver, um dos cinco aventureiros de nível SS capazes de usar magia no continente. Conforme a sangrenta batalha pelo trono se intensifica após a morte do príncipe herdeiro, Arnold manipula os bastidores para coroar seu irmão, em benefício próprio.', 2026, '14', NULL, 6.0, 'https://image.tmdb.org/t/p/w500/1h0g4w6Vh0RenRga2bmtNXT08R0.jpg', 'https://image.tmdb.org/t/p/original/rbxKqzKkw9zrO9lKgqvXHOo4sZo.jpg', 'https://myembed.biz/serie/284581', 'https://myembed.biz/serie/284581', 284581, NULL, FALSE, TRUE, '2026-11-06 09:24:47'),
  (68, 'manga', 'A Livid Lady''s Guide to Getting Even: How I Crushed My Homeland with My Mighty Grimoires', 'Elizabeth Leiston, filha do poderoso primeiro-ministro, era a candidata perfeita à futura rainha de Haldoria... Mas tudo isso ruiu quando seu noivo cancelou o noivado deles em público, humilhando ela. Para piorar, ele a prendeu e espalhou calúnias visa respeito dela. O incentivo de Mireille, sua fiel criada, e a fúria que crescia dentro dela bastaram para Elizabeth mudar de rumo. Por que servir um reino que a despreza, se ela pode destruí-lo? Ela vai se vingar de todos que a traíram e derrubar esse maldito reino, custe o que custar! E Elizabeth não é indefesa: ela tem sete grimórios mágicos de poder devastador e está pronta para usá-los. Fiquem de olho: esta mulher impiedosa está com sangue nos olhos!', 2026, '14', NULL, 6.0, 'https://image.tmdb.org/t/p/w500/qKICBVfmdC1M9A4NdzQrUabUBtW.jpg', 'https://image.tmdb.org/t/p/original/pEv1seclJF9zSDbz0uVBkra1m1f.jpg', 'https://myembed.biz/serie/298831', 'https://myembed.biz/serie/298831', 298831, NULL, FALSE, TRUE, '2026-11-06 09:24:47'),
  (69, 'manga', 'Oh Boy, Was I Wrong About Her', 'Anos depois de prometerem amizade para sempre, Hayato reencontra Haruki, que não via desde a infância, e que agora se transformou numa beldade.', 2026, '14', NULL, 6.0, 'https://image.tmdb.org/t/p/w500/mtOOvLqkttNz0xjlVv9MbartfN6.jpg', 'https://image.tmdb.org/t/p/original/9PBeccJiwTMPE9ZR7IHrUxSCb9s.jpg', 'https://myembed.biz/serie/250008', 'https://myembed.biz/serie/250008', 250008, NULL, TRUE, TRUE, '2026-11-06 09:24:47');
SELECT setval('titulos_id_titulo_seq', (SELECT MAX(id_titulo) FROM titulos));

-- Relação Título x Gênero
INSERT INTO titulo_genero (id_titulo, id_genero) VALUES
  (1, 7),
  (1, 9),
  (1, 10),
  (2, 6),
  (2, 9),
  (2, 10),
  (3, 7),
  (3, 10),
  (4, 1),
  (4, 2),
  (4, 6),
  (5, 1),
  (5, 2),
  (5, 6),
  (6, 4),
  (6, 6),
  (6, 9),
  (7, 1),
  (7, 9),
  (7, 10),
  (8, 2),
  (8, 3),
  (8, 5),
  (9, 1),
  (9, 6),
  (10, 1),
  (10, 2),
  (10, 6),
  (11, 1),
  (11, 2),
  (11, 6),
  (12, 2),
  (12, 4),
  (12, 6),
  (13, 7),
  (13, 10),
  (14, 3),
  (15, 3),
  (15, 5),
  (16, 1),
  (16, 2),
  (16, 6),
  (17, 4),
  (17, 11),
  (18, 4),
  (18, 7),
  (18, 9),
  (19, 3),
  (19, 4),
  (20, 1),
  (20, 2),
  (20, 6),
  (21, 1),
  (21, 3),
  (21, 4),
  (22, 4),
  (22, 7),
  (23, 4),
  (23, 9),
  (24, 4),
  (24, 9),
  (24, 10),
  (25, 3),
  (25, 7);

-- Episódios
INSERT INTO episodios (id_episodio, id_titulo, numero_temporada, numero_episodio, titulo_episodio, duracao_minutos, video_url) VALUES
  (1, 19, 1, 1, 'Episódio 1 — Sonda Espacial Anal', 22, 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'),
  (2, 19, 1, 2, 'Episódio 2 — Ganho de Peso 4000', 22, 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4'),
  (3, 19, 1, 3, 'Episódio 3 — Vulcão', 22, 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4'),
  (4, 20, 1, 1, 'Capítulo 1 — O Mandaloriano', 39, 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4'),
  (5, 20, 1, 2, 'Capítulo 2 — A Criança', 32, 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4'),
  (6, 21, 1, 1, 'Episódio 1 — O Nome do Jogo', 60, 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4'),
  (7, 22, 1, 1, 'Episódio 1 — Piloto', 44, 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4'),
  (8, 23, 1, 1, 'Episódio 1 — O Início de Shelby', 55, 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4'),
  (9, 24, 1, 1, 'Episódio 1 — Dias Passados', 67, 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4');
SELECT setval('episodios_id_episodio_seq', (SELECT MAX(id_episodio) FROM episodios));

-- Favoritos
INSERT INTO favoritos (id_usuario, id_titulo, criado_em) VALUES
  (2, 8, '2026-11-03 08:55:45');

-- Minha Lista
INSERT INTO minha_lista (id_usuario, id_titulo, criado_em) VALUES
  (2, 8, '2026-11-03 08:55:45');
