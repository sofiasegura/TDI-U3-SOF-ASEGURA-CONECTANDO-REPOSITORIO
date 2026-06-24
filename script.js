/* ==========================================
   CONECTANDO - INTERACTIVIDAD Y LÓGICA
   ========================================== */

document.addEventListener("DOMContentLoaded", () => {

    /* ==========================================
       PANTALLA DE CARGA (LOADER) FADEOUT
       ========================================== */
    const loader = document.getElementById("loader");
    if (loader) {
        window.addEventListener("load", () => {
            loader.style.opacity = "0";
            loader.style.transition = "opacity .8s ease";
            setTimeout(() => {
                loader.style.display = "none";
            }, 800);
        });
    }


    /* ==========================================
       BARRA DE NAVEGACIÓN - MENÚ MÓVIL BURGER
       ========================================== */
    const navToggle = document.getElementById("navToggle");
    const navLinksContainer = document.getElementById("navLinks");
    const navLinks = document.querySelectorAll(".nav-link");

    if (navToggle && navLinksContainer) {
        navToggle.addEventListener("click", () => {
            navLinksContainer.classList.toggle("active");
            navToggle.classList.toggle("open");
        });

        // Cerrar menú al hacer clic en un enlace
        navLinks.forEach(link => {
            link.addEventListener("click", () => {
                navLinksContainer.classList.remove("active");
                navToggle.classList.remove("open");
            });
        });
    }


    /* ==========================================
       TÍTULO HERO - CAMBIO DE COLOR EN CLICK
       ========================================== */
    const titulo = document.getElementById('titulo');
    const colores = [
        '#ffffff', // Blanco original
        '#ff4fa3', // Rosa
        '#66cfff', // Celeste
        '#ffe45c'  // Amarillo
    ];
    let indiceColor = 0;

    if (titulo) {
        titulo.addEventListener('click', () => {
            indiceColor = (indiceColor + 1) % colores.length;
            titulo.style.color = colores[indiceColor];
        });
    }


    const windingPath = document.getElementById("winding-path");
    const floatingPieces = document.querySelectorAll(".floating-piece");
    const sloganItems = document.querySelectorAll(".slogan-item");

    // Efecto Hover: Al posarse en un término del eslogan, se activa el resplandor correspondiente
    sloganItems.forEach(item => {
        item.addEventListener("mouseenter", () => {
            const pathNum = item.dataset.path;

            // Limpiar clases de brillo previas en el camino principal
            if (windingPath) {
                windingPath.classList.remove("glow-pink", "glow-yellow", "glow-blue");
            }
            // Limpiar clases de brillo previas en las piezas flotantes
            floatingPieces.forEach(p => p.classList.remove("glow-active"));

            if (pathNum === "1") {
                if (windingPath) windingPath.classList.add("glow-pink");
                // Iluminar piezas flotantes del color correspondiente (Rosa)
                document.querySelectorAll(".pink-piece").forEach(p => p.classList.add("glow-active"));
            } else if (pathNum === "2") {
                if (windingPath) windingPath.classList.add("glow-yellow");
                // Iluminar piezas flotantes del color correspondiente (Amarillo)
                document.querySelectorAll(".yellow-piece").forEach(p => p.classList.add("glow-active"));
            } else if (pathNum === "3") {
                if (windingPath) windingPath.classList.add("glow-blue");
                // Iluminar piezas flotantes del color correspondiente (Celeste)
                document.querySelectorAll(".blue-piece").forEach(p => p.classList.add("glow-active"));
            }
        });

        item.addEventListener("mouseleave", () => {
            if (windingPath) {
                windingPath.classList.remove("glow-pink", "glow-yellow", "glow-blue");
            }
            floatingPieces.forEach(p => p.classList.remove("glow-active"));
        });
    });




    /* ==========================================
       CARRUSEL (SLIDESHOW SIN TEXTO DE CAPTION)
       ========================================== */
    const slides = document.querySelectorAll(".slide");
    const indicators = document.querySelectorAll(".indicator");
    const btnNext = document.getElementById("galleryNext");
    const btnPrev = document.getElementById("galleryPrev");
    let currentSlide = 0;
    let carruselInterval;

    function showSlide(index) {
        if (slides.length === 0) return;
        
        // Mantener el índice dentro de los rangos
        if (index >= slides.length) currentSlide = 0;
        else if (index < 0) currentSlide = slides.length - 1;
        else currentSlide = index;

        slides.forEach(slide => {
            slide.style.display = "none";
            slide.classList.remove("active");
        });
        indicators.forEach(ind => ind.classList.remove("active"));

        slides[currentSlide].style.display = "block";
        // Pequeño timeout para activar la transición de opacity suave
        setTimeout(() => {
            slides[currentSlide].classList.add("active");
        }, 20);

        if (indicators[currentSlide]) {
            indicators[currentSlide].classList.add("active");
        }
    }

    function nextSlide() {
        showSlide(currentSlide + 1);
    }

    function prevSlide() {
        showSlide(currentSlide - 1);
    }

    if (btnNext && btnPrev) {
        btnNext.addEventListener("click", () => {
            nextSlide();
            resetAutoplay();
        });
        btnPrev.addEventListener("click", () => {
            prevSlide();
            resetAutoplay();
        });
    }

    // Clic en los indicadores inferiores
    indicators.forEach(indicator => {
        indicator.addEventListener("click", (e) => {
            const slideIndex = parseInt(e.target.dataset.slide);
            showSlide(slideIndex);
            resetAutoplay();
        });
    });

    // Auto-reproducción del carrusel (5s)
    function startAutoplay() {
        carruselInterval = setInterval(nextSlide, 5000);
    }

    function resetAutoplay() {
        clearInterval(carruselInterval);
        startAutoplay();
    }

    // Detener auto-play en hover del carrusel
    const carruselContainer = document.querySelector(".carrusel-container");
    if (carruselContainer) {
        carruselContainer.addEventListener("mouseenter", () => clearInterval(carruselInterval));
        carruselContainer.addEventListener("mouseleave", startAutoplay);
    }

    // Inicializar carrusel
    showSlide(currentSlide);
    startAutoplay();


    /* ==========================================
       NAVBAR - OBSERVER DE SECCIONES (COLOR ACTIVO)
       ========================================== */
    // Navegación fluida y cálculo de altura del navbar
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

    // Detectar sección visible y pintar su link correspondiente
    const observerOptions = {
        root: null,
        rootMargin: "-20% 0px -60% 0px", // Rango original
        threshold: 0
    };

    const observerCallback = (entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const activeId = entry.target.id;
                const activeLink = document.querySelector(`.nav-link[data-target="${activeId}"]`);
                
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

    const sectionObserver = new IntersectionObserver(observerCallback, observerOptions);
    
    navLinks.forEach(link => {
        const targetId = link.dataset.target;
        const targetSection = document.getElementById(targetId);
        if (targetSection) {
            sectionObserver.observe(targetSection);
        }
    });

});
