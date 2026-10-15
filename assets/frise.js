/**
 * frise.js
 * Frise chronologique du calendrier : dessin SVG, export image (PNG) et
 * export Excel. Les jalons sont espacés régulièrement (frise "ordinale") :
 * c'est lisible même quand deux échéances sont à quelques jours d'écart, et
 * les étiquettes alternent sur deux hauteurs de chaque côté de l'axe, donc
 * jamais de chevauchement. Le trait "aujourd'hui" est placé au prorata des
 * dates entre les deux jalons qui l'encadrent.
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

  /**
   * Calcule la géométrie (sans toucher au DOM, donc testable).
   * jalons : [{label, date 'yyyy-MM-dd'}] ; dateEvenement : 'yyyy-MM-dd'.
   */
  function calculerFrise(jalons, dateEvenement, aujourdhui) {
    const points = (jalons || [])
      .filter(j => parseIso(j.date) !== null)
      .map(j => ({ label: j.label, date: j.date, jourJ: false }));
    if (dateEvenement && parseIso(dateEvenement) !== null && !points.some(p => p.date === dateEvenement && /jour/i.test(p.label))) {
      points.push({ label: 'Jour J', date: dateEvenement, jourJ: true });
    }
    points.sort((a, b) => parseIso(a.date) - parseIso(b.date) || (a.jourJ ? 1 : 0) - (b.jourJ ? 1 : 0));

    const pas = 120, marge = 90, hauteurNiveau = [46, 120], largeurTexte = 26;
    const n = points.length;
    const largeur = Math.max(900, marge * 2 + Math.max(0, n - 1) * pas);
    const axeY = 215;
    const hauteur = axeY * 2;
    const reste = (largeur - marge * 2) / Math.max(1, n - 1);

    points.forEach((p, i) => {
      p.x = n === 1 ? largeur / 2 : marge + i * reste;
      p.cote = i % 2 === 0 ? -1 : 1;                 // -1 au-dessus, 1 en dessous
      p.niveau = Math.floor(i / 2) % 2;               // deux hauteurs par côté
      p.y = axeY + p.cote * hauteurNiveau[p.niveau];
      p.lignes = decouper(p.label, largeurTexte);
    });

    // Position du repère "aujourd'hui", interpolée entre deux jalons voisins.
    const tj = parseIso(aujourdhui || aujourdhuiIso());
    let xAujourdhui = null;
    if (n >= 2 && tj !== null) {
      const t0 = parseIso(points[0].date), t1 = parseIso(points[n - 1].date);
      if (tj >= t0 && tj <= t1) {
        for (let i = 0; i < n - 1; i++) {
          const a = parseIso(points[i].date), b = parseIso(points[i + 1].date);
          if (tj >= a && tj <= b) {
            const f = b === a ? 0 : (tj - a) / (b - a);
            xAujourdhui = points[i].x + f * (points[i + 1].x - points[i].x);
            break;
          }
        }
      }
    }
    return { points, largeur, hauteur, axeY, xAujourdhui, hauteurNiveau };
  }

  function construireSvg(jalons, dateEvenement, titre, aujourdhui) {
    const g = calculerFrise(jalons, dateEvenement, aujourdhui);
    const tj = parseIso(aujourdhui || aujourdhuiIso());
    const haut = 60;
    const H = g.hauteur + haut;
    const o = [];
    o.push('<svg xmlns="http://www.w3.org/2000/svg" width="' + g.largeur + '" height="' + H + '" viewBox="0 0 ' + g.largeur + ' ' + H + '" font-family="Segoe UI, Roboto, Arial, sans-serif">');
    o.push('<rect width="100%" height="100%" fill="#ffffff"/>');
    o.push('<text x="' + (g.largeur / 2) + '" y="34" text-anchor="middle" font-size="22" font-weight="700" fill="#0d1b2a">' + echapper(titre || 'Calendrier') + '</text>');
    o.push('<g transform="translate(0,' + haut + ')">');
    o.push('<line x1="30" y1="' + g.axeY + '" x2="' + (g.largeur - 30) + '" y2="' + g.axeY + '" stroke="#0d1b2a" stroke-width="3" stroke-linecap="round"/>');

    g.points.forEach(p => {
      const passe = tj !== null && parseIso(p.date) < tj;
      const couleur = p.jourJ ? '#c9a227' : (passe ? '#98a2b3' : '#0d1b2a');
      const bout = p.y;
      o.push('<line x1="' + p.x + '" y1="' + g.axeY + '" x2="' + p.x + '" y2="' + bout + '" stroke="' + couleur + '" stroke-width="1.5"/>');
      o.push('<circle cx="' + p.x + '" cy="' + g.axeY + '" r="' + (p.jourJ ? 9 : 6) + '" fill="' + couleur + '" stroke="#ffffff" stroke-width="2"/>');
      // Bloc de texte : date en gras puis libellé, ancré côté extérieur du trait.
      const nbl = p.lignes.length + 1;
      const interligne = 14;
      const debut = p.cote === -1 ? bout - 8 - (nbl - 1) * interligne : bout + 16;
      o.push('<text x="' + p.x + '" y="' + debut + '" text-anchor="middle" font-size="12" font-weight="700" fill="' + couleur + '">' + echapper(dateCourte(p.date)) + '</text>');
      p.lignes.forEach((l, k) => {
        o.push('<text x="' + p.x + '" y="' + (debut + (k + 1) * interligne) + '" text-anchor="middle" font-size="12" fill="' + (passe ? '#667085' : '#1b1f24') + '">' + echapper(l) + '</text>');
      });
    });

    if (g.xAujourdhui !== null) {
      const x = g.xAujourdhui;
      o.push('<line x1="' + x + '" y1="' + (g.axeY - 24) + '" x2="' + x + '" y2="' + (g.axeY + 24) + '" stroke="#a4243b" stroke-width="2" stroke-dasharray="4 3"/>');
      o.push('<text x="' + x + '" y="' + (g.axeY + 40) + '" text-anchor="middle" font-size="11" font-weight="700" fill="#a4243b">Aujourd\'hui</text>');
    }
    o.push('</g></svg>');
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
