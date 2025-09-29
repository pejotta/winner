/**
 * Script Modular e Único para Múltiplos Sliders de Destaques no Blogger.
 * Este arquivo deve ser referenciado via <script src='...'/> no seu template.
 * Por Gemini (Google).
 */

// --- CONFIGURAÇÃO GLOBAL ---
const BLOG_URL = 'https://winner-games-blogger.blogspot.com'; // O SEU DOMÍNIO
const MAX_POSTS = 5; 
const AUTOPLAY_INTERVAL = 10000; // 10 segundos
// --------------------------

/**
 * Mapeia o ID do slider para sua instância de controle.
 * Necessário para o JSONP callback do Blogger.
 */
const sliderInstances = {};

/**
 * Função de callback global que o Blogger Feed JSONP chama.
 * Direciona os dados para a instância correta do slider.
 */
window.handlePostsFeed = function(json) {
    const script = document.currentScript;
    // O ID do slider foi anexado ao script que fez a requisição
    const sliderId = script.getAttribute('data-slider-id');
    
    if (!sliderId || !sliderInstances[sliderId]) {
        return;
    }
    
    const instance = sliderInstances[sliderId];
    
    if (!json.feed || !json.feed.entry || json.feed.entry.length === 0) {
        instance.postsContainer.innerHTML = '<p style="padding: 20px; color: gray;">Nenhuma postagem encontrada com esta tag.</p>';
        return;
    }

    instance.postsData = json.feed.entry;
    instance.totalSlides = instance.postsData.length;
    
    instance.renderSlider();
    instance.setupNavigation();
    instance.startAutoplay();
};


/**
 * Inicializa a busca e configura a lógica de um slider específico.
 */
function initializeFeaturedSlider(sliderId, targetTag) {
    const container = document.getElementById(sliderId);
    if (!container) return;

    // --- VARIÁVEIS DE ESTADO LOCAIS ---
    let currentSlide = 0;
    let totalSlides = 0;
    let autoplayTimer;
    
    const postsContainer = container.querySelector('.posts-container');
    const prevBtn = container.querySelector('.prev-btn');
    const nextBtn = container.querySelector('.next-btn');
    const paginationContainer = container.querySelector('.slider-pagination');
    
    // --- FUNÇÕES DE CONTROLE LOCAIS ---
    
    const moveSlider = (index) => {
        if (index < 0) {
            currentSlide = totalSlides - 1;
        } else if (index >= totalSlides) {
            currentSlide = 0;
        } else {
            currentSlide = index;
        }
        
        const offset = -currentSlide * 100;
        postsContainer.style.transform = `translateX(${offset}%)`;
        updatePagination();
    };

    const updatePagination = () => {
        if (!paginationContainer) return;
        const dots = paginationContainer.querySelectorAll('.pagination-dot');
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentSlide);
        });
    };
    
    const setupPagination = () => {
        if (!paginationContainer) return;
        paginationContainer.innerHTML = '';
        for (let i = 0; i < totalSlides; i++) {
            const dot = document.createElement('span');
            dot.classList.add('pagination-dot');
            dot.onclick = () => { moveSlider(i); resetAutoplay(); };
            paginationContainer.appendChild(dot);
        }
        updatePagination();
    };
    
    const startAutoplay = () => {
        clearInterval(autoplayTimer);
        autoplayTimer = setInterval(() => {
            moveSlider(currentSlide + 1);
        }, AUTOPLAY_INTERVAL);
    };
    
    const resetAutoplay = () => {
        clearInterval(autoplayTimer);
        startAutoplay();
    };

    const setupNavigation = () => {
        if (prevBtn) prevBtn.onclick = () => { moveSlider(currentSlide - 1); resetAutoplay(); };
        if (nextBtn) nextBtn.onclick = () => { moveSlider(currentSlide + 1); resetAutoplay(); };
        setupPagination();
    };

    const renderSlider = () => {
        let html = '';
        sliderInstances[sliderId].postsData.forEach(post => {
            const postLink = post.link.find(l => l.rel === 'alternate').href;
            let imageUrl = post.media$thumbnail ? post.media$thumbnail.url : 'URL_DE_IMAGEM_PADRAO_AQUI'; 
            
            if (imageUrl.includes('s72-c')) {
                imageUrl = imageUrl.replace('s72-c', 's500');
            }

            const title = post.title.$t;
            const summary = post.summary.$t.length > 100 ? post.summary.$t.substring(0, 100) + '...' : post.summary.$t;

            html += `
                <a href="${postLink}" class="slider-post">
                    <div class="post-image-area">
                        <img src="${imageUrl}" alt="${title}" class="post-image"/>
                    </div>
                    <div class="post-info">
                        <h3 class="post-title">${title}</h3>
                        <p class="post-description">${summary}</p>
                    </div>
                </a>
            `;
        });

        postsContainer.innerHTML = html;
    };
    
    // --- REGISTRO E INÍCIO DA BUSCA ---
    
    // 1. Registra a instância no objeto global para o callback
    sliderInstances[sliderId] = {
        currentSlide, totalSlides, postsData: [],
        postsContainer, renderSlider, setupNavigation, startAutoplay
    };
    
    // 2. Inicia a busca
    const feedUrl = `${BLOG_URL}/feeds/posts/summary/-/${targetTag}?alt=json-in-script&max-results=${MAX_POSTS}`;
    const script = document.createElement('script');
    script.src = feedUrl + '&callback=handlePostsFeed';
    script.setAttribute('data-slider-id', sliderId); 
    document.head.appendChild(script);

    // 3. Atualiza o título (Opcional)
    const titleElement = container.querySelector('.slider-title-tag');
    if (titleElement) titleElement.textContent = targetTag;
}

// --- PONTO DE ENTRADA CORRIGIDO (Inicialização Atrasada e Segura) ---
function safeInitializeSliders() {
    // Atraso de 100ms para dar tempo dos widgets do Blogger carregarem o HTML.
    setTimeout(() => {
        const allContainers = document.querySelectorAll('.featured-slider-container[data-tag]');
        
        allContainers.forEach((container, index) => {
            // Garante um ID único
            if (!container.id) {
                container.id = `featured-slider-${index}`;
            }
            
            const tag = container.getAttribute('data-tag');
            initializeFeaturedSlider(container.id, tag);
        });
        
    }, 100); 
}

// 1. Verifica se a página já carregou (para scripts que carregam lentamente)
if (document.readyState === 'complete') {
    safeInitializeSliders();
} else {
    // 2. Espera o carregamento completo do DOM e de recursos externos (mais robusto)
    window.addEventListener('load', safeInitializeSliders);
}
