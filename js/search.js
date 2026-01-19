// static/js/search.js
console.log('search.js carregado');

document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('search');
  const resultsEl = document.getElementById('results');

  if (!input) return console.error('Elemento #search não encontrado');
  if (!resultsEl) return console.error('Elemento #results não encontrado — use <div id="results"></div>');

  let pages = [];

  async function loadIndex() {
    const tries = ['./index.json', 'index.json', '/index.json'];
    for (const path of tries) {
      try {
        const res = await fetch(path);
        console.log('fetch', path, '->', res.status);
        if (res.ok) {
          pages = await res.json();
          console.log('index.json carregado de', path, 'posts:', pages.length);
          return;
        }
      } catch (err) {
        console.warn('erro fetch', path, err);
      }
    }
    console.error('index.json não encontrado. Verifique layouts/_default/index.json e reinicie o Hugo.');
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/[&<>"'`=\/]/g, s =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;', '`': '&#96;', '=': '&#61;', '/': '&#47;' }[s])
    );
  }

  function render(list) {
    if (!list || list.length === 0) {
      resultsEl.innerHTML = '';
      resultsEl.style.maxHeight = '';
      resultsEl.style.overflowY = '';
      resultsEl.style.display = '';
      resultsEl.style.gap = '';
      resultsEl.style.padding = '';
      resultsEl.style.margin = '';
      return;
    }

    const items = list.slice(0, 5);

    // Estilos do container (inline para funcionar sem CSS)
    resultsEl.style.maxHeight = '420px';
    resultsEl.style.overflowY = 'auto';
    resultsEl.style.display = 'flex';
    resultsEl.style.flexDirection = 'column';
    resultsEl.style.gap = '8px';
    resultsEl.style.padding = '6px';
    resultsEl.style.margin = '0';

    // Monta cada cartão com <img> + overlay + link cobrindo tudo
    resultsEl.innerHTML = items.map(p => {
      const imageUrl = (p.image && p.image.length) ? p.image : '';
      const safeTitle = escapeHtml(p.title);
      const safeAlt = safeTitle || 'capa';
      const href = p.url || '#';

      // fallback visual: se não houver imagem usamos um gradiente claro (img com src vazio pode 404 em alguns hosts)
      const imgTag = imageUrl
        ? `<img class="search-img" src="${imageUrl}" alt="${safeAlt}">`
        : `<div></div>`;

      return `
        <div class="search-card">
          ${imgTag}
          <div class="search-overlay" aria-hidden="true"></div>

          <a href="${href}">
              <span>${safeTitle}</span>
            </div>
          </a>
        </div>
      `;
    }).join('');
  }

  function doSearch(q) {
    if (!q || q.trim().length < 2) { render([]); return []; }
    q = q.toLowerCase().trim();

    const matches = pages.filter(p =>
      (p.title && p.title.toLowerCase().includes(q)) ||
      (p.description && p.description.toLowerCase().includes(q)) ||
      (p.content && p.content.toLowerCase().includes(q)) ||
      (p.categories && JSON.stringify(p.categories).toLowerCase().includes(q))
    ).slice(0, 50); // busca até 50 internamente, mostra só 5
    render(matches);
    return matches;
  }

  input.addEventListener('input', e => doSearch(e.target.value));

  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const matches = doSearch(input.value);
      if (matches.length) window.location.href = matches[0].url;
    }
  });

  // carrega índice
  loadIndex();
});
