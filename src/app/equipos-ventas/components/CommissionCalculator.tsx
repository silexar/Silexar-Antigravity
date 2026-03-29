/**
 * COMPONENT: COMMISSION CALCULATOR — Enterprise Advanced
 * 
 * @description Calculadora completa de comisiones con tiers, spiffs/bonuses,
 * quarterly summary, annual projection (OTE), y action buttons.
 */

'use client';

import React, { useState } from 'react';
import {
  DollarSign, Target,
  BarChart3, Star,
  Calculator, Trophy,
  FileText, Send, LineChart
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
  { tier: 'Tier 1', range: '0-100% quota', amount: 600000, rate: 10, commission: 60000, color: 'bg-blue-500' },
  { tier: 'Tier 2', range: '100-150% quota', amount: 247000, rate: 15, commission: 37050, color: 'bg-emerald-500' },
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
  
  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">

      {/* ──── HEADER ──── */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
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
            <div className="bg-white/15 backdrop-blur-sm rounded-xl px-4 py-2 text-center">
              <p className="text-3xl font-bold">{REP_DATA.attainment}%</p>
              <p className="text-[10px] text-emerald-200 uppercase font-semibold">Attainment</p>
            </div>
          </div>
        </div>
      </div>

      {/* ──── BASE PERFORMANCE ──── */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
          <BarChart3 size={18} className="text-blue-500" /> Base Performance
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-slate-50 rounded-xl p-4">
            <p className="text-xs text-slate-400 uppercase font-semibold">Quota</p>
            <p className="text-xl font-bold text-slate-800">{formatCurrency(REP_DATA.quota)}</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-4">
            <p className="text-xs text-slate-400 uppercase font-semibold">Actual</p>
            <p className="text-xl font-bold text-emerald-600">{formatCurrency(REP_DATA.actual)}</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-4">
            <p className="text-xs text-slate-400 uppercase font-semibold">Base Salary</p>
            <p className="text-xl font-bold text-slate-800">{formatCurrency(REP_DATA.baseSalary)}</p>
            <p className="text-xs text-slate-400">(paid monthly)</p>
          </div>
        </div>
      </div>

      {/* ──── COMMISSION CALCULATION ──── */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Calculator size={18} className="text-emerald-500" /> Commission Calculation
        </h3>
        <div className="bg-slate-50 rounded-xl p-5 space-y-3 border border-slate-100">
          {COMMISSION_TIERS.map((tier) => (
            <div key={tier.tier} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-8 rounded-full ${tier.color}`} />
                <div>
                  <p className="text-sm font-semibold text-slate-800">{tier.tier} <span className="text-slate-400 font-normal">({tier.range})</span></p>
                  <p className="text-xs text-slate-400">{formatCurrency(tier.amount)} × {tier.rate}%</p>
                </div>
              </div>
              <p className="text-sm font-bold text-slate-800">= {formatCurrency(tier.commission)}</p>
            </div>
          ))}
          <div className="border-t border-slate-200 pt-3 flex items-center justify-between">
            <p className="font-bold text-slate-800">Total Commission Earned</p>
            <p className="text-xl font-bold text-emerald-600">{formatCurrency(TOTAL_COMMISSION)}</p>
          </div>
        </div>
      </div>

      {/* ──── SPIFFS & BONUSES ──── */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Trophy size={18} className="text-amber-500" /> Spiffs & Bonuses
        </h3>
        <div className="space-y-3">
          {SPIFFS_BONUSES.map((bonus) => (
            <div key={bonus.label} className="flex items-center justify-between p-3 bg-amber-50/50 rounded-xl border border-amber-100">
              <div className="flex items-center gap-3">
                <span className="text-lg">{bonus.emoji}</span>
                <div>
                  <p className="text-sm font-semibold text-slate-800">{bonus.label}</p>
                  {bonus.units && (
                    <p className="text-xs text-slate-400">{bonus.units} × {formatCurrency(bonus.perUnit!)}</p>
                  )}
                </div>
              </div>
              <p className="text-sm font-bold text-amber-700">= {formatCurrency(bonus.total)}</p>
            </div>
          ))}
          <div className="border-t border-slate-200 pt-3 flex items-center justify-between">
            <p className="font-bold text-slate-800">Total Bonuses</p>
            <p className="text-lg font-bold text-amber-600">{formatCurrency(TOTAL_BONUSES)}</p>
          </div>
        </div>
      </div>

      {/* ──── QUARTERLY SUMMARY ──── */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(16,185,129,0.1),transparent_60%)]" />
        <div className="relative z-10">
          <h3 className="font-bold mb-4 flex items-center gap-2">
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
              <span className="font-bold text-lg">Total Q4 Earnings</span>
              <span className="text-2xl font-bold text-emerald-400">{formatCurrency(QUARTERLY_SUMMARY.total)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ──── ANNUAL PROJECTION ──── */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
          <LineChart size={18} className="text-purple-500" /> Annual Projection
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-purple-50 rounded-xl p-5 border border-purple-100 text-center">
            <p className="text-xs text-purple-500 uppercase font-semibold">If Maintains Pace</p>
            <p className="text-3xl font-bold text-purple-700 mt-2">{formatCurrency(ANNUAL_PROJECTION.totalAnnual)}</p>
            <p className="text-xs text-purple-500 mt-1">total annual earnings</p>
          </div>
          <div className="bg-emerald-50 rounded-xl p-5 border border-emerald-100 text-center">
            <p className="text-xs text-emerald-500 uppercase font-semibold">OTE Achievement</p>
            <p className="text-3xl font-bold text-emerald-700 mt-2">{ANNUAL_PROJECTION.oteAchievement}%</p>
            <div className="flex items-center justify-center gap-1 mt-1">
              <Star size={12} className="text-amber-500" />
              <span className="text-xs font-bold text-amber-600">{ANNUAL_PROJECTION.rating}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ──── ACTION BUTTONS ──── */}
      <div className="flex flex-wrap gap-3">
        {[
          { label: 'Generate Statement', icon: FileText, primary: true, action: () => setStatementGenerated(true) },
          { label: 'Send to Payroll', icon: Send, primary: false },
          { label: 'Compare YoY', icon: LineChart, primary: false },
        ].map((btn) => (
          <button
            key={btn.label}
            onClick={btn.action || undefined}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all border ${
              btn.primary
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-emerald-600 shadow-lg shadow-emerald-600/20 hover:shadow-emerald-600/30'
                : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-300 hover:shadow-sm'
            }`}
          >
            <btn.icon size={16} />
            {btn.label}
          </button>
        ))}
      </div>
    </div>
  );
};
