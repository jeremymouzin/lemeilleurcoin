const s = document.getElementById(DATA_ID);
const donnees = JSON.parse(s.textContent).props.pageProps.listingData.ads;
const listing = {};
for (donnee of donnees) {
  listing[donnee.list_id] = donnee;
}

const terrainRegExp = /((\d+ ?\d{3,} ?(m²|m2))|\d+ ?(ha[ .,!]|are[ .,!]|hectare[ .,!]))/gi;

const listeResultats = document.querySelectorAll('[data-qa-id="aditem_container"]');
for (const resultat of listeResultats) {
  const id = extraireID(resultat.href);
  const lastDiv = resultat.querySelector('div > div > div > div + div + div');

  const fieldSet = creerFieldSetLMC();

  // Création de nouvelles informations
  const tailleTerrain = ajouterChamp('terrain', id, fieldSet);
  resultat.dataset.surfaceTerrain = tailleTerrain;
  ajouterChamp('energy_rate', id, fieldSet);
  ajouterChamp('ges', id, fieldSet);
  ajouterChamp('rooms', id, fieldSet);
  ajouterChamp('square', id, fieldSet);
  lastDiv.after(fieldSet);
}

function creerFieldSetLMC() {
  const fieldSet = document.createElement('fieldset');
  fieldSet.classList.add('lmc-fieldset');

  const legende = document.createElement('legend');
  legende.classList.add('lmc-legende');
  legende.textContent = 'Le Meilleur Coin';

  fieldSet.append(legende);
  return fieldSet;
}

function ajouterChamp(nomChamp, id, noeud) {
  const donnees = extraireObjet(nomChamp, listing[id]);
  let label = donnees.value_label;
  const lettre = donnees.value_label[0];

  const nouvelleDiv = document.createElement('div');

  if (["ges", "energy_rate"].includes(nomChamp)) {
    nouvelleDiv.classList.add('lmc-label-energie');
    // Cas particuliers N => Non renseigné, V => Vierge
    if (!['N', 'V'].includes(lettre)) {
      // On affiche que la lettre
      label = lettre;
    }
  }

  nouvelleDiv.textContent = `${donnees.key_label} : ${label}`;

  if (nomChamp === "energy_rate") {
    nouvelleDiv.style.backgroundColor = COULEURS_ENERGIE[lettre];
    if ('C' <= lettre && lettre <= 'E' || ['N', 'V'].includes(lettre)) {
      nouvelleDiv.style.color = '#1A1A1A';
    } else {
      nouvelleDiv.style.color = 'white';
    }
  }

  if (nomChamp === "ges") {
    nouvelleDiv.style.backgroundColor = COULEURS_ENERGIE[lettre];
    if ('C' <= lettre && lettre <= 'E' || ['N', 'V'].includes(lettre)) {
      nouvelleDiv.style.color = '#1A1A1A';
    } else {
      nouvelleDiv.style.color = 'white';
    }
  }

  noeud.append(nouvelleDiv);

  if (nomChamp === "terrain") {
    return label;
  }
}

function extraireID(url) {
  const id = url.split('.htm')[0].split('/ventes_immobilieres/')[1];
  return id;
}

function extraireObjet(nomChamp, objListing) {
  if (nomChamp === "terrain") {
    // On doit extraire le terrain de la description
    const description = objListing.body;
    let correspondance;
    let taillesTerrain = [];
    while ((correspondance = terrainRegExp.exec(description)) !== null) {
      taillesTerrain.push(Number.parseInt(correspondance[0].replaceAll(' ', '')));
    }
    if (taillesTerrain.length === 0) {
      taillesTerrain = "< 1000 m²";
    } else {
      taillesTerrain = taillesTerrain.map(t => t + " m²").join(', ');
    }

    return {
      key_label: "☘️ Terrain",
      value_label: taillesTerrain,
    };
  } else {
    for (const attr of objListing.attributes) {
      if (attr.key === nomChamp) {
        return attr;
      }
    }
    return {
      key_label: NOM_LABELS[nomChamp],
      value_label: "inconnu",
    };
  }
}

/* Filtrage par taille de terrain */

function creerInputNumber(id, label, valeur) {
  const input = document.createElement('input');
  input.type = "number";
  input.value = valeur;
  input.id = id;

  const elLabel = document.createElement('label');
  elLabel.textContent = label;
  elLabel.for = id;
  elLabel.appendChild(input);

  return elLabel;
}

function ajoutSelectionTerrain() {
  const barreOutils = document.querySelector('body noscript + div + div > div:last-child > div > div > div:nth-child(3)');

  const fieldSet = creerFieldSetLMC();
  fieldSet.classList.add('lmc-filtre-terrain');

  const inputMin = creerInputNumber('terrainMin', 'Terrain min :', 1000);
  const inputMax = creerInputNumber('terrainMax', 'Terrain max :', 4000);
  fieldSet.append(inputMin);
  fieldSet.append(inputMax);

  const boutonValider = document.createElement('button');
  boutonValider.textContent = "Filtrer";

  boutonValider.addEventListener('click', function (e) {
    const surfaceMin = +inputMin.querySelector('input').value;
    const surfaceMax = +inputMax.querySelector('input').value;

    for (const resultat of listeResultats) {
      let cacher = false;
      let surface = resultat.dataset.surfaceTerrain;

      if (surface.startsWith('<')) {
        cacher = true;
      } else {
        surface = Number.parseInt(surface);
        if (surface < surfaceMin || surface > surfaceMax) {
          cacher = true;
        }
      }
      resultat.style.display = cacher ? 'none' : 'block';
    }
  });

  fieldSet.append(boutonValider);

  barreOutils.after(fieldSet);

}

ajoutSelectionTerrain();