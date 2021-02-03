const { it, expect } = require('@jest/globals');
const mettreEnSurbrillance = require('../js/fiche_produit');

it("test la surbrillance", () => {
  expect(mettreEnSurbrillance("bonjour terrain de 1200 m2"))
    .toEqual([]);
});