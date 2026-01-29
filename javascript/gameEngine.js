import { gameState } from "./gameState.js";
import gameScoreHandler from "./gameScoreHandler.js";
import { io_client } from "./io_client.js";

function restartSpawnInterval() {
    if (gameState.spawnInterval) {
        clearInterval(gameState.spawnInterval);
    }
    io_client.sendStartGame();
}
function restartGame() {
    // Clear existing words
    gameState.fallingWords.forEach(word => {
        const element = document.getElementById(word.id);
        if (element) element.remove();
    });
    
    // Reset state
    gameState.score = 0;
    gameState.errors = 0;
    gameState.combo = 1;
    gameState.wordsTyped = 0;
    gameState.fallingWords = [];
    gameState.gameStartTime = Date.now();
    gameState.isGameActive = true;
    
    // Update UI
    gameScoreHandler.updateScore(gameState);
    gameScoreHandler.updateCombo(gameState);
    gameScoreHandler.updateProgress(gameState);
    gameScoreHandler.updateErrors(gameState);
    
    // Clear and reset input
    const input = document.getElementById('word-input');
    input.value = '';
    input.focus();
    
    // Restart spawning
    restartSpawnInterval();
}

function endGame() {
    gameState.isGameActive = false;
    gameState.settings.spawnRate = 0;
    
    // Stop falling words
    gameState.fallingWords.forEach(word => {
        if (word.animationId) {
            cancelAnimationFrame(word.animationId);
        }
    });
    
    showEndGameDialog();
}

function showEndGameDialog() {
    // Calculer les stats
    const totalTime = Math.floor((Date.now() - gameState.gameStartTime) / 1000);
    const minutes = Math.floor(totalTime / 60);
    const seconds = totalTime % 60;
    const timeStr = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    const accuracy = gameState.maxWords > 0 
        ? Math.round((gameState.wordsTyped / gameState.maxWords) * 100) 
        : 0;
    
    // Créer l'overlay
    const overlay = document.createElement('div');
    overlay.id = 'dialog-overlay';
    overlay.innerHTML = `
        <div class="dialog-box end-game-dialog">
            <h2 class="dialog-title">🎉 Partie terminée !</h2>
            <div class="stats-grid">
                <div class="stat-item">
                    <div class="stat-label">Score final</div>
                    <div class="stat-value-big">${Math.floor(gameState.score)}</div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">Mots tapés</div>
                    <div class="stat-value-big">${gameState.wordsTyped}/${gameState.maxWords}</div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">Temps</div>
                    <div class="stat-value-big">${timeStr}</div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">Combo max</div>
                    <div class="stat-value-big">×${gameState.maxCombo || gameState.combo}</div>
                </div>
            </div>
            <div class="dialog-buttons">
                <button id="dialog-menu" class="dialog-btn cancel-btn">Menu</button>
                <button id="dialog-restart" class="dialog-btn join-btn">Rejouer</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(overlay);
    
    // Event listeners
    document.getElementById('dialog-menu').addEventListener('click', () => {
        window.location.href = '../index.html';
    });
    
    document.getElementById('dialog-restart').addEventListener('click', () => {
        closeDialog();
        restartGame();
    });
    
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            closeDialog();
            restartGame();
        }
    });
    
    function closeDialog() {
        overlay.classList.add('fade-out');
        setTimeout(() => overlay.remove(), 300);
    }
}

export default { restartGame, endGame };