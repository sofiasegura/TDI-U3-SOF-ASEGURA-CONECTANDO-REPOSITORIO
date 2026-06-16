const mosaico = document.getElementById("mosaico");

const PASO = 60;

document.getElementById("titulo").style.opacity = "0";

/* Crear bloque */

function crearBloque(x,y,color){

    const bloque = document.createElement("div");

    bloque.classList.add("pieza");
    bloque.classList.add("pieza-cayendo");

    bloque.style.left = x + "px";
    bloque.style.top = y + "px";

    bloque.style.background = color;

    mosaico.appendChild(bloque);

}

/* Pieza I */


function crearI(x,y,color){

    crearBloque(x,y,color);
    crearBloque(x+PASO,y,color);
    crearBloque(x+PASO*2,y,color);
    crearBloque(x+PASO*3,y,color);

}

/* Pieza T */

function crearT(x,y,color){

    crearBloque(x,y,color);
    crearBloque(x+PASO,y,color);
    crearBloque(x+PASO*2,y,color);

    crearBloque(x+PASO,y+PASO,color);

}

/* Pieza L */

function crearL(x,y,color){

    crearBloque(x,y,color);
    crearBloque(x,y+PASO,color);
    crearBloque(x,y+PASO*2,color);

    crearBloque(x+PASO,y+PASO*2,color);
    crearBloque(x+PASO*2,y+PASO*2,color);

}

/* Secuencia de piezas */

const secuencia = [

    {tipo:"I", x:500, y:680, color:"#009BDD"},

    {tipo:"L", x:620, y:620, color:"#D2247C"},

    {tipo:"T", x:740, y:680, color:"#E0D033"},

    {tipo:"L", x:860, y:560, color:"#009BDD"},

    {tipo:"I", x:980, y:620, color:"#D2247C"}

];

/* Construcción */

let indice = 0;

function construir(){

    if(indice >= secuencia.length){

        mostrarTitulo();

        return;

    }

    const pieza = secuencia[indice];

    if(pieza.tipo === "I"){

        crearI(
            pieza.x,
            pieza.y,
            pieza.color
        );

    }

    if(pieza.tipo === "L"){

        crearL(
            pieza.x,
            pieza.y,
            pieza.color
        );

    }

    if(pieza.tipo === "T"){

        crearT(
            pieza.x,
            pieza.y,
            pieza.color
        );

    }

    indice++;

    setTimeout(construir,500);

}

/* Mostrar título */

function mostrarTitulo(){

    document
    .getElementById("titulo")
    .style.opacity = "1";

    setTimeout(reiniciar,3000);

}

/* Reiniciar */

function reiniciar(){

    mosaico.innerHTML = "";

    document
    .getElementById("titulo")
    .style.opacity = "0";

    indice = 0;

    construir();

}

console.log("JS cargado");
crearBloque(300,300,"red");

/* Iniciar */

construir();