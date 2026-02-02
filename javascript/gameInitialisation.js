import { gameState } from "./gameState.js";
import gameParticles from "./gameParticles.js";
import { io_client } from "./io_client.js";
import gameInputHandler from "./gameInputHandler.js";

let canvas;

window.addEventListener("load", async () => {
    setupInputListener();
    gameParticles.animateParticles();
    startGameOnButtonStartClick();
    // Hide StartGame if game is already active
    if (gameState.isGameActive) {
        document.getElementById('start-screen').style.display = 'none';
    }
});

function startGameOnButtonStartClick() {
    document.getElementById('start-btn').addEventListener('click', () => {
        document.getElementById('start-screen').style.display = 'none';
        startGame();
    });
}

// === CANVAS SETUP ===
function initCanvas() {
    canvas = document.getElementById('particles');
    ctx = canvas.getContext('2d');
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
}

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

function startGame() {
    updateTimer();
    io_client.sendStartGame();

}

function setupInputListener() {
    const input = document.getElementById('word-input');
    
    input.addEventListener('input', (e) => {
        gameInputHandler.handleInputChange(input, e.target.value, gameState);
    });
}



function updateTimer() {
    setInterval(() => {
        if (!gameState.isGameActive) return;
        
        const elapsed = Math.floor((Date.now() - gameState.gameStartTime) / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        document.getElementById('timer').textContent = 
            `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }, 1000);
}

