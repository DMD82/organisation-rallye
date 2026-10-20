/* Contenu type issu de l'historique des éditions 2025 et 2026.
 * Aucune donnée personnelle : seulement des jalons et des textes génériques.
 * Les propositions s'ajoutent à l'existant (rien n'est remplacé ni supprimé). */
(function (global) {
  'use strict';

  // Niveaux de frise : chaque échéance appartient à un niveau, la vue
  // d'ensemble ("cle") ne garde que les grandes étapes.
  var NIVEAUX = [
    { id: 'cle', label: 'Vue d\'ensemble' },
    { id: 'partenaires', label: 'Partenaires' },
    { id: 'autorites', label: 'Autorités et invités' },
    { id: 'financement', label: 'Financement' },
    { id: 'communication', label: 'Communication et presse' },
    { id: 'logistique', label: 'Logistique et sécurité' },
    { id: 'creations', label: 'Créations' }
  ];

  // joursAvant : nombre de jours avant le Jour J (négatif = après).
  // preuve : ce qui a été observé dans les échanges des dernières éditions.
  var JALONS_TYPES = [
    { joursAvant: 295, label: 'Conception du logo et de l\'écusson de l\'édition', niveau: 'creations', preuve: '2026 : J-295' },
    { joursAvant: 267, label: 'Exposition : demande de prêt', niveau: 'logistique', preuve: '2026 : J-267' },
    { joursAvant: 221, label: 'Lancement du fil rouge annuel et des défis', niveau: 'partenaires', preuve: '2025 : J-245, 2026 : J-221' },
    { joursAvant: 207, label: 'Premières invitations aux autorités (Trinôme)', niveau: 'autorites', preuve: '2025 : J-240, 2026 : J-207' },
    { joursAvant: 200, label: 'Commande des casquettes', niveau: 'creations', preuve: '2026 : J-208 à J-174' },
    { joursAvant: 179, label: 'Lancement de la communication de l\'édition', niveau: 'communication', preuve: '2026 : J-179' },
    { joursAvant: 140, label: 'Dépôt des demandes de subvention (CCI, IHEDN, FNAM...)', niveau: 'financement', preuve: '2026 : J-141 à J-87' },
    { joursAvant: 123, label: 'Réservation du foodtruck', niveau: 'logistique', preuve: '2025 : J-54, 2026 : J-123' },
    { joursAvant: 111, label: 'Témoignage : recherche de l\'intervenant', niveau: 'communication', preuve: '2025 : J-111' },
    { joursAvant: 104, label: 'Petit déjeuner et goûter : commande', niveau: 'logistique', preuve: '2026 : J-116 à J-104' },
    { joursAvant: 92, label: 'Musique et sonorisation', niveau: 'logistique', preuve: '2026 : J-92' },
    { joursAvant: 90, label: 'Commande des coupes et trophées', niveau: 'creations', preuve: '2026 : J-90' },
    { joursAvant: 68, label: 'Reporters UNSS : mobilisation', niveau: 'communication', preuve: '2026 : J-68' },
    { joursAvant: 67, label: 'Commande des écussons', niveau: 'creations', preuve: '2026 : J-67 à J-15' },
    { joursAvant: 67, label: 'Contact Croix-Rouge (DTUS) : demande de poste de secours', niveau: 'logistique', preuve: '2025 : J-67, 2026 : J-43' },
    { joursAvant: 60, label: 'Dépôt du dossier de sécurité (commission)', niveau: 'logistique', preuve: '2025 : J-85, 2026 : J-54' },
    { joursAvant: 56, label: 'Création du trophée : conception et fabrication', niveau: 'creations', preuve: '2026 : J-56 à J-41' },
    { joursAvant: 55, label: 'Commande des bracelets', niveau: 'creations', preuve: '2026 : J-55 à J-38' },
    { joursAvant: 54, label: 'Note de service (NDS)', niveau: 'logistique', preuve: '2026 : J-54 à J-47' },
    { joursAvant: 51, label: 'Attestation d\'assurance', niveau: 'logistique', preuve: '2025 : J-77 à J-50, 2026 : J-51' },
    { joursAvant: 45, label: 'Poste de secours (DPS) : devis et validation', niveau: 'logistique', preuve: '2025 : J-67 à J-28, 2026 : J-43' },
    { joursAvant: 45, label: 'Commande de la bâche partenaires en imprimerie', niveau: 'creations', preuve: '2024 : J-43 ; 2026 : J-13 (trop juste)' },
    { joursAvant: 28, label: 'Livraison attendue des impressions en imprimerie', niveau: 'creations', preuve: '2024 : livraisons J-29 à J-23' },
    { joursAvant: 40, label: 'Réunion armées et corps en uniforme', niveau: 'partenaires', preuve: '2025 : J-42 à J-21, 2026 : J-77 à J-32' },
    { joursAvant: 40, label: 'Convention de mise à disposition (armées)', niveau: 'logistique', preuve: '2025 : J-34, 2026 : J-40' },
    { joursAvant: 35, label: 'Premier contact presse', niveau: 'communication', preuve: '2025 : J-35' },
    { joursAvant: 35, label: 'Réservistes citoyens : mobilisation', niveau: 'logistique', preuve: '2026 : J-35 à J-5' },
    { joursAvant: 29, label: 'Bon à tirer des écussons', niveau: 'creations', preuve: '2026 : J-29' },
    { joursAvant: 27, label: 'Invitations officielles (courrier et dossier de présentation)', niveau: 'autorites', preuve: '2026 : J-27' },
    { joursAvant: 27, label: 'Plan de masse et logistique du lieu', niveau: 'logistique', preuve: '2025 : J-27 à J-13' },
    { joursAvant: 27, label: 'Contact eau : point d\'eau et rampe à eau', niveau: 'logistique', preuve: '2025 : J-27 à J-10' },
    { joursAvant: 25, label: 'Mairie : derniers accords sur le lieu', niveau: 'logistique', preuve: '2026 : J-25 à J-6' },
    { joursAvant: 19, label: 'Dossier de presse et invitation des médias', niveau: 'communication', preuve: '2025 : J-35 à J-15, 2026 : J-19 à J-13' },
    { joursAvant: 15, label: 'Affiche partenaires', niveau: 'creations', preuve: '2026 : J-15 (PNG), J-6 (PDF)' },
    { joursAvant: 14, label: 'Plan de répartition des ateliers envoyé aux partenaires', niveau: 'partenaires', preuve: '2025 : J-9, 2026 : J-14' },
    { joursAvant: 6, label: 'Impressions (livret, plans, panneaux)', niveau: 'creations', preuve: '2026 : J-6 à J+126' },
    { joursAvant: 5, label: 'Protocole : ordre de passage des autorités', niveau: 'autorites', preuve: '2026 : J-5' },
    { joursAvant: 204, label: 'Défi complémentaire pour les classes de défense', niveau: 'partenaires', preuve: '2025 : J-209, 2026 : J-204' },
    { joursAvant: 78, label: 'Rappel du fil rouge annuel aux établissements', niveau: 'communication', preuve: '2026 : J-78' },
    { joursAvant: 19, label: 'Fil rouge du jour : questions diffusées', niveau: 'partenaires', preuve: '2026 : J-19, relance J-13' },
    { joursAvant: 7, label: 'Dernières annulations de partenaires : mise à jour des plans', niveau: 'logistique', preuve: '2026 : désistements J-13 à J-7' },
    { joursAvant: 1, label: 'Résultats du fil rouge annuel (collecte et classement)', niveau: 'cle', preuve: '2026 : J-1' },
    { joursAvant: 203, label: 'Formulaire d\'informations partenaires : mise en ligne', niveau: 'partenaires', preuve: '2026 : message du 21/10/2025 (J-203)' },
    { joursAvant: 180, label: 'Formulaire d\'inscription des établissements : mise en ligne', niveau: 'cle', preuve: '2025 : J-175, 2026 : J-180' },
    { joursAvant: 14, label: 'Test du site de notation par les partenaires', niveau: 'logistique', preuve: 'Message J-7 de 2026 (tests avant le jour J)' },
    { joursAvant: 14, label: 'Formulaire de commande du foodtruck', niveau: 'logistique', preuve: '2025 : J-9, 2026 : J-13' },
    { joursAvant: 3, label: 'Envoi des impressions au secrétariat', niveau: 'creations', preuve: '2026 : J-3 (fil rouge), complément J-1' },
    { joursAvant: 1, label: 'Impressions complémentaires (listes, QR codes, plans)', niveau: 'creations', preuve: '2026 : J-1' },
    { joursAvant: 0, label: 'Dernières impressions de listes à jour (5h30)', niveau: 'creations', preuve: '2026 : annulations et changements d\'équipes le jour même' },
    { joursAvant: -1, label: 'Envoi du questionnaire RETEX', niveau: 'cle', preuve: '2026 : réponses attendues avant J+9' },
    { joursAvant: -1, label: 'Remerciements aux partenaires et aux participants', niveau: 'cle', preuve: '2025 : J+1, 2026 : J+1' },
    { joursAvant: -3, label: 'Diffusion des photos', niveau: 'communication', preuve: '2026 : J+1 à J+3' },
    { joursAvant: -8, label: 'Carton d\'invitation de la soirée des partenaires', niveau: 'creations', preuve: '2026 : J+8' },
    { joursAvant: -30, label: 'RETEX et bilan', niveau: 'cle', preuve: '2025 : J+3 à J+155' },
    { joursAvant: -43, label: 'Soirée des partenaires', niveau: 'cle', preuve: '2025 : J+35, 2026 : J+43' }
  ];

  // Niveau des échéances de départ (celles déjà dans l'outil), par début de libellé.
  var NIVEAUX_DEFAUT = [
    ['premiere demande de date', 'cle'], ['confirmation du site', 'cle'], ['lancement mecenat', 'financement'],
    ['diffusion aux etablissements', 'cle'], ['reunion partenaires', 'cle'], ['cloture des inscriptions', 'cle'],
    ['echeance infos ateliers', 'partenaires'], ['diffusion du livret', 'communication'],
    ['vacances scolaires', 'cle'], ['dernieres consignes pratiques', 'partenaires'],
    ['j 7', 'cle'], ['installation', 'logistique']
  ];

  /* Niveau proposé pour une échéance sans niveau, ou '' si inconnu. */
  function niveauPour(label) {
    var n = norm(label), i;
    for (i = 0; i < JALONS_TYPES.length; i++) if (norm(JALONS_TYPES[i].label) === n) return JALONS_TYPES[i].niveau;
    for (i = 0; i < NIVEAUX_DEFAUT.length; i++) if (n.indexOf(NIVEAUX_DEFAUT[i][0]) === 0) return NIVEAUX_DEFAUT[i][1];
    return '';
  }

  var CATEGORIES_CREATION = [
    { id: 'identite', label: 'Identité visuelle' },
    { id: 'imprimes', label: 'Imprimés et cartons' },
    { id: 'dossiers', label: 'Dossiers' },
    { id: 'signaletique', label: 'Signalétique et accueil' },
    { id: 'goodies', label: 'Goodies et récompenses' },
    { id: 'numerique', label: 'Numérique' },
    { id: 'autre', label: 'Autre' }
  ];

  // joursAvant : moment où la création doit être prête / diffusée.
  var CREATIONS_TYPES = [
    { nom: 'Logo de l\'édition', categorie: 'identite', joursAvant: 295, usage: 'Base de tous les supports : dossiers, invitations, affiche, livret, écusson, site.', preuve: 'Conçu à J-295 en 2026, fichier diffusé à J-90' },
    { nom: 'Écusson', categorie: 'identite', joursAvant: 67, usage: 'Remis aux participants et aux partenaires. Bon à tirer à valider environ un mois avant.', preuve: '2026 : commande J-67, bon à tirer J-29' },
    { nom: 'Casquettes', categorie: 'identite', joursAvant: 200, usage: 'Dotation de l\'édition. Demander le devis très tôt.', preuve: '2026 : J-208 à J-174' },
    { nom: 'Save the date', categorie: 'imprimes', joursAvant: 208, usage: 'Joint au message de lancement aux partenaires, mécènes et autorités.', preuve: 'Octobre 2025 pour l\'édition 2026' },
    { nom: 'Dossier de présentation du Rallye', categorie: 'dossiers', joursAvant: 208, usage: 'Joint aux sollicitations de partenaires et de mécènes.', preuve: '2026 : J-208' },
    { nom: 'Lettre de mécénat', categorie: 'dossiers', joursAvant: 208, usage: 'Lettre à signer, jointe à la demande de mécénat (rescrit fiscal).', preuve: '2026 : J-208' },
    { nom: 'Présentation de la réunion partenaires', categorie: 'dossiers', joursAvant: 148, usage: 'Support de la réunion de présentation du dispositif aux partenaires, puis envoyé à ceux qui n\'étaient pas là.', preuve: 'Réunion du 15/12/2025 (J-148)' },
    { nom: 'Dossier autorités', categorie: 'dossiers', joursAvant: 207, usage: 'Joint aux invitations officielles des autorités.', preuve: '2026 : J-207' },
    { nom: 'Goodies et éléments de communication', categorie: 'goodies', joursAvant: 208, usage: 'Sacs de récompenses et dotation des partenaires.', preuve: '2026 : J-208 à J+27' },
    { nom: 'Carton d\'invitation des autorités', categorie: 'imprimes', joursAvant: 88, usage: 'Invitation officielle envoyée avec le dossier autorités.', preuve: '2025 : J-64, 2026 : J-88' },
    { nom: 'Carton d\'invitation des partenaires', categorie: 'imprimes', joursAvant: 57, usage: 'Invitation des partenaires à l\'événement.', preuve: '2025 : J-57' },
    { nom: 'Trophée et coupes', categorie: 'goodies', joursAvant: 90, usage: 'Remise des prix. Conception puis fabrication.', preuve: '2026 : coupes J-90, trophée J-56 à J-41' },
    { nom: 'Bracelets d\'identification', categorie: 'signaletique', joursAvant: 55, usage: 'Remis aux partenaires à l\'accueil le jour J.', preuve: '2026 : J-55 à J-38' },
    { nom: 'Dossier de sécurité', categorie: 'dossiers', joursAvant: 51, usage: 'Déposé en préfecture pour la commission de sécurité.', preuve: '2025 : J-40, 2026 : J-51' },
    { nom: 'Annexes du dossier de sécurité', categorie: 'dossiers', joursAvant: 51, usage: 'Plan d\'implantation des ateliers, plan des caméras, attestation d\'assurance, consignes aux élèves.', preuve: '2025 : J-38, 2026 : J-51' },
    { nom: 'Convention de mise à disposition (armées)', categorie: 'dossiers', joursAvant: 40, usage: 'Cadre la mise à disposition de personnel et de matériel.', preuve: '2025 : J-34, 2026 : J-40' },
    { nom: 'Livret ou carnet participant', categorie: 'imprimes', joursAvant: 32, usage: 'Diffusé aux établissements avant les vacances. Les descriptions d\'ateliers sont attendues environ une semaine avant.', preuve: '2026 : infos J-35 à J-29, diffusion J-32' },
    { nom: 'Dossier de presse', categorie: 'dossiers', joursAvant: 19, usage: 'Remis aux médias invités le jour J.', preuve: '2026 : J-19 à J-13' },
    { nom: 'Affiche partenaires', categorie: 'imprimes', joursAvant: 15, usage: 'Valorisation des partenaires, version image puis PDF.', preuve: '2026 : J-15 (PNG), J-6 (PDF)' },
    { nom: 'Bâche partenaires', categorie: 'signaletique', joursAvant: 45, usage: 'Grande bâche de valorisation des partenaires, fabriquée en imprimerie. Prévoir la validation du bon à tirer, environ 2 semaines de fabrication et le transport jusqu\'au site.', preuve: '2024 : commande J-43, livrée J-29 à J-23 ; 2026 : commande J-13 (fichier remplacé après commande)' },
    { nom: 'Impressions en imprimerie (grands formats)', categorie: 'imprimes', joursAvant: 28, usage: 'Affiches et supports grands formats à faire hors DMD. L\'imprimeur consulté en 2024 allait jusqu\'à A0 (jet d\'encre, laser jusqu\'à A3).', preuve: '2024 : échanges J-28 et J-24' },
    { nom: 'Plan de répartition des ateliers', categorie: 'imprimes', joursAvant: 14, usage: 'Envoyé aux partenaires, imprimé pour l\'accueil.', preuve: '2025 : J-9, 2026 : J-14' },
    { nom: 'Panneaux d\'atelier', categorie: 'signaletique', joursAvant: 14, usage: 'Remis à chaque partenaire à l\'accueil le jour J (estimation du délai).', preuve: 'Mentionné dans le message de mars 2026' },
    { nom: 'Tours de cou numérotés (chefs d\'équipe)', categorie: 'signaletique', joursAvant: 21, usage: 'Identification des chefs d\'équipe (estimation du délai).', preuve: 'Mentionné dans les consignes 2025' },
    { nom: 'Questionnaires de notation en ligne', categorie: 'numerique', joursAvant: 14, usage: 'Les partenaires doivent les tester avant le J-7 (estimation du délai).', preuve: 'Message J-7 de 2026' },
    { nom: 'Consignes aux participants', categorie: 'imprimes', joursAvant: 7, usage: 'Envoyées aux établissements juste avant l\'événement.', preuve: '2026 : J-7' },
    { nom: 'Fil rouge du jour : questions', categorie: 'dossiers', joursAvant: 19, usage: 'Questions du fil rouge posées aux équipes le jour J ; diffusées environ trois semaines avant, puis imprimées.', preuve: '2026 : J-19 et J-13' },
    { nom: 'Fil rouge annuel : défis et résultats', categorie: 'dossiers', joursAvant: 221, usage: 'Défis proposés aux classes pendant l\'année, collecte des résultats pour le classement la veille du jour J.', preuve: '2026 : lancement J-221, résultats J-1' },
    { nom: 'Site de notation en ligne', categorie: 'numerique', joursAvant: 21, usage: 'Site et questionnaires de notation utilisés par les partenaires le jour J. À tester avant le J-7.', preuve: '2026 : tests demandés aux partenaires' },
    { nom: 'Site des défis annuels', categorie: 'numerique', joursAvant: 221, usage: 'Site présentant les défis que les élèves réalisent pendant l\'année pour gagner des points.', preuve: '2026 : défis lancés avec le fil rouge (J-221)' },
    { nom: 'Formulaire d\'inscription des établissements', categorie: 'numerique', joursAvant: 180, usage: 'Diffusé à tous les collèges et lycées du département ; clôture environ 7 semaines avant.', preuve: '2025 : J-175, 2026 : J-180' },
    { nom: 'Formulaire d\'informations partenaires', categorie: 'numerique', joursAvant: 203, usage: 'Recueille présentation, atelier, besoins et logistique de chaque partenaire (alimente la base Partenaires).', preuve: '2026 : envoyé dès J-203, relancé jusqu\'à J-35' },
    { nom: 'Formulaire de commande du foodtruck', categorie: 'numerique', joursAvant: 14, usage: 'Commande anticipée des repas par les partenaires.', preuve: '2025 : J-9, 2026 : J-13' },
    { nom: 'Formulaire RETEX', categorie: 'numerique', joursAvant: -1, usage: 'Questionnaire avant / pendant / après / libre, envoyé aux partenaires et aux établissements.', preuve: '2026 : réponses avant J+9' },
    { nom: 'Impression : répartition des tables', categorie: 'imprimes', joursAvant: 1, usage: 'A3 x1, plastifié. Placement des équipes aux tables.', preuve: '2026 : demande du 11/05' },
    { nom: 'Impression : QR codes de notation', categorie: 'imprimes', joursAvant: 1, usage: 'A4 x4. Accès au site de notation pour les partenaires.', preuve: '2026 : demande du 11/05' },
    { nom: 'Impression : remise des prix', categorie: 'imprimes', joursAvant: 1, usage: 'A4 paysage x2. Classements pour la remise des prix.', preuve: '2026 : demande du 11/05' },
    { nom: 'Impression : premier atelier des équipes', categorie: 'imprimes', joursAvant: 1, usage: '1er atelier par équipe (8 feuilles) et 1re équipe par atelier (3 feuilles), en A3 ou A4 paysage. À réimprimer si des équipes changent.', preuve: '2026 : demande du 11/05' },
    { nom: 'Impression : fil rouge (questions)', categorie: 'imprimes', joursAvant: 3, usage: 'Questions du fil rouge, envoyées au secrétariat avec les autres impressions.', preuve: '2026 : envoi du 08/05' },
    { nom: 'Impression : affiches partenaires', categorie: 'imprimes', joursAvant: 6, usage: 'Nombre d\'exemplaires à fixer avec le secrétariat.', preuve: '2026 : question du 06/05' },
    { nom: 'Impression : carnets participants A5', categorie: 'imprimes', joursAvant: 20, usage: 'Essais d\'impression en A5 à faire en avance.', preuve: '2026 : essais annoncés le 06/05' },
    { nom: 'Livre d\'or', categorie: 'imprimes', joursAvant: 1, usage: 'Imprimé pour le jour J.', preuve: '2026 : dossier Impressions' },
    { nom: 'Carton d\'invitation de la soirée des partenaires', categorie: 'imprimes', joursAvant: -8, usage: 'Joint à l\'invitation à la soirée des partenaires (envoyée vers J+15).', preuve: '2026 : J+8' }
  ];

  var MODELES_TYPES = [
    {
      titre: 'Lancement : sollicitation des partenaires historiques',
      categorie: 'sollicitation_partenaire',
      objet: '[Rallye Citoyen {{annee}}] Informations aux partenaires et mécènes',
      corps: 'Madame, Monsieur,\n\n' +
        'En vos titres, grades et qualités,\n\n' +
        'Nous vous contactons en tant que partenaire historique ou identifié du Rallye Citoyen de Tarn-et-Garonne. Si vous avez changé de service ou si ce message ne s\'adresse plus à la bonne personne, merci de me le signaler afin que je puisse transmettre l\'information aux contacts appropriés.\n\n' +
        'L\'édition précédente, marquée par la mobilisation de [nombre] élèves et de [nombre] structures partenaires, a été un véritable succès collectif. Ce résultat, nous le devons à votre engagement, à votre présence et à la richesse des ateliers proposés.\n\n' +
        'Forts de cette dynamique, le Trinôme Académique de Tarn-et-Garonne a le plaisir de vous annoncer le renouvellement de cet événement : {{lieu}}, le {{date_evenement}}.\n\n' +
        'Thème {{annee}} : {{theme}}\n\n' +
        'Comme chaque année, les élèves participeront à une course aux points construite autour d\'ateliers libres et notés, animée par un fil rouge pédagogique en lien avec le thème.\n\n' +
        'Nous avons besoin de vous, selon vos possibilités et vos disponibilités, pour :\n' +
        '* Animer un atelier en lien avec les missions de votre entité (format dynamique de 15 minutes maximum, plusieurs équipes en simultané).\n' +
        '* Contribuer aux défis annuels que les élèves réalisent en autonomie pendant l\'année scolaire.\n' +
        '* Soutenir le Rallye par du mécénat, financier ou en nature (lots, goodies, matériel).\n\n' +
        'Merci de nous indiquer dès à présent votre intérêt en répondant à ce message ou via le formulaire : [lien du formulaire]\n\n' +
        'Respectueusement,\n{{signataire_nom}}\n{{signataire_role}}',
      notes: 'Source : message de lancement d\'octobre 2025. Joindre le dossier de présentation et le "Save the date".'
    },
    {
      titre: 'Demande de mécénat',
      categorie: 'sollicitation_mecenat',
      objet: '[Rallye Citoyen {{annee}}] Demande de mécénat',
      corps: 'Madame, Monsieur,\n\n' +
        'En votre titre, grade et qualité,\n\n' +
        'Veuillez trouver en pièce jointe un courrier vous sollicitant, au nom du Trinôme Académique de Tarn-et-Garonne, pour soutenir et devenir mécène du Rallye Citoyen {{annee}}, qui se tiendra le {{date_evenement}}, {{lieu}}.\n\n' +
        'Cet événement, désormais bien ancré dans le paysage départemental, a rassemblé plus de [nombre] élèves lors de l\'édition précédente autour de [nombre] partenaires publics, associatifs et privés, dans un esprit d\'engagement et de transmission. L\'édition {{annee}} sera placée sur le thème : {{theme}}.\n\n' +
        'L\'association porteuse du Rallye a obtenu un rescrit fiscal, ouvrant droit à la réduction d\'impôt au titre du mécénat (articles 200 et 238 bis du CGI). Votre soutien, financier ou en nature, pourra faire l\'objet d\'un reçu fiscal permettant de bénéficier d\'une réduction d\'impôt de 60 % pour les entreprises, ou 66 % pour les particuliers (dans la limite des plafonds en vigueur).\n\n' +
        'Votre soutien contribuerait directement à :\n' +
        '* investir dans le matériel nécessaire à l\'organisation ;\n' +
        '* récompenser les participants (lots, trophées) ;\n' +
        '* offrir un goûter convivial à tous les jeunes ;\n' +
        '* produire des supports utiles et mémorables.\n\n' +
        'Nous restons à votre disposition pour toute précision et serions ravis d\'échanger avec vous sur les modalités possibles d\'un partenariat.\n\n' +
        'En vous remerciant pour l\'attention portée à cette démarche d\'intérêt général,\n\n' +
        'Respectueusement,\n{{signataire_nom}}\n{{signataire_role}}',
      notes: 'Source : demande de mécénat 2026. Joindre la lettre à signer, le dossier et le "Save the date". Vérifier les taux et le rescrit avant envoi.'
    },
    {
      titre: 'Relance mécénat',
      categorie: 'relance_mecenat',
      objet: 'Relance - {{association_nom}} et le Rallye Citoyen {{annee}}',
      corps: 'Madame, Monsieur,\n\n' +
        'Je me permets de revenir vers vous au sujet de notre sollicitation de soutien pour le Rallye Citoyen {{annee}}, qui se tiendra le {{date_evenement}}.\n\n' +
        'Votre structure est un partenaire important du territoire et votre présence à nos côtés, quelle qu\'en soit la forme (soutien financier, lots, matériel, atelier), serait précieuse pour les [nombre] jeunes attendus.\n\n' +
        'Souhaitez-vous que nous convenions d\'un échange téléphonique ou d\'un rendez-vous pour vous présenter le dispositif ? Nous pouvons également vous transmettre à nouveau le dossier de présentation.\n\n' +
        'Dans l\'attente de votre retour, je vous prie d\'agréer l\'expression de mes salutations respectueuses.\n\n' +
        '{{signataire_nom}}\n{{signataire_role}}',
      notes: 'Adapter le nom de la structure dans l\'objet. À envoyer environ 3 à 4 semaines après la demande initiale.'
    },
    {
      titre: 'Relance : informations manquantes (partenaires)',
      categorie: 'sollicitation_partenaire',
      objet: '[Rallye Citoyen {{annee}}] Informations manquantes partenaires',
      corps: 'Bonjour,\n\n' +
        'À quelques semaines du Rallye Citoyen {{annee}}, qui se tiendra le {{date_evenement}}, {{lieu}}, je me permets de revenir vers vous concernant l\'organisation de l\'événement.\n\n' +
        'Sauf erreur de ma part, certaines informations relatives à votre participation sont encore manquantes. Afin d\'avancer sur la répartition des espaces, la logistique et l\'élaboration du carnet remis aux élèves (qui doit être finalisé avant le [date]), je vous serais reconnaissant de me transmettre les éléments suivants dès que possible :\n\n' +
        '* Courte présentation de votre entité (pour le carnet)\n' +
        '* Courte description de l\'atelier proposé (pour le carnet)\n' +
        '* Nombre d\'équipes que vous pouvez accueillir simultanément (idéalement 2 minimum)\n' +
        '* Venez-vous avec un barnum ?\n' +
        '* Besoins logistiques (tables, chaises, électricité, contraintes d\'emplacement)\n' +
        '* Logo de votre structure (PNG ou JPG, haute qualité)\n' +
        '* Nombre d\'accompagnateurs\n' +
        '* Éléments à mettre dans les sacs de récompenses (flyers, goodies, etc.)\n\n' +
        'Si vous connaissez déjà le système de notation que vous souhaitez appliquer aux équipes, merci de me le transmettre afin que je puisse l\'intégrer dans le calcul des points.\n\n' +
        'Rappel important : les repas ne sont pas pris en charge. Un foodtruck et une boulangerie sont disponibles à proximité.\n\n' +
        'Je vous remercie par avance pour votre réactivité.\n\n' +
        'Cordialement,\n{{signataire_nom}}\n{{signataire_role}}',
      notes: 'Source : relance envoyée à 24 partenaires en 2025. Personnaliser en rappelant ce qui est déjà connu (tables, chaises).'
    },
    {
      titre: 'Informations et compléments (après clôture des inscriptions)',
      categorie: 'consignes_partenaires',
      objet: '[Rallye Citoyen {{annee}}] Partenaires - informations et compléments',
      corps: 'Madame, Monsieur,\n\n' +
        'En vos titres, grades et qualités,\n\n' +
        'À la suite de la clôture des inscriptions le [date], le Rallye Citoyen {{annee}} rassemblera [nombre] équipes, soit jusqu\'à [nombre] jeunes participants.\n\n' +
        'Nous tenions à vous remercier très sincèrement pour votre engagement. À l\'approche de l\'événement, qui se tiendra le {{date_evenement}}, {{lieu}}, nous entrons dans une phase de finalisation.\n\n' +
        '* Informations attendues - échéance impérative : [date]\n' +
        'Afin de permettre l\'édition du livret participant, merci de nous transmettre par retour de mail ou via le formulaire [lien] :\n' +
        '  - le descriptif de votre atelier (objectif, contenu, déroulé succinct) ;\n' +
        '  - le nom et le descriptif de votre structure tel qu\'il doit apparaître ;\n' +
        '  - vos besoins logistiques et matériels (tables, chaises, alimentation électrique, contraintes particulières).\n\n' +
        '* Organisation du jour J :\n' +
        '  - installation à partir de 7h, avec inscription à l\'accueil (panneau de l\'atelier et bracelet d\'identification) ;\n' +
        '  - café d\'accueil et brief à 8h ;\n' +
        '  - cérémonie d\'ouverture à [heure], puis lancement des activités.\n\n' +
        'Pièces jointes : dossier de présentation, tableau des réponses déjà reçues.\n\n' +
        'Respectueusement,\n{{signataire_nom}}\n{{signataire_role}}',
      notes: 'Source : message du 27/03/2026. Compléter les horaires et joindre le tableau des réponses partenaires.'
    },
    {
      titre: 'J-7 : dernières informations',
      categorie: 'consignes_partenaires',
      objet: '[Rallye Citoyen {{annee}}] J-7 | Dernières informations',
      corps: 'Madame, Monsieur,\n\n' +
        'En votre titre, grade et qualité,\n\n' +
        'À une semaine du Rallye Citoyen, nous entrons dans la dernière phase de préparation. Ce message vous rappelle les points essentiels pour assurer un déroulement fluide le jour J ({{date_evenement}}).\n\n' +
        'Merci de vérifier les éléments suivants :\n' +
        '* votre atelier est prêt, avec un format adapté à des passages courts (15 minutes maximum) et des critères de notation bien définis ;\n' +
        '* votre matériel est complet et opérationnel ;\n' +
        '* vous disposez d\'un moyen de notation numérique fonctionnel ;\n' +
        '* vos éventuels goodies ou lots sont prêts.\n\n' +
        'Points d\'attention :\n' +
        '* installation à partir de 7h00 (barnum si vous êtes à l\'extérieur) ;\n' +
        '* véhicules nécessitant un positionnement spécifique : présents avant 7h30 ;\n' +
        '* optimisation du nombre de véhicules pour ne pas saturer le stationnement ;\n' +
        '* être pleinement prêt à 8h00 au plus tard ;\n' +
        '* électricité : anticiper rallonges, multiprises et équipements ;\n' +
        '* notation en ligne pour chaque équipe : merci de tester les questionnaires en amont : [lien] ;\n' +
        '* avant le [date], signaler toute modalité de notation spécifique (chronométrage, épreuve sur 5, sur 20...).\n\n' +
        'Pour rappel : foodtruck et point boissons sur site (commande anticipée : [lien]), stand du Bleuet de France (prévoir des espèces), présence d\'autorités et de médias.\n\n' +
        'Pour des raisons de sécurité, il est demandé de ne pas communiquer en amont sur l\'événement (réseaux sociaux, publications, informations logistiques). Toute communication pourra être réalisée le jour J ou à son issue.\n\n' +
        'Cordialement,\n{{signataire_nom}}\n{{signataire_role}}',
      notes: 'Source : message J-7 de mai 2026. Adapter les liens et les échéances.'
    },
    {
      titre: 'Dernières consignes pratiques aux partenaires',
      categorie: 'consignes_partenaires',
      objet: '[Rallye Citoyen {{annee}}] Dernières consignes pratiques aux partenaires',
      corps: 'Madame, Monsieur,\n\n' +
        'En votre grade et qualité,\n\n' +
        'Alors que nous approchons de la semaine décisive avant le Rallye Citoyen, je tiens à vous exprimer, au nom du Trinôme Académique, notre sincère gratitude pour votre mobilisation. Votre présence permet d\'assurer un nombre d\'ateliers cohérent avec le nombre d\'équipes engagées.\n\n' +
        '* Installation et briefing : installation dès 7h00 le {{date_evenement}} ; briefing et café d\'accueil obligatoires à 8h00 au poste de commandement.\n' +
        '* Cérémonie : ouverture à [heure], suivie immédiatement du lancement des activités. Plan prévisionnel des stands en pièce jointe (peut légèrement évoluer).\n' +
        '* À l\'arrivée : signalez-vous au PC du rallye, indiquez le nombre de personnes présentes sur votre stand, déposez les éventuels goodies ou récompenses.\n' +
        '* À nous transmettre si ce n\'est pas déjà fait : nombre de personnes sur l\'atelier, description de l\'entité et de l\'atelier pour le livret (dernier délai : [date]).\n\n' +
        'Fonctionnement des ateliers :\n' +
        '* chaque atelier doit pouvoir accueillir 2 équipes simultanément ;\n' +
        '* au début de la journée chaque équipe a un stand imposé, puis circule en autonomie (à vous de rendre votre atelier attractif) ;\n' +
        '* les chefs d\'équipe portent un tour de cou numéroté ;\n' +
        '* il n\'est pas obligatoire que toute l\'équipe participe à l\'épreuve : à définir avec le chef d\'équipe.\n\n' +
        'Respectueusement,\n{{signataire_nom}}\n{{signataire_role}}',
      notes: 'Source : message du 05/05/2025. Joindre le plan des stands.'
    },
    {
      titre: 'Invitation officielle aux autorités',
      categorie: 'invitation_autorite',
      objet: '[Rallye Citoyen {{annee}}] Invitation officielle - {{date_evenement}}',
      corps: 'Madame, Monsieur [fonction et nom de l\'autorité],\n\n' +
        'Le Trinôme académique de Tarn-et-Garonne a l\'honneur de vous inviter à assister à l\'édition {{annee}} du Rallye Citoyen de Tarn-et-Garonne, qui se tiendra le {{date_evenement}}, {{lieu}} :\n' +
        '* à partir de [heure], accueil des autorités suivi d\'une visite libre des ateliers ;\n' +
        '* à [heure], remise des prix.\n\n' +
        'Organisé en partenariat avec plus de [nombre] acteurs institutionnels et réunissant plus de [nombre] jeunes, ce Rallye rassemble des élèves autour d\'ateliers pédagogiques, mémoriels et de défense.\n\n' +
        'L\'édition {{annee}}, placée sous le thème : {{theme}}, mettra particulièrement en valeur la transmission, l\'esprit de défense et l\'engagement de la jeunesse.\n\n' +
        'Votre présence constituerait un encouragement fort pour les jeunes participants et témoignerait de l\'engagement des acteurs du territoire à leurs côtés. Vous trouverez en pièce jointe le dossier de présentation du Rallye.\n\n' +
        'Nous serions particulièrement honorés de pouvoir compter sur votre présence.\n\n' +
        'Cordialement,\n{{signataire_nom}}\n{{signataire_role}}',
      notes: 'Source : invitation officielle du 15/04/2026 (adressée à 48 destinataires). Adapter la formule d\'appel au rang de l\'autorité.'
    },
    {
      titre: 'Remerciements aux partenaires (lendemain)',
      categorie: 'remerciement',
      objet: '[Rallye Citoyen {{annee}}] Merci pour votre engagement !',
      corps: 'Madame, Monsieur, chers partenaires,\n\n' +
        'L\'édition {{annee}} du Rallye Citoyen de Tarn-et-Garonne vient de s\'achever, et les sourires des jeunes comme ceux de nos partenaires résonnent encore dans les allées du site.\n\n' +
        'Au nom du Trinôme Académique, nous tenons à vous adresser nos remerciements les plus sincères pour votre engagement, votre présence et votre investissement dans cette nouvelle édition.\n\n' +
        'Cette journée a une nouvelle fois démontré la force collective de notre réseau de partenaires. Par la qualité de vos ateliers, votre professionnalisme, votre disponibilité et votre enthousiasme, vous avez largement contribué au succès de l\'événement.\n\n' +
        'Nous souhaitons également saluer l\'engagement remarquable de notre jeunesse : curieuse, volontaire, respectueuse et investie.\n\n' +
        'Quelques chiffres de cette édition : [chiffres clés].\n\n' +
        'Un retour d\'expérience sera organisé dans les prochaines semaines. Vos remarques et suggestions sont les bienvenues : [lien du formulaire de retour].\n\n' +
        'Avec toute notre reconnaissance,\n{{signataire_nom}}\n{{signataire_role}}',
      notes: 'Source : message du 13/05/2026. À envoyer le lendemain du Rallye.'
    },
    {
      titre: 'Invitation à la soirée des partenaires',
      categorie: 'remerciement',
      objet: '[Rallye Citoyen {{annee}}] Invitation à la soirée des partenaires',
      corps: 'Madame, Monsieur,\n\n' +
        'Quinze jours après l\'édition {{annee}} du Rallye Citoyen de Tarn-et-Garonne, nous souhaitons prendre le temps de vous remercier comme il se doit.\n\n' +
        'Cette édition, qui s\'est tenue le {{date_evenement}}, {{lieu}}, a une nouvelle fois rassemblé près de [nombre] jeunes autour des valeurs de mémoire, d\'engagement, de citoyenneté et de résilience. Une telle réussite n\'aurait pas été possible sans votre présence, votre disponibilité et votre énergie.\n\n' +
        'Le Trinôme académique de Tarn-et-Garonne serait très honoré de votre présence à la soirée des partenaires, organisée :\n\n' +
        'Le [jour, date et heure]\n[lieu de la soirée]\n\n' +
        'Ce moment convivial, organisé autour d\'un cocktail, sera l\'occasion de revenir ensemble sur cette édition, de partager les premiers retours et de vous remercier chaleureusement.\n\n' +
        'Merci de diffuser cette invitation en interne auprès des personnes ayant contribué au Rallye Citoyen.\n\n' +
        'Pour des raisons d\'organisation, merci de confirmer votre présence avant le [date], en répondant à ce courriel et en précisant les noms des participants, le nombre total de personnes et les immatriculations des véhicules pour entrer sur site.\n\n' +
        'Le carton d\'invitation est joint à ce message.\n\n' +
        'Au plaisir de vous retrouver très prochainement,\n{{signataire_nom}}\n{{signataire_role}}',
      notes: 'Source : invitation du 27/05/2026 (envoyée à 44 destinataires). Joindre le carton d\'invitation.'
    }
  ];

  function norm(s) {
    return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, ' ').trim();
  }

  function el(tag, attrs) {
    var e = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      if (k === 'text') e.textContent = attrs[k];
      else if (k === 'style') e.style.cssText = attrs[k];
      else e.setAttribute(k, attrs[k]);
    });
    for (var i = 2; i < arguments.length; i++) if (arguments[i]) e.appendChild(arguments[i]);
    return e;
  }

  /* Fenêtre de propositions : liste avec cases à cocher, les éléments déjà
   * présents sont grisés et décochés. config : title, intro, items, deja(item)
   * -> booléen, ligne(item) -> {titre, detail}, ajouter(item) -> Promise<bool>,
   * onDone(). */
  function ouvrirPropositions(config) {
    var ancien = document.getElementById('propositions-overlay');
    if (ancien) ancien.remove();

    var overlay = el('div', { 'class': 'modal-overlay', id: 'propositions-overlay' });
    overlay.addEventListener('click', function (e) { if (e.target === overlay) overlay.remove(); });
    var box = el('div', { 'class': 'modal-box', style: 'max-width:760px' });
    var entete = el('div', { style: 'display:flex;justify-content:space-between;align-items:center' },
      el('h3', { style: 'margin:0', text: config.title }));
    var fermer = el('button', { 'class': 'secondary', text: 'Fermer' });
    fermer.addEventListener('click', function () { overlay.remove(); });
    entete.appendChild(fermer);
    box.appendChild(entete);
    box.appendChild(el('p', { 'class': 'hint', text: config.intro }));

    var liste = el('div', { style: 'max-height:55vh;overflow:auto;margin:8px 0' });
    var cases = [];
    config.items.forEach(function (item) {
      var deja = config.deja(item);
      var l = config.ligne(item);
      var cb = el('input', { type: 'checkbox', style: 'width:auto;flex:none;margin:4px 0 0' });
      cb.checked = !deja; cb.disabled = deja;
      var texte = el('div', { style: 'flex:1;text-align:left' },
        el('div', { text: l.titre + (deja ? '  (déjà présent)' : '') }),
        el('div', { 'class': 'hint', text: l.detail }));
      var ligne = el('label', { style: 'display:flex;gap:10px;align-items:flex-start;justify-content:flex-start;text-transform:none;font-size:inherit;padding:6px 0;border-bottom:1px solid var(--border);' + (deja ? 'opacity:.5' : '') }, cb, texte);
      liste.appendChild(ligne);
      cases.push({ cb: cb, item: item });
    });
    box.appendChild(liste);

    var msg = el('div', { 'class': 'hint' });
    var ajouter = el('button', { text: 'Ajouter la sélection' });
    ajouter.addEventListener('click', function () {
      var choisis = cases.filter(function (c) { return c.cb.checked && !c.cb.disabled; });
      if (!choisis.length) { msg.textContent = 'Rien de sélectionné.'; return; }
      ajouter.disabled = true;
      var faits = 0, i = 0, erreur = '';
      (function suite() {
        if (i >= choisis.length) {
          msg.textContent = faits + ' élément(s) ajouté(s) sur ' + choisis.length + '.' +
            (erreur ? ' Première erreur : ' + erreur : '');
          ajouter.disabled = false;
          if (config.onDone) config.onDone();
          return;
        }
        msg.textContent = 'Ajout ' + (i + 1) + ' / ' + choisis.length + '...';
        config.ajouter(choisis[i].item).then(function (ok) {
          if (ok === true) { faits++; choisis[i].cb.checked = false; choisis[i].cb.disabled = true; }
          else if (!erreur) erreur = typeof ok === 'string' ? ok : 'Réponse inattendue du serveur.';
          i++; suite();
        }).catch(function (e) { if (!erreur) erreur = e.message || String(e); i++; suite(); });
      })();
    });
    box.appendChild(el('div', { style: 'display:flex;gap:12px;align-items:center;margin-top:8px' }, ajouter, msg));
    overlay.appendChild(box);
    document.body.appendChild(overlay);
  }

  JALONS_TYPES.sort(function (a, b) { return b.joursAvant - a.joursAvant; });
  CREATIONS_TYPES.sort(function (a, b) { return b.joursAvant - a.joursAvant; });

  global.Historique = {
    JALONS_TYPES: JALONS_TYPES,
    NIVEAUX: NIVEAUX,
    niveauPour: niveauPour,
    CATEGORIES_CREATION: CATEGORIES_CREATION,
    CREATIONS_TYPES: CREATIONS_TYPES,
    MODELES_TYPES: MODELES_TYPES,
    norm: norm,
    ouvrirPropositions: ouvrirPropositions
  };
  if (typeof module !== 'undefined') module.exports = global.Historique;
})(typeof window !== 'undefined' ? window : globalThis);
