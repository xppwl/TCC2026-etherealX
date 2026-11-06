import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute from './components/ProtectedRoute';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import EsqueciSenhaPage from './pages/EsqueciSenhaPage';
import RedefinirSenhaPage from './pages/RedefinirSenhaPage';
import AuthSucessoPage from './pages/AuthSucessoPage';
import HomePage from './pages/HomePage';
import MoviesPage from './pages/MoviesPage';
import SeriesPage from './pages/SeriesPage';
import GenresPage from './pages/GenresPage';
import FavoritesPage from './pages/FavoritesPage';
import MyListPage from './pages/MyListPage';
import HistoryPage from './pages/HistoryPage';
import SettingsPage from './pages/SettingsPage';
import DetailPage from './pages/DetailPage';

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            {/* Página inicial do projeto é a página de login */}
            <Route path="/" element={<LoginPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/login.html" element={<LoginPage />} />

            {/* Cadastro */}
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/register.html" element={<RegisterPage />} />
            <Route path="/cadastro" element={<RegisterPage />} />

            {/* Recuperação e Redefinição de Senha */}
            <Route path="/redefinir-senha" element={<RedefinirSenhaPage />} />
            <Route path="/esqueci-senha" element={<RedefinirSenhaPage />} />
            <Route path="/recuperar-senha" element={<RedefinirSenhaPage />} />

            {/* Retorno OAuth Google */}
            <Route path="/auth-sucesso" element={<AuthSucessoPage />} />
            <Route path="/auth-sucesso.html" element={<AuthSucessoPage />} />

            {/* Rotas autenticadas da aplicação */}
            <Route
              path="/home"
              element={
                <ProtectedRoute>
                  <HomePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/home.html"
              element={
                <ProtectedRoute>
                  <HomePage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/movies"
              element={
                <ProtectedRoute>
                  <MoviesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/movies.html"
              element={
                <ProtectedRoute>
                  <MoviesPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/series"
              element={
                <ProtectedRoute>
                  <SeriesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/series.html"
              element={
                <ProtectedRoute>
                  <SeriesPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/genres"
              element={
                <ProtectedRoute>
                  <GenresPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/genres.html"
              element={
                <ProtectedRoute>
                  <GenresPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/favorites"
              element={
                <ProtectedRoute>
                  <FavoritesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/favorites.html"
              element={
                <ProtectedRoute>
                  <FavoritesPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/mylist"
              element={
                <ProtectedRoute>
                  <MyListPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mylist.html"
              element={
                <ProtectedRoute>
                  <MyListPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/history"
              element={
                <ProtectedRoute>
                  <HistoryPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/history.html"
              element={
                <ProtectedRoute>
                  <HistoryPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <SettingsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings.html"
              element={
                <ProtectedRoute>
                  <SettingsPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/detail/:id"
              element={
                <ProtectedRoute>
                  <DetailPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/detail"
              element={
                <ProtectedRoute>
                  <DetailPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/detail.html"
              element={
                <ProtectedRoute>
                  <DetailPage />
                </ProtectedRoute>
              }
            />

            {/* Rota padrão: redireciona para a página inicial (Login) */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}
