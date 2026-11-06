import React, { useState, useEffect } from 'react';
import AppShell from '../components/AppShell';
import { PageTopbar } from '../components/Topbar';
import TitleCard from '../components/TitleCard';
import EmptyState from '../components/EmptyState';
import Loader from '../components/Loader';
import { api } from '../services/api';

export default function MyListPage() {
  const [lista, setLista] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    async function carregarMinhaLista() {
      try {
        const dados = await api('/usuario/minha-lista');
        setLista(dados);
      } catch (err) {
        setErro(err.message);
      } finally {
        setCarregando(false);
      }
    }
    carregarMinhaLista();
  }, []);

  return (
    <AppShell>
      <PageTopbar title="Minha Lista" subtitle="Guardados para assistir depois." />

      {carregando ? (
        <Loader />
      ) : erro ? (
        <EmptyState icon="⚠️" title="Erro ao carregar" description={erro} />
      ) : lista.length > 0 ? (
        <div className="title-grid" id="gridTitulos">
          {lista.map((t) => (
            <TitleCard
              key={t.id_titulo}
              titulo={t}
              extra={
                <span
                  style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    fontSize: '18px',
                  }}
                >
                  🔖
                </span>
              }
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon="🔖"
          title="Sua lista está vazia"
          description="Adicione filmes e séries à Minha Lista pela tela de detalhes."
        />
      )}
    </AppShell>
  );
}
