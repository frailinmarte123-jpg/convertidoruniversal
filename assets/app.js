// ============================================================
// BASE DE DATOS DE UNIDADES — conversiones lineales (factor = valor de 1 unidad expresado en la unidad base)
// ============================================================
const CATEGORIES = [
  {
    id: 'longitud', name: 'Longitud', icon: '📏', base: 'm',
    units: [
      { code: 'm',  label: 'Metros',       aliases: ['m','metro','metros','mts','mt'], factor: 1 },
      { code: 'ft', label: 'Pies',         aliases: ['ft','pie','pies','foot','feet'], factor: 0.3048 },
      { code: 'cm', label: 'Centímetros',  aliases: ['cm','centimetro','centimetros','centímetro','centímetros'], factor: 0.01 },
      { code: 'mm', label: 'Milímetros',   aliases: ['mm','milimetro','milimetros','milímetro','milímetros'], factor: 0.001 },
      { code: 'km', label: 'Kilómetros',   aliases: ['km','kilometro','kilometros','kilómetro','kilómetros'], factor: 1000 },
      { code: 'yd', label: 'Yardas',       aliases: ['yd','yarda','yardas','yard','yards'], factor: 0.9144 },
      { code: 'in', label: 'Pulgadas',     aliases: ['in','pulgada','pulgadas','inch','inches'], factor: 0.0254 },
      { code: 'mi', label: 'Millas',       aliases: ['mi','milla','millas','mile','miles'], factor: 1609.344 },
      { code: 'nm', label: 'Nanómetros',   aliases: ['nm','nanometro','nanometros','nanómetro','nanómetros'], factor: 1e-9 },
      { code: 'um', label: 'Micrómetros',  aliases: ['um','micrometro','micrometros','micrómetro','micrómetros','micra','micras'], factor: 1e-6 },
      { code: 'nmi', label: 'Millas náuticas', aliases: ['nmi','milla nautica','millas nauticas','milla náutica','millas náuticas','nautical mile'], factor: 1852 },
      { code: 'league', label: 'Leguas', aliases: ['league','leagues','legua','leguas'], factor: 4828.032 },
      { code: 'fathom', label: 'Brazas', aliases: ['fathom','fathoms','braza','brazas'], factor: 1.8288 },
    ]
  },
  {
    id: 'peso', name: 'Peso', icon: '⚖️', base: 'kg',
    units: [
      { code: 'kg', label: 'Kilogramos', aliases: ['kg','kilo','kilos','kilogramo','kilogramos'], factor: 1 },
      { code: 'g',  label: 'Gramos',     aliases: ['g','gramo','gramos'], factor: 0.001 },
      { code: 'lb', label: 'Libras',     aliases: ['lb','lbs','libra','libras','pound','pounds'], factor: 0.45359237 },
      { code: 'oz', label: 'Onzas',      aliases: ['oz','onza','onzas','ounce','ounces'], factor: 0.0283495231 },
      { code: 't',  label: 'Toneladas',  aliases: ['t','ton','tons','tonelada','toneladas'], factor: 1000 },
      { code: 'ct', label: 'Quilates',   aliases: ['ct','quilate','quilates','carat','carats'], factor: 0.0002 },
      { code: 'st', label: 'Stone',      aliases: ['st','stone','stones'], factor: 6.35029318 },
      { code: 'gr', label: 'Granos',     aliases: ['gr','grano','granos','grain','grains'], factor: 0.00006479891 },
    ]
  },
  {
    id: 'area', name: 'Área', icon: '📐', base: 'm2',
    units: [
      { code: 'm2',  label: 'Metros cuadrados',     aliases: ['m2','metros cuadrados','metro cuadrado','m²'], factor: 1 },
      { code: 'ft2', label: 'Pies cuadrados',       aliases: ['ft2','pies cuadrados','pie cuadrado','ft²'], factor: 0.09290304 },
      { code: 'cm2', label: 'Centímetros cuadrados',aliases: ['cm2','centimetros cuadrados','centímetros cuadrados','cm²'], factor: 0.0001 },
      { code: 'in2', label: 'Pulgadas cuadradas',   aliases: ['in2','pulgadas cuadradas','pulgada cuadrada','in²'], factor: 0.00064516 },
      { code: 'km2', label: 'Kilómetros cuadrados', aliases: ['km2','kilometros cuadrados','kilómetros cuadrados','km²'], factor: 1e6 },
      { code: 'mi2', label: 'Millas cuadradas',     aliases: ['mi2','millas cuadradas','milla cuadrada','mi²'], factor: 2589988.110336 },
      { code: 'ha',  label: 'Hectáreas',            aliases: ['ha','hectarea','hectareas','hectárea','hectáreas'], factor: 10000 },
      { code: 'acre',label: 'Acres',                aliases: ['acre','acres'], factor: 4046.8564224 },
      { code: 'yd2', label: 'Yardas cuadradas',      aliases: ['yd2','yardas cuadradas','yarda cuadrada','yd²'], factor: 0.83612736 },
    ]
  },
  {
    id: 'volumen', name: 'Volumen', icon: '📦', base: 'L',
    units: [
      { code: 'L',      label: 'Litros',            aliases: ['l','litro','litros'], factor: 1 },
      { code: 'mL',     label: 'Mililitros',        aliases: ['ml','mililitro','mililitros'], factor: 0.001 },
      { code: 'm3',     label: 'Metros cúbicos',    aliases: ['m3','metros cubicos','metros cúbicos','m³'], factor: 1000 },
      { code: 'ft3',    label: 'Pies cúbicos',      aliases: ['ft3','pies cubicos','pies cúbicos','ft³'], factor: 28.316846592 },
      { code: 'galus',  label: 'Galones (US)',      aliases: ['galus','galon us','galones us','gallon','gallons'], factor: 3.785411784 },
      { code: 'galuk',  label: 'Galones (UK)',      aliases: ['galuk','galon uk','galones uk','imperial gallon'], factor: 4.54609 },
      { code: 'floz',   label: 'Onzas líquidas',    aliases: ['floz','onza liquida','onzas liquidas','onzas líquidas','fluid ounce'], factor: 0.0295735296 },
      { code: 'cup',    label: 'Tazas',             aliases: ['cup','taza','tazas'], factor: 0.2365882365 },
      { code: 'tbsp',   label: 'Cucharadas',        aliases: ['tbsp','cucharada','cucharadas'], factor: 0.0147867648 },
      { code: 'tsp',    label: 'Cucharaditas',      aliases: ['tsp','cucharadita','cucharaditas'], factor: 0.00492892159 },
      { code: 'pt',     label: 'Pintas',            aliases: ['pt','pinta','pintas','pint'], factor: 0.473176473 },
      { code: 'qt',     label: 'Cuartos',           aliases: ['qt','cuarto','cuartos','quart'], factor: 0.946352946 },
      { code: 'bbl',    label: 'Barriles',          aliases: ['bbl','barril','barriles','barrel'], factor: 158.987294928 },
    ]
  },
  {
    id: 'tiempo', name: 'Tiempo', icon: '⏱️', base: 's',
    units: [
      { code: 'ms',    label: 'Milisegundos', aliases: ['ms','milisegundo','milisegundos'], factor: 0.001 },
      { code: 's',     label: 'Segundos',     aliases: ['s','seg','segundo','segundos'], factor: 1 },
      { code: 'min',   label: 'Minutos',      aliases: ['min','minuto','minutos'], factor: 60 },
      { code: 'h',     label: 'Horas',        aliases: ['h','hora','horas'], factor: 3600 },
      { code: 'day',   label: 'Días',         aliases: ['day','dia','dias','día','días'], factor: 86400 },
      { code: 'week',  label: 'Semanas',      aliases: ['week','semana','semanas'], factor: 604800 },
      { code: 'month', label: 'Meses',        aliases: ['month','mes','meses'], factor: 2629800 },
      { code: 'year',  label: 'Años',         aliases: ['year','ano','anos','año','años'], factor: 31557600 },
      { code: 'decade',label: 'Décadas',      aliases: ['decade','decades','decada','decadas','década','décadas'], factor: 315576000 },
      { code: 'century',label: 'Siglos',      aliases: ['century','centuries','siglo','siglos'], factor: 3155760000 },
    ]
  },
  {
    id: 'velocidad', name: 'Velocidad', icon: '🚗', base: 'ms',
    units: [
      { code: 'ms',   label: 'Metros/segundo (m/s)', aliases: ['m/s','ms','metros por segundo'], factor: 1 },
      { code: 'kmh',  label: 'Kilómetros/hora (km/h)', aliases: ['km/h','kmh','kilometros por hora','kilómetros por hora'], factor: 0.277778 },
      { code: 'mph',  label: 'Millas/hora (mph)', aliases: ['mph','millas por hora','mi/h'], factor: 0.44704 },
      { code: 'knot', label: 'Nudos', aliases: ['knot','knots','nudo','nudos','kt'], factor: 0.514444 },
      { code: 'fts',  label: 'Pies/segundo (ft/s)', aliases: ['ft/s','fts','pies por segundo'], factor: 0.3048 },
      { code: 'mach', label: 'Mach', aliases: ['mach'], factor: 343 },
    ]
  },
  {
    id: 'presion', name: 'Presión', icon: '💧', base: 'kpa',
    units: [
      { code: 'kpa', label: 'Kilopascales (kPa)', aliases: ['kpa','kilopascal','kilopascales'], factor: 1 },
      { code: 'psi', label: 'PSI', aliases: ['psi'], factor: 6.894757 },
      { code: 'bar', label: 'Bar', aliases: ['bar'], factor: 100 },
      { code: 'atm', label: 'Atmósferas (atm)', aliases: ['atm','atmosfera','atmosferas','atmósfera','atmósferas'], factor: 101.325 },
      { code: 'mmhg',label: 'mmHg', aliases: ['mmhg'], factor: 0.133322 },
    ]
  },
  {
    id: 'energia', name: 'Energía', icon: '⚡', base: 'j',
    units: [
      { code: 'j',   label: 'Joules', aliases: ['j','joule','joules'], factor: 1 },
      { code: 'cal', label: 'Calorías', aliases: ['cal','caloria','calorias','caloría','calorías'], factor: 4.184 },
      { code: 'kwh', label: 'kWh', aliases: ['kwh'], factor: 3600000 },
      { code: 'btu', label: 'BTU', aliases: ['btu'], factor: 1055.05585262 },
      { code: 'wh',  label: 'Watt-hora', aliases: ['wh','watt hora','watt-hora','watts hora'], factor: 3600 },
    ]
  },
  {
    id: 'potencia', name: 'Potencia', icon: '🔋', base: 'w',
    units: [
      { code: 'w',    label: 'Watts',      aliases: ['w','watt','watts'], factor: 1 },
      { code: 'kw',   label: 'Kilowatts',  aliases: ['kw','kilowatt','kilowatts'], factor: 1000 },
      { code: 'hp',   label: 'HP',         aliases: ['hp','caballo de fuerza','caballos de fuerza'], factor: 745.699872 },
      { code: 'btuh', label: 'BTU/h',      aliases: ['btu/h','btuh'], factor: 0.29307107 },
    ]
  },
  {
    id: 'electricidad', name: 'Electricidad', icon: '🔌', base: 'v',
    units: [
      { code: 'v',  label: 'Voltios',      aliases: ['v','voltio','voltios','volt','volts'], factor: 1 },
      { code: 'mv', label: 'Milivoltios',  aliases: ['mv','milivoltio','milivoltios'], factor: 0.001 },
      { code: 'a',  label: 'Amperios',     aliases: ['a','amperio','amperios','amp','amps'], factor: 1 },
      { code: 'ma', label: 'Miliamperios', aliases: ['ma','miliamperio','miliamperios'], factor: 0.001 },
      { code: 'ohm',label: 'Ohmios',       aliases: ['ohm','ohmio','ohmios'], factor: 1 },
      { code: 'kohm',label: 'Kiloohmios',  aliases: ['kohm','kiloohmio','kiloohmios'], factor: 1000 },
    ],
    note: 'Voltios/Amperios/Ohmios son magnitudes distintas: cada bloque convierte dentro de su propia magnitud (mismo múltiplo). Para W = V × A usa la calculadora de Watts-Voltios abajo.'
  },
  {
    id: 'datos', name: 'Datos digitales', icon: '💻', base: 'byte',
    units: [
      { code: 'bit',  label: 'Bits',  aliases: ['bit','bits'], factor: 0.125 },
      { code: 'byte', label: 'Bytes', aliases: ['byte','bytes'], factor: 1 },
      { code: 'kb',   label: 'KB',    aliases: ['kb'], factor: 1024 },
      { code: 'mb',   label: 'MB',    aliases: ['mb'], factor: Math.pow(1024,2) },
      { code: 'gb',   label: 'GB',    aliases: ['gb'], factor: Math.pow(1024,3) },
      { code: 'tb',   label: 'TB',    aliases: ['tb'], factor: Math.pow(1024,4) },
      { code: 'pb',   label: 'PB',    aliases: ['pb'], factor: Math.pow(1024,5) },
    ]
  },
  {
    id: 'angulos', name: 'Ángulos', icon: '📐', base: 'deg',
    units: [
      { code: 'deg',  label: 'Grados',    aliases: ['deg','grado','grados','°'], factor: 1 },
      { code: 'rad',  label: 'Radianes',  aliases: ['rad','radian','radianes'], factor: 57.29577951308232 },
      { code: 'grad', label: 'Gradianes', aliases: ['grad','gradian','gradianes'], factor: 0.9 },
    ]
  },
  {
    id: 'frecuencia', name: 'Frecuencia', icon: '📈', base: 'hz',
    units: [
      { code: 'hz',  label: 'Hz',  aliases: ['hz'], factor: 1 },
      { code: 'khz', label: 'kHz', aliases: ['khz'], factor: 1000 },
      { code: 'mhz', label: 'MHz', aliases: ['mhz'], factor: 1e6 },
      { code: 'ghz', label: 'GHz', aliases: ['ghz'], factor: 1e9 },
    ]
  },
  {
    id: 'densidad', name: 'Densidad', icon: '🌊', base: 'kgm3',
    units: [
      { code: 'kgm3', label: 'kg/m³',   aliases: ['kg/m3','kgm3'], factor: 1 },
      { code: 'gcm3', label: 'g/cm³',   aliases: ['g/cm3','gcm3'], factor: 1000 },
      { code: 'lbft3',label: 'lb/ft³',  aliases: ['lb/ft3','lbft3'], factor: 16.01846337 },
    ]
  },
];

// Categorías con lógica especial (no lineales / requieren fórmula)
const TEMP_UNITS = [
  { code: 'c', label: 'Celsius', aliases: ['c','celsius','centigrado','centigrados','centígrado','centígrados','°c'] },
  { code: 'f', label: 'Fahrenheit', aliases: ['f','fahrenheit','°f'] },
  { code: 'k', label: 'Kelvin', aliases: ['k','kelvin','°k'] },
];

function tempToCelsius(v, unit) {
  if (unit === 'c') return v;
  if (unit === 'f') return (v - 32) * 5/9;
  if (unit === 'k') return v - 273.15;
}
function celsiusTo(v, unit) {
  if (unit === 'c') return v;
  if (unit === 'f') return v * 9/5 + 32;
  if (unit === 'k') return v + 273.15;
}

const FUEL_UNITS = [
  { code: 'mpg', label: 'MPG (millas/galón US)', aliases: ['mpg'] },
  { code: 'l100km', label: 'L/100 km', aliases: ['l/100km','l100km'] },
  { code: 'kml', label: 'km/L', aliases: ['km/l','kml'] },
];
// Todas se convierten a través de "litros por 100km" como base intermedia.
function fuelToL100(v, unit) {
  if (unit === 'l100km') return v;
  if (unit === 'mpg') return 235.214583 / v;
  if (unit === 'kml') return 100 / v;
}
function fuelFromL100(l100, unit) {
  if (unit === 'l100km') return l100;
  if (unit === 'mpg') return 235.214583 / l100;
  if (unit === 'kml') return 100 / l100;
}

/* ===================== ENRUTAMIENTO: URLs AMIGABLES (dinámicas) ===================== */
// Palabra usada en la URL para cada unidad, por categoría/pestaña.
const SLUG_WORDS = {
  longitud: { m:'metros', ft:'pies', cm:'centimetros', mm:'milimetros', km:'kilometros', yd:'yardas', in:'pulgadas', mi:'millas', nm:'nanometros', um:'micrometros', nmi:'millas-nauticas', league:'leguas', fathom:'brazas' },
  peso: { kg:'kilogramos', g:'gramos', lb:'libras', oz:'onzas', t:'toneladas', ct:'quilates', st:'stone', gr:'granos' },
  temperatura: { c:'celsius', f:'fahrenheit', k:'kelvin' },
  area: { m2:'metros-cuadrados', ft2:'pies-cuadrados', cm2:'centimetros-cuadrados', in2:'pulgadas-cuadradas', km2:'kilometros-cuadrados', mi2:'millas-cuadradas', ha:'hectareas', acre:'acres', yd2:'yardas-cuadradas' },
  volumen: { L:'litros', mL:'mililitros', m3:'metros-cubicos', ft3:'pies-cubicos', galus:'galones-us', galuk:'galones-uk', floz:'onzas-liquidas', cup:'tazas', tbsp:'cucharadas', tsp:'cucharaditas', pt:'pintas', qt:'cuartos', bbl:'barriles' },
  tiempo: { ms:'milisegundos', s:'segundos', min:'minutos', h:'horas', day:'dias', week:'semanas', month:'meses', year:'anos', decade:'decadas', century:'siglos' },
  velocidad: { ms:'metros-por-segundo', kmh:'kilometros-por-hora', mph:'millas-por-hora', knot:'nudos', fts:'pies-por-segundo', mach:'mach' },
  combustible: { mpg:'mpg', l100km:'litros-100km', kml:'kilometros-litro' },
  presion: { kpa:'kilopascales', psi:'psi', bar:'bar', atm:'atmosferas', mmhg:'mmhg' },
  energia: { j:'joules', cal:'calorias', kwh:'kwh', btu:'btu', wh:'watt-hora' },
  potencia: { w:'watts', kw:'kilowatts', hp:'hp', btuh:'btu-h' },
  electricidad: { v:'voltios', mv:'milivoltios', a:'amperios', ma:'miliamperios', ohm:'ohmios', kohm:'kiloohmios' },
  datos: { bit:'bits', byte:'bytes', kb:'kb', mb:'mb', gb:'gb', tb:'tb', pb:'pb' },
  angulos: { deg:'grados', rad:'radianes', grad:'gradianes' },
  frecuencia: { hz:'hz', khz:'khz', mhz:'mhz', ghz:'ghz' },
  densidad: { kgm3:'kg-m3', gcm3:'g-cm3', lbft3:'lb-ft3' },
  monedas: { USD:'usd', EUR:'eur', GBP:'gbp', CAD:'cad', MXN:'mxn', JPY:'jpy', DOP:'dop', COP:'cop', ARS:'ars', CLP:'clp', PEN:'pen', BRL:'brl', CHF:'chf', CNY:'cny', INR:'inr', AUD:'aud', SEK:'sek', NOK:'nok' },
};

function slugFor(tabId, fromCode, toCode) {
  const words = SLUG_WORDS[tabId];
  if (!words) return null;
  const wf = words[fromCode], wt = words[toCode];
  if (!wf || !wt) return null;
  return `${wf}-a-${wt}`;
}

// Actualiza la URL del navegador (sin recargar) para reflejar la conversión activa.
function updateUrlSlug(tabId, fromCode, toCode) {
  // Si el usuario elige la misma unidad en ambos lados (ej. Kilómetros -> Kilómetros),
  // esa página nunca existe (no tendría sentido generarla), así que NO tocamos la URL.
  // Así, la barra de direcciones se queda en la última conversión real y válida que
  // estaba activa, y si la persona recarga la página, vuelve a esa misma conversión
  // en vez de toparse con un 404 al no existir "kilometros-a-kilometros".
  if (fromCode === toCode) return;
  const slug = slugFor(tabId, fromCode, toCode);
  const newPath = slug ? `/${slug}` : '/';
  const currentPath = location.pathname.replace(/\/+$/, '') || '/';
  if (currentPath === newPath) return;
  try {
    history.replaceState(null, '', newPath + location.search);
  } catch (e) {
    // Algunos entornos (iframes en sandbox, vistas previas con documento "about:srcdoc", etc.)
    // no permiten cambiar la URL con la History API. En un hosting real esto no ocurre.
  }
}

// Lee la URL actual y, si coincide con una conversión conocida, devuelve {tab, from, to}.
function presetFromPath(pathname) {
  const slug = pathname.replace(/^\/+|\/+$/g, '');
  if (!slug) return null;
  const cutPoints = [];
  let idx = slug.indexOf('-a-');
  while (idx !== -1) { cutPoints.push(idx); idx = slug.indexOf('-a-', idx + 1); }
  for (const i of cutPoints) {
    const left = slug.slice(0, i);
    const right = slug.slice(i + 3);
    for (const tabId in SLUG_WORDS) {
      const words = SLUG_WORDS[tabId];
      const codeFrom = Object.keys(words).find(k => words[k] === left);
      const codeTo = Object.keys(words).find(k => words[k] === right);
      if (codeFrom && codeTo) return { tab: tabId, from: codeFrom, to: codeTo };
    }
  }
  return null;
}
/* ===================== UTILIDADES ===================== */
function normalize(s) {
  return s.toString().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
}
function fmt(n) {
  if (!isFinite(n)) return '—';
  if (Math.abs(n) >= 1e9 || (Math.abs(n) < 1e-6 && n !== 0)) return n.toExponential(4);
  // hasta 6 decimales, sin ceros sobrantes
  let r = Math.round(n * 1e6) / 1e6;
  return r.toLocaleString('es-DO', { maximumFractionDigits: 6 });
}
function el(tag, cls, html) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html !== undefined) e.innerHTML = html;
  return e;
}

/* ===================== ÍNDICE DE ALIAS PARA EL PARSER INTELIGENTE ===================== */
const ALIAS_INDEX = new Map(); // normalizedAlias -> {kind, catId, code}

CATEGORIES.forEach(cat => {
  cat.units.forEach(u => {
    u.aliases.forEach(a => ALIAS_INDEX.set(normalize(a), { kind: 'linear', catId: cat.id, code: u.code }));
    ALIAS_INDEX.set(normalize(u.label), { kind: 'linear', catId: cat.id, code: u.code });
  });
});
TEMP_UNITS.forEach(u => {
  u.aliases.forEach(a => ALIAS_INDEX.set(normalize(a), { kind: 'temp', code: u.code }));
});
FUEL_UNITS.forEach(u => {
  u.aliases.forEach(a => ALIAS_INDEX.set(normalize(a), { kind: 'fuel', code: u.code }));
});

function findUnit(str) {
  const n = normalize(str);
  if (ALIAS_INDEX.has(n)) return ALIAS_INDEX.get(n);
  // intento quitando una 's' final (plural simple no contemplado)
  if (n.endsWith('s') && ALIAS_INDEX.has(n.slice(0, -1))) return ALIAS_INDEX.get(n.slice(0, -1));
  return null;
}

/* ===================== CONVERSIÓN ===================== */
function convertLinear(catId, fromCode, toCode, value) {
  const cat = CATEGORIES.find(c => c.id === catId);
  const uFrom = cat.units.find(u => u.code === fromCode);
  const uTo = cat.units.find(u => u.code === toCode);
  if (!uFrom || !uTo) return null;
  return (value * uFrom.factor) / uTo.factor;
}
function convertTemp(fromCode, toCode, value) {
  return celsiusTo(tempToCelsius(value, fromCode), toCode);
}
function convertFuel(fromCode, toCode, value) {
  return fuelFromL100(fuelToL100(value, fromCode), toCode);
}

/* ===================== PARSER DEL TEXTO LIBRE ===================== */
function parseSmart(input) {
  input = input.trim();
  if (!input) return { state: 'empty' };
  const numMatch = input.match(/^(-?\d+(?:[.,]\d+)?)/);
  if (!numMatch) return { state: 'no-number' };
  const value = parseFloat(numMatch[1].replace(',', '.'));
  let rest = input.slice(numMatch[0].length).trim();
  if (!rest) return { state: 'no-unit' };

  const parts = rest.split(/\s+(?:a|en|to|hacia|->|=)\s+/i);
  const fromUnit = findUnit(parts[0]);
  if (!fromUnit) return { state: 'unknown-unit', raw: parts[0] };

  if (parts.length < 2 || !parts[1]) {
    return { state: 'need-target', value, fromUnit };
  }
  const toUnit = findUnit(parts[parts.length - 1]);
  if (!toUnit) return { state: 'unknown-unit', raw: parts[parts.length - 1] };
  if (fromUnit.kind !== toUnit.kind || (fromUnit.kind === 'linear' && fromUnit.catId !== toUnit.catId)) {
    return { state: 'mismatch' };
  }

  let result;
  if (fromUnit.kind === 'linear') result = convertLinear(fromUnit.catId, fromUnit.code, toUnit.code, value);
  else if (fromUnit.kind === 'temp') result = convertTemp(fromUnit.code, toUnit.code, value);
  else if (fromUnit.kind === 'fuel') result = convertFuel(fromUnit.code, toUnit.code, value);

  return { state: 'ok', value, fromUnit, toUnit, result };
}

function unitLabel(u) {
  if (u.kind === 'temp') return TEMP_UNITS.find(x => x.code === u.code).label;
  if (u.kind === 'fuel') return FUEL_UNITS.find(x => x.code === u.code).label;
  const cat = CATEGORIES.find(c => c.id === u.catId);
  return cat.units.find(x => x.code === u.code).label;
}

function renderSmartResult(parsed) {
  const box = document.getElementById('smartResult');
  const tape = document.getElementById('smartTape');
  if (parsed.state === 'empty') {
    box.innerHTML = '<span class="hint">Escribe algo como <em>"1 metro en pies"</em>, <em>"36 c a f"</em> o <em>"5 kg en libras"</em></span>';
    tape.innerHTML = '';
    return;
  }
  if (parsed.state === 'ok') {
    box.innerHTML = `<span class="result-value">${fmt(parsed.result)}</span> <span class="result-unit">${unitLabel(parsed.toUnit)}</span>`;
    tape.innerHTML = `<span class="tape-eq">${fmt(parsed.value)} ${unitLabel(parsed.fromUnit)} = ${fmt(parsed.result)} ${unitLabel(parsed.toUnit)}</span>`;
    return;
  }
  if (parsed.state === 'need-target') {
    // Sin unidad destino: mostramos varias equivalencias automáticas
    const u = parsed.fromUnit;
    let others = [];
    if (u.kind === 'linear') {
      const cat = CATEGORIES.find(c => c.id === u.catId);
      others = cat.units.filter(x => x.code !== u.code).slice(0, 5).map(x => {
        const r = convertLinear(u.catId, u.code, x.code, parsed.value);
        return `${fmt(r)} ${x.label}`;
      });
    } else if (u.kind === 'temp') {
      others = TEMP_UNITS.filter(x => x.code !== u.code).map(x => {
        const r = convertTemp(u.code, x.code, parsed.value);
        return `${fmt(r)} ${x.label}`;
      });
    } else if (u.kind === 'fuel') {
      others = FUEL_UNITS.filter(x => x.code !== u.code).map(x => {
        const r = convertFuel(u.code, x.code, parsed.value);
        return `${fmt(r)} ${x.label}`;
      });
    }
    box.innerHTML = `<span class="hint">Equivalencias de ${fmt(parsed.value)} ${unitLabel(u)}:</span>`;
    tape.innerHTML = others.map(o => `<span class="tape-chip">${o}</span>`).join('');
    return;
  }
  if (parsed.state === 'unknown-unit') {
    box.innerHTML = `<span class="hint hint-warn">No reconozco la unidad "${parsed.raw}"</span>`;
    tape.innerHTML = '';
    return;
  }
  if (parsed.state === 'mismatch') {
    box.innerHTML = `<span class="hint hint-warn">Esas unidades no son de la misma magnitud</span>`;
    tape.innerHTML = '';
    return;
  }
  box.innerHTML = '<span class="hint">Sigue escribiendo…</span>';
  tape.innerHTML = '';
}

/* ===================== RENDER DE PANELES POR CATEGORÍA (genérico lineal) ===================== */
function renderLinearPanel(cat, preset) {
  const wrap = el('div', 'panel-linear');
  if (cat.note) wrap.appendChild(el('p', 'panel-note', cat.note));

  const row = el('div', 'convert-row');
  const colA = el('div', 'convert-col');
  const inputA = el('input', 'num-input'); inputA.type = 'text'; inputA.inputMode = 'decimal'; inputA.value = '1';
  const selA = el('select', 'unit-select');
  cat.units.forEach(u => selA.appendChild(el('option', null, u.label)).value = u.code);
  colA.appendChild(inputA); colA.appendChild(selA);

  const swapBtn = el('button', 'swap-btn', '⇄');
  swapBtn.type = 'button';

  const colB = el('div', 'convert-col');
  const inputB = el('input', 'num-input'); inputB.type = 'text'; inputB.inputMode = 'decimal';
  const selB = el('select', 'unit-select');
  cat.units.forEach((u, i) => selB.appendChild(el('option', null, u.label)).value = u.code);
  if (cat.units.length > 1) selB.value = cat.units[1].code;
  colB.appendChild(inputB); colB.appendChild(selB);

  if (preset && preset.from) selA.value = preset.from;
  if (preset && preset.to) selB.value = preset.to;

  row.appendChild(colA); row.appendChild(swapBtn); row.appendChild(colB);
  wrap.appendChild(row);

  // tabla de equivalencias rápidas
  const table = el('div', 'quick-table');
  wrap.appendChild(table);

  function recalcFromA() {
    const v = parseFloat(inputA.value.replace(',', '.'));
    updateUrlSlug(cat.id, selA.value, selB.value);
    if (isNaN(v)) { inputB.value = ''; renderQuickTable(NaN); return; }
    const r = convertLinear(cat.id, selA.value, selB.value, v);
    inputB.value = fmt(r);
    renderQuickTable(v);
  }
  function recalcFromB() {
    const v = parseFloat(inputB.value.replace(',', '.'));
    updateUrlSlug(cat.id, selA.value, selB.value);
    if (isNaN(v)) { inputA.value = ''; return; }
    const r = convertLinear(cat.id, selB.value, selA.value, v);
    inputA.value = fmt(r);
    renderQuickTable(parseFloat(inputA.value.replace(',', '.')));
  }
  function renderQuickTable(v) {
    if (isNaN(v)) { table.innerHTML = ''; return; }
    table.innerHTML = cat.units.map(u => {
      const r = convertLinear(cat.id, selA.value, u.code, v);
      return `<div class="quick-item"><span class="quick-label">${u.label}</span><span class="quick-value">${fmt(r)}</span></div>`;
    }).join('');
  }

  inputA.addEventListener('input', recalcFromA);
  selA.addEventListener('change', recalcFromA);
  inputB.addEventListener('input', recalcFromB);
  selB.addEventListener('change', recalcFromB);
  swapBtn.addEventListener('click', () => {
    const tmpUnit = selA.value; selA.value = selB.value; selB.value = tmpUnit;
    recalcFromA();
  });

  recalcFromA();
  return wrap;
}

/* ===================== TEMPERATURA ===================== */
function renderTempPanel(preset) {
  const wrap = el('div', 'panel-linear');
  const row = el('div', 'convert-row');
  const colA = el('div', 'convert-col');
  const inputA = el('input', 'num-input'); inputA.type = 'text'; inputA.value = '0';
  const selA = el('select', 'unit-select');
  TEMP_UNITS.forEach(u => selA.appendChild(el('option', null, u.label)).value = u.code);
  colA.appendChild(inputA); colA.appendChild(selA);

  const swapBtn = el('button', 'swap-btn', '⇄'); swapBtn.type = 'button';

  const colB = el('div', 'convert-col');
  const inputB = el('input', 'num-input'); inputB.type = 'text';
  const selB = el('select', 'unit-select');
  TEMP_UNITS.forEach(u => selB.appendChild(el('option', null, u.label)).value = u.code);
  selB.value = 'f';
  colB.appendChild(inputB); colB.appendChild(selB);

  if (preset && preset.from) selA.value = preset.from;
  if (preset && preset.to) selB.value = preset.to;

  row.appendChild(colA); row.appendChild(swapBtn); row.appendChild(colB);
  wrap.appendChild(row);

  const table = el('div', 'quick-table');
  wrap.appendChild(table);

  function recalcFromA() {
    const v = parseFloat(inputA.value.replace(',', '.'));
    updateUrlSlug('temperatura', selA.value, selB.value);
    if (isNaN(v)) return;
    inputB.value = fmt(convertTemp(selA.value, selB.value, v));
    table.innerHTML = TEMP_UNITS.map(u => `<div class="quick-item"><span class="quick-label">${u.label}</span><span class="quick-value">${fmt(convertTemp(selA.value, u.code, v))}</span></div>`).join('');
  }
  function recalcFromB() {
    const v = parseFloat(inputB.value.replace(',', '.'));
    if (isNaN(v)) return;
    inputA.value = fmt(convertTemp(selB.value, selA.value, v));
    recalcFromA();
  }
  inputA.addEventListener('input', recalcFromA);
  selA.addEventListener('change', recalcFromA);
  inputB.addEventListener('input', recalcFromB);
  selB.addEventListener('change', recalcFromB);
  swapBtn.addEventListener('click', () => { const t = selA.value; selA.value = selB.value; selB.value = t; recalcFromA(); });
  recalcFromA();
  return wrap;
}

/* ===================== COMBUSTIBLE ===================== */
function renderFuelPanel(preset) {
  const wrap = el('div', 'panel-linear');
  const row = el('div', 'convert-row');
  const colA = el('div', 'convert-col');
  const inputA = el('input', 'num-input'); inputA.type = 'text'; inputA.value = '30';
  const selA = el('select', 'unit-select');
  FUEL_UNITS.forEach(u => selA.appendChild(el('option', null, u.label)).value = u.code);
  colA.appendChild(inputA); colA.appendChild(selA);
  const swapBtn = el('button', 'swap-btn', '⇄'); swapBtn.type = 'button';
  const colB = el('div', 'convert-col');
  const inputB = el('input', 'num-input'); inputB.type = 'text';
  const selB = el('select', 'unit-select');
  FUEL_UNITS.forEach(u => selB.appendChild(el('option', null, u.label)).value = u.code);
  selB.value = 'l100km';
  colB.appendChild(inputB); colB.appendChild(selB);
  if (preset && preset.from) selA.value = preset.from;
  if (preset && preset.to) selB.value = preset.to;
  row.appendChild(colA); row.appendChild(swapBtn); row.appendChild(colB);
  wrap.appendChild(row);
  wrap.appendChild(el('p', 'panel-note', 'MPG usa el galón estadounidense (US). Nota: a menor L/100km, mayor eficiencia; a mayor MPG o km/L, mayor eficiencia.'));

  function recalcFromA() {
    const v = parseFloat(inputA.value.replace(',', '.'));
    updateUrlSlug('combustible', selA.value, selB.value);
    if (isNaN(v) || v === 0) return;
    inputB.value = fmt(convertFuel(selA.value, selB.value, v));
  }
  function recalcFromB() {
    const v = parseFloat(inputB.value.replace(',', '.'));
    if (isNaN(v) || v === 0) return;
    inputA.value = fmt(convertFuel(selB.value, selA.value, v));
  }
  inputA.addEventListener('input', recalcFromA);
  selA.addEventListener('change', recalcFromA);
  inputB.addEventListener('input', recalcFromB);
  selB.addEventListener('change', recalcFromB);
  swapBtn.addEventListener('click', () => { const t = selA.value; selA.value = selB.value; selB.value = t; recalcFromA(); });
  recalcFromA();
  return wrap;
}
/* ===================== EXTRA: ELECTRICIDAD (P = V × I) ===================== */
function renderElectricidadExtra(container) {
  const box = el('div', 'calc-card');
  box.appendChild(el('h4', null, 'Watts = Voltios × Amperios'));
  const row = el('div', 'calc-row-3');
  const vIn = el('input', 'num-input'); vIn.type = 'text'; vIn.placeholder = 'Voltios'; vIn.value = '120';
  const aIn = el('input', 'num-input'); aIn.type = 'text'; aIn.placeholder = 'Amperios'; aIn.value = '2';
  const wOut = el('input', 'num-input'); wOut.type = 'text'; wOut.disabled = true;
  row.appendChild(labeled('Voltios (V)', vIn));
  row.appendChild(labeled('Amperios (A)', aIn));
  row.appendChild(labeled('Watts (W)', wOut));
  box.appendChild(row);
  box.appendChild(el('p', 'panel-note', 'VA ≈ Watts cuando el factor de potencia es 1 (cargas resistivas).'));
  function calc() {
    const v = parseFloat(vIn.value.replace(',', '.')), a = parseFloat(aIn.value.replace(',', '.'));
    wOut.value = (isNaN(v) || isNaN(a)) ? '' : fmt(v * a);
  }
  vIn.addEventListener('input', calc); aIn.addEventListener('input', calc); calc();
  container.appendChild(box);
}
function labeled(labelText, inputEl) {
  const wrap = el('div', 'labeled-input');
  wrap.appendChild(el('label', null, labelText));
  wrap.appendChild(inputEl);
  return wrap;
}

/* ===================== EXTRA: DATOS — velocidad de transferencia ===================== */
function renderDatosExtra(container) {
  const box = el('div', 'calc-card');
  box.appendChild(el('h4', null, 'Velocidad de transferencia (bits/s ↔ bytes/s)'));
  const row = el('div', 'convert-row');
  const speedUnits = [
    { code: 'bps', label: 'bps', factor: 1 },
    { code: 'kbps', label: 'Kbps', factor: 1000 },
    { code: 'mbps', label: 'Mbps', factor: 1e6 },
    { code: 'gbps', label: 'Gbps', factor: 1e9 },
    { code: 'Bps', label: 'B/s', factor: 8 },
    { code: 'KBps', label: 'KB/s', factor: 8000 },
    { code: 'MBps', label: 'MB/s', factor: 8e6 },
    { code: 'GBps', label: 'GB/s', factor: 8e9 },
  ];
  const colA = el('div', 'convert-col');
  const inA = el('input', 'num-input'); inA.type = 'text'; inA.value = '100';
  const selA = el('select', 'unit-select'); speedUnits.forEach(u => selA.appendChild(el('option', null, u.label)).value = u.code);
  selA.value = 'mbps';
  colA.appendChild(inA); colA.appendChild(selA);
  const colB = el('div', 'convert-col');
  const inB = el('input', 'num-input'); inB.type = 'text';
  const selB = el('select', 'unit-select'); speedUnits.forEach(u => selB.appendChild(el('option', null, u.label)).value = u.code);
  selB.value = 'MBps';
  colB.appendChild(inB); colB.appendChild(selB);
  row.appendChild(colA); row.appendChild(el('span', 'swap-static', '=')); row.appendChild(colB);
  box.appendChild(row);
  function calc() {
    const v = parseFloat(inA.value.replace(',', '.'));
    if (isNaN(v)) return;
    const fa = speedUnits.find(u => u.code === selA.value).factor;
    const fb = speedUnits.find(u => u.code === selB.value).factor;
    inB.value = fmt((v * fa) / fb);
  }
  inA.addEventListener('input', calc); selA.addEventListener('change', calc); selB.addEventListener('change', calc);
  calc();
  container.appendChild(box);
}

/* ===================== MONEDAS ===================== */
const STATIC_RATES = {
  USD: 1, EUR: 0.92, GBP: 0.78, CAD: 1.37, MXN: 18.5, JPY: 156, DOP: 60,
  COP: 4100, ARS: 1300, CLP: 950, PEN: 3.75, BRL: 5.4, CHF: 0.88, CNY: 7.25,
  INR: 84, AUD: 1.52, SEK: 10.4, NOK: 10.6,
};
const CURRENCY_LIST = Object.keys(STATIC_RATES);
let liveRates = null, ratesTimestamp = null;
async function fetchRates() {
  try {
    const res = await fetch('https://open.er-api.com/v6/latest/USD');
    const data = await res.json();
    if (data && data.rates) { liveRates = data.rates; ratesTimestamp = data.time_last_update_utc || new Date().toString(); }
  } catch (e) { liveRates = null; }
}
function renderMonedasPanel(container, preset) {
  const wrap = el('div', 'panel-linear');
  const status = el('p', 'panel-note', 'Cargando tasas de cambio en vivo…');
  wrap.appendChild(status);
  const currencies = CURRENCY_LIST;
  const row = el('div', 'convert-row');
  const colA = el('div', 'convert-col');
  const inA = el('input', 'num-input'); inA.type = 'text'; inA.value = '100';
  const selA = el('select', 'unit-select'); currencies.forEach(c => selA.appendChild(el('option', null, c)).value = c);
  colA.appendChild(inA); colA.appendChild(selA);
  const swapBtn = el('button', 'swap-btn', '⇄'); swapBtn.type = 'button';
  const colB = el('div', 'convert-col');
  const inB = el('input', 'num-input'); inB.type = 'text';
  const selB = el('select', 'unit-select'); currencies.forEach(c => selB.appendChild(el('option', null, c)).value = c);
  selB.value = 'DOP';
  colB.appendChild(inB); colB.appendChild(selB);
  if (preset && preset.from) selA.value = preset.from;
  if (preset && preset.to) selB.value = preset.to;
  row.appendChild(colA); row.appendChild(swapBtn); row.appendChild(colB);
  wrap.appendChild(row);

  function rates() { return liveRates || STATIC_RATES; }
  function recalcFromA() {
    const v = parseFloat(inA.value.replace(',', '.'));
    updateUrlSlug('monedas', selA.value, selB.value);
    if (isNaN(v)) return;
    const r = rates();
    const usd = v / r[selA.value];
    inB.value = fmt(usd * r[selB.value]);
  }
  function recalcFromB() {
    const v = parseFloat(inB.value.replace(',', '.'));
    updateUrlSlug('monedas', selA.value, selB.value);
    if (isNaN(v)) return;
    const r = rates();
    const usd = v / r[selB.value];
    inA.value = fmt(usd * r[selA.value]);
  }
  inA.addEventListener('input', recalcFromA); selA.addEventListener('change', recalcFromA);
  inB.addEventListener('input', recalcFromB); selB.addEventListener('change', recalcFromB);
  swapBtn.addEventListener('click', () => { const t = selA.value; selA.value = selB.value; selB.value = t; recalcFromA(); });

  recalcFromA();
  container.appendChild(wrap);
  fetchRates().then(() => {
    status.textContent = liveRates
      ? `Tasas en vivo (base USD) · actualizado: ${ratesTimestamp}`
      : 'No se pudieron cargar tasas en vivo — usando valores aproximados de referencia.';
    recalcFromA();
  });
}

/* ===================== TALLAS ===================== */
const SHOE_MEN = [ // US, EU, UK
  [6,39,5.5],[6.5,39.5,6],[7,40,6.5],[7.5,40.5,7],[8,41,7.5],[8.5,42,8],
  [9,42.5,8.5],[9.5,43,9],[10,44,9.5],[10.5,44.5,10],[11,45,10.5],[11.5,45.5,11],[12,46,11.5]
];
const SHOE_WOMEN = [ // US, EU, UK
  [5,35,2.5],[5.5,35.5,3],[6,36,3.5],[6.5,37,4],[7,37.5,4.5],[7.5,38,5],
  [8,38.5,5.5],[8.5,39,6],[9,40,6.5],[9.5,40.5,7],[10,41,7.5],[10.5,42,8],[11,42.5,8.5]
];
function renderTallasPanel(container) {
  const wrap = el('div', 'panel-linear');
  wrap.appendChild(el('h4', null, 'Zapatos'));
  const genderRow = el('div', 'calc-row-3');
  const genderSel = el('select', 'unit-select');
  ['Hombre','Mujer'].forEach(g => genderSel.appendChild(el('option', null, g)).value = g);
  const usIn = el('input', 'num-input'); usIn.type = 'text'; usIn.value = '9';
  genderRow.appendChild(labeled('Talla US', usIn));
  genderRow.appendChild(labeled('Género', genderSel));
  wrap.appendChild(genderRow);
  const shoeOut = el('div', 'quick-table');
  wrap.appendChild(shoeOut);
  function calcShoe() {
    const table = genderSel.value === 'Hombre' ? SHOE_MEN : SHOE_WOMEN;
    const us = parseFloat(usIn.value.replace(',', '.'));
    if (isNaN(us)) { shoeOut.innerHTML = ''; return; }
    // interpolación lineal simple sobre la tabla
    let closest = table.reduce((a, b) => Math.abs(b[0]-us) < Math.abs(a[0]-us) ? b : a);
    shoeOut.innerHTML = `
      <div class="quick-item"><span class="quick-label">EU</span><span class="quick-value">${closest[1]}</span></div>
      <div class="quick-item"><span class="quick-label">UK</span><span class="quick-value">${closest[2]}</span></div>`;
  }
  usIn.addEventListener('input', calcShoe); genderSel.addEventListener('change', calcShoe); calcShoe();

  wrap.appendChild(el('h4', null, 'Ropa (referencia aproximada)'));
  const clothTable = [
    ['XS','0-2','32-34','4-6'],['S','4-6','36-38','8-10'],['M','8-10','40-42','12-14'],
    ['L','12-14','44-46','16-18'],['XL','16-18','48-50','20-22'],['XXL','20-22','52-54','24-26']
  ];
  const ct = el('div', 'ref-table');
  ct.innerHTML = '<div class="ref-row ref-head"><span>Talla</span><span>US</span><span>EU</span><span>UK</span></div>' +
    clothTable.map(r => `<div class="ref-row"><span>${r[0]}</span><span>${r[1]}</span><span>${r[2]}</span><span>${r[3]}</span></div>`).join('');
  wrap.appendChild(ct);
  container.appendChild(wrap);
}

/* ===================== PANTALLAS Y PAPEL ===================== */
function renderPantallasPanel(container) {
  const wrap = el('div', 'panel-linear');
  wrap.appendChild(el('h4', null, 'Tamaño de pantalla (diagonal)'));
  const row = el('div', 'calc-row-3');
  const inIn = el('input', 'num-input'); inIn.type = 'text'; inIn.value = '15.6';
  const cmOut = el('input', 'num-input'); cmOut.disabled = true;
  row.appendChild(labeled('Pulgadas', inIn));
  row.appendChild(labeled('Centímetros', cmOut));
  wrap.appendChild(row);
  function calc1() {
    const v = parseFloat(inIn.value.replace(',', '.'));
    cmOut.value = isNaN(v) ? '' : fmt(v * 2.54);
  }
  inIn.addEventListener('input', calc1); calc1();

  wrap.appendChild(el('h4', null, 'PPI (densidad de píxeles)'));
  const row2 = el('div', 'calc-row-3');
  const wPx = el('input', 'num-input'); wPx.type = 'text'; wPx.value = '1920';
  const hPx = el('input', 'num-input'); hPx.type = 'text'; hPx.value = '1080';
  const diag = el('input', 'num-input'); diag.type = 'text'; diag.value = '15.6';
  row2.appendChild(labeled('Ancho (px)', wPx));
  row2.appendChild(labeled('Alto (px)', hPx));
  row2.appendChild(labeled('Diagonal (in)', diag));
  wrap.appendChild(row2);
  const ppiOut = el('p', 'panel-result');
  wrap.appendChild(ppiOut);
  function calcPPI() {
    const w = parseFloat(wPx.value), h = parseFloat(hPx.value), d = parseFloat(diag.value.replace(',', '.'));
    if ([w,h,d].some(isNaN) || d === 0) { ppiOut.textContent = ''; return; }
    const ppi = Math.sqrt(w*w + h*h) / d;
    ppiOut.textContent = `≈ ${fmt(ppi)} PPI`;
  }
  [wPx,hPx,diag].forEach(i => i.addEventListener('input', calcPPI));
  calcPPI();

  wrap.appendChild(el('h4', null, 'Tamaños de papel (referencia)'));
  const paper = [['A4','210 × 297 mm','8.27 × 11.69 in'],['Letter','216 × 279 mm','8.5 × 11 in'],['Legal','216 × 356 mm','8.5 × 14 in']];
  const pt = el('div', 'ref-table');
  pt.innerHTML = '<div class="ref-row ref-head"><span>Formato</span><span>mm</span><span>Pulgadas</span></div>' +
    paper.map(r => `<div class="ref-row"><span>${r[0]}</span><span>${r[1]}</span><span>${r[2]}</span></div>`).join('');
  wrap.appendChild(pt);
  container.appendChild(wrap);
}
/* ===================== OTROS ===================== */
function romanToDecimal(str) {
  const map = { I:1, V:5, X:10, L:50, C:100, D:500, M:1000 };
  str = str.toUpperCase().replace(/[^IVXLCDM]/g, '');
  let total = 0;
  for (let i = 0; i < str.length; i++) {
    const cur = map[str[i]], next = map[str[i+1]];
    if (next && cur < next) total -= cur; else total += cur;
  }
  return total || null;
}
function decimalToRoman(num) {
  if (!num || num <= 0 || num >= 4000) return '—';
  const vals = [[1000,'M'],[900,'CM'],[500,'D'],[400,'CD'],[100,'C'],[90,'XC'],[50,'L'],[40,'XL'],[10,'X'],[9,'IX'],[5,'V'],[4,'IV'],[1,'I']];
  let res = '', n = Math.floor(num);
  for (const [v, s] of vals) { while (n >= v) { res += s; n -= v; } }
  return res;
}

function renderOtrosPanel(container) {
  const wrap = el('div', 'panel-linear');

  // ppm <-> %
  wrap.appendChild(el('h4', null, 'ppm ↔ %'));
  const row1 = el('div', 'convert-row');
  const ppmIn = el('input', 'num-input'); ppmIn.type = 'text'; ppmIn.value = '10000';
  const pctOut = el('input', 'num-input'); pctOut.type = 'text';
  row1.appendChild(labeled('ppm', ppmIn));
  row1.appendChild(el('span', 'swap-static', '='));
  row1.appendChild(labeled('%', pctOut));
  wrap.appendChild(row1);
  function calcPpm() { const v = parseFloat(ppmIn.value.replace(',', '.')); pctOut.value = isNaN(v) ? '' : fmt(v / 10000); }
  function calcPct() { const v = parseFloat(pctOut.value.replace(',', '.')); ppmIn.value = isNaN(v) ? '' : fmt(v * 10000); }
  ppmIn.addEventListener('input', calcPpm); pctOut.addEventListener('input', calcPct); calcPpm();

  // Decibelios (ratio de potencia o de voltaje)
  wrap.appendChild(el('h4', null, 'Decibelios (relación de potencia)'));
  const row2 = el('div', 'calc-row-3');
  const p1 = el('input', 'num-input'); p1.type = 'text'; p1.value = '1';
  const p2 = el('input', 'num-input'); p2.type = 'text'; p2.value = '2';
  row2.appendChild(labeled('Potencia referencia', p1));
  row2.appendChild(labeled('Potencia medida', p2));
  wrap.appendChild(row2);
  const dbOut = el('p', 'panel-result');
  wrap.appendChild(dbOut);
  function calcDb() {
    const a = parseFloat(p1.value.replace(',', '.')), b = parseFloat(p2.value.replace(',', '.'));
    if (isNaN(a) || isNaN(b) || a <= 0 || b <= 0) { dbOut.textContent = ''; return; }
    dbOut.textContent = `${fmt(10 * Math.log10(b / a))} dB`;
  }
  p1.addEventListener('input', calcDb); p2.addEventListener('input', calcDb); calcDb();

  // Lumens <-> Lux
  wrap.appendChild(el('h4', null, 'Lumens ↔ Lux (necesita área)'));
  const row3 = el('div', 'calc-row-3');
  const lumIn = el('input', 'num-input'); lumIn.type = 'text'; lumIn.value = '400';
  const areaIn = el('input', 'num-input'); areaIn.type = 'text'; areaIn.value = '4';
  row3.appendChild(labeled('Lumens', lumIn));
  row3.appendChild(labeled('Área (m²)', areaIn));
  wrap.appendChild(row3);
  const luxOut = el('p', 'panel-result');
  wrap.appendChild(luxOut);
  function calcLux() {
    const l = parseFloat(lumIn.value.replace(',', '.')), a = parseFloat(areaIn.value.replace(',', '.'));
    luxOut.textContent = (isNaN(l) || isNaN(a) || a === 0) ? '' : `${fmt(l / a)} lux`;
  }
  lumIn.addEventListener('input', calcLux); areaIn.addEventListener('input', calcLux); calcLux();

  // Número romano
  wrap.appendChild(el('h4', null, 'Número romano ↔ Decimal'));
  const row4 = el('div', 'convert-row');
  const romIn = el('input', 'text-input'); romIn.type = 'text'; romIn.value = 'MCMXCIV';
  const decOut = el('input', 'num-input'); decOut.type = 'text';
  row4.appendChild(labeled('Romano', romIn));
  row4.appendChild(el('span', 'swap-static', '='));
  row4.appendChild(labeled('Decimal', decOut));
  wrap.appendChild(row4);
  function calcRoman() { decOut.value = romanToDecimal(romIn.value) ?? ''; }
  function calcDecimal() { romIn.value = decimalToRoman(parseInt(decOut.value)); }
  romIn.addEventListener('input', calcRoman); decOut.addEventListener('input', calcDecimal); calcRoman();

  // Edad de perro
  wrap.appendChild(el('h4', null, 'Edad de perro ↔ humana'));
  const row5 = el('div', 'calc-row-3');
  const dogIn = el('input', 'num-input'); dogIn.type = 'text'; dogIn.value = '3';
  row5.appendChild(labeled('Años de perro', dogIn));
  wrap.appendChild(row5);
  const dogOut = el('p', 'panel-result');
  wrap.appendChild(dogOut);
  function calcDog() {
    const y = parseFloat(dogIn.value.replace(',', '.'));
    if (isNaN(y) || y < 0) { dogOut.textContent = ''; return; }
    // fórmula popular AVMA (aprox.): 15 (1er año) + 9 (2do) + 5 por año adicional
    let human;
    if (y <= 1) human = y * 15;
    else if (y <= 2) human = 15 + (y - 1) * 9;
    else human = 24 + (y - 2) * 5;
    dogOut.textContent = `≈ ${fmt(human)} años humanos (aprox.)`;
  }
  dogIn.addEventListener('input', calcDog); calcDog();

  container.appendChild(wrap);
}

/* ===================== CALCULADORAS ===================== */
function renderCalculadorasPanel(container) {
  const grid = el('div', 'calc-grid');

  // IMC
  const imc = el('div', 'calc-card');
  imc.appendChild(el('h4', null, 'IMC (Índice de Masa Corporal)'));
  const pesoIn = el('input', 'num-input'); pesoIn.type = 'text'; pesoIn.value = '70';
  const alturaIn = el('input', 'num-input'); alturaIn.type = 'text'; alturaIn.value = '170';
  const imcRow = el('div', 'calc-row-3');
  imcRow.appendChild(labeled('Peso (kg)', pesoIn));
  imcRow.appendChild(labeled('Altura (cm)', alturaIn));
  imc.appendChild(imcRow);
  const imcOut = el('p', 'panel-result'); imc.appendChild(imcOut);
  function calcImc() {
    const p = parseFloat(pesoIn.value.replace(',', '.')), a = parseFloat(alturaIn.value.replace(',', '.')) / 100;
    if (isNaN(p) || isNaN(a) || a === 0) { imcOut.textContent = ''; return; }
    const val = p / (a * a);
    let cat = val < 18.5 ? 'bajo peso' : val < 25 ? 'normal' : val < 30 ? 'sobrepeso' : 'obesidad';
    imcOut.textContent = `IMC: ${fmt(val)} (${cat})`;
  }
  pesoIn.addEventListener('input', calcImc); alturaIn.addEventListener('input', calcImc); calcImc();
  grid.appendChild(imc);

  // Porcentaje
  const pct = el('div', 'calc-card');
  pct.appendChild(el('h4', null, 'Calculadora de porcentaje'));
  const pctA = el('input', 'num-input'); pctA.type = 'text'; pctA.value = '20';
  const pctB = el('input', 'num-input'); pctB.type = 'text'; pctB.value = '150';
  const pctRow = el('div', 'calc-row-3');
  pctRow.appendChild(labeled('% de', pctA));
  pctRow.appendChild(labeled('sobre', pctB));
  pct.appendChild(pctRow);
  const pctOut2 = el('p', 'panel-result'); pct.appendChild(pctOut2);
  function calcPercent() {
    const a = parseFloat(pctA.value.replace(',', '.')), b = parseFloat(pctB.value.replace(',', '.'));
    pctOut2.textContent = (isNaN(a) || isNaN(b)) ? '' : `= ${fmt((a/100)*b)}`;
  }
  pctA.addEventListener('input', calcPercent); pctB.addEventListener('input', calcPercent); calcPercent();
  grid.appendChild(pct);

  // Regla de tres
  const r3 = el('div', 'calc-card');
  r3.appendChild(el('h4', null, 'Regla de tres simple'));
  const r3a = el('input', 'num-input'); r3a.type = 'text'; r3a.value = '2';
  const r3b = el('input', 'num-input'); r3b.type = 'text'; r3b.value = '10';
  const r3c = el('input', 'num-input'); r3c.type = 'text'; r3c.value = '5';
  const r3row = el('div', 'calc-row-3');
  r3row.appendChild(labeled('A', r3a)); r3row.appendChild(labeled('→ B', r3b)); r3row.appendChild(labeled('C →', r3c));
  r3.appendChild(r3row);
  const r3out = el('p', 'panel-result'); r3.appendChild(r3out);
  function calcR3() {
    const a = parseFloat(r3a.value.replace(',', '.')), b = parseFloat(r3b.value.replace(',', '.')), c = parseFloat(r3c.value.replace(',', '.'));
    r3out.textContent = (isNaN(a) || isNaN(b) || isNaN(c) || a === 0) ? '' : `D = ${fmt((b*c)/a)}`;
  }
  [r3a,r3b,r3c].forEach(i => i.addEventListener('input', calcR3)); calcR3();
  grid.appendChild(r3);

  // Propina
  const tip = el('div', 'calc-card');
  tip.appendChild(el('h4', null, 'Calculadora de propina'));
  const cuenta = el('input', 'num-input'); cuenta.type = 'text'; cuenta.value = '1000';
  const tipPct = el('input', 'num-input'); tipPct.type = 'text'; tipPct.value = '10';
  const tipRow = el('div', 'calc-row-3');
  tipRow.appendChild(labeled('Cuenta', cuenta)); tipRow.appendChild(labeled('Propina %', tipPct));
  tip.appendChild(tipRow);
  const tipOut = el('p', 'panel-result'); tip.appendChild(tipOut);
  function calcTip() {
    const c = parseFloat(cuenta.value.replace(',', '.')), p = parseFloat(tipPct.value.replace(',', '.'));
    if (isNaN(c) || isNaN(p)) { tipOut.textContent = ''; return; }
    const propina = c * p / 100;
    tipOut.textContent = `Propina: ${fmt(propina)} · Total: ${fmt(c + propina)}`;
  }
  cuenta.addEventListener('input', calcTip); tipPct.addEventListener('input', calcTip); calcTip();
  grid.appendChild(tip);

  // Interés simple
  const si = el('div', 'calc-card');
  si.appendChild(el('h4', null, 'Interés simple'));
  const siC = el('input', 'num-input'); siC.type = 'text'; siC.value = '1000';
  const siR = el('input', 'num-input'); siR.type = 'text'; siR.value = '5';
  const siT = el('input', 'num-input'); siT.type = 'text'; siT.value = '2';
  const siRow = el('div', 'calc-row-3');
  siRow.appendChild(labeled('Capital', siC)); siRow.appendChild(labeled('Tasa % anual', siR)); siRow.appendChild(labeled('Años', siT));
  si.appendChild(siRow);
  const siOut = el('p', 'panel-result'); si.appendChild(siOut);
  function calcSI() {
    const c = parseFloat(siC.value.replace(',', '.')), r = parseFloat(siR.value.replace(',', '.')), t = parseFloat(siT.value.replace(',', '.'));
    if ([c,r,t].some(isNaN)) { siOut.textContent = ''; return; }
    const interes = c * (r/100) * t;
    siOut.textContent = `Interés: ${fmt(interes)} · Total: ${fmt(c + interes)}`;
  }
  [siC,siR,siT].forEach(i => i.addEventListener('input', calcSI)); calcSI();
  grid.appendChild(si);

  // Interés compuesto
  const ci = el('div', 'calc-card');
  ci.appendChild(el('h4', null, 'Interés compuesto'));
  const ciC = el('input', 'num-input'); ciC.type = 'text'; ciC.value = '1000';
  const ciR = el('input', 'num-input'); ciR.type = 'text'; ciR.value = '5';
  const ciT = el('input', 'num-input'); ciT.type = 'text'; ciT.value = '2';
  const ciN = el('input', 'num-input'); ciN.type = 'text'; ciN.value = '12';
  const ciRow = el('div', 'calc-row-3');
  ciRow.appendChild(labeled('Capital', ciC)); ciRow.appendChild(labeled('Tasa % anual', ciR)); ciRow.appendChild(labeled('Años', ciT));
  const ciRow2 = el('div', 'calc-row-3');
  ciRow2.appendChild(labeled('Capitalizaciones/año', ciN));
  ci.appendChild(ciRow); ci.appendChild(ciRow2);
  const ciOut = el('p', 'panel-result'); ci.appendChild(ciOut);
  function calcCI() {
    const c = parseFloat(ciC.value.replace(',', '.')), r = parseFloat(ciR.value.replace(',', '.')), t = parseFloat(ciT.value.replace(',', '.')), n = parseFloat(ciN.value.replace(',', '.'));
    if ([c,r,t,n].some(isNaN) || n === 0) { ciOut.textContent = ''; return; }
    const total = c * Math.pow(1 + (r/100)/n, n*t);
    ciOut.textContent = `Total: ${fmt(total)} · Interés ganado: ${fmt(total - c)}`;
  }
  [ciC,ciR,ciT,ciN].forEach(i => i.addEventListener('input', calcCI)); calcCI();
  grid.appendChild(ci);

  // IVA / Descuentos
  const iva = el('div', 'calc-card');
  iva.appendChild(el('h4', null, 'IVA y descuentos'));
  const ivaBase = el('input', 'num-input'); ivaBase.type = 'text'; ivaBase.value = '1000';
  const ivaPct = el('input', 'num-input'); ivaPct.type = 'text'; ivaPct.value = '18';
  const descPct = el('input', 'num-input'); descPct.type = 'text'; descPct.value = '10';
  const ivaRow = el('div', 'calc-row-3');
  ivaRow.appendChild(labeled('Precio base', ivaBase)); ivaRow.appendChild(labeled('IVA %', ivaPct)); ivaRow.appendChild(labeled('Descuento %', descPct));
  iva.appendChild(ivaRow);
  const ivaOut = el('p', 'panel-result'); iva.appendChild(ivaOut);
  function calcIva() {
    const b = parseFloat(ivaBase.value.replace(',', '.')), t = parseFloat(ivaPct.value.replace(',', '.')), d = parseFloat(descPct.value.replace(',', '.'));
    if ([b,t,d].some(isNaN)) { ivaOut.textContent = ''; return; }
    const conDescuento = b * (1 - d/100);
    const final = conDescuento * (1 + t/100);
    ivaOut.textContent = `Con descuento: ${fmt(conDescuento)} · Con IVA: ${fmt(final)}`;
  }
  [ivaBase,ivaPct,descPct].forEach(i => i.addEventListener('input', calcIva)); calcIva();
  grid.appendChild(iva);

  // Hipoteca
  const hip = el('div', 'calc-card');
  hip.appendChild(el('h4', null, 'Hipoteca (pago mensual)'));
  const hipM = el('input', 'num-input'); hipM.type = 'text'; hipM.value = '200000';
  const hipR = el('input', 'num-input'); hipR.type = 'text'; hipR.value = '6';
  const hipY = el('input', 'num-input'); hipY.type = 'text'; hipY.value = '30';
  const hipRow = el('div', 'calc-row-3');
  hipRow.appendChild(labeled('Monto', hipM)); hipRow.appendChild(labeled('Tasa % anual', hipR)); hipRow.appendChild(labeled('Años', hipY));
  hip.appendChild(hipRow);
  const hipOut = el('p', 'panel-result'); hip.appendChild(hipOut);
  function calcHip() {
    const m = parseFloat(hipM.value.replace(',', '.')), r = parseFloat(hipR.value.replace(',', '.'))/100/12, y = parseFloat(hipY.value.replace(',', '.'))*12;
    if ([m,r,y].some(isNaN) || y === 0) { hipOut.textContent = ''; return; }
    const pago = r === 0 ? m/y : m * r / (1 - Math.pow(1+r, -y));
    hipOut.textContent = `Pago mensual: ${fmt(pago)}`;
  }
  [hipM,hipR,hipY].forEach(i => i.addEventListener('input', calcHip)); calcHip();
  grid.appendChild(hip);

  // Fecha: diferencia entre fechas
  const fecha = el('div', 'calc-card');
  fecha.appendChild(el('h4', null, 'Diferencia entre fechas'));
  const f1 = el('input', 'date-input'); f1.type = 'date';
  const f2 = el('input', 'date-input'); f2.type = 'date';
  const today = new Date().toISOString().slice(0,10);
  f1.value = today; f2.value = today;
  const fRow = el('div', 'calc-row-3');
  fRow.appendChild(labeled('Desde', f1)); fRow.appendChild(labeled('Hasta', f2));
  fecha.appendChild(fRow);
  const fOut = el('p', 'panel-result'); fecha.appendChild(fOut);
  function calcFecha() {
    const d1 = new Date(f1.value), d2 = new Date(f2.value);
    if (isNaN(d1) || isNaN(d2)) { fOut.textContent = ''; return; }
    const days = Math.round((d2 - d1) / 86400000);
    fOut.textContent = `${days} días (${fmt(days/7)} semanas, ${fmt(days/30.44)} meses)`;
  }
  f1.addEventListener('input', calcFecha); f2.addEventListener('input', calcFecha); calcFecha();
  grid.appendChild(fecha);

  // Edad
  const edad = el('div', 'calc-card');
  edad.appendChild(el('h4', null, 'Calculadora de edad'));
  const fNac = el('input', 'date-input'); fNac.type = 'date'; fNac.value = '2000-01-01';
  edad.appendChild(labeled('Fecha de nacimiento', fNac));
  const edadOut = el('p', 'panel-result'); edad.appendChild(edadOut);
  function calcEdad() {
    const d = new Date(fNac.value), now = new Date();
    if (isNaN(d)) { edadOut.textContent = ''; return; }
    let years = now.getFullYear() - d.getFullYear();
    const m = now.getMonth() - d.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < d.getDate())) years--;
    edadOut.textContent = `${years} años`;
  }
  fNac.addEventListener('input', calcEdad); calcEdad();
  grid.appendChild(edad);

  // Embarazo
  const emb = el('div', 'calc-card');
  emb.appendChild(el('h4', null, 'Calculadora de embarazo'));
  const fUltima = el('input', 'date-input'); fUltima.type = 'date'; fUltima.value = today;
  emb.appendChild(labeled('Fecha de última menstruación', fUltima));
  const embOut = el('p', 'panel-result'); emb.appendChild(embOut);
  function calcEmb() {
    const d = new Date(fUltima.value);
    if (isNaN(d)) { embOut.textContent = ''; return; }
    const parto = new Date(d.getTime() + 280*86400000);
    const semanas = Math.floor((new Date() - d) / (7*86400000));
    embOut.textContent = `Semanas actuales: ${semanas} · Fecha probable de parto: ${parto.toLocaleDateString('es-DO')}`;
  }
  fUltima.addEventListener('input', calcEmb); calcEmb();
  grid.appendChild(emb);

  // Zona horaria
  const tz = el('div', 'calc-card');
  tz.appendChild(el('h4', null, 'Zonas horarias'));
  const zones = ['America/Santo_Domingo','America/New_York','America/Los_Angeles','America/Mexico_City','America/Bogota','Europe/Madrid','Europe/London','UTC'];
  const tzSel = el('select', 'unit-select'); zones.forEach(z => tzSel.appendChild(el('option', null, z)).value = z);
  tz.appendChild(tzSel);
  const tzOut = el('div', 'quick-table'); tz.appendChild(tzOut);
  function calcTz() {
    tzOut.innerHTML = zones.map(z => {
      const time = new Date().toLocaleString('es-DO', { timeZone: z, hour: '2-digit', minute: '2-digit', hour12: false, day:'2-digit', month:'2-digit' });
      return `<div class="quick-item"><span class="quick-label">${z.replace('_',' ')}</span><span class="quick-value">${time}</span></div>`;
    }).join('');
  }
  calcTz(); setInterval(calcTz, 30000);
  grid.appendChild(tz);

  // División de cuenta entre amigos
  const split = el('div', 'calc-card');
  split.appendChild(el('h4', null, 'Dividir cuenta entre amigos'));
  const splitTotal = el('input', 'num-input'); splitTotal.type = 'text'; splitTotal.value = '1000';
  const splitPeople = el('input', 'num-input'); splitPeople.type = 'text'; splitPeople.value = '4';
  const splitTax = el('input', 'num-input'); splitTax.type = 'text'; splitTax.value = '18';
  const splitTip = el('input', 'num-input'); splitTip.type = 'text'; splitTip.value = '10';
  const splitRow1 = el('div', 'calc-row-3');
  splitRow1.appendChild(labeled('Subtotal de la cuenta', splitTotal));
  splitRow1.appendChild(labeled('Personas', splitPeople));
  split.appendChild(splitRow1);
  const splitRow2 = el('div', 'calc-row-3');
  splitRow2.appendChild(labeled('Impuesto %', splitTax));
  splitRow2.appendChild(labeled('Propina %', splitTip));
  split.appendChild(splitRow2);
  split.appendChild(el('p', 'panel-note', '¿La cuenta ya incluye impuesto y propina? Pon ambos en 0. Por defecto se calculan sobre el subtotal.'));
  const splitOut = el('p', 'panel-result');
  split.appendChild(splitOut);
  const splitDetail = el('div', 'quick-table');
  split.appendChild(splitDetail);
  function calcSplit() {
    const sub = parseFloat(splitTotal.value.replace(',', '.'));
    const n = parseInt(splitPeople.value);
    const tax = parseFloat(splitTax.value.replace(',', '.')) || 0;
    const tip = parseFloat(splitTip.value.replace(',', '.')) || 0;
    if (isNaN(sub) || isNaN(n) || n <= 0) { splitOut.textContent = ''; splitDetail.innerHTML = ''; return; }
    const taxAmount = sub * (tax / 100);
    const tipAmount = sub * (tip / 100);
    const total = sub + taxAmount + tipAmount;
    const perPerson = total / n;
    splitOut.textContent = `Total con impuesto y propina: ${fmt(total)} · Cada quien paga: ${fmt(perPerson)}`;
    splitDetail.innerHTML = `
      <div class="quick-item"><span class="quick-label">Subtotal</span><span class="quick-value">${fmt(sub)}</span></div>
      <div class="quick-item"><span class="quick-label">Impuesto (${fmt(tax)}%)</span><span class="quick-value">${fmt(taxAmount)}</span></div>
      <div class="quick-item"><span class="quick-label">Propina (${fmt(tip)}%)</span><span class="quick-value">${fmt(tipAmount)}</span></div>
      <div class="quick-item"><span class="quick-label">Total</span><span class="quick-value">${fmt(total)}</span></div>
      <div class="quick-item"><span class="quick-label">Por persona (÷${n})</span><span class="quick-value">${fmt(perPerson)}</span></div>
    `;
  }
  [splitTotal, splitPeople, splitTax, splitTip].forEach(i => i.addEventListener('input', calcSplit));
  calcSplit();
  grid.appendChild(split);

  container.appendChild(grid);
}
/* ===================== TABS Y ARRANQUE ===================== */
const TAB_DEFS = [
  { id: 'longitud', label: 'Longitud', icon: '📏', kind: 'linear' },
  { id: 'peso', label: 'Peso', icon: '⚖️', kind: 'linear' },
  { id: 'temperatura', label: 'Temperatura', icon: '🌡️', kind: 'temp' },
  { id: 'area', label: 'Área', icon: '📐', kind: 'linear' },
  { id: 'volumen', label: 'Volumen', icon: '📦', kind: 'linear' },
  { id: 'tiempo', label: 'Tiempo', icon: '⏱️', kind: 'linear' },
  { id: 'velocidad', label: 'Velocidad', icon: '🚗', kind: 'linear' },
  { id: 'combustible', label: 'Combustible', icon: '⛽', kind: 'fuel' },
  { id: 'presion', label: 'Presión', icon: '💧', kind: 'linear' },
  { id: 'energia', label: 'Energía', icon: '⚡', kind: 'linear' },
  { id: 'potencia', label: 'Potencia', icon: '🔋', kind: 'linear' },
  { id: 'electricidad', label: 'Electricidad', icon: '🔌', kind: 'linear-extra', extra: renderElectricidadExtra },
  { id: 'datos', label: 'Datos digitales', icon: '💻', kind: 'linear-extra', extra: renderDatosExtra },
  { id: 'angulos', label: 'Ángulos', icon: '📐', kind: 'linear' },
  { id: 'frecuencia', label: 'Frecuencia', icon: '📶', kind: 'linear' },
  { id: 'densidad', label: 'Densidad', icon: '🧪', kind: 'linear' },
  { id: 'monedas', label: 'Monedas', icon: '💱', kind: 'custom', render: renderMonedasPanel },
  { id: 'tallas', label: 'Tallas', icon: '👟', kind: 'custom', render: renderTallasPanel },
  { id: 'pantallas', label: 'Pantallas y papel', icon: '📺', kind: 'custom', render: renderPantallasPanel },
  { id: 'otros', label: 'Otros', icon: '💎', kind: 'custom', render: renderOtrosPanel },
  { id: 'calculadoras', label: 'Calculadoras', icon: '🧮', kind: 'custom', render: renderCalculadorasPanel },
];

let currentTab = 'longitud';

function renderTabs() {
  const nav = document.getElementById('tabNav');
  nav.innerHTML = '';
  TAB_DEFS.forEach(t => {
    const btn = el('button', 'tab-btn' + (t.id === currentTab ? ' active' : ''), `${t.icon} ${t.label}`);
    btn.type = 'button';
    btn.addEventListener('click', () => { currentTab = t.id; renderTabs(); renderPanel(); });
    nav.appendChild(btn);
  });
}

function renderPanel(preset) {
  const container = document.getElementById('panelArea');
  container.innerHTML = '';
  const t = TAB_DEFS.find(x => x.id === currentTab);
  if (t.kind === 'linear') {
    const cat = CATEGORIES.find(c => c.id === t.id);
    container.appendChild(renderLinearPanel(cat, preset));
  } else if (t.kind === 'linear-extra') {
    const cat = CATEGORIES.find(c => c.id === t.id);
    container.appendChild(renderLinearPanel(cat, preset));
    t.extra(container);
  } else if (t.kind === 'temp') {
    container.appendChild(renderTempPanel(preset));
  } else if (t.kind === 'fuel') {
    container.appendChild(renderFuelPanel(preset));
  } else if (t.kind === 'custom') {
    t.render(container, preset);
  }
}

function initSmartBar() {
  const input = document.getElementById('smartInput');
  input.addEventListener('input', () => renderSmartResult(parseSmart(input.value)));
  renderSmartResult(parseSmart(input.value));
}

// Todo lo que sigue depende del DOM del navegador; en Node (durante el build de las
// páginas SEO) este archivo se `require()`a solo para reutilizar los datos y funciones
// de conversión — sin ejecutar nada de esto.
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    initSmartBar();
    // Si la URL ya trae una conversión conocida (ej. /metros-a-pies), abrimos directo en ella.
    const preset = presetFromPath(location.pathname);
    if (preset && TAB_DEFS.some(t => t.id === preset.tab)) {
      currentTab = preset.tab;
    }
    renderTabs();
    renderPanel(preset || undefined);
  });

  // Soporte para los botones atrás/adelante del navegador.
  window.addEventListener('popstate', () => {
    const preset = presetFromPath(location.pathname);
    currentTab = (preset && TAB_DEFS.some(t => t.id === preset.tab)) ? preset.tab : 'longitud';
    renderTabs();
    renderPanel(preset || undefined);
  });
}

// Reutilizado por scripts/build.js (Node) para generar las páginas SEO con los MISMOS
// datos y las MISMAS fórmulas que usa la app en el navegador — cero duplicación.
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    CATEGORIES, TEMP_UNITS, FUEL_UNITS, TAB_DEFS, SLUG_WORDS,
    convertLinear, convertTemp, convertFuel, fmt, slugFor,
    STATIC_RATES, CURRENCY_LIST,
  };
}