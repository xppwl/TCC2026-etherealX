// ============================================================
// HISTÓRICO — "Continue assistindo"
// ============================================================

async function iniciarHistorico(){
  montarSidebar('historico');
  const host = document.getElementById('listaHistorico');
  host.innerHTML = estadoCarregando();

  try{
    const historico = await api('/usuario/historico');
    if(!historico.length){
      host.innerHTML = estadoVazio('🕓','Seu histórico está vazio','Os títulos que você assistir vão aparecer aqui, com o progresso salvo automaticamente.');
      return;
    }
    host.innerHTML = historico.map(h => desenharLinhaHistorico(h)).join('');
  }catch(err){
    host.innerHTML = estadoVazio('⚠️','Erro ao carregar seu histórico', err.message);
  }
}

function desenharLinhaHistorico(h){
  const percentual = h.duracao_segundos ? Math.min(100, Math.round((h.progresso_segundos / h.duracao_segundos) * 100)) : 0;
  const data = new Date(h.atualizado_em).toLocaleDateString('pt-BR');
  return `
    <div class="history-row">
      <div class="history-thumb"><img src="${h.poster_url || posterFallback()}" alt="${h.titulo}" /></div>
      <div class="history-info">
        <h3>${h.titulo}</h3>
        <p>${h.tipo === 'serie' ? 'Série' : 'Filme'} · ${h.ano_lancamento || ''} · assistido em ${data}</p>
        <div class="progress-bar"><div class="progress-bar-fill" style="width:${percentual}%;"></div></div>
      </div>
      <div class="history-actions">
        <a class="btn btn-primary btn-sm" href="detail.html?id=${h.id_titulo}">▶ Continuar</a>
        <button class="btn btn-ghost btn-sm" onclick="removerDoHistorico(${h.id_titulo})">Remover</button>
      </div>
    </div>
  `;
}

async function removerDoHistorico(id){
  try{
    await api(`/usuario/historico/${id}`, { method: 'DELETE' });
    mostrarToast('Removido do histórico.');
    iniciarHistorico();
  }catch(err){
    mostrarToast(err.message);
  }
}
