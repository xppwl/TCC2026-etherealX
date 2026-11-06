const express = require('express');
const pool = require('../config/db');
const {
  buscarCatalogoEmbed,
  pesquisarEmbed,
  sincronizarTitulosBanco,
} = require('../services/embedMoviesService');

const router = express.Router();

// GET /api/generos
router.get('/generos', async (req, res) => {
  try {
    const [generos] = await pool.query('SELECT * FROM generos ORDER BY nome');
    res.json(generos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao buscar gêneros.' });
  }
});

// GET /api/catalogo/embedmovies?tipo=filme|serie|manga&page=1
// Endpoint direto para consumir o catálogo da EmbedMovies API com capas em alta resolução
router.get('/catalogo/embedmovies', async (req, res) => {
  try {
    const { tipo = 'movie', page = 1 } = req.query;
    const catalogo = await buscarCatalogoEmbed({ tipo, page: Number(page) || 1 });
    res.json(catalogo);
  } catch (err) {
    console.error('Erro na rota /catalogo/embedmovies:', err);
    res.status(500).json({ erro: 'Erro ao consultar a EmbedMovies API.' });
  }
});

// GET /api/catalogo/embedmovies/busca?q=termo
// Pesquisa em tempo real na EmbedMovies API
router.get('/catalogo/embedmovies/busca', async (req, res) => {
  try {
    const query = req.query.q || req.query.busca || '';
    if (!query.trim()) {
      return res.json([]);
    }
    const resultados = await pesquisarEmbed(query.trim());
    res.json(resultados);
  } catch (err) {
    console.error('Erro na rota /catalogo/embedmovies/busca:', err);
    res.status(500).json({ erro: 'Erro ao pesquisar na EmbedMovies API.' });
  }
});

// POST /api/catalogo/embedmovies/sincronizar
// Sincroniza o banco local com capas e títulos populares da EmbedMovies
router.post('/catalogo/embedmovies/sincronizar', async (req, res) => {
  try {
    const resultado = await sincronizarTitulosBanco(pool);
    res.json({ sucesso: true, resultado });
  } catch (err) {
    console.error('Erro na sincronização:', err);
    res.status(500).json({ erro: 'Falha ao sincronizar títulos.' });
  }
});

// GET /api/titulos?tipo=filme|serie|manga&genero=ID&busca=texto
router.get('/titulos', async (req, res) => {
  try {
    const { tipo, genero, busca } = req.query;
    let sql = `
      SELECT t.*, GROUP_CONCAT(g.nome SEPARATOR ', ') AS generos
      FROM titulos t
      LEFT JOIN titulo_genero tg ON tg.id_titulo = t.id_titulo
      LEFT JOIN generos g ON g.id_genero = tg.id_genero
      WHERE 1 = 1
    `;
    const params = [];

    if (tipo) {
      if (tipo === 'manga' || tipo === 'anime') {
        sql += " AND (t.tipo = 'manga' OR t.tipo = 'anime')";
      } else {
        sql += ' AND t.tipo = ?';
        params.push(tipo);
      }
    }
    if (genero) {
      sql += ' AND t.id_titulo IN (SELECT id_titulo FROM titulo_genero WHERE id_genero = ?)';
      params.push(genero);
    }
    if (busca) {
      sql += ' AND t.titulo LIKE ?';
      params.push(`%${busca}%`);
    }

    sql += ' GROUP BY t.id_titulo ORDER BY t.destaque DESC, t.ano_lancamento DESC';

    const [titulos] = await pool.query(sql, params);

    // Se a busca local não encontrar nada ou retornar poucos resultados, busca também na EmbedMovies API
    if (busca && titulos.length < 3) {
      const resultadosEmbed = await pesquisarEmbed(busca);
      const combinados = [...titulos];
      for (const item of resultadosEmbed) {
        if (!combinados.some((c) => c.titulo.toLowerCase() === item.titulo.toLowerCase())) {
          combinados.push(item);
        }
      }
      return res.json(combinados);
    }

    res.json(titulos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao buscar o catálogo.' });
  }
});

// GET /api/titulos/:id -> detalhes de um filme, série ou mangá/anime
router.get('/titulos/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Se o id for numérico, tenta buscar primeiro no banco local
    if (!isNaN(id)) {
      const [titulos] = await pool.query(
        `SELECT t.*, GROUP_CONCAT(g.nome SEPARATOR ', ') AS generos
         FROM titulos t
         LEFT JOIN titulo_genero tg ON tg.id_titulo = t.id_titulo
         LEFT JOIN generos g ON g.id_genero = tg.id_genero
         WHERE t.id_titulo = ?
         GROUP BY t.id_titulo`,
        [id]
      );

      if (titulos.length > 0) {
        const titulo = titulos[0];

        // Se for série, busca os episódios se existirem
        if (titulo.tipo === 'serie' || titulo.tipo === 'manga') {
          const [episodios] = await pool.query(
            'SELECT * FROM episodios WHERE id_titulo = ? ORDER BY numero_temporada, numero_episodio',
            [id]
          );
          titulo.episodios = episodios;
        }

        return res.json(titulo);
      }
    }

    // Se for um id externo ou não encontrado no banco, tenta buscar via EmbedMovies
    const termoBusca = String(id).replace(/^embed_/, '');
    const resultados = await pesquisarEmbed(termoBusca);
    if (resultados.length > 0) {
      return res.json(resultados[0]);
    }

    return res.status(404).json({ erro: 'Título não encontrado.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao buscar detalhes do título.' });
  }
});

module.exports = router;
