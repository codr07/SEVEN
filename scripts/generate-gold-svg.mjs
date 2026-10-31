import fs from 'fs';

let svg = fs.readFileSync('src/assets/seven.svg', 'utf8');

const replacements = {
  '#FFFFFF': '#fcf6ba',
  '#EFFCF2': '#fef08a',
  '#EAFAF0': '#fef08a',
  '#DEF3E6': '#fdf0a6',
  '#D8F7E2': '#fae287',
  '#D7F1E1': '#f5d061',
  '#D6F1DF': '#f5d061',
  '#CEE4D7': '#e5be48',
  '#CCEBD7': '#dfb73e',
  '#CBE9D5': '#d4af37',
  '#CAE6D4': '#d4af37',
  '#CAE4D4': '#d4af37',
  '#C7E7D2': '#cca530',
  '#C7E0CF': '#cca530',
  '#C6E7D2': '#c59d28',
  '#C4E1CE': '#c59d28',
  '#C3DCCC': '#b89122',
  '#C1D9CA': '#aa831b',
  '#C0DACA': '#aa831b',
  '#BED3C5': '#9b7415',
  '#A1C4AD': '#875c1c'
};

for (const [orig, gold] of Object.entries(replacements)) {
  const pattern = new RegExp('fill="' + orig + '"', 'gi');
  svg = svg.replace(pattern, 'fill="' + gold + '"');
}

fs.writeFileSync('src/assets/seven-gold.svg', svg);
console.log('Saved src/assets/seven-gold.svg successfully');

