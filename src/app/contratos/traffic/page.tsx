/**
 * 📺 SILEXAR PULSE - Dashboard Traffic/Operaciones TIER 0
 * 
 * @description Vista para programadores y traffic con tracking
 * de ejecución de pauta, materiales y cumplimiento.
 * 
 * @version 2025.4.0
 * @tier TIER_0_FORTUNE_10
 */

'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Radio,
  Tv,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Play,
  Pause,
  BarChart3,
  Filter,
  Search,
  RefreshCw,
  Download,
  ChevronRight,
  Eye,
  Upload,
  Sparkles,
  TrendingUp,
  Package,
  Lock,
  ShieldAlert,
  ShieldCheck
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

interface OrdenPauta {
  id: string;
  numeroContrato: string;
  anuncianteNombre: string;
  campana: string;
  medio: string;
  medioTipo: 'RADIO' | 'TV' | 'DIGITAL';
  programa: string;
  fechaInicio: Date;
  fechaFin: Date;
  totalCunas: number;
  cunasEmitidas: number;
  cunasPendientes: number;
  cunasRechazadas: number;
  porcentajeEjecucion: number;
  estadoMaterial: 'pendiente' | 'recibido' | 'aprobado' | 'rechazado';
  codigoMaterial?: string;
  estado: 'programado' | 'en_ejecucion' | 'pausado' | 'completado' | 'con_problemas';
  ejecutivoNombre: string;
  prioridad: 'normal' | 'alta' | 'urgente';
  // Anti-Fraude: Estado de autorización del contrato
  estadoAutorizacion?: 'operativo' | 'pendiente_aprobacion' | 'bloqueado';
}

interface ResumenTraffic {
  ordenesPendientes: number;
  ordenesEnEjecucion: number;
  ordenesCompletadas: number;
  ordenesConProblemas: number;
  materialesPendientes: number;
  cunasHoy: number;
  cunasProgramadas: number;
  porcentajeCumplimiento: number;
}

// ═══════════════════════════════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════════════════════════════

const mockOrdenes: OrdenPauta[] = [
  {
    id: '1',
    numeroContrato: 'CON-2024-00145',
    anuncianteNombre: 'Banco Nacional S.A.',
    campana: 'Navidad 2024',
    medio: 'Radio Cooperativa',
    medioTipo: 'RADIO',
    programa: 'El Diario de Cooperativa',
    fechaInicio: new Date(),
    fechaFin: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    totalCunas: 120,
    cunasEmitidas: 45,
    cunasPendientes: 73,
    cunasRechazadas: 2,
    porcentajeEjecucion: 37.5,
    estadoMaterial: 'aprobado',
    codigoMaterial: 'SP-BN-NAV-001',
    estado: 'en_ejecucion',
    ejecutivoNombre: 'Ana García',
    prioridad: 'alta'
  },
  {
    id: '2',
    numeroContrato: 'CON-2024-00140',
    anuncianteNombre: 'Retail Chile',
    campana: 'Cyber Day',
    medio: 'Canal 13',
    medioTipo: 'TV',
    programa: 'Bienvenidos',
    fechaInicio: new Date(),
    fechaFin: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    totalCunas: 56,
    cunasEmitidas: 20,
    cunasPendientes: 36,
    cunasRechazadas: 0,
    porcentajeEjecucion: 35.7,
    estadoMaterial: 'aprobado',
    codigoMaterial: 'TV-RC-CYB-001',
    estado: 'en_ejecucion',
    ejecutivoNombre: 'Pedro Soto',
    prioridad: 'urgente'
  },
  {
    id: '3',
    numeroContrato: 'CON-2024-00138',
    anuncianteNombre: 'SuperMax SpA',
    campana: 'Apertura Tienda',
    medio: 'Radio Bío-Bío',
    medioTipo: 'RADIO',
    programa: 'Radiograma',
    fechaInicio: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    fechaFin: new Date(Date.now() + 17 * 24 * 60 * 60 * 1000),
    totalCunas: 80,
    cunasEmitidas: 0,
    cunasPendientes: 80,
    cunasRechazadas: 0,
    porcentajeEjecucion: 0,
    estadoMaterial: 'pendiente',
    estado: 'programado',
    ejecutivoNombre: 'Ana García',
    prioridad: 'normal'
  },
  {
    id: '4',
    numeroContrato: 'CON-2024-00130',
    anuncianteNombre: 'FinanceGroup',
    campana: 'Inversiones 2025',
    medio: 'Radio ADN',
    medioTipo: 'RADIO',
    programa: 'Primera Pauta',
    fechaInicio: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    fechaFin: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    totalCunas: 60,
    cunasEmitidas: 58,
    cunasPendientes: 0,
    cunasRechazadas: 2,
    porcentajeEjecucion: 96.7,
    estadoMaterial: 'aprobado',
    codigoMaterial: 'SP-FG-INV-001',
    estado: 'completado',
    ejecutivoNombre: 'Carlos Mendoza',
    prioridad: 'normal'
  },
  {
    id: '5',
    numeroContrato: 'CON-2024-00125',
    anuncianteNombre: 'EnergyMax',
    campana: 'Energía Limpia',
    medio: 'Mega',
    medioTipo: 'TV',
    programa: 'Mucho Gusto',
    fechaInicio: new Date(),
    fechaFin: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    totalCunas: 42,
    cunasEmitidas: 10,
    cunasPendientes: 25,
    cunasRechazadas: 7,
    porcentajeEjecucion: 23.8,
    estadoMaterial: 'aprobado',
    codigoMaterial: 'TV-EM-EL-001',
    estado: 'con_problemas',
    ejecutivoNombre: 'Carlos Mendoza',
    prioridad: 'alta'
  }
];

const mockResumen: ResumenTraffic = {
  ordenesPendientes: 3,
  ordenesEnEjecucion: 8,
  ordenesCompletadas: 45,
  ordenesConProblemas: 2,
  materialesPendientes: 5,
  cunasHoy: 127,
  cunasProgramadas: 142,
  porcentajeCumplimiento: 89.4
};

// ═══════════════════════════════════════════════════════════════
// COMPONENTES
// ═══════════════════════════════════════════════════════════════

const MedioIcon: React.FC<{ tipo: string }> = ({ tipo }) => {
  const Icon = tipo === 'TV' ? Tv : tipo === 'DIGITAL' ? BarChart3 : Radio;
  return <Icon className="w-5 h-5" />;
};

const EstadoBadge: React.FC<{ estado: OrdenPauta['estado'] }> = ({ estado }) => {
  const config = {
    programado: { bg: 'bg-slate-100', text: 'text-slate-700', icon: Clock, label: 'Programado' },
    en_ejecucion: { bg: 'bg-blue-100', text: 'text-blue-700', icon: Play, label: 'En Ejecución' },
    pausado: { bg: 'bg-amber-100', text: 'text-amber-700', icon: Pause, label: 'Pausado' },
    completado: { bg: 'bg-emerald-100', text: 'text-emerald-700', icon: CheckCircle2, label: 'Completado' },
    con_problemas: { bg: 'bg-red-100', text: 'text-red-700', icon: AlertTriangle, label: 'Con Problemas' }
  }[estado];

  const Icon = config.icon;
  return (
    <span className={`px-2 py-1 rounded-lg text-xs font-medium ${config.bg} ${config.text} flex items-center gap-1`}>
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
};

const MaterialBadge: React.FC<{ estado: OrdenPauta['estadoMaterial'] }> = ({ estado }) => {
  const config = {
    pendiente: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Material Pendiente' },
    recibido: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Recibido' },
    aprobado: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Aprobado' },
    rechazado: { bg: 'bg-red-100', text: 'text-red-700', label: 'Rechazado' }
  }[estado];

  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  );
};

// Badge de estado de autorización anti-fraude
const AutorizacionBadge: React.FC<{
  estado?: 'operativo' | 'pendiente_aprobacion' | 'bloqueado';
}> = ({ estado }) => {
  if (!estado || estado === 'operativo') {
    return (
      <span className="flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-700">
        <ShieldCheck className="w-3 h-3" />
        Autorizado
      </span>
    );
  }
  
  if (estado === 'pendiente_aprobacion') {
    return (
      <span className="flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-700">
        <ShieldAlert className="w-3 h-3" />
        Pendiente
      </span>
    );
  }
  
  return (
    <span className="flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700">
      <Lock className="w-3 h-3" />
      Bloqueado
    </span>
  );
};
const ResumenCard: React.FC<{
  titulo: string;
  valor: number | string;
  icono: React.ElementType;
  color: string;
  sufijo?: string;
}> = ({ titulo, valor, icono: Icon, color, sufijo }) => (
  <motion.div
    className={`p-5 rounded-2xl ${color} transition-all`}
    whileHover={{ scale: 1.02 }}
  >
    <div className="flex items-center justify-between mb-2">
      <Icon className="w-6 h-6 opacity-70" />
    </div>
    <p className="text-3xl font-bold">{valor}{sufijo}</p>
    <p className="text-sm opacity-70 mt-1">{titulo}</p>
  </motion.div>
);

const OrdenRow: React.FC<{
  orden: OrdenPauta;
  isExpanded: boolean;
  onToggle: () => void;
}> = ({ orden, isExpanded, onToggle }) => {
  const prioridadColor = {
    normal: 'border-l-slate-300',
    alta: 'border-l-amber-400',
    urgente: 'border-l-red-500'
  }[orden.prioridad];

  return (
    <motion.div layout className={`bg-white rounded-xl border border-slate-200 overflow-hidden border-l-4 ${prioridadColor}`}>
      <div
        className="p-4 cursor-pointer hover:bg-slate-50 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center gap-4">
          {/* Medio */}
          <div className={`p-2 rounded-lg ${orden.medioTipo === 'TV' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
            <MedioIcon tipo={orden.medioTipo} />
          </div>
          
          {/* Info principal */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-slate-800">{orden.anuncianteNombre}</h4>
              <span className="text-slate-400">•</span>
              <span className="text-sm text-slate-600">{orden.campana}</span>
            </div>
            <p className="text-sm text-slate-500">{orden.medio} - {orden.programa}</p>
          </div>
          
          {/* Estado material */}
          <MaterialBadge estado={orden.estadoMaterial} />
          
          {/* Estado autorización anti-fraude */}
          <AutorizacionBadge estado={orden.estadoAutorizacion} />
          
          {/* Progreso */}
          <div className="w-32">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span>{orden.cunasEmitidas}/{orden.totalCunas}</span>
              <span>{orden.porcentajeEjecucion.toFixed(0)}%</span>
            </div>
            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
              <motion.div
                className={`h-full rounded-full ${
                  orden.estado === 'con_problemas' ? 'bg-red-500' :
                  orden.porcentajeEjecucion >= 90 ? 'bg-emerald-500' :
                  'bg-blue-500'
                }`}
                initial={{ width: 0 }}
                animate={{ width: `${orden.porcentajeEjecucion}%` }}
              />
            </div>
          </div>
          
          {/* Estado */}
          <EstadoBadge estado={orden.estado} />
          
          {/* Expandir */}
          <motion.div animate={{ rotate: isExpanded ? 90 : 0 }}>
            <ChevronRight className="w-5 h-5 text-slate-400" />
          </motion.div>
        </div>
      </div>
      
      {/* Detalle expandido */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-slate-200 bg-slate-50"
          >
            <div className="p-4 grid grid-cols-4 gap-6">
              <div>
                <p className="text-xs text-slate-500 mb-1">Contrato</p>
                <p className="font-mono text-sm">{orden.numeroContrato}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Período</p>
                <p className="text-sm">
                  {orden.fechaInicio.toLocaleDateString()} - {orden.fechaFin.toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Código Material</p>
                <p className="font-mono text-sm">{orden.codigoMaterial || 'Sin asignar'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Ejecutivo</p>
                <p className="text-sm">{orden.ejecutivoNombre}</p>
              </div>
              
              <div className="col-span-4 flex items-center gap-3 pt-2 border-t border-slate-200">
                <button className="px-3 py-1.5 rounded-lg bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 flex items-center gap-1">
                  <Eye className="w-4 h-4" /> Ver Programación
                </button>
                {orden.estadoMaterial === 'pendiente' && (
                  <button className="px-3 py-1.5 rounded-lg bg-amber-500 text-white text-sm font-medium hover:bg-amber-600 flex items-center gap-1">
                    <Upload className="w-4 h-4" /> Solicitar Material
                  </button>
                )}
                {orden.cunasRechazadas > 0 && (
                  <button className="px-3 py-1.5 rounded-lg bg-red-100 text-red-700 text-sm font-medium hover:bg-red-200 flex items-center gap-1">
                    <XCircle className="w-4 h-4" /> {orden.cunasRechazadas} Rechazadas
                  </button>
                )}
                <button className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-sm hover:bg-slate-100 flex items-center gap-1 ml-auto">
                  <Download className="w-4 h-4" /> Exportar Log
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ═══════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════

export default function TrafficPage() {
  const [ordenes] = useState<OrdenPauta[]>(mockOrdenes);
  const [resumen] = useState<ResumenTraffic>(mockResumen);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');
  const [filtroMedio, setFiltroMedio] = useState<string>('todos');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  
  const ordenesFiltradas = useMemo(() => {
    return ordenes.filter(o => {
      if (filtroEstado !== 'todos' && o.estado !== filtroEstado) return false;
      if (filtroMedio !== 'todos' && o.medioTipo !== filtroMedio) return false;
      if (busqueda) {
        const query = busqueda.toLowerCase();
        return (
          o.anuncianteNombre.toLowerCase().includes(query) ||
          o.campana.toLowerCase().includes(query) ||
          o.medio.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [ordenes, filtroEstado, filtroMedio, busqueda]);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-blue-50/30">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600">
                <Radio className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-800">Traffic & Operaciones</h1>
                <p className="text-slate-500 text-sm flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-500" />
                  Tracking de pauta en tiempo real
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <button className="px-4 py-2 rounded-xl bg-blue-500 text-white font-medium flex items-center gap-2 hover:bg-blue-600 transition-colors">
                <RefreshCw className="w-4 h-4" />
                Sincronizar
              </button>
              <button className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-medium flex items-center gap-2 hover:bg-slate-50 transition-colors">
                <Download className="w-4 h-4" />
                Exportar
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-[1600px] mx-auto px-6 py-6">
        {/* Resumen */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <ResumenCard
            titulo="Cuñas Hoy"
            valor={resumen.cunasHoy}
            sufijo={`/${resumen.cunasProgramadas}`}
            icono={Play}
            color="bg-gradient-to-br from-blue-500 to-blue-600 text-white"
          />
          <ResumenCard
            titulo="En Ejecución"
            valor={resumen.ordenesEnEjecucion}
            icono={Radio}
            color="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white"
          />
          <ResumenCard
            titulo="Material Pendiente"
            valor={resumen.materialesPendientes}
            icono={Package}
            color="bg-gradient-to-br from-amber-500 to-amber-600 text-white"
          />
          <ResumenCard
            titulo="Con Problemas"
            valor={resumen.ordenesConProblemas}
            icono={AlertTriangle}
            color="bg-gradient-to-br from-red-500 to-red-600 text-white"
          />
          <ResumenCard
            titulo="Cumplimiento"
            valor={resumen.porcentajeCumplimiento.toFixed(1)}
            sufijo="%"
            icono={TrendingUp}
            color="bg-gradient-to-br from-purple-500 to-purple-600 text-white"
          />
        </div>
        
        {/* Filtros */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por anunciante, campaña o medio..."
              aria-label="Buscar por anunciante, campaña o medio"
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-400/50"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="px-3 py-2 rounded-lg border border-slate-200 text-sm"
            >
              <option value="todos">Todos los estados</option>
              <option value="programado">Programado</option>
              <option value="en_ejecucion">En Ejecución</option>
              <option value="con_problemas">Con Problemas</option>
              <option value="completado">Completado</option>
            </select>
            
            <select
              value={filtroMedio}
              onChange={(e) => setFiltroMedio(e.target.value)}
              className="px-3 py-2 rounded-lg border border-slate-200 text-sm"
            >
              <option value="todos">Todos los medios</option>
              <option value="RADIO">Radio</option>
              <option value="TV">TV</option>
              <option value="DIGITAL">Digital</option>
            </select>
          </div>
          
          <span className="text-sm text-slate-500 ml-auto">
            {ordenesFiltradas.length} órdenes
          </span>
        </div>
        
        {/* Lista de órdenes */}
        <div className="space-y-3">
          <AnimatePresence>
            {ordenesFiltradas.map(orden => (
              <OrdenRow
                key={orden.id}
                orden={orden}
                isExpanded={expandedId === orden.id}
                onToggle={() => setExpandedId(expandedId === orden.id ? null : orden.id)}
              />
            ))}
          </AnimatePresence>
          
          {ordenesFiltradas.length === 0 && (
            <div className="p-12 text-center bg-white rounded-xl border border-slate-200">
              <Radio className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">No hay órdenes que coincidan con los filtros</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
