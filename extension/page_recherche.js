const COULEURS_ENERGIE = {
  'A': '#379932',
  'B': '#3acc31',
  'C': '#cdfd33',
  'D': '#fbea49',
  'E': '#fccc2f',
  'F': '#fb9c34',
  'G': '#fa1c1f',
};

const COULEURS_GES = {
  'A': '#f6edfe',
  'B': '#e4c7fb',
  'C': '#d2adf1',
  'D': '#c99aef',
  'E': '#b77ae9',
  'F': '#a659e9',
  'G': '#8835d9',
};

const NOM_LABELS = {
  'rooms': "Pièces",
  'square': "Surface",
};

const s = document.getElementById('__NEXT_DATA__');
const donnees = JSON.parse(s.textContent).props.pageProps.listingData.ads;
const listing = {};
for (donnee of donnees) {
  listing[donnee.list_id] = donnee;
}

const terrainRegExp = /((\d{4,} ?(m²|m2))|\d+ ?(ha|are))/gi;

const listeResultats = document.querySelectorAll('[data-qa-id="aditem_container"]');
for (const resultat of listeResultats) {
  const id = extraireID(resultat.href);
  const lastDiv = resultat.querySelector('div > div > div > div + div + div');

  const fieldSet = document.createElement('fieldset');
  fieldSet.classList.add('lmc-fieldset');

  const legende = document.createElement('legend');
  legende.classList.add('lmc-legende');
  legende.textContent = 'Le Meilleur Coin';
  
  fieldSet.append(legende);
  
  // Création de nouvelles informations
  ajouterChamp('terrain', id, fieldSet);
  ajouterChamp('energy_rate', id, fieldSet);
  ajouterChamp('ges', id, fieldSet);
  ajouterChamp('rooms', id, fieldSet);
  ajouterChamp('square', id, fieldSet);
  lastDiv.after(fieldSet);
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