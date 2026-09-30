/* ==========================================================================
   SCRIPT.JS - COMPORTAMENTOS INTERATIVOS DA LANDING PAGE
   Gutemberg Amorim Advocacia Especializada em Golpes Financeiros
   Header dinâmico, menu mobile, acordeão FAQ, rolagem suave,
   balão do WhatsApp flutuante e traqueamento global de cliques via GTM.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initHeaderScroll();
  initMobileMenu();
  initFaqAccordion();
  initFloatingWhatsApp();
  initSmoothScroll();
  initGTMClickTracking();
});

/**
 * 1. HEADER DINÂMICO
 * Adiciona a classe 'scrolled' quando a página é rolada,
 * criando efeito de vidro fosco (glassmorphism) e compactando a barra.
 */
function initHeaderScroll() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  const handleScroll = () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll(); // Executa na montagem
}

/**
 * 2. MENU MOBILE RESPONSIVO
 * Alterna a visibilidade do menu de navegação em telas menores.
 */
function initMobileMenu() {
  const toggleBtn = document.getElementById('mobileMenuToggle');
  const navMenu = document.getElementById('headerNav');

  if (!toggleBtn || !navMenu) return;

  toggleBtn.addEventListener('click', () => {
    const isActive = navMenu.classList.toggle('active');
    toggleBtn.classList.toggle('active', isActive);
    toggleBtn.setAttribute('aria-expanded', isActive ? 'true' : 'false');
  });

  // Fecha o menu mobile ao clicar em qualquer link de navegação
  const navLinks = navMenu.querySelectorAll('a');
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('active');
      toggleBtn.classList.remove('active');
      toggleBtn.setAttribute('aria-expanded', 'false');
    });
  });
}

/**
 * 3. ACORDEÃO DE PERGUNTAS FREQUENTES (FAQ)
 * Abre e fecha respostas com transição suave, permitindo uma única pergunta aberta por vez.
 */
function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');
  if (!faqItems.length) return;

  faqItems.forEach(item => {
    const questionBtn = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');

    if (!questionBtn || !answer) return;

    questionBtn.addEventListener('click', () => {
      const isAlreadyActive = item.classList.contains('active');

      // Fecha todos os outros itens para manter o layout limpo
      faqItems.forEach(otherItem => {
        if (otherItem !== item) {
          otherItem.classList.remove('active');
          const otherAnswer = otherItem.querySelector('.faq-answer');
          if (otherAnswer) otherAnswer.style.maxHeight = null;
        }
      });

      // Alterna o item atual
      if (isAlreadyActive) {
        item.classList.remove('active');
        answer.style.maxHeight = null;
      } else {
        item.classList.add('active');
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
  });
}

/**
 * 4. BOTÃO WHATSAPP FLUTUANTE COM MINI BALÃO DE PERFIL
 * - Mostra o balão com a logo do escritório no hover e automaticamente após 4 segundos.
 * - Suporta toque em smartphones.
 */
function initFloatingWhatsApp() {
  const container = document.querySelector('.floating-whatsapp-container');
  if (!container) return;

  // Exibe o balão suavemente após 3.5 segundos para chamar atenção do visitante
  setTimeout(() => {
    container.classList.add('show-balloon');
    // Esconde automaticamente após 7 segundos caso o usuário não passe o mouse
    setTimeout(() => {
      if (!container.matches(':hover')) {
        container.classList.remove('show-balloon');
      }
    }, 7000);
  }, 3500);

  // Mantém ativo enquanto o mouse estiver sobre o container
  container.addEventListener('mouseenter', () => {
    container.classList.add('show-balloon');
  });

  container.addEventListener('mouseleave', () => {
    container.classList.remove('show-balloon');
  });
}

/**
 * 5. ROLAGEM SUAVE PARA ÂNCORAS INTERNAS
 * Deslocamento compensado considerando a altura do header fixo.
 */
function initSmoothScroll() {
  const anchorLinks = document.querySelectorAll('a[href^="#"]');

  anchorLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#' || targetId === '') return;

      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        const headerOffset = 70;
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
}

/**
 * 6. RASTREAMENTO GLOBAL DE CONVERSÃO GTM (CLASSE elementor_button)
 * Intercepta qualquer clique em botões com a classe 'elementor_button'
 * e despacha para o Google Tag Manager (dataLayer) e Meta Pixel.
 */
function initGTMClickTracking() {
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.elementor_button');
    if (btn) {
      const buttonText = btn.innerText ? btn.innerText.trim() : 'Botão WhatsApp';
      const buttonHref = btn.getAttribute('href') || '';

      // Disparo no dataLayer para o GTM
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: 'elementor_button_click',
        button_text: buttonText,
        button_destination: buttonHref,
        page_location: window.location.href
      });

      // Disparo no Meta Pixel (Facebook Ads)
      if (typeof fbq === 'function') {
        fbq('trackCustom', 'WhatsAppClick', {
          button_text: buttonText
        });
      }
    }
  });
}
