// ============================================================
// CATÁLOGO — Início, Gêneros, Filmes, Séries
// ============================================================

const CORES_GENERO = {
  'acao': '#e04e38',
  'aventura': '#a86519',
  'comedia': '#e88225',
  'drama': '#5a2d68',
  'fantasia': '#4d4ed8',
  'ficcao-cientifica': '#208bff',
  'misterio': '#33373b',
  'romance': '#e83333',
  'suspense': '#4b2d7d',
  'terror': '#4a0a16',
  'documentario': '#2e695d',
};

// ------------------- INÍCIO -------------------
async function iniciarHome(){
  montarSidebar('home');
  const usuario = Auth.getUser();
  document.getElementById('saudacaoUsuario').textContent = `Olá, ${usuario?.nome?.split(' ')[0] || 'usuário'}`;

  try{
    const titulos = await api('/titulos');
    if(titulos.length === 0){
      document.getElementById('heroSection').innerHTML = estadoVazio('🎬','Catálogo vazio','Assim que os títulos forem cadastrados no banco, eles aparecem aqui.');
      return;
    }

    const destaque = titulos.find(t => t.destaque) || titulos[0];
    montarHero(destaque);

    const emAlta = titulos.filter(t => t.em_alta);
    const tendencia = [...titulos].reverse();

    montarFileira('trackEmAlta', emAlta.length ? emAlta : titulos.slice(0,8));
    montarFileira('trackTendencia', tendencia.slice(0,8));
  }catch(err){
    mostrarToast(err.message);
  }

  document.getElementById('buscaHome').addEventListener('input', debounce(async (e) => {
    const termo = e.target.value.trim();
    if(!termo){ document.getElementById('resultadoBusca').style.display = 'none'; return; }
    const resultado = await api(`/titulos?busca=${encodeURIComponent(termo)}`);
    const box = document.getElementById('resultadoBusca');
    box.style.display = 'block';
    box.innerHTML = resultado.length
      ? `<div class="title-grid">${resultado.map(t => cardTitulo(t)).join('')}</div>`
      : estadoVazio('🔍','Nada encontrado', `Não achamos nada parecido com "${termo}".`);
  }, 350));
}

function montarHero(t){
  const hero = document.getElementById('heroSection');
  hero.style.backgroundImage = t.banner_url ? `url('${t.banner_url}')` : '';
  hero.innerHTML = `
    <div class="hero-content">
      <span class="hero-badge">✨ Destaque Ethereal</span>
      <h1 class="hero-title">${t.titulo}</h1>
      <p class="hero-desc">${t.sinopse || ''}</p>
      <div class="hero-actions">
        <a class="btn btn-primary" href="detail.html?id=${t.id_titulo}">▶ Assistir agora</a>
        <a class="btn btn-ghost" href="detail.html?id=${t.id_titulo}">ⓘ Mais informações</a>
      </div>
    </div>
  `;
}

function montarFileira(idTrack, lista){
  const track = document.getElementById(idTrack);
  if(!track) return;
  track.innerHTML = lista.length
    ? lista.map(t => cardTitulo(t)).join('')
    : `<p style="color:var(--text-low); font-size:13px;">Nada por aqui ainda.</p>`;
}

function debounce(fn, ms){
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}

// ------------------- GÊNEROS -------------------
async function iniciarGeneros(){
  montarSidebar('generos');
  const host = document.getElementById('gridGeneros');
  host.innerHTML = estadoCarregando();
  try{
    const generos = await api('/generos');
    host.innerHTML = generos.map(g => `
      <a class="genre-card" href="movies.html?genero=${g.id_genero}" style="background:${CORES_GENERO[g.slug] || '#333'};">
        <h3>${g.nome}</h3>
      </a>
    `).join('');
  }catch(err){
    host.innerHTML = estadoVazio('⚠️','Não deu pra carregar os gêneros', err.message);
  }
}

// ------------------- FILMES / SÉRIES -------------------
async function iniciarCatalogoPorTipo(tipo, paginaAtiva){
  montarSidebar(paginaAtiva);
  const grid = document.getElementById('gridTitulos');
  const filtros = document.getElementById('filtroGeneros');
  grid.innerHTML = estadoCarregando();

  const params = new URLSearchParams(window.location.search);
  let generoAtivo = params.get('genero') || '';

  let generos = [];
  try{ generos = await api('/generos'); }catch(e){ /* segue sem filtro se falhar */ }

  function desenharFiltros(){
    const chips = [{ id_genero: '', nome: 'Todos' }, ...generos];
    filtros.innerHTML = chips.map(g => `
      <button class="filter-chip ${String(g.id_genero) === String(generoAtivo) ? 'active' : ''}" data-genero="${g.id_genero}">
        ${g.nome}
      </button>
    `).join('');
    filtros.querySelectorAll('.filter-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        generoAtivo = chip.dataset.genero;
        desenharFiltros();
        carregar();
      });
    });
  }

  async function carregar(){
    grid.innerHTML = estadoCarregando();
    try{
      const query = new URLSearchParams({ tipo });
      if(generoAtivo) query.set('genero', generoAtivo);
      const titulos = await api(`/titulos?${query.toString()}`);
      grid.innerHTML = titulos.length
        ? titulos.map(t => cardTitulo(t)).join('')
        : estadoVazio('🎬', 'Nada por aqui', 'Não encontramos títulos para esse filtro.');
    }catch(err){
      grid.innerHTML = estadoVazio('⚠️', 'Erro ao carregar', err.message);
    }
  }

  desenharFiltros();
  carregar();
}

// ------------------- FAVORITOS / MINHA LISTA -------------------
async function iniciarFavoritos(){
  montarSidebar('favoritos');
  const grid = document.getElementById('gridTitulos');
  grid.innerHTML = estadoCarregando();
  try{
    const lista = await api('/usuario/favoritos');
    grid.innerHTML = lista.length
      ? lista.map(t => cardTitulo(t, `<span style="position:absolute;top:8px;right:8px;font-size:18px;">❤️</span>`)).join('')
      : estadoVazio('💜','Sua lista de favoritos está vazia','Toque no coração de um título para guardá-lo aqui.');
  }catch(err){
    grid.innerHTML = estadoVazio('⚠️','Erro ao carregar', err.message);
  }
}

async function iniciarMinhaLista(){
  montarSidebar('minhalista');
  const grid = document.getElementById('gridTitulos');
  grid.innerHTML = estadoCarregando();
  try{
    const lista = await api('/usuario/minha-lista');
    grid.innerHTML = lista.length
      ? lista.map(t => cardTitulo(t, `<span style="position:absolute;top:8px;right:8px;font-size:18px;">🔖</span>`)).join('')
      : estadoVazio('🔖','Sua lista está vazia','Adicione filmes e séries à Minha Lista pela tela de detalhes.');
  }catch(err){
    grid.innerHTML = estadoVazio('⚠️','Erro ao carregar', err.message);
  }
}
