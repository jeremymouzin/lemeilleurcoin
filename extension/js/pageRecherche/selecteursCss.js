/* Page de recherche des biens immobiliers */

// ID du <script> contenant toutes les données de la page sur les biens immobiliers en JSON !
const DATA_ID = '__NEXT_DATA__';

// Balise <a> utilisée pour chaque item de la liste des résultats de recherche
const ITEM = '[data-qa-id="aditem_container"]';

// Dernière div dans le header avec les options de recherche
const BARRE_OUTILS_RECHERCHE_DIV = 'body noscript + div + div > div:last-child > div > div > div:nth-child(3)';

// Dernière div dans les informations à droite de la photo du bien sur chaque item
const DERNIERE_DIV_INFOS_ITEM = 'div > div > div > div + div + div';