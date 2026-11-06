import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AppShell from '../components/AppShell';
import { PageTopbar } from '../components/Topbar';
import EmptyState from '../components/EmptyState';
import Loader from '../components/Loader';
import { api } from '../services/api';

const CORES_GENERO = {
  acao: '#e04e38',
  aventura: '#a86519',
  comedia: '#e88225',
  drama: '#5a2d68',
  fantasia: '#4d4ed8',
  'ficcao-cientifica': '#208bff',
  misterio: '#33373b',
  romance: '#e83333',
  suspense: '#4b2d7d',
  terror: '#4a0a16',
  documentario: '#2e695d',
};

export default function GenresPage() {
  const [generos, setGeneros] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    async function carregarGeneros() {
      try {
        const dados = await api('/generos');
        setGeneros(dados);
      } catch (err) {
        setErro(err.message);
      } finally {
        setCarregando(false);
      }
    }
    carregarGeneros();
  }, []);

  return (
    <AppShell>
      <PageTopbar title="Gêneros" subtitle="Explore o catálogo por categoria." />

      {carregando ? (
        <Loader />
      ) : erro ? (
        <EmptyState icon="⚠️" title="Não deu pra carregar os gêneros" description={erro} />
      ) : (
        <div className="genre-grid" id="gridGeneros">
          {generos.map((g) => (
            <Link
              key={g.id_genero}
              to={`/movies?genero=${g.id_genero}`}
              className="genre-card"
              style={{ background: CORES_GENERO[g.slug] || '#333' }}
            >
              <h3>{g.nome}</h3>
            </Link>
          ))}
        </div>
      )}
    </AppShell>
  );
}
