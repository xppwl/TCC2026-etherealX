# Ethereal X — Plataforma de Streaming (TCC 2026)

Site completo de streaming: login (e-mail/senha + Google), início com
destaque e carrosséis, gêneros, filmes, séries, favoritos, minha lista,
histórico ("continue assistindo") e configurações — com player de vídeo
real (HTML5 `<video>`), identidade visual roxo/preto neon e o logo do
olho com pupila em espiral que **acompanha o cursor e pisca sozinho**.

- **Backend:** Node.js + Express + MySQL (mysql2) + Nodemailer (SMTP Gmail) + EmbedMovies API (TMDB Posters & myembed.biz)
- **Frontend:** React.js (Vite) + Tailwind CSS + React Router
- **Autenticação:** e-mail/senha (bcrypt + JWT), Google OAuth (Passport) e Recuperação/Criação de Senha por E-mail (Nodemailer)
- **Catálogo & Streaming:** Integração com EmbedMovies API para Filmes, Séries e Mangás/Animes com capas oficiais TMDB CDN e player embed responsivo
- **Banco de dados:** MySQL, modelado e populado com o MySQL Workbench

---

## 1. Estrutura de pastas

```
etherealX-tcc2026/
├── backend/
│   ├── config/          # conexão com o MySQL e estratégia do Google
│   ├── middleware/       # proteção de rotas (JWT)
│   ├── routes/           # auth, catálogo (filmes/séries/gêneros), usuário
│   ├── database/         # schema.sql e seed.sql (rodar no Workbench)
│   ├── server.js
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/  # AppShell, Sidebar, Topbar, TitleCard, EyeLogo...
│   │   ├── context/     # AuthContext (JWT/estado), ToastContext
│   │   ├── pages/       # LoginPage (página inicial), HomePage, MoviesPage...
│   │   ├── services/    # api.js (cliente fetch centralizado)
│   │   ├── App.jsx      # Rotas com React Router (Login como página inicial)
│   │   ├── main.jsx     # Ponto de entrada React
│   │   └── index.css    # Tailwind CSS + Design System Ethereal X
│   ├── tailwind.config.js # Configuração do Tailwind CSS
│   ├── vite.config.js    # Configuração do Vite com proxy para o backend
│   ├── package.json
│   └── index.html
└── frontend_backup/     # Cópia de segurança da versão HTML/JS pura original
```

## 2. Banco de dados (MySQL Workbench)

1. Abra o MySQL Workbench e conecte na sua instância local.
2. Confirme que o banco `ethereal_streaming` existe (você já criou esse).
3. Abra `backend/database/schema.sql` no Workbench e execute (cria as
   tabelas: `usuarios`, `generos`, `titulos`, `titulo_genero`,
   `episodios`, `favoritos`, `minha_lista`, `historico`).
   > Se você já tinha uma tabela `usuarios` antiga e com colunas
   > diferentes, rode `DROP TABLE usuarios;` antes (ou ajuste o script)
   > pra ela ficar com as colunas que o backend espera (veja o schema).
4. Abra `backend/database/seed.sql` e execute — isso popula gêneros,
   filmes, séries e episódios com **vídeos reais e livres** (curtas do
   Blender Studio, licença aberta), então o player já funciona de
   verdade sem você precisar subir arquivo nenhum.

## 3. Backend

```bash
cd backend
npm install
cp .env.example .env
```

Edite o `.env` com:
- `DB_PASSWORD` → a senha que você usa no MySQL Workbench (usuário `root`)
- `JWT_SECRET` e `SESSION_SECRET` → qualquer string longa e aleatória
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` → veja o passo 5 abaixo
  (se ainda não for configurar o Google, pode deixar em branco por
  enquanto — só o botão "Entrar com Google" não vai funcionar)

Depois:
```bash
npm run dev
```
Se aparecer `✅ Conectado ao MySQL` e `🟣 Ethereal X rodando em
http://localhost:3000`, está tudo certo.

## 4. Frontend (React.js + Tailwind CSS)

O frontend foi modernizado para **React.js** com **Tailwind CSS**, mantendo 100% da identidade visual, animações e layout originais.

### Rodar tudo junto (Recomendado):
Na raiz do projeto:
```bash
npm run dev
```
Esse comando inicia concorrentemente:
- **Backend:** `http://localhost:3000`
- **Frontend:** `http://localhost:5173`

Ou, se preferir rodar apenas o frontend:
```bash
npm run dev:frontend
```
> **Nota de Navegação:** A **página inicial do projeto é a página de login** (`http://localhost:5173/`). Usuários não autenticados que tentarem acessar rotas protegidas (como `/home`) são redirecionados automaticamente para a tela de login. Após entrar com sucesso, são direcionados ao catálogo (`/home`).

## 5. Login com Google (opcional, mas você pediu)

1. Acesse https://console.cloud.google.com/apis/credentials
2. Crie um projeto (se ainda não tiver um) → **Criar credenciais** →
   **ID do cliente OAuth** → tipo **Aplicativo da Web**.
3. Em **URIs de redirecionamento autorizados**, adicione:
   `http://localhost:3000/api/auth/google/callback`
4. Copie o **Client ID** e o **Client Secret** para o `.env` do backend.
5. Reinicie o backend (`npm run dev`).

## 5.1 Sistema de Verificação de Cadastro e Redefinição de Senha por E-mail (SMTP)

O sistema possui autenticação com envio de e-mail via **Nodemailer** (Gmail SMTP):
- **E-mail remetente:** `sophicrotti@gmail.com`
- **Verificação de Cadastro:** Ao criar conta (`/register`), um código de 6 dígitos é enviado por e-mail para validar a conta antes de ativá-la.
- **Redefinição de Senha:** Na tela `/redefinir-senha`, o usuário digita o e-mail, recebe o código e altera a senha.
- **Observação sobre Redes Escolares/Institucionais:** Redes públicas/escolares (como `escola_wifi` da SEED-PR/Celepar) bloqueiam as portas SMTP 587 e 465 por firewall para prevenir spam. Em redes domésticas ou 4G roteadas pelo celular, o e-mail chega diretamente à caixa de entrada. Para testes em rede restrita, o sistema exibe o código no terminal e na interface para não interromper a navegação.
- **Script de Teste:** Execute `node backend/test-smtp.js` para testar os disparos e templates.

## 6. Como o player de vídeo funciona

Os filmes e episódios já vêm com um `video_url` real no `seed.sql`
(curtas do Blender Studio: Big Buck Bunny, Sintel, Elephants Dream,
Tears of Steel etc. — conteúdo livre, sem direitos autorais, ótimo
para o TCC). A tela de detalhes usa um `<video>` HTML5 de verdade,
com controles nativos, retomada de onde parou e progresso salvo
automaticamente na tabela `historico`. Quando você quiser trocar por
filmes do seu próprio catálogo, é só atualizar a coluna `video_url`
na tabela `titulos` (ou `episodios`) com a URL do seu arquivo.

## 7. Sobre o logo do olho (pupila que acompanha o cursor / pisca)

Já está implementado e funcionando em todas as telas — arquivo
`frontend/js/eye-logo.js`:

- **Acompanha o cursor:** a cada `mousemove`, o script calcula o
  ângulo entre o centro do olho (`.eye-logo`) e a posição do mouse na
  tela, e desloca só o grupo da pupila (`.eye-pupil-group`, a espiral)
  nessa direção, dentro de um raio pequeno — como um olho de verdade.
  Isso é feito com `pupila.setAttribute('transform', 'translate(x y)')`,
  então o resto do desenho (contorno, cílios) não se mexe nem distorce.
- **Pisca sozinho:** a função `iniciarPiscarDoOlho()` agenda uma
  piscada a cada 3–7 segundos (intervalo aleatório), adicionando a
  classe `.is-blinking` por 160ms — o CSS faz o contorno do olho
  (`.eye-lid`) encolher no eixo vertical (`scaleY`) pra simular o
  fechar da pálpebra.
- Em telas de toque (sem mouse), a pupila faz um giro lento e contínuo
  em vez de seguir o dedo, pra não ficar "presa" no último toque.

Se quiser ajustar: `RAIO_MAX` controla o quanto a pupila se desloca, e
os dois números em `3000 + Math.random() * 4000` (dentro de
`iniciarPiscarDoOlho`) controlam a frequência da piscada.
