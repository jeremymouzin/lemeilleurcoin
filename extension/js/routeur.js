
const conteneurPrincipal = document.querySelector('#container');
let pageCourante = conteneurPrincipal.dataset[ATTRIBUT_PAGE];
chargerScriptPourPage(pageCourante);

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

const observateurChangementDePage = new MutationObserver(function (objets, observateur) {
    
    // Nettoyage de la page qu'on quitte
    const anciennePage = objets[0].oldValue;
    const nouvellePage = objets[0].target.dataset[ATTRIBUT_PAGE];
    console.log("changement de page détecté", anciennePage, ' =>', nouvellePage);

    // On nettoie l'ancienne page
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

    // On charge le script de la nouvelle page
    chargerScriptPourPage(nouvellePage);
});
observateurChangementDePage.observe(conteneurPrincipal, { attributes: true, attributeOldValue: true, attributeFilter: ['data-pagename'] });