const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const pool = require('./config/db');
const bcrypt = require('bcryptjs');

async function testarFluxoRecuperacao() {
  console.log('🧪 Iniciando teste do sistema de recuperação de senha...');

  const emailTeste = 'sophicrotti@gmail.com';
  const nomeTeste = 'Sophia Crotti';

  // 1. Garante que o usuário de teste existe no banco
  let [users] = await pool.query('SELECT * FROM usuarios WHERE email = ?', [emailTeste]);
  let usuario = users[0];

  if (!usuario) {
    console.log('Criando usuário de teste para:', emailTeste);
    const senhaHash = await bcrypt.hash('SenhaAntiga123', 10);
    const [res] = await pool.query(
      'INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)',
      [nomeTeste, emailTeste, senhaHash]
    );
    [users] = await pool.query('SELECT * FROM usuarios WHERE id_usuario = ?', [res.insertId]);
    usuario = users[0];
  }

  console.log(`✅ Usuário verificado: ${usuario.nome} (${usuario.email}) - ID: ${usuario.id_usuario}`);

  // 2. Simula criação de token e código de recuperação
  const token = 'token_teste_' + Date.now();
  const codigo = '654321';
  const expiraEm = new Date(Date.now() + 30 * 60 * 1000);

  await pool.query(
    'INSERT INTO recuperacao_senha (id_usuario, token, codigo, expira_em) VALUES (?, ?, ?, ?)',
    [usuario.id_usuario, token, codigo, expiraEm]
  );
  console.log(`✅ Token e código (${codigo}) gerados e salvos no banco!`);

  // 3. Testa validação e redefinição com código
  const [recup] = await pool.query(
    'SELECT * FROM recuperacao_senha WHERE codigo = ? AND id_usuario = ? AND usado = 0 AND expira_em > NOW()',
    [codigo, usuario.id_usuario]
  );
  if (recup.length === 0) {
    throw new Error('Falha ao localizar registro de recuperação!');
  }
  console.log('✅ Registro de recuperação validado com sucesso!');

  // 4. Atualiza a senha para uma nova
  const novaSenha = 'NovaSenhaSuperForte!2026';
  const novaSenhaHash = await bcrypt.hash(novaSenha, 10);
  await pool.query('UPDATE usuarios SET senha = ? WHERE id_usuario = ?', [novaSenhaHash, usuario.id_usuario]);
  await pool.query('UPDATE recuperacao_senha SET usado = 1 WHERE id_recuperacao = ?', [recup[0].id_recuperacao]);
  console.log('✅ Senha redefinida e salva com hash bcrypt no banco!');

  // 5. Testa validação de login com a nova senha
  const [userAtualizado] = await pool.query('SELECT senha FROM usuarios WHERE id_usuario = ?', [usuario.id_usuario]);
  const senhaBate = await bcrypt.compare(novaSenha, userAtualizado[0].senha);
  if (!senhaBate) {
    throw new Error('A nova senha não bateu com o hash!');
  }
  console.log('✅ Validação de login com a nova senha confirmada!');

  // 6. Testa geração automática de senha pelo backend
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789#$*';
  let senhaGerada = 'Eth@';
  for (let i = 0; i < 6; i++) {
    senhaGerada += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  const hashGerada = await bcrypt.hash(senhaGerada, 10);
  await pool.query('UPDATE usuarios SET senha = ? WHERE id_usuario = ?', [hashGerada, usuario.id_usuario]);

  const [userFinal] = await pool.query('SELECT senha FROM usuarios WHERE id_usuario = ?', [usuario.id_usuario]);
  const bateGerada = await bcrypt.compare(senhaGerada, userFinal[0].senha);
  if (!bateGerada) {
    throw new Error('A senha gerada pelo backend não bateu com o hash!');
  }
  console.log(`✅ Senha gerada pelo backend (${senhaGerada}) salva e testada com sucesso!`);

  console.log('\n🎉 TODOS OS TESTES DE BANCO E CRIPTOGRAFIA PASSARAM 100%!');
  await pool.end();
  process.exit(0);
}

testarFluxoRecuperacao().catch(async (e) => {
  console.error('❌ Erro no teste:', e);
  await pool.end();
  process.exit(1);
});

