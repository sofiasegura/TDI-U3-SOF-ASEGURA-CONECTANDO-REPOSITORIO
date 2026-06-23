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


/* CARRUSEL */

const slides = document.querySelectorAll(".slide");



let current = 0;

function showSlide(index){

    slides.forEach(slide => {

        slide.style.display = "none";
        slide.classList.remove("active");



    });

    slides[index].style.display = "block";
    slides[index].classList.add("active");



}



showSlide(current);

const next = document.getElementById("galleryNext");
const prev = document.getElementById("galleryPrev");

next.addEventListener("click", () => {

    current++;

    if(current >= slides.length){

        current = 0;

    }

    showSlide(current);

});

prev.addEventListener("click", () => {

    current--;

    if(current < 0){

        current = slides.length - 1;

    }

    showSlide(current);

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

/* NAVBAR - SCROLL + COLOR ACTIVO MULTIDIRECCIONAL */

const navLinks = document.querySelectorAll(".nav-link");






navLinks.forEach(link => {
    link.addEventListener("click", (e) => {
        e.preventDefault();
        const targetId = link.dataset.target;
        const target = document.getElementById(targetId);

        if (target) {
           
            const navbarHeight = document.getElementById("navbar").offsetHeight;
            const targetPosition = target.getBoundingClientRect().top + window.scrollY - navbarHeight;

            window.scrollTo({
                top: targetPosition,
                behavior: "smooth"
            });
        }
    });
});


const observerOptions = {
    root: null, 
    rootMargin: "-20% 0px -60% 0px", 
    threshold: 0
};

const observerCallback = (entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const idElemento = entry.target.id;
            
            
            const activeLink = document.querySelector(`.nav-link[data-target="${idElemento}"]`);
            
            if (activeLink) {
                
                navLinks.forEach(l => {
                    l.classList.remove("active-amarillo", "active-rosa", "active-celeste");
                });

                
                const color = activeLink.dataset.color;
                activeLink.classList.add("active-" + color);
            }
        }
    });
};

const observer = new IntersectionObserver(observerCallback, observerOptions);

navLinks.forEach(link => {
    const targetId = link.dataset.target;
    const targetSection = document.getElementById(targetId);
    if (targetSection) {
        observer.observe(targetSection);
    }
});
