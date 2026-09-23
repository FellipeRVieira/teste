(() => {
  'use strict';

  const root = document.documentElement;
  const body = document.body;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Barra de progresso da leitura */
  const progress = document.createElement('div');
  progress.className = 'scroll-progress';
  progress.setAttribute('aria-hidden', 'true');
  body.prepend(progress);

  let ticking = false;
  let lastScrollY = window.scrollY;

  const updateScroll = () => {
    const scrollTop = window.scrollY;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const percentage = maxScroll > 0 ? scrollTop / maxScroll : 0;

    root.style.setProperty('--scroll-progress', percentage.toFixed(4));

    const hero = document.querySelector('.hero');
    if (hero && !reducedMotion) {
      const shift = Math.min(scrollTop * 0.16, 110);
      hero.style.setProperty('--hero-shift', `${shift}px`);
    }

    lastScrollY = scrollTop;
    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(updateScroll);
      ticking = true;
    }
  }, { passive: true });

  updateScroll();

  /* Entrada das seções */
  const elements = document.querySelectorAll('[data-reveal]');

  if (!elements.length) return;

  if (reducedMotion || !('IntersectionObserver' in window)) {
    elements.forEach((el) => el.classList.add('is-visible'));
  } else {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        obs.unobserve(entry.target);
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -55px 0px'
    });

    elements.forEach((el, index) => {
      el.style.setProperty('--reveal-delay', `${Math.min(index * 55, 260)}ms`);
      observer.observe(el);
    });
  }

  /* Parallax multi-camada do hero (scroll + cursor) */
  const parallaxLayers = [...document.querySelectorAll('[data-parallax-layer]')];

  if (parallaxLayers.length && !reducedMotion) {
    const state = parallaxLayers.map((el) => ({
      el,
      speed: parseFloat(el.dataset.speed) || 0.3,
      pointerX: 0,
      pointerY: 0
    }));

    const heroEl = document.querySelector('.hero');
    let heroTicking = false;

    const applyLayers = () => {
      const scrollY = window.scrollY;
      state.forEach(({ el, speed, pointerX, pointerY }) => {
        const scrollShift = scrollY * speed * 0.18;
        el.style.setProperty('--py', `${(scrollShift + pointerY).toFixed(2)}px`);
        el.style.setProperty('--px', `${pointerX.toFixed(2)}px`);
      });
      heroTicking = false;
    };

    window.addEventListener('scroll', () => {
      if (heroTicking) return;
      window.requestAnimationFrame(applyLayers);
      heroTicking = true;
    }, { passive: true });

    if (heroEl && window.matchMedia('(pointer: fine)').matches) {
      let pointerFrame = null;
      heroEl.addEventListener('pointermove', (event) => {
        const rect = heroEl.getBoundingClientRect();
        const relX = (event.clientX - rect.left) / rect.width - 0.5;
        const relY = (event.clientY - rect.top) / rect.height - 0.5;

        cancelAnimationFrame(pointerFrame);
        pointerFrame = requestAnimationFrame(() => {
          state.forEach((layer) => {
            layer.pointerX = relX * layer.speed * -40;
            layer.pointerY = relY * layer.speed * -40;
          });
          applyLayers();
        });
      });

      heroEl.addEventListener('pointerleave', () => {
        state.forEach((layer) => {
          layer.pointerX = 0;
          layer.pointerY = 0;
        });
        applyLayers();
      });
    }

    applyLayers();
  }

  /* Movimento de profundidade para imagens */
  if (!reducedMotion) {
    const parallaxItems = document.querySelectorAll('.about__media img, .about__media video, .service-card img, .experience__item img');

    const parallax = () => {
      const viewportCenter = window.innerHeight / 2;

      parallaxItems.forEach((item) => {
        const rect = item.getBoundingClientRect();
        if (rect.bottom < -100 || rect.top > window.innerHeight + 100) return;

        const distance = (rect.top + rect.height / 2 - viewportCenter) * -0.035;
        item.style.setProperty('--parallax-y', `${distance.toFixed(2)}px`);
      });
    };

    let parallaxTicking = false;
    window.addEventListener('scroll', () => {
      if (parallaxTicking) return;
      window.requestAnimationFrame(() => {
        parallax();
        parallaxTicking = false;
      });
      parallaxTicking = true;
    }, { passive: true });

    parallax();
  }

  /* Luz suave acompanhando o cursor em telas grandes */
  if (!reducedMotion && window.matchMedia('(pointer: fine)').matches) {
    let pointerTimer;
    window.addEventListener('pointermove', (event) => {
      clearTimeout(pointerTimer);
      root.style.setProperty('--mouse-x', `${event.clientX}px`);
      root.style.setProperty('--mouse-y', `${event.clientY}px`);
      pointerTimer = setTimeout(() => {}, 40);
    }, { passive: true });
  }

  /* Destaque automático do item ativo no menu rápido do hero */
  const sections = [...document.querySelectorAll('main section[id]')];
  const links = [...document.querySelectorAll('.hero__quicklinks a, .nav-links a')];

  if ('IntersectionObserver' in window && sections.length && links.length) {
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((link) => {
          link.classList.toggle('is-active', link.getAttribute('href') === `#${entry.target.id}`);
        });
      });
    }, {
      rootMargin: '-35% 0px -55% 0px',
      threshold: 0
    });

    sections.forEach((section) => sectionObserver.observe(section));
  }
})();


/* Tilt 3D sutil nos elementos interativos */
if (!reducedMotion && window.matchMedia('(pointer: fine)').matches) {
  document.querySelectorAll('.service-card, .plan-card, .experience__item, .method-card').forEach((card) => {
    let frame = null;

    card.addEventListener('pointermove', (event) => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - .5;
      const y = (event.clientY - rect.top) / rect.height - .5;

      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        card.style.setProperty('--tilt-x', `${(-y * 3.5).toFixed(2)}deg`);
        card.style.setProperty('--tilt-y', `${(x * 3.5).toFixed(2)}deg`);
      });
    });

    card.addEventListener('pointerleave', () => {
      card.style.setProperty('--tilt-x', '0deg');
      card.style.setProperty('--tilt-y', '0deg');
    });
  });
}
