/**
 * 🚨 SILEXAR PULSE - Componente AlertaValidacionCampana TIER 0
 * 
 * @description Componente de UI para mostrar alertas de validación
 * de planificación y restricciones de modificación.
 * 
 * @version 2025.4.0
 * @tier TIER_0_FORTUNE_10
 */

'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertTriangle, 
  Lock, 
  Info, 
  CheckCircle2, 
  X, 
  Radio, 
  FileText,
  Phone,
  MessageCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AlertaCampana } from './hooks/useControlCampana';

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

interface AlertaValidacionCampanaProps {
  alertas: AlertaCampana[];
  emisorasFaltantes?: string[];
  contratoId?: string;
  onDismiss?: (index: number) => void;
  onContactar?: () => void;
  onVerContrato?: () => void;
}

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════

const getIcono = (tipo: AlertaCampana['tipo']) => {
  const iconos = {
    error: <Lock className="w-5 h-5" />,
    warning: <AlertTriangle className="w-5 h-5" />,
    info: <Info className="w-5 h-5" />,
    success: <CheckCircle2 className="w-5 h-5" />
  };
  return iconos[tipo];
};

const getColores = (tipo: AlertaCampana['tipo']) => {
  const colores = {
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-800',
      icon: 'text-red-500',
      button: 'bg-red-100 hover:bg-red-200 text-red-700'
    },
    warning: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      text: 'text-amber-800',
      icon: 'text-amber-500',
      button: 'bg-amber-100 hover:bg-amber-200 text-amber-700'
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-800',
      icon: 'text-blue-500',
      button: 'bg-blue-100 hover:bg-blue-200 text-blue-700'
    },
    success: {
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      text: 'text-emerald-800',
      icon: 'text-emerald-500',
      button: 'bg-emerald-100 hover:bg-emerald-200 text-emerald-700'
    }
  };
  return colores[tipo];
};

// ═══════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════

export const AlertaValidacionCampana: React.FC<AlertaValidacionCampanaProps> = ({
  alertas,
  emisorasFaltantes = [],
  onDismiss,
  onContactar,
  onVerContrato
}) => {
  const [expandido, setExpandido] = useState(true);
  
  if (alertas.length === 0) return null;
  
  const tieneErrores = alertas.some(a => a.tipo === 'error');
  const coloresPrincipales = getColores(tieneErrores ? 'error' : 'warning');
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6"
    >
      <Card className={`${coloresPrincipales.bg} ${coloresPrincipales.border} border-2 overflow-hidden`}>
        {/* Header */}
        <div 
          className={`p-4 cursor-pointer flex items-center justify-between ${coloresPrincipales.text}`}
          onClick={() => setExpandido(!expandido)}
        >
          <div className="flex items-center gap-3">
            <div className={coloresPrincipales.icon}>
              {tieneErrores ? <Lock className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
            </div>
            <div>
              <h3 className="font-bold text-lg">
                {tieneErrores ? '🚫 No se puede planificar' : '⚠️ Atención requerida'}
              </h3>
              <p className="text-sm opacity-80">
                {alertas.length} {alertas.length === 1 ? 'problema detectado' : 'problemas detectados'}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className={coloresPrincipales.text}>
            {expandido ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </Button>
        </div>
        
        {/* Contenido expandible */}
        <AnimatePresence>
          {expandido && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: 'auto' }}
              exit={{ height: 0 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 space-y-4">
                {/* Lista de alertas */}
                <div className="space-y-2">
                  {alertas.map((alerta, idx) => {
                    const colores = getColores(alerta.tipo);
                    return (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className={`p-3 rounded-lg ${colores.bg} ${colores.border} border flex items-start gap-3`}
                      >
                        <div className={colores.icon}>
                          {getIcono(alerta.tipo)}
                        </div>
                        <div className="flex-1">
                          <p className={`font-semibold ${colores.text}`}>{alerta.titulo}</p>
                          <p className={`text-sm ${colores.text} opacity-80`}>{alerta.mensaje}</p>
                          {alerta.accion && (
                            <p className={`text-xs mt-1 ${colores.text} font-medium`}>
                              💡 {alerta.accion}
                            </p>
                          )}
                        </div>
                        {onDismiss && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDismiss(idx);
                            }}
                            className={`${colores.text} opacity-50 hover:opacity-100`}
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
                
                {/* Emisoras sin especificación */}
                {emisorasFaltantes.length > 0 && (
                  <div className="p-3 bg-white rounded-lg border border-gray-200">
                    <h4 className="font-semibold text-gray-800 flex items-center gap-2 mb-2">
                      <Radio className="w-4 h-4 text-gray-500" />
                      Emisoras sin especificación en contrato:
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {emisorasFaltantes.map((emisora, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-red-100 text-red-700 text-sm rounded-full"
                        >
                          📻 {emisora}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Acciones */}
                <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-200">
                  {onVerContrato && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onVerContrato}
                      className="gap-2"
                    >
                      <FileText className="w-4 h-4" />
                      Ver Contrato
                    </Button>
                  )}
                  {onContactar && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onContactar}
                      className="gap-2"
                    >
                      <Phone className="w-4 h-4" />
                      Contactar Jefatura
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2 text-gray-600"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Solicitar Excepción
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
};

// ═══════════════════════════════════════════════════════════════
// COMPONENTE DE BLOQUEO POR FACTURACIÓN
// ═══════════════════════════════════════════════════════════════

interface BloqueoFacturacionProps {
  facturaId?: string;
  fechaFacturacion?: Date;
  onSolicitarDesbloqueo: () => void;
}

export const BloqueoFacturacion: React.FC<BloqueoFacturacionProps> = ({
  facturaId,
  fechaFacturacion,
  onSolicitarDesbloqueo
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="mb-6"
    >
      <Card className="bg-red-50 border-2 border-red-300 p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
            <Lock className="w-6 h-6 text-red-600" />
          </div>
          
          <div className="flex-1">
            <h3 className="text-lg font-bold text-red-800 mb-1">
              🔒 Campaña Facturada - Bloqueada para Edición
            </h3>
            <p className="text-red-700 mb-3">
              Esta campaña ya fue facturada y no puede ser modificada sin autorización.
            </p>
            
            <div className="bg-white rounded-lg p-3 border border-red-200 mb-4">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-500">Factura:</span>
                  <span className="ml-2 font-medium text-gray-800">{facturaId || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-500">Fecha:</span>
                  <span className="ml-2 font-medium text-gray-800">
                    {fechaFacturacion?.toLocaleDateString('es-CL') || 'N/A'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                onClick={onSolicitarDesbloqueo}
                className="bg-red-600 hover:bg-red-700 text-white gap-2"
              >
                <Phone className="w-4 h-4" />
                Contactar Facturación
              </Button>
              <span className="text-xs text-red-600">
                Solo Supervisor de Facturación o Jefatura pueden desbloquear
              </span>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default AlertaValidacionCampana;
