// =============================================================================
// carrito.js — Carrito de compras: agregar, quitar, cantidad, panel lateral
// Necesita que config.js esté cargado ANTES que este archivo.
// =============================================================================

let cart = JSON.parse(localStorage.getItem('tw_cart') || '[]');

function addToCart(product) {
  const existing = cart.find(item => item.nombre === product.nombre);
  if (existing) { existing.qty += 1; }
  else { cart.push({ ...product, qty: 1 }); }
  saveCart(); updateCartUI();
  showToast(`${product.nombre} agregado al carrito 🛒`);
}

function removeFromCart(nombre) {
  cart = cart.filter(item => item.nombre !== nombre);
  saveCart(); updateCartUI();
}

function changeQty(nombre, delta) {
  const item = cart.find(i => i.nombre === nombre);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) removeFromCart(nombre);
  else { saveCart(); updateCartUI(); }
}

function saveCart() { localStorage.setItem('tw_cart', JSON.stringify(cart)); }

function updateCartUI() {
  const total = cart.reduce((s, i) => s + i.precio * i.qty, 0);
  const count = cart.reduce((s, i) => s + i.qty, 0);
  document.getElementById('cartCount').textContent    = count;
  document.getElementById('cartCountFab').textContent = count;
  const itemsEl  = document.getElementById('cartItems');
  const footerEl = document.getElementById('cartFooter');
  if (!cart.length) {
    itemsEl.innerHTML = `<div class="cart-empty"><i class="fas fa-shopping-cart"></i><p>Tu carrito está vacío</p><p class="cart-empty-sub">Agregá productos para consultar</p></div>`;
    footerEl.style.display = 'none';
    return;
  }
  footerEl.style.display = 'block';
  document.getElementById('cartTotal').textContent = `$${total.toLocaleString('es-AR')}`;
  itemsEl.innerHTML = cart.map(item => {
    const icon = CONFIG.ICONOS[item.categoria] || CONFIG.ICONOS['default'];
    const imgHtml = item.imagen
      ? `<img src="${item.imagen}" alt="${item.nombre}" style="width:100%;height:100%;object-fit:cover;border-radius:8px;">`
      : icon;
    return `
      <div class="cart-item">
        <div class="cart-item-icon">${imgHtml}</div>
        <div class="cart-item-info">
          <div class="cart-item-name">${item.nombre}</div>
          <div class="cart-item-price">${item.precioDisplay}</div>
        </div>
        <div class="cart-item-qty">
          <button class="qty-btn" onclick="changeQty('${item.nombre}', -1)">−</button>
          <span class="qty-num">${item.qty}</span>
          <button class="qty-btn" onclick="changeQty('${item.nombre}', 1)">+</button>
        </div>
      </div>`;
  }).join('');
  const listaMsg = cart.map(i => `• ${i.nombre} x${i.qty} (${i.precioDisplay})`).join('%0A');
  const msg = `Hola Technical World! Me interesan estos productos:%0A%0A${listaMsg}%0A%0ATotal: $${total.toLocaleString('es-AR')}%0A%0APueden confirmar disponibilidad? 🙌`;
  document.getElementById('cartWaBtn').href = `https://wa.me/${CONFIG.WA_NUMBER}?text=${msg}`;
}

function toggleCart() {
  document.getElementById('cartPanel').classList.toggle('open');
  document.getElementById('cartOverlay').classList.toggle('open');
}

function showToast(mensaje) {
  const t = document.createElement('div');
  t.className = 'toast-notif';
  t.innerHTML = `<i class="fas fa-check-circle"></i> ${mensaje}`;
  document.getElementById('toastContainer').appendChild(t);
  setTimeout(() => t.remove(), 3000);
}