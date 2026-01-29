import wordsService from "./wordsService.js";
import  io from "../io.js";

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
    loadWords();
    gameState.isGameActive = true;
    gameState.gameStartTime = Date.now();
    startSpawning();
}

// === WORD MANAGEMENT ===
let wordsList = [];
let spawnInterval = null;


async function loadWords() {
    const words = await wordsService.getAllWords();
    if (!words) {
        // Fallback words si le fichier n'existe pas
        wordsList = generateFallbackWords();
    } else {
        wordsList = words;
    }
}

function startSpawning() {
    spawnInterval = setInterval(() => {
        if (gameState.fallingWords.length < gameState.maxWords && gameState.isGameActive) {
            spawnWord();
        } else if (gameState.fallingWords.length >= gameState.maxWords) {
            endGame();
        }
    }, gameState.settings.spawnRate * 1000);
}

function spawnWord() {
    const word = getRandomWord();
    const wordId = `word-${Date.now()}-${Math.random()}`;
    const wordObj = {
        id: wordId,
        text: word,
        speed : (gameState.settings.speed / 5) * (0.5 + Math.random() * 0.5),
    }
    io.sendSpawnWord(wordObj);
    gameState.fallingWords.push(wordObj);
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
function handleWordMatch(wordId) {
    const wordObj = gameState.fallingWords.find(word => word.id === wordId);
    if (!wordObj) return;
    // Calculate score
    const baseScore = wordObj.text.length * 3;
    const scoreWithCombo = baseScore * gameState.combo;

    gameState.score += scoreWithCombo;
    gameState.combo = Math.min(gameState.combo + 0.5, 5);
    gameState.wordsTyped++;

    io.sendUpdateGameState(gameState.score, gameState.combo, gameState.wordsTyped);

    setTimeout(() => {
        element.classList.add('destroying');
        setTimeout(() => removeWord(wordObj.id, true), 500);
    }, 100);
}

export default { gameState, startGame, handleWordMatch };