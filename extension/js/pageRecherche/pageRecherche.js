// On récupère les données du document au chargement de la page
let listing = recupererDonnees(document);
ameliorerHeader();
ameliorerListing();

function recupererDonnees(document) {
  const script = document.querySelector(DATA_ID);
  const donnees = JSON.parse(script.textContent).props.pageProps.listingData.ads;
  const listing = {};
  for (donnee of donnees) {
    listing[donnee.list_id] = donnee;
  }
  return listing;
}

function ameliorerHeader() {
  ajoutFiltrageSurfaceTerrain();
  cacherElement(TITRE_INUTILE);
  cacherElement(BANDEAU_ESTIMATION_GRATUITE);

  // Centrage des options de filtrage et de tri
  const barreOptions = document.querySelector(BARRE_OPTIONS_FILTRAGE_ET_TRI);
  barreOptions.style.justifyContent = "center";

  // Largeur 100% sur la liste des résultats
  const listeResultat = document.querySelector(LISTE_RESULTATS);
  listeResultat.style.flexBasis = "100%";
}

function ameliorerListing() {
  const listeResultats = document.querySelectorAll(ITEM);
  for (const resultat of listeResultats) {
    const id = extraireID(resultat.href);

    // Filtrage des ID correspondant aux pubs !
    if (listing[id] === undefined) continue;

    const lastDiv = resultat.querySelector(DERNIERE_DIV_INFOS_ITEM);

    // Création de nouvelles informations
    const fieldSet = creerFieldSetLMC();
    const tailleTerrain = ajouterChamp('terrain', id, fieldSet);
    resultat.dataset.surfaceTerrain = tailleTerrain;
    ajouterChamp('energy_rate', id, fieldSet);
    ajouterChamp('ges', id, fieldSet);
    ajouterChamp('rooms', id, fieldSet);
    ajouterChamp('square', id, fieldSet);
    lastDiv.after(fieldSet);

    // Remplacement du titre par le nombre de pièces + surface
    const titreItem = resultat.querySelector(TITRE_ITEM);
    const pieces = extraireObjet('rooms', listing[id]);
    const surface = extraireObjet('square', listing[id]);
    titreItem.textContent = `${surface.value_label} — ${pieces.value} ${pieces.key_label.toLowerCase()}`;

    // Boutons pour voir toutes les photos
    const photoItem = resultat.querySelector(PHOTO_ITEM);
    const boutonAvant = creerBoutonPhoto('lmc-bouton-avant');
    const boutonApres = creerBoutonPhoto('lmc-bouton-apres');

    // On ajoute les boutons après le lien
    const lienItem = photoItem.closest('a');
    lienItem.after(boutonAvant);
    lienItem.after(boutonApres);

    function changerImage(e) {
      let numeroImageActuel = +this.dataset.numeroImage;
      const nombreImages = listing[id].images.nb_images;
      const clicSurBoutonAvant = e.currentTarget.className.includes('avant');
      numeroImageActuel += clicSurBoutonAvant ? 1 : -1;

      // On boucle sur les images
      if (numeroImageActuel > nombreImages - 1) {
        numeroImageActuel = 0;
      } else if (numeroImageActuel < 0) {
        numeroImageActuel = nombreImages - 1;
      }

      const prochaineSrcImage = listing[id].images.urls[numeroImageActuel];

      // On récupère l'image de l'item qu'on édite
      const img = this.closest('div[class*="styles_adListItem"]').querySelector('img');

      // Et on change sa source
      img.src = prochaineSrcImage;
      this.dataset.numeroImage = numeroImageActuel;
    }

    boutonAvant.addEventListener('click', changerImage);
    boutonApres.addEventListener('click', changerImage);
  }

  // Augmentation de la largeur de la photo
  const photoItem = document.querySelectorAll(PHOTO_ITEM);
  photoItem.forEach(photo => {
    photo.classList.add('lmc-photo');
  });

  // Augmentation de la taille de police du prix;
  const prixItem = document.querySelectorAll(PRIX_ITEM);
  prixItem.forEach(prix => {
    prix.style.fontSize = "3rem";
  });

  // Suppression des pubs TABOOLA
  let pubs = document.querySelectorAll(PUB_TABOOLA);
  pubs.forEach(pub => {
    pub.style.display = 'none';
  });

  // Suppression des pubs CRITEO
  pubs = document.querySelectorAll(PUB_CRITEO);
  pubs.forEach(pub => {
    const parent = pub.closest('[class*="styles_order"]');
    parent.style.display = 'none';
  })

  // Filtrage par taille du terrain
  filtrerResultatsParTerrain();
}

function creerBoutonPhoto(classe) {
  const bouton = document.createElement('button');
  bouton.classList.add('lmc-bouton-photo', classe);

  // Petite flèche sympa en contenu
  bouton.innerHTML = "&#10132;";

  // On "retient" le numéro de l'image directement sur le bouton
  bouton.dataset.numeroImage = 0;
  return bouton;
}

function creerFieldSetLMC() {
  const fieldSet = document.createElement('fieldset');
  fieldSet.classList.add('lmc-fieldset');

  const legende = document.createElement('legend');
  legende.classList.add('lmc-legende');
  legende.textContent = 'Le Meilleur Coin';

  fieldSet.append(legende);
  return fieldSet;
}

function ajouterChamp(nomChamp, id, noeud) {
  const donnees = extraireObjet(nomChamp, listing[id]);
  let label = donnees.value_label;
  const lettre = donnees.value_label[0];

  const nouvelleDiv = document.createElement('div');

  if (["ges", "energy_rate"].includes(nomChamp)) {
    nouvelleDiv.classList.add('lmc-label-energie');
    // Cas particuliers N => Non renseigné, V => Vierge
    if (!['N', 'V'].includes(lettre)) {
      // On affiche que la lettre
      label = lettre;
    }
  }

  nouvelleDiv.textContent = `${donnees.key_label} : ${label}`;

  if (nomChamp === "energy_rate") {
    nouvelleDiv.style.backgroundColor = COULEURS_ENERGIE[lettre];
    if ('C' <= lettre && lettre <= 'E' || ['N', 'V'].includes(lettre)) {
      nouvelleDiv.style.color = '#1A1A1A';
    } else {
      nouvelleDiv.style.color = 'white';
    }
  }

  if (nomChamp === "ges") {
    nouvelleDiv.style.backgroundColor = COULEURS_ENERGIE[lettre];
    if ('C' <= lettre && lettre <= 'E' || ['N', 'V'].includes(lettre)) {
      nouvelleDiv.style.color = '#1A1A1A';
    } else {
      nouvelleDiv.style.color = 'white';
    }
  }

  noeud.append(nouvelleDiv);

  if (nomChamp === "terrain") {
    return label;
  }
}

function extraireID(url) {
  const id = url.split('.htm')[0].split('/ventes_immobilieres/')[1];
  return id;
}

function extraireObjet(nomChamp, objListing) {
  if (nomChamp === "terrain") {
    // On doit extraire le terrain de la description
    const description = objListing.body;
    let correspondance;
    let taillesTerrain = [];
    while ((correspondance = REGEXP_TERRAIN.exec(description)) !== null) {
      taillesTerrain.push(Number.parseInt(correspondance[0].replaceAll(' ', '')));
    }
    if (taillesTerrain.length === 0) {
      taillesTerrain = "< 1000 m²";
    } else {
      taillesTerrain = taillesTerrain.map(t => t + " m²").join(', ');
    }

    return {
      key_label: "☘️ Terrain",
      value_label: taillesTerrain,
    };
  } else {
    for (const attr of objListing.attributes) {
      if (attr.key === nomChamp) {
        return attr;
      }
    }
    return {
      key_label: NOM_LABELS[nomChamp],
      value_label: "inconnu",
    };
  }
}

/* Filtrage par taille de terrain */

function creerInputNumber(id, label, valeur) {
  const input = document.createElement('input');
  input.type = "number";
  input.value = valeur;
  input.id = id;

  const elLabel = document.createElement('label');
  elLabel.textContent = label;
  elLabel.for = id;
  elLabel.appendChild(input);

  return elLabel;
}

function ajoutFiltrageSurfaceTerrain() {
  const barreOutils = document.querySelector(BARRE_OUTILS_RECHERCHE_DIV);

  const fieldSet = creerFieldSetLMC();
  fieldSet.classList.add('lmc-filtre-terrain');

  const VALEURS_TERRAIN = {
    CLE_TERRAIN_MIN: DEFAUT_TERRAIN_MIN_EN_M2,
    CLE_TERRAIN_MAX: DEFAUT_TERRAIN_MAX_EN_M2,
  };

  // Récupération des valeurs précédemment sauvegardées (ou utilisation de celles par défaut)
  chrome.storage.sync.get(VALEURS_TERRAIN, function (result) {
    const surfaceTerrainMin = result.CLE_TERRAIN_MIN;
    const surfaceTerrainMax = result.CLE_TERRAIN_MAX;

    const labelMin = creerInputNumber(INPUT_TERRAIN_MIN_ID, 'Terrain min :', surfaceTerrainMin);
    const labelMax = creerInputNumber(INPUT_TERRAIN_MAX_ID, 'Terrain max :', surfaceTerrainMax);
    fieldSet.append(labelMin);
    fieldSet.append(labelMax);

    const boutonValider = document.createElement('button');
    boutonValider.textContent = "Filtrer";

    boutonValider.addEventListener('click', filtrerResultatsParTerrain);

    fieldSet.append(boutonValider);
    barreOutils.after(fieldSet);

  });
}

function filtrerResultatsParTerrain() {
  const inputTerrainMin = document.querySelector(`#${INPUT_TERRAIN_MIN_ID}`);
  const inputTerrainMax = document.querySelector(`#${INPUT_TERRAIN_MAX_ID}`);

  if (inputTerrainMin === null || inputTerrainMax === null) return;

  const surfaceMin = +inputTerrainMin.value;
  let surfaceMax = +inputTerrainMax.value;

  // On sauvegarde les valeurs dans le stockage de l'extension
  chrome.storage.sync.set({
    CLE_TERRAIN_MIN: surfaceMin,
    CLE_TERRAIN_MAX: surfaceMax
  }, () => { });

  const listeResultats = document.querySelectorAll(ITEM);
  for (const resultat of listeResultats) {
    let cacher = false;
    let surface = resultat.dataset.surfaceTerrain;

    if (surface.startsWith('<')) {
      cacher = true;
    } else {
      // Si l'utilisateur n'a rien mis comme surface maximale, on ne met pas de limite
      if (surfaceMax === 0) surfaceMax = Number.POSITIVE_INFINITY;

      surface = Number.parseInt(surface);
      if (surface < surfaceMin || surface > surfaceMax) {
        cacher = true;
      }
    }
    resultat.style.display = cacher ? 'none' : 'block';
  }
}

const elListing = document.querySelector('[class*="styles_mainListing"]');
const observateur = new MutationObserver(function (objets, observateur) {
  /*
  Le callback est appelé 2 fois :
  - 1 fois pour mettre des placeholders pendant le chargement de la page
  - 1 fois pour mettre les données lorsqu'elles sont chargées (via la XHR)
  Il faut attendre que la XHR soit finie donc attendre le 2ème appel
  */
  if (observateur.compteur >= 2) {
    observateur.compteur = 1;
    // C'est la 2ème fois que l'observateur est appelé, on peut mettre à jour la liste
    // On récupère la page avec les données depuis le cache
    fetch(window.location.href, { cache: 'force-cache' })
      .then(function (response) {
        return response.text();
      })
      .then(function (texteHtml) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(texteHtml, "text/html");

        listing = recupererDonnees(doc);
        ameliorerListing();
      });
  } else {
    observateur.compteur++;
  }
});
// On observe les changements sur les noeuds enfants de la liste
observateur.compteur = 1;
observateur.observe(elListing, { childList: true });