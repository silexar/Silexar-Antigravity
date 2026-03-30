"use client";

import React, { useState } from 'react';
import DashboardConciliacionView from './_components/DashboardConciliacionView';
import WizardConciliacionView from './_components/WizardConciliacionView';

export default function ConciliacionPage() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'wizard'>('dashboard');

  return (
    <div className="space-y-6">
      {/* TABS DE NAVEGACIÓN */}
      <div className="flex space-x-2 bg-white/60 p-1.5 rounded-2xl w-fit border border-white/60 shadow-sm backdrop-blur-md">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
            activeTab === 'dashboard'
              ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md shadow-indigo-200 scale-105'
              : 'text-slate-500 hover:text-indigo-600 hover:bg-white/50'
          }`}
        >
          📊 Dashboard Principal
        </button>
        <button
          onClick={() => setActiveTab('wizard')}
          className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-2 ${
            activeTab === 'wizard'
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-200 scale-105'
              : 'text-slate-500 hover:text-blue-600 hover:bg-white/50'
          }`}
        >
          <span>🚀</span> Iniciar Conciliación
        </button>
      </div>

      {/* CONTENIDO PRINCIPAL */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        {activeTab === 'dashboard' ? (
          <DashboardConciliacionView onStartConciliacion={() => setActiveTab('wizard')} />
        ) : (
          <WizardConciliacionView onCancel={() => setActiveTab('dashboard')} />
        )}
      </div>
    </div>
  );
}
