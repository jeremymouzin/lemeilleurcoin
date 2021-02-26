
const conteneurPrincipal = document.querySelector(SELECTEUR_CSS_CONTENEUR_PRINCIPAL);

// Lors d'un changement de page un attribut est modifié sur le conteneur principal
const observateurChangementDePage = new MutationObserver(function (objets, observateur) {
    const anciennePage = objets[0].oldValue;
    const nouvellePage = objets[0].target.dataset[ATTRIBUT_PAGE];

    nettoyerScriptDePage(anciennePage);
    chargerScriptPourPage(nouvellePage);
});

if (conteneurPrincipal !== null) {
    observateurChangementDePage.observe(conteneurPrincipal, { attributes: true, attributeOldValue: true, attributeFilter: [ATTRIBUT_DATASET_PAGE] });

    // Détection de la page courante
    let pageCourante = conteneurPrincipal.dataset[ATTRIBUT_PAGE];
    chargerScriptPourPage(pageCourante);
}

// On exécute le script qui va bien en fonction de la page
function chargerScriptPourPage(pageCourante) {
    switch (pageCourante) {
        case NOM_PAGE_RECHERCHE:
            pageRecherche();
            break;
        case NOM_PAGE_FICHE_PRODUIT:
            ficheProduit();
            break;
        default:
            break;
    }
}

// On nettoie ce qu'il faut du script pour la prochaine exécution
function nettoyerScriptDePage(anciennePage) {
    switch (anciennePage) {
        case NOM_PAGE_RECHERCHE:
            pageRechercheFin();
            break;
        case NOM_PAGE_FICHE_PRODUIT:
            ficheProduitFin();
            break;
        default:
            break;
    }
}