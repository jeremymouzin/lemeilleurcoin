const { it, expect } = require("@jest/globals");
const {
  extraireSurfacesTerrain,
  convertirEnMetresCarres,
} = require("../extension/js/commun");

describe("Conversion de surfaces", () => {
  const tests = [
    [1, "are", 100],
    [2, "ares", 200],
    [42, "m2", 42],
    [1250, "m²", 1250],
    [1, "ha", 10000],
    [2, "has", 20000],
    [1, "hectare", 10000],
    [2, "hectares", 20000],
    [1.4, "hectare", 14000],
    [2.5, "hectares", 25000],
  ];

  tests.forEach((test) => {
    it(`convertir ${test[0]} ${test[1]} en ${test[2]} m²`, function () {
      expect(convertirEnMetresCarres(test[0], test[1])).toBe(test[2]);
    });
    // On teste aussi avec la 1ère lettre de l'unité en majuscule
    const uniteLettre1EnMajuscule = test[1][0].toUpperCase() + test[1].slice(1);
    it(`convertir ${test[0]} ${uniteLettre1EnMajuscule} en ${test[2]} m²`, function () {
      expect(convertirEnMetresCarres(test[0], uniteLettre1EnMajuscule)).toBe(
        test[2]
      );
    });
    // On teste avec l'unité en majuscules
    const uniteEnMajuscules = test[1].toUpperCase();
    it(`convertir ${test[0]} ${uniteEnMajuscules} en ${test[2]} m²`, function () {
      expect(convertirEnMetresCarres(test[0], uniteEnMajuscules)).toBe(test[2]);
    });
  });
});

describe("Extraction des surfaces de terrain par la description", () => {
  class DescriptionTest {
    constructor(description, surfaceHabitable, sortieAttendue) {
      this.description = description;
      this.surfaceHabitable = surfaceHabitable;
      this.sortieAttendue = sortieAttendue;
    }
  }

  const tests = [
    new DescriptionTest("Terrain de 200 m2", 100, 200),
    new DescriptionTest("Terrain de 200 m²", 100, 200),
    new DescriptionTest("Terrain de 1 are", 100, 100),
    new DescriptionTest("Terrain de 1.6 are", 100, 160),
    new DescriptionTest("Terrain de 2 ares", 100, 200),
    new DescriptionTest("Terrain de 2.8 ares", 100, 280),
    new DescriptionTest("Terrain de 2.3 ha", 100, 23000),
    new DescriptionTest("Terrain de 2.3 hectares", 100, 23000),
    new DescriptionTest("Terrain de 1 ha", 100, 10000),

    /*
    L'objectif est d'extraire correctement les surfaces de terrain des descriptions des biens immobiliers.
    J'ai analysé pas mal de descriptions et voici les variations que j'ai trouvées qu'il va falloir prendre en compte :

    - Parfois l'unité est écrite en majuscules (M2 ou M² au lieu de m², ça peut être sûrement vrai pour 1 HA au lieu de 1 ha)
    - Parfois les unités sont des are, ares, ha, has, hectare ou hectares
    - Parfois il y a un espace entre la valeur et l'unité, parfois pas : 150m² ou 150 m²
    - Les surfaces ont parfois une valeur décimale délimitée par un point ou une virgule avec max 2 chiffres derrières la virgule : 135,12 m2 ou 135.12 m2 etc.
    - Parfois les valeurs de milliers sont séparées d'un espace : 2 345 m²/ 12 800 m² au lieu de 2345 m² / 12800 m²
    - Biensûr on peut avoir tous les cas particuliers d'un coup : 12 847,15 M2
    - Un cas vicieux, un chiffre qui précède mais ne fait pas partie de la surface : "une maison P4 130 m2." (P4 = 4 pièces)
    - Autre cas vicieux avec un trait d'union juste avant : "Construction de 2015- 110m2 de plain-pied."
    - J'extrapole le cas précédent à la possibilité de voir par exemple "-150m²" dans une liste comme ça :
    2 parcelles de terrain :
    -2500 m2
    -3 800 m²
    - Autre cas vicieux, dans une énumération :
    Maison 1 80m2 :
    Maison 2 75m2 :
    - Le caractère de fin de la surface, après l'unité, peut être un point, une virgule, un retour à la ligne, un ou plusieurs espaces
    - Enfin il faut faire attention à ne pas confondre une unité avec un mot ! Par exemple "il y a 2 habitations", il ne faut pas extraire "2 ha" de habitations et le confondre avec 2 ha (hectares !)

    
    Vérifier aussi quand il apparaît le mot terrain dans la description mais qu'on extrait aucune superficie supérieure à celle de la surface habitable, un problème de parsing sûrement ? Si on détecte ça, il faut l'indiquer avec une icône
    */
  ];

  tests.forEach((test) => {
    it(`extrait ${test.sortieAttendue} m² de "${test.description}"`, function () {
      expect(
        extraireSurfacesTerrain(test.description, test.surfaceHabitable)
      ).toMatchObject([
        {
          tailleEnM2: test.sortieAttendue,
          label: `${test.sortieAttendue} m²`,
        },
      ]);
    });
  });
});
