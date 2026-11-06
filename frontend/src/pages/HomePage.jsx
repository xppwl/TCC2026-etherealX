import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AppShell from '../components/AppShell';
import { HomeTopbar } from '../components/Topbar';
import TitleCard from '../components/TitleCard';
import EmptyState from '../components/EmptyState';
import Loader from '../components/Loader';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';

export default function HomePage() {
  const [titulos, setTitulos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState('');
  const [resultadoBusca, setResultadoBusca] = useState(null);
  const [buscando, setBuscando] = useState(false);

  const trackEmAltaRef = useRef(null);
  const trackTendenciaRef = useRef(null);
  const searchTimeoutRef = useRef(null);
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    async function carregar() {
      try {
        const dados = await api('/titulos');
        setTitulos(dados);
      } catch (err) {
        showToast(err.message, 'erro');
      } finally {
        setCarregando(false);
      }
    }
    carregar();
  }, [showToast]);

  const handleSearchChange = (termo) => {
    setBusca(termo);
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (!termo.trim()) {
      setResultadoBusca(null);
      setBuscando(false);
      return;
    }

    setBuscando(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const resultado = await api(`/titulos?busca=${encodeURIComponent(termo.trim())}`);
        setResultadoBusca(resultado);
      } catch (err) {
        showToast(err.message, 'erro');
      } finally {
        setBuscando(false);
      }
    }, 350);
  };

  const scrollTrack = (ref, amount = 400) => {
    if (ref.current) {
      ref.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };

  const destaque = titulos.find((t) => t.destaque) || titulos[0];
  const emAlta = titulos.filter((t) => t.em_alta);
  const listaEmAlta = emAlta.length ? emAlta : titulos.slice(0, 8);
  const listaTendencia = [...titulos].reverse().slice(0, 8);

  return (
    <AppShell>
      <HomeTopbar searchValue={busca} onSearchChange={handleSearchChange} />

      {busca.trim() && (
        <div id="resultadoBusca" style={{ marginBottom: '40px' }}>
          {buscando ? (
            <Loader text="Buscando..." />
          ) : resultadoBusca && resultadoBusca.length > 0 ? (
            <div className="title-grid">
              {resultadoBusca.map((t) => (
                <TitleCard key={t.id_titulo} titulo={t} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon="🔍"
              title="Nada encontrado"
              description={`Não achamos nada parecido com "${busca}".`}
            />
          )}
        </div>
      )}

      {carregando ? (
        <div className="hero" id="heroSection">
          <Loader text="Carregando destaque..." />
        </div>
      ) : titulos.length === 0 ? (
        <EmptyState
          icon="🎬"
          title="Catálogo vazio"
          description="Assim que os títulos forem cadastrados no banco, eles aparecem aqui."
        />
      ) : (
        <>
          {destaque && (
            <div
              className="hero"
              id="heroSection"
              style={{
                backgroundImage: destaque.banner_url ? `url('${destaque.banner_url}')` : undefined,
              }}
            >
              <div className="hero-content">
                <span className="hero-badge">✨ Destaque Ethereal</span>
                <h1 className="hero-title">{destaque.titulo}</h1>
                <p className="hero-desc">{destaque.sinopse || ''}</p>
                <div className="hero-actions">
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => navigate(`/detail/${destaque.id_titulo}`)}
                  >
                    ▶ Assistir agora
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => navigate(`/detail/${destaque.id_titulo}`)}
                  >
                    ⓘ Mais informações
                  </button>
                </div>
              </div>
            </div>
          )}

          <section className="row-section">
            <div className="row-head">
              <h2>Em alta</h2>
              <Link to="/movies" className="row-head-link">
                Ver todos
              </Link>
            </div>
            <div className="row-wrapper">
              <div className="row-track" ref={trackEmAltaRef} id="trackEmAlta">
                {listaEmAlta.length ? (
                  listaEmAlta.map((t) => <TitleCard key={t.id_titulo} titulo={t} />)
                ) : (
                  <p style={{ color: 'var(--text-low)', fontSize: '13px' }}>Nada por aqui ainda.</p>
                )}
              </div>
              <button
                type="button"
                className="row-scroll-btn"
                onClick={() => scrollTrack(trackEmAltaRef, 400)}
                aria-label="Rolar para a direita"
              >
                ▶
              </button>
            </div>
          </section>

          <section className="row-section">
            <div className="row-head">
              <h2>Tendência</h2>
              <Link to="/movies" className="row-head-link">
                Ver todos
              </Link>
            </div>
            <div className="row-wrapper">
              <div className="row-track" ref={trackTendenciaRef} id="trackTendencia">
                {listaTendencia.length ? (
                  listaTendencia.map((t) => <TitleCard key={t.id_titulo} titulo={t} />)
                ) : (
                  <p style={{ color: 'var(--text-low)', fontSize: '13px' }}>Nada por aqui ainda.</p>
                )}
              </div>
              <button
                type="button"
                className="row-scroll-btn"
                onClick={() => scrollTrack(trackTendenciaRef, 400)}
                aria-label="Rolar para a direita"
              >
                ▶
              </button>
            </div>
          </section>
        </>
      )}
    </AppShell>
  );
}
