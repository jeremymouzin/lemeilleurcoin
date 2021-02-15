const { it, expect } = require("@jest/globals");
const {
  extraireSurfacesTerrain,
  convertirEnMetresCarres,
} = require("../extension/js/commun");

/* Génération des valeurs de surface possibles pour tous les tests */
// Parfois les valeurs des milliers sont séparées d'un espace : 2 345 m², 12 800 m² etc.
const tailles = ["7", "42", "256", "1337", "1 337", "16384", "16 384", "131072", "131 072"];
// Les surfaces ont parfois une valeur décimale délimitée par un point ou une virgule avec max 2 chiffres derrière la virgule : 135,2 m2 ou 135.12 m2 etc.
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
  "m2",
  "are",
  "ares",
  "ha",
  "has",
  "hectare",
  "hectares",
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
      // On remplace les éventuels espaces des milliers ("1 337" => "1337")
      let sortie = valeur.replace(/ /, '');
      // On remplace la virgule décimale française par le point '.'
      sortie = sortie.replace(/,/, ".");
      // On transforme en un nombre
      sortie = Number.parseFloat(sortie);

      switch (unite.toLowerCase()) {
        case "are":
        case "ares":
          sortie *= 100;
          // On supprime la partie décimale éventuellement restante
          sortie = Math.round(sortie);
          break;
        case "ha":
        case "has":
        case "hectare":
        case "hectares":
          sortie *= 10000;
          // On supprime la partie décimale éventuellement restante
          sortie = Math.round(sortie);
          break;
        default:
          break;
      }

      tests.push(new ConversionTest(valeur, unite, sortie));
    });
  });

  tests.forEach((test) => {
    it(`convertir ${test.taille} ${test.unite} en ${test.sortie} m²`, function () {
      expect(convertirEnMetresCarres(test.taille, test.unite)).toEqual(
        test.sortie
      );
    });
    // Parfois la 1ère lettre de l'unité est écrite en majuscule (M2 ou M², Ha, Hectares etc.)
    const uniteLettre1EnMajuscule =
      test.unite[0].toUpperCase() + test.unite.slice(1);
    it(`convertir ${test.taille} ${uniteLettre1EnMajuscule} en ${test.sortie} m²`, function () {
      expect(
        convertirEnMetresCarres(test.taille, uniteLettre1EnMajuscule)
      ).toEqual(test.sortie);
    });
    // Parfois l'unité est écrite en majuscules (M2 ou M², HA, HECTARES etc.)
    const uniteEnMajuscules = test.unite.toUpperCase();
    it(`convertir ${test.taille} ${uniteEnMajuscules} en ${test.sortie} m²`, function () {
      expect(convertirEnMetresCarres(test.taille, uniteEnMajuscules)).toEqual(
        test.sortie
      );
    });
  });
});

// TODO
// - Enfin il faut faire attention à ne pas confondre une unité avec un mot ! Par exemple "il y a 2 habitations", il ne faut pas extraire "2 ha" de habitations et le confondre avec 2 ha (hectares !)
// Vérifier aussi quand il apparaît le mot terrain dans la description mais qu'on extrait aucune superficie supérieure à celle de la surface habitable, un problème de parsing sûrement ? Si on détecte ça, il faut l'indiquer avec une icône

/*

L'objectif est d'extraire au mieux les surfaces des terrains des descriptions.

POLITIQUE D'ERREUR : on préfèrera toujours GARDER une annonce dont on n'est pas totalement sûr qu'il y a un terrain plutôt que de retirer celle-ci des résultats de recherche.
L'objectif est de ne pas manquer de potentiels biens avec le terrain voulu, ce n'est pas grave si on propose un bien qui ne possède pas le terrain souhaité.

J'ai analysé pas mal de descriptions et voici les variations que j'ai trouvées qu'il va falloir prendre en compte :

- Un cas vicieux, un chiffre qui précède mais ne fait pas partie de la surface : "une maison P4 130 m2." (P4 = 4 pièces) => on le considérera comme 4130 m2 vu notre politique d'erreur
- Autre cas vicieux, dans une énumération :
Maison 1 80m2 : => On détectera 80m2
Maison 2 75m2 : => On détectera 75m2

*/

describe("Extraction des surfaces de terrain par la description", () => {
  class DescriptionTest {
    constructor(description, surfaceHabitable, sortie) {
      this.description = description;
      this.surfaceHabitable = surfaceHabitable;
      this.sortie = sortie;
    }
  }

  // Description possible : "Construction de 2015- 110m2 de plain-pied."
  // Autre cas ambigu par exemple "-150m²" dans une liste comme ça :
  // 2 parcelles de terrain :
  // -2500 m2
  // -3 800 m²
  const avant = ["", "2015- ", "-", " "];
  // Parfois il y a un espace entre la valeur et l'unité, parfois pas : 150m² ou 150 m²
  const espaces = ["", " "];
  // Après l'unité il peut y avoir un point, une virgule, un retour à la ligne, un espace
  const apres = ["", ".", ",", " "];

  const tests = [];

  avant.forEach((av) => {
    valeurs.forEach((valeur) => {
      espaces.forEach((espace) => {
        unites.forEach((unite) => {
          apres.forEach((ap) => {
            tests.push(
              new DescriptionTest(
                av + valeur + espace + unite + ap,
                Number.parseFloat(valeur.replace(/,/, ".")) - 1,
                convertirEnMetresCarres(valeur, unite)
              )
            );

            // Cas particulier "2500 habitants" où l'on pourrait à tord comprendre "2500 ha" (2500 hectares)
            if (unite === "ha") {
              tests.push(
                new DescriptionTest(
                  av + valeur + espace + unite + "bitants",
                  Number.parseFloat(valeur.replace(/,/, ".")) - 1,
                  0 // Il faut évidemment renvoyer 0 m², on ne prend pas en compte cette valeur
                )
              );
            }
          });
        });
      });
    });
  });

  tests.forEach((test) => {
    it(`extrait ${test.sortie} m² de "${test.description}"`, function () {
      expect(
        extraireSurfacesTerrain(test.description, test.surfaceHabitable)
      ).toMatchObject([
        {
          tailleEnM2: test.sortie,
          label: `${test.sortie} m²`,
        },
      ]);
    });
  });
});
