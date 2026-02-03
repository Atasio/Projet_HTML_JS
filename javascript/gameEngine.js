import { gameState } from "./gameState.js";
import gameScoreHandler from "./gameScoreHandler.js";
import { io_client } from "./io_client.js";
import leaderboard from "./leaderboard.js";


function endGame(playersData = []) {
    gameState.isGameActive = false;
    gameState.settings.spawnRate = 0;
    
    // Stop falling words
    gameState.fallingWords.forEach(word => {
        if (word.animationId) {
            cancelAnimationFrame(word.animationId);
        }
    });
    
    showEndGameDialog(playersData);
}

function showEndGameDialog(playersData = []) {
    // Calculer les stats
    const totalTime = Math.floor((Date.now() - gameState.gameStartTime) / 1000);
    const minutes = Math.floor(totalTime / 60);
    const seconds = totalTime % 60;
    const timeStr = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    
    // Déterminer la raison de fin
    let endReason = '';
    if (gameState.errors >= (gameState.maxErrors || 5)) {
        endReason = '❌ Trop d\'erreurs';
    } else if (gameState.wordsTyped >= gameState.maxWords) {
        endReason = '🎯 Tous les mots tapés !';
    }
    
    // Générer le classement des joueurs
    let playersRankingHtml = '';
    if (playersData.length > 0) {
        // Trier les joueurs par score (décroissant)
        const sortedPlayers = [...playersData].sort((a, b) => b.score - a.score);
        
        playersRankingHtml = `
            <div class="players-ranking-section">
                <h3 class="ranking-title">🏆 Classement de la partie</h3>
                <div class="players-ranking-list">
                    ${sortedPlayers.map((player, index) => {
                        const rank = index + 1;
                        let medalEmoji = '';
                        if (rank === 1) medalEmoji = '🥇';
                        else if (rank === 2) medalEmoji = '🥈';
                        else if (rank === 3) medalEmoji = '🥉';
                        else medalEmoji = `${rank}.`;
                        
                        return `
                            <div class="player-rank-item rank-${rank}">
                                <span class="rank-medal">${medalEmoji}</span>
                                <span class="player-name-rank">${player.name}</span>
                                <span class="player-score-rank">${Math.floor(player.score)}</span>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }
    
    // Créer l'overlay
    const overlay = document.createElement('div');
    overlay.id = 'dialog-overlay';
    overlay.innerHTML = `
        <div class="dialog-box end-game-dialog">
            <h2 class="dialog-title">🎉 Partie terminée !</h2>
            ${endReason ? `<p class="end-reason">${endReason}</p>` : ''}
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
                    <div class="stat-label">Erreurs</div>
                    <div class="stat-value-big">${gameState.errors}/${gameState.maxErrors || 5}</div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">Combo max</div>
                    <div class="stat-value-big">×${gameState.maxCombo || gameState.combo}</div>
                </div>
            </div>
            
            ${playersRankingHtml}
            
            <!-- Section Leaderboard -->
            <div class="leaderboard-section">
                <p class="leaderboard-prompt">Enregistrer votre score ?</p>
                <input type="text" id="player-name-input" placeholder="Votre pseudo" maxlength="15">
                <button id="dialog-save" class="dialog-btn save-btn">💾 Ajouter au leaderboard</button>
            </div>
            
            <div class="dialog-buttons">
                <button id="dialog-menu" class="dialog-btn cancel-btn">Menu</button>
                <button id="dialog-restart" class="dialog-btn join-btn">Rejouer</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(overlay);
    
    // Focus sur l'input du nom
    const nameInput = document.getElementById('player-name-input');
    setTimeout(() => nameInput.focus(), 100);
    
    // Event listeners
    document.getElementById('dialog-menu').addEventListener('click', () => {
        // TO-DO : Ne pas appeller sendRestartGame puis sensEndGame car pas maintenable
        // - Faire une fonction spécifique pour quitter la partie
        io_client.sendRestartGame();
        io_client.sendEndGame();
        window.location.href = '../index.html';
    });
    
    document.getElementById('dialog-restart').addEventListener('click', () => {
        closeDialog();
        restartGame();
    });
    
    document.getElementById('dialog-save').addEventListener('click', () => {
        const playerName = nameInput.value.trim();
        if (playerName) {
            leaderboard.saveToLeaderboard(playerName, Math.floor(gameState.score), timeStr, gameState.wordsTyped, gameState.maxCombo || gameState.combo);
            
            // Feedback visuel
            const saveBtn = document.getElementById('dialog-save');
            saveBtn.textContent = '✅ Enregistré !';
            saveBtn.disabled = true;
            saveBtn.style.background = '#4caf50';
            nameInput.disabled = true;
        } else {
            nameInput.style.borderColor = '#ff6b6b';
            nameInput.placeholder = 'Entrez un pseudo !';
        }
    });
    
    // Entrée pour sauvegarder
    nameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            document.getElementById('dialog-save').click();
        }
    });

    function closeDialog() {
        overlay.classList.add('fade-out');
        setTimeout(() => overlay.remove(), 300);
    }
}

function restartGame() {
    // Nettoyer tous les mots restants
    document.getElementById('word-zone').innerHTML = '';
    
    // Mettre à jour l'affichage
    gameScoreHandler.updateScore(gameState);
    gameScoreHandler.updateCombo(gameState);
    gameScoreHandler.updateProgress(gameState);
    gameScoreHandler.updateErrors(gameState);
    
    // Redémarrer
    io_client.sendRestartGame();
}

function startGame() {
    gameState.isGameActive = true;
    gameState.gameStartTime = Date.now();
    document.getElementById('start-btn').style.display = 'none';
    document.getElementById('word-input').focus();
}

function updateStartButton(isGameActive) {
    const startBtn = document.getElementById('start-btn');
    if (isGameActive) {
        startBtn.style.display = 'none';
    } else {
        startBtn.style.display = 'block';
    }
}

export default { endGame, startGame, restartGame, updateStartButton };