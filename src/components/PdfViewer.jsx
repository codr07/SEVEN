import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { ZoomIn, ZoomOut, ChevronLeft, ChevronRight, Maximize } from 'lucide-react';

// Setup worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const PdfViewer = ({ url }) => {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setPageNumber(1);
  };

  return (
    <div className="flex flex-col h-full bg-[#1a1a1a] rounded-xl overflow-hidden border border-white/10 select-none">
      
      {/* Custom Adobe-like Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 bg-black/60 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setScale(s => Math.max(0.5, s - 0.25))}
            className="p-1.5 hover:bg-white/10 rounded-lg text-white transition-colors"
          >
            <ZoomOut size={16} />
          </button>
          <span className="text-xs font-bold w-12 text-center text-white">{Math.round(scale * 100)}%</span>
          <button 
            onClick={() => setScale(s => Math.min(3.0, s + 0.25))}
            className="p-1.5 hover:bg-white/10 rounded-lg text-white transition-colors"
          >
            <ZoomIn size={16} />
          </button>
          <button 
            onClick={() => setScale(1.0)}
            className="ml-2 p-1.5 hover:bg-white/10 rounded-lg text-muted-foreground transition-colors"
            title="Reset Zoom"
          >
            <Maximize size={16} />
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button 
            disabled={pageNumber <= 1}
            onClick={() => setPageNumber(p => p - 1)}
            className="p-1.5 hover:bg-white/10 disabled:opacity-30 rounded-lg text-white transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-xs font-bold text-white">
            {pageNumber} <span className="text-muted-foreground">/ {numPages || '--'}</span>
          </span>
          <button 
            disabled={pageNumber >= numPages}
            onClick={() => setPageNumber(p => p + 1)}
            className="p-1.5 hover:bg-white/10 disabled:opacity-30 rounded-lg text-white transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* PDF Canvas Area */}
      <div 
        className="flex-1 overflow-auto custom-scrollbar flex justify-center p-4"
        onContextMenu={(e) => e.preventDefault()}
      >
        <Document
          file={url}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={
            <div className="text-muted-foreground text-sm font-bold uppercase tracking-widest animate-pulse">
              Loading Secure Document...
            </div>
          }
          error={
            <div className="text-destructive text-sm font-bold">
              Failed to load document.
            </div>
          }
        >
          <div className="relative shadow-2xl">
            {/* The invisible overlay prevents interacting with the canvas/saving image */}
            <div className="absolute inset-0 z-10"></div>
            <Page 
              pageNumber={pageNumber} 
              scale={scale} 
              renderTextLayer={false}
              renderAnnotationLayer={false}
              className="border border-white/5"
            />
          </div>
        </Document>
      </div>
    </div>
  );
};

export default PdfViewer;
