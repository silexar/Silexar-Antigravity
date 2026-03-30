/**
 * 🤖 SILEXAR PULSE - Panel Copilot TIER 0
 * 
 * @description Interfaz conversacional con el asistente IA
 * para creación y gestión de contratos.
 * 
 * @version 2025.4.0
 * @tier TIER_0_FORTUNE_10
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  Send,
  Sparkles,
  Bot,
  User,
  ArrowRight,
  X,
  Lightbulb,
  Maximize2,
  Minimize2,
  Trash2,
  Zap
} from 'lucide-react';
import { useCopilot } from '../services/CopilotService';
import { MensajeCopilot, SugerenciaCopilot } from '../types/enterprise.types';
import { WizardContratoState } from '../types/wizard.types';

// ═══════════════════════════════════════════════════════════════
// COMPONENTES
// ═══════════════════════════════════════════════════════════════

const MensajeChat: React.FC<{
  mensaje: MensajeCopilot;
  onAccion?: (accion: NonNullable<MensajeCopilot['acciones']>[0]) => void;
}> = ({ mensaje, onAccion }) => {
  const esUsuario = mensaje.rol === 'usuario';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 ${esUsuario ? 'flex-row-reverse' : ''}`}
    >
      {/* Avatar */}
      <div className={`
        flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center
        ${esUsuario 
          ? 'bg-indigo-500' 
          : 'bg-gradient-to-br from-purple-500 to-indigo-600'
        }
      `}>
        {esUsuario ? (
          <User className="w-4 h-4 text-white" />
        ) : (
          <Bot className="w-4 h-4 text-white" />
        )}
      </div>
      
      {/* Contenido */}
      <div className={`max-w-[80%] ${esUsuario ? 'text-right' : ''}`}>
        <div className={`
          px-4 py-3 rounded-2xl
          ${esUsuario
            ? 'bg-indigo-500 text-white rounded-tr-sm'
            : 'bg-slate-100 text-slate-800 rounded-tl-sm'
          }
        `}>
          <p className="text-sm whitespace-pre-wrap">{mensaje.contenido}</p>
        </div>
        
        {/* Acciones sugeridas */}
        {mensaje.acciones && mensaje.acciones.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {mensaje.acciones.map((accion, idx) => (
              <motion.button
                key={idx}
                onClick={() => onAccion?.(accion)}
                className="px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-600 text-xs font-medium hover:bg-indigo-100 transition-colors flex items-center gap-1"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {accion.titulo}
                <ArrowRight className="w-3 h-3" />
              </motion.button>
            ))}
          </div>
        )}
        
        {/* Timestamp */}
        <p className={`text-[10px] text-slate-400 mt-1 ${esUsuario ? 'text-right' : ''}`}>
          {mensaje.timestamp.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </motion.div>
  );
};

const SugerenciaChip: React.FC<{
  sugerencia: SugerenciaCopilot;
  onAplicar: () => void;
}> = ({ sugerencia, onAplicar }) => (
  <motion.button
    onClick={onAplicar}
    className="px-3 py-2 rounded-xl bg-amber-50 border border-amber-200 text-left hover:bg-amber-100 transition-colors"
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
  >
    <div className="flex items-start gap-2">
      <Lightbulb className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
      <div>
        <p className="text-sm font-medium text-amber-800">
          {typeof sugerencia.valor === 'object' 
            ? JSON.stringify(sugerencia.valor)
            : String(sugerencia.valor)
          }
        </p>
        <p className="text-xs text-amber-600 mt-0.5">{sugerencia.razonamiento}</p>
      </div>
    </div>
  </motion.button>
);

// ═══════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════

interface CopilotPanelProps {
  estadoWizard?: WizardContratoState;
  onClose?: () => void;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

export const CopilotPanel: React.FC<CopilotPanelProps> = ({
  estadoWizard,
  onClose,
  isExpanded = false,
  onToggleExpand
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mensajes, setMensajes] = useState<MensajeCopilot[]>([]);
  const chatRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const copilot = useCopilot(estadoWizard);
  const sugerencias = copilot.getSugerencias();
  
  // Auto-scroll al nuevo mensaje
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [mensajes]);
  
  // Mensaje inicial
  useEffect(() => {
    if (mensajes.length === 0) {
      const mensajeInicial: MensajeCopilot = {
        id: 'initial',
        rol: 'asistente',
        contenido: '¡Hola! Soy el Copilot de Contratos. Puedo ayudarte a:\n\n• Crear contratos de forma rápida\n• Sugerir términos comerciales\n• Analizar riesgo de clientes\n• Generar cláusulas personalizadas\n\n¿En qué puedo ayudarte hoy?',
        timestamp: new Date()
      };
      setMensajes([mensajeInicial]);
    }
  }, [mensajes.length]);
  
  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;
    
    const mensajeUsuario: MensajeCopilot = {
      id: crypto.randomUUID(),
      rol: 'usuario',
      contenido: inputValue,
      timestamp: new Date()
    };
    
    setMensajes(prev => [...prev, mensajeUsuario]);
    setInputValue('');
    setIsLoading(true);
    
    try {
      const respuesta = await copilot.procesarMensaje(inputValue);
      setMensajes(prev => [...prev, respuesta]);
    } catch (error) {
      /* console.error('Error procesando mensaje:', error) */;
      const mensajeError: MensajeCopilot = {
        id: crypto.randomUUID(),
        rol: 'asistente',
        contenido: 'Lo siento, hubo un error procesando tu solicitud. ¿Podrías intentarlo de nuevo?',
        timestamp: new Date()
      };
      setMensajes(prev => [...prev, mensajeError]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  
  const handleLimpiar = () => {
    copilot.limpiarHistorial();
    setMensajes([]);
  };
  
  const handleAccion = (accion: NonNullable<MensajeCopilot['acciones']>[0]) => {
    ;
    copilot.registrarAccion(accion.titulo);
    
    if (accion.url) {
      window.location.href = accion.url;
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className={`
        bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden
        flex flex-col
        ${isExpanded ? 'fixed inset-4 z-50' : 'w-96 h-[600px]'}
      `}
    >
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-white/20 backdrop-blur-sm">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Copilot</h3>
            <p className="text-xs text-white/70">Asistente IA de Contratos</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {onToggleExpand && (
            <button
              onClick={onToggleExpand}
              className="p-2 rounded-lg bg-white/20 text-white hover:bg-white/30 transition-colors"
            >
              {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          )}
          <button
            onClick={handleLimpiar}
            className="p-2 rounded-lg bg-white/20 text-white hover:bg-white/30 transition-colors"
            title="Limpiar conversación"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-white/20 text-white hover:bg-white/30 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
      
      {/* Sugerencias contextuales */}
      {sugerencias.length > 0 && (
        <div className="p-3 bg-amber-50 border-b border-amber-100">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-medium text-amber-700">Sugerencias IA</span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {sugerencias.slice(0, 3).map((sug, idx) => (
              <SugerenciaChip
                key={idx}
                sugerencia={sug}
                onAplicar={() => {
                  ;
                }}
              />
            ))}
          </div>
        </div>
      )}
      
      {/* Chat */}
      <div ref={chatRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {mensajes.map(mensaje => (
            <MensajeChat
              key={mensaje.id}
              mensaje={mensaje}
              onAccion={handleAccion}
            />
          ))}
        </AnimatePresence>
        
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-3"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="px-4 py-3 rounded-2xl bg-slate-100 rounded-tl-sm">
              <div className="flex items-center gap-1">
                <motion.div
                  className="w-2 h-2 rounded-full bg-indigo-400"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.6, repeat: Infinity }}
                />
                <motion.div
                  className="w-2 h-2 rounded-full bg-indigo-400"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                />
                <motion.div
                  className="w-2 h-2 rounded-full bg-indigo-400"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </div>
      
      {/* Input */}
      <div className="p-4 border-t border-slate-200 bg-slate-50">
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Escribe tu mensaje..."
              disabled={isLoading}
              className="
                w-full px-4 py-3 pr-12 rounded-xl
                bg-white border border-slate-200
                outline-none focus:ring-2 focus:ring-indigo-400/50 focus:border-indigo-400
                text-slate-700 placeholder-slate-400
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-all
              "
            />
            <button
              onClick={handleSend}
              disabled={!inputValue.trim() || isLoading}
              className={`
                absolute right-2 top-1/2 -translate-y-1/2
                p-2 rounded-lg transition-all
                ${inputValue.trim() && !isLoading
                  ? 'bg-indigo-500 text-white hover:bg-indigo-600'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }
              `}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {/* Quick actions */}
        <div className="flex flex-wrap gap-2 mt-3">
          {['Crear contrato', 'Analizar riesgo', 'Sugerir términos'].map(action => (
            <button
              key={action}
              onClick={() => setInputValue(action)}
              className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-600 hover:bg-slate-50 transition-colors"
            >
              {action}
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

// ═══════════════════════════════════════════════════════════════
// BOTÓN FLOTANTE
// ═══════════════════════════════════════════════════════════════

interface CopilotFABProps {
  onClick: () => void;
  hasUnread?: boolean;
}

export const CopilotFAB: React.FC<CopilotFABProps> = ({ onClick, hasUnread }) => (
  <motion.button
    onClick={onClick}
    className="
      fixed bottom-6 right-6 z-40
      w-14 h-14 rounded-full
      bg-gradient-to-br from-indigo-500 to-purple-600
      shadow-[0_8px_32px_rgba(99,102,241,0.4)]
      hover:shadow-[0_12px_40px_rgba(99,102,241,0.5)]
      flex items-center justify-center
      transition-all
    "
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.9 }}
  >
    <MessageSquare className="w-6 h-6 text-white" />
    
    {hasUnread && (
      <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 border-2 border-white" />
    )}
    
    {/* Efecto de brillo */}
    <motion.div
      className="absolute inset-0 rounded-full bg-white/20"
      animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
      transition={{ duration: 2, repeat: Infinity }}
    />
  </motion.button>
);

export default CopilotPanel;
