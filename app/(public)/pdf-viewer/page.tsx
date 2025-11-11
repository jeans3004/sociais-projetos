"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

// Carregar PDFViewerMobile apenas no cliente
const PDFViewerMobile = dynamic(
  () => import("@/components/pdf/PDFViewerMobile").then((mod) => mod.PDFViewerMobile),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    ),
  }
);

export default function PDFViewerPage() {
  const [pdfUrl, setPdfUrl] = useState<string>("");
  const [showViewer, setShowViewer] = useState<boolean>(false);
  const { toast } = useToast();

  const handleLoadError = (error: Error) => {
    toast({
      variant: "destructive",
      title: "Erro ao carregar PDF",
      description: "Não foi possível carregar o arquivo PDF. Verifique o URL.",
    });
    console.error("PDF Load Error:", error);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pdfUrl) {
      toast({
        variant: "destructive",
        title: "URL inválida",
        description: "Por favor, insira uma URL válida para o PDF.",
      });
      return;
    }
    setShowViewer(true);
  };

  // URL de exemplo de PDF
  const examplePdfUrl = "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";

  return (
    <div className="flex min-h-screen flex-col">
      {!showViewer ? (
        <div className="flex flex-1 items-center justify-center p-4">
          <div className="w-full max-w-md space-y-6">
            <div className="space-y-2 text-center">
              <h1 className="text-3xl font-bold">Visualizador de PDF Mobile</h1>
              <p className="text-muted-foreground">
                Visualize PDFs com controles simples de zoom, otimizado para dispositivos móveis
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="pdf-url">URL do PDF</Label>
                <Input
                  id="pdf-url"
                  type="url"
                  placeholder="https://exemplo.com/documento.pdf"
                  value={pdfUrl}
                  onChange={(e) => setPdfUrl(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-2">
                <Button type="submit" className="w-full">
                  Visualizar PDF
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setPdfUrl(examplePdfUrl);
                    setShowViewer(true);
                  }}
                >
                  Usar PDF de Exemplo
                </Button>
              </div>
            </form>

            <div className="rounded-lg border border-muted bg-muted/30 p-4 text-sm text-muted-foreground">
              <p className="font-semibold">Recursos:</p>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>Controles de zoom + e - (apenas mobile)</li>
                <li>Visualização de todas as páginas</li>
                <li>Rolagem suave</li>
                <li>Sem botões de download ou navegação</li>
              </ul>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-1 flex-col">
          {/* Header com botão de voltar */}
          <div className="border-b bg-white p-4">
            <div className="flex items-center justify-between">
              <Button variant="ghost" onClick={() => setShowViewer(false)}>
                ← Voltar
              </Button>
              <h2 className="text-lg font-semibold">Visualizador de PDF</h2>
              <div className="w-20" /> {/* Spacer para centralizar o título */}
            </div>
          </div>

          {/* Visualizador de PDF */}
          <div className="flex-1">
            <PDFViewerMobile fileUrl={pdfUrl} onLoadError={handleLoadError} />
          </div>
        </div>
      )}
    </div>
  );
}
