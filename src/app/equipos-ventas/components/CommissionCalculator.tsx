/**
 * COMPONENT: COMMISSION CALCULATOR - TIER 0 NEUMORPHIC
 * 
 * @description Calculadora completa de comisiones con tiers, spiffs/bonuses,
 * quarterly summary, annual projection (OTE), y action buttons.
 * Diseno neumorfico oficial de Silexar Pulse.
 */

'use client';

import React, { useState } from 'react';
import { formatCurrency } from '@/lib/utils';
import {
  DollarSign, Target,
  BarChart3, Star,
  Calculator, Trophy,
  FileText, Send, LineChart, Sparkles, CheckCircle
} from 'lucide-react';

/* ─── MOCK DATA ───────────────────────────────────────────────── */

const REP_DATA = {
  name: 'Ana García',
  quarter: 'Q4 2024',
  quota: 600000,
  actual: 847000,
  attainment: 141,
  baseSalary: 80000,
  baseSalaryQuarterly: 20000,
};

const COMMISSION_TIERS = [
  { tier: 'Tier 1', range: '0-100% quota', amount: 600000, rate: 10, commission: 60000, color: 'bg-gradient-to-b from-blue-500 to-blue-600' },
  { tier: 'Tier 2', range: '100-150% quota', amount: 247000, rate: 15, commission: 37050, color: 'bg-gradient-to-b from-emerald-500 to-emerald-600' },
];

const TOTAL_COMMISSION = 97050;

const SPIFFS_BONUSES = [
  { label: 'New Customer Bonus', units: 6, perUnit: 2000, total: 12000, emoji: '🆕' },
  { label: 'Upsell Bonus', units: 3, perUnit: 1000, total: 3000, emoji: '📈' },
  { label: "President's Club Qualifier", units: null, perUnit: null, total: 5000, emoji: '🏆' },
];

const TOTAL_BONUSES = 20000;

const QUARTERLY_SUMMARY = {
  baseSalary: 20000,
  commission: TOTAL_COMMISSION,
  bonuses: TOTAL_BONUSES,
  total: 20000 + TOTAL_COMMISSION + TOTAL_BONUSES,
};

const ANNUAL_PROJECTION = {
  totalAnnual: 548200,
  oteAchievement: 274,
  rating: 'Exceptional',
};

/* ─── COMPONENT ───────────────────────────────────────────── */

export const CommissionCalculator = () => {
  const [, setStatementGenerated] = useState(false);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">

      {/* ──── HEADER NEUMORPHIC ──── */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(255,255,255,0.1),transparent_50%)]" />
        <div className="relative z-10">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <DollarSign size={18} className="text-emerald-200" />
                <span className="text-xs font-bold uppercase tracking-widest text-emerald-200">Commission Calculator</span>
                <span className="text-xs bg-white/20 text-white px-2 py-0.5 rounded-full">{REP_DATA.quarter}</span>
              </div>
              <h2 className="text-2xl font-bold mt-1">{REP_DATA.name}</h2>
            </div>
            <div className="bg-white/15 backdrop-blur-sm rounded-2xl px-4 py-2 text-center shadow-[4px_4px_8px_#d1d5db]">
              <p className="text-3xl font-bold">{REP_DATA.attainment}%</p>
              <p className="text-[10px] text-emerald-200 uppercase font-semibold">Attainment</p>
            </div>
          </div>
        </div>
      </div>

      {/* ──── BASE PERFORMANCE ──── NEUMORPHIC */}
      <div className="bg-[#EAF0F6] rounded-2xl p-6 shadow-[inset_4px_4px_8px_#d1d5db,inset_-4px_-4px_8px_#ffffff]">
        <h3 className="font-black text-slate-700 mb-4 flex items-center gap-2">
          <BarChart3 size={18} className="text-indigo-500" /> Base Performance
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-[#EAF0F6] rounded-xl p-4 shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]">
            <p className="text-xs text-slate-500 uppercase font-bold">Quota</p>
            <p className="text-xl font-black text-slate-800 mt-1">{formatCurrency(REP_DATA.quota)}</p>
          </div>
          <div className="bg-[#EAF0F6] rounded-xl p-4 shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]">
            <p className="text-xs text-slate-500 uppercase font-bold">Actual</p>
            <p className="text-xl font-black text-emerald-600 mt-1">{formatCurrency(REP_DATA.actual)}</p>
          </div>
          <div className="bg-[#EAF0F6] rounded-xl p-4 shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]">
            <p className="text-xs text-slate-500 uppercase font-bold">Base Salary</p>
            <p className="text-xl font-black text-slate-800 mt-1">{formatCurrency(REP_DATA.baseSalary)}</p>
            <p className="text-[10px] text-slate-400">(paid monthly)</p>
          </div>
        </div>
      </div>

      {/* ──── COMMISSION CALCULATION ──── NEUMORPHIC */}
      <div className="bg-[#EAF0F6] rounded-2xl p-6 shadow-[inset_4px_4px_8px_#d1d5db,inset_-4px_-4px_8px_#ffffff]">
        <h3 className="font-black text-slate-700 mb-4 flex items-center gap-2">
          <Calculator size={18} className="text-emerald-500" /> Commission Calculation
        </h3>
        <div className="bg-[#EAF0F6] rounded-2xl p-5 space-y-4 shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]">
          {COMMISSION_TIERS.map((tier) => (
            <div key={tier.tier} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-10 rounded-full ${tier.color} shadow-[2px_2px_4px_#d1d5db]`} />
                <div>
                  <p className="text-sm font-bold text-slate-700">{tier.tier} <span className="text-slate-400 font-normal">({tier.range})</span></p>
                  <p className="text-xs text-slate-500">{formatCurrency(tier.amount)} × {tier.rate}%</p>
                </div>
              </div>
              <p className="text-sm font-black text-slate-800">= {formatCurrency(tier.commission)}</p>
            </div>
          ))}
          <div className="border-t border-slate-300 pt-4 flex items-center justify-between">
            <p className="font-black text-slate-700">Total Commission Earned</p>
            <p className="text-xl font-black text-emerald-600">{formatCurrency(TOTAL_COMMISSION)}</p>
          </div>
        </div>
      </div>

      {/* ──── SPIFFS & BONUSES ──── NEUMORPHIC */}
      <div className="bg-[#EAF0F6] rounded-2xl p-6 shadow-[inset_4px_4px_8px_#d1d5db,inset_-4px_-4px_8px_#ffffff]">
        <h3 className="font-black text-slate-700 mb-4 flex items-center gap-2">
          <Trophy size={18} className="text-amber-500" /> Spiffs & Bonuses
          <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold ml-auto">
            <Sparkles size={10} className="inline mr-1" />
            Active
          </span>
        </h3>
        <div className="space-y-3">
          {SPIFFS_BONUSES.map((bonus) => (
            <div key={bonus.label} className="flex items-center justify-between p-4 bg-[#EAF0F6] rounded-xl shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{bonus.emoji}</span>
                <div>
                  <p className="text-sm font-bold text-slate-700">{bonus.label}</p>
                  {bonus.units && (
                    <p className="text-xs text-slate-500">{bonus.units} × {formatCurrency(bonus.perUnit!)}</p>
                  )}
                </div>
              </div>
              <p className="text-sm font-black text-amber-600">= {formatCurrency(bonus.total)}</p>
            </div>
          ))}
          <div className="border-t border-slate-300 pt-4 flex items-center justify-between">
            <p className="font-black text-slate-700">Total Bonuses</p>
            <p className="text-lg font-black text-amber-600">{formatCurrency(TOTAL_BONUSES)}</p>
          </div>
        </div>
      </div>

      {/* ──── QUARTERLY SUMMARY ──── NEUMORPHIC */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(16,185,129,0.1),transparent_60%)]" />
        <div className="relative z-10">
          <h3 className="font-black mb-4 flex items-center gap-2">
            <Target size={18} className="text-emerald-400" /> Quarterly Summary
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-white/10">
              <span className="text-slate-300 text-sm">Base Salary (3 months)</span>
              <span className="font-semibold">{formatCurrency(QUARTERLY_SUMMARY.baseSalary)}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-white/10">
              <span className="text-slate-300 text-sm">Commission</span>
              <span className="font-semibold text-emerald-400">{formatCurrency(QUARTERLY_SUMMARY.commission)}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-white/10">
              <span className="text-slate-300 text-sm">Bonuses</span>
              <span className="font-semibold text-amber-400">{formatCurrency(QUARTERLY_SUMMARY.bonuses)}</span>
            </div>
            <div className="flex justify-between items-center pt-3">
              <span className="font-black text-lg">Total Q4 Earnings</span>
              <span className="text-2xl font-black text-emerald-400">{formatCurrency(QUARTERLY_SUMMARY.total)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ──── ANNUAL PROJECTION ──── NEUMORPHIC */}
      <div className="bg-[#EAF0F6] rounded-2xl p-6 shadow-[inset_4px_4px_8px_#d1d5db,inset_-4px_-4px_8px_#ffffff]">
        <h3 className="font-black text-slate-700 mb-4 flex items-center gap-2">
          <LineChart size={18} className="text-purple-500" /> Annual Projection
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[#EAF0F6] rounded-2xl p-5 shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff] text-center">
            <p className="text-xs text-purple-500 uppercase font-bold">If Maintains Pace</p>
            <p className="text-3xl font-black text-purple-700 mt-2">{formatCurrency(ANNUAL_PROJECTION.totalAnnual)}</p>
            <p className="text-xs text-purple-500 mt-1">total annual earnings</p>
          </div>
          <div className="bg-[#EAF0F6] rounded-2xl p-5 shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff] text-center">
            <p className="text-xs text-emerald-500 uppercase font-bold">OTE Achievement</p>
            <p className="text-3xl font-black text-emerald-700 mt-2">{ANNUAL_PROJECTION.oteAchievement}%</p>
            <div className="flex items-center justify-center gap-1 mt-2">
              <Star size={14} className="text-amber-500" />
              <span className="text-sm font-bold text-amber-600">{ANNUAL_PROJECTION.rating}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ──── ACTION BUTTONS ──── NEUMORPHIC */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => setStatementGenerated(true)}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold transition-all duration-300
            bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg
            hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
        >
          <FileText size={16} />
          Generate Statement
        </button>
        <button
          className="flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold transition-all duration-300
            bg-[#EAF0F6] text-slate-700 shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]
            hover:shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]
            active:shadow-[inset_4px_4px_8px_#d1d5db,inset_-4px_-4px_8px_#ffffff]"
        >
          <Send size={16} />
          Send to Payroll
        </button>
        <button
          className="flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold transition-all duration-300
            bg-[#EAF0F6] text-slate-700 shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]
            hover:shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]
            active:shadow-[inset_4px_4px_8px_#d1d5db,inset_-4px_-4px_8px_#ffffff]"
        >
          <LineChart size={16} />
          Compare YoY
        </button>
      </div>
    </div>
  );
};
