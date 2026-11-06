import React, { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import AppShell from '../components/AppShell';
import EmptyState from '../components/EmptyState';
import Loader from '../components/Loader';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';

export default function DetailPage() {
  const { id: paramId } = useParams();
  const [searchParams] = useSearchParams();
  const id = paramId || searchParams.get('id');

  const [titulo, setTitulo] = useState(null);
  const [favoritado, setFavoritado] = useState(false);
  const [naLista, setNaLista] = useState(false);
  const [episodioAtual, setEpisodioAtual] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  const videoRef = useRef(null);
  const playerWrapRef = useRef(null);
  const ultimoSalvoRef = useRef(0);
  const { showToast } = useToast();

  useEffect(() => {
    if (!id) {
      setErro('Título não especificado.');
      setCarregando(false);
      return;
    }

    async function carregarDetalhes() {
      setCarregando(true);
      setErro('');
      try {
        const [dadosTitulo, favoritos, minhaLista] = await Promise.all([
          api(`/titulos/${id}`),
          api('/usuario/favoritos'),
          api('/usuario/minha-lista'),
        ]);

        setTitulo(dadosTitulo);
        setFavoritado(favoritos.some((f) => String(f.id_titulo) === String(dadosTitulo.id_titulo)));
        setNaLista(minhaLista.some((f) => String(f.id_titulo) === String(dadosTitulo.id_titulo)));

        if (dadosTitulo.tipo === 'serie' && dadosTitulo.episodios?.length) {
          setEpisodioAtual(dadosTitulo.episodios[0]);
        }
      } catch (err) {
        setErro(err.message);
      } finally {
        setCarregando(false);
      }
    }

    carregarDetalhes();
  }, [id]);

  const videoUrl =
    titulo?.tipo === 'serie' && episodioAtual
      ? episodioAtual.video_url
      : titulo?.video_url;

  const isEmbed = Boolean(
    titulo?.embed_url ||
    (videoUrl && (videoUrl.includes('myembed') || videoUrl.includes('embed') || !videoUrl.endsWith('.mp4')))
  );
  const embedSrc = titulo?.embed_url || (isEmbed ? videoUrl : null);

  // Restaurar progresso e gerenciar autosave
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !titulo) return;

    api('/usuario/historico')
      .then((historico) => {
        const registro = historico.find((h) => String(h.id_titulo) === String(titulo.id_titulo));
        if (registro && registro.progresso_segundos > 5 && video) {
          video.currentTime = registro.progresso_segundos;
        }
      })
      .catch(() => {});

    const salvarProgresso = (progresso, duracao) => {
      if (!duracao || Number.isNaN(duracao)) return;
      api(`/usuario/historico/${titulo.id_titulo}`, {
        method: 'POST',
        body: JSON.stringify({
          progresso_segundos: Math.floor(progresso),
          duracao_segundos: Math.floor(duracao),
        }),
      }).catch(() => {});
    };

    const handleTimeUpdate = () => {
      if (Math.abs(video.currentTime - ultimoSalvoRef.current) > 8) {
        ultimoSalvoRef.current = video.currentTime;
        salvarProgresso(video.currentTime, video.duration);
      }
    };

    const handlePause = () => {
      salvarProgresso(video.currentTime, video.duration);
    };

    const handleEnded = () => {
      salvarProgresso(video.duration, video.duration);
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('pause', handlePause);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ended', handleEnded);
    };
  }, [titulo, videoUrl]);

  const alternarFavorito = async () => {
    if (!titulo) return;
    try {
      if (favoritado) {
        await api(`/usuario/favoritos/${titulo.id_titulo}`, { method: 'DELETE' });
        showToast('Removido dos favoritos.', 'info');
      } else {
        await api(`/usuario/favoritos/${titulo.id_titulo}`, { method: 'POST' });
        showToast('Adicionado aos favoritos!', 'sucesso');
      }
      setFavoritado((prev) => !prev);
    } catch (err) {
      showToast(err.message, 'erro');
    }
  };

  const alternarMinhaLista = async () => {
    if (!titulo) return;
    try {
      if (naLista) {
        await api(`/usuario/minha-lista/${titulo.id_titulo}`, { method: 'DELETE' });
        showToast('Removido da Minha Lista.', 'info');
      } else {
        await api(`/usuario/minha-lista/${titulo.id_titulo}`, { method: 'POST' });
        showToast('Adicionado à Minha Lista!', 'sucesso');
      }
      setNaLista((prev) => !prev);
    } catch (err) {
      showToast(err.message, 'erro');
    }
  };

  const handleTrocarEpisodio = (ep) => {
    setEpisodioAtual(ep);
    if (playerWrapRef.current) {
      window.scrollTo({
        top: playerWrapRef.current.offsetTop - 20,
        behavior: 'smooth',
      });
    }
  };

  return (
    <AppShell>
      <div id="detalheContainer">
        {carregando ? (
          <Loader text="Carregando detalhes..." />
        ) : erro ? (
          <EmptyState icon="⚠️" title="Não foi possível carregar este título" description={erro} />
        ) : !titulo ? (
          <EmptyState icon="⚠️" title="Título não encontrado" />
        ) : (
          <>
            <div className="player-wrap" id="playerWrap" ref={playerWrapRef}>
              {isEmbed && embedSrc ? (
                <iframe
                  src={embedSrc}
                  title={titulo.titulo}
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  scrolling="no"
                  allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                  allowFullScreen
                  style={{
                    width: '100%',
                    height: '100%',
                    minHeight: '480px',
                    border: 'none',
                    borderRadius: '16px',
                    boxShadow: '0 0 35px rgba(123, 47, 247, 0.35)',
                    backgroundColor: '#000',
                  }}
                />
              ) : videoUrl ? (
                <video
                  key={videoUrl}
                  ref={videoRef}
                  id="playerVideo"
                  controls
                  preload="metadata"
                  poster={titulo.banner_url || titulo.poster_url || ''}
                >
                  <source src={videoUrl} type="video/mp4" />
                  Seu navegador não suporta reprodução de vídeo.
                </video>
              ) : (
                <EmptyState
                  icon="🎬"
                  title="Vídeo indisponível para este título"
                  description="Ainda não há um arquivo ou player cadastrado."
                />
              )}
            </div>

            <div
              className="detail-hero"
              id="detailHero"
              style={{
                backgroundImage: titulo.banner_url ? `url('${titulo.banner_url}')` : undefined,
              }}
            >
              <div className="detail-hero-content">
                <div className="detail-tags" id="detailTags">
                  <span className="pill">
                    {titulo.tipo === 'manga' || titulo.tipo === 'anime'
                      ? 'Mangá / Anime'
                      : titulo.tipo === 'serie'
                      ? 'Série'
                      : 'Filme'}
                  </span>
                  {titulo.ano_lancamento && <span className="pill">{titulo.ano_lancamento}</span>}
                  {titulo.classificacao && <span className="pill">{titulo.classificacao}</span>}
                  {titulo.nota != null && (
                    <span className="pill rating">★ {Number(titulo.nota).toFixed(1)}</span>
                  )}
                  {titulo.generos && <span className="pill">{titulo.generos}</span>}
                </div>
                <h1 className="detail-title" id="detailTitle">
                  {titulo.titulo}
                </h1>
                <p className="detail-desc" id="detailDesc">
                  {titulo.sinopse || ''}
                </p>
                <div className="detail-actions">
                  <button
                    type="button"
                    className="btn btn-ghost"
                    id="btnFavorito"
                    onClick={alternarFavorito}
                  >
                    {favoritado ? '❤️ Nos favoritos' : '🤍 Favoritar'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost"
                    id="btnLista"
                    onClick={alternarMinhaLista}
                  >
                    {naLista ? '🔖 Na Minha Lista' : '➕ Minha Lista'}
                  </button>
                </div>
              </div>
            </div>

            {titulo.tipo === 'serie' && titulo.episodios && titulo.episodios.length > 0 && (
              <section className="row-section" id="secaoEpisodios">
                <div className="row-head">
                  <h2>Episódios</h2>
                </div>
                <div className="episode-list" id="listaEpisodios">
                  {titulo.episodios.map((ep) => (
                    <div
                      key={ep.id_episodio || ep.numero_episodio}
                      className="episode-row"
                      style={{
                        cursor: 'pointer',
                        borderColor:
                          episodioAtual?.id_episodio === ep.id_episodio
                            ? 'var(--stroke-2)'
                            : undefined,
                      }}
                      onClick={() => handleTrocarEpisodio(ep)}
                    >
                      <div className="episode-num">{ep.numero_episodio}</div>
                      <div className="episode-info">
                        <div className="ep-title">{ep.titulo_episodio}</div>
                        <div className="ep-meta">
                          Temporada {ep.numero_temporada} · {ep.duracao_minutos || '--'} min
                        </div>
                      </div>
                      <div style={{ fontSize: '18px' }}>▶</div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </AppShell>
  );
}
