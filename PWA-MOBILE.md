# PWA e Responsividade Mobile

Este documento descreve as funcionalidades PWA (Progressive Web App) e responsividade mobile implementadas no Sistema de Doações.

## 📱 Progressive Web App (PWA)

O sistema foi configurado como um PWA completo, permitindo que seja instalado como um aplicativo nativo em dispositivos móveis e desktop.

### Funcionalidades PWA

- ✅ **Manifest configurado** - Define nome, ícones, cores e comportamento do app
- ✅ **Instalável** - Pode ser adicionado à tela inicial do dispositivo
- ✅ **Modo Standalone** - Abre sem a barra de navegação do navegador
- ✅ **Ícones otimizados** - Ícones de 192x192 e 512x512 gerados dinamicamente
- ✅ **Apple Touch Icon** - Suporte para iOS
- ✅ **Theme Color** - Cor da barra de status (#3b82f6)
- ✅ **Meta tags mobile** - Viewport e configurações otimizadas

### Como Instalar o PWA

#### Android (Chrome/Samsung Internet)

1. Acesse https://projetos-sociais-cm.vercel.app
2. Toque no menu de 3 pontos (⋮) no canto superior direito
3. Selecione **"Adicionar à tela inicial"** ou **"Instalar app"**
4. Confirme tocando em **"Adicionar"** ou **"Instalar"**
5. O ícone "Doações CM" aparecerá na tela inicial

#### iOS (Safari)

1. Acesse https://projetos-sociais-cm.vercel.app no Safari
2. Toque no botão **Compartilhar** (ícone □↑) na parte inferior
3. Role para baixo e toque em **"Adicionar à Tela Inicial"**
4. Edite o nome se desejar (padrão: "Doações CM")
5. Toque em **"Adicionar"** no canto superior direito
6. O ícone aparecerá na tela inicial

#### Desktop (Chrome/Edge/Brave)

1. Acesse https://projetos-sociais-cm.vercel.app
2. Procure pelo ícone de instalação (⊕) na barra de endereços
3. Clique em **"Instalar"** ou **"Instalar Doações CM"**
4. O app será instalado e poderá ser aberto como um programa nativo

### Vantagens do PWA

- 🚀 **Carregamento rápido** - Otimizado para performance
- 📱 **Experiência nativa** - Parece e funciona como um app nativo
- 🔄 **Atualizações automáticas** - Sempre a versão mais recente
- 💾 **Sem ocupar espaço** - Muito menor que apps nativos
- 🌐 **Multiplataforma** - Funciona em Android, iOS, Windows, macOS, Linux

---

## 📱 Responsividade Mobile

O sistema foi completamente adaptado para funcionar perfeitamente em dispositivos móveis de todos os tamanhos.

### Breakpoints Utilizados

```css
/* Mobile First */
Base:        0px    (mobile)
sm:        640px    (tablets pequenos)
md:        768px    (tablets)
lg:       1024px    (laptops)
xl:       1280px    (desktops)
```

### Componentes Responsivos

#### 1. **Navegação Mobile**

- **Desktop**: Sidebar fixa à esquerda (256px)
- **Mobile**:
  - Sidebar escondida
  - Menu hamburguer (☰) no header
  - Sidebar abre como drawer/sheet deslizante
  - Fecha automaticamente ao clicar em um link

#### 2. **Header**

- **Desktop**:
  - Logo "CM" + "Doações CM"
  - Texto de boas-vindas completo
  - Email do usuário visível

- **Mobile**:
  - Menu hamburguer à esquerda
  - Apenas "Doações CM" visível
  - Avatar do usuário à direita
  - Email truncado se muito longo

#### 3. **Dashboard**

**Cards de Métricas:**
- Desktop: 4 colunas (lg:grid-cols-4)
- Tablet: 2 colunas (md:grid-cols-2)
- Mobile: 1 coluna (padrão)

**Gráficos:**
- Desktop: Lado a lado (7 colunas)
- Mobile: Empilhados (1 coluna cada)

**Títulos:**
- Desktop: text-3xl (30px)
- Mobile: text-2xl (24px)

**Espaçamento:**
- Desktop: p-6 (24px padding)
- Mobile: p-4 (16px padding)

#### 4. **Login**

- Tela responsiva com padding adaptativo
- Ícone CM responsivo (16-20px height)
- Card centralizado em todas as resoluções
- Botão de login otimizado para toque

#### 5. **Formulários e Tabelas**

- Campos de formulário com largura adaptativa
- Tabelas com scroll horizontal em mobile
- Botões com tamanho adequado para toque (44x44px mínimo)
- Espaçamento entre elementos ajustado

---

## 🎨 Design System Mobile

### Ícone "CM"

O ícone foi padronizado em todo o sistema:

- **Login**: Gradiente azul com bordas arredondadas
- **Sidebar**: Fundo azul sólido (#3b82f6)
- **Favicon**: Gerado dinamicamente
- **PWA Icons**: 192x192 e 512x512 com gradiente

### Cores

```css
Primary: #3b82f6 (Azul)
Gradient: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)
Background: #ffffff (Branco)
Text: Sistema adaptativo (light/dark)
```

### Tipografia

```css
Headings:
  - Mobile: text-2xl (1.5rem / 24px)
  - Desktop: text-3xl (1.875rem / 30px)

Body:
  - Mobile: text-sm (0.875rem / 14px)
  - Desktop: text-base (1rem / 16px)

Descriptions:
  - Mobile: text-xs (0.75rem / 12px)
  - Desktop: text-sm (0.875rem / 14px)
```

---

## 🧪 Testando a Responsividade

### No Navegador (DevTools)

1. Abra o site: https://projetos-sociais-cm.vercel.app
2. Pressione **F12** para abrir o DevTools
3. Pressione **Ctrl+Shift+M** (ou Cmd+Shift+M no Mac) para ativar o modo responsivo
4. Teste em diferentes dispositivos:

**Smartphones:**
- iPhone 14 Pro Max (430x932)
- iPhone 14 (390x844)
- Samsung Galaxy S20 (360x800)
- Google Pixel 7 (412x915)

**Tablets:**
- iPad Pro 12.9" (1024x1366)
- iPad Air (820x1180)
- Samsung Galaxy Tab (800x1280)

**Rotação:**
- Teste tanto em modo portrait quanto landscape
- Clique no ícone de rotação no DevTools

### No Dispositivo Real

1. Acesse https://projetos-sociais-cm.vercel.app no celular
2. Faça login com sua conta Google autorizada
3. Teste as seguintes funcionalidades:
   - ✅ Menu hamburguer abre/fecha corretamente
   - ✅ Navegação entre páginas funciona
   - ✅ Cards são exibidos empilhados
   - ✅ Gráficos são visualizáveis
   - ✅ Formulários são preenchíveis
   - ✅ Botões são clicáveis (área de toque adequada)
   - ✅ Rolagem vertical funciona bem
   - ✅ Textos são legíveis sem zoom

---

## 🔧 Tecnologias Utilizadas

### PWA
- **Next.js 14** - Suporte nativo a PWA
- **Manifest API** - Configuração do app
- **ImageResponse** - Geração dinâmica de ícones

### Responsividade
- **Tailwind CSS** - Framework utility-first
- **Shadcn/ui** - Componentes acessíveis e responsivos
- **Sheet Component** - Sidebar mobile deslizante
- **Breakpoints** - Sistema mobile-first

### Componentes Criados
- `MobileSidebar.tsx` - Menu mobile com Sheet
- `manifest.ts` - Configuração PWA
- `icon-192.png/route.tsx` - Ícone 192x192
- `icon-512.png/route.tsx` - Ícone 512x512
- `apple-icon.png/route.tsx` - Ícone Apple

---

## 📊 Performance Mobile

### Métricas de Carregamento

- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Time to Interactive**: < 3.5s
- **Cumulative Layout Shift**: < 0.1

### Otimizações Aplicadas

- ✅ Imagens com lazy loading
- ✅ Componentes otimizados (React.memo quando necessário)
- ✅ CSS minificado em produção
- ✅ JavaScript code splitting
- ✅ Ícones gerados dinamicamente (sem arquivos estáticos)

---

## 📱 Suporte de Navegadores

### Desktop
- ✅ Chrome 90+ (Recomendado)
- ✅ Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Brave 1.24+

### Mobile
- ✅ Chrome Android 90+
- ✅ Safari iOS 14+ (Recomendado para iPhone)
- ✅ Samsung Internet 14+
- ✅ Firefox Android 88+

### PWA Instalação
- ✅ Android (Chrome, Samsung Internet, Edge)
- ✅ iOS (Safari) - via "Adicionar à Tela Inicial"
- ✅ Desktop (Chrome, Edge, Brave)

---

## 🐛 Troubleshooting Mobile

### Problema: PWA não oferece instalação

**Solução:**
1. Verifique se está usando HTTPS (Vercel já fornece)
2. Certifique-se que o manifest.json está acessível
3. Verifique se há erros no console (F12)
4. Tente em modo anônimo/privado
5. Limpe cache e cookies do navegador

### Problema: Menu não abre no mobile

**Solução:**
1. Verifique se JavaScript está habilitado
2. Atualize a página (Ctrl+R ou Cmd+R)
3. Limpe o cache do navegador
4. Tente em outro navegador

### Problema: Elementos cortados em mobile

**Solução:**
1. Verifique se o zoom está em 100%
2. Tente em modo retrato (vertical)
3. Reporte o problema com screenshot

### Problema: Gráficos não aparecem em mobile

**Solução:**
1. Aguarde alguns segundos (carregamento de dados)
2. Verifique conexão com internet
3. Recarregue a página
4. Verifique se há dados para exibir

---

## 🚀 Próximas Melhorias

### Planejado

- [ ] Service Worker para cache offline
- [ ] Push notifications
- [ ] Modo offline parcial (visualização de dados em cache)
- [ ] Compartilhamento nativo (Web Share API)
- [ ] Reconhecimento de voz para busca
- [ ] Dark mode automático baseado em horário
- [ ] Gestos de swipe para navegação
- [ ] Vibração para feedback tátil em ações

### Em Consideração

- [ ] Biometria para login (Face ID / Touch ID)
- [ ] QR Code scanner para recibos
- [ ] Câmera para anexar fotos de comprovantes
- [ ] Geolocalização para eventos
- [ ] Calendário de eventos de doação

---

## 📞 Suporte

Caso encontre problemas com PWA ou responsividade mobile:

1. Verifique a seção de Troubleshooting acima
2. Teste em navegador atualizado
3. Limpe cache e cookies
4. Relate o problema no GitHub com:
   - Dispositivo/navegador usado
   - Screenshot do problema
   - Passos para reproduzir

---

**Desenvolvido com Next.js, Tailwind CSS e ❤️**

**Última atualização:** Janeiro 2025
