# PDFViewerMobile

Componente de visualização de PDF otimizado para dispositivos móveis, com controles simplificados de zoom.

## Recursos

- ✅ Visualização de todas as páginas do PDF
- ✅ Controles de zoom + e - (apenas em mobile)
- ✅ Rolagem suave
- ✅ Sem botões de download ou navegação
- ✅ Design limpo e minimalista
- ✅ Otimizado para mobile

## Uso

```tsx
import { PDFViewerMobile } from "@/components/pdf/PDFViewerMobile";

export default function MyPage() {
  const handleLoadError = (error: Error) => {
    console.error("Erro ao carregar PDF:", error);
  };

  return (
    <div className="h-screen">
      <PDFViewerMobile
        fileUrl="https://exemplo.com/documento.pdf"
        onLoadError={handleLoadError}
      />
    </div>
  );
}
```

## Props

| Prop | Tipo | Obrigatório | Descrição |
|------|------|------------|-----------|
| `fileUrl` | `string` | Sim | URL do arquivo PDF a ser exibido |
| `onLoadError` | `(error: Error) => void` | Não | Callback chamado quando ocorre um erro ao carregar o PDF |

## Página de Teste

Acesse `/pdf-viewer` para testar o componente com PDFs personalizados ou de exemplo.

## Tecnologias

- [react-pdf](https://github.com/wojtekmaj/react-pdf) - Renderização de PDFs em React
- [pdfjs-dist](https://mozilla.github.io/pdf.js/) - Motor de renderização de PDFs da Mozilla
- Tailwind CSS - Estilização
- Lucide React - Ícones

## Notas Técnicas

- O componente usa `dynamic import` com `ssr: false` para evitar problemas de SSR
- Os controles de zoom só aparecem em telas mobile (< 768px)
- Zoom mínimo: 0.5x
- Zoom máximo: 3.0x
- Incremento de zoom: 0.2x
