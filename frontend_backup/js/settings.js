// ============================================================
// CONFIGURAÇÕES — Perfil, Senha, Preferências, Notificações
// ============================================================

async function iniciarConfiguracoes(){
  montarSidebar('');
  try{
    const perfil = await api('/usuario/perfil');
    document.getElementById('inputNome').value = perfil.nome || '';
    document.getElementById('inputEmail').value = perfil.email || '';
    document.getElementById('toggleAutoplay').checked = !!perfil.autoplay;
    document.getElementById('toggleHD').checked = perfil.qualidade_padrao === '1080p' || perfil.qualidade_padrao === '4k';
    document.getElementById('toggleLegendas').checked = !!perfil.legendas_padrao;
    document.getElementById('toggleNovosLancamentos').checked = !!perfil.notificacoes_email;
    document.getElementById('toggleContinuarAssistindo').checked = !!perfil.notificacoes_email;
  }catch(err){
    mostrarToast(err.message);
  }

  document.getElementById('formPerfil').addEventListener('submit', async (e) => {
    e.preventDefault();
    try{
      const nome = document.getElementById('inputNome').value.trim();
      await api('/usuario/perfil', { method: 'PUT', body: JSON.stringify({ nome }) });
      const usuario = Auth.getUser();
      usuario.nome = nome;
      localStorage.setItem('ethereal_user', JSON.stringify(usuario));
      mostrarToast('Perfil atualizado com sucesso!');
      montarSidebar('');
    }catch(err){ mostrarToast(err.message); }
  });

  document.getElementById('formSenha').addEventListener('submit', async (e) => {
    e.preventDefault();
    const senhaAtual = document.getElementById('inputSenhaAtual').value;
    const novaSenha = document.getElementById('inputNovaSenha').value;
    try{
      await api('/usuario/senha', { method: 'PUT', body: JSON.stringify({ senhaAtual, novaSenha }) });
      mostrarToast('Senha atualizada com sucesso!');
      e.target.reset();
    }catch(err){ mostrarToast(err.message); }
  });

  document.querySelectorAll('.toggle-preferencia').forEach(toggle => {
    toggle.addEventListener('change', salvarPreferencias);
  });
}

async function salvarPreferencias(){
  try{
    await api('/usuario/preferencias', {
      method: 'PUT',
      body: JSON.stringify({
        autoplay: document.getElementById('toggleAutoplay').checked,
        qualidade_padrao: document.getElementById('toggleHD').checked ? '1080p' : 'auto',
        legendas_padrao: document.getElementById('toggleLegendas').checked,
        notificacoes_email: document.getElementById('toggleNovosLancamentos').checked || document.getElementById('toggleContinuarAssistindo').checked,
      }),
    });
    mostrarToast('Preferências salvas.');
  }catch(err){ mostrarToast(err.message); }
}
