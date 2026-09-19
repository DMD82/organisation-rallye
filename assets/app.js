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
  { href: 'partenaires.html', label: 'Partenaires et Ateliers' },
  { href: 'autorites.html', label: 'Autorités et invités' },
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

/**
 * Documents liés à une fiche (mécène, partenaire, invité, ligne budgétaire).
 * Réutilise le catalogue Bibliothèque (DOCUMENTS) via record_type/record_id,
 * plutôt que de dupliquer un mécanisme d'attachement par module.
 * recordType attendu : 'mecene' | 'partenariat' | 'invitation' | 'budget_ligne'.
 */
async function showDocumentsModal(recordType, recordId, recordLabel) {
  closeDocumentsModal();

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.id = 'doc-modal-overlay';
  overlay.addEventListener('click', e => { if (e.target === overlay) closeDocumentsModal(); });
  overlay.innerHTML = `
    <div class="modal-box">
      <div style="display:flex;justify-content:space-between;align-items:center">
        <h3 style="margin:0">Documents - ${recordLabel}</h3>
        <button class="secondary" onclick="closeDocumentsModal()">Fermer</button>
      </div>
      <div id="doc-modal-list" style="margin:16px 0"><div class="hint">Chargement…</div></div>
      <form class="inline-form" id="doc-modal-form" style="margin-bottom:0">
        <div><label>Titre</label><input name="titre" placeholder="Convention signée, devis..." required></div>
        <div><label>Lien Drive</label><input name="lien_drive" placeholder="https://docs.google.com/..." required></div>
        <div><button type="submit">Ajouter</button></div>
      </form>
    </div>`;
  document.body.appendChild(overlay);

  async function reload() {
    const res = await apiGet('documents.list', { record_type: recordType, record_id: recordId });
    const listEl = document.getElementById('doc-modal-list');
    if (!listEl) return; // fenêtre fermée entre-temps
    if (!res.success || !res.data.length) { listEl.innerHTML = '<div class="hint">Aucun document lié pour l\'instant.</div>'; return; }
    listEl.innerHTML = res.data.map(d => `
      <div style="display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px solid var(--border)">
        <a href="${d.lien_drive}" target="_blank">${d.titre}</a>
        <button class="secondary" onclick="deleteDocumentLie_('${d.id}', '${recordType}', '${recordId}')">Supprimer</button>
      </div>`).join('');
  }

  document.getElementById('doc-modal-form').addEventListener('submit', async e => {
    e.preventDefault();
    const payload = Object.fromEntries(new FormData(e.target).entries());
    payload.record_type = recordType;
    payload.record_id = recordId;
    payload.categorie = 'autre';
    payload.type = 'archive_edition';
    const res = await apiPost('documents.create', payload);
    if (res.success) { e.target.reset(); reload(); }
    else alert('Erreur : ' + res.error.message);
  });

  reload();
}

async function deleteDocumentLie_(docId, recordType, recordId) {
  if (!confirm('Supprimer ce document lié ?')) return;
  const res = await apiPost('documents.delete', { id: docId });
  if (res.success) {
    const listEl = document.getElementById('doc-modal-list');
    if (listEl) {
      const res2 = await apiGet('documents.list', { record_type: recordType, record_id: recordId });
      listEl.innerHTML = (!res2.success || !res2.data.length)
        ? '<div class="hint">Aucun document lié pour l\'instant.</div>'
        : res2.data.map(d => `
          <div style="display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px solid var(--border)">
            <a href="${d.lien_drive}" target="_blank">${d.titre}</a>
            <button class="secondary" onclick="deleteDocumentLie_('${d.id}', '${recordType}', '${recordId}')">Supprimer</button>
          </div>`).join('');
    }
  } else alert('Erreur : ' + res.error.message);
}

function closeDocumentsModal() {
  const el = document.getElementById('doc-modal-overlay');
  if (el) el.remove();
}

/**
 * Import en masse depuis un fichier Excel (.xlsx) ou CSV, avec mise en
 * correspondance des colonnes à l'écran. Réutilise les actions .create déjà
 * existantes (une requête par ligne) plutôt qu'une logique d'import dédiée
 * côté Apps Script - un seul composant pour Mécènes, Lignes budgétaires,
 * Partenaires, Autorités, Documents.
 *
 * config = {
 *   title: 'Mécènes',
 *   action: 'budget.mecenes.create',
 *   fields: [{ key: 'nom_entite', label: 'Entité', required: true }, ...],
 *   defaults: { edition_id: '...' },   // valeurs fixes ajoutées à chaque ligne
 *   onDone: function() { ... }         // rafraîchit la liste après import
 * }
 */
let _xlsxLoaded = false;
function loadXLSXLib_() {
  return new Promise((resolve, reject) => {
    if (_xlsxLoaded || window.XLSX) { _xlsxLoaded = true; resolve(); return; }
    const s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
    s.onload = () => { _xlsxLoaded = true; resolve(); };
    s.onerror = () => reject(new Error('Impossible de charger la bibliothèque de lecture Excel.'));
    document.head.appendChild(s);
  });
}

async function showImportModal(config) {
  closeImportModal();

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.id = 'import-modal-overlay';
  overlay.addEventListener('click', e => { if (e.target === overlay) closeImportModal(); });
  overlay.innerHTML = `
    <div class="modal-box" style="max-width:720px">
      <div style="display:flex;justify-content:space-between;align-items:center">
        <h3 style="margin:0">Importer - ${config.title}</h3>
        <button class="secondary" onclick="closeImportModal()">Fermer</button>
      </div>
      <p class="hint">Fichier Excel (.xlsx) ou CSV, avec une ligne d'en-tête. Vous ferez correspondre les colonnes à l'étape suivante.</p>
      <div id="import-file-loading" class="hint" style="display:none">Chargement…</div>
      <input type="file" id="import-file-input" accept=".xlsx,.xls,.csv">
      <div id="import-mapping" style="margin-top:16px"></div>
      <div id="import-progress" class="hint" style="margin-top:12px"></div>
    </div>`;
  document.body.appendChild(overlay);

  document.getElementById('import-file-input').addEventListener('change', async e => {
    const file = e.target.files[0];
    if (!file) return;
    document.getElementById('import-file-loading').style.display = '';
    try {
      await loadXLSXLib_();
      const data = await file.arrayBuffer();
      const wb = XLSX.read(data, { type: 'array' });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
      document.getElementById('import-file-loading').style.display = 'none';
      if (!rows.length) { alert('Fichier vide.'); return; }
      const headers = rows[0].map(h => String(h || '').trim());
      const dataRows = rows.slice(1).filter(r => r.some(c => c !== ''));
      renderImportMapping_(config, headers, dataRows);
    } catch (err) {
      document.getElementById('import-file-loading').style.display = 'none';
      alert('Erreur de lecture du fichier : ' + err.message);
    }
  });
}

function renderImportMapping_(config, headers, dataRows) {
  const mapEl = document.getElementById('import-mapping');
  const normalize = s => String(s || '').toLowerCase().replace(/[^a-z0-9]/g, '');

  const guessColumn = (field) => {
    let idx = headers.findIndex(h => normalize(h) === normalize(field.label));
    if (idx === -1) idx = headers.findIndex(h => normalize(h) === normalize(field.key));
    if (idx === -1) idx = headers.findIndex(h => normalize(h).includes(normalize(field.key)) || normalize(field.key).includes(normalize(h)));
    return idx;
  };

  const selects = config.fields.map(f => {
    const guessed = guessColumn(f);
    const options = ['<option value="">- ignorer -</option>']
      .concat(headers.map((h, i) => `<option value="${i}"${i === guessed ? ' selected' : ''}>${h}</option>`));
    return `<div>
      <label style="font-size:0.8rem;color:var(--muted);display:block;margin-bottom:3px">${f.label}${f.required ? ' *' : ''}</label>
      <select data-field="${f.key}">${options.join('')}</select>
    </div>`;
  }).join('');

  mapEl.innerHTML = `
    <p class="hint">${dataRows.length} ligne(s) détectée(s). Vérifiez la correspondance des colonnes (déjà pré-remplie de façon automatique quand c'est possible) :</p>
    <div class="inline-form" style="grid-template-columns:repeat(auto-fit,minmax(180px,1fr))">${selects}</div>
    <button id="import-run-btn" style="margin-top:12px">Importer ${dataRows.length} ligne(s)</button>
  `;

  document.getElementById('import-run-btn').addEventListener('click', () => runImport_(config, dataRows));
}

async function runImport_(config, dataRows) {
  const selects = document.querySelectorAll('#import-mapping select');
  const mapping = {};
  selects.forEach(s => { if (s.value !== '') mapping[s.dataset.field] = Number(s.value); });

  const missing = config.fields.filter(f => f.required && mapping[f.key] === undefined);
  if (missing.length) { alert('Champs obligatoires non associés à une colonne : ' + missing.map(f => f.label).join(', ')); return; }

  const runBtn = document.getElementById('import-run-btn');
  runBtn.disabled = true;
  const progressEl = document.getElementById('import-progress');
  let ok = 0, fail = 0;

  for (let i = 0; i < dataRows.length; i++) {
    const row = dataRows[i];
    const payload = Object.assign({}, config.defaults || {});
    Object.keys(mapping).forEach(key => { payload[key] = row[mapping[key]]; });
    progressEl.textContent = 'Import en cours... ' + (i + 1) + '/' + dataRows.length;
    try {
      const res = await apiPost(config.action, payload);
      if (res.success) ok++; else fail++;
    } catch (e) { fail++; }
  }

  progressEl.textContent = 'Terminé : ' + ok + ' importée(s), ' + fail + ' échec(s).';
  if (config.onDone) config.onDone();
}

function closeImportModal() {
  const el = document.getElementById('import-modal-overlay');
  if (el) el.remove();
}
