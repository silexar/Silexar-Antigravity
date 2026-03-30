import React, { useState, useEffect } from 'react';
import { Camera, Mic, WifiOff, RefreshCw, Plus, Save } from 'lucide-react';
import { MobileExperienceService } from '../services/MobileExperienceService';

export const MobileActionControls: React.FC = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [offlineCount, setOfflineCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    // Initial check
    setIsOnline(MobileExperienceService.isOnline());
    setOfflineCount(MobileExperienceService.getQueue().length);

    // Listeners
    const handleStatus = () => {
      setIsOnline(navigator.onLine);
      if (navigator.onLine) handleSync();
    };

    window.addEventListener('online', handleStatus);
    window.addEventListener('offline', handleStatus);

    return () => {
      window.removeEventListener('online', handleStatus);
      window.removeEventListener('offline', handleStatus);
    };
  }, []);

  const handleSync = async () => {
    setIsSyncing(true);
    const res = await MobileExperienceService.syncOnReconnect();
    setOfflineCount(MobileExperienceService.getQueue().length);
    setIsSyncing(false);
    if (res.synced > 0) alert(`☁️ Sincronización completada: ${res.synced} acciones procesadas.`);
  };

  const handleMobileAction = (action: string) => {
    alert(`📱 [Demo Móvil] Iniciando: ${action}\n(Esta función usaría la API nativa del dispositivo)`);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 pointer-events-none">
      
      {/* Offline Indicator */}
      {!isOnline && (
        <div className="pointer-events-auto bg-amber-500 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 text-sm font-bold animate-pulse">
          <WifiOff className="w-4 h-4" />
          <span>Modo Offline ({offlineCount})</span>
        </div>
      )}

      {/* Sync Indicator */}
      {isSyncing && (
        <div className="pointer-events-auto bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 text-sm font-bold">
          <RefreshCw className="w-4 h-4 animate-spin" />
          <span>Sincronizando...</span>
        </div>
      )}

      {/* Floating Actions (FAB) */}
      <div className="pointer-events-auto flex flex-col gap-3 items-end">
        {expanded && (
          <>
            <button 
               onClick={() => handleMobileAction('Cámara para Briefing')}
               className="w-12 h-12 bg-white text-slate-700 rounded-full shadow-lg flex items-center justify-center hover:bg-slate-50 transition-all border border-slate-200"
               title="Escanear Briefing"
            >
              <Camera className="w-5 h-5" />
            </button>
            <button 
               onClick={() => handleMobileAction('Grabación de Voz Rápida')}
               className="w-12 h-12 bg-white text-slate-700 rounded-full shadow-lg flex items-center justify-center hover:bg-slate-50 transition-all border border-slate-200"
               title="Grabar Mención"
            >
              <Mic className="w-5 h-5" />
            </button>
          </>
        )}
        
        <button
          onClick={() => setExpanded(!expanded)}
          className={`w-14 h-14 rounded-full shadow-2xl flex items-center justify-center text-white transition-all transform hover:scale-105 active:scale-95 ${isOnline ? 'bg-violet-600 hover:bg-violet-700' : 'bg-slate-600'}`}
        >
          {expanded ? <Save className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
        </button>
      </div>
    </div>
  );
};
