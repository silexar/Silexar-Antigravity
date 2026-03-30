/**
 * 📻 SILEXAR PULSE - Página de Registro de Emisión
 * 
 * @description Centro de control para verificar y confirmar emisiones
 * 
 * @version 2025.1.0
 * @tier TIER_0_FORTUNE_10
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  Radio, 
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Music,
  Fingerprint,
  Mic,
  User,
  Zap,
  Play,
  RotateCcw,
  Check
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

interface Registro {
  id: string;
  spotTandaId: string;
  cunaNombre: string;
  horaProgra: string;
  horaEmision: string | null;
  emitido: boolean;
  confirmado: boolean;
  metodo: string | null;
  confianza: number;
}

interface Stats {
  total: number;
  emitidos: number;
  confirmados: number;
  pendientes: number;
  noEmitidos: number;
  porcentajeEmision: number;
  confianzaPromedio: number;
}

// ═══════════════════════════════════════════════════════════════
// COMPONENTES NEUROMÓRFICOS
// ═══════════════════════════════════════════════════════════════

const GlassCard = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`rounded-2xl p-6 bg-white/60 backdrop-blur-xl border border-white/60 shadow-xl shadow-slate-200/50 transition-all ${className}`}>
    {children}
  </div>
);

const MetodoBadge = ({ metodo }: { metodo: string | null }) => {
  const config: Record<string, { bg: string; icon: React.ElementType }> = {
    manual: { bg: 'from-slate-400 to-slate-500', icon: User },
    fingerprint: { bg: 'from-purple-400 to-purple-500', icon: Fingerprint },
    shazam: { bg: 'from-cyan-400 to-cyan-500', icon: Music },
    speech_to_text: { bg: 'from-emerald-400 to-emerald-500', icon: Mic },
    automatico: { bg: 'from-blue-400 to-blue-500', icon: Zap }
  };
  const { bg, icon: Icon } = config[metodo || 'manual'] || config.manual;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium text-white bg-gradient-to-r ${bg}`}>
      <Icon className="w-3 h-3" />
      {metodo || 'N/A'}
    </span>
  );
};

const ConfianzaBadge = ({ confianza }: { confianza: number }) => {
  const color = confianza >= 90 ? 'text-emerald-600' : confianza >= 80 ? 'text-blue-600' : confianza >= 60 ? 'text-amber-600' : 'text-red-600';
  return <span className={`font-bold ${color}`}>{confianza}%</span>;
};

// ═══════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════

export default function RegistroEmisionPage() {
  const [registros, setRegistros] = useState<Registro[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, emitidos: 0, confirmados: 0, pendientes: 0, noEmitidos: 0, porcentajeEmision: 0, confianzaPromedio: 0 });
  const [loading, setLoading] = useState(true);
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [filtro, setFiltro] = useState('todos');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const estadoParam = filtro !== 'todos' ? `&estado=${filtro}` : '';
      const response = await fetch(`/api/registro-emision?fecha=${fecha}${estadoParam}`);
      const data = await response.json();
      if (data.success) {
        setRegistros(data.data);
        setStats(data.stats);
      }
    } catch {
      // /* console.error('Error fetching data mitigado para prevenir leak') */;
    } finally {
      setLoading(false);
    }
  }, [fecha, filtro]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const cambiarFecha = (dias: number) => {
    const nuevaFecha = new Date(fecha);
    nuevaFecha.setDate(nuevaFecha.getDate() + dias);
    setFecha(nuevaFecha.toISOString().split('T')[0]);
  };

  const confirmarEmision = async (id: string) => {
    try {
      await fetch('/api/registro-emision', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, confirmado: true, confianza: 100 })
      });
      fetchData();
    } catch {
      // /* console.error('Error confirmando emision mitigado') */;
    }
  };

  const registrarManual = async (registro: Registro) => {
    try {
      await fetch('/api/registro-emision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          spotTandaId: registro.spotTandaId,
          cunaNombre: registro.cunaNombre,
          horaProgramada: registro.horaProgra,
          metodo: 'manual'
        })
      });
      fetchData();
    } catch {
      // /* console.error('Error registro manual mitigado') */;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-teal-50 to-slate-100 p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-teal-600 bg-clip-text text-transparent flex items-center gap-3">
              <Radio className="w-10 h-10 text-teal-500" />
              Registro de Emisión
            </h1>
            <p className="text-slate-500 mt-2">Verificación y confirmación de spots emitidos</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white/60 backdrop-blur-sm border border-white/60 rounded-xl p-2 shadow-sm">
              <button onClick={() => cambiarFecha(-1)} className="p-2 rounded-lg hover:bg-white active:scale-95 transition-all">
                <ChevronLeft className="w-5 h-5 text-slate-600" />
              </button>
              <div className="px-4 py-2 font-bold text-slate-800">
                {new Date(fecha).toLocaleDateString('es-CL', { day: 'numeric', month: 'short' })}
              </div>
              <button onClick={() => cambiarFecha(1)} className="p-2 rounded-lg hover:bg-white active:scale-95 transition-all">
                <ChevronRight className="w-5 h-5 text-slate-600" />
              </button>
            </div>
            <button onClick={fetchData} className="p-3 bg-white/60 backdrop-blur-sm border border-white/60 rounded-xl shadow-sm hover:bg-white active:scale-95 transition-all text-teal-600">
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {[
            { label: 'Total', value: stats.total, icon: Music, color: 'from-slate-400 to-slate-500' },
            { label: 'Emitidos', value: stats.emitidos, icon: Play, color: 'from-blue-400 to-blue-500' },
            { label: 'Confirmados', value: stats.confirmados, icon: CheckCircle, color: 'from-emerald-400 to-emerald-500' },
            { label: 'Pendientes', value: stats.pendientes, icon: Clock, color: 'from-amber-400 to-amber-500' },
            { label: 'No Emitidos', value: stats.noEmitidos, icon: XCircle, color: 'from-red-400 to-red-500' },
            { label: 'Emisión', value: `${stats.porcentajeEmision}%`, icon: Radio, color: 'from-purple-400 to-purple-500' },
            { label: 'Confianza', value: `${stats.confianzaPromedio}%`, icon: Fingerprint, color: 'from-teal-400 to-teal-500' }
          ].map((stat, i) => (
            <GlassCard key={i} className="p-4">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-lg bg-gradient-to-br ${stat.color} shadow-sm border border-white/20`}>
                  <stat.icon className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-slate-500 text-xs font-semibold">{stat.label}</p>
                  <p className="text-xl font-bold text-slate-800">{stat.value}</p>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>

        {/* Filtros */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {[
            { id: 'todos', label: 'Todos', icon: Music },
            { id: 'confirmado', label: 'Confirmados', icon: CheckCircle },
            { id: 'pendiente', label: 'Pendientes', icon: Clock },
            { id: 'no_emitido', label: 'No Emitidos', icon: XCircle }
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFiltro(f.id)}
              className={`px-4 py-2 rounded-xl flex items-center gap-2 whitespace-nowrap transition-all font-semibold ${
                filtro === f.id 
                  ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-md shadow-teal-200/50' 
                  : 'bg-white/60 backdrop-blur-sm shadow-sm border border-white/60 text-slate-600 hover:bg-white active:scale-95'
              }`}
            >
              <f.icon className="w-4 h-4" />
              {f.label}
            </button>
          ))}
        </div>

        {/* Lista de registros */}
        <GlassCard>
          <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Music className="w-6 h-6 text-teal-500" />
            Detalle de Emisiones
          </h2>
          
          {loading ? (
            <div className="text-center py-16"><RefreshCw className="w-10 h-10 animate-spin text-teal-500 mx-auto" /></div>
          ) : registros.length === 0 ? (
            <div className="text-center py-16"><div className="w-24 h-24 bg-white/50 backdrop-blur-md border border-white/60 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm"><Radio className="w-10 h-10 text-slate-300" /></div><p className="text-slate-500 font-bold">Sin registros de emisión hoy</p></div>
          ) : (
            <div className="space-y-3">
              {registros.map((reg) => (
                <div key={reg.id} className={`p-4 rounded-xl border bg-white/60 backdrop-blur-sm shadow-sm transition-all hover:shadow-md ${
                  reg.confirmado ? 'border-emerald-200' :
                  !reg.emitido ? 'border-red-200' :
                  'border-amber-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        reg.confirmado ? 'bg-emerald-500' : !reg.emitido ? 'bg-red-500' : 'bg-amber-500'
                      }`}>
                        {reg.confirmado ? <CheckCircle className="w-5 h-5 text-white" /> : 
                         !reg.emitido ? <XCircle className="w-5 h-5 text-white" /> : 
                         <AlertCircle className="w-5 h-5 text-white" />}
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">{reg.cunaNombre}</p>
                        <div className="flex items-center gap-3 text-sm text-slate-500">
                          <span className="font-mono">{reg.horaProgra}</span>
                          {reg.horaEmision && <span>→ {reg.horaEmision}</span>}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      {reg.metodo && <MetodoBadge metodo={reg.metodo} />}
                      {reg.confianza > 0 && <ConfianzaBadge confianza={reg.confianza} />}
                      
                      <div className="flex gap-2">
                        {!reg.emitido && (
                          <button onClick={() => registrarManual(reg)} className="p-2 rounded-xl bg-white border border-blue-200 shadow-sm hover:bg-blue-50 active:scale-95 text-blue-600 transition-all">
                            <RotateCcw className="w-4 h-4" />
                          </button>
                        )}
                        {reg.emitido && !reg.confirmado && (
                          <button onClick={() => confirmarEmision(reg.id)} className="px-4 py-2 font-bold text-sm rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-md shadow-emerald-200/50 border border-transparent hover:-translate-y-0.5 active:scale-95 transition-all flex items-center gap-2">
                            <Check className="w-4 h-4" /> Validar
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </GlassCard>

        <div className="text-center text-slate-400 text-sm">
          <p>📻 Registro de Emisión - SILEXAR PULSE TIER 0</p>
        </div>
      </div>
    </div>
  );
}
