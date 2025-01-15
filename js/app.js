// app.js
import { GAME_CONFIG } from './config.js';
import { gameState } from './game-state.js';
import { boostManager } from './boost-manager.js';
import { tapManager } from './tap-manager.js';
import { uiManager } from './ui-manager.js'; // On importe l'instance au lieu de la classe

// Initialisation unique des éléments communs
// app.js - Mise à jour de initializeCommonElements
const initializeCommonElements = () => {
    const gemCountSpan = document.getElementById('gemCount');
    const dailyTapCountSpan = document.getElementById('dailyTapCount');
    const tapCountSpan = document.getElementById('tapCount');
    const sessionTapCountSpan = document.getElementById('sessionTapCount');
    
    if (gemCountSpan) {
        gameState.addGemCountElement(gemCountSpan);
    }
    
    if (dailyTapCountSpan) {
        gameState.addDailyTapCountElement(dailyTapCountSpan);
    }

    if (tapCountSpan) {
        gameState.addTapCountElement(tapCountSpan);
    }

    if (sessionTapCountSpan) {
        gameState.addSessionTapCountElement(sessionTapCountSpan);
    }
};

document.addEventListener('DOMContentLoaded', () => {
  initializeCommonElements();
  
  // Forcer une mise à jour des boosts au chargement de n'importe quelle page
  boostManager.updateBoostDisplay();
  boostManager.loadBoosts(); // Charger les boosts actifs
    boostManager.checkBoostTimers();
  
    Object.entries(boostManager.activeBoosts).forEach(([boostType, isActive]) => {
        if (isActive && boostType === 'potion') {
            boostManager.startPotionEffect();
        }
    });
  // Détermine la page actuelle
  const currentPage = window.location.pathname.split('/').pop().split('.')[0];
  
  // Initialise les fonctionnalités spécifiques à chaque page
  switch(currentPage) {
    case 'tap':
      tapManager.initialize();
      break;
    case 'boosts':
      boostManager.initializeBoostUI();
      break;
  }
  
  // Vérifie les timers des boosts toutes les secondes
  setInterval(() => {
    boostManager.checkBoostTimers();
    boostManager.loadBoosts();
    boostManager.updateBoostDisplay(); // Mise à jour régulière pour les changements dynamiques
    gameState.updateUI();
}, 1000);
});