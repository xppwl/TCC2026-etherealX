import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import AppShell from '../components/AppShell';
import { PageTopbar } from '../components/Topbar';
import TitleCard from '../components/TitleCard';
import EmptyState from '../components/EmptyState';
import Loader from '../components/Loader';
import { api } from '../services/api';

export default function MoviesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [generos, setGeneros] = useState([]);
  const [titulos, setTitulos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

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
    async function carregarFilmes() {
      setCarregando(true);
      setErro('');
      try {
        const query = new URLSearchParams({ tipo: 'filme' });
        if (generoAtivo) query.set('genero', generoAtivo);
        const dados = await api(`/titulos?${query.toString()}`);
        setTitulos(dados);
      } catch (err) {
        setErro(err.message);
      } finally {
        setCarregando(false);
      }
    }
    carregarFilmes();
  }, [generoAtivo]);

  const handleSelectGenero = (id) => {
    if (id) {
      setSearchParams({ genero: id });
    } else {
      setSearchParams({});
    }
  };

  return (
    <AppShell>
      <PageTopbar title="Filmes" subtitle="Todo o acervo de filmes do Ethereal X." />

      <div className="filter-bar" id="filtroGeneros">
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

      {carregando ? (
        <Loader />
      ) : erro ? (
        <EmptyState icon="⚠️" title="Erro ao carregar" description={erro} />
      ) : titulos.length > 0 ? (
        <div className="title-grid" id="gridTitulos">
          {titulos.map((t) => (
            <TitleCard key={t.id_titulo} titulo={t} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon="🎬"
          title="Nada por aqui"
          description="Não encontramos filmes para esse filtro."
        />
      )}
    </AppShell>
  );
}
