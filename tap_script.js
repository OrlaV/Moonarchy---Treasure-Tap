// tap_script.js

// --------------- Début du Code de Particules --------------- //
const canvas = document.getElementById('particleCanvas');
const ctx = canvas.getContext('2d');
const tapCircle = document.getElementById('tapCircle');

// Adapter la taille du canvas au coffre
function resizeCanvas() {
  canvas.width = tapCircle.clientWidth;
  canvas.height = tapCircle.clientHeight;
}
window.addEventListener('load', resizeCanvas);
window.addEventListener('resize', resizeCanvas);


// Gestion des boosts
let activeBoosts = {
  potion: false,
  sword: false,
  bag: false,
  book: false
};

function loadBoosts() {
  const savedBoosts = localStorage.getItem('activeBoosts');
  if (savedBoosts) {
    activeBoosts = JSON.parse(savedBoosts);
    updateActiveBoostsDisplay();
  }
}

function updateActiveBoostsDisplay() {
  const boostContainer = document.querySelector('.boosts-container');
  if (!boostContainer) return;

  const boostTypes = ['potion', 'sword', 'bag', 'book'];
  
  boostTypes.forEach((type, index) => {
    const boostCircle = boostContainer.children[index];
    if (boostCircle) {
      const boostImage = boostCircle.querySelector('img');
      if (activeBoosts[type]) {
        boostImage.src = `img/Boosts/${type}.png`;
      } else {
        boostImage.src = 'img/Boosts/B_ph1.png';
      }
    }
  });
}

// Modifiez la fonction handleTap existante pour prendre en compte les multiplicateurs
function getActiveBoostMultipliers() {
  let tapMultiplier = 1;
  let gemMultiplier = 1;
  
  if (activeBoosts.sword) tapMultiplier *= 3;
  if (activeBoosts.bag) gemMultiplier *= 2;
  
  return { tapMultiplier, gemMultiplier };
}

// Modifiez la fonction handleTap existante
function handleTap() {
  regenerateTaps();
  if (tapsLeft <= 0 || dailyTapCount <= 0) return;

  const { tapMultiplier, gemMultiplier } = getActiveBoostMultipliers();
  
  tapsLeft = Math.max(0, tapsLeft - tapMultiplier);
  sessionTapCount += tapMultiplier;
  dailyTapCount = Math.max(0, dailyTapCount - tapMultiplier);
  totalGems += gemsPerTap * tapMultiplier * gemMultiplier;
  
  saveDailyTapCount(dailyTapCount);
  saveState();
  updateCounters();

  circleImage.src = clickedImage;

  const rect = tapCircle.getBoundingClientRect();
  const x = rect.width / 2;
  const y = rect.height / 2;
  createParticles(x, y);

  setTimeout(() => {
    if (tapsLeft > 0) {
      circleImage.src = normalImage;
    }
  }, 100);

  if (tapsLeft === 0) {
    endTapSeries();
  }
}

// À la fin du fichier, ajoutez ces lignes à l'initialisation
document.addEventListener('DOMContentLoaded', () => {
  loadBoosts();
  updateActiveBoostsDisplay();
  
  // Vérifier les timers toutes les secondes
  setInterval(() => {
    checkBoostTimers();
    loadBoosts();
    updateActiveBoostsDisplay();
  }, 1000);
});


class Particle {
  constructor(x, y, image) {
    this.x = x;
    this.y = y;
    this.size = Math.random() * 20 + 20;
    this.speedX = Math.random() * 3 - 1.5;
    this.speedY = Math.random() * 3 - 1.5;
    this.angle = Math.random() * 0;
    this.velocity = Math.random() * 0.05 + 0.05;
    this.image = image;
    this.creationTime = Date.now();
  }

  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    this.angle += this.velocity;
  }

  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle * Math.PI / 180);
    ctx.drawImage(this.image, -this.size / 2, -this.size / 2, this.size, this.size);
    ctx.restore();
  }

  isAlive(currentTime) {
    return (currentTime - this.creationTime) < 1000;
  }
}

let particlesArray = [];
const coinImagesSrc = [
  'img/Gems/Spr_Gem_1.png',
  'img/Gems/Spr_Gem_2.png',
  'img/Gems/Spr_Gem_3.png',
  'img/Gems/Spr_Gem_4.png',
  'img/Gems/Spr_Gem_5.png',
  'img/Gems/Spr_Gem_6.png',
];

const loadedCoinImages = [];
function preloadImages(imageSources, callback) {
  let loadedImagesCount = 0;
  const totalImages = imageSources.length;

  imageSources.forEach((src) => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      loadedCoinImages.push(img);
      loadedImagesCount++;
      if (loadedImagesCount === totalImages) {
        callback();
      }
    };
    img.onerror = () => {
      console.error(`Erreur de chargement de l'image : ${src}`);
    };
  });
}

preloadImages(coinImagesSrc, () => {
  animateParticles();
});

function createParticles(x, y) {
  for (let i = 0; i < 1; i++) {
    const randomImage = loadedCoinImages[Math.floor(Math.random() * loadedCoinImages.length)];
    particlesArray.push(new Particle(x, y, randomImage));
  }
}

function animateParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const currentTime = Date.now();

  particlesArray = particlesArray.filter(particle => {
    if (particle.isAlive(currentTime)) {
      particle.update();
      particle.draw();
      return true;
    }
    return false;
  });

  if (particlesArray.length > 300) {
    particlesArray.splice(0, particlesArray.length - 300);
  }

  requestAnimationFrame(animateParticles);
}

// --------------- Fin du Code de Particules --------------- //

// --------------- Début de la Gestion des Taps --------------- //
const circleImage = document.getElementById('circleImage');
const tapCountSpan = document.getElementById('tapCount');
const sessionTapCountSpan = document.getElementById('sessionTapCount');
const dailyTapCountSpan = document.getElementById('dailyTapCount');
const gemCountSpan = document.getElementById('gemCount');

// Configuration des compteurs
const initialTaps = 20;
const dailyTapLimit = 500;
const tapRegenInterval = 5000; // Régénération toutes les 5 secondes
const gemsPerTap = 0.001; // Récompenses par tap

const normalImage = "img/Chest/1/Chest1_1.png";
const clickedImage = "img/Chest/1/Chest1_2.png";
const finishImage = "img/Chest/1/Chest1_3.png";

let tapsLeft = initialTaps;
let sessionTapCount = 0;
let dailyTapCount = 0;
let totalGems = 0;
let lastRegenTime = Date.now();

function loadState() {
  const savedData = JSON.parse(localStorage.getItem('tapGameData'));
  if (savedData) {
    tapsLeft = savedData.tapsLeft || initialTaps;
    sessionTapCount = savedData.sessionTapCount || 0;
    dailyTapCount = loadDailyTapCount();
    lastRegenTime = savedData.lastRegenTime || Date.now();
    totalGems = savedData.totalGems || 0;
    regenerateTaps();
  } else {
    tapsLeft = initialTaps;
    sessionTapCount = 0;
    dailyTapCount = loadDailyTapCount();
    lastRegenTime = Date.now();
    totalGems = 0;
  }
}

function saveState() {
  localStorage.setItem(
    'tapGameData',
    JSON.stringify({
      tapsLeft: tapsLeft,
      sessionTapCount: sessionTapCount,
      lastRegenTime: lastRegenTime,
      totalGems: totalGems,
    })
  );
}



function loadDailyTapCount() {
  const savedData = JSON.parse(localStorage.getItem('dailyTapData'));
  const today = new Date().toISOString().split('T')[0];

  if (savedData && savedData.date === today) {
    return savedData.remainingTaps;
  } else {
    saveDailyTapCount(dailyTapLimit);
    return dailyTapLimit;
  }
}

function saveDailyTapCount(remainingTaps) {
  const today = new Date().toISOString().split('T')[0];
  localStorage.setItem(
    'dailyTapData',
    JSON.stringify({ date: today, remainingTaps })
  );
}

function regenerateTaps() {
  const currentTime = Date.now();
  const timeElapsed = currentTime - lastRegenTime;
  const tapsToRegen = Math.floor(timeElapsed / tapRegenInterval);

  if (tapsToRegen > 0) {
    dailyTapCount = Math.min(dailyTapLimit, dailyTapCount + tapsToRegen);
    lastRegenTime += tapsToRegen * tapRegenInterval;
    saveDailyTapCount(dailyTapCount);
    saveState();
    updateCounters();
  }
}

function updateCounters() {
  tapCountSpan.textContent = tapsLeft;
  sessionTapCountSpan.textContent = sessionTapCount;
  dailyTapCountSpan.textContent = dailyTapCount;
  gemCountSpan.textContent = totalGems.toFixed(3);
}





function handleTap() {
  regenerateTaps();
  if (tapsLeft <= 0 || dailyTapCount <= 0) return;

  const { tapMultiplier, gemMultiplier } = getActiveBoostMultipliers();
  
  tapsLeft -= tapMultiplier;
  sessionTapCount += tapMultiplier;
  dailyTapCount -= tapMultiplier;
  totalGems += gemsPerTap * tapMultiplier * gemMultiplier;
  
  saveDailyTapCount(dailyTapCount);
  saveState();
  updateCounters();

  circleImage.src = clickedImage;

  const rect = tapCircle.getBoundingClientRect();
  const x = rect.width / 2;
  const y = rect.height / 2;
  createParticles(x, y);

  setTimeout(() => {
    if (tapsLeft > 0) {
      circleImage.src = normalImage;
    }
  }, 100);

  if (tapsLeft === 0) {
    endTapSeries();
  }
}

function resetTapSeries() {
  tapsLeft = initialTaps;
  sessionTapCount = 0;
  circleImage.src = normalImage;
  saveState();
  updateCounters();
  tapCircle.addEventListener('click', handleTap);
}

function endTapSeries() {
  tapCircle.removeEventListener('click', handleTap);
  circleImage.src = finishImage;

  const rect = tapCircle.getBoundingClientRect();
  createParticles(rect.width / 2, rect.height / 2);

  setTimeout(resetTapSeries, 3000);
}

// Initialisation au démarrage
loadState();
updateCounters();
tapCircle.addEventListener('click', handleTap);

// Régénération automatique toutes les 5 secondes
setInterval(regenerateTaps, tapRegenInterval);

// --------------- Fin de la Gestion des Taps --------------- //





// Appeler cette fonction après chaque changement de boost
document.addEventListener('DOMContentLoaded', () => {
  loadBoosts();
  updateActiveBoostsDisplay();
});

// Dans l'initialisation
document.addEventListener('DOMContentLoaded', () => {
  window.loadBoosts();
  updateActiveBoostsDisplay();
  
  // Vérifier les timers toutes les secondes
  setInterval(() => {
    window.checkBoostTimers();
    window.loadBoosts();
    updateActiveBoostsDisplay();
  }, 1000);
});





// Ajoutez ces variables pour gérer les timers des boosts
let boostTimers = {
  potion: null,
  sword: null,
  bag: null
};

let potionInterval = null;

function loadBoosts() {
  const savedBoosts = localStorage.getItem('activeBoosts');
  if (savedBoosts) {
    activeBoosts = JSON.parse(savedBoosts);
    
    // Vérifier les timers restants dans le localStorage
    const savedTimers = localStorage.getItem('boostTimers');
    if (savedTimers) {
      const timers = JSON.parse(savedTimers);
      Object.entries(timers).forEach(([boost, endTime]) => {
        if (endTime) {
          const timeLeft = endTime - Date.now();
          if (timeLeft > 0) {
            startBoostTimer(boost, timeLeft);
          } else {
            deactivateBoost(boost);
          }
        }
      });
    }
    
    updateActiveBoostsDisplay();
  }
}

function startBoostTimer(boostType, duration) {
  // Annuler le timer existant si présent
  if (boostTimers[boostType]) {
    clearTimeout(boostTimers[boostType]);
  }
  
  // Sauvegarder le temps de fin
  const endTime = Date.now() + duration;
  const timers = JSON.parse(localStorage.getItem('boostTimers') || '{}');
  timers[boostType] = endTime;
  localStorage.setItem('boostTimers', JSON.stringify(timers));
  
  // Démarrer le nouveau timer
  boostTimers[boostType] = setTimeout(() => {
    deactivateBoost(boostType);
  }, duration);
  
  // Si c'est une potion, démarrer l'auto-tap
  if (boostType === 'potion' && !potionInterval) {
    startPotionEffect();
  }
}

function startPotionEffect() {
  // Nettoyer l'intervalle existant si présent
  if (potionInterval) {
    clearInterval(potionInterval);
  }
  
  // Créer un nouvel intervalle pour l'auto-tap
  potionInterval = setInterval(() => {
    if (activeBoosts.potion && tapsLeft > 0 && dailyTapCount > 0) {
      simulateAutoTap();
    }
  }, 3000);
}

function simulateAutoTap() {
  const { tapMultiplier, gemMultiplier } = getActiveBoostMultipliers();
  
  // S'assurer que les valeurs ne deviennent pas négatives
  const tapsToRemove = Math.min(tapMultiplier, tapsLeft);
  const dailyTapsToRemove = Math.min(tapMultiplier, dailyTapCount);
  
  tapsLeft -= tapsToRemove;
  sessionTapCount += tapsToRemove;
  dailyTapCount -= dailyTapsToRemove;
  totalGems += gemsPerTap * tapsToRemove * gemMultiplier;
  
  saveDailyTapCount(dailyTapCount);
  saveState();
  updateCounters();
  
  // Animation du coffre pour l'auto-tap
  circleImage.src = clickedImage;
  setTimeout(() => {
    if (tapsLeft > 0) {
      circleImage.src = normalImage;
    }
  }, 100);
  
  if (tapsLeft === 0) {
    endTapSeries();
  }
}

function deactivateBoost(boostType) {
  activeBoosts[boostType] = false;
  
  // Nettoyer les timers
  if (boostTimers[boostType]) {
    clearTimeout(boostTimers[boostType]);
    boostTimers[boostType] = null;
  }
  
  // Nettoyer l'intervalle de la potion
  if (boostType === 'potion' && potionInterval) {
    clearInterval(potionInterval);
    potionInterval = null;
  }
  
  // Mettre à jour le localStorage
  const timers = JSON.parse(localStorage.getItem('boostTimers') || '{}');
  delete timers[boostType];
  localStorage.setItem('boostTimers', JSON.stringify(timers));
  
  saveBoosts();
  updateActiveBoostsDisplay();
}

// Modifier la fonction handleTap pour empêcher les valeurs négatives
function handleTap() {
  regenerateTaps();
  if (tapsLeft <= 0 || dailyTapCount <= 0) return;

  const { tapMultiplier, gemMultiplier } = getActiveBoostMultipliers();
  
  // S'assurer que les valeurs ne deviennent pas négatives
  const tapsToRemove = Math.min(tapMultiplier, tapsLeft);
  const dailyTapsToRemove = Math.min(tapMultiplier, dailyTapCount);
  
  tapsLeft -= tapsToRemove;
  sessionTapCount += tapsToRemove;
  dailyTapCount -= dailyTapsToRemove;
  totalGems += gemsPerTap * tapsToRemove * gemMultiplier;
  
  saveDailyTapCount(dailyTapCount);
  saveState();
  updateCounters();

  circleImage.src = clickedImage;

  const rect = tapCircle.getBoundingClientRect();
  const x = rect.width / 2;
  const y = rect.height / 2;
  createParticles(x, y);

  setTimeout(() => {
    if (tapsLeft > 0) {
      circleImage.src = normalImage;
    }
  }, 100);

  if (tapsLeft === 0) {
    endTapSeries();
  }
}



function checkBoostTimers() {
  const timers = JSON.parse(localStorage.getItem('boostTimers') || '{}');
  const currentTime = Date.now();

  Object.entries(timers).forEach(([boostType, endTime]) => {
    if (endTime && endTime < currentTime && boostType !== 'book') {
      deactivateBoost(boostType);
    }
  });
}



function resetGame() {
  // Réinitialisation des compteurs
  tapsLeft = initialTaps;
  sessionTapCount = 0;
  dailyTapCount = dailyTapLimit;
  totalGems = 0;
  
  // Réinitialisation des boosts
  activeBoosts = {
    potion: false,
    sword: false,
    bag: false,
    book: false
  };
  
  // Nettoyage du localStorage
  localStorage.removeItem('tapGameData');
  localStorage.removeItem('dailyTapData');
  localStorage.removeItem('activeBoosts');
  localStorage.removeItem('boostTimers');
  localStorage.removeItem('gemCount');
  
  // Mise à jour de l'affichage
  updateCounters();
  updateActiveBoostsDisplay();
  
  // Réinitialisation de l'image du coffre
  circleImage.src = normalImage;
  
  // Recharger la page pour s'assurer que tout est réinitialisé
  location.reload();
}

// Vous pouvez appeler cette fonction depuis la console avec:
// resetGame();