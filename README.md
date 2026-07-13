# Technical World — Tienda Virtual

Tienda virtual de productos electrónicos (auriculares, cargadores, cables, etc.).  
SPA hecha en HTML + CSS + JS puro, con productos cargados desde Google Sheets.

---

## Estructura del proyecto

```
technical-world/
├── index.html          ← Página principal (estructura y contenido)
├── css/
│   └── estilos.css     ← Todos los estilos visuales
├── js/
│   ├── config.js       ← Datos editables: WhatsApp, Sheets ID, íconos
│   ├── productos.js    ← Carga y muestra los productos desde Sheets
│   └── carrito.js      ← Lógica del carrito de compras
└── images/
    └── logo.jpg        ← Logo del negocio
```

---

## Cómo editar los datos del negocio

Todo lo que puede cambiar seguido está en **`js/config.js`**:

| Variable | Qué es |
|---|---|
| `SHEET_ID` | ID del Google Sheets con los productos |
| `SHEET_NAME` | Nombre de la hoja dentro del Sheets |
| `WA_NUMBER` | Número de WhatsApp (con código de país, sin +) |
| `IG_USER` | Usuario de Instagram |
| `ICONOS` | Ícono emoji por categoría de producto |

---

## Cómo agregar o editar productos

Los productos **no se editan en el código** — se gestionan desde el Google Sheets vinculado.  
Las columnas que reconoce la tienda son:

| Columna | Descripción |
|---|---|
| `nombre` | Nombre del producto |
| `precio` | Precio normal |
| `oferta` | Precio de oferta (si tiene valor, muestra el precio original tachado) |
| `categoria` | Categoría (tiene que coincidir con las de `config.js`) |
| `descripcion` | Descripción corta |
| `imagen` | URL de la imagen principal |
| `imagen2` / `imagen3` / `imagen4` | Fotos extra para la galería del modal |
| `badge` | Etiqueta personalizada (ej: "NUEVO", "ÚLTIMO") |
| `disponible` | Poner `no` para ocultar el producto sin borrarlo |

---

## Cómo trabajar en equipo con Git

### Antes de arrancar a trabajar
Siempre traé los últimos cambios antes de tocar algo:
```bash
git pull origin master
```

### Flujo para subir cambios
```bash
git add .
git commit -m "descripción de lo que hiciste"
git push origin master
```

### Si querés probar algo sin romper lo que funciona
Creá una rama nueva:
```bash
git checkout -b nombre-de-la-rama
```
Cuando esté listo, hacés un Pull Request en GitHub para mergear a `master`.

---

## Cómo ver el sitio en local

Abrí `index.html` con la extensión **Live Server** de VS Code.  
No hace falta ningún servidor, framework ni instalación extra.

---

## Equipo

| Nombre | Rol |
|---|---|
| Lucas | Lo que venga |
| Uriel | Lo que venga |
| Nico  | Lo que venga |
| Emi   | Lo que venga |