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
  Calendar,
  ChevronRight,
  Plus,
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
// ESTILOS NEUROMORPHIC
// ═══════════════════════════════════════════════════════════════

const neuro = {
  panel: `
    bg-gradient-to-br from-slate-50 to-slate-100
    rounded-3xl
    shadow-[8px_8px_16px_#d1d5db,-8px_-8px_16px_#ffffff]
    border border-slate-200/50
  `,
  card: `
    bg-gradient-to-br from-white to-slate-50
    rounded-2xl
    shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff]
    border border-slate-200/30
  `,
  btnPrimary: `
    bg-gradient-to-br from-indigo-500 to-purple-600
    text-white font-semibold rounded-xl
    shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]
    hover:shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]
    transition-all duration-200
  `,
  btnSecondary: `
    bg-gradient-to-br from-slate-50 to-slate-100
    text-slate-700 font-medium rounded-xl
    shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]
    hover:shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]
    transition-all duration-200
  `,
  badge: `
    px-3 py-1 rounded-lg
    shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]
    text-xs font-medium
  `
};

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
    case 'urgente': return 'bg-red-100 text-red-700';
    case 'alta': return 'bg-orange-100 text-orange-700';
    case 'media': return 'bg-amber-100 text-amber-700';
    default: return 'bg-slate-100 text-slate-700';
  }
};

const getTipoTareaIcon = (tipo: string) => {
  switch (tipo) {
    case 'aprobar': return <CheckCircle className="w-4 h-4 text-green-500" />;
    case 'revisar': return <Search className="w-4 h-4 text-blue-500" />;
    case 'firmar': return <FileText className="w-4 h-4 text-purple-500" />;
    case 'subir': return <Plus className="w-4 h-4 text-indigo-500" />;
    case 'llamar': return <Users className="w-4 h-4 text-cyan-500" />;
    default: return <AlertCircle className="w-4 h-4 text-slate-500" />;
  }
};

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
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header con saludo */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">
              {saludo}, {usuarioNombre.split(' ')[0]} 👋
            </h1>
            <p className="text-slate-500 mt-1">
              Aquí está el resumen de tu actividad
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Selector de período */}
            <div className="flex items-center bg-white rounded-xl p-1 shadow">
              {(['dia', 'semana', 'mes'] as const).map(p => (
                <button
                  key={p}
                  onClick={() => setPeriodo(p)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    periodo === p 
                      ? 'bg-indigo-500 text-white' 
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {p === 'dia' ? 'Hoy' : p === 'semana' ? 'Esta semana' : 'Este mes'}
                </button>
              ))}
            </div>
            
            <button className={`${neuro.btnSecondary} p-2`}>
              <Bell className="w-5 h-5" />
            </button>
            <button className={`${neuro.btnSecondary} p-2`}>
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* KPIs principales */}
        <div className="grid grid-cols-4 gap-6 mb-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`${neuro.card} p-6`}
          >
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-xl bg-blue-100">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <span className={`${neuro.badge} ${metricas.variacionVsSemanaAnterior > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {metricas.variacionVsSemanaAnterior > 0 ? '+' : ''}{metricas.variacionVsSemanaAnterior}%
              </span>
            </div>
            <p className="text-3xl font-bold text-slate-800 mt-4">{metricas.contratosCreados}</p>
            <p className="text-sm text-slate-500">Contratos creados</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`${neuro.card} p-6`}
          >
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-xl bg-green-100">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <ArrowUpRight className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-3xl font-bold text-slate-800 mt-4">{formatCurrency(metricas.valorTotalGestionado)}</p>
            <p className="text-sm text-slate-500">Valor gestionado</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`${neuro.card} p-6`}
          >
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-xl bg-purple-100">
                <Target className="w-6 h-6 text-purple-600" />
              </div>
              <span className={`${neuro.badge} bg-purple-100 text-purple-700`}>
                {metricas.tasaAprobacion}%
              </span>
            </div>
            <p className="text-3xl font-bold text-slate-800 mt-4">{metricas.contratosAprobados}</p>
            <p className="text-sm text-slate-500">Contratos aprobados</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={`${neuro.card} p-6`}
          >
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-xl bg-amber-100">
                <Award className="w-6 h-6 text-amber-600" />
              </div>
              <span className={`${neuro.badge} bg-amber-100 text-amber-700`}>
                Top {ranking.posicion}
              </span>
            </div>
            <p className="text-3xl font-bold text-slate-800 mt-4">#{ranking.posicion}</p>
            <p className="text-sm text-slate-500">Ranking del equipo</p>
          </motion.div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Columna izquierda - Tareas y acciones */}
          <div className="col-span-2 space-y-6">
            {/* Tareas pendientes */}
            <div className={`${neuro.panel} p-6`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                  <Hourglass className="w-5 h-5 text-orange-500" />
                  Tareas pendientes
                  <span className={`${neuro.badge} bg-orange-100 text-orange-700`}>
                    {mockTareas.length}
                  </span>
                </h3>
                <button className="text-sm text-indigo-600 hover:underline">Ver todas</button>
              </div>

              <div className="space-y-3">
                {mockTareas.map((tarea, idx) => (
                  <motion.div
                    key={tarea.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className={`${neuro.card} p-4 flex items-center gap-4 cursor-pointer hover:shadow-lg transition-shadow`}
                  >
                    <div className="p-2 rounded-xl bg-slate-100">
                      {getTipoTareaIcon(tarea.tipo)}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-slate-800">{tarea.titulo}</p>
                      {tarea.numeroContrato && (
                        <p className="text-xs text-slate-500">{tarea.numeroContrato}</p>
                      )}
                    </div>
                    <span className={`${neuro.badge} ${getPrioridadColor(tarea.prioridad)}`}>
                      {tarea.prioridad}
                    </span>
                    <ChevronRight className="w-5 h-5 text-slate-400" />
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Acciones rápidas */}
            <div className={`${neuro.panel} p-6`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-500" />
                  Acciones rápidas
                </h3>
                <button className="text-sm text-indigo-600 hover:underline">Personalizar</button>
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
                    className={`${neuro.card} p-4 text-center cursor-pointer group`}
                  >
                    <div className="p-3 rounded-xl bg-indigo-100 w-fit mx-auto mb-3 group-hover:bg-indigo-200 transition-colors">
                      {accion.icono === 'plus' && <Plus className="w-6 h-6 text-indigo-600" />}
                      {accion.icono === 'search' && <Search className="w-6 h-6 text-indigo-600" />}
                      {accion.icono === 'layout-dashboard' && <LayoutDashboard className="w-6 h-6 text-indigo-600" />}
                      {accion.icono === 'kanban' && <BarChart3 className="w-6 h-6 text-indigo-600" />}
                      {accion.icono === 'download' && <ExternalLink className="w-6 h-6 text-indigo-600" />}
                      {accion.icono === 'chart-bar' && <TrendingUp className="w-6 h-6 text-indigo-600" />}
                    </div>
                    <p className="font-semibold text-slate-800 text-sm">{accion.nombre}</p>
                    {accion.shortcut && (
                      <p className="text-xs text-slate-400 mt-1 font-mono">{accion.shortcut}</p>
                    )}
                  </motion.a>
                ))}
              </div>
            </div>

            {/* Métricas de productividad */}
            <div className={`${neuro.panel} p-6`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                  Mi productividad
                </h3>
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-slate-800">{metricas.tiempoPromedioCreacion}min</p>
                  <p className="text-xs text-slate-500">Tiempo creación</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-slate-800">{metricas.tasaConversion}%</p>
                  <p className="text-xs text-slate-500">Tasa conversión</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-slate-800">{metricas.contratosEnPrimeraAprobacion}%</p>
                  <p className="text-xs text-slate-500">Primera aprobación</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-slate-800">{formatCurrency(metricas.ticketMasAlto)}</p>
                  <p className="text-xs text-slate-500">Ticket más alto</p>
                </div>
              </div>

              <div className="mt-6">
                <p className="text-sm text-slate-500 mb-2">Tiempo por etapa</p>
                <div className="flex items-center gap-2">
                  {Object.entries(metricas.tiempoPorEtapa).map(([etapa, minutos], idx) => (
                    <div key={etapa} className="flex-1">
                      <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${
                            idx === 0 ? 'bg-blue-500' :
                            idx === 1 ? 'bg-purple-500' :
                            idx === 2 ? 'bg-amber-500' :
                            'bg-green-500'
                          }`}
                          style={{ width: `${Math.min((minutos / 480) * 100, 100)}%` }}
                        />
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        {etapa.replace('_', ' ')}
                        <br />
                        {minutos < 60 ? `${minutos}m` : `${(minutos/60).toFixed(1)}h`}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Columna derecha - Favoritos y búsquedas */}
          <div className="space-y-6">
            {/* Favoritos */}
            <div className={`${neuro.panel} p-6`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  Favoritos
                </h3>
                <button className="text-sm text-indigo-600 hover:underline">+Agregar</button>
              </div>

              <div className="space-y-3">
                {favoritos.map((fav, idx) => (
                  <motion.a
                    key={fav.id}
                    href={`/contratos/${fav.contratoId}`}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className={`${neuro.card} p-4 block cursor-pointer hover:shadow-lg transition-shadow`}
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-slate-800">{fav.numeroContrato}</p>
                      <span className={`${neuro.badge} ${
                        fav.estado === 'ACTIVO' ? 'bg-green-100 text-green-700' :
                        fav.estado === 'EN_APROBACION' ? 'bg-amber-100 text-amber-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {fav.estado}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 mt-1">{fav.clienteNombre}</p>
                    <p className="text-lg font-bold text-slate-800 mt-2">{formatCurrency(fav.valorTotal)}</p>
                    
                    {fav.etiquetas.length > 0 && (
                      <div className="flex items-center gap-1 mt-2">
                        {fav.etiquetas.map(tag => (
                          <span key={tag} className="text-xs px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </motion.a>
                ))}

                {favoritos.length === 0 && (
                  <div className="text-center py-8 text-slate-400">
                    <Star className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Sin favoritos aún</p>
                  </div>
                )}
              </div>
            </div>

            {/* Ranking del equipo */}
            <div className={`${neuro.panel} p-6`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-500" />
                  Top del equipo
                </h3>
              </div>

              <div className="space-y-3">
                {ranking.top.map((usuario, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                      idx === 0 ? 'bg-gradient-to-br from-yellow-400 to-amber-500' :
                      idx === 1 ? 'bg-gradient-to-br from-slate-300 to-slate-400' :
                      'bg-gradient-to-br from-amber-600 to-amber-700'
                    }`}>
                      {idx + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-slate-800">{usuario.nombre}</p>
                    </div>
                    <span className="font-bold text-slate-600">{usuario.valor}</span>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">Tu posición</span>
                  <span className="font-bold text-indigo-600">#{ranking.posicion} de {ranking.total}</span>
                </div>
              </div>
            </div>

            {/* Búsquedas recientes */}
            <div className={`${neuro.panel} p-6`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-slate-500" />
                  Recientes
                </h3>
                <button className="text-sm text-slate-400 hover:text-slate-600">Limpiar</button>
              </div>

              <div className="space-y-2">
                {busquedasRecientes.map(busqueda => (
                  <a 
                    key={busqueda.id}
                    href={`/contratos?q=${encodeURIComponent(busqueda.query)}`}
                    className="flex items-center gap-2 px-3 py-2 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <Search className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-600 flex-1">{busqueda.query}</span>
                    <span className="text-xs text-slate-400">{busqueda.resultados}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sugerencia IA */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className={`${neuro.card} p-6 mt-6 border-l-4 border-indigo-500`}
        >
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-indigo-100">
              <Sparkles className="w-6 h-6 text-indigo-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-slate-800">💡 Sugerencia de Cortex-Flow</h4>
              <p className="text-slate-600 mt-1">
                Basado en tu actividad, te recomiendo contactar a <strong>Banco Chile</strong> para 
                iniciar la renovación del contrato CTR-2025-001 que vence en 15 días. 
                Su inversión aumentó un 40% este año, considera ofrecer el paquete premium.
              </p>
              <div className="flex items-center gap-3 mt-3">
                <button className={`${neuro.btnPrimary} px-4 py-2 text-sm`}>
                  Ver contrato
                </button>
                <button className={`${neuro.btnSecondary} px-4 py-2 text-sm`}>
                  Iniciar renovación
                </button>
                <button className="text-sm text-slate-400 hover:text-slate-600">
                  Ignorar
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
