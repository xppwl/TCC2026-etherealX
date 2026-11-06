const pool = require('../config/db');
const { pesquisarEmbed } = require('../services/embedMoviesService');

async function updateOldTitles() {
  await pool.query(
    "UPDATE titulos SET poster_url = 'https://image.tmdb.org/t/p/w500/wDWAA5QApz5LUK8fUm4SplxYZZP.jpg', banner_url = 'https://image.tmdb.org/t/p/original/4HodYYKEIsGOdinkGi2Ucz6X9i0.jpg' WHERE titulo LIKE '%Scream%'"
  );

  const [titulos] = await pool.query("SELECT id_titulo, titulo FROM titulos WHERE poster_url LIKE '%picsum%'");
  console.log(`🔍 Encontrados ${titulos.length} títulos antigos com capas placeholder para atualizar...`);

  for (const t of titulos) {
    const termo = t.titulo.split(':')[0].trim();
    const resultados = await pesquisarEmbed(termo);
    if (resultados && resultados.length > 0) {
      const match = resultados[0];
      await pool.query(
        'UPDATE titulos SET poster_url = ?, banner_url = ?, embed_url = ?, tmdb_id = ? WHERE id_titulo = ?',
        [match.poster_url, match.banner_url, match.embed_url, match.tmdb_id, t.id_titulo]
      );
      console.log(`✅ [${t.titulo}] Atualizado com capa da API: ${match.poster_url}`);
    }
  }

  console.log('🎉 Todas as capas antigas foram atualizadas com sucesso para fotos reais da API!');
  process.exit(0);
}

updateOldTitles();
