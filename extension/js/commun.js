/* Gestion dynamique des pages */
const ATTRIBUT_PAGE = 'pagename';
const ATTRIBUT_DATASET_PAGE = 'data-' + ATTRIBUT_PAGE;
const NOM_PAGE_RECHERCHE = 'listing';
const NOM_PAGE_FICHE_PRODUIT = 'adview';
const SELECTEUR_CSS_CONTENEUR_PRINCIPAL = '#container';

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
  const REGEXP_TERRAIN = /((?:\d{1,}|\d{1,3}(?: |&nbsp;|\u00a0)\d{3})(?:[.,]\d{1,2})?)(?: |&nbsp;|\u00a0)?(m²|m2|ares?|has?|hectares?)(?=[^a-z]|$)/gi;
  const surfacesTerrain = [];

  let correspondance;
  while (correspondance = REGEXP_TERRAIN.exec(description)) {
    let [tailleOriginale, taille, unite] = correspondance;

    const tailleEnM2 = convertirEnMetresCarres(taille, unite);

    // On suppose que seules les tailles supérieures à la surface habitable
    // du bien sont des surfaces de terrain
    if (tailleEnM2 > surfaceHabitable) {
      surfacesTerrain.push({
        tailleEnM2,
        label: tailleEnM2 + ' m²',
        tailleOriginale,
      });
    }
  }

  if (surfacesTerrain.length === 0) {
    surfacesTerrain.push({
      tailleEnM2: 0,
      label: '0 m²',
      tailleOriginale: '0 m²',
    });
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

  // On retire l'éventuel espace (ou espace insécable) des milliers ("1 337" => "1337")
  taille = taille.replace(/ |&nbsp;|\u00a0/, '');

  // On remplace la virgule française par le point
  taille = taille.replace(',', '.');

  // On transforme en un nombre
  taille = Number.parseFloat(taille);

  // On supprime le 's' final sur les unités s'il y est
  if (unite.startsWith('ha') || unite.startsWith('hectare')) unite = 'ha';
  if (unite.startsWith('are')) unite = 'are';

  switch (unite) {
    case 'are':
      taille *= 100;
      // On supprime la partie décimale éventuellement restante
      taille = Math.round(taille);
      break;
    case 'ha':
      taille *= 10000;
      // On supprime la partie décimale éventuellement restante
      taille = Math.round(taille);
      break;
    default:
      break;
  }

  return taille;
}

// Hook pour les tests unitaires avec Jest
try {
  module.exports = { extraireSurfacesTerrain, convertirEnMetresCarres };
} catch (erreur) {
  // On est en production, module est undefined c'est normal
}
