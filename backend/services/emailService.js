const nodemailer = require('nodemailer');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const smtpUser = process.env.SMTP_USER || '';
const smtpPass = (process.env.SMTP_PASS || '').replace(/\s+/g, '');
const emailFrom = process.env.EMAIL_FROM || `Ethereal X <${smtpUser}>`;

// Cria o transporter do Nodemailer (suporta Gmail direto ou SMTP customizado)
const transporter = nodemailer.createTransport(
  process.env.SMTP_HOST && process.env.SMTP_HOST !== 'smtp.gmail.com'
    ? {
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: { user: smtpUser, pass: smtpPass },
        tls: { rejectUnauthorized: false },
      }
    : {
        service: 'gmail',
        auth: { user: smtpUser, pass: smtpPass },
        tls: { rejectUnauthorized: false },
      }
);

/**
 * Template base de e-mail estilizado com a identidade visual Ethereal X (Cyberpunk Neon)
 */
function gerarTemplateBase({ titulo, subtitulo, conteudoHtml }) {
  return `
  <!DOCTYPE html>
  <html lang="pt-BR">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${titulo}</title>
    <style>
      body { margin: 0; padding: 0; background-color: #07040d; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #f6f0ff; -webkit-font-smoothing: antialiased; }
      .container { max-width: 580px; margin: 40px auto; background: #0e071a; border: 1.5px solid #7B2FF7; border-radius: 20px; overflow: hidden; box-shadow: 0 0 35px rgba(123, 47, 247, 0.35); }
      .header { padding: 36px 30px 20px; text-align: center; background: radial-gradient(circle at top, rgba(123, 47, 247, 0.4), transparent 70%); }
      .brand-title { font-size: 26px; font-weight: 800; letter-spacing: 2px; color: #ffffff; margin: 0; }
      .brand-title span { color: #b98bff; }
      .brand-sub { font-size: 11px; letter-spacing: 4px; color: #8577a6; font-weight: 700; margin-top: 5px; text-transform: uppercase; }
      .body-content { padding: 24px 34px 34px; line-height: 1.6; }
      .greeting { font-size: 19px; font-weight: 700; color: #ffffff; margin-bottom: 12px; }
      .text { font-size: 14.5px; color: #c8b9e8; margin-bottom: 22px; }
      .code-box { background: #000000; border: 1.5px solid #a855f7; border-radius: 12px; padding: 18px 24px; text-align: center; margin: 26px 0; box-shadow: 0 0 20px rgba(168, 85, 247, 0.25); }
      .code-label { font-size: 11.5px; text-transform: uppercase; letter-spacing: 2px; color: #8577a6; margin-bottom: 6px; }
      .code-value { font-size: 28px; font-weight: 800; letter-spacing: 6px; color: #b98bff; font-family: 'Courier New', Courier, monospace; }
      .btn { display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #a855f7, #7B2FF7); color: #ffffff !important; text-decoration: none; border-radius: 999px; font-weight: 700; font-size: 14.5px; letter-spacing: 0.5px; box-shadow: 0 4px 20px rgba(123, 47, 247, 0.5); text-align: center; }
      .btn-container { text-align: center; margin: 28px 0; }
      .warning-box { background: rgba(138, 43, 226, 0.1); border-left: 3px solid #b98bff; padding: 12px 16px; border-radius: 6px; font-size: 12.5px; color: #a89bc2; margin-top: 24px; }
      .footer { padding: 20px 30px; text-align: center; background: #07040d; border-top: 1px solid rgba(178, 107, 255, 0.15); font-size: 12px; color: #8577a6; }
      .footer a { color: #b98bff; text-decoration: none; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1 class="brand-title">ETHEREAL <span>X</span></h1>
        <div class="brand-sub">Streaming Platform</div>
      </div>
      <div class="body-content">
        ${conteudoHtml}
      </div>
      <div class="footer">
        <p>Ethereal X Streaming © 2026 — Plataforma de TCC</p>
        <p>Este é um e-mail automático. Por favor, não responda a esta mensagem.</p>
      </div>
    </div>
  </body>
  </html>
  `;
}

/**
 * Função segura para disparar o e-mail via Nodemailer com fallback em caso de bloqueio de porta local
 */
async function despacharEmail({ para, assunto, html, texto, codigo = null, token = null }) {
  try {
    const info = await transporter.sendMail({
      from: emailFrom,
      to: para,
      subject: assunto,
      text: texto,
      html: html,
    });
    console.log(`✉️ [EMAIL ENVIADO COM SUCESSO VIA GMAIL] Para: ${para} | Assunto: ${assunto} | ID: ${info.messageId}`);
    return { sucesso: true, messageId: info.messageId };
  } catch (err) {
    console.warn('\n======================================================================');
    console.warn(`⚠️ [AVISO DE REDE / FIREWALL LOCAL] Bloqueio de porta SMTP detectado: ${err.message}`);
    console.warn(`📧 Destinatário: ${para}`);
    console.warn(`📋 Assunto: ${assunto}`);
    if (codigo) console.warn(`🔢 CÓDIGO DE VERIFICAÇÃO GERADO: ${codigo}`);
    if (token) console.warn(`🔑 TOKEN GERADO: ${token}`);
    console.warn('💡 Nota: Redes escolares/institucionais bloqueiam as portas SMTP por padrão.');
    console.warn('   Em redes 4G do celular ou domésticas o envio chega diretamente na caixa de entrada.');
    console.warn('======================================================================\n');
    return { sucesso: false, erro: err.message, codigo, token };
  }
}

/**
 * 0. Enviar código de verificação para criação de conta (Cadastro)
 */
async function enviarEmailCodigoCadastro({ email, nome, codigo }) {
  const primeiroNome = nome ? nome.split(' ')[0] : 'Usuário';

  const conteudoHtml = `
    <div class="greeting">Olá, ${primeiroNome}! 👋</div>
    <p class="text">Falta pouco para você começar a assistir no <strong>Ethereal X</strong>! Para confirmar a criação da sua conta e validar seu e-mail, utilize o código de verificação abaixo:</p>
    
    <div class="code-box">
      <div class="code-label">Código de Ativação de Conta</div>
      <div class="code-value">${codigo}</div>
    </div>

    <p class="text">Digite esse código de 6 dígitos na tela de cadastro para ativar sua conta imediatamente.</p>

    <div class="warning-box">
      ⏳ Este código é válido por <strong>30 minutos</strong>. Se você não solicitou este cadastro, ignore esta mensagem.
    </div>
  `;

  const texto = `Olá, ${primeiroNome}!\n\nSeu código de ativação de conta no Ethereal X é:\n\n${codigo}\n\nEste código expira em 30 minutos.\n\nEquipe Ethereal X`;

  return despacharEmail({
    para: email,
    assunto: '✨ Código de Verificação da sua Conta — Ethereal X',
    html: gerarTemplateBase({ titulo: 'Verificação de Conta', conteudoHtml }),
    texto,
    codigo,
  });
}

/**
 * 1. Enviar e-mail de recuperação de senha com Link e Código de 6 dígitos
 */
async function enviarEmailRecuperacao({ email, nome, token, codigo, linkRedefinir }) {
  const primeiroNome = nome ? nome.split(' ')[0] : 'Usuário';

  const conteudoHtml = `
    <div class="greeting">Olá, ${primeiroNome}!</div>
    <p class="text">Recebemos uma solicitação para redefinir a senha da sua conta no <strong>Ethereal X</strong>.</p>
    
    <p class="text">Você pode utilizar o botão abaixo para cadastrar sua nova senha diretamente:</p>
    
    <div class="btn-container">
      <a href="${linkRedefinir}" class="btn" target="_blank">Redefinir Minha Senha</a>
    </div>

    <p class="text" style="text-align: center; margin: 15px 0 5px; font-size: 13px; color: #8577a6;">ou informe o código de validação na tela:</p>

    <div class="code-box">
      <div class="code-label">Código de Verificação</div>
      <div class="code-value">${codigo}</div>
    </div>

    <div class="warning-box">
      ⏳ <strong>Importante:</strong> Este link e código expiram em <strong>30 minutos</strong>. Se você não solicitou a redefinição de senha, ignore este e-mail. Sua conta continua segura.
    </div>
  `;

  const texto = `Olá, ${primeiroNome}!\n\nRecebemos uma solicitação para redefinir sua senha no Ethereal X.\n\nCódigo de Verificação: ${codigo}\n\nLink direto para redefinir:\n${linkRedefinir}\n\nEste código expira em 30 minutos.\n\nEquipe Ethereal X`;

  return despacharEmail({
    para: email,
    assunto: '🔒 Recuperação de Senha — Ethereal X',
    html: gerarTemplateBase({ titulo: 'Recuperar Senha', conteudoHtml }),
    texto,
    codigo,
    token,
  });
}

/**
 * 2. Enviar e-mail com senha gerada automaticamente pelo backend
 */
async function enviarEmailSenhaGerada({ email, nome, novaSenha }) {
  const primeiroNome = nome ? nome.split(' ')[0] : 'Usuário';

  const conteudoHtml = `
    <div class="greeting">Olá, ${primeiroNome}!</div>
    <p class="text">Uma nova senha de acesso foi <strong>gerada automaticamente pelo sistema</strong> para a sua conta no <strong>Ethereal X</strong>.</p>
    
    <div class="code-box">
      <div class="code-label">Sua Nova Senha Gerada</div>
      <div class="code-value" style="font-size: 22px; letter-spacing: 2px;">${novaSenha}</div>
    </div>

    <p class="text">Com esta senha, você já pode entrar na sua conta agora mesmo. Recomendamos que, após o login, você acesse as <strong>Configurações</strong> para alterá-la para uma senha de sua preferência.</p>

    <div class="btn-container">
      <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" class="btn">Acessar o Ethereal X</a>
    </div>

    <div class="warning-box">
      🛡️ <strong>Dica de Segurança:</strong> Nunca compartilhe esta senha com terceiros.
    </div>
  `;

  const texto = `Olá, ${primeiroNome}!\n\nUma nova senha foi gerada automaticamente para você no Ethereal X:\n\nNova Senha: ${novaSenha}\n\nAcesse: ${process.env.FRONTEND_URL || 'http://localhost:5173'}\n\nEquipe Ethereal X`;

  return despacharEmail({
    para: email,
    assunto: '🔑 Sua Nova Senha — Ethereal X',
    html: gerarTemplateBase({ titulo: 'Nova Senha Gerada', conteudoHtml }),
    texto,
    codigo: novaSenha,
  });
}

/**
 * 3. Enviar e-mail de confirmação de cadastro / boas-vindas
 */
async function enviarEmailBoasVindas({ email, nome, senhaGerada = null }) {
  const primeiroNome = nome ? nome.split(' ')[0] : 'Usuário';

  const senhaHtml = senhaGerada
    ? `
      <div class="code-box">
        <div class="code-label">Sua Senha de Acesso Gerada</div>
        <div class="code-value" style="font-size: 22px; letter-spacing: 2px;">${senhaGerada}</div>
      </div>
    `
    : '';

  const conteudoHtml = `
    <div class="greeting">Bem-vindo(a) ao Ethereal X, ${primeiroNome}! 🎬</div>
    <p class="text">Sua conta foi criada com sucesso! Prepare-se para explorar nosso catálogo completo de filmes, séries e animes em qualidade premium.</p>
    
    ${senhaHtml}

    <div class="btn-container">
      <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" class="btn">Começar a Assistir</a>
    </div>

    <p class="text" style="font-size: 13px; color: #8577a6;">Seu e-mail de login: <strong>${email}</strong></p>
  `;

  const texto = `Bem-vindo(a) ao Ethereal X, ${primeiroNome}!\n\nSua conta foi criada com sucesso.\nE-mail: ${email}${senhaGerada ? `\nSenha: ${senhaGerada}` : ''}\n\nAcesse: ${process.env.FRONTEND_URL || 'http://localhost:5173'}\n\nEquipe Ethereal X`;

  return despacharEmail({
    para: email,
    assunto: '✨ Bem-vindo(a) ao Ethereal X Streaming!',
    html: gerarTemplateBase({ titulo: 'Bem-vindo ao Ethereal X', conteudoHtml }),
    texto,
  });
}

/**
 * 4. Enviar e-mail de confirmação de troca de senha realizada
 */
async function enviarEmailConfirmacaoTroca({ email, nome }) {
  const primeiroNome = nome ? nome.split(' ')[0] : 'Usuário';

  const conteudoHtml = `
    <div class="greeting">Olá, ${primeiroNome}!</div>
    <p class="text">Confirmamos que a senha da sua conta no <strong>Ethereal X</strong> foi <strong>alterada com sucesso</strong>.</p>
    
    <div class="warning-box" style="border-left-color: #35e0a1;">
      ✅ <strong>Tudo certo!</strong> Se você realizou esta alteração, nenhuma ação adicional é necessária.
    </div>

    <p class="text" style="margin-top: 20px;">Caso <strong>NÃO</strong> tenha sido você quem alterou a senha, redefina-a imediatamente na tela inicial ou contate nosso suporte.</p>
  `;

  const texto = `Olá, ${primeiroNome}!\n\nA senha da sua conta no Ethereal X foi alterada com sucesso.\n\nSe não foi você, redefina sua senha imediatamente.\n\nEquipe Ethereal X`;

  return despacharEmail({
    para: email,
    assunto: '🔒 Senha Alterada com Sucesso — Ethereal X',
    html: gerarTemplateBase({ titulo: 'Senha Alterada', conteudoHtml }),
    texto,
  });
}

module.exports = {
  transporter,
  despacharEmail,
  enviarEmailCodigoCadastro,
  enviarEmailRecuperacao,
  enviarEmailSenhaGerada,
  enviarEmailBoasVindas,
  enviarEmailConfirmacaoTroca,
};

