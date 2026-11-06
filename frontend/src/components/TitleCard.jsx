import React from 'react';
import { useNavigate } from 'react-router-dom';
import { posterFallback } from '../services/api';

export default function TitleCard({ titulo, extra = null }) {
  const navigate = useNavigate();
  const poster = titulo.poster_url || posterFallback();
  const ano = titulo.ano_lancamento ? `${titulo.ano_lancamento}` : '';
  const nota = titulo.nota != null ? Number(titulo.nota).toFixed(1) : null;

  return (
    <div
      className="title-card"
      onClick={() => navigate(`/detail/${titulo.id_titulo}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter') navigate(`/detail/${titulo.id_titulo}`);
      }}
    >
      <div style={{ position: 'relative' }}>
        <img className="poster" src={poster} alt={titulo.titulo} loading="lazy" />
        {extra}
      </div>
      <div className="card-body">
        <div className="card-title">{titulo.titulo}</div>
        <div className="card-meta">
          <span className="pill">{titulo.tipo === 'serie' ? 'Série' : 'Filme'}</span>
          {ano && <span>{ano}</span>}
          {nota && <span className="rating">★ {nota}</span>}
        </div>
      </div>
    </div>
  );
}
