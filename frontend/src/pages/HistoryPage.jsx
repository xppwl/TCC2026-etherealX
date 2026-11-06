import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppShell from '../components/AppShell';
import { PageTopbar } from '../components/Topbar';
import EmptyState from '../components/EmptyState';
import Loader from '../components/Loader';
import { api, posterFallback } from '../services/api';
import { useToast } from '../context/ToastContext';

export default function HistoryPage() {
  const [historico, setHistorico] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const { showToast } = useToast();
  const navigate = useNavigate();

  const carregarHistorico = async () => {
    try {
      const dados = await api('/usuario/historico');
      setHistorico(dados);
    } catch (err) {
      setErro(err.message);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarHistorico();
  }, []);

  const handleRemover = async (id) => {
    try {
      await api(`/usuario/historico/${id}`, { method: 'DELETE' });
      showToast('Removido do histórico.', 'sucesso');
      setHistorico((prev) => prev.filter((h) => h.id_titulo !== id));
    } catch (err) {
      showToast(err.message, 'erro');
    }
  };

  return (
    <AppShell>
      <PageTopbar title="Histórico" subtitle="Continue de onde parou." />

      {carregando ? (
        <Loader />
      ) : erro ? (
        <EmptyState icon="⚠️" title="Erro ao carregar seu histórico" description={erro} />
      ) : historico.length > 0 ? (
        <div id="listaHistorico">
          {historico.map((h) => {
            const percentual = h.duracao_segundos
              ? Math.min(100, Math.round((h.progresso_segundos / h.duracao_segundos) * 100))
              : 0;
            const data = h.atualizado_em
              ? new Date(h.atualizado_em).toLocaleDateString('pt-BR')
              : '';

            return (
              <div key={h.id_titulo} className="history-row">
                <div className="history-thumb">
                  <img src={h.poster_url || posterFallback()} alt={h.titulo} />
                </div>
                <div className="history-info">
                  <h3>{h.titulo}</h3>
                  <p>
                    {h.tipo === 'serie' ? 'Série' : 'Filme'} · {h.ano_lancamento || ''}
                    {data && ` · assistido em ${data}`}
                  </p>
                  <div className="progress-bar">
                    <div className="progress-bar-fill" style={{ width: `${percentual}%` }}></div>
                  </div>
                </div>
                <div className="history-actions">
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => navigate(`/detail/${h.id_titulo}`)}
                  >
                    ▶ Continuar
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => handleRemover(h.id_titulo)}
                  >
                    Remover
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon="🕓"
          title="Seu histórico está vazio"
          description="Os títulos que você assistir vão aparecer aqui, com o progresso salvo automaticamente."
        />
      )}
    </AppShell>
  );
}
