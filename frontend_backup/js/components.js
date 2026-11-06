// ============================================================
// Componentes compartilhados entre as páginas internas
// (tudo que usa .app-shell chama montarSidebar() no load)
// ============================================================

const ITENS_MENU = [
  { pagina: 'home',      href: 'home.html',      icone: '🏠', texto: 'Início' },
  { pagina: 'generos',   href: 'genres.html',    icone: '🎬', texto: 'Gêneros' },
  { pagina: 'filmes',    href: 'movies.html',    icone: '🎞️', texto: 'Filmes' },
  { pagina: 'series',    href: 'series.html',    icone: '📺', texto: 'Séries' },
  { pagina: 'favoritos', href: 'favorites.html', icone: '🤍', texto: 'Favoritos' },
  { pagina: 'minhalista',href: 'mylist.html',    icone: '🔖', texto: 'Minha lista' },
  { pagina: 'historico', href: 'history.html',   icone: '🕓', texto: 'Histórico' },
  { pagina: 'configuracoes', href: 'settings.html', icone: '⚙️', texto: 'Configurações' },
];

function iniciais(nome){
  if(!nome) return 'EX';
  const partes = nome.trim().split(/\s+/);
  return ((partes[0]?.[0] || '') + (partes[1]?.[0] || '')).toUpperCase();
}

function montarSidebar(paginaAtiva){
  Auth.exigirLogin();
  const usuario = Auth.getUser() || {};
  const host = document.getElementById('sidebar');
  if(!host) return;

  host.innerHTML = `
    <div class="brand">
      ${eyeLogoSVG()}
      <div class="brand-text">
        <span class="brand-name"><b>ETHEREAL</b></span>
        <span class="brand-sub-badge">Streaming</span>
      </div>
    </div>

    <nav class="nav-group">
      ${ITENS_MENU.map(item => `
        <a class="nav-link ${item.pagina === paginaAtiva ? 'active' : ''}" href="${item.href}">
          <span class="nav-ico">${item.icone}</span>
          <span>${item.texto}</span>
        </a>
      `).join('')}
    </nav>

    <div class="sidebar-footer">
      <a class="user-chip" href="settings.html" style="cursor:pointer;">
        <div class="user-avatar">${iniciais(usuario.nome)}</div>
        <div class="user-meta">
          <div class="user-name">${usuario.nome || 'Usuário Ethereal'}</div>
          <div class="user-email">${usuario.email || ''}</div>
        </div>
      </a>
      <button class="logout-btn" id="btnSair">
        <span>🚪</span> <span>Sair da conta</span>
      </button>
    </div>
  `;

  document.getElementById('btnSair').addEventListener('click', () => Auth.logout());
  iniciarLogoEthereal();
}

// Cria o markup de um card de título (poster). "extra" é usado pra desenhar
// o coração (favoritos) ou o marcador (minha lista) no canto do card.
function cardTitulo(t, extra = ''){
  const poster = t.poster_url || posterFallback();
  const ano = t.ano_lancamento ? `${t.ano_lancamento}` : '';
  const nota = t.nota ? `<span class="rating">★ ${Number(t.nota).toFixed(1)}</span>` : '';
  return `
    <div class="title-card" onclick="window.location.href='detail.html?id=${t.id_titulo}'">
      <div style="position:relative;">
        <img class="poster" src="${poster}" alt="${t.titulo}" loading="lazy" />
        ${extra}
      </div>
      <div class="card-body">
        <div class="card-title">${t.titulo}</div>
        <div class="card-meta">
          <span class="pill">${t.tipo === 'serie' ? 'Série' : 'Filme'}</span>
          <span>${ano}</span>
          ${nota}
        </div>
      </div>
    </div>
  `;
}

function estadoVazio(icone, titulo, texto){
  return `
    <div class="empty-state">
      <div class="empty-ico">${icone}</div>
      <h3>${titulo}</h3>
      <p>${texto}</p>
    </div>
  `;
}

function estadoCarregando(){
  return `<div class="loader"><span class="spin"></span> Carregando...</div>`;
}
