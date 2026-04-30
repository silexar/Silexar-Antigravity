const XLSX = require('xlsx');
const path = require('path');

const filePath = path.join(__dirname, '..', 'Modulos', 'Anexos', 'AUSPICIOS NVO FORMATO 27 de Abril al 03 de Mayo de 2026.xlsx');
const workbook = XLSX.readFile(filePath);

const sheetNames = ['SONAR ', 'RADIO 13C', 'PLAY ', ' TELE13'];
const emisorasMap = {
  'SONAR ': 'Sonar FM',
  'RADIO 13C': 'Radio 13C',
  'PLAY ': 'Play FM',
  ' TELE13': 'Tele13 Radio'
};

const result = {
  emisoras: {},
  parrillaDigital: [],
  vodcast: [],
  podcastVigentes: [],
  podcastOriginales: [],
  auspiciosPodcast: [],
  baseSmartaudio: []
};

// Parse radio sheets
sheetNames.forEach(sheetName => {
  const emisoraNombre = emisorasMap[sheetName];
  const worksheet = workbook.Sheets[sheetName];
  if (!worksheet) {
    console.log(`Sheet not found: "${sheetName}"`);
    return;
  }
  const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
  
  // Find header row (row with "SOPORTE")
  let headerRow = -1;
  for (let i = 0; i < Math.min(15, jsonData.length); i++) {
    const row = jsonData[i];
    if (row && row.some(cell => String(cell).toUpperCase().includes('SOPORTE'))) {
      headerRow = i;
      break;
    }
  }
  
  if (headerRow === -1) {
    console.log(`Header not found in ${sheetName}`);
    return;
  }
  
  const headers = jsonData[headerRow].map(h => String(h).trim().toUpperCase());
  const soporteIdx = headers.indexOf('SOPORTE');
  const contenidoIdx = headers.indexOf('CONTENIDO');
  const horariosIdx = headers.indexOf('HORARIOS');
  const distribucionIdx = headers.indexOf('DISTRIBUCIÓN');
  const cuposIdx = headers.indexOf('CUPOS');
  const derechosIdx = headers.indexOf('DERECHOS COMERCIALES');
  const tarifaIdx = headers.findIndex(h => h.includes('TARIFA MES') || h.includes('VALOR TOTAL'));
  const mencionIdx = headers.findIndex(h => h.includes('TARIFA MENCION'));
  const clienteIdx = headers.indexOf('CLIENTE');
  const categoriasIdx = headers.indexOf('CATEGORIAS CIERRE');
  const desdeIdx = headers.indexOf('DESDE');
  const hastaIdx = headers.indexOf('HASTA');
  
  const records = [];
  let currentSupport = '';
  let currentContent = '';
  
  for (let i = headerRow + 1; i < jsonData.length; i++) {
    const row = jsonData[i];
    if (!row || row.length === 0) continue;
    
    const soporte = soporteIdx >= 0 ? String(row[soporteIdx] || '').trim() : '';
    const contenido = contenidoIdx >= 0 ? String(row[contenidoIdx] || '').trim() : '';
    
    if (soporte && soporte !== '0') currentSupport = soporte;
    if (contenido && contenido !== '0') currentContent = contenido;
    
    const tarifaRaw = tarifaIdx >= 0 ? String(row[tarifaIdx] || '').trim() : '';
    const tarifa = tarifaRaw ? parseInt(tarifaRaw.replace(/[^0-9]/g, ''), 10) : null;
    
    const cuposRaw = cuposIdx >= 0 ? String(row[cuposIdx] || '').trim() : '';
    const cupos = cuposRaw ? parseInt(cuposRaw, 10) : null;
    
    const record = {
      emisora: emisoraNombre,
      soporte: currentSupport,
      contenido: currentContent,
      horarios: horariosIdx >= 0 ? String(row[horariosIdx] || '').trim() : '',
      distribucion: distribucionIdx >= 0 ? String(row[distribucionIdx] || '').trim() : '',
      cupos: cupos,
      derechosComerciales: derechosIdx >= 0 ? String(row[derechosIdx] || '').trim() : '',
      tarifaMes: tarifa,
      tarifaMencion: mencionIdx >= 0 ? String(row[mencionIdx] || '').trim() : '',
      cliente: clienteIdx >= 0 ? String(row[clienteIdx] || '').trim() : '',
      categoriasCierre: categoriasIdx >= 0 ? String(row[categoriasIdx] || '').trim() : '',
      desde: desdeIdx >= 0 ? String(row[desdeIdx] || '').trim() : '',
      hasta: hastaIdx >= 0 ? String(row[hastaIdx] || '').trim() : ''
    };
    
    // Only keep records with meaningful data
    if (record.contenido || record.cliente || record.tarifaMes || record.cupos) {
      records.push(record);
    }
  }
  
  result.emisoras[emisoraNombre] = records;
  console.log(`${emisoraNombre}: ${records.length} records`);
});

// Parse other sheets for package module
const otherSheets = [
  { name: 'PARRILLA DIGITAL', key: 'parrillaDigital' },
  { name: 'VODCAST', key: 'vodcast' },
  { name: 'torpedo Podcast Vigentes', key: 'podcastVigentes' },
  { name: 'POD ORIGINALES COORDINACION', key: 'podcastOriginales' },
  { name: 'auspicios podcast', key: 'auspiciosPodcast' },
  { name: 'base smartaudio', key: 'baseSmartaudio' }
];

otherSheets.forEach(({ name, key }) => {
  const worksheet = workbook.Sheets[name];
  if (!worksheet) {
    console.log(`Sheet not found: "${name}"`);
    return;
  }
  const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
  result[key] = jsonData.slice(0, 50); // First 50 rows for preview
  console.log(`${name}: ${jsonData.length} rows`);
});

// Save result
const fs = require('fs');
fs.writeFileSync(path.join(__dirname, 'excel-data.json'), JSON.stringify(result, null, 2));
console.log('\nData saved to excel-data.json');
