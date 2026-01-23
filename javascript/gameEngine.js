// === GAME STATE ===
window.addEventListener("load", async () => {
    loadWords();
    startGame();
});

const gameState = {
    score: 0,
    combo: 1,
    wordsTyped: 0,
    maxWords: 100,
    fallingWords: [],
    gameStartTime: null,
    isGameActive: false,
    settings: {
        speed: 5,
        maxLength: 12,
        spawnRate: 2
    }
};

function startGame() {
    gameState.isGameActive = true;
    gameState.gameStartTime = Date.now();
    updateTimer();
    startSpawning();
}

// === WORD MANAGEMENT ===
let wordsList = [];
let spawnInterval = null;


async function loadWords() {
    const response = await fetch('../words.json');
    if (!response.ok) {
        // Fallback words si le fichier n'existe pas
        wordsList = generateFallbackWords();
    } else {
        wordsList = await response.json();
    }
}

function startSpawning() {
    spawnInterval = setInterval(() => {
        if (gameState.wordsTyped < gameState.maxWords && gameState.isGameActive) {
            spawnWord();
        } else if (gameState.wordsTyped >= gameState.maxWords) {
            endGame();
        }
    }, gameState.settings.spawnRate * 1000);
}

function restartSpawnInterval() {
    if (spawnInterval) {
        clearInterval(spawnInterval);
    }
    startSpawning();
}

function endGame() {
    gameState.isGameActive = false;
    clearInterval(spawnInterval);
    
    // Stop falling words
    gameState.fallingWords.forEach(word => {
        if (word.animationId) {
            cancelAnimationFrame(word.animationId);
        }
    });
    
    alert(`Partie terminée!\nScore final: ${gameState.score}\nMots tapés: ${gameState.wordsTyped}/${gameState.maxWords}`);
}

function getRandomWord() {
    const filteredWords = wordsList.filter(
        word => word.length <= gameState.settings.maxLength
    );
        
    const randomIndex = Math.floor(Math.random() * filteredWords.length);
    return filteredWords[randomIndex];
}



// === WORD MATCH ===
function handleWordMatch(wordObj) {
    const element = wordObj.element;
    
    // Visual feedback
    element.classList.add('matched');
    
    // Calculate score
    const baseScore = wordObj.text.length * 3;
    const scoreWithCombo = baseScore * gameState.combo;
    gameState.score += scoreWithCombo;
    
    // -------------------------------------------------------------------------------------------------------------------------------------
    // Show score popup
    showScorePopup(scoreWithCombo, wordObj.x, wordObj.y);
    
    // Create particles
    createParticles(wordObj.x + element.offsetWidth / 2, wordObj.y + element.offsetHeight / 2);
    // -------------------------------------------------------------------------------------------------------------------------------------

    // Update combo
    gameState.combo = Math.min(gameState.combo + 0.5, 5);
    updateCombo();
    
    // Update stats
    gameState.wordsTyped++;
    updateScore();
    updateProgress();
    
    // Remove word with animation
    setTimeout(() => {
        element.classList.add('destroying');
        setTimeout(() => removeWord(wordObj.id, true), 500);
    }, 100);
}