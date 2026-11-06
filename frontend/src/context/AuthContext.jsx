import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthStorage, setOnUnauthorized } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => AuthStorage.getToken());
  const [user, setUser] = useState(() => AuthStorage.getUser());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setOnUnauthorized(() => {
      setToken(null);
      setUser(null);
    });
    setLoading(false);
  }, []);

  const login = (newToken, newUser) => {
    AuthStorage.salvar(newToken, newUser);
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    AuthStorage.limpar();
    setToken(null);
    setUser(null);
  };

  const updateUser = (updatedFields) => {
    setUser((prev) => {
      const merged = { ...(prev || {}), ...updatedFields };
      AuthStorage.salvar(token, merged);
      return merged;
    });
  };

  const value = {
    token,
    user,
    isAuthenticated: Boolean(token),
    login,
    logout,
    updateUser,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
