/**
 * 🧾 SILEXAR PULSE - Página Facturación Campaña
 * 
 * @description Integración facturación con gestión automática SII
 * @version 2030.0.0
 * @tier TIER_0_FORTUNE_10
 */

'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { 
  FileText, DollarSign, Calendar, Download,
  CheckCircle, Clock, AlertTriangle, CreditCard, Mail,
  Building, Sparkles, RefreshCw, Eye
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// DATOS MOCK
// ═══════════════════════════════════════════════════════════════

const facturacionCampana = {
  campanaId: 'CMP-25-001',
  campanaNombre: 'Promoción Navidad Premium 2025',
  anunciante: 'BANCO DE CHILE',
  rut: '97.004.000-5',
  
  configuracion: {
    estiloFacturacion: 'posterior', // posterior, inmediata, intercambio
    facturacionPor: 'mensual', // mensual, global, por_linea
    diasPago: 30,
    codigoFiscal: 19,
    direccion: 'anunciante', // anunciante, libre
    numeroDeudor: 1234,
    esCooperativa: false
  },
  
  facturas: [
    { 
      id: 'FAC-001',
      numero: 'F-2025-00145',
      estado: 'emitida',
      fechaEmision: '2025-12-01',
      fechaVencimiento: '2025-12-31',
      periodo: '01-15 Dic 2025',
      montoNeto: 1200000,
      iva: 228000,
      total: 1428000,
      siiStatus: 'aceptado'
    },
    { 
      id: 'FAC-002',
      numero: 'F-2025-00189',
      estado: 'pendiente',
      fechaEmision: '2025-12-16',
      fechaVencimiento: '2026-01-15',
      periodo: '16-31 Dic 2025',
      montoNeto: 1100000,
      iva: 209000,
      total: 1309000,
      siiStatus: 'pendiente'
    }
  ],
  
  resumen: {
    totalFacturado: 2737000,
    pendientePago: 1309000,
    diasPromedioCobranza: 28,
    morosidad: 0
  },
  
  prediccionIA: {
    fechaPagoEstimada: '2025-12-28',
    probabilidadPagoATiempo: 95,
    riesgoMorosidad: 'bajo',
    recomendacion: 'Cliente puntual, mantener condiciones actuales'
  }
};

// ═══════════════════════════════════════════════════════════════
// COMPONENTES
// ═══════════════════════════════════════════════════════════════

const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`rounded-2xl p-6 bg-gradient-to-br from-slate-50 to-slate-100 shadow-[8px_8px_16px_rgba(0,0,0,0.1),-8px_-8px_16px_rgba(255,255,255,0.9)] ${className}`}>
    {children}
  </div>
);

const formatCurrency = (value: number) => `$${value.toLocaleString('es-CL')}`;

const EstadoBadge = ({ estado }: { estado: string }) => {
  const config: Record<string, { bg: string; icon: React.ElementType }> = {
    emitida: { bg: 'from-blue-400 to-blue-500', icon: CheckCircle },
    pendiente: { bg: 'from-amber-400 to-amber-500', icon: Clock },
    pagada: { bg: 'from-emerald-400 to-emerald-500', icon: CheckCircle },
    vencida: { bg: 'from-red-400 to-red-500', icon: AlertTriangle },
    anulada: { bg: 'from-slate-400 to-slate-500', icon: AlertTriangle }
  };
  const { bg, icon: Icon } = config[estado] || config.pendiente;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium text-white bg-gradient-to-r ${bg}`}>
      <Icon className="w-3 h-3" />
      {estado.charAt(0).toUpperCase() + estado.slice(1)}
    </span>
  );
};

const SIIBadge = ({ status }: { status: string }) => {
  if (status === 'aceptado') return <span className="text-emerald-600 text-xs font-medium">✅ SII OK</span>;
  if (status === 'rechazado') return <span className="text-red-600 text-xs font-medium">❌ SII Rechazado</span>;
  return <span className="text-amber-600 text-xs font-medium">⏳ Pendiente SII</span>;
};

// ═══════════════════════════════════════════════════════════════
// PÁGINA
// ═══════════════════════════════════════════════════════════════

export default function FacturacionCampanaPage() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _params = useParams();
  const [estiloFacturacion, setEstiloFacturacion] = useState(facturacionCampana.configuracion.estiloFacturacion);
  const [facturacionPor, setFacturacionPor] = useState(facturacionCampana.configuracion.facturacionPor);
  const [creandoFactura, setCreandoFactura] = useState(false);

  const crearFactura = async () => {
    setCreandoFactura(true);
    await new Promise(r => setTimeout(r, 2000));
    setCreandoFactura(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-slate-100 p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-blue-600 bg-clip-text text-transparent flex items-center gap-3">
              <FileText className="w-10 h-10 text-blue-500" />
              Facturación de Campaña
            </h1>
            <p className="text-slate-500 mt-2">{facturacionCampana.campanaNombre} • {facturacionCampana.anunciante}</p>
          </div>
          
          <button
            onClick={crearFactura}
            disabled={creandoFactura}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-medium flex items-center gap-2 shadow-lg"
          >
            {creandoFactura ? <RefreshCw className="w-5 h-5 animate-spin" /> : <FileText className="w-5 h-5" />}
            Crear Factura
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-400 to-blue-500">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-slate-500 text-xs">Total Facturado</p>
                <p className="text-xl font-bold text-slate-800">{formatCurrency(facturacionCampana.resumen.totalFacturado)}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-amber-400 to-amber-500">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-slate-500 text-xs">Pendiente Pago</p>
                <p className="text-xl font-bold text-slate-800">{formatCurrency(facturacionCampana.resumen.pendientePago)}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-500">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-slate-500 text-xs">Días Promedio Cobro</p>
                <p className="text-xl font-bold text-slate-800">{facturacionCampana.resumen.diasPromedioCobranza}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 bg-gradient-to-br from-purple-50 to-pink-50">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-purple-400 to-purple-500">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-slate-500 text-xs">Predicción IA</p>
                <p className="text-lg font-bold text-purple-700">{facturacionCampana.prediccionIA.probabilidadPagoATiempo}% a tiempo</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Configuración */}
          <Card>
            <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
              <CreditCard className="w-5 h-5 text-blue-500" />
              Opciones de Facturación
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm text-slate-600 mb-2 block">Estilo de Facturación</label>
                <select
                  value={estiloFacturacion}
                  onChange={(e) => setEstiloFacturacion(e.target.value)}
                  className="w-full p-3 rounded-xl bg-white border border-slate-200"
                >
                  <option value="posterior">Factura a Posteriori</option>
                  <option value="inmediata">Factura Inmediata</option>
                  <option value="intercambio">Intercambio (Canje)</option>
                </select>
              </div>
              
              <div>
                <label className="text-sm text-slate-600 mb-2 block">Facturación Por</label>
                <select
                  value={facturacionPor}
                  onChange={(e) => setFacturacionPor(e.target.value)}
                  className="w-full p-3 rounded-xl bg-white border border-slate-200"
                >
                  <option value="mensual">Una línea por mes</option>
                  <option value="global">Global por campaña</option>
                  <option value="por_linea">Por línea específica</option>
                </select>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-600">Días de Pago</span>
                  <span className="font-medium">{facturacionCampana.configuracion.diasPago} días</span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-600">IVA</span>
                  <span className="font-medium">{facturacionCampana.configuracion.codigoFiscal}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">N° Deudor</span>
                  <span className="font-medium">{facturacionCampana.configuracion.numeroDeudor}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Datos cliente */}
          <Card>
            <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
              <Building className="w-5 h-5 text-blue-500" />
              Datos del Cliente
            </h3>
            <div className="space-y-3">
              <div className="p-3 bg-slate-50 rounded-xl">
                <p className="text-xs text-slate-500">Razón Social</p>
                <p className="font-medium text-slate-800">{facturacionCampana.anunciante}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <p className="text-xs text-slate-500">RUT</p>
                <p className="font-medium text-slate-800">{facturacionCampana.rut}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <p className="text-xs text-slate-500">Dirección Facturación</p>
                <p className="font-medium text-slate-800 capitalize">{facturacionCampana.configuracion.direccion}</p>
              </div>
            </div>
          </Card>

          {/* Predicción IA */}
          <Card className="bg-gradient-to-br from-purple-50 to-pink-50">
            <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-purple-500" />
              Análisis IA Cobranza
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-600">Fecha Pago Estimada</span>
                <span className="font-bold text-purple-700">{facturacionCampana.prediccionIA.fechaPagoEstimada}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Prob. Pago a Tiempo</span>
                <span className="font-bold text-emerald-600">{facturacionCampana.prediccionIA.probabilidadPagoATiempo}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Riesgo Morosidad</span>
                <span className={`font-bold ${facturacionCampana.prediccionIA.riesgoMorosidad === 'bajo' ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {facturacionCampana.prediccionIA.riesgoMorosidad.toUpperCase()}
                </span>
              </div>
              <div className="p-3 bg-white/50 rounded-lg mt-2">
                <p className="text-sm text-purple-700">{facturacionCampana.prediccionIA.recomendacion}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Lista de facturas */}
        <Card>
          <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-blue-500" />
            Facturas Generadas
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 text-left text-sm text-slate-500">
                  <th className="py-3 px-4">N° Factura</th>
                  <th className="py-3 px-4">Estado</th>
                  <th className="py-3 px-4">Período</th>
                  <th className="py-3 px-4">Emisión</th>
                  <th className="py-3 px-4">Vencimiento</th>
                  <th className="py-3 px-4">Neto</th>
                  <th className="py-3 px-4">Total</th>
                  <th className="py-3 px-4">SII</th>
                  <th className="py-3 px-4">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {facturacionCampana.facturas.map((f) => (
                  <tr key={f.id} className="border-b border-slate-100">
                    <td className="py-3 px-4 font-mono font-medium text-blue-600">{f.numero}</td>
                    <td className="py-3 px-4"><EstadoBadge estado={f.estado} /></td>
                    <td className="py-3 px-4 text-slate-600">{f.periodo}</td>
                    <td className="py-3 px-4 text-slate-600">{f.fechaEmision}</td>
                    <td className="py-3 px-4 text-slate-600">{f.fechaVencimiento}</td>
                    <td className="py-3 px-4 text-slate-700">{formatCurrency(f.montoNeto)}</td>
                    <td className="py-3 px-4 font-bold text-slate-800">{formatCurrency(f.total)}</td>
                    <td className="py-3 px-4"><SIIBadge status={f.siiStatus} /></td>
                    <td className="py-3 px-4">
                      <div className="flex gap-1">
                        <button aria-label="Ver" className="p-2 rounded-lg hover:bg-blue-50 text-blue-500"><Eye className="w-4 h-4" /></button>
                        <button aria-label="Descargar" className="p-2 rounded-lg hover:bg-emerald-50 text-emerald-500"><Download className="w-4 h-4" /></button>
                        <button aria-label="Enviar por correo" className="p-2 rounded-lg hover:bg-purple-50 text-purple-500"><Mail className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="text-center text-slate-400 text-sm">
          <p>🧾 Facturación Campaña - SILEXAR PULSE TIER 0</p>
        </div>
      </div>
    </div>
  );
}
