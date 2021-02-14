const { it, expect } = require("@jest/globals");
const {
  extraireSurfacesTerrain,
  convertirEnMetresCarres,
} = require("../extension/js/commun");

// Génération des valeurs de surface possibles pour tous les tests
const tailles = ["7", "42", "256", "1337", "16384", "131072"];
const decimales = ["", ".0", ".4", ".42", ",0", ",4", ",42"];

const valeurs = [];
tailles.forEach((taille) => {
  decimales.forEach((decimale) => {
    valeurs.push(taille + decimale);
  });
});

// Nom des unités possibles pour tous les tests
const unites = [
  "m²",
  "M²",
  "m2",
  "M2",
  "are",
  "Are",
  "ARE",
  "ares",
  "Ares",
  "ARES",
  "ha",
  "Ha",
  "HA",
  "has",
  "Has",
  "HAS",
  "hectare",
  "Hectare",
  "HECTARE",
  "hectares",
  "Hectares",
  "HECTARES",
];

describe("Conversion de surfaces", () => {
  class ConversionTest {
    constructor(taille, unite, sortie) {
      this.taille = taille;
      this.unite = unite;
      this.sortie = sortie;
    }
  }

  const tests = [];
  valeurs.forEach((valeur) => {
    unites.forEach((unite) => {
      // On remplace la virgule décimale française par le point '.'
      let sortie = Number.parseFloat(valeur.replace(/,/, "."));
      switch (unite.toLowerCase()) {
        case "are":
        case "ares":
          sortie *= 100;
          break;
        case "ha":
        case "has":
        case "hectare":
        case "hectares":
          sortie *= 10000;
          break;
        default:
          break;
      }

      // On supprime la partie décimale éventuellement restante
      sortie = Math.trunc(sortie);
      tests.push(new ConversionTest(valeur, unite, sortie));
    });
  });

  tests.forEach((test) => {
    it(`convertir ${test.taille} ${test.unite} en ${test.sortie} m²`, function () {
      expect(convertirEnMetresCarres(test.taille, test.unite)).toEqual(
        test.sortie
      );
    });
    // On teste aussi avec la 1ère lettre de l'unité en majuscule
    const uniteLettre1EnMajuscule =
      test.unite[0].toUpperCase() + test.unite.slice(1);
    it(`convertir ${test.taille} ${uniteLettre1EnMajuscule} en ${test.sortie} m²`, function () {
      expect(
        convertirEnMetresCarres(test.taille, uniteLettre1EnMajuscule)
      ).toEqual(test.sortie);
    });
    // On teste avec l'unité en majuscules
    const uniteEnMajuscules = test.unite.toUpperCase();
    it(`convertir ${test.taille} ${uniteEnMajuscules} en ${test.sortie} m²`, function () {
      expect(convertirEnMetresCarres(test.taille, uniteEnMajuscules)).toEqual(
        test.sortie
      );
    });
  });
});

/*

L'objectif est d'extraire au mieux les surfaces des terrains des descriptions.

POLITIQUE D'ERREUR : on préfèrera toujours GARDER une annonce dont on n'est pas totalement sûr qu'il y a un terrain plutôt que de retirer celle-ci des résultats de recherche.
L'objectif est de ne pas manquer de potentiels biens avec le terrain voulu, ce n'est pas grave si on propose un bien qui ne possède pas de terrain.

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
- Vérifier aussi quand il apparaît le mot terrain dans la description mais qu'on extrait aucune superficie supérieure à celle de la surface habitable, un problème de parsing sûrement ? Si on détecte ça, il faut l'indiquer avec une icône

*/

describe("Extraction des surfaces de terrain par la description", () => {
  class DescriptionTest {
    constructor(description, surfaceHabitable, sortieAttendue) {
      this.description = description;
      this.surfaceHabitable = surfaceHabitable;
      this.sortieAttendue = sortieAttendue;
    }
  }

  // const avant = ["", "P4 ", "2015- ", "de ", " "];
  // const espaces = ["", " "];
  // const apres = ["", ".", ",", " ", " arboré"];

  const avant = [""];
  const valeurs = ["7", "42", "256", "1337", "16384", "131072"];
  const decimales = [""];
  const espaces = ["", " "];
  const unites = ["m²", "m2"];
  const apres = [""];

  const tests = [];

  avant.forEach((av) => {
    valeurs.forEach((valeur) => {
      decimales.forEach((decimale) => {
        espaces.forEach((espace) => {
          unites.forEach((unite) => {
            apres.forEach((ap) => {
              tests.push(
                new DescriptionTest(
                  av + valeur + decimale + espace + unite + ap,
                  valeur - 1,
                  convertirEnMetresCarres(valeur + decimale, unite)
                )
              );
            });
          });
        });
      });
    });
  });

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
