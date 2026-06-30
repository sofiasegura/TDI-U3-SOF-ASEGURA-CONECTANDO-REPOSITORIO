
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

const DURACION_COMODIN = 10000;
// Sound Synthesizer Engine (Web Audio API)
const SoundEngine = {
    ctx: null,
    init() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
    },
    playClick() {
        this.init();
        if (this.ctx.state === 'suspended') this.ctx.resume();
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(150, this.ctx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.15);
    },
    playDblClick() {
        this.init();
        if (this.ctx.state === 'suspended') this.ctx.resume();
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.type = 'sawtooth';
        
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(600, this.ctx.currentTime);
        osc.disconnect(gain);
        osc.connect(filter);
        filter.connect(gain);
        osc.frequency.setValueAtTime(250, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(70, this.ctx.currentTime + 0.5);
        gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.5);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.5);
    },
    playSpace() {
        this.init();
        if (this.ctx.state === 'suspended') this.ctx.resume();
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const mod = this.ctx.createOscillator();
        const modGain = this.ctx.createGain();
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        mod.connect(modGain);
        modGain.connect(osc.frequency);
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(150, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(500, this.ctx.currentTime + 0.7);
        mod.frequency.setValueAtTime(30, this.ctx.currentTime);
        modGain.gain.setValueAtTime(40, this.ctx.currentTime);
        gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.7);
        
        osc.start();
        mod.start();
        osc.stop(this.ctx.currentTime + 0.7);
        mod.stop(this.ctx.currentTime + 0.7);
    },
    playEnter() {
        this.init();
        if (this.ctx.state === 'suspended') this.ctx.resume();
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(200, this.ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(800, this.ctx.currentTime + 0.35);
        gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.4);
        
        osc.start();
        osc.stop(this.ctx.currentTime + 0.4);
    },
    playSuccess() {
        this.init();
        if (this.ctx.state === 'suspended') this.ctx.resume();
        const now = this.ctx.currentTime;
        const playTone = (freq, start, duration) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.frequency.setValueAtTime(freq, start);
            gain.gain.setValueAtTime(0.08, start);
            gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
            osc.start(start);
            osc.stop(start + duration);
        };
        playTone(523.25, now, 0.12); // C5
        playTone(659.25, now + 0.08, 0.12); // E5
        playTone(783.99, now + 0.16, 0.3); // G5
    }
};
// Wildcards States
let escudoActivo = false;
let escudoHasta = 0;



let congeladoGlobal = false;



let colorCongelado = null;
// Helper to cancel blocking & freezing
function resetearComodines() {
    colorCongelado = null;
    congeladoGlobal = false;
}
// Intro and Onboarding States
let introActiva = true;
let introStartTime = Date.now();
const INTRO_DURATION = 3500; // 3.5 seconds total
const FADE_DURATION = 1500;  // Fades out in the last 1.5 seconds
let tutorialStep = 1; // 1: Click, 2: Doble click, 3: Espacio, 4: Enter, 5: Completado
let tutorialOpen = true;
const companionHUD = document.getElementById("companion-hud");
const referenceHUD = document.getElementById("reference-hud");
// Interactive auto-hide states for reference HUD (legend)
let referenceHUDActive = false; 
let referenceHUDTimeout = null;
function mostrarReferenciaHUD() {
    if (!referenceHUDActive) return;
    referenceHUD.classList.remove("hidden-instant");
    referenceHUD.classList.remove("hidden");
    clearTimeout(referenceHUDTimeout);
    referenceHUDTimeout = setTimeout(() => {
        referenceHUD.classList.add("hidden");
    }, 10000); // Fades out after 10 seconds of inactivity
}
const hudHotspots = document.querySelectorAll(".hud-hotspot");
hudHotspots.forEach(hotspot => {
    hotspot.addEventListener("mouseenter", mostrarReferenciaHUD);
    hotspot.addEventListener("mousemove", mostrarReferenciaHUD);
    hotspot.addEventListener("touchstart", (e) => {
        e.stopPropagation();
        mostrarReferenciaHUD();
    });
});
// SVG Vector templates for companion HUD
const HUD_ICONS = {
    mouseClick: `<svg class="svg-mouse animate-click" viewBox="0 0 24 36" width="30" height="45">
        <rect x="2" y="2" width="20" height="32" rx="10" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="2"/>
        <path class="mouse-wheel" d="M12 8 L12 12" stroke="rgba(255,255,255,0.6)" stroke-width="2" stroke-linecap="round"/>
        <path class="mouse-line" d="M12 2 L12 14 M2 14 L22 14" stroke="rgba(255,255,255,0.4)" stroke-width="1.5"/>
        <rect class="click-left" x="2" y="2" width="10" height="12" rx="10" fill="var(--pink)" opacity="0"/>
    </svg>`,
    mouseDblClick: `<svg class="svg-mouse animate-dblclick" viewBox="0 0 24 36" width="30" height="45">
        <rect x="2" y="2" width="20" height="32" rx="10" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="2"/>
        <path class="mouse-wheel" d="M12 8 L12 12" stroke="rgba(255,255,255,0.6)" stroke-width="2" stroke-linecap="round"/>
        <path class="mouse-line" d="M12 2 L12 14 M2 14 L22 14" stroke="rgba(255,255,255,0.4)" stroke-width="1.5"/>
        <rect class="click-left" x="2" y="2" width="10" height="12" rx="10" fill="var(--blue)" opacity="0"/>
    </svg>`,
    spacebar: `<svg class="svg-key animate-space" viewBox="0 0 60 24" width="54" height="22">
        <rect class="key-body" x="2" y="2" width="56" height="20" rx="4" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="2"/>
        <rect class="key-press" x="2" y="2" width="56" height="20" rx="4" fill="var(--yellow)" opacity="0"/>
        <text class="key-text" x="30" y="15" fill="rgba(255,255,255,0.6)" font-size="9" text-anchor="middle" font-family="'Orbitron', sans-serif">ESPACIO</text>
    </svg>`,
    enter: `<svg class="svg-key animate-enter" viewBox="0 0 44 24" width="44" height="24">
        <rect class="key-body" x="2" y="2" width="40" height="20" rx="4" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="2"/>
        <rect class="key-press" x="2" y="2" width="40" height="20" rx="4" fill="white" opacity="0"/>
        <text class="key-text" x="20" y="15" fill="rgba(255,255,255,0.8)" font-size="8" text-anchor="middle" font-family="'Orbitron', sans-serif">ENTER</text>
    </svg>`,
    checkmark: `<svg class="svg-check" viewBox="0 0 24 24" width="44" height="44">
        <circle cx="12" cy="12" r="10" fill="none" stroke="var(--blue)" stroke-width="2" class="check-circle"/>
        <path d="M7 12 L10 15 L17 8" fill="none" stroke="var(--blue)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="check-path"/>
    </svg>`
};
const HUD_STEPS = {
    1: {
        title: "BLOQUEAR COLOR",
        desc: "Haz click en una pieza para bloquear su color indefinidamente.",
        icon: HUD_ICONS.mouseClick,
        titleColor: "var(--pink)"
    },
    2: {
        title: "CONGELAR TABLERO",
        desc: "Haz doble click en el tablero para congelar todos los caminos.",
        icon: HUD_ICONS.mouseDblClick,
        titleColor: "var(--blue)"
    },
    3: {
        title: "ACTIVAR ESCUDO",
        desc: "Presiona la barra Espaciadora para activar el escudo protector (10s).",
        icon: HUD_ICONS.spacebar,
        titleColor: "var(--yellow)"
    },
    4: {
        title: "ROTAR CAMINOS",
        desc: "Presiona la tecla Enter para girar el sentido de los caminos en sentido horario.",
        icon: HUD_ICONS.enter,
        titleColor: "#ffffff"
    },
    5: {
        title: "GUÍA COMPLETADA",
        desc: "¡Exploración libre activa! Si tienes dudas, mueve el cursor a cualquiera de las esquinas para ver el apoyo visual.",
        icon: HUD_ICONS.checkmark,
        titleColor: "var(--blue)"
    }
};
function actualizarHUD() {
    const stepData = HUD_STEPS[tutorialStep];
    if (!stepData) return;
    const titleEl = document.getElementById("hud-action-title");
    const descEl = document.getElementById("hud-action-desc");
    const iconContainer = document.getElementById("hud-icon-container");
    // Update texts with glow effects
    titleEl.textContent = stepData.title;
    titleEl.style.color = stepData.titleColor;
    titleEl.style.textShadow = `0 0 10px ${stepData.titleColor}`;
    descEl.textContent = stepData.desc;
    // Render animated SVG
    iconContainer.innerHTML = stepData.icon;
    // Update step indicator dots
    document.querySelectorAll(".hud-dot").forEach(dot => {
        const dotStep = parseInt(dot.getAttribute("data-step"));
        dot.className = "hud-dot";
        if (dotStep === tutorialStep) {
            dot.classList.add("active");
        } else if (dotStep < tutorialStep) {
            dot.classList.add("completed");
        }
    });
}
function avanzarTutorial() {
    SoundEngine.playSuccess();
    
    // Add success feedback flash to HUD card
    const hud = document.getElementById("companion-hud");
    hud.style.boxShadow = `0 0 35px var(--yellow)`;
    setTimeout(() => {
        hud.style.boxShadow = `0 0 30px rgba(0, 0, 0, 0.8), 0 0 20px var(--neon-glow)`;
    }, 400);
    if (tutorialStep < 5) {
        tutorialStep++;
        actualizarHUD();
        if (tutorialStep === 5) {
            // Completed state! Show reference HUD at the end of the tutorial so it doesn't obstruct target squares
            referenceHUDActive = true;
            mostrarReferenciaHUD();
            
            // Fade out companion HUD card after a few seconds
            setTimeout(() => {
                hud.classList.add("hidden");
                tutorialOpen = false;
            }, 4500);
        }
    }
}
// Function to update visual indicators on the reference HUD
function actualizarReferenciaVisual(accion, activa) {
    const item = document.getElementById(`ref-${accion}`);
    if (!item) return;
    if (activa) {
        item.classList.add(`active-${accion}`);
    } else {
        item.classList.remove(`active-${accion}`);
    }
}
// Keyboard Controls: Space for Shield, Enter for Clockwise Rotation
window.addEventListener("keydown", e => {
    if (introActiva) return;
    // Space: Shield Wildcard (10 seconds) - handles all browser codes for Spacebar
    if (e.code === "Space" || e.key === " " || e.keyCode === 32) {
        e.preventDefault(); // Prevent standard browser scroll behavior on Space
        resetearComodines();
        const now = Date.now();
        escudoActivo = true;
        escudoHasta = now + DURACION_COMODIN;
        
        SoundEngine.playSpace();
        
        if (tutorialOpen && tutorialStep === 3) {
            avanzarTutorial();
        }
    }
    // Enter: Clockwise Rotation Wildcard
    if (e.code === "Enter" || e.code === "NumpadEnter") {
        resetearComodines();
        
        // Rotate all pieces clockwise without shifting coordinates to avoid teleporting
        piezas.forEach(p => {
            // 1. Shift target corner index clockwise (TL -> TR -> BR -> BL -> TL)
            p.destinoIndex = (p.destinoIndex + 1) % esquinas.length;
            const destino = esquinas[p.destinoIndex];
            p.colorFinal = destino.color;
            // 2. Recalculate velocity vector towards the new corner from center, adding a 1.25x speed boost to make turns responsive
            const velocidad = Math.min(15, Math.hypot(p.vx, p.vy) * 1.25);
            const esquinaX = destino.x * canvas.width / 2;
            const esquinaY = destino.y * canvas.height / 2;
            const angulo = Math.atan2(esquinaY, esquinaX);
            p.vx = Math.cos(angulo) * velocidad;
            p.vy = Math.sin(angulo) * velocidad;
            // 3. Rotate individual shape orientation clockwise
            p.rotacion = (p.rotacion + 1) % 4;
        });
        SoundEngine.playEnter();
        
        // Visual flash feedback on the Enter HUD reference item
        const refEnter = document.getElementById("ref-enter");
        if (refEnter) {
            refEnter.classList.add("active-rotate");
            setTimeout(() => {
                refEnter.classList.remove("active-rotate");
            }, 250);
        }
        if (tutorialOpen && tutorialStep === 4) {
            avanzarTutorial();
        }
    }
});
// Click to freeze a single color (Blocks color of closest piece clicked)
canvas.addEventListener("click", e => {
    window.focus(); // Force keyboard focus onto the window so space/enter work immediately
    if (introActiva) return;
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
        resetearComodines();
        colorCongelado = masCercana.colorFinal;
        
        SoundEngine.playClick();
        if (tutorialOpen && tutorialStep === 1) {
            avanzarTutorial();
        }
    }
});
// Double click to freeze all paths
canvas.addEventListener("dblclick", () => {
    window.focus();
    if (introActiva) return;
    resetearComodines();
    congeladoGlobal = true;
    
    SoundEngine.playDblClick();
    if (tutorialOpen && tutorialStep === 2) {
        avanzarTutorial();
    }
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
    // Adjusted base speed to 0.7 - 1.2 for a very slow and controlled movement
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
// Initialize starting pieces (reduced from 120 to 70 for performance; speed offsets density)
for (let i = 0; i < 70; i++) {
    crearPieza();
}
function dibujarPieza(px, py, p, color, opacity = 1) {
    const forma = shapes[p.tipo];
    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.strokeStyle = color;

    
    // Only use expensive browser shadowBlur when shield is active to keep rendering high performance
    if (escudoActivo && Date.now() < escudoHasta) {
        ctx.shadowColor = color;
        ctx.shadowBlur = 15;

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
        const baseLineWidth = Math.min(4, 0.5 + distancia * 0.004);
        // Draw glowing outline (simulated glow with double-stroke) when shield is not active
        if (!(escudoActivo && Date.now() < escudoHasta)) {
            ctx.lineWidth = baseLineWidth * 2.5;
            ctx.strokeStyle = color;
            ctx.globalAlpha = opacity * 0.25;
            ctx.strokeRect(
                px + x * p.tam,
                py + y * p.tam,
                p.tam,
                p.tam
            );
        }
        // Draw main sharp neon line
        ctx.lineWidth = baseLineWidth;
        ctx.strokeStyle = color;
        ctx.globalAlpha = opacity;
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
    // Adjusted base speed to 0.7 - 1.2 for a very slow and controlled movement
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
    // Active Wildcard statuses (no expiration for block and freeze)
    const isGlobalFrozen = congeladoGlobal;
    
    // Let pieces move at normal speed during active tasks, but slow down during intro
    const speedMultiplier = introActiva ? 0.25 : 1.0;
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
        // Piece movement updates (no expiration for block)
        const isColorFrozen = colorCongelado !== null && p.colorFinal === colorCongelado;
        if (!isGlobalFrozen && !isColorFrozen) {
            const dist = Math.sqrt(p.x * p.x + p.y * p.y);
            // Accelerate dynamically based on distance from center for a premium hyperdrive effect (very gently scaled down)
            const accel = 1.0 + (dist / 200) * 0.4;
            p.x += p.vx * speedMultiplier * accel;
            p.y += p.vy * speedMultiplier * accel;
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
    // Handle dynamically creating pieces if count goes down (reduced max pieces to 90 for performance)
    if (piezas.length < 90 && Math.random() < 0.1) {
        crearPieza();
    }
    ctx.restore();
    // D. Update reference HUD active styles
    if (!introActiva) {
        actualizarReferenciaVisual("click", colorCongelado !== null);
        actualizarReferenciaVisual("dblclick", congeladoGlobal);
        actualizarReferenciaVisual("space", escudoActivo && now < escudoHasta);
    }
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
            // Reveal companion HUD once intro is fully complete (reference HUD stays hidden until tutorial step 5 to avoid obstruction)
            companionHUD.classList.remove("hidden-instant");
            companionHUD.classList.remove("hidden");
            actualizarHUD();
        }
    }
    if (introOpacity > 0) {
        // Draw black background overlay
        ctx.fillStyle = `rgba(0, 0, 0, ${introOpacity})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        // Draw HUD-style centered glowing "CONECTANDO" text using Orbitron
        ctx.save();
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        
        // Title (Orbitron)
        ctx.font = "900 60px 'Orbitron', sans-serif";
        ctx.shadowColor = BLUE;
        ctx.shadowBlur = 25;
        ctx.fillStyle = `rgba(255, 255, 255, ${introOpacity})`;
        ctx.fillText("CONECTANDO", canvas.width / 2, canvas.height / 2);
        
        ctx.restore();
    }
    requestAnimationFrame(animar);
}
// Pre-initialize and resume AudioContext on first user interaction to eliminate latency
const initAudio = () => {
    SoundEngine.init();
    if (SoundEngine.ctx && SoundEngine.ctx.state === 'suspended') {
        SoundEngine.ctx.resume();
    }
    // Remove listeners
    window.removeEventListener('click', initAudio);
    window.removeEventListener('dblclick', initAudio);
    window.removeEventListener('keydown', initAudio);
    window.removeEventListener('touchstart', initAudio);
};
window.addEventListener('click', initAudio, { once: true });
window.addEventListener('dblclick', initAudio, { once: true });
window.addEventListener('keydown', initAudio, { once: true });
window.addEventListener('touchstart', initAudio, { once: true });
// Wait for fonts to load before starting animation loop
document.fonts.ready.then(() => {
    animar();


});

