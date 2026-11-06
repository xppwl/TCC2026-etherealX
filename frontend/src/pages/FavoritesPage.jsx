import React, { useState, useEffect } from 'react';
import AppShell from '../components/AppShell';
import { PageTopbar } from '../components/Topbar';
import TitleCard from '../components/TitleCard';
import EmptyState from '../components/EmptyState';
import Loader from '../components/Loader';
import { api } from '../services/api';

export default function FavoritesPage() {
  const [favoritos, setFavoritos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    async function carregarFavoritos() {
      try {
        const dados = await api('/usuario/favoritos');
        setFavoritos(dados);
      } catch (err) {
        setErro(err.message);
      } finally {
        setCarregando(false);
      }
    }
    carregarFavoritos();
  }, []);

  return (
    <AppShell>
      <PageTopbar title="Favoritos" subtitle="Os títulos que você marcou com ❤️." />

      {carregando ? (
        <Loader />
      ) : erro ? (
        <EmptyState icon="⚠️" title="Erro ao carregar" description={erro} />
      ) : favoritos.length > 0 ? (
        <div className="title-grid" id="gridTitulos">
          {favoritos.map((t) => (
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
                  ❤️
                </span>
              }
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon="💜"
          title="Sua lista de favoritos está vazia"
          description="Toque no coração de um título para guardá-lo aqui."
        />
      )}
    </AppShell>
  );
}
