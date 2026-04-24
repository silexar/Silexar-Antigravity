/**
 * WIZARD: CREAR EQUIPO - PASO 3 TERRITORIOS Y ASIGNACIONES
 * Optimizacion de territorios con IA y asignacion de miembros.
 */

'use client';

import React, { useState } from 'react';
import { MapPin, Sparkles, Users, CheckCircle, ArrowLeft, RefreshCw } from 'lucide-react';

const TERRITORY_TYPES = [
    { id: 'geographic', label: 'Geográfico', desc: 'Por region/ciudad', emoji: '🌍' },
    { id: 'vertical', label: 'Vertical', desc: 'Por industria', emoji: '🏢' },
    { id: 'account', label: 'Account-based', desc: 'Por tamaño de empresa', emoji: '🎯' },
    { id: 'hybrid', label: 'Híbrido', desc: 'Geo + Vertical', emoji: '🔄' },
];

const AI_TERRITORIES = [
    {
        id: 't-1',
        name: 'TERRITORIO NORTE',
        potential: '$2.3M ARR',
        accounts: 245,
        travelTime: '2.3h avg',
        recommended: '1 Field Rep + 1 SDR',
        attainment: 156
    },
    {
        id: 't-2',
        name: 'TERRITORIO SUR',
        potential: '$1.8M ARR',
        accounts: 189,
        travelTime: '1.8h avg',
        recommended: '1 Field Rep',
        attainment: 118
    },
    {
        id: 't-3',
        name: 'TERRITORIO CENTRO',
        potential: '$3.1M ARR',
        accounts: 334,
        travelTime: '1.2h avg',
        recommended: '2 Field Reps + 1 SDR',
        attainment: 145
    },
];

export const WizardStep3 = ({
    onBack,
    onNext
}: {
    onBack: () => void;
    onNext: (data: { territoryType: string; territories: string[] }) => void
}) => {
    const [territoryType, setTerritoryType] = useState('geographic');
    const [selectedTerritories, setSelectedTerritories] = useState<string[]>(['t-1', 't-2', 't-3']);

    const toggleTerritory = (id: string) => {
        setSelectedTerritories(prev =>
            prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
        );
    };

    const balanceScore = 94;
    const projectedQuota = 138;

    return (
        <div className="max-w-2xl mx-auto bg-[#EAF0F6] rounded-3xl shadow-[8px_8px_16px_#d1d5db,-8px_-8px_16px_#ffffff] overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 p-6 text-white shadow-lg">
                <p className="text-xs uppercase tracking-widest text-indigo-200">Paso 3 de 4</p>
                <h2 className="text-xl font-black mt-1 flex items-center gap-2">
                    <MapPin size={20} className="text-purple-200" />
                    Territorios y Asignaciones
                </h2>
                <p className="text-xs text-indigo-200 mt-1">Optimización IA de territorios de ventas</p>
            </div>

            <div className="p-6 space-y-6">
                {/* Territory Model */}
                <div>
                    <label className="text-sm font-bold text-slate-600 uppercase tracking-wider flex items-center gap-2">
                        <Sparkles size={14} className="text-purple-500" />
                        Modelo de Territorio
                    </label>
                    <div className="grid grid-cols-2 gap-3 mt-3">
                        {TERRITORY_TYPES.map(t => (
                            <label
                                key={t.id}
                                onClick={() => setTerritoryType(t.id)}
                                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 flex items-center gap-3 ${territoryType === t.id
                                        ? 'border-indigo-500 bg-white shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]'
                                        : 'border-transparent bg-white/50 shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff] hover:border-indigo-300'
                                    }`}
                            >
                                <input
                                    type="radio"
                                    name="territoryType"
                                    value={t.id}
                                    checked={territoryType === t.id}
                                    onChange={() => setTerritoryType(t.id)}
                                    className="sr-only"
                                />
                                <span className="text-2xl">{t.emoji}</span>
                                <div>
                                    <span className="font-bold text-slate-700 block">{t.label}</span>
                                    <span className="text-xs text-slate-500">{t.desc}</span>
                                </div>
                            </label>
                        ))}
                    </div>
                </div>

                {/* AI Territory Optimizer */}
                <div className="bg-white rounded-2xl p-5 shadow-[inset_4px_4px_8px_#d1d5db,inset_-4px_-4px_8px_#ffffff]">
                    <h4 className="font-black text-slate-700 flex items-center gap-2 mb-4">
                        <Sparkles size={18} className="text-amber-500" />
                        Cortex-Territory analizo data historica:
                    </h4>
                    <div className="space-y-3">
                        {AI_TERRITORIES.map(t => (
                            <label
                                key={t.id}
                                onClick={() => toggleTerritory(t.id)}
                                className={`block p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${selectedTerritories.includes(t.id)
                                        ? 'border-emerald-500 bg-emerald-50/50'
                                        : 'border-transparent hover:border-slate-200'
                                    }`}
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="checkbox"
                                            checked={selectedTerritories.includes(t.id)}
                                            onChange={() => toggleTerritory(t.id)}
                                            className="sr-only"
                                        />
                                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${selectedTerritories.includes(t.id)
                                                ? 'bg-emerald-500 text-white shadow-[2px_2px_4px_#d1d5db]'
                                                : 'bg-slate-200'
                                            }`}>
                                            {selectedTerritories.includes(t.id) ? <CheckCircle size={14} /> : null}
                                        </div>
                                        <div>
                                            <span className="font-black text-slate-700">{t.name}</span>
                                            <div className="flex flex-wrap gap-3 mt-1 text-xs text-slate-500">
                                                <span>📍 Potential: <b>{t.potential}</b></span>
                                                <span>👥 {t.accounts} prospects</span>
                                                <span>⏱️ {t.travelTime}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                        <span className={`text-lg font-black ${t.attainment >= 140 ? 'text-emerald-600' : t.attainment >= 120 ? 'text-blue-600' : 'text-amber-600'
                                            }`}>{t.attainment}%</span>
                                        <p className="text-[10px] text-slate-400">Attainment</p>
                                    </div>
                                </div>
                                <div className="mt-2 ml-9 flex items-center gap-2">
                                    <Users size={12} className="text-purple-500" />
                                    <span className="text-xs text-purple-600 font-semibold">Recomendado: <b>{t.recommended}</b></span>
                                </div>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Balance Metrics */}
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-5 border border-emerald-200">
                    <div className="flex items-center justify-between mb-3">
                        <h4 className="font-black text-emerald-700">Balance Score</h4>
                        <div className="flex items-center gap-2">
                            <span className="text-3xl font-black text-emerald-600">{balanceScore}</span>
                            <span className="text-sm text-emerald-500">/100</span>
                            <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full font-bold">Optimal</span>
                        </div>
                    </div>
                    <div className="w-full bg-emerald-200 rounded-full h-3 overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-700"
                            style={{ width: `${balanceScore}%` }}
                        />
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                        <span className="text-sm font-semibold text-emerald-700">Projected Quota Attainment</span>
                        <span className="text-lg font-black text-emerald-600">{projectedQuota}%</span>
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
                        onClick={() => onNext({
                            territoryType,
                            territories: selectedTerritories
                        })}
                        className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-bold transition-all duration-300
              bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg
              hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
                    >
                        Siguiente: Compensacion
                        <MapPin size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};
