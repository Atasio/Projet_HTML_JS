import { io_client } from "./io_client.js";
import settings from "./settings.js";

// === EVENT LISTENERS ===
const solo = document.getElementById('solo-btn');
const join_room = document.getElementById('join-room-btn');
const create_room = document.getElementById('create-room-btn');

join_room.addEventListener('click', () => {
    showRoomCodeDialog();
});

create_room.addEventListener('click', () => {
    io_client.sendCreateRoom()
    settings.sendSettingsToServer()
    window.location.href = '../game.html';
});

solo.addEventListener('click', () => {
    io_client.sendCreateRoom() // A laisser si on veut que le solo passe par une room
    settings.sendSettingsToServer()
    window.location.href = '../game.html';
});

// === CANVAS & PARTICLES ===
const particles = [];
let canvas, ctx;

// === INITIALIZATION ===
window.onload = function() {
    initCanvas();
    animateParticles();
    createAmbientParticles();
    //Si déjà en jeu, prévenir le serveur que le joueur est dans le menu -> se déconecté de la game
    io_client.sendLeaveRoom();
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

// === AMBIENT PARTICLES ===
function createAmbientParticles() {
    // Create initial batch of particles
    for (let i = 0; i < 50; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.5,
            vy: Math.random() * 2 + 0.5,
            radius: Math.random() * 3 + 1,
            color: 'rgba(255, 255, 255, 0.6)',
            alpha: Math.random() * 0.5 + 0.3,
            decay: 0.002
        });
    }
}

// === PARTICLE ANIMATION ===
function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Spawn new particles at top
    if (Math.random() < 0.1) {
        particles.push({
            x: Math.random() * canvas.width,
            y: -10,
            vx: (Math.random() - 0.5) * 0.5,
            vy: Math.random() * 2 + 1,
            radius: Math.random() * 3 + 1,
            color: Math.random() < 0.1 ? 'rgba(255, 215, 0, 0.6)' : 'rgba(255, 255, 255, 0.6)',
            alpha: Math.random() * 0.5 + 0.3,
            decay: 0.002
        });
    }
    
    // Update and draw particles
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= p.decay;
        
        // Remove particles that are off screen or faded
        if (p.alpha <= 0 || p.y > canvas.height + 10) {
            particles.splice(i, 1);
            continue;
        }
        
        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        
        const rgba = p.color.replace('0.6', p.alpha.toString());
        ctx.fillStyle = rgba;
        ctx.fill();
        
        // Add glow effect for some particles
        if (p.color.includes('255, 215, 0')) {
            ctx.shadowBlur = 10;
            ctx.shadowColor = 'rgba(255, 215, 0, 0.5)';
        } else {
            ctx.shadowBlur = 5;
            ctx.shadowColor = 'rgba(255, 255, 255, 0.3)';
        }
    }
    
    ctx.shadowBlur = 0;
    requestAnimationFrame(animateParticles);
}

// === BUTTON CLICK EFFECTS ===
document.querySelectorAll('.menu-btn').forEach(button => {
    button.addEventListener('click', function(e) {
        // Create particles at button position
        const rect = button.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        for (let i = 0; i < 20; i++) {
            particles.push({
                x: centerX,
                y: centerY,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8 - 2,
                radius: Math.random() * 4 + 2,
                color: 'rgba(255, 215, 0, 0.8)',
                alpha: 1,
                decay: 0.02
            });
        }
    });
});

function showRoomCodeDialog() {
    // Créer l'overlay
    const overlay = document.createElement('div');
    overlay.id = 'dialog-overlay';
    overlay.innerHTML = `
        <div class="dialog-box">
            <h2 class="dialog-title">Rejoindre une partie</h2>
            <p class="dialog-description">Entrez le code de la room</p>
            <input type="text" id="room-code-input" placeholder="XXXXXXXXXX" maxlength="10">
            <div class="dialog-buttons">
                <button id="dialog-cancel" class="dialog-btn cancel-btn">Annuler</button>
                <button id="dialog-join" class="dialog-btn join-btn">Rejoindre</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(overlay);
    
    // Focus sur l'input
    const input = document.getElementById('room-code-input');
    setTimeout(() => input.focus(), 100);
    
    // Event listeners
    document.getElementById('dialog-cancel').addEventListener('click', closeDialog);
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeDialog();
    });
    
    document.getElementById('dialog-join').addEventListener('click', () => {
        const code = input.value.trim().toUpperCase();
        if (code) {
            io_client.sendJoinRoom(code)
            window.location.href = `game.html?code=${code}`;
        }
    });
    
    // Entrée pour valider
    // input.addEventListener('keypress', (e) => {
    //     if (e.key === 'Enter') {
    //         const code = input.value.trim().toUpperCase();
    //         if (code) {
    //             window.location.href = `room.html?code=${code}`;
    //         }
    //     }
    // });
    
    function closeDialog() {
        overlay.classList.add('fade-out');
        setTimeout(() => overlay.remove(), 300);
    }
}