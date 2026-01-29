const particles = [];
let ctx, canvas;

canvas = document.getElementById('particles');
if (canvas)
    ctx = canvas.getContext('2d');

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



export default { createParticles, animateParticles};