import { gameState } from "./gameState.js";
import gameScoreHandler from "./gameScoreHandler.js";
import gameParticles from "./gameParticles.js";
import { io_client } from "./io_client.js";

function spawnWord(word) {
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
    animateWord(wordObj, gameState);

}

function removeWord(wordId) {
    const index = gameState.fallingWords.findIndex(w => w.id === wordId);    
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
        wordObj.y += wordObj.speed;
        wordObj.element.style.top = wordObj.y + 'px';
        
        // Check if near bottom
        const bottomThreshold = window.innerHeight - 200;
        if (wordObj.y > bottomThreshold - 100) {
            wordObj.element.classList.add('near-bottom');
        }
        
        // Check if reached bottom
        if (wordObj.y > bottomThreshold) {
            gameScoreHandler.updateErrors(gameState);
            removeWord(wordObj.id, false);
            // gameState.combo = 1;
            // updateCombo();
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
    
    // Calculate score
    const baseScore = wordObj.text.length * 3;
    const scoreWithCombo = baseScore * gameState.combo;
    gameState.score += scoreWithCombo;
    
    // -------------------------------------------------------------------------------------------------------------------------------------
    // Show score popup
    gameScoreHandler.showScorePopup(scoreWithCombo, wordObj.x, wordObj.y);
    
    // Create particles
    gameParticles.createParticles(wordObj.x + element.offsetWidth / 2, wordObj.y + element.offsetHeight / 2);
    // -------------------------------------------------------------------------------------------------------------------------------------

    // Update combo
    gameState.combo = Math.min(gameState.combo + 0.5, 5);
    gameScoreHandler.updateCombo(gameState);
    
    // Update stats
    gameState.wordsTyped++;
    gameScoreHandler.updateScore(gameState);
    gameScoreHandler.updateProgress(gameState);
    
    // Remove word with animation
    setTimeout(() => {
        element.classList.add('destroying');
        setTimeout(() => removeWord(wordObj.id, true), 500);
    }, 100);
}

export default {
    spawnWord,
    handleWordMatch
};