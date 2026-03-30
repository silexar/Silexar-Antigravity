/**
 * COMPONENT: TEAM TABLE
 */

import React from 'react';
import { SalesMember } from '../types';
import { MoreVertical, TrendingUp, TrendingDown } from 'lucide-react';

export const TablaEquipos = ({ members }: { members: SalesMember[] }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-50 flex justify-between items-center">
        <h3 className="font-bold text-slate-800">Rendimiento del Equipo</h3>
        <button className="text-sm text-orange-600 font-medium hover:text-orange-700">Ver todos</button>
      </div>
      
      <table className="w-full text-left bg-slate-50/30">
        <thead>
          <tr className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <th className="px-6 py-4">Vendedor</th>
            <th className="px-6 py-4 text-center">Rol</th>
            <th className="px-6 py-4 text-right">Ventas / Meta</th>
            <th className="px-6 py-4 text-center">Cumplimiento</th>
            <th className="px-6 py-4 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {members.map(member => {
            const percent = (member.currentSales / member.quota) * 100;
            return (
              <tr key={member.id} className="hover:bg-white transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600 text-sm">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800">{member.name}</p>
                      <p className="text-xs text-slate-400">{member.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    member.role === 'TEAM_LEAD' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {member.role.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <p className="font-bold text-slate-700">${(member.currentSales / 1000).toFixed(1)}k</p>
                  <p className="text-xs text-slate-400">de ${(member.quota / 1000).toFixed(1)}k</p>
                </td>
                <td className="px-6 py-4 text-center">
                   <div className="flex items-center justify-center gap-2">
                     <span className={`font-bold ${percent >= 100 ? 'text-emerald-600' : percent >= 80 ? 'text-blue-600' : 'text-orange-600'}`}>
                       {percent.toFixed(0)}%
                     </span>
                     {percent >= 80 ? <TrendingUp size={14} className="text-emerald-500" /> : <TrendingDown size={14} className="text-orange-500" />}
                   </div>
                   <div className="w-20 h-1.5 bg-slate-100 rounded-full mt-1 mx-auto overflow-hidden">
                     <div 
                       className={`h-full ${percent >= 100 ? 'bg-emerald-500' : percent >= 80 ? 'bg-blue-500' : 'bg-orange-500'}`} 
                       style={{ width: `${Math.min(percent, 100)}%` }}
                     ></div>
                   </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors">
                    <MoreVertical size={16} />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
