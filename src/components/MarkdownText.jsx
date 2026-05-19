import React from 'react';

export const MarkdownText = ({ text, className = '' }) => {
  if (!text) return null;

  const htmlContent = React.useMemo(() => {
    // 1. Decode entities first to normalize punctuation & special characters safely
    let normalized = text
      .replace(/&nbsp;/g, ' ')
      .replace(/&quot;/g, '"')
      .replace(/&ldquo;/g, '"')
      .replace(/&rdquo;/g, '"')
      .replace(/&lsquo;/g, "'")
      .replace(/&rsquo;/g, "'")
      .replace(/&#39;/g, "'")
      .replace(/&apos;/g, "'")
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>');

    // 2. Split into blocks by double newlines to keep headers, footers, lists, and paragraphs separate
    const blocks = normalized.split(/\n\n+/);
    const result = [];

    blocks.forEach(block => {
      let trimmed = block.trim();
      if (!trimmed) return;

      // Compile inline formatting
      trimmed = trimmed.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      trimmed = trimmed.replace(/\*(.*?)\*/g, '<em>$1</em>');
      trimmed = trimmed.replace(/_(.*?)_/g, '<u>$1</u>');
      trimmed = trimmed.replace(/~~(.*?)~~/g, '<strike>$1</strike>');
      trimmed = trimmed.replace(/`(.*?)`/g, '<code class="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-primary text-xs font-mono">$1</code>');
      trimmed = trimmed.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline font-bold">$1</a>');

      if (trimmed.startsWith('# ')) {
        result.push(`<h1 class="text-2xl font-black italic tracking-tighter mb-6 mt-8 text-white">${trimmed.substring(2)}</h1>`);
      } else if (trimmed.startsWith('## ')) {
        result.push(`<h2 class="text-xl font-black italic tracking-tighter mb-4 mt-6 text-white">${trimmed.substring(3)}</h2>`);
      } else if (trimmed.startsWith('### ')) {
        result.push(`<h3 class="text-base font-black text-primary mt-4 mb-2 tracking-widest uppercase">${trimmed.substring(4)}</h3>`);
      } else if (trimmed.startsWith('> ')) {
        result.push(`<blockquote class="border-l-4 border-primary pl-4 py-2 my-4 italic text-muted-foreground/80 bg-primary/5 rounded-r-xl">${trimmed.substring(2)}</blockquote>`);
      } else if (trimmed.startsWith('---')) {
        result.push('<hr class="border-border/60 my-6" />');
      } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        const items = trimmed.split(/\n[-*]\s+/);
        const liElements = items.map(item => {
          const cleaned = item.replace(/^[-*]\s+/, '');
          return `<li>${cleaned}</li>`;
        }).join('');
        result.push(`<ul class="list-disc pl-4 space-y-1.5 mb-4 text-muted-foreground text-sm">${liElements}</ul>`);
      } else if (/^\d+\.\s+/.test(trimmed)) {
        const items = trimmed.split(/\n\d+\.\s+/);
        const liElements = items.map(item => {
          const cleaned = item.replace(/^\d+\.\s+/, '');
          return `<li>${cleaned}</li>`;
        }).join('');
        result.push(`<ol class="list-decimal pl-4 space-y-1.5 mb-4 text-muted-foreground text-sm">${liElements}</ol>`);
      } else {
        const isHtmlBlock = /^\s*<(p|div|h1|h2|h3|blockquote|ul|ol|hr)\b/i.test(trimmed);
        if (isHtmlBlock) {
          result.push(trimmed);
        } else {
          const parsedLines = trimmed.split('\n').join('<br />');
          result.push(`<p class="text-muted-foreground leading-relaxed text-sm mb-3">${parsedLines}</p>`);
        }
      }
    });

    return result.join('');
  }, [text]);

  return (
    <div 
      className={`prose prose-invert prose-primary max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
};

export default MarkdownText;
