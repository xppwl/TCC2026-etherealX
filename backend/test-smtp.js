const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const {
  enviarEmailCodigoCadastro,
  enviarEmailRecuperacao,
  enviarEmailSenhaGerada,
  enviarEmailBoasVindas,
} = require('./services/emailService');

async function testarEnvio() {
  const emailDestino = process.env.SMTP_USER || 'sophicrotti@gmail.com';
  console.log(`🚀 Iniciando teste de envio de e-mail para: ${emailDestino}...`);

  console.log('\n--- 1. Testando envio de código de verificação para cadastro ---');
  const res0 = await enviarEmailCodigoCadastro({
    email: emailDestino,
    nome: 'Sophia Crotti',
    codigo: '593821',
  });
  console.log('Resultado 0:', res0);

  console.log('\n--- 2. Testando envio de recuperação de senha com código e link ---');
  const res1 = await enviarEmailRecuperacao({
    email: emailDestino,
    nome: 'Sophia Crotti',
    token: 'teste-token-1234567890abcdef',
    codigo: '849201',
    linkRedefinir: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/redefinir-senha?token=teste-token-1234567890abcdef&email=${encodeURIComponent(emailDestino)}`,
  });
  console.log('Resultado 1:', res1);

  console.log('\n--- 3. Testando envio de nova senha gerada pelo sistema ---');
  const res2 = await enviarEmailSenhaGerada({
    email: emailDestino,
    nome: 'Sophia Crotti',
    novaSenha: 'Eth@9xK2#m8P',
  });
  console.log('Resultado 2:', res2);

  console.log('\n✅ Teste finalizado!');
  process.exit(0);
}

testarEnvio().catch((err) => {
  console.error('❌ Erro no teste:', err);
  process.exit(1);
});

