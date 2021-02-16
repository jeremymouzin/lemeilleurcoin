function clickVoirPlus() {
  let boutonVoirPlus = document.querySelector(BOUTON_VOIR_PLUS);
  if (boutonVoirPlus === null) {
    if (clickVoirPlus.compteur < BOUTON_VOIR_PLUS_MAX_TENTATIVES) {
      window.setTimeout(clickVoirPlus, BOUTON_VOIR_PLUS_TEMPS_ENTRE_TENTATIVES_EN_MS);
      clickVoirPlus.compteur++;
    } else {
      // On continue il n'y a pas de bouton "Voir Plus"
      clickVoirPlus.compteur = 0;
      ameliorer();
    }
  } else {
    clickVoirPlus.compteur = 0;
    boutonVoirPlus.click();
    ameliorer();
  }
}
clickVoirPlus.compteur = 0;

function mettreEnSurbrillance(description, surfacesTerrain) {
  if (description !== null) {
    surfacesTerrain.forEach(surface => {
      surface = surface.tailleOriginale;
      description.innerHTML = description.innerHTML.replace(surface, `<span class="lmc-surligner">${surface}</span>`);
    });
  }
}

function remonterInfosImportantes(surfacesTerrain, criteres) {
  const conteneurDescription = document.querySelector(SPOTLIGHT_DESCRIPTION);

  // Déplacement des critères énergétiques en haut
  conteneurDescription.after(criteres);

  // Critères énergétiques en plus gros
  const energie = document.querySelector(CLASSE_ENERGIE_LETTRES);
  if (energie !== null) {
    const energieActif = energie.querySelector(CLASSE_ENERGIE_LETTRE_ACTIVE);
    energieActif.classList.add('lmc-energie-lettre-active');
  }

  // Idem pour GES
  const ges = document.querySelector(GES_LETTRES);
  if (ges !== null) {
    const gesActif = ges.querySelector(CLASSE_ENERGIE_LETTRE_ACTIVE);
    gesActif.classList.add('lmc-energie-lettre-active');
  }

  // Prix en plus gros
  const prix = document.querySelector(PRIX);
  prix.classList.add('lmc-prix');

  // Ajout de la taille du terrain
  // TODO: Gérer le cas où il y a plusieurs terrains / parcelles : faire la somme ?
  const taille = surfacesTerrain[0].label;
  const tailleTerrain = document.createElement('p');
  tailleTerrain.classList.add('lmc-terrain');

  tailleTerrain.textContent = `☘️ Terrain ${taille}`;
  conteneurDescription.after(tailleTerrain);
}

function lienGoogleMaps() {
  const googleMapsURL = 'https://www.google.fr/maps/search/';
  let lieu = document.querySelector(LIEU);
  if (lieu !== null) {
    lieu.classList.add('lmc-lieu');
    const nomLieu = lieu.firstChild.textContent;
    const urlFinale = googleMapsURL + nomLieu.replace(' ', '+');
    lieu.innerHTML = `<a href="${urlFinale}" target="_blank">${nomLieu}</a>`;
  }
}

function supprimerElementsInutiles() {
  // Date de parution
  cacherElement(DATE_PARUTION);
  // Référence inutile
  cacherElement(REFERENCE);
  // Honoraires, c'est déjà marqué dans l'annonce !
  cacherElement(HONORAIRES);
}

function ameliorer() {
  const description = document.querySelector(DESCRIPTION);
  const criteres = document.querySelector(CONTENEUR_CRITERES);

  // Taille de la surface habitable
  let surfaceHabitable = criteres.querySelector(SURFACE_HABITABLE);
  surfaceHabitable = Number.parseFloat(surfaceHabitable.textContent);

  // Extraction des surfaces de terrain
  let surfacesTerrain = extraireSurfacesTerrain(description.textContent, surfaceHabitable);
  mettreEnSurbrillance(description, surfacesTerrain);
  remonterInfosImportantes(surfacesTerrain, criteres);
  lienGoogleMaps();
  supprimerElementsInutiles();
}

function ficheProduit() {
  // On clique sur le bouton "Voir Plus"
  window.setTimeout(clickVoirPlus, BOUTON_VOIR_PLUS_TEMPS_ENTRE_TENTATIVES_EN_MS);
}

function ficheProduitFin() {
}


