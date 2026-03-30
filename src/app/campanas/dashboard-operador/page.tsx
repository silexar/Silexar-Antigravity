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
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
// Tabs components removed - not used in this view
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
      case 'urgente': return 'bg-red-100 text-red-700 border-red-300';
      case 'alta': return 'bg-orange-100 text-orange-700 border-orange-300';
      case 'normal': return 'bg-blue-100 text-blue-700 border-blue-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  // Obtener color de tipo
  const getColorTipo = (tipo: string) => {
    switch (tipo) {
      case 'urgente': return 'bg-red-500';
      case 'nueva': return 'bg-green-500';
      case 'modificacion': return 'bg-amber-500';
      case 'confirmacion': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  // Obtener icono de alerta
  const getIconoAlerta = (tipo: string) => {
    switch (tipo) {
      case 'critica': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'advertencia': return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      default: return <Bell className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <User className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              🌅 Dashboard de Turno
            </h1>
            <p className="text-sm text-gray-500">
              {operador.operadorNombre} • Turno {operador.turnoInicio.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })} - {operador.turnoFin.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400">
            Última actualización: {ultimaActualizacion.toLocaleTimeString('es-CL')}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={refrescar}
            disabled={cargando}
            className="gap-1"
          >
            {cargando ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            Refrescar
          </Button>
        </div>
      </div>

      {/* ALERTAS CRÍTICAS (siempre visible si hay) */}
      {contadores.alertasCriticas > 0 && (
        <Card className="p-4 mb-6 border-red-200 bg-red-50 animate-pulse">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <h3 className="font-bold text-red-700">
              ⚠️ {contadores.alertasCriticas} Alerta(s) Crítica(s)
            </h3>
          </div>
          <div className="space-y-2">
            {alertas.filter(a => a.tipo === 'critica').map(alerta => (
              <div key={alerta.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-red-200">
                <div className="flex items-center gap-3">
                  {getIconoAlerta(alerta.tipo)}
                  <div>
                    <p className="text-sm font-medium text-gray-800">{alerta.mensaje}</p>
                    {alerta.campanaCodigo && (
                      <span className="text-xs text-gray-500">{alerta.campanaCodigo}</span>
                    )}
                  </div>
                </div>
                {alerta.accion && (
                  <Button size="sm" variant="destructive" className="gap-1">
                    <Zap className="w-3 h-3" />
                    {alerta.accion}
                  </Button>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* GRID PRINCIPAL */}
      <div className="grid grid-cols-12 gap-6">
        {/* COLUMNA IZQUIERDA: INBOX */}
        <div className="col-span-8">
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Inbox className="w-5 h-5 text-blue-600" />
                <h2 className="font-bold text-gray-900">📥 Inbox de Campañas</h2>
              </div>
              <Select value={filtroInbox} onValueChange={setFiltroInbox}>
                <SelectTrigger className="w-40 h-8">
                  <SelectValue placeholder="Filtrar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos ({inbox.length})</SelectItem>
                  <SelectItem value="urgente">🔴 Urgentes ({contadores.urgentes})</SelectItem>
                  <SelectItem value="nueva">🟢 Nuevas ({contadores.nuevas})</SelectItem>
                  <SelectItem value="modificacion">🟡 Modificaciones ({contadores.modificaciones})</SelectItem>
                  <SelectItem value="confirmacion">🔵 Confirmaciones ({contadores.confirmaciones})</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Contadores rápidos */}
            <div className="grid grid-cols-4 gap-3 mb-4">
              <div className="p-3 bg-red-50 rounded-lg border border-red-200 cursor-pointer hover:bg-red-100 transition-colors"
                   onClick={() => setFiltroInbox('urgente')}>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  <span className="text-xs font-medium text-red-700">Urgentes</span>
                </div>
                <p className="text-2xl font-bold text-red-700 mt-1">{contadores.urgentes}</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg border border-green-200 cursor-pointer hover:bg-green-100 transition-colors"
                   onClick={() => setFiltroInbox('nueva')}>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-xs font-medium text-green-700">Nuevas</span>
                </div>
                <p className="text-2xl font-bold text-green-700 mt-1">{contadores.nuevas}</p>
              </div>
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 cursor-pointer hover:bg-amber-100 transition-colors"
                   onClick={() => setFiltroInbox('modificacion')}>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                  <span className="text-xs font-medium text-amber-700">Modificar</span>
                </div>
                <p className="text-2xl font-bold text-amber-700 mt-1">{contadores.modificaciones}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 cursor-pointer hover:bg-blue-100 transition-colors"
                   onClick={() => setFiltroInbox('confirmacion')}>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span className="text-xs font-medium text-blue-700">Confirmar</span>
                </div>
                <p className="text-2xl font-bold text-blue-700 mt-1">{contadores.confirmaciones}</p>
              </div>
            </div>

            {/* Lista de campañas */}
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {inboxFiltrado.map(campana => (
                <div
                  key={campana.id}
                  className={`p-4 border rounded-lg hover:shadow-md transition-all cursor-pointer ${
                    campana.prioridad === 'urgente' ? 'bg-red-50 border-red-200' : 'bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-10 rounded-full ${getColorTipo(campana.tipo)}`}></div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-gray-500">{campana.codigo}</span>
                          <Badge className={`text-xs ${getColorPrioridad(campana.prioridad)}`}>
                            {campana.prioridad.toUpperCase()}
                          </Badge>
                        </div>
                        <h4 className="font-semibold text-gray-900">{campana.nombre}</h4>
                        <p className="text-sm text-gray-600">{campana.anunciante}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {campana.fechaInicio.toLocaleDateString('es-CL')} - {campana.fechaFin.toLocaleDateString('es-CL')}
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          <Radio className="w-3 h-3" />
                          {campana.emisoras} emisoras • {campana.spotsTotal} spots
                        </div>
                      </div>
                      <Button size="sm" variant="outline" className="gap-1">
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
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* COLUMNA DERECHA: ESTADÍSTICAS Y ALERTAS */}
        <div className="col-span-4 space-y-4">
          {/* Mi Carga */}
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-5 h-5 text-purple-600" />
              <h3 className="font-bold text-gray-900">📊 Mi Carga Hoy</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-xs text-green-600">Programadas</p>
                <p className="text-2xl font-bold text-green-700">{stats.programadas}</p>
              </div>
              <div className="p-3 bg-amber-50 rounded-lg">
                <p className="text-xs text-amber-600">En Proceso</p>
                <p className="text-2xl font-bold text-amber-700">{stats.enProceso}</p>
              </div>
              <div className="p-3 bg-red-50 rounded-lg">
                <p className="text-xs text-red-600">Pendientes</p>
                <p className="text-2xl font-bold text-red-700">{stats.pendientes}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-600">Spots Hoy</p>
                <p className="text-2xl font-bold text-blue-700">{stats.spotsHoy}</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Cumplimiento del turno</span>
                <span className="font-semibold text-gray-900">{stats.porcentajeCumplimiento}%</span>
              </div>
              <Progress value={stats.porcentajeCumplimiento} className="h-2" />
            </div>
          </Card>

          {/* Alertas */}
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <Bell className="w-5 h-5 text-amber-600" />
              <h3 className="font-bold text-gray-900">🔔 Alertas</h3>
            </div>
            
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {alertas.map(alerta => (
                <div
                  key={alerta.id}
                  className={`p-3 rounded-lg border ${
                    alerta.tipo === 'critica' ? 'bg-red-50 border-red-200' :
                    alerta.tipo === 'advertencia' ? 'bg-amber-50 border-amber-200' :
                    'bg-blue-50 border-blue-200'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {getIconoAlerta(alerta.tipo)}
                    <div className="flex-1">
                      <p className="text-sm text-gray-800">{alerta.mensaje}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {alerta.fechaHora.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Acciones Rápidas */}
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-5 h-5 text-yellow-600" />
              <h3 className="font-bold text-gray-900">⚡ Acciones Rápidas</h3>
            </div>
            
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start gap-2">
                <FileText className="w-4 h-4" />
                Nueva Campaña Rápida
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2">
                <Calendar className="w-4 h-4" />
                Ver Log del Día
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2">
                <Eye className="w-4 h-4" />
                Vista Parrilla
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2">
                <Target className="w-4 h-4" />
                Mis Campañas Activas
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
