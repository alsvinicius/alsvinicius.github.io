const USER = 'alsvinicius';
const API_URL = `https://api.github.com/users/${USER}/repos?type=owner&sort=updated&per_page=100`;

const grid = document.querySelector('#project-grid');
const count = document.querySelector('#result-count');
const search = document.querySelector('#search');
const languageSelect = document.querySelector('#language');
const sortSelect = document.querySelector('#sort');
const topicNote = document.querySelector('#topic-note');
const emptyState = document.querySelector('#empty-state');
const loadError = document.querySelector('#load-error');
const loadingState = document.querySelector('#loading-state');
let repositories = [];
let featuredOnly = false;

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

function renderCard(repo) {
  const topics = repo.topics || [];
  const featured = topics.includes('portfolio');
  const description = repo.description || 'Sem descrição por enquanto.';
  const descriptionClass = repo.description ? 'repo-description' : 'repo-description is-empty';
  const visibleTopics = topics.slice(0, 3);
  const archived = repo.archived ? '<span class="card-stat">arquivado</span>' : '';
  const fork = repo.fork ? '<span class="card-stat">fork</span>' : '';
  return `<article class="project-card">
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
  </article>`;
}

function render() {
  const query = search.value.trim().toLocaleLowerCase('pt-BR');
  let filtered = repositories.filter((repo) => {
    const matchesQuery = !query || [repo.name, repo.description, repo.language, ...(repo.topics || [])]
      .filter(Boolean).join(' ').toLocaleLowerCase('pt-BR').includes(query);
    const matchesLanguage = !languageSelect.value || repo.language === languageSelect.value;
    const matchesFeatured = !featuredOnly || (repo.topics || []).includes('portfolio');
    return matchesQuery && matchesLanguage && matchesFeatured;
  });

  if (sortSelect.value === 'stars') filtered.sort((a, b) => b.stargazers_count - a.stargazers_count);
  else if (sortSelect.value === 'name') filtered.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
  else filtered.sort((a, b) => new Date(b.pushed_at || b.updated_at) - new Date(a.pushed_at || a.updated_at));

  grid.innerHTML = filtered.map(renderCard).join('');
  count.textContent = `${filtered.length} ${filtered.length === 1 ? 'repositório' : 'repositórios'}`;
  grid.hidden = filtered.length === 0;
  emptyState.hidden = filtered.length > 0;
  topicNote.hidden = !featuredOnly;
  grid.setAttribute('aria-busy', 'false');
}

async function loadRepositories() {
  loadingState.hidden = false;
  loadError.hidden = true;
  grid.hidden = true;
  emptyState.hidden = true;
  grid.setAttribute('aria-busy', 'true');
  try {
    const response = await fetch(API_URL, { headers: { Accept: 'application/vnd.github+json' } });
    if (!response.ok) throw new Error(`GitHub API respondeu ${response.status}`);
    const data = await response.json();
    if (!Array.isArray(data)) throw new Error('Resposta inesperada da API do GitHub');
    repositories = data.filter((repo) => !repo.private);
    populateLanguages();
    loadingState.hidden = true;
    grid.hidden = false;
    render();
  } catch (error) {
    loadingState.hidden = true;
    grid.setAttribute('aria-busy', 'false');
    count.textContent = 'GitHub indisponível';
    loadError.hidden = false;
  }
}

search.addEventListener('input', render);
languageSelect.addEventListener('change', render);
sortSelect.addEventListener('change', render);
document.querySelector('#retry').addEventListener('click', loadRepositories);
document.querySelector('#clear-topic').addEventListener('click', () => { featuredOnly = false; render(); });
document.querySelector('#reset-filters').addEventListener('click', () => {
  search.value = '';
  languageSelect.value = '';
  featuredOnly = false;
  render();
});
document.querySelector('.text-link').addEventListener('click', (event) => {
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  const featured = repositories.some((repo) => (repo.topics || []).includes('portfolio'));
  if (!featured) return;
  event.preventDefault();
  featuredOnly = true;
  render();
  document.querySelector('#repositorios').scrollIntoView({ behavior: 'smooth' });
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
