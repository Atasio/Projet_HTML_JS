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

function updateUi(playerData, maxWords, maxErrors) {
    updateCombo(playerData);
    updateScore(playerData);
    updateProgress(playerData, maxWords);
    updateErrors(playerData, maxErrors);
}

function updateScore(playerData) {
    document.getElementById('score').textContent = Math.floor(playerData.score);
}

function updateCombo(playerData) {
    const comboElement = document.getElementById('combo');
    comboElement.textContent = `×${playerData.combo.toFixed(1)}`;
    
    // Pulse animation on combo increase
    comboElement.style.animation = 'none';
    setTimeout(() => {
        comboElement.style.animation = 'pulse 1s ease-in-out infinite';
    }, 10);
}

function updateProgress(playerData, maxWords) {
    const percentage = (playerData.wordsTyped / maxWords) * 100;
    document.getElementById('progress-bar').style.width = percentage + '%';
    document.getElementById('progress-text').textContent = `${playerData.wordsTyped}/${maxWords} mots`;
}

function updateErrors(playerData, maxErrors) {
    console.log("Updating errors:", playerData.errors);
    const maxErrorsValue = maxErrors;
    
    const percentage = (playerData.errors / maxErrorsValue) * 100;
    document.getElementById('progress-bar-errors').style.width = percentage + '%';
    document.getElementById('progress-text-errors').textContent = `${playerData.errors}/${maxErrors} erreurs`;
}

export default { showScorePopup, updateUi, updateScore, updateCombo, updateProgress, updateErrors };