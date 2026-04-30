const fs = require('fs');
const data = JSON.parse(fs.readFileSync('tmp-seed/excel-data.json', 'utf8'));

function cleanRecords(records) {
  return records.filter(r => {
    const hasClient = r.cliente && r.cliente.length > 2 && !/^\d+$/.test(r.cliente.trim()) && r.cliente !== 'CLIENTE';
    const hasTarifa = r.tarifaMes && r.tarifaMes > 100000;
    const hasCupos = r.cupos && r.cupos > 0;
    return hasClient || hasTarifa;
  }).map(r => ({
    ...r,
    cliente: (r.cliente && /^\d+$/.test(r.cliente.trim())) ? '' : r.cliente
  }));
}

Object.keys(data.emisoras).forEach(emi => {
  const cleaned = cleanRecords(data.emisoras[emi]);
  console.log(`\n=== ${emi} (${cleaned.length} records with client or high tarifa) ===`);
  cleaned.forEach((r, i) => {
    console.log(`${i+1}. [${r.soporte}] ${r.contenido} | Cupos: ${r.cupos} | Tarifa: ${r.tarifaMes?.toLocaleString()} | Cliente: ${r.cliente} | Desde: ${r.desde} | Hasta: ${r.hasta}`);
  });
});
