// ==UserScript==
// @name         Le Meilleur Coin
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Make the bon coin a better place AH AH AH AH
// @author       Jérémy Mouzin
// @match        https://www.leboncoin.fr/ventes_immobilieres/*
// @grant        none
// ==/UserScript==

(function() {
  const attrDesc = '[data-qa-id="adview_description_container"]';
  const spanDebut = '<span style="background-color: yellow">';
  const spanFin = '</span>';
  const terrainRegExp = /((\d{4,} ?(m²|m2))|\d+ ?(ha|are))/gi;
  const divDesc = document.querySelector(attrDesc);
  const MAX_TENTATIVES_VOIR_PLUS = 5;
  const TEMPS_ENTRE_TENTATIVES_EN_MS = 200;

  function clickVoirPlus() {
      console.log("Tentative click auto sur le bouton voir plus...");
      let boutonVoirPlus = divDesc.querySelector('button');
      if (boutonVoirPlus === null) {
          if (clickVoirPlus.compteur < MAX_TENTATIVES_VOIR_PLUS) {
              console.log(`ECHEC du click, on recommence dans ${TEMPS_ENTRE_TENTATIVES_EN_MS}ms (tentative ${clickVoirPlus.compteur})`);
              window.setTimeout(clickVoirPlus, TEMPS_ENTRE_TENTATIVES_EN_MS);
              clickVoirPlus.compteur++;
          } else {
              // On continue il n'y a pas de bouton "Voir Plus"
              console.log("Bouton Voir Plus introuvable...");
              mettreEnSurbrillance();
          }
      } else {
          console.log("OK Voir plus cliqué !");
          boutonVoirPlus.click();
          mettreEnSurbrillance();
      }
  }
  clickVoirPlus.compteur = 0;

  function mettreEnSurbrillance() {
      console.log("mettre en surbrillance");
      const description = divDesc.querySelector('span');
      if (description !== null) {
          let correspondance;
          while ((correspondance = terrainRegExp.exec(description.textContent)) !== null) {
              description.innerHTML = description.innerHTML.replace(correspondance[0],
                                                                   `${spanDebut}${correspondance[0]}${spanFin}`);
          }
          description.innerHTML = description.innerHTML.replace('terrain', '<strong>terrain</strong>');
      } else {
          console.log("Pas de correspondances");
      }
  }

  // On clique sur le bouton "Voir Plus"
  window.setTimeout(clickVoirPlus, TEMPS_ENTRE_TENTATIVES_EN_MS);

})();