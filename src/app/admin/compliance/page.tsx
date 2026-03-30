/**
 * 🛡️ PAGE: Centro de Compliance y Seguridad TIER 0
 * 
 * Dashboard exclusivo para Administradores y Oficiales de Cumplimiento.
 * Visualiza auditoría blockchain, intentos de intrusión y estado cuántico.
 * 
 * @tier TIER_0_SECURITY
 */

'use client';

import { ShieldCheck, Activity, FileText, Database, Eye } from 'lucide-react';

export default function ComplianceDashboard() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-8">
      
      {/* HEADER */}
      <div className="flex justify-between items-center mb-10">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <ShieldCheck className="w-8 h-8 text-emerald-400" />
              <h1 className="text-3xl font-black tracking-tight text-white">SECURITY OPERATIONS CENTER</h1>
           </div>
           <p className="text-slate-400 font-mono text-sm ml-11">TIER 0 QUANTUM SECURITY • LIVE MONITORING</p>
        </div>
        <div className="flex items-center gap-4">
           <StatusBadge label="Zero-Trust" status="active" />
           <StatusBadge label="Quantum Enc" status="active" />
           <StatusBadge label="Blockchain" status="active" />
        </div>
      </div>

      {/* GRID LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* COL 1: REAL-TIME THREATS */}
        <div className="lg:col-span-2 space-y-6">
           
           {/* QUANTUM STATUS */}
           <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
              <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                 <Activity className="w-4 h-4 text-blue-400" /> Quantum Engine Status
              </h2>
              <div className="grid grid-cols-3 gap-4">
                 <MetricCard label="Entropy Rate" value="99.9%" color="text-blue-400" />
                 <MetricCard label="Encryption Keys" value="Active (AES-256)" color="text-emerald-400" />
                 <MetricCard label="Threats Blocked" value="0" color="text-slate-100" />
              </div>
           </div>

           {/* AUDIT LOG */}
           <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
              <div className="flex justify-between items-center mb-4">
                  <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                     <FileText className="w-4 h-4 text-amber-400" /> Immutable Audit Log
                  </h2>
                  <span className="text-xs font-mono text-slate-500">Last update: 23ms ago</span>
              </div>
              <div className="space-y-3 font-mono text-xs">
                 <LogEntry time="15:04:22" event="User Login: Carlos Mendoza (Senior Exec)" status="SUCCESS" hash="0x8a7...b2" />
                 <LogEntry time="15:03:45" event="Verification: Campaña SuperMax" status="VERIFIED" hash="0x3f1...c9" />
                 <LogEntry time="15:01:12" event="Intrusion Attempt: IP 192.168.1.55 blocked" status="BLOCKED" hash="0x1d2...a5" warning />
                 <LogEntry time="15:00:00" event="System Startup: Zero-Trust Handshake" status="OK" hash="0x000...00" />
              </div>
           </div>

        </div>

        {/* COL 2: COMPLIANCE STATUS */}
        <div className="space-y-6">
            <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 h-full relative overflow-hidden">
                <div className="absolute top-0 right-0 p-32 bg-emerald-500/10 rounded-full blur-3xl -mr-16 -mt-16" />
                
                <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                    <Database className="w-4 h-4 text-purple-400" /> Compliance Vault
                </h2>

                <div className="space-y-6 relative z-10">
                    <ComplianceItem label="GDPR Status" value="Compliant" />
                    <ComplianceItem label="Data Retention" value="7 Years (Immutable)" />
                    <ComplianceItem label="Evidence Storage" value="Encrypted (AES-GCM)" />
                    <div className="pt-4 border-t border-slate-700">
                        <button className="w-full py-3 bg-slate-700 hover:bg-slate-600 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2">
                            <Eye className="w-4 h-4" /> Ver Reporte Completo
                        </button>
                    </div>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
}

// --- SUB-COMPONENTS ---

interface StatusBadgeProps { label: string; status: 'active' | 'inactive'; }
const StatusBadge = ({ label, status }: StatusBadgeProps) => (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 rounded-full border border-slate-700">
        <div className={`w-2 h-2 rounded-full ${status === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
        <span className="text-xs font-bold text-slate-300">{label}</span>
    </div>
);

interface MetricCardProps { label: string; value: string; color: string; }
const MetricCard = ({ label, value, color }: MetricCardProps) => (
    <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-700">
        <p className="text-[10px] uppercase font-bold text-slate-500 mb-1">{label}</p>
        <p className={`text-xl font-black ${color}`}>{value}</p>
    </div>
);

interface LogEntryProps { time: string; event: string; status: string; hash: string; warning?: boolean; }
const LogEntry = ({ time, event, status, hash, warning }: LogEntryProps) => (
    <div className={`p-3 rounded-lg border flex items-center justify-between ${warning ? 'bg-red-900/20 border-red-900/50' : 'bg-slate-900/50 border-slate-700/50'}`}>
        <div className="flex items-center gap-3">
            <span className="text-slate-500">{time}</span>
            <span className={warning ? 'text-red-400' : 'text-slate-300'}>{event}</span>
        </div>
        <div className="flex items-center gap-3">
             <span className={`text-[10px] font-bold px-1.5 rounded ${warning ? 'bg-red-900 text-red-200' : 'bg-emerald-900 text-emerald-200'}`}>{status}</span>
             <span className="text-[10px] text-slate-600 hidden md:block">{hash}</span>
        </div>
    </div>
);

interface ComplianceItemProps { label: string; value: string; }
const ComplianceItem = ({ label, value }: ComplianceItemProps) => (
    <div>
        <p className="text-xs font-bold text-slate-500 uppercase mb-1">{label}</p>
        <p className="font-bold text-white text-lg">{value}</p>
    </div>
);
