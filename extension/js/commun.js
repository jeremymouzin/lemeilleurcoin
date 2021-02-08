/* Gestion dynamique des pages */
const ATTRIBUT_PAGE = 'pagename';
const NOM_PAGE_RECHERCHE = 'listing';
const NOM_PAGE_FICHE_PRODUIT = 'adview';

const REGEXP_TERRAIN = /((\d+ ?\d{3,} ?(m²|m2))|\d+ ?(ha[ .,!]|are[ .,!]|hectare[ .,!]))/gi;

function cacherElement(selecteur) {
  const el = document.querySelector(selecteur);
  if (el !== null) el.style.display = 'none';
}