/**
 * 📊 SILEXAR PULSE - Mi Dashboard Personal TIER 0
 * 
 * @description Dashboard personalizado por usuario que muestra:
 * - KPIs personales
 * - Contratos favoritos
 * - Acciones rápidas
 * - Tareas pendientes
 * - Métricas de productividad
 * - Ranking del equipo
 * Paleta oficial: base #dfeaff | dark #bec8de | light #ffffff | accent #6888ff
 * 
 * @version 2025.4.0
 * @tier TIER_0_FORTUNE_10
 */

'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Star,
  Zap,
  Clock,
  TrendingUp,
  Target,
  Award,
  FileText,
  DollarSign,
  Users,
  Search,
  Bell,
  Settings,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle,
  AlertCircle,
  Hourglass,
  Sparkles,
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import { 
  Productivity,
  type MetricasProductividad,
  type ContratoFavorito,
  type AccionRapida
} from '../nuevo/components/WizardContrato/services/ProductivityService';

// ═══════════════════════════════════════════════════════════════
// TOKENS OFICIALES NEUMORPHISM
// ═══════════════════════════════════════════════════════════════

const N = {
  base: '#dfeaff',
  dark: '#bec8de',
  light: '#ffffff',
  accent: '#6888ff',
  text: '#69738c',
  textSub: '#9aa3b8',
};

const neu = `8px 8px 16px ${N.dark},-8px -8px 16px ${N.light}`;
const neuSm = `4px 4px 8px ${N.dark},-4px -4px 8px ${N.light}`;
const neuXs = `2px 2px 4px ${N.dark},-2px -2px 4px ${N.light}`;
const inset = `inset 4px 4px 8px ${N.dark},inset -4px -4px 8px ${N.light}`;
const insetSm = `inset 2px 2px 5px ${N.dark},inset -2px -2px 5px ${N.light}`;

// ═══════════════════════════════════════════════════════════════
// MOCK TAREAS PENDIENTES
// ═══════════════════════════════════════════════════════════════

interface TareaPendiente {
  id: string;
  tipo: 'aprobar' | 'revisar' | 'firmar' | 'subir' | 'llamar';
  titulo: string;
  contratoId?: string;
  numeroContrato?: string;
  prioridad: 'baja' | 'media' | 'alta' | 'urgente';
  vencimiento?: Date;
}

const mockTareas: TareaPendiente[] = [
  {
    id: 't-001',
    tipo: 'aprobar',
    titulo: 'Aprobar contrato CTR-2025-003',
    contratoId: 'ctr-003',
    numeroContrato: 'CTR-2025-003',
    prioridad: 'urgente',
    vencimiento: new Date(Date.now() + 2 * 60 * 60 * 1000)
  },
  {
    id: 't-002',
    tipo: 'subir',
    titulo: 'Subir OC de Falabella',
    contratoId: 'ctr-002',
    numeroContrato: 'CTR-2025-002',
    prioridad: 'alta',
    vencimiento: new Date(Date.now() + 24 * 60 * 60 * 1000)
  },
  {
    id: 't-003',
    tipo: 'llamar',
    titulo: 'Confirmar términos con Cencosud',
    prioridad: 'media'
  },
  {
    id: 't-004',
    tipo: 'revisar',
    titulo: 'Revisar cotización Paris',
    contratoId: 'ctr-005',
    numeroContrato: 'CTR-2025-005',
    prioridad: 'baja'
  }
];

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════

const formatCurrency = (value: number) => {
  if (value >= 1000000000) return `$${(value / 1000000000).toFixed(1)}B`;
  if (value >= 1000000) return `$${(value / 1000000).toFixed(0)}M`;
  return `$${(value / 1000).toFixed(0)}K`;
};

const getPrioridadColor = (prioridad: string) => {
  switch (prioridad) {
    case 'urgente': return { bg: 'rgba(239,68,68,0.12)', text: '#ef4444' };
    case 'alta': return { bg: 'rgba(245,158,11,0.12)', text: '#f59e0b' };
    case 'media': return { bg: 'rgba(104,136,255,0.12)', text: '#6888ff' };
    default: return { bg: 'rgba(154,163,184,0.12)', text: N.textSub };
  }
};

const getTipoTareaIcon = (tipo: string) => {
  switch (tipo) {
    case 'aprobar': return <CheckCircle className="w-4 h-4" style={{ color: '#22c55e' }} />;
    case 'revisar': return <Search className="w-4 h-4" style={{ color: N.accent }} />;
    case 'firmar': return <FileText className="w-4 h-4" style={{ color: '#a855f7' }} />;
    case 'subir': return <ExternalLink className="w-4 h-4" style={{ color: N.accent }} />;
    case 'llamar': return <Users className="w-4 h-4" style={{ color: '#06b6d4' }} />;
    default: return <AlertCircle className="w-4 h-4" style={{ color: N.textSub }} />;
  }
};

// ═══════════════════════════════════════════════════════════════
// COMPONENTES NEUMORPHIC
// ═══════════════════════════════════════════════════════════════

function NeuCard({ children, className = '', style = {} }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <div className={`rounded-3xl ${className}`} style={{ background: N.base, boxShadow: neu, ...style }}>
      {children}
    </div>
  );
}

function NeuButton({ children, onClick, variant = 'secondary', className = '', disabled = false }: {
  children: React.ReactNode; onClick?: () => void; variant?: 'primary' | 'secondary'; className?: string; disabled?: boolean;
}) {
  const s = variant === 'primary'
    ? { background: N.accent, color: '#fff', boxShadow: neuSm }
    : { background: N.base, color: N.text, boxShadow: neu };
  return (
    <button onClick={onClick} disabled={disabled} className={`px-4 py-2 rounded-xl font-bold transition-all duration-200 flex items-center gap-2 ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'} ${className}`} style={s}>
      {children}
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════

export default function MiDashboardPage() {
  const usuarioId = 'user-demo';
  const usuarioNombre = 'Carlos Mendoza';
  
  const [periodo, setPeriodo] = useState<'dia' | 'semana' | 'mes'>('semana');
  const metricas = Productivity.getMetricas(usuarioId, periodo);
  const favoritos = Productivity.getFavoritos(usuarioId);
  const accionesRapidas = Productivity.getAccionesRapidas(usuarioId).filter(a => a.visible).slice(0, 6);
  const busquedasRecientes = Productivity.getBusquedasRecientes(usuarioId, 5);
  const ranking = Productivity.getRankingEquipo(usuarioId);

  const horaActual = new Date().getHours();
  const saludo = horaActual < 12 ? 'Buenos días' : horaActual < 19 ? 'Buenas tardes' : 'Buenas noches';

  return (
    <div className="min-h-screen p-6 lg:p-8" style={{ background: N.base }}>
      <div className="max-w-7xl mx-auto">
        {/* Header con saludo */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black" style={{ color: N.text }}>
              {saludo}, {usuarioNombre.split(' ')[0]} 👋
            </h1>
            <p className="text-sm mt-1" style={{ color: N.textSub }}>
              Aquí está el resumen de tu actividad
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Selector de período */}
            <div className="flex items-center rounded-xl p-1" style={{ background: N.base, boxShadow: inset }}>
              {(['dia', 'semana', 'mes'] as const).map(p => (
                <button
                  key={p}
                  onClick={() => setPeriodo(p)}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                    periodo === p 
                      ? 'text-white' 
                      : ''
                  }`}
                  style={periodo === p ? { background: N.accent, boxShadow: neuSm } : { color: N.textSub }}
                >
                  {p === 'dia' ? 'Hoy' : p === 'semana' ? 'Esta semana' : 'Este mes'}
                </button>
              ))}
            </div>
            
            <NeuButton variant="secondary" className="p-2">
              <Bell className="w-5 h-5" />
            </NeuButton>
            <NeuButton variant="secondary" className="p-2">
              <Settings className="w-5 h-5" />
            </NeuButton>
          </div>
        </div>

        {/* KPIs principales */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-3xl"
            style={{ background: N.base, boxShadow: neu }}
          >
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-2xl" style={{ background: N.base, boxShadow: neuSm }}>
                <FileText className="w-6 h-6" style={{ color: N.accent }} />
              </div>
              <span className="px-3 py-1 rounded-lg text-xs font-bold" style={{ background: metricas.variacionVsSemanaAnterior > 0 ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)', color: metricas.variacionVsSemanaAnterior > 0 ? '#22c55e' : '#ef4444', boxShadow: insetSm }}>
                {metricas.variacionVsSemanaAnterior > 0 ? '+' : ''}{metricas.variacionVsSemanaAnterior}%
              </span>
            </div>
            <p className="text-3xl font-black mt-4" style={{ color: N.text }}>{metricas.contratosCreados}</p>
            <p className="text-sm" style={{ color: N.textSub }}>Contratos creados</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-6 rounded-3xl"
            style={{ background: N.base, boxShadow: neu }}
          >
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-2xl" style={{ background: N.base, boxShadow: neuSm }}>
                <DollarSign className="w-6 h-6" style={{ color: '#22c55e' }} />
              </div>
              <ArrowUpRight className="w-5 h-5" style={{ color: '#22c55e' }} />
            </div>
            <p className="text-3xl font-black mt-4" style={{ color: N.text }}>{formatCurrency(metricas.valorTotalGestionado)}</p>
            <p className="text-sm" style={{ color: N.textSub }}>Valor gestionado</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-6 rounded-3xl"
            style={{ background: N.base, boxShadow: neu }}
          >
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-2xl" style={{ background: N.base, boxShadow: neuSm }}>
                <Target className="w-6 h-6" style={{ color: '#a855f7' }} />
              </div>
              <span className="px-3 py-1 rounded-lg text-xs font-bold" style={{ background: 'rgba(168,85,247,0.12)', color: '#a855f7', boxShadow: insetSm }}>
                {metricas.tasaAprobacion}%
              </span>
            </div>
            <p className="text-3xl font-black mt-4" style={{ color: N.text }}>{metricas.contratosAprobados}</p>
            <p className="text-sm" style={{ color: N.textSub }}>Contratos aprobados</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-6 rounded-3xl"
            style={{ background: N.base, boxShadow: neu }}
          >
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-2xl" style={{ background: N.base, boxShadow: neuSm }}>
                <Award className="w-6 h-6" style={{ color: '#f59e0b' }} />
              </div>
              <span className="px-3 py-1 rounded-lg text-xs font-bold" style={{ background: 'rgba(245,158,11,0.12)', color: '#f59e0b', boxShadow: insetSm }}>
                Top {ranking.posicion}
              </span>
            </div>
            <p className="text-3xl font-black mt-4" style={{ color: N.text }}>#{ranking.posicion}</p>
            <p className="text-sm" style={{ color: N.textSub }}>Ranking del equipo</p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Columna izquierda - Tareas y acciones */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tareas pendientes */}
            <NeuCard className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2" style={{ color: N.text }}>
                  <Hourglass className="w-5 h-5" style={{ color: '#f59e0b' }} />
                  Tareas pendientes
                  <span className="px-3 py-1 rounded-lg text-xs font-bold" style={{ background: 'rgba(245,158,11,0.12)', color: '#f59e0b', boxShadow: insetSm }}>
                    {mockTareas.length}
                  </span>
                </h3>
                <button className="text-xs font-bold" style={{ color: N.accent }}>Ver todas</button>
              </div>

              <div className="space-y-3">
                {mockTareas.map((tarea, idx) => {
                  const prio = getPrioridadColor(tarea.prioridad);
                  return (
                    <motion.div
                      key={tarea.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="p-4 rounded-2xl cursor-pointer"
                      style={{ background: N.base, boxShadow: neuSm }}
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-2 rounded-xl" style={{ background: N.base, boxShadow: neuXs }}>
                          {getTipoTareaIcon(tarea.tipo)}
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-sm" style={{ color: N.text }}>{tarea.titulo}</p>
                          {tarea.numeroContrato && (
                            <p className="text-xs" style={{ color: N.textSub }}>{tarea.numeroContrato}</p>
                          )}
                        </div>
                        <span className="px-3 py-1 rounded-lg text-xs font-bold" style={{ background: prio.bg, color: prio.text, boxShadow: insetSm }}>
                          {tarea.prioridad}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </NeuCard>

            {/* Acciones rápidas */}
            <NeuCard className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2" style={{ color: N.text }}>
                  <Zap className="w-5 h-5" style={{ color: '#f59e0b' }} />
                  Acciones rápidas
                </h3>
                <button className="text-xs font-bold" style={{ color: N.accent }}>Personalizar</button>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {accionesRapidas.map((accion, idx) => (
                  <motion.a
                    key={accion.id}
                    href={accion.url || '#'}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    whileHover={{ scale: 1.02 }}
                    className="p-4 rounded-2xl text-center cursor-pointer group"
                    style={{ background: N.base, boxShadow: neuSm }}
                  >
                    <div className="p-3 rounded-xl w-fit mx-auto mb-3" style={{ background: N.base, boxShadow: neuXs }}>
                      {accion.icono === 'plus' && <ExternalLink className="w-6 h-6" style={{ color: N.accent }} />}
                      {accion.icono === 'search' && <Search className="w-6 h-6" style={{ color: N.accent }} />}
                      {accion.icono === 'layout-dashboard' && <LayoutDashboard className="w-6 h-6" style={{ color: N.accent }} />}
                      {accion.icono === 'kanban' && <BarChart3 className="w-6 h-6" style={{ color: N.accent }} />}
                      {accion.icono === 'download' && <ExternalLink className="w-6 h-6" style={{ color: N.accent }} />}
                      {accion.icono === 'chart-bar' && <TrendingUp className="w-6 h-6" style={{ color: N.accent }} />}
                    </div>
                    <p className="font-bold text-sm" style={{ color: N.text }}>{accion.nombre}</p>
                    {accion.shortcut && (
                      <p className="text-xs mt-1 font-mono" style={{ color: N.textSub }}>{accion.shortcut}</p>
                    )}
                  </motion.a>
                ))}
              </div>
            </NeuCard>

            {/* Métricas de productividad */}
            <NeuCard className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2" style={{ color: N.text }}>
                  <TrendingUp className="w-5 h-5" style={{ color: '#22c55e' }} />
                  Mi productividad
                </h3>
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-black" style={{ color: N.text }}>{metricas.tiempoPromedioCreacion}min</p>
                  <p className="text-xs" style={{ color: N.textSub }}>Tiempo creación</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-black" style={{ color: N.text }}>{metricas.tasaConversion}%</p>
                  <p className="text-xs" style={{ color: N.textSub }}>Tasa conversión</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-black" style={{ color: N.text }}>{metricas.contratosEnPrimeraAprobacion}%</p>
                  <p className="text-xs" style={{ color: N.textSub }}>Primera aprobación</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-black" style={{ color: N.text }}>{formatCurrency(metricas.ticketMasAlto)}</p>
                  <p className="text-xs" style={{ color: N.textSub }}>Ticket más alto</p>
                </div>
              </div>

              <div className="mt-6">
                <p className="text-sm mb-2" style={{ color: N.textSub }}>Tiempo por etapa</p>
                <div className="flex items-center gap-2">
                  {Object.entries(metricas.tiempoPorEtapa).map(([etapa, minutos], idx) => (
                    <div key={etapa} className="flex-1">
                      <div className="h-2 rounded-full overflow-hidden" style={{ background: N.base, boxShadow: insetSm }}>
                        <div 
                          className="h-full rounded-full transition-all"
                          style={{ 
                            width: `${Math.min((minutos / 480) * 100, 100)}%`, 
                            background: idx === 0 ? N.accent : idx === 1 ? '#a855f7' : idx === 2 ? '#f59e0b' : '#22c55e' 
                          }}
                        />
                      </div>
                      <p className="text-xs mt-1" style={{ color: N.textSub }}>
                        {etapa.replace('_', ' ')}
                        <br />
                        {minutos < 60 ? `${minutos}m` : `${(minutos/60).toFixed(1)}h`}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </NeuCard>
          </div>

          {/* Columna derecha - Favoritos y búsquedas */}
          <div className="space-y-6">
            {/* Favoritos */}
            <NeuCard className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2" style={{ color: N.text }}>
                  <Star className="w-5 h-5" style={{ color: '#f59e0b' }} />
                  Favoritos
                </h3>
                <button className="text-xs font-bold" style={{ color: N.accent }}>+Agregar</button>
              </div>

              <div className="space-y-3">
                {favoritos.map((fav, idx) => (
                  <motion.a
                    key={fav.id}
                    href={`/contratos/${fav.contratoId}`}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="p-4 rounded-2xl block cursor-pointer"
                    style={{ background: N.base, boxShadow: neuSm }}
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-sm" style={{ color: N.text }}>{fav.numeroContrato}</p>
                      <span className="px-2 py-0.5 rounded-lg text-xs font-bold" style={{ 
                        background: fav.estado === 'ACTIVO' ? 'rgba(34,197,94,0.12)' : fav.estado === 'EN_APROBACION' ? 'rgba(245,158,11,0.12)' : 'rgba(154,163,184,0.12)', 
                        color: fav.estado === 'ACTIVO' ? '#22c55e' : fav.estado === 'EN_APROBACION' ? '#f59e0b' : N.textSub,
                        boxShadow: insetSm
                      }}>
                        {fav.estado}
                      </span>
                    </div>
                    <p className="text-sm mt-1" style={{ color: N.textSub }}>{fav.clienteNombre}</p>
                    <p className="text-lg font-black mt-2" style={{ color: N.text }}>{formatCurrency(fav.valorTotal)}</p>
                    
                    {fav.etiquetas.length > 0 && (
                      <div className="flex items-center gap-1 mt-2">
                        {fav.etiquetas.map(tag => (
                          <span key={tag} className="text-xs px-2 py-0.5 rounded" style={{ background: `${N.accent}18`, color: N.accent }}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </motion.a>
                ))}

                {favoritos.length === 0 && (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 rounded-3xl mx-auto mb-4 flex items-center justify-center" style={{ background: N.base, boxShadow: inset }}>
                      <Star className="w-8 h-8" style={{ color: N.textSub }} />
                    </div>
                    <p style={{ color: N.textSub }}>Sin favoritos aún</p>
                  </div>
                )}
              </div>
            </NeuCard>

            {/* Ranking del equipo */}
            <NeuCard className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2" style={{ color: N.text }}>
                  <Award className="w-5 h-5" style={{ color: '#f59e0b' }} />
                  Top del equipo
                </h3>
              </div>

              <div className="space-y-3">
                {ranking.top.map((usuario, idx) => (
                  <div key={usuario.nombre} className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                      idx === 0 ? '' : idx === 1 ? '' : ''
                    }`} style={{ 
                      background: idx === 0 ? 'linear-gradient(135deg, #fbbf24, #f59e0b)' : idx === 1 ? 'linear-gradient(135deg, #94a3b8, #64748b)' : 'linear-gradient(135deg, #d97706, #b45309)' 
                    }}>
                      {idx + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-sm" style={{ color: N.text }}>{usuario.nombre}</p>
                    </div>
                    <span className="font-bold text-sm" style={{ color: N.text }}>{usuario.valor}</span>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4" style={{ borderTop: `1px solid ${N.dark}40` }}>
                <div className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: N.textSub }}>Tu posición</span>
                  <span className="font-bold" style={{ color: N.accent }}>#{ranking.posicion} de {ranking.total}</span>
                </div>
              </div>
            </NeuCard>

            {/* Búsquedas recientes */}
            <NeuCard className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2" style={{ color: N.text }}>
                  <Clock className="w-5 h-5" style={{ color: N.textSub }} />
                  Recientes
                </h3>
                <button className="text-xs" style={{ color: N.textSub }}>Limpiar</button>
              </div>

              <div className="space-y-2">
                {busquedasRecientes.map(busqueda => (
                  <a 
                    key={busqueda.id}
                    href={`/contratos?q=${encodeURIComponent(busqueda.query)}`}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl transition-all"
                    style={{ background: N.base, boxShadow: neuXs }}
                  >
                    <Search className="w-4 h-4" style={{ color: N.textSub }} />
                    <span className="text-sm flex-1" style={{ color: N.text }}>{busqueda.query}</span>
                    <span className="text-xs" style={{ color: N.textSub }}>{busqueda.resultados}</span>
                  </a>
                ))}
              </div>
            </NeuCard>
          </div>
        </div>

        {/* Sugerencia IA */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="p-6 mt-6 rounded-3xl"
          style={{ background: N.base, boxShadow: neu, borderLeft: `4px solid ${N.accent}` }}
        >
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl" style={{ background: N.base, boxShadow: neuSm }}>
              <Sparkles className="w-6 h-6" style={{ color: N.accent }} />
            </div>
            <div className="flex-1">
              <h4 className="font-bold" style={{ color: N.text }}>💡 Sugerencia de Cortex-Flow</h4>
              <p className="mt-1" style={{ color: N.textSub }}>
                Basado en tu actividad, te recomiendo contactar a <strong style={{ color: N.text }}>Banco Chile</strong> para 
                iniciar la renovación del contrato CTR-2025-001 que vence en 15 días. 
                Su inversión aumentó un 40% este año, considera ofrecer el paquete premium.
              </p>
              <div className="flex items-center gap-3 mt-3">
                <NeuButton variant="primary" className="px-4 py-2 text-xs">
                  Ver contrato
                </NeuButton>
                <NeuButton variant="secondary" className="px-4 py-2 text-xs">
                  Iniciar renovación
                </NeuButton>
                <button className="text-xs" style={{ color: N.textSub }}>Ignorar</button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
