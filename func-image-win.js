    // Função para encontrar e definir a primeira imagem como og:image
    function setOgImage() {
        // A tag que queremos atualizar
        const ogImageTag = document.getElementById('ogImageTag');
        
        // Verifica se é uma página de item (postagem)
        // No Blogger, postType == 'item' é a postagem única.
        const isItemPage = 'content' in document.head.querySelector('meta[property="og:image"]'); 

        // Se for uma página de postagem E se a tag existir...
        if (isItemPage && ogImageTag) {
            
            // 1. Procura pela primeira imagem dentro do corpo do post (ou do feed)
            const firstImage = document.querySelector('.post-body img, .game-thumbnail');

            if (firstImage) {
                // 2. Obtém a URL da imagem
                const imageUrl = firstImage.src;
                
                // 3. Define a URL da imagem como o novo valor da Meta Tag
                ogImageTag.setAttribute('content', imageUrl);
            } else {
                // 4. Se não encontrar imagem, usa uma imagem padrão (seu logo, por exemplo)
                // Substitua a URL abaixo pela URL do seu logo
                const defaultImageUrl = 'URL_DO_SEU_LOGO_PADRÃO_AQUI'; 
                ogImageTag.setAttribute('content', defaultImageUrl);
            }
        }
    }

    // Chama a função assim que o conteúdo da página estiver pronto
    window.addEventListener('load', setOgImage);