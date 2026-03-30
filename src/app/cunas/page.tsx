/**
 * 🎵 SILEXAR PULSE - Centro de Operaciones de Cuñas TIER 0
 * 
 * Vista principal enterprise del módulo de Cuñas/Spots
 * Diseño neuromórfico. Componentes extraídos a _lib/.
 * 
 * @version 2050.3.0 — Refactorizado
 * @tier TIER_0_FORTUNE_10
 */

'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Music, Search, Plus, Eye, Edit3, Play, Pause, Upload, Clock, RefreshCw,
  CheckCircle, AlertCircle, Volume2, Mail, Download,
  Calendar, TrendingUp, BarChart2,
  Send, Copy, MoreVertical, Bell, Sparkles,
  Target, Activity, ExternalLink,
  ShieldAlert, CheckSquare, Square
} from 'lucide-react';
import useAtajosTeclado from '@/app/campanas/crear/components/WizardCampana/hooks/useAtajosTeclado';

// Módulos extraídos
import type { Cuna, MetricasOperativas, AlertaOperativa } from './_lib/types';
import {
  NeuromorphicCard, NeuromorphicButton,
  EstadoBadge, UrgenciaBadge, TipoBadge,
  TiempoRestanteBadge, EmisoraChip, ProximaEmisionInfo,
  MetricaCard
} from './_lib/components';

// ═══════════════════════════════════════════════════════════════
// PANEL DE ALERTAS OPERATIVAS MEJORADO
// ═══════════════════════════════════════════════════════════════

interface AlertaGrupo {
  titulo: string;
  emoji: string;
  color: string;
  bgColor: string;
  borderColor: string;
  alertas: AlertaOperativa[];
}

const AlertasPanel = ({ 
  alertas, 
  onResolve,
  onRefresh,
  loading = false
}: { 
  alertas: AlertaOperativa[]; 
  onResolve: (id: string) => void;
  onRefresh?: () => void;
  loading?: boolean;
}) => {
  // Agrupar alertas por tipo
  const grupos: AlertaGrupo[] = [
    {
      titulo: 'VENCEN HOY',
      emoji: '⏰',
      color: 'text-red-700',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      alertas: alertas.filter(a => a.tipo === 'vencimiento')
    },
    {
      titulo: 'SIN VALIDAR',
      emoji: '⚠️',
      color: 'text-amber-700',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      alertas: alertas.filter(a => a.tipo === 'validacion')
    },
    {
      titulo: 'PENDIENTES ENVÍO',
      emoji: '📤',
      color: 'text-blue-700',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      alertas: alertas.filter(a => a.tipo === 'distribucion')
    },
    {
      titulo: 'EMISIÓN',
      emoji: '📻',
      color: 'text-purple-700',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      alertas: alertas.filter(a => a.tipo === 'emision')
    }
  ].filter(g => g.alertas.length > 0);

  const totalCriticas = alertas.filter(a => a.prioridad === 'critica').length;

  return (
    <NeuromorphicCard className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 shadow-md">
            <Bell className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800">🚨 ALERTAS DE OPERACIÓN</h3>
            <p className="text-xs text-slate-500">{alertas.length} activas</p>
          </div>
        </div>
        {totalCriticas > 0 && (
          <span className="px-2.5 py-1 bg-red-500 text-white rounded-full text-xs font-bold animate-pulse">
            {totalCriticas} críticas
          </span>
        )}
      </div>

      {/* Grupos de alertas */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {grupos.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <CheckCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="font-medium">Sin alertas pendientes</p>
            <p className="text-xs mt-1">¡Todo está bajo control!</p>
          </div>
        ) : (
          grupos.map((grupo) => (
            <div key={grupo.titulo} className={`rounded-xl border ${grupo.borderColor} ${grupo.bgColor} overflow-hidden`}>
              {/* Header del grupo */}
              <div className={`px-3 py-2 font-semibold text-sm flex items-center justify-between ${grupo.color}`}>
                <span className="flex items-center gap-2">
                  <span>{grupo.emoji}</span>
                  <span>{grupo.titulo}</span>
                </span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${grupo.bgColor} ${grupo.color} border ${grupo.borderColor}`}>
                  {grupo.alertas.length}
                </span>
              </div>
              
              {/* Lista de alertas del grupo */}
              <div className="divide-y divide-slate-100">
                {grupo.alertas.map((alerta) => (
                  <div 
                    key={alerta.id}
                    className="px-3 py-2 bg-white/70 hover:bg-white transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          {alerta.prioridad === 'critica' && (
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse flex-shrink-0" />
                          )}
                          <p className="text-sm font-medium text-slate-700 truncate">
                            {alerta.mensaje}
                          </p>
                        </div>
                        {alerta.cunaCodigo && (
                          <p className="text-xs text-slate-500 mt-0.5 font-mono flex items-center gap-1">
                            <Music className="w-3 h-3" />
                            {alerta.cunaCodigo}
                          </p>
                        )}
                      </div>
                      <button 
                        onClick={() => onResolve(alerta.id)}
                        className={`px-2 py-1 text-xs rounded-lg shadow-sm hover:shadow-md transition-all font-medium flex-shrink-0
                          ${alerta.prioridad === 'critica' 
                            ? 'bg-red-500 text-white hover:bg-red-600' 
                            : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
                          }
                        `}
                      >
                        {alerta.accion}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer con acciones */}
      <div className="mt-4 pt-3 border-t border-slate-200 flex items-center gap-2">
        <button 
          onClick={onRefresh}
          disabled={loading}
          className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 rounded-xl text-sm font-medium text-slate-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Actualizar
        </button>
        <a 
          href="/cunas/alertas"
          className="flex-1 py-2 px-3 bg-emerald-500 hover:bg-emerald-600 rounded-xl text-sm font-medium text-white transition-colors flex items-center justify-center gap-2"
        >
          📋 Ver Todo
        </a>
      </div>
    </NeuromorphicCard>
  );
};

// ═══════════════════════════════════════════════════════════════
// TABLA DE CUÑAS
// ═══════════════════════════════════════════════════════════════

interface CunaRowProps {
  cuna: Cuna;
  onPlay: (id: string) => void;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onActions: (id: string, action: string) => void;
  isPlaying: boolean;
}

const CunaRow = ({ cuna, onPlay, onView, onEdit, onActions, isPlaying }: CunaRowProps) => (
  <div className={`
    flex items-center justify-between p-4 rounded-xl border backdrop-blur-xl transition-all duration-200
    ${cuna.esCritica ? 'bg-red-50/60 border-red-200 shadow-[0_0_15px_rgba(239,68,68,0.1)]' : 'bg-white/60 border-slate-200/60'}
    hover:bg-white/90 hover:shadow-md hover:border-emerald-200 group
  `}>
    {/* Play Button & Info */}
    <div className="flex items-center gap-4 flex-1">
      <button
        onClick={() => onPlay(cuna.id)}
        className={`
          p-3 rounded-full transition-all duration-200
          ${isPlaying 
            ? 'bg-gradient-to-br from-emerald-400 to-emerald-500 shadow-lg scale-110' 
            : 'bg-gradient-to-br from-slate-200 to-slate-300 hover:from-emerald-400 hover:to-emerald-500'
          }
        `}
      >
        {isPlaying ? (
          <Pause className="w-5 h-5 text-white" />
        ) : (
          <Play className="w-5 h-5 text-slate-600" />
        )}
      </button>
      
      <div className="min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-mono text-sm text-emerald-600 font-semibold">{cuna.spxCodigo}</span>
          <TipoBadge tipo={cuna.tipo} />
          <UrgenciaBadge urgencia={cuna.urgencia} />
        </div>
        <h3 className="font-medium text-slate-800 truncate mt-1">{cuna.nombre}</h3>
        <p className="text-sm text-slate-500 truncate">
          {cuna.anuncianteNombre}
          {cuna.producto && <span className="text-slate-300"> • </span>}
          {cuna.producto}
        </p>
      </div>
    </div>

    {/* Duración */}
    <div className="hidden lg:flex flex-col items-center px-4 min-w-[80px]">
      <div className="flex items-center gap-1 text-slate-700">
        <Clock className="w-4 h-4" />
        <span className="font-mono font-bold">{cuna.duracionFormateada}</span>
      </div>
      <p className="text-xs text-slate-400">{cuna.duracionSegundos}s</p>
    </div>

    {/* Scores */}
    <div className="hidden xl:flex gap-3 px-4">
      <div className="text-center">
        <div className={`text-lg font-bold ${
          cuna.scoreTecnico >= 80 ? 'text-emerald-600' : 
          cuna.scoreTecnico >= 60 ? 'text-amber-600' : 'text-red-600'
        }`}>
          {cuna.scoreTecnico}%
        </div>
        <p className="text-xs text-slate-400">Técnico</p>
      </div>
      <div className="text-center">
        <div className={`text-lg font-bold ${
          cuna.scoreBrandSafety >= 80 ? 'text-emerald-600' : 
          cuna.scoreBrandSafety >= 60 ? 'text-amber-600' : 'text-red-600'
        }`}>
          {cuna.scoreBrandSafety}%
        </div>
        <p className="text-xs text-slate-400">Brand</p>
      </div>
    </div>

    {/* Vigencia */}
    <div className="hidden md:flex flex-col items-center px-4 min-w-[100px]">
      <div className={`text-sm font-medium ${
        cuna.diasRestantes <= 1 ? 'text-red-600' :
        cuna.diasRestantes <= 7 ? 'text-amber-600' : 'text-slate-600'
      }`}>
        {cuna.diasRestantes <= 0 ? 'Vencida' : `${cuna.diasRestantes} días`}
      </div>
      <p className="text-xs text-slate-400">Vigencia</p>
    </div>

    {/* Emisiones */}
    <div className="hidden lg:flex flex-col items-center px-4 min-w-[80px]">
      <p className="text-lg font-bold text-slate-800">{cuna.totalEmisiones}</p>
      <p className="text-xs text-slate-400">emisiones</p>
    </div>

    {/* NUEVA: Emisora y Próxima Emisión */}
    {cuna.programacion && (
      <div className="hidden xl:flex flex-col gap-2 px-4 min-w-[180px]">
        <EmisoraChip 
          nombre={cuna.programacion.emisoraNombre} 
          logo={cuna.programacion.emisoraLogo} 
        />
        <div className="flex items-center gap-2">
          <TiempoRestanteBadge proximaEmision={cuna.programacion.proximaEmision} />
          <span className="text-xs text-slate-500">{cuna.programacion.horarioBloque}</span>
        </div>
      </div>
    )}

    {/* NUEVA: Info de Programación Detallada (pantallas grandes) */}
    {cuna.programacion && (
      <div className="hidden 2xl:block px-3">
        <ProximaEmisionInfo 
          horarioBloque={cuna.programacion.horarioBloque}
          frecuencia={cuna.programacion.frecuencia}
          totalEmisoras={cuna.programacion.totalEmisorasHoy}
        />
      </div>
    )}

    {/* Estado */}
    <div className="px-4">
      <EstadoBadge estado={cuna.estado} />
    </div>

    {/* Acciones */}
    <div className="flex items-center gap-1">
      <button 
        onClick={() => onView(cuna.id)} 
        className="p-2 rounded-lg hover:bg-emerald-50 text-emerald-600 transition-colors"
        title="Ver detalle"
      >
        <Eye className="w-5 h-5" />
      </button>
      <button 
        onClick={() => onEdit(cuna.id)} 
        className="p-2 rounded-lg hover:bg-amber-50 text-amber-600 transition-colors"
        title="Editar"
      >
        <Edit3 className="w-5 h-5" />
      </button>
      <button 
        onClick={() => onActions(cuna.id, 'distribute')} 
        className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"
        title="Distribuir"
      >
        <Send className="w-5 h-5" />
      </button>
      <button 
        onClick={() => onActions(cuna.id, 'copy')} 
        className="p-2 rounded-lg hover:bg-purple-50 text-purple-600 transition-colors"
        title="Copiar"
      >
        <Copy className="w-5 h-5" />
      </button>
      <button 
        onClick={() => onActions(cuna.id, 'more')} 
        className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
        title="Más acciones"
      >
        <MoreVertical className="w-5 h-5" />
      </button>
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════

export default function CunasOperacionesPage() {
  const router = useRouter();
  
  // Estados
  const [cunas, setCunas] = useState<Cuna[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterTipo, setFilterTipo] = useState<string>('');
  const [filterEstado, setFilterEstado] = useState<string>('');
  const [filterUrgencia, setFilterUrgencia] = useState<string>('');
  const [playingId, setPlayingId] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [showFilters, setShowFilters] = useState(false);
  
  const [metricas, setMetricas] = useState<MetricasOperativas>({
    totalCunas: 0, enAire: 0, pendientesValidacion: 0, porVencer: 0,
    emisionesHoy: 0, tasaAprobacion: 0, cambioVsAyer: 0
  });
  
  const [alertas, setAlertas] = useState<AlertaOperativa[]>([]);
  
  // Estados para Operación 24/7
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [panicMode, setPanicMode] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0); // Para navegación con teclado

  // ─────────────────────────────────────────────────────────────
  // ATAJOS DE TECLADO (MODO OPERADOR PRO)
  // ─────────────────────────────────────────────────────────────
  useAtajosTeclado({
    habilitado: true,
    onPlay: () => {
      // Reproducir el seleccionado o el primero
      const cuna = cunas[selectedIndex];
      if (cuna) handlePlay(cuna.id);
    },
    onSeleccionarTodo: () => {
      if (selectedIds.size === cunas.length) {
        setSelectedIds(new Set());
      } else {
        setSelectedIds(new Set(cunas.map(c => c.id)));
      }
    },
    onGuardar: () => {
        // Aprobar seleccionados (Ctrl+S simulado como aprobar)
        if (selectedIds.size > 0) handleBulkAction('aprobar');
    },
    atajosPersonalizados: [
      {
        key: 'ArrowDown',
        action: () => setSelectedIndex(prev => Math.min(prev + 1, cunas.length - 1)),
        descripcion: 'Bajar selección'
      },
      {
        key: 'ArrowUp',
        action: () => setSelectedIndex(prev => Math.max(prev - 1, 0)),
        descripcion: 'Subir selección'
      },
      {
        key: 'k',
        ctrl: true,
        action: () => setPanicMode(true),
        descripcion: 'KILL SWITCH (Panic Button)'
      },
      {
        key: 'Escape',
        action: () => {
             setSelectedIds(new Set());
             setPanicMode(false);
        },
        descripcion: 'Cancelar selección/pánico'
      }
    ]
  });

  // ─────────────────────────────────────────────────────────────
  // HANDLERS MASIVOS & PÁNICO
  // ─────────────────────────────────────────────────────────────

  const toggleSelection = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const handleBulkAction = async (action: 'aprobar' | 'pausar' | 'eliminar') => {
    if (selectedIds.size === 0) return;
    
    // Optimistic Update Previo (Feedback Inmediato)
    const prevCunas = [...cunas];
    
    try {
        // Llamada al API
        const response = await fetch('/api/cunas', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                cunaIds: Array.from(selectedIds), 
                accion: action 
            })
        });

        if (!response.ok) throw new Error('Error en operación masiva');

        // Actualización de estado local
        setCunas(prev => {
            if (action === 'eliminar') {
                return prev.filter(c => !selectedIds.has(c.id));
            }
            return prev.map(c => {
                if (selectedIds.has(c.id)) {
                    let newStatus = c.estado;
                    if (action === 'aprobar') newStatus = 'aprobada';
                    // lógica de pausar
                    if (action === 'pausar') newStatus = 'pausada';
                    return { ...c, estado: newStatus };
                }
                return c;
            }) as Cuna[];
        });

        // Limpiar selección
        setSelectedIds(new Set());
        // Toast o notificación (usando alert por ahora si no hay toast configurado)
        // alert(`Acción ${action} completada en ${selectedIds.size} elementos.`);

    } catch (err) {
        /* console.error('Bulk Action Failed:', err) */;
        alert('Error al ejecutar acción masiva. Reversando cambios...');
        setCunas(prevCunas); // Rollback
    }
  };

  const handlePanicSwitch = async () => {
    if (confirm('🚨 ¿ACTIVAR KILL SWITCH? \n\nEsto detendrá INMEDIATAMENTE todas las emisiones en Aire (FM) y Digital.\n\n¿Estás seguro?')) {
      ;
      try {
          const res = await fetch('/api/system/panic', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                  reason: 'User Manual Activation',
                  timestamp: new Date().toISOString()
              })
          });
          
          if (!res.ok) throw new Error('Panic API Failed');

          alert('🛑 SISTEMA DETENIDO. Todas las pautas han sido canceladas y los streams silenciados.');
          setPanicMode(false);
          // Opcional: Recargar página o deshabilitar interfaz
      } catch (e) {
          /* console.error('PANIC FAILED:', e) */;
          alert('CRITICAL ERROR: No se pudo detener el sistema automáticamente. Contacte a soporte de emergencia.');
      }
    }
  };

  // ─────────────────────────────────────────────────────────────
  // DATA FETCHING
  // ─────────────────────────────────────────────────────────────

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Simular datos para demo
      const mockCunas: Cuna[] = [
        {
          id: 'cun-001', spxCodigo: 'SPX000001', nombre: 'Spot Verano Banco Chile 30s',
          tipo: 'audio', anuncianteNombre: 'Banco de Chile', producto: 'Cuenta Corriente',
          duracionSegundos: 30, duracionFormateada: '0:30', estado: 'en_aire', urgencia: 'programada',
          diasRestantes: 15, scoreTecnico: 92, scoreBrandSafety: 88, totalEmisiones: 156,
          fechaCreacion: '2025-01-25', esCritica: false,
          programacion: {
            emisoraId: 'emi-001',
            emisoraNombre: 'Radio Corazón',
            proximaEmision: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // en 2 horas
            horarioBloque: '15:30 - 17:00',
            frecuencia: 'Cada 30 min',
            totalEmisorasHoy: 4
          }
        },
        {
          id: 'cun-002', spxCodigo: 'SPX000002', nombre: 'Mención Coca-Cola Verano',
          tipo: 'mencion', anuncianteNombre: 'Coca-Cola Chile', producto: 'Coca-Cola Original',
          duracionSegundos: 25, duracionFormateada: '0:25', estado: 'aprobada', urgencia: 'urgente',
          diasRestantes: 3, scoreTecnico: 85, scoreBrandSafety: 95, totalEmisiones: 0,
          fechaCreacion: '2025-02-05', esCritica: true,
          programacion: {
            emisoraId: 'emi-002',
            emisoraNombre: 'FM Dos',
            proximaEmision: new Date(Date.now() + 45 * 60 * 1000).toISOString(), // en 45 min
            horarioBloque: '14:00 - 15:00',
            frecuencia: 'Cada 15 min',
            totalEmisorasHoy: 2
          }
        },
        {
          id: 'cun-003', spxCodigo: 'SPX000003', nombre: 'Presentación Programa Mañana',
          tipo: 'presentacion', anuncianteNombre: 'LATAM Airlines', producto: 'Vuelos Nacionales',
          duracionSegundos: 20, duracionFormateada: '0:20', estado: 'pendiente_validacion', urgencia: 'urgente',
          diasRestantes: 5, scoreTecnico: 78, scoreBrandSafety: 90, totalEmisiones: 0,
          fechaCreacion: '2025-02-08', esCritica: false,
          programacion: {
            emisoraId: 'emi-003',
            emisoraNombre: 'Pudahuel',
            proximaEmision: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // en 10 min - crítico!
            horarioBloque: '08:00 - 10:00',
            frecuencia: 'Cada hora',
            totalEmisorasHoy: 3
          }
        },
        {
          id: 'cun-004', spxCodigo: 'SPX000004', nombre: 'Jingle Falabella Black Friday',
          tipo: 'jingle', anuncianteNombre: 'Falabella', producto: 'Black Friday',
          duracionSegundos: 45, duracionFormateada: '0:45', estado: 'finalizada', urgencia: 'standby',
          diasRestantes: 0, scoreTecnico: 95, scoreBrandSafety: 92, totalEmisiones: 480,
          fechaCreacion: '2025-01-10', esCritica: false
          // Sin programación - ya finalizada
        },
        {
          id: 'cun-005', spxCodigo: 'SPX000005', nombre: 'Cierre Programa Tarde',
          tipo: 'cierre', anuncianteNombre: 'Entel', producto: 'Plan Familia',
          duracionSegundos: 15, duracionFormateada: '0:15', estado: 'en_aire', urgencia: 'programada',
          diasRestantes: 10, scoreTecnico: 88, scoreBrandSafety: 85, totalEmisiones: 78,
          fechaCreacion: '2025-01-20', esCritica: false,
          programacion: {
            emisoraId: 'emi-004',
            emisoraNombre: 'ADN Radio',
            proximaEmision: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString(), // en 5 horas
            horarioBloque: '18:00 - 20:00',
            frecuencia: 'Cada hora',
            totalEmisorasHoy: 1
          }
        },
        {
          id: 'cun-006', spxCodigo: 'SPX000006', nombre: 'Promo Evento Lollapalooza',
          tipo: 'promo_ida', anuncianteNombre: 'Lollapalooza Chile', producto: 'Festival 2025',
          duracionSegundos: 35, duracionFormateada: '0:35', estado: 'borrador', urgencia: 'critica',
          diasRestantes: 1, scoreTecnico: 0, scoreBrandSafety: 0, totalEmisiones: 0,
          fechaCreacion: '2025-02-10', esCritica: true
        }
      ];
      
      setCunas(mockCunas);
      
      // Calcular métricas
      setMetricas({
        totalCunas: mockCunas.length,
        enAire: mockCunas.filter(c => c.estado === 'en_aire').length,
        pendientesValidacion: mockCunas.filter(c => c.estado === 'pendiente_validacion').length,
        porVencer: mockCunas.filter(c => c.diasRestantes <= 7 && c.diasRestantes > 0).length,
        emisionesHoy: 45,
        tasaAprobacion: 87,
        cambioVsAyer: 12
      });
      
      // Alertas mock
      setAlertas([
        { id: 'a1', tipo: 'vencimiento', prioridad: 'critica', mensaje: 'Cuña vence mañana', cunaId: 'cun-006', cunaCodigo: 'SPX000006', accion: 'Resolver' },
        { id: 'a2', tipo: 'validacion', prioridad: 'alta', mensaje: 'Pendiente validación técnica', cunaId: 'cun-003', cunaCodigo: 'SPX000003', accion: 'Validar' },
        { id: 'a3', tipo: 'distribucion', prioridad: 'media', mensaje: '2 confirmaciones pendientes', cunaId: 'cun-002', cunaCodigo: 'SPX000002', accion: 'Ver' }
      ]);
      
    } catch (error) {
      /* console.error('Error:', error) */;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ─────────────────────────────────────────────────────────────
  // FILTRADO
  // ─────────────────────────────────────────────────────────────

  const cunasFiltradas = useMemo(() => {
    return cunas.filter(cuna => {
      const matchSearch = !search || 
        cuna.nombre.toLowerCase().includes(search.toLowerCase()) ||
        cuna.spxCodigo.toLowerCase().includes(search.toLowerCase()) ||
        cuna.anuncianteNombre.toLowerCase().includes(search.toLowerCase());
      
      const matchTipo = !filterTipo || cuna.tipo === filterTipo;
      const matchEstado = !filterEstado || cuna.estado === filterEstado;
      const matchUrgencia = !filterUrgencia || cuna.urgencia === filterUrgencia;
      
      return matchSearch && matchTipo && matchEstado && matchUrgencia;
    });
  }, [cunas, search, filterTipo, filterEstado, filterUrgencia]);

  // ─────────────────────────────────────────────────────────────
  // HANDLERS
  // ─────────────────────────────────────────────────────────────

  const handlePlay = (id: string) => {
    setPlayingId(playingId === id ? null : id);
  };

  const handleView = (id: string) => {
    router.push(`/cunas/${id}`);
  };

  const handleEdit = (id: string) => {
    router.push(`/cunas/${id}/editar`);
  };

  const handleActions = (id: string, action: string) => {
    ;
    // Implementar acciones
  };

  const handleResolveAlert = (id: string) => {
    setAlertas(prev => prev.filter(a => a.id !== id));
  };

  // ─────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-slate-50/50 relative p-6 lg:p-8">
      {/* Decorative Orbs */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-emerald-100/40 to-transparent pointer-events-none mix-blend-multiply"></div>
      
      <div className="max-w-[1920px] mx-auto space-y-6 relative z-10">
        
        {/* ═══════════════════════════════════════════════════════════ */}
        {/* HEADER OPERATIVO */}
        {/* ═══════════════════════════════════════════════════════════ */}
        
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 via-emerald-600 to-slate-800 bg-clip-text text-transparent flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg">
                <Music className="w-8 h-8 text-white" />
              </div>
              Centro de Operaciones - Cuñas
            </h1>
            <p className="text-slate-500 mt-2 flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Sistema enterprise 24/7 • TIER 0 Fortune 10
            </p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <NeuromorphicButton variant="secondary" onClick={() => router.push('/cunas/subir')}>
              <Upload className="w-5 h-5" /> Subir Audio
            </NeuromorphicButton>
            <NeuromorphicButton variant="secondary" onClick={() => router.push('/cunas/generar-ia')}>
              <Sparkles className="w-5 h-5" /> Generar con IA
            </NeuromorphicButton>
            <NeuromorphicButton variant="primary" onClick={() => router.push('/cunas/nuevo')}>
              <Plus className="w-5 h-5" /> Nueva Cuña
            </NeuromorphicButton>
            
            {/* KILL SWITCH (TIER X SAFETY) */}
            <button 
              onClick={() => setPanicMode(true)}
              className="
                flex items-center gap-2 px-5 py-2.5 rounded-xl 
                bg-red-500/90 backdrop-blur-md text-white border border-red-400/50 
                shadow-[0_8px_20px_rgba(239,68,68,0.25)]
                hover:shadow-[0_12px_25px_rgba(239,68,68,0.4)] hover:bg-red-500 hover:scale-105
                transition-all font-bold tracking-wider
              "
              title="Detener todas las emisiones (Ctrl+K)"
            >
              <ShieldAlert className="w-5 h-5" />
              <span className="hidden lg:inline">PANIC STOP</span>
            </button>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* ACCESO RÁPIDO A SECCIONES */}
        {/* ═══════════════════════════════════════════════════════════ */}
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <button
            onClick={() => router.push('/cunas/dashboard')}
            className="flex items-center gap-3 p-4 bg-white/70 backdrop-blur-md rounded-xl border border-slate-200/60 shadow-sm hover:shadow-md hover:bg-white transition-all hover:scale-[1.02] group"
          >
            <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200 text-indigo-600 shadow-sm group-hover:scale-110 group-hover:bg-indigo-500 group-hover:text-white transition-all">
              <BarChart2 className="w-5 h-5" />
            </div>
            <div className="text-left">
              <p className="font-bold text-slate-800 text-sm">Dashboard</p>
              <p className="text-xs font-medium text-slate-500">Vista gerencial</p>
            </div>
          </button>
          
          <button
            onClick={() => router.push('/cunas/programacion')}
            className="flex items-center gap-3 p-4 bg-white/70 backdrop-blur-md rounded-xl border border-slate-200/60 shadow-sm hover:shadow-md hover:bg-white transition-all hover:scale-[1.02] group"
          >
            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 text-purple-600 shadow-sm group-hover:scale-110 group-hover:bg-purple-500 group-hover:text-white transition-all">
              <Calendar className="w-5 h-5" />
            </div>
            <div className="text-left">
              <p className="font-bold text-slate-800 text-sm">Programación</p>
              <p className="text-xs font-medium text-slate-500">Bloques horarios</p>
            </div>
          </button>
          
          <button
            onClick={() => router.push('/cunas/inbox')}
            className="flex items-center gap-3 p-4 bg-white/70 backdrop-blur-md rounded-xl border border-slate-200/60 shadow-sm hover:shadow-md hover:bg-white transition-all hover:scale-[1.02] group relative"
          >
            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 text-blue-600 shadow-sm group-hover:scale-110 group-hover:bg-blue-500 group-hover:text-white transition-all">
              <Mail className="w-5 h-5" />
            </div>
            <div className="text-left">
              <p className="font-bold text-slate-800 text-sm">Inbox</p>
              <p className="text-xs font-medium text-slate-500">Cuñas entrantes</p>
            </div>
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">3</span>
          </button>
          
          <button
            onClick={() => router.push('/cunas/material-pendiente')}
            className="flex items-center gap-3 p-4 bg-white/70 backdrop-blur-md rounded-xl border border-slate-200/60 shadow-sm hover:shadow-md hover:bg-white transition-all hover:scale-[1.02] group"
          >
            <div className="p-2 rounded-lg bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200 text-amber-600 shadow-sm group-hover:scale-110 group-hover:bg-amber-500 group-hover:text-white transition-all">
              <Clock className="w-5 h-5" />
            </div>
            <div className="text-left">
              <p className="font-bold text-slate-800 text-sm">Material</p>
              <p className="text-xs font-medium text-slate-500">Pendiente entrega</p>
            </div>
          </button>
          
          <button
            onClick={() => router.push('/cunas/presentacion')}
            className="flex items-center gap-3 p-4 bg-white/70 backdrop-blur-md rounded-xl border border-slate-200/60 shadow-sm hover:shadow-md hover:bg-white transition-all hover:scale-[1.02] group"
          >
            <div className="p-2 rounded-lg bg-gradient-to-br from-pink-50 to-pink-100 border border-pink-200 text-pink-600 shadow-sm group-hover:scale-110 group-hover:bg-pink-500 group-hover:text-white transition-all">
              <ExternalLink className="w-5 h-5" />
            </div>
            <div className="text-left">
              <p className="font-bold text-slate-800 text-sm">Presentación</p>
              <p className="text-xs font-medium text-slate-500">Modo ventas</p>
            </div>
          </button>
          
          <button
            onClick={() => router.push('/cunas/digital')}
            className="flex items-center gap-3 p-4 bg-white/70 backdrop-blur-md rounded-xl border border-slate-200/60 shadow-sm hover:shadow-md hover:bg-white transition-all hover:scale-[1.02] group"
          >
            <div className="p-2 rounded-lg bg-gradient-to-br from-teal-50 to-teal-100 border border-teal-200 text-teal-600 shadow-sm group-hover:scale-110 group-hover:bg-teal-500 group-hover:text-white transition-all">
              <Target className="w-5 h-5" />
            </div>
            <div className="text-left">
              <p className="font-bold text-slate-800 text-sm">Digital</p>
              <p className="text-xs font-medium text-slate-500">Activos digitales</p>
            </div>
          </button>
        </div>

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* MÉTRICAS EN TIEMPO REAL */}
        {/* ═══════════════════════════════════════════════════════════ */}
        
        <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          <MetricaCard 
            label="Total Cuñas" 
            value={metricas.totalCunas} 
            icon={Music}
            color="from-emerald-400 to-emerald-500"
          />
          <MetricaCard 
            label="En Aire" 
            value={metricas.enAire} 
            icon={Volume2}
            color="from-blue-400 to-blue-500"
            trend="up"
            trendValue="+2 hoy"
          />
          <MetricaCard 
            label="Pendientes" 
            value={metricas.pendientesValidacion} 
            icon={AlertCircle}
            color="from-amber-400 to-amber-500"
          />
          <MetricaCard 
            label="Por Vencer" 
            value={metricas.porVencer} 
            icon={Clock}
            color="from-orange-400 to-orange-500"
          />
          <MetricaCard 
            label="Emisiones Hoy" 
            value={metricas.emisionesHoy} 
            icon={TrendingUp}
            color="from-purple-400 to-purple-500"
            trend="up"
            trendValue={`+${metricas.cambioVsAyer}%`}
          />
          <MetricaCard 
            label="Tasa Aprobación" 
            value={`${metricas.tasaAprobacion}%`} 
            icon={Target}
            color="from-cyan-400 to-cyan-500"
          />
        </div>

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* CONTENIDO PRINCIPAL */}
        {/* ═══════════════════════════════════════════════════════════ */}
        
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          
          {/* LISTA DE CUÑAS */}
          <div className="xl:col-span-3 space-y-4">
            
            {/* Barra de búsqueda y filtros */}
            <NeuromorphicCard>
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Búsqueda */}
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Buscar cuñas por código, nombre o anunciante..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full rounded-xl py-3 pl-12 pr-4 bg-white/80 border border-slate-200 focus:bg-white focus:outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10 text-slate-800 font-medium shadow-sm transition-all placeholder:text-slate-400"
                  />
                </div>
                
                {/* Filtros rápidos */}
                <div className="flex gap-2 flex-wrap">
                  <select 
                    value={filterTipo} 
                    onChange={(e) => setFilterTipo(e.target.value)}
                    className="rounded-xl py-3 px-4 bg-white/80 border border-slate-200 focus:bg-white focus:outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10 text-slate-800 text-sm font-medium shadow-sm transition-all cursor-pointer"
                  >
                    <option value="">Todos los tipos</option>
                    <option value="audio">Audio</option>
                    <option value="mencion">Mención</option>
                    <option value="presentacion">Presentación</option>
                    <option value="cierre">Cierre</option>
                    <option value="promo_ida">Promo IDA</option>
                    <option value="jingle">Jingle</option>
                  </select>
                  
                  <select 
                    value={filterEstado} 
                    onChange={(e) => setFilterEstado(e.target.value)}
                    className="rounded-xl py-3 px-4 bg-white/80 border border-slate-200 focus:bg-white focus:outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10 text-slate-800 text-sm font-medium shadow-sm transition-all cursor-pointer"
                  >
                    <option value="">Todos los estados</option>
                    <option value="en_aire">En Aire</option>
                    <option value="aprobada">Aprobada</option>
                    <option value="pendiente_validacion">Pendiente</option>
                    <option value="borrador">Borrador</option>
                    <option value="pausada">Pausada</option>
                    <option value="vencida">Vencida</option>
                  </select>
                  
                  <select 
                    value={filterUrgencia} 
                    onChange={(e) => setFilterUrgencia(e.target.value)}
                    className="rounded-xl py-3 px-4 bg-white/80 border border-slate-200 focus:bg-white focus:outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10 text-slate-800 text-sm font-medium shadow-sm transition-all cursor-pointer"
                  >
                    <option value="">Todas las urgencias</option>
                    <option value="critica">🔴 Crítica</option>
                    <option value="urgente">🟠 Urgente</option>
                    <option value="programada">🔵 Programada</option>
                    <option value="standby">⚪ Standby</option>
                  </select>
                  
                  <NeuromorphicButton variant="secondary" onClick={fetchData}>
                    <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                  </NeuromorphicButton>
                </div>
              </div>
              
              <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
                <span>{cunasFiltradas.length} cuñas encontradas</span>
                <div className="flex gap-2">
                  <button className="px-3 py-1 rounded-lg hover:bg-slate-100 transition-colors flex items-center gap-1">
                    <BarChart2 className="w-4 h-4" /> Dashboard
                  </button>
                  <button className="px-3 py-1 rounded-lg hover:bg-slate-100 transition-colors flex items-center gap-1">
                    <Download className="w-4 h-4" /> Exportar
                  </button>
                </div>
              </div>
            </NeuromorphicCard>

            {/* Lista de cuñas */}
            <NeuromorphicCard className="p-4">
              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <RefreshCw className="w-10 h-10 animate-spin text-emerald-500" />
                </div>
              ) : cunasFiltradas.length === 0 ? (
                <div className="text-center py-16">
                  <Music className="w-20 h-20 text-slate-200 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-slate-600">No hay cuñas</h3>
                  <p className="text-slate-400 mt-2">Crea tu primera cuña o ajusta los filtros</p>
                  <NeuromorphicButton variant="primary" className="mt-6" onClick={() => router.push('/cunas/nuevo')}>
                    <Plus className="w-5 h-5" /> Nueva Cuña
                  </NeuromorphicButton>
                </div>
              ) : (
                <div className="space-y-3 relative">
                  {/* Bulk Actions Bar */}
                  {selectedIds.size > 0 && (
                      <div className="sticky top-4 z-50 p-4 rounded-xl bg-slate-800 text-white shadow-2xl flex items-center justify-between animate-in slide-in-from-top-4 mb-4">
                          <div className="flex items-center gap-4">
                              <span className="font-bold flex items-center gap-2">
                                  <CheckSquare className="w-5 h-5 text-emerald-400" />
                                  {selectedIds.size} seleccionados
                              </span>
                              <div className="h-6 w-px bg-slate-600" />
                              <button onClick={() => setSelectedIds(new Set())} className="text-sm text-slate-400 hover:text-white">
                                  Cancelar
                              </button>
                          </div>
                          <div className="flex items-center gap-2">
                              <button onClick={() => handleBulkAction('aprobar')} className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-sm font-medium transition-colors">
                                  Aprobar
                              </button>
                              <button onClick={() => handleBulkAction('pausar')} className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 rounded-lg text-sm font-medium transition-colors">
                                  Pausar
                              </button>
                              <button onClick={() => handleBulkAction('eliminar')} className="px-3 py-1.5 bg-red-600 hover:bg-red-500 rounded-lg text-sm font-medium transition-colors">
                                  Eliminar
                              </button>
                          </div>
                      </div>
                  )}

                  {cunasFiltradas.map((cuna, index) => (
                    <div key={cuna.id} className={`relative group transition-all ${index === selectedIndex ? 'ring-2 ring-violet-400 ring-offset-2 rounded-xl' : ''}`}>
                       {/* Checkbox de Selección */}
                       <div className="absolute left-[-40px] top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-20 hidden xl:block">
                          <button onClick={() => toggleSelection(cuna.id)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                              {selectedIds.has(cuna.id) ? (
                                  <CheckSquare className="w-6 h-6 text-emerald-500" />
                              ) : (
                                  <Square className="w-6 h-6 text-slate-300 hover:text-emerald-400" />
                              )}
                          </button>
                       </div>
                       
                       {/* Visual Feedback de Selección */}
                       {selectedIds.has(cuna.id) && (
                          <div className="absolute inset-0 border-2 border-emerald-500 rounded-xl pointer-events-none z-10 bg-emerald-50/10" />
                       )}

                        <CunaRow
                          cuna={cuna}
                          onPlay={handlePlay}
                          onView={handleView}
                          onEdit={handleEdit}
                          onActions={handleActions}
                          isPlaying={playingId === cuna.id}
                        />
                    </div>
                  ))}
                </div>
              )}
            </NeuromorphicCard>
          </div>

          {/* Modal de Pánico (Global) */}
          {panicMode && (
              <div className="fixed inset-0 z-[100] bg-red-900/90 backdrop-blur-md flex items-center justify-center animate-in fade-in duration-200">
                  <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-lg w-full text-center space-y-6 border-4 border-red-500">
                      <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto animate-pulse">
                          <ShieldAlert className="w-12 h-12 text-red-600" />
                      </div>
                      <div>
                          <h2 className="text-3xl font-black text-red-600">KILL SWITCH</h2>
                          <p className="text-slate-600 mt-2 text-lg">
                              Estás a punto de detener <strong className="text-red-600">TODAS</strong> las emisiones activas.
                              <br/>
                              Esta acción es irreversible y notificará a Gerencia.
                          </p>
                      </div>
                      
                      <div className="flex gap-4 pt-4">
                          <button 
                              onClick={() => setPanicMode(false)}
                              className="flex-1 py-4 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-colors"
                          >
                              CANCELAR (Esc)
                          </button>
                          <button 
                              onClick={handlePanicSwitch}
                              className="flex-1 py-4 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 shadow-xl hover:shadow-2xl hover:scale-105 transition-all"
                          >
                              CONFIRMAR DETENCIÓN
                          </button>
                      </div>
                  </div>
              </div>
          )}
          
          {/* Espaciador o cierre correcto si necesario */}

          {/* PANEL LATERAL - ALERTAS */}
          <div className="xl:col-span-1">
            <AlertasPanel 
              alertas={alertas} 
              onResolve={handleResolveAlert} 
              onRefresh={fetchData}
              loading={loading}
            />
          </div>
          
        </div>

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* FOOTER */}
        {/* ═══════════════════════════════════════════════════════════ */}
        
        <div className="text-center text-slate-400 text-sm py-4">
          <p className="flex items-center justify-center gap-2">
            <Music className="w-4 h-4" />
            Centro de Operaciones de Cuñas • SILEXAR PULSE TIER 0 • 
            <span className="text-emerald-500">Sistema Operativo 24/7</span>
          </p>
        </div>
      </div>
    </div>
  );
}
