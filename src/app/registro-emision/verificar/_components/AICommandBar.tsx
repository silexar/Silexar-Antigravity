/**
 * 🤖 COMPONENT: AICommandBar
 * 
 * Barra de comandos con IA que proporciona sugerencias inteligentes
 * basadas en el contexto del usuario y patrones de uso.
 * 
 * * @tier TIER_0_ENTERPRISE
 * @design NEUROMORPHIC
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Search,
  Mic,
  Zap,
  Clock,
  Radio,
  Calendar,
  TrendingUp,
  AlertCircle,
  ChevronRight,
  X
} from 'lucide-react';

interface AISuggestion {
  id: string;
  text: string;
  tipo: 'busqueda' | 'accion' | 'alerta' | 'sugerencia';
  icon?: React.ReactNode;
  accion?: () => void;
}

interface AICommandBarProps {
  onSearch?: (query: string) => void;
  onSuggestionClick?: (suggestion: AISuggestion) => void;
  onExecute?: (command: string) => void;
  contexto?: {
    cliente?: string;
    campanaActiva?: string;
    ultimoAcceso?: Date;
    verificacionesPendientes?: number;
  };
  placeholder?: string;
}

const SUGERENCIAS_DEFAULT: AISuggestion[] = [
  { id: '1', text: 'Verificar spots de ayer', tipo: 'busqueda', icon: <Clock className="w-4 h-4" /> },
  { id: '2', text: 'Buscar menciones de cliente prime', tipo: 'busqueda', icon: <Search className="w-4 h-4" /> },
  { id: '3', text: 'Auditar cumplimiento contratos hoy', tipo: 'accion', icon: <AlertCircle className="w-4 h-4" /> },
  { id: '4', text: 'Verificar presentaciones campaña activa', tipo: 'busqueda', icon: <Radio className="w-4 h-4" /> },
  { id: '5', text: 'Nueva verificación express', tipo: 'accion', icon: <Zap className="w-4 h-4" /> },
  { id: '6', text: 'Ver dashboard compliance', tipo: 'sugerencia', icon: <TrendingUp className="w-4 h-4" /> },
];

export function AICommandBar({
  onSearch,
  onSuggestionClick,
  onExecute,
  contexto,
  placeholder = '¿Qué verificación necesitas hoy?'
}: AICommandBarProps) {
  const [query, setQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<AISuggestion[]>(SUGERENCIAS_DEFAULT);
  const [isProcessing, setIsProcessing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Procesar query y generar sugerencias contextuales
  useEffect(() => {
    if (query.length > 2) {
      setIsProcessing(true);
      // Simular procesamiento IA
      const timer = setTimeout(() => {
        const queryLower = query.toLowerCase();
        let contextualSuggestions: AISuggestion[] = [];

        if (queryLower.includes('navidad') || queryLower.includes('super')) {
          contextualSuggestions.push({
            id: 'ctx-1',
            text: 'Verificar campaña SuperMax Navidad',
            tipo: 'busqueda',
            icon: <Sparkles className="w-4 h-4 text-yellow-500" />
          });
        }
        if (queryLower.includes('banco') || queryLower.includes('bank')) {
          contextualSuggestions.push({
            id: 'ctx-2',
            text: 'Verificar spots Banco Chile',
            tipo: 'busqueda',
            icon: <Sparkles className="w-4 h-4 text-green-500" />
          });
        }
        if (queryLower.includes('ayer')) {
          contextualSuggestions.push({
            id: 'ctx-3',
            text: `Verificar emisiones de ayer`,
            tipo: 'busqueda',
            icon: <Calendar className="w-4 h-4 text-blue-500" />
          });
        }
        if (queryLower.includes('prime') || queryLower.includes('horario')) {
          contextualSuggestions.push({
            id: 'ctx-4',
            text: 'Verificar bloque Prime Time',
            tipo: 'busqueda',
            icon: <Clock className="w-4 h-4 text-purple-500" />
          });
        }

        setSuggestions([...contextualSuggestions, ...SUGERENCIAS_DEFAULT]);
        setIsProcessing(false);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setSuggestions(SUGERENCIAS_DEFAULT);
    }
  }, [query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      if (onSearch) {
        onSearch(query.trim());
      }
      setQuery('');
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: AISuggestion) => {
    console.log('[AICommandBar] handleSuggestionClick called:', suggestion.text);
    // If there's a custom handler, use it
    if (onSuggestionClick) {
      onSuggestionClick(suggestion);
    }
    // Also execute the command via onExecute
    if (onExecute) {
      console.log('[AICommandBar] Calling onExecute with:', suggestion.text);
      onExecute(suggestion.text);
    }
    setQuery('');
    setShowSuggestions(false);
  };

  return (
    <div className="relative w-full">
      {/* Main Input */}
      <form onSubmit={handleSubmit} className="relative">
        <div className={`
          relative flex items-center gap-3 px-5 py-4 rounded-2xl
          bg-[#dfeaff] shadow-[8px_8px_16px_#bec8de,-8px_-8px_16px_#ffffff]
          transition-all duration-300
          ${showSuggestions ? 'rounded-b-none' : ''}
        `}>
          {/* AI Indicator */}
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-[#6888ff] to-[#5572ee] shadow-lg">
            <Sparkles className="w-5 h-5 text-white animate-pulse" />
          </div>

          {/* Input */}
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            placeholder={placeholder}
            className="flex-1 bg-transparent text-[#69738c] text-base font-medium outline-none placeholder:text-[#9aa3b8]"
          />

          {/* Mic Button (future voice) */}
          <button
            type="button"
            className="p-2 rounded-xl bg-[#dfeaff] shadow-[4px_4px_8px_#bec8de,-4px_-4px_8px_#ffffff] hover:shadow-[2px_2px_4px_#bec8de,-2px_-2px_4px_#ffffff] transition-all"
            title="Búsqueda por voz (próximamente)"
          >
            <Mic className="w-5 h-5 text-[#9aa3b8]" />
          </button>

          {/* Search Button */}
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-gradient-to-br from-[#6888ff] to-[#5572ee] text-white font-bold shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
          >
            <Search className="w-4 h-4" />
            <span>Buscar</span>
          </button>
        </div>
      </form>

      {/* Suggestions Dropdown */}
      {showSuggestions && (
        <div className={`
          absolute left-0 right-0 z-50
          bg-[#dfeaff] shadow-[8px_8px_16px_#bec8de,-8px_-8px_16px_#ffffff]
          rounded-b-2xl overflow-hidden
          border-t border-[#bec8de]/30
        `}>
          <div className="p-3 space-y-1">
            <p className="text-[10px] font-bold text-[#9aa3b8] uppercase tracking-widest px-2 mb-2">
              🤖 Sugerencias Cortex-Sense
            </p>

            {isProcessing && (
              <div className="flex items-center justify-center py-4">
                <div className="w-5 h-5 border-2 border-[#6888ff] border-t-transparent rounded-full animate-spin" />
                <span className="ml-2 text-sm text-[#9aa3b8]">Procesando...</span>
              </div>
            )}

            {!isProcessing && suggestions.map((suggestion) => (
              <button
                key={suggestion.id}
                onClick={() => handleSuggestionClick(suggestion)}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
                  text-left transition-all text-sm font-medium
                  hover:bg-white/60 active:bg-white/40
                  ${suggestion.tipo === 'accion' ? 'text-[#6888ff]' : 'text-[#69738c]'}
                  ${suggestion.tipo === 'alerta' ? 'text-amber-600' : ''}
                `}
              >
                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/50 shadow-sm">
                  {suggestion.icon}
                </span>
                <span className="flex-1">{suggestion.text}</span>
                <ChevronRight className="w-4 h-4 text-[#bec8de]" />
              </button>
            ))}

            {/* Quick Actions */}
            <div className="pt-3 mt-3 border-t border-[#bec8de]/30">
              <p className="text-[10px] font-bold text-[#9aa3b8] uppercase tracking-widest px-2 mb-2">
                ⚡ Acciones Rápidas
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    console.log('[AICommandBar] Quick Action: Nueva Verificación clicked');
                    if (onExecute) {
                      onExecute('Nueva Verificación');
                    }
                  }}
                  className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-[#6888ff] to-[#5572ee] text-white text-xs font-bold shadow-sm hover:shadow-md transition-all"
                >
                  <Zap className="w-3 h-3" />
                  Verificación Express
                </button>
                <button
                  onClick={() => handleSuggestionClick({ id: 'qa-2', text: 'Ver Pendientes', tipo: 'accion' })}
                  className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-amber-50 text-amber-600 text-xs font-bold shadow-sm hover:shadow-md transition-all"
                >
                  <AlertCircle className="w-3 h-3" />
                  Alertas Pendientes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Backdrop to close */}
      {showSuggestions && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowSuggestions(false)}
        />
      )}
    </div>
  );
}
