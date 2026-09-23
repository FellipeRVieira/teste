/* =========================================================
   FORJ3D — Efeitos da página de Produtos
   ========================================================= */

(() => {
  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  /* =========================================================
     HEADER — efeito de profundidade ao rolar
     ========================================================= */

  const header = document.querySelector("header");

  const updateHeader = () => {
    if (!header) return;

    header.classList.toggle(
      "scrolled",
      window.scrollY > 12
    );
  };

  updateHeader();

  window.addEventListener(
    "scroll",
    updateHeader,
    { passive: true }
  );


  /* =========================================================
     PARALLAX DO HERO
     ========================================================= */

  const hero = document.querySelector(".page-hero");

  let ticking = false;

  const updateParallax = () => {
    if (!hero) return;

    const rect = hero.getBoundingClientRect();

    const progress = Math.max(
      -1,
      Math.min(
        1,
        -rect.top / Math.max(rect.height, 1)
      )
    );

    hero.style.setProperty(
      "--hero-parallax",
      `${progress * 45}px`
    );

    ticking = false;
  };

  if (!reduceMotion) {
    window.addEventListener(
      "scroll",
      () => {
        if (!ticking) {
          requestAnimationFrame(updateParallax);
          ticking = true;
        }
      },
      { passive: true }
    );

    updateParallax();
  }


  /* =========================================================
     REVEAL — elementos aparecem conforme entram na tela
     ========================================================= */

  if (!reduceMotion) {

    const revealObserver = new IntersectionObserver(
      (entries) => {

        entries.forEach((entry) => {

          if (entry.isIntersecting) {

            entry.target.classList.add(
              "is-visible"
            );

            revealObserver.unobserve(
              entry.target
            );
          }

        });

      },
      {
        threshold: 0.08,
        rootMargin: "0px 0px -35px 0px"
      }
    );


    const prepareReveal = (root = document) => {

      root
        .querySelectorAll(
          ".card, .related-card, .results-meta"
        )
        .forEach((element) => {

          if (
            !element.classList.contains(
              "js-reveal"
            )
          ) {

            element.classList.add(
              "js-reveal"
            );

            revealObserver.observe(
              element
            );
          }

        });

    };


    prepareReveal();


    /* =====================================================
       OBSERVA NOVOS CARDS ADICIONADOS AO GRID
       (para aplicar o reveal ao aparecerem)
       ===================================================== */

    const prepareCards = (
      root = document
    ) => {

      prepareReveal(root);

    };


    prepareCards();


    /* =====================================================
       OBSERVER
       
       O produtos.js provavelmente cria os cards
       dinamicamente.

       Por isso observamos #grid e #relatedGrid.
       ===================================================== */

    const grid =
      document.querySelector("#grid");

    const relatedGrid =
      document.querySelector(
        "#relatedGrid"
      );


    const mutationObserver =
      new MutationObserver(() => {

        prepareCards();

      });


    if (grid) {

      mutationObserver.observe(
        grid,
        {
          childList: true,
          subtree: true
        }
      );

    }


    if (relatedGrid) {

      mutationObserver.observe(
        relatedGrid,
        {
          childList: true,
          subtree: true
        }
      );

    }

  }


  /* =========================================================
     IMAGENS

     Quando uma imagem termina de carregar,
     adicionamos uma classe para permitir animações.
     ========================================================= */

  document.addEventListener(
    "load",
    (event) => {

      if (
        event.target instanceof
        HTMLImageElement
      ) {

        event.target.classList.add(
          "img-loaded"
        );

      }

    },
    true
  );

})();