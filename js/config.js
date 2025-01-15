// config.js
export const GAME_CONFIG = {
    initialTaps: 100,
    dailyTapLimit: 500,
    tapRegenInterval: 5000,
    gemsPerTap: 0.001,
    boostPrices: {
        potion: 0.001,
        sword: 0.002,
        bag: 0.003,
        book: 0.004
    },
    boostDurations: {
        potion: 60000,  // 1 minute
        sword: 60000,   // 1 minute
        bag: 60000,     // 1 minute
        book: 60000     // 1 minute
    },
    potionInterval: 3000 // Intervalle pour la potion (3 secondes)
};