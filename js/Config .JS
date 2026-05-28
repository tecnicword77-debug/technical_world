// =============================================================================
// config.js — Configuración global de Technic World
// =============================================================================
// Este archivo es el "panel de control" de la página.
// Acá vas a encontrar TODOS los valores que podés necesitar cambiar:
// el ID del Google Sheets, los datos de contacto, los nombres de columnas, etc.
//
// ¿Por qué separarlo del resto del código?
// Porque si mañana cambiás el número de WhatsApp o el usuario de Instagram,
// solo tocás ESTE archivo, no tenés que buscar por todo el código.
// =============================================================================


const CONFIG = {

    // ---------------------------------------------------------------------------
    // GOOGLE SHEETS
    // ---------------------------------------------------------------------------
    // SHEET_ID: el ID largo que aparece en la URL de tu planilla de Google.
    //
    // Ejemplo de URL:
    // https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms/edit
    //                                         ↑ eso es el ID, lo que va entre /d/ y /edit
    //
    // ⚠️  Dejalo vacío ('') hasta que configures el Google Sheets.
    //     Cuando esté vacío, la página muestra un aviso explicando qué hacer.
    SHEET_ID: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQ69J_71VB9a6vZrIZrAmK5N8UZu5YNSDgBkWlGhOARzNeSxq88ZnRdoW3dcX4AvdokqZJuKIgOwAMj/pub?gid=0&single=true&output=csv',
  
    // Nombre exacto de la hoja dentro de la planilla.
    // Por defecto Google lo llama "Hoja1" en español o "Sheet1" en inglés.
    // Podés verlo en la pestaña abajo de tu planilla.
    SHEET_NAME: 'Hoja1',
  
  
    // ---------------------------------------------------------------------------
    // CONTACTO
    // ---------------------------------------------------------------------------
    // Número de WhatsApp CON código de país y sin espacios ni guiones.
    // Argentina = 54, celular = 9, luego el número sin el 0 del principio.
    WA_NUMBER: '5491345938701',
  
    // Usuario de Instagram SIN el @
    IG_USER: 'technic_word',
  
  
    // ---------------------------------------------------------------------------
    // COLUMNAS DEL GOOGLE SHEETS
    // ---------------------------------------------------------------------------
    // Estos valores deben coincidir EXACTAMENTE con los encabezados de tu planilla
    // (en minúsculas, sin tildes ni espacios raros).
    //
    // Tu planilla debería tener estas columnas en la fila 1:
    // | nombre | precio | categoria | descripcion | imagen | badge | disponible |
    //
    // Las columnas internas (precio_compra, proveedor, etc.) que vos agregues
    // NO se tocan acá — el JS directamente no las lee, así que son invisibles
    // para la página web.
    COL_NOMBRE:      'nombre',       // Nombre del producto
    COL_PRECIO:      'precio',       // Precio de venta (el que ve el cliente)
    COL_CATEGORIA:   'categoria',    // Categoría (debe coincidir con los filtros)
    COL_DESCRIPCION: 'descripcion',  // Descripción corta del producto
    COL_IMAGEN:      'imagen',       // URL de la foto del producto
    COL_BADGE:       'badge',        // Etiqueta opcional: "Nuevo", "Oferta", etc.
    COL_DISPONIBLE:  'disponible',   // "si" o "no" — si es "no" no aparece en la web
  
  
    // ---------------------------------------------------------------------------
    // CATEGORÍAS VÁLIDAS
    // ---------------------------------------------------------------------------
    // Lista de categorías que usa la página para los filtros.
    // Si agregás una categoría nueva en el Sheets, agregala acá también.
    CATEGORIAS: [
      'Auriculares',
      'Parlantes',
      'Cargadores',
      'Pendrives',
      'Periféricos',
      'Celulares',
    ],
  
  
    // ---------------------------------------------------------------------------
    // ÍCONOS POR CATEGORÍA
    // ---------------------------------------------------------------------------
    // Emoji que se muestra cuando un producto no tiene imagen cargada.
    // También se usa en el carrito para identificar la categoría.
    ICONOS: {
      'Auriculares': '🎧',
      'Parlantes':   '🔊',
      'Cargadores':  '⚡',
      'Pendrives':   '💾',
      'Periféricos': '🖱️',
      'Celulares':   '📱',
      'default':     '📦',   // Se usa si la categoría no está en la lista de arriba
    },
  
  };
  // FIN CONFIG