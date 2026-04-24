/**
 * 🌅 SILEXAR PULSE - Dashboard de Turno Operador 2050
 *
 * @description Panel principal para operadores con vista de su cola de trabajo,
 * alertas críticas, inbox de campañas y estadísticas de productividad.
 *
 * @version 2050.1.0
 * @tier TIER_0_FORTUNE_10
 */

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Inbox,
  AlertTriangle,
  CheckCircle2,
  Play,
  Calendar,
  Radio,
  User,
  Bell,
  RefreshCw,
  FileText,
  Zap,
  Target,
  BarChart3,
  Eye,
  Edit2,
  Loader2
} from 'lucide-react';
import { NeoPageHeader, NeoCard, NeoButton, NeoBadge, NeoSelect, N } from '../_lib/neumorphic';

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

interface CampanaInbox {
  id: string;
  codigo: string;
  nombre: string;
  anunciante: string;
  tipo: 'nueva' | 'modificacion' | 'confirmacion' | 'urgente';
  fechaInicio: Date;
  fechaFin: Date;
  emisoras: number;
  spotsTotal: number;
  prioridad: 'baja' | 'normal' | 'alta' | 'urgente';
  asignadoA?: string;
  fechaAsignacion: Date;
}

interface AlertaOperativa {
  id: string;
  tipo: 'critica' | 'advertencia' | 'info';
  mensaje: string;
  campanaId?: string;
  campanaCodigo?: string;
  fechaHora: Date;
  accion?: string;
}

interface EstadisticasTurno {
  programadas: number;
  enProceso: number;
  pendientes: number;
  completadasHoy: number;
  spotsHoy: number;
  porcentajeCumplimiento: number;
}

interface TurnoOperador {
  operadorId: string;
  operadorNombre: string;
  turnoInicio: Date;
  turnoFin: Date;
  emisorasAsignadas: string[];
}

// ═══════════════════════════════════════════════════════════════
// DATOS MOCK
// ═══════════════════════════════════════════════════════════════

const MOCK_INBOX: CampanaInbox[] = [
  {
    id: 'camp_001',
    codigo: 'CAM-2025-0234',
    nombre: 'Coca-Cola Verano 2025',
    anunciante: 'COCA-COLA',
    tipo: 'nueva',
    fechaInicio: new Date('2025-01-02'),
    fechaFin: new Date('2025-02-28'),
    emisoras: 5,
    spotsTotal: 600,
    prioridad: 'alta',
    fechaAsignacion: new Date()
  },
  {
    id: 'camp_002',
    codigo: 'CAM-2025-0235',
    nombre: 'Banco Chile Campaña Ahorro',
    anunciante: 'BANCO CHILE',
    tipo: 'urgente',
    fechaInicio: new Date('2025-01-01'),
    fechaFin: new Date('2025-01-15'),
    emisoras: 3,
    spotsTotal: 180,
    prioridad: 'urgente',
    fechaAsignacion: new Date()
  },
  {
    id: 'camp_003',
    codigo: 'CAM-2025-0230',
    nombre: 'Falabella Cyber Monday',
    anunciante: 'FALABELLA',
    tipo: 'modificacion',
    fechaInicio: new Date('2025-01-05'),
    fechaFin: new Date('2025-01-07'),
    emisoras: 8,
    spotsTotal: 320,
    prioridad: 'alta',
    fechaAsignacion: new Date()
  },
  {
    id: 'camp_004',
    codigo: 'CAM-2025-0228',
    nombre: 'Claro Internet Hogar',
    anunciante: 'CLARO',
    tipo: 'confirmacion',
    fechaInicio: new Date('2024-12-27'),
    fechaFin: new Date('2025-01-31'),
    emisoras: 4,
    spotsTotal: 240,
    prioridad: 'normal',
    fechaAsignacion: new Date()
  },
  {
    id: 'camp_005',
    codigo: 'CAM-2025-0229',
    nombre: 'Paris Ofertas Enero',
    anunciante: 'PARIS',
    tipo: 'confirmacion',
    fechaInicio: new Date('2024-12-26'),
    fechaFin: new Date('2025-01-10'),
    emisoras: 2,
    spotsTotal: 80,
    prioridad: 'normal',
    fechaAsignacion: new Date()
  }
];

const MOCK_ALERTAS: AlertaOperativa[] = [
  {
    id: 'alerta_001',
    tipo: 'critica',
    mensaje: 'Campaña BANCO CHILE empieza en 2 horas sin material de audio',
    campanaId: 'camp_002',
    campanaCodigo: 'CAM-2025-0235',
    fechaHora: new Date(),
    accion: 'Contactar ejecutivo para material'
  },
  {
    id: 'alerta_002',
    tipo: 'critica',
    mensaje: '3 spots de COCA-COLA no se emitieron ayer en Radio Pudahuel',
    campanaId: 'camp_001',
    campanaCodigo: 'CAM-2025-0234',
    fechaHora: new Date(),
    accion: 'Reagendar spots'
  },
  {
    id: 'alerta_003',
    tipo: 'advertencia',
    mensaje: 'Tanda de 14:00 en ADN Radio saturada al 120%',
    fechaHora: new Date(),
    accion: 'Redistribuir spots'
  },
  {
    id: 'alerta_004',
    tipo: 'info',
    mensaje: 'Campaña FALABELLA termina en 5 días - considerar renovación',
    campanaId: 'camp_003',
    campanaCodigo: 'CAM-2025-0230',
    fechaHora: new Date()
  }
];

const MOCK_STATS: EstadisticasTurno = {
  programadas: 12,
  enProceso: 4,
  pendientes: 8,
  completadasHoy: 6,
  spotsHoy: 156,
  porcentajeCumplimiento: 87
};

// ═══════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════

export default function DashboardTurnoOperador() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [inbox, _setInbox] = useState<CampanaInbox[]>(MOCK_INBOX);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [alertas, _setAlertas] = useState<AlertaOperativa[]>(MOCK_ALERTAS);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [stats, _setStats] = useState<EstadisticasTurno>(MOCK_STATS);
  const [filtroInbox, setFiltroInbox] = useState<string>('todos');
  const [cargando, setCargando] = useState(false);
  const [ultimaActualizacion, setUltimaActualizacion] = useState(new Date());

  // Operador actual (mock)
  const operador: TurnoOperador = {
    operadorId: 'op_001',
    operadorNombre: 'Carlos Martínez',
    turnoInicio: new Date('2024-12-27T08:00:00'),
    turnoFin: new Date('2024-12-27T16:00:00'),
    emisorasAsignadas: ['Radio Pudahuel', 'ADN Radio', 'Radio Futuro']
  };

  // Contadores por tipo
  const contadores = useMemo(() => ({
    nuevas: inbox.filter(c => c.tipo === 'nueva').length,
    modificaciones: inbox.filter(c => c.tipo === 'modificacion').length,
    confirmaciones: inbox.filter(c => c.tipo === 'confirmacion').length,
    urgentes: inbox.filter(c => c.tipo === 'urgente').length,
    alertasCriticas: alertas.filter(a => a.tipo === 'critica').length
  }), [inbox, alertas]);

  // Filtrar inbox
  const inboxFiltrado = useMemo(() => {
    if (filtroInbox === 'todos') return inbox;
    return inbox.filter(c => c.tipo === filtroInbox);
  }, [inbox, filtroInbox]);

  // Refrescar datos
  const refrescar = async () => {
    setCargando(true);
    await new Promise(r => setTimeout(r, 1000));
    setUltimaActualizacion(new Date());
    setCargando(false);
  };

  // Simular actualizaciones en tiempo real
  useEffect(() => {
    const interval = setInterval(() => {
      setUltimaActualizacion(new Date());
    }, 60000); // Cada minuto
    return () => clearInterval(interval);
  }, []);

  // Obtener color de prioridad
  const getColorPrioridad = (prioridad: string) => {
    switch (prioridad) {
      case 'urgente': return 'red' as const;
      case 'alta': return 'yellow' as const;
      case 'normal': return 'blue' as const;
      default: return 'gray' as const;
    }
  };

  // Obtener color de tipo
  const getColorTipo = (tipo: string) => {
    switch (tipo) {
      case 'urgente': return '#ef4444';
      case 'nueva': return '#22c55e';
      case 'modificacion': return '#f59e0b';
      case 'confirmacion': return N.accent;
      default: return N.textSub;
    }
  };

  // Obtener icono de alerta
  const getIconoAlerta = (tipo: string) => {
    switch (tipo) {
      case 'critica': return <AlertTriangle className="w-4 h-4" style={{ color: '#ef4444' }} />;
      case 'advertencia': return <AlertTriangle className="w-4 h-4" style={{ color: '#f59e0b' }} />;
      default: return <Bell className="w-4 h-4" style={{ color: N.accent }} />;
    }
  };

  return (
    <div className="min-h-screen p-6" style={{ background: N.base, color: N.text }}>
      <div className="mb-6">
        <NeoPageHeader
          title="Dashboard de Turno"
          subtitle={`${operador.operadorNombre} • Turno ${operador.turnoInicio.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })} - ${operador.turnoFin.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}`}
          icon={User}
          backHref="/campanas"
        />
      </div>

      {/* Última actualización + Refrescar */}
      <div className="flex items-center justify-end gap-3 mb-6">
        <span className="text-xs font-bold" style={{ color: N.textSub }}>
          Última actualización: {ultimaActualizacion.toLocaleTimeString('es-CL')}
        </span>
        <NeoButton variant="secondary" size="sm" onClick={refrescar} disabled={cargando}>
          {cargando ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
          Refrescar
        </NeoButton>
      </div>

      {/* ALERTAS CRÍTICAS (siempre visible si hay) */}
      {contadores.alertasCriticas > 0 && (
        <NeoCard className="mb-6" style={{ border: '1px solid #ef444440' }}>
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5" style={{ color: '#ef4444' }} />
            <h3 className="font-black" style={{ color: '#ef4444' }}>
              ⚠️ {contadores.alertasCriticas} Alerta(s) Crítica(s)
            </h3>
          </div>
          <div className="space-y-2">
            {alertas.filter(a => a.tipo === 'critica').map(alerta => (
              <div key={alerta.id} className="flex items-center justify-between rounded-2xl p-3"
                style={{ background: N.base, boxShadow: `4px 4px 8px ${N.dark}, -4px -4px 8px ${N.light}` }}>
                <div className="flex items-center gap-3">
                  {getIconoAlerta(alerta.tipo)}
                  <div>
                    <p className="text-sm font-bold" style={{ color: N.text }}>{alerta.mensaje}</p>
                    {alerta.campanaCodigo && (
                      <span className="text-xs font-bold" style={{ color: N.textSub }}>{alerta.campanaCodigo}</span>
                    )}
                  </div>
                </div>
                {alerta.accion && (
                  <NeoButton variant="danger" size="sm">
                    <Zap className="w-3 h-3" />
                    {alerta.accion}
                  </NeoButton>
                )}
              </div>
            ))}
          </div>
        </NeoCard>
      )}

      {/* GRID PRINCIPAL */}
      <div className="grid grid-cols-12 gap-6">
        {/* COLUMNA IZQUIERDA: INBOX */}
        <div className="col-span-8">
          <NeoCard>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Inbox className="w-5 h-5" style={{ color: N.accent }} />
                <h2 className="font-black" style={{ color: N.text }}>📥 Inbox de Campañas</h2>
              </div>
              <NeoSelect className="w-40 h-8 text-xs" value={filtroInbox} onChange={e => setFiltroInbox(e.target.value)}>
                <option value="todos">Todos ({inbox.length})</option>
                <option value="urgente">🔴 Urgentes ({contadores.urgentes})</option>
                <option value="nueva">🟢 Nuevas ({contadores.nuevas})</option>
                <option value="modificacion">🟡 Modificaciones ({contadores.modificaciones})</option>
                <option value="confirmacion">🔵 Confirmaciones ({contadores.confirmaciones})</option>
              </NeoSelect>
            </div>

            {/* Contadores rápidos */}
            <div className="grid grid-cols-4 gap-3 mb-4">
              <ContadorCard color="#ef4444" label="Urgentes" count={contadores.urgentes} onClick={() => setFiltroInbox('urgente')} />
              <ContadorCard color="#22c55e" label="Nuevas" count={contadores.nuevas} onClick={() => setFiltroInbox('nueva')} />
              <ContadorCard color="#f59e0b" label="Modificar" count={contadores.modificaciones} onClick={() => setFiltroInbox('modificacion')} />
              <ContadorCard color={N.accent} label="Confirmar" count={contadores.confirmaciones} onClick={() => setFiltroInbox('confirmacion')} />
            </div>

            {/* Lista de campañas */}
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {inboxFiltrado.map(campana => (
                <div
                  key={campana.id}
                  className="p-4 rounded-2xl cursor-pointer transition-all"
                  style={{
                    background: N.base,
                    boxShadow: campana.prioridad === 'urgente'
                      ? `inset 3px 3px 6px ${N.dark}, inset -3px -3px 6px ${N.light}`
                      : `4px 4px 8px ${N.dark}, -4px -4px 8px ${N.light}`,
                    border: campana.prioridad === 'urgente' ? `1px solid #ef444440` : '1px solid transparent'
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-10 rounded-full" style={{ background: getColorTipo(campana.tipo) }} />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold" style={{ color: N.textSub }}>{campana.codigo}</span>
                          <NeoBadge color={getColorPrioridad(campana.prioridad)}>
                            {campana.prioridad.toUpperCase()}
                          </NeoBadge>
                        </div>
                        <h4 className="font-bold" style={{ color: N.text }}>{campana.nombre}</h4>
                        <p className="text-sm font-bold" style={{ color: N.textSub }}>{campana.anunciante}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right text-xs font-bold" style={{ color: N.textSub }}>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {campana.fechaInicio.toLocaleDateString('es-CL')} - {campana.fechaFin.toLocaleDateString('es-CL')}
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          <Radio className="w-3 h-3" />
                          {campana.emisoras} emisoras • {campana.spotsTotal} spots
                        </div>
                      </div>
                      <NeoButton size="sm" variant="secondary">
                        {campana.tipo === 'confirmacion' ? (
                          <>
                            <CheckCircle2 className="w-4 h-4" />
                            Confirmar
                          </>
                        ) : campana.tipo === 'modificacion' ? (
                          <>
                            <Edit2 className="w-4 h-4" />
                            Modificar
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4" />
                            Programar
                          </>
                        )}
                      </NeoButton>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </NeoCard>
        </div>

        {/* COLUMNA DERECHA: ESTADÍSTICAS Y ALERTAS */}
        <div className="col-span-4 space-y-4">
          {/* Mi Carga */}
          <NeoCard>
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-5 h-5" style={{ color: N.accent }} />
              <h3 className="font-black" style={{ color: N.text }}>📊 Mi Carga Hoy</h3>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <StatBox label="Programadas" count={stats.programadas} color="#22c55e" />
              <StatBox label="En Proceso" count={stats.enProceso} color="#f59e0b" />
              <StatBox label="Pendientes" count={stats.pendientes} color="#ef4444" />
              <StatBox label="Spots Hoy" count={stats.spotsHoy} color={N.accent} />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-bold" style={{ color: N.textSub }}>Cumplimiento del turno</span>
                <span className="font-black" style={{ color: N.text }}>{stats.porcentajeCumplimiento}%</span>
              </div>
              <div style={{ background: N.base, boxShadow: `inset 2px 2px 4px ${N.dark}, inset -2px -2px 4px ${N.light}`, borderRadius: '10px', height: '8px', overflow: 'hidden' }}>
                <div style={{ width: `${stats.porcentajeCumplimiento}%`, height: '100%', background: N.accent, borderRadius: '10px' }} />
              </div>
            </div>
          </NeoCard>

          {/* Alertas */}
          <NeoCard>
            <div className="flex items-center gap-2 mb-4">
              <Bell className="w-5 h-5" style={{ color: N.accent }} />
              <h3 className="font-black" style={{ color: N.text }}>🔔 Alertas</h3>
            </div>

            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {alertas.map(alerta => (
                <div
                  key={alerta.id}
                  className="p-3 rounded-xl"
                  style={{
                    background: N.base,
                    boxShadow: `inset 2px 2px 4px ${N.dark}, inset -2px -2px 4px ${N.light}`,
                    border: `1px solid ${alerta.tipo === 'critica' ? '#ef4444' : alerta.tipo === 'advertencia' ? '#f59e0b' : N.accent}30`
                  }}
                >
                  <div className="flex items-start gap-2">
                    {getIconoAlerta(alerta.tipo)}
                    <div className="flex-1">
                      <p className="text-sm font-bold" style={{ color: N.text }}>{alerta.mensaje}</p>
                      <p className="text-xs font-bold mt-1" style={{ color: N.textSub }}>
                        {alerta.fechaHora.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </NeoCard>

          {/* Acciones Rápidas */}
          <NeoCard>
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-5 h-5" style={{ color: N.accent }} />
              <h3 className="font-black" style={{ color: N.text }}>⚡ Acciones Rápidas</h3>
            </div>

            <div className="space-y-2">
              <NeoButton variant="secondary" className="w-full justify-start">
                <FileText className="w-4 h-4" />
                Nueva Campaña Rápida
              </NeoButton>
              <NeoButton variant="secondary" className="w-full justify-start">
                <Calendar className="w-4 h-4" />
                Ver Log del Día
              </NeoButton>
              <NeoButton variant="secondary" className="w-full justify-start">
                <Eye className="w-4 h-4" />
                Vista Parrilla
              </NeoButton>
              <NeoButton variant="secondary" className="w-full justify-start">
                <Target className="w-4 h-4" />
                Mis Campañas Activas
              </NeoButton>
            </div>
          </NeoCard>
        </div>
      </div>
    </div>
  );
}

function ContadorCard({ color, label, count, onClick }: { color: string; label: string; count: number; onClick: () => void }) {
  return (
    <div
      className="p-3 rounded-2xl cursor-pointer transition-all"
      onClick={onClick}
      style={{ background: N.base, boxShadow: `4px 4px 8px ${N.dark}, -4px -4px 8px ${N.light}` }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = `2px 2px 4px ${N.dark}, -2px -2px 4px ${N.light}`; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = `4px 4px 8px ${N.dark}, -4px -4px 8px ${N.light}`; }}
    >
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full" style={{ background: color }} />
        <span className="text-xs font-bold uppercase" style={{ color }}>{label}</span>
      </div>
      <p className="text-2xl font-black mt-1" style={{ color }}>{count}</p>
    </div>
  );
}

function StatBox({ label, count, color }: { label: string; count: number; color: string }) {
  return (
    <div className="p-3 rounded-2xl" style={{ background: N.base, boxShadow: `inset 2px 2px 4px ${N.dark}, inset -2px -2px 4px ${N.light}` }}>
      <p className="text-xs font-bold uppercase" style={{ color }}>{label}</p>
      <p className="text-2xl font-black" style={{ color }}>{count}</p>
    </div>
  );
}
