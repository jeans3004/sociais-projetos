"use client";

import { useState, useCallback } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "@/components/ui/button";

// Configurar workerSrc
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PDFViewerMobileProps {
  fileUrl: string;
  onLoadError?: (error: Error) => void;
}

export function PDFViewerMobile({ fileUrl, onLoadError }: PDFViewerMobileProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const onDocumentLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setIsLoading(false);
  }, []);

  const handleZoomIn = useCallback(() => {
    setScale((prevScale) => Math.min(prevScale + 0.2, 3.0));
  }, []);

  const handleZoomOut = useCallback(() => {
    setScale((prevScale) => Math.max(prevScale - 0.2, 0.5));
  }, []);

  const handleLoadError = useCallback(
    (error: Error) => {
      setIsLoading(false);
      if (onLoadError) {
        onLoadError(error);
      }
    },
    [onLoadError]
  );

  return (
    <div className="relative h-full w-full overflow-auto bg-gray-900">
      {/* Controles de Zoom - Apenas no mobile */}
      <div className="sticky top-4 z-10 flex justify-center gap-3 px-4 md:hidden">
        <Button
          variant="secondary"
          size="icon"
          onClick={handleZoomOut}
          disabled={scale <= 0.5}
          className="h-12 w-12 rounded-full bg-white shadow-lg hover:bg-gray-100 disabled:opacity-50"
        >
          <ZoomOut className="h-6 w-6 text-gray-700" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          onClick={handleZoomIn}
          disabled={scale >= 3.0}
          className="h-12 w-12 rounded-full bg-white shadow-lg hover:bg-gray-100 disabled:opacity-50"
        >
          <ZoomIn className="h-6 w-6 text-gray-700" />
        </Button>
      </div>

      {/* Documento PDF */}
      <div className="flex min-h-full items-center justify-center p-4">
        {isLoading && (
          <div className="flex items-center justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        )}

        <Document
          file={fileUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={handleLoadError}
          loading=""
          className="flex flex-col items-center gap-4"
        >
          {Array.from(new Array(numPages), (el, index) => (
            <div key={`page_${index + 1}`} className="shadow-2xl">
              <Page
                pageNumber={index + 1}
                scale={scale}
                renderTextLayer={true}
                renderAnnotationLayer={true}
                className="max-w-full"
              />
            </div>
          ))}
        </Document>
      </div>

      {/* Informação de páginas - Apenas no mobile */}
      {numPages > 0 && (
        <div className="sticky bottom-4 flex justify-center md:hidden">
          <div className="rounded-full bg-white px-4 py-2 text-sm font-medium shadow-lg">
            {numPages} {numPages === 1 ? "página" : "páginas"}
          </div>
        </div>
      )}
    </div>
  );
}
