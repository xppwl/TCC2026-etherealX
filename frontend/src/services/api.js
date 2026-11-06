export const API_BASE =
  import.meta.env.VITE_API_BASE ||
  (typeof window !== 'undefined' && window.location.port === '5173'
    ? '/api'
    : 'http://localhost:3000/api');

export const AuthStorage = {
  getToken() {
    return localStorage.getItem('ethereal_token') || localStorage.getItem('token');
  },
  getUser() {
    try {
      return JSON.parse(localStorage.getItem('ethereal_user'));
    } catch {
      return null;
    }
  },
  salvar(token, usuario) {
    localStorage.setItem('ethereal_token', token);
    localStorage.setItem('token', token);
    localStorage.setItem('ethereal_user', JSON.stringify(usuario));
  },
  limpar() {
    localStorage.removeItem('ethereal_token');
    localStorage.removeItem('token');
    localStorage.removeItem('ethereal_user');
  }
};

let onUnauthorizedCallback = null;
export function setOnUnauthorized(cb) {
  onUnauthorizedCallback = cb;
}

export async function api(caminho, opcoes = {}) {
  const token = AuthStorage.getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(opcoes.headers || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let resposta;
  try {
    resposta = await fetch(`${API_BASE}${caminho}`, { ...opcoes, headers });
  } catch {
    throw new Error('Sem conexão com o servidor. Verifique se o backend está rodando.');
  }

  const dados = await resposta.json().catch(() => ({}));

  if (!resposta.ok) {
    if (resposta.status === 401 && !caminho.startsWith('/auth')) {
      AuthStorage.limpar();
      if (onUnauthorizedCallback) {
        onUnauthorizedCallback();
      }
    }
    throw new Error(dados.erro || 'Algo deu errado. Tente novamente.');
  }

  return dados;
}

export function posterFallback() {
  return 'https://picsum.photos/seed/ethereal-fallback/400/600';
}
