/**
 * 👁️ COMPONENT: Sentinel Status
 * 
 * Visualizador del "Daemon" de monitoreo continuo.
 * Muestra al operador que el sistema está trabajando por él.
 * 
 * @tier TIER_0_EFFICIENCY
 */

'use client';

import { useState, useEffect } from 'react';
import { ShieldCheck, Wifi } from 'lucide-react';

export function SentinelStatus() {
  const [scannedCount, setScannedCount] = useState(1420);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setScannedCount(c => c + Math.floor(Math.random() * 3));
      setPulse(true);
      setTimeout(() => setPulse(false), 500);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-4 bg-[#e0e5ec] px-4 py-2 rounded-2xl shadow-[inset_4px_4px_8px_#b8b9be,inset_-4px_-4px_8px_#ffffff]">
        
        {/* ICON & PULSE */}
        <div className="relative">
            <div className={`absolute inset-0 bg-emerald-500 rounded-full blur-sm transition-opacity duration-500 ${pulse ? 'opacity-50' : 'opacity-0'}`} />
            <div className="relative w-8 h-8 bg-[#e0e5ec] rounded-full flex items-center justify-center shadow-md text-emerald-600">
                <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-[#e0e5ec] animate-ping" />
        </div>

        {/* STATUS TEXT */}
        <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                Sentinel Active <Wifi className="w-3 h-3 text-emerald-500" />
            </p>
            <p className="text-xs font-bold text-slate-600 font-mono">
                {scannedCount.toLocaleString()} items scanned
            </p>
        </div>

        {/* MINI GRAPH (CSS ONLY) */}
        <div className="flex gap-0.5 items-end h-6">
            {[40, 60, 30, 80, 50, 90, 40].map((h, i) => (
                <div key={i} className="w-1 bg-slate-300 rounded-full" style={{ height: `${h}%` }} />
            ))}
        </div>
    </div>
  );
}
