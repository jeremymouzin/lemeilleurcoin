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
    Terrain de 2 arestation
    Terrain de 2 ares et 50 m2.
    Ce terrain fait 1 are
    Ce terrain fait 2 ares
    Problème 2.3 has ah ah !
    Et là 2,3 ha de terrain
    Et pour la virgule 2,7 ha
    Et pour la virgule 0,8 ha
    Et un combo 2 545,78ha
    Et tous les 2, 542 m2
    C'est une maison P4 130 m2.

    TODO: Identifier les variations possibles du formatage des surfaces à partir d'exemples et générer les tests correspondants pour couvrir le maximum de cas possibles.

    Quelques descriptions authentiques (avec des fautes de frappes et des formatages douteux) provenant du bon coin et à tester :

    Proximité immédiate du centre ville, sur 4500 M² de parc clos et arboré, vous découvrirez cette charmante propriété édifiée sur sous sol.

    Ce pavillon de 1970 est construit sur sous sol sur un terrain plat de 540 m2 entièrement clôturé.

    Sur son de terrain clos et arboré de 2300 m², il y fait bon vivre pour partager en famille les joies des beaux jours.

    Dpt Allier (03), à vendre DOMERAT maison 5 pièces sur terrain de 585 m2

    L'ensemble sur un terrain clos et arboré de 585 m2 .

    Sur un terrain de 383 m2 clos et fermé, elle est entièrement refaite et comprend :

    Une grande pièce lumineuse de 24 m2 avec baie double vitrage donnant sur un balcon de 3.84 m2 plein sud

    Maison individuelle d'une surface de 105 m² habitable sur terrain de 3 695 m2, à proximité des commerces, des écoles plus un accès bus à 2 min dans quartier calme.

    - et un terrain à bâtir de 1454 m²

    Le tout agrémenté d'un joli terrain arboré de près de 610 m².. .

    Construction de  2015- 110m2 de plain-pied.

    Beau terrain de plus de 600m2.

    Pour finir la maison possède un jardin de 448m2  et un grand garage .

    Le tout sur un terrain de 663m² et la possibilité d'aménager les combles.

    maison mitoyenne rénovée sont 1 maison (dite principale) de 85 m², avec accès entrée principale ou garage via le sas d'entrée

    -Un grand espace jardin aménagable d'une superficie de 430m² actuellement deux partie. 1ère partie aménagée en petit salon de jardin détente et barbecue.

    Maison 1 80m2 :
    Maison 2 75m2 :

    Grande Maison familiale Commentry 180 m²

    Maison de ville 111M2 à Montluçon sur parcelle de 325M2
    
    Vérifier aussi quand il apparaît le mot terrain dans la description mais qu'on extrait aucune superficie supérieure à celle de la surface habitable, un problème de parsing sûrement ?
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
