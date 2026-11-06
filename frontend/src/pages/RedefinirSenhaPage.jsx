import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import EyeLogo from '../components/EyeLogo';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';

export default function RedefinirSenhaPage() {
  const [searchParams] = useSearchParams();
  const tokenParam = searchParams.get('token') || '';
  const emailParam = searchParams.get('email') || '';

  // Etapas:
  // 1 = Apenas a caixa de e-mail e o botão para enviar código
  // 2 = Inserção do código e campos para alterar a senha
  // 3 = Sucesso confirmado
  const [etapa, setEtapa] = useState(tokenParam ? 2 : 1);

  const [email, setEmail] = useState(emailParam);
  const [token, setToken] = useState(tokenParam);
  const [codigo, setCodigo] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);

  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');
  const [sucessoMsg, setSucessoMsg] = useState('');

  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (tokenParam) {
      setToken(tokenParam);
      setEtapa(2);
    }
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [tokenParam, emailParam]);

  // ETAPA 1: Envia o código de redefinição para o e-mail
  const handleEnviarCodigo = async (e) => {
    e.preventDefault();
    setErro('');

    if (!email.trim()) {
      setErro('Por favor, informe seu e-mail cadastrado.');
      return;
    }

    setCarregando(true);
    try {
      await api('/auth/esqueci-senha', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim() }),
      });

      setSucessoMsg(`Código enviado com sucesso para ${email.trim()}! Verifique a caixa de entrada.`);
      showToast('Código enviado para o seu e-mail!', 'sucesso');
      setEtapa(2);
    } catch (err) {
      setErro(err.message || 'Erro ao enviar o código de redefinição.');
    } finally {
      setCarregando(false);
    }
  };

  // Reenviar código caso o usuário precise
  const handleReenviarCodigo = async () => {
    setErro('');
    setCarregando(true);
    try {
      await api('/auth/esqueci-senha', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim() }),
      });
      showToast('Novo código enviado para o seu e-mail!', 'sucesso');
      setSucessoMsg(`Um novo código foi enviado para ${email.trim()}.`);
    } catch (err) {
      setErro(err.message || 'Erro ao reenviar o código.');
    } finally {
      setCarregando(false);
    }
  };

  // ETAPA 2: Valida o código e altera a senha
  const handleAlterarSenha = async (e) => {
    e.preventDefault();
    setErro('');

    if (!token && (!codigo || codigo.trim().length < 4)) {
      setErro('Informe o código de verificação recebido no seu e-mail.');
      return;
    }

    if (!novaSenha || novaSenha.length < 6) {
      setErro('A nova senha precisa ter no mínimo 6 caracteres.');
      return;
    }

    if (novaSenha !== confirmarSenha) {
      setErro('As senhas digitadas não coincidem.');
      return;
    }

    setCarregando(true);
    try {
      const res = await api('/auth/redefinir-senha', {
        method: 'POST',
        body: JSON.stringify({
          token: token || undefined,
          codigo: codigo ? codigo.trim() : undefined,
          email: email.trim(),
          novaSenha,
        }),
      });

      setEtapa(3);
      showToast(res.mensagem || 'Senha alterada com sucesso!', 'sucesso');
    } catch (err) {
      setErro(err.message || 'Código inválido ou expirado. Tente novamente.');
    } finally {
      setCarregando(false);
    }
  };

  // Verifica se o código já tem dígitos suficientes para liberar o formulário de senha
  const codigoPreenchido = token || (codigo && codigo.trim().length >= 4);

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
          <div className="brand-sub">REDEFINIR SENHA</div>
        </div>

        {erro && (
          <div className="alert alert-error" role="alert" style={{ display: 'block' }}>
            {erro}
          </div>
        )}

        {/* ETAPA 1: Apenas caixa de e-mail e botão de envio de código */}
        {etapa === 1 && (
          <form onSubmit={handleEnviarCodigo} noValidate>
            <p style={{ fontSize: '13.5px', color: 'var(--text-mid)', textAlign: 'center', marginBottom: '22px' }}>
              Digite seu e-mail abaixo para receber o código de redefinição de senha.
            </p>

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

            <button
              type="submit"
              className="btn-auth-outline"
              id="btnEnviarCodigo"
              disabled={carregando}
            >
              {carregando ? 'Enviando código...' : 'Enviar código de redefinição'}
            </button>

            <div className="auth-divider-line" style={{ margin: '22px 0 16px' }}></div>

            <p className="auth-switch" style={{ margin: 0, fontSize: '13px' }}>
              Lembrou sua senha? <Link to="/">Voltar ao Login</Link>
            </p>
          </form>
        )}

        {/* ETAPA 2: Inserção do código e campos para alterar a senha */}
        {etapa === 2 && (
          <form onSubmit={handleAlterarSenha} noValidate>
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

            {!token && (
              <div className="field field-icon-wrap">
                <span className="f-ico" aria-hidden="true">🔢</span>
                <input
                  type="text"
                  id="codigo"
                  name="codigo"
                  placeholder="Digite o código recebido"
                  maxLength={6}
                  required
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value.replace(/\D/g, ''))}
                  style={{
                    letterSpacing: '5px',
                    fontWeight: '700',
                    fontSize: '16px',
                    textAlign: 'center',
                  }}
                  autoFocus
                />
              </div>
            )}

            {/* Quando o código está presente ou preenchido, exibe os campos de alteração de senha */}
            {codigoPreenchido ? (
              <>
                <div className="field field-icon-wrap" style={{ marginTop: '10px' }}>
                  <span className="f-ico" aria-hidden="true">🔒</span>
                  <input
                    type={mostrarSenha ? 'text' : 'password'}
                    id="novaSenha"
                    name="novaSenha"
                    placeholder="Nova senha (mínimo 6 dígitos)"
                    minLength={6}
                    required
                    value={novaSenha}
                    onChange={(e) => setNovaSenha(e.target.value)}
                  />
                  <button
                    type="button"
                    className="f-toggle"
                    onClick={() => setMostrarSenha((p) => !p)}
                    title="Mostrar/ocultar senha"
                  >
                    {mostrarSenha ? '🙈' : '👁'}
                  </button>
                </div>

                <div className="field field-icon-wrap">
                  <span className="f-ico" aria-hidden="true">🔒</span>
                  <input
                    type={mostrarSenha ? 'text' : 'password'}
                    id="confirmarSenha"
                    name="confirmarSenha"
                    placeholder="Confirme a nova senha"
                    minLength={6}
                    required
                    value={confirmarSenha}
                    onChange={(e) => setConfirmarSenha(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  className="btn-auth-outline"
                  id="btnAlterarSenha"
                  disabled={carregando}
                  style={{ marginTop: '6px' }}
                >
                  {carregando ? 'Alterando senha...' : 'Alterar Senha'}
                </button>
              </>
            ) : (
              <div style={{ textAlign: 'center', margin: '14px 0 6px', fontSize: '12.5px', color: 'var(--text-low)' }}>
                Digite o código de 6 dígitos enviado por e-mail para desbloquear a alteração de senha.
              </div>
            )}

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
                  setToken('');
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
                Trocar e-mail
              </button>
            </div>

            <div className="auth-divider-line" style={{ margin: '18px 0 14px' }}></div>

            <p className="auth-switch" style={{ margin: 0, fontSize: '13px' }}>
              Lembrou sua senha? <Link to="/">Voltar ao Login</Link>
            </p>
          </form>
        )}

        {/* ETAPA 3: Senha alterada com sucesso */}
        {etapa === 3 && (
          <div style={{ textAlign: 'center' }}>
            <div
              className="alert alert-success"
              role="alert"
              style={{ display: 'block', marginBottom: '20px' }}
            >
              🎉 Senha alterada com sucesso!
            </div>

            <p style={{ fontSize: '14px', color: 'var(--text-mid)', marginBottom: '24px' }}>
              Sua senha foi atualizada. Agora você já pode entrar na sua conta com a nova senha.
            </p>

            <button
              type="button"
              className="btn-auth-outline"
              onClick={() => navigate('/')}
            >
              Fazer Login Agora
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
