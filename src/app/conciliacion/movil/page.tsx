"use client";

import React from 'react';
import MobileConciliacionView from './_components/MobileConciliacionView';

export default function MobileConciliacionPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-20">
      {/* HEADER MOBILE */}
      <header className="bg-slate-900/90 backdrop-blur-md border-b border-white/10 sticky top-0 z-50 px-4 py-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-xl shadow-lg shadow-indigo-500/30">
            🔄
          </div>
          <div>
            <h1 className="text-lg font-bold text-white leading-tight">Conciliación</h1>
            <p className="text-xs text-emerald-400 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Operativo
            </p>
          </div>
        </div>
        <button className="w-10 h-10 rounded-full bg-slate-800 border border-white/5 flex items-center justify-center text-slate-300 relative">
          🔔
          <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 border-2 border-slate-900 rounded-full"></span>
        </button>
      </header>

      {/* CONTENIDO PRINCIPAL MOBILE TIER 0 PARITY */}
      <main className="flex-1 w-full p-4 animate-in fade-in duration-500">
        <MobileConciliacionView />
      </main>
    </div>
  );
}
