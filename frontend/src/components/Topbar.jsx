import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function HomeTopbar({ searchValue, onSearchChange }) {
  const { user } = useAuth();
  const primeiroNome = user?.nome?.split(' ')[0] || 'usuário';

  return (
    <div className="topbar home-topbar">
      <div className="search-box home-search">
        <span>🔍</span>
        <input
          type="text"
          id="buscaHome"
          placeholder="Buscar filmes, series..."
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <div className="topbar-right">
        <button type="button" className="icon-btn" title="Notificações" aria-label="Notificações">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
          </svg>
        </button>
        <Link className="topbar-user" to="/settings">
          <span id="saudacaoUsuario">Olá, {primeiroNome}</span>
          <div className="topbar-avatar" id="topbarAvatar">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="#e91e63">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
            </svg>
          </div>
        </Link>
      </div>
    </div>
  );
}

export function PageTopbar({ title, subtitle }) {
  return (
    <div className="topbar">
      <div>
        <h1 className="page-title">{title}</h1>
        {subtitle && <p className="page-sub">{subtitle}</p>}
      </div>
    </div>
  );
}
