import { gameState } from "./gameState.js";
import gameParticles from "./gameParticles.js";
import { io_client } from "./io_client.js";
import gameInputHandler from "./gameInputHandler.js";
import  gameWordHandling  from "./gameWordHandler.js";
import gameEngine from "./gameEngine.js";

let canvas;

window.addEventListener("load", async () => {
    initControls();
    setupInputListener();
    gameParticles.animateParticles();
    startGameOnButtonStartClick();
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
    initControls();
    io_client.sendStartGame();
    document.getElementById('start-btn').style.display = 'none';
    document.getElementById('word-input').focus();
}

// === CONTROLS ===
function initControls() {
    const toggleBtn = document.getElementById('toggle-controls');
    const controlsContent = document.getElementById('controls-content');
    const restartBtn = document.getElementById('restart-btn');
    gameState.isGameActive = true;
    gameState.gameStartTime = Date.now();
    gameState.errors = 0;
    
    toggleBtn.addEventListener('click', () => {
        controlsContent.classList.toggle('hidden');
    });
    
    // Sliders
    document.getElementById('speed').addEventListener('input', (e) => {
        gameState.settings.speed = parseInt(e.target.value);
    });
    
    document.getElementById('max-length').addEventListener('input', (e) => {
        gameState.settings.maxLength = parseInt(e.target.value);
    });
    
    document.getElementById('spawn-rate').addEventListener('input', (e) => {
        gameState.settings.spawnRate = parseFloat(e.target.value);
        restartSpawnInterval();
    });
    
    restartBtn.addEventListener('click', gameEngine.restartGame); 
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
