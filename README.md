# 🗺️ Guia-me Piracicaba

> Guia comercial completo de Piracicaba-SP — conectando consumidores e lojistas locais.

## 📋 Visão Geral

**Guia-me Piracicaba** é uma plataforma web de diretório comercial para a cidade de Piracicaba-SP, construída com **React + TypeScript + Vite** e backend **Supabase**. Ela oferece listagem de negócios, painel administrativo, dashboard para lojistas, guia turístico, vagas de emprego, feed de notícias e muito mais.

---

## 🛠️ Stack Tecnológico

| Camada        | Tecnologia                                                |
|---------------|-----------------------------------------------------------|
| **Frontend**  | React 19, TypeScript, Vite                                |
| **Estilização** | Tailwind CSS (via CDN)                                  |
| **Roteamento** | React Router DOM v7                                      |
| **Backend**   | Supabase (PostgreSQL + REST API)                          |
| **Ícones**    | Lucide React                                             |
| **Gráficos**  | Recharts                                                 |
| **PDF**       | jsPDF + jspdf-autotable                                  |
| **E-mail**    | @emailjs/browser (reset de senha admin)                  |
| **IA**        | @google/genai (desativado — marcado como "Local Only")   |
| **Deploy**    | Vercel                                                   |

---

## 🌐 Variáveis de Ambiente Obrigatórias

Crie um arquivo `.env.local` na raiz do projeto com:

```env
VITE_SUPABASE_URL=https://SEU_PROJETO.supabase.co
VITE_SUPABASE_ANON_KEY=sua_anon_key_aqui
```

> ⚠️ **Importante:** Sem essas variáveis o app não conecta ao banco de dados.

---

## 🚀 Como Rodar Localmente

```bash
# 1. Instalar dependências
npm install

# 2. Criar .env.local com as variáveis acima

# 3. Iniciar servidor de desenvolvimento
npm run dev
```

O app estará disponível em `http://localhost:5173`.

---

## 📁 Estrutura de Arquivos

```
guia-me-piracicaba/
│
├── index.html              # HTML principal (Tailwind CDN, Google Fonts, import map)
├── index.tsx               # Entry point React (ReactDOM.createRoot)
├── App.tsx                 # Componente principal — rotas, estado global, layout
├── types.ts                # Interfaces e Enums (Business, Customer, CategoryType, etc.)
├── constants.tsx           # Ícones, versão, contato WhatsApp, bairros de Piracicaba
├── metadata.json           # Metadados do app (nome, permissões)
│
├── package.json            # Dependências e scripts npm
├── tsconfig.json           # Config TypeScript (ES2022, path aliases)
├── vite.config.ts          # Config Vite (server, plugins, aliases, chunks)
├── vercel.json             # Rewrites para SPA no Vercel
├── .gitignore              # Arquivos ignorados pelo Git
├── .env.local              # Variáveis de ambiente (NÃO versionado)
│
├── components/
│   ├── BusinessCard.tsx        # Card de negócio (imagem, nome, categoria, rating, status)
│   ├── CustomUI.tsx            # Sistema de notificações toast + modais de confirmação
│   ├── ErrorBoundary.tsx       # Captura erros React com fallback UI
│   ├── NeighborhoodSelector.tsx # Dropdown buscável de bairros
│   └── PromoBanner.tsx         # Banner rotativo de promoções/patrocínios
│
├── pages/
│   ├── Home.tsx                # Página inicial — busca, filtros, carousel patrocinadores, notícias
│   ├── Admin.tsx               # Painel admin — CRUD negócios/clientes, gráficos, export PDF
│   ├── AdminLogin.tsx          # Login admin + reset de senha via EmailJS
│   ├── MerchantDashboard.tsx   # Dashboard lojista — editar perfil, horários, logo, promos
│   ├── MerchantLogin.tsx       # Login lojista (username/telefone + senha)
│   ├── MerchantRegister.tsx    # Cadastro de lojista — dados, CEP, geocoding, patrocínio
│   ├── BusinessDetail.tsx      # Página de detalhes do negócio (hero, mapa, horários, WhatsApp)
│   ├── Jobs.tsx                # Vagas de emprego em Piracicaba (mock + link portal oficial)
│   ├── News.tsx                # Feed de notícias (RSS G1 + fallback mock)
│   ├── TouristGuide.tsx        # Guia turístico local (pontos turísticos filtráveis)
│   ├── PrivacyPolicy.tsx       # Política de privacidade (LGPD)
│   ├── TermsOfUse.tsx          # Termos de uso da plataforma
│   └── SeedOfficial.tsx        # Utilitário para seed de negócios oficiais no banco
│
├── services/
│   ├── supabaseClient.ts       # Inicialização do cliente Supabase
│   ├── databaseService.ts      # CRUD completo (businesses, customers, admin sessions)
│   ├── geminiService.ts        # Serviço Gemini (desativado — "Local Service Only")
│   ├── jobService.ts           # Dados mockados de vagas de emprego
│   ├── newsService.ts          # Busca notícias RSS com cache local + fallback mock
│   ├── weatherService.ts       # Simulação de clima baseado no mês/hora
│   └── touristService.ts       # Dados mockados de pontos turísticos e eventos
│
├── data/
│   ├── mockData.ts             # Dados iniciais de negócios para seed
│   └── officialBusinesses.ts   # Dataset de estabelecimentos oficiais (supermercados, fast-food, academias)
│
└── utils/
    ├── businessUtils.ts        # Verificação de horário (isOpen) + formatação de schedule
    └── geoUtils.ts             # Haversine distance + formatação de distância
```

---

## ✨ Funcionalidades Principais

### 👥 Para Consumidores
- 🔍 Busca por nome, categoria e bairro
- 📍 Geolocalização com cálculo de distância
- 🏪 Visualização detalhada de negócios
- 📰 Feed de notícias local (G1 Piracicaba)
- 🗺️ Guia turístico com pontos de interesse
- 💼 Vagas de emprego locais
- 📋 Cadastro de cliente (nome, telefone, bairro)

### 🏬 Para Lojistas
- 📊 Dashboard com edição de perfil completo
- 🖼️ Upload de logo e imagem de capa
- ⏰ Gerenciamento de horários de funcionamento
- 🏷️ Controle de serviços (delivery, retirada, 24h)
- 📝 Cadastro com busca automática de CEP e geocodificação

### 🔧 Para Administradores
- 📈 Dashboard com estatísticas e gráficos (Recharts)
- 🏢 CRUD completo de negócios e clientes
- 📄 Exportação de relatórios em PDF (jsPDF)
- ✅ Aprovação de cadastros
- 🔒 Autenticação com reset de senha via e-mail

---

## 🗄️ Tabelas Supabase

O projeto utiliza as seguintes tabelas no Supabase:

| Tabela              | Descrição                                    |
|---------------------|----------------------------------------------|
| `businesses`        | Negócios cadastrados (todos os campos)      |
| `customers`         | Clientes registrados (nome, telefone, bairro) |
| `admin_sessions`    | Sessões de admin ativas                     |

---

## 📦 Dependências (package.json)

### Produção
- `react` / `react-dom` — v19
- `react-router-dom` — v7
- `@supabase/supabase-js` — v2
- `lucide-react` — ícones SVG
- `recharts` — gráficos
- `jspdf` + `jspdf-autotable` — geração de PDF
- `@emailjs/browser` — envio de e-mails (reset senha)
- `@google/genai` — Gemini AI (desativado)

### Desenvolvimento
- `typescript` — v5.6
- `vite` — v6
- `@vitejs/plugin-react` — plugin Vite para React
- `@types/react` / `@types/react-dom`

---

## 🔐 Autenticação

- **Admin:** Login com credenciais armazenadas no Supabase (`admin_sessions`), reset de senha via EmailJS
- **Lojista:** Login com username/telefone + senha validados contra tabela `businesses`
- **Cliente:** Cadastro simples armazenado em `customers` + `localStorage`

---

## 📝 Notas

- O serviço Gemini AI está **desativado** (arquivo `geminiService.ts` retorna dados locais)
- O serviço de clima (`weatherService.ts`) usa dados **simulados** sem API externa
- As notícias usam proxy RSS do G1, com **fallback para dados mock** se indisponível
- O projeto usa **Tailwind CSS via CDN** no `index.html` (não como dependência npm)
- Path aliases configurados: `@components`, `@services`, `@data`, `@utils`, `@pages`

---

## 📄 Licença

Projeto proprietário — Guia-me Piracicaba © 2025
