const attrDesc = '[data-qa-id="adview_description_container"]';
const spanDebut = '<span style="background-color: yellow">';
const spanFin = '</span>';
const terrainRegExp = /((\d+ ?\d{3,} ?(m²|m2))|\d+ ?(ha[ .,!]|are[ .,!]|hectare[ .,!]))/gi;
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

// Hook pour les tests unitaires avec Jest
try {
  module.exports = mettreEnSurbrillance;
} catch(erreur) {
  // On est en production, module est undefined c'est normal
}

function mettreEnGras(description, listeDeMots) {
  listeDeMots.forEach(mot => {
    const regexp = new RegExp(`${mot}`, 'gi');
    const correspondances = regexp.exec(description.textContent);
    if (correspondances !== null) {
      for (const correspondance of correspondances) {
        description.innerHTML = description.innerHTML.replace(correspondance, `<strong>${correspondance}</strong>`);
      }
    }
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
  energieActif.classList.add('lmc-energie-lettre-active');

  // Idem pour GES
  const ges = document.querySelector('[data-qa-id="criteria_item_ges"] [class*="styles_EnergyCriteria"]');
  const gesActif = ges.querySelector('[class*="styles_active"]');
  gesActif.classList.add('lmc-energie-lettre-active');

  // Prix en plus gros
  const prix = document.querySelector('[data-qa-id="adview_price"] > span');
  prix.classList.add('lmc-prix');

  // Ajout de la taille du terrain
  const tailleTerrain = document.createElement('p');
  tailleTerrain.classList.add('lmc-terrain');
  
  let taille;
  if (taillesTerrain.length === 0) {
    taille = "< 1000";
  } else {
    taille = taillesTerrain.map(t => t + " m²").join(', ');
  }
  tailleTerrain.textContent = `☘️ Terrain ${taille} m²`;
  conteneurDescription.after(tailleTerrain);
}

function lienGoogleMaps() {
  const googleMapsURL = 'https://www.google.fr/maps/search/';
  let departement = document.querySelector('[data-qa-id="adview_spotlight_description_container"] > div:last-child > div > span');
  departement.classList.add('lmc-departement');
  const nomDepartement = departement.firstChild.textContent;
  const urlFinale = googleMapsURL + nomDepartement.replace(' ', '+');
  departement.innerHTML = `<a href="${urlFinale}" target="_blank">${nomDepartement}</a>`;
}

function cacherElement(selecteur) {
  const el = document.querySelector(selecteur);
  if (el !== null) el.style.display = 'none';
}

function supprimerElementsInutiles() {
  // Date de parution
  cacherElement('[data-qa-id="adview_date"]');
  // Référence inutile
  cacherElement('[data-qa-id="criteria_item_custom_ref"]');
  // Honoraires, c'est déjà marqué dans l'annonce !
  cacherElement('[data-qa-id="criteria_item_fai_included"]');
}

function ameliorer() {
  const description = divDesc.querySelector('span');
  const taillesTerrain = mettreEnSurbrillance(description);
  mettreEnGras(description, listeDeMotsAMettreEnGras);
  remonterInfosImportantes(taillesTerrain);
  lienGoogleMaps();
  supprimerElementsInutiles();
}

// On clique sur le bouton "Voir Plus"
window.setTimeout(clickVoirPlus, TEMPS_ENTRE_TENTATIVES_EN_MS);