/* Page de recherche des biens immobiliers */

// ID du <script> contenant toutes les données de la page sur les biens immobiliers en JSON !
const DATA_ID = '#__NEXT_DATA__';

// Listing des résultats de recherche
const LISTING = '[class*="styles_mainListing"]';

// Sélections dans un item de la liste de résultat
const DIV_PARENT_ITEM = 'div[class*="styles_adListItem"]';
const LIEN_ITEM = 'a[data-qa-id*="aditem_container"]';

// Balise <a> utilisée pour chaque item de la liste des résultats de recherche
const ITEM = '[data-qa-id="aditem_container"]';

// Dernière div dans le header avec les options de recherche
const BARRE_OUTILS_RECHERCHE_DIV = 'body noscript + div + div > div:last-child > div > div > div:nth-child(3)';

// ID des inputs terrain min et max
const INPUT_TERRAIN_MIN_ID = 'terrainMin';
const INPUT_TERRAIN_MAX_ID = 'terrainMax';

// Titre inutile "Annonces Maison à vendre et vente appartement :"
const TITRE_INUTILE = '[class*="styles_ListingFilters"] + div';

// Bandeau inutile "C'est le moment de vendre ! Demander une estimation gratuite"
const BANDEAU_ESTIMATION_GRATUITE = '[class*="styles_classifiedColumn"] > div:first-child';

// Barre option particuliers / pro / urgentes / tri
const BARRE_OPTIONS_FILTRAGE_ET_TRI = '[class*="styles_ListingFilters"]';

// Liste des résultats
const LISTE_RESULTATS = '[class*="styles_classifiedColumn"]';

// Éléments dans les items
const PHOTO_ITEM = '[data-qa-id="aditem_container"] > div > div > div > div > div:first-child';
const PRIX_ITEM = '[data-qa-id="aditem_container"] [data-qa-id="aditem_price"]';
const TITRE_ITEM = '[data-qa-id="aditem_title"]';

// Dernière div dans les informations à droite de la photo du bien sur chaque item
const DERNIERE_DIV_INFOS_ITEM = 'div > div > div > div + div > div + div';

// On vire les pubs
const PUB_TABOOLA = '[id*="taboola"]';
const PUB_CRITEO = '[id*="criteo"]';
const PUB_CRITEO_PARENT = '[class*="styles_order"]';
const PUB_GOOGLE = 'div.googleafs';