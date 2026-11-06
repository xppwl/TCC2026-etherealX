import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import EyeLogo from './EyeLogo';
import { useAuth } from '../context/AuthContext';

const ITENS_MENU = [
  { path: '/home', icone: '🏠', texto: 'Início' },
  { path: '/genres', icone: '🎬', texto: 'Gêneros' },
  { path: '/movies', icone: '🎞️', texto: 'Filmes' },
  { path: '/series', icone: '📺', texto: 'Séries' },
  { path: '/manga', icone: '⚡', texto: 'Mangás & Animes' },
  { path: '/favorites', icone: '🤍', texto: 'Favoritos' },
  { path: '/mylist', icone: '🔖', texto: 'Minha lista' },
  { path: '/history', icone: '🕓', texto: 'Histórico' },
  { path: '/settings', icone: '⚙️', texto: 'Configurações' },
];

function iniciais(nome) {
  if (!nome) return 'EX';
  const partes = nome.trim().split(/\s+/);
  return ((partes[0]?.[0] || '') + (partes[1]?.[0] || '')).toUpperCase();
}

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <aside className="sidebar" id="sidebar">
      <div className="brand">
        <EyeLogo />
        <div className="brand-text">
          <span className="brand-name">
            <b>ETHEREAL</b>
          </span>
          <span className="brand-sub-badge">Streaming</span>
        </div>
      </div>

      <nav className="nav-group">
        {ITENS_MENU.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <span className="nav-ico">{item.icone}</span>
            <span>{item.texto}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <Link to="/settings" className="user-chip" style={{ cursor: 'pointer' }}>
          <div className="user-avatar">{iniciais(user?.nome)}</div>
          <div className="user-meta">
            <div className="user-name">{user?.nome || 'Usuário Ethereal'}</div>
            <div className="user-email">{user?.email || ''}</div>
          </div>
        </Link>
        <button type="button" className="logout-btn" id="btnSair" onClick={handleLogout}>
          <span>🚪</span> <span>Sair da conta</span>
        </button>
      </div>
    </aside>
  );
}
