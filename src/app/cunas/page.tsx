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
import { useDebounce } from '@/hooks/use-debounce';
import { useRouter } from 'next/navigation';
import { 
  Music, Search, Plus, Upload, Clock, RefreshCw,
  AlertCircle, Volume2, Mail, Download,
  Calendar, TrendingUp, BarChart2,
  Sparkles,
  Target, Activity, ExternalLink,
  ShieldAlert, CheckSquare, Square,
  ArrowLeft
} from 'lucide-react';
import useAtajosTeclado from '@/app/campanas/crear/components/WizardCampana/hooks/useAtajosTeclado';

// Módulos extraídos
import type { Cuna, MetricasOperativas, AlertaOperativa } from './_lib/types';
import {
  NeuromorphicCard, NeuromorphicButton,
  MetricaCard
} from './_lib/components';
import { AlertasPanel } from './_lib/AlertasPanel';
import { CunaRow } from './_lib/CunaRow';
import { DraggableWindow } from './_lib/DraggableWindow';

// AlertasPanel and CunaRow extracted to ./_lib/AlertasPanel.tsx and ./_lib/CunaRow.tsx

// ═══════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════

export default function CunasOperacionesPage() {
  const router = useRouter();
  
  // Estados
  const [cunas, setCunas] = useState<Cuna[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
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
  
  // Estados para Operación 24/7 y Ventanas Flotantes Neumórficas
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [panicMode, setPanicMode] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0); // Para navegación con teclado
  const [windowCunaOpen, setWindowCunaOpen] = useState(false);
  const [windowCunaId, setWindowCunaId] = useState<string | null>(null);

  // ─────────────────────────────────────────────────────────────
  // ATAJOS DE TECLADO (MODO OPERADOR PRO)
  // ─────────────────────────────────────────────────────────────
  useAtajosTeclado({
    habilitado: true,
    onPlay: () => {
      // Safe array access using at() method
      const cuna = cunas.at(selectedIndex);
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

    } catch (_err) {
        alert('Error al ejecutar acción masiva. Reversando cambios...');
        setCunas(prevCunas); // Rollback
    }
  };

  const handlePanicSwitch = async () => {
    if (confirm('🚨 ¿ACTIVAR KILL SWITCH? \n\nEsto detendrá INMEDIATAMENTE todas las emisiones en Aire (FM) y Digital.\n\n¿Estás seguro?')) {
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
      } catch (_e) {
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
      
    } catch (_error) {
      // Error silenciado - manejo en UI
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
      const matchSearch = !debouncedSearch ||
        cuna.nombre.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        cuna.spxCodigo.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        cuna.anuncianteNombre.toLowerCase().includes(debouncedSearch.toLowerCase());
      
      const matchTipo = !filterTipo || cuna.tipo === filterTipo;
      const matchEstado = !filterEstado || cuna.estado === filterEstado;
      const matchUrgencia = !filterUrgencia || cuna.urgencia === filterUrgencia;
      
      return matchSearch && matchTipo && matchEstado && matchUrgencia;
    });
  }, [cunas, debouncedSearch, filterTipo, filterEstado, filterUrgencia]);

  // ─────────────────────────────────────────────────────────────
  // HANDLERS
  // ─────────────────────────────────────────────────────────────

  const handlePlay = (id: string) => {
    setPlayingId(playingId === id ? null : id);
  };

  const handleView = (id: string) => {
    // Abre en la ventana flotante en lugar de rutear
    setWindowCunaId(id);
    setWindowCunaOpen(true);
  };

  const handleEdit = (id: string) => {
    router.push(`/cunas/${id}/editar`);
  };

  const handleActions = (_id: string, _action: string) => {
    // Implementar acciones
  };

  const handleResolveAlert = (id: string) => {
    setAlertas(prev => prev.filter(a => a.id !== id));
  };

  // ─────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────

  const N = { base: '#dfeaff', dark: '#bec8de', light: '#ffffff', accent: '#6888ff', text: '#69738c', textSub: '#9aa3b8' };
  const shadowOut = (s: number) => `${s}px ${s}px ${s*2}px ${N.dark}, -${s}px -${s}px ${s*2}px ${N.light}`;

  return (
    <div className="min-h-screen relative p-6 lg:p-8 overflow-hidden" style={{ background: N.base, color: N.text }}>
      <div className="max-w-[1920px] mx-auto space-y-6 relative z-10">

        {/* HEADER OPERATIVO */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/dashboard')} className="flex items-center justify-center w-9 h-9 rounded-xl transition-all" title="Volver al Dashboard"
              style={{ background: N.base, boxShadow: shadowOut(3), color: N.textSub }}>
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="p-3 rounded-xl" style={{ background: '#22c55e', boxShadow: shadowOut(3) }}>
              <Music className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight" style={{ color: N.text }}>Centro de Operaciones — Cuñas</h1>
              <p className="text-xs font-bold flex items-center gap-2" style={{ color: N.textSub }}>
                <Activity className="w-3 h-3" /> Sistema 24/7 · TIER 0 Fortune 10
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <NeuromorphicButton variant="secondary" onClick={() => router.push('/cunas/subir')}>
              <Upload className="w-4 h-4" /> Subir Audio
            </NeuromorphicButton>
            <NeuromorphicButton variant="secondary" onClick={() => router.push('/cunas/generar-ia')}>
              <Sparkles className="w-4 h-4" /> Generar IA
            </NeuromorphicButton>
            <NeuromorphicButton variant="primary" onClick={() => router.push('/cunas/nuevo')}>
              <Plus className="w-4 h-4" /> Nueva Cuña
            </NeuromorphicButton>
            <button onClick={() => setPanicMode(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-white font-bold text-xs tracking-wider transition-all hover:scale-105"
              style={{ background: '#ef4444', boxShadow: '4px 4px 10px #bec8de,-2px -2px 6px #ffffff' }}
              title="Detener todas las emisiones (Ctrl+K)">
              <ShieldAlert className="w-4 h-4" />
              <span className="hidden lg:inline">PANIC STOP</span>
            </button>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* ACCESO RÁPIDO A SECCIONES */}
        {/* ═══════════════════════════════════════════════════════════ */}
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { href: '/cunas/dashboard',      icon: BarChart2,    label: 'Dashboard',      desc: 'Vista gerencial',     color: '#6888ff' },
            { href: '/cunas/programacion',   icon: Calendar,     label: 'Programación',   desc: 'Bloques horarios',    color: '#a855f7' },
            { href: '/cunas/inbox',          icon: Mail,         label: 'Inbox',          desc: 'Cuñas entrantes',     color: '#3b82f6', badge: 3 },
            { href: '/cunas/material-pendiente', icon: Clock,    label: 'Material',       desc: 'Pendiente entrega',   color: '#f59e0b' },
            { href: '/cunas/presentacion',   icon: ExternalLink, label: 'Presentación',   desc: 'Modo ventas',         color: '#ec4899' },
            { href: '/cunas/digital',        icon: Target,       label: 'Digital',        desc: 'Activos digitales',   color: '#14b8a6' },
          ].map(item => (
            <button key={item.href} onClick={() => router.push(item.href)}
              className="relative flex items-center gap-3 p-4 rounded-2xl transition-all hover:scale-[1.01] group text-left"
              style={{ background: N.base, boxShadow: shadowOut(4) }}
            >
              <div className="p-2 rounded-lg transition-all shrink-0" style={{ background: N.base, boxShadow: `inset 2px 2px 4px ${N.dark}, inset -2px -2px 4px ${N.light}` }}>
                <item.icon className="w-5 h-5" style={{ color: item.color }} />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-sm truncate" style={{ color: N.text }}>{item.label}</p>
                <p className="text-[10px] font-semibold truncate" style={{ color: N.textSub }}>{item.desc}</p>
              </div>
              {'badge' in item && (
                <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center text-[10px] font-black text-white rounded-full" style={{ background: '#ef4444', boxShadow: '2px 2px 4px #bec8de' }}>{item.badge}</span>
              )}
            </button>
          ))}
        </div>

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* MÉTRICAS EN TIEMPO REAL */}
        {/* ═══════════════════════════════════════════════════════════ */}
        
        <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          <MetricaCard label="Total Cuñas" value={metricas.totalCunas} icon={Music} color="#22c55e" />
          <MetricaCard label="En Aire" value={metricas.enAire} icon={Volume2} color="#3b82f6" trend="up" trendValue="+2 hoy" />
          <MetricaCard label="Pendientes" value={metricas.pendientesValidacion} icon={AlertCircle} color="#f59e0b" />
          <MetricaCard label="Por Vencer" value={metricas.porVencer} icon={Clock} color="#f97316" />
          <MetricaCard label="Emisiones Hoy" value={metricas.emisionesHoy} icon={TrendingUp} color="#a855f7" trend="up" trendValue={`+${metricas.cambioVsAyer}%`} />
          <MetricaCard label="Tasa Aprobación" value={`${metricas.tasaAprobacion}%`} icon={Target} color="#14b8a6" />
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
                    aria-label="Buscar cuñas"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full rounded-xl py-3 pl-12 pr-4 bg-[#EAF0F6] shadow-[inset_4px_4px_8px_#c8d0d8,inset_-4px_-4px_8px_#ffffff] focus:outline-none focus:ring-2 focus:ring-emerald-500/30 text-slate-700 font-bold transition-all placeholder:text-slate-400"
                  />
                </div>
                
                {/* Filtros rápidos */}
                <div className="flex gap-2 flex-wrap">
                  <select 
                    value={filterTipo} 
                    onChange={(e) => setFilterTipo(e.target.value)}
                    className="rounded-xl py-3 px-4 bg-[#EAF0F6] shadow-[inset_4px_4px_8px_#c8d0d8,inset_-4px_-4px_8px_#ffffff] focus:outline-none focus:ring-2 focus:ring-emerald-500/30 text-slate-700 text-sm font-bold transition-all cursor-pointer"
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
                    className="rounded-xl py-3 px-4 bg-[#EAF0F6] shadow-[inset_4px_4px_8px_#c8d0d8,inset_-4px_-4px_8px_#ffffff] focus:outline-none focus:ring-2 focus:ring-emerald-500/30 text-slate-700 text-sm font-bold transition-all cursor-pointer"
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
                    className="rounded-xl py-3 px-4 bg-[#EAF0F6] shadow-[inset_4px_4px_8px_#c8d0d8,inset_-4px_-4px_8px_#ffffff] focus:outline-none focus:ring-2 focus:ring-emerald-500/30 text-slate-700 text-sm font-bold transition-all cursor-pointer"
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
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={`skeleton-${i}`} className="flex items-center gap-4 p-4 rounded-xl bg-[#F5F2EE] shadow-[inset_3px_3px_8px_#D4D1CC,inset_-3px_-3px_8px_#FFFFFF]">
                      <div className="w-10 h-10 rounded-lg animate-pulse bg-[#E8E5E0]" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 animate-pulse bg-[#E8E5E0] rounded w-2/5" />
                        <div className="h-3 animate-pulse bg-[#E8E5E0] rounded w-1/3" />
                      </div>
                      <div className="h-6 w-16 animate-pulse bg-[#E8E5E0] rounded-full" />
                    </div>
                  ))}
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

          {/* Modal de Pánico (Global) - NEUMORPHIC FIXED */}
          {panicMode && (
              <div className="fixed inset-0 z-[100] bg-[#EAF0F6]/80 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-200">
                  <div className="bg-[#EAF0F6] p-8 rounded-3xl shadow-[12px_12px_24px_#c8d0d8,-12px_-12px_24px_#ffffff] max-w-lg w-full text-center space-y-6">
                      <div className="w-24 h-24 rounded-full shadow-[inset_6px_6px_12px_#c8d0d8,inset_-6px_-6px_12px_#ffffff] flex items-center justify-center mx-auto animate-pulse">
                          <ShieldAlert className="w-12 h-12 text-red-600" />
                      </div>
                      <div>
                          <h2 className="text-3xl font-black text-red-600 tracking-wider">KILL SWITCH</h2>
                          <p className="text-slate-600 mt-2 text-lg font-bold">
                              Estás a punto de detener <strong className="text-red-600">TODAS</strong> las emisiones activas.
                              <br/>
                              Esta acción es irreversible y notificará a Gerencia.
                          </p>
                      </div>
                      
                      <div className="flex gap-4 pt-4">
                          <button 
                              onClick={() => setPanicMode(false)}
                              className="flex-1 py-4 rounded-xl font-bold text-slate-500 shadow-[8px_8px_16px_#c8d0d8,-8px_-8px_16px_#ffffff] active:shadow-[inset_4px_4px_8px_#c8d0d8,inset_-4px_-4px_8px_#ffffff] transition-all"
                          >
                              CANCELAR (Esc)
                          </button>
                          <button 
                              onClick={handlePanicSwitch}
                              className="flex-1 py-4 rounded-xl font-bold text-red-600 shadow-[8px_8px_16px_#c8d0d8,-8px_-8px_16px_#ffffff] active:shadow-[inset_4px_4px_8px_#c8d0d8,inset_-4px_-4px_8px_#ffffff] transition-all"
                          >
                              CONFIRMAR DETENCIÓN
                          </button>
                      </div>
                  </div>
              </div>
          )}
          
          {/* WINDOW FLOTANTE PARA VER DETALLE (Paradigma Neumórfico OS) */}
          <DraggableWindow 
            id="ventana-detalle"
            title={`Detalle Cuña: ${cunas.find(c => c.id === windowCunaId)?.spxCodigo || 'Seleccionada'}`}
            isOpen={windowCunaOpen}
            onClose={() => setWindowCunaOpen(false)}
          >
             {windowCunaId && (
                <div className="space-y-4">
                   <div className="p-4 rounded-xl shadow-[inset_4px_4px_8px_#c8d0d8,inset_-4px_-4px_8px_#ffffff] flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full shadow-[8px_8px_16px_#c8d0d8,-8px_-8px_16px_#ffffff] flex items-center justify-center bg-[#EAF0F6]">
                        <Volume2 className="w-8 h-8 text-indigo-500" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-700">{cunas.find(c => c.id === windowCunaId)?.nombre}</h3>
                        <p className="text-slate-500">{cunas.find(c => c.id === windowCunaId)?.anuncianteNombre}</p>
                      </div>
                   </div>
                   
                   <div className="grid grid-cols-2 gap-4 mt-6">
                      <div className="p-4 rounded-xl shadow-[8px_8px_16px_#c8d0d8,-8px_-8px_16px_#ffffff]">
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Duración</p>
                        <p className="text-lg font-bold text-slate-700">{cunas.find(c => c.id === windowCunaId)?.duracionFormateada}</p>
                      </div>
                      <div className="p-4 rounded-xl shadow-[8px_8px_16px_#c8d0d8,-8px_-8px_16px_#ffffff]">
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Estado</p>
                        <p className="text-lg font-bold text-slate-700 capitalize">{cunas.find(c => c.id === windowCunaId)?.estado.replace('_', ' ')}</p>
                      </div>
                   </div>
                   
                   <div className="flex justify-end mt-6 gap-2">
                     <NeuromorphicButton variant="secondary" onClick={() => router.push(`/cunas/${windowCunaId}/editar`)}>
                       Editar Completo
                     </NeuromorphicButton>
                   </div>
                </div>
             )}
          </DraggableWindow>

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
