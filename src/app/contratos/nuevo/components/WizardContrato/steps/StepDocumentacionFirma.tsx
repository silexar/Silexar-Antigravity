/**
 * 📄 SILEXAR PULSE - Step 5: Documentación y Firma Digital TIER 0
 * 
 * @description Paso 5 con generación automática de documentos,
 * integración DocuSign/Adobe Sign y tracking de firmas.
 * 
 * @version 2025.4.0
 * @tier TIER_0_FORTUNE_10
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Download,
  Send,
  CheckCircle2,
  Clock,
  Mail,
  Globe,
  Eye,
  Edit3,
  RefreshCw,
  AlertTriangle,
  Sparkles,
  PenTool,
  Shield,
  History,
  ChevronDown,
  Plus,
  Trash2,
  GripVertical,
  Bell,
  FileSignature
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

export type TipoDocumento = 'CONTRATO_PRINCIPAL' | 'ANEXO_TECNICO' | 'CARTA_CONDICIONES' | 'ORDEN_PAUTA' | 'TERCERO';
export type EstadoDocumento = 'BORRADOR' | 'GENERANDO' | 'LISTO' | 'ENVIADO' | 'FIRMADO_PARCIAL' | 'FIRMADO' | 'RECHAZADO';
export type EstadoFirma = 'PENDIENTE' | 'ENVIADO' | 'VISTO' | 'FIRMADO' | 'RECHAZADO' | 'EXPIRADO';

interface Documento {
  id: string;
  tipo: TipoDocumento;
  nombre: string;
  version: number;
  estado: EstadoDocumento;
  idioma: 'ES' | 'EN';
  fechaGeneracion?: Date;
  urlPreview?: string;
  urlDescarga?: string;
  firmantes: Firmante[];
  historialVersiones: VersionDocumento[];
}

interface Firmante {
  id: string;
  nombre: string;
  email: string;
  rol: 'ANUNCIANTE' | 'AGENCIA' | 'EJECUTIVO' | 'GERENTE' | 'LEGAL';
  orden: number;
  estado: EstadoFirma;
  fechaEnvio?: Date;
  fechaFirma?: Date;
  ipFirma?: string;
}

interface VersionDocumento {
  version: number;
  fecha: Date;
  autor: string;
  cambios: string;
}

interface PlantillaDocumento {
  id: string;
  nombre: string;
  tipo: TipoDocumento;
  descripcion: string;
  variables: string[];
  idiomas: ('ES' | 'EN')[];
}

interface StepDocumentacionFirmaProps {
  datos: {
    contratoId: string;
    numeroContrato: string;
    anunciante: { id: string; nombre: string; email: string };
    valorContrato: number;
    firmantes?: Firmante[];
  };
  onChange: (datos: Record<string, unknown>) => void;
  onValidationChange?: (isValid: boolean) => void;
}

// ═══════════════════════════════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════════════════════════════

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _plantillasDisponibles: PlantillaDocumento[] = [
  {
    id: 'plt-001',
    nombre: 'Contrato Estándar de Pauta',
    tipo: 'CONTRATO_PRINCIPAL',
    descripcion: 'Contrato completo con todas las cláusulas legales y comerciales',
    variables: ['anunciante', 'producto', 'fechas', 'valores', 'especificaciones'],
    idiomas: ['ES', 'EN']
  },
  {
    id: 'plt-002',
    nombre: 'Anexo Técnico de Especificaciones',
    tipo: 'ANEXO_TECNICO',
    descripcion: 'Detalle técnico de horarios, medios y materiales',
    variables: ['medios', 'horarios', 'materiales'],
    idiomas: ['ES']
  },
  {
    id: 'plt-003',
    nombre: 'Orden de Pauta',
    tipo: 'ORDEN_PAUTA',
    descripcion: 'Resumen ejecutivo para emisoras',
    variables: ['medios', 'fechas', 'cuñas'],
    idiomas: ['ES']
  }
];

const mockDocumentos: Documento[] = [
  {
    id: 'doc-001',
    tipo: 'CONTRATO_PRINCIPAL',
    nombre: 'Contrato de Pauta Publicitaria',
    version: 1,
    estado: 'LISTO',
    idioma: 'ES',
    fechaGeneracion: new Date(),
    urlPreview: '/preview/contrato-001.pdf',
    urlDescarga: '/download/contrato-001.pdf',
    firmantes: [
      { id: 'f-001', nombre: 'Juan Pérez', email: 'jperez@supermax.cl', rol: 'ANUNCIANTE', orden: 1, estado: 'PENDIENTE' },
      { id: 'f-002', nombre: 'Carolina Muñoz', email: 'cmunoz@silexar.cl', rol: 'GERENTE', orden: 2, estado: 'PENDIENTE' }
    ],
    historialVersiones: [
      { version: 1, fecha: new Date(), autor: 'Sistema', cambios: 'Versión inicial generada automáticamente' }
    ]
  }
];

// ═══════════════════════════════════════════════════════════════
// COMPONENTES AUXILIARES
// ═══════════════════════════════════════════════════════════════

const EstadoDocumentoBadge: React.FC<{ estado: EstadoDocumento }> = ({ estado }) => {
  const config = {
    BORRADOR: { bg: 'bg-slate-100', text: 'text-slate-700', label: 'Borrador' },
    GENERANDO: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Generando...' },
    LISTO: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Listo' },
    ENVIADO: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Enviado' },
    FIRMADO_PARCIAL: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Firmado Parcial' },
    FIRMADO: { bg: 'bg-green-100', text: 'text-green-700', label: 'Firmado ✓' },
    RECHAZADO: { bg: 'bg-red-100', text: 'text-red-700', label: 'Rechazado' }
  }[estado];

  return (
    <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  );
};

const EstadoFirmaBadge: React.FC<{ estado: EstadoFirma }> = ({ estado }) => {
  const config = {
    PENDIENTE: { icon: <Clock className="w-4 h-4" />, color: 'text-slate-500', label: 'Pendiente' },
    ENVIADO: { icon: <Mail className="w-4 h-4" />, color: 'text-blue-500', label: 'Enviado' },
    VISTO: { icon: <Eye className="w-4 h-4" />, color: 'text-amber-500', label: 'Visto' },
    FIRMADO: { icon: <CheckCircle2 className="w-4 h-4" />, color: 'text-green-500', label: 'Firmado' },
    RECHAZADO: { icon: <AlertTriangle className="w-4 h-4" />, color: 'text-red-500', label: 'Rechazado' },
    EXPIRADO: { icon: <Clock className="w-4 h-4" />, color: 'text-slate-400', label: 'Expirado' }
  }[estado];

  return (
    <div className={`flex items-center gap-1.5 ${config.color}`}>
      {config.icon}
      <span className="text-sm font-medium">{config.label}</span>
    </div>
  );
};

const DocumentoCard: React.FC<{
  documento: Documento;
  onPreview: () => void;
  onDownload: () => void;
  onEnviarFirma: () => void;
  expandido: boolean;
  onToggle: () => void;
}> = ({ documento, onPreview, onDownload, onEnviarFirma, expandido, onToggle }) => (
  <motion.div
    layout
    className="rounded-xl border border-slate-200 bg-white overflow-hidden"
  >
    <button
      onClick={onToggle}
      className="w-full p-4 flex items-center gap-4 text-left hover:bg-slate-50 transition-colors"
    >
      <div className="p-3 rounded-xl bg-indigo-100">
        <FileText className="w-6 h-6 text-indigo-600" />
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h4 className="font-bold text-slate-800">{documento.nombre}</h4>
          <EstadoDocumentoBadge estado={documento.estado} />
        </div>
        <p className="text-sm text-slate-500">
          v{documento.version} • {documento.idioma === 'ES' ? '🇪🇸 Español' : '🇬🇧 English'} • 
          {documento.firmantes.length} firmante{documento.firmantes.length > 1 ? 's' : ''}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <button aria-label="Ver detalle" onClick={(e) => { e.stopPropagation(); onPreview(); }} className="p-2 rounded-lg hover:bg-slate-100">
          <Eye className="w-5 h-5 text-slate-500" />
        </button>
        <button aria-label="Descargar" onClick={(e) => { e.stopPropagation(); onDownload(); }} className="p-2 rounded-lg hover:bg-slate-100">
          <Download className="w-5 h-5 text-slate-500" />
        </button>
        <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${expandido ? 'rotate-180' : ''}`} />
      </div>
    </button>

    <AnimatePresence>
      {expandido && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="border-t border-slate-200"
        >
          <div className="p-4 space-y-4">
            {/* Firmantes */}
            <div>
              <h5 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
                <PenTool className="w-4 h-4 text-purple-500" />
                Flujo de Firmas
              </h5>
              <div className="space-y-2">
                {documento.firmantes.map((firmante) => (
                  <div key={firmante.id} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                      {firmante.orden}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-slate-800">{firmante.nombre}</p>
                      <p className="text-xs text-slate-500">{firmante.email} • {firmante.rol}</p>
                    </div>
                    <EstadoFirmaBadge estado={firmante.estado} />
                    {firmante.estado === 'FIRMADO' && firmante.fechaFirma && (
                      <p className="text-xs text-slate-400">
                        {firmante.fechaFirma.toLocaleDateString('es-CL')}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Historial de versiones */}
            <div>
              <h5 className="font-semibold text-slate-700 mb-2 flex items-center gap-2">
                <History className="w-4 h-4 text-blue-500" />
                Historial de Versiones
              </h5>
              <div className="space-y-1">
                {documento.historialVersiones.map((version) => (
                  <div key={version.version} className="flex items-center gap-2 text-sm">
                    <span className="font-mono text-indigo-600">v{version.version}</span>
                    <span className="text-slate-500">•</span>
                    <span className="text-slate-600">{version.cambios}</span>
                    <span className="text-slate-400 ml-auto">{version.fecha.toLocaleDateString('es-CL')}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Acciones */}
            <div className="flex gap-2 pt-2">
              <button
                onClick={onEnviarFirma}
                disabled={documento.estado !== 'LISTO'}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium flex items-center justify-center gap-2 hover:shadow-lg transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
                Enviar a Firma
              </button>
              <button className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-medium flex items-center justify-center gap-2 hover:bg-slate-200">
                <Edit3 className="w-4 h-4" />
                Editar
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </motion.div>
);

const FirmanteInput: React.FC<{
  firmante: Partial<Firmante>;
  index: number;
  onChange: (firmante: Partial<Firmante>) => void;
  onRemove: () => void;
  canRemove: boolean;
}> = ({ firmante, index, onChange, onRemove, canRemove }) => (
  <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
    <div className="cursor-grab">
      <GripVertical className="w-5 h-5 text-slate-400" />
    </div>
    <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold">
      {index + 1}
    </div>
    <input
      type="text"
      value={firmante.nombre || ''}
      onChange={(e) => onChange({ ...firmante, nombre: e.target.value })}
      placeholder="Nombre completo"
      aria-label={`Nombre del firmante ${index + 1}`}
      className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm"
    />
    <input
      type="email"
      value={firmante.email || ''}
      onChange={(e) => onChange({ ...firmante, email: e.target.value })}
      placeholder="email@ejemplo.cl"
      aria-label={`Email del firmante ${index + 1}`}
      className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm"
    />
    <select
      value={firmante.rol || 'ANUNCIANTE'}
      onChange={(e) => onChange({ ...firmante, rol: e.target.value as Firmante['rol'] })}
      className="px-3 py-2 rounded-lg border border-slate-200 text-sm"
    >
      <option value="ANUNCIANTE">Anunciante</option>
      <option value="AGENCIA">Agencia</option>
      <option value="EJECUTIVO">Ejecutivo</option>
      <option value="GERENTE">Gerente</option>
      <option value="LEGAL">Legal</option>
    </select>
    {canRemove && (
      <button aria-label="Eliminar" onClick={onRemove} className="p-2 rounded-lg hover:bg-red-100 text-red-500">
        <Trash2 className="w-4 h-4" />
      </button>
    )}
  </div>
);

// ═══════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════

export default function StepDocumentacionFirma({
  datos,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onChange: _onChange,
  onValidationChange
}: StepDocumentacionFirmaProps) {
  const [documentos, setDocumentos] = useState<Documento[]>(mockDocumentos);
  const [firmantes, setFirmantes] = useState<Partial<Firmante>[]>([
    { nombre: datos.anunciante.nombre, email: datos.anunciante.email, rol: 'ANUNCIANTE', orden: 1 }
  ]);
  const [docExpandido, setDocExpandido] = useState<string | null>('doc-001');
  const [generando, setGenerando] = useState(false);
  const [idiomaSeleccionado, setIdiomaSeleccionado] = useState<'ES' | 'EN'>('ES');
  const [proveedorFirma, setProveedorFirma] = useState<'docusign' | 'adobesign'>('docusign');

  // Validación
  useEffect(() => {
    const documentosListos = documentos.some(d => d.estado === 'LISTO' || d.estado === 'FIRMADO');
    const tieneFirmantes = firmantes.length > 0 && firmantes.every(f => f.nombre && f.email);
    onValidationChange?.(documentosListos && tieneFirmantes);
  }, [documentos, firmantes, onValidationChange]);

  const handleGenerarDocumentos = async () => {
    setGenerando(true);
    // Simular generación
    await new Promise(resolve => setTimeout(resolve, 2000));
    setDocumentos(prev => prev.map(d => ({ ...d, estado: 'LISTO' as EstadoDocumento })));
    setGenerando(false);
  };

  const handleAgregarFirmante = () => {
    setFirmantes(prev => [...prev, { rol: 'ANUNCIANTE', orden: prev.length + 1 }]);
  };

  const handleEnviarFirma = async (docId: string) => {
    setDocumentos(prev => prev.map(d => 
      d.id === docId ? { ...d, estado: 'ENVIADO' as EstadoDocumento } : d
    ));
  };

  return (
    <div className="space-y-6">
      {/* Panel de generación */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 rounded-2xl bg-gradient-to-br from-slate-50 to-indigo-50 border border-slate-200"
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-lg bg-indigo-100">
            <FileText className="w-5 h-5 text-indigo-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-800">📄 Generación Automática de Documentos</h3>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-4">
          {/* Idioma */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              <Globe className="w-4 h-4 inline mr-1" />
              Idioma del Contrato
            </label>
            <div className="flex gap-2">
              {(['ES', 'EN'] as const).map(idioma => (
                <button
                  key={idioma}
                  onClick={() => setIdiomaSeleccionado(idioma)}
                  className={`flex-1 py-3 rounded-xl border-2 font-medium transition-all ${
                    idiomaSeleccionado === idioma
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                      : 'border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  {idioma === 'ES' ? '🇪🇸 Español' : '🇬🇧 English'}
                </button>
              ))}
            </div>
          </div>

          {/* Proveedor de firma */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              <PenTool className="w-4 h-4 inline mr-1" />
              Proveedor de Firma Digital
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setProveedorFirma('docusign')}
                className={`flex-1 py-3 rounded-xl border-2 font-medium transition-all ${
                  proveedorFirma === 'docusign'
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <span className="text-indigo-600 font-bold">DocuSign</span>
              </button>
              <button
                onClick={() => setProveedorFirma('adobesign')}
                className={`flex-1 py-3 rounded-xl border-2 font-medium transition-all ${
                  proveedorFirma === 'adobesign'
                    ? 'border-red-500 bg-red-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <span className="text-red-600 font-bold">Adobe Sign</span>
              </button>
            </div>
          </div>
        </div>

        <button
          onClick={handleGenerarDocumentos}
          disabled={generando}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold flex items-center justify-center gap-2 hover:shadow-lg transition-shadow disabled:opacity-50"
        >
          {generando ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              Generando documentos...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Generar Documentos Automáticamente
            </>
          )}
        </button>
      </motion.div>

      {/* Configuración de firmantes */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <PenTool className="w-5 h-5 text-purple-500" />
            <h3 className="text-lg font-semibold text-slate-800">Configurar Firmantes</h3>
          </div>
          <button
            onClick={handleAgregarFirmante}
            className="px-3 py-1.5 rounded-lg bg-indigo-100 text-indigo-700 text-sm font-medium flex items-center gap-1 hover:bg-indigo-200"
          >
            <Plus className="w-4 h-4" />
            Agregar
          </button>
        </div>

        <p className="text-sm text-slate-500 mb-4">
          Arrastra para cambiar el orden de firma. El documento se enviará secuencialmente.
        </p>

        <div className="space-y-2">
          {firmantes.map((firmante, index) => (
            <FirmanteInput
              key={firmante.id ?? `firmante-${index}`}
              firmante={firmante}
              index={index}
              onChange={(updated) => {
                setFirmantes(prev => prev.map((f, i) => i === index ? updated : f));
              }}
              onRemove={() => setFirmantes(prev => prev.filter((_, i) => i !== index))}
              canRemove={firmantes.length > 1}
            />
          ))}
        </div>

        {/* Recordatorios */}
        <div className="mt-4 p-3 rounded-lg bg-amber-50 border border-amber-200">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-amber-500" />
            <div>
              <p className="font-medium text-amber-700">Recordatorios automáticos</p>
              <p className="text-sm text-amber-600">
                Se enviarán recordatorios cada 24h hasta completar todas las firmas
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de documentos */}
      <div>
        <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <FileSignature className="w-5 h-5 text-indigo-500" />
          Documentos del Contrato
        </h3>

        <div className="space-y-3">
          {documentos.map(doc => (
            <DocumentoCard
              key={doc.id}
              documento={doc}
              expandido={docExpandido === doc.id}
              onToggle={() => setDocExpandido(docExpandido === doc.id ? null : doc.id)}
              onPreview={() => {}}
              onDownload={() => {}}
              onEnviarFirma={() => handleEnviarFirma(doc.id)}
            />
          ))}
        </div>
      </div>

      {/* Resumen */}
      <div className="p-4 rounded-xl bg-slate-800 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-sm">Documentación y Firma</p>
            <p className="text-xl font-bold">
              {documentos.length} documento{documentos.length > 1 ? 's' : ''} • {firmantes.length} firmante{firmantes.length > 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-slate-400 text-xs">Proveedor</p>
              <p className="font-medium">{proveedorFirma === 'docusign' ? 'DocuSign' : 'Adobe Sign'}</p>
            </div>
            <Shield className="w-8 h-8 text-green-400" />
          </div>
        </div>
      </div>
    </div>
  );
}
