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
const SITE_NAME = 'Convertidor Universal';
const ADSENSE_PUBLISHER_ID = process.env.ADSENSE_PUBLISHER_ID || 'pub-2394878225224723';
const CONTACT_EMAIL = process.env.CONTACT_EMAIL || 'frailinmarte123@gmail.com';
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
// Igual que numWithUnit, pero para valores calculados (no enteros de entrada): compara
// sobre el string YA REDONDEADO por engine.fmt, no sobre el float crudo. Evita que un
// resultado como 1000 g → 1 kg (o 1000 mv → 1 v) se muestre como "1 Kilogramos"/"1 Voltios"
// por una comparación de punto flotante que nunca da exactamente 1.
function unitWithFmt(rawValue, tab, code) {
  const formatted = engine.fmt(rawValue);
  const isOne = formatted === '1';
  const label = isOne ? singularOf(tab, code) : labelOf(tab, code);
  return `${formatted} ${label}`;
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

  // -------- Contenido propio de la home (para no ser una pantalla "sin contenido del
  // editor": explicación de qué es el sitio, cómo usarlo, categorías con descripción
  // real y FAQ del sitio en sí, no de una conversión puntual). --------
  const categoryOrder = Object.keys(CATEGORY_ABOUT);
  const categoryCardsHtml = categoryOrder.map(tab => {
    const repSlug = REPRESENTATIVE[tab];
    const rc = conversions.find(c => c.slug === repSlug);
    const label = tabLabel(tab);
    const about = CATEGORY_ABOUT[tab] || '';
    const firstSentence = about.split(/(?<=\.)\s+/)[0] || about;
    const href = rc ? `/${repSlug}/` : '/';
    return `<a class="category-card" href="${href}"><h3>${esc(label)}</h3><p>${esc(firstSentence)}</p></a>`;
  }).join('');

  const tocBlock = `    <nav class="toc" aria-label="Contenido de esta página">
      <a href="#calculadora">Calculadora</a>
      <a href="#acerca">Qué es</a>
      <a href="#categorias">Categorías</a>
      <a href="#faq">Preguntas frecuentes</a>
    </nav>\n`;

  const introBlock = `    <section id="acerca" class="content-section">
      <h2 class="section-title">Qué es Convertidor Universal</h2>
      <p class="seo-intro">Convertidor Universal es una calculadora de unidades gratuita y sin registro, con ${conversions.length}+ conversiones listas entre ${categoryOrder.length} categorías: longitud, peso, temperatura, volumen, monedas y muchas más. Cada conversión tiene su propia página con calculadora interactiva, tabla de referencia, la fórmula exacta y respuestas a las preguntas más comunes.</p>
      <p class="learn-p">Puedes escribir tu conversión en lenguaje natural en el buscador de arriba — por ejemplo <em>"1 metro en pies"</em>, <em>"36 c a f"</em> o <em>"5 kg en libras"</em> — o elegir una categoría en las pestañas para usar la calculadora completa con todas sus unidades.</p>
    </section>\n`;

  const learnBlock = `    <section id="categorias" class="content-section">
      <h2 class="section-title">Categorías disponibles</h2>
      <div class="category-grid">${categoryCardsHtml}</div>
    </section>\n`;

  const homeFaqs = [
    { q: '¿Convertidor Universal es gratis?', a: 'Sí, todas las conversiones y calculadoras son gratuitas y no requieren registro ni instalación.' },
    { q: '¿De dónde salen las tasas de cambio de monedas?', a: 'La calculadora de monedas obtiene la tasa en vivo desde tu navegador al momento de usarla; el sitio también se actualiza a diario con valores de referencia. Son cifras orientativas — para operaciones financieras confirma la tasa con tu banco o casa de cambio.' },
    { q: '¿Cuántas conversiones tiene el sitio?', a: `El sitio incluye ${conversions.length}+ conversiones entre ${categoryOrder.length} categorías de unidades físicas, además de calculadoras de tallas, pantallas y otras utilidades.` },
    { q: '¿Necesito instalar algo o crear una cuenta?', a: 'No. Convertidor Universal funciona directamente en el navegador, sin instalación ni cuentas.' },
  ];
  const homeFaqHtml = homeFaqs.map(f => `<div class="faq-item"><p class="faq-q">${esc(f.q)}</p><p class="faq-a">${esc(f.a)}</p></div>`).join('');
  const faqBlock = `    <section id="faq" class="content-section">
      <h2 class="section-title">Preguntas frecuentes</h2>
      <div class="faq-block">${homeFaqHtml}</div>
    </section>\n`;

  const jsonld = [
    {
      '@context': 'https://schema.org', '@type': 'WebApplication', name: SITE_NAME, url: `${SITE_URL}/`,
      applicationCategory: 'UtilityApplication', operatingSystem: 'Any', description,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
    {
      '@context': 'https://schema.org', '@type': 'FAQPage',
      mainEntity: homeFaqs.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
    },
  ];

  const html = fill(template, {
    TITLE: esc(title), DESCRIPTION: esc(description), CANONICAL: `${SITE_URL}/`, OG_TITLE: esc(title),
    JSONLD: `<script type="application/ld+json">${JSON.stringify(jsonld)}</script>`,
    ASSET_PREFIX: '/', BREADCRUMB: '', H1: `Convertidor <span>Universal</span>`,
    SUBTITLE: `Escribe en lenguaje natural o usa los conversores por categoría — ${conversions.length}+ conversiones listas.`,
    TOC_BLOCK: tocBlock, INTRO_BLOCK: introBlock, LEARN_BLOCK: learnBlock, RELATED_BLOCK: '', FAQ_BLOCK: faqBlock, PRESET_SCRIPT: '',
  });
  writePage('', html);
}

// ============================================================================
// 6b) Páginas estáticas: Acerca de, Contacto, Privacidad
// ============================================================================
function buildStaticPage({ slug, title, description, breadcrumbLabel, bodyHtml }) {
  const canonical = `${SITE_URL}/${slug}/`;
  const jsonld = {
    '@context': 'https://schema.org', '@type': 'WebPage', name: title, url: canonical, description,
  };
  const html = fill(template, {
    TITLE: esc(title), DESCRIPTION: esc(description), CANONICAL: canonical, OG_TITLE: esc(title),
    JSONLD: `<script type="application/ld+json">${JSON.stringify(jsonld)}</script>`,
    ASSET_PREFIX: '/',
    BREADCRUMB: `      <p class="breadcrumb"><a href="/">Inicio</a> · <span>${esc(breadcrumbLabel)}</span></p>`,
    H1: esc(breadcrumbLabel),
    SUBTITLE: description,
    TOC_BLOCK: '', INTRO_BLOCK: bodyHtml, LEARN_BLOCK: '', RELATED_BLOCK: '', FAQ_BLOCK: '', PRESET_SCRIPT: '',
  });
  writePage(slug, html);
}

function buildAcercaDe() {
  const bodyHtml = `    <section id="acerca" class="content-section">
      <p class="seo-intro">Soy la persona detrás de Convertidor Universal. Lo armé solo, en mi tiempo libre, porque me cansé de buscar cada conversión por separado — a veces una calculadora de unidades, otras un conversor de monedas, otras una tabla de tallas — y casi nunca encontraba un sitio que juntara todo eso en un solo lugar, sin registro y sin tardar una eternidad en cargar.</p>
      <p class="learn-p">Empezó como algo pequeño para uso personal — necesitaba convertir medidas y precios entre distintas monedas de la región todo el tiempo — y terminó creciendo hasta las ${conversions.length}+ conversiones que tiene hoy, entre longitud, peso, temperatura, volumen, electricidad, densidad, ángulos y monedas, entre otras.</p>
      <p class="learn-p">Está hecho con HTML, CSS y JavaScript puro, sin frameworks pesados, a propósito: quería que cargara rápido incluso con conexiones lentas, algo que sigue siendo la realidad de muchas personas en Latinoamérica.</p>
      <p class="learn-p">Lo mantengo yo solo. El sitio se sostiene con publicidad (Google AdSense), lo que me permite mantenerlo gratuito y sin límites de uso para todos. Si encuentras un error de cálculo, una unidad que falta, o simplemente quieres escribirme, en <a class="inline-link" href="/contacto/">Contacto</a> te dejo cómo hacerlo.</p>
    </section>\n`;
  buildStaticPage({
    slug: 'acerca-de',
    title: `Acerca de — ${SITE_NAME}`,
    description: 'Quién hizo Convertidor Universal, por qué existe y cómo está construido.',
    breadcrumbLabel: 'Acerca de',
    bodyHtml,
  });
}

function buildContacto() {
  const bodyHtml = `    <section id="contacto" class="content-section">
      <p class="seo-intro">¿Tienes una pregunta, encontraste un error en alguna conversión, o quieres sugerir una unidad o moneda que falta? Escríbeme directamente:</p>
      <p class="learn-p"><a class="inline-link" href="mailto:${esc(CONTACT_EMAIL)}">${esc(CONTACT_EMAIL)}</a></p>
      <p class="learn-p seo-about">Convertidor Universal es un proyecto que mantengo yo solo, así que las respuestas pueden tardar unos días — pero leo todos los mensajes.</p>
    </section>\n`;
  buildStaticPage({
    slug: 'contacto',
    title: `Contacto — ${SITE_NAME}`,
    description: 'Cómo ponerte en contacto con Convertidor Universal.',
    breadcrumbLabel: 'Contacto',
    bodyHtml,
  });
}

function buildPrivacidad() {
  const bodyHtml = `    <section id="privacidad" class="content-section">
      <p class="seo-intro">Última actualización: ${BUILD_DATE}.</p>
      <h2 class="section-title">Información general</h2>
      <p class="learn-p">Convertidor Universal (${SITE_URL}/) es un sitio operado de forma independiente. No pedimos registro ni cuenta para usar ninguna de sus calculadoras, y no recopilamos directamente datos personales tuyos a través de formularios.</p>
      <h2 class="section-title">Cookies y publicidad (Google AdSense)</h2>
      <p class="learn-p">Este sitio muestra anuncios a través de Google AdSense. Google y sus socios publicitarios pueden usar cookies y tecnologías similares para mostrar anuncios según tus visitas a este sitio y a otros, incluyendo, cuando corresponda, anuncios personalizados basados en tu actividad previa. Estas cookies son gestionadas por Google, no por nosotros.</p>
      <ul class="plain-list">
        <li>Puedes ver y ajustar cómo Google personaliza los anuncios que te muestra en <a class="inline-link" href="https://adssettings.google.com/" target="_blank" rel="noopener">adssettings.google.com</a>.</li>
        <li>Puedes leer la política de Google sobre el uso de cookies en publicidad en <a class="inline-link" href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener">policies.google.com/technologies/ads</a>.</li>
        <li>Si estás en la Unión Europea, también puedes gestionar tus preferencias de publicidad en <a class="inline-link" href="https://www.youronlinechoices.eu/" target="_blank" rel="noopener">youronlinechoices.eu</a>.</li>
      </ul>
      <h2 class="section-title">Enlaces a terceros</h2>
      <p class="learn-p">Algunas páginas incluyen enlaces a sitios externos (por ejemplo, fuentes de tasas de cambio). No somos responsables de las prácticas de privacidad de esos sitios; te recomendamos revisar sus propias políticas.</p>
      <h2 class="section-title">Cambios a esta política</h2>
      <p class="learn-p">Podemos actualizar esta política ocasionalmente. Los cambios se publican en esta misma página con la fecha de última actualización arriba.</p>
      <h2 class="section-title">Contacto</h2>
      <p class="learn-p seo-about">Si tienes preguntas sobre esta política, escríbenos a <a class="inline-link" href="mailto:${esc(CONTACT_EMAIL)}">${esc(CONTACT_EMAIL)}</a>.</p>
    </section>\n`;
  buildStaticPage({
    slug: 'privacidad',
    title: `Política de Privacidad — ${SITE_NAME}`,
    description: 'Cómo usamos cookies y publicidad de Google AdSense en Convertidor Universal, y cómo puedes ajustar tus preferencias.',
    breadcrumbLabel: 'Política de Privacidad',
    bodyHtml,
  });
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
      .map(v => `<tr><td>${numWithUnit(v, tab, from)}</td><td>= ${unitWithFmt(convert(tab, from, to, v, rates), tab, to)}</td></tr>`)
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
      SUBTITLE: `Convierte ${esc(labelFrom.toLowerCase())} a ${esc(labelTo.toLowerCase())} de forma rápida y precisa. Utiliza esta calculadora gratuita para obtener el resultado al instante, consultar la fórmula y ver una tabla de conversión.`,
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
    urlEntry(`${SITE_URL}/acerca-de/`, '0.5'),
    urlEntry(`${SITE_URL}/contacto/`, '0.5'),
    urlEntry(`${SITE_URL}/privacidad/`, '0.3'),
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

  fs.copyFileSync(path.join(ROOT, 'favicon.png'), path.join(OUT, 'favicon.png'));
}

async function main() {
  fs.rmSync(OUT, { recursive: true, force: true });
  fs.mkdirSync(OUT, { recursive: true });
  copyAssets();
  const rates = await fetchBuildRates();
  buildHome();
  buildAcercaDe();
  buildContacto();
  buildPrivacidad();
  buildConversionPages(rates);
  buildMeta();
  console.log(`✅ Sitio generado en /docs: 1 home + 3 páginas estáticas + ${conversions.length} páginas (monedas: ${rates === engine.STATIC_RATES ? 'fallback estático' : 'en vivo'}).`);
}

main();
