/**
 * Inicializa e controla um slider de posts, filtrando pelo atributo 'data-tag'
 * definido no container de cada widget.
 */
function initializeTagSlider(sliderId) {
    // 1. Variáveis LOCAIS e Leitura do Atributo da Tag
    const sliderContainer = document.getElementById(sliderId);
    if (!sliderContainer) {
        // console.warn(`Container do Slider não encontrado: #${sliderId}`);
        return;
    }
    
    // Lê a tag exata a ser exibida do atributo data-tag
    const requiredTag = sliderContainer.getAttribute('data-tag'); 
    
    const slider = sliderContainer.querySelector('.slider-content');
    const allSlides = sliderContainer.querySelectorAll('.slider-slide');
    
    // 2. FILTRAGEM DOS SLIDES
    let filteredSlides = [];
    
    if (requiredTag) {
        // Filtra os slides que contêm a tag necessária
        filteredSlides = Array.from(allSlides).filter(slide => {
            const slideTags = slide.getAttribute('data-tags') || '';
            // Verifica se a tag requerida está na lista de tags do slide
            return slideTags.includes(requiredTag);
        });
    } else {
        // Se a tag não for especificada no HTML, exibe todos
        filteredSlides = Array.from(allSlides);
    }

    const totalSlides = filteredSlides.length;
    
    // Se não houver slides filtrados, oculta o container e para
    if (totalSlides === 0) {
        sliderContainer.style.display = 'none';
        return;
    }

    // 3. Reconstroi o Slider DOM com Apenas os Slides Filtrados
    slider.innerHTML = ''; 
    filteredSlides.forEach(slide => {
        // Define a largura do slide para o cálculo do CSS `transform`
        slide.style.width = (100 / totalSlides) + '%';
        slider.appendChild(slide);
    });

    // 4. Continuação da Lógica do Slider (Funções Locais)
    
    const nextButton = sliderContainer.querySelector('.slider-next');
    const prevButton = sliderContainer.querySelector('.slider-prev');
    const paginationContainer = sliderContainer.querySelector('.slider-pagination');
    let currentSlide = 0;
    
    // Funções de Controle
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
            dot.addEventListener('click', () => moveSlider(index));
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

    function setupNavigation() {
        nextButton.addEventListener('click', () => moveSlider(currentSlide + 1));
        prevButton.addEventListener('click', () => moveSlider(currentSlide - 1));
    }

    // 5. Inicialização da Instância
    setupPagination();
    setupNavigation();
}


// --- CHAMADA PRINCIPAL (ÚNICA) ---
document.addEventListener('DOMContentLoaded', () => {
    // 1. Encontra TODOS os elementos que são sliders na página (por classe)
    const allSliderContainers = document.querySelectorAll('.tag-slider-container');
    
    // 2. Para cada um deles, chama a função de inicialização
    allSliderContainers.forEach((container, index) => {
        // Garante que cada um tenha um ID se ainda não tiver, para ser referenciado
        if (!container.id) {
            container.id = `slider-auto-${index}`;
        }
        initializeTagSlider(container.id);
    });
});