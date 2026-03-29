/**
 * ⚡ COMPONENT: RealTimeProcessor
 * 
 * Visualización del procesamiento "Cortex-Sense" con animaciones y métricas en tiempo real.
 * Diseño estilo "Matrix/Cyberpunk" para inspirar potencia tecnológica.
 * 
 * @tier TIER_0_FORTUNE_10
 */

'use client';

import { Fingerprint, Cpu, HardDrive, Activity, CheckCircle, Wifi, Database, Terminal, AlertCircle, Loader2 } from 'lucide-react';
import { useEffect, useRef } from 'react';

// --- INTERFACES ---

export interface HardwareStats {
  cpu: number;       // %
  ram: number;       // GB used
  diskIo: number;    // MB/s
  network: number;   // Mbps
  temperature: number; // Celsius
}

export interface ProcessingLog {
  id: string;
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'process';
  detail?: string;
}

export interface ProcessorStage {
  id: string;
  label: string;
  status: 'pending' | 'processing' | 'completed';
}

interface RealTimeProcessorProps {
  progreso: number;
  etapaActual: string;
  logs: ProcessingLog[];
  hardware: HardwareStats;
  stages: ProcessorStage[];
  matchesFound: number;
  totalToVerify: number;
  elapsedTime: number;
}

export function RealTimeProcessor({ 
  progreso, 
  etapaActual, 
  logs, 
  hardware, 
  stages,
  matchesFound, 
  totalToVerify,
  elapsedTime
}: RealTimeProcessorProps) {
  
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll logs
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="min-h-screen bg-[#0a0e14] text-cyan-50 font-sans selection:bg-cyan-500/30 overflow-hidden relative">
      
      {/* Background Decor - Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
      
      {/* Background Glows */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none animate-pulse-slow" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none animate-pulse-slow" />

      <main className="relative z-10 container mx-auto p-6 h-screen flex flex-col">
        
        {/* HEADER */}
        <header className="flex justify-between items-center mb-8 border-b border-cyan-900/50 pb-6">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center border border-cyan-400/30 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                <Fingerprint className="w-6 h-6 text-cyan-400 animate-pulse" />
             </div>
             <div>
                <h1 className="text-2xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-200">
                   CORTEX-SENSE ULTRA
                </h1>
                <p className="text-xs font-mono text-cyan-600/80 uppercase tracking-[0.2em]">Tier 0 Processing Engine • v3.0.4</p>
             </div>
          </div>
          
          <div className="flex items-center gap-8 font-mono text-xs">
             <div className="text-right">
                <p className="text-cyan-700 uppercase mb-1">Tiempo Transcurrido</p>
                <p className="text-xl text-cyan-100 font-bold">{elapsedTime}s <span className="text-cyan-600 text-xs">/ 60s max</span></p>
             </div>
             <div className="text-right">
                <p className="text-cyan-700 uppercase mb-1">Coincidencias</p>
                <p className="text-xl text-emerald-400 font-bold">{matchesFound} <span className="text-cyan-600 text-xs font-normal">de {totalToVerify}</span></p>
             </div>
          </div>
        </header>

        {/* MAIN DISPLAY GRID */}
        <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
          
          {/* LEFT COLUMN: VISUALIZER & STAGES */}
          <div className="col-span-4 flex flex-col gap-6">
            
            {/* STAGE CHECKLIST */}
            <div className="bg-[#0f151f] rounded-2xl border border-cyan-900/30 overflow-hidden flex-1 shadow-2xl">
                <div className="bg-[#151b26] p-4 border-b border-cyan-900/30 flex items-center justify-between">
                    <h3 className="font-bold text-cyan-100 flex items-center gap-2 text-sm">
                        <Activity className="w-4 h-4 text-cyan-500" /> SECUENCIA DE PROCESO
                    </h3>
                    <span className="w-2 h-2 rounded-full bg-cyan-500 animate-ping" />
                </div>
                <div className="p-4 space-y-4">
                    {stages.map((stage) => (
                        <div key={stage.id} className={`flex items-center gap-3 p-3 rounded-lg transition-all ${stage.status === 'processing' ? 'bg-cyan-500/10 border border-cyan-500/30 shadow-[0_0_10px_rgba(6,182,212,0.1)]' : stage.status === 'completed' ? 'opacity-50' : 'opacity-30'}`}>
                            <div className="w-6 flex justify-center">
                                {stage.status === 'completed' && <CheckCircle className="w-5 h-5 text-emerald-500" />}
                                {stage.status === 'processing' && <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />}
                                {stage.status === 'pending' && <div className="w-2 h-2 rounded-full bg-cyan-800" />}
                            </div>
                            <div>
                                <p className={`text-sm font-bold ${stage.status === 'processing' ? 'text-cyan-200' : 'text-cyan-100'}`}>{stage.label}</p>
                                {stage.status === 'processing' && <p className="text-[10px] text-cyan-400 font-mono animate-pulse">Procesaminto cuántico activo...</p>}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* PROGRESS SPINNER */}
            <div className="bg-[#0f151f] rounded-2xl p-6 border border-cyan-900/30 shadow-2xl text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent animate-scan" style={{ left: '-100%' }} />
                
                <h3 className="text-xs uppercase tracking-widest text-cyan-600 mb-4">Progreso Global</h3>
                <div className="relative w-32 h-32 mx-auto flex items-center justify-center">
                   <svg className="w-full h-full transform -rotate-90">
                      <circle cx="64" cy="64" r="60" stroke="#1e293b" strokeWidth="6" fill="transparent" />
                      <circle 
                        cx="64" cy="64" r="60" 
                        stroke="#06b6d4" strokeWidth="6" fill="transparent" 
                        strokeDasharray={377} 
                        strokeDashoffset={377 - (377 * progreso) / 100} 
                        className="transition-all duration-500 ease-out"
                      />
                   </svg>
                   <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-black text-white">{progreso}%</span>
                   </div>
                </div>
                <p className="mt-4 text-sm text-cyan-300 animate-pulse">{etapaActual}</p>
            </div>

          </div>

          {/* CENTER: CONSOLE LOGS */}
          <div className="col-span-5 bg-[#0f151f] rounded-2xl border border-cyan-900/30 shadow-2xl flex flex-col overflow-hidden relative group">
             {/* Scanner Line Effect */}
             <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 to-transparent h-20 w-full pointer-events-none animate-scan-y opacity-20" />

             <div className="bg-[#151b26] p-3 border-b border-cyan-900/30 flex items-center justify-between z-10">
                <h3 className="font-mono font-bold text-cyan-100 flex items-center gap-2 text-xs uppercase">
                    <Terminal className="w-4 h-4 text-purple-400" /> System Logs (Live)
                </h3>
             </div>

             <div className="flex-1 p-4 font-mono text-xs space-y-2 overflow-y-auto custom-scrollbar relative">
                {logs.map((log) => (
                    <div key={log.id} className={`flex gap-3 animate-in slide-in-from-left-2 fade-in duration-300 ${log.type === 'error' ? 'text-red-400' : 'text-cyan-100'}`}>
                        <span className="text-cyan-700 shrink-0">[{log.timestamp}]</span>
                        <div className="flex-1">
                            <span className={`font-bold mr-2 ${
                                log.type === 'success' ? 'text-emerald-400' :
                                log.type === 'warning' ? 'text-amber-400' :
                                log.type === 'process' ? 'text-cyan-400' :
                                log.type === 'error' ? 'text-red-500' : 'text-slate-300'
                            }`}>
                                {log.type === 'success' ? '✅' : 
                                 log.type === 'process' ? '⚙️' :
                                 log.type === 'warning' ? '⚠️' : 
                                 log.type === 'error' ? '❌' : 'ℹ️'}
                            </span>
                             <span className={log.type === 'success' ? 'text-emerald-200' : ''}>{log.message}</span>
                             {log.detail && (
                                <p className="text-[10px] text-cyan-700/80 ml-6 mt-0.5 border-l border-cyan-800 pl-2">{log.detail}</p>
                             )}
                        </div>
                    </div>
                ))}
                <div ref={logsEndRef} />
             </div>
          </div>

          {/* RIGHT COLUMN: HARDWARE TELEMETRY */}
          <div className="col-span-3 flex flex-col gap-4">
            <HardwareCard 
                icon={Cpu} label="CPU Core" 
                value={hardware.cpu} unit="%" 
                max={100} color="cyan" 
                detail={`${(hardware.cpu * 0.16).toFixed(0)} Threads`} 
            />
            <HardwareCard 
                icon={HardDrive} label="Memory" 
                value={hardware.ram} unit="GB" 
                max={16} color="purple" 
                detail="DDR5 High-Speed" 
            />
            <HardwareCard 
                icon={Database} label="Disk I/O" 
                value={hardware.diskIo} unit="MB/s" 
                max={500} color="emerald" 
                detail="NVMe Write" 
            />
             <HardwareCard 
                icon={Wifi} label="Network" 
                value={hardware.network} unit="Mbps" 
                max={100} color="blue" 
                detail="Fiber Link Active" 
            />
            
            <div className="mt-auto bg-red-900/10 border border-red-500/20 rounded-xl p-4">
                <div className="flex items-center gap-2 text-red-400 text-xs font-bold uppercase mb-1">
                    <AlertCircle className="w-3 h-3" /> Core Temp
                </div>
                <div className="text-2xl font-black text-red-200">{hardware.temperature}°C</div>
                <div className="w-full h-1 bg-red-900/30 rounded-full mt-2 overflow-hidden">
                    <div className="h-full bg-red-500 transition-all duration-500" style={{ width: `${(hardware.temperature / 100) * 100}%` }} />
                </div>
            </div>
          </div>

        </div>

        {/* FOOTER */}
        <div className="mt-6 border-t border-cyan-900/30 pt-4 flex justify-between items-center text-[10px] text-cyan-800 font-mono uppercase">
            <div>
                SESSION_ID: {Math.random().toString(36).substring(7).toUpperCase()} • ENCRYPTION: AES-256
            </div>
            <div>
                 PULSE ENGINE • COGNITIVE AUDIO PROCESSING
            </div>
        </div>

      </main>
    </div>
  );
}

// --- SUB-COMPONENTS ---

interface HardwareCardProps { icon: React.ElementType; label: string; value: number; unit: string; max: number; color: 'cyan' | 'purple' | 'emerald' | 'blue'; detail: string; }
function HardwareCard({ icon: Icon, label, value, unit, max, color, detail }: HardwareCardProps) {
    const percentage = Math.min(100, (value / max) * 100);
    
    const colors: Record<string, string> = {
        cyan: 'text-cyan-400 bg-cyan-500',
        purple: 'text-purple-400 bg-purple-500',
        emerald: 'text-emerald-400 bg-emerald-500',
        blue: 'text-blue-400 bg-blue-500',
    };

    return (
        <div className="bg-[#151b26] rounded-xl p-4 border border-cyan-900/20 shadow-lg relative overflow-hidden group">
            <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${colors[color].split(' ')[0]}`} />
                    <span className="text-xs font-bold text-slate-400 uppercase">{label}</span>
                </div>
                <span className="text-[10px] text-slate-600 font-mono">{detail}</span>
            </div>
            
            <div className="flex items-baseline gap-1 mb-2">
                <span className="text-2xl font-black text-slate-200">{value.toFixed(1)}</span>
                <span className="text-xs font-bold text-slate-500">{unit}</span>
            </div>

            {/* Sparkline / Bar */}
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div 
                    className={`h-full ${colors[color].split(' ')[1]} transition-all duration-300`} 
                    style={{ width: `${percentage}%` }} 
                />
            </div>
        </div>
    );
}

// Add global styles for animations locally or ensure they exist in global.css
// keyframes: scan, scan-y, pulse-slow, shimmer

