const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const pool = require('./db');
require('dotenv').config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0]?.value;
        const nome = profile.displayName;
        const googleId = profile.id;
        const avatarUrl = profile.photos[0]?.value || null;

        const [rows] = await pool.query('SELECT * FROM usuarios WHERE email = ?', [email]);

        if (rows.length > 0) {
          const usuario = rows[0];
          await pool.query('UPDATE usuarios SET google_id = ? WHERE id_usuario = ?', [googleId, usuario.id_usuario]);
          return done(null, usuario);
        }

        const [result] = await pool.query(
          'INSERT INTO usuarios (nome, email, google_id, avatar_url) VALUES (?, ?, ?, ?)',
          [nome, email, googleId, avatarUrl]
        );

        return done(null, { id_usuario: result.insertId, nome, email, avatar_url: avatarUrl });
      } catch (err) {
        console.error('🔴 ERRO DENTRO DO PASSPORT:', err);
        return done(err, null);
      }
    }
  )
);

module.exports = passport;