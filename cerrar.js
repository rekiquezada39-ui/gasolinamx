#!/usr/bin/env node
// ══════════════════════════════════════════════════════════
//  cerrar.js — bloquear/desbloquear gasolineras reportadas
//
//  Ver la lista:        node cerrar.js
//  Bloquear:            node cerrar.js 12345 "ya cerro, reporte de Juan"
//  Quitar el bloqueo:   node cerrar.js -q 12345
//  Buscar por nombre:   node cerrar.js -b rusher
// ══════════════════════════════════════════════════════════
const f = require('fs'), P = require('path');
const FILE = P.join(__dirname, 'cerradas.json');

let L = {};
try { L = JSON.parse(f.readFileSync(FILE, 'utf8')) } catch (e) {}

const guarda = () => f.writeFileSync(FILE, JSON.stringify(L, null, 2) + '\n');
const a = process.argv.slice(2);

// ── buscar el ID de una estacion por nombre
if (a[0] === '-b' || a[0] === '--buscar') {
  const q = (a.slice(1).join(' ') || '').toLowerCase();
  if (!q) { console.log('\n  Uso: node cerrar.js -b rusher\n'); process.exit(1) }
  const geo = P.join(__dirname, 'dist', 'geo.json');
  if (!f.existsSync(geo)) { console.log('\n  Corre primero: node build.js\n'); process.exit(1) }
  // geo.json no trae el id, hay que sacarlo del slug: nombre-ID
  const D = JSON.parse(f.readFileSync(geo, 'utf8'));
  const hits = D.filter(g => g[2].toLowerCase().includes(q) || (g[7] || '').toLowerCase().includes(q));
  if (!hits.length) { console.log(`\n  Sin resultados para "${q}"\n`); process.exit(0) }
  console.log(`\n  ${hits.length} resultado(s) para "${q}":\n`);
  hits.slice(0, 25).forEach(g => {
    const id = (g[3].match(/-(\d+)$/) || [])[1] || '?';
    console.log(`  ID ${id.padEnd(7)} $${g[4].toFixed(2).padEnd(7)} ${g[2].slice(0, 44).padEnd(46)} ${g[7] || ''}`);
  });
  if (hits.length > 25) console.log(`\n  ...y ${hits.length - 25} mas. Afina la busqueda.`);
  console.log('\n  Para bloquear:  node cerrar.js <ID> "motivo"\n');
  process.exit(0);
}

// ── quitar bloqueo
if (a[0] === '-q' || a[0] === '--quitar') {
  const id = a[1];
  if (!id) { console.log('\n  Uso: node cerrar.js -q 12345\n'); process.exit(1) }
  if (!L[id]) { console.log(`\n  El ID ${id} no estaba bloqueado.\n`); process.exit(0) }
  delete L[id]; guarda();
  console.log(`\n  ✓ ID ${id} desbloqueado. Vuelve a aparecer en el proximo build.\n`);
  process.exit(0);
}

// ── sin argumentos: mostrar la lista
if (!a.length) {
  const k = Object.keys(L);
  if (!k.length) {
    console.log('\n  No hay estaciones bloqueadas.\n');
    console.log('  Bloquear:  node cerrar.js 12345 "ya cerro"');
    console.log('  Buscar ID: node cerrar.js -b rusher\n');
  } else {
    console.log(`\n  ${k.length} estacion(es) bloqueada(s):\n`);
    k.forEach(id => console.log(`  ID ${id.padEnd(8)} ${L[id]}`));
    console.log('\n  Quitar: node cerrar.js -q <ID>\n');
  }
  process.exit(0);
}

// ── bloquear
const id = a[0].replace(/\D/g, '');
if (!id) { console.log('\n  El ID debe ser un numero. Ej: node cerrar.js 12345 "ya cerro"\n'); process.exit(1) }
const motivo = a.slice(1).join(' ') || 'reportada por un usuario';
const fecha = new Date().toISOString().slice(0, 10);
L[id] = `${motivo} (${fecha})`;
guarda();
console.log(`\n  ✓ ID ${id} bloqueado: ${L[id]}`);
console.log('\n  Ahora corre:');
console.log('    node build.js');
console.log('    git add -A');
console.log('    git commit -m "Bloqueo estacion ' + id + '"');
console.log('    git push\n');
