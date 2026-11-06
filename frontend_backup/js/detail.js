// ============================================================
// DETALHES DO TÍTULO + PLAYER
// ============================================================

let _tituloAtual = null;
let _episodioAtual = null;
let _favoritado = false;
let _naLista = false;

async function iniciarDetalhes(){
  montarSidebar(''); // nenhum item do menu fica ativo aqui
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  if(!id){ window.location.href = 'home.html'; return; }

  try{
    const [titulo, favoritos, minhaLista] = await Promise.all([
      api(`/titulos/${id}`),
      api('/usuario/favoritos'),
      api('/usuario/minha-lista'),
    ]);
    _tituloAtual = titulo;
    _favoritado = favoritos.some(f => f.id_titulo === titulo.id_titulo);
    _naLista = minhaLista.some(f => f.id_titulo === titulo.id_titulo);

    montarCabecalhoDetalhe(titulo);

    if(titulo.tipo === 'serie' && titulo.episodios?.length){
      _episodioAtual = titulo.episodios[0];
      montarListaEpisodios(titulo.episodios);
      montarPlayer(_episodioAtual.video_url, titulo.id_titulo);
    } else {
      montarPlayer(titulo.video_url, titulo.id_titulo);
      document.getElementById('secaoEpisodios').style.display = 'none';
    }
  }catch(err){
    document.getElementById('detalheContainer').innerHTML = estadoVazio('⚠️','Não foi possível carregar este título', err.message);
  }
}

function montarCabecalhoDetalhe(t){
  const hero = document.getElementById('detailHero');
  hero.style.backgroundImage = t.banner_url ? `url('${t.banner_url}')` : '';
  document.getElementById('detailTags').innerHTML = `
    <span class="pill">${t.tipo === 'serie' ? 'Série' : 'Filme'}</span>
    ${t.ano_lancamento ? `<span class="pill">${t.ano_lancamento}</span>` : ''}
    ${t.classificacao ? `<span class="pill">${t.classificacao}</span>` : ''}
    ${t.nota ? `<span class="pill rating">★ ${Number(t.nota).toFixed(1)}</span>` : ''}
    ${t.generos ? `<span class="pill">${t.generos}</span>` : ''}
  `;
  document.getElementById('detailTitle').textContent = t.titulo;
  document.getElementById('detailDesc').textContent = t.sinopse || '';

  atualizarBotoesAcao();
}

function atualizarBotoesAcao(){
  document.getElementById('btnFavorito').innerHTML = _favoritado ? '❤️ Nos favoritos' : '🤍 Favoritar';
  document.getElementById('btnLista').innerHTML = _naLista ? '🔖 Na Minha Lista' : '➕ Minha Lista';
}

async function alternarFavorito(){
  const id = _tituloAtual.id_titulo;
  try{
    if(_favoritado){ await api(`/usuario/favoritos/${id}`, { method: 'DELETE' }); mostrarToast('Removido dos favoritos.'); }
    else{ await api(`/usuario/favoritos/${id}`, { method: 'POST' }); mostrarToast('Adicionado aos favoritos!'); }
    _favoritado = !_favoritado;
    atualizarBotoesAcao();
  }catch(err){ mostrarToast(err.message); }
}

async function alternarMinhaLista(){
  const id = _tituloAtual.id_titulo;
  try{
    if(_naLista){ await api(`/usuario/minha-lista/${id}`, { method: 'DELETE' }); mostrarToast('Removido da Minha Lista.'); }
    else{ await api(`/usuario/minha-lista/${id}`, { method: 'POST' }); mostrarToast('Adicionado à Minha Lista!'); }
    _naLista = !_naLista;
    atualizarBotoesAcao();
  }catch(err){ mostrarToast(err.message); }
}

function montarListaEpisodios(episodios){
  const host = document.getElementById('listaEpisodios');
  host.innerHTML = episodios.map((ep, i) => `
    <div class="episode-row" style="cursor:pointer;" onclick="trocarEpisodio(${i})" data-ep="${i}">
      <div class="episode-num">${ep.numero_episodio}</div>
      <div class="episode-info">
        <div class="ep-title">${ep.titulo_episodio}</div>
        <div class="ep-meta">Temporada ${ep.numero_temporada} · ${ep.duracao_minutos || '--'} min</div>
      </div>
      <div style="font-size:18px;">▶</div>
    </div>
  `).join('');
}

function trocarEpisodio(indice){
  const ep = _tituloAtual.episodios[indice];
  _episodioAtual = ep;
  montarPlayer(ep.video_url, _tituloAtual.id_titulo);
  window.scrollTo({ top: document.getElementById('playerWrap').offsetTop - 20, behavior: 'smooth' });
}

function montarPlayer(videoUrl, idTitulo){
  const wrap = document.getElementById('playerWrap');
  if(!videoUrl){
    wrap.innerHTML = estadoVazio('🎬','Vídeo indisponível para este título','Ainda não há um arquivo de vídeo cadastrado.');
    return;
  }
  wrap.innerHTML = `<video id="playerVideo" controls preload="metadata" poster="${_tituloAtual.banner_url || ''}">
    <source src="${videoUrl}" type="video/mp4" />
    Seu navegador não suporta reprodução de vídeo.
  </video>`;

  const video = document.getElementById('playerVideo');

  // Retoma de onde parou, se já existir progresso salvo no histórico
  api('/usuario/historico').then(historico => {
    const registro = historico.find(h => h.id_titulo === idTitulo);
    if(registro && registro.progresso_segundos > 5){
      video.currentTime = registro.progresso_segundos;
    }
  }).catch(() => {});

  // Salva o progresso periodicamente e ao pausar/terminar
  let ultimoSalvo = 0;
  video.addEventListener('timeupdate', () => {
    if(Math.abs(video.currentTime - ultimoSalvo) > 8){
      ultimoSalvo = video.currentTime;
      salvarProgresso(idTitulo, video.currentTime, video.duration);
    }
  });
  video.addEventListener('pause', () => salvarProgresso(idTitulo, video.currentTime, video.duration));
  video.addEventListener('ended', () => salvarProgresso(idTitulo, video.duration, video.duration));
}

function salvarProgresso(idTitulo, progresso, duracao){
  if(!duracao || Number.isNaN(duracao)) return;
  api(`/usuario/historico/${idTitulo}`, {
    method: 'POST',
    body: JSON.stringify({ progresso_segundos: Math.floor(progresso), duracao_segundos: Math.floor(duracao) }),
  }).catch(() => {});
}
