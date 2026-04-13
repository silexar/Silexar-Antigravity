/**
 * 🤖 SILEXAR PULSE - AI Contract Validation Queue Page TIER 0
 * 
 * @description Panel para validar contratos creados automáticamente
 * por IA desde WhatsApp, audio o documentos.
 * 
 * @version 2025.4.0
 * @tier TIER_0_FORTUNE_10
 */

'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot,
  MessageSquare,
  Mic,
  FileText,
  Mail,
  MessageCircle,
  Check,
  X,
  Edit,
  Clock,
  AlertCircle,
  ChevronRight,
  Play,
  RefreshCw,
  Search,
  User,
  Sparkles
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

type OrigenSolicitud = 'WHATSAPP' | 'AUDIO' | 'DOCUMENTO' | 'EMAIL' | 'CHAT';
type EstadoProcesamiento = 'PENDIENTE' | 'PROCESANDO' | 'ESPERANDO_VALIDACION' | 'VALIDADO' | 'RECHAZADO' | 'ERROR';

interface SolicitudIA {
  id: string;
  origen: OrigenSolicitud;
  solicitante: {
    nombre: string;
    telefono?: string;
    email?: string;
  };
  contenidoOriginal: string;
  transcripcion?: string;
  datosExtraidos: {
    clienteNombre?: string;
    valorEstimado?: number;
    mediosDetectados?: string[];
    fechaInicio?: string;
    duracionMeses?: number;
    descuentoMencionado?: number;
  };
  confianzaExtraccion: number;
  camposDetectados: string[];
  camposFaltantes: string[];
  estado: EstadoProcesamiento;
  fechaCreacion: Date;
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
  cardHover: `
    hover:shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]
    hover:scale-[1.01]
    transition-all duration-200
    cursor-pointer
  `,
  input: `
    bg-gradient-to-br from-slate-100 to-slate-50
    rounded-xl
    shadow-[inset_3px_3px_6px_#d1d5db,inset_-3px_-3px_6px_#ffffff]
    border-none
    focus:ring-2 focus:ring-indigo-400/50 focus:outline-none
  `,
  btnPrimary: `
    bg-gradient-to-br from-indigo-500 to-purple-600
    text-white font-semibold rounded-xl
    shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]
    hover:shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]
    transition-all duration-200
  `,
  btnSuccess: `
    bg-gradient-to-br from-green-500 to-emerald-600
    text-white font-semibold rounded-xl
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

const mockSolicitudes: SolicitudIA[] = [
  {
    id: 'sol-001',
    origen: 'WHATSAPP',
    solicitante: { nombre: 'Carlos Mendoza', telefono: '+56912345678' },
    contenidoOriginal: 'Hola, necesito un contrato para Banco Chile por 80 millones, radio y digital, 6 meses desde enero, con 15% descuento.',
    datosExtraidos: {
      clienteNombre: 'Banco Chile',
      valorEstimado: 80000000,
      mediosDetectados: ['RADIO', 'DIGITAL'],
      fechaInicio: '2025-01-01',
      duracionMeses: 6,
      descuentoMencionado: 15
    },
    confianzaExtraccion: 92,
    camposDetectados: ['clienteNombre', 'valorEstimado', 'mediosDetectados', 'fechaInicio', 'duracionMeses', 'descuentoMencionado'],
    camposFaltantes: [],
    estado: 'ESPERANDO_VALIDACION',
    fechaCreacion: new Date(Date.now() - 5 * 60 * 1000)
  },
  {
    id: 'sol-002',
    origen: 'AUDIO',
    solicitante: { nombre: 'María López' },
    contenidoOriginal: '[Audio de 45 segundos]',
    transcripcion: 'Necesito crear un contrato para Falabella, la inversión es de 120 millones aproximadamente, para televisión, durante todo el primer semestre. Revisen el descuento que aplicamos el año pasado.',
    datosExtraidos: {
      clienteNombre: 'Falabella',
      valorEstimado: 120000000,
      mediosDetectados: ['TV'],
      duracionMeses: 6
    },
    confianzaExtraccion: 78,
    camposDetectados: ['clienteNombre', 'valorEstimado', 'mediosDetectados', 'duracionMeses'],
    camposFaltantes: ['fechaInicio', 'descuentoMencionado'],
    estado: 'ESPERANDO_VALIDACION',
    fechaCreacion: new Date(Date.now() - 15 * 60 * 1000)
  },
  {
    id: 'sol-003',
    origen: 'DOCUMENTO',
    solicitante: { nombre: 'Ana García' },
    contenidoOriginal: 'Orden de Compra #45678 - Cencosud',
    datosExtraidos: {
      clienteNombre: 'Cencosud',
      valorEstimado: 200000000,
      mediosDetectados: ['RADIO', 'TV', 'PRENSA'],
      fechaInicio: '2025-02-01',
      duracionMeses: 12
    },
    confianzaExtraccion: 95,
    camposDetectados: ['clienteNombre', 'valorEstimado', 'mediosDetectados', 'fechaInicio', 'duracionMeses'],
    camposFaltantes: ['descuentoMencionado'],
    estado: 'ESPERANDO_VALIDACION',
    fechaCreacion: new Date(Date.now() - 30 * 60 * 1000)
  }
];

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════

const getOrigenIcon = (origen: OrigenSolicitud) => {
  switch (origen) {
    case 'WHATSAPP': return <MessageSquare className="w-5 h-5 text-green-600" />;
    case 'AUDIO': return <Mic className="w-5 h-5 text-purple-600" />;
    case 'DOCUMENTO': return <FileText className="w-5 h-5 text-blue-600" />;
    case 'EMAIL': return <Mail className="w-5 h-5 text-red-600" />;
    case 'CHAT': return <MessageCircle className="w-5 h-5 text-indigo-600" />;
  }
};

const getOrigenLabel = (origen: OrigenSolicitud) => {
  switch (origen) {
    case 'WHATSAPP': return 'WhatsApp';
    case 'AUDIO': return 'Audio';
    case 'DOCUMENTO': return 'Documento';
    case 'EMAIL': return 'Email';
    case 'CHAT': return 'Chat';
  }
};

const getConfianzaColor = (confianza: number) => {
  if (confianza >= 85) return 'text-green-600 bg-green-100';
  if (confianza >= 70) return 'text-amber-600 bg-amber-100';
  return 'text-red-600 bg-red-100';
};

const formatTimeAgo = (date: Date) => {
  const now = new Date();
  const diffMins = Math.floor((now.getTime() - date.getTime()) / 60000);
  if (diffMins < 1) return 'Ahora';
  if (diffMins < 60) return `Hace ${diffMins} min`;
  return `Hace ${Math.floor(diffMins / 60)}h`;
};

// ═══════════════════════════════════════════════════════════════
// COMPONENTE DE TARJETA DE SOLICITUD
// ═══════════════════════════════════════════════════════════════

const SolicitudCard: React.FC<{
  solicitud: SolicitudIA;
  onValidar: (id: string) => void;
  onRechazar: (id: string) => void;
  onEditar: (id: string) => void;
}> = ({ solicitud, onValidar, onRechazar, onEditar }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${neuro.card} overflow-hidden`}
    >
      {/* Header */}
      <div 
        className={`p-5 ${neuro.cardHover}`}
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start justify-between gap-4">
          {/* Origen e Info */}
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-xl ${
              solicitud.origen === 'WHATSAPP' ? 'bg-green-100' :
              solicitud.origen === 'AUDIO' ? 'bg-purple-100' :
              solicitud.origen === 'DOCUMENTO' ? 'bg-blue-100' :
              'bg-slate-100'
            }`}>
              {getOrigenIcon(solicitud.origen)}
            </div>
            
            <div>
              <div className="flex items-center gap-2">
                <span className={`${neuro.badge} ${
                  solicitud.origen === 'WHATSAPP' ? 'bg-green-100 text-green-700' :
                  solicitud.origen === 'AUDIO' ? 'bg-purple-100 text-purple-700' :
                  solicitud.origen === 'DOCUMENTO' ? 'bg-blue-100 text-blue-700' :
                  'bg-slate-100 text-slate-700'
                }`}>
                  {getOrigenLabel(solicitud.origen)}
                </span>
                <span className={`${neuro.badge} ${getConfianzaColor(solicitud.confianzaExtraccion)}`}>
                  <Sparkles className="w-3 h-3 inline mr-1" />
                  {solicitud.confianzaExtraccion}% confianza
                </span>
              </div>
              
              <div className="mt-2">
                <p className="font-semibold text-slate-800 text-lg">
                  {solicitud.datosExtraidos.clienteNombre || 'Cliente no detectado'}
                </p>
                <p className="text-sm text-slate-500 flex items-center gap-2">
                  <User className="w-3 h-3" />
                  {solicitud.solicitante.nombre}
                  <span className="text-slate-300">•</span>
                  <Clock className="w-3 h-3" />
                  {formatTimeAgo(solicitud.fechaCreacion)}
                </p>
              </div>
            </div>
          </div>

          {/* Valor y acciones */}
          <div className="text-right">
            {solicitud.datosExtraidos.valorEstimado && (
              <p className="text-2xl font-bold text-slate-800">
                ${(solicitud.datosExtraidos.valorEstimado / 1000000).toFixed(0)}M
              </p>
            )}
            <ChevronRight className={`w-5 h-5 text-slate-400 mt-2 mx-auto transition-transform ${expanded ? 'rotate-90' : ''}`} />
          </div>
        </div>

        {/* Quick info */}
        <div className="mt-4 flex flex-wrap gap-3">
          {solicitud.datosExtraidos.mediosDetectados?.map(medio => (
            <span key={medio} className={`${neuro.badge} bg-indigo-100 text-indigo-700`}>
              {medio}
            </span>
          ))}
          {solicitud.datosExtraidos.duracionMeses && (
            <span className={`${neuro.badge} bg-slate-100 text-slate-700`}>
              {solicitud.datosExtraidos.duracionMeses} meses
            </span>
          )}
          {solicitud.datosExtraidos.descuentoMencionado && (
            <span className={`${neuro.badge} bg-amber-100 text-amber-700`}>
              {solicitud.datosExtraidos.descuentoMencionado}% dto
            </span>
          )}
        </div>

        {/* Campos faltantes */}
        {solicitud.camposFaltantes.length > 0 && (
          <div className="mt-3 flex items-center gap-2 text-amber-600 text-sm">
            <AlertCircle className="w-4 h-4" />
            Campos faltantes: {solicitud.camposFaltantes.join(', ')}
          </div>
        )}
      </div>

      {/* Expanded content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 space-y-4 border-t border-slate-100 pt-4">
              {/* Contenido original */}
              <div>
                <p className="text-xs font-semibold text-slate-500 mb-2">
                  {solicitud.origen === 'AUDIO' ? 'TRANSCRIPCIÓN' : 'MENSAJE ORIGINAL'}
                </p>
                <div className={`${neuro.input} p-4 text-sm text-slate-700`}>
                  {solicitud.transcripcion || solicitud.contenidoOriginal}
                </div>
                {solicitud.origen === 'AUDIO' && (
                  <button className={`${neuro.btnSecondary} mt-2 px-3 py-1.5 text-xs flex items-center gap-2`}>
                    <Play className="w-3 h-3" />
                    Reproducir audio
                  </button>
                )}
              </div>

              {/* Datos extraídos */}
              <div>
                <p className="text-xs font-semibold text-slate-500 mb-2">DATOS EXTRAÍDOS POR IA</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {solicitud.datosExtraidos.clienteNombre && (
                    <div className={`${neuro.input} p-3`}>
                      <p className="text-xs text-slate-400">Cliente</p>
                      <p className="font-semibold">{solicitud.datosExtraidos.clienteNombre}</p>
                    </div>
                  )}
                  {solicitud.datosExtraidos.valorEstimado && (
                    <div className={`${neuro.input} p-3`}>
                      <p className="text-xs text-slate-400">Valor</p>
                      <p className="font-semibold">${solicitud.datosExtraidos.valorEstimado.toLocaleString('es-CL')}</p>
                    </div>
                  )}
                  {solicitud.datosExtraidos.fechaInicio && (
                    <div className={`${neuro.input} p-3`}>
                      <p className="text-xs text-slate-400">Fecha Inicio</p>
                      <p className="font-semibold">{solicitud.datosExtraidos.fechaInicio}</p>
                    </div>
                  )}
                  {solicitud.datosExtraidos.duracionMeses && (
                    <div className={`${neuro.input} p-3`}>
                      <p className="text-xs text-slate-400">Duración</p>
                      <p className="font-semibold">{solicitud.datosExtraidos.duracionMeses} meses</p>
                    </div>
                  )}
                  {solicitud.datosExtraidos.descuentoMencionado && (
                    <div className={`${neuro.input} p-3`}>
                      <p className="text-xs text-slate-400">Descuento</p>
                      <p className="font-semibold">{solicitud.datosExtraidos.descuentoMencionado}%</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Acciones */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  onClick={() => onRechazar(solicitud.id)}
                  className={`${neuro.btnDanger} px-4 py-2 text-sm flex items-center gap-2`}
                >
                  <X className="w-4 h-4" />
                  Rechazar
                </button>
                <button
                  onClick={() => onEditar(solicitud.id)}
                  className={`${neuro.btnSecondary} px-4 py-2 text-sm flex items-center gap-2`}
                >
                  <Edit className="w-4 h-4" />
                  Editar y Crear
                </button>
                <button
                  onClick={() => onValidar(solicitud.id)}
                  className={`${neuro.btnSuccess} px-4 py-2 text-sm flex items-center gap-2`}
                >
                  <Check className="w-4 h-4" />
                  Validar y Crear
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

export default function ColaValidacionIA() {
  const [solicitudes, setSolicitudes] = useState<SolicitudIA[]>(mockSolicitudes);
  const [filtroOrigen, setFiltroOrigen] = useState<OrigenSolicitud | 'TODOS'>('TODOS');
  const [busqueda, setBusqueda] = useState('');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_procesando, setProcesando] = useState<string | null>(null);

  const handleValidar = async (id: string) => {
    setProcesando(id);
    // Simular procesamiento
    await new Promise(resolve => setTimeout(resolve, 1500));
    setSolicitudes(prev => prev.filter(s => s.id !== id));
    setProcesando(null);
  };

  const handleRechazar = async (id: string) => {
    setProcesando(id);
    await new Promise(resolve => setTimeout(resolve, 500));
    setSolicitudes(prev => prev.filter(s => s.id !== id));
    setProcesando(null);
  };

  const handleEditar = (id: string) => {
    // Navegar al wizard con datos pre-llenados
    ;
  };

  const solicitudesFiltradas = solicitudes.filter(s => {
    if (filtroOrigen !== 'TODOS' && s.origen !== filtroOrigen) return false;
    if (busqueda) {
      const search = busqueda.toLowerCase();
      return (
        s.datosExtraidos.clienteNombre?.toLowerCase().includes(search) ||
        s.solicitante.nombre.toLowerCase().includes(search)
      );
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-slate-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className={`${neuro.panel} p-4`}>
              <Bot className="w-8 h-8 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
                Cola de Validación IA
                <span className={`${neuro.badge} bg-indigo-100 text-indigo-700 text-lg`}>
                  {solicitudes.length}
                </span>
              </h1>
              <p className="text-slate-500">
                Contratos creados automáticamente pendientes de tu validación
              </p>
            </div>
          </div>

          {/* Estadísticas rápidas */}
          <div className="grid grid-cols-4 gap-4 mt-6">
            {[
              { label: 'WhatsApp', count: solicitudes.filter(s => s.origen === 'WHATSAPP').length, icon: <MessageSquare className="w-5 h-5" />, color: 'bg-green-100 text-green-600' },
              { label: 'Audio', count: solicitudes.filter(s => s.origen === 'AUDIO').length, icon: <Mic className="w-5 h-5" />, color: 'bg-purple-100 text-purple-600' },
              { label: 'Documentos', count: solicitudes.filter(s => s.origen === 'DOCUMENTO').length, icon: <FileText className="w-5 h-5" />, color: 'bg-blue-100 text-blue-600' },
              { label: 'Emails', count: solicitudes.filter(s => s.origen === 'EMAIL').length, icon: <Mail className="w-5 h-5" />, color: 'bg-red-100 text-red-600' }
            ].map((stat, idx) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`${neuro.card} p-4 flex items-center gap-3`}
              >
                <div className={`p-3 rounded-xl ${stat.color}`}>
                  {stat.icon}
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-800">{stat.count}</p>
                  <p className="text-xs text-slate-500">{stat.label}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Filtros */}
        <div className={`${neuro.panel} p-4 mb-6 flex items-center justify-between`}>
          <div className="flex items-center gap-4">
            {/* Búsqueda */}
            <div className={`${neuro.input} px-4 py-2 flex items-center gap-2 min-w-64`}>
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por cliente o solicitante..."
                aria-label="Buscar por cliente o solicitante"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="bg-transparent flex-1 focus:outline-none text-sm"
              />
            </div>

            {/* Filtro origen */}
            <select
              value={filtroOrigen}
              onChange={(e) => setFiltroOrigen(e.target.value as OrigenSolicitud | 'TODOS')}
              className={`${neuro.input} px-4 py-2 text-sm`}
            >
              <option value="TODOS">Todos los orígenes</option>
              <option value="WHATSAPP">WhatsApp</option>
              <option value="AUDIO">Audio</option>
              <option value="DOCUMENTO">Documento</option>
              <option value="EMAIL">Email</option>
            </select>
          </div>

          <button className={`${neuro.btnSecondary} px-4 py-2 flex items-center gap-2`}>
            <RefreshCw className="w-4 h-4" />
            Actualizar
          </button>
        </div>

        {/* Lista de solicitudes */}
        <div className="space-y-4">
          <AnimatePresence>
            {solicitudesFiltradas.map(solicitud => (
              <SolicitudCard
                key={solicitud.id}
                solicitud={solicitud}
                onValidar={handleValidar}
                onRechazar={handleRechazar}
                onEditar={handleEditar}
              />
            ))}
          </AnimatePresence>

          {solicitudesFiltradas.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`${neuro.card} p-12 text-center`}
            >
              <Bot className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-600 mb-2">
                No hay solicitudes pendientes
              </h3>
              <p className="text-slate-400">
                Las nuevas solicitudes de WhatsApp, audio o documentos aparecerán aquí
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
