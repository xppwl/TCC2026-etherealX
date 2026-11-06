import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import AppShell from '../components/AppShell';
import { PageTopbar } from '../components/Topbar';
import TitleCard from '../components/TitleCard';
import EmptyState from '../components/EmptyState';
import Loader from '../components/Loader';
import { api } from '../services/api';

export default function SeriesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [generos, setGeneros] = useState([]);
  const [titulos, setTitulos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [origem, setOrigem] = useState('todos'); // 'todos' | 'embedmovies'
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);

  const generoAtivo = searchParams.get('genero') || '';

  useEffect(() => {
    async function carregarGeneros() {
      try {
        const dados = await api('/generos');
        setGeneros(dados);
      } catch {
        // Ignora erro se falhar carregamento de filtros
      }
    }
    carregarGeneros();
  }, []);

  useEffect(() => {
    async function carregarSeries() {
      setCarregando(true);
      setErro('');
      try {
        if (origem === 'embedmovies') {
          const res = await api(`/catalogo/embedmovies?tipo=serie&page=${pagina}`);
          setTitulos(res.resultados || []);
          setTotalPaginas(res.total_paginas || 1);
        } else {
          const query = new URLSearchParams({ tipo: 'serie' });
          if (generoAtivo) query.set('genero', generoAtivo);
          const dados = await api(`/titulos?${query.toString()}`);
          setTitulos(dados);
        }
      } catch (err) {
        setErro(err.message);
      } finally {
        setCarregando(false);
      }
    }
    carregarSeries();
  }, [generoAtivo, origem, pagina]);

  const handleSelectGenero = (id) => {
    if (id) {
      setSearchParams({ genero: id });
    } else {
      setSearchParams({});
    }
  };

  return (
    <AppShell>
      <PageTopbar title="Séries" subtitle="Todo o acervo de séries com capas em alta definição e player EmbedMovies." />

      <div className="filter-bar" style={{ marginBottom: '16px' }}>
        <button
          type="button"
          className={`filter-chip ${origem === 'todos' ? 'active' : ''}`}
          onClick={() => {
            setOrigem('todos');
            setPagina(1);
          }}
        >
          📺 Catálogo Principal
        </button>
        <button
          type="button"
          className={`filter-chip ${origem === 'embedmovies' ? 'active' : ''}`}
          onClick={() => {
            setOrigem('embedmovies');
            setPagina(1);
          }}
        >
          🌐 EmbedMovies API (Ao Vivo)
        </button>
      </div>

      {origem === 'todos' && (
        <div className="filter-bar" id="filtroGeneros" style={{ marginBottom: '22px' }}>
          <button
            type="button"
            className={`filter-chip ${generoAtivo === '' ? 'active' : ''}`}
            onClick={() => handleSelectGenero('')}
          >
            Todos
          </button>
          {generos.map((g) => (
            <button
              key={g.id_genero}
              type="button"
              className={`filter-chip ${String(g.id_genero) === String(generoAtivo) ? 'active' : ''}`}
              onClick={() => handleSelectGenero(g.id_genero)}
            >
              {g.nome}
            </button>
          ))}
        </div>
      )}

      {carregando ? (
        <Loader text="Carregando séries..." />
      ) : erro ? (
        <EmptyState icon="⚠️" title="Erro ao carregar" description={erro} />
      ) : titulos.length > 0 ? (
        <>
          <div className="title-grid" id="gridTitulos">
            {titulos.map((t, index) => (
              <TitleCard key={t.id_titulo || t.id_origem || index} titulo={t} />
            ))}
          </div>

          {origem === 'embedmovies' && totalPaginas > 1 && (
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
          icon="🎬"
          title="Nada por aqui"
          description="Não encontramos séries para esse filtro."
        />
      )}
    </AppShell>
  );
}
