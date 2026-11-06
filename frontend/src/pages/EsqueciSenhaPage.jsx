import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import EyeLogo from '../components/EyeLogo';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';

export default function EsqueciSenhaPage() {
  const [email, setEmail] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [tipoAcao, setTipoAcao] = useState(null); // 'link' | 'gerada'
  const [mensagemSucesso, setMensagemSucesso] = useState('');
  const [erro, setErro] = useState('');

  const { showToast } = useToast();
  const navigate = useNavigate();

  // Opção 1: Enviar link e código de 6 dígitos para o e-mail
  const handleEnviarLink = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setErro('Por favor, informe seu e-mail cadastrado.');
      return;
    }

    setCarregando(true);
    setTipoAcao('link');
    setErro('');
    setMensagemSucesso('');

    try {
      const res = await api('/auth/esqueci-senha', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim() }),
      });

      setMensagemSucesso(
        res.mensagem || 'Instruções enviadas! Verifique sua caixa de entrada e spam.'
      );
      showToast('E-mail de recuperação enviado!', 'sucesso');
    } catch (err) {
      setErro(err.message || 'Erro ao enviar e-mail. Verifique se o e-mail está correto.');
    } finally {
      setCarregando(false);
    }
  };

  // Opção 2: O backend gera uma senha forte segura e envia direto para o e-mail
  const handleGerarSenhaPeloBackend = async () => {
    if (!email.trim()) {
      setErro('Por favor, informe seu e-mail cadastrado para receber a senha gerada.');
      return;
    }

    setCarregando(true);
    setTipoAcao('gerada');
    setErro('');
    setMensagemSucesso('');

    try {
      const res = await api('/auth/gerar-senha-provisoria', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim() }),
      });

      setMensagemSucesso(
        res.mensagem || 'Uma nova senha segura foi gerada e enviada para o seu e-mail!'
      );
      showToast('Nova senha gerada e enviada por e-mail!', 'sucesso');
    } catch (err) {
      setErro(err.message || 'Erro ao gerar senha provisória.');
    } finally {
      setCarregando(false);
    }
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
          <div className="brand-sub">RECUPERAÇÃO DE SENHA</div>
        </div>

        {erro && (
          <div className="alert alert-error" role="alert" style={{ display: 'block' }}>
            {erro}
          </div>
        )}

        {mensagemSucesso ? (
          <div style={{ textAlign: 'center' }}>
            <div className="alert alert-success" role="alert" style={{ display: 'block', marginBottom: '20px' }}>
              {mensagemSucesso}
            </div>

            <p style={{ fontSize: '13.5px', color: 'var(--text-mid)', marginBottom: '22px' }}>
              Enviamos a mensagem para <strong style={{ color: '#fff' }}>{email}</strong>.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {tipoAcao === 'link' ? (
                <button
                  type="button"
                  className="btn-auth-outline"
                  onClick={() => navigate(`/redefinir-senha?email=${encodeURIComponent(email)}`)}
                >
                  Digitar Código de 6 Dígitos
                </button>
              ) : (
                <Link to="/" className="btn-auth-outline" style={{ display: 'block', textAlign: 'center' }}>
                  Ir para o Login com a Nova Senha
                </Link>
              )}

              <Link to="/" style={{ color: 'var(--violet-glow)', fontSize: '13px', marginTop: '8px' }}>
                Voltar ao Login
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleEnviarLink} noValidate>
            <p style={{ fontSize: '13px', color: 'var(--text-mid)', textAlign: 'center', marginBottom: '20px' }}>
              Digite seu e-mail para receber o link de redefinição ou gerar uma nova senha segura pelo sistema.
            </p>

            <div className="field field-icon-wrap">
              <span className="f-ico" aria-hidden="true">✉️</span>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Seu e-mail cadastrado"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="btn-auth-outline"
              disabled={carregando}
              style={{ marginBottom: '12px' }}
            >
              {carregando && tipoAcao === 'link' ? 'Enviando e-mail...' : '📩 Enviar Link de Redefinição'}
            </button>

            <button
              type="button"
              className="btn-auth-outline"
              disabled={carregando}
              onClick={handleGerarSenhaPeloBackend}
              style={{
                background: 'rgba(123, 47, 247, 0.12)',
                borderColor: '#a855f7',
                fontSize: '13.5px',
              }}
            >
              {carregando && tipoAcao === 'gerada' ? 'Gerando senha...' : '⚡ Gerar Nova Senha e Enviar por E-mail'}
            </button>

            <div className="auth-forgot" style={{ marginTop: '18px' }}>
              <Link to="/redefinir-senha" style={{ fontSize: '12.5px', color: 'var(--text-low)' }}>
                Já possui um código de verificação? <strong>Redefinir aqui</strong>
              </Link>
            </div>

            <div className="auth-divider-line" style={{ margin: '18px 0 14px' }}></div>

            <p className="auth-switch" style={{ margin: 0, fontSize: '13px' }}>
              Lembrou sua senha? <Link to="/">Voltar ao Login</Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

