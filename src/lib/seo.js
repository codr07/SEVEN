export const updateMetadata = (meta) => {
  const { title, description, image, url } = meta;
  const fullTitle = `${title} | 5EVEN Institution`;
  
  document.title = fullTitle;

  const updateTag = (selector, attr, content) => {
    if (!content) return;
    let el = document.querySelector(selector);
    if (!el) {
      el = document.createElement('meta');
      if (selector.startsWith('meta[name')) {
        const name = selector.split('"')[1];
        el.setAttribute('name', name);
      } else if (selector.startsWith('meta[property')) {
        const prop = selector.split('"')[1];
        el.setAttribute('property', prop);
      }
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  };

  // Standard Tags
  updateTag('meta[name="description"]', 'content', description);

  // Open Graph Tags
  updateTag('meta[property="og:title"]', 'content', fullTitle);
  updateTag('meta[property="og:description"]', 'content', description);
  updateTag('meta[property="og:image"]', 'content', image);
  updateTag('meta[property="og:url"]', 'content', url || window.location.href);

  // Twitter Tags
  updateTag('meta[name="twitter:title"]', 'content', fullTitle);
  updateTag('meta[name="twitter:description"]', 'content', description);
  updateTag('meta[name="twitter:image"]', 'content', image);
};
