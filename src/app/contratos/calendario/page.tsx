/**
 * 📅 SILEXAR PULSE - Contract Calendar Integration TIER 0
 * 
 * @description Calendario integrado que muestra:
 * - Vencimientos de contratos
 * - Fechas de renovación
 * - Obligaciones pendientes
 * - Reuniones programadas
 * - Recordatorios
 * 
 * @version 2025.4.0
 * @tier TIER_0_FORTUNE_10
 */

'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Plus,
  Bell,
  FileText,
  Clock,
  Users,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Download,
  X
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

type TipoEvento = 
  | 'vencimiento'
  | 'renovacion'
  | 'obligacion'
  | 'reunion'
  | 'recordatorio'
  | 'pago'
  | 'firma'
  | 'entrega';

interface EventoCalendario {
  id: string;
  tipo: TipoEvento;
  titulo: string;
  descripcion?: string;
  fecha: Date;
  horaInicio?: string;
  horaFin?: string;
  todoElDia: boolean;
  contratoId?: string;
  numeroContrato?: string;
  clienteNombre?: string;
  valor?: number;
  prioridad: 'baja' | 'media' | 'alta' | 'urgente';
  completado: boolean;
  recordatorioEnviado: boolean;
  participantes?: string[];
}

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
// MOCK DATA
// ═══════════════════════════════════════════════════════════════

const generarEventosMock = (): EventoCalendario[] => {
  const hoy = new Date();
  const eventos: EventoCalendario[] = [];

  // Generar eventos para el mes
  for (let i = -10; i < 20; i++) {
    const fecha = new Date(hoy);
    fecha.setDate(fecha.getDate() + i);

    // Vencimientos
    if (i === 5 || i === 12 || i === 18) {
      eventos.push({
        id: `ev-venc-${i}`,
        tipo: 'vencimiento',
        titulo: `Vence contrato ${i === 5 ? 'Banco Chile' : i === 12 ? 'Falabella' : 'Cencosud'}`,
        fecha,
        todoElDia: true,
        contratoId: `ctr-${i}`,
        numeroContrato: `CTR-2025-${100 + i}`,
        clienteNombre: i === 5 ? 'Banco Chile' : i === 12 ? 'Falabella' : 'Cencosud',
        valor: 80000000 + i * 5000000,
        prioridad: i < 7 ? 'urgente' : 'alta',
        completado: false,
        recordatorioEnviado: i < 7
      });
    }

    // Renovaciones
    if (i === 3 || i === 15) {
      eventos.push({
        id: `ev-ren-${i}`,
        tipo: 'renovacion',
        titulo: `Renovación ${i === 3 ? 'Paris' : 'Ripley'}`,
        descripcion: 'Iniciar proceso de renovación',
        fecha,
        todoElDia: true,
        contratoId: `ctr-${i}`,
        numeroContrato: `CTR-2024-${80 + i}`,
        clienteNombre: i === 3 ? 'Paris' : 'Ripley',
        prioridad: 'media',
        completado: false,
        recordatorioEnviado: false
      });
    }

    // Reuniones
    if (i === 1 || i === 4 || i === 8) {
      eventos.push({
        id: `ev-reu-${i}`,
        tipo: 'reunion',
        titulo: `Reunión ${i === 1 ? 'revisión contrato' : i === 4 ? 'negociación' : 'cierre'}`,
        fecha,
        horaInicio: '10:00',
        horaFin: '11:00',
        todoElDia: false,
        clienteNombre: ['Banco Chile', 'Falabella', 'Cencosud'][i % 3],
        prioridad: 'media',
        completado: i < 0,
        recordatorioEnviado: true,
        participantes: ['Carlos Mendoza', 'Ana García']
      });
    }

    // Pagos
    if (i === 2 || i === 10 || i === 20) {
      eventos.push({
        id: `ev-pago-${i}`,
        tipo: 'pago',
        titulo: `Vence factura ${i === 2 ? '#12345' : i === 10 ? '#12346' : '#12347'}`,
        fecha,
        todoElDia: true,
        valor: 15000000 + i * 1000000,
        clienteNombre: ['Paris', 'Ripley', 'Hites'][i % 3],
        prioridad: i < 5 ? 'alta' : 'media',
        completado: false,
        recordatorioEnviado: false
      });
    }

    // Firmas pendientes
    if (i === 0 || i === 6) {
      eventos.push({
        id: `ev-firma-${i}`,
        tipo: 'firma',
        titulo: `Firma pendiente ${i === 0 ? 'CTR-2025-089' : 'CTR-2025-092'}`,
        descripcion: 'El cliente debe firmar',
        fecha,
        todoElDia: true,
        contratoId: `ctr-${i}`,
        numeroContrato: i === 0 ? 'CTR-2025-089' : 'CTR-2025-092',
        clienteNombre: i === 0 ? 'Banco Santander' : 'BCI',
        prioridad: 'alta',
        completado: false,
        recordatorioEnviado: i === 0
      });
    }
  }

  return eventos;
};

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════

const DIAS_SEMANA = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

const getTipoConfig = (tipo: TipoEvento) => {
  const configs: Record<TipoEvento, { icon: React.ReactNode; color: string; bgColor: string }> = {
    vencimiento: { icon: <AlertTriangle className="w-3 h-3" />, color: 'text-red-600', bgColor: 'bg-red-100' },
    renovacion: { icon: <RefreshCw className="w-3 h-3" />, color: 'text-blue-600', bgColor: 'bg-blue-100' },
    obligacion: { icon: <FileText className="w-3 h-3" />, color: 'text-purple-600', bgColor: 'bg-purple-100' },
    reunion: { icon: <Users className="w-3 h-3" />, color: 'text-green-600', bgColor: 'bg-green-100' },
    recordatorio: { icon: <Bell className="w-3 h-3" />, color: 'text-amber-600', bgColor: 'bg-amber-100' },
    pago: { icon: <DollarSign className="w-3 h-3" />, color: 'text-emerald-600', bgColor: 'bg-emerald-100' },
    firma: { icon: <FileText className="w-3 h-3" />, color: 'text-indigo-600', bgColor: 'bg-indigo-100' },
    entrega: { icon: <CheckCircle className="w-3 h-3" />, color: 'text-teal-600', bgColor: 'bg-teal-100' }
  };
  return configs[tipo];
};

const formatCurrency = (value: number) => {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(0)}M`;
  return `$${(value / 1000).toFixed(0)}K`;
};

const esMismoDia = (fecha1: Date, fecha2: Date) => {
  return fecha1.getDate() === fecha2.getDate() &&
    fecha1.getMonth() === fecha2.getMonth() &&
    fecha1.getFullYear() === fecha2.getFullYear();
};

// ═══════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════

export default function CalendarioContratosPage() {
  const [fechaActual, setFechaActual] = useState(new Date());
  const [eventos] = useState<EventoCalendario[]>(generarEventosMock());
  const [diaSeleccionado, setDiaSeleccionado] = useState<Date | null>(new Date());
  const [filtroTipo, setFiltroTipo] = useState<TipoEvento | 'todos'>('todos');
  const [showEventoModal, setShowEventoModal] = useState<EventoCalendario | null>(null);

  // Calcular días del mes
  const diasMes = useMemo(() => {
    const primerDia = new Date(fechaActual.getFullYear(), fechaActual.getMonth(), 1);
    const ultimoDia = new Date(fechaActual.getFullYear(), fechaActual.getMonth() + 1, 0);
    
    const dias: { fecha: Date; esMesActual: boolean }[] = [];
    
    // Días del mes anterior
    const primerDiaSemana = primerDia.getDay();
    for (let i = primerDiaSemana - 1; i >= 0; i--) {
      const fecha = new Date(primerDia);
      fecha.setDate(fecha.getDate() - i - 1);
      dias.push({ fecha, esMesActual: false });
    }
    
    // Días del mes actual
    for (let d = 1; d <= ultimoDia.getDate(); d++) {
      dias.push({ 
        fecha: new Date(fechaActual.getFullYear(), fechaActual.getMonth(), d), 
        esMesActual: true 
      });
    }
    
    // Días del mes siguiente para completar la grilla
    const diasRestantes = 42 - dias.length;
    for (let i = 1; i <= diasRestantes; i++) {
      const fecha = new Date(ultimoDia);
      fecha.setDate(fecha.getDate() + i);
      dias.push({ fecha, esMesActual: false });
    }
    
    return dias;
  }, [fechaActual]);

  const eventosFiltrados = useMemo(() => {
    return eventos.filter(e => filtroTipo === 'todos' || e.tipo === filtroTipo);
  }, [eventos, filtroTipo]);

  const eventosDelDia = useMemo(() => {
    if (!diaSeleccionado) return [];
    return eventosFiltrados
      .filter(e => esMismoDia(e.fecha, diaSeleccionado))
      .sort((a, b) => {
        if (a.horaInicio && b.horaInicio) return a.horaInicio.localeCompare(b.horaInicio);
        return 0;
      });
  }, [diaSeleccionado, eventosFiltrados]);

  const cambiarMes = (delta: number) => {
    const nuevaFecha = new Date(fechaActual);
    nuevaFecha.setMonth(nuevaFecha.getMonth() + delta);
    setFechaActual(nuevaFecha);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className={`${neuro.panel} p-6 mb-6`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600">
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-800">Calendario de Contratos</h1>
                <p className="text-slate-500">
                  Vencimientos, renovaciones, obligaciones y eventos
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <select
                value={filtroTipo}
                onChange={e => setFiltroTipo(e.target.value as TipoEvento | 'todos')}
                className={`${neuro.btnSecondary} px-4 py-2`}
              >
                <option value="todos">Todos los eventos</option>
                <option value="vencimiento">Vencimientos</option>
                <option value="renovacion">Renovaciones</option>
                <option value="reunion">Reuniones</option>
                <option value="pago">Pagos</option>
                <option value="firma">Firmas</option>
              </select>

              <button className={`${neuro.btnSecondary} p-2`}>
                <Download className="w-5 h-5" />
              </button>
              <button className={`${neuro.btnPrimary} px-4 py-2 flex items-center gap-2`}>
                <Plus className="w-5 h-5" />
                Nuevo evento
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Calendario */}
          <div className={`${neuro.panel} p-6 col-span-2`}>
            {/* Navegación del mes */}
            <div className="flex items-center justify-between mb-6">
              <button 
                onClick={() => cambiarMes(-1)}
                className={`${neuro.btnSecondary} p-2`}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <h2 className="text-xl font-bold text-slate-800">
                {MESES[fechaActual.getMonth()]} {fechaActual.getFullYear()}
              </h2>
              
              <button 
                onClick={() => cambiarMes(1)}
                className={`${neuro.btnSecondary} p-2`}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Días de la semana */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {DIAS_SEMANA.map(dia => (
                <div key={dia} className="text-center text-sm font-semibold text-slate-500 py-2">
                  {dia}
                </div>
              ))}
            </div>

            {/* Grilla de días */}
            <div className="grid grid-cols-7 gap-1">
              {diasMes.map(({ fecha, esMesActual }, idx) => {
                const eventosDelDia = eventosFiltrados.filter(e => esMismoDia(e.fecha, fecha));
                const esHoy = esMismoDia(fecha, new Date());
                const esSeleccionado = diaSeleccionado && esMismoDia(fecha, diaSeleccionado);
                
                return (
                  <motion.button
                    key={idx}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => setDiaSeleccionado(fecha)}
                    className={`
                      ${neuro.card} p-2 min-h-24 text-left relative
                      ${!esMesActual ? 'opacity-40' : ''}
                      ${esSeleccionado ? 'ring-2 ring-indigo-400' : ''}
                      ${esHoy ? 'ring-2 ring-blue-400' : ''}
                    `}
                  >
                    <span className={`text-sm font-semibold ${
                      esHoy ? 'bg-blue-500 text-white px-2 py-0.5 rounded-full' : 'text-slate-700'
                    }`}>
                      {fecha.getDate()}
                    </span>
                    
                    {/* Indicadores de eventos */}
                    <div className="mt-1 space-y-0.5">
                      {eventosDelDia.slice(0, 3).map(evento => {
                        const config = getTipoConfig(evento.tipo);
                        return (
                          <div 
                            key={evento.id}
                            className={`${config.bgColor} ${config.color} text-xs px-1 py-0.5 rounded truncate`}
                          >
                            {evento.titulo.substring(0, 15)}...
                          </div>
                        );
                      })}
                      {eventosDelDia.length > 3 && (
                        <div className="text-xs text-slate-400">
                          +{eventosDelDia.length - 3} más
                        </div>
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Panel lateral - Eventos del día */}
          <div className={`${neuro.panel} p-6`}>
            <h3 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-500" />
              {diaSeleccionado ? (
                <span>
                  {diaSeleccionado.getDate()} de {MESES[diaSeleccionado.getMonth()]}
                </span>
              ) : (
                <span>Selecciona un día</span>
              )}
            </h3>

            <div className="space-y-3 max-h-[60vh] overflow-y-auto">
              {eventosDelDia.map(evento => {
                const config = getTipoConfig(evento.tipo);
                
                return (
                  <motion.div
                    key={evento.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={() => setShowEventoModal(evento)}
                    className={`${neuro.card} p-4 cursor-pointer hover:shadow-lg transition-shadow border-l-4`}
                    style={{ borderLeftColor: config.color.replace('text-', '').replace('-600', '') }}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${config.bgColor} ${config.color}`}>
                        {config.icon}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-sm text-slate-800">{evento.titulo}</p>
                        {evento.clienteNombre && (
                          <p className="text-xs text-slate-500">{evento.clienteNombre}</p>
                        )}
                        {evento.horaInicio && (
                          <p className="text-xs text-slate-400 mt-1">
                            {evento.horaInicio} - {evento.horaFin}
                          </p>
                        )}
                        {evento.valor && (
                          <p className="text-sm font-bold text-slate-700 mt-1">
                            {formatCurrency(evento.valor)}
                          </p>
                        )}
                      </div>
                      <span className={`${neuro.badge} ${
                        evento.prioridad === 'urgente' ? 'bg-red-100 text-red-700' :
                        evento.prioridad === 'alta' ? 'bg-orange-100 text-orange-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {evento.prioridad}
                      </span>
                    </div>
                  </motion.div>
                );
              })}

              {eventosDelDia.length === 0 && (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500">Sin eventos este día</p>
                </div>
              )}
            </div>

            {/* Resumen del mes */}
            <div className="mt-6 pt-4 border-t border-slate-200">
              <h4 className="text-sm font-semibold text-slate-600 mb-3">Resumen del mes</h4>
              <div className="grid grid-cols-2 gap-2">
                <div className="text-center p-2 bg-red-50 rounded-lg">
                  <p className="text-lg font-bold text-red-600">
                    {eventos.filter(e => e.tipo === 'vencimiento').length}
                  </p>
                  <p className="text-xs text-red-500">Vencimientos</p>
                </div>
                <div className="text-center p-2 bg-blue-50 rounded-lg">
                  <p className="text-lg font-bold text-blue-600">
                    {eventos.filter(e => e.tipo === 'renovacion').length}
                  </p>
                  <p className="text-xs text-blue-500">Renovaciones</p>
                </div>
                <div className="text-center p-2 bg-green-50 rounded-lg">
                  <p className="text-lg font-bold text-green-600">
                    {eventos.filter(e => e.tipo === 'reunion').length}
                  </p>
                  <p className="text-xs text-green-500">Reuniones</p>
                </div>
                <div className="text-center p-2 bg-emerald-50 rounded-lg">
                  <p className="text-lg font-bold text-emerald-600">
                    {eventos.filter(e => e.tipo === 'pago').length}
                  </p>
                  <p className="text-xs text-emerald-500">Pagos</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de evento */}
      <AnimatePresence>
        {showEventoModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowEventoModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className={`${neuro.panel} p-6 max-w-md w-full mx-4`}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${getTipoConfig(showEventoModal.tipo).bgColor} ${getTipoConfig(showEventoModal.tipo).color}`}>
                    {getTipoConfig(showEventoModal.tipo).icon}
                  </div>
                  <h3 className="font-bold text-lg text-slate-800">{showEventoModal.titulo}</h3>
                </div>
                <button onClick={() => setShowEventoModal(null)}>
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span>{showEventoModal.fecha.toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
                </div>

                {showEventoModal.horaInicio && (
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span>{showEventoModal.horaInicio} - {showEventoModal.horaFin}</span>
                  </div>
                )}

                {showEventoModal.clienteNombre && (
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="w-4 h-4 text-slate-400" />
                    <span>{showEventoModal.clienteNombre}</span>
                  </div>
                )}

                {showEventoModal.numeroContrato && (
                  <div className="flex items-center gap-2 text-sm">
                    <FileText className="w-4 h-4 text-slate-400" />
                    <a href={`/contratos/${showEventoModal.contratoId}`} className="text-indigo-600 hover:underline">
                      {showEventoModal.numeroContrato}
                    </a>
                  </div>
                )}

                {showEventoModal.valor && (
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="w-4 h-4 text-slate-400" />
                    <span className="font-semibold">{formatCurrency(showEventoModal.valor)}</span>
                  </div>
                )}

                {showEventoModal.descripcion && (
                  <p className="text-sm text-slate-600 mt-2">{showEventoModal.descripcion}</p>
                )}
              </div>

              <div className="flex items-center gap-3 mt-6">
                {showEventoModal.contratoId && (
                  <a 
                    href={`/contratos/${showEventoModal.contratoId}`}
                    className={`${neuro.btnPrimary} flex-1 py-2 text-center`}
                  >
                    Ver contrato
                  </a>
                )}
                <button className={`${neuro.btnSecondary} px-4 py-2`}>
                  <Bell className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
