/* Gestion dynamique des pages */
const ATTRIBUT_PAGE = 'pagename';
const ATTRIBUT_DATASET_PAGE = 'data-' + ATTRIBUT_PAGE;
const NOM_PAGE_RECHERCHE = 'listing';
const NOM_PAGE_FICHE_PRODUIT = 'adview';
const SELECTEUR_CSS_CONTENEUR_PRINCIPAL = '#container';

const REGEXP_TERRAIN = /((\d+ ?\d{3,} ?(m²|m2))|\d+ ?(ha[ .,!]|are[ .,!]|hectare[ .,!]))/gi;

function cacherElement(selecteur) {
  const el = document.querySelector(selecteur);
  if (el !== null) el.style.display = 'none';
}

/**
 * Extrait les surfaces du terrain depuis l'annonce
 * 
 * @param {string} description Description détaillée du bien
 * @param {number} surfaceHabitable Taille de la surface du bien habitable
 */
function extraireSurfacesTerrain(description, surfaceHabitable) {
  const REGEXP_TERRAIN = /(?<=[\W ])([\d ]+[.,]?[\d ]+)(m²|m2|has?(?=[^a-z]|$)|ares?(?=[^a-z]|$)|hectares?(?=[^a-z]|$))/gi;
  const surfacesTerrain = [];

  let correspondance;
  while (correspondance = REGEXP_TERRAIN.exec(description)) {
    let [label, taille, unite] = correspondance;
    taille = Number.parseFloat(taille.replace(/ /, ''));

    const tailleEnM2 = convertirEnMetresCarres(taille, unite);

    // On suppose que seules les tailles supérieures à la surface habitable
    // du bien sont des surfaces de terrain
    if (tailleEnM2 > surfaceHabitable) {
      surfacesTerrain.push({
        tailleEnM2,
        label: tailleEnM2 + ' m²',
      });
    }
  }

  return surfacesTerrain;
}

/**
 * Convertit une surface donnée en mètres carrés
 * 
 * @param {string} taille La taille de la surface
 * @param {string} unite L'unité de mesure (cf REGEXP_TERRAIN)
 */
function convertirEnMetresCarres(taille, unite) {
  // On ne fait pas attention à la casse
  unite = unite.toLowerCase();

  // On renvoie un nombre, pas une chaîne
  taille = Number.parseFloat(taille.replace(',','.'));
  
  // On supprime le 's' final sur les unités s'il y est
  if (unite.startsWith('ha') || unite.startsWith('hectare')) unite = 'ha';
  if (unite.startsWith('are')) unite = 'are';

  switch (unite) {
    case 'are':
      taille *= 100;
      break;
    case 'ha':
      taille *= 10000;
      break;
    default:
      break;
  }

  taille = Math.trunc(taille);
  return taille;
}

// Hook pour les tests unitaires avec Jest
try {
  module.exports = { extraireSurfacesTerrain, convertirEnMetresCarres };
} catch (erreur) {
  // On est en production, module est undefined c'est normal
}
