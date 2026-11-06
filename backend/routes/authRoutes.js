const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const crypto = require('crypto');
const pool = require('../config/db');
const {
  enviarEmailCodigoCadastro,
  enviarEmailRecuperacao,
  enviarEmailSenhaGerada,
  enviarEmailBoasVindas,
  enviarEmailConfirmacaoTroca,
} = require('../services/emailService');
require('dotenv').config();

const router = express.Router();

function gerarToken(usuario) {
  return jwt.sign(
    {
      id_usuario: usuario.id_usuario || usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      avatar_url: usuario.avatar_url || null
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// Gera uma senha segura pelo backend (ex: Eth@8xK2#m)
function gerarSenhaSegura(tamanho = 10) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789#$*';
  let senha = 'Eth@';
  for (let i = 0; i < tamanho - 4; i++) {
    senha += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return senha;
}

// POST /api/auth/solicitar-codigo-cadastro (Inicia o cadastro com verificação de código por e-mail)
router.post('/solicitar-codigo-cadastro', async (req, res) => {
  try {
    const { nome, email, senha } = req.body;

    if (!nome || !email || !senha) {
      return res.status(400).json({ erro: 'Preencha nome, e-mail e senha.' });
    }
    if (senha.length < 6) {
      return res.status(400).json({ erro: 'A senha precisa ter pelo menos 6 caracteres.' });
    }

    const emailLimpo = email.trim().toLowerCase();
    const [existentes] = await pool.query('SELECT id_usuario FROM usuarios WHERE email = ?', [emailLimpo]);
    if (existentes.length > 0) {
      return res.status(409).json({ erro: 'Já existe uma conta cadastrada com esse e-mail.' });
    }

    const senhaHash = await bcrypt.hash(senha, 10);
    const codigo = Math.floor(100000 + Math.random() * 900000).toString();
    const expiraEm = new Date(Date.now() + 30 * 60 * 1000); // 30 minutos

    // Remove pedidos pendentes antigos para o mesmo e-mail
    await pool.query('DELETE FROM verificacao_cadastro WHERE email = ? AND usado = 0', [emailLimpo]);

    await pool.query(
      'INSERT INTO verificacao_cadastro (nome, email, senha_hash, codigo, expira_em) VALUES (?, ?, ?, ?, ?)',
      [nome.trim(), emailLimpo, senhaHash, codigo, expiraEm]
    );

    const resultadoEnvio = await enviarEmailCodigoCadastro({
      email: emailLimpo,
      nome: nome.trim(),
      codigo,
    });

    if (!resultadoEnvio.sucesso) {
      console.error(`[ERRO ENVIO EMAIL CADASTRO] Não foi possível enviar para ${emailLimpo}: ${resultadoEnvio.erro}`);
      return res.status(503).json({
        erro: 'Não foi possível enviar o código para o seu e-mail no momento. Verifique a conexão com a internet ou firewall da rede e tente novamente.',
      });
    }

    res.json({
      sucesso: true,
      mensagem: 'Código de verificação enviado para o seu e-mail!',
      email: emailLimpo,
    });
  } catch (err) {
    console.error('Erro ao solicitar código de cadastro:', err);
    res.status(500).json({ erro: 'Erro ao processar o cadastro. Tente novamente.' });
  }
});

// POST /api/auth/confirmar-cadastro (Valida o código e ativa a conta no banco)
router.post('/confirmar-cadastro', async (req, res) => {
  try {
    const { email, codigo } = req.body;

    if (!email || !codigo) {
      return res.status(400).json({ erro: 'Informe o e-mail e o código de verificação.' });
    }

    const emailLimpo = email.trim().toLowerCase();

    const [rows] = await pool.query(
      'SELECT * FROM verificacao_cadastro WHERE email = ? AND codigo = ? AND usado = 0 AND expira_em > NOW() ORDER BY id_verificacao DESC LIMIT 1',
      [emailLimpo, codigo.trim()]
    );
    const pendente = rows[0];

    if (!pendente) {
      return res.status(400).json({ erro: 'Código de verificação incorreto ou expirado. Solicite um novo código.' });
    }

    // Verifica se a conta já foi criada por outro processo
    const [existentes] = await pool.query('SELECT id_usuario FROM usuarios WHERE email = ?', [emailLimpo]);
    if (existentes.length > 0) {
      return res.status(409).json({ erro: 'Este e-mail já foi ativado. Você já pode fazer login.' });
    }

    // Insere o usuário final no banco de dados
    const [result] = await pool.query(
      'INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)',
      [pendente.nome, pendente.email, pendente.senha_hash]
    );

    // Marca o código como utilizado
    await pool.query('UPDATE verificacao_cadastro SET usado = 1 WHERE id_verificacao = ?', [pendente.id_verificacao]);

    const usuario = {
      id_usuario: result.insertId,
      nome: pendente.nome,
      email: pendente.email,
      avatar_url: null,
    };
    const token = gerarToken(usuario);

    // Dispara e-mail de boas-vindas assincronamente
    enviarEmailBoasVindas({ email: usuario.email, nome: usuario.nome }).catch(() => {});

    res.status(201).json({
      sucesso: true,
      token,
      usuario,
      mensagem: 'Conta ativada e verificada com sucesso! Bem-vindo(a) ao Ethereal X.',
    });
  } catch (err) {
    console.error('Erro ao confirmar cadastro:', err);
    res.status(500).json({ erro: 'Erro ao ativar sua conta. Tente novamente.' });
  }
});

// POST /api/auth/registro (Compatibilidade: com ou sem código)
router.post('/registro', async (req, res) => {
  try {
    const { nome, email, senha, codigo } = req.body;

    // Se o código foi enviado, valida diretamente e ativa
    if (codigo) {
      const emailLimpo = email.trim().toLowerCase();
      const [rows] = await pool.query(
        'SELECT * FROM verificacao_cadastro WHERE email = ? AND codigo = ? AND usado = 0 AND expira_em > NOW() ORDER BY id_verificacao DESC LIMIT 1',
        [emailLimpo, codigo.trim()]
      );
      const pendente = rows[0];
      if (!pendente) {
        return res.status(400).json({ erro: 'Código incorreto ou expirado.' });
      }

      const [result] = await pool.query(
        'INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)',
        [pendente.nome, pendente.email, pendente.senha_hash]
      );
      await pool.query('UPDATE verificacao_cadastro SET usado = 1 WHERE id_verificacao = ?', [pendente.id_verificacao]);

      const usuario = { id_usuario: result.insertId, nome: pendente.nome, email: pendente.email, avatar_url: null };
      const token = gerarToken(usuario);
      enviarEmailBoasVindas({ email: usuario.email, nome: usuario.nome }).catch(() => {});
      return res.status(201).json({ token, usuario });
    }

    if (!nome || !email || !senha) {
      return res.status(400).json({ erro: 'Preencha nome, e-mail e senha.' });
    }
    if (senha.length < 6) {
      return res.status(400).json({ erro: 'A senha precisa ter pelo menos 6 caracteres.' });
    }

    const [existentes] = await pool.query('SELECT id_usuario FROM usuarios WHERE email = ?', [email]);
    if (existentes.length > 0) {
      return res.status(409).json({ erro: 'Já existe uma conta com esse e-mail.' });
    }

    const senhaHash = await bcrypt.hash(senha, 10);
    const [result] = await pool.query(
      'INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)',
      [nome, email, senhaHash]
    );

    const usuario = { id_usuario: result.insertId, nome, email, avatar_url: null };
    const token = gerarToken(usuario);

    enviarEmailBoasVindas({ email, nome }).catch(() => {});

    res.status(201).json({ token, usuario });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao criar sua conta. Tente novamente.' });
  }
});

// POST /api/auth/criar-com-senha-gerada (Backend gera a senha e manda por e-mail)
router.post('/criar-com-senha-gerada', async (req, res) => {
  try {
    const { nome, email } = req.body;

    if (!nome || !email) {
      return res.status(400).json({ erro: 'Preencha nome e e-mail.' });
    }

    const [existentes] = await pool.query('SELECT id_usuario FROM usuarios WHERE email = ?', [email]);
    if (existentes.length > 0) {
      return res.status(409).json({ erro: 'Já existe uma conta com esse e-mail.' });
    }

    const senhaGerada = gerarSenhaSegura(10);
    const senhaHash = await bcrypt.hash(senhaGerada, 10);

    const [result] = await pool.query(
      'INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)',
      [nome, email, senhaHash]
    );

    const usuario = { id_usuario: result.insertId, nome, email, avatar_url: null };
    const token = gerarToken(usuario);

    // Envia a senha gerada pelo backend por e-mail
    await enviarEmailBoasVindas({ email, nome, senhaGerada }).catch((e) => {
      console.warn('Falha no envio do e-mail:', e.message);
    });

    res.status(201).json({
      token,
      usuario,
      senhaGerada,
      mensagem: 'Conta criada com sucesso! Sua senha de acesso foi gerada e enviada para o seu e-mail.',
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao criar sua conta com senha gerada.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, senha } = req.body;
    if (!email || !senha) {
      return res.status(400).json({ erro: 'Informe e-mail e senha.' });
    }

    const [rows] = await pool.query('SELECT * FROM usuarios WHERE email = ?', [email]);
    const usuario = rows[0];

    const hashSenha = usuario ? (usuario.senha || usuario.senha_hash) : null;
    if (!usuario || !hashSenha) {
      return res.status(401).json({ erro: 'E-mail ou senha incorretos.' });
    }

    const senhaCorreta = await bcrypt.compare(senha, hashSenha);
    if (!senhaCorreta) {
      return res.status(401).json({ erro: 'E-mail ou senha incorretos.' });
    }

    const token = gerarToken(usuario);
    // Constrói objeto limpo sem expor senha ao frontend
    const usuarioPublico = {
      id_usuario: usuario.id_usuario || usuario.id,
      nome:       usuario.nome,
      email:      usuario.email,
      avatar_url: usuario.avatar_url || null,
    };
    res.json({ token, usuario: usuarioPublico });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao entrar na sua conta. Tente novamente.' });
  }
});

// POST /api/auth/esqueci-senha (e /recuperar-senha)
// Gera token e código de recuperação e despacha por e-mail
const handleRecuperarSenha = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !email.trim()) {
      return res.status(400).json({ erro: 'Informe o seu e-mail cadastrado.' });
    }

    const [rows] = await pool.query('SELECT id_usuario, nome, email FROM usuarios WHERE email = ?', [email.trim()]);
    const usuario = rows[0];

    if (!usuario) {
      return res.status(404).json({ erro: 'Nenhuma conta encontrada com este e-mail.' });
    }

    // Gera token de 32 bytes (64 hex) e código de 6 dígitos
    const token = crypto.randomBytes(32).toString('hex');
    const codigo = Math.floor(100000 + Math.random() * 900000).toString();
    const expiraEm = new Date(Date.now() + 30 * 60 * 1000); // 30 minutos

    await pool.query(
      'INSERT INTO recuperacao_senha (id_usuario, token, codigo, expira_em) VALUES (?, ?, ?, ?)',
      [usuario.id_usuario, token, codigo, expiraEm]
    );

    const frontendBase = process.env.FRONTEND_URL || 'http://localhost:5173';
    const linkRedefinir = `${frontendBase}/redefinir-senha?token=${token}&email=${encodeURIComponent(usuario.email)}`;

    // Dispara o e-mail via Nodemailer
    const resultadoEnvio = await enviarEmailRecuperacao({
      email: usuario.email,
      nome: usuario.nome,
      token,
      codigo,
      linkRedefinir,
    });

    if (!resultadoEnvio.sucesso) {
      console.error(`[ERRO ENVIO EMAIL RECUPERACAO] Falha ao enviar para ${usuario.email}: ${resultadoEnvio.erro}`);
      return res.status(503).json({
        erro: 'Não foi possível enviar o e-mail com o código de redefinição. Verifique a conexão com a internet ou firewall da rede e tente novamente.',
      });
    }

    res.json({
      sucesso: true,
      mensagem: 'Código de 6 dígitos enviado para seu e-mail! Verifique a sua caixa de entrada.',
      email: usuario.email,
    });
  } catch (err) {
    console.error('Erro ao recuperar senha:', err);
    res.status(500).json({ erro: 'Erro interno ao processar a recuperação de senha.' });
  }
};

router.post('/esqueci-senha', handleRecuperarSenha);
router.post('/recuperar-senha', handleRecuperarSenha);

// POST /api/auth/gerar-senha-provisoria
// O backend gera uma senha segura na hora e envia direto ao e-mail do usuário
router.post('/gerar-senha-provisoria', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !email.trim()) {
      return res.status(400).json({ erro: 'Informe o e-mail da conta.' });
    }

    const [rows] = await pool.query('SELECT id_usuario, nome, email FROM usuarios WHERE email = ?', [email.trim()]);
    const usuario = rows[0];

    if (!usuario) {
      return res.status(404).json({ erro: 'Nenhuma conta encontrada com este e-mail.' });
    }

    const novaSenha = gerarSenhaSegura(10);
    const hashSenha = await bcrypt.hash(novaSenha, 10);

    await pool.query('UPDATE usuarios SET senha = ? WHERE id_usuario = ?', [hashSenha, usuario.id_usuario]);

    const resultadoEnvio = await enviarEmailSenhaGerada({
      email: usuario.email,
      nome: usuario.nome,
      novaSenha,
    });

    if (!resultadoEnvio.sucesso) {
      console.error(`[ERRO ENVIO EMAIL SENHA PROVISORIA] Falha ao enviar para ${usuario.email}: ${resultadoEnvio.erro}`);
      return res.status(503).json({
        erro: 'Não foi possível enviar a nova senha por e-mail no momento. Tente novamente.',
      });
    }

    res.json({
      sucesso: true,
      mensagem: 'Uma nova senha foi gerada com sucesso e enviada para o seu e-mail!',
      email: usuario.email,
    });
  } catch (err) {
    console.error('Erro ao gerar senha provisória:', err);
    res.status(500).json({ erro: 'Erro ao gerar nova senha pelo sistema.' });
  }
});

// POST /api/auth/validar-codigo
// Valida se o código de 6 dígitos é válido para o e-mail
router.post('/validar-codigo', async (req, res) => {
  try {
    const { email, codigo } = req.body;
    if (!email || !codigo) {
      return res.status(400).json({ erro: 'Informe o e-mail e o código de verificação.' });
    }

    const [userRows] = await pool.query('SELECT id_usuario FROM usuarios WHERE email = ?', [email.trim()]);
    const user = userRows[0];
    if (!user) {
      return res.status(404).json({ erro: 'Nenhuma conta encontrada com este e-mail.' });
    }

    const [rows] = await pool.query(
      'SELECT id_recuperacao, token FROM recuperacao_senha WHERE codigo = ? AND id_usuario = ? AND usado = 0 AND expira_em > NOW() ORDER BY id_recuperacao DESC LIMIT 1',
      [codigo.trim(), user.id_usuario]
    );

    if (rows.length === 0) {
      return res.status(400).json({ erro: 'Código incorreto ou expirado. Verifique seu e-mail ou envie outro código.' });
    }

    res.json({
      sucesso: true,
      mensagem: 'Código validado com sucesso! Agora você pode criar sua nova senha.',
      token: rows[0].token,
    });
  } catch (err) {
    console.error('Erro ao validar código:', err);
    res.status(500).json({ erro: 'Erro interno ao validar o código.' });
  }
});

// POST /api/auth/redefinir-senha
// Valida o token ou código e salva a nova senha escolhida pelo usuário
router.post('/redefinir-senha', async (req, res) => {
  try {
    const { token, codigo, email, novaSenha } = req.body;

    if (!novaSenha || novaSenha.length < 6) {
      return res.status(400).json({ erro: 'A nova senha precisa ter pelo menos 6 caracteres.' });
    }

    let registroRecuperacao = null;

    if (token) {
      const [rows] = await pool.query(
        'SELECT * FROM recuperacao_senha WHERE token = ? AND usado = 0 AND expira_em > NOW() ORDER BY id_recuperacao DESC LIMIT 1',
        [token]
      );
      registroRecuperacao = rows[0];
    } else if (codigo && email) {
      const [userRows] = await pool.query('SELECT id_usuario FROM usuarios WHERE email = ?', [email.trim()]);
      const user = userRows[0];
      if (user) {
        const [rows] = await pool.query(
          'SELECT * FROM recuperacao_senha WHERE codigo = ? AND id_usuario = ? AND usado = 0 AND expira_em > NOW() ORDER BY id_recuperacao DESC LIMIT 1',
          [codigo.trim(), user.id_usuario]
        );
        registroRecuperacao = rows[0];
      }
    }

    if (!registroRecuperacao) {
      return res.status(400).json({
        erro: 'Código ou link de redefinição inválido ou expirado. Por favor, solicite novamente.',
      });
    }

    // Busca dados do usuário para confirmação
    const [userRows] = await pool.query('SELECT id_usuario, nome, email FROM usuarios WHERE id_usuario = ?', [
      registroRecuperacao.id_usuario,
    ]);
    const usuario = userRows[0];

    const hashSenha = await bcrypt.hash(novaSenha, 10);

    // Atualiza a senha no banco e invalida o token
    await pool.query('UPDATE usuarios SET senha = ? WHERE id_usuario = ?', [hashSenha, registroRecuperacao.id_usuario]);
    await pool.query('UPDATE recuperacao_senha SET usado = 1 WHERE id_recuperacao = ?', [registroRecuperacao.id_recuperacao]);

    if (usuario) {
      enviarEmailConfirmacaoTroca({ email: usuario.email, nome: usuario.nome }).catch(() => {});
    }

    res.json({
      sucesso: true,
      mensagem: 'Senha redefinida com sucesso! Você já pode entrar com sua nova senha.',
    });
  } catch (err) {
    console.error('Erro ao redefinir senha:', err);
    res.status(500).json({ erro: 'Erro interno ao redefinir sua senha.' });
  }
});

// GET /api/auth/google  -> inicia o login com Google
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }));

// GET /api/auth/google/callback -> o Google redireciona pra cá
router.get('/google/callback', (req, res, next) => {
  passport.authenticate('google', { session: false }, (err, user, info) => {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const urlDestino = frontendUrl.replace(':5500', ':5173');

    if (err || !user) {
      console.error('❌ ERRO NO PASSPORT/LOGIN GOOGLE:', err || info);
      return res.redirect(`${urlDestino}/login?erro=google`);
    }

    const token = gerarToken(user);
    res.redirect(`${urlDestino}/auth-sucesso?token=${token}`);
  })(req, res, next);
});

module.exports = router;
