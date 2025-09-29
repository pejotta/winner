// --- CONFIGURAÇÃO GLOBAL (ÚNICA) ---
const BLOG_URL = 'https://winner-games-blogger.blogspot.com'; // SEU DOMÍNIO
const POSTS_PER_PAGE = 12; // Busca 8 posts para garantir 2 páginas de 4
const MINI_GRID_SIZE = 4; // 4 miniaturas por slide
// ------------------------------------

const gridInstances = {};

// Função de callback global para o JSONP (direciona os dados)
window.handleMiniGridFeed = function(json) {
    const script = document.currentScript;
    const sliderId = script.getAttribute('data-slider-id');
    
    if (!sliderId || !gridInstances[sliderId]) return;
    
    const instance = gridInstances[sliderId];
    
    if (!json.feed || !json.feed.entry || json.feed.entry.length === 0) {
        instance.container.style.display = 'none'; // Oculta se não houver posts
        return;
    }

    // A lógica de renderização e navegação está dentro de 'instance'
    instance.postsData = json.feed.entry;
    instance.renderGridSlides();
    instance.setupNavigation();
};

/**
 * Inicializa a busca e configura o grid slider para um widget específico.
 */
function initializeMiniGridSlider(sliderId, targetTag) {
    const container = document.getElementById(sliderId);
    if (!container) return;

    // --- VARIÁVEIS DE ESTADO LOCAIS ---
    let currentSlide = 0;
    
    const postsContainer = container.querySelector('.grid-content');
    const prevBtn = container.querySelector('.prev-btn');
    const nextBtn = container.querySelector('.next-btn');
    
    // --- FUNÇÕES DE CONTROLE LOCAIS ---

    const renderGridSlides = () => {
        let html = '';
        const data = gridInstances[sliderId].postsData;
        const totalPosts = data.length;
        
        // Calcula o número de slides/páginas (ceil arredonda para cima)
        const totalSlides = Math.ceil(totalPosts / MINI_GRID_SIZE);
        gridInstances[sliderId].totalSlides = totalSlides;

        // Itera sobre os posts e agrupa-os em divs 'grid-slide'
        for (let i = 0; i < totalSlides; i++) {
            // Abre o slide (a "página" do slider)
            html += `<div class="grid-slide">`;
            
            // Pega os 4 (ou menos) posts para esta página
            const start = i * MINI_GRID_SIZE;
            const end = Math.min(start + MINI_GRID_SIZE, totalPosts);
            
            for (let j = start; j < end; j++) {
                const post = data[j];
                const postLink = post.link.find(l => l.rel === 'alternate').href;
                let imageUrl = post.media$thumbnail ? post.media$thumbnail.url : 'URL_DE_IMAGEM_PADRAO_AQUI'; 
                
                // Ajuste para miniatura maior
                if (imageUrl.includes('s72-c')) {
                    imageUrl = imageUrl.replace('s72-c', 's300'); // s300 é um bom tamanho para miniatura
                }

                const title = post.title.$t;

                html += `
                    <a href="${postLink}" class="grid-item" title="${title}">
                        <div class="item-image-area">
                            <img src="${imageUrl}" alt="${title}" class="item-image"/>
                        </div>
                        <p class="item-title">${title}</p>
                    </a>
                `;
            }

            // Fecha o slide
            html += `</div>`;
        }
        
        postsContainer.innerHTML = html;
        // Posiciona no primeiro slide (0)
        moveSlider(0);
    };
    
    const moveSlider = (index) => {
        const totalSlides = gridInstances[sliderId].totalSlides;
        
        if (index < 0) {
            currentSlide = totalSlides - 1;
        } else if (index >= totalSlides) {
            currentSlide = 0;
        } else {
            currentSlide = index;
        }
        
        const offset = -currentSlide * 100;
        postsContainer.style.transform = `translateX(${offset}%)`;
    };

    const setupNavigation = () => {
        const totalSlides = gridInstances[sliderId].totalSlides;
        
        // Só adiciona navegação se houver mais de uma página
        if (totalSlides > 1) {
            if (prevBtn) prevBtn.onclick = () => moveSlider(currentSlide - 1);
            if (nextBtn) nextBtn.onclick = () => moveSlider(currentSlide + 1);
        } else {
            // Oculta os botões se só houver uma página
            if (prevBtn) prevBtn.style.display = 'none';
            if (nextBtn) nextBtn.style.display = 'none';
        }
    };

    // --- REGISTRO E INÍCIO DA BUSCA ---
    
    // 1. Registra a instância no objeto global
    gridInstances[sliderId] = {
        container, postsContainer, totalSlides: 0, postsData: [],
        renderGridSlides, setupNavigation
    };
    
    // 2. Inicia a busca JSONP
    const feedUrl = `${BLOG_URL}/feeds/posts/summary/-/${targetTag}?alt=json-in-script&max-results=${POSTS_PER_PAGE}`;
    const script = document.createElement('script');
    script.src = feedUrl + '&callback=handleMiniGridFeed';
    script.setAttribute('data-slider-id', sliderId); 
    document.head.appendChild(script);

    // 3. Atualiza o título
    const titleElement = container.querySelector('.mini-grid-title-tag');
    if (titleElement) titleElement.textContent = targetTag;
}

// --- PONTO DE ENTRADA CORRIGIDO (Inicialização Atrasada e Segura) ---
function safeInitializeMiniGrids() {
    // Atraso de 100ms para garantir que todos os widgets do Blogger foram renderizados.
    setTimeout(() => {
        const allContainers = document.querySelectorAll('.mini-grid-container[data-tag]');
        
        allContainers.forEach((container, index) => {
            if (!container.id) {
                container.id = `mini-grid-${index}`;
            }
            const tag = container.getAttribute('data-tag');
            initializeMiniGridSlider(container.id, tag);
        });
        
    }, 100); 
}

// Inicia a função de inicialização após o carregamento completo da página
window.addEventListener('load', safeInitializeMiniGrids);
