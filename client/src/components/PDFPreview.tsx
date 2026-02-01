import { Document, Page, pdfjs } from 'react-pdf';
import { useState, useEffect } from 'react';
import { Loader2, AlertCircle, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Set worker for pdf.js
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PDFPreviewProps {
  fileUrl: string;
  isPurchased?: boolean;
}

export function PDFPreview({ fileUrl, isPurchased = false }: PDFPreviewProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Simple screenshot prevention (CSS & JS)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'p' || e.key === 's')) {
        e.preventDefault();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setLoading(false);
  }

  function onDocumentLoadError() {
    setError("Failed to load PDF. Please check the URL or try again later.");
    setLoading(false);
  }

  return (
    <div className="relative select-none no-print bg-black/40 rounded-xl overflow-hidden border border-white/10" 
         style={{ userSelect: 'none', WebkitUserSelect: 'none' }}>
      
      {/* Visual Overlay for Screenshot Protection */}
      <div className="absolute inset-0 z-10 pointer-events-none opacity-[0.03] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
      
      <div className="flex flex-col items-center p-4 min-h-[400px] justify-center">
        {loading && <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />}
        
        {error && (
          <Alert variant="destructive" className="max-w-md">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!error && (
          <div className="relative">
            <Document
              file={fileUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              loading={<Loader2 className="animate-spin" />}
            >
              <Page 
                pageNumber={pageNumber} 
                width={Math.min(window.innerWidth - 64, 800)}
                renderAnnotationLayer={false}
                renderTextLayer={false}
              />
            </Document>
            
            {!isPurchased && numPages && numPages > 1 && (
              <div className="absolute inset-0 flex flex-col items-center justify-end pb-12 bg-gradient-to-t from-black via-black/40 to-transparent">
                <div className="bg-card/90 backdrop-blur-md p-6 rounded-2xl border border-white/10 text-center shadow-2xl max-w-sm mx-4 transform translate-y-4">
                  <h4 className="text-xl font-bold text-white mb-2">Preview Mode</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Only the first page is visible. Purchase the full notes to unlock all {numPages} pages.
                  </p>
                  <Button className="w-full bg-secondary hover:bg-secondary/90 text-background font-bold">
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Unlock All Pages
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {isPurchased && numPages && (
          <div className="mt-4 flex items-center gap-4 bg-card/50 p-2 rounded-lg border border-white/5">
            <Button 
              size="sm" 
              variant="outline" 
              disabled={pageNumber <= 1} 
              onClick={() => setPageNumber(p => p - 1)}
            >
              Previous
            </Button>
            <span className="text-sm font-mono text-white">
              Page {pageNumber} of {numPages}
            </span>
            <Button 
              size="sm" 
              variant="outline" 
              disabled={pageNumber >= (numPages || 1)} 
              onClick={() => setPageNumber(p => p + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          .no-print { display: none !important; }
        }
        .react-pdf__Page__canvas {
          margin: 0 auto;
          max-width: 100%;
          height: auto !important;
          border-radius: 4px;
        }
      `}} />
    </div>
  );
}
