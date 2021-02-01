// ==UserScript==
// @name         Le Meilleur Coin
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Make the bon coin a better place AH AH AH AH
// @author       Jérémy Mouzin
// @match        https://www.leboncoin.fr/ventes_immobilieres/*
// @grant        none
// ==/UserScript==

(function () {
  const attrDesc = '[data-qa-id="adview_description_container"]';
  const spanDebut = '<span style="background-color: yellow">';
  const spanFin = '</span>';
  const terrainRegExp = /((\d+ ?\d{3,} ?(m²|m2))|\d+ ?(ha|are|hectare))/gi;
  const divDesc = document.querySelector(attrDesc);
  const MAX_TENTATIVES_VOIR_PLUS = 5;
  const TEMPS_ENTRE_TENTATIVES_EN_MS = 200;
  const listeDeMotsAMettreEnGras = [
    'terrain',
    'jardin',
  ];

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
        ameliorer();
      }
    } else {
      boutonVoirPlus.click();
      ameliorer();
    }
  }
  clickVoirPlus.compteur = 0;

  function mettreEnSurbrillance(description) {
    if (description !== null) {
      let correspondance;
      while ((correspondance = terrainRegExp.exec(description.textContent)) !== null) {
        description.innerHTML = description.innerHTML.replace(correspondance[0],
          `${spanDebut}${correspondance[0]}${spanFin}`);
      }
    }
  }

  function mettreEnGras(description, listeDeMots) {
    listeDeMots.forEach(mot => {
      description.innerHTML = description.innerHTML.replace(mot, `<strong>${mot}</strong>`);
    });
  }

  function ameliorer() {
    const description = divDesc.querySelector('span');
    mettreEnSurbrillance(description);
    mettreEnGras(description, listeDeMotsAMettreEnGras);
  }

  // On clique sur le bouton "Voir Plus"
  window.setTimeout(clickVoirPlus, TEMPS_ENTRE_TENTATIVES_EN_MS);

})();