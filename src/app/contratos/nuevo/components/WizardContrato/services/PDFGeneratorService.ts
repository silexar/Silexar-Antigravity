/**
 * 📄 SILEXAR PULSE - PDF Generator Service TIER 0
 * 
 * @description Servicio de generación de PDFs profesionales para
 * contratos con plantillas personalizables, preview y exportación.
 * 
 * @version 2025.4.0
 * @tier TIER_0_FORTUNE_10
 */

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

export interface PlantillaPDF {
  id: string;
  nombre: string;
  codigo: string;
  tipoDocumento: 'CONTRATO' | 'ORDEN_COMPRA' | 'PROPUESTA' | 'FACTURA';
  
  // Configuración
  orientacion: 'portrait' | 'landscape';
  tamañoPapel: 'letter' | 'legal' | 'a4';
  margenes: { top: number; right: number; bottom: number; left: number };
  
  // Branding
  logoUrl?: string;
  colorPrimario: string;
  colorSecundario: string;
  
  // Secciones
  incluirLineas: boolean;
  incluirClausulas: boolean;
  incluirFirmas: boolean;
  incluirAnexos: boolean;
  incluirHistorial: boolean;
  
  esDefault: boolean;
}

export interface DatosContratoPDF {
  // Contrato
  id: string;
  numero: string;
  tipoContrato: string;
  estado: string;
  
  // Cliente
  cliente: {
    nombre: string;
    rut: string;
    direccion: string;
    contacto: string;
    email: string;
  };
  
  // Empresa
  empresa: {
    nombre: string;
    rut: string;
    direccion: string;
    logo?: string;
  };
  
  // Fechas
  fechaCreacion: string;
  fechaInicio: string;
  fechaFin: string;
  
  // Valores
  valorBruto: number;
  descuento: number;
  valorNeto: number;
  iva: number;
  valorTotal: number;
  moneda: string;
  
  // Condiciones
  terminosPago: number;
  facturacionEstilo: string;
  
  // Líneas
  lineas: LineaContratoPDF[];
  
  // Cláusulas
  clausulas: ClausulaPDF[];
  
  // Firmas
  firmas: FirmaPDF[];
  
  // Anexos
  anexos?: { nombre: string; url: string }[];
}

export interface LineaContratoPDF {
  numero: number;
  medio: string;
  programa?: string;
  descripcion: string;
  cantidad: number;
  unidad: string;
  valorUnitario: number;
  descuento: number;
  valorNeto: number;
}

export interface ClausulaPDF {
  numero: number;
  titulo: string;
  contenido: string;
  categoria: string;
}

export interface FirmaPDF {
  rol: string;
  nombre: string;
  cargo: string;
  fechaFirma?: string;
  firmado: boolean;
}

export interface OpcionesPDF {
  plantillaId?: string;
  incluirMarcaAgua?: boolean;
  marcaAguaTexto?: string;
  protegerContraseña?: boolean;
  contraseña?: string;
  calidad?: 'borrador' | 'normal' | 'alta';
}

export interface ResultadoPDF {
  exito: boolean;
  url?: string;
  base64?: string;
  nombreArchivo: string;
  tamañoBytes: number;
  paginas: number;
  error?: string;
}

// ═══════════════════════════════════════════════════════════════
// PLANTILLAS DEFAULT
// ═══════════════════════════════════════════════════════════════

const PLANTILLAS_DEFAULT: PlantillaPDF[] = [
  {
    id: 'plt-standard',
    nombre: 'Contrato Estándar',
    codigo: 'CONTRATO_STANDARD',
    tipoDocumento: 'CONTRATO',
    orientacion: 'portrait',
    tamañoPapel: 'letter',
    margenes: { top: 40, right: 40, bottom: 40, left: 40 },
    colorPrimario: '#4F46E5',
    colorSecundario: '#7C3AED',
    incluirLineas: true,
    incluirClausulas: true,
    incluirFirmas: true,
    incluirAnexos: false,
    incluirHistorial: false,
    esDefault: true
  },
  {
    id: 'plt-detallado',
    nombre: 'Contrato Detallado',
    codigo: 'CONTRATO_DETALLADO',
    tipoDocumento: 'CONTRATO',
    orientacion: 'portrait',
    tamañoPapel: 'letter',
    margenes: { top: 30, right: 30, bottom: 30, left: 30 },
    colorPrimario: '#4F46E5',
    colorSecundario: '#7C3AED',
    incluirLineas: true,
    incluirClausulas: true,
    incluirFirmas: true,
    incluirAnexos: true,
    incluirHistorial: true,
    esDefault: false
  },
  {
    id: 'plt-oc',
    nombre: 'Orden de Compra',
    codigo: 'ORDEN_COMPRA',
    tipoDocumento: 'ORDEN_COMPRA',
    orientacion: 'portrait',
    tamañoPapel: 'letter',
    margenes: { top: 40, right: 40, bottom: 40, left: 40 },
    colorPrimario: '#059669',
    colorSecundario: '#10B981',
    incluirLineas: true,
    incluirClausulas: false,
    incluirFirmas: true,
    incluirAnexos: false,
    incluirHistorial: false,
    esDefault: false
  }
];

// ═══════════════════════════════════════════════════════════════
// MOTOR DE GENERACIÓN PDF
// ═══════════════════════════════════════════════════════════════

class PDFGeneratorEngine {
  private static instance: PDFGeneratorEngine;
  private plantillas: PlantillaPDF[] = PLANTILLAS_DEFAULT;

  private constructor() {}

  static getInstance(): PDFGeneratorEngine {
    if (!this.instance) {
      this.instance = new PDFGeneratorEngine();
    }
    return this.instance;
  }

  /**
   * Genera el HTML del contrato para preview o PDF
   */
  generarHTML(datos: DatosContratoPDF, plantilla: PlantillaPDF): string {
    return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <style>
    @page {
      size: ${plantilla.tamañoPapel} ${plantilla.orientacion};
      margin: ${plantilla.margenes.top}px ${plantilla.margenes.right}px ${plantilla.margenes.bottom}px ${plantilla.margenes.left}px;
    }
    
    * { box-sizing: border-box; margin: 0; padding: 0; }
    
    body {
      font-family: 'Helvetica Neue', Arial, sans-serif;
      font-size: 11px;
      line-height: 1.5;
      color: #1e293b;
    }
    
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 20px;
      border-bottom: 3px solid ${plantilla.colorPrimario};
      margin-bottom: 30px;
    }
    
    .logo { height: 60px; }
    
    .header-info { text-align: right; }
    
    .doc-title {
      font-size: 24px;
      font-weight: bold;
      color: ${plantilla.colorPrimario};
    }
    
    .doc-number {
      font-size: 14px;
      color: #64748b;
    }
    
    .section {
      margin-bottom: 25px;
    }
    
    .section-title {
      font-size: 14px;
      font-weight: bold;
      color: ${plantilla.colorPrimario};
      border-bottom: 2px solid ${plantilla.colorSecundario};
      padding-bottom: 5px;
      margin-bottom: 15px;
    }
    
    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 30px;
    }
    
    .info-box {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 15px;
    }
    
    .info-box h4 {
      font-size: 12px;
      color: ${plantilla.colorPrimario};
      margin-bottom: 10px;
    }
    
    .info-row {
      display: flex;
      justify-content: space-between;
      padding: 3px 0;
    }
    
    .info-label { color: #64748b; }
    .info-value { font-weight: 500; }
    
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
    }
    
    th, td {
      padding: 10px 8px;
      text-align: left;
      border-bottom: 1px solid #e2e8f0;
    }
    
    th {
      background: ${plantilla.colorPrimario};
      color: white;
      font-weight: 600;
      font-size: 10px;
      text-transform: uppercase;
    }
    
    tr:nth-child(even) { background: #f8fafc; }
    
    .totals-box {
      background: linear-gradient(135deg, ${plantilla.colorPrimario}, ${plantilla.colorSecundario});
      color: white;
      padding: 20px;
      border-radius: 12px;
      margin-top: 20px;
    }
    
    .total-row {
      display: flex;
      justify-content: space-between;
      padding: 5px 0;
    }
    
    .total-final {
      font-size: 18px;
      font-weight: bold;
      border-top: 2px solid rgba(255,255,255,0.3);
      margin-top: 10px;
      padding-top: 10px;
    }
    
    .clausula {
      margin-bottom: 15px;
      padding: 12px;
      background: #f8fafc;
      border-left: 3px solid ${plantilla.colorSecundario};
    }
    
    .clausula-titulo {
      font-weight: bold;
      color: ${plantilla.colorPrimario};
      margin-bottom: 5px;
    }
    
    .firmas-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 40px;
      margin-top: 50px;
    }
    
    .firma-box {
      text-align: center;
      padding-top: 60px;
      border-top: 2px solid #1e293b;
    }
    
    .firma-nombre { font-weight: bold; }
    .firma-cargo { color: #64748b; font-size: 10px; }
    
    .footer {
      position: fixed;
      bottom: 20px;
      left: 0;
      right: 0;
      text-align: center;
      font-size: 9px;
      color: #94a3b8;
    }
    
    .page-number::after {
      content: counter(page);
    }
  </style>
</head>
<body>
  <!-- Header -->
  <div class="header">
    <div>
      ${datos.empresa.logo ? `<img src="${datos.empresa.logo}" class="logo" />` : `<div class="doc-title">${datos.empresa.nombre}</div>`}
    </div>
    <div class="header-info">
      <div class="doc-title">${datos.tipoContrato}</div>
      <div class="doc-number">${datos.numero}</div>
      <div style="color:#64748b; margin-top:5px;">Fecha: ${datos.fechaCreacion}</div>
    </div>
  </div>

  <!-- Partes -->
  <div class="section">
    <div class="section-title">Información de las Partes</div>
    <div class="grid-2">
      <div class="info-box">
        <h4>📢 Empresa</h4>
        <div class="info-row"><span class="info-label">Razón Social:</span><span class="info-value">${datos.empresa.nombre}</span></div>
        <div class="info-row"><span class="info-label">RUT:</span><span class="info-value">${datos.empresa.rut}</span></div>
        <div class="info-row"><span class="info-label">Dirección:</span><span class="info-value">${datos.empresa.direccion}</span></div>
      </div>
      <div class="info-box">
        <h4>🏢 Cliente / Anunciante</h4>
        <div class="info-row"><span class="info-label">Razón Social:</span><span class="info-value">${datos.cliente.nombre}</span></div>
        <div class="info-row"><span class="info-label">RUT:</span><span class="info-value">${datos.cliente.rut}</span></div>
        <div class="info-row"><span class="info-label">Contacto:</span><span class="info-value">${datos.cliente.contacto}</span></div>
        <div class="info-row"><span class="info-label">Email:</span><span class="info-value">${datos.cliente.email}</span></div>
      </div>
    </div>
  </div>

  <!-- Vigencia -->
  <div class="section">
    <div class="section-title">Vigencia del Contrato</div>
    <div class="info-box">
      <div class="grid-2">
        <div class="info-row"><span class="info-label">Fecha Inicio:</span><span class="info-value">${datos.fechaInicio}</span></div>
        <div class="info-row"><span class="info-label">Fecha Término:</span><span class="info-value">${datos.fechaFin}</span></div>
        <div class="info-row"><span class="info-label">Términos de Pago:</span><span class="info-value">${datos.terminosPago} días</span></div>
        <div class="info-row"><span class="info-label">Facturación:</span><span class="info-value">${datos.facturacionEstilo}</span></div>
      </div>
    </div>
  </div>

  ${plantilla.incluirLineas ? `
  <!-- Líneas -->
  <div class="section">
    <div class="section-title">Especificaciones de Pauta</div>
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Medio</th>
          <th>Programa/Descripción</th>
          <th>Cantidad</th>
          <th>Valor Unit.</th>
          <th>Dto %</th>
          <th>Valor Neto</th>
        </tr>
      </thead>
      <tbody>
        ${datos.lineas.map(l => `
        <tr>
          <td>${l.numero}</td>
          <td>${l.medio}</td>
          <td>${l.programa || l.descripcion}</td>
          <td>${l.cantidad} ${l.unidad}</td>
          <td>$${l.valorUnitario.toLocaleString('es-CL')}</td>
          <td>${l.descuento}%</td>
          <td style="font-weight:bold">$${l.valorNeto.toLocaleString('es-CL')}</td>
        </tr>
        `).join('')}
      </tbody>
    </table>
    
    <div style="width: 300px; margin-left: auto;">
      <div class="totals-box">
        <div class="total-row"><span>Valor Bruto:</span><span>$${datos.valorBruto.toLocaleString('es-CL')}</span></div>
        <div class="total-row"><span>Descuento (${datos.descuento}%):</span><span>-$${Math.round(datos.valorBruto * datos.descuento / 100).toLocaleString('es-CL')}</span></div>
        <div class="total-row"><span>Subtotal Neto:</span><span>$${datos.valorNeto.toLocaleString('es-CL')}</span></div>
        <div class="total-row"><span>IVA (19%):</span><span>$${datos.iva.toLocaleString('es-CL')}</span></div>
        <div class="total-row total-final"><span>TOTAL ${datos.moneda}:</span><span>$${datos.valorTotal.toLocaleString('es-CL')}</span></div>
      </div>
    </div>
  </div>
  ` : ''}

  ${plantilla.incluirClausulas && datos.clausulas.length > 0 ? `
  <!-- Cláusulas -->
  <div class="section" style="page-break-before: always;">
    <div class="section-title">Cláusulas del Contrato</div>
    ${datos.clausulas.map(c => `
    <div class="clausula">
      <div class="clausula-titulo">${c.numero}. ${c.titulo}</div>
      <div>${c.contenido}</div>
    </div>
    `).join('')}
  </div>
  ` : ''}

  ${plantilla.incluirFirmas ? `
  <!-- Firmas -->
  <div class="section" style="page-break-inside: avoid;">
    <div class="section-title">Firmas Autorizadas</div>
    <div class="firmas-grid">
      ${datos.firmas.map(f => `
      <div class="firma-box">
        <div class="firma-nombre">${f.nombre}</div>
        <div class="firma-cargo">${f.cargo}</div>
        <div style="color:#64748b; font-size:9px; margin-top:5px;">${f.rol}${f.fechaFirma ? ` • Firmado: ${f.fechaFirma}` : ''}</div>
      </div>
      `).join('')}
    </div>
  </div>
  ` : ''}

  <div class="footer">
    Documento generado por Silexar Pulse • ${new Date().toLocaleString('es-CL')} • Página <span class="page-number"></span>
  </div>
</body>
</html>
    `;
  }

  /**
   * Genera PDF del contrato
   */
  async generarPDF(
    datos: DatosContratoPDF,
    opciones: OpcionesPDF = {}
  ): Promise<ResultadoPDF> {
    try {
      const plantilla = opciones.plantillaId 
        ? this.plantillas.find(p => p.id === opciones.plantillaId) 
        : this.plantillas.find(p => p.esDefault);

      if (!plantilla) {
        return { exito: false, error: 'Plantilla no encontrada', nombreArchivo: '', tamañoBytes: 0, paginas: 0 };
      }

      const html = this.generarHTML(datos, plantilla);
      
      // En producción, aquí iría la generación real con puppeteer/jsPDF
      // Por ahora retornamos mock
      const nombreArchivo = `${datos.numero.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
      
      return {
        exito: true,
        url: `/api/contratos/${datos.id}/pdf`,
        nombreArchivo,
        tamañoBytes: 256000,
        paginas: 3
      };
    } catch (error) {
      return {
        exito: false,
        error: `Error generando PDF: ${error}`,
        nombreArchivo: '',
        tamañoBytes: 0,
        paginas: 0
      };
    }
  }

  /**
   * Genera preview HTML para mostrar en modal
   */
  generarPreview(datos: DatosContratoPDF, plantillaId?: string): string {
    const plantilla = plantillaId 
      ? this.plantillas.find(p => p.id === plantillaId) 
      : this.plantillas.find(p => p.esDefault);

    if (!plantilla) return '<p>Error: Plantilla no encontrada</p>';
    
    return this.generarHTML(datos, plantilla);
  }

  /**
   * Obtiene plantillas disponibles
   */
  getPlantillas(): PlantillaPDF[] {
    return [...this.plantillas];
  }

  /**
   * Obtiene plantilla por código
   */
  getPlantillaPorCodigo(codigo: string): PlantillaPDF | undefined {
    return this.plantillas.find(p => p.codigo === codigo);
  }
}

// ═══════════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════════

export const PDFGenerator = PDFGeneratorEngine.getInstance();

export function usePDFGenerator() {
  return PDFGenerator;
}
