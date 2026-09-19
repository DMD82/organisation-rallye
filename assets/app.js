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

function renderTopbar(activeModule) {
  const user = getUser();
  const el = document.getElementById('topbar');
  if (!el) return;
  el.innerHTML = `
    <h1>Rallye Citoyen - Organisation</h1>
    <div class="user">${user ? user.nom + ' · ' + user.role : ''}
      <button class="topbar-logout" onclick="clearSession();location.href='index.html'">Déconnexion</button>
    </div>`;
}
