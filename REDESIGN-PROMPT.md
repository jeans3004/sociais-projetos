# PROMPT APERFEIÇOADO PARA REDESIGN DO SISTEMA DE DOAÇÕES ESCOLARES

---

## **CONTEXTO E OBJETIVO**

Preciso realizar um redesign completo da interface do Sistema de Doações Escolares do Centro de Educação Integral Christ Master, documentado no arquivo `DOCUMENTACAO-COMPLETA-SISTEMA.md`. O sistema atual utiliza Shadcn/ui com cores neutras e design minimalista, resultando em uma aparência corporativa e fria, inadequada para o ambiente escolar acolhedor que desejamos transmitir.

---

## **DIRETRIZES DE DESIGN OBRIGATÓRIAS**

### **1. SISTEMA DE CORES - Material Design 3 (Material You)**

#### **Paleta Principal:**

**Primary Color**: Azul vibrante e acolhedor (#2196F3 ou similar)
- Utilizar para CTAs principais, headers, elementos de destaque
- Variações: P-100 a P-900 seguindo escala Material

**Secondary Color**: Verde esperança (#4CAF50)
- Para indicadores de sucesso, metas alcançadas, progresso positivo
- Representar crescimento e conquistas da comunidade escolar

**Tertiary Color**: Laranja energético (#FF9800)
- Para badges, alertas positivos, celebrações
- Elementos que precisam chamar atenção de forma amigável

**Surface Colors:**
- Background: #FAFAFA (light) / #121212 (dark)
- Surface: #FFFFFF (light) / #1E1E1E (dark)
- Surface Variant: Utilizar tints das cores principais (5% opacity)

#### **Cores Semânticas:**
- Error: #F44336 (vermelho Material)
- Warning: #FFC107 (âmbar Material)
- Info: #2196F3 (azul Material)
- Success: #4CAF50 (verde Material)

#### **Regras de Aplicação:**
- **SEM GRADIENTES** - usar cores sólidas e overlays com opacity
- Contrast ratio mínimo: WCAG AAA (7:1) para texto principal
- Utilizar elevation através de sombras, não gradientes

---

### **2. TIPOGRAFIA - Material Design Type Scale**

#### **Fonte Principal:**
- Display: Roboto Display ou Google Sans Display
- Body: Roboto ou Inter
- Monospace: Roboto Mono (para números e códigos)

#### **Hierarquia Tipográfica:**

```
Display Large:  57px / 64px line-height / -0.25 letter-spacing
Display Medium: 45px / 52px / 0
Display Small:  36px / 44px / 0

Headline Large:  32px / 40px / 0
Headline Medium: 28px / 36px / 0
Headline Small:  24px / 32px / 0

Title Large:    22px / 28px / 0
Title Medium:   16px / 24px / +0.15
Title Small:    14px / 20px / +0.1

Body Large:     16px / 24px / +0.5
Body Medium:    14px / 20px / +0.25
Body Small:     12px / 16px / +0.4

Label Large:    14px / 20px / +0.1
Label Medium:   12px / 16px / +0.5
Label Small:    11px / 16px / +0.5
```

---

### **3. COMPONENTES E SUPERFÍCIES**

#### **Cards (Material Design 3):**
- **Elevated Card**: elevation-1 (1dp) em repouso, elevation-2 (3dp) em hover
- **Filled Card**: Surface color com tint da cor primária (5% opacity)
- **Outlined Card**: Border de 1px com outline color

#### **Formas e Cantos:**
- Extra Small: 4px (inputs, chips)
- Small: 8px (buttons, small cards)
- Medium: 12px (cards, dialogs)
- Large: 16px (sheets, large cards)
- Extra Large: 28px (FABs, elementos decorativos)

#### **Sistema de Elevação (sem gradientes):**

```css
Level 0: No shadow (flat)
Level 1: 0px 1px 2px rgba(0,0,0,0.3), 0px 1px 3px rgba(0,0,0,0.15)
Level 2: 0px 1px 5px rgba(0,0,0,0.3), 0px 2px 6px rgba(0,0,0,0.15)
Level 3: 0px 1px 8px rgba(0,0,0,0.3), 0px 3px 8px rgba(0,0,0,0.15)
Level 4: 0px 2px 10px rgba(0,0,0,0.3), 0px 6px 12px rgba(0,0,0,0.15)
Level 5: 0px 4px 14px rgba(0,0,0,0.3), 0px 8px 16px rgba(0,0,0,0.15)
```

---

## **ESPECIFICAÇÕES DE REDESIGN POR ÁREA**

### **4. DASHBOARD - PRIORIDADE MÁXIMA**

#### **Layout Grid Moderno:**
- Grid de 12 colunas com gaps variáveis (16px mobile, 24px desktop)
- Seções claramente definidas com white space estratégico
- Hero section com welcome message personalizada

#### **Metric Cards Redesenhados:**

```
Formato: Rectangle ratio 3:2
Background: Filled card com tint colorido (5% da cor associada)
Ícone: 40px, cor primária, background circular (10% opacity)
Número principal: Display Small, font-weight 600
Label: Body Medium, cor secundária
Trend indicator: Chip colorido com seta e porcentagem
Micro-animação: Counter animation ao carregar
Sparkline: Mini gráfico de tendência (últimos 7 dias)
```

#### **Gráfico Principal:**

```
Tipo: Combined chart (área + linha)
Altura: 400px desktop, 300px mobile
Cores: Usar paleta principal sem gradientes
Grid: Linhas sutis (10% opacity)
Tooltips: Cards flutuantes com sombra nivel-3
Legenda: Chips interativos para toggle
Animação: Entrada progressiva da esquerda para direita
```

#### **Ranking de Turmas:**

```
Cards individuais por turma (não tabela)
Avatar colorido com inicial da turma
Progress bar colorido mostrando meta
Badges para achievements (1º lugar, mais crescimento, etc)
Micro-interação: Expand para ver detalhes
```

---

### **5. FORMULÁRIOS - Material Design Guidelines**

#### **Input Fields:**

```
Estilo: Outlined text field (Material Design)
Estados: Default, Focused, Filled, Error, Disabled
Label: Animação float label
Helper text: Sempre visível abaixo
Counter: Para campos com limite
Leading/Trailing icons quando apropriado
Altura mínima: 56px
```

#### **Donation Form Específico:**

```
Stepper horizontal para processo multi-step
Cards para cada produto (não lista simples)
Floating Action Button (FAB) para adicionar produto
Preview visual do que está sendo registrado
Animação de sucesso elaborada (confetti ou similar)
```

---

### **6. TABELAS - Data Tables Material**

#### **Estrutura:**

```
Header: Sticky, background elevated, labels em caps
Rows: Altura mínima 52px, hover state com elevation
Células: Padding consistente 16px
Ações: Icon buttons agrupados à direita
Seleção: Checkbox Material com ripple effect
Densidade: Toggle para compact/comfortable/spacious
```

#### **Features Adicionais:**

```
Column sorting com indicadores visuais
Inline editing com auto-save
Bulk actions toolbar ao selecionar
Pagination com opções de items per page
Export button flutuante
```

---

### **7. NAVEGAÇÃO - Material Navigation**

#### **Desktop Sidebar:**

```
Largura: 280px expandido, 80px colapsado
Navigation rail option para telas médias
Itens agrupados por categoria com headers
Ícones: 24px, outlined por padrão, filled quando ativo
Active indicator: Pill shape com cor primária
Ripple effect em todos os cliques
User section no bottom com avatar e quick settings
```

#### **Mobile Navigation:**

```
Bottom Navigation Bar para principais ações (máx 5)
Navigation Drawer para menu completo
FAB para ação principal (nova doação)
Gesture navigation support
```

---

## **ELEMENTOS DE UX/UI MODERNOS A IMPLEMENTAR**

### **8. MICRO-INTERAÇÕES E ANIMAÇÕES**

#### **Obrigatórias (sem exagero):**

1. **Ripple Effect**: Todos os elementos clicáveis
2. **Skeleton Screens**: Loading states contextuais
3. **Morphing Transitions**: Entre estados de componentes
4. **Parallax Scrolling**: Headers e hero sections (sutil)
5. **Progressive Disclosure**: Revelar informações gradualmente
6. **Haptic Feedback**: Feedback tátil em mobile (vibração sutil)
7. **Sound Feedback**: Sons sutis opcionais para ações importantes

#### **Timing Functions:**

```css
Standard: cubic-bezier(0.4, 0.0, 0.2, 1) - 300ms
Decelerated: cubic-bezier(0.0, 0.0, 0.2, 1) - 250ms
Accelerated: cubic-bezier(0.4, 0.0, 1, 1) - 200ms
```

---

### **9. EMPTY STATES E ILUSTRAÇÕES**

#### **Requisitos:**

- Ilustrações vetoriais isotricas ou flat
- Cores alinhadas com a paleta principal
- Mensagens amigáveis e call-to-action claros
- Animações sutis (floating, pulsing)
- Contextual help oferecendo próximos passos

---

### **10. FEEDBACK E NOTIFICAÇÕES**

#### **Sistema de Toast/Snackbar:**

```
Posição: Bottom center (mobile), bottom left (desktop)
Duration: 4s para info, 6s para ações
Action button quando apropriado
Queue system para múltiplas notificações
Swipe to dismiss em mobile
```

#### **Loading States:**

```
Skeleton screens específicos por componente
Progress bars para operações longas
Circular progress para ações indeterminadas
Optimistic UI updates quando possível
```

---

## **TÉCNICAS MODERNAS DE UX A APLICAR**

### **11. PADRÕES DE INTERFACE**

#### **1. Progressive Disclosure**
- Mostrar informações essenciais primeiro
- Detalhes em accordions ou tooltips
- "Show more" para conteúdo extenso

#### **2. Optimistic UI**
- Atualizar interface imediatamente
- Rollback em caso de erro
- Indicadores sutis de sincronização

#### **3. Smart Defaults**
- Pré-preencher campos baseado em contexto
- Sugestões inteligentes baseadas em histórico
- Auto-complete agressivo

#### **4. Inline Validation**
- Validar campos em real-time
- Mensagens de erro contextuais
- Success indicators quando correto

#### **5. Contextual Actions**
- Ações aparecem onde são necessárias
- Floating Action Buttons contextuais
- Quick actions em hover/long-press

---

## **REQUISITOS DE ACESSIBILIDADE**

### **12. WCAG 2.1 NÍVEL AAA**

```
✓ Focus indicators: 3px solid outline
✓ Skip navigation links
✓ ARIA labels completos
✓ Keyboard navigation completa
✓ Screen reader optimized
✓ High contrast mode support
✓ Reduced motion support
✓ Font size controls
✓ Color blind friendly palette
```

---

## **ESPECIFICAÇÕES PARA MOBILE**

### **13. MOBILE-FIRST OPTIMIZATIONS**

```
✓ Touch targets: mínimo 48x48px
✓ Thumb-friendly zones para ações principais
✓ Gesture support: swipe, pinch, long-press
✓ Offline mode com sync indicators
✓ App-like transitions e navegação
✓ Pull-to-refresh onde apropriado
✓ Floating labels para economia de espaço
✓ Bottom sheets ao invés de modals
```

---

## **GAMIFICAÇÃO E ENGAJAMENTO**

### **14. ELEMENTOS MOTIVACIONAIS**

#### **1. Achievement Badges:**
- Primeira doação
- Doador do mês
- Meta alcançada
- Sequência de doações

#### **2. Progress Indicators:**
- Barras de progresso animadas
- Milestone celebrations
- Countdown para metas

#### **3. Leaderboards:**
- Rankings animados
- Destaques semanais/mensais
- Comparações friendly

#### **4. Celebrations:**
- Confetti animation
- Success sounds
- Congratulations messages
- Share achievements

---

## **IMPLEMENTAÇÃO TÉCNICA**

### **15. MANTER COMPATIBILIDADE**

```typescript
// Stack técnico mantido:
- Continuar usando Tailwind CSS
- Estender tema com design tokens Material
- Manter componentes Shadcn como base
- Adicionar Framer Motion para animações
- CSS Modules para estilos específicos
- CSS Variables para temas dinâmicos
```

#### **Bibliotecas Sugeridas:**

```json
{
  "framer-motion": "^11.0.0",        // Animações
  "@radix-ui/colors": "^3.0.0",      // Paletas Material-like
  "class-variance-authority": "^0.7.0", // Variantes
  "tailwind-merge": "^2.1.0",        // Merge classes
  "tailwindcss-animate": "^1.0.7"    // Animações Tailwind
}
```

---

## **ENTREGÁVEIS ESPERADOS**

### **1. Design System Documentation**
- Todos os tokens de design
- Componentes especificados
- Padrões de uso
- Exemplos de código

### **2. Mockups/Protótipos**
- Dashboard redesenhado (desktop + mobile)
- Formulário de doação completo
- Tabela de dados com todos os estados
- Estados vazios para cada seção
- Mobile screens principais (mínimo 5 telas)

### **3. Código de Implementação**
- `tailwind.config.ts` atualizado com design tokens
- Novos componentes base redesenhados
- Animações e transições implementadas
- Temas light/dark funcionais

### **4. Guidelines de Uso**
- Quando usar cada componente
- Boas práticas de UX contextual
- Checklist de acessibilidade
- Guia de contribuição para designers

---

## **CRONOGRAMA SUGERIDO**

### **Fase 1 - Fundação (Semana 1-2)**
- [ ] Definir design tokens completos
- [ ] Criar paleta de cores estendida
- [ ] Estabelecer sistema tipográfico
- [ ] Documentar componentes base

### **Fase 2 - Componentes Core (Semana 3-4)**
- [ ] Redesenhar buttons e inputs
- [ ] Criar novos card components
- [ ] Implementar sistema de navegação
- [ ] Desenvolver feedback components

### **Fase 3 - Páginas Principais (Semana 5-6)**
- [ ] Dashboard completo
- [ ] Formulário de doações
- [ ] Tabelas e listagens
- [ ] Estados vazios

### **Fase 4 - Refinamento (Semana 7-8)**
- [ ] Micro-interações
- [ ] Animações e transições
- [ ] Testes de acessibilidade
- [ ] Otimização mobile

### **Fase 5 - Documentação (Semana 9)**
- [ ] Design system docs
- [ ] Storybook components
- [ ] Guidelines de uso
- [ ] Handoff para desenvolvimento

---

## **CRITÉRIOS DE SUCESSO**

### **Métricas de Qualidade:**

✅ **Acessibilidade**
- WCAG AAA compliance (mínimo AA)
- Lighthouse accessibility score > 95

✅ **Performance**
- Lighthouse performance score > 90
- Largest Contentful Paint < 2.5s
- Cumulative Layout Shift < 0.1

✅ **UX**
- Task completion rate > 95%
- System Usability Scale score > 80
- Reduced time-to-complete para tarefas principais

✅ **Estética**
- Aprovação da comunidade escolar
- Alinhamento com valores da instituição
- Consistência visual em todas as telas

---

## **REFERÊNCIAS E INSPIRAÇÕES**

### **Design Systems para Referência:**
- Material Design 3 (Google)
- Fluent 2 (Microsoft)
- Carbon Design System (IBM)
- Atlassian Design System
- Polaris (Shopify)

### **Exemplos de Aplicações Similares:**
- ClassDojo (engajamento escolar)
- Seesaw (portfolio estudantil)
- Remind (comunicação escolar)
- Google Classroom (interface limpa)

### **Recursos de Ilustrações:**
- unDraw (ilustrações customizáveis)
- Storyset (cenas ilustradas)
- Blush (coleções diversas)
- Humaaans (personagens modulares)

---

## **IMPORTANTE - FILOSOFIA DE DESIGN**

> O redesign deve transmitir os valores da instituição educacional - **acolhimento, comunidade, crescimento e celebração** - através de cada decisão de design, mantendo **profissionalismo sem ser corporativo**, e sendo **vibrante sem ser infantil**.

### **Princípios Norteadores:**

1. **Acolhimento**: Cores quentes, espaçamentos generosos, mensagens amigáveis
2. **Comunidade**: Destacar conquistas coletivas, ranking colaborativo
3. **Crescimento**: Visualizar progresso, celebrar milestones
4. **Celebração**: Animações de sucesso, badges, feedbacks positivos
5. **Clareza**: Interface intuitiva para todos os níveis técnicos
6. **Confiança**: Design profissional que inspira segurança

---

**Este prompt deve ser usado como guia definitivo para qualquer redesign do sistema. Todas as decisões de design devem ser validadas contra estas diretrizes.**

---

*Documento criado em: Janeiro 2025*
*Versão: 1.0*
*Status: Aprovado para implementação*
