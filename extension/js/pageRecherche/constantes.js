const COULEURS_ENERGIE = {
  'A': '#379932',
  'B': '#3acc31',
  'C': '#cdfd33',
  'D': '#fbea49',
  'E': '#fccc2f',
  'F': '#fb9c34',
  'G': '#fa1c1f',
};

const COULEURS_GES = {
  'A': '#f6edfe',
  'B': '#e4c7fb',
  'C': '#d2adf1',
  'D': '#c99aef',
  'E': '#b77ae9',
  'F': '#a659e9',
  'G': '#8835d9',
};

// Clé des données récupérées depuis le <script> transformé en JSON
const CLE_NB_PIECES = 'rooms';
const CLE_SURFACE_HABITABLE = 'square';
const CLE_CLASSE_ENERGIE = 'energy_rate';
const CLE_GAZ_EFFETS_SERRE = 'ges';
const CLE_LIEU = 'location';

const NOM_LABELS = {
  [CLE_NB_PIECES]: "Pièces",
  [CLE_SURFACE_HABITABLE]: "Surface",
  [CLE_LIEU]: "Lieu",
};

// Gestion du filtrage par taille de terrain / type de bien
const CLE_TERRAIN_MIN = 'terrainMin';
const CLE_TERRAIN_MAX = 'terrainMax';
const CLE_CACHER_PROJET_CONSTRUCTION = 'cacherProjetConstruction';
const DEFAUT_TERRAIN_MIN_EN_M2 = 0;
const DEFAUT_TERRAIN_MAX_EN_M2 = 4000;
const DEFAULT_CACHER_PROJET_CONSTRUCTION = false;
const TEXTE_CACHER_PROJET_CONSTRUCTION = "Cacher les projets de construction";

// Nom des classes CSS utilisées
const CLASSE_BOUTON_PHOTO_AVANT = 'lmc-bouton-avant';
const CLASSE_BOUTON_PHOTO_APRES = 'lmc-bouton-apres';
const CLASSE_BOUTON_PHOTO = 'lmc-bouton-photo';
const CLASSE_LABEL_ENERGIE = 'lmc-label-energie';
const CLASSE_FILTRE_TERRAIN = 'lmc-filtre-terrain';
const CLASSE_FILTRE_TERRAIN_LIGNE = 'lmc-filtre-terrain-ligne';
const CLASSE_TITRE_TERRAIN = 'lmc-titre-terrain';
const CLASSE_PHOTO_ITEM = 'lmc-photo';
const CLASSE_INFOS_ICONE = 'lmc-infos-icone';
const CLASSE_INFOS_VALEUR = 'lmc-infos-valeur';

// Contenu texte ajouté dynamiquement en JS
const TEXTE_BOUTON_FILTRER = 'Filtrer';
const TEXTE_BOUTON_DESACTIVER_FILTRER = 'Désactiver filtrage';
const TEXTE_AUCUN_TERRAIN = 'Aucun terrain';
const TEXTE_TAILLE_TERRAIN_INCONNUE = 'Terrain présent mais taille non mentionnée';
const TEXTE_PROJET_CONSTRUCTION = 'Projet de construction';

// ID de certains éléments
const ID_BOUTON_FILTRER = "lmc-bouton-filtrer";