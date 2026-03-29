/**
 * COMPONENT: COMISIONES WIDGET — Enhanced Premium
 * 
 * @description Widget mejorado de comisiones con tier progress visual,
 * projected earnings, next milestone, y trend indicator.
 */

import React from 'react';
import { DollarSign, TrendingUp, Target, Star, ArrowUpRight } from 'lucide-react';

interface Props {
  current: number;
  potential: number;
}

export const ComisionesWidget = ({ current, potential }: Props) => {
  const pct = Math.min(Math.round((current / potential) * 100), 100);
  const nextMilestone = Math.ceil(potential / 1000) * 1000;

  return (
    <div className="bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-700 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.1),transparent_50%)]" />
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="font-bold text-sm flex items-center gap-2">
              <DollarSign size={16} className="text-emerald-200" /> Mis Comisiones
            </h3>
            <p className="text-[10px] text-emerald-200 uppercase tracking-wider mt-0.5">Este Trimestre</p>
          </div>
          <div className="flex items-center gap-1 bg-white/15 rounded-full px-2 py-0.5">
            <TrendingUp size={10} />
            <span className="text-[10px] font-bold">+12%</span>
          </div>
        </div>
        
        {/* Main Value */}
        <p className="text-3xl font-bold">${current.toLocaleString()}</p>
        <p className="text-xs text-emerald-200 mt-0.5">de ${potential.toLocaleString()} potencial</p>
        
        {/* Progress Bar */}
        <div className="mt-3 mb-2">
          <div className="w-full bg-white/20 rounded-full h-2">
            <div className="bg-white h-2 rounded-full transition-all duration-1000" style={{ width: `${pct}%` }} />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[10px] text-emerald-200">{pct}% earned</span>
            <span className="text-[10px] text-emerald-200">${(potential - current).toLocaleString()} remaining</span>
          </div>
        </div>

        {/* Tier Progress */}
        <div className="mt-3 grid grid-cols-3 gap-2">
          <div className="bg-white/10 rounded-lg p-2 text-center border border-white/10">
            <p className="text-[9px] text-emerald-200 uppercase">Tier 1</p>
            <p className="text-xs font-bold">10%</p>
            <Star size={8} className="text-amber-300 mx-auto mt-0.5" />
          </div>
          <div className="bg-white/10 rounded-lg p-2 text-center border border-white/10">
            <p className="text-[9px] text-emerald-200 uppercase">Tier 2</p>
            <p className="text-xs font-bold">15%</p>
            <div className="w-6 bg-white/20 rounded-full h-0.5 mx-auto mt-1">
              <div className="bg-amber-300 h-0.5 rounded-full" style={{ width: '40%' }} />
            </div>
          </div>
          <div className="bg-white/15 rounded-lg p-2 text-center border border-white/20">
            <p className="text-[9px] text-emerald-200 uppercase">Accelerator</p>
            <p className="text-xs font-bold">20%</p>
            <p className="text-[8px] text-emerald-300">$12K away</p>
          </div>
        </div>

        {/* Next Milestone */}
        <div className="mt-3 bg-white/10 rounded-lg px-3 py-2 flex items-center gap-2 border border-white/10">
          <Target size={12} className="text-amber-300" />
          <p className="text-[10px]">Next milestone: <span className="font-bold">${nextMilestone.toLocaleString()}</span></p>
          <ArrowUpRight size={10} className="ml-auto text-emerald-200" />
        </div>
      </div>
    </div>
  );
};
