/**
 * COMPONENT: SMART ACTION CENTER
 * Hub centralizado de acciones recomendadas por IA.
 */

import React from 'react';
import { Zap, UserPlus, Map, FileText, TrendingUp, ArrowRight, CheckCircle2 } from 'lucide-react';

const ActionCard = ({ icon: Icon, title, description, badge, colorClass, buttonText }: {
  icon: React.ElementType; title: string; description: string; badge: string; colorClass: string; buttonText: string;
}) => (
  <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all group cursor-pointer">
    <div className="flex justify-between items-start mb-3">
      <div className={`p-2 rounded-lg ${colorClass}`}>
        <Icon size={18} className="text-white" />
      </div>
      <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">{badge}</span>
    </div>
    <h4 className="font-bold text-slate-800 text-sm mb-1 group-hover:text-blue-600 transition-colors">{title}</h4>
    <p className="text-xs text-slate-500 mb-3">{description}</p>
    <div className="flex items-center text-xs font-semibold text-blue-600 gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
      {buttonText} <ArrowRight size={12} />
    </div>
  </div>
);

export const SmartActionCenter = () => {
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="bg-gradient-to-r from-violet-500 to-fuchsia-500 p-1.5 rounded-lg">
          <Zap size={16} className="text-white fill-white" />
        </div>
        <h3 className="font-bold text-slate-800">Centro de Acciones Inteligentes</h3>
        <span className="ml-auto text-xs text-slate-400">5 Acciones Pendientes</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <ActionCard icon={FileText} title="Performance Reviews" description="IA genera insights de cada rep. 5 pendientes." badge="Urgente" colorClass="bg-orange-500" buttonText="Generar Reviews" />
        <ActionCard icon={Map} title="Territory Optimization" description="Rebalanceo automatico Region Norte." badge="Opportunity" colorClass="bg-emerald-500" buttonText="Ver Propuesta" />
        <ActionCard icon={TrendingUp} title="Forecast Collaboration" description="Vista consolidada predictiva Q1." badge="Forecast" colorClass="bg-sky-500" buttonText="Abrir Forecast" />
        <ActionCard icon={UserPlus} title="Capacity Planning" description="Contratar 2 SDRs para Ent-West." badge="Hiring" colorClass="bg-blue-600" buttonText="Aprobar Headcount" />
        <ActionCard icon={TrendingUp} title="Coaching Alerts" description="3 Reps necesitan refuerzo en Cierre." badge="Training" colorClass="bg-purple-500" buttonText="Asignar Plan" />
      </div>
      <div className="mt-4 pt-4 border-t border-slate-200 flex justify-center">
        <button className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1"><CheckCircle2 size={12} /> Marcar todas como revisadas</button>
      </div>
    </div>
  );
};
