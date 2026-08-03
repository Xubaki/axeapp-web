# 🎨 Guia de Logos AxéApp - Onde Aplicar Cada Variação

## **5 Variações de Logo Criadas**

### **1. Logo Colorido (v1-colorido.png)** 🌿
**Descrição:** Duas folhas em verde e dourado formando a letra 'A'. Versão premium com cores vibrantes.

**Onde usar:**
- ✅ **App Mobile (iOS/Android)** - Ícone principal do app
- ✅ **Website** - Logo no header/navbar
- ✅ **Google Play Store** - Ícone do app
- ✅ **App Store** - Ícone do app
- ✅ **Redes Sociais** - Perfil do Instagram, Facebook, etc
- ✅ **Marketing** - Materiais de divulgação, banners, posts
- ✅ **Splash Screen** - Tela de carregamento do app

**Arquivo:** `axeapp-logo-v1-colorido.png` (1920x1920px)

---

### **2. Logo Monocromático (v2-monocromatico.png)** ⚫⚪
**Descrição:** Versão em preto e branco. Ideal para impressão e contextos formais.

**Onde usar:**
- ✅ **Documentos Oficiais** - Contratos, termos de uso, políticas
- ✅ **Impressão em B&W** - Cartões de visita, papel timbrado
- ✅ **Favicon** - Aba do navegador (converter para .ico)
- ✅ **Modo Escuro (Dark Mode)** - Versão alternativa no app
- ✅ **Watermark** - Marca d'água em documentos
- ✅ **Assinatura de Email** - Emails corporativos
- ✅ **Relatórios** - PDFs e documentos internos

**Arquivo:** `axeapp-logo-v2-monocromatico.png` (1920x1920px)

---

### **3. Logo Sketch (v3-sketch.png)** ✏️
**Descrição:** Versão em estilo desenho/line art. Artesanal e autêntico.

**Onde usar:**
- ✅ **Branding Criativo** - Apresentações, pitch decks
- ✅ **Redes Sociais** - Stories, posts artísticos
- ✅ **Packaging** - Se tiver produtos físicos
- ✅ **Merch** - Camisetas, bonés, adesivos
- ✅ **Ilustrações** - Artigos de blog, conteúdo editorial
- ✅ **About Page** - Página "Sobre Nós" do website
- ✅ **Comunidade** - Materiais comunitários, cartazes

**Arquivo:** `axeapp-logo-v3-sketch.png` (1920x1920px)

---

### **4. Logo Geométrico (v4-geometrico.png)** 🔷
**Descrição:** Versão moderna com formas geométricas. Minimalista e contemporâneo.

**Onde usar:**
- ✅ **Interface do App** - Botões, headers, elementos UI
- ✅ **Website Moderno** - Seções, cards, componentes
- ✅ **Design System** - Guia de estilos, componentes reutilizáveis
- ✅ **Ícones** - Versão simplificada para ícones pequenos
- ✅ **Animações** - Versão para animações e transições
- ✅ **Dashboard** - Painéis administrativos
- ✅ **Aplicações Web** - Ferramentas internas

**Arquivo:** `axeapp-logo-v4-geometrico.png` (1920x1920px)

---

### **5. Logo Dourado Premium (v5-dourado.png)** ✨
**Descrição:** Versão luxuosa em ouro e verde escuro. Sagrada e elegante.

**Onde usar:**
- ✅ **Premium/VIP Features** - Seções premium do app
- ✅ **Assinatura Premium** - Badges, selos de premium
- ✅ **Materiais Exclusivos** - Conteúdo VIP
- ✅ **Eventos Especiais** - Convites, materiais de eventos
- ✅ **Parceiros Premium** - Logo dos terreiros parceiros
- ✅ **Certificados** - Certificados de conclusão
- ✅ **Backgrounds Especiais** - Fundos para seções premium
- ✅ **Publicidade Premium** - Anúncios de planos premium

**Arquivo:** `axeapp-logo-v5-dourado.png` (1920x1920px)

---

## **Implementação por Plataforma**

### **📱 App Mobile (React Native/Expo)**

```typescript
// app.config.ts
const env = {
  appName: "AxéApp",
  appSlug: "axeapp",
  logoUrl: "https://[URL-DA-LOGO-COLORIDA]", // v1-colorido
  scheme: "manus20240115103045",
  iosBundleId: "space.manus.axe.app.t20240115103045",
  androidPackage: "space.manus.axe.app.t20240115103045",
};

// assets/images/
// - icon.png → v1-colorido.png (logo principal)
// - splash-icon.png → v1-colorido.png (tela de splash)
// - favicon.png → v2-monocromatico.png (aba do navegador)
// - android-icon-foreground.png → v1-colorido.png
// - android-icon-background.png → cor sólida (#ffffff ou #151718)
```

---

### **🌐 Website (Next.js)**

```tsx
// components/Logo.tsx
import Image from 'next/image';

export function LogoHeader() {
  return (
    <Image
      src="/logos/axeapp-logo-v1-colorido.png" // Colorido no header
      alt="AxéApp"
      width={40}
      height={40}
    />
  );
}

export function LogoFooter() {
  return (
    <Image
      src="/logos/axeapp-logo-v2-monocromatico.png" // Monocromático no footer
      alt="AxéApp"
      width={32}
      height={32}
    />
  );
}

export function LogoPremium() {
  return (
    <Image
      src="/logos/axeapp-logo-v5-dourado.png" // Dourado para premium
      alt="AxéApp Premium"
      width={48}
      height={48}
    />
  );
}

// public/logos/
// - axeapp-logo-v1-colorido.png
// - axeapp-logo-v2-monocromatico.png
// - axeapp-logo-v3-sketch.png
// - axeapp-logo-v4-geometrico.png
// - axeapp-logo-v5-dourado.png
```

---

### **🎨 Google Play Store**

| Campo | Logo | Tamanho |
|-------|------|--------|
| **Ícone do App** | v1-colorido | 512x512px |
| **Gráficos em Destaque** | v1-colorido | 1024x500px |
| **Capas de Categorias** | v1-colorido | 180x120px |
| **Promo Gráfico** | v5-dourado (premium) | 1200x628px |

---

### **📲 App Store (iOS)**

| Campo | Logo | Tamanho |
|-------|------|--------|
| **Ícone do App** | v1-colorido | 1024x1024px |
| **Gráficos em Destaque** | v1-colorido | 1200x628px |
| **Promo Imagem** | v5-dourado (premium) | 1200x628px |

---

### **📱 Redes Sociais**

| Rede | Logo | Tamanho |
|------|------|--------|
| **Instagram Profile** | v1-colorido | 1080x1080px |
| **Instagram Story** | v1-colorido ou v3-sketch | 1080x1920px |
| **Facebook** | v1-colorido | 1200x628px |
| **LinkedIn** | v2-monocromatico | 1200x627px |
| **Twitter/X** | v1-colorido | 400x400px |
| **TikTok** | v1-colorido | 1080x1920px |

---

## **Checklist de Implementação**

- [ ] **App Mobile**
  - [ ] Atualizar `icon.png` com v1-colorido
  - [ ] Atualizar `splash-icon.png` com v1-colorido
  - [ ] Atualizar `favicon.png` com v2-monocromatico
  - [ ] Atualizar `android-icon-foreground.png` com v1-colorido
  - [ ] Atualizar `app.config.ts` com logoUrl

- [ ] **Website**
  - [ ] Copiar logos para `public/logos/`
  - [ ] Atualizar componentes de logo
  - [ ] Testar em light/dark mode
  - [ ] Verificar responsividade

- [ ] **Google Play Store**
  - [ ] Fazer upload do ícone (v1-colorido)
  - [ ] Fazer upload dos gráficos (v1-colorido)
  - [ ] Fazer upload da promo (v5-dourado)

- [ ] **App Store**
  - [ ] Fazer upload do ícone (v1-colorido)
  - [ ] Fazer upload dos gráficos (v1-colorido)
  - [ ] Fazer upload da promo (v5-dourado)

- [ ] **Redes Sociais**
  - [ ] Atualizar perfil Instagram
  - [ ] Atualizar perfil Facebook
  - [ ] Atualizar perfil LinkedIn
  - [ ] Atualizar perfil Twitter/X

- [ ] **Documentação**
  - [ ] Criar guia de marca (brand guidelines)
  - [ ] Documentar uso de cores
  - [ ] Documentar espaçamento mínimo
  - [ ] Documentar variações permitidas

---

## **Dicas de Uso**

### **✅ Faça:**
- Use a versão colorida (v1) como padrão
- Use a monocromática (v2) em contextos formais
- Use a premium (v5) para destacar recursos premium
- Mantenha espaço em branco ao redor do logo
- Use em tamanho mínimo de 32x32px

### **❌ Não Faça:**
- Não distorça ou estique o logo
- Não mude as cores (use as versões fornecidas)
- Não adicione sombras ou efeitos não autorizados
- Não use em fundo com cores muito similares
- Não redimensione abaixo de 32x32px

---

## **Arquivos Inclusos**

```
axeapp-logos-completo.zip
├── axeapp-logo-v1-colorido.png (1920x1920px)
├── axeapp-logo-v2-monocromatico.png (1920x1920px)
├── axeapp-logo-v3-sketch.png (1920x1920px)
├── axeapp-logo-v4-geometrico.png (1920x1920px)
├── axeapp-logo-v5-dourado.png (1920x1920px)
└── GUIA_LOGOS_AXEAPP.md (este arquivo)
```

---

**Pronto para implementar!** 🚀
