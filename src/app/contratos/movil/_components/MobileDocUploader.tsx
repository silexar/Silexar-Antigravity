/**
 * ?? MOBILE: Cargador de Documentos del Contrato
 * 
 * Permite al ejecutivo adjuntar documentos al contrato:
 * cámara, galería, archivos. Preview interactivo y
 * upload simulado con progreso.
 * 
 * @tier TIER_0_ENTERPRISE
 * @platform MOBILE
 */

'use client';

import { useState, useCallback, useRef } from 'react';
import {
  Camera, Image, FileUp, File, X, Trash2,
  CheckCircle2, Loader2, Upload, Eye,
  AlertTriangle, Paperclip,
} from 'lucide-react';

// ---------------------------------------------------------------
// TIPOS
// ---------------------------------------------------------------

interface Documento {
  id: string;
  nombre: string;
  tipo: 'imagen' | 'pdf' | 'documento';
  tamano: string;
  estado: 'subiendo' | 'completado' | 'error';
  progreso: number;
  preview?: string;
  origen: 'camara' | 'galeria' | 'archivo';
}

interface MobileDocUploaderProps {
  contratoId?: string;
  documentos: Documento[];
  onAgregar: (doc: Documento) => void;
  onEliminar: (docId: string) => void;
  maxDocs?: number;
}

// ---------------------------------------------------------------
// COMPONENTE
// ---------------------------------------------------------------

export function MobileDocUploader({
  documentos, onAgregar, onEliminar, maxDocs = 10,
}: MobileDocUploaderProps) {
  const [showOpciones, setShowOpciones] = useState(false);
  const [previewing, setPreviewing] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  const completados = documentos.filter(d => d.estado === 'completado').length;

  const simularUpload = useCallback((nombre: string, tipo: Documento['tipo'], origen: Documento['origen']) => {
    const id = `doc-${Date.now()}-${Math.random().toString(36).slice(2, 4)}`;
    const tamanos = { imagen: '2.4 MB', pdf: '1.8 MB', documento: '450 KB' };

    const doc: Documento = {
      id, nombre, tipo, origen,
      tamano: tamanos[tipo],
      estado: 'subiendo', progreso: 0,
    };
    onAgregar(doc);

    // Simular progreso
    let prog = 0;
    const interval = setInterval(() => {
      prog += Math.random() * 30 + 10;
      if (prog >= 100) {
        clearInterval(interval);
        onAgregar({ ...doc, estado: 'completado', progreso: 100 });
      } else {
        onAgregar({ ...doc, progreso: Math.min(prog, 95) });
      }
    }, 400);

    setShowOpciones(false);
  }, [onAgregar]);

  const handleCamera = () => {
    // En producción: abrir cámara real
    simularUpload('Foto_contrato.jpg', 'imagen', 'camara');
  };

  const handleGaleria = () => {
    simularUpload('Propuesta_comercial.jpg', 'imagen', 'galeria');
  };

  const handleArchivo = () => {
    simularUpload('Contrato_firmado.pdf', 'pdf', 'archivo');
  };

  return (
    <div className="space-y-4">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-bold text-[#69738c] flex items-center gap-2">
            <Paperclip className="w-4 h-4 text-[#6888ff]" /> Documentos
          </p>
          <p className="text-[10px] text-[#9aa3b8]">{completados}/{maxDocs} adjuntos</p>
        </div>
        {documentos.length < maxDocs && (
          <button
            onClick={() => setShowOpciones(true)}
            className="px-3 py-2 bg-[#6888ff] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 active:scale-95"
          >
            <Upload className="w-3.5 h-3.5" /> Adjuntar
          </button>
        )}
      </div>

      {/* LISTA DE DOCUMENTOS */}
      {documentos.length === 0 ? (
        <div className="text-center py-8 bg-[#dfeaff] rounded-2xl border border-dashed border-[#bec8de30]">
          <FileUp className="w-12 h-12 text-[#9aa3b8] mx-auto" />
          <p className="mt-3 text-sm font-bold text-[#9aa3b8]">Sin documentos</p>
          <p className="text-xs text-[#9aa3b8] mt-1">Adjunta propuestas, contratos firmados o fotos</p>
          <button
            onClick={() => setShowOpciones(true)}
            className="mt-4 px-5 py-2.5 bg-[#6888ff] text-white rounded-xl text-xs font-bold active:scale-95"
          >
            Adjuntar documento
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {documentos.map(doc => (
            <div key={doc.id} className="bg-[#dfeaff] rounded-xl border border-[#bec8de30] p-3 flex items-center gap-3">
              {/* ICONO */}
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                doc.tipo === 'imagen' ? 'bg-blue-100' : doc.tipo === 'pdf' ? 'bg-red-100' : 'bg-[#dfeaff]'
              }`}>
                {doc.tipo === 'imagen' ? <Image className="w-5 h-5 text-blue-500" /> :
                 doc.tipo === 'pdf' ? <File className="w-5 h-5 text-red-500" /> :
                 <File className="w-5 h-5 text-[#9aa3b8]" />}
              </div>

              {/* INFO */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-[#69738c] truncate">{doc.nombre}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] text-[#9aa3b8]">{doc.tamano}</span>
                  {doc.estado === 'subiendo' && (
                    <div className="flex-1 h-1.5 bg-[#dfeaff] rounded-full overflow-hidden">
                      <div className="h-full bg-[#6888ff] rounded-full transition-all" style={{ width: `${doc.progreso}%` }} />
                    </div>
                  )}
                  {doc.estado === 'completado' && (
                    <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5">
                      <CheckCircle2 className="w-3 h-3" /> Listo
                    </span>
                  )}
                  {doc.estado === 'error' && (
                    <span className="text-[10px] text-red-600 font-bold flex items-center gap-0.5">
                      <AlertTriangle className="w-3 h-3" /> Error
                    </span>
                  )}
                </div>
              </div>

              {/* ACCIONES */}
              {doc.estado === 'subiendo' ? (
                <Loader2 className="w-4 h-4 text-[#6888ff] animate-spin" />
              ) : (
                <div className="flex items-center gap-1">
                  {doc.tipo === 'imagen' && (
                    <button aria-label="Ver detalle" onClick={() => setPreviewing(doc.id)} className="p-1.5 rounded-lg bg-[#dfeaff] active:scale-90">
                      <Eye className="w-3.5 h-3.5 text-[#9aa3b8]" />
                    </button>
                  )}
                  <button aria-label="Eliminar" onClick={() => onEliminar(doc.id)} className="p-1.5 rounded-lg bg-red-50 active:scale-90">
                    <Trash2 className="w-3.5 h-3.5 text-red-400" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* INPUTS HIDDEN */}
      <input ref={fileRef} type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={handleArchivo} />
      <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleCamera} />

      {/* SHEET DE OPCIONES */}
      {showOpciones && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end" onClick={() => setShowOpciones(false)}>
          <div className="bg-[#dfeaff] w-full rounded-t-3xl p-5 space-y-3" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-lg text-[#69738c]">Adjuntar Documento</h3>
              <button aria-label="Cerrar" onClick={() => setShowOpciones(false)} className="p-2 rounded-xl bg-[#dfeaff]">
                <X className="w-5 h-5 text-[#9aa3b8]" />
              </button>
            </div>

            <button onClick={handleCamera}
              className="w-full p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-center gap-3 active:scale-[0.97]">
              <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center">
                <Camera className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <p className="font-bold text-sm text-[#69738c]">Tomar Foto</p>
                <p className="text-[10px] text-[#9aa3b8]">Fotografía un documento o propuesta</p>
              </div>
            </button>

            <button onClick={handleGaleria}
              className="w-full p-4 bg-purple-50 border border-purple-100 rounded-2xl flex items-center gap-3 active:scale-[0.97]">
              <div className="w-10 h-10 rounded-xl bg-purple-500 flex items-center justify-center">
                <Image className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <p className="font-bold text-sm text-[#69738c]">Galería</p>
                <p className="text-[10px] text-[#9aa3b8]">Seleccionar imagen existente</p>
              </div>
            </button>

            <button onClick={handleArchivo}
              className="w-full p-4 bg-[#dfeaff] border border-[#bec8de30] rounded-2xl flex items-center gap-3 active:scale-[0.97]">
              <div className="w-10 h-10 rounded-xl bg-[#69738c] flex items-center justify-center">
                <FileUp className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <p className="font-bold text-sm text-[#69738c]">Archivo PDF/Word</p>
                <p className="text-[10px] text-[#9aa3b8]">Seleccionar documento del dispositivo</p>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* PREVIEW MODAL */}
      {previewing && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setPreviewing(null)}>
          <div className="bg-[#dfeaff] rounded-2xl p-4 max-w-sm w-full text-center">
            <div className="w-full h-48 bg-[#dfeaff] rounded-xl flex items-center justify-center mb-3">
              <Image className="w-16 h-16 text-[#9aa3b8]" />
              <p className="text-xs text-[#9aa3b8] ml-2">Vista previa</p>
            </div>
            <button onClick={() => setPreviewing(null)}
              className="px-6 py-2 bg-[#6888ff] text-white rounded-xl font-bold text-sm">
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
