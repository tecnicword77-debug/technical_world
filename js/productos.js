// =============================================================================
// productos.js — Carga de productos desde Google Sheets, tarjetas, filtros y modal
// Necesita que config.js esté cargado ANTES que este archivo.
// =============================================================================

let allProducts     = [];
let modalImages     = [];
let modalCurrentIdx = 0;

document.addEventListener('DOMContentLoaded', () => {
  loadProducts();
  updateCartUI(); // definida en carrito.js
});

// =============================================================================
// CARGA DE PRODUCTOS
// =============================================================================
async function loadProducts() {
  if (!CONFIG.SHEET_ID) {
    document.getElementById('productsGrid').innerHTML = '';
    document.getElementById('sheetsNotice').style.display = 'block';
    return;
  }
  try {
    const url  = `https://docs.google.com/spreadsheets/d/${CONFIG.SHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(CONFIG.SHEET_NAME)}`;
    const res  = await fetch(url);
    const text = await res.text();
    const json = JSON.parse(text.substring(47, text.length - 2));
    const cols = json.table.cols.map(c => c.label.toLowerCase().trim());

    allProducts = json.table.rows
      .map(row => {
        const obj = {};
        cols.forEach((col, i) => { obj[col] = row.c[i]?.v ?? ''; });
        return obj;
      })
      .filter(p => {
        const d = String(p[CONFIG.COL_DISPONIBLE]).toLowerCase().trim();
        return d !== 'no' && d !== 'false';
      });

    buildDynamicUI();
    renderProducts(allProducts);

  } catch (err) {
    console.error('Error al cargar productos:', err);
    document.getElementById('productsGrid').innerHTML = `
      <div class="no-products">
        <i class="fas fa-exclamation-triangle"></i>
        <p>No se pudieron cargar los productos.</p>
        <p class="no-products-sub">Revisá la configuración del Google Sheets.</p>
      </div>`;
  }
}

// =============================================================================
// CONSTRUIR CATEGORÍAS Y FILTROS DINÁMICAMENTE
// =============================================================================
function buildDynamicUI() {
  // Categorías únicas en orden de aparición en la hoja
  const categorias = [...new Set(
    allProducts
      .map(p => String(p[CONFIG.COL_CATEGORIA]).trim())
      .filter(Boolean)
  )];

  // Tarjetas de categorías (sección hero)
  document.getElementById('categoriesGrid').innerHTML = categorias.map(cat => {
    const icon = CONFIG.ICONOS[cat] || CONFIG.ICONOS['default'];
    return `
      <div class="col-6 col-sm-4 col-md-2">
        <div class="category-card" onclick="filterCategory('${cat}')">
          <div class="category-icon">${icon}</div>
          <div class="category-name">${cat}</div>
        </div>
      </div>`;
  }).join('');

  // Botones de filtro
  document.getElementById('filterBar').innerHTML =
    `<button class="filter-btn active" onclick="filterProducts('Todos', this)">Todos</button>` +
    categorias.map(cat =>
      `<button class="filter-btn" onclick="filterProducts('${cat}', this)">${cat}</button>`
    ).join('');
}

// =============================================================================
// PARSEO DE PRECIOS — Robusto para cualquier formato de Google Sheets
// Maneja: número JS nativo (gviz), "$3,573.00" (US), "3.573,00" (AR/EU), "3573"
// =============================================================================
function parsePrecio(val) {
  if (val === '' || val === null || val === undefined) return 0;
  // gviz devuelve números como JS number — usar directo, sin string manipulation
  if (typeof val === 'number') return isFinite(val) ? Math.round(val * 100) / 100 : 0;
  // Limpiar símbolo de moneda y espacios
  const s = String(val).replace(/[$€£¥\s]/g, '').trim();
  if (!s) return 0;
  const lastDot   = s.lastIndexOf('.');
  const lastComma = s.lastIndexOf(',');
  if (lastDot > lastComma) {
    // Formato US: 1,500.50 → el punto es el decimal
    return parseFloat(s.replace(/,/g, '')) || 0;
  } else if (lastComma > lastDot) {
    // Formato AR/EU: 1.500,50 → la coma es el decimal
    return parseFloat(s.replace(/\./g, '').replace(',', '.')) || 0;
  }
  return parseFloat(s) || 0;
}

function renderProducts(products) {
  const grid = document.getElementById('productsGrid');
  if (!products.length) {
    grid.innerHTML = `<div class="no-products"><i class="fas fa-box-open"></i><p>No hay productos en esta categoría.</p></div>`;
    return;
  }
  grid.innerHTML = products.map(p => buildProductCard(p)).join('');
}

function buildProductCard(p) {
  const icon          = CONFIG.ICONOS[p[CONFIG.COL_CATEGORIA]] || CONFIG.ICONOS['default'];
  const imgHtml       = p[CONFIG.COL_IMAGEN]
    ? `<img src="${p[CONFIG.COL_IMAGEN]}" alt="${p[CONFIG.COL_NOMBRE]}" loading="lazy">`
    : `<span class="product-img-placeholder">${icon}</span>`;

  // — Precios —
  const precioNum     = parsePrecio(p[CONFIG.COL_PRECIO]);
  const ofertaNum     = parsePrecio(p[CONFIG.COL_OFERTA]);
  const tieneOferta   = ofertaNum > 0 && ofertaNum < precioNum;
  const precioDisplay = tieneOferta
    ? `$${ofertaNum.toLocaleString('es-AR')}`
    : (precioNum > 0 ? `$${precioNum.toLocaleString('es-AR')}` : 'Consultar');

  // — Badges —
  // Si tiene oferta, el badge de oferta tiene prioridad visual
  const badgeOferta   = tieneOferta
    ? `<span class="product-badge badge-oferta">🔥 OFERTA</span>` : '';
  const badgeCustom   = p[CONFIG.COL_BADGE] && !tieneOferta
    ? `<span class="product-badge">${p[CONFIG.COL_BADGE]}</span>` : '';

  // — Bloque de precio en la tarjeta —
  const precioHtml    = tieneOferta
    ? `<div class="price-block">
         <span class="price-original">$${precioNum.toLocaleString('es-AR')}</span>
         <span class="product-price price-oferta">${precioDisplay}</span>
       </div>`
    : `<span class="product-price">${precioDisplay}</span>`;

  const prod = {
    nombre: p[CONFIG.COL_NOMBRE], precio: tieneOferta ? ofertaNum : precioNum,
    precioDisplay, precioOriginal: tieneOferta ? `$${precioNum.toLocaleString('es-AR')}` : '',
    tieneOferta, categoria: p[CONFIG.COL_CATEGORIA], descripcion: p[CONFIG.COL_DESCRIPCION] || '',
    badge: p[CONFIG.COL_BADGE] || '', imagen: p[CONFIG.COL_IMAGEN] || '',
    imagen2: p[CONFIG.COL_IMAGEN2] || '', imagen3: p[CONFIG.COL_IMAGEN3] || '',
    imagen4: p[CONFIG.COL_IMAGEN4] || '',
  };
  const cartProd = { nombre: prod.nombre, precio: prod.precio, precioDisplay, categoria: prod.categoria, imagen: prod.imagen };

  return `
    <div class="product-card" data-categoria="${p[CONFIG.COL_CATEGORIA]}" onclick='openModal(${JSON.stringify(prod)})'>
      <div class="product-img-wrap">${imgHtml}${badgeOferta}${badgeCustom}</div>
      <div class="product-body">
        <div class="product-cat">${p[CONFIG.COL_CATEGORIA] || ''}</div>
        <div class="product-name">${p[CONFIG.COL_NOMBRE]}</div>
        <div class="product-desc">${p[CONFIG.COL_DESCRIPCION] || ''}</div>
        <div class="product-footer">
          ${precioHtml}
          <button class="add-cart-btn" onclick='event.stopPropagation(); addToCart(${JSON.stringify(cartProd)})'>
            <i class="fas fa-cart-plus"></i>
          </button>
        </div>
      </div>
    </div>`;
}

// =============================================================================
// FILTROS
// =============================================================================
function filterProducts(categoria, btn) {
  if (btn) {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  }
  const filtrados = categoria === 'Todos'
    ? allProducts
    : allProducts.filter(p => p[CONFIG.COL_CATEGORIA] === categoria);
  renderProducts(filtrados);
  document.getElementById('productos').scrollIntoView({ behavior: 'smooth' });
}

function filterCategory(categoria) {
  document.querySelectorAll('.filter-btn').forEach(b => {
    b.classList.toggle('active', b.textContent.trim() === categoria);
  });
  filterProducts(categoria, null);
}

// =============================================================================
// MODAL DE PRODUCTO CON GALERÍA
// =============================================================================
function openModal(p) {
  // Armar array con las imágenes disponibles (omite los campos vacíos)
  modalImages     = [p.imagen, p.imagen2, p.imagen3, p.imagen4].filter(Boolean);
  modalCurrentIdx = 0;

  const icon     = CONFIG.ICONOS[p.categoria] || CONFIG.ICONOS['default'];
  const mainEl   = document.getElementById('modalImgMain');
  const thumbsEl = document.getElementById('modalThumbs');

  // Imagen principal
  if (modalImages.length > 0) {
    mainEl.innerHTML = `<img src="${modalImages[0]}" alt="${p.nombre}">`;
  } else {
    mainEl.innerHTML = `<span class="modal-img-placeholder-big">${icon}</span>`;
  }

  // Flechas (solo si hay más de una imagen)
  if (modalImages.length > 1) {
    mainEl.insertAdjacentHTML('beforeend', `
      <button class="modal-arrow modal-arrow-left"  onclick="event.stopPropagation(); changeModalImage(-1)"><i class="fas fa-chevron-left"></i></button>
      <button class="modal-arrow modal-arrow-right" onclick="event.stopPropagation(); changeModalImage(1)"><i class="fas fa-chevron-right"></i></button>`);
    thumbsEl.style.display = 'flex';
    thumbsEl.innerHTML = modalImages.map((img, i) => `
      <div class="modal-thumb ${i === 0 ? 'active' : ''}" onclick="setModalImage(${i})">
        <img src="${img}" alt="Foto ${i + 1}" loading="lazy">
      </div>`).join('');
  } else {
    thumbsEl.style.display = 'none';
    thumbsEl.innerHTML = '';
  }

  // Info del producto
  const modalPrecioHtml = p.tieneOferta
    ? `<div class="price-block">
         <span class="price-original price-original-lg">${p.precioOriginal}</span>
         <span class="modal-price price-oferta-lg">${p.precioDisplay}</span>
       </div>`
    : `<div class="modal-price">${p.precioDisplay}</div>`;

  document.getElementById('modalInfo').innerHTML = `
    ${p.badge ? `<span class="modal-badge">${p.badge}</span>` : ''}
    ${p.tieneOferta ? `<span class="modal-badge badge-oferta-modal">🔥 OFERTA</span>` : ''}
    <div class="modal-cat">${p.categoria}</div>
    <div class="modal-name">${p.nombre}</div>
    <div class="modal-desc">${p.descripcion || 'Sin descripción disponible.'}</div>
    ${modalPrecioHtml}
    <button class="modal-add-btn" onclick='addToCart(${JSON.stringify({
      nombre: p.nombre, precio: p.precio, precioDisplay: p.precioDisplay,
      categoria: p.categoria, imagen: p.imagen
    })})'>
      <i class="fas fa-cart-plus"></i> Agregar al carrito
    </button>`;

  document.getElementById('productModalOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function setModalImage(idx) {
  modalCurrentIdx = idx;
  const img = document.getElementById('modalImgMain').querySelector('img');
  if (img) img.src = modalImages[idx];
  document.querySelectorAll('.modal-thumb').forEach((t, i) =>
    t.classList.toggle('active', i === idx)
  );
}

function changeModalImage(delta) {
  setModalImage((modalCurrentIdx + delta + modalImages.length) % modalImages.length);
}

function closeModal() {
  document.getElementById('productModalOverlay').classList.remove('open');
  document.body.style.overflow = '';
}

function closeModalOnOverlay(e) {
  if (e.target === document.getElementById('productModalOverlay')) closeModal();
}

document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });