const fs = require('fs');
const data = JSON.parse(fs.readFileSync('tmp-seed/excel-data.json', 'utf8'));

console.log('Emisoras:', Object.keys(data.emisoras));

console.log('\n=== Play FM sample ===');
data.emisoras['Play FM'].slice(0, 8).forEach((r, i) => {
  console.log(`${i + 1}. [${r.soporte}] ${r.contenido} | Cupos: ${r.cupos} | Tarifa: ${r.tarifaMes} | Cliente: ${r.cliente} | Horarios: ${r.horarios}`);
});

console.log('\n=== Tele13 sample ===');
data.emisoras['Tele13 Radio'].slice(0, 8).forEach((r, i) => {
  console.log(`${i + 1}. [${r.soporte}] ${r.contenido} | Cupos: ${r.cupos} | Tarifa: ${r.tarifaMes} | Cliente: ${r.cliente} | Horarios: ${r.horarios}`);
});

console.log('\n=== Sonar FM sample ===');
data.emisoras['Sonar FM'].slice(0, 8).forEach((r, i) => {
  console.log(`${i + 1}. [${r.soporte}] ${r.contenido} | Cupos: ${r.cupos} | Tarifa: ${r.tarifaMes} | Cliente: ${r.cliente} | Horarios: ${r.horarios}`);
});

console.log('\n=== Radio 13C sample ===');
data.emisoras['Radio 13C'].slice(0, 8).forEach((r, i) => {
  console.log(`${i + 1}. [${r.soporte}] ${r.contenido} | Cupos: ${r.cupos} | Tarifa: ${r.tarifaMes} | Cliente: ${r.cliente} | Horarios: ${r.horarios}`);
});
