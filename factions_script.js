// 1) Sélection des éléments
const factionWrappers = document.querySelectorAll('.factions-wrapper');
const factionDescription = document.getElementById('faction-description');
const nextPageButton = document.getElementById('nextPageButton');

// 2) Variable pour stocker la faction sélectionnée (ou null si aucune)
let currentlySelected = null;

// 3) Textes pour l'affichage
const defaultText = "The two moons of Selenor, Azura and Crimara, have split the world into two factions, historical rivals with distinct ideals. Now is the time to choose your path and join the fight with your new fam!";
const textAzurians = "Guided by the serene light of Azura, the Azurians excel in wisdom and strategy. Masters of foresight and diplomacy, they preserve harmony with clever plans and calculated moves.";
const textCrimsons = "Born under the fiery glow of Crimara, the Crimsons thrive on courage and strength. Bold and unyielding, they charge into battle, driven to conquer and protect through sheer force.";

document.addEventListener('DOMContentLoaded', () => {
  const faction = localStorage.getItem('faction');
  if (faction) {
    window.location.href = 'tap.html';
  }
});


// 4) Fonction pour mettre à jour la description
function updateDescription(faction) {
  if (faction === null) {
    // Si aucune faction n’est sélectionnée, on met le texte par défaut
    factionDescription.textContent = defaultText;
  } else if (faction === 'azurians') {
    factionDescription.textContent = textAzurians;
  } else {
    // faction === 'crimsons'
    factionDescription.textContent = textCrimsons;
  }
}

// 5) Fonction pour (dés)activer le bouton
function updateButtonState() {
  if (currentlySelected === null) {
    // Pas de faction sélectionnée => bouton désactivé
    nextPageButton.disabled = true;
  } else {
    // Une faction est sélectionnée => bouton activé
    nextPageButton.disabled = false;
  }
}


nextPageButton.addEventListener('click', () => {
  // Vérifier qu'une faction est sélectionnée
  if (localStorage.getItem('faction')) {
    window.location.href = 'tap.html';
  }
});


// 6) Gestion des clics sur les factions
factionWrappers.forEach((wrapper) => {
  wrapper.addEventListener('click', () => {

    // Si on clique sur la faction déjà sélectionnée => on la désélectionne
    if (currentlySelected === wrapper) {
      wrapper.classList.remove('selected');
      const img = wrapper.querySelector('img');
      img.src = wrapper.dataset.imgDefault;

      currentlySelected = null;
      updateDescription(null);

      // On enlève la faction du Local Storage (ou on peut la laisser, à vous de voir)
      localStorage.removeItem('faction');

      updateButtonState();  
      return;
    }

    // Sinon, si une faction est déjà sélectionnée, on la désélectionne
    if (currentlySelected !== null) {
      currentlySelected.classList.remove('selected');
      const oldImg = currentlySelected.querySelector('img');
      oldImg.src = currentlySelected.dataset.imgDefault;
    }

    // Sélection de la nouvelle faction
    wrapper.classList.add('selected');
    const newImg = wrapper.querySelector('img');
    newImg.src = wrapper.dataset.imgSelected;
    currentlySelected = wrapper;

    // On détermine quelle faction est sélectionnée (azurians ou crimsons)
    let chosenFaction = null;
    if (wrapper.querySelector('.azurians')) {
      chosenFaction = 'azurians';
    } else {
      chosenFaction = 'crimsons';
    }

    // Mise à jour du texte
    updateDescription(chosenFaction);

    // On stocke la faction choisie dans le Local Storage
    localStorage.setItem('faction', chosenFaction);

    // On active le bouton
    updateButtonState();
  });
});

