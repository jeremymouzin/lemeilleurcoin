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

const NOM_LABELS = {
  [CLE_NB_PIECES]: "Pièces",
  [CLE_SURFACE_HABITABLE]: "Surface",
};

// Gestion du filtrage par taille de terrain
const CLE_TERRAIN_MIN = 'terrainMin';
const CLE_TERRAIN_MAX = 'terrainMax';
const DEFAUT_TERRAIN_MIN_EN_M2 = 0;
const DEFAUT_TERRAIN_MAX_EN_M2 = 4000;