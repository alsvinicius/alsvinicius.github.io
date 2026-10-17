const USER = 'alsvinicius';
const API_URL = `https://api.github.com/users/${USER}/repos?type=owner&sort=updated&per_page=100`;

const grid = document.querySelector('#project-grid');
const featuredProject = document.querySelector('#featured-project');
const count = document.querySelector('#result-count');
const search = document.querySelector('#search');
const languageSelect = document.querySelector('#language');
const sortSelect = document.querySelector('#sort');
const emptyState = document.querySelector('#empty-state');
const loadError = document.querySelector('#load-error');
const loadingState = document.querySelector('#loading-state');
let repositories = [];

document.querySelector('#year').textContent = new Date().getFullYear();

function relativeDate(value) {
  const days = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 86400000));
  if (days === 0) return 'hoje';
  if (days === 1) return 'ontem';
  if (days < 30) return `há ${days} dias`;
  if (days < 365) return `há ${Math.floor(days / 30)} meses`;
  return `há ${Math.floor(days / 365)} anos`;
}

function escapeHtml(value = '') {
  return String(value).replace(/[&<>"']/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[char]);
}

function populateLanguages() {
  const selected = languageSelect.value;
  const languages = [...new Set(repositories.map((repo) => repo.language).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b, 'pt-BR'));
  languageSelect.innerHTML = '<option value="">Todas as linguagens</option>' +
    languages.map((language) => `<option value="${escapeHtml(language)}">${escapeHtml(language)}</option>`).join('');
  languageSelect.value = languages.includes(selected) ? selected : '';
}

function artworkClass(name) {
  let hash = 0;
  for (const char of name) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return `artwork artwork-${hash % 6}`;
}

function artworkScene(theme) {
  const scenes = [
    '<div class="scene-terminal"><span>09:00 <i></i></span><span>12:30 <i></i><b>▶</b></span><span>18:00 <i></i></span></div>',
    '<div class="scene-books"><i></i><i></i><i></i></div>',
    '<div class="scene-mosaic"><i></i><i></i><i></i><i></i><i></i><i></i></div>',
    '<div class="scene-orbit"><i></i><i></i><b></b></div>',
    '<div class="scene-nodes"><i></i><i></i><i></i><i></i><i></i></div>',
    '<div class="scene-waves"><i></i><i></i><i></i><i></i></div>'
  ];
  return scenes[theme];
}

function renderArtwork(repo) {
  const name = escapeHtml(repo.name);
  const language = escapeHtml(repo.language || 'OPEN SOURCE');
  const className = artworkClass(repo.name);
  const theme = Number(className.match(/artwork-(\d+)/)[1]);
  return `<div class="${className}" aria-hidden="true">
    <span class="artwork-index">${language}</span>
    ${artworkScene(theme)}
    <span class="artwork-name">${name}</span>
    <span class="artwork-mark">↗</span>
  </div>`;
}

function renderFeatured(repo) {
  const description = repo.description || 'Sem descrição.';
  return `<a class="selected-project" href="${escapeHtml(repo.html_url)}" target="_blank" rel="noreferrer">
    ${renderArtwork(repo)}
    <div class="selected-copy"><span class="project-type">${escapeHtml(repo.language || 'Repositório público')}</span>
      <h3>${escapeHtml(repo.name)}</h3>
      <p>${escapeHtml(description)}</p>
      <span class="feature-link">Ver projeto no GitHub <span aria-hidden="true">↗</span></span>
    </div>
  </a>`;
}

function renderCard(repo, index) {
  const topics = repo.topics || [];
  const featured = topics.includes('portfolio');
  const description = repo.description || 'Sem descrição.';
  const descriptionClass = repo.description ? 'repo-description' : 'repo-description is-empty';
  const visibleTopics = topics.slice(0, 3);
  const archived = repo.archived ? '<span class="card-stat">arquivado</span>' : '';
  const fork = repo.fork ? '<span class="card-stat">fork</span>' : '';
  return `<article class="project-card">
    <div class="card-copy"><span class="repo-index">${String(index + 1).padStart(2, '0')}</span>
      <div class="card-top">
        <a class="repo-name" href="${escapeHtml(repo.html_url)}" target="_blank" rel="noreferrer">${escapeHtml(repo.name)}</a>
        ${featured ? '<span class="featured-label">✳ destaque</span>' : `<a class="repo-arrow" href="${escapeHtml(repo.html_url)}" target="_blank" rel="noreferrer" aria-label="Abrir ${escapeHtml(repo.name)} no GitHub">↗</a>`}
      </div>
      <p class="${descriptionClass}">${escapeHtml(description)}</p>
      <div class="topic-list">${visibleTopics.map((topic) => `<span class="topic-tag">${escapeHtml(topic)}</span>`).join('')}</div>
      <div class="card-foot">
        ${repo.language ? `<span><span class="language-dot"></span>${escapeHtml(repo.language)}</span>` : ''}
        <span class="card-stat" aria-label="${repo.stargazers_count} estrelas">☆ ${repo.stargazers_count}</span>
        ${repo.forks_count ? `<span class="card-stat" aria-label="${repo.forks_count} forks">⑂ ${repo.forks_count}</span>` : ''}
        ${fork}${archived}
        <span class="card-updated">${relativeDate(repo.pushed_at || repo.updated_at)}</span>
      </div>
    </div>
  </article>`;
}

function chooseFeatured(items) {
  if (items.length <= 3) return items;
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const other = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[other]] = [shuffled[other], shuffled[index]];
  }

  const previous = (() => {
    try { return JSON.parse(localStorage.getItem('portfolio-last-featured') || '[]'); }
    catch { return []; }
  })();
  let chosen = shuffled.slice(0, 3);
  const selectionKey = (selection) => selection.map((repo) => repo.name).sort().join('|');
  if (selectionKey(chosen) === [...previous].sort().join('|')) {
    chosen = shuffled.slice(1, 4);
  }
  try { localStorage.setItem('portfolio-last-featured', JSON.stringify(chosen.map((repo) => repo.name))); } catch {}
  return chosen;
}

function renderFeaturedProject() {
  featuredProject.innerHTML = chooseFeatured(repositories).map(renderFeatured).join('');
  document.querySelector('#featured-status').hidden = repositories.length > 0;
  document.querySelector('#featured-status').textContent = 'Nenhum repositório público disponível.';
}

function renderOverview() {
  const languages = new Map();
  for (const repo of repositories) {
    if (repo.language) languages.set(repo.language, (languages.get(repo.language) || 0) + 1);
  }
  const sorted = [...languages.entries()].sort((a, b) => b[1] - a[1]);
  const groups = sorted.slice(0, 3);
  const otherCount = sorted.slice(3).reduce((sum, [, total]) => sum + total, 0);
  if (otherCount) groups.push(['Outras', otherCount]);
  const colors = ['#c6d0c9', '#9baca4', '#788f84', '#688579'];
  document.querySelector('#repo-total').textContent = String(repositories.length).padStart(2, '0');
  document.querySelector('#language-total').textContent = languages.size;
  document.querySelector('#star-total').textContent = repositories.reduce((sum, repo) => sum + repo.stargazers_count, 0);
  document.querySelector('#language-meter').innerHTML = groups.map(([, total]) => `<span style="flex:${total}"></span>`).join('');
  document.querySelector('#language-legend').innerHTML = groups.length
    ? groups.map(([name, total], index) => `<span class="legend-item"><i class="legend-dot" style="--dot-color:${colors[index]}" aria-hidden="true"></i>${escapeHtml(name)} · ${total}</span>`).join('')
    : '<span>Nenhuma linguagem informada</span>';
  document.querySelector('#api-status').textContent = 'Dados carregados do GitHub';
  const readout = document.querySelector('#overview-readout');
  readout.dataset.state = 'ready';
  readout.setAttribute('aria-busy', 'false');
}

function render() {
  const query = search.value.trim().toLocaleLowerCase('pt-BR');
  let filtered = repositories.filter((repo) => {
    const matchesQuery = !query || [repo.name, repo.description, repo.language, ...(repo.topics || [])]
      .filter(Boolean).join(' ').toLocaleLowerCase('pt-BR').includes(query);
    const matchesLanguage = !languageSelect.value || repo.language === languageSelect.value;
    return matchesQuery && matchesLanguage;
  });

  if (sortSelect.value === 'stars') filtered.sort((a, b) => b.stargazers_count - a.stargazers_count);
  else if (sortSelect.value === 'name') filtered.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
  else filtered.sort((a, b) => new Date(b.pushed_at || b.updated_at) - new Date(a.pushed_at || a.updated_at));

  grid.innerHTML = filtered.map((repo, index) => renderCard(repo, index)).join('');
  count.textContent = `${filtered.length} ${filtered.length === 1 ? 'repositório' : 'repositórios'}`;
  grid.hidden = filtered.length === 0;
  emptyState.hidden = filtered.length > 0;
  grid.setAttribute('aria-busy', 'false');
}

async function loadRepositories() {
  loadingState.hidden = false;
  loadError.hidden = true;
  grid.hidden = true;
  emptyState.hidden = true;
  grid.setAttribute('aria-busy', 'true');
  document.querySelector('#overview-readout').setAttribute('aria-busy', 'true');
  document.querySelector('#overview-readout').removeAttribute('data-state');
  document.querySelector('#api-status').textContent = 'Conectando ao GitHub';
  try {
    const response = await fetch(API_URL, { headers: { Accept: 'application/vnd.github+json' } });
    if (!response.ok) throw new Error(`GitHub API respondeu ${response.status}`);
    const data = await response.json();
    if (!Array.isArray(data)) throw new Error('Resposta inesperada da API do GitHub');
    repositories = data.filter((repo) => !repo.private);
    populateLanguages();
    renderFeaturedProject();
    renderOverview();
    loadingState.hidden = true;
    grid.hidden = false;
    render();
  } catch (error) {
    loadingState.hidden = true;
    grid.setAttribute('aria-busy', 'false');
    count.textContent = 'Não foi possível carregar';
    loadError.hidden = false;
    document.querySelector('#featured-status').hidden = false;
    document.querySelector('#featured-status').textContent = 'A seleção estará disponível quando a conexão com o GitHub voltar.';
    document.querySelector('#api-status').textContent = 'Conexão indisponível';
    document.querySelector('#overview-readout').dataset.state = 'error';
    document.querySelector('#overview-readout').setAttribute('aria-busy', 'false');
  }
}

search.addEventListener('input', render);
languageSelect.addEventListener('change', render);
sortSelect.addEventListener('change', render);
document.querySelector('#retry').addEventListener('click', loadRepositories);
document.querySelector('#reset-filters').addEventListener('click', () => {
  search.value = '';
  languageSelect.value = '';
  render();
});
document.addEventListener('keydown', (event) => {
  if (event.key === '/' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) {
    event.preventDefault();
    search.focus();
  }
  if (event.key === 'Escape' && document.activeElement === search) {
    search.value = '';
    search.blur();
    render();
  }
});

loadRepositories();
