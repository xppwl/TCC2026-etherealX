/**
 * Serviço de Integração com a EmbedMovies API (https://embedmovies.org)
 * Fornece catálogo dinâmico de Filmes, Séries e Animes/Mangás com posters em alta definição (TMDB CDN)
 * e player de streaming via iframe oficial (https://myembed.biz).
 */

const TMDB_POSTER_BASE = 'https://image.tmdb.org/t/p/w500';
const TMDB_BACKDROP_BASE = 'https://image.tmdb.org/t/p/original';
const EMBEDMOVIES_AJAX_URL = 'https://embedmovies.org/inc/Ajax.php';

// Cache simples em memória com TTL de 15 minutos
const cache = new Map();
const CACHE_TTL_MS = 15 * 60 * 1000;

function getFromCache(chave) {
  const item = cache.get(chave);
  if (!item) return null;
  if (Date.now() - item.timestamp > CACHE_TTL_MS) {
    cache.delete(chave);
    return null;
  }
  return item.dados;
}

function setInCache(chave, dados) {
  cache.set(chave, { timestamp: Date.now(), dados });
}

/**
 * Normaliza e formata um item retornado pela API da EmbedMovies
 */
function formatarItem(item) {
  if (!item) return null;

  const tituloStr =
    (typeof item.title === 'object' ? item.title?.pt || item.title?.en : item.title) ||
    item.name ||
    'Sem título';

  const sinopseStr =
    (typeof item.excerpt === 'object' ? item.excerpt?.pt || item.excerpt?.en : item.excerpt) ||
    item.overview ||
    item.sinopse ||
    'Sinopse não informada.';

  // Capa oficial em alta qualidade (TMDB)
  let posterUrl = null;
  if (item.images?.poster) {
    posterUrl = item.images.poster.startsWith('http')
      ? item.images.poster
      : `${TMDB_POSTER_BASE}${item.images.poster}`;
  } else if (item.poster_path) {
    posterUrl = `${TMDB_POSTER_BASE}${item.poster_path}`;
  }

  // Banner horizontal em alta qualidade
  let bannerUrl = null;
  if (item.images?.backdrop) {
    bannerUrl = item.images.backdrop.startsWith('http')
      ? item.images.backdrop
      : `${TMDB_BACKDROP_BASE}${item.images.backdrop}`;
  } else if (item.backdrop_path) {
    bannerUrl = `${TMDB_BACKDROP_BASE}${item.backdrop_path}`;
  } else {
    bannerUrl = posterUrl;
  }

  // Mapeamento de tipo para o padrão Ethereal X
  let tipoFormatado = 'filme';
  if (item.is_anime || item.type === 'anime') {
    tipoFormatado = 'manga'; // Suporte a mangá/anime
  } else if (item.type === 'tv' || item.type === 'serie' || item.type === 'series') {
    tipoFormatado = 'serie';
  }

  // Construção do link do player EmbedMovies
  let embedUrl = item.embed;
  if (!embedUrl) {
    if (item.imdb_id) {
      embedUrl = `https://myembed.biz/filme/${item.imdb_id}`;
    } else if (item.tmdb_id) {
      const rota = tipoFormatado === 'filme' ? 'filme' : 'serie';
      embedUrl = `https://myembed.biz/${rota}/${item.tmdb_id}`;
    }
  }

  let ano = null;
  if (item.release_date) {
    const parsedYear = parseInt(item.release_date.substring(0, 4), 10);
    if (!isNaN(parsedYear)) ano = parsedYear;
  }

  const nota = item.vote_average ? Number(item.vote_average) : 7.5;

  return {
    id_origem: item.id || item.tmdb_id,
    id_titulo: item.id || item.tmdb_id,
    titulo: tituloStr,
    tipo: tipoFormatado,
    tipo_origem: item.type,
    sinopse: sinopseStr,
    ano_lancamento: ano,
    classificacao: item.is_adult ? '18' : '14',
    duracao_minutos: item.runtime || (tipoFormatado === 'filme' ? 115 : null),
    nota,
    poster_url: posterUrl,
    banner_url: bannerUrl,
    video_url: embedUrl,
    embed_url: embedUrl,
    tmdb_id: item.tmdb_id || (item.external_ids ? item.external_ids.tmdb : null),
    imdb_id: item.imdb_id || (item.external_ids ? item.external_ids.imdb : null),
    is_anime: Boolean(item.is_anime || item.type === 'anime'),
    generos: tipoFormatado === 'manga' ? 'Anime, Mangá, Aventura' : (tipoFormatado === 'serie' ? 'Série, Drama' : 'Filme, Ação'),
    destaque: item.popularity > 10,
    em_alta: true,
  };
}

/**
 * Busca o catálogo da EmbedMovies por tipo ('movie', 'tv' ou 'anime') e página
 */
async function buscarCatalogoEmbed({ tipo = 'movie', page = 1 } = {}) {
  // Mapeia tipos Ethereal X para tipos aceitos pela EmbedMovies API
  let tipoApi = 'movie';
  if (tipo === 'serie' || tipo === 'series' || tipo === 'tv') {
    tipoApi = 'tv';
  } else if (tipo === 'manga' || tipo === 'anime' || tipo === 'animes') {
    tipoApi = 'anime';
  }

  const cacheKey = `catalog_${tipoApi}_${page}`;
  const emCache = getFromCache(cacheKey);
  if (emCache) return emCache;

  try {
    const params = new URLSearchParams({
      action: 'catalog',
      type: tipoApi,
      page: String(page),
    });

    const resposta = await fetch(EMBEDMOVIES_AJAX_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-Requested-With': 'XMLHttpRequest',
        'User-Agent': 'EtherealX-Streaming/1.0',
      },
      body: params,
    });

    if (!resposta.ok) {
      throw new Error(`Erro na EmbedMovies API: HTTP ${resposta.status}`);
    }

    const json = await resposta.json();
    const resultados = (json.results || []).map(formatarItem).filter(Boolean);

    const dadosFinal = {
      sucesso: true,
      tipo: tipoApi,
      pagina: json.page || page,
      total_paginas: json.total_pages || 1,
      total_resultados: json.total_results || resultados.length,
      resultados,
    };

    setInCache(cacheKey, dadosFinal);
    return dadosFinal;
  } catch (err) {
    console.error('⚠️ [EmbedMovies API Error]:', err.message);
    return { sucesso: false, erro: err.message, resultados: [] };
  }
}

/**
 * Pesquisa filmes, séries e animes/mangás na EmbedMovies API por título
 */
async function pesquisarEmbed(query) {
  if (!query || !query.trim()) return [];

  const cacheKey = `search_${query.trim().toLowerCase()}`;
  const emCache = getFromCache(cacheKey);
  if (emCache) return emCache;

  try {
    const params = new URLSearchParams({
      type: 'search',
      search: query.trim(),
    });

    const resposta = await fetch(EMBEDMOVIES_AJAX_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-Requested-With': 'XMLHttpRequest',
        'User-Agent': 'EtherealX-Streaming/1.0',
      },
      body: params,
    });

    if (!resposta.ok) throw new Error(`Erro na busca: ${resposta.status}`);

    const json = await resposta.json();
    const formatados = (json.results || []).map(formatarItem).filter(Boolean);

    setInCache(cacheKey, formatados);
    return formatados;
  } catch (err) {
    console.error('⚠️ [EmbedMovies Search Error]:', err.message);
    return [];
  }
}

/**
 * Atualiza ou insere títulos da EmbedMovies no banco MySQL local
 * garantindo que as capas do banco fiquem com as fotos em alta definição da API
 */
async function sincronizarTitulosBanco(pool) {
  try {
    console.log('🎬 [EmbedMovies] Sincronizando capas e títulos do banco com a API...');

    // 1. Busca os títulos mais populares de cada categoria da EmbedMovies
    const [filmesRes, seriesRes, animesRes] = await Promise.all([
      buscarCatalogoEmbed({ tipo: 'movie', page: 1 }),
      buscarCatalogoEmbed({ tipo: 'tv', page: 1 }),
      buscarCatalogoEmbed({ tipo: 'anime', page: 1 }),
    ]);

    const itensParaSalvar = [
      ...(filmesRes.resultados || []).slice(0, 15),
      ...(seriesRes.resultados || []).slice(0, 15),
      ...(animesRes.resultados || []).slice(0, 15),
    ];

    let inseridos = 0;
    let atualizados = 0;

    for (const item of itensParaSalvar) {
      if (!item.titulo || !item.poster_url) continue;

      // Verifica se o título já existe por tmdb_id ou nome
      const [existentes] = await pool.query(
        'SELECT id_titulo FROM titulos WHERE (tmdb_id = ? AND tmdb_id IS NOT NULL) OR titulo = ? LIMIT 1',
        [item.tmdb_id, item.titulo]
      );

      if (existentes.length > 0) {
        // Atualiza a capa e os links com a foto real da API
        await pool.query(
          `UPDATE titulos 
           SET poster_url = ?, banner_url = ?, embed_url = ?, video_url = ?, sinopse = ?, nota = ?, ano_lancamento = ?
           WHERE id_titulo = ?`,
          [
            item.poster_url,
            item.banner_url,
            item.embed_url,
            item.video_url,
            item.sinopse,
            item.nota,
            item.ano_lancamento,
            existentes[0].id_titulo,
          ]
        );
        atualizados++;
      } else {
        // Insere o novo filme, série ou mangá/anime
        const [insertRes] = await pool.query(
          `INSERT INTO titulos (tipo, titulo, sinopse, ano_lancamento, classificacao, duracao_minutos, nota, poster_url, banner_url, video_url, embed_url, tmdb_id, imdb_id, destaque, em_alta)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            item.tipo,
            item.titulo,
            item.sinopse,
            item.ano_lancamento,
            item.classificacao,
            item.duracao_minutos,
            item.nota,
            item.poster_url,
            item.banner_url,
            item.video_url,
            item.embed_url,
            item.tmdb_id,
            item.imdb_id,
            item.destaque ? 1 : 0,
            1,
          ]
        );
        inseridos++;
      }
    }

    console.log(`✅ [EmbedMovies] Sincronização concluída: ${inseridos} novos títulos inseridos, ${atualizados} capas atualizadas.`);
    return { inseridos, atualizados };
  } catch (err) {
    console.error('❌ [EmbedMovies Sync Error]:', err.message);
    return { erro: err.message };
  }
}

module.exports = {
  buscarCatalogoEmbed,
  pesquisarEmbed,
  formatarItem,
  sincronizarTitulosBanco,
  TMDB_POSTER_BASE,
  TMDB_BACKDROP_BASE,
};

