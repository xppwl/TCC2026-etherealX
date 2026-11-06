const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const pool = require('./config/db');
const bcrypt = require('bcryptjs');

async function testarCadastroComCodigo() {
  console.log('🧪 Iniciando teste de criação de conta com código de verificação...');

  const emailTeste = `usuario_teste_${Date.now()}@ethereal.com`;
  const nomeTeste = 'Usuário Verificado';
  const senhaTeste = 'SenhaForte@2026';

  // 1. Simula solicitação de cadastro (envio de código)
  const senhaHash = await bcrypt.hash(senhaTeste, 10);
  const codigo = '777111';
  const expiraEm = new Date(Date.now() + 30 * 60 * 1000);

  await pool.query(
    'INSERT INTO verificacao_cadastro (nome, email, senha_hash, codigo, expira_em) VALUES (?, ?, ?, ?, ?)',
    [nomeTeste, emailTeste, senhaHash, codigo, expiraEm]
  );
  console.log(`✅ Código de ativação (${codigo}) salvo em verificacao_cadastro para ${emailTeste}!`);

  // 2. Valida o código
  const [rows] = await pool.query(
    'SELECT * FROM verificacao_cadastro WHERE email = ? AND codigo = ? AND usado = 0 AND expira_em > NOW() ORDER BY id_verificacao DESC LIMIT 1',
    [emailTeste, codigo]
  );
  if (rows.length === 0) {
    throw new Error('Falha ao validar código pendente!');
  }
  const pendente = rows[0];
  console.log('✅ Registro pendente validado com sucesso!');

  // 3. Cria o usuário final
  const [resUser] = await pool.query(
    'INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)',
    [pendente.nome, pendente.email, pendente.senha_hash]
  );
  await pool.query('UPDATE verificacao_cadastro SET usado = 1 WHERE id_verificacao = ?', [pendente.id_verificacao]);
  console.log(`✅ Usuário criado na tabela usuarios com ID ${resUser.insertId}!`);

  // 4. Valida se a senha funciona no login
  const [userFinal] = await pool.query('SELECT * FROM usuarios WHERE id_usuario = ?', [resUser.insertId]);
  const senhaValida = await bcrypt.compare(senhaTeste, userFinal[0].senha);
  if (!senhaValida) {
    throw new Error('Senha não confere no login!');
  }
  console.log('✅ Senha verificada no login com sucesso!');

  // 5. Limpa os dados de teste
  await pool.query('DELETE FROM usuarios WHERE id_usuario = ?', [resUser.insertId]);
  await pool.query('DELETE FROM verificacao_cadastro WHERE id_verificacao = ?', [pendente.id_verificacao]);
  console.log('✅ Limpeza de teste realizada com sucesso!');

  console.log('\n🎉 TESTE DE CADASTRO COM CÓDIGO CONCLUÍDO COM 100% DE SUCESSO!');
  await pool.end();
  process.exit(0);
}

testarCadastroComCodigo().catch(async (e) => {
  console.error('❌ Erro no teste:', e);
  await pool.end();
  process.exit(1);
});

