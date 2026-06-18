const canvas = document.getElementById("universo");
const ctx = canvas.getContext("2d");

function resize(){

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

}

resize();

window.addEventListener("resize", resize);

const YELLOW = "#E0D033";
const PINK = "#D2247C";
const BLUE = "#009BDD";

let escudoActivo = false;
let escudoHasta = 0;

let hoverActivo = false;

let congeladoGlobal = false;
let congeladoGlobalHasta = 0;

let colorCongelado = null;
let colorCongeladoHasta = 0;

let introActiva = true;

setTimeout(()=>{

    introActiva = false;

},3000);

let tutorialHasta =
    Date.now() + 11000;

window.addEventListener("keydown", e=>{

    if(
        e.code === "Space" &&
        (
            !escudoActivo ||
            Date.now() > escudoHasta
        )
    ){

        escudoActivo = true;

        escudoHasta =
            Date.now() + 30000;

    }

});

canvas.addEventListener("mouseenter", ()=>{

    hoverActivo = true;

});

canvas.addEventListener("mouseleave", ()=>{

    hoverActivo = false;

});

canvas.addEventListener("click", e=>{

    const mx =
        e.clientX - canvas.width/2;

    const my =
        e.clientY - canvas.height/2;

    let masCercana = null;
    let menor = Infinity;

    piezas.forEach(p=>{

        const d = Math.hypot(

            p.x - mx,
            p.y - my

        );

        if(d < menor){

            menor = d;
            masCercana = p;

        }

    });

    if(masCercana){

        colorCongelado =
            masCercana.colorFinal;

        colorCongeladoHasta =
            Date.now() + 30000;

    }

});

canvas.addEventListener("dblclick", ()=>{

    congeladoGlobal = true;

    congeladoGlobalHasta =
        Date.now() + 30000;

});

const formas = {

    I:[
        [0,0],
        [0,1],
        [0,2],
        [0,3]
    ],

    L:[
        [0,0],
        [0,1],
        [0,2],
        [1,2]
    ],

    T:[
        [0,0],
        [1,0],
        [2,0],
        [1,1]
    ]

};


/* ESQUINAS */

const esquinas = [

    { x:-1, y:-1, color:BLUE },
    { x: 1, y:-1, color:PINK },
    { x:-1, y: 1, color:PINK },
    { x: 1, y: 1, color:BLUE }

];

/* PIEZAS */

const piezas = [];

function crearPieza(){

    const destino =
        esquinas[
            Math.floor(
                Math.random() * esquinas.length
            )
        ];

    const velocidad =
        0.7 + Math.random() * 0.5;

    const esquinaX =
        destino.x * canvas.width/2;

    const esquinaY =
        destino.y * canvas.height/2;

    const angulo =
        Math.atan2(
            esquinaY,
            esquinaX
        );

    piezas.push({

        permanente:
            Math.random() < 0.3,

        x:(Math.random()-0.5)*120,
        y:(Math.random()-0.5)*120,

        vx:
            Math.cos(angulo) * velocidad,

        vy:
            Math.sin(angulo) * velocidad,

        colorFinal: destino.color,

        edad:0,

        tipo:["I","L","T"][
            Math.floor(Math.random()*3)
        ],

        rotacion:
            Math.floor(Math.random()*4),

        tam:12,

        wobbleX:0,
        wobbleY:0,

        delay:
        Math.floor(
            Math.random() * 300
        )

}); 

}

for(let i=0;i<120;i++){
    crearPieza();
}

function dibujarPieza(px,py,p,color){

    const forma = formas[p.tipo];

    ctx.strokeStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 1;

    forma.forEach(celda=>{

        let x = celda[0];
        let y = celda[1];

        for(let r=0;r<p.rotacion;r++){

            const temp = x;

            x = -y;
            y = temp;

        }

        const distancia =
    Math.sqrt(p.x*p.x + p.y*p.y);

ctx.lineWidth =
    Math.min(
        4,
        0.5 + distancia * 0.004
    );

        ctx.strokeRect(

            px + x*p.tam,
            py + y*p.tam,

            p.tam,
            p.tam

        );

    });

}

/* COLOR */

function mezclarColor(c1, c2, t){

    const r1 = parseInt(c1.substr(1,2),16);
    const g1 = parseInt(c1.substr(3,2),16);
    const b1 = parseInt(c1.substr(5,2),16);

    const r2 = parseInt(c2.substr(1,2),16);
    const g2 = parseInt(c2.substr(3,2),16);
    const b2 = parseInt(c2.substr(5,2),16);

    const r = Math.round(r1 + (r2-r1)*t);
    const g = Math.round(g1 + (g2-g1)*t);
    const b = Math.round(b1 + (b2-b1)*t);

    return `rgb(${r},${g},${b})`;

}

function obtenerColor(p){

    if(

    escudoActivo &&

    Date.now() < escudoHasta

){

    return YELLOW;

}

    const distancia =
        Math.sqrt(
            p.x*p.x +
            p.y*p.y
        );

    const radioMax =
        Math.max(
            canvas.width,
            canvas.height
        ) * 0.3;

    const t = Math.pow(
        Math.min(
            1,
            distancia / radioMax
        ),
        4
    );

    return mezclarColor(
        YELLOW,
        p.colorFinal,
        t
    );

}

/* REINICIO */

function reiniciarPieza(p){

    const destino =
        esquinas[
            Math.floor(
                Math.random() * esquinas.length
            )
        ];

    const velocidad =
        0.7 + Math.random() * 0.5;

    const esquinaX =
        destino.x * canvas.width/2;

    const esquinaY =
        destino.y * canvas.height/2;

    const angulo =
        Math.atan2(
            esquinaY,
            esquinaX
        );

    p.x = (Math.random()-0.5)*120;
    p.y = (Math.random()-0.5)*120;

    p.vx =
        Math.cos(angulo) * velocidad;

    p.vy =
        Math.sin(angulo) * velocidad;

    p.colorFinal = destino.color;

    p.edad = 0;

    p.rotacion =
        Math.floor(Math.random()*4);

    p.tipo =
        ["I","L","T"][
            Math.floor(Math.random()*3)
        ];

}

/* ANIMACIÓN */

function animar(){ if(introActiva){

    ctx.fillStyle = "black";

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    ctx.fillStyle = "white";

    ctx.textAlign = "center";

    ctx.font =
        "bold 80px Oxanium";

    ctx.fillText(

        "CONECTANDO",

        canvas.width/2,

        canvas.height/2

    );

    requestAnimationFrame(animar);

    return;

}

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    ctx.save();

    ctx.translate(
        canvas.width/2,
        canvas.height/2
    );

    ctx.globalCompositeOperation = "source-over";

    piezas.forEach(p=>{

        if(p.delay > 0){

    p.delay--;

    return;

}

        p.edad++;

        const distancia =
    Math.sqrt(
        p.x*p.x +
        p.y*p.y
    );

    p.tam =
    Math.min(
        16,
        6 + distancia * 0.015
    );

       if(

    !congeladoGlobal &&

    (
        !colorCongelado ||
        Date.now() > colorCongeladoHasta ||
        p.colorFinal !== colorCongelado
    )

){

    p.x += p.vx;
    p.y += p.vy;

}

        const apertura =
            Math.sqrt(p.edad) * 0.04;

        p.x +=
            (Math.random()-0.5)
            * apertura;

        p.y +=
            (Math.random()-0.5)
            * apertura;

        p.x += p.wobbleX;
        p.y += p.wobbleY;

        const color =
            obtenerColor(p);

        dibujarPieza(

            p.x,
            p.y,
            p,
            color

        );

        const limiteX =
            canvas.width * 0.8;

        const limiteY =
            canvas.height * 0.8;

        if(

            Math.abs(p.x) > limiteX ||

            Math.abs(p.y) > limiteY

        ){

            reiniciarPieza(p);

        }

    });

    if(piezas.length < 200 && Math.random() < 0.1){
    crearPieza();
}

if(Date.now() < tutorialHasta){

    ctx.save();

    ctx.fillStyle = "white";

    ctx.font =
        "20px Oxanium";

    ctx.textAlign = "left";

    ctx.fillText(
        "Hover → Giro colectivo",
        30,
        40
    );

    ctx.fillText(
        "Click → Congela un color",
        30,
        70
    );

    ctx.fillText(
        "Doble Click → Congela todo",
        30,
        100
    );

    ctx.fillText(
        "Espacio → Escudo amarillo",
        30,
        130
    );

    ctx.restore();

}

    ctx.restore();

    requestAnimationFrame(animar);

}

document.fonts.ready.then(()=>{

    animar();

});
