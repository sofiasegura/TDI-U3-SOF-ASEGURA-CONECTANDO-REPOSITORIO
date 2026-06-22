// --- AUDIO SYNTHESIZER CLASS ---
class SoundSynth {
    constructor() {
        this.ctx = null;
        this.muted = false;
    }
    
    init() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }
    
    playConnect() {
        if (this.muted) return;
        this.init();
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(320, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(640, this.ctx.currentTime + 0.12);

        gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.12);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.12);
    }

    playRotate() {
        if (this.muted) return;
        this.init();
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(220, this.ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(440, this.ctx.currentTime + 0.5);
        osc.frequency.linearRampToValueAtTime(180, this.ctx.currentTime + 1.0);

        gain.gain.setValueAtTime(0.001, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.08, this.ctx.currentTime + 0.2);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 1.0);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + 1.0);
    }

    playVictory() {
        if (this.muted) return;
        this.init();
        
        const now = this.ctx.currentTime;
        const notes = [523.25, 659.25, 783.99, 1046.50];
        const noteDur = 0.12;

        notes.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            
            osc.type = 'square';
            osc.frequency.setValueAtTime(freq, now + idx * noteDur);
            
            gain.gain.setValueAtTime(0.06, now + idx * noteDur);
            gain.gain.exponentialRampToValueAtTime(0.001, now + idx * noteDur + 0.2);
            
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            
            osc.start(now + idx * noteDur);
            osc.stop(now + idx * noteDur + 0.25);
        });

        const finalChord = [523.25, 659.25, 783.99, 1046.50, 1318.51];
        finalChord.forEach(freq => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, now + notes.length * noteDur);
            
            gain.gain.setValueAtTime(0.1, now + notes.length * noteDur);
            gain.gain.exponentialRampToValueAtTime(0.001, now + notes.length * noteDur + 1.2);
            
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            
            osc.start(now + notes.length * noteDur);
            osc.stop(now + notes.length * noteDur + 1.2);
        });
    }

    playDefeat() {
        if (this.muted) return;
        this.init();
        
        const now = this.ctx.currentTime;
        
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc1.type = 'sawtooth';
        osc1.frequency.setValueAtTime(130, now);
        osc1.frequency.linearRampToValueAtTime(55, now + 0.75);
        
        osc2.type = 'sawtooth';
        osc2.frequency.setValueAtTime(133, now); 
        osc2.frequency.linearRampToValueAtTime(57, now + 0.75);
        
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.75);
        
        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc1.start(now);
        osc2.start(now);
        
        osc1.stop(now + 0.75);
        osc2.stop(now + 0.75);
    }
}
// --- SEAMLESS SVG PATHS (80x80 viewBox, connection width 30px, centered at 40) ---
const SVG_SHAPES = {
    T: `<svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,25 h80 v30 h-25 v25 h-30 v-25 h-25 z" stroke="rgba(255,255,255,0.15)" stroke-width="1"/>
        </svg>`,
    L: `<svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
            <path d="M25,80 v-55 h55 v30 h-25 v25 z" stroke="rgba(255,255,255,0.15)" stroke-width="1"/>
        </svg>`,
    I: `<svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
            <path d="M25,0 h30 v80 h-30 z" stroke="rgba(255,255,255,0.15)" stroke-width="1"/>
        </svg>`
};
// --- SIMULATION PATH DATA (SINGLE DISTINCT ROUTE - NO CUTS) ---
const CELESTE_PATHS = [
    // Route 1 (Winding Snake - Down first)
    [
        { id: 'c-snap', shape: 'T', x: 430, y: 360, rot: 0, isInitial: true },  // Snap: connects Right and Bottom
        { id: 'c-p1', shape: 'I', x: 430, y: 440, rot: 0, phase: '4a' },       // connects Top and Bottom
        { id: 'c-p2', shape: 'L', x: 430, y: 520, rot: 180, phase: '4a' },     // connects Top and Left
        { id: 'c-p3', shape: 'I', x: 350, y: 520, rot: 90, phase: '4a' },      // connects Right and Left
        { id: 'c-p4', shape: 'L', x: 270, y: 520, rot: -90, phase: '4a' },     // connects Right and Top
        { id: 'c-p5', shape: 'I', x: 270, y: 440, rot: 0, phase: '4a' },       // connects Bottom and Top
        { id: 'c-p6', shape: 'L', x: 270, y: 360, rot: 90, phase: '4b' },      // connects Bottom and Left
        { id: 'c-p7', shape: 'L', x: 190, y: 360, rot: -90, phase: '4b' },     // connects Right and Top
        { id: 'c-p8', shape: 'I', x: 190, y: 280, rot: 0, phase: '4b' },       // connects Bottom and Top
        { id: 'c-p9', shape: 'L', x: 190, y: 200, rot: 90, phase: '4b' },      // connects Bottom and Left
        { id: 'c-p10', shape: 'L', x: 110, y: 200, rot: -90, phase: '4b' }     // connects Right and Top (Exit Base)
    ]

];
const PINK_PATHS = [
    // Route 1 (Winding Snake - Down first)
    [
        { id: 'p-snap', shape: 'L', x: 690, y: 360, rot: 90, isInitial: true },   // Snap: connects Left and Bottom
        { id: 'p-p1', shape: 'I', x: 690, y: 440, rot: 0, phase: '4a' },        // connects Top and Bottom
        { id: 'p-p2', shape: 'L', x: 690, y: 520, rot: -90, phase: '4a' },       // connects Top and Right
        { id: 'p-p3', shape: 'I', x: 770, y: 520, rot: 90, phase: '4a' },        // connects Left and Right
        { id: 'p-p4', shape: 'L', x: 850, y: 520, rot: 180, phase: '4a' },       // connects Left and Top
        { id: 'p-p5', shape: 'I', x: 850, y: 440, rot: 0, phase: '4a' },        // connects Bottom and Top
        { id: 'p-p6', shape: 'L', x: 850, y: 360, rot: 0, phase: '4b' },         // connects Bottom and Right
        { id: 'p-p7', shape: 'L', x: 930, y: 360, rot: 180, phase: '4b' },       // connects Left and Top
        { id: 'p-p8', shape: 'I', x: 930, y: 280, rot: 0, phase: '4b' },        // connects Bottom and Top
        { id: 'p-p9', shape: 'L', x: 930, y: 200, rot: 0, phase: '4b' },         // connects Bottom and Right
        { id: 'p-p10', shape: 'L', x: 1010, y: 200, rot: 180, phase: '4b' }      // connects Left and Top (Exit Base)
    ]

];
// --- 4 ROUND CYCLES ---
const ROUND_MODES = [
    { id: 1, winner: 'celeste', outcome: 'win', name: 'Victoria Celeste' },
    { id: 2, winner: 'rosa', outcome: 'win', name: 'Victoria Rosa' },
    { id: 3, winner: 'celeste', outcome: 'loss', name: 'Derrota Celeste' },
    { id: 4, winner: 'rosa', outcome: 'loss', name: 'Derrota Rosa' }
];

class GameSimulator {
    constructor() {
        this.synth = new SoundSynth();
        this.state = 0; 
        this.roundIndex = 0; 
        this.pathRouteIndex = 0; // Only 1 route exists in this version
        this.selectedTeam = null; 
        
        // Cache DOM
        this.viewport = document.getElementById('click-detector');
        this.titleOverlay = document.getElementById('title-overlay');
        this.startBlock = document.getElementById('start-block');
        this.exitLeft = document.getElementById('exit-left');
        this.exitRight = document.getElementById('exit-right');
        this.exitLeftSquare = this.exitLeft.querySelector('.exit-white-square');
        this.exitRightSquare = this.exitRight.querySelector('.exit-white-square');
        this.piecesContainer = document.getElementById('pieces-container');
        this.muteBtn = document.getElementById('mute-btn');
        this.soundIcon = document.getElementById('sound-icon');
        
        this.resultOverlay = document.getElementById('result-overlay');
        this.resultTitle = document.getElementById('result-title');
        this.resultSubtitle = document.getElementById('result-subtitle');
        
        this.instructionText = document.getElementById('click-instruction');
        
        this.spawnedPieces = {};
        this.isAnimating = false;

        this.bindEvents();
        this.resizeBoard();
        this.resetUI();
    }

    bindEvents() {
        // Handle all clicks on the viewport
        this.viewport.addEventListener('click', (e) => {
            if (e.target.closest('#mute-btn') || this.isAnimating) return;
            
            // FASE 1: Team Selection Click
            if (this.state === 1 && !this.selectedTeam) {
                const clickedPiece = e.target.closest('.piece');
                if (clickedPiece) {
                    const team = clickedPiece.classList.contains('celeste') ? 'celeste' : 'rosa';
                    this.selectTeam(team);
                }
                return;
            }
            // FASE 4 & 5: Interactive Path Clicking
            if (this.state === 4 || this.state === 5) {
                const clickedPiece = e.target.closest('.piece');
                if (clickedPiece && clickedPiece.classList.contains(this.selectedTeam)) {
                    this.advance();
                }
                return;
            }
            // Other phases: Click anywhere to advance
            this.advance();
        });
        // Toggle mute
        this.muteBtn.addEventListener('click', () => {
            this.synth.muted = !this.synth.muted;
            this.muteBtn.classList.toggle('muted', this.synth.muted);
            if (this.synth.muted) {
                this.soundIcon.innerHTML = `
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                    <line x1="23" y1="9" x2="17" y2="15"></line>
                    <line x1="17" y1="9" x2="23" y2="15"></line>
                `;
            } else {
                this.soundIcon.innerHTML = `
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                `;
                this.synth.init();
            }
        });
        // Resize handler
        window.addEventListener('resize', () => this.resizeBoard());
    }
    // Scale `#game-board` to fit the screen responsive
    resizeBoard() {
        const board = document.getElementById('game-board');
        if (!board) return;

        const w = window.innerWidth;
        const h = window.innerHeight;

        const scaleX = w / 1200;
        const scaleY = h / 800;
        
        const scale = Math.min(scaleX, scaleY) * 0.95; 
        board.style.transform = `scale(${scale})`;
    }

    resetUI() {
        this.piecesContainer.innerHTML = '';
        this.spawnedPieces = {};
        this.startBlock.classList.add('hidden');
        this.exitLeft.classList.add('hidden');
        this.exitRight.classList.add('hidden');
        
        // Remove fall classes to restore positions in the loop
        this.startBlock.classList.remove('fall');
        this.exitLeft.classList.remove('fall');
        this.exitRight.classList.remove('fall');
        
        this.exitLeftSquare.className = 'exit-white-square';
        this.exitRightSquare.className = 'exit-white-square';
        this.titleOverlay.classList.add('hidden');
        this.resultOverlay.className = 'hidden'; 
        
        this.exitLeftSquare.style.transform = 'translateX(-50%) rotate(0deg)';
        this.exitRightSquare.style.transform = 'translateX(-50%) rotate(0deg)';
        
        this.state = 0;
        this.selectedTeam = null;
        this.isAnimating = false;
        
        this.pathRouteIndex = 0; // Always 0 as there is only one route
        
        this.instructionText.textContent = "Selecciona tu equipo (Haz clic en la pieza Celeste o Rosa)";
    }

    advance() {
        this.state++;
        
        // Loop restart
        if (this.state > 6) {
            this.roundIndex = (this.roundIndex + 1) % ROUND_MODES.length; // cycle modes
            this.resetUI();
            this.state = 1;
        }

        switch(this.state) {
            case 1:
                this.phase1InitialPieces();
                break;
            case 2:
                this.phase2TitleAndSlide();
                break;
            case 3:
                this.phase3CentralMerge();
                break;
            case 4:
                this.phase4PathExpansionA();
                break;
            case 5:
                this.phase5PathExpansionB();
                break;
            case 6:
                this.phase6ConnectAndRotate();
                break;
        }
    }
    // Helper to spawn a piece DOM element
    spawnPiece(pData, colorClass, startOffscreen = false) {
        const div = document.createElement('div');
        div.className = `piece ${colorClass} board-element`;
        div.id = pData.id;
        div.innerHTML = SVG_SHAPES[pData.shape];
        
        if (startOffscreen) {
            const angle = Math.random() * Math.PI * 2;
            const dist = 700;
            const offX = Math.cos(angle) * dist + 600;
            const offY = Math.sin(angle) * dist + 400;
            const rotRand = Math.floor(Math.random() * 4) * 90;
            
            div.style.left = `${offX}px`;
            div.style.top = `${offY}px`;
            div.style.transform = `rotate(${rotRand}deg) scale(0.2)`;
            div.style.opacity = '0';
        } else {
            div.style.left = `${pData.x}px`;
            div.style.top = `${pData.y}px`;
            div.style.transform = `rotate(${pData.rot}deg) scale(1)`;
        }

        this.piecesContainer.appendChild(div);
        this.spawnedPieces[pData.id] = div;
        return div;
    }

    // Team Selection handler
    selectTeam(team) {
        this.selectedTeam = team;
        this.synth.playConnect();
        // Highlight selected, fade out other
        const celestePiece = this.spawnedPieces['c-snap'];
        const pinkPiece = this.spawnedPieces['p-snap'];
        // Remove pulsing selectable glow from both pieces immediately
        if (celestePiece) celestePiece.classList.remove('pulse-selectable');
        if (pinkPiece) pinkPiece.classList.remove('pulse-selectable');

        if (team === 'celeste') {
            if (pinkPiece) pinkPiece.style.opacity = '0.2';
        } else {
            if (celestePiece) celestePiece.style.opacity = '0.2';
        }

        this.isAnimating = true;
        // Briefly wait to show selection, then advance to Phase 2
        setTimeout(() => {
            if (pinkPiece) pinkPiece.style.opacity = '1';
            if (celestePiece) celestePiece.style.opacity = '1';
            this.isAnimating = false;
            this.advance();
        }, 800);
    }
    // FASE 1: Corner pieces appear, pulse for selection
    phase1InitialPieces() {
        this.instructionText.textContent = "Selecciona tu equipo (Haz clic en la pieza Celeste o Rosa)";
        // Spawn starting pieces Celeste (T) and Pink (L) in the corners
        const celesteStart = { id: 'c-snap', shape: 'T', x: 50, y: 50, rot: 0 };
        const pinkStart = { id: 'p-snap', shape: 'L', x: 1070, y: 50, rot: 180 };

        const cEl = this.spawnPiece(celesteStart, 'celeste');
        const pEl = this.spawnPiece(pinkStart, 'rosa');

        cEl.classList.add('pulse-selectable');
        pEl.classList.add('pulse-selectable');

        this.synth.playConnect();
    }
    // FASE 2: Title appears, pieces slide down to frame the title (centered above it)
    phase2TitleAndSlide() {
        this.instructionText.textContent = "Cargando introducción... Haz clic para avanzar";

        this.titleOverlay.classList.remove('hidden');

        const cPiece = this.spawnedPieces['c-snap'];
        const pPiece = this.spawnedPieces['p-snap'];

        if (cPiece && pPiece) {
            cPiece.style.left = '430px';
            cPiece.style.top = '280px';
            cPiece.style.transform = 'rotate(0deg)';

            pPiece.style.left = '690px';
            pPiece.style.top = '280px';
            pPiece.style.transform = 'rotate(180deg)';
        }

        this.synth.playConnect();
    }
    // FASE 3: Central merge, Title disappears, block & exits show
    phase3CentralMerge() {
        this.instructionText.textContent = `¡Equipos acoplados! Haz clic en tu pieza ${this.selectedTeam === 'celeste' ? 'Celeste' : 'Rosa'} para expandir`;

        this.titleOverlay.classList.add('hidden');
        this.startBlock.classList.remove('hidden');
        this.exitLeft.classList.remove('hidden');
        this.exitRight.classList.remove('hidden');

        const cPiece = this.spawnedPieces['c-snap'];
        const pPiece = this.spawnedPieces['p-snap'];
        const cSnapData = CELESTE_PATHS[this.pathRouteIndex][0];
        const pSnapData = PINK_PATHS[this.pathRouteIndex][0];
        if (cPiece && pPiece) {
            // Snaps flush to left/right of start block based on current route data
            cPiece.style.left = `${cSnapData.x}px`;
            cPiece.style.top = `${cSnapData.y}px`;
            cPiece.style.transform = `rotate(${cSnapData.rot}deg)`; 
            pPiece.style.left = `${pSnapData.x}px`;
            pPiece.style.top = `${pSnapData.y}px`;
            pPiece.style.transform = `rotate(${pSnapData.rot}deg)`;
        }
        // Add clickable cursor class (no glow)
        const mySnap = this.spawnedPieces[this.selectedTeam === 'celeste' ? 'c-snap' : 'p-snap'];
        if (mySnap) mySnap.classList.add('active-clickable');

        this.synth.playConnect();
    }
    // FASE 4: Path Expansion Part A (Pieces 1 to 5 fly in)
    phase4PathExpansionA() {
        this.instructionText.textContent = `Haz clic en una de tus piezas ${this.selectedTeam === 'celeste' ? 'Celestes' : 'Rosas'} para avanzar el camino`;


        const mySnap = this.spawnedPieces[this.selectedTeam === 'celeste' ? 'c-snap' : 'p-snap'];
        if (mySnap) mySnap.classList.remove('active-clickable');
        const celestePath = CELESTE_PATHS[this.pathRouteIndex];
        const pinkPath = PINK_PATHS[this.pathRouteIndex];
        // Spawn Celeste Path Pieces 1-5
        celestePath.filter(p => p.phase === '4a').forEach(pData => {
            const el = this.spawnPiece(pData, 'celeste', true);
            el.offsetHeight; // force reflow
            el.style.left = `${pData.x}px`;
            el.style.top = `${pData.y}px`;
            el.style.transform = `rotate(${pData.rot}deg) scale(1)`;
            el.style.opacity = '1';
            
            if (this.selectedTeam === 'celeste') el.classList.add('active-clickable');
        });
        // Spawn Pink Path Pieces 1-5
        pinkPath.filter(p => p.phase === '4a').forEach(pData => {
            const el = this.spawnPiece(pData, 'rosa', true);
            el.offsetHeight; 
            el.style.left = `${pData.x}px`;
            el.style.top = `${pData.y}px`;
            el.style.transform = `rotate(${pData.rot}deg) scale(1)`;
            el.style.opacity = '1';
            
            if (this.selectedTeam === 'rosa') el.classList.add('active-clickable');
        });

        this.synth.playConnect();
    }
    // FASE 5: Path Expansion Part B (Pieces 6 to 10 fly in and touch exits)
    phase5PathExpansionB() {
        this.instructionText.textContent = `Haz clic en tus piezas para conectar la salida y revelar el color`;
        // Clear active-clickable from phase 4a pieces
        Object.keys(this.spawnedPieces).forEach(id => {
            this.spawnedPieces[id].classList.remove('active-clickable');
        });
        const celestePath = CELESTE_PATHS[this.pathRouteIndex];
        const pinkPath = PINK_PATHS[this.pathRouteIndex];
        // Spawn Celeste Path Pieces 6-10
        celestePath.filter(p => p.phase === '4b').forEach(pData => {
            const el = this.spawnPiece(pData, 'celeste', true);
            el.offsetHeight;
            el.style.left = `${pData.x}px`;
            el.style.top = `${pData.y}px`;
            el.style.transform = `rotate(${pData.rot}deg) scale(1)`;
            el.style.opacity = '1';
            
            if (this.selectedTeam === 'celeste') el.classList.add('active-clickable');
        });

        // Spawn Pink Path Pieces 6-10
        pinkPath.filter(p => p.phase === '4b').forEach(pData => {
            const el = this.spawnPiece(pData, 'rosa', true);
            el.offsetHeight;
            el.style.left = `${pData.x}px`;
            el.style.top = `${pData.y}px`;
            el.style.transform = `rotate(${pData.rot}deg) scale(1)`;
            el.style.opacity = '1';
            
            if (this.selectedTeam === 'rosa') el.classList.add('active-clickable');
        });

        this.synth.playConnect();
    }
    // FASE 6: Connect, Exit Rotates, Reveal Outcome, Gravity Drop
    phase6ConnectAndRotate() {
        this.isAnimating = true;
        
        Object.keys(this.spawnedPieces).forEach(id => {
            this.spawnedPieces[id].classList.remove('active-clickable');
        });

        const mode = ROUND_MODES[this.roundIndex];
        const celestePath = CELESTE_PATHS[this.pathRouteIndex];
        const pinkPath = PINK_PATHS[this.pathRouteIndex];
        
        this.instructionText.textContent = `¡El camino de ${mode.winner.toUpperCase()} conecta primero! Girando módulos...`;

        this.synth.playRotate();
        // Rotate white squares
        this.exitLeftSquare.style.transform = 'translateX(-50%) rotate(360deg)';
        this.exitRightSquare.style.transform = 'translateX(-50%) rotate(360deg)';

        setTimeout(() => {
            let userWon = false;
            
            if (mode.outcome === 'win') {
                if (mode.winner === 'celeste') {
                    this.exitLeftSquare.className = 'exit-white-square revealed-correct'; 
                    this.exitRightSquare.className = 'exit-white-square revealed-incorrect'; 
                    
                    // Glow Celeste winning path
                    celestePath.forEach(p => {
                        const el = this.spawnedPieces[p.id];
                        if (el) el.classList.add('winner-glow');
                    });
                    
                    if (this.selectedTeam === 'celeste') userWon = true;
                } else {
                    this.exitLeftSquare.className = 'exit-white-square revealed-incorrect'; 
                    this.exitRightSquare.className = 'exit-white-square revealed-correct'; 
                    
                    // Glow Pink winning path
                    pinkPath.forEach(p => {
                        const el = this.spawnedPieces[p.id];
                        if (el) el.classList.add('winner-glow');
                    });
                    
                    if (this.selectedTeam === 'rosa') userWon = true;
                }
                this.synth.playVictory();
            } else {
                // Both exits are red
                this.exitLeftSquare.className = 'exit-white-square revealed-incorrect';
                this.exitRightSquare.className = 'exit-white-square revealed-incorrect';
                this.synth.playDefeat();
            }
            // Tumble board after revealing colors
            setTimeout(() => {
                this.tumbleBoard(userWon, mode);
            }, 1800);

        }, 1200);
    }

    tumbleBoard(userWon, mode) {

        const applyFall = (el) => {
            if (!el) return;
            const fallX = (Math.random() - 0.5) * 120;
            const fallR = (Math.random() - 0.5) * 70;
            el.style.setProperty('--fall-x', `${fallX}px`);
            el.style.setProperty('--fall-r', `${fallR}deg`);
            el.classList.add('fall');
        };

        Object.keys(this.spawnedPieces).forEach(id => {
            applyFall(this.spawnedPieces[id]);
        });

        applyFall(this.startBlock);
        applyFall(this.exitLeft);
        applyFall(this.exitRight);
        // Show results overlay
        setTimeout(() => {
            this.showResultsPanel(userWon, mode);
        }, 800);
    }

    showResultsPanel(userWon, mode) {
        this.resultOverlay.className = ''; // remove hidden class
        
        if (mode.outcome === 'win') {
            if (userWon) {
                this.resultOverlay.classList.add('win');
                this.resultTitle.textContent = "¡VICTORIA!";
                this.resultSubtitle.textContent = `Tu equipo ${this.selectedTeam.toUpperCase()} conectó con la salida correcta (Verde)`;
            } else {
                this.resultOverlay.classList.add('loss');
                this.resultTitle.textContent = "¡DERROTA!";
                this.resultSubtitle.textContent = `El equipo contrario ${mode.winner.toUpperCase()} llegó primero a la salida correcta`;
            }
        } else {

            this.resultOverlay.classList.add('loss');
            this.resultTitle.textContent = "¡DERROTA!";
            this.resultSubtitle.textContent = "El camino conectó con una salida incorrecta (Roja)";
        }

        this.instructionText.textContent = "Haz clic en cualquier parte de la pantalla para reiniciar";
        
        setTimeout(() => {
            this.isAnimating = false;
        }, 500);
    }
}
// --- INITIALIZE GAME ON WINDOW LOAD ---
window.addEventListener('DOMContentLoaded', () => {
    window.simulator = new GameSimulator();
});

