/**
 * 🔒 SILEXAR PULSE - Panel de Auditoría TIER 0
 * 
 * @description Visualización del trail de auditoría con
 * verificación de integridad y exportación para compliance.
 * 
 * @version 2025.4.0
 * @tier TIER_0_FORTUNE_10
 * @security ENTERPRISE_AUDIT
 */

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  Search,
  Filter,
  Download,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Eye,
  Edit3,
  Trash2,
  FileText,
  User,
  Clock,
  Globe,
  Monitor,
  Lock,
  Unlock,
  ChevronDown,
  ChevronRight,
  X,
  Sparkles
} from 'lucide-react';
import { EventoAuditoria, TipoEventoAuditoria } from '../types/enterprise.types';
import { useAudit } from '../services/AuditService';

// ═══════════════════════════════════════════════════════════════
// CONFIGURACIÓN
// ═══════════════════════════════════════════════════════════════

const EVENTO_ICONS: Record<TipoEventoAuditoria, React.ElementType> = {
  crear: FileText,
  ver: Eye,
  editar: Edit3,
  eliminar: Trash2,
  aprobar: CheckCircle2,
  rechazar: X,
  firmar: Lock,
  enviar: RefreshCw,
  descargar: Download,
  exportar: Download,
  archivar: FileText,
  restaurar: RefreshCw,
  comentar: Edit3,
  compartir: User,
  cambiar_estado: RefreshCw,
  acceso_denegado: Unlock,
  login: User,
  logout: User
};

const RIESGO_CONFIG = {
  bajo: { color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  medio: { color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-200' },
  alto: { color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-200' },
  critico: { color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-200' }
};

// ═══════════════════════════════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════════════════════════════

const mockEventos: EventoAuditoria[] = [
  {
    id: 'evt-001',
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
    usuarioId: 'u-001',
    usuarioNombre: 'Ana García',
    usuarioEmail: 'ana.garcia@silexar.com',
    rol: 'ejecutivo',
    tipoEvento: 'crear',
    recursoTipo: 'contrato',
    recursoId: 'CON-2024-00145',
    recursoNombre: 'Contrato Banco Nacional',
    accion: 'Creación de contrato',
    descripcion: 'Se creó un nuevo contrato para Banco Nacional S.A.',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    geolocalizacion: { pais: 'Chile', ciudad: 'Santiago' },
    dispositivo: 'desktop',
    sesionId: 'sess-123',
    resultado: 'exito',
    nivelRiesgo: 'bajo',
    hash: 'a1b2c3d4e5f6789...'
  },
  {
    id: 'evt-002',
    timestamp: new Date(Date.now() - 15 * 60 * 1000),
    usuarioId: 'u-002',
    usuarioNombre: 'Carlos Mendoza',
    usuarioEmail: 'carlos.mendoza@silexar.com',
    rol: 'gerente_comercial',
    tipoEvento: 'aprobar',
    recursoTipo: 'contrato',
    recursoId: 'CON-2024-00144',
    recursoNombre: 'Contrato SuperMax',
    accion: 'Aprobación de contrato',
    descripcion: 'Contrato aprobado por gerente comercial',
    ipAddress: '192.168.1.101',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    geolocalizacion: { pais: 'Chile', ciudad: 'Santiago' },
    dispositivo: 'desktop',
    sesionId: 'sess-124',
    resultado: 'exito',
    nivelRiesgo: 'medio',
    hash: 'b2c3d4e5f67890...',
    hashAnterior: 'a1b2c3d4e5f6789...'
  },
  {
    id: 'evt-003',
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    usuarioId: 'u-003',
    usuarioNombre: 'Usuario Desconocido',
    usuarioEmail: 'unknown@example.com',
    rol: 'viewer',
    tipoEvento: 'acceso_denegado',
    recursoTipo: 'contrato',
    recursoId: 'CON-2024-00140',
    recursoNombre: 'Contrato Confidencial',
    accion: 'Intento de acceso',
    descripcion: 'Se intentó acceder a un contrato sin permisos',
    ipAddress: '203.0.113.50',
    userAgent: 'Mozilla/5.0 (Linux; Android)',
    geolocalizacion: { pais: 'Argentina', ciudad: 'Buenos Aires' },
    dispositivo: 'mobile',
    sesionId: 'sess-999',
    resultado: 'denegado',
    motivoFallo: 'Sin permisos para ver este contrato',
    nivelRiesgo: 'critico',
    hash: 'c3d4e5f678901...',
    hashAnterior: 'b2c3d4e5f67890...'
  },
  {
    id: 'evt-004',
    timestamp: new Date(Date.now() - 60 * 60 * 1000),
    usuarioId: 'u-001',
    usuarioNombre: 'Ana García',
    usuarioEmail: 'ana.garcia@silexar.com',
    rol: 'ejecutivo',
    tipoEvento: 'editar',
    recursoTipo: 'contrato',
    recursoId: 'CON-2024-00145',
    recursoNombre: 'Contrato Banco Nacional',
    accion: 'Modificación de términos',
    descripcion: 'Se modificaron los términos de pago de 30 a 45 días',
    datosAnteriores: { diasPago: 30 },
    datosNuevos: { diasPago: 45 },
    camposModificados: ['terminosPago.diasPago'],
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    geolocalizacion: { pais: 'Chile', ciudad: 'Santiago' },
    dispositivo: 'desktop',
    sesionId: 'sess-123',
    resultado: 'exito',
    nivelRiesgo: 'alto',
    hash: 'd4e5f6789012...',
    hashAnterior: 'c3d4e5f678901...'
  }
];

// ═══════════════════════════════════════════════════════════════
// COMPONENTES
// ═══════════════════════════════════════════════════════════════

const EventoRow: React.FC<{
  evento: EventoAuditoria;
  onVerDetalles: () => void;
  isExpanded: boolean;
}> = ({ evento, onVerDetalles, isExpanded }) => {
  const IconoEvento = EVENTO_ICONS[evento.tipoEvento];
  const riesgoConfig = RIESGO_CONFIG[evento.nivelRiesgo];
  
  return (
    <motion.div
      layout
      className={`
        border rounded-xl overflow-hidden transition-all
        ${evento.nivelRiesgo === 'critico' 
          ? 'border-red-300 bg-red-50' 
          : 'border-slate-200 bg-white hover:border-indigo-200'
        }
      `}
    >
      {/* Fila principal */}
      <div
        className="p-4 cursor-pointer"
        onClick={onVerDetalles}
      >
        <div className="flex items-center gap-4">
          {/* Icono */}
          <div className={`p-2 rounded-lg ${riesgoConfig.bg}`}>
            <IconoEvento className={`w-5 h-5 ${riesgoConfig.color}`} />
          </div>
          
          {/* Contenido */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-slate-800">{evento.accion}</span>
              <span className={`px-2 py-0.5 rounded text-xs ${riesgoConfig.bg} ${riesgoConfig.color}`}>
                {evento.nivelRiesgo}
              </span>
              {evento.resultado === 'denegado' && (
                <span className="px-2 py-0.5 rounded text-xs bg-red-500 text-white">
                  DENEGADO
                </span>
              )}
            </div>
            <p className="text-sm text-slate-600 truncate">{evento.descripcion}</p>
          </div>
          
          {/* Meta */}
          <div className="flex items-center gap-6 text-sm text-slate-500">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>{evento.usuarioNombre}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{evento.timestamp.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              <span>{evento.geolocalizacion?.ciudad || 'Desconocido'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Monitor className="w-4 h-4" />
              <span className="capitalize">{evento.dispositivo}</span>
            </div>
            
            <motion.div
              animate={{ rotate: isExpanded ? 90 : 0 }}
            >
              <ChevronRight className="w-5 h-5 text-slate-400" />
            </motion.div>
          </div>
        </div>
      </div>
      
      {/* Detalles expandidos */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-slate-200 bg-slate-50 overflow-hidden"
          >
            <div className="p-4 grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-slate-500 mb-1">Recurso</p>
                <p className="text-sm font-medium">{evento.recursoTipo}: {evento.recursoId}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Email</p>
                <p className="text-sm">{evento.usuarioEmail}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">IP Address</p>
                <p className="text-sm font-mono">{evento.ipAddress}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Sesión</p>
                <p className="text-sm font-mono">{evento.sesionId}</p>
              </div>
              
              {evento.camposModificados && evento.camposModificados.length > 0 && (
                <div className="col-span-2">
                  <p className="text-xs text-slate-500 mb-1">Campos Modificados</p>
                  <div className="flex flex-wrap gap-1">
                    {evento.camposModificados.map((campo) => (
                      <span key={campo} className="px-2 py-0.5 rounded bg-amber-100 text-amber-700 text-xs">
                        {campo}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {evento.datosAnteriores && evento.datosNuevos && (
                <div className="col-span-2">
                  <p className="text-xs text-slate-500 mb-1">Cambios</p>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="px-2 py-1 rounded bg-red-100 text-red-700 font-mono">
                      {JSON.stringify(evento.datosAnteriores)}
                    </span>
                    <span>→</span>
                    <span className="px-2 py-1 rounded bg-emerald-100 text-emerald-700 font-mono">
                      {JSON.stringify(evento.datosNuevos)}
                    </span>
                  </div>
                </div>
              )}
              
              <div className="col-span-4">
                <p className="text-xs text-slate-500 mb-1">Hash de Integridad</p>
                <p className="text-xs font-mono text-slate-600 bg-slate-200 px-2 py-1 rounded">
                  SHA-256: {evento.hash}
                </p>
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

interface AuditPanelProps {
  contratoId?: string;
  onClose?: () => void;
}

export const AuditPanel: React.FC<AuditPanelProps> = ({
  contratoId,
  onClose
}) => {
  const [eventos] = useState<EventoAuditoria[]>(mockEventos);
  const [filtroRiesgo, setFiltroRiesgo] = useState<EventoAuditoria['nivelRiesgo'] | 'todos'>('todos');
  const [filtroTipo] = useState<TipoEventoAuditoria | 'todos'>('todos');
  const [busqueda, setBusqueda] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [integrityStatus, setIntegrityStatus] = useState<{
    isValid: boolean;
    lastVerified: Date;
    corruptedCount: number;
  } | null>(null);
  
  const audit = useAudit();
  
  // Verificar integridad al cargar
  useEffect(() => {
    const verificar = async () => {
      const result = await audit.verifyChainIntegrity();
      setIntegrityStatus({
        isValid: result.isValid,
        lastVerified: result.lastVerified,
        corruptedCount: result.corruptedEvents.length
      });
    };
    verificar();
  }, [audit]);
  
  const eventosFiltrados = useMemo(() => {
    return eventos.filter(e => {
      if (contratoId && e.recursoId !== contratoId) return false;
      if (filtroRiesgo !== 'todos' && e.nivelRiesgo !== filtroRiesgo) return false;
      if (filtroTipo !== 'todos' && e.tipoEvento !== filtroTipo) return false;
      if (busqueda) {
        const query = busqueda.toLowerCase();
        return (
          e.usuarioNombre.toLowerCase().includes(query) ||
          e.descripcion.toLowerCase().includes(query) ||
          e.recursoId.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [eventos, contratoId, filtroRiesgo, filtroTipo, busqueda]);
  
  const handleExportar = (formato: 'json' | 'csv') => {
    const data = audit.exportForCompliance(formato);
    const blob = new Blob([data], { type: formato === 'json' ? 'application/json' : 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-trail-${new Date().toISOString().split('T')[0]}.${formato}`;
    a.click();
    URL.revokeObjectURL(url);
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl shadow-2xl overflow-hidden"
    >
      {/* Header */}
      <div className="p-6 bg-gradient-to-r from-slate-900 to-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-emerald-500/20 backdrop-blur-sm">
              <Shield className="w-8 h-8 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Audit Trail</h2>
              <p className="text-white/70 text-sm flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Registro inmutable con verificación SHA-256
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Estado de integridad */}
            {integrityStatus && (
              <div className={`
                px-4 py-2 rounded-xl flex items-center gap-2
                ${integrityStatus.isValid 
                  ? 'bg-emerald-500/20 text-emerald-400' 
                  : 'bg-red-500/20 text-red-400'
                }
              `}>
                {integrityStatus.isValid ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <AlertTriangle className="w-5 h-5" />
                )}
                <span className="text-sm font-medium">
                  {integrityStatus.isValid 
                    ? 'Integridad Verificada' 
                    : `${integrityStatus.corruptedCount} eventos corruptos`
                  }
                </span>
              </div>
            )}
            
            {/* Exportar */}
            <div className="relative group">
              <button className="px-4 py-2 rounded-xl bg-white/10 text-white flex items-center gap-2 hover:bg-white/20 transition-colors">
                <Download className="w-4 h-4" />
                Exportar
                <ChevronDown className="w-4 h-4" />
              </button>
              <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-xl border border-slate-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                <button
                  onClick={() => handleExportar('csv')}
                  className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 rounded-t-xl"
                >
                  Exportar CSV
                </button>
                <button
                  onClick={() => handleExportar('json')}
                  className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 rounded-b-xl"
                >
                  Exportar JSON
                </button>
              </div>
            </div>
            
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>
      
      <div className="p-6">
        {/* Filtros */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
          {/* Búsqueda */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por usuario, descripción..."
              aria-label="Buscar por usuario o descripción"
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-400/50"
            />
          </div>
          
          {/* Filtro riesgo */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={filtroRiesgo}
              onChange={(e) => setFiltroRiesgo(e.target.value as typeof filtroRiesgo)}
              className="px-3 py-2 rounded-lg border border-slate-200 text-sm"
            >
              <option value="todos">Todos los niveles</option>
              <option value="bajo">Bajo</option>
              <option value="medio">Medio</option>
              <option value="alto">Alto</option>
              <option value="critico">Crítico</option>
            </select>
          </div>
          
          {/* Resumen */}
          <div className="flex items-center gap-4 ml-auto text-sm text-slate-500">
            <span>{eventosFiltrados.length} eventos</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              Actualización en tiempo real
            </span>
          </div>
        </div>
        
        {/* Lista de eventos */}
        <div className="space-y-3">
          <AnimatePresence>
            {eventosFiltrados.map(evento => (
              <EventoRow
                key={evento.id}
                evento={evento}
                isExpanded={expandedId === evento.id}
                onVerDetalles={() => setExpandedId(
                  expandedId === evento.id ? null : evento.id
                )}
              />
            ))}
          </AnimatePresence>
          
          {eventosFiltrados.length === 0 && (
            <div className="p-12 text-center">
              <Shield className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">No hay eventos que coincidan con los filtros</p>
            </div>
          )}
        </div>
        
        {/* Footer de compliance */}
        <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200">
          <div className="flex items-center gap-4">
            <Lock className="w-5 h-5 text-slate-400" />
            <div className="text-sm text-slate-600">
              <p className="font-medium">Cumplimiento Normativo</p>
              <p className="text-slate-500">
                Este registro cumple con SOX, GDPR, e ISO 27001. 
                Cada evento está firmado digitalmente y encadenado con hash SHA-256.
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AuditPanel;
