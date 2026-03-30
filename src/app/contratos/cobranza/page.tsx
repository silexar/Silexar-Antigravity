/**
 * 📞 SILEXAR PULSE - Panel de Cobranza Automatizada TIER 0
 * 
 * @description Sistema de cobranza multi-canal con:
 * - Acciones automáticas por nivel de mora
 * - Historial de contactos
 * - Promesas de pago
 * - Escalamiento inteligente
 * - Reportes de efectividad
 * 
 * @version 2025.4.0
 * @tier TIER_0_FORTUNE_10
 */

'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Phone,
  Mail,
  MessageSquare,
  FileText,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Calendar,
  ChevronRight,
  Play,
  TrendingUp,
  User,
  Send,
  Sparkles
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

type CanalContacto = 'email' | 'telefono' | 'whatsapp' | 'carta' | 'visita';
type ResultadoContacto = 'exitoso' | 'sin_respuesta' | 'promesa_pago' | 'rechazo' | 'numero_erroneo' | 'escalado';
type NivelCobranza = 'preventiva' | 'leve' | 'moderada' | 'agresiva' | 'legal';

interface ContactoCobranza {
  id: string;
  fecha: Date;
  canal: CanalContacto;
  resultado: ResultadoContacto;
  agente: string;
  notas?: string;
  promesaPago?: {
    fecha: Date;
    monto: number;
    cumplida?: boolean;
  };
}

interface CasoCobranza {
  id: string;
  facturaId: string;
  folio: string;
  clienteNombre: string;
  clienteRut: string;
  telefono: string;
  email: string;
  montoVencido: number;
  diasMora: number;
  nivel: NivelCobranza;
  historialContactos: ContactoCobranza[];
  proximaAccion: {
    fecha: Date;
    canal: CanalContacto;
    descripcion: string;
  };
  probabilidadRecuperacion: number;
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
  btnDanger: `
    bg-gradient-to-br from-red-500 to-rose-600
    text-white font-semibold rounded-xl
    shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]
    hover:shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]
    transition-all duration-200
  `,
  badge: `
    px-3 py-1 rounded-lg
    shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]
    text-xs font-medium
  `,
  input: `
    bg-gradient-to-br from-slate-100 to-slate-50
    rounded-xl
    shadow-[inset_3px_3px_6px_#d1d5db,inset_-3px_-3px_6px_#ffffff]
    border-none
    focus:ring-2 focus:ring-indigo-400/50 focus:outline-none
    px-4 py-3
  `
};

// ═══════════════════════════════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════════════════════════════

const generarCasosMock = (): CasoCobranza[] => [
  {
    id: 'caso-1',
    facturaId: 'f-1',
    folio: 'FAC-2025-001235',
    clienteNombre: 'Falabella',
    clienteRut: '90.749.000-9',
    telefono: '+56 22 390 4000',
    email: 'pagos@falabella.cl',
    montoVencido: 45800000,
    diasMora: 8,
    nivel: 'leve',
    historialContactos: [
      {
        id: 'c-1',
        fecha: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        canal: 'email',
        resultado: 'sin_respuesta',
        agente: 'Sistema automático'
      }
    ],
    proximaAccion: {
      fecha: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      canal: 'telefono',
      descripcion: 'Llamada de seguimiento'
    },
    probabilidadRecuperacion: 78
  },
  {
    id: 'caso-2',
    facturaId: 'f-2',
    folio: 'FAC-2025-001236',
    clienteNombre: 'Cencosud',
    clienteRut: '93.834.000-5',
    telefono: '+56 22 959 0000',
    email: 'tesoreria@cencosud.cl',
    montoVencido: 60000000,
    diasMora: 25,
    nivel: 'moderada',
    historialContactos: [
      {
        id: 'c-2',
        fecha: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        canal: 'email',
        resultado: 'promesa_pago',
        agente: 'Carlos Mendoza',
        promesaPago: { fecha: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), monto: 60000000, cumplida: false }
      },
      {
        id: 'c-3',
        fecha: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        canal: 'telefono',
        resultado: 'sin_respuesta',
        agente: 'Carlos Mendoza'
      }
    ],
    proximaAccion: {
      fecha: new Date(),
      canal: 'telefono',
      descripcion: 'Llamada urgente - promesa incumplida'
    },
    probabilidadRecuperacion: 65
  },
  {
    id: 'caso-3',
    facturaId: 'f-3',
    folio: 'FAC-2025-001237',
    clienteNombre: 'Ripley',
    clienteRut: '96.632.000-K',
    telefono: '+56 22 378 5000',
    email: 'pagos@ripley.cl',
    montoVencido: 38500000,
    diasMora: 45,
    nivel: 'agresiva',
    historialContactos: [
      {
        id: 'c-4',
        fecha: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        canal: 'email',
        resultado: 'sin_respuesta',
        agente: 'Sistema automático'
      },
      {
        id: 'c-5',
        fecha: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
        canal: 'telefono',
        resultado: 'promesa_pago',
        agente: 'Ana García',
        promesaPago: { fecha: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), monto: 38500000, cumplida: false }
      },
      {
        id: 'c-6',
        fecha: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        canal: 'carta',
        resultado: 'sin_respuesta',
        agente: 'Sistema automático',
        notas: 'Carta formal de cobranza enviada'
      }
    ],
    proximaAccion: {
      fecha: new Date(),
      canal: 'visita',
      descripcion: 'Visita presencial o escalamiento legal'
    },
    probabilidadRecuperacion: 42
  }
];

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════

const formatCurrency = (value: number) => {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(0)}M`;
  return `$${(value / 1000).toFixed(0)}K`;
};

const formatFechaHora = (fecha: Date) => {
  return fecha.toLocaleString('es-CL', { 
    day: '2-digit', 
    month: 'short', 
    hour: '2-digit', 
    minute: '2-digit' 
  });
};

const getNivelConfig = (nivel: NivelCobranza) => {
  const configs = {
    preventiva: { label: 'Preventiva', color: 'text-blue-600', bgColor: 'bg-blue-100' },
    leve: { label: 'Leve', color: 'text-green-600', bgColor: 'bg-green-100' },
    moderada: { label: 'Moderada', color: 'text-amber-600', bgColor: 'bg-amber-100' },
    agresiva: { label: 'Agresiva', color: 'text-orange-600', bgColor: 'bg-orange-100' },
    legal: { label: 'Legal', color: 'text-red-600', bgColor: 'bg-red-100' }
  };
  return configs[nivel];
};

const getCanalIcon = (canal: CanalContacto) => {
  switch (canal) {
    case 'email': return <Mail className="w-4 h-4" />;
    case 'telefono': return <Phone className="w-4 h-4" />;
    case 'whatsapp': return <MessageSquare className="w-4 h-4" />;
    case 'carta': return <FileText className="w-4 h-4" />;
    case 'visita': return <User className="w-4 h-4" />;
  }
};

const getResultadoConfig = (resultado: ResultadoContacto) => {
  const configs = {
    exitoso: { label: 'Exitoso', color: 'text-green-600', icon: <CheckCircle className="w-4 h-4" /> },
    sin_respuesta: { label: 'Sin respuesta', color: 'text-slate-500', icon: <XCircle className="w-4 h-4" /> },
    promesa_pago: { label: 'Promesa de pago', color: 'text-blue-600', icon: <Calendar className="w-4 h-4" /> },
    rechazo: { label: 'Rechazo', color: 'text-red-600', icon: <XCircle className="w-4 h-4" /> },
    numero_erroneo: { label: 'Número erróneo', color: 'text-amber-600', icon: <AlertTriangle className="w-4 h-4" /> },
    escalado: { label: 'Escalado', color: 'text-purple-600', icon: <TrendingUp className="w-4 h-4" /> }
  };
  return configs[resultado];
};

// ═══════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════

export default function CobranzaAutomatizadaPanel() {
  const [casos] = useState<CasoCobranza[]>(generarCasosMock());
  const [casoSeleccionado, setCasoSeleccionado] = useState<CasoCobranza | null>(null);
  const [registrandoContacto, setRegistrandoContacto] = useState(false);
  const [nuevoContacto, setNuevoContacto] = useState<{
    canal: CanalContacto;
    resultado: ResultadoContacto;
    notas: string;
    promesaMonto?: number;
    promesaFecha?: Date;
  }>({
    canal: 'telefono',
    resultado: 'sin_respuesta',
    notas: ''
  });

  // Estadísticas
  const stats = {
    casosActivos: casos.length,
    montoTotal: casos.reduce((acc, c) => acc + c.montoVencido, 0),
    promesasActivas: casos.filter(c => 
      c.historialContactos.some(h => h.resultado === 'promesa_pago' && !h.promesaPago?.cumplida)
    ).length,
    recuperacionEstimada: casos.reduce((acc, c) => acc + c.montoVencido * (c.probabilidadRecuperacion / 100), 0)
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className={`${neuro.panel} p-6 mb-6`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600">
                <Phone className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-800">Centro de Cobranza</h1>
                <p className="text-slate-500">Gestión automatizada multi-canal</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Quick stats */}
              <div className="flex items-center gap-6 bg-white/50 rounded-xl px-6 py-3">
                <div className="text-center">
                  <p className="text-2xl font-bold text-slate-800">{stats.casosActivos}</p>
                  <p className="text-xs text-slate-500">Casos activos</p>
                </div>
                <div className="h-8 w-px bg-slate-200" />
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-600">{formatCurrency(stats.montoTotal)}</p>
                  <p className="text-xs text-slate-500">Total vencido</p>
                </div>
                <div className="h-8 w-px bg-slate-200" />
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.recuperacionEstimada)}</p>
                  <p className="text-xs text-slate-500">Recup. estimada</p>
                </div>
              </div>

              <button className={`${neuro.btnPrimary} px-4 py-2 flex items-center gap-2`}>
                <Play className="w-5 h-5" />
                Ejecutar cola
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Lista de casos */}
          <div className={`${neuro.panel} p-6 col-span-2`}>
            <h2 className="font-bold text-lg text-slate-800 mb-4">Cola de Cobranza</h2>

            <div className="space-y-3">
              {casos.map(caso => {
                const nivelConfig = getNivelConfig(caso.nivel);
                
                return (
                  <motion.div
                    key={caso.id}
                    onClick={() => setCasoSeleccionado(caso)}
                    className={`${neuro.card} p-4 cursor-pointer hover:shadow-lg transition-all ${
                      casoSeleccionado?.id === caso.id ? 'ring-2 ring-indigo-400' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {/* Indicador de urgencia */}
                        <div className={`w-2 h-16 rounded-full ${
                          caso.diasMora > 45 ? 'bg-red-500' :
                          caso.diasMora > 30 ? 'bg-orange-500' :
                          caso.diasMora > 15 ? 'bg-amber-500' :
                          'bg-green-500'
                        }`} />

                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold text-slate-800">{caso.clienteNombre}</p>
                            <span className={`${neuro.badge} ${nivelConfig.bgColor} ${nivelConfig.color}`}>
                              {nivelConfig.label}
                            </span>
                          </div>
                          <p className="text-sm text-slate-500">{caso.folio}</p>
                          <p className="text-xs text-slate-400">{caso.historialContactos.length} contactos previos</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        {/* Próxima acción */}
                        <div className="text-center">
                          <div className="flex items-center gap-1 text-indigo-600">
                            {getCanalIcon(caso.proximaAccion.canal)}
                            <span className="text-xs font-medium">
                              {formatFechaHora(caso.proximaAccion.fecha)}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400">Próxima acción</p>
                        </div>

                        {/* Días mora */}
                        <div className="text-center">
                          <p className={`font-bold text-lg ${
                            caso.diasMora > 45 ? 'text-red-600' :
                            caso.diasMora > 30 ? 'text-orange-600' :
                            'text-amber-600'
                          }`}>
                            {caso.diasMora}
                          </p>
                          <p className="text-xs text-slate-400">días mora</p>
                        </div>

                        {/* Monto */}
                        <div className="text-right">
                          <p className="font-bold text-lg text-slate-800">{formatCurrency(caso.montoVencido)}</p>
                          <div className="flex items-center gap-1">
                            <Sparkles className={`w-3 h-3 ${
                              caso.probabilidadRecuperacion > 70 ? 'text-green-500' :
                              caso.probabilidadRecuperacion > 50 ? 'text-amber-500' :
                              'text-red-500'
                            }`} />
                            <span className="text-xs text-slate-500">{caso.probabilidadRecuperacion}% prob.</span>
                          </div>
                        </div>

                        <ChevronRight className="w-5 h-5 text-slate-400" />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Panel detalle */}
          <div className={`${neuro.panel} p-6`}>
            {casoSeleccionado ? (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-lg text-slate-800">{casoSeleccionado.clienteNombre}</h3>
                  <button
                    onClick={() => setRegistrandoContacto(true)}
                    className={`${neuro.btnPrimary} px-3 py-2 text-sm flex items-center gap-1`}
                  >
                    <Phone className="w-4 h-4" />
                    Registrar
                  </button>
                </div>

                {/* Info cliente */}
                <div className={`${neuro.card} p-4 mb-4`}>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-slate-400" />
                      <span>{casoSeleccionado.telefono}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-slate-400" />
                      <span>{casoSeleccionado.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-slate-400" />
                      <span className="font-bold text-red-600">{formatCurrency(casoSeleccionado.montoVencido)} vencido</span>
                    </div>
                  </div>
                </div>

                {/* Acciones rápidas */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <button className={`${neuro.btnSecondary} p-3 flex flex-col items-center`}>
                    <Phone className="w-5 h-5 text-green-600 mb-1" />
                    <span className="text-xs">Llamar</span>
                  </button>
                  <button className={`${neuro.btnSecondary} p-3 flex flex-col items-center`}>
                    <Mail className="w-5 h-5 text-blue-600 mb-1" />
                    <span className="text-xs">Email</span>
                  </button>
                  <button className={`${neuro.btnSecondary} p-3 flex flex-col items-center`}>
                    <MessageSquare className="w-5 h-5 text-green-500 mb-1" />
                    <span className="text-xs">WhatsApp</span>
                  </button>
                </div>

                {/* Historial */}
                <h4 className="font-semibold text-sm text-slate-600 mb-2">Historial de contactos</h4>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {casoSeleccionado.historialContactos.map(contacto => {
                    const resultadoConfig = getResultadoConfig(contacto.resultado);
                    
                    return (
                      <div key={contacto.id} className={`${neuro.card} p-3`}>
                        <div className="flex items-start gap-2">
                          <div className="p-1.5 rounded-lg bg-slate-100">
                            {getCanalIcon(contacto.canal)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className={`text-sm flex items-center gap-1 ${resultadoConfig.color}`}>
                                {resultadoConfig.icon}
                                {resultadoConfig.label}
                              </span>
                              <span className="text-xs text-slate-400">
                                {formatFechaHora(contacto.fecha)}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500">{contacto.agente}</p>
                            {contacto.notas && (
                              <p className="text-xs text-slate-600 mt-1">{contacto.notas}</p>
                            )}
                            {contacto.promesaPago && (
                              <div className={`text-xs mt-1 p-2 rounded ${
                                contacto.promesaPago.cumplida ? 'bg-green-50 text-green-700' :
                                contacto.promesaPago.fecha < new Date() ? 'bg-red-50 text-red-700' :
                                'bg-blue-50 text-blue-700'
                              }`}>
                                💰 Promesa: {formatCurrency(contacto.promesaPago.monto)} para el{' '}
                                {contacto.promesaPago.fecha.toLocaleDateString()}
                                {!contacto.promesaPago.cumplida && contacto.promesaPago.fecha < new Date() && (
                                  <span className="font-bold"> - INCUMPLIDA</span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Phone className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">Selecciona un caso para ver detalles</p>
              </div>
            )}
          </div>
        </div>

        {/* Modal registrar contacto */}
        <AnimatePresence>
          {registrandoContacto && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
              onClick={() => setRegistrandoContacto(false)}
            >
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                className={`${neuro.panel} p-6 max-w-md w-full mx-4`}
                onClick={e => e.stopPropagation()}
              >
                <h3 className="text-lg font-bold text-slate-800 mb-4">Registrar Contacto</h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-slate-600 mb-2">Canal</label>
                    <select
                      value={nuevoContacto.canal}
                      onChange={e => setNuevoContacto({ ...nuevoContacto, canal: e.target.value as CanalContacto })}
                      className={`${neuro.input} w-full`}
                    >
                      <option value="telefono">Teléfono</option>
                      <option value="email">E-mail</option>
                      <option value="whatsapp">WhatsApp</option>
                      <option value="carta">Carta</option>
                      <option value="visita">Visita</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-slate-600 mb-2">Resultado</label>
                    <select
                      value={nuevoContacto.resultado}
                      onChange={e => setNuevoContacto({ ...nuevoContacto, resultado: e.target.value as ResultadoContacto })}
                      className={`${neuro.input} w-full`}
                    >
                      <option value="exitoso">Exitoso - Pago realizado</option>
                      <option value="promesa_pago">Promesa de pago</option>
                      <option value="sin_respuesta">Sin respuesta</option>
                      <option value="rechazo">Rechazo de pago</option>
                      <option value="numero_erroneo">Número erróneo</option>
                      <option value="escalado">Escalado a legal</option>
                    </select>
                  </div>

                  {nuevoContacto.resultado === 'promesa_pago' && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm text-slate-600 mb-2">Monto promesa</label>
                        <input
                          type="number"
                          className={`${neuro.input} w-full`}
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-slate-600 mb-2">Fecha promesa</label>
                        <input
                          type="date"
                          className={`${neuro.input} w-full`}
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm text-slate-600 mb-2">Notas</label>
                    <textarea
                      value={nuevoContacto.notas}
                      onChange={e => setNuevoContacto({ ...nuevoContacto, notas: e.target.value })}
                      className={`${neuro.input} w-full h-24 resize-none`}
                      placeholder="Observaciones del contacto..."
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={() => setRegistrandoContacto(false)}
                    className={`${neuro.btnSecondary} px-4 py-2`}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => setRegistrandoContacto(false)}
                    className={`${neuro.btnPrimary} px-4 py-2 flex items-center gap-2`}
                  >
                    <Send className="w-4 h-4" />
                    Guardar
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
