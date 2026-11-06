require('dotenv').config();
const express = require('express');
const cors = require('cors');
const passport = require('./config/passport');

const authRoutes    = require('./routes/authRoutes');
const catalogoRoutes = require('./routes/catalogoRoutes');
const usuarioRoutes = require('./routes/usuarioRoutes');

const app = express();

// CORS: aceita o frontend configurado no .env e qualquer localhost em desenvolvimento
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5500',
  'http://127.0.0.1:5500',
  'http://localhost:5501',
  'http://127.0.0.1:5501',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Permite requisições sem origin (Postman, curl, apps nativos)
    if (!origin) return callback(null, true);

    try {
      const originBase = new URL(origin).origin;
      const match = allowedOrigins.some(ao => {
        try { return new URL(ao).origin === originBase; }
        catch { return ao === origin; }
      });
      if (match || origin.includes('localhost') || origin.includes('127.0.0.1')) {
        return callback(null, true);
      }
    } catch {
      if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
        return callback(null, true);
      }
    }

    callback(new Error(`Origem bloqueada pelo CORS: ${origin}`));
  },
  credentials: true,
}));

app.use(express.json());
app.use(passport.initialize());

// ── Rotas ──────────────────────────────────────────────
app.get('/', (_req, res) => {
  res.send('🟣 API do Ethereal X no ar. Use /api/... para consumir os dados.');
});

// IMPORTANTE: /api/status deve vir ANTES do middleware de 404
app.get('/api/status', (_req, res) => {
  res.json({ status: 'sucesso', mensagem: 'API Ethereal X operando normalmente!' });
});

app.use('/api/auth',     authRoutes);
app.use('/api',          catalogoRoutes);
app.use('/api/usuario',  usuarioRoutes);
app.use('/api/usuarios', usuarioRoutes);

// ── Middleware de rota não encontrada ──────────────────
app.use((_req, res) => {
  res.status(404).json({ erro: 'Rota não encontrada.' });
});

// ── Middleware de erro global ──────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error('❌ Erro interno:', err);
  res.status(500).json({ erro: 'Erro interno no servidor.' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🟣 Ethereal X rodando em http://localhost:${PORT}`);
});