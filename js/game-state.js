// game-state.js
import { GAME_CONFIG } from './config.js';
import { boostManager } from './boost-manager.js';

class GameState {
    constructor() {
        // Compteurs de base
        this.tapsLeft = GAME_CONFIG.initialTaps;
        this.sessionTapCount = 0;
        this.dailyTapCount = GAME_CONFIG.dailyTapLimit;
        this.dailyTapLimit = GAME_CONFIG.dailyTapLimit;
        this.totalGems = 0;
        this.lastRegenTime = Date.now();

        // Références aux éléments UI
        this.uiElements = {
            gemCount: null,
            dailyTapCount: null,
            tapCount: null,
            sessionTapCount: null
        };
        
        // Chargement initial de l'état
        this.loadState();
    }

    // Méthodes de gestion des éléments UI
    addGemCountElement(element) {
        this.uiElements.gemCount = element;
        this.updateUI();
    }

    addDailyTapCountElement(element) {
        this.uiElements.dailyTapCount = element;
        this.updateUI();
    }

    addTapCountElement(element) {
        this.uiElements.tapCount = element;
        this.updateUI();
    }

    addSessionTapCountElement(element) {
        this.uiElements.sessionTapCount = element;
        this.updateUI();
    }

    updateUI() {
        const { gemCount, tapCount, sessionTapCount, dailyTapCount } = this.uiElements;
        
        if (gemCount) {
            gemCount.textContent = this.totalGems.toFixed(3);
        }
        if (tapCount) {
            // Afficher simplement le nombre de taps restants sans multiplicateur
            tapCount.textContent = this.tapsLeft.toString();
        }
        if (sessionTapCount) {
            sessionTapCount.textContent = this.sessionTapCount.toString();
        }
        if (dailyTapCount) {
            dailyTapCount.textContent = `${this.dailyTapCount}/${this.dailyTapLimit}`;
        }
    }

    // Méthodes de gestion de l'état
    loadState() {
        try {
            const savedData = JSON.parse(localStorage.getItem('tapGameData')) || {};
            const dailyData = this.loadDailyTapCount();

            this.tapsLeft = savedData.tapsLeft || GAME_CONFIG.initialTaps;
            this.sessionTapCount = savedData.sessionTapCount || 0;
            this.dailyTapCount = dailyData;
            this.lastRegenTime = savedData.lastRegenTime || Date.now();
            this.totalGems = savedData.totalGems || 0;
            
            this.updateUI();
        } catch (error) {
            console.error('Error loading game state:', error);
            this.resetGame();
        }
    }

    saveState() {
        try {
            const state = {
                tapsLeft: this.tapsLeft,
                sessionTapCount: this.sessionTapCount,
                lastRegenTime: this.lastRegenTime,
                totalGems: this.totalGems,
                lastSaveTime: Date.now()
            };
    
            localStorage.setItem('tapGameData', JSON.stringify(state));
            
            // Backup de sauvegarde
            localStorage.setItem('tapGameData_backup', JSON.stringify(state));
            
            this.updateUI();
        } catch (error) {
            console.error('Error saving game state:', error);
            // Restaurer depuis la backup si la sauvegarde échoue
            const backup = localStorage.getItem('tapGameData_backup');
            if (backup) {
                localStorage.setItem('tapGameData', backup);
            }
        }
    }

    // Gestion des taps quotidiens
    loadDailyTapCount() {
        try {
            const savedData = JSON.parse(localStorage.getItem('dailyTapData'));
            const today = new Date().toISOString().split('T')[0];

            if (savedData?.date === today) {
                this.dailyTapLimit = savedData.dailyTapLimit || GAME_CONFIG.dailyTapLimit;
                return Math.min(savedData.remainingTaps, this.dailyTapLimit);
            }
            
            this.resetDailyTaps();
            return this.dailyTapLimit;
        } catch (error) {
            console.error('Error loading daily tap count:', error);
            this.resetDailyTaps();
            return this.dailyTapLimit;
        }
    }

    saveDailyTapCount(remainingTaps) {
        const today = new Date().toISOString().split('T')[0];
        localStorage.setItem('dailyTapData', JSON.stringify({ 
            date: today, 
            remainingTaps,
            dailyTapLimit: this.dailyTapLimit
        }));
    }

    setDailyTapLimit(newLimit) {
        this.dailyTapLimit = newLimit;
        this.dailyTapCount = Math.min(this.dailyTapCount, newLimit);
        this.saveDailyTapCount(this.dailyTapCount);
        this.updateUI();
    }

    resetDailyTaps() {
        this.dailyTapLimit = GAME_CONFIG.dailyTapLimit;
        this.dailyTapCount = this.dailyTapLimit;
        this.saveDailyTapCount(this.dailyTapCount);
    }

    // Gestion de la régénération des taps
    regenerateTaps() {
        const currentTime = Date.now();
        const timeElapsed = currentTime - this.lastRegenTime;
        const tapsToRegen = Math.floor(timeElapsed / GAME_CONFIG.tapRegenInterval);

        if (tapsToRegen > 0) {
            this.dailyTapCount = Math.min(this.dailyTapLimit, this.dailyTapCount + tapsToRegen);
            this.lastRegenTime += tapsToRegen * GAME_CONFIG.tapRegenInterval;
            this.saveDailyTapCount(this.dailyTapCount);
            this.saveState();
        }
    }

    // Gestion des gems
    addGems(amount) {
        this.totalGems += amount;
        this.saveState();
    }

    spendGems(amount) {
        if (this.totalGems >= amount) {
            this.totalGems -= amount;
            this.saveState();
            return true;
        }
        return false;
    }

    // Réinitialisation du jeu
    resetGame() {
        this.tapsLeft = GAME_CONFIG.initialTaps;
        this.sessionTapCount = 0;
        this.dailyTapLimit = GAME_CONFIG.dailyTapLimit;
        this.dailyTapCount = this.dailyTapLimit;
        this.totalGems = 0;
        this.lastRegenTime = Date.now();
        
        // Nettoyage du localStorage
        localStorage.removeItem('tapGameData');
        localStorage.removeItem('dailyTapData');
        localStorage.removeItem('activeBoosts');
        localStorage.removeItem('boostTimers');
        
        this.saveState();
        this.saveDailyTapCount(this.dailyTapCount);
    }
}

export const gameState = new GameState();