// --- CONFIGURAÇÃO GLOBAL ---
const BLOG_URL = 'https://winner-games-blogger.blogspot.com'; // O SEU DOMÍNIO
const MAX_POSTS = 5; 
const AUTOPLAY_INTERVAL = 10000; // 10 segundos
// --------------------------

/**
 * Mapeia o ID do slider para sua instância de controle (necessário para o JSONP callback)
 * Chave: 'slider-id', Valor: { currentSlide: 0, totalSlides: 5, ... funções }
 */
const sliderInstances = {};

/**
 * Função de callback global que o Blogger Feed JSONP chama.
 * Esta função direciona os dados para a instância correta do slider.
 */
window.handlePostsFeed = function(json) {
    // O ID do slider é passado como um parâmetro de URL customizado na busca
    const script = document.currentScript;
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

    // --- CRIAÇÃO DA INSTÂNCIA E VARIÁVEIS LOCAIS ---
    let currentSlide = 0;
    let totalSlides = 0;
    let autoplayTimer;
    
    const postsContainer = container.querySelector('.posts-container');
    const prevBtn = container.querySelector('.prev-btn'); // Note o uso da classe/ID
    const nextBtn = container.querySelector('.next-btn'); // Note o uso da classe/ID
    const paginationContainer = container.querySelector('.slider-pagination');
    
    // --- FUNÇÕES DA INSTÂNCIA ---
    
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

    const updatePagination = () => {
        if (!paginationContainer) return;
        const dots = paginationContainer.querySelectorAll('.pagination-dot');
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentSlide);
        });
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
            let imageUrl = post.media$thumbnail ? post.media$thumbnail.url : 'URL_DE_IMAGEM_PADRAO_AQUI'; // Substitua
            
            // Ajuste da miniatura
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
    
    // Registra a instância no objeto global para ser acessada pelo handlePostsFeed
    sliderInstances[sliderId] = {
        currentSlide, totalSlides, postsData: [],
        postsContainer, renderSlider, setupNavigation, startAutoplay
    };
    
    // Inicia a busca (o callback chamará handlePostsFeed)
    const feedUrl = `${BLOG_URL}/feeds/posts/summary/-/${targetTag}?alt=json-in-script&max-results=${MAX_POSTS}`;
    const script = document.createElement('script');
    script.src = feedUrl + '&callback=handlePostsFeed';
    script.setAttribute('data-slider-id', sliderId); // Passa o ID para o callback
    document.head.appendChild(script);

    // Atualiza o título (Opcional)
    const titleElement = container.querySelector('.slider-title-tag');
    if (titleElement) titleElement.textContent = targetTag;
}

// --- INICIALIZAÇÃO AUTOMÁTICA DE TODOS OS WIDGETS ---
document.addEventListener('DOMContentLoaded', () => {
    // 1. Encontra TODOS os containers que o usuário marcou para serem sliders
    const allContainers = document.querySelectorAll('.featured-slider-container[data-tag]');
    
    allContainers.forEach((container, index) => {
        // 2. Garante um ID único para cada um
        if (!container.id) {
            container.id = `featured-slider-${index}`;
        }
        
        // 3. Pega a tag do HTML
        const tag = container.getAttribute('data-tag');
        
        // 4. Inicializa o slider com o ID e a TAG lida
        initializeFeaturedSlider(container.id, tag);
    });
});
