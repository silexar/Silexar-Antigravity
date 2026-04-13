/**
 * 📱 MOBILE: Relationship Map Compacto
 *
 * Stakeholders, buying committee, competitive threats — mobile-optimized.
 *
 * @tier TIER_0_ENTERPRISE
 * @platform MOBILE
 */

'use client';

import React, { useState } from 'react';
import {
  Users, Crown, Gavel, DollarSign, UserX, User,
  ShieldAlert, ChevronDown, ChevronUp, AlertTriangle
} from 'lucide-react';

const TIPO_CONFIG: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  CHAMPION: { icon: Crown, color: 'text-emerald-600 bg-emerald-50', label: 'Champion' },
  DECISION_MAKER: { icon: Gavel, color: 'text-blue-600 bg-blue-50', label: 'Decision Maker' },
  ECONOMIC_BUYER: { icon: DollarSign, color: 'text-amber-600 bg-amber-50', label: 'Econ. Buyer' },
  INFLUENCER: { icon: Users, color: 'text-violet-600 bg-violet-50', label: 'Influencer' },
  END_USER: { icon: User, color: 'text-slate-600 bg-slate-50', label: 'End User' },
  BLOCKER: { icon: UserX, color: 'text-red-600 bg-red-50', label: 'Blocker' },
};

const MOCK_STAKEHOLDERS = [
  { id: '1', nombre: 'Juan Perez', cargo: 'CEO', tipo: 'CHAMPION', influencia: 10, sentimiento: 'POSITIVO', lastContact: '2 días' },
  { id: '2', nombre: 'Maria Lopez', cargo: 'CFO', tipo: 'INFLUENCER', influencia: 8, sentimiento: 'POSITIVO', lastContact: '1 sem' },
  { id: '3', nombre: 'Carlos Chen', cargo: 'CTO', tipo: 'CHAMPION', influencia: 9, sentimiento: 'POSITIVO', lastContact: '3 días' },
  { id: '4', nombre: 'Ana Silva', cargo: 'CMO', tipo: 'END_USER', influencia: 5, sentimiento: 'NEUTRAL', lastContact: '2 sem' },
  { id: '5', nombre: 'Pedro Rojas', cargo: 'VP Ops', tipo: 'DECISION_MAKER', influencia: 7, sentimiento: 'POSITIVO', lastContact: '5 días' },
  { id: '6', nombre: 'Laura Diaz', cargo: 'Legal', tipo: 'BLOCKER', influencia: 4, sentimiento: 'NEGATIVO', lastContact: '1 mes' },
];

const MOCK_THREATS = [
  { competidor: 'Microsoft', tipo: 'Displacement', sev: 'MEDIUM' },
  { competidor: 'AWS', tipo: 'New Entry', sev: 'HIGH' },
];

const MOCK_GAPS = ['Fortalecer relación con CMO', 'Abordar objeción Legal', 'No hay Economic Buyer mapeado'];

const sentColor = (s: string) => s === 'POSITIVO' ? 'text-emerald-500' : s === 'NEGATIVO' ? 'text-red-500' : 'text-slate-400';

export function MobileRelationshipMap() {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Users className="w-5 h-5 text-violet-600" />
        <h3 className="font-bold text-lg text-slate-800">Relationship Map</h3>
      </div>

      {/* Coverage Bars */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-white rounded-xl p-3 border border-slate-100">
          <p className="text-[10px] text-slate-400 uppercase font-semibold mb-1">Buying Committee</p>
          <p className="text-xl font-bold text-slate-800">87%</p>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1">
            <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '87%' }} />
          </div>
        </div>
        <div className="bg-white rounded-xl p-3 border border-slate-100">
          <p className="text-[10px] text-slate-400 uppercase font-semibold mb-1">Champion Strength</p>
          <p className="text-xl font-bold text-slate-800">92%</p>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1">
            <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '92%' }} />
          </div>
        </div>
      </div>

      {/* Stakeholders */}
      <div className="bg-white rounded-2xl p-3 border border-slate-100">
        <h4 className="text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-1">
          <Users className="w-3 h-3 text-violet-500" /> Stakeholders
          <span className="ml-auto text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full">{MOCK_STAKEHOLDERS.length}</span>
        </h4>
        <div className="space-y-1.5">
          {MOCK_STAKEHOLDERS.map(sh => {
            const cfg = TIPO_CONFIG[sh.tipo] || TIPO_CONFIG.END_USER;
            const Icon = cfg.icon;
            const isExp = expanded === sh.id;
            return (
              <div key={sh.id}>
                <button
                  onClick={() => setExpanded(isExp ? null : sh.id)}
                  className="w-full flex items-center gap-2 p-2 rounded-xl active:bg-slate-50 transition-colors text-left"
                >
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${cfg.color}`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate">{sh.nombre}</p>
                    <p className="text-[10px] text-slate-400">{sh.cargo}</p>
                  </div>
                  <span className={`text-[9px] font-bold ${sentColor(sh.sentimiento)}`}>{sh.sentimiento.substring(0, 3)}</span>
                  <div className="flex gap-px">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={`${_}-${i}`} className={`w-1 h-2.5 rounded-full ${i < Math.ceil(sh.influencia / 2) ? 'bg-violet-400' : 'bg-slate-200'}`} />
                    ))}
                  </div>
                  {isExp ? <ChevronUp className="w-3 h-3 text-slate-400" /> : <ChevronDown className="w-3 h-3 text-slate-400" />}
                </button>
                {isExp && (
                  <div className="px-2 pb-2 grid grid-cols-3 gap-2 text-[10px] animate-in slide-in-from-top-1 duration-200">
                    <div className="bg-slate-50 rounded-lg p-2">
                      <span className="text-slate-400">Tipo</span>
                      <p className="text-slate-700 font-semibold mt-0.5">{cfg.label}</p>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-2">
                      <span className="text-slate-400">Influencia</span>
                      <p className="text-slate-700 font-semibold mt-0.5">{sh.influencia}/10</p>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-2">
                      <span className="text-slate-400">Last Contact</span>
                      <p className="text-slate-700 font-semibold mt-0.5">{sh.lastContact}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Threats */}
      {MOCK_THREATS.length > 0 && (
        <div className="bg-red-50 rounded-2xl p-3 border border-red-100">
          <h4 className="text-[10px] font-bold text-red-600 uppercase mb-2 flex items-center gap-1">
            <ShieldAlert className="w-3 h-3" /> Competitive Threats
          </h4>
          {MOCK_THREATS.map((t, i) => (
            <div key={`${t}-${i}`} className="flex items-center justify-between text-xs py-1">
              <span className="text-slate-700 font-medium">{t.competidor}</span>
              <span className={`text-[9px] font-bold ${t.sev === 'HIGH' ? 'text-red-600' : 'text-amber-600'}`}>{t.sev}</span>
            </div>
          ))}
        </div>
      )}

      {/* Gaps */}
      <div className="bg-amber-50 rounded-2xl p-3 border border-amber-100">
        <h4 className="text-[10px] font-bold text-amber-600 uppercase mb-2 flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" /> Gaps
        </h4>
        {MOCK_GAPS.map((g, i) => (
          <p key={`${g}-${i}`} className="text-[10px] text-slate-600 py-0.5">• {g}</p>
        ))}
      </div>
    </div>
  );
}
