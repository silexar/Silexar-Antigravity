import React from 'react';
import { Metadata } from 'next';

// eslint-disable-next-line react-refresh/only-export-components
export const metadata: Metadata = {
  title: 'Módulo Conciliación | Silexar Pulse',
  description: 'Centro de Comando para conciliación de emisión radial',
};

export default function ConciliacionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-slate-50 text-slate-900 flex flex-col font-sans selection:bg-indigo-200">
      {/* Header global del módulo */}
      <header className="bg-white/60 backdrop-blur-xl border-b border-white/60 shadow-sm sticky top-0 z-50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 to-blue-600 flex items-center gap-2 drop-shadow-sm">
              <span className="text-2xl">🔄</span> Centro de Comando Conciliación
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-1">Dashboard &gt; Operaciones &gt; Conciliación</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="px-3 py-1 rounded-full bg-white/80 text-indigo-800 text-sm border border-indigo-100 shadow-sm font-semibold flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Operativo
            </span>
          </div>
        </div>
      </header>

      {/* Área principal */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-full">
        {children}
      </main>
    </div>
  );
}
