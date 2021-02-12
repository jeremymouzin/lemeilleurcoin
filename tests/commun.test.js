const { it, expect } = require('@jest/globals');
const { extraireSurfacesTerrain, convertirEnMetresCarres } = require('../extension/js/commun');

describe('Conversion de surfaces', () => {
  it('convertir 1 are en 100 m²', function () {
    expect(convertirEnMetresCarres(1, 'are')).toBe(100);
  });
  it('convertir 2 ares en 200 m²', function () {
    expect(convertirEnMetresCarres(2, 'ares')).toBe(200);
  });
  it('convertir 42 m2 en 42 m²', function () {
    expect(convertirEnMetresCarres(42, 'm2')).toBe(42);
  });
  it('convertir 1250 m² en 1250 m²', function () {
    expect(convertirEnMetresCarres(1250, 'm²')).toBe(1250);
  });
  it('convertir 1 ha en 10000 m²', function () {
    expect(convertirEnMetresCarres(1, 'ha')).toBe(10000);
  });
  it('convertir 2 has en 20000 m²', function () {
    expect(convertirEnMetresCarres(2, 'has')).toBe(20000);
  });
  it('convertir 1 hectare en 10000 m²', function () {
    expect(convertirEnMetresCarres(1, 'hectare')).toBe(10000);
  });
  it('convertir 2 hectares en 20000 m²', function () {
    expect(convertirEnMetresCarres(2, 'hectares')).toBe(20000);
  });
  it('convertir 1.4 hectare en 14000 m²', function () {
    expect(convertirEnMetresCarres(1.4, 'hectare')).toBe(14000);
  });
  it('convertir 2.5 hectares en 25000 m²', function () {
    expect(convertirEnMetresCarres(2.5, 'hectares')).toBe(25000);
  });
});

describe('Extraction des surfaces de terrain par la description', () => {
  class DescriptionTest {
    constructor(description, surfaceHabitable, sortieAttendue) {
      this.description = description;
      this.surfaceHabitable = surfaceHabitable;
      this.sortieAttendue = sortieAttendue;
    }
  }

  const tests = [
    new DescriptionTest('Terrain de 200 m2', 100, 200),
    new DescriptionTest('Terrain de 200 m²', 100, 200),
    new DescriptionTest('Terrain de 1 are', 100, 100),
    new DescriptionTest('Terrain de 1.6 are', 100, 160),
    new DescriptionTest('Terrain de 2 ares', 100, 200),
    new DescriptionTest('Terrain de 2.8 ares', 100, 280),
    new DescriptionTest('Terrain de 2.3 ha', 100, 23000),
    new DescriptionTest('Terrain de 2.3 hectares', 100, 23000),
    new DescriptionTest('Terrain de 1 ha', 100, 10000),
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

  tests.forEach(test => {
    it(`extrait ${test.sortieAttendue} m² de "${test.description}"`, function () {
      expect(extraireSurfacesTerrain(test.description, test.surfaceHabitable)).toMatchObject([{
        tailleEnM2: test.sortieAttendue,
        label: `${test.sortieAttendue} m²`,
      }]);
    });
  });
});