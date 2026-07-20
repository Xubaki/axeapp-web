# AxéApp Web — Site Oficial

Site web do AxéApp, guia espiritual de Umbanda e Candomblé. Construído com **Next.js 14** (App Router), **TypeScript** e **Tailwind CSS**, conectado à mesma API do app mobile.

## Tecnologias

- **Next.js 14.2.29** — App Router + Server Components
- **TypeScript 5** — Tipagem estática
- **Tailwind CSS 3** — Estilização utility-first
- **Leaflet + OpenStreetMap** — Mapa interativo (sem chave de API)
- **jose** — JWT para autenticação
- **lucide-react** — Ícones

## Estrutura de Páginas

| Rota | Descrição |
|------|-----------|
| `/` | Landing page com CTA para download do app |
| `/terreiros` | Busca e filtros de terreiros |
| `/terreiros/[id]` | Detalhes de um terreiro específico |
| `/mapa` | Mapa interativo com todos os terreiros |
| `/login` | Login para administradores de terreiro |
| `/esqueci-senha` | Recuperação de senha |
| `/nova-senha` | Redefinição de senha via token |
| `/sobre` | Sobre o AxéApp |
| `/admin` | Dashboard admin (requer autenticação) |
| `/admin/aprovacoes` | Aprovação de cadastros de terreiros |

## Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto com as seguintes variáveis:

```env
# URL da API do app mobile (obrigatório)
NEXT_PUBLIC_API_URL=https://api.appaxe.com.br

# Segredo JWT para validação de tokens de sessão (obrigatório)
# Deve ser o MESMO valor usado no app mobile (JWT_SECRET)
JWT_SECRET=seu_jwt_secret_aqui

# URL do site (para SEO e emails)
NEXT_PUBLIC_SITE_URL=https://appaxe.com.br
```

### Na Hostinger (Painel de Controle)

Configure as variáveis de ambiente no painel da Hostinger em:
**Hospedagem > Node.js > Variáveis de Ambiente**

| Variável | Valor |
|----------|-------|
| `NEXT_PUBLIC_API_URL` | `https://api.appaxe.com.br` |
| `JWT_SECRET` | (mesmo valor do app mobile) |
| `NEXT_PUBLIC_SITE_URL` | `https://appaxe.com.br` |
| `NODE_ENV` | `production` |

## Deploy na Hostinger

O deploy é automático via GitHub. A cada push na branch `main`, a Hostinger detecta as mudanças e faz o deploy automaticamente.

### Configuração do servidor Node.js na Hostinger

O arquivo `server.js` na raiz inicia o servidor Next.js em produção:

```bash
# Instalar dependências
npm install

# Build de produção
npm run build

# Iniciar servidor
npm start
```

### Configuração recomendada no painel Hostinger

- **Versão Node.js:** 18.x ou 20.x
- **Arquivo de entrada:** `server.js`
- **Porta:** 3000 (ou conforme configurado)
- **Comando de build:** `npm run build`
- **Comando de start:** `npm start`

## Desenvolvimento Local

```bash
# Instalar dependências
npm install

# Criar .env.local com as variáveis acima

# Iniciar servidor de desenvolvimento
npm run dev

# Build de produção
npm run build

# Verificar TypeScript
npm run typecheck
```

## Autenticação

O site usa o mesmo sistema de autenticação do app mobile:

1. **Login por email/senha** — via endpoint `POST /trpc/auth.loginEmail`
2. **Recuperação de senha** — via endpoint `POST /trpc/auth.forgotPassword`
3. **Sessão** — armazenada em cookie HTTP-only `axe-session`
4. **Admin** — verificado via middleware em `/admin/*`

## SEO

- **Meta tags dinâmicas** por terreiro (título, descrição, OpenGraph)
- **sitemap.xml** gerado automaticamente com todos os terreiros
- **robots.txt** otimizado para indexação
- **Structured data** (JSON-LD) nas páginas de terreiro

## Notas Importantes

- O site **não** implementa Apple Sign-In (apenas mobile)
- O mapa usa **OpenStreetMap** (sem chave de API)
- As imagens são servidas diretamente da API (`unoptimized: true`)
- O Pages Router (`pages/`) existe apenas para as páginas de erro (`_error`, `_document`)
