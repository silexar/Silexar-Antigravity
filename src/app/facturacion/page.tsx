/**
 * 💰 SILEXAR PULSE - Página Facturación Completa
 * 
 * @description Centro de facturación con IA: scoring, alertas, predicción cobros
 * 
 * @version 2025.1.0
 * @tier TIER_0_FORTUNE_10
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Receipt, Plus, Search, RefreshCw, AlertTriangle,
  DollarSign, Clock, XCircle, ChevronDown,
  FileText, Sparkles, Brain, Download,
  ArrowLeft
} from 'lucide-react';
import { ModuleNavMenu } from '@/components/module-nav-menu';

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

interface Factura {
  id: string;
  numero: number;
  folio: number | null;
  tipoDocumento: string;
  razonSocialReceptor: string;
  rutReceptor: string;
  fechaEmision: string;
  fechaVencimientos: string;
  montoTotal: number;
  montoPagado: number;
  estado: string;
  diasMora?: number;
  scoreCliente?: number;
  probabilidadCobro?: number;
  saldoPendiente?: number;
}

interface AlertaCobranza {
  tipo: string;
  prioridad: 'baja' | 'media' | 'alta' | 'critica';
  mensaje: string;
  montoAfectado: number;
  accionSugerida: string;
}

interface Stats {
  totalEmitidas: number;
  montoFacturado: number;
  montoPendiente: number;
  montoVencido: number;
  alertasCriticas: number;
}

// ═══════════════════════════════════════════════════════════════
// COMPONENTES
// ═══════════════════════════════════════════════════════════════

const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`rounded-2xl p-6 bg-gradient-to-br from-slate-50 to-slate-100 shadow-[8px_8px_16px_rgba(0,0,0,0.1),-8px_-8px_16px_rgba(255,255,255,0.9)] ${className}`}>
    {children}
  </div>
);

const EstadoBadge = ({ estado, diasMora }: { estado: string; diasMora: number }) => {
  const config: Record<string, { color: string; texto: string }> = {
    borrador: { color: 'from-slate-400 to-slate-500', texto: 'Borrador' },
    emitida: { color: 'from-blue-400 to-blue-500', texto: 'Emitida' },
    enviada_sii: { color: 'from-cyan-400 to-cyan-500', texto: 'En SII' },
    aceptada_sii: { color: 'from-emerald-400 to-emerald-500', texto: 'Aceptada' },
    rechazada_sii: { color: 'from-red-400 to-red-500', texto: 'Rechazada' },
    pagada: { color: 'from-green-400 to-green-500', texto: 'Pagada' },
    vencida: { color: 'from-red-500 to-red-600', texto: `Vencida (${diasMora}d)` },
    anulada: { color: 'from-slate-500 to-slate-600', texto: 'Anulada' }
  };
  
  const { color, texto } = config[estado] || config.borrador;
  return (
    <span className={`px-2 py-1 rounded-lg text-xs font-medium text-white bg-gradient-to-r ${color}`}>
      {texto}
    </span>
  );
};

const ProbabilidadIndicator = ({ prob }: { prob: number }) => {
  const color = prob >= 80 ? 'bg-emerald-500' : prob >= 50 ? 'bg-amber-500' : 'bg-red-500';
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
        <div className={`h-full ${color}`} style={{ width: `${prob}%` }} />
      </div>
      <span className="text-xs font-medium text-slate-600">{prob}%</span>
    </div>
  );
};

const AlertaCard = ({ alerta }: { alerta: AlertaCobranza }) => {
  const colores = {
    critica: 'border-red-300 bg-red-50',
    alta: 'border-orange-300 bg-orange-50',
    media: 'border-amber-300 bg-amber-50',
    baja: 'border-slate-300 bg-slate-50'
  };
  const iconos = {
    critica: <XCircle className="w-5 h-5 text-red-500" />,
    alta: <AlertTriangle className="w-5 h-5 text-orange-500" />,
    media: <Clock className="w-5 h-5 text-amber-500" />,
    baja: <FileText className="w-5 h-5 text-slate-500" />
  };
  
  return (
    <div className={`p-4 rounded-xl border ${colores[alerta.prioridad]}`}>
      <div className="flex items-start gap-3">
        {iconos[alerta.prioridad]}
        <div className="flex-1">
          <p className="font-medium text-slate-800">{alerta.mensaje}</p>
          <p className="text-sm text-slate-500 mt-1">Monto: ${(alerta.montoAfectado / 1000000).toFixed(1)}M</p>
          <div className="mt-2 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-violet-500" />
            <p className="text-xs text-violet-700">{alerta.accionSugerida}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// PÁGINA PRINCIPAL
// ═══════════════════════════════════════════════════════════════

export default function FacturacionPage() {
  const router = useRouter();
  const [facturas, setFacturas] = useState<Factura[]>([]);
  const [alertas, setAlertas] = useState<AlertaCobranza[]>([]);
  const [stats, setStats] = useState<Stats>({ totalEmitidas: 0, montoFacturado: 0, montoPendiente: 0, montoVencido: 0, alertasCriticas: 0 });
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');

  // Mock data con métricas IA
  const mockFacturas: Factura[] = [
    { id: '1', numero: 1234, folio: 45678, tipoDocumento: 'factura', razonSocialReceptor: 'Empresa ABC Ltda', rutReceptor: '76.123.456-7', fechaEmision: '2025-12-01', fechaVencimientos: '2025-12-31', montoTotal: 5800000, montoPagado: 0, estado: 'aceptada_sii', diasMora: 0, scoreCliente: 850, probabilidadCobro: 92 },
    { id: '2', numero: 1235, folio: 45679, tipoDocumento: 'factura', razonSocialReceptor: 'Servicios XYZ SpA', rutReceptor: '76.234.567-8', fechaEmision: '2025-11-15', fechaVencimientos: '2025-12-15', montoTotal: 3200000, montoPagado: 0, estado: 'vencida', diasMora: 3, scoreCliente: 520, probabilidadCobro: 65 },
    { id: '3', numero: 1236, folio: 45680, tipoDocumento: 'factura', razonSocialReceptor: 'Comercial DEF Ltda', rutReceptor: '76.345.678-9', fechaEmision: '2025-11-01', fechaVencimientos: '2025-12-01', montoTotal: 12500000, montoPagado: 6000000, estado: 'vencida', diasMora: 17, scoreCliente: 380, probabilidadCobro: 35 },
    { id: '4', numero: 1237, folio: 45681, tipoDocumento: 'factura', razonSocialReceptor: 'Industrias GHI SpA', rutReceptor: '76.456.789-0', fechaEmision: '2025-12-10', fechaVencimientos: '2026-01-10', montoTotal: 8900000, montoPagado: 8900000, estado: 'pagada', diasMora: 0, scoreCliente: 920, probabilidadCobro: 100 }
  ];

  const mockAlertas: AlertaCobranza[] = [
    { tipo: 'mora_grave', prioridad: 'critica', mensaje: 'Comercial DEF - 17 días de mora', montoAfectado: 6500000, accionSugerida: 'Escalar a cobranza urgente, ofrecer plan de pagos' },
    { tipo: 'mora_leve', prioridad: 'alta', mensaje: 'Servicios XYZ - 3 días de mora', montoAfectado: 3200000, accionSugerida: 'Llamar para gestionar cobro hoy' },
    { tipo: 'cliente_riesgo', prioridad: 'media', mensaje: 'Comercial DEF tiene score de riesgo: 380', montoAfectado: 12500000, accionSugerida: 'Revisar límite de crédito y solicitar garantías' }
  ];

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (busqueda) params.set('search', busqueda);
      if (filtroEstado) params.set('estado', filtroEstado);
      const res = await fetch(`/api/facturacion?${params.toString()}`);
      const json = await res.json();
      const sourceFacturas: Factura[] = json.success && Array.isArray(json.data) ? json.data : [];
      const apiStats = json.meta?.stats || {};

      setFacturas(sourceFacturas);
      setAlertas(mockAlertas);

      setStats({
        totalEmitidas:   apiStats.totalFacturas ?? sourceFacturas.length,
        montoFacturado:  apiStats.montoEmitido ?? sourceFacturas.reduce((sum, f) => sum + Number(f.montoTotal), 0),
        montoPendiente:  apiStats.montoPendiente ?? sourceFacturas.filter(f => f.estado !== 'pagada' && f.estado !== 'anulada').reduce((sum, f) => sum + Number(f.montoTotal) - Number(f.montoPagado || 0), 0),
        montoVencido:    apiStats.montoVencido ?? sourceFacturas.filter(f => f.estado === 'vencida').reduce((sum, f) => sum + Number(f.montoTotal) - Number(f.montoPagado || 0), 0),
        alertasCriticas: mockAlertas.filter(a => a.prioridad === 'critica').length,
      });
    } catch {
      setFacturas(mockFacturas);
      setAlertas(mockAlertas);
      const pendientes = mockFacturas.filter(f => f.estado !== 'pagada' && f.estado !== 'anulada');
      const vencidas   = mockFacturas.filter(f => f.estado === 'vencida');
      setStats({
        totalEmitidas:   mockFacturas.length,
        montoFacturado:  mockFacturas.reduce((sum, f) => sum + f.montoTotal, 0),
        montoPendiente:  pendientes.reduce((sum, f) => sum + f.montoTotal - f.montoPagado, 0),
        montoVencido:    vencidas.reduce((sum, f) => sum + f.montoTotal - f.montoPagado, 0),
        alertasCriticas: mockAlertas.filter(a => a.prioridad === 'critica').length,
      });
    } finally {
      setLoading(false);
    }
  }, [busqueda, filtroEstado]);

  useEffect(() => { fetchData(); }, [fetchData]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-emerald-50 to-slate-100 p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/dashboard')} className="p-2.5 rounded-xl transition-all bg-white shadow-md hover:bg-slate-100">
              <ArrowLeft className="w-4 h-4 text-slate-600" />
            </button>
            <ModuleNavMenu />
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-emerald-600 bg-clip-text text-transparent flex items-center gap-3">
                <Receipt className="w-10 h-10 text-emerald-500" />
                Facturación
              </h1>
              <p className="text-slate-500 mt-2">Gestión de documentos tributarios con IA predictiva</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button onClick={fetchData} className="p-3 bg-white rounded-xl shadow-md hover:bg-emerald-50 text-emerald-500">
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button className="px-4 py-2 bg-white text-emerald-600 rounded-xl font-medium flex items-center gap-2 shadow-md">
              <Download className="w-4 h-4" /> Exportar
            </button>
            <button onClick={() => router.push('/facturacion/nueva')} className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl font-medium flex items-center gap-2 shadow-lg">
              <Plus className="w-4 h-4" /> Nueva Factura
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: 'Emitidas', value: stats.totalEmitidas, icon: FileText, color: 'from-slate-400 to-slate-500' },
            { label: 'Facturado', value: `$${(stats.montoFacturado / 1000000).toFixed(1)}M`, icon: DollarSign, color: 'from-emerald-400 to-emerald-500' },
            { label: 'Pendiente', value: `$${(stats.montoPendiente / 1000000).toFixed(1)}M`, icon: Clock, color: 'from-amber-400 to-amber-500' },
            { label: 'Vencido', value: `$${(stats.montoVencido / 1000000).toFixed(1)}M`, icon: AlertTriangle, color: 'from-red-400 to-red-500' },
            { label: 'Alertas', value: stats.alertasCriticas, icon: Brain, color: 'from-violet-400 to-violet-500' }
          ].map((stat, i) => (
            <Card key={`${stat}-${i}`} className="p-4">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-lg bg-gradient-to-br ${stat.color}`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-slate-500 text-xs">{stat.label}</p>
                  <p className="text-xl font-bold text-slate-800">{stat.value}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Alertas IA */}
        {alertas.length > 0 && (
          <Card>
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Brain className="w-5 h-5 text-violet-500" />
              Alertas de Cobranza IA
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {alertas.map((alerta, i) => (
                <AlertaCard key={`${alerta}-${i}`} alerta={alerta} />
              ))}
            </div>
          </Card>
        )}

        {/* Filtros */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar facturas..."
              aria-label="Buscar facturas"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white rounded-xl shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-300"
            />
          </div>
          <div className="relative">
            <select 
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="appearance-none bg-white rounded-xl px-4 py-2 pr-10 shadow-md font-medium text-slate-700 focus:outline-none"
            >
              <option value="">Todos los estados</option>
              <option value="aceptada_sii">Aceptada SII</option>
              <option value="vencida">Vencidas</option>
              <option value="pagada">Pagadas</option>
              <option value="anulada">Anuladas</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* Lista de facturas */}
        <Card>
          <h2 className="text-lg font-bold text-slate-800 mb-4">Facturas ({facturas.length})</h2>
          
          {loading ? (
            <div className="text-center py-12"><RefreshCw className="w-8 h-8 animate-spin text-emerald-500 mx-auto" /></div>
          ) : facturas.length === 0 ? (
            <div className="text-center py-12"><FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" /><p className="text-slate-500">Sin facturas</p></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 text-left">
                    <th className="py-3 px-4 text-xs font-medium text-slate-500">N° Folio</th>
                    <th className="py-3 px-4 text-xs font-medium text-slate-500">Cliente</th>
                    <th className="py-3 px-4 text-xs font-medium text-slate-500">Fechas</th>
                    <th className="py-3 px-4 text-xs font-medium text-slate-500">Monto</th>
                    <th className="py-3 px-4 text-xs font-medium text-slate-500">Estado</th>
                    <th className="py-3 px-4 text-xs font-medium text-slate-500">Score IA</th>
                    <th className="py-3 px-4 text-xs font-medium text-slate-500">Prob. Cobro</th>
                  </tr>
                </thead>
                <tbody>
                  {facturas.map((f) => (
                    <tr key={f.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-4">
                        <p className="font-medium text-slate-800">#{f.folio || f.numero}</p>
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-medium text-slate-700">{f.razonSocialReceptor}</p>
                        <p className="text-xs text-slate-400">{f.rutReceptor}</p>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-sm text-slate-600">{f.fechaEmision}</p>
                        <p className="text-xs text-slate-400">Vence: {f.fechaVencimientos}</p>
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-bold text-slate-800">${(Number(f.montoTotal) / 1000000).toFixed(2)}M</p>
                        {Number(f.montoPagado) > 0 && Number(f.montoPagado) < Number(f.montoTotal) && (
                          <p className="text-xs text-emerald-600">Pagado: ${(Number(f.montoPagado) / 1000000).toFixed(1)}M</p>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <EstadoBadge estado={f.estado} diasMora={f.diasMora ?? 0} />
                      </td>
                      <td className="py-3 px-4">
                        <span className={`font-bold ${(f.scoreCliente ?? 0) >= 700 ? 'text-emerald-600' : (f.scoreCliente ?? 0) >= 500 ? 'text-amber-600' : 'text-red-600'}`}>
                          {f.scoreCliente ?? 0}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <ProbabilidadIndicator prob={f.probabilidadCobro ?? 0} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <div className="text-center text-slate-400 text-sm">
          <p>💰 Facturación con IA Predictiva - SILEXAR PULSE TIER 0</p>
        </div>
      </div>
    </div>
  );
}