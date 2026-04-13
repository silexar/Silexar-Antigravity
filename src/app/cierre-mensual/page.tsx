/**
 * 📊 SILEXAR PULSE - Página Cierre Mensual
 * 
 * @description Panel de gestión de cierres mensuales con validaciones
 * 
 * @version 2025.1.0
 * @tier TIER_0_FORTUNE_10
 */

'use client';

import { useState, useEffect } from 'react';
import { 
  Calendar, Lock, Unlock, CheckCircle, XCircle, AlertTriangle,
  RefreshCw, FileText, Download, Clock, TrendingUp, DollarSign
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

interface ResumenPeriodo {
  periodo: string;
  estado: 'abierto' | 'pre_cierre' | 'cerrado';
  ventasNetas: number;
  totalFacturado: number;
  pendienteFacturar: number;
  campanasVendidas: number;
  campanasBonificadas: number;
  campanasSinValor: number;
  errores: { mensaje: string; entidadId: string }[];
}

interface CampanaValidacion {
  id: string;
  codigo: string;
  nombre: string;
  cliente: string;
  valor: number;
  esBonificada: boolean;
  esBeneficencia: boolean;
  tieneError: boolean;
  error?: string;
}

// ═══════════════════════════════════════════════════════════════
// COMPONENTES
// ═══════════════════════════════════════════════════════════════

const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`rounded-2xl p-6 bg-gradient-to-br from-slate-50 to-slate-100 shadow-[8px_8px_16px_rgba(0,0,0,0.1),-8px_-8px_16px_rgba(255,255,255,0.9)] ${className}`}>
    {children}
  </div>
);

const EstadoBadge = ({ estado }: { estado: string }) => {
  const config: Record<string, { color: string; icon: React.ReactNode }> = {
    abierto: { color: 'bg-emerald-100 text-emerald-700', icon: <Unlock className="w-4 h-4" /> },
    pre_cierre: { color: 'bg-amber-100 text-amber-700', icon: <Clock className="w-4 h-4" /> },
    cerrado: { color: 'bg-slate-200 text-slate-700', icon: <Lock className="w-4 h-4" /> }
  };
  const { color, icon } = config[estado] || config.abierto;
  return (
    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${color}`}>
      {icon} {estado.replace('_', '-').toUpperCase()}
    </span>
  );
};

// ═══════════════════════════════════════════════════════════════
// PÁGINA
// ═══════════════════════════════════════════════════════════════

export default function CierreMensualPage() {
  const [loading, setLoading] = useState(true);
  const [resumen, setResumen] = useState<ResumenPeriodo | null>(null);
  const [campanas, setCampanas] = useState<CampanaValidacion[]>([]);
  const [accionEnCurso, setAccionEnCurso] = useState<string | null>(null);

  const ahora = new Date();
  const mesActual = ahora.toLocaleString('es-CL', { month: 'long', year: 'numeric' });

  useEffect(() => {
    cargarDatos();
  }, []);

  async function cargarDatos() {
    setLoading(true);
    await new Promise(r => setTimeout(r, 500));
    
    setResumen({
      periodo: '2025-12',
      estado: 'abierto',
      ventasNetas: 23500000,
      totalFacturado: 18000000,
      pendienteFacturar: 5500000,
      campanasVendidas: 12,
      campanasBonificadas: 3,
      campanasSinValor: 1,
      errores: [{ mensaje: 'Campaña CAM-2025-004 sin valor asignado', entidadId: 'cam-004' }]
    });
    
    setCampanas([
      { id: 'cam-001', codigo: 'CAM-2025-001', nombre: 'Campaña Navidad', cliente: 'Empresa ABC', valor: 15000000, esBonificada: false, esBeneficencia: false, tieneError: false },
      { id: 'cam-002', codigo: 'CAM-2025-002', nombre: 'Campaña Verano', cliente: 'Servicios XYZ', valor: 8500000, esBonificada: false, esBeneficencia: false, tieneError: false },
      { id: 'cam-003', codigo: 'CAM-2025-003', nombre: 'Apoyo Social', cliente: 'Fundación Ayuda', valor: 0, esBonificada: false, esBeneficencia: true, tieneError: false },
      { id: 'cam-004', codigo: 'CAM-2025-004', nombre: 'Promoción Q1', cliente: 'Comercial DEF', valor: 0, esBonificada: false, esBeneficencia: false, tieneError: true, error: 'Sin valor asignado' }
    ]);
    
    setLoading(false);
  }

  async function ejecutarPreCierre() {
    setAccionEnCurso('pre_cierre');
    await new Promise(r => setTimeout(r, 1500));
    
    if (resumen?.campanasSinValor === 0) {
      setResumen(prev => prev ? { ...prev, estado: 'pre_cierre' } : null);
      alert('✅ Pre-cierre ejecutado correctamente');
    } else {
      alert('❌ No se puede pre-cerrar: hay campañas sin valor');
    }
    setAccionEnCurso(null);
  }

  async function ejecutarCierre() {
    setAccionEnCurso('cierre');
    await new Promise(r => setTimeout(r, 2000));
    
    if (resumen?.estado === 'pre_cierre') {
      setResumen(prev => prev ? { ...prev, estado: 'cerrado' } : null);
      alert('✅ Período cerrado exitosamente');
    } else {
      alert('❌ Debe ejecutar pre-cierre primero');
    }
    setAccionEnCurso(null);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
        <RefreshCw className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-indigo-50 to-slate-100 p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-indigo-600 bg-clip-text text-transparent flex items-center gap-3">
              <Calendar className="w-10 h-10 text-indigo-500" />
              Cierre Mensual
            </h1>
            <p className="text-slate-500 mt-2">Período: {mesActual}</p>
          </div>
          
          {resumen && <EstadoBadge estado={resumen.estado} />}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Ventas Netas', value: `$${((resumen?.ventasNetas || 0) / 1000000).toFixed(1)}M`, icon: TrendingUp, color: 'text-emerald-500' },
            { label: 'Facturado', value: `$${((resumen?.totalFacturado || 0) / 1000000).toFixed(1)}M`, icon: DollarSign, color: 'text-blue-500' },
            { label: 'Pendiente', value: `$${((resumen?.pendienteFacturar || 0) / 1000000).toFixed(1)}M`, icon: Clock, color: 'text-amber-500' },
            { label: 'Campañas', value: `${resumen?.campanasVendidas || 0} + ${resumen?.campanasBonificadas || 0} bon`, icon: FileText, color: 'text-indigo-500' }
          ].map((stat) => (
            <Card key={stat.label} className="p-4">
              <div className="flex items-center gap-3">
                <stat.icon className={`w-8 h-8 ${stat.color}`} />
                <div>
                  <p className="text-xs text-slate-500">{stat.label}</p>
                  <p className="text-xl font-bold text-slate-800">{stat.value}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Errores de validación */}
        {(resumen?.errores?.length || 0) > 0 && (
          <Card className="border-l-4 border-red-400 bg-red-50">
            <h3 className="font-bold text-red-700 flex items-center gap-2 mb-3">
              <AlertTriangle className="w-5 h-5" />
              Errores de Validación ({resumen?.errores.length})
            </h3>
            <ul className="space-y-2">
              {resumen?.errores.map((err) => (
                <li key={err.mensaje} className="flex items-center gap-2 text-red-600">
                  <XCircle className="w-4 h-4" />
                  {err.mensaje}
                </li>
              ))}
            </ul>
          </Card>
        )}

        {/* Campañas del período */}
        <Card>
          <h2 className="text-lg font-bold text-slate-800 mb-4">Campañas del Período</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left text-xs text-slate-500">
                  <th className="py-2 px-3">Código</th>
                  <th className="py-2 px-3">Campaña</th>
                  <th className="py-2 px-3">Cliente</th>
                  <th className="py-2 px-3">Valor</th>
                  <th className="py-2 px-3">Estado</th>
                </tr>
              </thead>
              <tbody>
                {campanas.map((c) => (
                  <tr key={c.id} className={`border-b ${c.tieneError ? 'bg-red-50' : ''}`}>
                    <td className="py-2 px-3 font-mono text-sm">{c.codigo}</td>
                    <td className="py-2 px-3">{c.nombre}</td>
                    <td className="py-2 px-3 text-slate-600">{c.cliente}</td>
                    <td className="py-2 px-3 font-medium">
                      {c.valor > 0 ? `$${(c.valor / 1000000).toFixed(1)}M` : 
                       c.esBeneficencia ? <span className="text-emerald-600">Beneficencia</span> :
                       c.esBonificada ? <span className="text-blue-600">Bonificada</span> :
                       <span className="text-red-600">SIN VALOR</span>}
                    </td>
                    <td className="py-2 px-3">
                      {c.tieneError ? (
                        <span className="flex items-center gap-1 text-red-600 text-sm"><XCircle className="w-4 h-4" /> Error</span>
                      ) : (
                        <span className="flex items-center gap-1 text-emerald-600 text-sm"><CheckCircle className="w-4 h-4" /> OK</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Acciones */}
        <div className="flex flex-wrap gap-4">
          <button
            onClick={ejecutarPreCierre}
            disabled={resumen?.estado !== 'abierto' || accionEnCurso !== null}
            className={`px-6 py-3 rounded-xl font-medium flex items-center gap-2 ${
              resumen?.estado === 'abierto' 
                ? 'bg-amber-500 hover:bg-amber-600 text-white' 
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            {accionEnCurso === 'pre_cierre' ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Clock className="w-5 h-5" />}
            Ejecutar Pre-Cierre
          </button>
          
          <button
            onClick={ejecutarCierre}
            disabled={resumen?.estado !== 'pre_cierre' || accionEnCurso !== null}
            className={`px-6 py-3 rounded-xl font-medium flex items-center gap-2 ${
              resumen?.estado === 'pre_cierre' 
                ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            {accionEnCurso === 'cierre' ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Lock className="w-5 h-5" />}
            Cerrar Período
          </button>
          
          <button className="px-6 py-3 bg-white rounded-xl font-medium flex items-center gap-2 shadow-md text-slate-700">
            <Download className="w-5 h-5" /> Exportar Reporte
          </button>
        </div>

        <div className="text-center text-slate-400 text-sm">
          <p>📊 Cierre Mensual - SILEXAR PULSE TIER 0</p>
        </div>
      </div>
    </div>
  );
}
