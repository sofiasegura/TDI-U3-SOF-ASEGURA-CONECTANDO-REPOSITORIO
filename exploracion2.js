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

const esquinas = [

    { x:-1, y:-1, color:BLUE },
    { x: 1, y:-1, color:PINK },
    { x:-1, y: 1, color:PINK },
    { x: 1, y: 1, color:BLUE }

];

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

    piezas.push({

        x:(Math.random()-0.5)*20,
        y:(Math.random()-0.5)*20,

        vx: destino.x * velocidad,
        vy: destino.y * velocidad,

        colorFinal: destino.color,

        edad:0,

        tipo:["I","L","T"][
            Math.floor(Math.random()*3)
        ],

        rotacion:
            Math.floor(Math.random()*4),

        tam:4,

        wobbleX:
            (Math.random()-0.5)*0,

        wobbleY:
            (Math.random()-0.5)*0

    });

}

for(let i=0;i<1800;i++){

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
    Math.max(
        0.5,
        3 - distancia * 0.01
    );

        ctx.strokeRect(

            px + x*p.tam,
            py + y*p.tam,

            p.tam,
            p.tam

        );

    });

}

function obtenerColor(p){

    if(p.edad < 20){

        return YELLOW;

    }

    if(p.edad < 80){

        const t = (p.edad - 20) / 60;

        if(Math.random() > t){

            return YELLOW;

        }

        return p.colorFinal;

    }

    return p.colorFinal;

}

function reiniciarPieza(p){

    const destino =
        esquinas[
            Math.floor(
                Math.random() * esquinas.length
            )
        ];

    const velocidad =
    3 + Math.random() * 3;

    p.x = (Math.random()-0.5)*4;
    p.y = (Math.random()-0.5)*4;

    p.vx = destino.x * velocidad;
    p.vy = destino.y * velocidad;

    p.colorFinal = destino.color;

    p.edad = 0;

}

function animar(){

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

        p.edad++;

        const distancia =
    Math.sqrt(
        p.x*p.x +
        p.y*p.y
    );

    p.tam =
    Math.max(
        2,
        5 - distancia * 0.01
    );

       p.x += p.vx;
       p.y += p.vy;

        const apertura =
            Math.sqrt(p.edad) * 0.8;

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
            canvas.width/2 + 150;

        const limiteY =
            canvas.height/2 + 150;

        if(

            Math.abs(p.x) > limiteX ||

            Math.abs(p.y) > limiteY

        ){

            reiniciarPieza(p);

        }

    });

    ctx.restore();

    requestAnimationFrame(animar);

}

animar();