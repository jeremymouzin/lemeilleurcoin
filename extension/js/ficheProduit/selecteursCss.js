/* Description du bien */

// Description rapide du bien : titre, prix, lieu, date de parution
const SPOTLIGHT_DESCRIPTION = '[data-qa-id="adview_spotlight_description_container"]';
// Texte de la description détaillée du bien
const DESCRIPTION = '[data-qa-id="adview_description_container"] span';
// Prix dans la description
const PRIX = '[data-qa-id="adview_spotlight_description_container"] [data-qa-id="adview_price"] > span';
// Nom du lieu du bien
const LIEU = '[data-qa-id="adview_spotlight_description_container"] > div:nth-child(2) > div > span:last-child';
// Bouton "Voir plus"
const BOUTON_VOIR_PLUS = '[data-qa-id="adview_description_container"] button';
// Options de l'annonce (remontée en tête de liste etc.)
const OPTIONS_ANNONCE = '[class*="styles_Options"]';

/* Critères */

// Conteneur de tous les critères énergétiques & meta informations sur le bien
const CONTENEUR_CRITERES = '[data-qa-id="criteria_container"]';
// Critère classe énergie (avec la liste des lettres ABCDEFG)
const CLASSE_ENERGIE_LETTRES = '[data-qa-id="criteria_item_energy_rate"] [class*="styles_EnergyCriteria"]';
// Critère GES (avec la liste des lettres ABCDEFG)
const GES_LETTRES = '[data-qa-id="criteria_item_ges"] [class*="styles_EnergyCriteria"]';
// Lettre active d'un critère de classe énergie ou GES
const CLASSE_ENERGIE_LETTRE_ACTIVE = '[class*="styles_active"]';
// Surface habitable
const SURFACE_HABITABLE = '[data-qa-id="criteria_item_square"] > div > p:last-child';

const REFERENCE = '[data-qa-id="criteria_item_custom_ref"]';
const HONORAIRES = '[data-qa-id="criteria_item_fai_included"]';