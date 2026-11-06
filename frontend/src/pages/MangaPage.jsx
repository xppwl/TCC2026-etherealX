import React, { useState, useEffect } from 'react';
import AppShell from '../components/AppShell';
import { PageTopbar } from '../components/Topbar';
import TitleCard from '../components/TitleCard';
import EmptyState from '../components/EmptyState';
import Loader from '../components/Loader';
import { api } from '../services/api';

export default function MangaPage() {
  const [titulos, setTitulos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [abaOrigem, setAbaOrigem] = useState('todos'); // 'todos' | 'embedmovies'
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);

  useEffect(() => {
    async function carregarMangas() {
      setCarregando(true);
      setErro('');
      try {
        if (abaOrigem === 'embedmovies') {
          // Busca diretamente da EmbedMovies API em tempo real
          const res = await api(`/catalogo/embedmovies?tipo=manga&page=${pagina}`);
          setTitulos(res.resultados || []);
          setTotalPaginas(res.total_paginas || 1);
        } else {
          // Busca os animes/mangás salvos no banco local (já com capas TMDB da EmbedMovies)
          const dados = await api('/titulos?tipo=manga');
          if (dados && dados.length > 0) {
            setTitulos(dados);
          } else {
            // Se o banco ainda não tiver, carrega da EmbedMovies API
            const res = await api('/catalogo/embedmovies?tipo=manga&page=1');
            setTitulos(res.resultados || []);
          }
        }
      } catch (err) {
        setErro(err.message || 'Erro ao carregar catálogo de mangás e animes.');
      } finally {
        setCarregando(false);
      }
    }

    carregarMangas();
  }, [abaOrigem, pagina]);

  return (
    <AppShell>
      <PageTopbar
        title="Mangás & Animes"
        subtitle="Catálogo completo de animes e mangás integrados com a EmbedMovies API e capas oficiais em alta definição."
      />

      <div className="filter-bar" style={{ marginBottom: '24px' }}>
        <button
          type="button"
          className={`filter-chip ${abaOrigem === 'todos' ? 'active' : ''}`}
          onClick={() => {
            setAbaOrigem('todos');
            setPagina(1);
          }}
        >
          ⚡ Destaques Ethereal X
        </button>

        <button
          type="button"
          className={`filter-chip ${abaOrigem === 'embedmovies' ? 'active' : ''}`}
          onClick={() => {
            setAbaOrigem('embedmovies');
            setPagina(1);
          }}
        >
          🌐 EmbedMovies API (Ao Vivo)
        </button>
      </div>

      {carregando ? (
        <Loader text="Carregando mangás e animes..." />
      ) : erro ? (
        <EmptyState icon="⚠️" title="Erro ao carregar catálogo" description={erro} />
      ) : titulos.length > 0 ? (
        <>
          <div className="title-grid" id="gridTitulos">
            {titulos.map((t, index) => (
              <TitleCard key={t.id_titulo || t.id_origem || index} titulo={t} />
            ))}
          </div>

          {abaOrigem === 'embedmovies' && totalPaginas > 1 && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '12px',
                marginTop: '36px',
                marginBottom: '20px',
              }}
            >
              <button
                type="button"
                className="btn btn-ghost"
                disabled={pagina <= 1}
                onClick={() => setPagina((p) => Math.max(1, p - 1))}
              >
                ◀ Anterior
              </button>
              <span style={{ fontSize: '14px', color: 'var(--text-mid)', fontWeight: '600' }}>
                Página {pagina} de {totalPaginas}
              </span>
              <button
                type="button"
                className="btn btn-ghost"
                disabled={pagina >= totalPaginas}
                onClick={() => setPagina((p) => p + 1)}
              >
                Próxima ▶
              </button>
            </div>
          )}
        </>
      ) : (
        <EmptyState
          icon="⚡"
          title="Nenhum título encontrado"
          description="Nenhum mangá ou anime encontrado no momento."
        />
      )}
    </AppShell>
  );
}

