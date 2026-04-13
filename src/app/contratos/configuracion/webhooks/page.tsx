/**
 * 🔗 SILEXAR PULSE - Webhooks Configuration Page TIER 0
 * 
 * @description Página de configuración de webhooks para integraciones:
 * - Lista de webhooks configurados
 * - Crear/editar webhooks
 * - Historial de entregas
 * - Pruebas de conexión
 * 
 * @version 2025.4.0
 * @tier TIER_0_FORTUNE_10
 */

'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Webhook,
  Plus,
  MoreVertical,
  CheckCircle,
  XCircle,
  Clock,
  Pause,
  Send,
  AlertTriangle,
  History,
  X
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

type EventoWebhook = 
  | 'contrato.creado' | 'contrato.actualizado' | 'contrato.aprobado' 
  | 'contrato.rechazado' | 'contrato.firmado' | 'contrato.activado'
  | 'contrato.completado' | 'contrato.cancelado' | 'contrato.vencimiento_proximo'
  | 'factura.creada' | 'factura.emitida' | 'factura.vencida' | 'factura.pagada'
  | 'pago.recibido' | 'pago.rechazado' | 'cuenta.movimiento' | 'sistema.test';

interface WebhookConfig {
  id: string;
  nombre: string;
  url: string;
  eventos: EventoWebhook[];
  estado: 'ACTIVO' | 'INACTIVO' | 'SUSPENDIDO';
  secreto: string;
  estadisticas: {
    enviosExitosos: number;
    enviosFallidos: number;
    ultimoError?: string;
  };
  ultimaEjecucion?: Date;
  fechaCreacion: Date;
}

interface Entrega {
  id: string;
  evento: string;
  estado: 'EXITOSO' | 'FALLIDO' | 'PENDIENTE';
  intentos: number;
  fechaCreacion: Date;
  respuesta?: { status: number; duracionMs: number };
  error?: string;
}

// ═══════════════════════════════════════════════════════════════
// ESTILOS
// ═══════════════════════════════════════════════════════════════

const neuro = {
  panel: `
    bg-gradient-to-br from-slate-50 to-slate-100
    rounded-3xl shadow-[8px_8px_16px_#d1d5db,-8px_-8px_16px_#ffffff]
    border border-slate-200/50
  `,
  card: `
    bg-gradient-to-br from-white to-slate-50
    rounded-2xl shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff]
    border border-slate-200/30
  `,
  input: `
    bg-gradient-to-br from-slate-100 to-slate-50
    rounded-xl shadow-[inset_3px_3px_6px_#d1d5db,inset_-3px_-3px_6px_#ffffff]
    border-none focus:ring-2 focus:ring-indigo-400/50 focus:outline-none
    px-4 py-3
  `,
  btn: `
    px-4 py-2 rounded-xl font-medium transition-all
    shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]
    hover:shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]
  `,
  btnPrimary: `bg-gradient-to-br from-indigo-500 to-purple-600 text-white`,
  btnSecondary: `bg-gradient-to-br from-slate-50 to-slate-100 text-slate-700`,
  badge: `px-3 py-1 rounded-lg text-xs font-medium`
};

// ═══════════════════════════════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════════════════════════════

const mockWebhooks: WebhookConfig[] = [
  {
    id: 'wh-001',
    nombre: 'ERP Integración',
    url: 'https://erp.empresa.cl/api/webhooks/silexar',
    eventos: ['contrato.aprobado', 'contrato.firmado', 'factura.emitida'],
    estado: 'ACTIVO',
    secreto: 'whsec_abc123xyz789secure',
    estadisticas: { enviosExitosos: 156, enviosFallidos: 2 },
    ultimaEjecucion: new Date(Date.now() - 2 * 60 * 60 * 1000),
    fechaCreacion: new Date(2024, 10, 15)
  },
  {
    id: 'wh-002',
    nombre: 'Slack Notificaciones',
    url: 'https://hooks.slack.com/services/T00/B00/xxxxx',
    eventos: ['contrato.creado', 'pago.recibido'],
    estado: 'ACTIVO',
    secreto: 'whsec_def456uvw012secure',
    estadisticas: { enviosExitosos: 89, enviosFallidos: 0 },
    ultimaEjecucion: new Date(Date.now() - 30 * 60 * 1000),
    fechaCreacion: new Date(2024, 11, 1)
  },
  {
    id: 'wh-003',
    nombre: 'CRM Sync',
    url: 'https://crm.empresa.cl/webhook/contratos',
    eventos: ['contrato.actualizado', 'contrato.completado'],
    estado: 'SUSPENDIDO',
    secreto: 'whsec_ghi789rst345secure',
    estadisticas: { enviosExitosos: 45, enviosFallidos: 12, ultimoError: 'Connection timeout' },
    ultimaEjecucion: new Date(Date.now() - 24 * 60 * 60 * 1000),
    fechaCreacion: new Date(2024, 9, 20)
  }
];

const mockEntregas: Entrega[] = [
  { id: 'ent-001', evento: 'contrato.firmado', estado: 'EXITOSO', intentos: 1, fechaCreacion: new Date(Date.now() - 2 * 60 * 60 * 1000), respuesta: { status: 200, duracionMs: 234 } },
  { id: 'ent-002', evento: 'factura.emitida', estado: 'EXITOSO', intentos: 1, fechaCreacion: new Date(Date.now() - 4 * 60 * 60 * 1000), respuesta: { status: 200, duracionMs: 156 } },
  { id: 'ent-003', evento: 'contrato.aprobado', estado: 'FALLIDO', intentos: 3, fechaCreacion: new Date(Date.now() - 24 * 60 * 60 * 1000), error: 'Connection refused' },
];

const eventosDisponibles = [
  { id: 'contrato.creado', label: 'Contrato Creado', grupo: 'Contratos' },
  { id: 'contrato.actualizado', label: 'Contrato Actualizado', grupo: 'Contratos' },
  { id: 'contrato.aprobado', label: 'Contrato Aprobado', grupo: 'Contratos' },
  { id: 'contrato.rechazado', label: 'Contrato Rechazado', grupo: 'Contratos' },
  { id: 'contrato.firmado', label: 'Contrato Firmado', grupo: 'Contratos' },
  { id: 'contrato.activado', label: 'Contrato Activado', grupo: 'Contratos' },
  { id: 'contrato.completado', label: 'Contrato Completado', grupo: 'Contratos' },
  { id: 'contrato.cancelado', label: 'Contrato Cancelado', grupo: 'Contratos' },
  { id: 'factura.creada', label: 'Factura Creada', grupo: 'Facturación' },
  { id: 'factura.emitida', label: 'Factura Emitida SII', grupo: 'Facturación' },
  { id: 'factura.vencida', label: 'Factura Vencida', grupo: 'Facturación' },
  { id: 'factura.pagada', label: 'Factura Pagada', grupo: 'Facturación' },
  { id: 'pago.recibido', label: 'Pago Recibido', grupo: 'Pagos' },
  { id: 'pago.rechazado', label: 'Pago Rechazado', grupo: 'Pagos' },
  { id: 'cuenta.movimiento', label: 'Movimiento Cuenta', grupo: 'Cuenta Corriente' },
];

// ═══════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════

export default function WebhooksPage() {
  const [webhooks] = useState(mockWebhooks);
  const [selectedWebhook, setSelectedWebhook] = useState<WebhookConfig | null>(null);
  const [showModal, setShowModal] = useState<'crear' | 'historial' | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_showSecreto, _setShowSecreto] = useState<string | null>(null);

  const estadoConfig = {
    ACTIVO: { color: 'text-green-600', bg: 'bg-green-100', icon: CheckCircle },
    INACTIVO: { color: 'text-slate-600', bg: 'bg-slate-100', icon: Pause },
    SUSPENDIDO: { color: 'text-red-600', bg: 'bg-red-100', icon: AlertTriangle }
  };

  const formatTiempo = (fecha: Date | undefined) => {
    if (!fecha) return 'Nunca';
    const diff = Date.now() - fecha.getTime();
    if (diff < 60000) return 'Hace un momento';
    if (diff < 3600000) return `Hace ${Math.floor(diff / 60000)} min`;
    if (diff < 86400000) return `Hace ${Math.floor(diff / 3600000)} horas`;
    return fecha.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-slate-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600">
              <Webhook className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Webhooks</h1>
              <p className="text-slate-500">Configura integraciones con sistemas externos</p>
            </div>
          </div>
          
          <button 
            onClick={() => setShowModal('crear')}
            className={`${neuro.btn} ${neuro.btnPrimary} flex items-center gap-2`}
          >
            <Plus className="w-5 h-5" />
            Nuevo Webhook
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          <motion.div className={neuro.card} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="p-5">
              <p className="text-sm text-slate-500 mb-1">Webhooks Activos</p>
              <p className="text-2xl font-bold text-slate-800">
                {webhooks.filter(w => w.estado === 'ACTIVO').length}
              </p>
            </div>
          </motion.div>
          <motion.div className={neuro.card} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <div className="p-5">
              <p className="text-sm text-slate-500 mb-1">Entregas Exitosas (7d)</p>
              <p className="text-2xl font-bold text-green-600">
                {webhooks.reduce((acc, w) => acc + w.estadisticas.enviosExitosos, 0)}
              </p>
            </div>
          </motion.div>
          <motion.div className={neuro.card} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div className="p-5">
              <p className="text-sm text-slate-500 mb-1">Entregas Fallidas</p>
              <p className="text-2xl font-bold text-red-600">
                {webhooks.reduce((acc, w) => acc + w.estadisticas.enviosFallidos, 0)}
              </p>
            </div>
          </motion.div>
          <motion.div className={neuro.card} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <div className="p-5">
              <p className="text-sm text-slate-500 mb-1">Tasa de Éxito</p>
              <p className="text-2xl font-bold text-indigo-600">
                {(() => {
                  const total = webhooks.reduce((acc, w) => acc + w.estadisticas.enviosExitosos + w.estadisticas.enviosFallidos, 0);
                  const exitosos = webhooks.reduce((acc, w) => acc + w.estadisticas.enviosExitosos, 0);
                  return total > 0 ? `${Math.round((exitosos / total) * 100)}%` : '100%';
                })()}
              </p>
            </div>
          </motion.div>
        </div>

        {/* Lista de Webhooks */}
        <div className={`${neuro.panel} p-6`}>
          <div className="space-y-4">
            {webhooks.map(webhook => {
              const estado = estadoConfig[webhook.estado];
              const IconoEstado = estado.icon;
              
              return (
                <div 
                  key={webhook.id}
                  className={`${neuro.card} p-5 hover:ring-2 hover:ring-indigo-200 transition-all cursor-pointer`}
                  onClick={() => setSelectedWebhook(webhook)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl ${estado.bg}`}>
                        <Webhook className={`w-5 h-5 ${estado.color}`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-slate-800">{webhook.nombre}</h3>
                          <span className={`${neuro.badge} ${estado.bg} ${estado.color} flex items-center gap-1`}>
                            <IconoEstado className="w-3 h-3" />
                            {webhook.estado}
                          </span>
                        </div>
                        <p className="text-sm text-slate-500 truncate max-w-md">{webhook.url}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      {/* Eventos */}
                      <div className="text-right">
                        <p className="text-xs text-slate-400">Eventos</p>
                        <p className="font-medium text-slate-700">{webhook.eventos.length}</p>
                      </div>

                      {/* Estadísticas */}
                      <div className="text-right">
                        <p className="text-xs text-slate-400">Envíos</p>
                        <p className="font-medium">
                          <span className="text-green-600">{webhook.estadisticas.enviosExitosos}</span>
                          <span className="text-slate-400"> / </span>
                          <span className="text-red-600">{webhook.estadisticas.enviosFallidos}</span>
                        </p>
                      </div>

                      {/* Última ejecución */}
                      <div className="text-right w-28">
                        <p className="text-xs text-slate-400">Última ejecución</p>
                        <p className="text-sm font-medium text-slate-700">{formatTiempo(webhook.ultimaEjecucion)}</p>
                      </div>

                      {/* Acciones */}
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={(e) => { e.stopPropagation(); setSelectedWebhook(webhook); setShowModal('historial'); }}
                          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Ver historial"
                        >
                          <History className="w-4 h-4 text-slate-500" />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); ; }}
                          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Enviar prueba"
                        >
                          <Send className="w-4 h-4 text-slate-500" />
                        </button>
                        <button aria-label="Más opciones" className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                          <MoreVertical className="w-4 h-4 text-slate-500" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Eventos suscritos */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    {webhook.eventos.map(evento => (
                      <span key={evento} className={`${neuro.badge} bg-indigo-50 text-indigo-600`}>
                        {evento}
                      </span>
                    ))}
                  </div>

                  {/* Error si existe */}
                  {webhook.estadisticas.ultimoError && (
                    <div className="mt-4 p-3 bg-red-50 rounded-lg flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                      <span className="text-sm text-red-600">{webhook.estadisticas.ultimoError}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Crear Webhook */}
        <AnimatePresence>
          {showModal === 'crear' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
              onClick={() => setShowModal(null)}
            >
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                className={`${neuro.panel} p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto`}
                onClick={e => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-slate-800">Nuevo Webhook</h2>
                  <button aria-label="Cerrar" onClick={() => setShowModal(null)} className="p-1 hover:bg-slate-100 rounded">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Nombre</label>
                    <input
                      type="text"
                      aria-label="Nombre del webhook"
                      placeholder="Ej: Integración ERP"
                      className={`${neuro.input} w-full`}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">URL del Endpoint</label>
                    <input
                      type="url"
                      aria-label="URL del Endpoint"
                      placeholder="https://tu-servidor.com/webhook"
                      className={`${neuro.input} w-full`}
                    />
                    <p className="text-xs text-slate-500 mt-1">Debe ser HTTPS para mayor seguridad</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Eventos a Suscribir</label>
                    <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 bg-slate-50 rounded-xl">
                      {eventosDisponibles.map(evento => (
                        <label key={evento.id} className="flex items-center gap-2 p-2 hover:bg-white rounded cursor-pointer">
                          <input type="checkbox" className="rounded text-indigo-600" />
                          <span className="text-sm text-slate-700">{evento.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t">
                    <button 
                      onClick={() => setShowModal(null)}
                      className={`${neuro.btn} ${neuro.btnSecondary}`}
                    >
                      Cancelar
                    </button>
                    <button className={`${neuro.btn} ${neuro.btnPrimary}`}>
                      Crear Webhook
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modal Historial */}
        <AnimatePresence>
          {showModal === 'historial' && selectedWebhook && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
              onClick={() => setShowModal(null)}
            >
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                className={`${neuro.panel} p-6 max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto`}
                onClick={e => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-slate-800">Historial de Entregas</h2>
                    <p className="text-slate-500">{selectedWebhook.nombre}</p>
                  </div>
                  <button aria-label="Cerrar" onClick={() => setShowModal(null)} className="p-1 hover:bg-slate-100 rounded">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-3">
                  {mockEntregas.map(entrega => (
                    <div key={entrega.id} className={`${neuro.card} p-4`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {entrega.estado === 'EXITOSO' ? (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          ) : entrega.estado === 'FALLIDO' ? (
                            <XCircle className="w-5 h-5 text-red-500" />
                          ) : (
                            <Clock className="w-5 h-5 text-amber-500" />
                          )}
                          <div>
                            <p className="font-medium text-slate-800">{entrega.evento}</p>
                            <p className="text-xs text-slate-500">
                              {entrega.fechaCreacion.toLocaleString()} • {entrega.intentos} intento(s)
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          {entrega.respuesta && (
                            <p className="text-sm text-slate-600">
                              HTTP {entrega.respuesta.status} • {entrega.respuesta.duracionMs}ms
                            </p>
                          )}
                          {entrega.error && (
                            <p className="text-sm text-red-600">{entrega.error}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
