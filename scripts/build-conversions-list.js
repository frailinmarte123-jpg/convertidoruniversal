// scripts/build-conversions-list.js
// Genera data/conversions.json con TODAS las combinaciones válidas de unidades por
// categoría (usando el motor real en assets/app.js), respetando subgrupos donde no todas
// las unidades de una categoría son mutuamente convertibles (electricidad: V con V,
// A con A, Ω con Ω — nunca V con A).
//
// Se corre a mano cuando cambias las unidades soportadas (no se ejecuta en CI, para no
// pisar ediciones manuales de data/conversions.json).

const fs = require('fs');
const path = require('path');
const engine = require('../assets/app.js');

// Subgrupos de unidades que SÍ se pueden convertir entre sí dentro de una categoría.
// Si una categoría no aparece aquí, se asume que TODAS sus unidades son un solo grupo.
const SUBGROUPS = {
  electricidad: [['v', 'mv'], ['a', 'ma'], ['ohm', 'kohm']],
};

function groupsFor(tab) {
  if (SUBGROUPS[tab]) return SUBGROUPS[tab];
  if (tab === 'temperatura') return [engine.TEMP_UNITS.map(u => u.code)];
  if (tab === 'combustible') return [engine.FUEL_UNITS.map(u => u.code)];
  if (tab === 'monedas') return [engine.CURRENCY_LIST];
  const cat = engine.CATEGORIES.find(c => c.id === tab);
  return [cat.units.map(u => u.code)];
}

const ALL_TABS = [
  'longitud', 'peso', 'temperatura', 'area', 'volumen', 'tiempo', 'velocidad',
  'combustible', 'presion', 'energia', 'potencia', 'electricidad', 'datos',
  'angulos', 'frecuencia', 'densidad', 'monedas',
];

const conversions = [];
for (const tab of ALL_TABS) {
  for (const group of groupsFor(tab)) {
    for (const from of group) {
      for (const to of group) {
        if (from === to) continue;
        const slug = engine.slugFor(tab, from, to);
        if (!slug) throw new Error(`Falta slug para ${tab}:${from}->${to} en SLUG_WORDS`);
        conversions.push({ slug, tab, from, to });
      }
    }
  }
}

// dedupe por slug (por si dos pares generaran el mismo slug por error de datos)
const seen = new Set();
const deduped = conversions.filter(c => (seen.has(c.slug) ? false : seen.add(c.slug)));

fs.writeFileSync(
  path.join(__dirname, '../data/conversions.json'),
  JSON.stringify(deduped, null, 2) + '\n'
);

console.log(`data/conversions.json generado con ${deduped.length} conversiones.`);
const byTab = {};
for (const c of deduped) byTab[c.tab] = (byTab[c.tab] || 0) + 1;
console.table(byTab);
