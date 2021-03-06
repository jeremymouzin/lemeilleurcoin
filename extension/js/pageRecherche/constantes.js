const COULEURS_ENERGIE = {
  'A': '#379932',
  'B': '#3acc31',
  'C': '#cdfd33',
  'D': '#fbea49',
  'E': '#fccc2f',
  'F': '#fb9c34',
  'G': '#fa1c1f',
};

// Clé des données récupérées depuis le <script> transformé en JSON
const CLE_NB_PIECES = 'rooms';
const CLE_SURFACE_HABITABLE = 'square';
const CLE_CLASSE_ENERGIE = 'energy_rate';
const CLE_GAZ_EFFETS_SERRE = 'ges';
const CLE_LIEU = 'location';

// Gestion du filtrage par taille de terrain / type de bien
const CLE_TERRAIN_MIN = 'terrainMin';
const CLE_TERRAIN_MAX = 'terrainMax';
const CLE_CACHER_PROJET_CONSTRUCTION = 'cacherProjetConstruction';
const DEFAUT_TERRAIN_MIN_EN_M2 = 0;
const DEFAUT_TERRAIN_MAX_EN_M2 = 4000;
const DEFAULT_CACHER_PROJET_CONSTRUCTION = false;
const TEXTE_CACHER_PROJET_CONSTRUCTION = "Ne pas afficher les projets de construction";

// Nom des classes CSS utilisées
const CLASSE_BOUTON_PHOTO_AVANT = 'lmc-bouton-avant';
const CLASSE_BOUTON_PHOTO_APRES = 'lmc-bouton-apres';
const CLASSE_BOUTON_PHOTO = 'lmc-bouton-photo';
const CLASSE_LABEL_ENERGIE = 'lmc-label-energie';
const CLASSE_FILTRE_TERRAIN = 'lmc-filtre-terrain';
const CLASSE_FILTRE_TERRAIN_LIGNE = 'lmc-filtre-terrain-ligne';
const CLASSE_TITRE_TERRAIN = 'lmc-titre-terrain';
const CLASSE_PRIX_ITEM = 'lmc-item-prix';
const CLASSE_INFOS = 'lmc-infos';
const CLASSE_INFOS_GRID = 'lmc-infos-grid';

// Contenu texte ajouté dynamiquement en JS
const TEXTE_BOUTON_FILTRER = 'Filtrer';
const TEXTE_BOUTON_DESACTIVER_FILTRER = 'Désactiver filtrage';
const TEXTE_AUCUN_TERRAIN = 'Aucun terrain';
const TEXTE_TAILLE_TERRAIN_INCONNUE = 'Terrain présent mais taille non mentionnée';
const TEXTE_PROJET_CONSTRUCTION = 'Projet de construction';
const TEXTE_CROIX_BOUTON_MASQUER_ANNONCE = "&times;";

// ID de certains éléments
const ID_BOUTON_FILTRER = "lmc-bouton-filtrer";

// Masquer une annonce
const CLASSE_INFOS_MASQUAGE = "lmc-infos-masquage";
const CLASSE_BOUTON_CROIX_MASQUER = "lmc-bouton-croix-masquer";
const CLASSE_BOUTON_CROIX_DEMASQUER = "lmc-bouton-croix-demasquer";