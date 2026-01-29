import { gameState } from "./gameState.js";


// === CANVAS & PARTICLES ===


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
    
    // Clear and reset input
    const input = document.getElementById('word-input');
    input.value = '';
    input.focus();
    
    // Restart spawning
    restartSpawnInterval();
}


// === UI UPDATES ===



// === UTILITIES ===


// -------------------------------------------------------------------------------------------------------------------------------------
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result 
        ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
        : '0, 0, 0';
}
// -------------------------------------------------------------------------------------------------------------------------------------