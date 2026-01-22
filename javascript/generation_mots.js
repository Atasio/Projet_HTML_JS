// === GAME STATE ===
const gameState = {
    score: 0,
    combo: 1,
    wordsTyped: 0,
    maxWords: 100,
    fallingWords: [],
    gameStartTime: null,
    isGameActive: false,
    settings: {
        speed: 5,
        maxLength: 12,
        spawnRate: 2
    }
};

// === WORD MANAGEMENT ===
let wordsList = [];
let spawnInterval = null;

// === CANVAS & PARTICLES ===
const particles = [];
let canvas, ctx;

// === INITIALIZATION ===
window.onload = async function() {
    initCanvas();
    initControls();
    loadWords();
    startGame();
    setupInputListener();
    animateParticles();
};

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

// === LOAD WORDS ===
async function loadWords() {
    const response = await fetch('../words.json');
    if (!response.ok) {
        // Fallback words si le fichier n'existe pas
        wordsList = generateFallbackWords();
    } else {
        wordsList = await response.json();
    }
}

// === CONTROLS ===
function initControls() {
    const toggleBtn = document.getElementById('toggle-controls');
    const controlsContent = document.getElementById('controls-content');
    const restartBtn = document.getElementById('restart-btn');
    
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
    
    restartBtn.addEventListener('click', restartGame);
}

// === GAME CONTROL ===
function startGame() {
    gameState.isGameActive = true;
    gameState.gameStartTime = Date.now();
    updateTimer();
    startSpawning();
    document.getElementById('word-input').focus();
}

function restartGame() {
    // Clear existing words
    gameState.fallingWords.forEach(word => {
        const element = document.getElementById(word.id);
        if (element) element.remove();
    });
    
    // Reset state
    gameState.score = 0;
    gameState.combo = 1;
    gameState.wordsTyped = 0;
    gameState.fallingWords = [];
    gameState.gameStartTime = Date.now();
    gameState.isGameActive = true;
    
    // Update UI
    updateScore();
    updateCombo();
    updateProgress();
    
    // Clear and reset input
    const input = document.getElementById('word-input');
    input.value = '';
    input.focus();
    
    // Restart spawning
    restartSpawnInterval();
}

function startSpawning() {
    spawnInterval = setInterval(() => {
        if (gameState.wordsTyped < gameState.maxWords && gameState.isGameActive) {
            spawnWord();
        } else if (gameState.wordsTyped >= gameState.maxWords) {
            endGame();
        }
    }, gameState.settings.spawnRate * 1000);
}

function restartSpawnInterval() {
    if (spawnInterval) {
        clearInterval(spawnInterval);
    }
    startSpawning();
}

function endGame() {
    gameState.isGameActive = false;
    clearInterval(spawnInterval);
    
    // Stop falling words
    gameState.fallingWords.forEach(word => {
        if (word.animationId) {
            cancelAnimationFrame(word.animationId);
        }
    });
    
    alert(`Partie terminée!\nScore final: ${gameState.score}\nMots tapés: ${gameState.wordsTyped}/${gameState.maxWords}`);
}

// === WORD SPAWNING ===
function spawnWord() {
    const word = getRandomWord();
    const wordId = `word-${Date.now()}-${Math.random()}`;
    
    const wordObj = {
        id: wordId,
        text: word,
        x: Math.random() * (window.innerWidth - 200) + 50,
        y: 120,
        speed: (gameState.settings.speed / 5) * (0.5 + Math.random() * 0.5),
        element: null,
        animationId: null
    };
    
    // Create DOM element
    const wordElement = document.createElement('div');
    wordElement.id = wordId;
    wordElement.className = 'falling-word';
    wordElement.textContent = word;
    wordElement.style.left = wordObj.x + 'px';
    wordElement.style.top = wordObj.y + 'px';
    
    document.getElementById('word-zone').appendChild(wordElement);
    wordObj.element = wordElement;
    
    gameState.fallingWords.push(wordObj);
    animateWord(wordObj);
}

function getRandomWord() {
    const filteredWords = wordsList.filter(
        word => word.length <= gameState.settings.maxLength
    );
        
    const randomIndex = Math.floor(Math.random() * filteredWords.length);
    return filteredWords[randomIndex];
}
// -------------------------------------------------------------------------------------------------------------------------------------
// === WORD ANIMATION ===
function animateWord(wordObj) {
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
            removeWord(wordObj.id, false);
            gameState.combo = 1;
            updateCombo();
            return;
        }
        
        wordObj.animationId = requestAnimationFrame(animate);
    };
    
    animate();
}
// -------------------------------------------------------------------------------------------------------------------------------------

// === INPUT HANDLING ===
function setupInputListener() {
    const input = document.getElementById('word-input');
    
    input.addEventListener('input', (e) => {
        const typedWord = e.target.value.trim().toLowerCase();
        
        if (typedWord === '') return;
        
        // Check if word matches any falling word
        const matchedWord = gameState.fallingWords.find(
            word => word.text.toLowerCase() === typedWord
        );
        
        if (matchedWord) {
            // Word matched!
            handleWordMatch(matchedWord);
            input.value = '';
        }
    });
}

// === WORD MATCH ===
function handleWordMatch(wordObj) {
    const element = wordObj.element;
    
    // Visual feedback
    element.classList.add('matched');
    
    // Calculate score
    const baseScore = wordObj.text.length * 3;
    const scoreWithCombo = baseScore * gameState.combo;
    gameState.score += scoreWithCombo;
    
    // -------------------------------------------------------------------------------------------------------------------------------------
    // Show score popup
    showScorePopup(scoreWithCombo, wordObj.x, wordObj.y);
    
    // Create particles
    createParticles(wordObj.x + element.offsetWidth / 2, wordObj.y + element.offsetHeight / 2);
    // -------------------------------------------------------------------------------------------------------------------------------------

    // Update combo
    gameState.combo = Math.min(gameState.combo + 0.5, 5);
    updateCombo();
    
    // Update stats
    gameState.wordsTyped++;
    updateScore();
    updateProgress();
    
    // Remove word with animation
    setTimeout(() => {
        element.classList.add('destroying');
        setTimeout(() => removeWord(wordObj.id, true), 500);
    }, 100);
}

// === UI UPDATES ===
function updateScore() {
    document.getElementById('score').textContent = Math.floor(gameState.score);
}

function updateCombo() {
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

function updateProgress() {
    const percentage = (gameState.wordsTyped / gameState.maxWords) * 100;
    document.getElementById('progress-bar').style.width = percentage + '%';
    document.getElementById('progress-text').textContent = 
        `${gameState.wordsTyped}/${gameState.maxWords} mots`;
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

// === SCORE POPUP ===
function showScorePopup(score, x, y) {
    const popup = document.createElement('div');
    popup.className = 'score-popup';
    popup.textContent = `+${Math.floor(score)}`;
    popup.style.left = x + 'px';
    popup.style.top = y + 'px';
    
    document.getElementById('word-zone').appendChild(popup);
    
    setTimeout(() => popup.remove(), 1000);
}

// === PARTICLES ===
// -------------------------------------------------------------------------------------------------------------------------------------
function createParticles(x, y) {
    const colors = ['#667eea', '#764ba2', '#ffd700', '#ffffff'];
    
    for (let i = 0; i < 15; i++) {
        particles.push({
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 8,
            vy: (Math.random() - 0.5) * 8,
            radius: Math.random() * 4 + 2,
            color: colors[Math.floor(Math.random() * colors.length)],
            alpha: 1,
            decay: Math.random() * 0.02 + 0.01
        });
    }
}

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Background ambient particles
    if (Math.random() < 0.05) {
        particles.push({
            x: Math.random() * canvas.width,
            y: -10,
            vx: (Math.random() - 0.5) * 0.5,
            vy: Math.random() * 2 + 1,
            radius: Math.random() * 2 + 1,
            color: 'rgba(255, 255, 255, 0.5)',
            alpha: Math.random() * 0.5,
            decay: 0.005
        });
    }
    
    // Update and draw particles
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.1; // Gravity
        p.alpha -= p.decay;
        
        if (p.alpha <= 0 || p.y > canvas.height) {
            particles.splice(i, 1);
            continue;
        }
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color.includes('rgba') 
            ? p.color 
            : `rgba(${hexToRgb(p.color)}, ${p.alpha})`;
        ctx.fill();
    }
    
    requestAnimationFrame(animateParticles);
}
// -------------------------------------------------------------------------------------------------------------------------------------

// === UTILITIES ===
function removeWord(wordId, wasTyped) {
    const index = gameState.fallingWords.findIndex(w => w.id === wordId);    
    const wordObj = gameState.fallingWords[index];
    
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

// -------------------------------------------------------------------------------------------------------------------------------------
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result 
        ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
        : '0, 0, 0';
}
// -------------------------------------------------------------------------------------------------------------------------------------