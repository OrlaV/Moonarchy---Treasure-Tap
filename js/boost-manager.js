import { GAME_CONFIG } from './config.js';
import { gameState } from './game-state.js';


class BoostManager {
    constructor() {
        this.activeBoosts = {
            potion: false,
            sword: false,
            bag: false,
            book: false
        };

        this.boostTimers = {
            potion: null,
            sword: null,
            bag: null,
            book: null
        };

        this.potionInterval = null;
        this.init();
    }

    init() {
        const savedBoosts = localStorage.getItem('activeBoosts');
        if (savedBoosts) {
            this.loadBoosts();
        } else {
            this.updateBoostDisplay();
        }
    }

    initializeBoostUI() {
        const boostButtons = document.querySelectorAll('.boost-button');
        boostButtons?.forEach(button => {
            const boostCard = button.closest('.boost-card');
            if (!boostCard) return;

            const boostType = boostCard.dataset.boost;
            button.addEventListener('click', () => this.handleBoostActivation(boostType));
        });

        this.updateBoostDisplay();
    }

    loadBoosts() {
        try {
            const savedBoosts = localStorage.getItem('activeBoosts');
            if (savedBoosts) {
                this.activeBoosts = JSON.parse(savedBoosts);
                this.loadSavedTimers();
            }
            this.updateBoostDisplay();
        } catch (error) {
            console.error('Error loading boosts:', error);
            this.resetBoosts();
        }
    }

    loadSavedTimers() {
        const savedTimers = JSON.parse(localStorage.getItem('boostTimers') || '{}');
        const currentTime = Date.now();

        Object.entries(savedTimers).forEach(([boostType, endTime]) => {
            if (endTime && endTime > currentTime) {
                const timeLeft = endTime - currentTime;
                this.startBoostTimer(boostType, timeLeft);

                if (boostType === 'potion' && !this.potionInterval) {
                    this.startPotionEffect();
                }
            } else {
                this.deactivateBoost(boostType);
            }
        });
    }

    handleBoostActivation(boostType) {
        if (!GAME_CONFIG.boostPrices[boostType] || this.activeBoosts[boostType]) return;

        if (gameState.spendGems(GAME_CONFIG.boostPrices[boostType])) {
            this.activateBoost(boostType, GAME_CONFIG.boostDurations[boostType]);
        }
    }

    activateBoost(boostType, duration) {
        if (this.activeBoosts[boostType]) return false;

        this.activeBoosts[boostType] = true;
        console.log(`Boost ${boostType} activated. Active boosts:`, this.activeBoosts);

        if (boostType === 'book') {
            gameState.setDailyTapLimit(GAME_CONFIG.dailyTapLimit * 2);
        }

        if (boostType === 'potion') {
            console.log("Activating potion effect...");
            this.startPotionEffect();
        }

        this.startBoostTimer(boostType, duration);
        this.saveBoosts();
        this.updateBoostDisplay();

        return true;
    }

    deactivateBoost(boostType) {
        console.log(`Deactivating boost: ${boostType}`);
        this.activeBoosts[boostType] = false;

        if (boostType === 'book') {
            gameState.setDailyTapLimit(GAME_CONFIG.dailyTapLimit);
        }

        if (boostType === 'potion') {
            this.stopPotionEffect();
        }

        if (this.boostTimers[boostType]) {
            clearTimeout(this.boostTimers[boostType]);
            this.boostTimers[boostType] = null;
        }

        this.removeBoostTimer(boostType);
        this.saveBoosts();
        this.updateBoostDisplay();
    }

    startBoostTimer(boostType, duration) {
        if (this.boostTimers[boostType]) {
            clearTimeout(this.boostTimers[boostType]);
        }

        const endTime = Date.now() + duration;
        this.saveBoostTimer(boostType, endTime);

        this.boostTimers[boostType] = setTimeout(() => {
            this.deactivateBoost(boostType);
        }, duration);
    }

    startPotionEffect() {
        console.log("Starting potion effect");
    
        if (this.potionInterval) {
            clearInterval(this.potionInterval);
            this.potionInterval = null;
        }
    
        this.potionInterval = setInterval(() => {
            console.log("Potion interval tick...");
    
            if (!this.activeBoosts.potion) {
                console.warn("Potion boost no longer active. Stopping interval.");
                this.stopPotionEffect();
                return;
            }
    
            if (gameState.tapsLeft <= 0 || gameState.dailyTapCount <= 0) {
                console.warn("No taps left or daily limit reached. Auto-tap skipped.");
                
                // Réinitialiser les taps si nécessaire
                if (gameState.tapsLeft === 0) {
                    console.log("Taps depleted. Resetting tap series...");
                    this.resetTapSeries(); // Nouvel appel
                }
                return;
            }
    
            const baseTap = 1;
            const { tapMultiplier, gemMultiplier } = this.getMultipliers();
            const effectiveTaps = Math.min(gameState.tapsLeft, baseTap * tapMultiplier);
    
            gameState.tapsLeft -= effectiveTaps;
            gameState.sessionTapCount += effectiveTaps;
            gameState.dailyTapCount = Math.max(0, gameState.dailyTapCount - 1);
            const gemsEarned = GAME_CONFIG.gemsPerTap * effectiveTaps * gemMultiplier;
            gameState.addGems(gemsEarned);
    
            gameState.saveDailyTapCount(gameState.dailyTapCount);
            gameState.saveState();
    
            console.log("Auto-tap performed", {
                tapsLeft: gameState.tapsLeft,
                sessionTapCount: gameState.sessionTapCount,
                dailyTapCount: gameState.dailyTapCount,
                gemsEarned
            });
        }, GAME_CONFIG.potionInterval);
    
        console.log("Potion interval started successfully.");
    }
    

    stopPotionEffect() {
        console.log("Stopping potion effect");
        if (this.potionInterval) {
            clearInterval(this.potionInterval);
            this.potionInterval = null;
        }
    }

    getMultipliers() {
        let tapMultiplier = 1;
        let gemMultiplier = 1;

        if (this.activeBoosts.sword) {
            tapMultiplier *= 3;
        }
        if (this.activeBoosts.bag) {
            gemMultiplier *= 2;
        }

        return { tapMultiplier, gemMultiplier };
    }

    saveBoosts() {
        localStorage.setItem('activeBoosts', JSON.stringify(this.activeBoosts));
        console.log("Boosts saved:", this.activeBoosts);
    }

    saveBoostTimer(boostType, endTime) {
        const timers = JSON.parse(localStorage.getItem('boostTimers') || '{}');
        timers[boostType] = endTime;
        localStorage.setItem('boostTimers', JSON.stringify(timers));
    }

    removeBoostTimer(boostType) {
        const timers = JSON.parse(localStorage.getItem('boostTimers') || '{}');
        delete timers[boostType];
        localStorage.setItem('boostTimers', JSON.stringify(timers));
    }

    updateBoostDisplay() {
        document.querySelectorAll('[data-boost]').forEach(element => {
            const boostType = element.dataset.boost;
            const isActive = this.activeBoosts[boostType];
    
            const img = element.querySelector('img');
            if (!img) return;
    
            if (element.classList.contains('boost-card')) {
                // Pour les cartes dans boost.html
                element.classList.toggle('active', isActive);
                img.src = `img/Boosts/${boostType}.png`; // Toujours afficher l'image du boost
            } else {
                // Pour les cercles dans tap.html
                img.src = isActive ? `img/Boosts/${boostType}.png` : 'img/Boosts/B_ph1.png';
            }
        });
    }

    resetBoosts() {
        this.stopPotionEffect();

        Object.keys(this.boostTimers).forEach(boostType => {
            if (this.boostTimers[boostType]) {
                clearTimeout(this.boostTimers[boostType]);
            }
        });

        this.activeBoosts = {
            potion: false,
            sword: false,
            bag: false,
            book: false
        };

        this.boostTimers = {
            potion: null,
            sword: null,

            bag: null,
            book: null
        };

        localStorage.removeItem('activeBoosts');
        localStorage.removeItem('boostTimers');
        this.updateBoostDisplay();
    }

    // Vérification périodique des timers
    checkBoostTimers() {
        const timers = JSON.parse(localStorage.getItem('boostTimers') || '{}');
        const currentTime = Date.now();

        Object.entries(timers).forEach(([boostType, endTime]) => {
            if (endTime && endTime < currentTime && boostType !== 'book') {
                this.deactivateBoost(boostType);
            }
        });
    }

    resetTapSeries() { // Pas de point-virgule ici
        console.log("Resetting tap series...");
    
        gameState.tapsLeft = GAME_CONFIG.initialTaps;
        gameState.sessionTapCount = 0;
        gameState.saveState();
    
        const circleImage = document.getElementById('circleImage');
        if (circleImage) {
            circleImage.src = "img/Chest/1/Chest1_1.png"; // Remettre l'image normale
        }
    
        console.log("Tap series reset. Taps available:", gameState.tapsLeft);
    }





}










export const boostManager = new BoostManager();