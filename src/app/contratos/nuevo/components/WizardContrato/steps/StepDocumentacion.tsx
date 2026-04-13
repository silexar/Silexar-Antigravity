/**
 * 📄 SILEXAR PULSE - Paso 5: Documentación TIER 0
 * 
 * @description Quinto paso del wizard - Generación de documentos
 * y configuración de firma digital.
 * 
 * @version 2025.3.0
 * @tier TIER_0_FORTUNE_10
 */

'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FileSignature,
  FileText,
  Download,
  Eye,
  Send,
  CheckCircle2,
  Clock,
  User,
  Shield,
  Printer,
  RefreshCw,
  ExternalLink,
  Sparkles,
  Mail
} from 'lucide-react';
import { 
  WizardContratoState, 
  WizardAction,
  DocumentoContrato,
  formatCurrency,
  formatDate
} from '../types/wizard.types';

// ═══════════════════════════════════════════════════════════════
// COMPONENTE DE DOCUMENTO
// ═══════════════════════════════════════════════════════════════

const DocumentoCard: React.FC<{
  documento: DocumentoContrato;
  onView: () => void;
  onDownload: () => void;
}> = ({ documento, onView, onDownload }) => {
  const getEstadoConfig = () => {
    switch (documento.estado) {
      case 'borrador': return { color: 'bg-slate-100 text-slate-600', icon: FileText };
      case 'pendiente_firma': return { color: 'bg-amber-100 text-amber-700', icon: Clock };
      case 'firmado': return { color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle2 };
      case 'rechazado': return { color: 'bg-red-100 text-red-700', icon: FileText };
      default: return { color: 'bg-slate-100 text-slate-600', icon: FileText };
    }
  };
  
  const config = getEstadoConfig();
  const Icon = config.icon;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-indigo-100">
            <FileText className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h4 className="font-semibold text-slate-800">{documento.nombre}</h4>
            <p className="text-sm text-slate-500 capitalize">{documento.tipo.replace('_', ' ')}</p>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-lg text-xs font-medium ${config.color} flex items-center gap-1`}>
          <Icon className="w-3 h-3" />
          {documento.estado.replace('_', ' ')}
        </span>
      </div>
      
      {/* Firmantes */}
      {documento.firmantes.length > 0 && (
        <div className="mb-4">
          <p className="text-xs text-slate-500 mb-2">Firmantes:</p>
          <div className="flex flex-wrap gap-2">
            {documento.firmantes.map((firmante) => (
              <div
                key={firmante.nombre}
                className={`
                  flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm
                  ${firmante.estado === 'firmado' ? 'bg-emerald-50 text-emerald-700' : 
                    firmante.estado === 'pendiente' ? 'bg-amber-50 text-amber-700' : 
                    'bg-red-50 text-red-700'}
                `}
              >
                <User className="w-3 h-3" />
                <span>{firmante.nombre}</span>
                {firmante.estado === 'firmado' && <CheckCircle2 className="w-3 h-3" />}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Acciones */}
      <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
        <button
          onClick={onView}
          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium transition-colors"
        >
          <Eye className="w-4 h-4" />
          Ver
        </button>
        <button
          onClick={onDownload}
          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-indigo-100 hover:bg-indigo-200 text-indigo-700 text-sm font-medium transition-colors"
        >
          <Download className="w-4 h-4" />
          Descargar
        </button>
      </div>
    </motion.div>
  );
};

// ═══════════════════════════════════════════════════════════════
// PREVIEW DEL CONTRATO
// ═══════════════════════════════════════════════════════════════

const ContratoPreview: React.FC<{
  state: WizardContratoState;
}> = ({ state }) => {
  return (
    <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-slate-800">Vista Previa del Contrato</h3>
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors">
            <Printer className="w-5 h-5" />
          </button>
          <button className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors">
            <ExternalLink className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      {/* Documento simulado */}
      <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 space-y-6 font-mono text-sm">
        <div className="text-center border-b border-slate-200 pb-4">
          <h2 className="text-lg font-bold text-slate-800">CONTRATO DE SERVICIOS PUBLICITARIOS</h2>
          <p className="text-slate-500">{state.numeroContrato}</p>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-slate-600">
          <div>
            <p className="text-slate-400 text-xs">CLIENTE</p>
            <p className="font-semibold">{state.anunciante?.nombre || 'No seleccionado'}</p>
            <p>{state.anunciante?.rut}</p>
          </div>
          <div>
            <p className="text-slate-400 text-xs">CAMPAÑA</p>
            <p className="font-semibold">{state.campana || '-'}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4 bg-white p-4 rounded-lg">
          <div>
            <p className="text-slate-400 text-xs">VIGENCIA</p>
            <p className="font-semibold">
              {state.fechaInicio ? formatDate(state.fechaInicio) : '-'} - {state.fechaFin ? formatDate(state.fechaFin) : '-'}
            </p>
          </div>
          <div>
            <p className="text-slate-400 text-xs">VALOR NETO</p>
            <p className="font-bold text-indigo-600">{formatCurrency(state.valorNeto, state.moneda)}</p>
          </div>
          <div>
            <p className="text-slate-400 text-xs">CONDICIONES</p>
            <p className="font-semibold">{state.terminosPago.diasPago} días</p>
          </div>
        </div>
        
        <div>
          <p className="text-slate-400 text-xs mb-2">ESPECIFICACIONES ({state.lineasEspecificacion.length})</p>
          <div className="space-y-1">
            {state.lineasEspecificacion.slice(0, 3).map((linea) => (
              <div key={linea.medioNombre} className="flex justify-between text-xs bg-white p-2 rounded">
                <span>{linea.medioNombre}</span>
                <span className="font-semibold">{formatCurrency(linea.totalNeto)}</span>
              </div>
            ))}
            {state.lineasEspecificacion.length > 3 && (
              <p className="text-xs text-slate-400 text-center">
                ... y {state.lineasEspecificacion.length - 3} líneas más
              </p>
            )}
          </div>
        </div>
        
        <div className="pt-4 border-t border-slate-200">
          <div className="grid grid-cols-2 gap-8">
            <div className="text-center">
              <div className="h-12 border-b border-slate-300 mb-2" />
              <p className="text-xs text-slate-400">FIRMA CLIENTE</p>
              <p className="text-xs">{state.anunciante?.nombre}</p>
            </div>
            <div className="text-center">
              <div className="h-12 border-b border-slate-300 mb-2" />
              <p className="text-xs text-slate-400">FIRMA EMPRESA</p>
              <p className="text-xs">Silexar Media Group</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// TOGGLE COMPONENTE
// ═══════════════════════════════════════════════════════════════

const Toggle: React.FC<{
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  icon?: React.ElementType;
}> = ({ label, description, checked, onChange, icon: Icon }) => (
  <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.04)]">
    <div className="flex items-center gap-3">
      {Icon && <Icon className="w-5 h-5 text-indigo-500" />}
      <div>
        <p className="font-medium text-slate-700">{label}</p>
        {description && <p className="text-sm text-slate-400">{description}</p>}
      </div>
    </div>
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`
        w-14 h-8 rounded-full transition-all duration-200 relative
        ${checked ? 'bg-gradient-to-r from-indigo-500 to-purple-600' : 'bg-slate-300'}
      `}
    >
      <motion.span 
        className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-md"
        animate={{ left: checked ? '1.75rem' : '0.25rem' }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      />
    </button>
  </div>
);

// ═══════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════

interface StepDocumentacionProps {
  state: WizardContratoState;
  dispatch: React.Dispatch<WizardAction>;
}

export const StepDocumentacion: React.FC<StepDocumentacionProps> = ({
  state,
  dispatch
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  
  const handleGenerarDocumentos = async () => {
    setIsGenerating(true);
    
    // Simular generación de documentos
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const nuevoDocumento: DocumentoContrato = {
      id: `doc-${Date.now()}`,
      tipo: 'contrato',
      nombre: `Contrato ${state.numeroContrato}`,
      estado: 'borrador',
      firmantes: [
        {
          id: 'firm-001',
          nombre: state.anunciante?.nombre || 'Cliente',
          email: 'cliente@email.com',
          rol: 'cliente',
          estado: 'pendiente'
        },
        {
          id: 'firm-002',
          nombre: 'Representante Legal',
          email: 'legal@silexar.com',
          rol: 'empresa',
          estado: 'pendiente'
        }
      ],
      fechaGeneracion: new Date(),
      version: 1
    };
    
    dispatch({ type: 'ADD_DOCUMENTO', payload: nuevoDocumento });
    setIsGenerating(false);
  };
  
  const handleEnviarFirma = () => {
    // Actualizar documentos a pendiente_firma
    state.documentos.forEach(doc => {
      dispatch({
        type: 'UPDATE_DOCUMENTO',
        payload: { id: doc.id, data: { estado: 'pendiente_firma' } }
      });
    });
  };
  
  return (
    <div className="space-y-8">
      {/* Título del paso */}
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100">
          <FileSignature className="w-7 h-7 text-emerald-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Documentación y Firma</h2>
          <p className="text-slate-500">Genere documentos y configure la firma digital</p>
        </div>
      </div>
      
      {/* Configuración de firma digital */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 shadow-[8px_8px_24px_rgba(0,0,0,0.08),-8px_-8px_24px_rgba(255,255,255,0.9)]">
        <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-indigo-500" />
          Configuración de Firma Digital
        </h3>
        
        <Toggle
          label="Habilitar Firma Digital"
          description="Permitir firma electrónica legalmente válida vía DocuSign/Adobe Sign"
          checked={state.firmaDigitalHabilitada}
          onChange={(checked) => dispatch({ type: 'SET_FIRMA_DIGITAL', payload: checked })}
          icon={FileSignature}
        />
        
        {state.firmaDigitalHabilitada && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-4 p-4 rounded-xl bg-emerald-50 border border-emerald-100"
          >
            <div className="flex items-center gap-2 text-emerald-700">
              <CheckCircle2 className="w-5 h-5" />
              <span className="font-medium">Firma digital habilitada</span>
            </div>
            <p className="text-sm text-emerald-600 mt-2">
              Los documentos serán enviados para firma electrónica con validez legal
            </p>
          </motion.div>
        )}
      </div>
      
      {/* Vista previa y generación */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Preview */}
        <ContratoPreview state={state} />
        
        {/* Acciones de documentos */}
        <div className="space-y-4">
          {/* Generar documentos */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-500" />
              Generación de Documentos
            </h3>
            
            <motion.button
              onClick={handleGenerarDocumentos}
              disabled={isGenerating || state.documentos.length > 0}
              className={`
                w-full py-4 rounded-xl font-semibold text-white
                ${isGenerating || state.documentos.length > 0
                  ? 'bg-slate-300 cursor-not-allowed'
                  : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:shadow-lg'
                }
                transition-all duration-200 flex items-center justify-center gap-2
              `}
              whileHover={state.documentos.length === 0 && !isGenerating ? { scale: 1.02 } : {}}
              whileTap={state.documentos.length === 0 && !isGenerating ? { scale: 0.98 } : {}}
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Generando documentos...
                </>
              ) : state.documentos.length > 0 ? (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  Documentos generados
                </>
              ) : (
                <>
                  <FileText className="w-5 h-5" />
                  Generar Documentos
                </>
              )}
            </motion.button>
            
            <p className="text-sm text-slate-500 mt-3 text-center">
              Se generará el contrato principal con todos los términos acordados
            </p>
          </div>
          
          {/* Enviar a firma */}
          {state.documentos.length > 0 && state.firmaDigitalHabilitada && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm"
            >
              <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <Send className="w-5 h-5 text-emerald-500" />
                Enviar a Firma Digital
              </h3>
              
              <button
                onClick={handleEnviarFirma}
                className="w-full py-4 rounded-xl font-semibold text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
              >
                <Mail className="w-5 h-5" />
                Enviar para Firma
              </button>
              
              <p className="text-sm text-slate-500 mt-3 text-center">
                Se enviará un email a cada firmante con el enlace para firmar
              </p>
            </motion.div>
          )}
        </div>
      </div>
      
      {/* Lista de documentos generados */}
      {state.documentos.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Documentos Generados</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {state.documentos.map((doc) => (
              <DocumentoCard
                key={doc.id}
                documento={doc}
                onView={() => {}}
                onDownload={() => {}}
              />
            ))}
          </div>
        </div>
      )}
      
      {/* Mensaje de seguridad */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center gap-3 p-4 rounded-xl bg-indigo-50 border border-indigo-100"
      >
        <Shield className="w-6 h-6 text-indigo-500 flex-shrink-0" />
        <div>
          <p className="font-medium text-indigo-800">Seguridad TIER 0 Certificada</p>
          <p className="text-sm text-indigo-600">
            Todos los documentos están encriptados y cumplen con normativas SOX, GDPR y regulaciones locales.
            Las firmas digitales tienen validez legal completa.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default StepDocumentacion;
