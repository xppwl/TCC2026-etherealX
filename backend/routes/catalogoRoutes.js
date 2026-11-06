const express = require('express');
const pool = require('../config/db');

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

// GET /api/titulos?tipo=filme|serie&genero=ID&busca=texto
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
      sql += ' AND t.tipo = ?';
      params.push(tipo);
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
    res.json(titulos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao buscar o catálogo.' });
  }
});

// GET /api/titulos/:id  -> detalhes de um filme/série + episódios (se for série)
router.get('/titulos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [titulos] = await pool.query(
      `SELECT t.*, GROUP_CONCAT(g.nome SEPARATOR ', ') AS generos
       FROM titulos t
       LEFT JOIN titulo_genero tg ON tg.id_titulo = t.id_titulo
       LEFT JOIN generos g ON g.id_genero = tg.id_genero
       WHERE t.id_titulo = ?
       GROUP BY t.id_titulo`,
      [id]
    );

    if (titulos.length === 0) {
      return res.status(404).json({ erro: 'Título não encontrado.' });
    }

    const titulo = titulos[0];

    if (titulo.tipo === 'serie') {
      const [episodios] = await pool.query(
        'SELECT * FROM episodios WHERE id_titulo = ? ORDER BY numero_temporada, numero_episodio',
        [id]
      );
      titulo.episodios = episodios;
    }

    res.json(titulo);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao buscar detalhes do título.' });
  }
});

module.exports = router;
