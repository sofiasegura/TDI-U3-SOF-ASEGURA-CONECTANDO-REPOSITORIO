/*TITULO*/


const titulo = document.getElementById('titulo');


const colores = [
    '#ffffff', // blanco
    '#ff4fa3', // rosa
    '#66cfff', // celeste
    '#ffe45c'  // amarillo
];


let indiceColor = 0;


titulo.addEventListener('click', () => {


    indiceColor++;


    if (indiceColor >= colores.length) {
        indiceColor = 0;
    }


    titulo.style.color = colores[indiceColor];


});


/*RECORRIDO */


const path1 = document.getElementById("path-1");
const path2 = document.getElementById("path-2");
const path3 = document.getElementById("path-3");


function updatePath() {


    const scroll = window.scrollY;


    path1.style.opacity = "0";
    path2.style.opacity = "0";
    path3.style.opacity = "0";


    if (scroll < 500) {


        path1.style.opacity = "1";


    } else if (scroll < 1200) {


        path2.style.opacity = "1";


    } else {


        path3.style.opacity = "1";


    }


}


window.addEventListener("scroll", updatePath);


updatePath(); /* Mostrar el patrón correcto al cargar */


/*CARRUSEL */


const slides = document.querySelectorAll(".slide");


let current = 0;


function showSlide(index) {


    slides.forEach(slide => {


        slide.classList.remove("active");
        slide.style.display = "none";


    });


    slides[index].classList.add("active");
    slides[index].style.display = "block";


}


/* Mostrar primera imagen */
showSlide(current);


/* Botones opcionales */
const next = document.querySelector(".next");
const prev = document.querySelector(".prev");


if (next) {


    next.addEventListener("click", () => {


        current++;


        if (current >= slides.length) {
            current = 0;
        }


        showSlide(current);


    });


}


if (prev) {


    prev.addEventListener("click", () => {


        current--;


        if (current < 0) {
            current = slides.length - 1;
        }


        showSlide(current);


    });


}

/*PIEZAS */


document.querySelectorAll(".piece").forEach(piece => {


    piece.addEventListener("click", () => {


        window.location.href = piece.dataset.link;


    });


});

/*LOADER*/

window.addEventListener("load", () => {

    const loader = document.getElementById("loader");

    loader.style.opacity = "0";

    loader.style.transition = "opacity .8s ease";

    setTimeout(() => {

        loader.style.display = "none";

    }, 800);

});

/* NAVBAR - SCROLL + COLOR ACTIVO */

document.querySelectorAll(".nav-link").forEach(link => {

    link.addEventListener("click", () => {

        // Scroll a la sección

        const targetId = link.dataset.target;
        const target = document.getElementById(targetId);

        if (target) {

            target.scrollIntoView({ behavior: "smooth" });

        }

        // Quitar color activo de todos los links

        document.querySelectorAll(".nav-link").forEach(l => {

            l.classList.remove("active-amarillo", "active-rosa", "active-celeste");

        });

        // Poner color activo en el link presionado

        const color = link.dataset.color;

        link.classList.add("active-" + color);

    });

});


/* CONCEPTOS CLAVE */

const conceptGroups = [

    {

        slogan:"Trabajo en equipo",
        color:"var(--yellow)",
        border:"var(--yellow)",
        desc:"Estos conceptos representan cómo los jugadores se relacionan entre sí para avanzar juntos.",
        words:["Conexión","Cooperación","Comunicación"]

    },
    {

        slogan:"Tensión y emoción",
        color:"var(--pink)",
        border:"var(--pink)",
        desc:"El factor imprevisible del juego: las cosas cambian y hay que decidir bajo presión.",
        words:["Incertidumbre","Cambio","Decisión"]

    },
    {

        slogan:"Proceso de juego",
        color:"var(--blue)",
        border:"var(--blue)",
        desc:"La mecánica del camino: se construye, a veces se deshace, todo tiene un ritmo y avance.",
        words:["Construcción","Deshacer","Ritmo","Avance"]

    }

];

let conceptCurrent = 0;

const conceptStage = document.getElementById("conceptStage");
const conceptPrev = document.getElementById("conceptPrev");
const conceptNext = document.getElementById("conceptNext");
const conceptDots = document.querySelectorAll(".concept-dot");

let conceptCards = [];

function conceptSideHTML(g) {

    return `<div>
        <span class="concept-tag" style="color:${g.color}">Categoría</span>
        <span class="concept-side-slogan" style="color:${g.color}">${g.slogan}</span>
    </div>`;

}

function conceptCenterHTML(g) {

    return `<div class="concept-slogan" style="color:${g.color}">${g.slogan}</div>
        <p class="concept-desc">${g.desc}</p>
        <div class="concept-words">
            ${g.words.map(w => `<span class="concept-word-chip" style="border-color:${g.color};color:${g.color}">${w}</span>`).join("")}
        </div>`;

}

function buildConceptCards() {

    conceptStage.querySelectorAll(".concept-card").forEach(c => c.remove());
    conceptCards = [];

    for (let i = 0; i < conceptGroups.length; i++) {

        const g = conceptGroups[i];
        const offset = (i - conceptCurrent + conceptGroups.length) % conceptGroups.length;

        const div = document.createElement("div");
        div.className = "concept-card";
        div.dataset.index = i;

        let slot;
        if (offset === 0) slot = "center";
        else if (offset === 1) slot = "right";
        else slot = "left";

        div.classList.add("concept-slot-" + slot);
        div.style.borderColor = g.border;
        div.innerHTML = slot === "center" ? conceptCenterHTML(g) : conceptSideHTML(g);

        conceptStage.insertBefore(div, conceptNext);
        conceptCards.push(div);

    }

}

function goConcept(direction) {

    conceptCurrent = direction === "next"
        ? (conceptCurrent + 1) % conceptGroups.length
        : (conceptCurrent - 1 + conceptGroups.length) % conceptGroups.length;

    conceptCards.forEach(div => {

        const i = parseInt(div.dataset.index);
        const g = conceptGroups[i];
        const offset = (i - conceptCurrent + conceptGroups.length) % conceptGroups.length;

        let slot;
        if (offset === 0) slot = "center";
        else if (offset === 1) slot = "right";
        else slot = "left";

        div.className = "concept-card concept-slot-" + slot;

        const isCenter = slot === "center";
        const hasDesc = div.querySelector(".concept-desc");

        if (isCenter && !hasDesc) {

            div.innerHTML = conceptCenterHTML(g);

        } else if (!isCenter && hasDesc) {

            div.innerHTML = conceptSideHTML(g);

        }

    });

    conceptDots.forEach((d, i) => d.classList.toggle("active", i === conceptCurrent));

}

conceptPrev.addEventListener("click", () => goConcept("prev"));
conceptNext.addEventListener("click", () => goConcept("next"));

conceptDots.forEach(d => d.addEventListener("click", () => {

    conceptCurrent = parseInt(d.dataset.i);
    buildConceptCards();

    conceptDots.forEach((dd, i) => dd.classList.toggle("active", i === conceptCurrent));

}));

buildConceptCards();