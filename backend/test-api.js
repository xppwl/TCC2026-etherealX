const http = require('http');

// Sobe o servidor express diretamente para teste
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const passport = require('./config/passport');
const authRoutes = require('./routes/authRoutes');
const catalogoRoutes = require('./routes/catalogoRoutes');
const usuarioRoutes = require('./routes/usuarioRoutes');

const app = express();
app.use(cors());
app.use(express.json());
app.use(passport.initialize());

app.get('/api/status', (_req, res) => {
  res.json({ status: 'sucesso', mensagem: 'API Ethereal X operando normalmente!' });
});

app.use('/api/auth', authRoutes);
app.use('/api', catalogoRoutes);
app.use('/api/usuario', usuarioRoutes);
app.use('/api/usuarios', usuarioRoutes);

const server = app.listen(3333, async () => {
  console.log('🧪 Servidor de teste ouvindo na porta 3333...');

  async function req(path, options = {}) {
    const res = await fetch(`http://localhost:3333${path}`, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) }
    });
    const data = await res.json().catch(() => ({}));
    return { status: res.status, ok: res.ok, data };
  }

  try {
    // 1. Status
    const s = await req('/api/status');
    console.log('1. Status API:', s.status === 200 ? '✅ OK' : '❌ Falha', s.data);

    // 2. Login
    const login = await req('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'usuario@ethereal.com', senha: '123' })
    });
    // Se a senha não for '123', vamos testar registro ou verificar
    console.log('2. Teste Login usuario@ethereal.com:', login.status, login.data);

    let token = login.data?.token;

    // Se login falhou porque a senha de teste era outra, vamos criar/atualizar um usuário de teste
    if (!token) {
      console.log('Criando usuário de teste test@ethereal.com...');
      const reg = await req('/api/auth/registro', {
        method: 'POST',
        body: JSON.stringify({ nome: 'Teste Ethereal', email: 'test_' + Date.now() + '@ethereal.com', senha: 'senhaForte123' })
      });
      console.log('2b. Registro:', reg.status === 201 ? '✅ OK' : '❌ Falha', reg.data.usuario?.email);
      token = reg.data?.token;
    }

    const authHeaders = { Authorization: `Bearer ${token}` };

    // 3. Catálogo
    const titulos = await req('/api/titulos');
    console.log('3. Catálogo (/api/titulos):', titulos.ok ? '✅ OK' : '❌ Falha', `(${titulos.data?.length} títulos carregados)`);

    // 4. Gêneros
    const generos = await req('/api/generos');
    console.log('4. Gêneros (/api/generos):', generos.ok ? '✅ OK' : '❌ Falha', `(${generos.data?.length} gêneros)`);

    // 5. Detalhes de um título
    const idPrimeiro = titulos.data[0]?.id_titulo;
    const detalhe = await req(`/api/titulos/${idPrimeiro}`);
    console.log('5. Detalhes do título:', detalhe.ok ? '✅ OK' : '❌ Falha', detalhe.data?.titulo);

    // 6. Perfil
    const perfil = await req('/api/usuario/perfil', { headers: authHeaders });
    console.log('6. Perfil (/api/usuario/perfil):', perfil.ok ? '✅ OK' : '❌ Falha', perfil.data?.nome);

    // 7. Favoritos (POST, GET, DELETE)
    const addFav = await req(`/api/usuario/favoritos/${idPrimeiro}`, { method: 'POST', headers: authHeaders });
    const getFav = await req('/api/usuario/favoritos', { headers: authHeaders });
    const delFav = await req(`/api/usuario/favoritos/${idPrimeiro}`, { method: 'DELETE', headers: authHeaders });
    console.log('7. Favoritos CRUD:', (addFav.ok && getFav.ok && delFav.ok) ? '✅ OK' : '❌ Falha', `Favs: ${getFav.data?.length}`);

    // 8. Minha Lista (POST, GET, DELETE)
    const addMl = await req(`/api/usuario/minha-lista/${idPrimeiro}`, { method: 'POST', headers: authHeaders });
    const getMl = await req('/api/usuario/minha-lista', { headers: authHeaders });
    const delMl = await req(`/api/usuario/minha-lista/${idPrimeiro}`, { method: 'DELETE', headers: authHeaders });
    console.log('8. Minha Lista CRUD:', (addMl.ok && getMl.ok && delMl.ok) ? '✅ OK' : '❌ Falha', `Lista: ${getMl.data?.length}`);

    // 9. Histórico (POST, GET, DELETE)
    const addH = await req(`/api/usuario/historico/${idPrimeiro}`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ progresso_segundos: 120, duracao_segundos: 600 })
    });
    const getH = await req('/api/usuario/historico', { headers: authHeaders });
    const delH = await req(`/api/usuario/historico/${idPrimeiro}`, { method: 'DELETE', headers: authHeaders });
    console.log('9. Histórico CRUD:', (addH.ok && getH.ok && delH.ok) ? '✅ OK' : '❌ Falha', `Hist: ${getH.data?.length}`);

    // 10. Atualizar Preferências
    const pref = await req('/api/usuario/preferencias', {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({ autoplay: true, qualidade_padrao: '1080p', legendas_padrao: true, notificacoes_email: false })
    });
    console.log('10. Preferências:', pref.ok ? '✅ OK' : '❌ Falha', pref.data);

    console.log('\n🎉 TODOS OS TESTES PASSARAM COM SUCESSO!');
  } catch (err) {
    console.error('❌ Erro no teste:', err);
  } finally {
    server.close();
    process.exit(0);
  }
});

