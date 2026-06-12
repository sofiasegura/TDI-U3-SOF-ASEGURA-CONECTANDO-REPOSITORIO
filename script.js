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


/* Mostrar el patrón correcto al cargar */
updatePath();




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
