import { gameState } from "./gameState.js";
import gameParticles from "./gameParticles.js";
import { io_client } from "./io_client.js";
import gameInputHandler from "./gameInputHandler.js";
import gameEngine from "./gameEngine.js";

let canvas;

window.addEventListener("load", async () => {
    setupInputListener();
    gameParticles.animateParticles();
    startGameOnButtonStartClick();
    // Hide StartGame if game is already active
    if (gameState.isGameActive) {
        document.getElementById('start-screen').style.display = 'none';
    }
    copyRoomButtonListener();
    leaveRoomButtonListener();
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

function copyRoomButtonListener() {
    const copyButton = document.getElementById('copyButton');
    const roomCode = document.getElementById('roomCode');
    if (copyButton && roomCode) {
        copyButton.addEventListener('click', async () => {
            const code = roomCode.textContent;
            
            try {
                // Copier dans le presse-papier
                await navigator.clipboard.writeText(code);
                
                // Feedback visuel
                copyButton.textContent = 'Copié !';
                copyButton.classList.add('copied');
                
                // Retour à l'état normal après 2 secondes
                setTimeout(() => {
                    copyButton.textContent = 'Copy Code';
                    copyButton.classList.remove('copied');
                }, 2000);
                
            } catch (err) {
                console.error('Erreur lors de la copie:', err);
                
                // Fallback pour les navigateurs plus anciens
                const textArea = document.createElement('textarea');
                textArea.value = code;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                
                copyButton.textContent = 'Copié !';
                copyButton.classList.add('copied');
                
                setTimeout(() => {
                    copyButton.textContent = 'Copy Code';
                    copyButton.classList.remove('copied');
                }, 2000);
            }
        });
    }
}

function leaveRoomButtonListener() {
    console.log("Setting up leave room button listener");
    const leaveButton = document.getElementById('quit-btn');
    leaveButton.addEventListener('click', () => {
        console.log("Leave room button clicked");
        io_client.sendEndGame();
        //window.location.href = '/';
    });
}