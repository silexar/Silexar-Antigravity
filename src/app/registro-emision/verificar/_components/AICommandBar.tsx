/**
 * 🧠 COMPONENT: AI Command Bar
 * 
 * Barra de comandos inteligente con procesamiento de lenguaje natural (NLP) simulado.
 * Permite a los operadores expertos ejecutar acciones complejas en segundos.
 * 
 * @tier TIER_0_EFFICIENCY
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { Command, Zap, Search, CornerDownLeft, Sparkles } from 'lucide-react';

interface AICommandBarProps {
  onExecute: (command: string) => void;
}

export function AICommandBar({ onExecute }: AICommandBarProps) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Keyboard Shortcut: Ctrl+K or Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Simple NLP Simulation
  useEffect(() => {
    if (!query) {
      setSuggestion(null);
      return;
    }
    
    const lower = query.toLowerCase();
    if (lower.startsWith('verificar c')) setSuggestion('erificar Campaña Coca-Cola Ayer');
    else if (lower.startsWith('buscar b')) setSuggestion('uscar Banco Chile Última Hora');
    else if (lower.startsWith('reporte')) setSuggestion('eporte Mensual PDF');
    else setSuggestion(null);

  }, [query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onExecute(query);
      setQuery('');
      inputRef.current?.blur();
    }
  };

  return (
    <div className={`
      relative transition-all duration-300 transform
      ${isFocused ? 'scale-105 z-50' : 'scale-100'}
    `}>
      <div className={`
        absolute -inset-1 rounded-2xl bg-gradient-to-r from-emerald-400 via-teal-500 to-blue-500 opacity-0 transition-opacity duration-300
        ${isFocused ? 'opacity-30 blur-md' : ''}
      `} />
      
      <form onSubmit={handleSubmit} className="relative bg-[#e0e5ec] rounded-2xl shadow-[inset_6px_6px_12px_#b8b9be,inset_-6px_-6px_12px_#ffffff] flex items-center p-1">
        
        <div className={`p-3 rounded-xl transition-colors ${isFocused ? 'text-emerald-500' : 'text-slate-400'}`}>
           {isFocused ? <Sparkles className="w-6 h-6 animate-pulse" /> : <Command className="w-6 h-6" />}
        </div>
        
        <div className="flex-1 relative">
            <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                aria-label="Pregunta a Silexar AI"
                placeholder="Pregunta a Silexar AI... (Ej: Verificar Coca-Cola)"
                className="w-full bg-transparent border-none outline-none text-slate-700 font-medium placeholder-slate-400 text-lg h-12"
            />
            {/* Ghost Text Suggestion */}
            {suggestion && isFocused && (
                <div className="absolute top-0 left-0 h-12 flex items-center pointer-events-none">
                    <span className="text-transparent">{query}</span>
                    <span className="text-slate-400/50">{suggestion}</span>
                </div>
            )}
        </div>

        <div className="flex items-center gap-2 pr-2">
            {!query && (
                <div className="hidden md:flex items-center gap-1 px-2 py-1 rounded bg-slate-200/50 border border-slate-300/50 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    <span>Ctrl</span><span>K</span>
                </div>
            )}
            {query && (
                <button type="submit" className="p-2 bg-emerald-500 text-white rounded-xl shadow-lg hover:bg-emerald-400 transition-colors animate-in zoom-in">
                    <CornerDownLeft className="w-5 h-5" />
                </button>
            )}
        </div>

      </form>
      
      {/* RESULT PREVIEW DROPDOWN (DEMO) */}
      {isFocused && query.length > 2 && (
          <div className="absolute top-full left-0 right-0 mt-4 bg-[#e0e5ec] rounded-2xl p-4 shadow-[9px_9px_16px_rgb(163,177,198),-9px_-9px_16px_rgba(255,255,255,0.5)] z-50 animate-in slide-in-from-top-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase mb-3 flex items-center gap-2">
                  <Zap className="w-3 h-3 text-amber-500" /> Interpretación AI
              </h4>
              <div className="flex items-center gap-3 p-3 bg-white/50 rounded-xl border border-white/60">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                      <Search className="w-5 h-5" />
                  </div>
                  <div>
                      <p className="font-bold text-slate-700 text-sm">Ejecutar Verificación Completa</p>
                      <p className="text-xs text-slate-500">
                          Cliente: <span className="font-bold text-slate-800">Coca-Cola</span> • 
                          Rango: <span className="font-bold text-slate-800">Ayer</span> • 
                          Modo: <span className="font-bold text-slate-800">Express</span>
                      </p>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
}
