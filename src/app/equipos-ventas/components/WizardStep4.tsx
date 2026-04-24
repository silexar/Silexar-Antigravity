/**
 * WIZARD: CREAR EQUIPO - PASO 4 METAS Y COMPENSACION
 * Diseno de plan de compensacion con tiers y spiffs.
 */

'use client';

import React, { useState } from 'react';
import { DollarSign, Target, Sparkles, Calculator, ArrowLeft, CheckCircle } from 'lucide-react';

const PLAN_STRUCTURES = [
    { id: 'base_variable', label: 'Base + Variable', desc: 'Recomendado', emoji: '💼' },
    { id: 'straight', label: 'Straight Commission', desc: 'Sin sueldo base', emoji: '🎯' },
    { id: 'salary_bonus', label: 'Salary + Quarterly Bonus', desc: 'Menor riesgo', emoji: '🏦' },
    { id: 'draw', label: 'Draw Against Commission', desc: 'Anticipo contra comision', emoji: '💰' },
];

const SPIFFS = [
    { id: 'new_customer', label: 'New Customer', bonus: 2000, emoji: '🆕' },
    { id: 'upsell', label: 'Upsell >50%', bonus: 1000, emoji: '📈' },
    { id: 'quarterly_club', label: "President's Club", bonus: 5000, emoji: '🏆' },
];

export const WizardStep4 = ({
    onBack,
    onFinish
}: {
    onBack: () => void;
    onFinish: (data: {
        planStructure: string;
        baseSalary: number;
        targetCommission: number;
        quota: number;
        commissionRate: number;
        acceleratorRate: number;
    }) => void
}) => {
    const [planStructure, setPlanStructure] = useState('base_variable');
    const [baseSalary, setBaseSalary] = useState(80000);
    const [targetCommission, setTargetCommission] = useState(120000);
    const [quota, setQuota] = useState(1200000);
    const [commissionRate, setCommissionRate] = useState(10);
    const [acceleratorRate, setAcceleratorRate] = useState(15);
    const [selectedSpiffs, setSelectedSpiffs] = useState(['new_customer', 'quarterly_club']);

    const toggleSpiff = (id: string) => {
        setSelectedSpiffs(prev =>
            prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
        );
    };

    // Calculate projected earnings at different attainment levels
    const calcEarnings = (attainment: number) => {
        const actualSales = quota * (attainment / 100);
        let commission = 0;
        if (attainment <= 100) {
            commission = actualSales * (commissionRate / 100);
        } else {
            const tier1 = quota * (commissionRate / 100);
            const tier2 = (actualSales - quota) * (acceleratorRate / 100);
            commission = tier1 + tier2;
        }
        const spiffsTotal = selectedSpiffs.reduce((sum, id) => {
            const spiff = SPIFFS.find(s => s.id === id);
            return sum + (spiff?.bonus || 0);
        }, 0);
        return {
            base: baseSalary,
            commission: Math.round(commission),
            spiffs: spiffsTotal,
            total: Math.round(baseSalary + commission + spiffsTotal)
        };
    };

    const earnings75 = calcEarnings(75);
    const earnings100 = calcEarnings(100);
    const earnings125 = calcEarnings(125);
    const earnings150 = calcEarnings(150);

    return (
        <div className="max-w-2xl mx-auto bg-[#EAF0F6] rounded-3xl shadow-[8px_8px_16px_#d1d5db,-8px_-8px_16px_#ffffff] overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 p-6 text-white shadow-lg">
                <p className="text-xs uppercase tracking-widest text-emerald-200">Paso 4 de 4</p>
                <h2 className="text-xl font-black mt-1 flex items-center gap-2">
                    <DollarSign size={20} className="text-emerald-200" />
                    Metas y Compensacion
                </h2>
                <p className="text-xs text-emerald-200 mt-1">Diseno de plan de compensacion avanzado</p>
            </div>

            <div className="p-6 space-y-6">
                {/* Plan Structure */}
                <div>
                    <label className="text-sm font-bold text-slate-600 uppercase tracking-wider flex items-center gap-2">
                        <Target size={14} className="text-emerald-500" />
                        Estructura del Plan
                    </label>
                    <div className="grid grid-cols-2 gap-3 mt-3">
                        {PLAN_STRUCTURES.map(p => (
                            <label
                                key={p.id}
                                onClick={() => setPlanStructure(p.id)}
                                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 flex items-center gap-3 ${planStructure === p.id
                                        ? 'border-emerald-500 bg-white shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]'
                                        : 'border-transparent bg-white/50 shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff] hover:border-emerald-300'
                                    }`}
                            >
                                <input type="radio" name="planStructure" value={p.id} checked={planStructure === p.id} onChange={() => setPlanStructure(p.id)} className="sr-only" />
                                <span className="text-2xl">{p.emoji}</span>
                                <div>
                                    <span className="font-bold text-slate-700 block text-sm">{p.label}</span>
                                    <span className="text-xs text-slate-500">{p.desc}</span>
                                </div>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Compensation Configuration */}
                <div className="bg-white rounded-2xl p-5 shadow-[inset_4px_4px_8px_#d1d5db,inset_-4px_-4px_8px_#ffffff]">
                    <h4 className="font-black text-slate-700 mb-4 flex items-center gap-2">
                        <Sparkles size={16} className="text-amber-500" />
                        Configuracion de Compensacion
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase">Base Salary</label>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-slate-400">$</span>
                                <input
                                    type="number"
                                    value={baseSalary}
                                    onChange={(e) => setBaseSalary(Number(e.target.value))}
                                    className="w-full bg-[#EAF0F6] rounded-xl px-3 py-2 text-slate-700 font-bold shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff] focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase">Target Commission (OTE)</label>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-slate-400">$</span>
                                <input
                                    type="number"
                                    value={targetCommission}
                                    onChange={(e) => setTargetCommission(Number(e.target.value))}
                                    className="w-full bg-[#EAF0F6] rounded-xl px-3 py-2 text-slate-700 font-bold shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff] focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase">Annual Quota</label>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-slate-400">$</span>
                                <input
                                    type="number"
                                    value={quota}
                                    onChange={(e) => setQuota(Number(e.target.value))}
                                    className="w-full bg-[#EAF0F6] rounded-xl px-3 py-2 text-slate-700 font-bold shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff] focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase">Commission Rate (%)</label>
                            <input
                                type="number"
                                value={commissionRate}
                                onChange={(e) => setCommissionRate(Number(e.target.value))}
                                className="w-full bg-[#EAF0F6] rounded-xl px-3 py-2 text-slate-700 font-bold mt-1 shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff] focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                            />
                        </div>
                        <div className="col-span-2">
                            <label className="text-xs font-bold text-slate-500 uppercase">Accelerator Rate Above Quota (%)</label>
                            <input
                                type="number"
                                value={acceleratorRate}
                                onChange={(e) => setAcceleratorRate(Number(e.target.value))}
                                className="w-full bg-[#EAF0F6] rounded-xl px-3 py-2 text-slate-700 font-bold mt-1 shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff] focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                            />
                        </div>
                    </div>
                </div>

                {/* SPIFFs */}
                <div className="bg-white rounded-2xl p-5 shadow-[inset_4px_4px_8px_#d1d5db,inset_-4px_-4px_8px_#ffffff]">
                    <h4 className="font-black text-slate-700 mb-3 flex items-center gap-2">
                        <Sparkles size={16} className="text-purple-500" />
                        Programas SPIFF
                    </h4>
                    <div className="space-y-2">
                        {SPIFFS.map(s => (
                            <label
                                key={s.id}
                                onClick={() => toggleSpiff(s.id)}
                                className={`flex items-center justify-between p-3 rounded-xl border-2 cursor-pointer transition-all duration-300 ${selectedSpiffs.includes(s.id)
                                        ? 'border-purple-500 bg-purple-50/50'
                                        : 'border-transparent hover:border-slate-200'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${selectedSpiffs.includes(s.id)
                                            ? 'bg-purple-500 text-white shadow-[2px_2px_4px_#d1d5db]'
                                            : 'bg-slate-200'
                                        }`}>
                                        {selectedSpiffs.includes(s.id) ? <CheckCircle size={14} /> : null}
                                    </div>
                                    <span className="text-lg">{s.emoji}</span>
                                    <span className="font-semibold text-slate-700">{s.label}</span>
                                </div>
                                <span className="font-bold text-emerald-600">+${s.bonus.toLocaleString()}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Projected Earnings */}
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-5 text-white">
                    <h4 className="font-black flex items-center gap-2 mb-4">
                        <Calculator size={18} className="text-emerald-400" />
                        Ganancias Proyectadas
                    </h4>
                    <div className="grid grid-cols-4 gap-3">
                        {[
                            { label: '75% Quota', data: earnings75, color: 'amber' },
                            { label: '100% Quota', data: earnings100, color: 'emerald' },
                            { label: '125% Quota', data: earnings125, color: 'blue' },
                            { label: '150% Quota', data: earnings150, color: 'purple' },
                        ].map((item, i) => (
                            <div key={i} className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
                                <p className="text-[10px] text-slate-400 uppercase font-bold">{item.label}</p>
                                <p className={`text-lg font-black text-${item.color}-400 mt-1`}>
                                    ${(item.data.total / 1000).toFixed(0)}K
                                </p>
                                <div className="mt-2 space-y-0.5">
                                    <p className="text-[9px] text-slate-400">Base: ${(item.data.base / 1000).toFixed(0)}K</p>
                                    <p className="text-[9px] text-slate-400">Comm: ${(item.data.commission / 1000).toFixed(0)}K</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-4">
                    <button
                        onClick={onBack}
                        className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-bold transition-all duration-300
              bg-[#EAF0F6] text-slate-600 shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]
              hover:shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]
              active:shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]"
                    >
                        <ArrowLeft size={18} />
                        Volver
                    </button>
                    <button
                        onClick={() => onFinish({
                            planStructure,
                            baseSalary,
                            targetCommission,
                            quota,
                            commissionRate,
                            acceleratorRate
                        })}
                        className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-bold transition-all duration-300
              bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg
              hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
                    >
                        <CheckCircle size={18} />
                        Crear Equipo
                    </button>
                </div>
            </div>
        </div>
    );
};
