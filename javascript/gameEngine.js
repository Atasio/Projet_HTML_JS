import { gameState } from "./gameState.js";

function restartSpawnInterval() {
    if (spawnInterval) {spawn
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
