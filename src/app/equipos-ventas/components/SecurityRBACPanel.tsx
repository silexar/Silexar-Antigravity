/**
 * COMPONENT: SECURITY RBAC PANEL — Tier 0 Military-Grade
 * 
 * @description Visual panel showing role-based access controls,
 * encryption standards, and per-role permissions matrix.
 */

'use client';

import React from 'react';
import {
  Shield, Lock, CheckCircle, XCircle,
  Key, ShieldCheck,
  Database, Globe, Users
} from 'lucide-react';

/* ─── SECURITY DATA ───────────────────────────────────────────── */

const ENCRYPTION_FEATURES = [
  { label: 'Performance data', method: 'AES-256 + Post-Quantum', icon: Database, color: 'text-blue-500' },
  { label: 'Commission data', method: 'Banking-grade protection', icon: Key, color: 'text-emerald-500' },
  { label: 'Territory assignments', method: 'Granular region control', icon: Globe, color: 'text-purple-500' },
  { label: 'Competitive intelligence', method: 'Zero-trust verification', icon: ShieldCheck, color: 'text-orange-500' },
];

interface Permission {
  label: string;
  rep: boolean;
  manager: boolean;
  vp: boolean;
}

const PERMISSIONS_MATRIX: { category: string; permissions: Permission[] }[] = [
  {
    category: 'Representante de Ventas',
    permissions: [
      { label: 'Ver su performance y commission data', rep: true, manager: true, vp: true },
      { label: 'Acceso a territorio y listas de cuentas', rep: true, manager: true, vp: true },
      { label: 'Materiales de formación y coaching', rep: true, manager: true, vp: true },
      { label: 'Performance data de otros reps', rep: false, manager: true, vp: true },
      { label: 'Planes de comisiones/compensación', rep: false, manager: false, vp: true },
    ],
  },
  {
    category: 'Gerente de Ventas',
    permissions: [
      { label: 'Performance completo de informes directos', rep: false, manager: true, vp: true },
      { label: 'Herramientas de coaching y desarrollo', rep: false, manager: true, vp: true },
      { label: 'Gestión del territorio (su equipo)', rep: false, manager: true, vp: true },
      { label: 'Forecast submission y pipeline review', rep: false, manager: true, vp: true },
      { label: 'Comp planning / commission overrides', rep: false, manager: false, vp: true },
    ],
  },
  {
    category: 'Director / VP de Ventas',
    permissions: [
      { label: 'Rendimiento en todos los equipos', rep: false, manager: false, vp: true },
      { label: 'Territory optimization y capacity planning', rep: false, manager: false, vp: true },
      { label: 'Configuración del plan de compensación', rep: false, manager: false, vp: true },
      { label: 'Advanced analytics y predictive insights', rep: false, manager: false, vp: true },
      { label: 'Planificación de sucesión y talento', rep: false, manager: false, vp: true },
    ],
  },
];

/* ─── CHECK/X CELL ────────────────────────────────────────────── */

const PermCell = ({ allowed }: { allowed: boolean }) => (
  allowed
    ? <CheckCircle size={16} className="text-emerald-500" />
    : <XCircle size={16} className="text-red-400" />
);

/* ─── COMPONENT ───────────────────────────────────────────── */

export const SecurityRBACPanel = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">

      {/* ──── HEADER ──── */}
      <div className="bg-gradient-to-r from-slate-900 via-red-950 to-slate-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(239,68,68,0.12),transparent_60%)]" />
        <div className="relative z-10 flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Shield size={18} className="text-red-400" />
              <span className="text-xs font-bold uppercase tracking-widest text-red-400">Security Tier 0</span>
              <span className="text-xs bg-red-500/20 text-red-300 px-2 py-0.5 rounded-full border border-red-500/30">Military-Grade</span>
            </div>
            <h2 className="text-2xl font-bold mt-1">Protección de Datos de Performance</h2>
            <p className="text-slate-400 text-sm mt-0.5">Zero-Trust Architecture • AES-256 • Post-Quantum Ready</p>
          </div>
          <div className="flex items-center gap-2 bg-emerald-500/20 px-3 py-1.5 rounded-full border border-emerald-500/30">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-xs text-emerald-300 font-semibold">All Systems Secure</span>
          </div>
        </div>
      </div>

      {/* ──── ENCRYPTION STANDARDS ──── */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Lock size={18} className="text-red-500" /> Encriptación y Control de Acceso
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {ENCRYPTION_FEATURES.map((feat) => (
            <div key={feat.label} className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div className={`w-10 h-10 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center ${feat.color}`}>
                <feat.icon size={18} />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">{feat.label}</p>
                <p className="text-xs text-slate-400">{feat.method}</p>
              </div>
              <ShieldCheck size={16} className="text-emerald-500 ml-auto" />
            </div>
          ))}
        </div>
      </div>

      {/* ──── PERMISSIONS MATRIX ──── */}
      {PERMISSIONS_MATRIX.map((section) => (
        <div key={section.category} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-5 border-b border-slate-100 bg-slate-50">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <Users size={16} className="text-slate-500" /> {section.category}
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Permiso</th>
                  <th className="px-5 py-3 text-center text-xs font-semibold text-slate-500 uppercase">Rep</th>
                  <th className="px-5 py-3 text-center text-xs font-semibold text-slate-500 uppercase">Manager</th>
                  <th className="px-5 py-3 text-center text-xs font-semibold text-slate-500 uppercase">VP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {section.permissions.map((perm) => (
                  <tr key={perm.label} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3 text-sm text-slate-700">{perm.label}</td>
                    <td className="px-5 py-3 text-center"><PermCell allowed={perm.rep} /></td>
                    <td className="px-5 py-3 text-center"><PermCell allowed={perm.manager} /></td>
                    <td className="px-5 py-3 text-center"><PermCell allowed={perm.vp} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
};
