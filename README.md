# Conversor Universal — arquitectura estática para SEO (≈1,000 páginas)

Este proyecto genera, a partir de **un único CSS, un único JS y una lista de conversiones**,
un sitio 100% estático con **una URL real por conversión** (`/metros-a-pies/`, `/kg-a-libras/`, etc.),
listo para GitHub Pages (con o sin dominio personalizado).

Genera **1,002 páginas de conversión** entre 17 categorías. Cada página incluye:

- Marca "Conversor Universal" fija en la parte superior, clicable, que lleva al inicio.
- Breadcrumb visible (Inicio · Categoría · Conversión actual) + `BreadcrumbList` en JSON-LD.
- Tabla de contenidos con enlaces a Calculadora, Tabla, Fórmula, Explicación, Relacionadas y FAQ.
- `<h1>` en formato "Convertir X a Y", singular/plural correcto en todo el texto (1 Kilogramo,
  no 1 Kilogramos).
- `<title>` y `<meta description>` con 3 patrones distintos que rotan por página (no siempre
  "Convierte X a Y...").
- Tabla de referencia con 11 valores (1, 2, 5, 10, 25, 50, 100, 250, 500, 1000, 10000).
- Fórmula en una caja destacada.
- Sección "Aprende más": diferencia entre unidades explicada dinámicamente según cuál es más
  grande/pequeña, contexto de uso, un ejemplo cotidiano concreto por categoría, y un párrafo
  "acerca de esta magnitud".
- Enlaces internos reforzados: primero conversiones que comparten la unidad de origen (kg→lb,
  kg→oz, kg→t...), luego las que comparten la unidad de destino (g→lb, g→oz...), y por último
  enlaces a categorías relacionadas (Peso → Densidad, Volumen).
- **FAQ al final de la página** (4 preguntas reales) + `FAQPage` en JSON-LD.
- Open Graph, Twitter Card, canonical.
- La calculadora interactiva, con las unidades correctas preseleccionadas.

## Por qué ya no da 404 al recargar

Cada conversión es una **carpeta real con su propio `index.html`**. GitHub Pages sirve
`carpeta/index.html` tanto para `/metros-a-pies` como para `/metros-a-pies/` — sin reglas
de reescritura ni trucos de SPA.

## Estructura del proyecto

```
assets/
  style.css          ← ÚNICO CSS
  app.js             ← ÚNICO JS (mismo motor; se usa en el navegador Y se `require()` desde
                        Node para el build — cero duplicación)
data/
  conversions.json   ← LISTA MAESTRA (1002 conversiones)
templates/
  page.html          ← ÚNICA plantilla HTML
scripts/
  build.js                  ← genera /docs: home + 1 carpeta por conversión, con todo el
                               contenido enriquecido (FAQs, explicación, enlaces, TOC...)
  build-conversions-list.js ← genera data/conversions.json con todas las combinaciones
                               válidas por categoría (uso manual)
docs/                ← SALIDA DEL BUILD (esto es lo que GitHub Pages publica)
.github/workflows/deploy.yml  ← build + deploy automático (push a main + cron diario)
```

## Singular/plural y etiquetas "de prosa"

`scripts/build.js` tiene dos diccionarios pequeños que resuelven esto sin tocar `app.js`
(el selector de la calculadora sigue mostrando las etiquetas en plural, que es lo normal
en un `<select>`):

- `SINGULAR`: la forma singular de cada unidad, solo donde de verdad cambia
  (Kilogramo, Pie, Milla...). Las abreviaturas (PSI, BTU, kWh, Hz...) no necesitan entrada:
  al no encontrarse, se usa la misma etiqueta.
- `DISPLAY_LABEL_OVERRIDE`: una versión más natural para prosa de las etiquetas que en el
  `<select>` llevan paréntesis o barras (`Metros/segundo (m/s)` → `Metros por segundo`).

Si agregas una unidad nueva a `CATEGORIES` en `assets/app.js`, solo tienes que agregar su
singular aquí si su plural termina en una letra distinta de "s" simple (o déjalo así si
son iguales, como con divisas o abreviaturas).

## De dónde salen las 1,002 conversiones

`scripts/build-conversions-list.js` genera todas las combinaciones ordenadas posibles
entre las unidades de cada categoría (A→B y B→A), respetando subgrupos donde no todas las
unidades son mutuamente convertibles (Electricidad: Voltios solo con Milivoltios, Amperios
solo con Miliamperios, Ohmios solo con Kiloohmios).

Para agregar más: agrega unidades a `CATEGORIES`/`SLUG_WORDS` en `assets/app.js` y vuelve a
correr `node scripts/build-conversions-list.js`. El build es lineal en el número de
conversiones.

## Tasas de moneda: en vivo en el build + en vivo en la calculadora

`scripts/build.js` intenta obtener tasas de cambio reales al momento de generar el sitio.
Si no tiene acceso a internet, usa una tabla de respaldo aproximada. La calculadora
interactiva de cada página siempre intenta obtener la tasa en vivo desde el navegador del
visitante, independientemente de lo que se haya generado en el build.

## Build local

```bash
npm run build         # genera /docs
npm run serve         # sirve /docs en http://localhost:8080 para probar antes de publicar
```

## Despliegue en GitHub Pages (automático, recomendado)

1. Sube este proyecto a un repo de GitHub.
2. En **Settings → Pages**, elige **Source: GitHub Actions**.
3. El workflow corre en cada push a `main` y además todos los días por cron (refresca
   tasas de moneda y `lastmod` del sitemap aunque no toques el código).
4. Dominio personalizado: el build genera `docs/CNAME` con el dominio de `SITE_URL`
   (variable de entorno en el workflow).

### Alternativa sin Actions

Corre `npm run build`, haz commit de `docs/`, y en **Settings → Pages** elige
**Source: Deploy from a branch → main → /docs**.

## Notas

- `docs/.nojekyll` evita que GitHub Pages procese el sitio con Jekyll.
- `sitemap.xml` incluye `lastmod` con la fecha del build más reciente.
- Control de calidad automático corrido sobre las 1,002 páginas antes de esta entrega:
  title, canonical, OG, JSON-LD válido (BreadcrumbList + FAQPage con 4 preguntas), preset,
  assets enlazados, marca clicable, TOC, FAQ al final, y verificación de singular/plural
  — **0 errores**.
- `ads.txt` se genera automáticamente en `docs/ads.txt` con tu ID de editor de AdSense
  (`pub-2394878225224723`, configurado como `ADSENSE_PUBLISHER_ID` en `scripts/build.js`
  y en el workflow de GitHub Actions). Si alguna vez cambias de cuenta o agregas otra red
  publicitaria, actualiza esa variable — no hay que tocar nada más.
