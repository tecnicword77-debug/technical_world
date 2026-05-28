// =============================================================================
// app.js — Lógica principal de Technic World
// =============================================================================
// Este archivo maneja todo lo que "hace" la página:
//   · Cargar los productos desde Google Sheets
//   · Mostrar las tarjetas de productos
//   · Filtrar por categoría
//   · El carrito (agregar, quitar, cambiar cantidad)
//   · El panel lateral del carrito
//   · Las notificaciones (toasts)
//
// Necesita que config.js esté cargado ANTES que este archivo.
// (En el HTML, el <script src="js/config.js"> va primero)
// =============================================================================


// =============================================================================
// ESTADO GLOBAL
// =============================================================================
// Variables que "viven" durante toda la sesión del usuario en la página.

// Todos los productos cargados desde Google Sheets (sin filtrar)
let allProducts = [];

// El carrito: array de objetos { nombre, precio, precioDisplay, categoria, imagen, qty }
// Lo guardamos en localStorage para que no se pierda si el usuario recarga la página.
// JSON.parse convierte el texto guardado de vuelta a un array de objetos.
let cart = JSON.parse(localStorage.getItem('tw_cart') || '[]');


// =============================================================================
// INICIALIZACIÓN
// =============================================================================
// DOMContentLoaded se dispara cuando el HTML terminó de cargarse.
// Recién ahí podemos tocar elementos de la página con JS.

document.addEventListener('DOMContentLoaded', () => {

  // Cargar los productos desde Google Sheets
  loadProducts();

  // Actualizar la UI del carrito con lo que estaba guardado (si había algo)
  updateCartUI();

});


// =============================================================================
// GOOGLE SHEETS — CARGA DE PRODUCTOS
// =============================================================================

async function loadProducts() {
  // Si no hay SHEET_ID configurado, mostrar el aviso y salir
  if (!CONFIG.SHEET_ID) {
    document.getElementById('productsGrid').innerHTML = '';
    document.getElementById('sheetsNotice').style.display = 'block';
    return;
  }

  try {
    // Google Sheets tiene una URL especial para obtener los datos en formato JSON.
    // gviz/tq?tqx=out:json  →  devuelve los datos de la hoja como JSON
    // encodeURIComponent     →  convierte caracteres especiales para la URL (ej: espacios → %20)
    const url = `https://docs.google.com/spreadsheets/d/${CONFIG.SHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(CONFIG.SHEET_NAME)}`;

    // fetch() hace una petición HTTP a esa URL (trae los datos de internet)
    // await espera a que llegue la respuesta antes de continuar
    const res  = await fetch(url);
    const text = await res.text();

    // Google no devuelve JSON puro, sino algo así:
    // /*O_o*/google.visualization.Query.setResponse({...});
    // Con substring sacamos solo la parte JSON (desde el caracter 47 hasta el anteúltimo)
    const json = JSON.parse(text.substring(47, text.length - 2));

    // json.table.cols tiene los encabezados de la planilla
    // .map() transforma cada columna en solo su label (nombre) en minúsculas
    const cols = json.table.cols.map(c => c.label.toLowerCase().trim());

    // json.table.rows tiene las filas de datos
    // Transformamos cada fila en un objeto { nombre: '...', precio: '...', etc. }
    allProducts = json.table.rows
      .map(row => {
        const obj = {};
        // Para cada columna, asignamos el valor de esa celda al objeto
        // row.c[i]?.v  →  el valor de la celda i (el ?. evita error si la celda está vacía)
        // ?? ''         →  si el valor es null o undefined, usamos string vacío
        cols.forEach((col, i) => {
          obj[col] = row.c[i]?.v ?? '';
        });
        return obj;
      })
      // Filtramos los productos que tengan disponible = "no" o false
      // Solo mostramos los que dicen "si" (o cualquier valor que no sea "no")
      .filter(p => {
        const disp = String(p[CONFIG.COL_DISPONIBLE]).toLowerCase().trim();
        return disp !== 'no' && disp !== 'false';
      });

    // Renderizar todos los productos (sin filtro activo)
    renderProducts(allProducts);

  } catch (err) {
    // Si algo falla (sin internet, ID incorrecto, etc.) mostramos un mensaje de error
    console.error('Error al cargar productos desde Google Sheets:', err);
    document.getElementById('productsGrid').innerHTML = `
      <div class="no-products">
        <i class="fas fa-exclamation-triangle"></i>
        <p>No se pudieron cargar los productos.</p>
        <p class="no-products-sub">Revisá la configuración del Google Sheets en js/config.js</p>
      </div>
    `;
  }
}


// =============================================================================
// RENDERIZAR PRODUCTOS
// =============================================================================
// Recibe un array de productos y construye las tarjetas HTML en la grilla.

function renderProducts(products) {
  const grid = document.getElementById('productsGrid');

  // Si no hay productos para mostrar (ej: categoría vacía)
  if (!products.length) {
    grid.innerHTML = `
      <div class="no-products">
        <i class="fas fa-box-open"></i>
        <p>No hay productos en esta categoría.</p>
      </div>
    `;
    return;
  }

  // .map() convierte cada objeto producto en un string de HTML
  // .join('') une todos los strings en uno solo (sin coma entre ellos)
  grid.innerHTML = products.map(p => buildProductCard(p)).join('');
}


// =============================================================================
// CONSTRUIR TARJETA DE PRODUCTO
// =============================================================================
// Recibe un objeto producto y devuelve el HTML de la tarjeta.
// Separarlo en su propia función hace el código más fácil de leer y modificar.

function buildProductCard(p) {

  // Ícono de la categoría (para cuando no hay imagen)
  const icon = CONFIG.ICONOS[p[CONFIG.COL_CATEGORIA]] || CONFIG.ICONOS['default'];

  // Si el producto tiene URL de imagen, mostramos la imagen.
  // Si no, mostramos el emoji de la categoría como placeholder.
  const imgHtml = p[CONFIG.COL_IMAGEN]
    ? `<img src="${p[CONFIG.COL_IMAGEN]}" alt="${p[CONFIG.COL_NOMBRE]}" loading="lazy">`
    : `<span class="product-img-placeholder">${icon}</span>`;

  // Badge opcional ("Nuevo", "Oferta", etc.)
  // Si no hay badge en la planilla, no mostramos nada
  const badgeHtml = p[CONFIG.COL_BADGE]
    ? `<span class="product-badge">${p[CONFIG.COL_BADGE]}</span>`
    : '';

  // Convertir el precio a número para poder operar con él
  // Primero sacamos puntos de miles (1.500 → 1500) y cambiamos coma por punto (1,5 → 1.5)
  const precioNum = parseFloat(
    String(p[CONFIG.COL_PRECIO]).replace(/\./g, '').replace(',', '.')
  ) || 0;

  // Formato de precio para mostrar: si es 0, mostramos "Consultar"
  // toLocaleString('es-AR') agrega puntos de miles: 5500 → "5.500"
  const precioDisplay = precioNum > 0
    ? `$${precioNum.toLocaleString('es-AR')}`
    : 'Consultar';

  // Creamos el objeto producto que vamos a pasar al carrito
  // JSON.stringify lo convierte a texto para poder pasarlo como atributo HTML
  // (los atributos HTML solo aceptan strings)
  const productoParaCarrito = JSON.stringify({
    nombre:       p[CONFIG.COL_NOMBRE],
    precio:       precioNum,
    precioDisplay: precioDisplay,
    categoria:    p[CONFIG.COL_CATEGORIA],
    imagen:       p[CONFIG.COL_IMAGEN] || '',
  });

  // Retornamos el HTML completo de la tarjeta
  // Las comillas simples en el onclick evitan conflictos con las dobles del JSON
  return `
    <div class="product-card" data-categoria="${p[CONFIG.COL_CATEGORIA]}">

      <div class="product-img-wrap">
        ${imgHtml}
        ${badgeHtml}
      </div>

      <div class="product-body">
        <div class="product-cat">${p[CONFIG.COL_CATEGORIA] || ''}</div>
        <div class="product-name">${p[CONFIG.COL_NOMBRE]}</div>
        <div class="product-desc">${p[CONFIG.COL_DESCRIPCION] || ''}</div>
        <div class="product-footer">
          <span class="product-price">${precioDisplay}</span>
          <button class="add-cart-btn" onclick='addToCart(${productoParaCarrito})'>
            <i class="fas fa-cart-plus"></i>
          </button>
        </div>
      </div>

    </div>
  `;
}


// =============================================================================
// FILTROS DE CATEGORÍA
// =============================================================================

// filterProducts: se llama desde los botones de la barra de filtros
// Recibe la categoría elegida y el botón que se clickeó (para marcar como activo)
function filterProducts(categoria, btn) {

  // Si nos pasan el botón, actualizamos cuál está marcado como "active"
  if (btn) {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  }

  // Filtrar: si eligieron "Todos", mostramos todo; sino, filtramos por categoría
  const filtrados = categoria === 'Todos'
    ? allProducts
    : allProducts.filter(p => p[CONFIG.COL_CATEGORIA] === categoria);

  renderProducts(filtrados);

  // Hacer scroll suave hasta la sección de productos
  document.getElementById('productos').scrollIntoView({ behavior: 'smooth' });
}


// filterCategory: se llama desde las tarjetas de categorías (sección de arriba)
// Es igual a filterProducts pero también actualiza los botones de filtro
function filterCategory(categoria) {

  // Actualizar el botón correspondiente en la barra de filtros
  document.querySelectorAll('.filter-btn').forEach(b => {
    b.classList.toggle('active', b.textContent.trim() === categoria);
  });

  filterProducts(categoria, null);
}


// =============================================================================
// CARRITO — AGREGAR PRODUCTO
// =============================================================================

function addToCart(product) {

  // Buscar si el producto ya existe en el carrito
  const existing = cart.find(item => item.nombre === product.nombre);

  if (existing) {
    // Si ya existe, solo aumentamos la cantidad
    existing.qty += 1;
  } else {
    // Si no existe, lo agregamos con cantidad 1
    cart.push({ ...product, qty: 1 });
    // { ...product } es el "spread operator": copia todas las propiedades del objeto
  }

  saveCart();    // Guardar en localStorage
  updateCartUI(); // Actualizar lo que se ve en pantalla
  showToast(`${product.nombre} agregado al carrito 🛒`);
}


// =============================================================================
// CARRITO — QUITAR PRODUCTO
// =============================================================================

function removeFromCart(nombre) {

  // .filter() crea un nuevo array sin el producto que queremos quitar
  cart = cart.filter(item => item.nombre !== nombre);

  saveCart();
  updateCartUI();
}


// =============================================================================
// CARRITO — CAMBIAR CANTIDAD
// =============================================================================

function changeQty(nombre, delta) {
  // delta = +1 para sumar, -1 para restar

  const item = cart.find(i => i.nombre === nombre);
  if (!item) return; // Si no existe, no hacemos nada

  item.qty += delta;

  // Si la cantidad llega a 0 o menos, eliminamos el producto del carrito
  if (item.qty <= 0) {
    removeFromCart(nombre);
  } else {
    saveCart();
    updateCartUI();
  }
}


// =============================================================================
// CARRITO — GUARDAR EN LOCALSTORAGE
// =============================================================================
// localStorage es un "guardado" en el navegador del usuario.
// Persiste aunque cierre la pestaña o recargue la página.
// JSON.stringify convierte el array a texto para poder guardarlo.

function saveCart() {
  localStorage.setItem('tw_cart', JSON.stringify(cart));
}


// =============================================================================
// CARRITO — ACTUALIZAR LA INTERFAZ
// =============================================================================
// Esta función refleja el estado actual del carrito en pantalla:
// · El número en el botón del navbar
// · La lista de productos en el panel lateral
// · El total
// · La URL del botón de WhatsApp

function updateCartUI() {

  // Calcular totales
  const total = cart.reduce((suma, item) => suma + item.precio * item.qty, 0);
  const count = cart.reduce((suma, item) => suma + item.qty, 0);
  // .reduce() recorre el array acumulando un valor (suma)

  // Actualizar el contador en el botón del navbar
  document.getElementById('cartCount').textContent = count;

  const itemsEl  = document.getElementById('cartItems');
  const footerEl = document.getElementById('cartFooter');
  const totalEl  = document.getElementById('cartTotal');

  // Si el carrito está vacío, mostrar el mensaje vacío y ocultar el footer
  if (!cart.length) {
    itemsEl.innerHTML = `
      <div class="cart-empty">
        <i class="fas fa-shopping-cart"></i>
        <p>Tu carrito está vacío</p>
        <p class="cart-empty-sub">Agregá productos para consultar</p>
      </div>
    `;
    footerEl.style.display = 'none';
    return;
  }

  // Si hay productos, mostrar el footer con el total
  footerEl.style.display = 'block';
  totalEl.textContent = `$${total.toLocaleString('es-AR')}`;

  // Renderizar la lista de productos en el panel
  itemsEl.innerHTML = cart.map(item => buildCartItem(item)).join('');

  // Construir el mensaje de WhatsApp con la lista de productos
  // %0A = salto de línea en URL | %20 = espacio
  const listaMsg = cart
    .map(i => `• ${i.nombre} x${i.qty} (${i.precioDisplay})`)
    .join('%0A');

  const mensajeWA = `Hola Technic World! Me interesan estos productos:%0A%0A${listaMsg}%0A%0ATotal: $${total.toLocaleString('es-AR')}%0A%0APueden confirmar disponibilidad? 🙌`;

  document.getElementById('cartWaBtn').href =
    `https://wa.me/${CONFIG.WA_NUMBER}?text=${mensajeWA}`;
}


// =============================================================================
// CONSTRUIR ÍTEM DEL CARRITO
// =============================================================================
// Recibe un ítem del carrito y devuelve su HTML.

function buildCartItem(item) {

  const icon = CONFIG.ICONOS[item.categoria] || CONFIG.ICONOS['default'];

  // Si el producto tiene imagen, la mostramos; sino, el emoji de categoría
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
        <!-- onclick usa comillas simples afuera y dobles adentro para el nombre -->
        <button class="qty-btn" onclick="changeQty('${item.nombre}', -1)">−</button>
        <span class="qty-num">${item.qty}</span>
        <button class="qty-btn" onclick="changeQty('${item.nombre}', 1)">+</button>
      </div>

    </div>
  `;
}


// =============================================================================
// PANEL DEL CARRITO — ABRIR / CERRAR
// =============================================================================
// Agrega o quita la clase "open" en el panel y el overlay.
// El CSS se encarga de mostrar/ocultar con una animación de deslizamiento.

function toggleCart() {
  document.getElementById('cartPanel').classList.toggle('open');
  document.getElementById('cartOverlay').classList.toggle('open');
}


// =============================================================================
// NOTIFICACIONES (TOASTS)
// =============================================================================
// Crea un mensaje que aparece brevemente abajo a la derecha y luego desaparece.

function showToast(mensaje) {

  const container = document.getElementById('toastContainer');

  // Crear el elemento del toast
  const toast = document.createElement('div');
  toast.className = 'toast-notif';
  toast.innerHTML = `<i class="fas fa-check-circle"></i> ${mensaje}`;

  // Agregar al contenedor
  container.appendChild(toast);

  // Eliminarlo después de 3 segundos (3000 milisegundos)
  setTimeout(() => toast.remove(), 3000);
}