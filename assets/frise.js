/**
 * frise.js
 * Frise chronologique du calendrier : dessin SVG, export image (PNG) et
 * export Excel. L'axe est à l'échelle du temps, avec une bande par mois, et
 * chaque jalon est placé à sa vraie date. Les étiquettes sont espacées pour
 * ne pas se chevaucher et reliées à leur date par un trait. Le repère
 * "aujourd'hui" est placé à sa vraie position.
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

  function decouper(texte, max) {
    const mots = String(texte || '').split(/\s+/).filter(Boolean);
    const lignes = [];
    let cur = '';
    mots.forEach(mot => {
      if ((cur + ' ' + mot).trim().length > max && cur) { lignes.push(cur); cur = mot; }
      else cur = (cur + ' ' + mot).trim();
    });
    if (cur) lignes.push(cur);
    if (lignes.length > 3) { lignes.length = 3; lignes[2] = lignes[2].slice(0, max - 1) + '…'; }
    return lignes;
  }

  function echapper(t) {
    return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  const JOUR = 86400000;

  /**
   * Calcule la géométrie (sans toucher au DOM, donc testable).
   * L'axe est à l'échelle du temps : une bande par mois, les jalons sont
   * placés à leur vraie date. Les étiquettes sont espacées pour ne jamais se
   * chevaucher et reliées à leur date par un trait.
   */
  function calculerFrise(jalons, dateEvenement, aujourdhui) {
    const points = (jalons || [])
      .filter(j => parseIso(j.date) !== null)
      .map(j => ({ label: j.label, date: j.date, jourJ: false }));
    if (dateEvenement && parseIso(dateEvenement) !== null && !points.some(p => p.date === dateEvenement && /jour/i.test(p.label))) {
      points.push({ label: 'Jour J', date: dateEvenement, jourJ: true });
    }
    points.sort((a, b) => parseIso(a.date) - parseIso(b.date) || (a.jourJ ? 1 : 0) - (b.jourJ ? 1 : 0));

    const marge = 110, bande = 30, base = 40;
    const n = points.length;
    if (!n) return { points: [], mois: [], largeur: 900, hauteur: 200, axeY: 100, bande: bande, xAujourdhui: null, jourParPx: 1 };

    const premier = new Date(parseIso(points[0].date)), dernier = new Date(parseIso(points[n - 1].date));
    const debut = Date.UTC(premier.getUTCFullYear(), premier.getUTCMonth(), 1);
    const fin = Date.UTC(dernier.getUTCFullYear(), dernier.getUTCMonth() + 1, 1);
    const nbMois = Math.round((fin - debut) / (30.44 * JOUR));
    const ecartEtiquettes = 176;
    const parCote = Math.ceil(n / 2);
    const largeurAxe = Math.min(2600, Math.max(900, nbMois * 120, (parCote - 1) * ecartEtiquettes + 40));
    const largeur = largeurAxe + marge * 2;
    const xDe = t => marge + (t - debut) / (fin - debut) * largeurAxe;

    const mois = [];
    let a = premier.getUTCFullYear(), m = premier.getUTCMonth();
    while (Date.UTC(a, m, 1) < fin) {
      const d0 = Date.UTC(a, m, 1), d1 = Date.UTC(m === 11 ? a + 1 : a, (m + 1) % 12, 1);
      mois.push({ annee: a, mois: m, x0: xDe(d0), x1: xDe(d1) });
      m++; if (m > 11) { m = 0; a++; }
    }

    points.forEach(p => {
      p.x = xDe(parseIso(p.date));
      p.lignes = decouper(p.label, 26);
          });

    // Une rangée d'étiquettes par côté, dans l'ordre des dates, alternées
    // au-dessus et au-dessous. Chaque étiquette reste au plus près de sa date
    // (décalage minimal pour respecter l'écart), reliée à son point par un trait.
    // Même ordre en haut et en bas : les traits ne se croisent jamais.
    points.forEach((p, i) => { p.cote = i % 2 === 0 ? -1 : 1; });
    [-1, 1].forEach(cote => {
      const lst = points.filter(p => p.cote === cote);
      const min = marge - 30, max = largeur - marge + 30;
      lst.forEach((p, i) => { p.lx = Math.max(p.x, i ? lst[i - 1].lx + ecartEtiquettes : min); });
      for (let i = lst.length - 1; i >= 0; i--) {
        const borne = i === lst.length - 1 ? max : lst[i + 1].lx - ecartEtiquettes;
        if (lst[i].lx > borne) lst[i].lx = borne;
      }
    });

    const axeY = 50 + base + 70;
    const hauteur = axeY + bande / 2 + base + 70 + 10;
    points.forEach(p => { p.y = axeY + p.cote * (bande / 2 + base); });

    const tj = parseIso(aujourdhui || aujourdhuiIso());
    const xAujourdhui = (tj !== null && tj >= debut && tj <= fin) ? xDe(tj) : null;
    return { points, mois, largeur, hauteur, axeY, bande, xAujourdhui };
  }

  function construireSvg(jalons, dateEvenement, titre, aujourdhui) {
    const g = calculerFrise(jalons, dateEvenement, aujourdhui);
    const tj = parseIso(aujourdhui || aujourdhuiIso());
    const tE = parseIso(dateEvenement);
    const H = g.hauteur;
    const o = [];
    o.push('<svg xmlns="http://www.w3.org/2000/svg" width="' + g.largeur + '" height="' + H + '" viewBox="0 0 ' + g.largeur + ' ' + H + '" font-family="Segoe UI, Roboto, Arial, sans-serif">');
    o.push('<rect width="100%" height="100%" fill="#ffffff"/>');
    o.push('<text x="' + (g.largeur / 2) + '" y="32" text-anchor="middle" font-size="22" font-weight="700" fill="#0d1b2a">' + echapper(titre || 'Calendrier') + '</text>');

    const top = g.axeY - g.bande / 2;
    // Repère "aujourd'hui" en arrière-plan.
    if (g.xAujourdhui !== null) {
      const x = g.xAujourdhui;
      o.push('<line x1="' + x + '" y1="52" x2="' + x + '" y2="' + (H - 10) + '" stroke="#a4243b" stroke-width="1.5" stroke-dasharray="5 4" opacity="0.55"/>');
      o.push('<text x="' + x + '" y="48" text-anchor="middle" font-size="11" font-weight="700" fill="#a4243b">Aujourd\'hui</text>');
    }
    // Bande des mois (échelle du temps).
    g.mois.forEach((mo, i) => {
      const fond = i % 2 === 0 ? '#e9edf3' : '#f6f7fa';
      o.push('<rect x="' + mo.x0 + '" y="' + top + '" width="' + (mo.x1 - mo.x0) + '" height="' + g.bande + '" fill="' + fond + '" stroke="#c5ccd6" stroke-width="1"/>');
      const avecAnnee = i === 0 || mo.mois === 0;
      o.push('<text x="' + ((mo.x0 + mo.x1) / 2) + '" y="' + (g.axeY + 4) + '" text-anchor="middle" font-size="11" fill="#475467" font-weight="' + (mo.mois === 0 ? '700' : '500') + '">' + MOIS[mo.mois].replace('.', '') + (avecAnnee ? ' ' + mo.annee : '') + '</text>');
    });

    g.points.forEach(p => {
      const passe = tj !== null && parseIso(p.date) < tj;
      const couleur = p.jourJ ? '#c9a227' : (passe ? '#98a2b3' : '#0d1b2a');
      const dep = p.cote === -1 ? top : top + g.bande;
      o.push('<line x1="' + p.x + '" y1="' + dep + '" x2="' + p.lx + '" y2="' + p.y + '" stroke="' + couleur + '" stroke-width="1.5"/>');
      o.push('<circle cx="' + p.x + '" cy="' + dep + '" r="' + (p.jourJ ? 6 : 4.5) + '" fill="' + couleur + '" stroke="#ffffff" stroke-width="1.5"/>');
      let ecart = '';
      if (tE !== null) {
        const j = Math.round((tE - parseIso(p.date)) / JOUR);
        ecart = p.jourJ || j === 0 ? '' : (j > 0 ? '  (J-' + j + ')' : '  (J+' + Math.abs(j) + ')');
      }
      const nbl = p.lignes.length + 1, interligne = 14;
      const debutY = p.cote === -1 ? p.y - 8 - (nbl - 1) * interligne : p.y + 16;
      o.push('<text x="' + p.lx + '" y="' + debutY + '" text-anchor="middle" font-size="12" font-weight="700" fill="' + couleur + '">' + echapper(dateCourte(p.date) + ecart) + '</text>');
      p.lignes.forEach((l, k) => {
        o.push('<text x="' + p.lx + '" y="' + (debutY + (k + 1) * interligne) + '" text-anchor="middle" font-size="12" fill="' + (passe ? '#667085' : '#1b1f24') + '">' + echapper(l) + '</text>');
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
