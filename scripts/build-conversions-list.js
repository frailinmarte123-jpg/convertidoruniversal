// scripts/build-conversions-list.js
// Genera data/conversions.json a partir de una lista curada de pares "con sentido de búsqueda"
// (ambas direcciones), validando cada par contra el motor real (assets/app.js).
// Se corre UNA VEZ para crear el archivo inicial; luego data/conversions.json se edita a mano
// para agregar/quitar conversiones (esa es la "lista" que pide el requisito 5).

const fs = require('fs');
const path = require('path');
const engine = require('../assets/app.js');

const PAIRS = [
  // Longitud
  ['longitud','m','ft'], ['longitud','m','cm'], ['longitud','m','mm'], ['longitud','m','km'],
  ['longitud','m','yd'], ['longitud','m','in'], ['longitud','m','mi'],
  ['longitud','ft','in'], ['longitud','ft','yd'], ['longitud','ft','mi'],
  ['longitud','km','mi'], ['longitud','cm','in'], ['longitud','cm','ft'],
  ['longitud','mm','in'], ['longitud','yd','mi'], ['longitud','mi','in'],
  ['longitud','nm','um'], ['longitud','um','mm'],
  // Peso
  ['peso','kg','lb'], ['peso','kg','g'], ['peso','kg','oz'], ['peso','kg','t'],
  ['peso','lb','oz'], ['peso','lb','g'], ['peso','lb','t'], ['peso','oz','g'], ['peso','ct','g'],
  // Temperatura
  ['temperatura','c','f'], ['temperatura','c','k'], ['temperatura','f','k'],
  // Área
  ['area','m2','ft2'], ['area','m2','ha'], ['area','m2','acre'],
  ['area','km2','mi2'], ['area','ha','acre'], ['area','cm2','in2'],
  // Volumen
  ['volumen','L','mL'], ['volumen','L','galus'], ['volumen','L','galuk'],
  ['volumen','L','m3'], ['volumen','L','ft3'], ['volumen','L','floz'],
  ['volumen','mL','cup'], ['volumen','cup','tbsp'], ['volumen','cup','tsp'],
  ['volumen','pt','qt'], ['volumen','qt','galus'],
  // Tiempo
  ['tiempo','s','min'], ['tiempo','min','h'], ['tiempo','h','day'],
  ['tiempo','day','week'], ['tiempo','week','month'], ['tiempo','month','year'], ['tiempo','ms','s'],
  // Velocidad
  ['velocidad','kmh','mph'], ['velocidad','kmh','ms'], ['velocidad','mph','knot'],
  ['velocidad','ms','fts'], ['velocidad','mach','kmh'], ['velocidad','mach','mph'],
  // Combustible
  ['combustible','mpg','l100km'], ['combustible','kml','mpg'], ['combustible','kml','l100km'],
  // Presión
  ['presion','psi','bar'], ['presion','psi','kpa'], ['presion','psi','atm'],
  ['presion','bar','kpa'], ['presion','bar','atm'], ['presion','mmhg','atm'],
  // Energía
  ['energia','j','cal'], ['energia','j','kwh'], ['energia','cal','kwh'],
  ['energia','btu','j'], ['energia','btu','kwh'],
  // Potencia
  ['potencia','w','kw'], ['potencia','hp','w'], ['potencia','hp','kw'], ['potencia','btuh','w'],
  // Datos digitales
  ['datos','bit','byte'], ['datos','kb','mb'], ['datos','mb','gb'], ['datos','gb','tb'], ['datos','tb','pb'],
  // Ángulos
  ['angulos','deg','rad'], ['angulos','deg','grad'],
  // Frecuencia
  ['frecuencia','hz','khz'], ['frecuencia','khz','mhz'], ['frecuencia','mhz','ghz'],
  // Densidad
  ['densidad','kgm3','gcm3'], ['densidad','lbft3','kgm3'],
];

function labelOf(tab, code) {
  if (tab === 'temperatura') return engine.TEMP_UNITS.find(u => u.code === code)?.label;
  if (tab === 'combustible') return engine.FUEL_UNITS.find(u => u.code === code)?.label;
  const cat = engine.CATEGORIES.find(c => c.id === tab);
  return cat?.units.find(u => u.code === code)?.label;
}

const conversions = [];
for (const [tab, a, b] of PAIRS) {
  for (const [from, to] of [[a, b], [b, a]]) {
    if (!labelOf(tab, from) || !labelOf(tab, to)) {
      throw new Error(`Par inválido: ${tab} ${from}->${to} (revisa CATEGORIES en app.js)`);
    }
    const slug = engine.slugFor(tab, from, to);
    if (!slug) throw new Error(`No se pudo generar slug para ${tab} ${from}->${to} (falta en SLUG_WORDS)`);
    conversions.push({ slug, tab, from, to });
  }
}

// dedupe por slug, por si acaso
const seen = new Set();
const deduped = conversions.filter(c => (seen.has(c.slug) ? false : seen.add(c.slug)));

fs.writeFileSync(
  path.join(__dirname, '../data/conversions.json'),
  JSON.stringify(deduped, null, 2) + '\n'
);
console.log(`data/conversions.json generado con ${deduped.length} conversiones.`);
