/**
 * COMPONENT: ADVANCED SEARCH (CONVERSATIONAL AI)
 */

import React from 'react';
import { Search, Mic, Sparkles } from 'lucide-react';

export const AdvancedSearch = () => {
  return (
    <div className="relative group">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
      </div>
      
      <input
        type="text"
        aria-label="Búsqueda Cortex"
        className="block w-full pl-12 pr-20 py-4 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none shadow-sm text-lg transition-all"
        placeholder="🔍 Pregunta a Cortex: 'equipos enterprise', 'reps bajo quota', 'territories disponibles'..."
      />
      
      <div className="absolute inset-y-0 right-0 flex items-center pr-3 gap-2">
        <button className="p-2 text-slate-400 hover:text-orange-500 transition-colors rounded-lg hover:bg-orange-50" title="Búsqueda por voz">
          <Mic size={20} />
        </button>
        <div className="h-6 w-px bg-slate-200 mx-1"></div>
        <button className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:shadow-lg hover:shadow-indigo-500/30 transition-all">
          <Sparkles size={16} />
          <span>Predicciones</span>
        </button>
      </div>
    </div>
  );
};
