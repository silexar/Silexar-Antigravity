import React, { useState, useRef } from 'react';
import { Server, Activity, AlertTriangle, Shield, Zap, RefreshCw } from 'lucide-react';

/* ─── TIER 0 NEUROMORPHIC ────────────────────────────────────────── */

function PanicSwitch({ onActivate }: { onActivate: () => void }) {
  const [holding, setHolding] = useState(false);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startHold = () => {
    setHolding(true);
    let current = 0;
    intervalRef.current = setInterval(() => {
      current += 5;
      setProgress(current);
      if (current >= 100) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        onActivate();
        setHolding(false);
        setProgress(0);
      }
    }, 50);
  };

  const endHold = () => {
    setHolding(false);
    setProgress(0);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  return (
    <div className="relative mt-8 p-6 bg-[#F0EDE8] rounded-3xl border-2 border-red-500/20 shadow-[inset_0_4px_20px_rgba(0,0,0,0.5)] overflow-hidden">
      {/* Background Warning Glow */}
      <div className="absolute inset-0 bg-red-500/10 animate-pulse pointer-events-none" />

      <div className="relative z-10 text-center mb-6">
        <div className="w-16 h-16 bg-red-500/20 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-white uppercase tracking-wider mb-1">Botón de Pánico</h3>
        <p className="text-red-400 text-sm">Purga global de caché y reinicio forzado de workers.</p>
      </div>

      <div 
        className="relative h-16 bg-slate-800 rounded-2xl overflow-hidden cursor-pointer touch-none"
        onPointerDown={startHold}
        onPointerUp={endHold}
        onPointerLeave={endHold}
        onContextMenu={(e) => e.preventDefault()}
      >
        <div 
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-red-600 to-red-400 transition-all duration-75 ease-linear"
          style={{ width: `${progress}%` }}
        />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="text-white font-bold tracking-widest z-10 drop-shadow-md">
            {holding ? 'MANTÉN PRESIONADO...' : 'MANTENER PARA ACTIVAR'}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ─── MONITOR COMPONENT ────────────────────────────────────────── */

export function MobileSystemMonitor() {
  const [showToast, setShowToast] = useState(false);

  const handlePanicActivate = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const services = [
    { name: 'API Gateway', status: 'online', lat: '45ms' },
    { name: 'DB Primary (Cluster A)', status: 'online', lat: '12ms' },
    { name: 'Redis Cache (Global)', status: 'online', lat: '2ms' },
    { name: 'Cortex AI Services', status: 'degraded', lat: '850ms' },
    { name: 'Background Workers', status: 'online', lat: '--' },
  ];

  return (
    <div className="pb-24 pt-6 px-4 space-y-6">
      
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Activity className="w-6 h-6 text-purple-400" />
          System Health
        </h2>
        <p className="text-slate-400 mt-1">Monitoreo en tiempo real de Silexar Pulse</p>
      </div>

      {/* Global Status HUD */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-800/80 p-5 rounded-3xl border border-slate-700/50 shadow-[0_8px_30px_rgba(0,0,0,0.12)]">
          <div className="flex items-center gap-2 mb-3">
            <Server className="w-5 h-5 text-emerald-400" />
            <span className="text-slate-300 text-sm font-medium">Uptime</span>
          </div>
          <div className="text-3xl font-bold text-white">99.99<span className="text-lg text-slate-500">%</span></div>
        </div>
        <div className="bg-slate-800/80 p-5 rounded-3xl border border-slate-700/50 shadow-[0_8px_30px_rgba(0,0,0,0.12)]">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-5 h-5 text-yellow-400" />
            <span className="text-slate-300 text-sm font-medium">Load Avg</span>
          </div>
          <div className="text-3xl font-bold text-white">42<span className="text-lg text-slate-500">%</span></div>
        </div>
      </div>

      {/* Services List */}
      <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl border border-slate-700/50 p-1">
        <div className="p-4 border-b border-slate-700/50 flex justify-between items-center">
          <h3 className="text-white font-medium">Microservicios</h3>
          <span className="text-xs text-slate-400 bg-[#F0EDE8] px-2 py-1 rounded-full">Automated</span>
        </div>
        <div className="divide-y divide-slate-700/50">
          {services.map((service, i) => (
            <div key={`${service}-${i}`} className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative flex h-3 w-3">
                  {service.status === 'degraded' && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>}
                  <span className={`relative inline-flex rounded-full h-3 w-3 ${service.status === 'online' ? 'bg-emerald-500' : 'bg-yellow-500'}`}></span>
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{service.name}</p>
                  <p className="text-xs text-slate-400">Latencia: {service.lat}</p>
                </div>
              </div>
              <button className="w-8 h-8 rounded-full bg-slate-700/50 text-slate-300 flex items-center justify-center hover:bg-slate-600 transition-colors">
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Panic Room */}
      <PanicSwitch onActivate={handlePanicActivate} />

      {/* Action Toast */}
      {showToast && (
        <div className="fixed top-safe left-4 right-4 z-50 animate-in slide-in-from-top fade-in">
          <div className="bg-red-500 text-white p-4 rounded-2xl shadow-2xl flex items-center gap-3">
            <Shield className="w-6 h-6 animate-pulse" />
            <div>
              <p className="font-bold">Protocolo de Emergencia Activado</p>
              <p className="text-xs text-red-100">Caché purgada. Reiniciando balanceadores...</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
