/**
 * WIZARD: CREAR EQUIPO - PASO 1 DEFINICION ESTRATEGICA
 * Seleccion de tipo, metodologia y recomendaciones IA.
 */

'use client';

import React, { useState } from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';

const TEAM_TYPES = [
  { id: 'inside', label: 'Inside Sales', desc: 'Phone + Digital', emoji: '\u{1F3AF}' },
  { id: 'field', label: 'Field Sales', desc: 'Face-to-face', emoji: '\u{1F680}' },
  { id: 'enterprise', label: 'Enterprise Accounts', desc: 'Strategic', emoji: '\u{1F3E2}' },
  { id: 'bdr', label: 'Business Development', desc: 'Lead Gen', emoji: '\u{1F4DE}' },
  { id: 'success', label: 'Customer Success', desc: 'Retention', emoji: '\u{1F504}' },
];

const METHODOLOGIES = [
  { id: 'spin', label: 'SPIN Selling' },
  { id: 'challenger', label: 'Challenger Sale' },
  { id: 'solution', label: 'Solution Selling' },
  { id: 'meddic', label: 'MEDDIC' },
  { id: 'custom', label: 'Custom Hybrid' },
];

const AI_RECOMMENDATIONS: Record<string, { size: string; ratio: string; ramp: string; comp: string; territory: string }> = {
  inside: { size: '10-12 reps', ratio: '1:10', ramp: '3 months', comp: '70/30 base/variable', territory: 'Account-based' },
  field: { size: '6-8 reps', ratio: '1:6', ramp: '6 months', comp: '60/40 base/variable', territory: 'Geographic' },
  enterprise: { size: '4-5 AEs', ratio: '1:4', ramp: '9 months', comp: '50/50 base/variable', territory: 'Named Accounts' },
  bdr: { size: '8-10 SDRs', ratio: '1:8', ramp: '2 months', comp: '80/20 base/variable', territory: 'Round Robin' },
  success: { size: '6-8 CSMs', ratio: '1:6', ramp: '4 months', comp: '75/25 base/variable', territory: 'Book of Business' },
};

export const WizardStep1 = ({ onNext }: { onNext: (data: { teamType: string; methodology: string }) => void }) => {
  const [teamType, setTeamType] = useState('field');
  const [methodology, setMethodology] = useState('spin');

  const recs = AI_RECOMMENDATIONS[teamType];

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-6 text-white">
        <p className="text-xs uppercase tracking-widest text-slate-400">Paso 1 de 2</p>
        <h2 className="text-xl font-bold mt-1 flex items-center gap-2">🎯 Configuración de Equipo Estratégica</h2>
      </div>

      <div className="p-6 space-y-6">
        {/* Team Type */}
        <div>
          <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Tipo de Equipo</label>
          <div className="grid grid-cols-1 gap-2 mt-3">
            {TEAM_TYPES.map(t => (
              <label key={t.id} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${teamType === t.id ? 'border-orange-500 bg-orange-50 ring-2 ring-orange-200' : 'border-slate-200 hover:border-slate-300'}`}>
                <input type="radio" name="teamType" value={t.id} checked={teamType === t.id} onChange={() => setTeamType(t.id)} className="accent-orange-500" />
                <span className="text-lg">{t.emoji}</span>
                <div>
                  <span className="font-semibold text-slate-800">{t.label}</span>
                  <span className="text-xs text-slate-500 ml-2">({t.desc})</span>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Methodology */}
        <div>
          <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Metodologia de Venta</label>
          <div className="grid grid-cols-1 gap-2 mt-3">
            {METHODOLOGIES.map(m => (
              <label key={m.id} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${methodology === m.id ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' : 'border-slate-200 hover:border-slate-300'}`}>
                <input type="radio" name="methodology" value={m.id} checked={methodology === m.id} onChange={() => setMethodology(m.id)} className="accent-blue-500" />
                <span className="font-semibold text-slate-800">{m.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* AI Recommendations */}
        <div className="bg-gradient-to-br from-violet-50 to-indigo-50 border border-indigo-200 rounded-xl p-5">
          <h4 className="font-bold text-indigo-800 flex items-center gap-2 mb-3">
            <Sparkles size={18} className="text-indigo-500" /> IA RECOMIENDA AUTOMATICAMENTE
          </h4>
          <p className="text-xs text-indigo-600 mb-3">Basado en tu industry y size:</p>
          <ul className="space-y-1.5 text-sm text-indigo-900">
            <li>• Team size optimo: <b>{recs.size}</b></li>
            <li>• Manager ratio: <b>{recs.ratio}</b></li>
            <li>• Quota ramp: <b>{recs.ramp}</b></li>
            <li>• Comp plan: <b>{recs.comp}</b></li>
            <li>• Territory model: <b>{recs.territory}</b></li>
          </ul>
        </div>

        <button onClick={() => onNext({ teamType, methodology })} className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-orange-200">
          Siguiente: Estructura Organizacional <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};
