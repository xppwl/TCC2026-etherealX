-- ============================================================
-- ETHEREAL X - Dados de exemplo (seed)
-- Rode DEPOIS do schema.sql, no mesmo banco "ethereal_streaming".
--
-- Os vídeos usados aqui são os curtas/filmes livres do Blender
-- Studio (Big Buck Bunny, Sintel, Elephants Dream, Tears of Steel
-- etc.) hospedados publicamente pelo Google — são de licença
-- aberta (Creative Commons), por isso dá pra usar de verdade no
-- player sem problema de direitos autorais no seu TCC.
-- ============================================================

USE ethereal_streaming;

-- ---------------------------------------------------------
-- GÊNEROS
-- ---------------------------------------------------------
INSERT INTO generos (nome, slug, icone) VALUES
('Ação', 'acao', '⚔️'),
('Animação', 'animacao', '✨'),
('Aventura', 'aventura', '🧭'),
('Comédia', 'comedia', '🎭'),
('Drama', 'drama', '🎬'),
('Fantasia', 'fantasia', '🐉'),
('Ficção científica', 'ficcao-cientifica', '🚀'),
('Mistério', 'misterio', '🕵️'),
('Romance', 'romance', '💜'),
('Suspense', 'suspense', '🌀'),
('Terror', 'terror', '👁️'),
('Documentário', 'documentario', '🎥');

-- ---------------------------------------------------------
-- FILMES
-- ---------------------------------------------------------
INSERT INTO titulos (tipo, titulo, sinopse, ano_lancamento, classificacao, duracao_minutos, nota, poster_url, banner_url, video_url, destaque, em_alta) VALUES
('filme','Scream 7','Ghostface retorna com uma nova onda de assassinatos implacáveis na era das redes sociais e transmissões ao vivo.',2026,'18',114,7.8,'https://picsum.photos/seed/scream7/400/600','https://picsum.photos/seed/scream7-wide/1600/700','https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',0,1),
('filme','Iron Lung','Em um oceano de sangue em uma lua alienígena, um prisioneiro pilota um submarino claustrofóbico sem janelas.',2026,'16',98,7.5,'https://picsum.photos/seed/ironlung/400/600','https://picsum.photos/seed/ironlung-wide/1600/700','https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',0,1),
('filme','Invocação do Mal','Investigadores paranormais enfrentam a entidade mais perigosa de suas carreiras em uma residência isolada.',2021,'16',112,8.1,'https://picsum.photos/seed/invocacao/400/600','https://picsum.photos/seed/invocacao-wide/1600/700','https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',0,1),
('filme','Predador: Terras Selvagens','Um novo guerreiro alienígena aterrissa em um ambiente hostil enfrentando perigos mortais da natureza.',2025,'16',108,7.9,'https://picsum.photos/seed/predador/400/600','https://picsum.photos/seed/predador-wide/1600/700','https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',0,1),
('filme','Avatar: Fogo e Cinzas','Jake Sully e Neytiri viajam para regiões inexploradas de Pandora, confrontando uma nova e misteriosa tribo de Na''vi.',2025,'12',192,8.5,'https://picsum.photos/seed/avatar3/400/600','https://picsum.photos/seed/avatar3-wide/1600/700','https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',0,1),
('filme','Justiça Artificial','Um juiz algorítmico assume o controle de sentenças penais em uma metrópole futurista até um erro colocar tudo em cheque.',2025,'14',105,7.4,'https://picsum.photos/seed/justicaart/400/600','https://picsum.photos/seed/justica-wide/1600/700','https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',0,1),
('filme','Resident Evil: Origens','Um surto biológico confina sobreviventes em uma instalação secreta cheia de horrores genéticos.',2024,'18',103,7.2,'https://picsum.photos/seed/residentevil/400/600','https://picsum.photos/seed/re-wide/1600/700','https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',0,0),
('filme','Toy Story 5','Woody e Buzz precisam lidar com a nova ameaça que atinge os brinquedos: os dispositivos eletrônicos e tablets.',2026,'Livre',95,8.3,'https://picsum.photos/seed/toystory5/400/600','https://picsum.photos/seed/ts5-wide/1600/700','https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',0,0),
('filme','Tron: Ares','Um programa altamente sofisticado é enviado do mundo digital para o mundo real em uma missão arriscada.',2025,'12',118,7.8,'https://picsum.photos/seed/tronares/400/600','https://picsum.photos/seed/tron-wide/1600/700','https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',0,0),
('filme','Jurassic World: Renascimento','Cientistas viajam para uma ilha equatorial isolada na esperança de extrair material genético dos três maiores dinossauros.',2025,'12',125,7.6,'https://picsum.photos/seed/jurassic/400/600','https://picsum.photos/seed/jw-wide/1600/700','https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',0,0),
('filme','Quarteto Fantástico','A primeira família da Marvel precisa unir forças para defender a Terra da ameaça cósmica de Galactus.',2025,'12',130,8.0,'https://picsum.photos/seed/fantasticfour/400/600','https://picsum.photos/seed/ff-wide/1600/700','https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',0,0),
('filme','Duna: Parte 2','Paul Atreides se une a Chani e aos Fremen em busca de vingança contra os conspiradores que destruíram sua família.',2024,'14',166,8.9,'https://picsum.photos/seed/duna2/400/600','https://picsum.photos/seed/duna-wide/1600/700','https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',0,0),
('filme','Five Nights at Freddy''s','Um segurança noturno descobre que os animatrônicos de uma pizzaria abandonada ganham vida após a meia-noite.',2023,'14',110,7.0,'https://picsum.photos/seed/fnaf/400/600','https://picsum.photos/seed/fnaf-wide/1600/700','https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',0,0),
('filme','Todo Mundo em Pânico','Uma sátira hilária e sem limites dos maiores sucessos de terror e suspense do cinema.',2000,'16',88,7.1,'https://picsum.photos/seed/scarymovie/400/600','https://picsum.photos/seed/scary-wide/1600/700','https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',0,0),
('filme','Mínimos & Monstros','Pequenas criaturas amarelas causam confusões intergalácticas ao tentar domesticar monstros espaciais.',2025,'Livre',90,7.7,'https://picsum.photos/seed/minimos/400/600','https://picsum.photos/seed/minimos-wide/1600/700','https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',0,0),
('filme','Vingadores: Guerras Secretas','Heróis de múltiplos universos se encontram no Mundo Bélico para a maior batalha cósmica de todos os tempos.',2026,'14',175,8.8,'https://picsum.photos/seed/vingadores/400/600','https://picsum.photos/seed/ving-wide/1600/700','https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',0,0),
('filme','Michael','A cinebiografia eletrizante que narra a vida, a genialidade musical e as lutas do Rei do Pop.',2025,'14',140,8.4,'https://picsum.photos/seed/michael/400/600','https://picsum.photos/seed/michael-wide/1600/700','https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',0,0),
('filme','Leviticus','Um thriller psicológico sombrio sobre um investigador forense em confronto com mistérios bíblicos.',2024,'18',115,7.9,'https://picsum.photos/seed/leviticus/400/600','https://picsum.photos/seed/lev-wide/1600/700','https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',0,0);

-- ---------------------------------------------------------
-- SÉRIES
-- ---------------------------------------------------------
INSERT INTO titulos (tipo, titulo, sinopse, ano_lancamento, classificacao, nota, poster_url, banner_url, destaque, em_alta) VALUES
('serie','South Park','Quatro crianças desbocadas enfrentam o caos absoluto em uma cidadezinha do Colorado. De celebridades sem noção a conspirações bizarras, nada é sagrado e ninguém está a salvo nesta sátira ácida e implacável da vida moderna.',1997,'16',8.8,'https://picsum.photos/seed/southpark/400/600','https://picsum.photos/seed/southpark-wide/1600/700',1,1),
('serie','The Mandalorian','Após a queda do Império Galáctico, um caçador de recompensas solitário viaja pelos confins da galáxia com uma criança misteriosa.',2019,'14',8.7,'https://picsum.photos/seed/mandalorian/400/600','https://picsum.photos/seed/mando-wide/1600/700',0,1),
('serie','The Boys','Um grupo de justiceiros assume a missão de combater super-heróis corruptos que abusam de seus poderes sob os holofotes corporativos.',2019,'18',8.7,'https://picsum.photos/seed/theboys/400/600','https://picsum.photos/seed/theboys-wide/1600/700',0,0),
('serie','The Mentalist','Um ex-falso vidente usa suas incríveis habilidades de observação para ajudar o CBI a capturar assassinos em série.',2008,'14',8.2,'https://picsum.photos/seed/mentalist/400/600','https://picsum.photos/seed/mentalist-wide/1600/700',0,0),
('serie','Peaky Blinders','Na Inglaterra dos anos 1920, Thomas Shelby lidera uma perigosa gangue criminosa disposta a construir um império a qualquer custo.',2013,'16',8.8,'https://picsum.photos/seed/peakyblinders/400/600','https://picsum.photos/seed/peaky-wide/1600/700',0,0),
('serie','The Walking Dead','Sobreviventes de um apocalipse zumbi lutam não apenas contra os mortos-vivos, mas contra a brutalidade da própria natureza humana.',2010,'16',8.2,'https://picsum.photos/seed/walkingdead/400/600','https://picsum.photos/seed/twd-wide/1600/700',0,0),
('serie','Chainsmoker Cat','Em um submundo underground de Tóquio, um gato antropomórfico detetive desvenda casos bizarros entre fumaça e mistério.',2023,'16',8.0,'https://picsum.photos/seed/chainsmoker/400/600','https://picsum.photos/seed/cat-wide/1600/700',0,0);

-- Gêneros dos filmes/séries
INSERT INTO titulo_genero (id_titulo, id_genero)
SELECT t.id_titulo, g.id_genero FROM titulos t, generos g WHERE
 (t.titulo='South Park' AND g.slug IN ('comedia','animacao','drama')) OR
 (t.titulo='Scream 7' AND g.slug IN ('terror','suspense','misterio')) OR
 (t.titulo='Iron Lung' AND g.slug IN ('terror','suspense','ficcao-cientifica')) OR
 (t.titulo='Invocação do Mal' AND g.slug IN ('terror','misterio')) OR
 (t.titulo='Predador: Terras Selvagens' AND g.slug IN ('acao','ficcao-cientifica','aventura')) OR
 (t.titulo='Avatar: Fogo e Cinzas' AND g.slug IN ('ficcao-cientifica','aventura','acao')) OR
 (t.titulo='Justiça Artificial' AND g.slug IN ('ficcao-cientifica','suspense','drama')) OR
 (t.titulo='Resident Evil: Origens' AND g.slug IN ('terror','acao','suspense')) OR
 (t.titulo='Toy Story 5' AND g.slug IN ('comedia','aventura','fantasia')) OR
 (t.titulo='Tron: Ares' AND g.slug IN ('ficcao-cientifica','acao')) OR
 (t.titulo='Jurassic World: Renascimento' AND g.slug IN ('aventura','acao','ficcao-cientifica')) OR
 (t.titulo='Quarteto Fantástico' AND g.slug IN ('acao','aventura','ficcao-cientifica')) OR
 (t.titulo='Duna: Parte 2' AND g.slug IN ('ficcao-cientifica','drama','aventura')) OR
 (t.titulo='Five Nights at Freddy''s' AND g.slug IN ('terror','misterio')) OR
 (t.titulo='Todo Mundo em Pânico' AND g.slug IN ('comedia')) OR
 (t.titulo='Mínimos & Monstros' AND g.slug IN ('comedia','animacao','fantasia')) OR
 (t.titulo='Vingadores: Guerras Secretas' AND g.slug IN ('acao','aventura','ficcao-cientifica')) OR
 (t.titulo='Michael' AND g.slug IN ('drama','documentario')) OR
 (t.titulo='Leviticus' AND g.slug IN ('suspense','drama','misterio')) OR
 (t.titulo='The Mandalorian' AND g.slug IN ('ficcao-cientifica','aventura','acao')) OR
 (t.titulo='The Boys' AND g.slug IN ('acao','comedia','drama')) OR
 (t.titulo='The Mentalist' AND g.slug IN ('misterio','drama')) OR
 (t.titulo='Peaky Blinders' AND g.slug IN ('drama','suspense')) OR
 (t.titulo='The Walking Dead' AND g.slug IN ('terror','drama','suspense')) OR
 (t.titulo='Chainsmoker Cat' AND g.slug IN ('comedia','misterio'));

-- ---------------------------------------------------------
-- EPISÓDIOS (South Park e outras séries)
-- ---------------------------------------------------------
INSERT INTO episodios (id_titulo, numero_temporada, numero_episodio, titulo_episodio, duracao_minutos, video_url)
SELECT id_titulo, 1, 1, 'Episódio 1 — Sonda Espacial Anal', 22, 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4' FROM titulos WHERE titulo='South Park'
UNION ALL SELECT id_titulo, 1, 2, 'Episódio 2 — Ganho de Peso 4000', 22, 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4' FROM titulos WHERE titulo='South Park'
UNION ALL SELECT id_titulo, 1, 3, 'Episódio 3 — Vulcão', 22, 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4' FROM titulos WHERE titulo='South Park'
UNION ALL SELECT id_titulo, 1, 1, 'Capítulo 1 — O Mandaloriano', 39, 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4' FROM titulos WHERE titulo='The Mandalorian'
UNION ALL SELECT id_titulo, 1, 2, 'Capítulo 2 — A Criança', 32, 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4' FROM titulos WHERE titulo='The Mandalorian'
UNION ALL SELECT id_titulo, 1, 1, 'Episódio 1 — O Nome do Jogo', 60, 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4' FROM titulos WHERE titulo='The Boys'
UNION ALL SELECT id_titulo, 1, 1, 'Episódio 1 — Piloto', 44, 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4' FROM titulos WHERE titulo='The Mentalist'
UNION ALL SELECT id_titulo, 1, 1, 'Episódio 1 — O Início de Shelby', 55, 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4' FROM titulos WHERE titulo='Peaky Blinders'
UNION ALL SELECT id_titulo, 1, 1, 'Episódio 1 — Dias Passados', 67, 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4' FROM titulos WHERE titulo='The Walking Dead';

