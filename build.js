// scripts/build.js
// Genera el sitio ESTÁTICO completo en /docs a partir de:
//   - assets/app.js      (motor de conversión real, reutilizado tal cual)
//   - assets/style.css   (único CSS, reutilizado tal cual)
//   - data/conversions.json (lista maestra de conversiones a publicar)
//   - templates/page.html   (único template)
//
// No duplica código: cada página enlaza a /assets/app.js y /assets/style.css.
// Cada conversión se publica en /<slug>/index.html => URL real, sin 404 al recargar,
// funciona en GitHub Pages tal cual (con o sin dominio personalizado).

const fs = require('fs');
const path = require('path');
const engine = require('../assets/app.js');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'docs');

// --------------------------------------------------------------------------
// Configuración del sitio (ajusta SITE_URL a tu dominio real)
// --------------------------------------------------------------------------
const SITE_URL = (process.env.SITE_URL || 'https://convertidoruniversal.lat').replace(/\/+$/, '');
const SITE_NAME = 'Conversor Universal';

const conversions = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/conversions.json'), 'utf-8'));
const template = fs.readFileSync(path.join(ROOT, 'templates/page.html'), 'utf-8');

// --------------------------------------------------------------------------
// Utilidades que reutilizan el motor real (cero duplicación de fórmulas)
// --------------------------------------------------------------------------
function labelOf(tab, code) {
  if (tab === 'temperatura') return engine.TEMP_UNITS.find(u => u.code === code).label;
  if (tab === 'combustible') return engine.FUEL_UNITS.find(u => u.code === code).label;
  const cat = engine.CATEGORIES.find(c => c.id === tab);
  return cat.units.find(u => u.code === code).label;
}
function tabLabel(tab) {
  return engine.TAB_DEFS.find(t => t.id === tab)?.label || tab;
}
function convert(tab, from, to, v) {
  if (tab === 'temperatura') return engine.convertTemp(from, to, v);
  if (tab === 'combustible') return engine.convertFuel(from, to, v);
  return engine.convertLinear(tab, from, to, v);
}
function sampleValues(tab) {
  if (tab === 'temperatura') return [-40, -18, 0, 20, 37, 100];
  if (tab === 'combustible') return [10, 20, 30, 40, 50];
  if (tab === 'angulos') return [1, 30, 45, 90, 180, 360];
  return [1, 2, 5, 10, 25, 50, 100];
}
function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// --------------------------------------------------------------------------
// Helpers de render
// --------------------------------------------------------------------------
function fill(tpl, vars) {
  return tpl.replace(/{{(\w+)}}/g, (_, key) => (key in vars ? vars[key] : ''));
}

function writePage(slug, html) {
  const dir = slug ? path.join(OUT, slug) : OUT;
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), html);
}

// --------------------------------------------------------------------------
// 1) Página principal (home)
// --------------------------------------------------------------------------
function buildHome() {
  const title = `${SITE_NAME} — Convierte unidades, monedas y más`;
  const description = 'Convierte metros a pies, kilogramos a libras, Celsius a Fahrenheit y más de 150 conversiones de unidades, monedas, tallas y calculadoras. Gratis y en tiempo real.';
  const jsonld = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: SITE_NAME,
    url: `${SITE_URL}/`,
    applicationCategory: 'UtilityApplication',
    operatingSystem: 'Any',
    description,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  };

  const html = fill(template, {
    TITLE: esc(title),
    DESCRIPTION: esc(description),
    CANONICAL: `${SITE_URL}/`,
    OG_TITLE: esc(title),
    JSONLD: `<script type="application/ld+json">${JSON.stringify(jsonld)}</script>`,
    ASSET_PREFIX: '/',
    BREADCRUMB: '',
    H1: `Conversor <span>Universal</span>`,
    SUBTITLE: 'Escribe en lenguaje natural o usa los conversores por categoría — más de 20 categorías, 100+ unidades.',
    SEO_BLOCK: '',
    RELATED_BLOCK: '',
    PRESET_SCRIPT: '',
  });
  writePage('', html);
}

// --------------------------------------------------------------------------
// 2) Una página por conversión
// --------------------------------------------------------------------------
function buildConversionPages() {
  const bySlug = new Map(conversions.map(c => [c.slug, c]));

  for (const conv of conversions) {
    const { slug, tab, from, to } = conv;
    const labelFrom = labelOf(tab, from);
    const labelTo = labelOf(tab, to);
    const catLabel = tabLabel(tab);

    const exampleVal = 1;
    const exampleResult = convert(tab, from, to, exampleVal);
    const rows = sampleValues(tab)
      .map(v => `<tr><td>${engine.fmt(v)} ${esc(labelFrom)}</td><td>= ${engine.fmt(convert(tab, from, to, v))} ${esc(labelTo)}</td></tr>`)
      .join('');

    const title = `Convertir ${labelFrom} a ${labelTo} — ${SITE_NAME}`;
    const description = `Convierte ${labelFrom} a ${labelTo} al instante. ${engine.fmt(exampleVal)} ${labelFrom} = ${engine.fmt(exampleResult)} ${labelTo}. Calculadora online gratuita y precisa.`;
    const canonical = `${SITE_URL}/${slug}/`;

    const jsonld = [
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Inicio', item: `${SITE_URL}/` },
          { '@type': 'ListItem', position: 2, name: catLabel, item: `${SITE_URL}/#${tab}` },
          { '@type': 'ListItem', position: 3, name: `${labelFrom} a ${labelTo}`, item: canonical },
        ],
      },
      {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: [{
          '@type': 'Question',
          name: `¿Cuántos ${labelTo} son 1 ${labelFrom}?`,
          acceptedAnswer: {
            '@type': 'Answer',
            text: `1 ${labelFrom} equivale a ${engine.fmt(exampleResult)} ${labelTo}.`,
          },
        }],
      },
    ];

    // enlaces relacionados: otras conversiones de la misma categoría
    const related = conversions.filter(c => c.tab === tab && c.slug !== slug).slice(0, 8);
    const relatedHtml = related
      .map(r => `<a href="/${r.slug}/">${esc(labelOf(r.tab, r.from))} a ${esc(labelOf(r.tab, r.to))}</a>`)
      .join('');

    const seoBlock = `
    <div class="seo-block">
      <p class="seo-intro"><strong>${engine.fmt(exampleVal)} ${esc(labelFrom)} = ${engine.fmt(exampleResult)} ${esc(labelTo)}.</strong>
      Usa la calculadora interactiva más abajo para convertir cualquier cantidad de ${esc(labelFrom.toLowerCase())} a ${esc(labelTo.toLowerCase())}, o consulta la tabla de referencia rápida.</p>
      <table class="seo-table">${rows}</table>
    </div>`;

    const html = fill(template, {
      TITLE: esc(title),
      DESCRIPTION: esc(description),
      CANONICAL: canonical,
      OG_TITLE: esc(`${labelFrom} a ${labelTo}`),
      JSONLD: `<script type="application/ld+json">${JSON.stringify(jsonld)}</script>`,
      ASSET_PREFIX: '/',
      BREADCRUMB: `        <p class="breadcrumb"><a href="/">Inicio</a> · ${esc(catLabel)}</p>`,
      H1: `${esc(labelFrom)} a ${esc(labelTo)}`,
      SUBTITLE: `Conversión de ${esc(labelFrom.toLowerCase())} a ${esc(labelTo.toLowerCase())}, con calculadora interactiva.`,
      SEO_BLOCK: seoBlock,
      RELATED_BLOCK: relatedHtml ? `    <div class="related-links">${relatedHtml}</div>` : '',
      PRESET_SCRIPT: `<script>window.PRESET = { tab: '${tab}', from: '${from}', to: '${to}' };</script>\n`,
    });

    writePage(slug, html);
  }
}

// --------------------------------------------------------------------------
// 3) sitemap.xml + robots.txt + CNAME + .nojekyll
// --------------------------------------------------------------------------
function buildMeta() {
  const urls = [`${SITE_URL}/`, ...conversions.map(c => `${SITE_URL}/${c.slug}/`)];
  const sitemap = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls.map(u => `  <url><loc>${u}</loc></url>`),
    '</urlset>',
  ].join('\n');
  fs.writeFileSync(path.join(OUT, 'sitemap.xml'), sitemap);
  fs.writeFileSync(path.join(OUT, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${SITE_URL}/sitemap.xml\n`);

  // Necesario para que GitHub Pages NO procese el sitio con Jekyll
  fs.writeFileSync(path.join(OUT, '.nojekyll'), '');

  // Dominio personalizado de GitHub Pages (opcional: bórralo si usas *.github.io)
  const domain = SITE_URL.replace(/^https?:\/\//, '');
  fs.writeFileSync(path.join(OUT, 'CNAME'), domain + '\n');
}

// --------------------------------------------------------------------------
// 4) Copiar assets compartidos (un único CSS, un único JS)
// --------------------------------------------------------------------------
function copyAssets() {
  const dest = path.join(OUT, 'assets');
  fs.mkdirSync(dest, { recursive: true });
  fs.copyFileSync(path.join(ROOT, 'assets/style.css'), path.join(dest, 'style.css'));
  fs.copyFileSync(path.join(ROOT, 'assets/app.js'), path.join(dest, 'app.js'));
}

// --------------------------------------------------------------------------
function main() {
  fs.rmSync(OUT, { recursive: true, force: true });
  fs.mkdirSync(OUT, { recursive: true });
  copyAssets();
  buildHome();
  buildConversionPages();
  buildMeta();
  console.log(`✅ Sitio generado en /docs: 1 home + ${conversions.length} páginas de conversión.`);
}

main();
