/**
 * COMPONENT: ENTERPRISE TEAM TABLE
 * Tabla avanzada con columnas de Capacity, Pipeline y Actions.
 */

import React from 'react';
import { Target, BarChart3, Settings } from 'lucide-react';

const MOCK_TEAMS = [
  { name: 'Enterprise West', leader: 'Carlos Lopez', emoji: '\u{1F3E2}', attainment: 156, status: 'Healthy', statusColor: 'emerald', capacity: '8/8 Full', capacityNote: '2Q Hire', pipeline: '$4.2M', pipelineHeat: 'Hot', pipelineQual: '94%', sales: '$3.2M', quota: '$2.1M', members: '4 AEs, 2 SDRs' },
  { name: 'Mid-Market North', leader: 'Ana Martinez', emoji: '\u{1F3EA}', attainment: 145, status: 'Scaling', statusColor: 'emerald', capacity: '9/10', capacityNote: 'Need SDR', pipeline: '$2.8M', pipelineHeat: 'Hot', pipelineQual: '87%', sales: '$2.1M', quota: '$1.4M', members: '6 AEs, 3 SDRs' },
  { name: 'Inside Sales', leader: 'Roberto Silva', emoji: '\u{1F4DE}', attainment: 118, status: 'Growing', statusColor: 'amber', capacity: '12/15', capacityNote: 'Scale Up', pipeline: '$1.9M', pipelineHeat: 'Build', pipelineQual: '76%', sales: '$1.8M', quota: '$1.5M', members: '8 ISRs, 4 SDRs' },
];

const StatusBadge = ({ label, color }: { label: string; color: string }) => {
  const colors: Record<string, string> = { emerald: 'bg-emerald-100 text-emerald-700', amber: 'bg-amber-100 text-amber-700', red: 'bg-red-100 text-red-700' };
  return <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${colors[color] || colors.amber}`}>{label}</span>;
};

const HeatBadge = ({ heat }: { heat: string }) => {
  const map: Record<string, string> = { Hot: '\u{1F525} Hot', Build: '\u{1F504} Build', Cold: '\u2744\uFE0F Cold' };
  return <span className="text-xs font-medium">{map[heat] || heat}</span>;
};

export const EnterpriseTeamTable = () => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-50 flex justify-between items-center">
        <h3 className="font-bold text-slate-800">Equipos - Enterprise Grade</h3>
        <button className="text-sm text-orange-600 font-medium hover:text-orange-700">+ Crear Equipo</button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-xs font-semibold text-slate-400 uppercase tracking-wider bg-slate-50/50">
              <th className="px-6 py-4">Team / Leader</th>
              <th className="px-4 py-4 text-center">Performance</th>
              <th className="px-4 py-4 text-center">Capacity</th>
              <th className="px-4 py-4 text-center">Pipeline</th>
              <th className="px-4 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {MOCK_TEAMS.map((team, i) => (
              <tr key={`${team}-${i}`} className="hover:bg-slate-50/50 transition-colors group">
                {/* Team/Leader */}
                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{team.emoji}</span>
                    <div>
                      <p className="font-bold text-slate-800">{team.name}</p>
                      <p className="text-xs text-slate-500">{team.leader}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">{team.members}</p>
                    </div>
                  </div>
                </td>
                {/* Performance */}
                <td className="px-4 py-5 text-center">
                  <p className={`text-lg font-bold ${team.attainment >= 140 ? 'text-emerald-600' : team.attainment >= 100 ? 'text-blue-600' : 'text-amber-600'}`}>{team.attainment}% Quota</p>
                  <StatusBadge label={team.status} color={team.statusColor} />
                  <p className="text-[11px] text-slate-400 mt-1">{team.sales}/{team.quota}</p>
                </td>
                {/* Capacity */}
                <td className="px-4 py-5 text-center">
                  <p className="font-bold text-slate-700">{team.capacity}</p>
                  <p className="text-xs text-slate-500">{team.capacityNote}</p>
                </td>
                {/* Pipeline */}
                <td className="px-4 py-5 text-center">
                  <p className="font-bold text-slate-700">{team.pipeline}</p>
                  <HeatBadge heat={team.pipelineHeat} />
                  <p className="text-[11px] text-slate-400 mt-0.5">{team.pipelineQual} Qual</p>
                </td>
                {/* Actions */}
                <td className="px-4 py-5 text-right">
                  <div className="flex justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 hover:bg-orange-50 rounded-lg text-slate-400 hover:text-orange-600" title="Target"><Target size={16} /></button>
                    <button className="p-2 hover:bg-blue-50 rounded-lg text-slate-400 hover:text-blue-600" title="Analytics"><BarChart3 size={16} /></button>
                    <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600" title="Settings"><Settings size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
