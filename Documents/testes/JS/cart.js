/* =========================================================
   FORJ3D — Carrinho de compras
   Compartilhado entre index.html e produtos.html.
   Persiste no localStorage e finaliza o pedido pelo WhatsApp.
========================================================= */
(function () {

  const STORAGE_KEY = 'forj3d_cart';
  const whatsappNumber = window.FORJ3D_CONFIG?.whatsappNumber || "5500000000000";
  const products = window.FORJ3D_PRODUCTS || [];
  const icons = window.FORJ3D_ICONS || {};

  function getProduct(id) {
    return products.find(p => p.id === id);
  }

  function loadCart() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }

  let cart = loadCart();

  function money(v) {
    return 'R$ ' + v.toFixed(2).replace('.', ',');
  }

  function cartCount() {
    return cart.reduce((sum, item) => sum + item.qty, 0);
  }

  function cartTotal() {
    return cart.reduce((sum, item) => {
      const p = getProduct(item.id);
      return sum + (p ? p.price * item.qty : 0);
    }, 0);
  }

  function persist() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    renderCart();
    updateBadge();
    updateCheckoutLink();
  }

  function addToCart(id, qty = 1) {
    const existing = cart.find(item => item.id === id);
    if (existing) {
      existing.qty += qty;
    } else {
      cart.push({ id, qty });
    }
    persist();
    openCart();
  }

  function setQty(id, qty) {
    const item = cart.find(item => item.id === id);
    if (!item) return;
    if (qty <= 0) {
      cart = cart.filter(i => i.id !== id);
    } else {
      item.qty = qty;
    }
    persist();
  }

  function changeQty(id, delta) {
    const item = cart.find(item => item.id === id);
    if (!item) return;
    setQty(id, item.qty + delta);
  }

  function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    persist();
  }

  function clearCart() {
    cart = [];
    persist();
  }

  function itemVisual(p) {
    if (Array.isArray(p.images) && p.images.length) {
      return `<img ${window.forj3dMediaAttrs(window.forj3dToThumbSrc(p.images[0]))} alt="${p.name}" loading="lazy" draggable="false" ${window.forj3dFallbackAttr(p.images[0])}>`;
    }
    return icons[p.icon] || '';
  }

  function renderCart() {
    const list = document.getElementById('cartItems');
    if (!list) return;

    const emptyEl = document.getElementById('cartEmpty');
    const footerEl = document.getElementById('cartFooter');

    if (!cart.length) {
      list.innerHTML = '';
      if (emptyEl) emptyEl.hidden = false;
      if (footerEl) footerEl.hidden = true;
      return;
    }

    if (emptyEl) emptyEl.hidden = true;
    if (footerEl) footerEl.hidden = false;

    list.innerHTML = cart.map(item => {
      const p = getProduct(item.id);
      if (!p) return '';
      return `
        <div class="cart-item" data-id="${p.id}">
          <div class="cart-item-img">${itemVisual(p)}</div>
          <div class="cart-item-info">
            <div class="cart-item-top">
              <span class="cart-item-name">${p.name}</span>
              <span class="cart-item-price">${money(p.price)}</span>
            </div>
            <div class="cart-item-price-sub">${money(p.price)}</div>
            <div class="cart-item-row">
              <div class="qty-stepper">
                <button type="button" class="qty-btn" data-action="dec" aria-label="Diminuir quantidade">−</button>
                <span class="qty-value">${item.qty}</span>
                <button type="button" class="qty-btn" data-action="inc" aria-label="Aumentar quantidade">+</button>
              </div>
              <button type="button" class="cart-item-remove" data-action="remove">Remover</button>
            </div>
          </div>
        </div>`;
    }).join('');

    const totalEl = document.getElementById('cartTotal');
    if (totalEl) totalEl.textContent = money(cartTotal());
  }

  function updateBadge() {
    const count = cartCount();
    document.querySelectorAll('.cart-badge').forEach(badge => {
      badge.textContent = count;
      badge.hidden = count === 0;
    });
  }

  function buildCheckoutMessage() {
    if (!cart.length) return 'Olá! Gostaria de fazer um pedido.';
    const lines = cart.map(item => {
      const p = getProduct(item.id);
      if (!p) return '';
      return `• ${p.name} (x${item.qty}) — ${money(p.price * item.qty)}`;
    }).filter(Boolean);
    lines.push('', `Total: ${money(cartTotal())}`);
    return `Olá! Gostaria de fazer o seguinte pedido:\n\n${lines.join('\n')}`;
  }

  function updateCheckoutLink() {
    const link = document.getElementById('cartCheckout');
    if (!link) return;
    link.href = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(buildCheckoutMessage())}`;
  }

  function openCart() {
    const overlay = document.getElementById('cartOverlay');
    if (!overlay) return;
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeCart() {
    const overlay = document.getElementById('cartOverlay');
    if (!overlay) return;
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  function injectDrawer() {
    if (document.getElementById('cartOverlay')) return;

    const wrap = document.createElement('div');
    wrap.innerHTML = `
      <div class="cart-overlay" id="cartOverlay">
        <div class="cart-panel" role="dialog" aria-modal="true" aria-label="Seu carrinho">
          <div class="cart-header">
            <h2 class="display">Seu carrinho</h2>
            <button type="button" class="cart-close" id="cartClose" aria-label="Fechar carrinho">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
            </button>
          </div>
          <div class="cart-body">
            <div class="cart-items" id="cartItems"></div>
            <div class="cart-empty" id="cartEmpty">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 3h2l2.4 12.2a2 2 0 0 0 2 1.8h8.2a2 2 0 0 0 2-1.6L21 8H6"/><circle cx="9" cy="21" r="1"/><circle cx="18" cy="21" r="1"/></svg>
              <p>Seu carrinho está vazio.</p>
            </div>
          </div>
          <div class="cart-footer" id="cartFooter" hidden>
            <div class="cart-total-row">
              <span>Total</span>
              <span id="cartTotal">R$ 0,00</span>
            </div>
            <a class="btn btn-accent cart-checkout" id="cartCheckout" target="_blank" rel="noopener">Finalizar pelo WhatsApp</a>
            <button type="button" class="btn btn-outline cart-clear" id="cartClearBtn">Limpar carrinho</button>
          </div>
        </div>
      </div>`;
    document.body.appendChild(wrap.firstElementChild);

    document.getElementById('cartOverlay').addEventListener('click', e => {
      if (e.target.id === 'cartOverlay') closeCart();
    });
    document.getElementById('cartClose').addEventListener('click', closeCart);
    document.getElementById('cartClearBtn').addEventListener('click', clearCart);
    document.getElementById('cartItems').addEventListener('click', e => {
      const itemEl = e.target.closest('.cart-item');
      if (!itemEl) return;
      const id = Number(itemEl.dataset.id);
      const action = e.target.dataset.action;
      if (action === 'inc') changeQty(id, 1);
      if (action === 'dec') changeQty(id, -1);
      if (action === 'remove') removeFromCart(id);
    });
    document.addEventListener('keydown', e => {
      const overlay = document.getElementById('cartOverlay');
      if (e.key === 'Escape' && overlay && overlay.classList.contains('open')) closeCart();
    });
  }

  function wireTriggers() {
    document.querySelectorAll('[data-cart-open]').forEach(btn => {
      btn.addEventListener('click', openCart);
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    injectDrawer();
    wireTriggers();
    renderCart();
    updateBadge();
    updateCheckoutLink();
  });

  window.FORJ3D_CART = { addToCart, removeFromCart, changeQty, clearCart, openCart, closeCart };

})();
