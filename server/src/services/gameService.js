import wordsService from "./wordsService.js";
import  io from "../io.js";

// === GAME LIFECYCLE ===
function startGame(roomdId, gameState) {
    loadWords();
    gameState.isGameActive = true;
    gameState.gameStartTime = Date.now();
    console.log("Game started at", gameState.gameStartTime);
    startSpawning(roomdId, gameState);
}

function restartGame(room) {
    room.gameState.fallingWords = [];
    room.players.forEach((player) => {
        player.score = 0;
        player.combo = 1;
        player.wordsTyped = 0;
        player.errors = 0;
    });
    console.log("Game restarted at", room.gameState.gameStartTime);
    startGame(room.roomId, room.gameState);
}

function createGameState(){
    return  {
    maxWords: 100,
    maxErrors: 5,
    fallingWords: [],
    gameStartTime: Date.now(),
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
        wordsList = generateFallbackWords();
    } else {
        wordsList = words;
    }
}

function startSpawning(roomId, gameState) {
    gameState.spawnInterval = setInterval(() => {
        if (gameState.fallingWords.length < gameState.maxWords && gameState.isGameActive == true) {
            spawnWord(roomId, gameState);
        }
    }, gameState.settings.spawnRate * 1000);
}

function spawnWord(roomId, gameState) {
    if(!gameState.isGameActive) return;
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

function endGame(roomId, gameState, players) {
    gameState.isGameActive = false;
    clearInterval(gameState.spawnInterval);
    
    gameState.fallingWords.forEach(word => {
        if (word.animationId) {
            cancelAnimationFrame(word.animationId);
        }
    });
    
    gameState.fallingWords = [];
    
    // Convertir la Map des joueurs en array pour l'envoi
    const playersData = Array.from(players.entries()).map(([userId, playerData]) => ({
        userId,
        name: playerData.name,
        score: playerData.score,
        combo: playerData.combo,
        wordsTyped: playerData.wordsTyped,
        errors: playerData.errors
    }));
    
    // Notifier les clients
    io.sendGameEnded(roomId, {
        players: playersData,
        totalTime: Date.now() - gameState.gameStartTime
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
function handleWordMatch(playerState, wordId, typedWord, fallingWords) {
    try {
        console.log("handleWordMatch called with wordId:", wordId);
        console.log("current fallingWords:", fallingWords);
        
        const wordIndex = fallingWords.findIndex(word => word.id === wordId);
        if (wordIndex === -1) {
            console.warn("Word not found:", wordId);
            return { shouldEndGame: false };
        }

        const wordObj = fallingWords[wordIndex];
        console.log("Handling word match for:", wordObj);

        // Vérifier si le mot tapé correspond
        if (wordObj.text.toLowerCase() !== typedWord.toLowerCase()) {
            console.warn("Word mismatch - expected:", wordObj.text, "got:", typedWord);
            playerState.errors++;
            playerState.combo = Math.max(playerState.combo - 0.5, 1);
            fallingWords.splice(wordIndex, 1);
            
            // Vérifier si limite d'erreurs atteinte pour ce joueur
            if (playerState.errors >= 5) {
                return { shouldEndGame: true };
            }
            
            return { shouldEndGame: false };
        }

        // Calculate score
        const baseScore = wordObj.text.length * 3;
        const scoreWithCombo = baseScore * playerState.combo;

        playerState.score += scoreWithCombo;
        playerState.combo = Math.min(playerState.combo + 0.5, 5);
        playerState.wordsTyped++;

        // Retirer le mot de la liste
        fallingWords.splice(wordIndex, 1);

        // Vérifier si tous les mots sont tapés
        if (playerState.wordsTyped >= 100) {
            return { shouldEndGame: true };
        }

        return { shouldEndGame: false };
    } catch (error) {
        console.error("Error in handleWordMatch:", error);
        return { shouldEndGame: false, error: error.message };
    }
}

function handleWordMissed(playerState, wordId, fallingWords) {
    try {
        const wordIndex = fallingWords.findIndex(word => word.id === wordId);
        if (wordIndex === -1) {
            return { shouldEndGame: false };
        }

        fallingWords.splice(wordIndex, 1);
        playerState.errors++;
        playerState.combo = Math.max(playerState.combo - 1, 1);

        if (playerState.errors >= 5) {
            return { shouldEndGame: true };
        }
        
        return { shouldEndGame: false };
    } catch (error) {
        console.error("Error in handleWordMissed:", error);
        return { shouldEndGame: false, error: error.message };
    }
}

export default { startGame, restartGame, handleWordMatch, handleWordMissed, createGameState, endGame };