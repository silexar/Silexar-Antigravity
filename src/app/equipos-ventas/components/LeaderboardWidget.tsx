/**
 * COMPONENT: LEADERBOARD WIDGET
 */

import React from 'react';
import { Trophy } from 'lucide-react';

const MOCK_LEADERBOARD = [
  { id: 1, name: 'Ana García', score: 12500, sales: 85000, avatar: 'AG' },
  { id: 2, name: 'Carlos Ruiz', score: 11200, sales: 72000, avatar: 'CR' },
  { id: 3, name: 'Elena Top', score: 9800, sales: 68000, avatar: 'ET' },
  { id: 4, name: 'Juan Pérez', score: 8500, sales: 54000, avatar: 'JP' },
  { id: 5, name: 'Maria Sol', score: 7200, sales: 41000, avatar: 'MS' },
];

export const LeaderboardWidget = () => {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-slate-800 flex items-center gap-2">
           <Trophy className="text-amber-500" size={20} /> Top Performers
        </h3>
        <button className="text-xs font-semibold text-slate-400 hover:text-slate-600">Ver todo</button>
      </div>

      <div className="space-y-4">
        {MOCK_LEADERBOARD.map((user, index) => (
          <div key={user.id} className="flex items-center gap-4">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                index === 0 ? 'bg-amber-100 text-amber-700' : 
                index === 1 ? 'bg-slate-200 text-slate-600' :
                index === 2 ? 'bg-orange-100 text-orange-700' : 'bg-slate-50 text-slate-400'
            }`}>
               {index + 1}
            </div>
            
            <div className="flex-1">
               <p className="font-semibold text-slate-700 text-sm">{user.name}</p>
               <p className="text-xs text-slate-400">{user.score.toLocaleString()} pts</p>
            </div>

            <div className="text-right">
               <span className="font-bold text-slate-700 text-sm">${(user.sales/1000).toFixed(1)}k</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
