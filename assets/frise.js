/**
 * frise.js
 * Frise chronologique du calendrier : dessin SVG, export image (PNG) et
 * export Excel. Une colonne par mois, les échéances en cartes sous leur
 * mois (libellé complet), un point sur la bande des mois pour la date
 * exacte, et un repère "aujourd'hui".
 */
(function (global) {
  const MOIS = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
  const MOIS_LONGS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

  function parseIso(iso) {
    const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso || '');
    if (!m) return null;
    return Date.UTC(+m[1], +m[2] - 1, +m[3]);
  }

  function dateCourte(iso) {
    const t = parseIso(iso);
    if (t === null) return '';
    const d = new Date(t);
    return d.getUTCDate() + ' ' + MOIS[d.getUTCMonth()] + ' ' + d.getUTCFullYear();
  }

  function aujourdhuiIso() {
    const n = new Date();
    return n.getFullYear() + '-' + String(n.getMonth() + 1).padStart(2, '0') + '-' + String(n.getDate()).padStart(2, '0');
  }

  function decouper(texte, max, maxLignes) {
    const mots = String(texte || '').split(/\s+/).filter(Boolean);
    const lignes = [];
    let cur = '';
    mots.forEach(mot => {
      if ((cur + ' ' + mot).trim().length > max && cur) { lignes.push(cur); cur = mot; }
      else cur = (cur + ' ' + mot).trim();
    });
    if (cur) lignes.push(cur);
    if (maxLignes && lignes.length > maxLignes) { lignes.length = maxLignes; lignes[maxLignes - 1] = lignes[maxLignes - 1].slice(0, max - 1) + '…'; }
    return lignes;
  }

  function echapper(t) {
    return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  const JOUR = 86400000;
  const COL = 168, CAR = 21, INTERLIGNE = 15;

  /**
   * Calcule la géométrie (sans toucher au DOM, donc testable).
   * Présentation en colonnes : une colonne par mois, de gauche à droite, et
   * sous chaque mois les échéances dans l'ordre, libellé complet. Les mois
   * sans échéance restent visibles pour montrer les creux. Sur la bande des
   * mois, un point marque la position exacte de chaque date.
   */
  function calculerFrise(jalons, dateEvenement, aujourdhui) {
    const points = (jalons || [])
      .filter(j => parseIso(j.date) !== null)
      .map(j => ({ label: j.label, date: j.date, jourJ: false }));
    if (dateEvenement && parseIso(dateEvenement) !== null && !points.some(p => p.date === dateEvenement && /jour/i.test(p.label))) {
      points.push({ label: 'Jour J', date: dateEvenement, jourJ: true });
    }
    points.sort((a, b) => parseIso(a.date) - parseIso(b.date) || (a.jourJ ? 1 : 0) - (b.jourJ ? 1 : 0));

    const marge = 30, hautTitre = 78, hautBande = 42, gap = 10;
    const n = points.length;
    if (!n) return { points: [], colonnes: [], largeur: 900, hauteur: 200, xAujourdhui: null, indexAujourdhui: -1, marge, hautTitre, hautBande };

    const premier = new Date(parseIso(points[0].date)), dernier = new Date(parseIso(points[n - 1].date));
    const colonnes = [];
    let a = premier.getUTCFullYear(), m = premier.getUTCMonth();
    while (a < dernier.getUTCFullYear() || (a === dernier.getUTCFullYear() && m <= dernier.getUTCMonth())) {
      const d0 = Date.UTC(a, m, 1), d1 = Date.UTC(m === 11 ? a + 1 : a, (m + 1) % 12, 1);
      colonnes.push({ annee: a, mois: m, d0: d0, d1: d1, x: marge + colonnes.length * COL, items: [] });
      m++; if (m > 11) { m = 0; a++; }
    }
    const tj = parseIso(aujourdhui || aujourdhuiIso());
    let hauteurMax = 0;
    points.forEach(p => {
      const t = parseIso(p.date);
      const col = colonnes.find(c => t >= c.d0 && t < c.d1);
      p.col = col;
      p.fx = col.x + (t - col.d0) / (col.d1 - col.d0) * COL;   // position exacte dans la bande
      p.lignes = (p.jourJ && /^jour j$/i.test(p.label)) ? [] : decouper(p.label, CAR);
      p.hauteur = (p.lignes.length + 1) * INTERLIGNE + 14;
      col.items.push(p);
    });
    colonnes.forEach(c => {
      let y = hautTitre + hautBande + 16;
      c.items.forEach(p => { p.cy = y; y += p.hauteur + gap; });
      hauteurMax = Math.max(hauteurMax, y);
    });

    let xAujourdhui = null, indexAujourdhui = -1;
    colonnes.forEach((c, i) => {
      if (tj !== null && tj >= c.d0 && tj < c.d1) { xAujourdhui = c.x + (tj - c.d0) / (c.d1 - c.d0) * COL; indexAujourdhui = i; }
    });
    return {
      points, colonnes, largeur: marge * 2 + colonnes.length * COL, hauteur: hauteurMax + 14,
      xAujourdhui, indexAujourdhui, marge, hautTitre, hautBande
    };
  }

  function construireSvg(jalons, dateEvenement, titre, aujourdhui) {
    const g = calculerFrise(jalons, dateEvenement, aujourdhui);
    const tj = parseIso(aujourdhui || aujourdhuiIso());
    const tE = parseIso(dateEvenement);
    const o = [];
    o.push('<svg xmlns="http://www.w3.org/2000/svg" width="' + g.largeur + '" height="' + g.hauteur + '" viewBox="0 0 ' + g.largeur + ' ' + g.hauteur + '" font-family="Segoe UI, Roboto, Arial, sans-serif">');
    o.push('<rect width="100%" height="100%" fill="#ffffff"/>');
    o.push('<text x="' + (g.largeur / 2) + '" y="30" text-anchor="middle" font-size="22" font-weight="700" fill="#0d1b2a">' + echapper(titre || 'Calendrier') + '</text>');

    const yB = g.hautTitre;
    g.colonnes.forEach((c, i) => {
      const fond = i % 2 === 0 ? '#e9edf3' : '#f4f6f9';
      o.push('<rect x="' + c.x + '" y="' + yB + '" width="' + COL + '" height="' + g.hautBande + '" fill="' + fond + '" stroke="#c5ccd6"/>');
      const nom = MOIS_LONGS[c.mois] + ((i === 0 || c.mois === 0) ? ' ' + c.annee : '');
      o.push('<text x="' + (c.x + COL / 2) + '" y="' + (yB + 18) + '" text-anchor="middle" font-size="13" font-weight="700" fill="#0d1b2a">' + echapper(nom) + '</text>');
      // filet de colonne pour guider l'oeil
      o.push('<line x1="' + c.x + '" y1="' + (yB + g.hautBande) + '" x2="' + c.x + '" y2="' + (g.hauteur - 8) + '" stroke="#eef0f4"/>');
    });
    o.push('<line x1="' + (g.marge + g.colonnes.length * COL) + '" y1="' + (yB + g.hautBande) + '" x2="' + (g.marge + g.colonnes.length * COL) + '" y2="' + (g.hauteur - 8) + '" stroke="#eef0f4"/>');

    // Points de dates exactes sur la bande des mois.
    g.points.forEach(p => {
      const passe = tj !== null && parseIso(p.date) < tj;
      const couleur = p.jourJ ? '#c9a227' : (passe ? '#98a2b3' : '#0d1b2a');
      o.push('<circle cx="' + p.fx + '" cy="' + (yB + g.hautBande - 8) + '" r="' + (p.jourJ ? 5 : 3.5) + '" fill="' + couleur + '"/>');
    });

    // Repère "aujourd'hui".
    if (g.xAujourdhui !== null) {
      const x = g.xAujourdhui;
      o.push('<line x1="' + x + '" y1="' + (yB - 8) + '" x2="' + x + '" y2="' + (yB + g.hautBande) + '" stroke="#a4243b" stroke-width="2"/>');
      o.push('<polygon points="' + (x - 5) + ',' + (yB - 14) + ' ' + (x + 5) + ',' + (yB - 14) + ' ' + x + ',' + (yB - 6) + '" fill="#a4243b"/>');
      o.push('<text x="' + x + '" y="' + (yB - 18) + '" text-anchor="middle" font-size="11" font-weight="700" fill="#a4243b">Aujourd\'hui</text>');
    }

    // Cartes d'échéances, sous chaque mois.
    g.points.forEach(p => {
      const passe = tj !== null && parseIso(p.date) < tj;
      const couleur = p.jourJ ? '#c9a227' : (passe ? '#98a2b3' : '#0d1b2a');
      const x = p.col.x + 8, w = COL - 16;
      o.push('<rect x="' + x + '" y="' + p.cy + '" width="' + w + '" height="' + p.hauteur + '" rx="6" fill="' + (p.jourJ ? '#fbf5df' : '#ffffff') + '" stroke="#dfe3ea"/>');
      o.push('<rect x="' + x + '" y="' + p.cy + '" width="4" height="' + p.hauteur + '" rx="2" fill="' + couleur + '"/>');
      let ecart = '';
      if (tE !== null && !p.jourJ) {
        const j = Math.round((tE - parseIso(p.date)) / JOUR);
        ecart = j > 0 ? ' · J-' + j : (j < 0 ? ' · J+' + Math.abs(j) : '');
      }
      const d = new Date(parseIso(p.date));
      const entete = d.getUTCDate() + ' ' + MOIS[d.getUTCMonth()] + ecart + (p.jourJ ? ' · JOUR J' : '');
      o.push('<text x="' + (x + 12) + '" y="' + (p.cy + 18) + '" font-size="12" font-weight="700" fill="' + couleur + '">' + echapper(entete) + '</text>');
      p.lignes.forEach((l, k) => {
        o.push('<text x="' + (x + 12) + '" y="' + (p.cy + 18 + (k + 1) * INTERLIGNE) + '" font-size="12" fill="' + (passe ? '#667085' : '#1b1f24') + '">' + echapper(l) + '</text>');
      });
    });
    o.push('</svg>');
    return o.join('');
  }

  function telecharger(blob, nom) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = nom;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }

  function exporterPng(jalons, dateEvenement, titre, nomFichier) {
    const svg = construireSvg(jalons, dateEvenement, titre);
    const m = /width="(\d+(?:\.\d+)?)" height="(\d+(?:\.\d+)?)"/.exec(svg);
    const w = Math.round(+m[1]), h = Math.round(+m[2]);
    const img = new Image();
    img.onload = function () {
      const echelle = 2;
      const canvas = document.createElement('canvas');
      canvas.width = w * echelle; canvas.height = h * echelle;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(function (blob) { telecharger(blob, nomFichier || 'frise-rallye.png'); }, 'image/png');
    };
    img.onerror = function () { alert("Impossible de générer l'image."); };
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  }

  /** Données du classeur Excel : (a) liste des jalons, (b) grille par mois. */
  function preparerExcel(jalons, dateEvenement, aujourdhui) {
    const g = calculerFrise(jalons, dateEvenement, aujourdhui);
    const tj = parseIso(aujourdhui || aujourdhuiIso());
    const liste = [['Échéance', 'Date', 'Jours avant le Jour J', 'Statut']];
    const tE = parseIso(dateEvenement);
    g.points.forEach(p => {
      const t = parseIso(p.date);
      liste.push([p.label, p.date, tE === null ? '' : Math.round((tE - t) / 86400000), t < tj ? 'passé' : 'à venir']);
    });

    const grille = [];
    if (g.points.length) {
      const d0 = new Date(parseIso(g.points[0].date)), d1 = new Date(parseIso(g.points[g.points.length - 1].date));
      const mois = [];
      let a = d0.getUTCFullYear(), m = d0.getUTCMonth();
      while (a < d1.getUTCFullYear() || (a === d1.getUTCFullYear() && m <= d1.getUTCMonth())) {
        mois.push([a, m]);
        m++; if (m > 11) { m = 0; a++; }
      }
      grille.push(['Échéance', 'Date'].concat(mois.map(x => MOIS_LONGS[x[1]] + ' ' + x[0])));
      g.points.forEach(p => {
        const d = new Date(parseIso(p.date));
        grille.push([p.label, p.date].concat(mois.map(x => (x[0] === d.getUTCFullYear() && x[1] === d.getUTCMonth()) ? '●' : '')));
      });
    }
    return { liste, grille };
  }

  async function exporterExcel(jalons, dateEvenement, nomFichier) {
    await loadXLSXLib_();
    const { liste, grille } = preparerExcel(jalons, dateEvenement);
    const wb = XLSX.utils.book_new();
    const ws1 = XLSX.utils.aoa_to_sheet(liste);
    ws1['!cols'] = [{ wch: 50 }, { wch: 12 }, { wch: 20 }, { wch: 10 }];
    XLSX.utils.book_append_sheet(wb, ws1, 'Jalons');
    if (grille.length) {
      const ws2 = XLSX.utils.aoa_to_sheet(grille);
      ws2['!cols'] = [{ wch: 50 }, { wch: 12 }].concat(grille[0].slice(2).map(() => ({ wch: 13 })));
      XLSX.utils.book_append_sheet(wb, ws2, 'Frise');
    }
    XLSX.writeFile(wb, nomFichier || 'frise-rallye.xlsx');
  }

  /** Affiche la frise dans un conteneur (le SVG est construit puis injecté). */
  function afficher(conteneur, jalons, dateEvenement, titre) {
    conteneur.textContent = '';
    if (!jalons || !jalons.length) {
      const p = document.createElement('div');
      p.className = 'hint';
      p.textContent = "Renseignez la date de l'événement sur l'édition active pour voir la frise.";
      conteneur.appendChild(p);
      return;
    }
    conteneur.style.overflowX = 'auto';
    conteneur.innerHTML = construireSvg(jalons, dateEvenement, titre);
  }

  global.Frise = { calculerFrise, construireSvg, preparerExcel, afficher, exporterPng, exporterExcel, dateCourte };
  if (typeof module !== 'undefined') module.exports = global.Frise;
})(typeof window !== 'undefined' ? window : globalThis);
