import wordsService from "./wordsService.js";
import  io from "../io.js";

// === GAME LIFECYCLE ===
function startGame(roomId, gameState) {
    loadWords();
    gameState.isGameActive = true;
    gameState.gameStartTime = Date.now();
    console.log("Game started at", gameState.gameStartTime);
    startSpawning(gameState);
}

function createGameState(){
    return  {
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
    }};
}
// === WORD MANAGEMENT ===
let wordsList = [];


async function loadWords() {
    const words = await wordsService.getAllWords();
    if (!words) {
        // Fallback words si le fichier n'existe pas
        wordsList = generateFallbackWords();
    } else {
        wordsList = words;
    }
}

function startSpawning(roomId, gameState) {
    gameState.spawnInterval = setInterval(() => {
        if (gameState.fallingWords.length < gameState.maxWords && gameState.isGameActive) {
            spawnWord(roomId, gameState);
        } else if (gameState.fallingWords.length >= gameState.maxWords) {
            endGame(roomId, gameState);
        }
    }, gameState.settings.spawnRate * 1000);
}

function spawnWord(roomId, gameState) {
    const word = getRandomWord(gameState);
    const wordId = `word-${Date.now()}-${Math.random()}`;
    const wordObj = {
        id: wordId,
        text: word,
        speed : (gameState.settings.speed / 5) * (0.5 + Math.random() * 0.5),
    }
    io.sendSpawnWord(roomId, wordObj);
    gameState.fallingWords.push(wordObj);
}

function restartSpawnInterval(roomId, gameState) {
    if (gameState.spawnInterval) {
        clearInterval(gameState.spawnInterval);
    }
    startSpawning(roomId, gameState);
}

function endGame(gameState) {
    gameState.isGameActive = false;
    clearInterval(gameState.spawnInterval);
    
    // Stop falling words
    gameState.fallingWords.forEach(word => {
        if (word.animationId) {
            cancelAnimationFrame(word.animationId);
        }
    });
}

function getRandomWord(gameState) {
    const filteredWords = wordsList.filter(
        word => word.length <= gameState.settings.maxLength
    );
        
    const randomIndex = Math.floor(Math.random() * filteredWords.length);
    return filteredWords[randomIndex];
}

// === WORD MATCH ===
function handleWordMatch(gameState, wordId, typedWord) {
    console.log("handleWordMatch called with wordId:", wordId);
    console.log("current fallingWords:", gameState.fallingWords);
    const wordObj = gameState.fallingWords.find(word => word.id === wordId);
    console.log("Handling word match for:", wordObj);
    if (!wordObj) return;
    // Calculate score
    const baseScore = wordObj.text.length * 3;
    const scoreWithCombo = baseScore * gameState.combo;

    gameState.score += scoreWithCombo;
    gameState.combo = Math.min(gameState.combo + 0.5, 5);
    gameState.wordsTyped++;


    io.sendUpdateGameState(gameState.score, gameState.combo, gameState.wordsTyped);
}

export default { startGame, handleWordMatch, createGameState };