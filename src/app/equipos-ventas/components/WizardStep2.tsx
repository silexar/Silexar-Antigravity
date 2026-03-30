/**
 * WIZARD: CREAR EQUIPO - PASO 2 JERARQUIA Y LIDERAZGO
 * Seleccion de lider con ranking IA y estructura de reporting.
 */

'use client';

import React, { useState } from 'react';
import { Crown, Star, CheckCircle, ArrowLeft } from 'lucide-react';

const AI_CANDIDATES = [
  { id: 'c-1', name: 'Ana Garcia', score: 94, recommended: true, experience: '5 anos experience leading', revenue: '$847K team revenue last year', highlight: 'Top performer + people skills' },
  { id: 'c-2', name: 'Roberto Lopez', score: 87, recommended: false, experience: '3 anos management experience', revenue: '$634K team revenue', highlight: 'High performer, developing' },
  { id: 'c-3', name: 'Elena Torres', score: 79, recommended: false, experience: '2 anos as team lead', revenue: '$512K team revenue', highlight: 'Strong closer, coaching talent' },
];

export const WizardStep2 = ({ onBack, onFinish }: { onBack: () => void; onFinish: (data: { leaderId: string }) => void }) => {
  const [selectedLeader, setSelectedLeader] = useState('c-1');

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-6 text-white">
        <p className="text-xs uppercase tracking-widest text-slate-400">Paso 2 de 2</p>
        <h2 className="text-xl font-bold mt-1 flex items-center gap-2"><Crown size={20} className="text-amber-400" /> Estructura de Liderazgo</h2>
      </div>

      <div className="p-6 space-y-6">
        {/* AI-Ranked Candidates */}
        <div>
          <label className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
            <Star size={14} className="text-amber-500" /> Candidatos IA-Ranked
          </label>
          <div className="space-y-3 mt-3">
            {AI_CANDIDATES.map(c => (
              <label key={c.id} onClick={() => setSelectedLeader(c.id)} className={`block p-4 rounded-xl border cursor-pointer transition-all ${selectedLeader === c.id ? 'border-orange-500 bg-orange-50 ring-2 ring-orange-200' : 'border-slate-200 hover:border-slate-300'}`}>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <input type="radio" name="leader" value={c.id} checked={selectedLeader === c.id} onChange={() => setSelectedLeader(c.id)} className="accent-orange-500 mt-1" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800">{c.name}</span>
                        {c.recommended && <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold uppercase">Recommended</span>}
                      </div>
                      <div className="text-xs text-slate-500 space-y-0.5 mt-1">
                        <p>🎯 {c.experience}</p>
                        <p>💰 {c.revenue}</p>
                        <p>🏆 {c.highlight}</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-400">Score</p>
                    <p className={`text-2xl font-bold ${c.score >= 90 ? 'text-emerald-600' : c.score >= 80 ? 'text-blue-600' : 'text-amber-600'}`}>{c.score}</p>
                    <p className="text-[10px] text-slate-400">/100</p>
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Reporting Structure */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
          <h4 className="font-bold text-slate-700 mb-3">Reporting Structure</h4>
          <ul className="space-y-1.5 text-sm text-slate-600">
            <li>• Direct reports: <b>6-8 reps optimal</b></li>
            <li>• Skip level frequency: <b>Bi-weekly</b></li>
            <li>• Team meeting cadence: <b>Weekly</b></li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <button onClick={onBack} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors">
            <ArrowLeft size={18} /> Volver
          </button>
          <button onClick={() => onFinish({ leaderId: selectedLeader })} className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-emerald-200">
            <CheckCircle size={18} /> Confirmar y Crear Equipo
          </button>
        </div>
      </div>
    </div>
  );
};
