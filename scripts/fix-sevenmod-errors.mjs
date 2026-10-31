import fs from 'fs';

let code = fs.readFileSync('src/pages/SevenMod.jsx', 'utf8');

// 1. Fix markdownToHtml to handle undefined, null, non-string, array, or object types safely
const oldMarkdownFn = 'const markdownToHtml = (markdown) => {\r\n  if (!markdown) return \'\';';
const oldMarkdownFnAlt = 'const markdownToHtml = (markdown) => {\n  if (!markdown) return \'\';';

const safeMarkdownFn = `const markdownToHtml = (markdown) => {
  if (markdown === null || markdown === undefined) return '';
  if (typeof markdown !== 'string') {
    if (Array.isArray(markdown)) return markdown.map(m => \`<p>\${String(m)}</p>\`).join('');
    if (typeof markdown === 'object') {
      try { return \`<pre>\${JSON.stringify(markdown, null, 2)}</pre>\`; } catch { return ''; }
    }
    return String(markdown);
  }`;

if (code.includes('const markdownToHtml = (markdown) => {')) {
  const startIdx = code.indexOf('const markdownToHtml = (markdown) => {');
  const ifBlockEnd = code.indexOf('\r\n', startIdx + 30) !== -1 
    ? code.indexOf('\r\n', startIdx + 30) 
    : code.indexOf('\n', startIdx + 30);
  
  // Replace the whole if (!markdown) return '';
  const firstIf = code.substring(startIdx, ifBlockEnd + 2);
  code = code.replace(firstIf, safeMarkdownFn);
  console.log('Fixed markdownToHtml type checking');
} else {
  console.log('Could not find markdownToHtml');
}

// 2. Also harden htmlToMarkdown
const oldHtmlFn = 'const htmlToMarkdown = (html) => {';
if (code.includes(oldHtmlFn)) {
  const replaceHtmlFn = `const htmlToMarkdown = (html) => {
  if (html === null || html === undefined) return '';
  if (typeof html !== 'string') return String(html);`;
  code = code.replace(oldHtmlFn, replaceHtmlFn);
  console.log('Fixed htmlToMarkdown type checking');
}

// 3. Fix Recharts ResponsiveContainer width(-1) / height(-1) errors by providing minWidth={0} minHeight={200}
code = code.replaceAll('<ResponsiveContainer width="100%" height="100%">', '<ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={220}>');
console.log('Fixed Recharts ResponsiveContainer min dimensions');

fs.writeFileSync('src/pages/SevenMod.jsx', code);
console.log('Successfully saved src/pages/SevenMod.jsx');

