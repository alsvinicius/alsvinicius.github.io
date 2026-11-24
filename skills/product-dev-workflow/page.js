(function () {
  'use strict';
  const LANGS = ['en', 'pt-BR', 'zh-CN', 'ja', 'es', 'fr'];
  const THEMES = ['chalk', 'graphite', 'workshop'];
  const I18N = window.I18N || {};
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* storage unavailable */ } }
  };

  // Snapshot the English text from the DOM, so English is never duplicated in JS.
  const en = { 'meta.title': document.title, 'meta.desc': $('meta[name="description"]').content, steps: I18N.en ? I18N.en.steps : {} };
  $$('[data-i18n]').forEach((el) => { en[el.dataset.i18n] = el.textContent; });
  $$('[data-i18n-attr]').forEach((el) => {
    const [attr, key] = el.dataset.i18nAttr.split(':');
    en[key] = el.getAttribute(attr);
  });
  I18N.en = en;

  let lang = 'en';
  let current = 'prd-generator';

  function t(key) {
    const d = I18N[lang] || {};
    return key in d ? d[key] : en[key];
  }

  function phaseOf(btn) {
    const plate = btn.closest('.plate');
    return plate ? $('.plate-title', plate).textContent : '';
  }

  function renderStep() {
    const btn = $('.step-key[data-step="' + current + '"]');
    if (!btn) return;
    const steps = (I18N[lang] && I18N[lang].steps) || en.steps;
    const s = steps[current] || en.steps[current];
    $('#step-phase').textContent = phaseOf(btn);
    $('#step-command').textContent = '/' + current;
    $('#step-desc').textContent = s[0];
    $('#step-out').textContent = s[1];
    $$('.step-key').forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
  }

  function applyLang(next, persist) {
    if (LANGS.indexOf(next) < 0) next = 'en';
    lang = next;
    $$('[data-i18n]').forEach((el) => { el.textContent = t(el.dataset.i18n); });
    $$('[data-i18n-attr]').forEach((el) => {
      const [attr, key] = el.dataset.i18nAttr.split(':');
      el.setAttribute(attr, t(key));
    });
    document.documentElement.lang = lang;
    document.title = t('meta.title');
    $('meta[name="description"]').content = t('meta.desc');
    $('#lang').value = lang;
    renderStep();
    if (persist) {
      store.set('pdw-lang', lang);
      try {
        const u = new URL(location.href);
        u.searchParams.set('lang', lang);
        history.replaceState(null, '', u);
      } catch (e) { /* ignore */ }
    }
  }

  function pickLang() {
    const q = new URLSearchParams(location.search).get('lang');
    if (q && LANGS.indexOf(q) >= 0) return q;
    const saved = store.get('pdw-lang');
    if (saved && LANGS.indexOf(saved) >= 0) return saved;
    const prefs = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || 'en'];
    for (const p of prefs) {
      const l = String(p).toLowerCase();
      if (l.startsWith('pt')) return 'pt-BR';
      if (l.startsWith('zh')) return 'zh-CN';
      if (l.startsWith('ja')) return 'ja';
      if (l.startsWith('es')) return 'es';
      if (l.startsWith('fr')) return 'fr';
      if (l.startsWith('en')) return 'en';
    }
    return 'en';
  }

  function applyTheme(name) {
    if (THEMES.indexOf(name) < 0) name = 'chalk';
    document.body.dataset.theme = name;
    $$('[data-theme-key]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.themeKey === name)));
    const colours = { chalk: '#e9e7e1', graphite: '#151719', workshop: '#e8e1cf' };
    $('meta[name="theme-color"]').content = colours[name];
  }

  $('#lang').addEventListener('change', (e) => applyLang(e.target.value, true));
  $$('[data-theme-key]').forEach((b) => b.addEventListener('click', () => {
    applyTheme(b.dataset.themeKey);
    store.set('pdw-theme', b.dataset.themeKey);
  }));
  $$('.step-key').forEach((b) => b.addEventListener('click', () => { current = b.dataset.step; renderStep(); }));

  $('#year').textContent = new Date().getFullYear();
  applyTheme(store.get('pdw-theme') || 'chalk');
  applyLang(pickLang(), false);
})();
