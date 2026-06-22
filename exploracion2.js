const canvas = document.getElementById("universo");
const ctx = canvas.getContext("2d");

function resize(){

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

}

resize();

window.addEventListener("resize", resize);
// Colors
const YELLOW = "#E0D033";
const PINK = "#D2247C";
const BLUE = "#009BDD";
// Clockwise Corners Configuration
const esquinas = [
    { x: -1, y: -1, color: BLUE }, // Top-Left (index 0)
    { x: 1, y: -1, color: PINK },  // Top-Right (index 1)
    { x: 1, y: 1, color: BLUE },   // Bottom-Right (index 2)
    { x: -1, y: 1, color: PINK }   // Bottom-Left (index 3)
];
// Wildcards States & Timers (Duration changed to 10 seconds / 10000ms)
const DURACION_COMODIN = 10000;
let escudoActivo = false;
let escudoHasta = 0;



let congeladoGlobal = false;
let congeladoGlobalHasta = 0;

let colorCongelado = null;
let colorCongeladoHasta = 0;
// Intro and Onboarding States
let introActiva = true;
let introStartTime = Date.now();
const INTRO_DURATION = 3500; // 3.5 seconds total
const FADE_DURATION = 1500;  // Fades out in the last 1.5 seconds
let tutorialOpen = true;
const startBtn = document.getElementById("start-btn");
const tutorialOverlay = document.getElementById("tutorial-overlay");
startBtn.addEventListener("click", () => {
    tutorialOpen = false;
    tutorialOverlay.classList.add("hidden");
});
// Keyboard Controls: Space for Shield, Enter for Clockwise Rotation
window.addEventListener("keydown", e => {
    if (tutorialOpen || introActiva) return;
    // Space: Shield Wildcard (10 seconds)
    if (e.code === "Space") {
        const now = Date.now();
        if (!escudoActivo || now > escudoHasta) {
            escudoActivo = true;
            escudoHasta = now + DURACION_COMODIN;
        }
    }
    // Enter: Clockwise Rotation Wildcard
    if (e.code === "Enter" || e.code === "NumpadEnter") {
        // Rotate all pieces clockwise without shifting coordinates to avoid teleporting
        piezas.forEach(p => {
            // 1. Shift target corner index clockwise (TL -> TR -> BR -> BL -> TL)
            p.destinoIndex = (p.destinoIndex + 1) % esquinas.length;
            const destino = esquinas[p.destinoIndex];
            p.colorFinal = destino.color;
            // 2. Recalculate velocity vector towards the new corner from center, preserving speed
            const velocidad = Math.hypot(p.vx, p.vy);
            const esquinaX = destino.x * canvas.width / 2;
            const esquinaY = destino.y * canvas.height / 2;
            const angulo = Math.atan2(esquinaY, esquinaX);
            p.vx = Math.cos(angulo) * velocidad;
            p.vy = Math.sin(angulo) * velocidad;
            // 3. Rotate individual shape orientation clockwise
            p.rotacion = (p.rotacion + 1) % 4;
        });
    }
});
// Click to freeze a single color (Blocks color of closest piece clicked)
canvas.addEventListener("click", e => {
    if (tutorialOpen || introActiva) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left - canvas.width / 2;
    const my = e.clientY - rect.top - canvas.height / 2;
    let masCercana = null;
    let menor = Infinity;
    piezas.forEach(p => {
        const d = Math.hypot(p.x - mx, p.y - my);
        if (d < menor) {
            menor = d;
            masCercana = p;

        }

    });
    if (masCercana && menor < 80) { // Limit distance to make clicks intuitive
        colorCongelado = masCercana.colorFinal;
        colorCongeladoHasta = Date.now() + DURACION_COMODIN;
    }

});
// Double click to freeze all paths
canvas.addEventListener("dblclick", () => {
    if (tutorialOpen || introActiva) return;
    congeladoGlobal = true;
    congeladoGlobalHasta = Date.now() + DURACION_COMODIN;
});
// Tetris shapes definition
const shapes = {
    I: [
        [0, 0],
        [0, 1],
        [0, 2],
        [0, 3]
    ],
    L: [
        [0, 0],
        [0, 1],
        [0, 2],
        [1, 2]
    ],
    T: [
        [0, 0],
        [1, 0],
        [2, 0],
        [1, 1]
    ]

};
// Pieces array
const piezas = [];
function crearPieza() {
    const destinoIndex = Math.floor(Math.random() * esquinas.length);
    const destino = esquinas[destinoIndex];
    const velocidad = 0.7 + Math.random() * 0.5;
    const esquinaX = destino.x * canvas.width / 2;
    const esquinaY = destino.y * canvas.height / 2;
    const angulo = Math.atan2(esquinaY, esquinaX);
    piezas.push({
        permanente: Math.random() < 0.3,
        x: (Math.random() - 0.5) * 120,
        y: (Math.random() - 0.5) * 120,
        vx: Math.cos(angulo) * velocidad,
        vy: Math.sin(angulo) * velocidad,
        destinoIndex: destinoIndex,
        colorFinal: destino.color,
        edad: 0,
        tipo: ["I", "L", "T"][Math.floor(Math.random() * 3)],
        rotacion: Math.floor(Math.random() * 4),
        tam: 12,
        wobbleX: 0,
        wobbleY: 0,
        delay: Math.floor(Math.random() * 300)
    });
}
// Initialize starting pieces
for (let i = 0; i < 120; i++) {
    crearPieza();
}
function dibujarPieza(px, py, p, color, opacity = 1) {
    const forma = shapes[p.tipo];
    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.strokeStyle = color;
    ctx.shadowColor = color;
    
    // Add glowing shadows to create futuristic neon feel
    if (escudoActivo && Date.now() < escudoHasta) {
        ctx.shadowBlur = 15;
    } else {
        ctx.shadowBlur = 3;
    }
    forma.forEach(celda => {
        let x = celda[0];
        let y = celda[1];
        // Apply orientation rotation
        for (let r = 0; r < p.rotacion; r++) {
            const temp = x;

            x = -y;
            y = temp;

        }
        const distancia = Math.sqrt(p.x * p.x + p.y * p.y);
        ctx.lineWidth = Math.min(4, 0.5 + distancia * 0.004);
        ctx.strokeRect(
            px + x * p.tam,
            py + y * p.tam,
            p.tam,
            p.tam

        );

    });
    ctx.restore();
}
// Color mixing for center-to-corner color transition
function mezclarColor(c1, c2, t) {
    const r1 = parseInt(c1.substr(1, 2), 16);
    const g1 = parseInt(c1.substr(3, 2), 16);
    const b1 = parseInt(c1.substr(5, 2), 16);
    const r2 = parseInt(c2.substr(1, 2), 16);
    const g2 = parseInt(c2.substr(3, 2), 16);
    const b2 = parseInt(c2.substr(5, 2), 16);
    const r = Math.round(r1 + (r2 - r1) * t);
    const g = Math.round(g1 + (g2 - g1) * t);
    const b = Math.round(b1 + (b2 - b1) * t);
    return `rgb(${r},${g},${b})`;
}
function obtenerColor(p) {
    if (escudoActivo && Date.now() < escudoHasta) {
        return YELLOW;
    }
    const distancia = Math.sqrt(p.x * p.x + p.y * p.y);
    const radioMax = Math.max(canvas.width, canvas.height) * 0.3;
    const t = Math.pow(Math.min(1, distancia / radioMax), 4);
    return mezclarColor(YELLOW, p.colorFinal, t);
}
function reiniciarPieza(p) {
    const destinoIndex = Math.floor(Math.random() * esquinas.length);
    const destino = esquinas[destinoIndex];
    const velocidad = 0.7 + Math.random() * 0.5;
    const esquinaX = destino.x * canvas.width / 2;
    const esquinaY = destino.y * canvas.height / 2;
    const angulo = Math.atan2(esquinaY, esquinaX);
    p.x = (Math.random() - 0.5) * 120;
    p.y = (Math.random() - 0.5) * 120;
    p.vx = Math.cos(angulo) * velocidad;
    p.vy = Math.sin(angulo) * velocidad;
    p.destinoIndex = destinoIndex;
    p.colorFinal = destino.color;

    p.edad = 0;
    p.rotacion = Math.floor(Math.random() * 4);
    p.tipo = ["I", "L", "T"][Math.floor(Math.random() * 3)];
}
// Animation loop
function animar() {
    // Clear whole canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const now = Date.now();
    // 1. Draw and update pieces in background translated to center
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    // Active Wildcard statuses
    const isGlobalFrozen = congeladoGlobal && now < congeladoGlobalHasta;
    
    // Slow down movement slightly while tutorial modal is overlaying
    const speedMultiplier = tutorialOpen ? 0.25 : 1.0;
    // A. Draw white square target checkpoints in corners
    const sqSize = 80;
    ctx.save();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.7)";
    ctx.fillStyle = "rgba(255, 255, 255, 0.04)";
    ctx.lineWidth = 2.5;
    ctx.shadowColor = "white";
    ctx.shadowBlur = 10;
    // TL
    ctx.fillRect(-canvas.width/2 + 25, -canvas.height/2 + 25, sqSize, sqSize);
    ctx.strokeRect(-canvas.width/2 + 25, -canvas.height/2 + 25, sqSize, sqSize);
    // TR
    ctx.fillRect(canvas.width/2 - 25 - sqSize, -canvas.height/2 + 25, sqSize, sqSize);
    ctx.strokeRect(canvas.width/2 - 25 - sqSize, -canvas.height/2 + 25, sqSize, sqSize);
    // BR
    ctx.fillRect(canvas.width/2 - 25 - sqSize, canvas.height/2 - 25 - sqSize, sqSize, sqSize);
    ctx.strokeRect(canvas.width/2 - 25 - sqSize, canvas.height/2 - 25 - sqSize, sqSize, sqSize);
    // BL
    ctx.fillRect(-canvas.width/2 + 25, canvas.height/2 - 25 - sqSize, sqSize, sqSize);
    ctx.strokeRect(-canvas.width/2 + 25, canvas.height/2 - 25 - sqSize, sqSize, sqSize);
    ctx.restore();
    // B. Draw and Update pieces
    piezas.forEach(p => {
        if (p.delay > 0) {
            p.delay--;
            return;
        }
        p.edad++;
        const distancia = Math.sqrt(p.x * p.x + p.y * p.y);
        p.tam = Math.min(16, 6 + distancia * 0.015);
        // Piece movement updates
        const isColorFrozen = colorCongelado && now < colorCongeladoHasta && p.colorFinal === colorCongelado;
        if (!isGlobalFrozen && !isColorFrozen) {
            p.x += p.vx * speedMultiplier;
            p.y += p.vy * speedMultiplier;
        }
        // Wobble/expansion noise
        const apertura = Math.sqrt(p.edad) * 0.04;
        p.x += (Math.random() - 0.5) * apertura * speedMultiplier;
        p.y += (Math.random() - 0.5) * apertura * speedMultiplier;
        p.x += p.wobbleX * speedMultiplier;
        p.y += p.wobbleY * speedMultiplier;
        // C. Fade out pieces approaching corners
        const destino = esquinas[p.destinoIndex];
        const destX = destino.x * canvas.width / 2;
        const destY = destino.y * canvas.height / 2;
        const distAlDestino = Math.hypot(p.x - destX, p.y - destY);
        let alpha = 1;
        // Fade out progressively as pieces approach their target corner (within 220px)
        if (distAlDestino < 220) {
            alpha = Math.max(0, (distAlDestino - 40) / 180);
        }
        const color = obtenerColor(p);
        dibujarPieza(p.x, p.y, p, color, alpha);
        // Reset pieces when they reach deep into target squares or exit bounds
        if (distAlDestino < 45 || Math.abs(p.x) > canvas.width / 2 || Math.abs(p.y) > canvas.height / 2) {
            reiniciarPieza(p);

        }

    });
    // Handle dynamically creating pieces if count goes down
    if (piezas.length < 200 && Math.random() < 0.1) {
        crearPieza();
    }
    ctx.restore();
    // 2. Draw Intro overlay (with smooth fade-out transition)
    const elapsed = now - introStartTime;
    let introOpacity = 0;
    
    if (elapsed < INTRO_DURATION) {
        if (elapsed < INTRO_DURATION - FADE_DURATION) {
            introOpacity = 1;
        } else {
            // Fade-out phase
            introOpacity = 1 - (elapsed - (INTRO_DURATION - FADE_DURATION)) / FADE_DURATION;
        }
    } else {
        if (introActiva) {
            introActiva = false;
            // Reveal tutorial overlay once intro is fully complete
            tutorialOverlay.classList.remove("hidden-instant");
            tutorialOverlay.classList.remove("hidden");
        }
    }
    if (introOpacity > 0) {
        // Draw black background overlay
        ctx.fillStyle = `rgba(0, 0, 0, ${introOpacity})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        // Draw HUD-style centered glowing text
        ctx.save();
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = "bold 80px Oxanium";
        
        // Neo glow shadow
        ctx.shadowColor = BLUE;
        ctx.shadowBlur = 20;
        ctx.fillStyle = `rgba(255, 255, 255, ${introOpacity})`;
        ctx.fillText("CONECTANDO", canvas.width / 2, canvas.height / 2);
        
        ctx.restore();
    }
    requestAnimationFrame(animar);

}
// Wait for fonts to load before starting animation loop
document.fonts.ready.then(() => {
    animar();

});
