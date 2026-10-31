import fs from 'fs';

let code = fs.readFileSync('src/pages/SevenMod.jsx', 'utf8');

// Find AdminImageField input
const target = 'placeholder="Paste Image URL"';
const targetPos = code.indexOf(target);

if (targetPos !== -1) {
  // Find closing /> of this input tag
  const closeTag = '/>';
  const closePos = code.indexOf(closeTag, targetPos);
  
  if (closePos !== -1) {
    const before = code.substring(0, closePos + closeTag.length);
    const after = code.substring(closePos + closeTag.length);
    
    const bannerButton = `
          <button
            type="button"
            onClick={() => onChange('/assets/images/img/banner.png')}
            className="px-3 py-2 rounded-xl border border-primary/40 bg-primary/10 hover:bg-primary/20 text-primary font-mono text-xs font-bold transition-all flex items-center gap-1.5"
            title="Use official 5EVEN banner.png as thumbnail"
          >
            <span>Use Banner</span>
          </button>`;
          
    code = before + bannerButton + after;
    fs.writeFileSync('src/pages/SevenMod.jsx', code);
    console.log('Successfully added Use Banner button to AdminImageField');
  } else {
    console.log('Could not find closing input tag');
  }
} else {
  console.log('Could not find placeholder target');
}

