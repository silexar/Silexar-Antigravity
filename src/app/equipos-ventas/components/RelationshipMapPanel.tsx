/**
 * COMPONENT: RELATIONSHIP MAP PANEL
 *
 * @description Visualización de stakeholders y red de influencia
 * con buying committee coverage, champion strength, y competitive threats.
 *
 * @version 2025.2.0
 * @tier TIER_0_FORTUNE_10
 */

'use client';

import React, { useState } from 'react';
import {
  Users, Crown, Gavel, DollarSign, UserX, User, ShieldAlert,
  TrendingUp, AlertTriangle, CheckCircle, XCircle, Minus as MinusIcon,
  Eye, ChevronDown, ChevronUp
} from 'lucide-react';

/* ─── MOCK DATA ────────────────────────────────────────────────────── */

const ACCOUNTS_DATA: Record<string, {
  nombre: string;
  stakeholders: Array<{
    id: string; nombre: string; cargo: string; departamento: string;
    tipo: string; influencia: number; sentimiento: string; ultimoContacto: string;
  }>;
  cobertura: number;
  championStrength: number;
  threats: Array<{ competidor: string; tipo: string; severidad: string }>;
  brechas: string[];
}> = {
  'banco-chile': {
    nombre: 'Banco Chile',
    stakeholders: [
      { id: '1', nombre: 'Juan Perez', cargo: 'CEO', departamento: 'Directorio', tipo: 'CHAMPION', influencia: 10, sentimiento: 'POSITIVO', ultimoContacto: '2 days ago' },
      { id: '2', nombre: 'Maria Lopez', cargo: 'CFO', departamento: 'Finanzas', tipo: 'INFLUENCER', influencia: 8, sentimiento: 'POSITIVO', ultimoContacto: '1 week ago' },
      { id: '3', nombre: 'Carlos Chen', cargo: 'CTO', departamento: 'Tecnologia', tipo: 'CHAMPION', influencia: 9, sentimiento: 'POSITIVO', ultimoContacto: '3 days ago' },
      { id: '4', nombre: 'Ana Silva', cargo: 'CMO', departamento: 'Marketing', tipo: 'END_USER', influencia: 5, sentimiento: 'NEUTRAL', ultimoContacto: '2 weeks ago' },
      { id: '5', nombre: 'Pedro Rojas', cargo: 'VP Ops', departamento: 'Operaciones', tipo: 'DECISION_MAKER', influencia: 7, sentimiento: 'POSITIVO', ultimoContacto: '5 days ago' },
      { id: '6', nombre: 'Laura Diaz', cargo: 'Legal', departamento: 'Legal', tipo: 'BLOCKER', influencia: 4, sentimiento: 'NEGATIVO', ultimoContacto: '1 month ago' },
    ],
    cobertura: 87,
    championStrength: 92,
    threats: [
      { competidor: 'Microsoft', tipo: 'DISPLACEMENT', severidad: 'MEDIUM' },
      { competidor: 'Oracle', tipo: 'PRICING', severidad: 'LOW' },
    ],
    brechas: ['Fortalecer relacion con CMO (neutral)', 'Abordar objecion equipo Legal'],
  },
  'falabella': {
    nombre: 'Falabella',
    stakeholders: [
      { id: '7', nombre: 'Roberto Vega', cargo: 'CMO', departamento: 'Marketing', tipo: 'CHAMPION', influencia: 8, sentimiento: 'POSITIVO', ultimoContacto: '1 week ago' },
      { id: '8', nombre: 'Sofia Torres', cargo: 'CTO', departamento: 'TI', tipo: 'DECISION_MAKER', influencia: 9, sentimiento: 'NEUTRAL', ultimoContacto: '3 weeks ago' },
      { id: '9', nombre: 'Diego Fuentes', cargo: 'Dir. E-commerce', departamento: 'Digital', tipo: 'END_USER', influencia: 6, sentimiento: 'POSITIVO', ultimoContacto: '4 days ago' },
    ],
    cobertura: 62,
    championStrength: 65,
    threats: [
      { competidor: 'AWS', tipo: 'NEW_ENTRY', severidad: 'HIGH' },
    ],
    brechas: ['No hay Economic Buyer mapeado', 'CTO sin contacto reciente (3 semanas)', 'Falta Champion en TI'],
  },
};

/* ─── HELPERS ─────────────────────────────────────────────────────── */

const TIPO_ICONS: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  CHAMPION: { icon: Crown, color: 'text-emerald-400', label: 'Champion' },
  DECISION_MAKER: { icon: Gavel, color: 'text-blue-400', label: 'Decision Maker' },
  ECONOMIC_BUYER: { icon: DollarSign, color: 'text-amber-400', label: 'Economic Buyer' },
  INFLUENCER: { icon: Users, color: 'text-violet-400', label: 'Influencer' },
  END_USER: { icon: User, color: 'text-[#888780]', label: 'End User' },
  BLOCKER: { icon: UserX, color: 'text-red-400', label: 'Blocker' },
};

const SENTIMIENTO_BADGE: Record<string, { icon: React.ElementType; color: string }> = {
  POSITIVO: { icon: CheckCircle, color: 'text-emerald-400' },
  NEUTRAL: { icon: MinusIcon, color: 'text-[#888780]' },
  NEGATIVO: { icon: XCircle, color: 'text-red-400' },
  DESCONOCIDO: { icon: Eye, color: 'text-slate-600' },
};

/* ─── COMPONENT ───────────────────────────────────────────────────── */

export function RelationshipMapPanel() {
  const [selectedAccountKey, setSelectedAccountKey] = useState<string>('banco-chile');
  const [expandedStakeholder, setExpandedStakeholder] = useState<string | null>(null);
  const accountKeys = Object.keys(ACCOUNTS_DATA);
  const acc = ACCOUNTS_DATA[selectedAccountKey];

  return (
    <div className="bg-[#E8E5E0]/40 rounded-xl border border-[#D4D1CC]/50 p-5">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm font-bold text-[#5F5E5A] uppercase tracking-wider flex items-center gap-2">
          <Users size={16} className="text-violet-400" /> Relationship Intelligence
        </h3>
        <div className="flex gap-1">
          {accountKeys.map(key => (
            <button
              key={key}
              onClick={() => setSelectedAccountKey(key)}
              className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-colors ${
                selectedAccountKey === key
                  ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                  : 'text-[#888780] hover:text-[#2C2C2A] hover:bg-[#D4D1CC]/50'
              }`}
            >
              {ACCOUNTS_DATA[key].nombre}
            </button>
          ))}
        </div>
      </div>

      {/* Coverage & Strength */}
      <div className="grid grid-cols-2 gap-4 mb-5">
        <div className="bg-[#F0EDE8]/50 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-[#888780] uppercase">Buying Committee Coverage</span>
            <span className="text-sm font-black text-[#2C2C2A]">{acc.cobertura}%</span>
          </div>
          <div className="w-full h-2 bg-[#D4D1CC] rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                acc.cobertura >= 80 ? 'bg-gradient-to-r from-emerald-500 to-teal-400' :
                acc.cobertura >= 50 ? 'bg-gradient-to-r from-amber-500 to-yellow-400' :
                'bg-gradient-to-r from-red-500 to-orange-400'
              }`}
              style={{ width: `${acc.cobertura}%` }}
            />
          </div>
        </div>
        <div className="bg-[#F0EDE8]/50 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-[#888780] uppercase">Champion Strength</span>
            <span className="text-sm font-black text-[#2C2C2A]">{acc.championStrength}%</span>
          </div>
          <div className="w-full h-2 bg-[#D4D1CC] rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                acc.championStrength >= 80 ? 'bg-gradient-to-r from-emerald-500 to-teal-400' :
                'bg-gradient-to-r from-amber-500 to-yellow-400'
              }`}
              style={{ width: `${acc.championStrength}%` }}
            />
          </div>
        </div>
      </div>

      {/* Stakeholder List */}
      <div className="space-y-2 mb-5">
        {acc.stakeholders.map(sh => {
          const tipoInfo = TIPO_ICONS[sh.tipo] || TIPO_ICONS.END_USER;
          const sentInfo = SENTIMIENTO_BADGE[sh.sentimiento] || SENTIMIENTO_BADGE.DESCONOCIDO;
          const TipoIcon = tipoInfo.icon;
          const SentIcon = sentInfo.icon;
          const isExpanded = expandedStakeholder === sh.id;

          return (
            <div key={sh.id} className="bg-[#F0EDE8]/40 rounded-lg border border-[#D4D1CC]/30">
              <button
                onClick={() => setExpandedStakeholder(isExpanded ? null : sh.id)}
                className="w-full p-3 flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg bg-[#E8E5E0] flex items-center justify-center ${tipoInfo.color}`}>
                    <TipoIcon size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#2C2C2A]">{sh.nombre}</p>
                    <p className="text-[10px] text-[#888780]">{sh.cargo} &middot; {sh.departamento}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] font-semibold ${tipoInfo.color}`}>{tipoInfo.label}</span>
                  <SentIcon size={14} className={sentInfo.color} />
                  <div className="flex gap-0.5">
                    {Array.from({ length: 10 }).map((_, i) => (
                      <div key={`${_}-${i}`} className={`w-1 h-3 rounded-full ${i < sh.influencia ? 'bg-violet-400' : 'bg-[#D4D1CC]'}`} />
                    ))}
                  </div>
                  {isExpanded ? <ChevronUp size={14} className="text-[#888780]" /> : <ChevronDown size={14} className="text-[#888780]" />}
                </div>
              </button>
              {isExpanded && (
                <div className="px-3 pb-3 border-t border-[#D4D1CC]/30 pt-2 grid grid-cols-3 gap-3 text-[10px] animate-in slide-in-from-top-1 duration-200">
                  <div>
                    <span className="text-[#888780]">Last Contact</span>
                    <p className="text-[#2C2C2A] font-medium mt-0.5">{sh.ultimoContacto}</p>
                  </div>
                  <div>
                    <span className="text-[#888780]">Influence</span>
                    <p className="text-[#2C2C2A] font-medium mt-0.5">{sh.influencia}/10</p>
                  </div>
                  <div>
                    <span className="text-[#888780]">Sentiment</span>
                    <p className={`font-medium mt-0.5 ${sentInfo.color}`}>{sh.sentimiento}</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Threats + Gaps */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Competitive Threats */}
        {acc.threats.length > 0 && (
          <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-3">
            <h4 className="text-[10px] font-bold text-red-400 uppercase mb-2 flex items-center gap-1">
              <ShieldAlert size={12} /> Competitive Threats
            </h4>
            <div className="space-y-1.5">
              {acc.threats.map((t, i) => (
                <div key={`${t}-${i}`} className="flex items-center justify-between text-xs">
                  <span className="text-[#5F5E5A]">{t.competidor}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-[#888780]">{t.tipo.replace('_', ' ')}</span>
                    <span className={`text-[10px] font-bold ${
                      t.severidad === 'HIGH' ? 'text-red-400' : t.severidad === 'MEDIUM' ? 'text-amber-400' : 'text-[#888780]'
                    }`}>{t.severidad}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {/* Gaps */}
        {acc.brechas.length > 0 && (
          <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-3">
            <h4 className="text-[10px] font-bold text-amber-400 uppercase mb-2 flex items-center gap-1">
              <AlertTriangle size={12} /> Gaps to Address
            </h4>
            <ul className="space-y-1">
              {acc.brechas.map((b, i) => (
                <li key={`${b}-${i}`} className="text-[10px] text-[#5F5E5A] flex items-start gap-1.5">
                  <TrendingUp size={10} className="text-amber-500 mt-0.5 flex-shrink-0" />
                  {b}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
