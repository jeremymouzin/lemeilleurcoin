const attrDesc = '[data-qa-id="adview_description_container"]';
const spanDebut = '<span style="background-color: yellow">';
const spanFin = '</span>';
const terrainRegExp = /((\d+ ?\d{3,} ?(m²|m2))|\d+ ?(ha|are|hectare))/gi;
const divDesc = document.querySelector(attrDesc);
const MAX_TENTATIVES_VOIR_PLUS = 5;
const TEMPS_ENTRE_TENTATIVES_EN_MS = 200;
const listeDeMotsAMettreEnGras = [
  'terrain',
  'jardin',
];

function clickVoirPlus() {
  let boutonVoirPlus = divDesc.querySelector('button');
  if (boutonVoirPlus === null) {
    if (clickVoirPlus.compteur < MAX_TENTATIVES_VOIR_PLUS) {
      window.setTimeout(clickVoirPlus, TEMPS_ENTRE_TENTATIVES_EN_MS);
      clickVoirPlus.compteur++;
    } else {
      // On continue il n'y a pas de bouton "Voir Plus"
      ameliorer();
    }
  } else {
    boutonVoirPlus.click();
    ameliorer();
  }
}
clickVoirPlus.compteur = 0;

function mettreEnSurbrillance(description) {
  const taillesTerrain = [];
  if (description !== null) {
    let correspondance;
    while ((correspondance = terrainRegExp.exec(description.textContent)) !== null) {
      description.innerHTML = description.innerHTML.replace(correspondance[0],
        `${spanDebut}${correspondance[0]}${spanFin}`);

      // On ne récupère que la valeur numérique
      taillesTerrain.push(Number.parseInt(correspondance[0].replaceAll(' ', '')));
    }
  }
  return taillesTerrain;
}

function mettreEnGras(description, listeDeMots) {
  listeDeMots.forEach(mot => {
    description.innerHTML = description.innerHTML.replace(mot, `<strong>${mot}</strong>`);
  });
}

function supprimerInfosInutiles() {
  const selecteursDivACacher = [
    '[data-qa-id="criteria_item_real_estate_type"]',
    '[data-qa-id="criteria_item_square"]',
    '[data-qa-id="criteria_item_rooms"]',
    '[data-qa-id="criteria_item_custom_ref"]',
    '[data-qa-id="adview_date"]',
  ];
  selecteursDivACacher.forEach(selecteur => {
    const div = document.querySelector(selecteur);
    if (div) div.style.display = 'none';
  });
}

function remonterInfosImportantes(taillesTerrain) {
  const conteneurDescription = document.querySelector('[data-qa-id="adview_spotlight_description_container"]');

  // Déplacement des critères énergétiques en haut
  const criteres = document.querySelector('[data-qa-id="criteria_container"]');
  conteneurDescription.after(criteres);

  // Critères énergétiques en plus gros
  const energie = document.querySelector('[data-qa-id="criteria_item_energy_rate"] [class*="styles_EnergyCriteria"]');
  const energieActif = energie.querySelector('[class*="styles_active"]');
  energieActif.style.fontSize = '3rem';
  energieActif.style.height = '3rem';

  // Idem pour GES
  const ges = document.querySelector('[data-qa-id="criteria_item_ges"] [class*="styles_EnergyCriteria"]');
  const gesActif = ges.querySelector('[class*="styles_active"]');
  gesActif.style.fontSize = '3rem';
  gesActif.style.height = '3rem';

  // Prix en plus gros
  const prix = document.querySelector('[data-qa-id="adview_price"] > span');
  prix.style.fontSize = '2.5rem';

  // Ajout de la taille du terrain
  taillesTerrain.forEach(taille => {
    const tailleTerrain = document.createElement('p');
    tailleTerrain.style.marginTop = '2rem';
    tailleTerrain.innerHTML = `<strong style="font-size: 2rem;">☘️ Terrain ${taille} m²</strong>`;
    conteneurDescription.after(tailleTerrain);
  });
}

function lienGoogleMaps() {
  const googleMapsURL = 'https://www.google.fr/maps/search/';
  let departement = document.querySelector('[data-qa-id="adview_spotlight_description_container"] > div:last-child > div > span');
  const nomDepartement = departement.firstChild.textContent;
  const urlFinale = googleMapsURL + nomDepartement.replace(' ', '+');
  departement.innerHTML = `<a href="${urlFinale}" target="_blank">${nomDepartement}</a>`;
  departement.firstElementChild.style.fontSize = "1.5rem";
  departement.firstElementChild.style.color = "blue";
  departement.firstElementChild.style.textDecoration = "underline";
  departement.firstElementChild.style.marginRight = "1rem";
}

function ameliorer() {
  const description = divDesc.querySelector('span');
  const taillesTerrain = mettreEnSurbrillance(description);
  mettreEnGras(description, listeDeMotsAMettreEnGras);
  supprimerInfosInutiles();
  remonterInfosImportantes(taillesTerrain);
  lienGoogleMaps();
}

// On clique sur le bouton "Voir Plus"
window.setTimeout(clickVoirPlus, TEMPS_ENTRE_TENTATIVES_EN_MS);