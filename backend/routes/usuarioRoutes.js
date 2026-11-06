const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../config/db');
const autenticar = require('../middleware/authMiddleware');

const router = express.Router();

// 1. GET /api/usuario/perfil -> Carrega dados e preferências do usuário
router.get('/perfil', autenticar, async (req, res) => {
  try {
    const idUsuario = req.usuario.id_usuario || req.usuario.id;
    const [rows] = await pool.query(
      'SELECT id_usuario, nome, email, senha, autoplay, qualidade_padrao, legendas_padrao, notificacoes_email FROM usuarios WHERE id_usuario = ?',
      [idUsuario]
    );

    if (rows.length === 0) {
      return res.status(404).json({ erro: 'Usuário não encontrado.' });
    }

    const u = rows[0];
    res.json({
      id_usuario: u.id_usuario,
      nome: u.nome,
      email: u.email,
      temSenha: Boolean(u.senha),
      autoplay: Boolean(u.autoplay),
      qualidade_padrao: u.qualidade_padrao || 'auto',
      legendas_padrao: Boolean(u.legendas_padrao),
      notificacoes_email: Boolean(u.notificacoes_email)
    });
  } catch (err) {
    console.error('Erro em GET /perfil:', err);
    res.status(500).json({ erro: 'Erro ao carregar dados do perfil.' });
  }
});

// 2. PUT /api/usuario/perfil -> Atualiza o Nome
router.put('/perfil', autenticar, async (req, res) => {
  try {
    const idUsuario = req.usuario.id_usuario || req.usuario.id;
    const { nome } = req.body;

    if (!nome || nome.trim() === '') {
      return res.status(400).json({ erro: 'O nome não pode ficar em branco.' });
    }

    await pool.query('UPDATE usuarios SET nome = ? WHERE id_usuario = ?', [nome.trim(), idUsuario]);
    res.json({ mensagem: 'Perfil atualizado com sucesso!' });
  } catch (err) {
    console.error('Erro em PUT /perfil:', err);
    res.status(500).json({ erro: 'Erro ao atualizar o perfil.' });
  }
});

// 3. PUT /api/usuario/senha -> Cria ou altera a senha
router.put('/senha', autenticar, async (req, res) => {
  try {
    const idUsuario = req.usuario.id_usuario || req.usuario.id;
    const { senhaAtual, novaSenha } = req.body;

    if (!novaSenha || novaSenha.length < 6) {
      return res.status(400).json({ erro: 'A nova senha deve ter pelo menos 6 caracteres.' });
    }

    const [rows] = await pool.query('SELECT senha FROM usuarios WHERE id_usuario = ?', [idUsuario]);
    if (rows.length === 0) return res.status(404).json({ erro: 'Usuário não encontrado.' });

    const usuario = rows[0];

    // Se o usuário já possui senha cadastrada
    if (usuario.senha) {
      if (!senhaAtual) {
        return res.status(400).json({ erro: 'Informe a senha atual.' });
      }
      const senhaValida = await bcrypt.compare(senhaAtual, usuario.senha);
      if (!senhaValida) {
        return res.status(401).json({ erro: 'A senha atual está incorreta.' });
      }
    }

    const novaSenhaHash = await bcrypt.hash(novaSenha, 10);
    await pool.query('UPDATE usuarios SET senha = ? WHERE id_usuario = ?', [novaSenhaHash, idUsuario]);

    res.json({ mensagem: 'Senha atualizada com sucesso!' });
  } catch (err) {
    console.error('Erro em PUT /senha:', err);
    res.status(500).json({ erro: 'Erro interno ao alterar a senha.' });
  }
});

// 4. PUT /api/usuario/preferencias -> Salva as preferências (toggles)
router.put('/preferencias', autenticar, async (req, res) => {
  try {
    const idUsuario = req.usuario.id_usuario || req.usuario.id;
    const {
      autoplay, autoPlay,
      qualidade_padrao, qualidadeHd,
      legendas_padrao, legendas,
      notificacoes_email, notificacoes
    } = req.body;

    const ap = Boolean(autoplay !== undefined ? autoplay : autoPlay);
    const qp = qualidade_padrao || (qualidadeHd ? '1080p' : 'auto');
    const leg = Boolean(legendas_padrao !== undefined ? legendas_padrao : legendas);
    const notif = Boolean(notificacoes_email !== undefined ? notificacoes_email : notificacoes);

    await pool.query(
      `UPDATE usuarios 
       SET autoplay = ?, qualidade_padrao = ?, legendas_padrao = ?, notificacoes_email = ? 
       WHERE id_usuario = ?`,
      [ap, qp, leg, notif, idUsuario]
    );

    res.json({ mensagem: 'Preferências salvas com sucesso!' });
  } catch (err) {
    console.error('Erro em PUT /preferencias:', err);
    res.status(500).json({ erro: 'Erro ao salvar preferências.' });
  }
});

// 5. FAVORITOS
// GET /api/usuario/favoritos
router.get('/favoritos', autenticar, async (req, res) => {
  try {
    const idUsuario = req.usuario.id_usuario || req.usuario.id;
    const [rows] = await pool.query(
      `SELECT t.*, GROUP_CONCAT(g.nome SEPARATOR ', ') AS generos
       FROM favoritos f
       JOIN titulos t ON t.id_titulo = f.id_titulo
       LEFT JOIN titulo_genero tg ON tg.id_titulo = t.id_titulo
       LEFT JOIN generos g ON g.id_genero = tg.id_genero
       WHERE f.id_usuario = ?
       GROUP BY t.id_titulo
       ORDER BY f.criado_em DESC`,
      [idUsuario]
    );
    res.json(rows);
  } catch (err) {
    console.error('Erro em GET /favoritos:', err);
    res.status(500).json({ erro: 'Erro ao buscar favoritos.' });
  }
});

// POST /api/usuario/favoritos/:id
router.post('/favoritos/:id', autenticar, async (req, res) => {
  try {
    const idUsuario = req.usuario.id_usuario || req.usuario.id;
    const idTitulo = req.params.id;
    await pool.query(
      'INSERT IGNORE INTO favoritos (id_usuario, id_titulo) VALUES (?, ?)',
      [idUsuario, idTitulo]
    );
    res.json({ mensagem: 'Adicionado aos favoritos!' });
  } catch (err) {
    console.error('Erro em POST /favoritos:', err);
    res.status(500).json({ erro: 'Erro ao adicionar aos favoritos.' });
  }
});

// DELETE /api/usuario/favoritos/:id
router.delete('/favoritos/:id', autenticar, async (req, res) => {
  try {
    const idUsuario = req.usuario.id_usuario || req.usuario.id;
    const idTitulo = req.params.id;
    await pool.query(
      'DELETE FROM favoritos WHERE id_usuario = ? AND id_titulo = ?',
      [idUsuario, idTitulo]
    );
    res.json({ mensagem: 'Removido dos favoritos.' });
  } catch (err) {
    console.error('Erro em DELETE /favoritos:', err);
    res.status(500).json({ erro: 'Erro ao remover dos favoritos.' });
  }
});

// 6. MINHA LISTA
// GET /api/usuario/minha-lista
router.get('/minha-lista', autenticar, async (req, res) => {
  try {
    const idUsuario = req.usuario.id_usuario || req.usuario.id;
    const [rows] = await pool.query(
      `SELECT t.*, GROUP_CONCAT(g.nome SEPARATOR ', ') AS generos
       FROM minha_lista ml
       JOIN titulos t ON t.id_titulo = ml.id_titulo
       LEFT JOIN titulo_genero tg ON tg.id_titulo = t.id_titulo
       LEFT JOIN generos g ON g.id_genero = tg.id_genero
       WHERE ml.id_usuario = ?
       GROUP BY t.id_titulo
       ORDER BY ml.criado_em DESC`,
      [idUsuario]
    );
    res.json(rows);
  } catch (err) {
    console.error('Erro em GET /minha-lista:', err);
    res.status(500).json({ erro: 'Erro ao buscar Minha Lista.' });
  }
});

// POST /api/usuario/minha-lista/:id
router.post('/minha-lista/:id', autenticar, async (req, res) => {
  try {
    const idUsuario = req.usuario.id_usuario || req.usuario.id;
    const idTitulo = req.params.id;
    await pool.query(
      'INSERT IGNORE INTO minha_lista (id_usuario, id_titulo) VALUES (?, ?)',
      [idUsuario, idTitulo]
    );
    res.json({ mensagem: 'Adicionado à Minha Lista!' });
  } catch (err) {
    console.error('Erro em POST /minha-lista:', err);
    res.status(500).json({ erro: 'Erro ao adicionar à Minha Lista.' });
  }
});

// DELETE /api/usuario/minha-lista/:id
router.delete('/minha-lista/:id', autenticar, async (req, res) => {
  try {
    const idUsuario = req.usuario.id_usuario || req.usuario.id;
    const idTitulo = req.params.id;
    await pool.query(
      'DELETE FROM minha_lista WHERE id_usuario = ? AND id_titulo = ?',
      [idUsuario, idTitulo]
    );
    res.json({ mensagem: 'Removido da Minha Lista.' });
  } catch (err) {
    console.error('Erro em DELETE /minha-lista:', err);
    res.status(500).json({ erro: 'Erro ao remover da Minha Lista.' });
  }
});

// 7. HISTÓRICO
// GET /api/usuario/historico
router.get('/historico', autenticar, async (req, res) => {
  try {
    const idUsuario = req.usuario.id_usuario || req.usuario.id;
    const [rows] = await pool.query(
      `SELECT h.id_titulo, h.progresso_segundos, h.duracao_segundos, h.atualizado_em,
              t.titulo, t.tipo, t.ano_lancamento, t.poster_url, t.banner_url
       FROM historico h
       JOIN titulos t ON t.id_titulo = h.id_titulo
       WHERE h.id_usuario = ?
       ORDER BY h.atualizado_em DESC`,
      [idUsuario]
    );
    res.json(rows);
  } catch (err) {
    console.error('Erro em GET /historico:', err);
    res.status(500).json({ erro: 'Erro ao buscar histórico.' });
  }
});

// POST /api/usuario/historico/:id
router.post('/historico/:id', autenticar, async (req, res) => {
  try {
    const idUsuario = req.usuario.id_usuario || req.usuario.id;
    const idTitulo = req.params.id;
    const { progresso_segundos, duracao_segundos } = req.body;

    await pool.query(
      `INSERT INTO historico (id_usuario, id_titulo, progresso_segundos, duracao_segundos, atualizado_em)
       VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
       ON DUPLICATE KEY UPDATE
         progresso_segundos = VALUES(progresso_segundos),
         duracao_segundos = VALUES(duracao_segundos),
         atualizado_em = CURRENT_TIMESTAMP`,
      [idUsuario, idTitulo, progresso_segundos || 0, duracao_segundos || 0]
    );
    res.json({ mensagem: 'Progresso salvo com sucesso!' });
  } catch (err) {
    console.error('Erro em POST /historico:', err);
    res.status(500).json({ erro: 'Erro ao salvar histórico.' });
  }
});

// DELETE /api/usuario/historico/:id
router.delete('/historico/:id', autenticar, async (req, res) => {
  try {
    const idUsuario = req.usuario.id_usuario || req.usuario.id;
    const idTitulo = req.params.id;
    await pool.query(
      'DELETE FROM historico WHERE id_usuario = ? AND id_titulo = ?',
      [idUsuario, idTitulo]
    );
    res.json({ mensagem: 'Removido do histórico com sucesso!' });
  } catch (err) {
    console.error('Erro em DELETE /historico:', err);
    res.status(500).json({ erro: 'Erro ao remover do histórico.' });
  }
});

module.exports = router;
