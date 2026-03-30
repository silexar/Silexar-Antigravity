/**
 * COMPONENT: FORECAST PANEL
 */

import React, { useState } from 'react';
import { Target, Save } from 'lucide-react';

export const ForecastPanel = ({ currentForecast, quota }: { currentForecast: { commit?: number; bestCase?: number } | null, quota: number }) => {
  const [commit, setCommit] = useState(currentForecast?.commit || 0);
  const [bestCase, setBestCase] = useState(currentForecast?.bestCase || 0);

  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 text-white shadow-xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="font-bold text-lg flex items-center gap-2">
            <Target className="text-orange-500" /> Mi Forecast
          </h3>
          <p className="text-sm text-slate-400">Cierre Fiscal Q4 2025</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-400">Meta Trimestral</p>
          <p className="font-bold text-xl">${(quota/1000).toFixed(1)}k</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Commit (Piso)</label>
          <input
            type="number"
            aria-label="Commit (Piso)"
            value={commit}
            onChange={(e) => setCommit(Number(e.target.value))}
            className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 mt-1 text-lg font-mono focus:ring-2 focus:ring-orange-500 outline-none"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Best Case (Techo)</label>
          <input
            type="number"
            aria-label="Best Case (Techo)"
            value={bestCase}
            onChange={(e) => setBestCase(Number(e.target.value))}
            className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 mt-1 text-lg font-mono focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors mt-4">
          <Save size={18} /> Actualizar Forecast
        </button>
      </div>
    </div>
  );
};
