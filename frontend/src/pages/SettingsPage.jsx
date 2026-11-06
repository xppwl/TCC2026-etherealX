import React, { useState, useEffect } from 'react';
import AppShell from '../components/AppShell';
import { PageTopbar } from '../components/Topbar';
import Loader from '../components/Loader';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function SettingsPage() {
  const { updateUser } = useAuth();
  const { showToast } = useToast();

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');

  const [autoplay, setAutoplay] = useState(false);
  const [hd, setHd] = useState(false);
  const [legendas, setLegendas] = useState(false);
  const [novosLancamentos, setNovosLancamentos] = useState(false);
  const [continuarAssistindo, setContinuarAssistindo] = useState(false);

  const [carregando, setCarregando] = useState(true);
  const [salvandoPerfil, setSalvandoPerfil] = useState(false);
  const [salvandoSenha, setSalvandoSenha] = useState(false);

  useEffect(() => {
    async function carregar() {
      try {
        const perfil = await api('/usuario/perfil');
        setNome(perfil.nome || '');
        setEmail(perfil.email || '');
        setAutoplay(Boolean(perfil.autoplay));
        setHd(perfil.qualidade_padrao === '1080p' || perfil.qualidade_padrao === '4k');
        setLegendas(Boolean(perfil.legendas_padrao));
        setNovosLancamentos(Boolean(perfil.notificacoes_email));
        setContinuarAssistindo(Boolean(perfil.notificacoes_email));
      } catch (err) {
        showToast(err.message, 'erro');
      } finally {
        setCarregando(false);
      }
    }
    carregar();
  }, [showToast]);

  const handleSalvarPerfil = async (e) => {
    e.preventDefault();
    if (!nome.trim()) return;

    setSalvandoPerfil(true);
    try {
      await api('/usuario/perfil', {
        method: 'PUT',
        body: JSON.stringify({ nome: nome.trim() }),
      });
      updateUser({ nome: nome.trim() });
      showToast('Perfil atualizado com sucesso!', 'sucesso');
    } catch (err) {
      showToast(err.message, 'erro');
    } finally {
      setSalvandoPerfil(false);
    }
  };

  const handleAtualizarSenha = async (e) => {
    e.preventDefault();
    if (!senhaAtual || !novaSenha) return;

    setSalvandoSenha(true);
    try {
      await api('/usuario/senha', {
        method: 'PUT',
        body: JSON.stringify({ senhaAtual, novaSenha }),
      });
      showToast('Senha atualizada com sucesso!', 'sucesso');
      setSenhaAtual('');
      setNovaSenha('');
    } catch (err) {
      showToast(err.message, 'erro');
    } finally {
      setSalvandoSenha(false);
    }
  };

  const salvarPreferencias = async (novosValores) => {
    try {
      await api('/usuario/preferencias', {
        method: 'PUT',
        body: JSON.stringify({
          autoplay: novosValores.autoplay,
          qualidade_padrao: novosValores.hd ? '1080p' : 'auto',
          legendas_padrao: novosValores.legendas,
          notificacoes_email: novosValores.novosLancamentos || novosValores.continuarAssistindo,
        }),
      });
      showToast('Preferências salvas.', 'sucesso');
    } catch (err) {
      showToast(err.message, 'erro');
    }
  };

  const handleToggle = (chave, valor) => {
    const atualizados = {
      autoplay,
      hd,
      legendas,
      novosLancamentos,
      continuarAssistindo,
      [chave]: valor,
    };

    if (chave === 'autoplay') setAutoplay(valor);
    if (chave === 'hd') setHd(valor);
    if (chave === 'legendas') setLegendas(valor);
    if (chave === 'novosLancamentos') setNovosLancamentos(valor);
    if (chave === 'continuarAssistindo') setContinuarAssistindo(valor);

    salvarPreferencias(atualizados);
  };

  return (
    <AppShell>
      <PageTopbar title="Configurações" subtitle="Gerencie sua conta e suas preferências." />

      {carregando ? (
        <Loader />
      ) : (
        <>
          <div className="settings-cols">
            <div className="settings-panel">
              <h2>Perfil</h2>
              <form onSubmit={handleSalvarPerfil}>
                <div className="field">
                  <label htmlFor="inputNome">Nome</label>
                  <input
                    type="text"
                    id="inputNome"
                    required
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                  />
                </div>
                <div className="field">
                  <label htmlFor="inputEmail">E-mail</label>
                  <input type="email" id="inputEmail" disabled value={email} />
                </div>
                <button
                  type="submit"
                  className="btn btn-primary btn-block"
                  disabled={salvandoPerfil}
                >
                  {salvandoPerfil ? 'Salvando...' : 'Salvar Perfil'}
                </button>
              </form>
            </div>

            <div className="settings-panel">
              <h2>Alterar Senha</h2>
              <form onSubmit={handleAtualizarSenha}>
                <div className="field">
                  <label htmlFor="inputSenhaAtual">Senha atual</label>
                  <input
                    type="password"
                    id="inputSenhaAtual"
                    required
                    value={senhaAtual}
                    onChange={(e) => setSenhaAtual(e.target.value)}
                  />
                </div>
                <div className="field">
                  <label htmlFor="inputNovaSenha">Nova senha</label>
                  <input
                    type="password"
                    id="inputNovaSenha"
                    minLength={6}
                    required
                    value={novaSenha}
                    onChange={(e) => setNovaSenha(e.target.value)}
                  />
                </div>
                <button
                  type="submit"
                  className="btn btn-primary btn-block"
                  disabled={salvandoSenha}
                >
                  {salvandoSenha ? 'Atualizando...' : 'Atualizar Senha'}
                </button>
              </form>
            </div>

            <div className="settings-panel">
              <h2>Preferências de Reprodução</h2>
              <div className="toggle-row">
                <div>
                  <div className="t-label">Reprodução automática</div>
                  <div className="t-desc">Começar o próximo episódio sozinho</div>
                </div>
                <label className="switch">
                  <input
                    type="checkbox"
                    id="toggleAutoplay"
                    checked={autoplay}
                    onChange={(e) => handleToggle('autoplay', e.target.checked)}
                  />
                  <span className="switch-track"></span>
                </label>
              </div>

              <div className="toggle-row">
                <div>
                  <div className="t-label">Alta qualidade (HD)</div>
                  <div className="t-desc">Prioriza 1080p quando disponível</div>
                </div>
                <label className="switch">
                  <input
                    type="checkbox"
                    id="toggleHD"
                    checked={hd}
                    onChange={(e) => handleToggle('hd', e.target.checked)}
                  />
                  <span className="switch-track"></span>
                </label>
              </div>

              <div className="toggle-row">
                <div>
                  <div className="t-label">Legendas por padrão</div>
                  <div className="t-desc">Ativa legendas automaticamente</div>
                </div>
                <label className="switch">
                  <input
                    type="checkbox"
                    id="toggleLegendas"
                    checked={legendas}
                    onChange={(e) => handleToggle('legendas', e.target.checked)}
                  />
                  <span className="switch-track"></span>
                </label>
              </div>
            </div>
          </div>

          <div className="settings-panel" style={{ marginTop: '20px', maxWidth: '480px' }}>
            <h2>Notificações</h2>
            <div className="toggle-row">
              <div>
                <div className="t-label">Novos lançamentos</div>
                <div className="t-desc">Avisos de novidades no catálogo</div>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  id="toggleNovosLancamentos"
                  checked={novosLancamentos}
                  onChange={(e) => handleToggle('novosLancamentos', e.target.checked)}
                />
                <span className="switch-track"></span>
              </label>
            </div>

            <div className="toggle-row">
              <div>
                <div className="t-label">Lembretes de "Continue assistindo"</div>
                <div className="t-desc">Avisos pra retomar de onde parou</div>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  id="toggleContinuarAssistindo"
                  checked={continuarAssistindo}
                  onChange={(e) => handleToggle('continuarAssistindo', e.target.checked)}
                />
                <span className="switch-track"></span>
              </label>
            </div>
          </div>
        </>
      )}
    </AppShell>
  );
}
