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


function updateCounters() {
  gemCountSpan.textContent = totalGems.toFixed(3);
}



// Initialisation au démarrage
loadState();
updateCounters();








