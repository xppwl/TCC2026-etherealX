import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import EyeLogo from '../components/EyeLogo';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api, API_BASE } from '../services/api';

export default function RegisterPage() {
  const [etapa, setEtapa] = useState(1); // 1 = Formulário de cadastro | 2 = Verificação de código
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [codigo, setCodigo] = useState('');

  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false);
  const [erro, setErro] = useState('');
  const [sucessoMsg, setSucessoMsg] = useState('');
  const [carregando, setCarregando] = useState(false);

  const { login, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/home');
    }
  }, [isAuthenticated, navigate]);

  // ETAPA 1: Envia os dados e solicita o código de 6 dígitos por e-mail
  const handleSolicitarCodigo = async (e) => {
    e.preventDefault();
    setErro('');

    if (!nome.trim() || !email.trim() || !senha) {
      setErro('Preencha todos os campos obrigatórios.');
      return;
    }

    if (senha.length < 6) {
      setErro('A senha precisa ter pelo menos 6 caracteres.');
      return;
    }

    if (senha !== confirmarSenha) {
      setErro('As senhas não coincidem.');
      return;
    }

    setCarregando(true);
    try {
      await api('/auth/solicitar-codigo-cadastro', {
        method: 'POST',
        body: JSON.stringify({ nome: nome.trim(), email: email.trim(), senha }),
      });

      setSucessoMsg(`Código de ativação enviado para ${email.trim()}! Verifique seu e-mail.`);
      showToast('Código de verificação enviado!', 'sucesso');
      setEtapa(2);
    } catch (err) {
      setErro(err.message || 'Erro ao processar o cadastro.');
    } finally {
      setCarregando(false);
    }
  };

  // Reenviar código de verificação
  const handleReenviarCodigo = async () => {
    setErro('');
    setCarregando(true);
    try {
      await api('/auth/solicitar-codigo-cadastro', {
        method: 'POST',
        body: JSON.stringify({ nome: nome.trim(), email: email.trim(), senha }),
      });
      showToast('Novo código enviado com sucesso!', 'sucesso');
      setSucessoMsg(`Um novo código foi enviado para ${email.trim()}.`);
    } catch (err) {
      setErro(err.message || 'Erro ao reenviar o código.');
    } finally {
      setCarregando(false);
    }
  };

  // ETAPA 2: Valida o código de 6 dígitos e conclui a ativação da conta
  const handleConfirmarCadastro = async (e) => {
    e.preventDefault();
    setErro('');

    if (!codigo || codigo.trim().length < 4) {
      setErro('Digite o código de verificação recebido.');
      return;
    }

    setCarregando(true);
    try {
      const dados = await api('/auth/confirmar-cadastro', {
        method: 'POST',
        body: JSON.stringify({
          email: email.trim(),
          codigo: codigo.trim(),
        }),
      });

      showToast('Conta ativada com sucesso! Bem-vindo(a)!', 'sucesso');
      login(dados.token, dados.usuario);
      navigate('/home');
    } catch (err) {
      setErro(err.message || 'Código de verificação incorreto ou expirado.');
    } finally {
      setCarregando(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${API_BASE}/auth/google`;
  };

  return (
    <div className="auth-center-page">
      <div className="auth-card">
        <div className="auth-card-brand">
          <div role="img" aria-label="Logo Ethereal X">
            <EyeLogo />
          </div>
          <div className="brand-name">
            <b>ETHEREAL</b> X
          </div>
          <div className="brand-sub">
            {etapa === 1 ? 'CRIAR CONTA' : 'VERIFICAÇÃO DE E-MAIL'}
          </div>
        </div>

        {erro && (
          <div className="alert alert-error" role="alert" aria-live="polite" style={{ display: 'block' }}>
            {erro}
          </div>
        )}

        {/* ETAPA 1: Formulário completo de cadastro */}
        {etapa === 1 && (
          <>
            <form onSubmit={handleSolicitarCodigo} noValidate>
              <div className="field field-icon-wrap">
                <span className="f-ico" aria-hidden="true">👤</span>
                <input
                  type="text"
                  id="nome"
                  name="nome"
                  placeholder="Seu nome completo"
                  autoComplete="name"
                  required
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                />
              </div>

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
                  placeholder="Senha (mínimo 6 caracteres)"
                  autoComplete="new-password"
                  minLength={6}
                  required
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                />
                <button
                  type="button"
                  className="f-toggle"
                  onClick={() => setMostrarSenha((p) => !p)}
                  aria-label={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
                  title="Mostrar/ocultar senha"
                >
                  {mostrarSenha ? '🙈' : '👁'}
                </button>
              </div>

              <div className="field field-icon-wrap">
                <span className="f-ico" aria-hidden="true">🔒</span>
                <input
                  type={mostrarConfirmar ? 'text' : 'password'}
                  id="confirmarSenha"
                  name="confirmarSenha"
                  placeholder="Confirme a senha"
                  autoComplete="new-password"
                  minLength={6}
                  required
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                />
                <button
                  type="button"
                  className="f-toggle"
                  onClick={() => setMostrarConfirmar((p) => !p)}
                  aria-label={mostrarConfirmar ? 'Ocultar senha' : 'Mostrar confirmação de senha'}
                  title="Mostrar/ocultar senha"
                >
                  {mostrarConfirmar ? '🙈' : '👁'}
                </button>
              </div>

              <button
                type="submit"
                className="btn-auth-outline"
                id="btnCriarConta"
                style={{ marginTop: '6px' }}
                disabled={carregando}
              >
                {carregando ? 'Enviando código...' : 'Continuar e Enviar Código'}
              </button>
            </form>

            <div className="divider">ou continue com</div>

            <button className="btn-google" id="btnGoogle" type="button" onClick={handleGoogleLogin}>
              <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true" focusable="false">
                <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l6-6C34.5 5.1 29.5 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21 21-9.4 21-21c0-1.4-.1-2.5-.4-3.5z"/>
                <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.3 19 12 24 12c3.1 0 5.8 1.1 8 3l6-6C34.5 5.1 29.5 3 24 3c-7.7 0-14.4 4.4-17.7 10.7z"/>
                <path fill="#4CAF50" d="M24 45c5.2 0 10-2 13.5-5.2l-6.2-5.2C29.3 36.6 26.8 37.5 24 37.5c-5.3 0-9.7-3.4-11.3-8.1l-6.5 5C9.5 40.4 16.2 45 24 45z"/>
                <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.2 5.7l6.2 5.2C40.5 36 44 30.5 44 24c0-1.4-.1-2.5-.4-3.5z"/>
              </svg>
              Continuar com o Google
            </button>

            <p className="auth-switch">
              Já tem uma conta? <Link to="/">Entrar</Link>
            </p>
          </>
        )}

        {/* ETAPA 2: Digitação do código de 6 dígitos enviado por e-mail */}
        {etapa === 2 && (
          <form onSubmit={handleConfirmarCadastro} noValidate>
            {sucessoMsg && (
              <div
                style={{
                  background: 'rgba(53, 224, 161, 0.1)',
                  border: '1px solid rgba(53, 224, 161, 0.35)',
                  padding: '10px 14px',
                  borderRadius: '12px',
                  fontSize: '12.5px',
                  color: '#8ff2cf',
                  marginBottom: '14px',
                  textAlign: 'center',
                }}
              >
                {sucessoMsg}
              </div>
            )}

            <p style={{ fontSize: '13px', color: 'var(--text-mid)', textAlign: 'center', marginBottom: '18px' }}>
              Insira o código de 6 dígitos que enviamos para <strong style={{ color: '#fff' }}>{email}</strong> para ativar sua conta:
            </p>

            <div className="field field-icon-wrap">
              <span className="f-ico" aria-hidden="true">🔢</span>
              <input
                type="text"
                id="codigo"
                name="codigo"
                placeholder="Código de 6 dígitos"
                maxLength={6}
                required
                value={codigo}
                onChange={(e) => setCodigo(e.target.value.replace(/\D/g, ''))}
                style={{
                  letterSpacing: '5px',
                  fontWeight: '700',
                  fontSize: '18px',
                  textAlign: 'center',
                }}
                autoFocus
              />
            </div>

            <button
              type="submit"
              className="btn-auth-outline"
              disabled={carregando}
              style={{ marginTop: '8px' }}
            >
              {carregando ? 'Ativando conta...' : 'Confirmar Código e Ativar Conta'}
            </button>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px', fontSize: '12.5px' }}>
              <button
                type="button"
                onClick={handleReenviarCodigo}
                disabled={carregando}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--violet-glow)',
                  cursor: 'pointer',
                  padding: 0,
                  fontSize: '12.5px',
                }}
              >
                Reenviar código
              </button>

              <button
                type="button"
                onClick={() => {
                  setEtapa(1);
                  setCodigo('');
                  setErro('');
                  setSucessoMsg('');
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-low)',
                  cursor: 'pointer',
                  padding: 0,
                  fontSize: '12.5px',
                }}
              >
                Corrigir dados
              </button>
            </div>

            <div className="auth-divider-line" style={{ margin: '18px 0 14px' }}></div>

            <p className="auth-switch" style={{ margin: 0, fontSize: '13px' }}>
              Já tem uma conta? <Link to="/">Entrar</Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
