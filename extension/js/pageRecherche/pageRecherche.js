let listing;
let observateur;
let filtrageActif = false;

function pageRecherche() {
  // On récupère les données du document au chargement de la page
  listing = recupererDonnees(document);
  ameliorerHeader();
  ameliorerListing();

  observateur = new MutationObserver(function (objets, observateur) {
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

          // Lorsqu'on change de page le listing se met à jour.
          // Il faut refiltrer ce nouveau listing si le filtrage
          // était activé avant le changement de page
          if (filtrageActif) activerFiltrage();
        });
    } else {
      observateur.compteur++;
    }
  });
  // On observe les changements sur les noeuds enfants de la liste
  observateur.compteur = 1;
  const elListing = document.querySelector(LISTING);
  if (elListing !== null) observateur.observe(elListing, { childList: true });
}

function pageRechercheFin() {
  if (observateur !== undefined) {
    observateur.disconnect();
  }
}

function recupererDonnees(document) {
  const script = document.querySelector(DATA_ID);
  if (script !== null) {
    try {
      const donnees = JSON.parse(script.textContent).props.pageProps.listingData.ads;
      const listing = {};
      for (donnee of donnees) {
        listing[donnee.list_id] = donnee;
      }
      return listing;
    } catch (erreur) {
      console.log(erreur);
    }
  }
}

function ameliorerHeader() {
  ajoutFiltrageSurfaceTerrain();
  cacherElement(TITRE_INUTILE);
  cacherElement(BANDEAU_ESTIMATION_GRATUITE);

  // Centrage des options de filtrage et de tri
  const barreOptions = document.querySelector(BARRE_OPTIONS_FILTRAGE_ET_TRI);
  if (barreOptions !== null) barreOptions.style.justifyContent = "center";

  // Largeur 100% sur la liste des résultats
  const listeResultat = document.querySelector(LISTE_RESULTATS);
  if (listeResultat !== null) listeResultat.style.flexBasis = "100%";
}

function ameliorerListing() {
  const listeResultats = document.querySelectorAll(ITEM);
  if (listeResultats !== null) {
    for (const resultat of listeResultats) {
      const id = extraireID(resultat.href);

      // Filtrage des ID correspondant aux pubs !
      if (listing[id] === undefined) continue;

      // Suppression du titre
      const titreItem = resultat.querySelector(TITRE_ITEM);
      if (titreItem !== null) titreItem.remove();

      // Affichage des informations importantes avec les icônes
      const infosBien = resultat.querySelector(DERNIERE_DIV_INFOS_ITEM);
      if (infosBien === null) continue;

      // On supprime tout le contenu de base du site
      infosBien.innerHTML = "";

      // On ajoute les infos avec les icônes
      const tailleTerrain = ajouterChamp('terrain', id, infosBien);
      resultat.dataset.surfaceTerrain = tailleTerrain;

      ajouterChamp(CLE_SURFACE_HABITABLE, id, infosBien);

      ajouterChamp(CLE_LIEU, id, infosBien);

      ajouterChamp(CLE_CLASSE_ENERGIE, id, infosBien);
      ajouterChamp(CLE_GAZ_EFFETS_SERRE, id, infosBien);

      // Boutons pour voir toutes les photos
      const photoItem = resultat.querySelector(PHOTO_ITEM);
      const boutonAvant = creerBoutonPhoto(CLASSE_BOUTON_PHOTO_AVANT);
      const boutonApres = creerBoutonPhoto(CLASSE_BOUTON_PHOTO_APRES);

      // On ajoute les boutons après le lien
      if (photoItem === null) continue;
      const lienItem = photoItem.closest('a');
      lienItem.after(boutonAvant);
      lienItem.after(boutonApres);

      // On "retient" le numéro de l'image sur le <a>
      lienItem.dataset.numeroImage = 0;

      function changerImage(e) {
        const divParentItem = this.closest(DIV_PARENT_ITEM);
        if (divParentItem === null) return;

        const a = divParentItem.querySelector(LIEN_ITEM);
        if (a === null) return;
        let numeroImageActuel = +a.dataset.numeroImage;

        const nombreImages = listing[id].images.nb_images;
        const clicSurBoutonAvant = e.currentTarget.className.includes(CLASSE_BOUTON_PHOTO_AVANT);
        numeroImageActuel += clicSurBoutonAvant ? -1 : 1;

        // On boucle sur les images
        if (numeroImageActuel > nombreImages - 1) {
          numeroImageActuel = 0;
        } else if (numeroImageActuel < 0) {
          numeroImageActuel = nombreImages - 1;
        }

        const prochaineSrcImage = listing[id].images.urls[numeroImageActuel];

        // On récupère l'image de l'item qu'on édite
        const img = divParentItem.querySelector('img');

        // Et on change sa source
        if (img !== null) img.src = prochaineSrcImage;

        // On stocke le numéro de l'image dans le lien <a>
        a.dataset.numeroImage = numeroImageActuel;
      }

      boutonAvant.addEventListener('click', changerImage);
      boutonApres.addEventListener('click', changerImage);
    }
  }

  // Augmentation de la largeur de la photo
  const photoItem = document.querySelectorAll(PHOTO_ITEM);
  if (photoItem !== null) {
    photoItem.forEach(photo => {
      augmenterTaillePhoto(photo);
    });
  }

  // Augmentation de la largeur des photos en lazy loading
  gererImagesLazyLoading();

  // Augmentation de la taille de police du prix;
  const prixItem = document.querySelectorAll(PRIX_ITEM);
  if (prixItem !== null) {
    prixItem.forEach(prix => {
      prix.classList.add(CLASSE_PRIX_ITEM);
    });
  }

  // Suppression des pubs TABOOLA
  let pubs = document.querySelectorAll(PUB_TABOOLA);
  if (pubs !== null) {
    pubs.forEach(pub => {
      pub.style.display = 'none';
    });
  }

  // Suppression des pubs CRITEO
  pubs = document.querySelectorAll(PUB_CRITEO);
  if (pubs !== null) {
    pubs.forEach(pub => {
      const parent = pub.closest('[class*="styles_order"]');
      if (parent !== null) {
        parent.style.display = 'none';
      }
    })
  }

  // Suppression des pubs GOOGLE
  pubs = document.querySelectorAll(PUB_GOOGLE);
  if (pubs !== null) {
    pubs.forEach(pub => {
      pub.style.display = 'none';
    });
  }
}

function augmenterTaillePhoto(photo) {
  photo.classList.add(CLASSE_PHOTO_ITEM);
}

function creerBoutonPhoto(classe) {
  const bouton = document.createElement('button');
  bouton.classList.add(CLASSE_BOUTON_PHOTO, classe);

  // Petite flèche sympa en contenu
  bouton.innerHTML = "&#10132;";

  return bouton;
}

function ajouterChamp(nomChamp, id, noeud) {
  const donnees = extraireObjet(nomChamp, listing[id]);
  let label = donnees.value_label;
  let lettre = donnees.value_label[0];

  const nouvelleDiv = document.createElement('div');
  nouvelleDiv.classList.add(CLASSE_INFOS_ICONE);

  if (nomChamp === "terrain") {
    nouvelleDiv.innerHTML = `<img src="${chrome.runtime.getURL('images/icone-terrain.png')}" alt="icône terrain">`;

    if (label === TEXTE_PROJET_CONSTRUCTION) {
      nouvelleDiv.innerHTML += `<img src="${chrome.runtime.getURL('images/icone-construction.png')}" alt="icône construction">`;
      nouvelleDiv.style.color = "red";
    }

    const tailleTerrain = Number.parseInt(label);
    if (Number.isNaN(tailleTerrain)) {
      nouvelleDiv.innerHTML += `<p>${label}</p>`;
    } else {
      nouvelleDiv.innerHTML += `<p><span class="${CLASSE_INFOS_VALEUR}">${tailleTerrain}</span>m²</p>`;
    }
  } else if (nomChamp === CLE_SURFACE_HABITABLE) {
    // On récupère le nombre de pièces en plus
    const nbPieces = extraireObjet(CLE_NB_PIECES, listing[id]).value;
    const surfaceHabitable = Number.parseInt(label);

    nouvelleDiv.innerHTML = `<img src="${chrome.runtime.getURL('images/icone-maison.png')}" alt="plan maison"><p><span class="${CLASSE_INFOS_VALEUR}">${surfaceHabitable}</span>m² — <span class="${CLASSE_INFOS_VALEUR}">${nbPieces}</span>pièces</p>`;
  } else if (nomChamp === CLE_LIEU) {
    nouvelleDiv.innerHTML = `<img src="${chrome.runtime.getURL('images/icone-gps.png')}" alt="GPS"><p><span>${label}</span></p>`;
  }

  if (nomChamp === CLE_CLASSE_ENERGIE) {
    // On récupère le GES en plus
    const ges = extraireObjet(CLE_GAZ_EFFETS_SERRE, listing[id]);
    let lettreGes = ges.value_label[0];

    let style = calculerStyleLabelEnergie(lettreGes);

    nouvelleDiv.innerHTML += `<img src="${chrome.runtime.getURL('images/icone-ges.png')}"><div class="${CLASSE_LABEL_ENERGIE}" style="background-color: ${style.backgroundColor}; color: ${style.color};">${style.lettre}</div>`;

    style = calculerStyleLabelEnergie(lettre);

    nouvelleDiv.innerHTML += `<img src="${chrome.runtime.getURL('images/icone-energie.png')}" style="margin-left: 2.4rem"><div class="${CLASSE_LABEL_ENERGIE}" style="background-color: ${style.backgroundColor}; color: ${style.color};">${style.lettre}</div>`;
  }

  noeud.append(nouvelleDiv);

  if (nomChamp === "terrain") {
    return label;
  }
}

function calculerStyleLabelEnergie(lettre) {
  let backgroundColor = COULEURS_ENERGIE[lettre];
  let color = "white";

  if (['N', 'V'].includes(lettre)) {
    lettre = '?';
    backgroundColor = '#A1A1A1';
  }
  if ('C' <= lettre && lettre <= 'E' || ['N', 'V'].includes(lettre)) {
    color = '#1A1A1A';
  }

  return {
    lettre,
    backgroundColor,
    color,
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
    for (const attr of objListing.attributes) {
      if (attr.key === CLE_SURFACE_HABITABLE) {
        surfaceHabitable = attr.value;
      }
    }

    // TODO : Gérer les surfaces avec plusieurs parcelles : faire la somme ?
    const surfacesTerrain = extraireSurfacesTerrain(description, surfaceHabitable)[0];

    // Si c'est un projet en construction, on l'indique à l'utilisateur
    if (surfacesTerrain.projetConstruction) {
      return {
        value_label: TEXTE_PROJET_CONSTRUCTION,
      }
    }

    // Si on trouve le mot terrain dans la description mais aucune mention de sa taille, il faut l'indiquer à l'utilisateur
    if (surfacesTerrain.motTerrainTrouve && surfacesTerrain.tailleEnM2 === 0) {
      return {
        value_label: TEXTE_TAILLE_TERRAIN_INCONNUE,
      }
    }

    return {
      value_label: surfacesTerrain.tailleEnM2 === 0 ? TEXTE_AUCUN_TERRAIN : surfacesTerrain.label,
    };
  } else if (nomChamp === CLE_LIEU) {
    return {
      value_label: objListing.location.city_label,
    }
  } else {
    for (const attr of objListing.attributes) {
      if (attr.key === nomChamp) {
        return attr;
      }
    }
    return {
      value_label: "inconnu",
    };
  }
}

/* Filtrage par taille de terrain */

function ajoutFiltrageSurfaceTerrain() {
  const barreOutils = document.querySelector(BARRE_OUTILS_RECHERCHE_DIV);
  if (barreOutils === null) return;

  const fieldSet = document.createElement('fieldset');
  fieldSet.classList.add(CLASSE_FILTRE_TERRAIN);

  // Quand l'utilisateur change une valeur de filtre, on désactive le filtrage en cours
  fieldSet.addEventListener('input', desactiverFiltrage);

  const VALEURS_TERRAIN = {
    CLE_TERRAIN_MIN: DEFAUT_TERRAIN_MIN_EN_M2,
    CLE_TERRAIN_MAX: DEFAUT_TERRAIN_MAX_EN_M2,
    CLE_CACHER_PROJET_CONSTRUCTION: DEFAULT_CACHER_PROJET_CONSTRUCTION,
  };

  // Récupération des valeurs précédemment sauvegardées (ou utilisation de celles par défaut)
  chrome.storage.sync.get(VALEURS_TERRAIN, function (result) {
    const surfaceTerrainMin = result.CLE_TERRAIN_MIN;
    const surfaceTerrainMax = result.CLE_TERRAIN_MAX;
    const cacherProjetConstruction = result.CLE_CACHER_PROJET_CONSTRUCTION;

    fieldSet.innerHTML = `<p class=${CLASSE_TITRE_TERRAIN}>terrain</p>

    <p>Entre <input type="number" id="${INPUT_TERRAIN_MIN_ID}" value="${surfaceTerrainMin}" onfocus="this.select();"> et <input type="number" id="${INPUT_TERRAIN_MAX_ID}" value="${surfaceTerrainMax}" onfocus="this.select();"> m²</p>

    <div class="${CLASSE_FILTRE_TERRAIN_LIGNE}">
    <input type="checkbox" id="${INPUT_CACHER_PROJET_CONSTRUCTION_ID}" ${cacherProjetConstruction ? "checked" : ""}>
    <label for="${INPUT_CACHER_PROJET_CONSTRUCTION_ID}">${TEXTE_CACHER_PROJET_CONSTRUCTION}</label>
    </div>
    `;

    const boutonFiltrer = document.createElement('button');
    boutonFiltrer.id = ID_BOUTON_FILTRER;
    boutonFiltrer.textContent = TEXTE_BOUTON_FILTRER;

    boutonFiltrer.addEventListener('click', basculerFiltrage);

    fieldSet.append(boutonFiltrer);
    barreOutils.after(fieldSet);

  });
}

function basculerFiltrage() {
  if (filtrageActif) {
    desactiverFiltrage();
  } else {
    activerFiltrage();
  }
}

function desactiverFiltrage() {
  const boutonFiltrer = document.querySelector(`#${ID_BOUTON_FILTRER}`);

  if (boutonFiltrer !== null) {
    filtrageActif = false;
    boutonFiltrer.textContent = TEXTE_BOUTON_FILTRER;
    boutonFiltrer.style.backgroundColor = "";

    const listeResultats = document.querySelectorAll(ITEM);
    if (listeResultats !== null) {
      for (const resultat of listeResultats) {
        const parent = resultat.parentElement;
        parent.style.display = 'block';
      }
    }
  }
}

function activerFiltrage() {
  const boutonFiltrer = document.querySelector(`#${ID_BOUTON_FILTRER}`);

  if (boutonFiltrer !== null) {
    const inputTerrainMin = document.querySelector(`#${INPUT_TERRAIN_MIN_ID} `);
    const inputTerrainMax = document.querySelector(`#${INPUT_TERRAIN_MAX_ID} `);
    let cacherProjetConstruction = document.querySelector(`#${INPUT_CACHER_PROJET_CONSTRUCTION_ID}`);

    if (inputTerrainMin === null || inputTerrainMax === null || cacherProjetConstruction === null) return;

    filtrageActif = true;
    boutonFiltrer.textContent = TEXTE_BOUTON_DESACTIVER_FILTRER;
    boutonFiltrer.style.backgroundColor = "red";

    cacherProjetConstruction = cacherProjetConstruction.checked;
    const surfaceMin = +inputTerrainMin.value;
    let surfaceMax = +inputTerrainMax.value;

    // On sauvegarde les valeurs dans le stockage de l'extension
    chrome.storage.sync.set({
      CLE_TERRAIN_MIN: surfaceMin,
      CLE_TERRAIN_MAX: surfaceMax,
      CLE_CACHER_PROJET_CONSTRUCTION: cacherProjetConstruction,
    }, () => { });

    const listeResultats = document.querySelectorAll(ITEM);
    if (listeResultats === null) return;

    for (const resultat of listeResultats) {
      let cacher = false;
      let surface = resultat.dataset.surfaceTerrain;

      if (surface !== undefined) {
        // Si l'utilisateur n'a rien mis comme surface maximale, on ne met pas de limite
        if (surfaceMax === 0) surfaceMax = Number.POSITIVE_INFINITY;

        // S'il existe un terrain dont la taille est inconnue, on ne le cache jamais
        if (surface === TEXTE_TAILLE_TERRAIN_INCONNUE) {
          cacher = false;
        } else if (surface === TEXTE_PROJET_CONSTRUCTION && cacherProjetConstruction) {
          // Si c'est un projet de construction et qu'on doit le cacher, on le cache !
          cacher = true;
        } else {
          surface = Number.parseInt(surface);

          // S'il n'y a pas de terrain on met la surface à 0
          if (Number.isNaN(surface)) surface = 0;

          if (surface < surfaceMin || surface > surfaceMax) {
            cacher = true;
          }
        }

        const parent = resultat.parentElement;
        parent.style.display = cacher ? 'none' : 'block';
      }
    }
  }
}

/*
Gestion des images en lazy loading
Lors du chargement de la liste des résultats de recherche, certaines images sont chargées au moment du scroll et leurs classes sont réaffectées... écrasant ma classe permettant de mettre la photo en grand.
L'objectif de ce code est de détecter quand une photo se charge et de lui réappliquer à nouveau ma classe.
*/
function gererImagesLazyLoading() {

  const imgLazy = document.querySelectorAll(PHOTO_ITEM);
  if (imgLazy === null) return;

  observateurImages = new MutationObserver(function (objets, observateur) {
    const photo = objets[0].target;
    if (!photo.classList.contains(CLASSE_PHOTO_ITEM)) {
      augmenterTaillePhoto(photo);
    }
  });

  imgLazy.forEach(img => {
    observateurImages.observe(img, { attributes: true });
  });
}