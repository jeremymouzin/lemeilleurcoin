let listing;
let observateur;
let filtrageActif = false;

function pageRecherche() {
  observateur = new MutationObserver(function (objets, observateur) {
    /*
    Le callback est appelé 2 fois :
    - 1 fois pour mettre des placeholders pendant le chargement de la page
    - 1 fois pour mettre les données lorsqu'elles sont chargées (via la XHR)
    Il faut attendre que la XHR soit finie donc attendre le 2ème appel
    */
    if (observateur.compteur >= 2) {
      observateur.compteur = 1;
      // C'est la 2ème fois que l'observateur est appelé, on peut éventuellement mettre à jour la liste

      // On ne met à jour que si on est sur une recherche dans ventes immobilières
      if (!onEstDansVenteImmobiliere()) {
        // Sinon on retire les options de filtrage dans le header
        supprimerHeader();
        return;
      }

      // On récupère la page avec les données depuis le cache
      fetch(window.location.href, { cache: 'force-cache' })
        .then(function (response) {
          return response.text();
        })
        .then(function (texteHtml) {
          const parser = new DOMParser();
          const doc = parser.parseFromString(texteHtml, "text/html");

          ameliorerInterface(doc);

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

  // On effectue des modifications sur la page que si on est sur la page de vente immobilière
  if (onEstDansVenteImmobiliere()) {
    // On récupère les données du document au chargement de la page
    ameliorerInterface(document);
  } else {
    supprimerHeader();
  }
}

function ameliorerInterface(document) {
  listing = recupererDonnees(document);
  ameliorerListing();
  ameliorerHeader();
}

function onEstDansVenteImmobiliere() {
  const url = window.location.href;
  return url.search('category=9') >= 0 || url.search('ventes_immobilieres') >= 0;
}

function pageRechercheFin() {
  if (observateur !== undefined) {
    observateur.disconnect();
  }
}

function rechargerCettePage() {
  window.location.assign(window.location);
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
      console.error(erreur);
      rechargerCettePage();
    }
  } else {
    rechargerCettePage();
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

function supprimerHeader() {
  const elFiltrageTerrain = document.querySelector(`.${CLASSE_FILTRE_TERRAIN}`);
  if (elFiltrageTerrain !== null) elFiltrageTerrain.remove();
}

function ameliorerPhoto(elPicture, id) {
  const photoImg = document.createElement('img');
  elPicture.replaceWith(photoImg);

  if (listing[id] && listing[id].images && listing[id].images.urls) {
    photoImg.src = listing[id].images.urls[0];
  }

  // Boutons pour voir toutes les photos
  const boutonAvant = creerBoutonPhoto(CLASSE_BOUTON_PHOTO_AVANT);
  const boutonApres = creerBoutonPhoto(CLASSE_BOUTON_PHOTO_APRES);

  // On ajoute les boutons après le lien
  const lienItem = photoImg.closest('a');
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

function ameliorerListing() {
  // On récupère d'abord les annonces masquées
  chargerAnnoncesMasquees(function (resultat) {
    annoncesMasquees = resultat[CLE_LISTE_ANNONCES_MASQUEES];

    const listeResultats = document.querySelectorAll(ITEM);
    if (listeResultats !== null) {
      for (const resultat of listeResultats) {
        const id = extraireID(resultat.href);

        // S'il manque une info pour un bien, on recharge la page
        if (listing === undefined || listing[id] === undefined) {
          rechargerCettePage();
          return;
        }

        // Suppression du titre
        const titreItem = resultat.querySelector(TITRE_ITEM);
        if (titreItem !== null) titreItem.remove();

        // Affichage des informations importantes avec les icônes
        const infosBien = resultat.querySelector(DIV_INFOS_ITEM);
        if (infosBien === null) continue;

        // On supprime tout le contenu de base du site
        infosBien.innerHTML = "";

        // On corrige le layout pour nos besoins
        infosBien.classList.add(CLASSE_INFOS);
        // On corrige le layout de la grid d'un item
        const gridDiv = resultat.querySelector(ITEM_DIV_GRID);
        gridDiv.classList.add(CLASSE_INFOS_GRID);

        // On ajoute les infos avec les icônes
        const tailleTerrain = ajouterChamp('terrain', id, infosBien);
        resultat.dataset.surfaceTerrain = tailleTerrain;

        ajouterChamp(CLE_SURFACE_HABITABLE, id, infosBien);

        ajouterChamp(CLE_LIEU, id, infosBien);

        ajouterChamp(CLE_CLASSE_ENERGIE, id, infosBien);
        ajouterChamp(CLE_GAZ_EFFETS_SERRE, id, infosBien);

        // Gestion du masquage des annonces
        ajouterBoutonMasquerAnnonce(resultat, id);

        if (annonceEstMasquee(id)) {
          decorerAnnonceMasquee(resultat, id);
        }

        // Gestion des photos
        const elPicture = resultat.querySelector(PHOTO_ITEM);
        if (elPicture === null) continue;

        // On remplace le <picture> par un simple <img>
        ameliorerPhoto(elPicture, id);
      }
    }
  });

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

function ajouterBoutonMasquerAnnonce(item, id) {
  // Création du bouton
  const boutonMasquer = document.createElement('button');
  boutonMasquer.innerHTML = TEXTE_CROIX_BOUTON_MASQUER_ANNONCE;
  boutonMasquer.classList.add(CLASSE_BOUTON_CROIX_MASQUER);

  boutonMasquer.addEventListener('click', function (e) {
    if (annonceEstMasquee(id)) {
      // Si l'annonce est déjà masquée, on la démasque
      demasquerAnnonce(item, id);
    } else {
      // L'annonce n'est pas masquée, on la masque
      masquerAnnonce(item, id);
    }
  });

  item.after(boutonMasquer);
}

function annonceEstMasquee(id) {
  return annoncesMasquees.some(annonce => annonce.id === id);
}

function decorerAnnonceMasquee(item, id) {
  const infosAnnonce = annoncesMasquees.find(annonce => annonce.id === id);
  if (infosAnnonce !== undefined) {
    // Le bouton doit devenir un bouton de démasquage
    const boutonMasquer = item.parentElement.querySelector(`.${CLASSE_BOUTON_CROIX_MASQUER}`);
    if (boutonMasquer !== null) {
      boutonMasquer.classList.add(CLASSE_BOUTON_CROIX_DEMASQUER);
    }

    const infosMasquage = document.createElement('div');
    infosMasquage.classList.add(CLASSE_INFOS_MASQUAGE);
    let { motif, prix, date } = infosAnnonce;
    infosMasquage.innerHTML = `<div><p>Annonce masquée le ${date}</p>
    <p>Motif : ${motif}</p>
    <p>Prix (au ${date}) : ${prix} €</p></div>`;
    item.after(infosMasquage);
  }
}

function masquerAnnonce(item, id) {
  if (listing[id] === undefined) return;

  const prix = listing[id].price[0];
  const ville = extraireObjet(CLE_LIEU, listing[id]).value_label;
  const url = item.href;
  const date = new Intl.DateTimeFormat('fr-FR').format(new Date());
  const motif = window.prompt("Motif du masquage ?", "");
  if (motif !== null) {
    // On supprime l'annonce masquée si elle était déjà présente
    annoncesMasquees = annoncesMasquees.filter(annonce => annonce.id !== id);
    // On ajoute / met à jour l'annonce
    annoncesMasquees.push({
      id,
      prix,
      ville,
      date,
      url,
      motif,
    });

    // On sauvegarde la liste des annonces masquées
    sauvegarderAnnoncesMasquees(function () {
      // On décore l'annonce masquée avec ses informations
      decorerAnnonceMasquee(item, id);
    });
  }
}

function demasquerAnnonce(item, id) {
  // On démasque l'annonce
  const infosMasquage = item.parentElement.querySelector(`.${CLASSE_INFOS_MASQUAGE}`);
  if (infosMasquage !== null) {
    infosMasquage.remove();
  }

  // On retire l'ID de la liste des annonces masquées
  annoncesMasquees.splice(annoncesMasquees.indexOf(id), 1);
  sauvegarderAnnoncesMasquees();

  // Le bouton doit devenir un bouton de masquage
  const boutonMasquer = item.parentElement.querySelector(`.${CLASSE_BOUTON_CROIX_MASQUER}`);
  if (boutonMasquer !== null) {
    boutonMasquer.classList.remove(CLASSE_BOUTON_CROIX_DEMASQUER);
  }
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
    nouvelleDiv.innerHTML = `<img src="${chrome.runtime.getURL('images/icone-terrain.png')}" alt="Terrain">`;

    if (label === TEXTE_PROJET_CONSTRUCTION) {
      nouvelleDiv.innerHTML += `<img src="${chrome.runtime.getURL('images/icone-construction.png')}" alt="Construction">`;
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

    nouvelleDiv.innerHTML = `<img src="${chrome.runtime.getURL('images/icone-maison.png')}" alt="Plan maison"><p><span class="${CLASSE_INFOS_VALEUR}">${surfaceHabitable}</span>m² — <span class="${CLASSE_INFOS_VALEUR}">${nbPieces}</span>pièces</p>`;
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

  // On n'ajoute le filtrage que s'il n'y est pas déjà
  const elFiltrageTerrain = document.querySelector(`.${CLASSE_FILTRE_TERRAIN}`);
  if (elFiltrageTerrain !== null) return;

  const fieldSet = document.createElement('fieldset');
  fieldSet.classList.add(CLASSE_FILTRE_TERRAIN);

  // Quand l'utilisateur change une valeur de filtre, on désactive le filtrage en cours
  fieldSet.addEventListener('input', desactiverFiltrage);

  const VALEURS_TERRAIN = {
    [CLE_TERRAIN_MIN]: DEFAUT_TERRAIN_MIN_EN_M2,
    [CLE_TERRAIN_MAX]: DEFAUT_TERRAIN_MAX_EN_M2,
    [CLE_CACHER_PROJET_CONSTRUCTION]: DEFAULT_CACHER_PROJET_CONSTRUCTION,
  };

  // Récupération des valeurs précédemment sauvegardées (ou utilisation de celles par défaut)
  chrome.storage.sync.get(VALEURS_TERRAIN, function (result) {
    const surfaceTerrainMin = result[CLE_TERRAIN_MIN];
    const surfaceTerrainMax = result[CLE_TERRAIN_MAX];
    const cacherProjetConstruction = result[CLE_CACHER_PROJET_CONSTRUCTION];

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
      [CLE_TERRAIN_MIN]: surfaceMin,
      [CLE_TERRAIN_MAX]: surfaceMax,
      [CLE_CACHER_PROJET_CONSTRUCTION]: cacherProjetConstruction,
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
Lors du chargement de la liste des résultats de recherche, certaines images sont chargées au moment du scroll et leurs classes sont réaffectées...
L'objectif de ce code est de détecter quand une photo se charge et de la modifier comme on veut
*/
function gererImagesLazyLoading() {

  const imgLazy = document.querySelectorAll(DIV_LAZYLOADING);
  if (imgLazy === null) return;

  observateurImages = new MutationObserver(function (objets, observateur) {
    const elPicture = objets[0].target.querySelector('picture');
    if (elPicture !== null) {
      const lienItem = elPicture.closest('a');
      const id = extraireID(lienItem.href);
      ameliorerPhoto(elPicture, id);
    }
  });

  imgLazy.forEach(img => {
    observateurImages.observe(img, { attributes: true });
  });
}