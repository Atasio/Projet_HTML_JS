import gameEngine from "./gameEngine.js";

function showScorePopup(score, x, y) {
    const popup = document.createElement('div');
    popup.className = 'score-popup';
    popup.textContent = `+${Math.floor(score)}`;
    popup.style.left = x + 'px';
    popup.style.top = y + 'px';
    
    document.getElementById('word-zone').appendChild(popup);
    
    setTimeout(() => popup.remove(), 1000);
}

function updateScore(gameState) {
    document.getElementById('score').textContent = Math.floor(gameState.score);
}

function updateCombo(gameState) {
    const comboElement = document.getElementById('combo');
    comboElement.textContent = `×${gameState.combo.toFixed(1)}`;
    
    // -------------------------------------------------------------------------------------------------------------------------------------
    // Pulse animation on combo increase
    comboElement.style.animation = 'none';
    setTimeout(() => {
        comboElement.style.animation = 'pulse 1s ease-in-out infinite';
    }, 10);
    // -------------------------------------------------------------------------------------------------------------------------------------
}

function updateProgress(gameState) {
    const percentage = (gameState.wordsTyped / gameState.maxWords) * 100;
    document.getElementById('progress-bar').style.width = percentage + '%';
    document.getElementById('progress-text').textContent = 
        `${gameState.wordsTyped}/${gameState.maxWords} mots`;
}

function updateErrors(gameState) {
    console.log("Updating errors:", gameState.errors);
    const maxErrors = 10;
    if(gameState.errors >= maxErrors) {
        gameState.errors = maxErrors;
        gameEngine.endGame();
    }
    const percentage = (gameState.errors / maxErrors) * 100;
    document.getElementById('progress-bar-errors').style.width = percentage + '%';
    document.getElementById('progress-text-errors').textContent = 
        `${gameState.errors}/${maxErrors} erreurs`;
}

export default { showScorePopup, updateScore, updateCombo, updateProgress, updateErrors };