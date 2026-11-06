import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import EyeLogo from '../components/EyeLogo';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api, API_BASE } from '../services/api';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  const { login, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (searchParams.get('erro') === 'google') {
      setErro('Não foi possível entrar com o Google. Tente novamente ou use e-mail e senha.');
    }
  }, [searchParams]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/home');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');

    if (!email || !senha) {
      setErro('Por favor, preencha seu e-mail e senha.');
      return;
    }

    setCarregando(true);
    try {
      const dados = await api('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim(), senha }),
      });
      login(dados.token, dados.usuario);
      navigate('/home');
    } catch (err) {
      setErro(err.message);
    } finally {
      setCarregando(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${API_BASE}/auth/google`;
  };

  const handleEsqueceuSenha = (e) => {
    e.preventDefault();
    navigate('/redefinir-senha');
  };

  return (
    <div className="auth-center-page">
      <div className="auth-card">
        <div className="auth-card-brand">
          <div role="img" aria-label="Logo Ethereal X">
            <EyeLogo />
          </div>
          <div className="brand-name">Ethereal X</div>
        </div>

        {erro && (
          <div className="alert alert-error" role="alert" aria-live="polite" style={{ display: 'block' }}>
            {erro}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="field field-icon-wrap">
            <span className="f-ico" aria-hidden="true">✉️</span>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Seu e-mail"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="field field-icon-wrap">
            <span className="f-ico" aria-hidden="true">🔒</span>
            <input
              type={mostrarSenha ? 'text' : 'password'}
              id="senha"
              name="senha"
              placeholder="••••••"
              autoComplete="current-password"
              minLength={6}
              required
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
            />
            <button
              type="button"
              className="f-toggle"
              id="toggleSenha"
              onClick={() => setMostrarSenha((prev) => !prev)}
              aria-label={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
              title="Mostrar/ocultar senha"
            >
              {mostrarSenha ? '🙈' : '👁'}
            </button>
          </div>

          <div className="auth-forgot">
            <Link to="/redefinir-senha" id="linkEsqueceuSenha">
              Esqueceu sua senha?
            </Link>
          </div>

          <button
            type="submit"
            className="btn-auth-outline"
            id="btnEntrar"
            disabled={carregando}
          >
            {carregando ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div className="auth-divider-line"></div>

        <button
          className="google-center-btn"
          id="btnGoogle"
          type="button"
          title="Entrar com Google"
          aria-label="Entrar com o Google"
          onClick={handleGoogleLogin}
        >
          <svg width="26" height="26" viewBox="0 0 48 48" aria-hidden="true" focusable="false">
            <path
              fill="#FFC107"
              d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l6-6C34.5 5.1 29.5 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21 21-9.4 21-21c0-1.4-.1-2.5-.4-3.5z"
            />
            <path
              fill="#FF3D00"
              d="M6.3 14.7l6.6 4.8C14.7 15.3 19 12 24 12c3.1 0 5.8 1.1 8 3l6-6C34.5 5.1 29.5 3 24 3c-7.7 0-14.4 4.4-17.7 10.7z"
            />
            <path
              fill="#4CAF50"
              d="M24 45c5.2 0 10-2 13.5-5.2l-6.2-5.2C29.3 36.6 26.8 37.5 24 37.5c-5.3 0-9.7-3.4-11.3-8.1l-6.5 5C9.5 40.4 16.2 45 24 45z"
            />
            <path
              fill="#1976D2"
              d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.2 5.7l6.2 5.2C40.5 36 44 30.5 44 24c0-1.4-.1-2.5-.4-3.5z"
            />
          </svg>
        </button>

        <p className="auth-switch" style={{ marginTop: '18px', fontSize: '12.5px' }}>
          Não tem conta? <Link to="/register">Cadastre-se</Link>
        </p>
      </div>
    </div>
  );
}
