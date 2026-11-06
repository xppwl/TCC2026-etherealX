// ============================================================
// LOGIN / REGISTRO
// ============================================================

function mostrarErro(mensagem){
  const alerta = document.getElementById('alertaErro');
  alerta.textContent = mensagem;
  alerta.style.display = 'block';
}
function esconderErro(){
  const alerta = document.getElementById('alertaErro');
  if(alerta) alerta.style.display = 'none';
}

function iniciarPaginaLogin(){
  // Se veio um erro do redirect do Google, mostra
  const params = new URLSearchParams(window.location.search);
  if(params.get('erro') === 'google'){
    mostrarErro('Não foi possível entrar com o Google. Tente novamente ou use e-mail e senha.');
  }

  const form = document.getElementById('formLogin');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    esconderErro();
    const btn = form.querySelector('button[type="submit"]');
    const email = document.getElementById('email').value.trim();
    const senha = document.getElementById('senha').value;

    btn.disabled = true;
    btn.textContent = 'Entrando...';
    try{
      const dados = await api('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, senha }),
      });
      Auth.salvar(dados.token, dados.usuario);
      window.location.href = 'home.html';
    }catch(err){
      mostrarErro(err.message);
    }finally{
      btn.disabled = false;
      btn.textContent = 'Entrar';
    }
  });

  document.getElementById('btnGoogle').addEventListener('click', () => {
    window.location.href = `${API_BASE}/auth/google`;
  });
}

function iniciarPaginaRegistro(){
  const form = document.getElementById('formRegistro');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    esconderErro();
    const btn = form.querySelector('button[type="submit"]');
    const nome = document.getElementById('nome').value.trim();
    const email = document.getElementById('email').value.trim();
    const senha = document.getElementById('senha').value;
    const confirmar = document.getElementById('confirmarSenha').value;

    if(senha !== confirmar){
      mostrarErro('As senhas não coincidem.');
      return;
    }

    btn.disabled = true;
    btn.textContent = 'Criando conta...';
    try{
      const dados = await api('/auth/registro', {
        method: 'POST',
        body: JSON.stringify({ nome, email, senha }),
      });
      Auth.salvar(dados.token, dados.usuario);
      window.location.href = 'home.html';
    }catch(err){
      mostrarErro(err.message);
    }finally{
      btn.disabled = false;
      btn.textContent = 'Criar conta';
    }
  });

  document.getElementById('btnGoogle').addEventListener('click', () => {
    window.location.href = `${API_BASE}/auth/google`;
  });
}

// Usada em auth-sucesso.html (retorno do login com Google)
async function iniciarRetornoGoogle(){
  const params = new URLSearchParams(window.location.search);
  const token = params.get('token');
  if(!token){
    window.location.href = 'login.html?erro=google';
    return;
  }
  localStorage.setItem('ethereal_token', token);
  try{
    const usuario = await api('/usuario/perfil');
    localStorage.setItem('ethereal_user', JSON.stringify(usuario));
    window.location.href = 'home.html';
  }catch(err){
    window.location.href = 'login.html?erro=google';
  }
}
