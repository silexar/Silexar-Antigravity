const fs = require('fs');
const data = JSON.parse(fs.readFileSync('tmp-seed/excel-data.json', 'utf8'));

// Excel date to JS Date (Windows Excel 1900 system)
function excelDateToJSDate(excelDate) {
  if (!excelDate || typeof excelDate !== 'number' || excelDate < 40000) return null;
  return new Date(Math.round((excelDate - 25569) * 86400 * 1000));
}

function formatDate(d) {
  if (!d) return null;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function fecha(diasDesdeHoy) {
  const d = new Date();
  d.setDate(d.getDate() + diasDesdeHoy);
  d.setHours(0, 0, 0, 0);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Program definitions with mapping from Excel content
const programasMap = {
  'Play FM': [
    { id: 'p1111111-1111-1111-1111-111111111111', codigo: 'PLAY-CAFE', nombre: 'Café Play', conductor: 'Cata Chuaqui', horaInicio: '07:00', horaFin: '10:00', tipo: 'matinal' },
    { id: 'p1111111-1111-1111-1111-111111111112', codigo: 'PLAY-AGENDA', nombre: 'Agenda Play', conductor: 'Cata Chuaqui', horaInicio: '07:00', horaFin: '09:00', tipo: 'noticiero' },
    { id: 'p1111111-1111-1111-1111-111111111113', codigo: 'PLAY-LOOK', nombre: 'Look', conductor: 'Milla Kemp', horaInicio: '09:00', horaFin: '11:00', tipo: 'magazin' },
    { id: 'p1111111-1111-1111-1111-111111111114', codigo: 'PLAY-LIST', nombre: 'Playlist', conductor: 'Rosario Grez', horaInicio: '10:00', horaFin: '13:00', tipo: 'musical' },
    { id: 'p1111111-1111-1111-1111-111111111115', codigo: 'PLAY-POWER', nombre: 'Play Power', conductor: 'Vero Calabi', horaInicio: '13:00', horaFin: '16:00', tipo: 'entretenimiento' },
    { id: 'p1111111-1111-1111-1111-111111111116', codigo: 'PLAY-FUERA', nombre: 'Fuera de Contexto', conductor: 'Milla Kemp', horaInicio: '16:00', horaFin: '19:00', tipo: 'entretenimiento' },
    { id: 'p1111111-1111-1111-1111-111111111117', codigo: 'PLAY-GEN', nombre: 'Generación Play', conductor: 'Ignacio Franzani', horaInicio: '19:00', horaFin: '22:00', tipo: 'musical' },
    { id: 'p1111111-1111-1111-1111-111111111118', codigo: 'PLAY-FAV', nombre: 'Agenda de Favoritos', conductor: 'Cata Chuaqui', horaInicio: '11:00', horaFin: '12:00', tipo: 'magazin' },
    { id: 'p1111111-1111-1111-1111-111111111119', codigo: 'PLAY-POPUP', nombre: 'Pop Up', conductor: 'Rosario Grez', horaInicio: '14:00', horaFin: '15:00', tipo: 'musical' },
  ],
  'Sonar FM': [
    { id: 'p2222222-2222-2222-2222-222222222221', codigo: 'SONAR-INFO', nombre: 'Sonar Informativo', conductor: 'Pablo Aranzaes', horaInicio: '07:00', horaFin: '09:00', tipo: 'noticiero' },
    { id: 'p2222222-2222-2222-2222-222222222222', codigo: 'SONAR-RADIO', nombre: 'Radiotransmisor', conductor: 'Alfredo Lewin', horaInicio: '09:00', horaFin: '12:00', tipo: 'musical' },
    { id: 'p2222222-2222-2222-2222-222222222223', codigo: 'SONAR-ROCK', nombre: 'Rock y Guitarras', conductor: 'Pablo Márquez', horaInicio: '12:00', horaFin: '15:00', tipo: 'musical' },
    { id: 'p2222222-2222-2222-2222-222222222224', codigo: 'SONAR-CLAS', nombre: 'Sonar Clásico', conductor: 'Francisco Reinoso', horaInicio: '15:00', horaFin: '18:00', tipo: 'musical' },
    { id: 'p2222222-2222-2222-2222-222222222225', codigo: 'SONAR-HERO', nombre: 'Sonar Héroes', conductor: 'Ignacio Pérez Tuesta', horaInicio: '18:00', horaFin: '21:00', tipo: 'musical' },
    { id: 'p2222222-2222-2222-2222-222222222226', codigo: 'SONAR-DEP', nombre: 'Sonar Deportivo', conductor: 'Pablo Aranzaes', horaInicio: '21:00', horaFin: '23:00', tipo: 'deportivo' },
    { id: 'p2222222-2222-2222-2222-222222222227', codigo: 'SONAR-90S', nombre: 'Sonar 90s', conductor: 'Vero Calabi', horaInicio: '09:00', horaFin: '11:00', tipo: 'musical' },
    { id: 'p2222222-2222-2222-2222-222222222228', codigo: 'SONAR-GLOBAL', nombre: 'Sonar Global', conductor: 'Pablo Aranzaes', horaInicio: '12:00', horaFin: '14:00', tipo: 'musical' },
    { id: 'p2222222-2222-2222-2222-222222222229', codigo: 'SONAR-MOTORES', nombre: 'Sonar de Motores', conductor: 'Pablo Aranzaes', horaInicio: '15:00', horaFin: '16:00', tipo: 'deportivo' },
  ],
  'Tele13 Radio': [
    { id: 'p3333333-3333-3333-3333-333333333331', codigo: 'T13-MESA', nombre: 'Mesa Central', conductor: 'Iván Valenzuela', horaInicio: '07:00', horaFin: '10:00', tipo: 'noticiero' },
    { id: 'p3333333-3333-3333-3333-333333333332', codigo: 'T13-MANANA', nombre: 'Lo que marca la mañana', conductor: 'Andrea Rivera', horaInicio: '10:00', horaFin: '12:00', tipo: 'magazin' },
    { id: 'p3333333-3333-3333-3333-333333333333', codigo: 'T13-CLICK', nombre: 'Doble Click', conductor: 'Ramón Ulloa', horaInicio: '17:00', horaFin: '19:00', tipo: 'magazin' },
    { id: 'p3333333-3333-3333-3333-333333333334', codigo: 'T13-MERCADO', nombre: 'Mercado Global', conductor: 'Axel Christensen', horaInicio: '10:00', horaFin: '11:00', tipo: 'cultural' },
    { id: 'p3333333-3333-3333-3333-333333333335', codigo: 'T13-FIN', nombre: 'El Fin del Dinero', conductor: 'Paula Comandari', horaInicio: '14:00', horaFin: '15:00', tipo: 'cultural' },
    { id: 'p3333333-3333-3333-3333-333333333336', codigo: 'T13-TARDE', nombre: 'Lo que marca la tarde', conductor: 'Paloma Ávila', horaInicio: '15:00', horaFin: '17:00', tipo: 'magazin' },
    { id: 'p3333333-3333-3333-3333-333333333337', codigo: 'T13-CONEX', nombre: 'Conexión Tele13', conductor: 'Ramón Ulloa', horaInicio: '19:00', horaFin: '20:00', tipo: 'noticiero' },
    { id: 'p3333333-3333-3333-3333-333333333338', codigo: 'T13-PAGINA', nombre: 'Página 13', conductor: 'Kike Mujica', horaInicio: '20:00', horaFin: '21:00', tipo: 'noticiero' },
    { id: 'p3333333-3333-3333-3333-333333333339', codigo: 'T13-AVION', nombre: 'Modo Avión', conductor: 'Consuelo Saavedra', horaInicio: '12:00', horaFin: '13:00', tipo: 'cultural' },
    { id: 'p3333333-3333-3333-3333-33333333333a', codigo: 'T13-SELECC', nombre: 'Mesa Central Selección', conductor: 'Iván Valenzuela', horaInicio: '10:00', horaFin: '11:00', tipo: 'noticiero' },
  ],
  'Radio 13C': [
    { id: 'p4444444-4444-4444-4444-444444444441', codigo: '13C-CUATRO', nombre: 'Cuatro Cabezas', conductor: 'Kike Mujica', horaInicio: '07:00', horaFin: '09:00', tipo: 'cultural' },
    { id: 'p4444444-4444-4444-4444-444444444442', codigo: '13C-GLOBAL', nombre: 'Cuatro Cabezas Global', conductor: 'Consuelo Saavedra', horaInicio: '08:00', horaFin: '09:00', tipo: 'cultural' },
    { id: 'p4444444-4444-4444-4444-444444444443', codigo: '13C-CADENA', nombre: 'Cadena de Valor', conductor: 'Cata Edwards', horaInicio: '09:00', horaFin: '10:00', tipo: 'cultural' },
    { id: 'p4444444-4444-4444-4444-444444444444', codigo: '13C-DESPUES', nombre: 'Después de Todo', conductor: 'Soledad Onetto', horaInicio: '10:00', horaFin: '12:00', tipo: 'cultural' },
    { id: 'p4444444-4444-4444-4444-444444444445', codigo: '13C-CORR', nombre: 'Corresponsales', conductor: 'Marcelo Comparini', horaInicio: '12:00', horaFin: '13:00', tipo: 'noticiero' },
    { id: 'p4444444-4444-4444-4444-444444444446', codigo: '13C-CANC', nombre: 'Cancionero', conductor: 'Marcelo Comparini', horaInicio: '13:00', horaFin: '14:00', tipo: 'musical' },
    { id: 'p4444444-4444-4444-4444-444444444447', codigo: '13C-BLOQUE', nombre: 'Bloque Musical', conductor: 'Pablo Márquez', horaInicio: '14:00', horaFin: '16:00', tipo: 'musical' },
  ]
};

// Mapping from Excel content names to programa IDs
const contentToPrograma = {
  'Play FM': {
    'AGENDA PLAY': 'p1111111-1111-1111-1111-111111111112',
    'AGENDA DE FAVORITOS': 'p1111111-1111-1111-1111-111111111118',
    'LOOK': 'p1111111-1111-1111-1111-111111111113',
    'PLAYLIST': 'p1111111-1111-1111-1111-111111111114',
    'PLAY POWER': 'p1111111-1111-1111-1111-111111111115',
    'POP UP': 'p1111111-1111-1111-1111-111111111119',
    'FUERA DE CONTEXTO': 'p1111111-1111-1111-1111-111111111116',
    'GENERACIÓN PLAY': 'p1111111-1111-1111-1111-111111111117',
    'CAFÉ PLAY': 'p1111111-1111-1111-1111-111111111111',
  },
  'Sonar FM': {
    'SONAR INFORMATIVO': 'p2222222-2222-2222-2222-222222222221',
    'RADIOTRANSMISOR': 'p2222222-2222-2222-2222-222222222222',
    'ROCK Y GUITARRAS': 'p2222222-2222-2222-2222-222222222223',
    'SONAR CLÁSICO': 'p2222222-2222-2222-2222-222222222224',
    'SONAR HÉROES': 'p2222222-2222-2222-2222-222222222225',
    'SONAR DEPORTIVO': 'p2222222-2222-2222-2222-222222222226',
    'SONAR 90S': 'p2222222-2222-2222-2222-222222222227',
    'SONAR GLOBAL': 'p2222222-2222-2222-2222-222222222228',
    'SONAR DE MOTORES': 'p2222222-2222-2222-2222-222222222229',
    'COMENTARIO': 'p2222222-2222-2222-2222-222222222226',
  },
  'Tele13 Radio': {
    'MESA CENTRAL': 'p3333333-3333-3333-3333-333333333331',
    'LO QUE MARCA LA MAÑANA': 'p3333333-3333-3333-3333-333333333332',
    'DOBLE CLICK': 'p3333333-3333-3333-3333-333333333333',
    'MERCADO GLOBAL': 'p3333333-3333-3333-3333-333333333334',
    'EL FIN DEL DINERO': 'p3333333-3333-3333-3333-333333333335',
    'LO QUE MARCA LA TARDE': 'p3333333-3333-3333-3333-333333333336',
    'CONEXIÓN TELE13': 'p3333333-3333-3333-3333-333333333337',
    'PÁGINA 13': 'p3333333-3333-3333-3333-333333333338',
    'MODO AVIÓN': 'p3333333-3333-3333-3333-333333333339',
    'MESA CENTRAL SELECCIÓN': 'p3333333-3333-3333-3333-33333333333a',
  },
  'Radio 13C': {
    'CUATRO CABEZAS': 'p4444444-4444-4444-4444-444444444441',
    'CUATRO CABEZAS GLOBAL': 'p4444444-4444-4444-4444-444444444442',
    'CADENA DE VALOR': 'p4444444-4444-4444-4444-444444444443',
    'DESPUÉS DE TODO': 'p4444444-4444-4444-4444-444444444444',
    'CORRESPONSALES': 'p4444444-4444-4444-4444-444444444445',
    'CANCIONERO': 'p4444444-4444-4444-4444-444444444446',
    'BLOQUE MUSICAL': 'p4444444-4444-4444-4444-444444444447',
  }
};

function findProgramaId(emisora, contenido) {
  if (!contenido) return null;
  const upper = contenido.toUpperCase();
  const map = contentToPrograma[emisora] || {};
  for (const key of Object.keys(map)) {
    if (upper.includes(key)) return map[key];
  }
  return null;
}

// Extract meaningful records
const allCupos = [];
const allVencimientos = [];
const allClientes = new Set();
let cupoCounter = 0;
let vencCounter = 0;

Object.keys(data.emisoras).forEach(emi => {
  const records = data.emisoras[emi];
  const emiId = emi === 'Play FM' ? '11111111-1111-1111-1111-111111111111' :
                emi === 'Sonar FM' ? '22222222-2222-2222-2222-222222222222' :
                emi === 'Tele13 Radio' ? '33333333-3333-3333-3333-333333333333' :
                '44444444-4444-4444-4444-444444444444';

  records.forEach(r => {
    const progId = findProgramaId(emi, r.contenido);
    if (!progId) return;
    
    const hasClient = r.cliente && r.cliente.length > 3 && 
                      !/^\d+$/.test(r.cliente.trim()) && 
                      !r.cliente.toUpperCase().includes('DISPONIBLE') &&
                      !r.cliente.toUpperCase().includes('SIN CUPO') &&
                      !r.cliente.toUpperCase().includes('CLIENTE');
    
    const desde = excelDateToJSDate(parseFloat(r.desde));
    const hasta = excelDateToJSDate(parseFloat(r.hasta));
    
    if (hasClient) {
      allClientes.add(r.cliente);
      cupoCounter++;
      const cupoId = `cupo-${String(cupoCounter).padStart(3, '0')}`;
      allCupos.push({
        id: cupoId,
        programaId: progId,
        emisoraId: emiId,
        clienteNombre: r.cliente.replace(/'/g, "\\'"),
        tipoAuspicio: 'tipo_a',
        estado: 'vendido',
        fechaInicio: formatDate(desde) || fecha(-30),
        fechaFin: formatDate(hasta) || fecha(30),
        valor: r.tarifaMes || 5000000
      });
      
      vencCounter++;
      const diasRest = hasta ? Math.ceil((hasta - new Date()) / (1000 * 60 * 60 * 24)) : 30;
      allVencimientos.push({
        id: `venc-${String(vencCounter).padStart(3, '0')}`,
        codigo: `VNC-${emi.substring(0,3).toUpperCase()}-${String(vencCounter).padStart(3, '0')}`,
        programaId: progId,
        programaNombre: r.contenido.replace(/'/g, "\\'").substring(0, 50),
        clienteNombre: r.cliente.replace(/'/g, "\\'"),
        fechaInicio: formatDate(desde) || fecha(-30),
        fechaVencimientos: formatDate(hasta) || fecha(30),
        nivel: diasRest < 7 ? 'rojo' : diasRest < 30 ? 'amarillo' : 'verde',
        estado: 'ACTIVO',
        diasRestantes: Math.max(0, diasRest),
        valorContrato: r.tarifaMes || 5000000,
        montoPagado: Math.floor((r.tarifaMes || 5000000) * 0.5),
        montoPendiente: Math.ceil((r.tarifaMes || 5000000) * 0.5)
      });
    }
  });
});

console.log(`Extracted ${allCupos.length} cupos with clients`);
console.log(`Extracted ${allVencimientos.length} vencimientos`);
console.log(`Unique clients: ${allClientes.size}`);
console.log('\nSample clients:', Array.from(allClientes).slice(0, 20));

// Save extracted data
fs.writeFileSync('tmp-seed/seed-data.json', JSON.stringify({ cupos: allCupos, vencimientos: allVencimientos, clientes: Array.from(allClientes) }, null, 2));
console.log('\nSaved to tmp-seed/seed-data.json');
