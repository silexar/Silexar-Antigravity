/**
 * ?? SILEXAR PULSE - Documentation Panel Component TIER 0
 * 
 * @description Panel de documentaci�n de negociaci�n que permite:
 * - Drag & Drop desde Gmail/Outlook
 * - Instrucciones para m�vil
 * - Vista de documentos procesados
 * - Datos extra�dos por IA
 * 
 * @version 2025.4.0
 * @tier TIER_0_FORTUNE_10
 */

'use client';

import React, { useState, useCallback, useRef } from 'react';
import DOMPurify from 'isomorphic-dompurify';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  Mail,
  MessageSquare,
  FileText,
  File,
  Image,
  Paperclip,
  Check,
  AlertCircle,
  Loader2,
  Copy,
  Smartphone,
  Sparkles,
  Eye,
  Trash2,
  Download,
  RefreshCw,
  QrCode
} from 'lucide-react';
import { 
  DocumentationIngestion,
  type DocumentoNegociacion,
  type TipoDocumento 
} from '../nuevo/components/WizardContrato/services/DocumentationIngestionService';

// ---------------------------------------------------------------
// ESTILOS NEUROMORPHIC
// ---------------------------------------------------------------

const neuro = {
  panel: `
    bg-[#dfeaff]
    rounded-3xl
    shadow-[8px_8px_16px_#bec8de,-8px_-8px_16px_#ffffff]
  `,
  card: `
    bg-[#dfeaff]
    rounded-2xl
    shadow-[6px_6px_12px_#bec8de,-6px_-6px_12px_#ffffff]
  `,
  dropzone: `
    border-2 border-dashed border-[#bec8de]
    rounded-2xl
    bg-[#dfeaff]
    transition-all duration-300
  `,
  dropzoneActive: `
    border-[#6888ff] border-solid
    bg-[#dfeaff]
    shadow-[inset_4px_4px_8px_rgba(99,102,241,0.1)]
  `,
  input: `
    bg-[#dfeaff]
    rounded-xl
    shadow-[inset_3px_3px_6px_#bec8de,inset_-3px_-3px_6px_#ffffff]
    border-none
    focus:ring-2 focus:ring-[#6888ff]/50 focus:outline-none
  `,
  btnPrimary: `
    bg-[#6888ff]
    text-white font-semibold rounded-xl
    shadow-[4px_4px_8px_#bec8de,-4px_-4px_8px_#ffffff]
    hover:shadow-[2px_2px_4px_#bec8de,-2px_-2px_4px_#ffffff]
    transition-all duration-200
  `,
  btnSecondary: `
    bg-[#dfeaff]
    text-[#69738c] font-medium rounded-xl
    shadow-[4px_4px_8px_#bec8de,-4px_-4px_8px_#ffffff]
    hover:shadow-[2px_2px_4px_#bec8de,-2px_-2px_4px_#ffffff]
    transition-all duration-200
  `,
  badge: `
    px-3 py-1 rounded-lg
    shadow-[2px_2px_4px_#bec8de,-2px_-2px_4px_#ffffff]
    text-xs font-medium
  `
};

// ---------------------------------------------------------------
// HELPERS
// ---------------------------------------------------------------

const getTipoIcon = (tipo: TipoDocumento) => {
  switch (tipo) {
    case 'EMAIL': return <Mail className="w-5 h-5 text-[#9aa3b8]" />;
    case 'COTIZACION': return <FileText className="w-5 h-5 text-[#6888ff]" />;
    case 'ORDEN_COMPRA': return <File className="w-5 h-5 text-[#6888ff]" />;
    case 'VOUCHER': return <File className="w-5 h-5 text-[#6888ff]" />;
    case 'PROPUESTA': return <FileText className="w-5 h-5 text-[#6888ff]" />;
    case 'BRIEF': return <FileText className="w-5 h-5 text-[#6888ff]" />;
    default: return <Paperclip className="w-5 h-5 text-[#9aa3b8]" />;
  }
};

const getTipoLabel = (tipo: TipoDocumento): string => {
  // Safe switch statement to prevent object injection
  switch (tipo) {
    case 'EMAIL': return 'Email';
    case 'ADJUNTO': return 'Adjunto';
    case 'COTIZACION': return 'Cotizaci�n';
    case 'ORDEN_COMPRA': return 'Orden de Compra';
    case 'VOUCHER': return 'Voucher';
    case 'BRIEF': return 'Brief';
    case 'PROPUESTA': return 'Propuesta';
    case 'CONTRATO_ANTERIOR': return 'Contrato Anterior';
    case 'ACTA_REUNION': return 'Acta Reuni�n';
    case 'MENSAJE_CHAT': return 'Mensaje Chat';
    case 'OTRO': return 'Otro';
    default: return tipo;
  }
};

const formatSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const formatTimeAgo = (date: Date) => {
  const now = new Date();
  const diffMins = Math.floor((now.getTime() - date.getTime()) / 60000);
  if (diffMins < 1) return 'Ahora';
  if (diffMins < 60) return `Hace ${diffMins} min`;
  if (diffMins < 1440) return `Hace ${Math.floor(diffMins / 60)}h`;
  return date.toLocaleDateString('es-CL');
};

// ---------------------------------------------------------------
// COMPONENTE PRINCIPAL
// ---------------------------------------------------------------

export default function DocumentacionNegociacionPanel({
  contratoId,
  usuarioActual = 'Usuario'
}: {
  contratoId: string;
  usuarioActual?: string;
}) {
  const [documentos, setDocumentos] = useState<DocumentoNegociacion[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showMobileInstructions, setShowMobileInstructions] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Obtener direcci�n de ingesta
  const ingestEmail = DocumentationIngestion.getIngestEmailAddress(contratoId);
  const instrucciones = DocumentationIngestion.getInstruccionesMovil(contratoId);

  // ---------------------------------------------------------------
  // DRAG & DROP HANDLERS
  // ---------------------------------------------------------------

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    setIsUploading(true);

    try {
      const files = Array.from(e.dataTransfer.files);
      
      // Verificar si es un email de Gmail (text/uri-list o text/plain con datos de Gmail)
      const gmailData = e.dataTransfer.getData('text/plain');
      
      if (files.length > 0) {
        const nuevosDocumentos = await DocumentationIngestion.procesarDragDrop(
          files,
          contratoId,
          usuarioActual
        );
        setDocumentos(prev => [...prev, ...nuevosDocumentos]);
      } else if (gmailData) {
        // Procesar como contenido de email
        ;
      }
    } finally {
      setIsUploading(false);
    }
  }, [contratoId, usuarioActual]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;

    setIsUploading(true);
    try {
      const nuevosDocumentos = await DocumentationIngestion.procesarDragDrop(
        Array.from(files),
        contratoId,
        usuarioActual
      );
      setDocumentos(prev => [...prev, ...nuevosDocumentos]);
    } finally {
      setIsUploading(false);
    }
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(ingestEmail);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const handleDeleteDocument = (docId: string) => {
    DocumentationIngestion.eliminarDocumento(contratoId, docId);
    setDocumentos(prev => prev.filter(d => d.id !== docId));
  };

  // ---------------------------------------------------------------
  // RENDER
  // ---------------------------------------------------------------

  return (
    <div className={neuro.panel}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-[#bec8de30]">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lg text-[#69738c] flex items-center gap-2">
            <Paperclip className="w-5 h-5 text-[#6888ff]" />
            Documentaci�n de Negociaci�n
            {documentos.length > 0 && (
              <span className={`${neuro.badge} bg-[#dfeaff] text-[#6888ff]`}>
                {documentos.length}
              </span>
            )}
          </h3>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowMobileInstructions(!showMobileInstructions)}
              className={`${neuro.btnSecondary} px-3 py-2 text-sm flex items-center gap-2`}
            >
              <Smartphone className="w-4 h-4" />
              Enviar desde m�vil
            </button>
          </div>
        </div>
      </div>

      {/* Instrucciones m�vil */}
      <AnimatePresence>
        {showMobileInstructions && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-6 py-4 bg-[#dfeaff] border-b border-[#bec8de30]">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-[#dfeaff] shadow-sm">
                  <QrCode className="w-6 h-6 text-[#6888ff]" />
                </div>
                
                <div className="flex-1">
                  <h4 className="font-semibold text-[#69738c] mb-3">
                    ?? Env�a documentaci�n desde cualquier dispositivo
                  </h4>
                  
                  <div className="space-y-3">
                    {/* Email de ingesta */}
                    <div className={`${neuro.input} p-3 flex items-center gap-3`}>
                      <Mail className="w-5 h-5 text-[#6888ff] shrink-0" />
                      <div className="flex-1">
                        <p className="text-xs text-[#9aa3b8]">Reenv�a emails a:</p>
                        <p className="font-mono text-sm text-[#69738c]">{ingestEmail}</p>
                      </div>
                      <button
                        onClick={handleCopyEmail}
                        className={`${neuro.btnSecondary} p-2`}
                      >
                        {copiedEmail ? (
                          <Check className="w-4 h-4 text-[#6888ff]" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>

                    {/* WhatsApp */}
                    <div className={`${neuro.input} p-3 flex items-center gap-3`}>
                      <MessageSquare className="w-5 h-5 text-[#6888ff] shrink-0" />
                      <div className="flex-1">
                        <p className="text-xs text-[#9aa3b8]">Env�a por WhatsApp a:</p>
                        <p className="font-mono text-sm text-[#69738c]">{instrucciones.whatsapp}</p>
                      </div>
                    </div>

                    {/* Instrucciones */}
                    <div className="text-sm text-[#69738c] space-y-1">
                      {instrucciones.instrucciones.map((inst, idx) => (
                        <p key={`inst-${idx}`} className="flex items-start gap-2">
                          <span className="text-[#6888ff]">�</span>
                          <span dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(inst.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')) }} />
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Drop Zone */}
      <div className="p-6">
        <div
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            ${neuro.dropzone}
            ${isDragging ? neuro.dropzoneActive : ''}
            p-8 text-center cursor-pointer
          `}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={handleFileSelect}
            accept=".pdf,.doc,.docx,.xls,.xlsx,.eml,.msg,.jpg,.png,.gif,.txt"
          />
          
          {isUploading ? (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-12 h-12 text-[#6888ff] animate-spin" />
              <p className="text-[#69738c]">Procesando documentos...</p>
            </div>
          ) : isDragging ? (
            <div className="flex flex-col items-center gap-3">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 1 }}
              >
                <Upload className="w-12 h-12 text-[#6888ff]" />
              </motion.div>
              <p className="text-[#6888ff] font-semibold">Suelta aqu� los archivos</p>
              <p className="text-sm text-[#6888ff]">
                Emails de Gmail, archivos PDF, im�genes, documentos...
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="flex items-center gap-4">
                <div className="p-4 rounded-2xl bg-[#dfeaff]">
                  <Mail className="w-8 h-8 text-[#9aa3b8]" />
                </div>
                <div className="p-4 rounded-2xl bg-[#dfeaff]">
                  <FileText className="w-8 h-8 text-[#6888ff]" />
                </div>
                <div className="p-4 rounded-2xl bg-[#dfeaff]">
                  <Image className="w-8 h-8 text-[#6888ff]" />
                </div>
              </div>
              
              <div className="mt-4">
                <p className="text-[#69738c] font-semibold">
                  Arrastra emails desde Gmail o archivos aqu�
                </p>
                <p className="text-sm text-[#9aa3b8] mt-1">
                  O <span className="text-[#6888ff] underline">haz clic para seleccionar</span>
                </p>
                <p className="text-xs text-[#9aa3b8] mt-3">
                  PDF, DOC, XLS, EML, MSG, im�genes hasta 25MB
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Lista de documentos */}
      {documentos.length > 0 && (
        <div className="px-6 pb-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-[#69738c] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#6888ff]" />
              Documentos procesados
            </h4>
            <button className={`${neuro.btnSecondary} px-3 py-1.5 text-xs flex items-center gap-2`}>
              <RefreshCw className="w-3 h-3" />
              Reprocesar IA
            </button>
          </div>

          <div className="space-y-3">
            {documentos.map((doc, idx) => (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`${neuro.card} p-4`}
              >
                <div className="flex items-start gap-4">
                  {/* Icono tipo */}
                  <div className={`p-3 rounded-xl ${
                    doc.tipo === 'EMAIL' ? 'bg-[#dfeaff]' :
                    doc.tipo === 'COTIZACION' ? 'bg-[#6888ff]/10' :
                    doc.tipo === 'ORDEN_COMPRA' ? 'bg-[#6888ff]/10' :
                    'bg-[#dfeaff]'
                  }`}>
                    {getTipoIcon(doc.tipo)}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-[#69738c] truncate">
                        {doc.nombreArchivo}
                      </p>
                      <span className={`${neuro.badge} ${
                        doc.tipo === 'EMAIL' ? 'bg-[#dfeaff] text-[#9aa3b8]' :
                        doc.tipo === 'COTIZACION' ? 'bg-[#6888ff]/10 text-[#6888ff]' :
                        doc.tipo === 'ORDEN_COMPRA' ? 'bg-[#6888ff]/10 text-[#6888ff]' :
                        'bg-[#dfeaff] text-[#69738c]'
                      }`}>
                        {getTipoLabel(doc.tipo)}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-3 mt-1 text-xs text-[#9aa3b8]">
                      <span>{formatSize(doc.tamaño)}</span>
                      <span>·</span>
                      <span>{formatTimeAgo(doc.fechaSubida)}</span>
                      <span>·</span>
                      <span className="capitalize">{doc.origen.toLowerCase().replace('_', ' ')}</span>
                    </div>

                    {/* Email preview */}
                    {doc.emailData && (
                      <div className="mt-2 p-2 bg-[#dfeaff] rounded-lg text-xs">
                        <p><strong>De:</strong> {doc.emailData.de}</p>
                        <p><strong>Asunto:</strong> {doc.emailData.asunto}</p>
                      </div>
                    )}

                    {/* Datos extra�dos */}
                    {doc.datosExtraidos && Object.keys(doc.datosExtraidos).length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {doc.datosExtraidos.valorMencionado && (
                          <span className={`${neuro.badge} bg-[#6888ff]/10 text-[#6888ff]`}>
                            ${(doc.datosExtraidos.valorMencionado / 1000000).toFixed(0)}M
                          </span>
                        )}
                        {doc.datosExtraidos.mediosMencionados?.map(m => (
                          <span key={m} className={`${neuro.badge} bg-[#dfeaff] text-[#6888ff]`}>
                            {m}
                          </span>
                        ))}
                        {doc.confianzaExtraccion && (
                          <span className={`${neuro.badge} ${
                            doc.confianzaExtraccion >= 80 ? 'bg-[#6888ff]/10 text-[#6888ff]' :
                            doc.confianzaExtraccion >= 60 ? 'bg-[#6888ff]/10 text-[#6888ff]' :
                            'bg-[#dfeaff] text-[#9aa3b8]'
                          }`}>
                            <Sparkles className="w-3 h-3 inline mr-1" />
                            {doc.confianzaExtraccion}% IA
                          </span>
                        )}
                      </div>
                    )}

                    {/* Estado procesamiento */}
                    <div className="mt-2 flex items-center gap-2">
                      {doc.estadoProcesamiento === 'PROCESANDO' && (
                        <span className="flex items-center gap-1 text-xs text-[#6888ff]">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          Procesando...
                        </span>
                      )}
                      {doc.estadoProcesamiento === 'PROCESADO' && (
                        <span className="flex items-center gap-1 text-xs text-[#6888ff]">
                          <Check className="w-3 h-3" />
                          Procesado
                        </span>
                      )}
                      {doc.estadoProcesamiento === 'ERROR' && (
                        <span className="flex items-center gap-1 text-xs text-[#9aa3b8]">
                          <AlertCircle className="w-3 h-3" />
                          Error
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="flex items-center gap-2">
                    <button className={`${neuro.btnSecondary} p-2`}>
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className={`${neuro.btnSecondary} p-2`}>
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteDocument(doc.id)}
                      className={`${neuro.btnSecondary} p-2 hover:bg-[#dfeaff]`}
                    >
                      <Trash2 className="w-4 h-4 text-[#9aa3b8]" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Footer con resumen */}
      {documentos.length > 0 && (
        <div className="px-6 py-4 bg-[#dfeaff] border-t border-[#bec8de30]">
          <div className="flex items-center justify-between">
            <div className="text-sm text-[#69738c]">
              <span className="font-semibold">{documentos.length}</span> documentos
              {' � '}
              <span className="font-semibold">
                {documentos.filter(d => d.estadoProcesamiento === 'PROCESADO').length}
              </span> procesados por IA
            </div>
            
            <button className={`${neuro.btnPrimary} px-4 py-2 text-sm flex items-center gap-2`}>
              <Sparkles className="w-4 h-4" />
              Aplicar datos extra�dos
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
