import { gameState } from "./gameState.js";
import gameScoreHandler from "./gameScoreHandler.js";
import gameParticles from "./gameParticles.js";
import { io_client } from "./io_client.js";

function spawnWord(word) {
    //console.log("Game isActive:", gameState.isGameActive);
    if (!gameState.isGameActive) return;
    const wordObj = {
        id: word.id,
        text: word.text,
        x: Math.random() * (window.innerWidth - 200) + 50,
        y: 120,
        speed: word.speed,
        element: null,
        animationId: null
    };
    // Create DOM element
    const wordElement = document.createElement('div');
    wordElement.id = wordObj.id;
    wordElement.className = 'falling-word';
    wordElement.textContent = wordObj.text;
    wordElement.style.left = wordObj.x + 'px';
    wordElement.style.top = wordObj.y + 'px';
    
    document.getElementById('word-zone').appendChild(wordElement);
    wordObj.element = wordElement;

    gameState.fallingWords.push(wordObj);
    //console.log("Word table:", gameState.fallingWords);
    animateWord(wordObj, gameState);

}

function removeWord(wordId) {
    const index = gameState.fallingWords.findIndex(w => w.id === wordId);
    if (index === -1) return;
    
    const wordObj = gameState.fallingWords[index];
    //console.log("Removing word:", wordObj);
    
    // Cancel animation
    if (wordObj.animationId) {
        cancelAnimationFrame(wordObj.animationId);
    }
    
    // Remove element
    const element = document.getElementById(wordId);
    if (element) {
        element.remove();
    }
    
    // Remove from array
    gameState.fallingWords.splice(index, 1);
}

function animateWord(wordObj, gameState) {
    const animate = () => {
        if (!gameState.isGameActive) {
            // Si le jeu n'est plus actif, arrêter l'animation
            return;
        }
        
        wordObj.y += wordObj.speed;
        wordObj.element.style.top = wordObj.y + 'px';
        
        // Check if near bottom
        const bottomThreshold = window.innerHeight - 200;
        if (wordObj.y > bottomThreshold - 100) {
            wordObj.element.classList.add('near-bottom');
        }
        
        // Check if reached bottom
        if (wordObj.y > bottomThreshold) {
            // Notifier le serveur du mot manqué
            io_client.sendWordMissed(wordObj.id);
            
            // Le serveur enverra updateGameState, pas besoin de mettre à jour localement
            removeWord(wordObj.id);
            return;
        }
        
        wordObj.animationId = requestAnimationFrame(animate);
    };
    
    animate();
}

function handleWordMatch(wordObj, typedWord) {
    const element = wordObj.element;
    
    // Visual feedback
    element.classList.add('matched');
    console.log("typedWord:", typedWord);
    io_client.sendWordCompleted(wordObj.id, typedWord);
    
    // Calculate score pour affichage visuel (sera confirmé par le serveur)
    const baseScore = wordObj.text.length * 3;
    const scoreWithCombo = baseScore * gameState.combo;
    
    // Show score popup
    gameScoreHandler.showScorePopup(scoreWithCombo, wordObj.x, wordObj.y);
    
    // Create particles
    gameParticles.createParticles(wordObj.x + element.offsetWidth / 2, wordObj.y + element.offsetHeight / 2);

    // Le serveur mettra à jour le score, combo, wordsTyped via updateGameState
    
    // Remove word with animation
    setTimeout(() => {
        element.classList.add('destroying');
        setTimeout(() => removeWord(wordObj.id), 500);
    }, 100);
}

export default {
    spawnWord,
    handleWordMatch
};