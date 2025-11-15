# Documentação Completa do Sistema de Doações Escolares
## Para Redesign e Análise de IA

---

## 📋 ÍNDICE

1. [Visão Geral do Sistema](#visão-geral-do-sistema)
2. [Arquitetura Técnica](#arquitetura-técnica)
3. [Estrutura de Pastas e Arquivos](#estrutura-de-pastas-e-arquivos)
4. [Design System Atual](#design-system-atual)
5. [Funcionalidades Detalhadas](#funcionalidades-detalhadas)
6. [Fluxos de Usuário](#fluxos-de-usuário)
7. [Modelos de Dados](#modelos-de-dados)
8. [Componentes UI](#componentes-ui)
9. [Páginas e Rotas](#páginas-e-rotas)
10. [Estado Atual do Design](#estado-atual-do-design)
11. [Oportunidades de Melhoria](#oportunidades-de-melhoria)

---

## 1. VISÃO GERAL DO SISTEMA

### 1.1 Objetivo
Sistema web completo para gerenciamento e contabilização de doações escolares do Centro de Educação Integral Christ Master, incluindo:
- Registro e controle de doações de produtos
- Gestão de alunos e professores
- Sistema de rifas com sorteios
- Dashboard com métricas e relatórios
- Transparência pública de doações
- Central de ajuda integrada

### 1.2 Público-Alvo
- **Administradores**: Acesso completo ao sistema
- **Usuários/Editores**: Acesso limitado para visualização e registro de doações
- **Público Geral**: Visualização de transparência de doações

### 1.3 Contexto de Uso
- Instituição educacional
- Gestão de recursos e doações comunitárias
- Controle administrativo interno
- Prestação de contas à comunidade

---

## 2. ARQUITETURA TÉCNICA

### 2.1 Stack Tecnológico

#### Frontend
- **Framework**: Next.js 14 (App Router)
- **Linguagem**: TypeScript
- **Estilização**: Tailwind CSS 3.4
- **Biblioteca de Componentes**: Shadcn/ui (Radix UI)
- **Gerenciamento de Estado**: Zustand + React Context
- **Validação**: Zod + React Hook Form
- **Ícones**: Lucide React

#### Backend/Serviços
- **Autenticação**: Firebase Auth (Google OAuth 2.0)
- **Banco de Dados**: Firestore Database (NoSQL)
- **Storage**: Firebase Storage
- **Hospedagem**: Vercel

#### Bibliotecas Auxiliares
- **Gráficos**: Recharts 2.10
- **PDF**: jsPDF + jsPDF-AutoTable + react-pdf
- **Excel**: XLSX 0.18
- **Datas**: date-fns 3.0
- **Markdown**: @uiw/react-md-editor 4.0
- **Comandos**: CMDK 1.1
- **Animações**: tailwindcss-animate

### 2.2 Padrões Arquiteturais
- **Padrão**: Server-Side Rendering (SSR) e Client-Side Rendering (CSR)
- **Estrutura**: Component-Based Architecture
- **Roteamento**: File-based routing (Next.js App Router)
- **Autenticação**: Protected Routes com HOC
- **Formulários**: Controlled Components com React Hook Form

### 2.3 Integrações
- Firebase Authentication
- Firestore Database
- Firebase Storage
- Vercel Analytics (implícito)

---

## 3. ESTRUTURA DE PASTAS E ARQUIVOS

### 3.1 Estrutura Principal

```
sociais-projetos/
├── app/                          # Next.js App Router
│   ├── (public)/                 # Rotas públicas
│   │   ├── ajuda/               # Central de ajuda pública
│   │   ├── pdf-viewer/          # Visualizador de PDF
│   │   └── transparencia/       # Página de transparência
│   ├── auth/                    # Autenticação
│   │   ├── aguardando-aprovacao/
│   │   └── login/
│   ├── dashboard/               # Área administrativa
│   │   ├── ajuda/              # Ajuda interna
│   │   ├── alunos/             # Gestão de alunos
│   │   ├── configuracoes/      # Configurações
│   │   ├── dashboard/          # Dashboard principal
│   │   ├── doacoes/            # Registro de doações
│   │   ├── professores/        # Gestão de professores
│   │   ├── relatorios/         # Relatórios
│   │   ├── rifa/               # Sistema de rifas
│   │   ├── usuarios/           # Gestão de usuários
│   │   └── layout.tsx          # Layout do dashboard
│   ├── help-center/            # Central de ajuda
│   ├── globals.css             # Estilos globais
│   ├── globals-md.css          # Estilos markdown
│   ├── layout.tsx              # Layout raiz
│   ├── manifest.ts             # PWA manifest
│   └── page.tsx                # Página inicial
│
├── components/                  # Componentes React
│   ├── dashboard/              # Componentes do dashboard
│   │   ├── ClassRankingCard.tsx
│   │   ├── Header.tsx
│   │   ├── MetricCard.tsx
│   │   ├── MobileSidebar.tsx
│   │   ├── MonthlyChart.tsx
│   │   └── Sidebar.tsx
│   ├── forms/                  # Formulários
│   │   ├── DonationForm.tsx
│   │   ├── StudentForm.tsx
│   │   ├── TeacherForm.tsx
│   │   └── UserForm.tsx
│   ├── help-center/            # Componentes de ajuda
│   ├── pdf/                    # Componentes PDF
│   ├── rifa/                   # Componentes de rifa
│   │   ├── dashboard.tsx
│   │   ├── filters-bar.tsx
│   │   └── student-drawer.tsx
│   ├── ui/                     # Componentes UI (Shadcn)
│   │   ├── accordion.tsx
│   │   ├── alert-dialog.tsx
│   │   ├── alert.tsx
│   │   ├── avatar.tsx
│   │   ├── badge.tsx
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── checkbox.tsx
│   │   ├── command.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── popover.tsx
│   │   ├── progress.tsx
│   │   ├── select.tsx
│   │   ├── sheet.tsx
│   │   ├── table.tsx
│   │   ├── tabs.tsx
│   │   ├── textarea.tsx
│   │   ├── toast.tsx
│   │   └── toaster.tsx
│   ├── ImportStudentsDialog.tsx
│   ├── ImportTeachersDialog.tsx
│   ├── ProtectedRoute.tsx
│   ├── RemoveDuplicatesDialog.tsx
│   ├── RoleGuard.tsx
│   ├── StudentCombobox.tsx
│   ├── StudentMultiSelect.tsx
│   ├── TeacherCombobox.tsx
│   └── TeacherMultiSelect.tsx
│
├── contexts/                    # Contextos React
│   └── AuthContext.tsx
│
├── hooks/                       # Custom Hooks
│   └── use-toast.ts
│
├── lib/                         # Lógica de negócio
│   ├── firebase/               # Serviços Firebase
│   │   ├── auth.ts
│   │   ├── auditLogs.ts
│   │   ├── config.ts
│   │   ├── contestacoes.ts
│   │   ├── donations.ts
│   │   ├── settings.ts
│   │   ├── students.ts
│   │   ├── teachers.ts
│   │   ├── tickets.ts
│   │   └── users.ts
│   ├── rifa/                   # Lógica de rifas
│   │   ├── data.ts
│   │   ├── hash.ts
│   │   ├── random.ts
│   │   ├── types.ts
│   │   └── utils.ts
│   ├── utils/                  # Utilitários
│   │   ├── dashboard.ts
│   │   ├── excelImport.ts
│   │   └── groupStudents.ts
│   ├── utils.ts                # Utilitários gerais
│   └── validators/             # Validadores Zod
│       └── index.ts
│
├── types/                       # Definições TypeScript
│   └── index.ts
│
├── public/                      # Arquivos estáticos
│
├── .env                         # Variáveis de ambiente (não versionado)
├── .env.example                 # Exemplo de variáveis
├── firestore.rules              # Regras de segurança
├── next.config.js               # Configuração Next.js
├── tailwind.config.ts           # Configuração Tailwind
├── tsconfig.json                # Configuração TypeScript
└── package.json                 # Dependências
```

### 3.2 Arquivos de Configuração Importantes

- **tailwind.config.ts**: Design tokens, cores, espaçamentos
- **globals.css**: Variáveis CSS, tema claro/escuro
- **firestore.rules**: Regras de segurança do banco
- **.env**: Credenciais Firebase e configurações

---

## 4. DESIGN SYSTEM ATUAL

### 4.1 Paleta de Cores

#### Tema Claro (Light Mode)
```css
--background: 0 0% 100%            /* Branco puro */
--foreground: 222.2 84% 4.9%       /* Azul muito escuro (quase preto) */
--primary: 222.2 47.4% 11.2%       /* Azul escuro primário */
--primary-foreground: 210 40% 98%  /* Quase branco */
--secondary: 210 40% 96.1%         /* Azul muito claro */
--muted: 210 40% 96.1%             /* Cinza azulado claro */
--muted-foreground: 215.4 16.3% 46.9% /* Cinza médio */
--accent: 210 40% 96.1%            /* Azul claro para acentos */
--destructive: 0 84.2% 60.2%       /* Vermelho para ações destrutivas */
--border: 214.3 31.8% 91.4%        /* Cinza claro para bordas */
```

#### Tema Escuro (Dark Mode)
```css
--background: 222.2 84% 4.9%       /* Azul muito escuro */
--foreground: 210 40% 98%          /* Quase branco */
--primary: 210 40% 98%             /* Branco para primário */
--secondary: 217.2 32.6% 17.5%     /* Azul escuro secundário */
--muted: 217.2 32.6% 17.5%         /* Azul escuro fosco */
--muted-foreground: 215 20.2% 65.1% /* Cinza azulado claro */
--destructive: 0 62.8% 30.6%       /* Vermelho escuro */
--border: 217.2 32.6% 17.5%        /* Azul escuro para bordas */
```

#### Cores de Gráficos
```css
/* Tema Claro */
--chart-1: 12 76% 61%              /* Laranja */
--chart-2: 173 58% 39%             /* Verde azulado */
--chart-3: 197 37% 24%             /* Azul escuro */
--chart-4: 43 74% 66%              /* Amarelo */
--chart-5: 27 87% 67%              /* Laranja claro */

/* Tema Escuro */
--chart-1: 220 70% 50%             /* Azul */
--chart-2: 160 60% 45%             /* Verde */
--chart-3: 30 80% 55%              /* Laranja */
--chart-4: 280 65% 60%             /* Roxo */
--chart-5: 340 75% 55%             /* Rosa */
```

### 4.2 Tipografia

#### Fonte Principal
- **Família**: Inter (Google Fonts)
- **Pesos**: Regular (400), Medium (500), Semibold (600), Bold (700)
- **Subconjunto**: Latin

#### Hierarquia de Texto
- **H1**: 3xl (1.875rem / 30px) - Bold - Usado em títulos de página
- **H2**: 2xl (1.5rem / 24px) - Semibold - Usado em seções
- **H3**: xl (1.25rem / 20px) - Semibold - Usado em cards
- **Body**: base (1rem / 16px) - Regular - Texto padrão
- **Small**: sm (0.875rem / 14px) - Regular - Texto secundário
- **Tiny**: xs (0.75rem / 12px) - Regular - Labels e hints

### 4.3 Espaçamento

#### Sistema de Espaçamento (baseado em Tailwind)
- **Base**: 4px (0.25rem)
- **Escala**: 0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24, 32, 40, 48, 56, 64

#### Aplicações Comuns
- **Gap entre cards**: 4 (1rem / 16px)
- **Padding de cards**: 6 (1.5rem / 24px)
- **Margem de seções**: 6 (1.5rem / 24px)
- **Gap em grid**: 3-4 (0.75rem - 1rem / 12px - 16px)

### 4.4 Componentes de UI (Shadcn/ui)

#### Componentes Disponíveis
1. **Accordion** - Painéis expansíveis
2. **Alert / Alert Dialog** - Alertas e confirmações
3. **Avatar** - Imagens de perfil
4. **Badge** - Etiquetas e tags
5. **Button** - Botões (variants: default, destructive, outline, secondary, ghost, link)
6. **Card** - Containers de conteúdo
7. **Checkbox** - Caixas de seleção
8. **Command** - Paleta de comandos (Cmd+K)
9. **Dialog** - Modais
10. **Dropdown Menu** - Menus dropdown
11. **Input** - Campos de texto
12. **Label** - Rótulos de formulário
13. **Popover** - Popovers
14. **Progress** - Barras de progresso
15. **Select** - Seletores dropdown
16. **Sheet** - Painéis laterais (mobile)
17. **Table** - Tabelas de dados
18. **Tabs** - Abas de navegação
19. **Textarea** - Campos de texto multilinha
20. **Toast** - Notificações temporárias

#### Estilos de Botões
```tsx
// Variantes disponíveis
<Button variant="default" />      // Azul sólido
<Button variant="destructive" />  // Vermelho sólido
<Button variant="outline" />      // Borda sem preenchimento
<Button variant="secondary" />    // Cinza claro
<Button variant="ghost" />        // Transparente
<Button variant="link" />         // Texto sublinhado

// Tamanhos
<Button size="default" />         // Padrão
<Button size="sm" />              // Pequeno
<Button size="lg" />              // Grande
<Button size="icon" />            // Quadrado para ícones
```

### 4.5 Bordas e Sombras

#### Border Radius
```css
--radius: 0.5rem                  /* 8px - padrão */
lg: var(--radius)                 /* 8px */
md: calc(var(--radius) - 2px)    /* 6px */
sm: calc(var(--radius) - 4px)    /* 4px */
```

#### Sombras (Tailwind padrão)
- **shadow-sm**: Sombra sutil para cards
- **shadow**: Sombra média para elementos elevados
- **shadow-md**: Sombra mais pronunciada
- **shadow-lg**: Sombra grande para modais

### 4.6 Responsividade

#### Breakpoints (Tailwind)
- **sm**: 640px
- **md**: 768px
- **lg**: 1024px
- **xl**: 1280px
- **2xl**: 1536px

#### Estratégia Mobile-First
- Design base para mobile (< 640px)
- Adaptações progressivas para tablets e desktop
- Sidebar lateral no desktop, drawer no mobile
- Grid responsivo (1 coluna mobile, 2-4 colunas desktop)

---

## 5. FUNCIONALIDADES DETALHADAS

### 5.1 Autenticação e Autorização

#### Login
- **Método**: Google OAuth 2.0 via Firebase Auth
- **Fluxo**:
  1. Usuário clica em "Entrar com Google"
  2. Redireciona para autenticação Google
  3. Após login, verifica se email está autorizado
  4. Se autorizado, cria/atualiza registro em `users`
  5. Se não autorizado, redireciona para "aguardando aprovação"

#### Controle de Acesso
- **Admin**: Acesso total (CRUD em todas as entidades)
- **User/Editor**: Acesso limitado (visualização + registro de doações)
- **Public**: Apenas páginas públicas (transparência, ajuda)

#### Protected Routes
- HOC `ProtectedRoute` protege rotas do dashboard
- Verifica autenticação + autorização
- Redireciona para login se não autenticado

### 5.2 Dashboard Principal

#### Métricas Exibidas
1. **Total do Mês**: Soma de itens doados no mês atual
2. **Total do Ano**: Soma de itens doados no ano letivo
3. **Doadores Únicos**: Contagem de alunos/professores que doaram
4. **Meta do Mês**: Progresso em relação à meta mensal

#### Gráfico de Evolução
- **Tipo**: Gráfico de área (AreaChart - Recharts)
- **Dados**: Últimos 12 meses
- **Eixo X**: Meses (abreviados)
- **Eixo Y**: Total de itens doados
- **Cores**: Gradiente azul (chart-1)

#### Ranking de Turmas
- **Exibição**: Top 5 turmas com mais doações
- **Métricas**: Total de itens + número de doadores
- **Ordenação**: Por total decrescente
- **Componente**: ClassRankingCard

### 5.3 Gestão de Alunos

#### Funcionalidades CRUD
- **Create**: Adicionar novo aluno com validação
- **Read**: Listar todos os alunos com filtros
- **Update**: Editar informações do aluno
- **Delete**: Remover aluno (soft delete - status inactive)

#### Campos do Aluno
- Nome completo (obrigatório)
- Email do aluno (opcional)
- Email do responsável (obrigatório)
- Turma (ex: 8A, 9B)
- Série/Ano (ex: 8, 9)
- Turno (Manhã, Tarde, Noite)
- Coordenação
- Número de matrícula
- Status (Ativo/Inativo)

#### Recursos Especiais
- **Importação Excel**: Upload de planilha (.xlsx) com alunos
- **Exportação**: Gerar planilha com lista de alunos
- **Busca**: Filtro por nome, turma, série
- **Combobox**: Seleção rápida com busca (StudentCombobox)
- **Multi-seleção**: Seleção múltipla para doações em grupo

### 5.4 Gestão de Professores

#### Funcionalidades (similar aos alunos)
- CRUD completo
- Importação/Exportação Excel
- Busca e filtros

#### Campos do Professor
- Nome completo
- Email
- Departamento (Matemática, Português, etc.)
- Número de matrícula
- Telefone
- Status

#### Recurso Especial
- **Corpo Docente**: Opção de registrar doação para todos os professores de uma vez

### 5.5 Registro de Doações

#### Fluxo de Registro
1. Selecionar tipo de doador (Aluno ou Professor)
2. Selecionar doador específico (ou múltiplos)
3. Adicionar produtos doados:
   - Tipo de produto (Arroz, Feijão, etc.)
   - Quantidade
   - Unidade (kg, g, un, lt, pacote)
   - Descrição (para produtos "Outros")
4. Definir data da doação
5. Adicionar observações (opcional)
6. Salvar doação

#### Tipos de Produtos
- Arroz
- Feijão
- Macarrão
- Açúcar
- Biscoito
- Leite em pó
- Café
- Higiene (produtos de higiene pessoal)
- Limpeza (produtos de limpeza)
- Outros (com descrição obrigatória)

#### Validações
- Pelo menos um produto
- Quantidade > 0
- Descrição obrigatória para "Outros"
- Data não pode ser futura
- Doador deve estar ativo

#### Atualização Automática
- Incrementa `totalDonations` do aluno/professor
- Registra log de auditoria
- Atualiza métricas do dashboard

### 5.6 Sistema de Rifas

#### Gestão de Campanhas
- **Criar Campanha**:
  - Nome da campanha
  - Descrição (com editor markdown)
  - Data início/fim
  - Meta de bilhetes
  - Status (Ativa/Inativa)

- **Editar Campanha**: Atualizar informações
- **Visualizar**: Cards com detalhes e progresso

#### Registro de Bilhetes
- Vincular bilhetes a alunos
- Gerar números automáticos sequenciais
- Preview de bilhetes gerados
- Quantidade personalizável

#### Sorteios Determinísticos
- **Algoritmo**: Hash-based random (SHA-256)
- **Semente**: Personalizável (para auditoria)
- **Universo**: Todos os bilhetes atribuídos
- **Quantidade de vencedores**: Configurável
- **Registro**: Salva resultado do sorteio

#### Abas do Dashboard de Rifas
1. **Doações**: Doações relacionadas às rifas
2. **Participantes**: Alunos com bilhetes
3. **Bilhetes**: Lista completa de bilhetes
4. **Sorteios**: Executar e visualizar sorteios

#### Filtros
- Por campanha
- Por aluno
- Por turma
- Por status do bilhete
- Por data

### 5.7 Relatórios

#### Tipos de Relatórios
1. **Relatório de Doações**: Lista detalhada de doações
2. **Relatório por Produto**: Agrupado por tipo de produto
3. **Relatório por Turma**: Agrupado por turma
4. **Relatório por Período**: Filtrado por datas

#### Filtros Disponíveis
- Data inicial/final
- Tipo de produto
- Turma
- Coordenação
- Aluno específico
- Professor específico

#### Exportação
- **Formato**: Excel (.xlsx)
- **Conteúdo**: Dados filtrados com colunas personalizadas
- **Biblioteca**: XLSX

#### Métricas do Relatório
- Total de doações (quantidade)
- Total de itens doados
- Resumo por produto (quantidade + unidade)
- Contagem de doações

### 5.8 Configurações

#### Configurações Gerais
- Nome da escola
- Ano letivo
- Meta mensal de itens
- Meta anual de itens

#### Informações do Sistema
- Versão
- Última atualização
- Dados do último admin que modificou

#### Permissões
- Apenas administradores podem acessar

### 5.9 Gestão de Usuários

#### Funcionalidades
- Listar usuários do sistema
- Aprovar/Rejeitar novos usuários
- Alterar role (admin/user)
- Visualizar último login

#### Status de Usuários
- **Pending**: Aguardando aprovação
- **Approved**: Aprovado e ativo
- **Rejected**: Rejeitado

### 5.10 Transparência Pública

#### Página Pública `/transparencia`
- **Acesso**: Sem autenticação
- **Dados**:
  - Total de doações do mês
  - Total de doações do ano
  - Resumo por produto
  - Últimas doações (sem dados pessoais)
- **Objetivo**: Prestação de contas à comunidade

### 5.11 Central de Ajuda

#### Estrutura
- **Barra de busca**: Buscar artigos
- **Navegação lateral**: Categorias de ajuda
- **Artigos**: Guias passo a passo

#### Categorias
1. Visão Geral
2. Dashboard
3. Alunos
4. Doações
5. Relatórios
6. Configurações
7. FAQ

#### Componentes
- HelpSearch
- HelpSidebar
- HelpArticleLayout
- HelpAccordion (para FAQ)
- HelpCallout (para destaques)

---

## 6. FLUXOS DE USUÁRIO

### 6.1 Fluxo de Login

```
1. Usuário acessa /auth/login
2. Clica em "Entrar com Google"
3. Popup do Google OAuth abre
4. Usuário seleciona conta Google
5. Sistema verifica se email está autorizado
   ├─ SIM:
   │  ├─ Cria/atualiza registro em users
   │  ├─ Atualiza lastLogin
   │  └─ Redireciona para /dashboard/dashboard
   └─ NÃO:
      └─ Redireciona para /auth/aguardando-aprovacao
```

### 6.2 Fluxo de Registro de Doação

```
1. Admin acessa /dashboard/doacoes
2. Clica em "Registrar doação"
3. Modal abre
4. Seleciona tipo de doador (Aluno/Professor)
5. Seleciona doador(es) específico(s)
6. Para cada produto:
   ├─ Seleciona tipo de produto
   ├─ Define quantidade
   ├─ Escolhe unidade
   └─ Adiciona descrição (se "Outros")
7. Define data da doação
8. Adiciona observações (opcional)
9. Clica em "Salvar"
10. Sistema valida dados
11. Cria registro em donations
12. Atualiza totalDonations do doador
13. Registra log de auditoria
14. Exibe toast de sucesso
15. Atualiza lista de doações
```

### 6.3 Fluxo de Importação de Alunos

```
1. Admin acessa /dashboard/alunos
2. Clica em "Importar alunos"
3. Dialog abre
4. Faz upload de arquivo Excel (.xlsx)
5. Sistema processa planilha:
   ├─ Valida formato
   ├─ Valida colunas obrigatórias
   ├─ Mapeia dados
   └─ Detecta duplicatas
6. Exibe preview dos dados
7. Admin confirma importação
8. Sistema cria/atualiza alunos em lote
9. Exibe resumo (criados, atualizados, erros)
10. Atualiza lista de alunos
```

### 6.4 Fluxo de Sorteio de Rifa

```
1. Admin acessa /dashboard/rifa
2. Navega para aba "Sorteios"
3. Seleciona campanha ativa
4. Define semente (opcional, gera automática)
5. Define quantidade de vencedores
6. Clica em "Sortear rifa"
7. Sistema:
   ├─ Busca bilhetes elegíveis (status: assigned)
   ├─ Aplica algoritmo determinístico (SHA-256 + semente)
   ├─ Seleciona vencedores
   ├─ Atualiza status dos bilhetes para "drawn"
   ├─ Registra sorteio em draws
   └─ Registra log de auditoria
8. Exibe resultado do sorteio
9. Atualiza lista de sorteios
```

### 6.5 Fluxo de Geração de Relatório

```
1. Usuário acessa /dashboard/relatorios
2. Define filtros:
   ├─ Data inicial/final
   ├─ Produto (opcional)
   ├─ Turma (opcional)
   └─ Coordenação (opcional)
3. Clica em "Aplicar filtros"
4. Sistema busca doações filtradas
5. Exibe tabela com resultados
6. Exibe métricas (total itens, doações, resumo)
7. Usuário clica em "Exportar Excel"
8. Sistema gera planilha:
   ├─ Cria worksheet
   ├─ Adiciona cabeçalhos
   ├─ Preenche dados
   └─ Formata colunas
9. Download inicia automaticamente
```

---

## 7. MODELOS DE DADOS

### 7.1 Coleção: `students`

```typescript
interface Student {
  id: string;                    // UUID gerado pelo Firestore
  fullName: string;              // Nome completo do aluno
  email?: string;                // Email do aluno (opcional)
  parentEmail: string;           // Email do responsável
  class: string;                 // Turma (ex: "8A", "9B")
  grade: number;                 // Série/Ano (ex: 8, 9)
  shift?: string;                // Turno (Manhã/Tarde/Noite)
  coordination?: string;         // Coordenação
  registrationNumber?: string;   // Número de matrícula
  status: "active" | "inactive"; // Status
  totalDonations: number;        // Total de itens doados
  createdAt: Timestamp;          // Data de criação
  updatedAt: Timestamp;          // Última atualização
}
```

**Índices:**
- `status` (ASC)
- `class` (ASC)
- `totalDonations` (DESC)

### 7.2 Coleção: `teachers`

```typescript
interface Teacher {
  id: string;                    // UUID gerado pelo Firestore
  fullName: string;              // Nome completo
  email: string;                 // Email
  department?: string;           // Departamento
  registrationNumber?: string;   // Matrícula
  phone?: string;                // Telefone
  status: "active" | "inactive"; // Status
  totalDonations: number;        // Total de itens doados
  createdAt: Timestamp;          // Data de criação
  updatedAt: Timestamp;          // Última atualização
}
```

**Índices:**
- `status` (ASC)
- `department` (ASC)

### 7.3 Coleção: `donations`

```typescript
interface Donation {
  id: string;                    // UUID
  donorType: "student" | "teacher"; // Tipo de doador
  studentId?: string;            // ID do aluno (se student)
  studentIds?: string[];         // IDs múltiplos (seleção múltipla)
  teacherId?: string;            // ID do professor (se teacher)
  teacherIds?: string[];         // IDs múltiplos
  donorName?: string;            // Nome (desnormalizado)
  studentClass?: string;         // Turma (desnormalizado)
  studentGrade?: string;         // Série (desnormalizado)
  teacherDepartment?: string;    // Departamento (desnormalizado)
  isCorpoDocente?: boolean;      // true se todos professores
  isMultipleStudents?: boolean;  // true se múltiplos alunos

  products: ProductDonation[];   // Array de produtos
  date: Timestamp;               // Data da doação
  receiptUrl?: string;           // URL do comprovante
  notes?: string;                // Observações

  registeredBy: string;          // ID do admin
  registeredByName?: string;     // Nome (desnormalizado)
  createdAt: Timestamp;          // Criação
  updatedAt?: Timestamp;         // Atualização
  updatedBy?: string;            // ID do atualizador
  updatedByName?: string;        // Nome (desnormalizado)
}

interface ProductDonation {
  product: ProductType;          // Tipo do produto
  quantity: number;              // Quantidade
  unit: "kg" | "g" | "un" | "lt" | "pacote"; // Unidade
  description?: string;          // Descrição (obrigatória para "Outros")
}
```

**Índices:**
- `date` (DESC)
- `donorType` (ASC)
- `studentId` (ASC), `date` (DESC)
- `teacherId` (ASC), `date` (DESC)

### 7.4 Coleção: `users`

```typescript
interface User {
  id: string;                    // UID do Firebase Auth
  email: string;                 // Email
  name: string;                  // Nome exibição
  role: "admin" | "user";        // Papel
  status: "pending" | "approved" | "rejected"; // Status
  photoURL?: string;             // Foto de perfil (do Google)
  lastLogin: Timestamp;          // Último acesso
  createdAt: Timestamp;          // Criação
}
```

**Índices:**
- `email` (ASC)
- `status` (ASC)
- `role` (ASC)

### 7.5 Coleção: `settings`

```typescript
interface Settings {
  id: "general";                 // ID fixo
  schoolName: string;            // Nome da escola
  monthlyGoal: number;           // Meta mensal (itens)
  yearlyGoal: number;            // Meta anual (itens)
  academicYear: string;          // Ano letivo (ex: "2024")
  updatedAt: Timestamp;          // Última atualização
  updatedBy: string;             // ID do admin
}
```

**Documento único:** `settings/general`

### 7.6 Coleção: `raffle_campaigns`

```typescript
interface RaffleCampaign {
  id: string;                    // UUID
  name: string;                  // Nome da campanha
  description?: string;          // Descrição (markdown)
  startDate: Timestamp;          // Data início
  endDate: Timestamp;            // Data fim
  status: "active" | "inactive"; // Status
  ticketGoal?: number;           // Meta de bilhetes
  ticketsDrawn?: number;         // Bilhetes sorteados
  createdAt: Timestamp;          // Criação
  updatedAt: Timestamp;          // Atualização
  createdBy: string;             // ID do criador
  createdByName?: string;        // Nome (desnormalizado)
}
```

### 7.7 Coleção: `raffle_tickets`

```typescript
interface RaffleTicket {
  id: string;                    // UUID
  campaignId: string;            // ID da campanha
  ticketNumber: number;          // Número do bilhete
  status: "available" | "assigned" | "drawn"; // Status
  studentId?: string;            // ID do aluno (se assigned/drawn)
  studentName?: string;          // Nome (desnormalizado)
  studentClass?: string;         // Turma (desnormalizado)
  studentGrade?: string;         // Série (desnormalizado)
  createdAt: Timestamp;          // Criação
  assignedAt?: Timestamp;        // Atribuição
  drawnAt?: Timestamp;           // Sorteio
}
```

**Índices:**
- `campaignId` (ASC), `ticketNumber` (ASC)
- `campaignId` (ASC), `status` (ASC)
- `studentId` (ASC)

### 7.8 Coleção: `raffle_draws`

```typescript
interface RaffleDrawResult {
  id: string;                    // UUID
  campaignId: string;            // ID da campanha
  ticketId: string;              // ID do bilhete vencedor
  ticketNumber: number;          // Número (desnormalizado)
  studentId?: string;            // ID do aluno
  studentName?: string;          // Nome (desnormalizado)
  seed: string;                  // Semente usada
  createdAt: Timestamp;          // Data do sorteio
  performedBy: string;           // ID do admin
  performedByName?: string;      // Nome (desnormalizado)
}
```

**Índices:**
- `campaignId` (ASC), `createdAt` (DESC)

### 7.9 Coleção: `audit_logs`

```typescript
interface AuditLog {
  id: string;                    // UUID
  action: string;                // Ação (create, update, delete, etc.)
  entity: string;                // Entidade (students, donations, etc.)
  entityId?: string;             // ID da entidade afetada
  timestamp: Timestamp;          // Data/hora
  performedBy?: string;          // ID do usuário
  performedByName?: string;      // Nome (desnormalizado)
  details?: string;              // Detalhes adicionais (JSON)
  sensitive?: boolean;           // Dados sensíveis?
}
```

**Índices:**
- `timestamp` (DESC)
- `entity` (ASC), `timestamp` (DESC)
- `performedBy` (ASC), `timestamp` (DESC)

---

## 8. COMPONENTES UI

### 8.1 Componentes de Layout

#### Sidebar (Desktop)
- **Localização**: `components/dashboard/Sidebar.tsx`
- **Aparência**: Fixa à esquerda, altura 100vh
- **Largura**: 256px (w-64)
- **Background**: Card
- **Itens**:
  - Logo/Nome da escola (topo)
  - Menu de navegação
  - Botão de logout (rodapé)

#### Header (Mobile/Desktop)
- **Localização**: `components/dashboard/Header.tsx`
- **Aparência**: Fixa ao topo
- **Conteúdo**:
  - Botão menu (mobile)
  - Título da página atual
  - Avatar do usuário + dropdown

#### MobileSidebar
- **Localização**: `components/dashboard/MobileSidebar.tsx`
- **Tipo**: Sheet (painel lateral)
- **Ativação**: Botão hamburger no header
- **Conteúdo**: Mesmo do Sidebar desktop

### 8.2 Componentes de Dados

#### MetricCard
- **Localização**: `components/dashboard/MetricCard.tsx`
- **Uso**: Exibir métricas no dashboard
- **Props**:
  - `title`: Título do card
  - `value`: Valor principal
  - `description`: Descrição/subtítulo
  - `icon`: Ícone (Lucide React)
  - `trend`: Opcional - tendência (+/-)

#### MonthlyChart
- **Localização**: `components/dashboard/MonthlyChart.tsx`
- **Tipo**: AreaChart (Recharts)
- **Dados**: Array de {month, total}
- **Cores**: Gradiente chart-1
- **Responsivo**: Sim

#### ClassRankingCard
- **Localização**: `components/dashboard/ClassRankingCard.tsx`
- **Uso**: Ranking de turmas
- **Exibição**: Lista ordenada (top 5)
- **Dados**: {class, totalDonated, donorCount}

### 8.3 Componentes de Formulário

#### DonationForm
- **Localização**: `components/forms/DonationForm.tsx`
- **Validação**: React Hook Form + Zod
- **Campos**:
  - Tipo de doador (radio)
  - Seleção de doador (combobox/multiselect)
  - Produtos (array dinâmico)
  - Data
  - Observações

#### StudentForm
- **Localização**: `components/forms/StudentForm.tsx`
- **Validação**: React Hook Form + Zod
- **Campos**: Todos os campos do Student
- **Modo**: Create ou Edit

#### TeacherForm
- **Localização**: `components/forms/TeacherForm.tsx`
- **Similar ao StudentForm**

#### UserForm
- **Localização**: `components/forms/UserForm.tsx`
- **Uso**: Adicionar/editar usuários
- **Campos**: Email, nome, role

### 8.4 Componentes Especializados

#### StudentCombobox
- **Localização**: `components/StudentCombobox.tsx`
- **Tipo**: Command component (Shadcn)
- **Funcionalidades**:
  - Busca em tempo real
  - Filtragem por nome/turma
  - Seleção única
  - Exibição: Nome + Turma

#### StudentMultiSelect
- **Localização**: `components/StudentMultiSelect.tsx`
- **Similar ao Combobox, mas seleção múltipla**
- **Exibição**: Badges dos selecionados

#### TeacherCombobox / TeacherMultiSelect
- **Similar aos de Student**

#### ImportStudentsDialog
- **Localização**: `components/ImportStudentsDialog.tsx`
- **Funcionalidades**:
  - Upload de arquivo Excel
  - Preview de dados
  - Validação de formato
  - Importação em lote

#### RemoveDuplicatesDialog
- **Localização**: `components/RemoveDuplicatesDialog.tsx`
- **Uso**: Detectar e remover alunos duplicados
- **Critérios**: Email, nome + turma

### 8.5 Componentes de Rifa

#### RifaDashboard
- **Localização**: `components/rifa/dashboard.tsx`
- **Complexidade**: Alto (1700+ linhas)
- **Funcionalidades**:
  - Gestão de campanhas
  - Registro de bilhetes
  - Execução de sorteios
  - Visualização de dados
  - Filtros avançados

#### FiltersBar
- **Localização**: `components/rifa/filters-bar.tsx`
- **Campos**:
  - Aluno (busca)
  - Turma (busca)
  - Status do bilhete
  - Número do bilhete
  - Data início/fim

#### StudentDrawer
- **Localização**: `components/rifa/student-drawer.tsx`
- **Tipo**: Sheet (painel lateral)
- **Conteúdo**:
  - Dados do aluno
  - Bilhetes do aluno
  - Timeline de eventos

---

## 9. PÁGINAS E ROTAS

### 9.1 Rotas Públicas

#### `/` (Home)
- **Descrição**: Landing page
- **Conteúdo**: Apresentação do sistema
- **Acesso**: Público

#### `/auth/login`
- **Descrição**: Página de login
- **Funcionalidade**: Login com Google
- **Redirecionamento**:
  - Se autenticado → `/dashboard/dashboard`
  - Se não autorizado → `/auth/aguardando-aprovacao`

#### `/auth/aguardando-aprovacao`
- **Descrição**: Página de espera
- **Conteúdo**: Mensagem informando que conta está pendente
- **Ação**: Aguardar aprovação de admin

#### `/transparencia`
- **Descrição**: Transparência de doações
- **Acesso**: Público (sem login)
- **Conteúdo**:
  - Métricas gerais
  - Resumo por produto
  - Últimas doações (anônimas)

#### `/ajuda` ou `/help-center`
- **Descrição**: Central de ajuda pública
- **Conteúdo**: Artigos de ajuda
- **Navegação**: Sidebar + busca

#### `/pdf-viewer`
- **Descrição**: Visualizador de PDF
- **Uso**: Visualizar relatórios em PDF

### 9.2 Rotas do Dashboard (Protegidas)

#### `/dashboard/dashboard`
- **Descrição**: Dashboard principal
- **Acesso**: Admin + User
- **Conteúdo**:
  - Cards de métricas
  - Gráfico mensal
  - Ranking de turmas

#### `/dashboard/alunos`
- **Descrição**: Gestão de alunos
- **Acesso**: Admin apenas
- **Funcionalidades**:
  - Listar alunos
  - Adicionar aluno
  - Editar aluno
  - Deletar aluno
  - Importar Excel
  - Exportar Excel
  - Busca e filtros

#### `/dashboard/professores`
- **Descrição**: Gestão de professores
- **Acesso**: Admin apenas
- **Similar a alunos**

#### `/dashboard/doacoes`
- **Descrição**: Registro de doações
- **Acesso**: Admin + User
- **Funcionalidades**:
  - Listar doações
  - Registrar nova doação
  - Editar doação
  - Deletar doação
  - Visualizar detalhes
  - Filtros

#### `/dashboard/rifa`
- **Descrição**: Sistema de rifas
- **Acesso**: Admin + User
- **Funcionalidades**:
  - Gestão de campanhas
  - Registro de bilhetes
  - Sorteios
  - Relatórios de rifas
- **Abas**:
  1. Doações
  2. Participantes
  3. Bilhetes
  4. Sorteios

#### `/dashboard/relatorios`
- **Descrição**: Relatórios e análises
- **Acesso**: Admin + User
- **Funcionalidades**:
  - Filtros avançados
  - Visualização de dados
  - Exportação Excel
  - Métricas agregadas

#### `/dashboard/usuarios`
- **Descrição**: Gestão de usuários
- **Acesso**: Admin apenas
- **Funcionalidades**:
  - Listar usuários
  - Aprovar/Rejeitar
  - Alterar role
  - Visualizar último login

#### `/dashboard/configuracoes`
- **Descrição**: Configurações do sistema
- **Acesso**: Admin apenas
- **Configurações**:
  - Nome da escola
  - Ano letivo
  - Metas (mensal/anual)

#### `/dashboard/ajuda`
- **Descrição**: Ajuda interna
- **Acesso**: Admin + User
- **Conteúdo**: Guias e tutoriais

---

## 10. ESTADO ATUAL DO DESIGN

### 10.1 Pontos Fortes

#### ✅ Consistência
- Design system bem definido (Shadcn/ui)
- Paleta de cores coerente
- Espaçamento uniforme
- Tipografia padronizada

#### ✅ Acessibilidade
- Contraste adequado (WCAG AA)
- Navegação por teclado
- Labels semânticos
- ARIA labels em componentes

#### ✅ Responsividade
- Mobile-first approach
- Breakpoints bem definidos
- Sidebar → Drawer em mobile
- Grid responsivo

#### ✅ Funcionalidade
- Todas as funcionalidades core implementadas
- Validações robustas
- Feedback visual (toasts, loading states)
- Ações com confirmação

### 10.2 Pontos de Melhoria

#### ⚠️ Densidade Visual
- **Problema**: Muito espaço em branco em algumas telas
- **Impacto**: Subutilização de espaço, especialmente em desktop
- **Exemplo**: Dashboard tem apenas 4 cards + 1 gráfico

#### ⚠️ Hierarquia Visual
- **Problema**: Falta hierarquia clara em alguns contextos
- **Impacto**: Dificuldade em identificar elementos importantes
- **Exemplo**: Botões primários vs. secundários nem sempre distintos

#### ⚠️ Uso de Cores
- **Problema**: Paleta muito neutra (azul escuro + cinza)
- **Impacto**: Falta de personalidade e energia
- **Exemplo**: Dashboard parece corporativo demais para escola

#### ⚠️ Ícones e Ilustrações
- **Problema**: Uso limitado de ícones, nenhuma ilustração
- **Impacto**: Visual árido, pouco engajamento
- **Exemplo**: Estados vazios sem ilustração

#### ⚠️ Feedback Visual
- **Problema**: Loading states genéricos
- **Impacto**: Falta de polimento
- **Exemplo**: Spinners simples sem skeleton screens

#### ⚠️ Micro-interações
- **Problema**: Animações mínimas
- **Impacto**: Sensação de estaticidade
- **Exemplo**: Transições abruptas entre estados

#### ⚠️ Tabelas Densas
- **Problema**: Tabelas muito compactas, difícil escaneamento
- **Impacto**: Fadiga visual em listas longas
- **Exemplo**: Lista de doações com muitas colunas

#### ⚠️ Navegação
- **Problema**: Menu lateral simples, sem agrupamento
- **Impacto**: Confuso com muitos itens
- **Exemplo**: 9 itens no menu sem categorização

---

## 11. OPORTUNIDADES DE MELHORIA

### 11.1 Design Visual

#### Paleta de Cores
- **Ação**: Introduzir cores mais vibrantes e acolhedoras
- **Sugestões**:
  - Primária: Azul mais vivo (ex: #3B82F6)
  - Secundária: Verde para sucesso/metas (ex: #10B981)
  - Acento: Laranja/Amarelo para destaque (ex: #F59E0B)
  - Gradientes sutis em cards importantes

#### Tipografia
- **Ação**: Adicionar variação e hierarquia
- **Sugestões**:
  - Títulos mais bold e maiores
  - Subtítulos com cor secundária
  - Maior line-height para legibilidade

#### Espaçamento
- **Ação**: Aumentar densidade em algumas áreas
- **Sugestões**:
  - Reduzir padding em cards de métricas
  - Adicionar mais informações no dashboard
  - Compactar tabelas sem perder legibilidade

### 11.2 Componentes

#### Cards
- **Ação**: Adicionar variações visuais
- **Sugestões**:
  - Cards com borda colorida (top border)
  - Sombras mais pronunciadas em hover
  - Backgrounds sutilmente coloridos para tipos diferentes

#### Botões
- **Ação**: Criar hierarquia clara
- **Sugestões**:
  - Primary: Sólido, cor vibrante
  - Secondary: Outline, menos destaque
  - Tertiary: Ghost, mínimo destaque
  - Tamanhos mais generosos (mais padding)

#### Tabelas
- **Ação**: Melhorar escaneamento visual
- **Sugestões**:
  - Zebra striping (linhas alternadas)
  - Hover state mais evidente
  - Headers sticky ao fazer scroll
  - Maior espaçamento vertical entre linhas

#### Estados Vazios
- **Ação**: Adicionar ilustrações e CTAs
- **Sugestões**:
  - Ilustrações SVG (undraw.co, unDraw, etc.)
  - Texto explicativo amigável
  - CTA claro para primeira ação

### 11.3 Funcionalidades

#### Dashboard
- **Ação**: Enriquecer com mais dados
- **Sugestões**:
  - Adicionar card de "Produto Mais Doado"
  - Adicionar card de "Doador do Mês"
  - Mini-gráfico de tendência em cada métrica
  - Comparação com mês anterior

#### Filtros
- **Ação**: Unificar e melhorar UX
- **Sugestões**:
  - Barra de filtros persistente
  - Filtros salvos (favoritos)
  - Quick filters (atalhos)
  - Contador de filtros ativos

#### Busca Global
- **Ação**: Implementar busca universal
- **Sugestões**:
  - Command palette (Cmd+K)
  - Buscar em alunos, doações, etc.
  - Ações rápidas via comando

### 11.4 Experiência do Usuário

#### Onboarding
- **Ação**: Guiar novos usuários
- **Sugestões**:
  - Tour guiado no primeiro acesso
  - Tooltips contextuais
  - Checklist de configuração inicial

#### Atalhos de Teclado
- **Ação**: Adicionar shortcuts
- **Sugestões**:
  - N: Nova doação
  - S: Buscar
  - ?: Ajuda/Atalhos
  - Escape: Fechar modais

#### Feedback Visual
- **Ação**: Aprimorar loading states
- **Sugestões**:
  - Skeleton screens em vez de spinners
  - Progress bars para ações longas
  - Animações de sucesso mais elaboradas

#### Acessibilidade
- **Ação**: Melhorar ainda mais
- **Sugestões**:
  - Focus visible mais claro
  - Anúncios de screen reader
  - Navegação completa por teclado
  - Modo de alto contraste

### 11.5 Mobile

#### Otimizações Mobile
- **Ação**: Melhorar experiência touch
- **Sugestões**:
  - Aumentar tap targets (mínimo 44x44px)
  - Gestos de swipe (deletar, arquivar)
  - Bottom sheets em vez de modais
  - Input types corretos (number, email, etc.)

#### PWA
- **Ação**: Transformar em Progressive Web App
- **Sugestões**:
  - Ícones e manifest configurados (já feito)
  - Service Worker para cache
  - Notificações push (opcional)
  - Instalável na home screen

### 11.6 Visualização de Dados

#### Gráficos
- **Ação**: Expandir opções de visualização
- **Sugestões**:
  - Adicionar gráfico de pizza (produtos)
  - Adicionar gráfico de barras (turmas)
  - Heatmap de doações (dia/mês)
  - Timeline interativa

#### Relatórios
- **Ação**: Tornar mais visuais
- **Sugestões**:
  - Preview antes de exportar
  - Opção de exportar como PDF
  - Gráficos incluídos nos relatórios
  - Relatórios customizáveis (escolher colunas)

### 11.7 Gamificação

#### Engajamento
- **Ação**: Adicionar elementos lúdicos
- **Sugestões**:
  - Badges para alunos (doador frequente, etc.)
  - Placar de turmas (friendly competition)
  - Metas visuais com progresso animado
  - Celebrações ao atingir metas

---

## 12. CONSIDERAÇÕES FINAIS PARA IA GENERATIVA

### 12.1 Contexto do Redesign

Este sistema é utilizado em uma **escola** (Centro de Educação Integral Christ Master), portanto o design deve:

1. **Ser Acolhedor**: Não corporativo demais, com cores que inspirem comunidade
2. **Ser Claro**: Usuários podem não ser técnicos, interface deve ser intuitiva
3. **Celebrar Conquistas**: Doações são um ato positivo, design deve refletir isso
4. **Ter Personalidade**: Representar os valores da instituição (educação, solidariedade)

### 12.2 Público-Alvo do Design

- **Administradores da escola**: Uso diário, precisam de eficiência
- **Secretaria/Staff**: Uso frequente, precisam de facilidade
- **Visualizadores**: Acesso ocasional, precisam de clareza

### 12.3 Objetivos do Redesign

1. **Modernizar** a aparência, saindo do "básico Shadcn"
2. **Adicionar personalidade** com cores, ilustrações, animações
3. **Melhorar hierarquia visual** para melhor escaneamento
4. **Otimizar densidade** para aproveitar melhor o espaço
5. **Enriquecer feedback** com animações e micro-interações
6. **Manter acessibilidade** e responsividade

### 12.4 Restrições Técnicas

- **Manter Tailwind CSS**: Sistema já implementado
- **Manter Shadcn/ui**: Componentes base funcionam bem
- **Manter Next.js**: Framework não deve mudar
- **Firestore**: Estrutura de dados já definida

### 12.5 Áreas de Foco Prioritário

1. **Dashboard** (mais importante)
2. **Formulário de Doações** (uso frequente)
3. **Tabelas e Listas** (muitos dados)
4. **Estados Vazios** (primeira impressão)
5. **Mobile** (crescente uso)

---

## 📊 MÉTRICAS DO SISTEMA

### Linhas de Código
- **Total**: ~15.000 linhas (estimado)
- **TypeScript**: ~90%
- **Componentes React**: 50+
- **Páginas**: 15+

### Componentes UI
- **Shadcn/ui**: 20+ componentes
- **Custom**: 30+ componentes
- **Formulários**: 4 principais

### Coleções Firestore
- **Total**: 9 coleções
- **Documentos**: Variável (crescimento orgânico)

### Usuários
- **Administradores**: Variável
- **Usuários**: Variável
- **Públicos**: Ilimitado (transparência)

---

## 🎨 ASSETS E RECURSOS

### Ícones
- **Biblioteca**: Lucide React
- **Quantidade**: 30+ ícones diferentes
- **Estilo**: Outline, stroke-width 2

### Fontes
- **Principal**: Inter (Google Fonts)
- **Fallback**: System fonts

### Imagens/Ilustrações
- **Atual**: Nenhuma
- **Sugestão**: Adicionar em estados vazios

---

## 🔐 SEGURANÇA E PRIVACIDADE

### Autenticação
- Firebase Auth (Google OAuth 2.0)
- Email whitelist

### Autorização
- Role-based (admin/user)
- Protected routes

### Dados Sensíveis
- Emails apenas para admins
- Dados de doações anonimizados na transparência
- Logs de auditoria

### Firestore Rules
- Leitura: Apenas autenticados
- Escrita: Apenas admins/editors
- Logs: Imutáveis

---

## 📱 PWA E MOBILE

### Progressive Web App
- Manifest configurado
- Ícones gerados (192x192, 512x512)
- Instalável
- Service Worker: Não implementado ainda

### Responsividade
- Mobile-first
- Breakpoints Tailwind
- Touch-friendly (em progresso)

---

## 🚀 PERFORMANCE

### Otimizações Atuais
- Server-side rendering (Next.js)
- Image optimization (Next.js)
- Code splitting automático
- Lazy loading de componentes pesados

### Oportunidades
- Implementar Virtualization em tabelas longas
- Adicionar Infinite scroll
- Otimizar queries do Firestore (índices)
- Cache de dados com SWR/React Query

---

Este documento contém todas as informações necessárias para uma IA generativa criar um prompt de redesign completo e contextualizado do sistema.
