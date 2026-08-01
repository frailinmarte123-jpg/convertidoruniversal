// scripts/build.js
// Genera el sitio ESTÁTICO completo en /docs a partir de:
//   - assets/app.js          (motor de conversión real, reutilizado tal cual)
//   - assets/style.css       (único CSS, reutilizado tal cual)
//   - data/conversions.json  (lista maestra: ~1000 conversiones)
//   - templates/page.html    (único template)

const fs = require('fs');
const path = require('path');
const engine = require('../assets/app.js');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'docs');
const SITE_URL = (process.env.SITE_URL || 'https://convertidoruniversal.lat').replace(/\/+$/, '');
const SITE_NAME = 'Conversor Universal';
const ADSENSE_PUBLISHER_ID = process.env.ADSENSE_PUBLISHER_ID || 'pub-2394878225224723';
const BUILD_DATE = new Date().toISOString().slice(0, 10);

const conversions = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/conversions.json'), 'utf-8'));
const template = fs.readFileSync(path.join(ROOT, 'templates/page.html'), 'utf-8');

// ============================================================================
// 1) Tasas de monedas "de referencia" al momento del build (con fallback offline)
// ============================================================================
async function fetchBuildRates() {
  try {
    const res = await fetch('https://open.er-api.com/v6/latest/USD');
    const data = await res.json();
    if (data && data.rates) return data.rates;
  } catch (e) {
    console.warn('No se pudieron obtener tasas en vivo para el build, uso valores de referencia estáticos.');
  }
  return engine.STATIC_RATES;
}

// ============================================================================
// 2) Etiquetas: versión "limpia" para prosa + forma singular
// ============================================================================
// Algunas etiquetas del selector llevan paréntesis/abreviaturas útiles en un <select>
// pero incómodas en una oración ("Metros/segundo (m/s)"). Para el texto de las páginas
// usamos una versión más natural.
const DISPLAY_LABEL_OVERRIDE = {
  'velocidad:ms': 'Metros por segundo', 'velocidad:kmh': 'Kilómetros por hora',
  'velocidad:mph': 'Millas por hora', 'velocidad:fts': 'Pies por segundo',
  'combustible:mpg': 'MPG', 'presion:kpa': 'Kilopascales', 'presion:atm': 'Atmósferas',
};

// Forma singular (solo donde de verdad cambia; las abreviaturas quedan igual).
const SINGULAR = {
  longitud: { m: 'Metro', ft: 'Pie', cm: 'Centímetro', mm: 'Milímetro', km: 'Kilómetro', yd: 'Yarda', in: 'Pulgada', mi: 'Milla', nm: 'Nanómetro', um: 'Micrómetro', nmi: 'Milla náutica', league: 'Legua', fathom: 'Braza' },
  peso: { kg: 'Kilogramo', g: 'Gramo', lb: 'Libra', oz: 'Onza', t: 'Tonelada', ct: 'Quilate', gr: 'Grano' },
  area: { m2: 'Metro cuadrado', ft2: 'Pie cuadrado', cm2: 'Centímetro cuadrado', in2: 'Pulgada cuadrada', km2: 'Kilómetro cuadrado', mi2: 'Milla cuadrada', ha: 'Hectárea', acre: 'Acre', yd2: 'Yarda cuadrada' },
  volumen: { L: 'Litro', mL: 'Mililitro', m3: 'Metro cúbico', ft3: 'Pie cúbico', galus: 'Galón (US)', galuk: 'Galón (UK)', floz: 'Onza líquida', cup: 'Taza', tbsp: 'Cucharada', tsp: 'Cucharadita', pt: 'Pinta', qt: 'Cuarto', bbl: 'Barril' },
  tiempo: { ms: 'Milisegundo', s: 'Segundo', min: 'Minuto', h: 'Hora', day: 'Día', week: 'Semana', month: 'Mes', year: 'Año', decade: 'Década', century: 'Siglo' },
  velocidad: { ms: 'Metro por segundo', kmh: 'Kilómetro por hora', mph: 'Milla por hora', knot: 'Nudo', fts: 'Pie por segundo' },
  presion: { atm: 'Atmósfera', kpa: 'Kilopascal' },
  energia: { j: 'Joule', cal: 'Caloría' },
  potencia: { w: 'Watt', kw: 'Kilowatt' },
  electricidad: { v: 'Voltio', mv: 'Milivoltio', a: 'Amperio', ma: 'Miliamperio', ohm: 'Ohmio', kohm: 'Kiloohmio' },
  datos: { bit: 'Bit', byte: 'Byte' },
  angulos: { deg: 'Grado', rad: 'Radián', grad: 'Gradián' },
};

// ============================================================================
// 3) Contenido: contexto de uso, "acerca de" y ejemplo cotidiano por categoría
// ============================================================================
const CATEGORY_CONTEXT = {
  longitud: ['medir distancias en el hogar o la oficina', 'proyectos de construcción y carpintería', 'planificar rutas y viajes', 'trabajos de costura, manualidades y diseño'],
  peso: ['ajustar recetas de cocina', 'calcular el peso de equipaje al viajar', 'rutinas de ejercicio y nutrición', 'logística y envíos internacionales'],
  temperatura: ['interpretar el clima y pronósticos', 'cocinar y hornear con precisión', 'contextos médicos y científicos', 'comparar climas entre países'],
  area: ['calcular el tamaño de terrenos y propiedades', 'proyectos de construcción y remodelación', 'agricultura y agrimensura', 'comparar superficies entre países'],
  volumen: ['recetas de cocina y coctelería', 'calcular la capacidad de tanques o recipientes', 'compras de combustible o líquidos a granel', 'ciencia y laboratorio'],
  tiempo: ['planificación de proyectos y tareas', 'cálculos de edad o antigüedad', 'programación y desarrollo de software', 'historia y eventos a largo plazo'],
  velocidad: ['comparar límites de velocidad entre países', 'deportes y actividades al aire libre', 'aviación y náutica', 'ciclismo y running'],
  combustible: ['comparar la eficiencia entre vehículos', 'planificar el gasto de un viaje largo', 'decidir qué auto comprar', 'entender etiquetas de eficiencia energética'],
  presion: ['inflar llantas de auto o bicicleta', 'meteorología y pronósticos del clima', 'buceo y aplicaciones industriales', 'sistemas hidráulicos y neumáticos'],
  energia: ['comparar el valor calórico de alimentos', 'entender el consumo eléctrico del hogar', 'ciencia e ingeniería', 'eficiencia energética de electrodomésticos'],
  potencia: ['comparar motores de vehículos', 'elegir electrodomésticos y equipos', 'sistemas eléctricos y de climatización', 'proyectos de ingeniería'],
  electricidad: ['diseño de circuitos electrónicos', 'reparaciones eléctricas del hogar', 'proyectos de electrónica y robótica', 'especificaciones de baterías y cargadores'],
  datos: ['calcular espacio de almacenamiento', 'planes de datos móviles e internet', 'desarrollo de software', 'transferencia y respaldo de archivos'],
  angulos: ['trigonometría y matemáticas', 'diseño gráfico y CAD', 'navegación y topografía', 'programación gráfica y videojuegos'],
  frecuencia: ['electrónica y telecomunicaciones', 'música y producción de audio', 'procesadores de computadoras', 'ingeniería de radiofrecuencia'],
  densidad: ['identificar materiales en física y química', 'control de calidad industrial', 'flotabilidad de objetos y líquidos', 'mezclas y formulaciones'],
  monedas: ['viajes internacionales y presupuestos', 'compras y comercio en línea', 'remesas y transferencias internacionales', 'inversión y finanzas personales'],
};

const CATEGORY_ABOUT = {
  longitud: 'La longitud es la magnitud que mide la distancia entre dos puntos. Es una de las unidades más usadas en la vida diaria, alternando entre el sistema métrico (metros, centímetros) y el imperial (pies, pulgadas, millas).',
  peso: 'El peso (técnicamente masa) indica cuánta materia tiene un objeto. Se usa constantemente en cocina, salud, comercio y logística, alternando entre el sistema métrico (kilogramos, gramos) y el imperial (libras, onzas).',
  temperatura: 'La temperatura mide qué tan caliente o frío está algo. Las tres escalas más comunes son Celsius (la mayoría del mundo), Fahrenheit (Estados Unidos) y Kelvin (uso científico).',
  area: 'El área mide la extensión de una superficie en dos dimensiones. Se usa para terrenos, construcción, agricultura y cualquier cálculo de espacio plano.',
  volumen: 'El volumen mide cuánto espacio ocupa una sustancia o cuánto puede contener un recipiente. Es clave en cocina, ciencia, y en el comercio de líquidos y combustibles.',
  tiempo: 'El tiempo mide la duración entre eventos. Desde milisegundos hasta siglos, estas unidades permiten planificar, programar y comparar duraciones de cualquier escala.',
  velocidad: 'La velocidad mide qué tan rápido se recorre una distancia en un tiempo determinado. Se usa en tránsito, deportes, aviación y náutica.',
  combustible: 'El consumo de combustible mide la eficiencia de un vehículo: cuánto combustible necesita para recorrer cierta distancia (o viceversa). Es clave para comparar autos y planificar gastos de viaje.',
  presion: 'La presión mide la fuerza ejercida sobre una superficie. Se usa en meteorología, neumáticos, buceo y sistemas industriales.',
  energia: 'La energía mide la capacidad de realizar trabajo. Aparece en la nutrición (calorías), la electricidad (kWh) y la física e ingeniería (joules, BTU).',
  potencia: 'La potencia mide la energía consumida o generada por unidad de tiempo. Es clave para comparar motores, electrodomésticos y sistemas eléctricos.',
  electricidad: 'La electricidad se describe con voltios (tensión), amperios (corriente) y ohmios (resistencia) — fundamentales en electrónica, reparaciones eléctricas y diseño de circuitos.',
  datos: 'El almacenamiento digital mide la cantidad de información en bits, bytes y sus múltiplos (KB, MB, GB, TB). Es esencial para entender planes de datos, discos duros y transferencias de archivos.',
  angulos: 'Los ángulos miden la abertura entre dos líneas o direcciones. Grados, radianes y gradianes son las escalas más comunes en matemáticas, diseño y navegación.',
  frecuencia: 'La frecuencia mide cuántas veces ocurre un evento por segundo (Hertz). Es central en electrónica, telecomunicaciones y audio.',
  densidad: 'La densidad mide cuánta masa tiene un material por unidad de volumen. Ayuda a identificar materiales y a entender por qué algunos objetos flotan y otros no.',
  monedas: 'El tipo de cambio indica cuánto vale una moneda en términos de otra. A diferencia de las unidades físicas, cambia constantemente según los mercados financieros globales.',
};

const ANCHOR_EXAMPLE = {
  longitud: 'una puerta estándar mide unos 2 metros de alto',
  peso: 'una bolsa de azúcar típica pesa 1 kilogramo',
  temperatura: 'el agua se congela a 0 °C (32 °F) y hierve a 100 °C (212 °F)',
  area: 'una cancha de baloncesto mide unos 420 metros cuadrados',
  volumen: 'una botella de refresco típica contiene 2 litros',
  tiempo: 'una clase escolar suele durar 1 hora',
  velocidad: 'el límite de velocidad en ciudad suele ser 50 km/h',
  combustible: 'un auto compacto puede rendir unos 15 km/L',
  presion: 'una llanta de auto se infla normalmente a unos 32 PSI',
  energia: 'una manzana mediana aporta unas 95 calorías',
  potencia: 'una plancha eléctrica típica consume unos 1200 watts',
  electricidad: 'una batería AA típica entrega 1.5 voltios',
  datos: 'una canción en MP3 pesa aproximadamente 4 MB',
  angulos: 'un ángulo recto mide 90 grados',
  frecuencia: 'la corriente eléctrica doméstica es de 50 o 60 Hz según el país',
  densidad: 'el agua tiene una densidad de 1000 kg/m³ (1 g/cm³)',
  monedas: 'los precios y tasas de cambio varían a diario según el mercado',
};

const MAGNITUDE_NAME = {
  longitud: 'longitud o distancia', peso: 'masa (peso)', temperatura: 'temperatura', area: 'área o superficie',
  volumen: 'volumen o capacidad', tiempo: 'tiempo', velocidad: 'velocidad', combustible: 'eficiencia de combustible',
  presion: 'presión', energia: 'energía', potencia: 'potencia', electricidad: 'electricidad', datos: 'almacenamiento digital',
  angulos: 'ángulos', frecuencia: 'frecuencia', densidad: 'densidad', monedas: 'valor monetario (divisas)',
};

const CATEGORY_RELATIONS = {
  longitud: ['area', 'volumen', 'velocidad'], peso: ['densidad', 'volumen'], temperatura: [],
  area: ['longitud', 'volumen'], volumen: ['longitud', 'densidad', 'combustible'], tiempo: ['velocidad', 'frecuencia'],
  velocidad: ['longitud', 'tiempo', 'combustible'], combustible: ['volumen', 'velocidad'], presion: ['energia', 'densidad'],
  energia: ['potencia', 'presion'], potencia: ['energia', 'electricidad'], electricidad: ['potencia'], datos: ['frecuencia'],
  angulos: [], frecuencia: ['tiempo', 'datos'], densidad: ['peso', 'volumen'], monedas: [],
};

const REPRESENTATIVE = {
  longitud: 'metros-a-pies', peso: 'kilogramos-a-libras', temperatura: 'celsius-a-fahrenheit',
  area: 'metros-cuadrados-a-pies-cuadrados', volumen: 'litros-a-galones-us', tiempo: 'horas-a-minutos',
  velocidad: 'kilometros-por-hora-a-millas-por-hora', combustible: 'mpg-a-litros-100km', presion: 'psi-a-bar',
  energia: 'joules-a-calorias', potencia: 'watts-a-kilowatts', electricidad: 'voltios-a-milivoltios',
  datos: 'gb-a-mb', angulos: 'grados-a-radianes', frecuencia: 'hz-a-khz', densidad: 'kg-m3-a-g-cm3', monedas: 'usd-a-eur',
};

const TEMP_FORMULAS = {
  'c-f': '°F = °C × 9/5 + 32', 'f-c': '°C = (°F − 32) × 5/9',
  'c-k': 'K = °C + 273.15', 'k-c': '°C = K − 273.15',
  'f-k': 'K = (°F − 32) × 5/9 + 273.15', 'k-f': '°F = (K − 273.15) × 9/5 + 32',
};
const FUEL_FORMULAS = {
  'mpg-l100km': 'L/100 km = 235.214583 ÷ MPG', 'l100km-mpg': 'MPG = 235.214583 ÷ (L/100 km)',
  'kml-l100km': 'L/100 km = 100 ÷ (km/L)', 'l100km-kml': 'km/L = 100 ÷ (L/100 km)',
  'mpg-kml': 'km/L = 100 ÷ (235.214583 ÷ MPG)', 'kml-mpg': 'MPG = 235.214583 ÷ (100 ÷ km/L)',
};

// ============================================================================
// 4) Utilidades
// ============================================================================
function rawLabelOf(tab, code) {
  if (tab === 'temperatura') return engine.TEMP_UNITS.find(u => u.code === code).label;
  if (tab === 'combustible') return engine.FUEL_UNITS.find(u => u.code === code).label;
  if (tab === 'monedas') return code;
  const cat = engine.CATEGORIES.find(c => c.id === tab);
  return cat.units.find(u => u.code === code).label;
}
function labelOf(tab, code) {
  return DISPLAY_LABEL_OVERRIDE[`${tab}:${code}`] || rawLabelOf(tab, code);
}
function singularOf(tab, code) {
  return (SINGULAR[tab] && SINGULAR[tab][code]) || labelOf(tab, code);
}
function tabLabel(tab) {
  if (tab === 'monedas') return 'Monedas';
  return engine.TAB_DEFS.find(t => t.id === tab)?.label || tab;
}
function convert(tab, from, to, v, rates) {
  if (tab === 'temperatura') return engine.convertTemp(from, to, v);
  if (tab === 'combustible') return engine.convertFuel(from, to, v);
  if (tab === 'monedas') return (v / rates[from]) * rates[to];
  return engine.convertLinear(tab, from, to, v);
}
function sampleValues(tab) {
  if (tab === 'temperatura') return [-40, -18, 0, 20, 37, 100];
  if (tab === 'combustible') return [10, 20, 30, 40, 50];
  if (tab === 'angulos') return [1, 30, 45, 90, 180, 360];
  if (tab === 'monedas') return [1, 10, 50, 100, 500, 1000, 5000, 10000];
  return [1, 2, 5, 10, 25, 50, 100, 250, 500, 1000, 10000];
}
function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
function hashStr(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}
// "1 Kilogramo" en singular, "5 Kilogramos" en plural — evita el error de "1 Metros".
function numWithUnit(n, tab, code) {
  const label = n === 1 ? singularOf(tab, code) : labelOf(tab, code);
  return `${engine.fmt(n)} ${label}`;
}
function formulaText(tab, from, to, labelFrom, labelTo, exampleResult) {
  if (tab === 'temperatura') return TEMP_FORMULAS[`${from}-${to}`];
  if (tab === 'combustible') return FUEL_FORMULAS[`${from}-${to}`];
  if (tab === 'monedas') return `${labelTo} = ${labelFrom} × tasa de cambio actual (variable)`;
  return `${labelTo} = ${labelFrom} × ${engine.fmt(exampleResult)}`;
}
function fill(tpl, vars) {
  return tpl.replace(/{{(\w+)}}/g, (_, key) => (key in vars ? vars[key] : ''));
}
function writePage(slug, html) {
  const dir = slug ? path.join(OUT, slug) : OUT;
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), html);
}

// ============================================================================
// 5) Variedad de títulos y descripciones (para no repetir el mismo patrón 1000 veces)
// ============================================================================
function buildTitle(h, labelFrom, labelTo, from, to) {
  const variants = [
    `${labelFrom} a ${labelTo} — ${SITE_NAME}`,
    `${labelFrom} a ${labelTo} (${from} → ${to}) | Conversor Gratis`,
    `Convertir ${labelFrom} a ${labelTo} | ${SITE_NAME}`,
  ];
  return variants[h % variants.length];
}
function buildDescription(h, tab, labelFrom, labelTo, singFrom, exampleResult, isCurrency) {
  if (isCurrency) {
    return `Convierte ${labelFrom} a ${labelTo}. Tasa de referencia: 1 ${labelFrom} ≈ ${engine.fmt(exampleResult)} ${labelTo} (actualizada ${BUILD_DATE}). Calculadora en vivo gratuita.`;
  }
  const variants = [
    `Convierte ${labelFrom} a ${labelTo} al instante. 1 ${singFrom} = ${engine.fmt(exampleResult)} ${labelTo}. Calculadora online gratuita y precisa.`,
    `¿Cuántos ${labelTo.toLowerCase()} hay en 1 ${singFrom.toLowerCase()}? Tabla, fórmula y calculadora gratis de ${labelFrom.toLowerCase()} a ${labelTo.toLowerCase()}.`,
    `Tabla, fórmula y calculadora para convertir ${labelFrom.toLowerCase()} a ${labelTo.toLowerCase()} al instante, con ejemplos y preguntas frecuentes.`,
  ];
  return variants[h % variants.length];
}

// ============================================================================
// 6) Home
// ============================================================================
function buildHome() {
  const title = `${SITE_NAME} — Convierte unidades, monedas y más`;
  const description = `Más de ${conversions.length} conversiones de unidades, monedas, tallas y calculadoras. Metros a pies, kilogramos a libras, Celsius a Fahrenheit y más. Gratis y en tiempo real.`;
  const jsonld = {
    '@context': 'https://schema.org', '@type': 'WebApplication', name: SITE_NAME, url: `${SITE_URL}/`,
    applicationCategory: 'UtilityApplication', operatingSystem: 'Any', description,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  };
  const html = fill(template, {
    TITLE: esc(title), DESCRIPTION: esc(description), CANONICAL: `${SITE_URL}/`, OG_TITLE: esc(title),
    JSONLD: `<script type="application/ld+json">${JSON.stringify(jsonld)}</script>`,
    ASSET_PREFIX: '/', BREADCRUMB: '', H1: `Conversor <span>Universal</span>`,
    SUBTITLE: `Escribe en lenguaje natural o usa los conversores por categoría — ${conversions.length}+ conversiones listas.`,
    TOC_BLOCK: '', INTRO_BLOCK: '', LEARN_BLOCK: '', RELATED_BLOCK: '', FAQ_BLOCK: '', PRESET_SCRIPT: '',
  });
  writePage('', html);
}

// ============================================================================
// 7) Una página por conversión
// ============================================================================
function buildConversionPages(rates) {
  const bySlug = new Map(conversions.map(c => [c.slug, c]));

  for (const conv of conversions) {
    const { slug, tab, from, to } = conv;
    const labelFrom = labelOf(tab, from);
    const labelTo = labelOf(tab, to);
    const singFrom = singularOf(tab, from);
    const singTo = singularOf(tab, to);
    const catLabel = tabLabel(tab);
    const magnitude = MAGNITUDE_NAME[tab];
    const isCurrency = tab === 'monedas';
    const h = hashStr(slug);

    const exampleResult = convert(tab, from, to, 1, rates);
    const rows = sampleValues(tab)
      .map(v => `<tr><td>${numWithUnit(v, tab, from)}</td><td>= ${engine.fmt(convert(tab, from, to, v, rates))} ${esc(labelTo)}</td></tr>`)
      .join('');

    const ctx = CATEGORY_CONTEXT[tab] || [];
    const ctxIntroA = ctx.length ? ctx[h % ctx.length] : null;
    const ctxIntroB = ctx.length > 1 ? ctx[(h + 1) % ctx.length] : null;
    // Offset distinto para el bloque "Aprende más", así no repite literalmente las mismas frases.
    const ctxLearnA = ctx.length > 2 ? ctx[(h + 2) % ctx.length] : ctxIntroA;
    const ctxLearnB = ctx.length > 3 ? ctx[(h + 3) % ctx.length] : ctxIntroB;

    const formula = formulaText(tab, from, to, labelFrom, labelTo, exampleResult);

    const title = buildTitle(h, labelFrom, labelTo, from, to);
    const description = buildDescription(h, tab, labelFrom, labelTo, singFrom, exampleResult, isCurrency);
    const canonical = `${SITE_URL}/${slug}/`;
    const h1 = cap(`Convertir ${labelFrom.toLowerCase()} a ${labelTo.toLowerCase()}`);

    // -------- Tabla de contenidos --------
    const tocBlock = `    <nav class="toc" aria-label="Contenido de esta página">
      <a href="#calculadora">Calculadora</a>
      <a href="#tabla">Tabla</a>
      <a href="#formula">Fórmula</a>
      <a href="#explicacion">Explicación</a>
      <a href="#relacionadas">Relacionadas</a>
      <a href="#faq">Preguntas frecuentes</a>
    </nav>\n`;

    // -------- Bloque de introducción: equivalencia + fórmula destacada + tabla --------
    const introBlock = `    <section id="intro" class="content-section">
      <p class="seo-intro">${cap(numWithUnit(1, tab, from))} equivale a ${engine.fmt(exampleResult)} ${esc(labelTo)}${isCurrency ? ` <em>(referencia ${BUILD_DATE})</em>` : ''}. ${ctxIntroA ? `Esta conversión de ${esc(magnitude)} se usa frecuentemente para ${esc(ctxIntroA)}${ctxIntroB ? ` y ${esc(ctxIntroB)}` : ''}.` : ''}</p>
      ${formula ? `<div id="formula" class="formula-box">
        <p class="formula-label">Fórmula</p>
        <p class="formula-text">${esc(formula)}</p>
      </div>` : ''}
      <table id="tabla" class="seo-table">${rows}</table>
    </section>\n`;

    // -------- Bloque "Aprende más" --------
    let scaleSentence;
    if (exampleResult > 1) {
      scaleSentence = `${cap(singTo.toLowerCase())} es una unidad más pequeña que ${singFrom.toLowerCase()}: por eso 1 ${singFrom.toLowerCase()} equivale a ${engine.fmt(exampleResult)} ${labelTo.toLowerCase()}. ${cap(labelTo.toLowerCase())} suele usarse para medir cantidades menores, mientras que ${labelFrom.toLowerCase()} es más práctico para cantidades mayores.`;
    } else if (exampleResult < 1) {
      scaleSentence = `${cap(singTo.toLowerCase())} es una unidad más grande que ${singFrom.toLowerCase()}: por eso 1 ${singFrom.toLowerCase()} equivale a solo ${engine.fmt(exampleResult)} ${labelTo.toLowerCase()}. ${cap(labelFrom.toLowerCase())} suele usarse para cantidades pequeñas, mientras que ${labelTo.toLowerCase()} es más práctico para cantidades mayores.`;
    } else {
      scaleSentence = `Ambas unidades pertenecen a la misma magnitud (${magnitude}), aunque provienen de sistemas o contextos distintos.`;
    }

    const learnBlock = `    <section id="explicacion" class="content-section">
      <h2 class="section-title">Aprende más sobre esta conversión</h2>
      <p class="learn-p"><strong>¿Qué diferencia hay entre ${esc(singFrom.toLowerCase())} y ${esc(singTo.toLowerCase())}?</strong> ${scaleSentence}</p>
      <p class="learn-p">${cap(magnitude)} es una magnitud presente en ${ctxLearnA || 'muchos contextos cotidianos'}${ctxLearnB ? ` y en ${ctxLearnB}` : ''}.</p>
      <p class="learn-p">Como referencia: ${esc(ANCHOR_EXAMPLE[tab] || '')}.</p>
      <p class="learn-p seo-about">${esc(CATEGORY_ABOUT[tab] || '')}</p>
    </section>\n`;

    // -------- FAQs (4, al final de la página) --------
    const reverseSlug = engine.slugFor(tab, to, from);
    const faqs = [
      {
        q: `¿Cuántos ${labelTo.toLowerCase()} son 1 ${singFrom.toLowerCase()}?`,
        aText: isCurrency
          ? `1 ${labelFrom} equivale aproximadamente a ${engine.fmt(exampleResult)} ${labelTo} (tasa de referencia del ${BUILD_DATE}; el valor exacto cambia a diario).`
          : `1 ${singFrom} equivale a ${engine.fmt(exampleResult)} ${labelTo}.`,
      },
      {
        q: `¿Cómo convertir ${labelFrom.toLowerCase()} a ${labelTo.toLowerCase()}?`,
        aText: isCurrency
          ? `Multiplica la cantidad en ${labelFrom.toLowerCase()} por la tasa de cambio actual hacia ${labelTo.toLowerCase()}. La tasa varía a diario; usa la calculadora en vivo de esta página para el valor exacto.`
          : `Multiplica la cantidad en ${labelFrom.toLowerCase()} por ${engine.fmt(exampleResult)}. Fórmula: ${formula}.`,
      },
      {
        q: `¿Para qué se usa la conversión de ${labelFrom.toLowerCase()} a ${labelTo.toLowerCase()}?`,
        aText: ctxIntroA
          ? `Esta conversión es útil, por ejemplo, en ${ctxIntroA}${ctxIntroB ? ` y en ${ctxIntroB}` : ''}.`
          : `Esta conversión es útil en distintos contextos cotidianos y profesionales relacionados con ${magnitude}.`,
      },
      {
        q: `¿Cómo hago la conversión inversa, de ${labelTo.toLowerCase()} a ${labelFrom.toLowerCase()}?`,
        aTextPlain: `Puedes usar el conversor de ${labelTo} a ${labelFrom}, disponible en este mismo sitio.`,
        aHtmlLink: reverseSlug,
      },
    ];
    const faqHtml = faqs.map(f => {
      const answer = f.aHtmlLink
        ? `Puedes usar el conversor de <a href="/${f.aHtmlLink}/">${esc(labelTo)} a ${esc(labelFrom)}</a>, disponible en este mismo sitio.`
        : esc(f.aText);
      return `<div class="faq-item"><p class="faq-q">${esc(f.q)}</p><p class="faq-a">${answer}</p></div>`;
    }).join('');

    const jsonld = [
      {
        '@context': 'https://schema.org', '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Inicio', item: `${SITE_URL}/` },
          { '@type': 'ListItem', position: 2, name: catLabel, item: `${SITE_URL}/#${tab}` },
          { '@type': 'ListItem', position: 3, name: `${labelFrom} a ${labelTo}`, item: canonical },
        ],
      },
      {
        '@context': 'https://schema.org', '@type': 'FAQPage',
        mainEntity: faqs.map(f => ({
          '@type': 'Question', name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.aTextPlain || f.aText },
        })),
      },
    ];

    // -------- Enlaces internos: prioriza pares que comparten "from" o "to" con esta página --------
    const candidates = [];
    const pushIfNew = (c, weight) => { if (c.slug !== slug && !candidates.find(x => x.slug === c.slug)) candidates.push({ ...c, weight }); };
    for (const c of conversions) if (c.tab === tab && c.from === from) pushIfNew(c, 0);   // kg → *
    for (const c of conversions) if (c.tab === tab && c.from === to) pushIfNew(c, 1);     // gramos → *
    for (const c of conversions) if (c.tab === tab && c.to === from) pushIfNew(c, 2);     // * → kg
    for (const c of conversions) if (c.tab === tab) pushIfNew(c, 3);                      // relleno
    candidates.sort((a, b) => a.weight - b.weight);
    const sameCat = candidates.slice(0, 8);
    const sameCatHtml = sameCat.map(r => `<a href="/${r.slug}/">${esc(labelOf(r.tab, r.from))} a ${esc(labelOf(r.tab, r.to))}</a>`).join('');

    const relatedTabs = CATEGORY_RELATIONS[tab] || [];
    const crossCatHtml = relatedTabs.map(rt => {
      const repSlug = REPRESENTATIVE[rt];
      const rc = bySlug.get(repSlug);
      if (!rc) return '';
      return `<a href="/${repSlug}/">${esc(tabLabel(rt))}: ${esc(labelOf(rc.tab, rc.from))} a ${esc(labelOf(rc.tab, rc.to))}</a>`;
    }).filter(Boolean).join('');

    const relatedParts = [`    <section id="relacionadas" class="content-section">`];
    relatedParts.push(`      <h2 class="section-title">También puedes convertir</h2>`);
    if (sameCatHtml) relatedParts.push(`      <div class="related-links">${sameCatHtml}</div>`);
    if (crossCatHtml) {
      relatedParts.push(`      <p class="related-label">Categorías relacionadas</p>`);
      relatedParts.push(`      <div class="related-links related-links-cross">${crossCatHtml}</div>`);
    }
    relatedParts.push(`    </section>\n`);
    const relatedBlock = relatedParts.join('\n');

    const faqBlock = `    <section id="faq" class="content-section">
      <h2 class="section-title">Preguntas frecuentes</h2>
      <div class="faq-block">${faqHtml}</div>
    </section>\n`;

    const html = fill(template, {
      TITLE: esc(title), DESCRIPTION: esc(description), CANONICAL: canonical, OG_TITLE: esc(`${labelFrom} a ${labelTo}`),
      JSONLD: `<script type="application/ld+json">${JSON.stringify(jsonld)}</script>`,
      ASSET_PREFIX: '/',
      BREADCRUMB: `      <p class="breadcrumb"><a href="/">Inicio</a> · <a href="/#${tab}">${esc(catLabel)}</a> · <span>${esc(labelFrom)} a ${esc(labelTo)}</span></p>`,
      H1: h1,
      SUBTITLE: `Conversión de ${esc(labelFrom.toLowerCase())} a ${esc(labelTo.toLowerCase())}, con calculadora interactiva.`,
      TOC_BLOCK: tocBlock,
      INTRO_BLOCK: introBlock,
      LEARN_BLOCK: learnBlock,
      RELATED_BLOCK: relatedBlock,
      FAQ_BLOCK: faqBlock,
      PRESET_SCRIPT: `<script>window.PRESET = { tab: '${tab}', from: '${from}', to: '${to}' };</script>\n`,
    });

    writePage(slug, html);
  }
}

// ============================================================================
// 8) sitemap.xml + robots.txt + CNAME + .nojekyll
// ============================================================================
function buildMeta() {
  const urlEntry = (loc, priority) =>
    `  <url><loc>${loc}</loc><lastmod>${BUILD_DATE}</lastmod><changefreq>weekly</changefreq><priority>${priority}</priority></url>`;
  const sitemap = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    urlEntry(`${SITE_URL}/`, '1.0'),
    ...conversions.map(c => urlEntry(`${SITE_URL}/${c.slug}/`, '0.7')),
    '</urlset>',
  ].join('\n');
  fs.writeFileSync(path.join(OUT, 'sitemap.xml'), sitemap);
  fs.writeFileSync(path.join(OUT, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${SITE_URL}/sitemap.xml\n`);
  fs.writeFileSync(path.join(OUT, '.nojekyll'), '');
  fs.writeFileSync(path.join(OUT, 'CNAME'), SITE_URL.replace(/^https?:\/\//, '') + '\n');
  fs.writeFileSync(path.join(OUT, 'ads.txt'), `google.com, ${ADSENSE_PUBLISHER_ID}, DIRECT, f08c47fec0942fa0\n`);
}

function copyAssets() {
  const dest = path.join(OUT, 'assets');
  fs.mkdirSync(dest, { recursive: true });
  fs.copyFileSync(path.join(ROOT, 'assets/style.css'), path.join(dest, 'style.css'));
  fs.copyFileSync(path.join(ROOT, 'assets/app.js'), path.join(dest, 'app.js'));
}

async function main() {
  fs.rmSync(OUT, { recursive: true, force: true });
  fs.mkdirSync(OUT, { recursive: true });
  copyAssets();
  const rates = await fetchBuildRates();
  buildHome();
  buildConversionPages(rates);
  buildMeta();
  console.log(`✅ Sitio generado en /docs: 1 home + ${conversions.length} páginas (monedas: ${rates === engine.STATIC_RATES ? 'fallback estático' : 'en vivo'}).`);
}

main();
