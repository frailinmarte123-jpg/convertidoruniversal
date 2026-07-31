# Conversor Universal — arquitectura estática para SEO (≈1,000 páginas)

Este proyecto genera, a partir de **un único CSS, un único JS y una lista de conversiones**,
un sitio 100% estático con **una URL real por conversión** (`/metros-a-pies/`, `/kg-a-libras/`, etc.),
listo para GitHub Pages (con o sin dominio personalizado).

Actualmente genera **1,002 páginas de conversión** (todas las combinaciones válidas entre
17 categorías: longitud, peso, temperatura, área, volumen, tiempo, velocidad, combustible,
presión, energía, potencia, electricidad, datos digitales, ángulos, frecuencia, densidad
y monedas), cada una con:

- `<title>` y `<meta description>` únicos, calculados con el valor real de esa conversión.
- `<link rel="canonical">`, Open Graph y Twitter Card.
- JSON-LD: `BreadcrumbList` + `FAQPage` con **4 preguntas y respuestas reales** por página
  (cuánto equivale, cómo convertir con fórmula, para qué se usa, cómo hacer el inverso).
- Tabla de referencia con valores reales (no placeholders).
- Explicación con la fórmula exacta de esa conversión.
- Un párrafo "acerca de la categoría" (reutilizado dentro de cada categoría, no por cada
  página individual — evita contenido vacío sin inflar cada URL con texto repetido disfrazado).
- Enlaces internos a otras conversiones de la **misma categoría** y a conversiones
  representativas de **categorías relacionadas** (p. ej. Longitud enlaza a Área, Volumen
  y Velocidad).
- La calculadora interactiva completa, con las unidades correctas preseleccionadas.

## Por qué ya no da 404 al recargar

Cada conversión es una **carpeta real con su propio `index.html`** (`docs/metros-a-pies/index.html`).
GitHub Pages sirve automáticamente `carpeta/index.html` tanto para `/metros-a-pies` como
para `/metros-a-pies/` — sin reglas de reescritura ni trucos de SPA.

## Estructura del proyecto

```
assets/
  style.css          ← ÚNICO CSS (el mismo de siempre + clases para FAQ/enlaces relacionados)
  app.js             ← ÚNICO JS (mismo motor; se usa en el navegador Y se `require()` desde
                        Node para el build — cero duplicación de fórmulas ni de unidades)
data/
  conversions.json   ← LISTA MAESTRA (1002 conversiones). Edítala para agregar/quitar.
templates/
  page.html          ← ÚNICA plantilla HTML (placeholders {{...}})
scripts/
  build.js                  ← genera /docs: home + 1 carpeta por conversión + FAQs +
                               enlaces relacionados + sitemap + robots + CNAME
  build-conversions-list.js ← genera data/conversions.json con TODAS las combinaciones
                               válidas por categoría (uso manual, no se corre en CI)
docs/                ← SALIDA DEL BUILD (esto es lo que GitHub Pages publica)
.github/workflows/deploy.yml  ← build + deploy automático (push a main + cron diario)
```

## De dónde salen las 1,002 conversiones

`scripts/build-conversions-list.js` toma cada categoría de `assets/app.js` y genera
**todas las combinaciones ordenadas posibles** entre sus unidades (A→B y B→A), respetando
qué unidades sí se pueden convertir entre sí:

- Casi todas las categorías: todas sus unidades son un solo grupo (p. ej. en Longitud,
  cualquier unidad se puede convertir a cualquier otra).
- **Electricidad** es la excepción: Voltios solo convierte con Milivoltios, Amperios solo
  con Miliamperios, Ohmios solo con Kiloohmios — nunca se mezclan voltios con amperios,
  porque no son la misma magnitud física. Esto está controlado por `SUBGROUPS` dentro de
  `build-conversions-list.js`.
- **Monedas** es su propia categoría con 18 divisas (USD, EUR, GBP, DOP, COP, ARS, etc.),
  con 306 pares posibles.

Para agregar más (llegar a 2,000, 5,000...): agrega más unidades a `CATEGORIES` en
`assets/app.js` (con su `code`, `label`, `factor` y `aliases`) y su entrada correspondiente
en `SLUG_WORDS`, y vuelve a correr `node scripts/build-conversions-list.js`. El build es
lineal en el número de conversiones, así que escala sin cambios de arquitectura.

## Tasas de moneda: en vivo en el build + en vivo en la calculadora

`scripts/build.js` intenta obtener tasas de cambio reales al momento de generar el sitio
(API gratuita, sin key). Si lo logra, los números "de referencia" en cada página de moneda
(título, tabla, FAQ) usan esa tasa real del día del build. Si el build no tiene acceso a
internet (poco probable en GitHub Actions), usa una tabla de respaldo aproximada.
**La calculadora interactiva de cada página siempre intenta obtener la tasa en vivo desde
el navegador del visitante**, independientemente de lo que se haya generado en el build.

## Build local

```bash
npm run build         # genera /docs
npm run serve         # sirve /docs en http://localhost:8080 para probar antes de publicar
```

## Despliegue en GitHub Pages (automático, recomendado)

1. Sube este proyecto a un repo de GitHub.
2. En **Settings → Pages**, en "Build and deployment" elige **Source: GitHub Actions**
   (no "Deploy from a branch").
3. El workflow en `.github/workflows/deploy.yml` corre:
   - en cada `git push` a `main`,
   - y además **todos los días por cron** (para refrescar tasas de moneda y `lastmod`
     del sitemap aunque no hayas tocado el código).
4. Dominio personalizado: el build genera `docs/CNAME` con el dominio de `SITE_URL`
   (variable de entorno en el workflow). Tu DNS sigue apuntando a GitHub Pages igual
   que ya lo tenías configurado.

### Alternativa sin Actions (más simple, menos automática)

Corre `npm run build`, haz commit de `docs/`, y en **Settings → Pages** elige
**Source: Deploy from a branch → main → /docs**. Tendrás que repetir "build + commit"
cada vez que cambies algo (y no tendrás el refresco automático de tasas por cron).

## Notas

- `docs/.nojekyll` evita que GitHub Pages procese el sitio con Jekyll.
- `sitemap.xml` incluye `lastmod` con la fecha del build más reciente — se regenera solo
  en cada corrida (push o cron).
- Si cambias el dominio, actualiza `SITE_URL` en `.github/workflows/deploy.yml` — el build
  regenera `CNAME`, `sitemap.xml` y todos los `canonical`/`og:url` automáticamente.
- Un control de calidad rápido (`title`, `canonical`, OG, JSON-LD válido con 4 preguntas,
  `PRESET`, assets enlazados) corrió sobre las 1,002 páginas generadas sin errores antes
  de esta entrega.
