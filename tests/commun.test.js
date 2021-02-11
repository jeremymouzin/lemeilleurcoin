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
    surfaceHabitable = 100;
    constructor(description, surfaceHabitable, sortieAttendue) {
      this.description = description;
      this.surfaceHabitable = surfaceHabitable;
      this.sortieAttendue = sortieAttendue;
    }
  }

  const tests = [
    new DescriptionTest('Terrain de 200 m2', 100, 200),
    new DescriptionTest('Terrain de 200 m²', 100, 200),
    new DescriptionTest('Terrain de 2 ares', 100, 200),
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