(() => {
  const header = document.getElementById('site-header');
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Navbar shadow on scroll
  const updateHeader = () => {
    header?.classList.toggle('scrolled', window.scrollY > 8);
  };
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  // Hero "layer counter" ambient animation
  const totalLayers = 312;
  let layer = 0;
  const layerLabel = document.getElementById('layer-count');
  const layerFill = document.getElementById('layer-fill');

  if (layerLabel && layerFill) {
    if (!prefersReduced) {
      setInterval(() => {
        layer = (layer + 7) % (totalLayers + 1);
        layerLabel.textContent = 'camada ' + String(layer).padStart(3, '0') + '/' + totalLayers;
        layerFill.style.width = (layer / totalLayers * 100) + '%';
      }, 220);
    } else {
      layerLabel.textContent = 'camada 312/312';
      layerFill.style.width = '100%';
    }
  }

  // Featured products — mesma fonte de dados do catálogo.
  const carousel = document.getElementById('carousel');
  const products = window.FORJ3D_PRODUCTS || [];
  const icons = window.FORJ3D_ICONS || {};
  const whatsappNumber = window.FORJ3D_CONFIG?.whatsappNumber || '5527997941766';

  // Antes era uma lista fixa de ids aqui no código. Agora quem decide
  // o que aparece na vitrine da Home é o checkbox "Mostrar este produto
  // na vitrine da página inicial" no painel (admin/) — Sávio controla
  // isso sozinho, sem precisar mexer em código.
  const featuredProducts = products.filter(product => product.featured);

  const getImages = product => Array.isArray(product.images)
    ? product.images.filter(Boolean)
    : [];

  const productVisual = product => {
    const images = getImages(product);
    if (images.length) {
      const hover = images.length > 1
        ? `<img class="card-img-hover" ${window.forj3dMediaAttrs(window.forj3dToThumbSrc(images[1]))} alt="" aria-hidden="true" loading="lazy" draggable="false" ${window.forj3dFallbackAttr(images[1])}>`
        : '';
      return `<img ${window.forj3dMediaAttrs(window.forj3dToThumbSrc(images[0]))} alt="${product.name}" loading="lazy" draggable="false" ${window.forj3dFallbackAttr(images[0])}>${hover}`;
    }
    return icons[product.icon] || '';
  };

  const productUrl = product => `produtos.html#produto/${product.id}`;

  const cardHTML = (product, i) => `
    <a class="card" style="--i:${i}" href="${productUrl(product)}" aria-label="Ver detalhes de ${product.name}">
      <div class="card-img">
        ${productVisual(product)}
        <div class="card-dots" aria-hidden="true">
          <span></span><span></span><span></span>
        </div>
      </div>
      <span class="card-cat mono">${product.category}</span>
      <div class="card-name">${product.name}</div>
      <div class="card-price">R$ ${product.price.toFixed(2).replace('.', ',')}</div>
      <span class="card-cta">Ver produto</span>
    </a>`;

  if (carousel) {
    carousel.innerHTML = featuredProducts.map((product, i) => cardHTML(product, i)).join('');
  }

  // Carousel controls
  const scrollCarousel = direction => {
    if (!carousel) return;
    const firstCard = carousel.querySelector('.card');
    const gap = parseFloat(getComputedStyle(carousel).gap || '20') || 20;
    const amount = firstCard ? firstCard.getBoundingClientRect().width + gap : 260;
    carousel.scrollBy({
      left: direction * amount,
      behavior: prefersReduced ? 'auto' : 'smooth'
    });
  };

  document.getElementById('nextBtn')?.addEventListener('click', () => scrollCarousel(1));
  document.getElementById('prevBtn')?.addEventListener('click', () => scrollCarousel(-1));

  // Keyboard support for the carousel controls.
  ['prevBtn', 'nextBtn'].forEach(id => {
    document.getElementById(id)?.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        document.getElementById(id).click();
      }
    });
  });

  // Mantém a navegação para WhatsApp centralizada caso algum destaque precise usar CTA no futuro.
  window.FORJ3D_WHATSAPP_URL = number => `https://wa.me/${number || whatsappNumber}`;

  // Scroll reveal da estrutura da Home.
  if (!prefersReduced) {
    const revealEls = document.querySelectorAll('.reveal');
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    revealEls.forEach(el => io.observe(el));
  } else {
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('in'));
  }
})();

// Formulário de contato — pop-up mobile
(() => {
  const trigger = document.getElementById('ctaMobileTrigger');
  const modal = document.getElementById('ctaFormModal');
  const closeBtn = document.getElementById('ctaFormModalClose');
  if (!trigger || !modal) return;

  function openModal() {
    modal.classList.add('open');
    document.body.classList.add('cta-modal-open');
  }

  function closeModal() {
    modal.classList.remove('open');
    document.body.classList.remove('cta-modal-open');
  }

  trigger.addEventListener('click', openModal);
  closeBtn?.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });

  window.forj3dCloseCtaModal = closeModal;
})();

// Formulário de contato — monta a mensagem e abre no WhatsApp
(() => {
  const form = document.getElementById('contatoForm');
  if (!form) return;

  const whatsappNumber = window.FORJ3D_CONFIG?.whatsappNumber || '5527997941766';

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const nome = form.nome.value.trim();
    const sobrenome = form.sobrenome.value.trim();
    const telefone = form.telefone.value.trim();
    const email = form.email.value.trim();
    const descricao = form.descricao.value.trim();

    const linhas = [
      `Olá! Meu nome é ${nome} ${sobrenome}.`,
      `Telefone: ${telefone}`,
      `E-mail: ${email}`,
      '',
      'Descrição da montagem do produto:',
      descricao
    ];

    const mensagem = encodeURIComponent(linhas.join('\n'));
    window.open(`https://wa.me/${whatsappNumber}?text=${mensagem}`, '_blank', 'noopener');
    window.forj3dCloseCtaModal?.();
  });
})();