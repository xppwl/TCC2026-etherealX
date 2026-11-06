const pool = require('../config/db');
const { sincronizarTitulosBanco } = require('../services/embedMoviesService');

async function main() {
  console.log('🚀 Iniciando sincronização das capas e catálogo com a EmbedMovies API...');
  const res = await sincronizarTitulosBanco(pool);
  console.log('Resultado:', res);
  process.exit(0);
}

main();

