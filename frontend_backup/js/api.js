// Configuração central da API + helpers usados em todas as páginas
const API_BASE = 'http://localhost:3000/api';

const Auth = {
  getToken(){ return localStorage.getItem('ethereal_token') || localStorage.getItem('token'); },
  getUser(){
    try { return JSON.parse(localStorage.getItem('ethereal_user')); }
    catch(e){ return null; }
  },
  salvar(token, usuario){
    localStorage.setItem('ethereal_token', token);
    localStorage.setItem('token', token);
    localStorage.setItem('ethereal_user', JSON.stringify(usuario));
  },
  logout(){
    localStorage.removeItem('ethereal_token');
    localStorage.removeItem('token');
    localStorage.removeItem('ethereal_user');
    window.location.href = 'login.html';
  },
  // Chama isso no topo de toda página protegida
  exigirLogin(){
    if(!this.getToken()){
      window.location.href = 'login.html';
    }
  }
};

// Wrapper de fetch que já manda o token e trata erros de forma padronizada
async function api(caminho, opcoes = {}){
  const token = Auth.getToken();
  const headers = { 'Content-Type': 'application/json', ...(opcoes.headers || {}) };
  if(token) headers['Authorization'] = `Bearer ${token}`;

  let resposta;
  try {
    resposta = await fetch(`${API_BASE}${caminho}`, { ...opcoes, headers });
  } catch(e) {
    // Sem conexão com o servidor
    throw new Error('Sem conexão com o servidor. Verifique se o backend está rodando.');
  }

  const dados = await resposta.json().catch(() => ({}));

  if(!resposta.ok){
    // Só faz logout automático em 401 se não for uma rota de autenticação
    if(resposta.status === 401 && !caminho.startsWith('/auth')){
      Auth.logout();
    }
    throw new Error(dados.erro || 'Algo deu errado. Tente novamente.');
  }
  return dados;
}

function mostrarToast(mensagem, tipo = 'info'){
  let toast = document.querySelector('.toast');
  if(!toast){
    toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = mensagem;
  // Remove classes de tipo anteriores
  toast.classList.remove('toast-erro', 'toast-sucesso');
  if(tipo === 'erro')   toast.classList.add('toast-erro');
  if(tipo === 'sucesso') toast.classList.add('toast-sucesso');
  toast.classList.add('show');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('show'), 3000);
}

function posterFallback(){
  return 'https://picsum.photos/seed/ethereal-fallback/400/600';
}
