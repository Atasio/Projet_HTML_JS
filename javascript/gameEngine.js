import { gameState } from "./gameState.js";

function restartSpawnInterval() {
    if (spawnInterval) {spawn
        clearInterval(spawnInterval);
    }
    startSpawning();
}
function restartGame() {
    // Clear existing words
    gameState.fallingWords.forEach(word => {
        const element = document.getElementById(word.id);
        if (element) element.remove();
    });
    
    // Reset state
    gameState.score = 0;
    gameState.combo = 1;
    gameState.wordsTyped = 0;
    gameState.fallingWords = [];
    gameState.gameStartTime = Date.now();
    gameState.isGameActive = true;
    
    // Update UI
    updateScore();
    updateCombo();
    updateProgress();
    updateErrors();
    
    // Clear and reset input
    const input = document.getElementById('word-input');
    input.value = '';
    input.focus();
    
    // Restart spawning
    restartSpawnInterval();
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
