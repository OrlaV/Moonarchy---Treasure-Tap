// tap-manager.js
import { GAME_CONFIG } from './config.js';
import { gameState } from './game-state.js';
import { boostManager } from './boost-manager.js';
import { ParticleSystem } from './particles.js';

class TapManager {
    constructor() {
        this.circleImage = null;
        this.tapCircle = null;
        this.particleSystem = null;
        
        this.images = {
            normal: "img/Chest/1/Chest1_1.png",
            clicked: "img/Chest/1/Chest1_2.png",
            finish: "img/Chest/1/Chest1_3.png"
        };
    }

    initialize() {
        this.circleImage = document.getElementById('circleImage');
        this.tapCircle = document.getElementById('tapCircle');
        this.particleSystem = new ParticleSystem('particleCanvas');

        if (this.tapCircle) {
            this.setupTapListener();
        }

        gameState.loadState();
        setInterval(() => gameState.regenerateTaps(), GAME_CONFIG.tapRegenInterval);
    }

    setupTapListener() {
        // Utiliser une fonction nommée pour pouvoir la retirer plus tard
        this.handleTapBound = () => this.handleTap();
        this.tapCircle.addEventListener('click', this.handleTapBound);
    }

    handleTap() {
        if (gameState.tapsLeft <= 0 || gameState.dailyTapCount <= 0) return;
    
        const { tapMultiplier, gemMultiplier } = boostManager.getMultipliers();
        const baseTap = 1;
        // Utiliser le minimum entre les taps restants et l'effet multiplicateur
        const effectiveTaps = Math.min(gameState.tapsLeft, baseTap * tapMultiplier);
    
        // Vérifier seulement si nous avons au moins 1 tap disponible
        if (gameState.tapsLeft >= 1 && gameState.dailyTapCount >= 1) {
            // Décrémenter le nombre de taps effectifs
            gameState.tapsLeft -= effectiveTaps;
            // Ajouter les taps effectifs au compteur de session
            gameState.sessionTapCount += effectiveTaps;
            // Décrémenter un seul tap du compteur quotidien
            gameState.dailyTapCount = Math.max(0, gameState.dailyTapCount - baseTap);
            
            // Ajouter les gems avec le nombre effectif de taps
            const gemsEarned = GAME_CONFIG.gemsPerTap * effectiveTaps * gemMultiplier;
            gameState.addGems(gemsEarned);
    
            gameState.saveDailyTapCount(gameState.dailyTapCount);
            gameState.saveState();
    
            this.createTapEffects();
    
            if (gameState.tapsLeft === 0) {
                this.endTapSeries();
            }
        }
    }

    createTapEffects() {
        if (this.circleImage && this.tapCircle) {
            this.circleImage.src = this.images.clicked;

            const rect = this.tapCircle.getBoundingClientRect();
            this.particleSystem.createParticle(rect.width / 2, rect.height / 2);

            setTimeout(() => {
                if (gameState.tapsLeft > 0) {
                    this.circleImage.src = this.images.normal;
                }
            }, 100);
        }
    }

    endTapSeries() {
        if (this.tapCircle && this.circleImage) {
            this.tapCircle.removeEventListener('click', this.handleTapBound);
            this.circleImage.src = this.images.finish;
    
            const rect = this.tapCircle.getBoundingClientRect();
            this.particleSystem.createParticle(rect.width / 2, rect.height / 2);
    
            setTimeout(() => this.resetTapSeries(), 3000);
        }
    }
    
    resetTapSeries() {
        gameState.tapsLeft = GAME_CONFIG.initialTaps;
        gameState.sessionTapCount = 0;
    
        if (this.circleImage) {
            this.circleImage.src = this.images.normal;
        }
    
        gameState.saveState();
        this.setupTapListener();
    }
    
}

export const tapManager = new TapManager();