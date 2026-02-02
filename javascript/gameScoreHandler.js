import gameEngine from "./gameEngine.js";
import { getUserId } from "./userIdentification.js";

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

// function updateRoomPlayersDisplay(roomstate){
//     console.log("Roomstate: ", roomstate.players);
//     const playersList = document.getElementById('playersInfo');
//     for (const playerId in roomstate.players){
//         console.log(playerId);
//         const player = roomstate.players[playerId];
//         console.log("Player: ", player);

//         // Display player inside list
//         playerElement = document.createElement('div');
//         playerElement.id = `player-${playerId}`;
//         playerElement.className = 'player-entry';
//         playersList.appendChild(playerElement);
//     }
// }

function updateRoomPlayersDisplay(roomstate) {
    console.log("Roomstate: ", roomstate.players);
    const playersList = document.getElementById('playersInfo');
    
    // Vider la liste existante
    playersList.innerHTML = '';
    
    // Convertir en tableau et trier (hôte en premier)
    const playersArray = Object.entries(roomstate.players).sort(([, a], [, b]) => {
        if (a.isHost) return -1;
        if (b.isHost) return 1;
        return 0;
    });

    const currentUserId = getUserId();
    
    // Parcourir les joueurs
    playersArray.forEach(([playerId, player]) => {
        console.log("Player: ", player);

        // Créer un élément <li> pour chaque joueur
        const playerElement = document.createElement('li');
        playerElement.id = `player-${player.userId}`;
        
        // Afficher le nom du joueur
        let playerName;
        if(player.userId === currentUserId) {
            playerName = `(Vous) Joueur ${player.userId}`;
        } else {
            playerName = `Joueur ${player.userId}`;
        }
        playerElement.textContent = playerName;
        
        // Ajouter à la liste
        playersList.appendChild(playerElement);
    });
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

export default { showScorePopup, updateUi, updateScore, updateCombo, updateProgress, updateErrors, updateRoomPlayersDisplay };