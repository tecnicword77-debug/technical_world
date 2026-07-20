// =============================================================================
// config.js — Datos editables de Technical World
// Si necesitás cambiar el WhatsApp, el Sheets o un ícono, es ACÁ.
// =============================================================================
const CONFIG = {
  SHEET_ID:        '1zey_PgwcnOqDMxhbHI4-2L9w-xulYZGi9w8ZNKkHk4A',
  SHEET_NAME:      'Hoja1',
  WA_NUMBER:       '5493454938701',
  IG_USER:         'technical_world099',

  COL_NOMBRE:      'nombre',
  COL_PRECIO:      'precio',
  COL_CATEGORIA:   'categoria',
  COL_DESCRIPCION: 'descripcion',
  COL_IMAGEN:      'imagen',
  COL_IMAGEN2:     'imagen2',
  COL_IMAGEN3:     'imagen3',
  COL_IMAGEN4:     'imagen4',
  COL_BADGE:       'badge',
  COL_DISPONIBLE:  'disponible',
  COL_OFERTA:      'oferta', // Precio de oferta — si tiene valor, muestra precio tachado + precio oferta

  // Íconos por categoría. Si la categoría no está acá usa 'default'.
  // Para agregar una nueva simplemente escribís: 'NombreCategoria': '🔥',
  ICONOS: {
    'Auriculares': '🎧',
    'Parlantes':   '🔊',
    'Cargadores':  '⚡',
    'Pendrives':   '💾',
    'Periféricos': '🖱️',
    'Celulares':   '📱',
    'Cables':      '🔌',
    'Teclados':    '⌨️',
    'Mouses':      '🖱️',
    'Tablets':     '📱',
    'default':     '📦',
  }
};
