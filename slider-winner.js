/**
 * Inicializa e controla um slider de posts (Autoplay) de forma modular.
 * Filtra os slides baseado no atributo HTML 'data-tag' do container.
 */
const SLIDER_AUTOPLAY_INTERVAL = 10000; // 5 segundos

function initializeTagSlider(sliderId) {
    // 1. Variáveis e Validação
    const sliderContainer = document.getElementById(sliderId);
    if (!sliderContainer) return;
    
    const requiredTag = sliderContainer.getAttribute('data-tag'); 
    const slider = sliderContainer.querySelector('.slider-content');
    const allSlides = sliderContainer.querySelectorAll('.slider-slide');
    
    // 2. FILTRAGEM
    let filteredSlides = [];
    if (requiredTag) {
        filteredSlides = Array.from(allSlides).filter(slide => {
            const slideTags = slide.getAttribute('data-tags') || '';
            return slideTags.includes(requiredTag);
        });
    } else {
        filteredSlides = Array.from(allSlides);
    }

    const totalSlides = filteredSlides.length;
    
    if (totalSlides === 0) {
        sliderContainer.style.display = 'none';
        return;
    }

    // 3. Reconstrução do DOM Filtrado
    slider.innerHTML = ''; 
    filteredSlides.forEach(slide => {
        slide.style.width = (100 / totalSlides) + '%';
        slider.appendChild(slide);
    });

    // 4. Lógica de Controle
    const nextButton = sliderContainer.querySelector('.slider-next');
    const prevButton = sliderContainer.querySelector('.slider-prev');
    const paginationContainer = sliderContainer.querySelector('.slider-pagination');
    let currentSlide = 0;
    
    // Funções de Controle Local
    function moveSlider(index) {
        if (index >= totalSlides) {
            index = 0; 
        } else if (index < 0) {
            index = totalSlides - 1; 
        }

        currentSlide = index;
        const offset = -currentSlide * 100;
        slider.style.transform = `translateX(${offset}%)`;
        
        updatePagination();
    }

    function setupPagination() {
        paginationContainer.innerHTML = '';
        filteredSlides.forEach((_, index) => {
            const dot = document.createElement('span');
            dot.classList.add('pagination-dot');
            dot.addEventListener('click', () => {
                moveSlider(index);
                resetAutoplay();
            });
            paginationContainer.appendChild(dot);
        });
        updatePagination();
    }

    function updatePagination() {
        const dots = paginationContainer.querySelectorAll('.pagination-dot');
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentSlide);
        });
    }
    
    // 5. AUTOPLAY (RETORNO AO SLIDER AUTOMÁTICO)
    let autoplayTimer;
    
    function startAutoplay() {
        autoplayTimer = setInterval(() => {
            moveSlider(currentSlide + 1);
        }, SLIDER_AUTOPLAY_INTERVAL);
    }

    function resetAutoplay() {
        clearInterval(autoplayTimer);
        startAutoplay();
    }

    // Navegação
    nextButton.addEventListener('click', () => {
        moveSlider(currentSlide + 1);
        resetAutoplay(); 
    });
    
    prevButton.addEventListener('click', () => {
        moveSlider(currentSlide - 1);
        resetAutoplay();
    });
    
    // Inicialização da Instância
    setupPagination();
    startAutoplay();
}

// --- CHAMADA PRINCIPAL (Inicia todos os sliders na página) ---
document.addEventListener('DOMContentLoaded', () => {
    // 1. Encontra TODOS os elementos com a classe .tag-slider-container
    const allSliderContainers = document.querySelectorAll('.tag-slider-container');
    
    // 2. Para cada um, garante que tenha um ID e o inicializa
    allSliderContainers.forEach((container, index) => {
        // Garante um ID único se o usuário esquecer
        if (!container.id) {
            container.id = `slider-auto-${index}`;
        }
        initializeTagSlider(container.id);
    });
});
