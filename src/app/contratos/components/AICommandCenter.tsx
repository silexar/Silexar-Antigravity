'use client';

/**
 * AI Command Center TIER 0 — Keyboard-driven command palette for Contratos.
 *
 * Exports:
 *   AICommandCenter  — Full inline version (overlay + content, bound to ?K)
 *   AICommandTrigger — Floating FAB button that opens AICommandCenterModal
 *
 * Engine logic and types ? ./_engine.ts
 * Modal component        ? ./_AICommandCenterModal.tsx
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Command, Mic, MicOff, Keyboard, Zap, Sparkles, Brain, ArrowRight,
} from 'lucide-react';
import {
  IACommandEngine, neuro, getPriorityColor, getTipoIcon,
} from './_engine';
import type { ComandoIA, SugerenciaIA } from './_engine';
import { AICommandCenterModal } from './_AICommandCenterModal';

// --- AICommandCenter (inline, for embedding inside pages) --------

export function AICommandCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [comandos, setComandos] = useState<ComandoIA[]>([]);
  const [sugerencias, setSugerencias] = useState<SugerenciaIA[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [activeTab, setActiveTab] = useState<'comandos' | 'sugerencias'>('comandos');

  const inputRef = useRef<HTMLInputElement>(null);
  const engineRef = useRef(new IACommandEngine());

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      setSugerencias(engineRef.current.generarSugerencias());
    }
  }, [isOpen]);

  useEffect(() => {
    if (query.trim()) {
      setComandos(engineRef.current.procesarEntrada(query));
    } else {
      setComandos(engineRef.current.obtenerComandosRapidos());
    }
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const items = activeTab === 'comandos' ? comandos : sugerencias;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, items.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && comandos[selectedIndex]) {
      e.preventDefault();
      comandos[selectedIndex].accion();
      setIsOpen(false);
    }
  }, [comandos, sugerencias, selectedIndex, activeTab]);

  const toggleVoice = () => {
    setIsListening(prev => !prev);
    if (!isListening) {
      setTimeout(() => {
        setQuery('crear contrato para cliente nuevo');
        setIsListening(false);
      }, 2000);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={neuro.overlay}
        onClick={() => setIsOpen(false)}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className={`${neuro.modal} w-full max-w-2xl mx-auto mt-[15vh]`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-5 pb-3">
            <div className={`${neuro.input} flex items-center gap-3 px-5 py-4`}>
              {isListening ? (
                <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1 }}>
                  <Mic className="w-5 h-5 text-red-500" />
                </motion.div>
              ) : (
                <Command className="w-5 h-5 text-[#6888ff]" />
              )}
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={isListening ? 'Escuchando...' : 'Escribe un comando o pregunta a la IA...'}
                aria-label="Comando o pregunta para la IA"
                className="flex-1 bg-transparent text-lg text-[#69738c] placeholder:text-[#9aa3b8] focus:outline-none"
              />
              <button
                onClick={toggleVoice}
                aria-label={isListening ? 'Detener reconocimiento de voz' : 'Activar voz'}
                className={`p-2 rounded-xl transition-all ${isListening ? 'bg-red-100 text-red-600' : 'hover:bg-[#dfeaff] text-[#9aa3b8] hover:text-[#69738c]'}`}
              >
                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
              <div className="flex items-center gap-1 text-xs text-[#9aa3b8]">
                <Keyboard className="w-4 h-4" />
                <span>ESC</span>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="px-5 flex gap-2">
            {(['comandos', 'sugerencias'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-xl font-medium text-sm transition-all ${
                  activeTab === tab
                    ? 'bg-[#6888ff] text-white shadow-lg'
                    : 'text-[#9aa3b8] hover:text-[#69738c] hover:bg-[#dfeaff]'
                }`}
              >
                <div className="flex items-center gap-2">
                  {tab === 'comandos' ? <Zap className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                  {tab === 'comandos' ? 'Comandos' : 'Sugerencias IA'}
                  {tab === 'sugerencias' && sugerencias.filter(s => s.prioridad === 'alta').length > 0 && (
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="p-5 max-h-[50vh] overflow-y-auto">
            {activeTab === 'comandos' ? (
              <div className="space-y-2">
                {query === '' && (
                  <p className="text-xs text-[#9aa3b8] mb-3 flex items-center gap-2">
                    <Sparkles className="w-3 h-3" />
                    Acciones rápidas
                  </p>
                )}
                {comandos.map((cmd, idx) => (
                  <motion.button
                    key={cmd.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={() => { cmd.accion(); setIsOpen(false); }}
                    className={`w-full ${neuro.card} ${neuro.cardHover} p-4 flex items-center gap-4 ${idx === selectedIndex ? 'ring-2 ring-[#6888ff] ring-offset-2' : ''}`}
                  >
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${
                      cmd.tipo === 'creacion' ? 'from-green-400 to-emerald-500' :
                      cmd.tipo === 'navegacion' ? 'from-blue-400 to-cyan-500' :
                      cmd.tipo === 'accion' ? 'from-amber-400 to-orange-500' :
                      cmd.tipo === 'analisis' ? 'from-purple-400 to-pink-500' :
                      'bg-[#6888ff]'
                    } text-white`}>
                      {cmd.icono}
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-semibold text-[#69738c]">{cmd.texto}</p>
                      <p className="text-sm text-[#9aa3b8]">{cmd.descripcion}</p>
                    </div>
                    {cmd.atajo && <div className={`${neuro.badge} bg-[#dfeaff] text-[#69738c]`}>{cmd.atajo}</div>}
                    <ArrowRight className="w-4 h-4 text-[#9aa3b8]" />
                  </motion.button>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-[#9aa3b8] mb-3 flex items-center gap-2">
                  <Brain className="w-3 h-3" />
                  Sugerencias inteligentes basadas en tu contexto
                </p>
                {sugerencias.map((sug, idx) => (
                  <motion.div
                    key={sug.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className={`${neuro.card} p-4`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="mt-1">{getTipoIcon(sug.tipo)}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-[#69738c]">{sug.titulo}</h4>
                          <span className={`${neuro.badge} ${getPriorityColor(sug.prioridad)}`}>{sug.prioridad}</span>
                        </div>
                        <p className="text-sm text-[#69738c] mb-3">{sug.descripcion}</p>
                        {sug.accionSugerida && (
                          <button className={`${neuro.btnPrimary} px-4 py-2 text-sm flex items-center gap-2`}>
                            <Zap className="w-4 h-4" />
                            {sug.accionSugerida}
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-5 py-4 bg-[#dfeaff]/50 border-t border-[#bec8de30] flex items-center justify-between text-xs text-[#9aa3b8]">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1"><Keyboard className="w-3 h-3" /> ?? navegar</span>
              <span>? seleccionar</span>
              <span className="flex items-center gap-1"><Mic className="w-3 h-3" /> voz</span>
            </div>
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-[#6888ff]" />
              <span>Powered by Cortex-Flow AI</span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// --- AICommandTrigger (floating FAB) -----------------------------

export function AICommandTrigger() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        aria-label="Abrir Command Center (?K)"
        className={`
          fixed bottom-6 right-6 z-40
          p-4 rounded-2xl
          bg-[#6888ff]
          text-white
          shadow-[8px_8px_20px_rgba(99,102,241,0.4),-4px_-4px_12px_rgba(255,255,255,0.1)]
          hover:shadow-[4px_4px_12px_rgba(99,102,241,0.5),0_0_40px_rgba(99,102,241,0.3)]
          transition-all duration-300
          group
        `}
      >
        <div className="flex items-center gap-2">
          <Command className="w-6 h-6" />
          <span className="hidden group-hover:inline font-medium">?K</span>
        </div>
      </button>

      {isOpen && <AICommandCenterModal onClose={() => setIsOpen(false)} />}
    </>
  );
}

export default AICommandTrigger;
