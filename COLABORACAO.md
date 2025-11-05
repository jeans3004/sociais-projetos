# Guia de Colaboração - Sistema de Doações Escolares

Este guia explica como configurar o desenvolvimento colaborativo com Git, GitHub e Vercel.

## 📋 Índice

1. [Configuração Inicial](#configuração-inicial)
2. [Adicionar Colaboradores no GitHub](#adicionar-colaboradores-no-github)
3. [Conectar Vercel ao GitHub](#conectar-vercel-ao-github)
4. [Fluxo de Trabalho](#fluxo-de-trabalho)
5. [Branches e Deploys](#branches-e-deploys)
6. [Boas Práticas](#boas-práticas)

---

## 🚀 Configuração Inicial

### Repositório GitHub

**URL do Repositório:** https://github.com/jeans3004/sociais-projetos

**Branches:**
- `main` - Branch principal (produção)
- `develop` - Branch de desenvolvimento (recomendado criar)
- `feature/*` - Branches de features individuais

---

## 👥 Adicionar Colaboradores no GitHub

### Passo 1: Acessar Configurações do Repositório

1. Acesse: https://github.com/jeans3004/sociais-projetos
2. Clique em **Settings** (Configurações)
3. No menu lateral, clique em **Collaborators and teams**

### Passo 2: Convidar Colaboradores

1. Clique no botão **Add people** (Adicionar pessoas)
2. Digite o **username** ou **email** do colaborador no GitHub
3. Selecione o nível de permissão:
   - **Read** - Apenas visualização
   - **Write** - Pode fazer push, criar branches, abrir PRs
   - **Admin** - Acesso total ao repositório

4. Clique em **Add [username] to this repository**
5. O colaborador receberá um convite por email

### Passo 3: Colaborador Aceita o Convite

O colaborador deve:
1. Acessar o email de convite
2. Clicar em **Accept invitation**
3. Clonar o repositório:

```bash
git clone git@github.com:jeans3004/sociais-projetos.git
cd sociais-projetos
```

---

## ⚡ Conectar Vercel ao GitHub

### Configuração de Deploy Automático

O Vercel já está conectado ao repositório GitHub! Para verificar ou reconfigurar:

1. **Acessar Painel do Vercel:**
   - URL: https://vercel.com/jean-machados-projects-45710c3a/projetos-sociais-cm

2. **Verificar Integração com GitHub:**
   - No painel do projeto, vá em **Settings** > **Git**
   - Confirme que está conectado a: `jeans3004/sociais-projetos`

3. **Configurar Deploys Automáticos:**
   - **Production Branch:** `main` ✅
   - **Preview Deployments:** Todas as branches e Pull Requests
   - **Automatic Deployments:** Habilitado ✅

### Como Funciona

```
┌─────────────────────────────────────────────────────────┐
│  Developer push → GitHub → Vercel → Deploy Automático  │
└─────────────────────────────────────────────────────────┘

Push para main          → Deploy em PRODUÇÃO (projetos-sociais-cm.vercel.app)
Push para outras branches → Deploy de PREVIEW (URL temporária única)
Abrir Pull Request       → Deploy de PREVIEW + Comentário no PR
```

---

## 🔄 Fluxo de Trabalho

### Para o Colaborador: Trabalhar em uma Nova Feature

```bash
# 1. Atualizar o repositório local
git checkout main
git pull origin main

# 2. Criar uma nova branch para a feature
git checkout -b feature/nome-da-feature

# 3. Fazer alterações e commits
git add .
git commit -m "feat: descrição da alteração"

# 4. Fazer push da branch
git push origin feature/nome-da-feature

# 5. Abrir Pull Request no GitHub
# - Acesse: https://github.com/jeans3004/sociais-projetos
# - Clique em "Compare & pull request"
# - Preencha descrição e aguarde review
```

### Para o Administrador: Revisar e Fazer Merge

```bash
# 1. Revisar o Pull Request no GitHub
# - Acesse: https://github.com/jeans3004/sociais-projetos/pulls
# - Revise as alterações
# - Teste o deploy de preview (Vercel comenta automaticamente no PR)

# 2. Fazer merge via GitHub
# - Clique em "Merge pull request"
# - Confirme o merge
# - Delete a branch após o merge

# 3. Atualizar repositório local
git checkout main
git pull origin main
```

---

## 🌿 Branches e Deploys

### Estrutura de Branches Recomendada

```
main (produção)
├── develop (desenvolvimento)
│   ├── feature/adicionar-relatorios
│   ├── feature/melhorar-dashboard
│   └── feature/sistema-rifas
└── hotfix/corrigir-bug-urgente
```

### Tipos de Deploys no Vercel

| Branch/Ação | Tipo de Deploy | URL |
|-------------|----------------|-----|
| Push para `main` | 🟢 **PRODUÇÃO** | https://projetos-sociais-cm.vercel.app |
| Push para outras branches | 🔵 **PREVIEW** | https://projetos-sociais-[hash].vercel.app |
| Pull Request aberto | 🔵 **PREVIEW** | URL única + comentário automático no PR |

### Criar Branch de Desenvolvimento

```bash
# No repositório local
git checkout -b develop
git push origin develop

# Configurar develop como branch padrão para PRs (opcional)
# Settings → Branches → Default branch → Change to develop
```

---

## ✅ Boas Práticas

### 1. Commits Semânticos

Use prefixos padronizados nos commits:

```bash
feat: nova funcionalidade
fix: correção de bug
docs: documentação
style: formatação (sem mudança de código)
refactor: refatoração
test: adicionar testes
chore: tarefas de manutenção
```

**Exemplos:**
```bash
git commit -m "feat: adicionar relatório de doações mensal"
git commit -m "fix: corrigir cálculo de totais no dashboard"
git commit -m "docs: atualizar README com instruções de deploy"
```

### 2. Sempre Testar Localmente Antes de Push

```bash
# Antes de fazer push, teste localmente:
npm run build  # Verificar se compila
npm run dev    # Testar funcionamento
```

### 3. Manter Branches Atualizadas

```bash
# Sempre atualize sua branch antes de começar a trabalhar
git checkout main
git pull origin main
git checkout feature/sua-feature
git merge main  # Ou: git rebase main
```

### 4. Usar Pull Requests para Todas as Alterações

- **Nunca** faça push direto para `main`
- Sempre crie um Pull Request
- Aguarde review antes do merge
- Use os deploys de preview para testar

### 5. Proteger a Branch Main

Configure proteções no GitHub:

1. Acesse: **Settings** > **Branches** > **Add rule**
2. Branch name pattern: `main`
3. Habilite:
   - ✅ Require pull request before merging
   - ✅ Require status checks to pass (Vercel)
   - ✅ Require branches to be up to date

---

## 🔐 Variáveis de Ambiente

As variáveis de ambiente estão configuradas no Vercel. Para desenvolvimento local:

```bash
# 1. Baixar variáveis de ambiente do Vercel
npx vercel env pull

# Ou copiar do .env.example
cp .env.example .env
# Editar .env com as credenciais corretas
```

**⚠️ IMPORTANTE:**
- Nunca commitar `.env` no Git
- `.env` já está no `.gitignore`
- Variáveis de produção devem ser configuradas no Vercel

---

## 🆘 Comandos Úteis

### Ver status do repositório
```bash
git status
git branch -a  # Ver todas as branches
```

### Atualizar do remoto
```bash
git fetch origin
git pull origin main
```

### Resolver conflitos
```bash
# Se houver conflitos ao fazer pull/merge:
git status  # Ver arquivos com conflito
# Editar arquivos manualmente
git add .
git commit -m "fix: resolver conflitos de merge"
```

### Desfazer alterações locais
```bash
git restore arquivo.ts  # Desfazer um arquivo
git restore .           # Desfazer tudo
```

### Ver histórico
```bash
git log --oneline --graph --all
```

---

## 📞 Suporte

**Repositório GitHub:** https://github.com/jeans3004/sociais-projetos

**Projeto Vercel:** https://vercel.com/jean-machados-projects-45710c3a/projetos-sociais-cm

**Site em Produção:** https://projetos-sociais-cm.vercel.app

---

## 🎯 Checklist para Novos Colaboradores

- [ ] Aceitar convite do repositório GitHub
- [ ] Clonar repositório localmente
- [ ] Instalar dependências (`npm install`)
- [ ] Configurar `.env` para desenvolvimento local
- [ ] Criar branch de feature
- [ ] Fazer primeiro commit
- [ ] Abrir primeiro Pull Request
- [ ] Verificar deploy de preview no Vercel

---

**Última atualização:** Janeiro 2025
**Autor:** Jean Machado (jeanmachado@christmaster.com.br)
