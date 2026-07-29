# Conversor Universal — arquitectura estática para SEO

Este proyecto genera, a partir de **un único CSS, un único JS y una lista de conversiones**,
un sitio 100% estático con **una URL real por conversión** (`/metros-a-pies/`, `/kg-a-libras/`, etc.),
listo para GitHub Pages (con o sin dominio personalizado).

## Por qué ya no da 404 al recargar

Antes la URL se cambiaba solo en el navegador (`history.replaceState`), pero esa ruta no
existía como archivo → GitHub Pages devolvía 404 al recargar o entrar directo por el link.

Ahora **cada conversión es una carpeta real con su propio `index.html`**
(`docs/metros-a-pies/index.html`). GitHub Pages sirve automáticamente `carpeta/index.html`
tanto para `/metros-a-pies` como para `/metros-a-pies/` — sin necesidad de reglas de
reescritura, `.htaccess`, ni el truco del `404.html` para SPAs.

## Estructura del proyecto

```
assets/
  style.css          ← ÚNICO CSS (el mismo que ya tenías, con unas pocas clases extra para el bloque SEO)
  app.js             ← ÚNICO JS (el mismo motor de conversión; funciona igual en el navegador
                        y además se puede `require()` desde Node para el build — cero duplicación)
data/
  conversions.json   ← LISTA MAESTRA de conversiones a publicar (edítala para agregar/quitar)
templates/
  page.html          ← ÚNICA plantilla HTML (placeholders {{...}}), la usan el home y cada conversión
scripts/
  build.js                  ← genera /docs (home + 1 carpeta por conversión + sitemap + robots + CNAME)
  build-conversions-list.js ← genera data/conversions.json desde una lista curada (uso manual, NO se
                               corre en CI para no pisar tus ediciones manuales del JSON)
docs/                ← SALIDA DEL BUILD. Esto es lo que GitHub Pages publica. No se edita a mano.
.github/workflows/deploy.yml  ← build + deploy automático a GitHub Pages en cada push a main
```

## Cómo agregar/quitar conversiones (requisito de escalabilidad)

Edita `data/conversions.json`. Cada entrada es:

```json
{ "slug": "metros-a-pies", "tab": "longitud", "from": "m", "to": "ft" }
```

- `tab`: el id de categoría tal como está en `CATEGORIES`/`TAB_DEFS` dentro de `assets/app.js`
  (`longitud`, `peso`, `temperatura`, `area`, `volumen`, `tiempo`, `velocidad`, `combustible`,
  `presion`, `energia`, `potencia`, `datos`, `angulos`, `frecuencia`, `densidad`, etc.)
- `from` / `to`: los códigos de unidad tal como están definidos ahí mismo (p. ej. `m`, `ft`, `kg`, `c`, `f`...).
- `slug`: la URL amigable. Si no sabes cuál poner, corre `node scripts/build.js` una vez con un
  slug cualquiera: si `from`/`to` no existen en `app.js`, o si el slug no se puede generar,
  el mismo `build-conversions-list.js` lanza un error explicando qué falta — así nunca hay
  una página con datos incorrectos.

No hay límite de cuántas puedes agregar: el build es lineal en el número de conversiones,
así que escala a cientos o miles de entradas sin cambios de código.

## Build local

```bash
npm run build         # genera /docs
npm run serve         # sirve /docs en http://localhost:8080 para probar antes de publicar
```

## Despliegue en GitHub Pages (automático, recomendado)

1. Sube este proyecto a un repo de GitHub.
2. En **Settings → Pages**, en "Build and deployment" elige **Source: GitHub Actions**
   (no "Deploy from a branch").
3. Con cada `git push` a `main`, el workflow en `.github/workflows/deploy.yml`:
   - corre `node scripts/build.js` (usando el mismo `assets/app.js` y `assets/style.css`),
   - publica el contenido de `docs/` como el sitio.
4. Dominio personalizado: el build ya genera `docs/CNAME` con el dominio configurado en
   `SITE_URL` (ver `scripts/build.js` o la variable de entorno `SITE_URL` en el workflow).
   Asegúrate de que tu DNS siga apuntando a GitHub Pages (esto no cambia respecto a como
   ya lo tenías configurado).

### Alternativa sin Actions (más simple, menos automática)

Si prefieres no usar Actions: corre `npm run build` en tu máquina, haz commit de la carpeta
`docs/` generada, y en **Settings → Pages** elige **Source: Deploy from a branch → main → /docs**.
Tendrás que repetir "build + commit" cada vez que cambies algo.

## Qué genera cada página de conversión

- `<title>` y `<meta name="description">` únicos.
- `<link rel="canonical">` apuntando a su propia URL.
- Open Graph (`og:title`, `og:description`, `og:url`, `og:type`, `og:site_name`) y Twitter Card.
- Datos estructurados JSON-LD: `BreadcrumbList` (Inicio → Categoría → Conversión) y `FAQPage`
  con la pregunta "¿Cuántos X son 1 Y?" respondida con el valor real calculado por `app.js`.
- Una tabla de referencia con valores reales (1, 2, 5, 10, 25, 50, 100...) — contenido
  visible sin depender de JavaScript, ideal para rastreadores.
- Enlaces internos a otras conversiones de la misma categoría.
- La calculadora interactiva completa debajo, ya con las unidades correctas preseleccionadas
  (vía `window.PRESET`, leído por `assets/app.js`).
- El mismo `<head>`, mismo `style.css`, mismo `app.js`, mismo diseño visual que el resto del sitio.

## Notas

- `docs/.nojekyll` evita que GitHub Pages procese el sitio con Jekyll (innecesario aquí y
  puede causar problemas con carpetas/archivos que empiecen con `_` en el futuro).
- Si cambias el dominio, actualiza `SITE_URL` en `.github/workflows/deploy.yml` (o la variable
  de entorno al correr `node scripts/build.js` localmente) — el build regenera `CNAME`,
  `sitemap.xml` y todos los `canonical`/`og:url` automáticamente.
