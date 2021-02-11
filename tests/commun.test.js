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
  it('blah', function () {
    expect(extraireSurfacesTerrain('Terrain de 200 m2', 150)).toMatchObject([{
      tailleEnM2: 200,
      label: '200 m²',
    }]);
  });
});