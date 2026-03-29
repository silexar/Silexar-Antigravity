/**
 * 🎵 PAGE: Centro de Verificación de Emisión (Neuromorphic Dashboard)
 * 
 * Dashboard de Mando TIER 0 con diseño "Soft UI / Neuromorphing".
 * Integración: AI Command Bar, Sentinel Daemon, Zero-Trust Security.
 * 
 * @tier TIER_0_ENTERPRISE
 */

'use client';

import { useState, useRef } from 'react';
import { 
  Search, 
  BarChart3, 
  Clock, 
  Activity, 
  Zap, 
  FileText, 
  Smartphone, 
  Bot, 
  Plus
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

// Domain & Security
import { SecurityContext } from '@/lib/modules/registro-emision/domain/security/SecurityContext';
import { UserRole } from '@/lib/modules/registro-emision/domain/security/UserRole';

// Components
import { VerificationWizard, Material } from './_components/VerificationWizard';
import { RealTimeProcessor, ProcessingLog, HardwareStats, ProcessorStage } from './_components/RealTimeProcessor';
import { ResultadoVerificacion } from './_components/ResultsView';
import { AICommandBar } from './_components/AICommandBar';
import { SentinelStatus } from './_components/SentinelStatus';
import { RecentVerifications } from './_components/RecentVerifications';
import { useGlobalShortcuts } from './_hooks/useGlobalShortcuts';
import { SingleResultView } from './_components/SingleResultView';
import { EvidenceBasket, BasketItem } from './_components/EvidenceBasket';

// --- NEUROMORPHIC UI COMPONENTS ---
const NeuromorphicCard = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => (
  <div className={`bg-[#e0e5ec] rounded-2xl shadow-[9px_9px_16px_rgb(163,177,198),-9px_-9px_16px_rgba(255,255,255,0.5)] ${className}`}>
    {children}
  </div>
);

const NeuromorphicButton = ({ children, onClick, className = '', active = false }: { children: React.ReactNode, onClick?: () => void, className?: string, active?: boolean }) => (
  <button 
    onClick={onClick} 
    className={`
      px-6 py-3 rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2
      ${active 
        ? 'bg-[#e0e5ec] text-teal-600 shadow-[inset_6px_6px_12px_#b8b9be,inset_-6px_-6px_12px_#ffffff]' 
        : 'bg-[#e0e5ec] text-slate-600 shadow-[6px_6px_10px_#b8b9be,-6px_-6px_10px_#ffffff] hover:shadow-[3px_3px_6px_#b8b9be,-3px_-3px_6px_#ffffff] hover:-translate-y-0.5 active:shadow-[inset_4px_4px_8px_#b8b9be,inset_-4px_-4px_8px_#ffffff] active:translate-y-0'
      }
      ${className}
    `}
  >
    {children}
  </button>
);

// const NeuromorphicInput removed unused

// --- MAIN PAGE ---

export default function VerificadorPage() {
  const [viewState, setViewState] = useState<'dashboard' | 'wizard' | 'processing' | 'results'>('dashboard');

  // Security State (Demo)
  const [currentRole, setCurrentRole] = useState<UserRole>(UserRole.SENIOR_EXECUTIVE);
  const security = SecurityContext.getInstance();
  
  const handleRoleChange = (role: UserRole) => {
    setCurrentRole(role);
    security.switchRole(role);
  };
  
  // Global Keyboard Shortcuts
  useGlobalShortcuts({
    onNewVerification: () => setViewState('wizard'),
    onExport: () => { alert('Exportar último resultado (Demo)'); },
    onCancel: () => { if (viewState !== 'dashboard') setViewState('dashboard'); },
  });
  
  // --- ADVANCED SIMULATION STATE ---
  const [basketItems, setBasketItems] = useState<BasketItem[]>([]);
  const [procProgreso, setProcProgreso] = useState(0);
  const [procEtapa, setProcEtapa] = useState('');
  const [procLogs, setProcLogs] = useState<ProcessingLog[]>([]);
  const [procHardware, setProcHardware] = useState<HardwareStats>({ cpu: 12, ram: 4.2, diskIo: 45, network: 1.2, temperature: 42 });
  const [procStages, setProcStages] = useState<ProcessorStage[]>([
      { id: '1', label: 'Carga de Archivo & Análisis', status: 'pending' },
      { id: '2', label: 'Fingerprinting Espectral', status: 'pending' },
      { id: '3', label: 'Búsqueda de Coincidencias', status: 'pending' },
      { id: '4', label: 'Verificación de Calidad', status: 'pending' },
      { id: '5', label: 'Sellado Blockchain', status: 'pending' },
  ]);
  const [procMatches, setProcMatches] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [procTotalToVerify, setProcTotalToVerify] = useState(0);

  // Results State
  const [resultados, setResultados] = useState<ResultadoVerificacion[]>([]);
  // const [tiempoTotal, setTiempoTotal] = useState(0); // Unused
  // const [blockchainHash, setBlockchainHash] = useState(''); // Unused
  // const [certificadoUrl, setCertificadoUrl] = useState(''); // Unused

  const simulationRef = useRef<NodeJS.Timeout | null>(null);

  // --- LOGIC: Start Verification ---
  const startVerification = async (materiales: Material[]) => {
    setViewState('processing');
    setProcTotalToVerify(materiales.length);
    setProcMatches(0);
    setElapsedTime(0);
    setProcLogs([]);
    setProcProgreso(0);
    
    // Reset Stages
    setProcStages(prev => prev.map(s => ({ ...s, status: 'pending' })));

    let currentLogId = 0;
    const addLog = (msg: string, type: ProcessingLog['type'] = 'info', detail?: string) => {
        setProcLogs(prev => [...prev, {
            id: (currentLogId++).toString(),
             // fractionalSecondDigits is not fully supported in all TS environments for toLocaleTimeString, using string manipulation or standard options
            timestamp: new Date().toISOString().split('T')[1].substring(0, 12),
            message: msg,
            type,
            detail
        }].slice(-50)); // Keep last 50
    };

    const updateStage = (id: string, status: ProcessorStage['status']) => {
        setProcStages(prev => prev.map(s => s.id === id ? { ...s, status } : s));
    };

    // START SIMULATION LOOP
    let tick = 0;
    const totalTicks = 600; // ~60 seconds at 100ms
    let materialsProcessed = 0;
    
    // Mock results container
    const mockResults: ResultadoVerificacion[] = [];

    updateStage('1', 'processing');
    addLog("Iniciando motor Cortex-Sense Ultra v3.0...", 'process');

    simulationRef.current = setInterval(() => {
        tick++;
        setElapsedTime(Math.floor(tick / 10));

        // 1. Hardware Fluctuations
        setProcHardware({
            cpu: Math.min(100, Math.max(20, 45 + Math.sin(tick / 10) * 30 + Math.random() * 20)),
            ram: Math.min(16, Math.max(4, 8 + Math.cos(tick / 15) * 4 + Math.random())),
            diskIo: Math.random() > 0.8 ? 450 + Math.random() * 400 : 120 + Math.random() * 100,
            network: Math.random() > 0.9 ? 850 + Math.random() * 100 : 12 + Math.random() * 50,
            temperature: 45 + (tick / totalTicks) * 20
        });

        // 2. Timeline Logic
        
        // --- STAGE 1: LOAD (0-10%) ---
        if (tick === 5) {
             setProcEtapa("Cargando y descompriendo audio fuente...");
             addLog("Leyendo stream de entrada: 2.4GB WAV (24bit/96kHz)", 'info');
        }
        if (tick === 15) {
             addLog("Verificación de integridad CRC32 completada.", 'success');
             updateStage('1', 'completed');
             updateStage('2', 'processing');
             setProcEtapa("Generando huellas acústicas (Fingerprinting)...");
             setProcProgreso(15);
        }

        // --- STAGE 2: FINGERPRINTING (15-30%) ---
        if (tick === 20) addLog("Iniciando Análisis Espectral FFT...", 'process', "Window Size: 4096 samples");
        if (tick === 30) {
            addLog("Extracción de características psicoacústicas finalizada.", 'success', "15,402 puntos clave identificados.");
            updateStage('2', 'completed');
            updateStage('3', 'processing');
            setProcEtapa("Buscando coincidencias en base de datos...");
            setProcProgreso(30);
        }

        // --- STAGE 3: MATCHING (30-90%) ---
        // Distribute materials across this range
        if (tick > 30 && materialsProcessed < materiales.length) {
            const nextTrigger = 35 + (materialsProcessed * 50); // Simplified trigger logic for demo
            
            // Randomly trigger processing for detailed logs
            if (tick % 60 === 0 || tick === nextTrigger || tick === 40) { // Force at least one
                 const mat = materiales[materialsProcessed];
                 if (mat) {
                    // Start processing material
                    addLog(`Analizando material ${materialsProcessed + 1}/${materiales.length}: "${mat.nombre}"`, 'process');
                    
                    // Simulate find result immediately for demo visual (delayed slightly)
                    setTimeout(() => {
                        const found = Math.random() > 0.2; // 80% success
                        
                        if (found) {
                            addLog(`COINCIDENCIA ENCONTRADA: "${mat.nombre}"`, 'success', `Confidence: ${(95 + Math.random()*5).toFixed(2)}% • Offset: 14:23:${(Math.random()*59).toFixed(0)}`);
                            setProcMatches(curr => curr + 1);
                        } else {
                            addLog(`No se encontraron coincidencias para "${mat.nombre}"`, 'warning', "Threshold not met (Max: 42%)");
                        }

                        mockResults.push({
                            materialId: mat.id,
                            nombreMaterial: mat.nombre,
                            tipoMaterial: mat.tipo as ResultadoVerificacion['tipoMaterial'],
                            encontrado: found,
                            horaEmision: found ? `14:${10+materialsProcessed}:${(Math.random()*50).toFixed(0).padStart(2,'0')}` : undefined,
                            horaFin: found ? `14:${10+materialsProcessed}:${(30+(Math.random()*20)).toFixed(0).padStart(2,'0')}` : undefined,
                            emisora: 'Radio Corazón',
                            accuracy: found ? Math.round(95 + Math.random() * 4.9) : undefined,
                            transcripcion: mat.tipo === 'mencion_vivo' ? `...${mat.texto?.substring(0, 50)}...` : undefined,
                            locutor: mat.tipo === 'mencion_vivo' ? 'Juan Pérez' : undefined,
                            posibleCausa: !found ? 'No detectado en pauta' : undefined
                        });

                        materialsProcessed++;
                        setProcProgreso(30 + (materialsProcessed / materiales.length) * 60);
                    }, 500);
                 }
            }
        }

        // --- STAGE 4: FINALIZE (90-100%) ---
        if (materialsProcessed === materiales.length && tick > (30 + materialsProcessed * 10) && tick < 580) {
             setProcEtapa("Verificando calidad de clips generados...");
             updateStage('3', 'completed');
             updateStage('4', 'processing');
             setProcProgreso(95);
        }

        if (tick === 590) {
             updateStage('4', 'completed');
             updateStage('5', 'processing');
             addLog("Generando hash de certificación blockchain...", 'info');
        }

        if (tick >= 600 || (materialsProcessed === materiales.length && tick > 620)) {
            // STOP
            clearInterval(simulationRef.current!);
            completeSimulation(mockResults);
        }

    }, 50); // Fast tick 50ms = 20 ticks/sec
  };

  const completeSimulation = (results: ResultadoVerificacion[]) => {
      setProcProgreso(100);
      setProcEtapa("Proceso Finalizado.");
      setResultsData(results); // ticks * 50ms / 1000 = seconds
  };

  const setResultsData = async (res: ResultadoVerificacion[]) => {
      // Simulate API response delay for blockchain
      await new Promise(r => setTimeout(r, 1000));
      
      setResultados(res);
      // setTiempoTotal(seconds);
      // setBlockchainHash(`0x${uuidv4().replace(/-/g, '')}`);
      // setCertificadoUrl("https://blockchain-explorer.com/tx/mock");
      setViewState('results');
  };

  // AI Command Execution Handler
  const handleAICommand = (cmd: string) => {
      // Simular interpretación de comando
      if (cmd.toLowerCase().includes('verificar')) {
          const materialesMock: Material[] = [
              { id: '1', nombre: 'Coca-Cola Summer V2', tipo: 'audio_pregrabado', duracion: 30, selected: true },
              { id: '2', nombre: 'Mención Banco Chile', tipo: 'mencion_vivo', duracion: 15, selected: true },
              { id: '3', nombre: 'Banner App Falabella', tipo: 'display_banner', duracion: 0, selected: true }, // Digital Asset
          ];
          startVerification(materialesMock);
      }
  };

  // --- RENDER: VIEW ROUTER ---

  if (viewState === 'wizard') {
    return (
      <div className="min-h-screen bg-[#e0e5ec] p-8">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-3xl font-bold text-slate-700 tracking-tight">Nueva Verificación</h2>
            <NeuromorphicButton onClick={() => setViewState('dashboard')}>
              Cancelar Operación
            </NeuromorphicButton>
          </div>
          <VerificationWizard onStartVerification={startVerification} />
        </div>
      </div>
    );
  }

  if (viewState === 'processing') {
    return (
      <RealTimeProcessor 
         progreso={procProgreso}
         etapaActual={procEtapa}
         logs={procLogs}
         hardware={procHardware}
         stages={procStages}
         matchesFound={procMatches}
         totalToVerify={procTotalToVerify}
         elapsedTime={elapsedTime}
      />
    );
  }

  if (viewState === 'results') {
    // Surgical flow: Show single result with player and delivery options
    const singleResult = resultados[0]; // First/only result in surgical mode
    const found = singleResult?.encontrado || false;
    const isDigital = singleResult?.tipoMaterial === 'display_banner';
    
    return (
      <SingleResultView
        found={found}
        materialName={singleResult?.nombreMaterial || 'Material'}
        spxCode={'SPX-' + (singleResult?.materialId || '000')}
        horaExacta={singleResult?.horaEmision}
        emisora={singleResult?.emisora}
        accuracy={singleResult?.accuracy}
        clipUrl={singleResult?.clipUrl}
        isDigital={isDigital}
        searchRange="10min"
        onDownloadDirect={() => {}}
        onSendToDrive={() => {}}
        onSendByEmail={() => {}}
        onDownloadZip={() => {}}
        onGeneratePdf={isDigital ? () => {} : undefined}
        onExpandSearch={() => {}}
        onSearchAgain={() => setViewState('wizard')}
        onAddToBasket={() => {
          if (singleResult) {
             setBasketItems(prev => [...prev, {
                 id: uuidv4(),
                 nombre: singleResult.nombreMaterial,
                 spxCode: 'SPX-' + (singleResult.materialId || '000'),
                 hora: singleResult.horaEmision || '00:00',
                 emisora: singleResult.emisora || 'Desconocida',
                 clipUrl: singleResult.clipUrl
             }]);
             setViewState('dashboard');
          }
        }}
        onClose={() => setViewState('dashboard')}
      />
    );
  }

  // --- RENDER: MAIN DASHBOARD (DEFAULT) ---
  return (
    <main className="min-h-screen bg-[#e0e5ec] text-slate-700 p-8 font-sans relative">
      
      {/* EVIDENCE BASKET FLOATING COMPONENT */}
      <EvidenceBasket 
        items={basketItems} 
        onRemove={(id) => setBasketItems(prev => prev.filter(i => i.id !== id))}
        onClear={() => setBasketItems([])}
      />

      {/* SECURITY DEMO OVERLAY */}
      <div className="fixed top-24 right-6 z-[100] bg-slate-900 text-white p-3 rounded-lg shadow-2xl opacity-90 hover:opacity-100 transition-opacity scale-90 origin-top-right group">
        <div className="text-[9px] font-bold uppercase tracking-widest mb-1 text-slate-400 group-hover:text-emerald-400">Security / RBAC Simulator</div>
        <select 
          value={currentRole} 
          onChange={(e) => handleRoleChange(e.target.value as UserRole)}
          className="bg-slate-800 border-none text-xs rounded p-1 w-full focus:ring-0 cursor-pointer text-slate-200 font-mono"
        >
          <option value={UserRole.JUNIOR_EXECUTIVE}>👮 Junior Exec</option>
          <option value={UserRole.SENIOR_EXECUTIVE}>🕵️ Senior Exec</option>
          <option value={UserRole.COMMERCIAL_MANAGER}>💼 Manager</option>
          <option value={UserRole.ADMINISTRATOR}>🛡️ Admin (GOD)</option>
        </select>
        <div className="mt-1 flex items-center justify-between text-[8px]">
             <span className="flex items-center gap-1 text-emerald-500"><div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" /> Zero-Trust</span>
             <span className="text-slate-600 font-mono">ID: {Math.random().toString(36).substr(2,4)}</span>
        </div>
      </div>

      {/* HEADER: Title & Status */}
      <header className="mb-10">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-black text-slate-800 tracking-tighter mb-1">
              CENTRO DE VERIFICACIÓN
            </h1>
            <p className="text-slate-500 font-medium tracking-wide text-sm flex items-center gap-2">
              SILEXAR PULSE • TIER 0 PREMIUM <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded text-[10px] font-bold">DIGITAL 360° READY</span>
            </p>
          </div>
          <div className="flex gap-6 items-center">
             <SentinelStatus />
             <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#e0e5ec] shadow-[inset_3px_3px_6px_#b8b9be,inset_-3px_-3px_6px_#ffffff]">
                <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-xs font-bold text-slate-500">SYSTEM ONLINE</span>
             </div>
          </div>
        </div>

        {/* METRICS GRID - NEUROMORPHIC CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <MetricCard 
            icon={<Activity className="text-blue-500" />} 
            label="Verificaciones Hoy" 
            value="247" 
            subtext="+12% vs ayer"
          />
          <MetricCard 
            icon={<Clock className="text-amber-500" />} 
            label="Tiempo Promedio" 
            value="34s" 
            subtext="Ultra-Fast Mode"
          />
          <MetricCard 
            icon={<Zap className="text-purple-500" />} 
            label="Precisión AI" 
            value="99.97%" 
            subtext="Cortex-Sense v2.0"
          />
          <MetricCard 
            icon={<BarChart3 className="text-emerald-500" />} 
            label="Cumplimiento" 
            value="98.5%" 
            subtext="Spots Encontrados"
          />
        </div>
      </header>

      {/* INTELLIGENT COMMAND CENTER (AI BAR) */}
      <section className="mb-12 relative z-40">
        <div className="max-w-3xl mx-auto">
             <div className="text-center mb-4">
                 <h3 className="font-bold text-lg text-slate-700 flex items-center justify-center gap-2">
                     <Bot className="w-5 h-5 text-indigo-500" /> AI Copilot
                 </h3>
                 <p className="text-sm text-slate-400">Escribe lo que necesitas, yo me encargo del resto.</p>
             </div>
             <AICommandBar onExecute={handleAICommand} />
             
             {/* QUICK SUGGESTIONS */}
             <div className="flex justify-center gap-3 mt-4">
                 <SuggestionPill text="Verificar Coca-Cola Ayer" />
                 <SuggestionPill text="Auditar Banner Banco Falabella" />
                 <SuggestionPill text="Status Digital 360" />
             </div>
        </div>
      </section>

      {/* ACTIONS GRID */}
      <section>
        <h3 className="text-xl font-bold text-slate-700 mb-6 flex items-center gap-2">
            Acciones Rápidas <span className="text-xs font-normal text-slate-400">(Manual Override)</span>
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
           <ActionButton 
              icon={<Plus className="w-8 h-8 text-teal-500" />} 
              label="Nueva Verificación" 
              desc="Iniciar Wizard"
              onClick={() => setViewState('wizard')}
            />
           <ActionButton 
              icon={<FileText className="w-8 h-8 text-blue-500" />} 
              label="Reportes Compliance" 
              desc="Generar PDF mensual"
            />
           <ActionButton 
              icon={<Search className="w-8 h-8 text-purple-500" />} 
              label="Búsqueda Avanzada" 
              desc="Filtros detallados"
            />
           <ActionButton 
              icon={<Smartphone className="w-8 h-8 text-orange-500" />} 
              label="Modo Móvil" 
              desc="Enviar a App"
            />
        </div>
      </section>

      {/* RECENT VERIFICATIONS & SHORTCUTS */}
      <section className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
              <RecentVerifications onReload={(item) => alert(`Recargar: ${item.campana}`)} />
          </div>
          <div className="bg-[#e0e5ec] rounded-2xl shadow-[inset_4px_4px_8px_#b8b9be,inset_-4px_-4px_8px_#ffffff] p-5">
              <h3 className="text-sm font-black text-slate-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                  ⌨️ Atajos de Teclado
              </h3>
              <div className="space-y-2 text-sm">
                  <ShortcutRow keys={['Ctrl', 'K']} desc="AI Command Bar" />
                  <ShortcutRow keys={['Ctrl', 'Shift', 'V']} desc="Nueva Verificación" />
                  <ShortcutRow keys={['Ctrl', 'Shift', 'E']} desc="Exportar" />
                  <ShortcutRow keys={['Esc']} desc="Cancelar / Volver" />
              </div>
          </div>
      </section>
      
    </main>
  );
}

// --- SUB-COMPONENTS ---

interface MetricCardProps { icon: React.ReactNode; label: string; value: string; subtext: string; }
function MetricCard({ icon, label, value, subtext }: MetricCardProps) {
  return (
    <NeuromorphicCard className="p-6 flex items-center justify-between">
      <div>
        <p className="text-slate-500 text-xs font-bold uppercase mb-1 tracking-wider">{label}</p>
        <div className="text-3xl font-black text-slate-800">{value}</div>
        <p className="text-xs text-emerald-600 font-medium mt-1">{subtext}</p>
      </div>
      <div className="p-3 rounded-xl bg-[#e0e5ec] shadow-[inset_5px_5px_10px_#b8b9be,inset_-5px_-5px_10px_#ffffff]">
        {icon}
      </div>
    </NeuromorphicCard>
  );
}

// SuggestionItem removed unused

// FilterBadge removed unused

interface ActionButtonProps { icon: React.ReactNode; label: string; desc: string; onClick?: () => void; }
function ActionButton({ icon, label, desc, onClick }: ActionButtonProps) {
  return (
    <button 
      onClick={onClick}
      className="group bg-[#e0e5ec] p-6 rounded-2xl transition-all duration-300 flex flex-col items-center text-center gap-4
        shadow-[9px_9px_16px_rgb(163,177,198),-9px_-9px_16px_rgba(255,255,255,0.5)]
        hover:shadow-[5px_5px_8px_rgb(163,177,198),-5px_-5px_8px_rgba(255,255,255,0.5)]
        hover:-translate-y-1
        active:shadow-[inset_4px_4px_8px_#b8b9be,inset_-4px_-4px_8px_#ffffff]
        active:translate-y-0
      "
    >
      <div className="p-4 rounded-full bg-[#e0e5ec] shadow-[inset_5px_5px_10px_#b8b9be,inset_-5px_-5px_10px_#ffffff] group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <div>
        <h4 className="font-bold text-slate-700">{label}</h4>
        <p className="text-xs text-slate-400 font-medium">{desc}</p>
      </div>
    </button>
  );
}

const SuggestionPill = ({ text }: { text: string }) => (
    <button className="px-3 py-1.5 rounded-full bg-[#e0e5ec] border border-slate-300 text-xs text-slate-500 font-bold hover:bg-slate-200 transition-colors">
        {text}
    </button>
);

const ShortcutRow = ({ keys, desc }: { keys: string[], desc: string }) => (
    <div className="flex items-center justify-between py-1">
        <div className="flex gap-1">
            {keys.map((k, i) => (
                <span key={i} className="px-1.5 py-0.5 bg-slate-200 rounded text-[10px] font-mono font-bold text-slate-600">{k}</span>
            ))}
        </div>
        <span className="text-slate-500 text-xs">{desc}</span>
    </div>
);
