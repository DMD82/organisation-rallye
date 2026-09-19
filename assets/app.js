/**
 * app.js
 * Client API partagé par toutes les pages. L'URL /exec de l'Apps Script est
 * la seule chose à renseigner ci-dessous - c'est une URL publique par
 * nature, aucun secret. Le jeton de session vit en sessionStorage (jamais
 * en dur dans le code), fourni par le backend après connexion Google.
 */

const API_URL = 'https://script.google.com/macros/s/AKfycbw5X3hiRPvmyokYL5lygNDDbWvgRyiPu_O8tcojisvcuSCUOuxqg1O3B1s_THDtqVBfSw/exec';

function getToken() {
  return sessionStorage.getItem('rc_token');
}
function setSession(token, user) {
  sessionStorage.setItem('rc_token', token);
  sessionStorage.setItem('rc_user', JSON.stringify(user));
}
function getUser() {
  const raw = sessionStorage.getItem('rc_user');
  return raw ? JSON.parse(raw) : null;
}
function clearSession() {
  sessionStorage.removeItem('rc_token');
  sessionStorage.removeItem('rc_user');
}

function requireAuth() {
  if (!getToken()) {
    window.location.href = 'index.html';
  }
}

async function apiGet(action, params) {
  const qs = new URLSearchParams(Object.assign({ action: action }, params || {})).toString();
  const resp = await fetch(API_URL + '?' + qs, { method: 'GET' });
  return resp.json();
}

async function apiPost(action, payload) {
  const resp = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' }, // évite le préflight CORS
    body: JSON.stringify({ action: action, token: getToken(), payload: payload || {} })
  });
  const data = await resp.json();
  if (!data.success && data.error && data.error.code === 'AUTH_REQUIRED') {
    clearSession();
    window.location.href = 'index.html';
  }
  return data;
}

function euros(n) {
  return Number(n || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
}

/**
 * Export CSV générique côté navigateur : convertit un tableau d'objets
 * (tel que renvoyé par les actions .list) en fichier CSV téléchargé
 * directement, sans passer par le backend.
 */
function exportCSV(filename, rows) {
  if (!rows || !rows.length) { alert('Rien à exporter.'); return; }
  const headers = Object.keys(rows[0]);
  const escape = v => '"' + String(v === undefined || v === null ? '' : v).replace(/"/g, '""') + '"';
  const lines = [
    headers.map(escape).join(','),
    ...rows.map(r => headers.map(h => escape(r[h])).join(','))
  ];
  const blob = new Blob(['\uFEFF' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.csv') ? filename : filename + '.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

const NAV_PAGES = [
  { href: 'generale.html', label: 'Générale' },
  { href: 'budget.html', label: 'Budget et Mécènes' },
  { href: 'bibliotheque.html', label: 'Bibliothèque' }
];

function renderTopbar(activePage) {
  const user = getUser();
  const el = document.getElementById('topbar');
  if (!el) return;
  const navLinks = NAV_PAGES.map(p => `
    <a href="${p.href}" class="topbar-nav-link${p.href === activePage ? ' active' : ''}">${p.label}</a>
  `).join('');
  el.innerHTML = `
    <div class="topbar-row">
      <h1>Rallye Citoyen - Organisation</h1>
      <div class="user">${user ? user.nom + ' · ' + user.role : ''}
        <button class="topbar-logout" onclick="clearSession();location.href='index.html'">Déconnexion</button>
      </div>
    </div>
    <nav class="topbar-nav">${navLinks}</nav>`;
}
