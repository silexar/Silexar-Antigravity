'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Command, Mic, MicOff, Zap, Sparkles, Brain, ArrowRight } from 'lucide-react';
import { IACommandEngine, neuro, getPriorityColor, getTipoIcon } from './_engine';
import type { ComandoIA, SugerenciaIA } from './_engine';

interface AICommandCenterModalProps {
  onClose: () => void;
}

export function AICommandCenterModal({ onClose }: AICommandCenterModalProps) {
  const [query, setQuery] = useState('');
  const [comandos, setComandos] = useState<ComandoIA[]>([]);
  const [sugerencias, setSugerencias] = useState<SugerenciaIA[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [activeTab, setActiveTab] = useState<'comandos' | 'sugerencias'>('comandos');

  const inputRef = useRef<HTMLInputElement>(null);
  const engineRef = useRef(new IACommandEngine());

  useEffect(() => {
    inputRef.current?.focus();
    setSugerencias(engineRef.current.generarSugerencias());
    setComandos(engineRef.current.obtenerComandosRapidos());
  }, []);

  useEffect(() => {
    if (query.trim()) {
      setComandos(engineRef.current.procesarEntrada(query));
    } else {
      setComandos(engineRef.current.obtenerComandosRapidos());
    }
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, comandos.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && comandos[selectedIndex]) {
      e.preventDefault();
      comandos[selectedIndex].accion();
      onClose();
    }
  };

  const toggleVoice = () => {
    setIsListening(prev => !prev);
    if (!isListening) {
      setTimeout(() => {
        setQuery('crear contrato para cliente nuevo');
        setIsListening(false);
      }, 2000);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={neuro.overlay}
      onClick={onClose}
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
              aria-label={isListening ? 'Escuchando...' : 'Escribe un comando o pregunta a la IA'}
              placeholder={isListening ? 'Escuchando...' : 'Escribe un comando o pregunta a la IA...'}
              className="flex-1 bg-transparent text-lg text-[#69738c] placeholder:text-[#9aa3b8] focus:outline-none"
            />
            <button
              onClick={toggleVoice}
              aria-label={isListening ? 'Detener reconocimiento de voz' : 'Activar reconocimiento de voz'}
              className={`p-2 rounded-xl transition-all ${isListening ? 'bg-red-100 text-red-600' : 'hover:bg-[#dfeaff] text-[#9aa3b8]'}`}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
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
                  : 'text-[#9aa3b8] hover:bg-[#dfeaff]'
              }`}
            >
              <div className="flex items-center gap-2">
                {tab === 'comandos' ? <Zap className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                {tab === 'comandos' ? 'Comandos' : 'Sugerencias IA'}
              </div>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-5 max-h-[50vh] overflow-y-auto">
          {activeTab === 'comandos' ? (
            <div className="space-y-2">
              {comandos.map((cmd, idx) => (
                <motion.button
                  key={cmd.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => { cmd.accion(); onClose(); }}
                  className={`w-full ${neuro.card} ${neuro.cardHover} p-4 flex items-center gap-4 ${idx === selectedIndex ? 'ring-2 ring-[#6888ff] ring-offset-2' : ''}`}
                >
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${
                    cmd.tipo === 'creacion' ? 'from-green-400 to-emerald-500' :
                    cmd.tipo === 'navegacion' ? 'from-blue-400 to-cyan-500' :
                    cmd.tipo === 'accion' ? 'from-amber-400 to-orange-500' :
                    'from-purple-400 to-pink-500'
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
            <span>?? navegar</span>
            <span>? seleccionar</span>
            <span>ESC cerrar</span>
          </div>
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-[#6888ff]" />
            <span>Cortex-Flow AI</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
