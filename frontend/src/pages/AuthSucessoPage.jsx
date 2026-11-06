import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export default function AuthSucessoPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      navigate('/?erro=google', { replace: true });
      return;
    }

    async function carregarPerfil() {
      try {
        localStorage.setItem('ethereal_token', token);
        localStorage.setItem('token', token);
        const usuario = await api('/usuario/perfil');
        login(token, usuario);
        navigate('/home', { replace: true });
      } catch (err) {
        navigate('/?erro=google', { replace: true });
      }
    }

    carregarPerfil();
  }, [searchParams, navigate, login]);

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', margin: 0 }}>
      <div className="loader">
        <span className="spin"></span> Conectando à sua conta, aguarde...
      </div>
    </div>
  );
}
