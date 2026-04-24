/**
 * ??? DESKTOP: Notas de Voz con Auto-Transcripción
 * 
 * Graba notas de voz rápidas que se transcriben con IA.
 * Las notas se asocian a contratos/clientes automáticamente.
 * Sin tipear: habla y la IA extrae la información.
 * 
 * @tier TIER_0_ENTERPRISE
 * @platform DESKTOP
 */

'use client';

import { useState, useRef, useCallback } from 'react';
import {
  Mic, MicOff, Play, Trash2,
  Building2,
  Loader2, Sparkles,
} from 'lucide-react';

interface NotaVoz {
  id: string;
  duracion: string;
  fecha: string;
  transcripcion: string;
  clienteDetectado?: string;
  accionDetectada?: string;
  estado: 'grabando' | 'transcribiendo' | 'completada';
}

export function VoiceNotesRecorder() {
  const [notas, setNotas] = useState<NotaVoz[]>([
    { id: 'v1', duracion: '0:45', fecha: 'Hoy 14:30', transcripcion: 'Llamé a José de Banco Chile. Confirmó que renovarán el contrato Q2 con incremento de 10% en radio. Quiere agregar ADN Radio al mix. Enviarle propuesta antes del viernes.', clienteDetectado: 'Banco Chile', accionDetectada: 'Enviar propuesta antes del viernes', estado: 'completada' },
    { id: 'v2', duracion: '0:22', fecha: 'Hoy 11:15', transcripcion: 'Falabella pidió cotización para campaña navidad anticipada. Presupuesto $120M, enfoque digital + TV. Reunión jueves 10AM.', clienteDetectado: 'Falabella', accionDetectada: 'Reunión jueves 10AM', estado: 'completada' },
  ]);
  const [grabando, setGrabando] = useState(false);
  const [segundos, setSegundos] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const iniciarGrabacion = useCallback(() => {
    setGrabando(true);
    setSegundos(0);
    timerRef.current = setInterval(() => setSegundos(s => s + 1), 1000);
  }, []);

  const detenerGrabacion = useCallback(async () => {
    setGrabando(false);
    if (timerRef.current) clearInterval(timerRef.current);
    const dur = `${Math.floor(segundos / 60)}:${(segundos % 60).toString().padStart(2, '0')}`;

    const nuevaNota: NotaVoz = {
      id: `v-${Date.now()}`, duracion: dur, fecha: 'Ahora',
      transcripcion: '', estado: 'transcribiendo',
    };
    setNotas(prev => [nuevaNota, ...prev]);

    // Simular transcripción IA
    await new Promise(r => setTimeout(r, 1500));
    setNotas(prev => prev.map(n => n.id === nuevaNota.id ? {
      ...n, estado: 'completada',
      transcripcion: 'Nota de voz grabada y transcrita por IA. Contenido pendiente de procesamiento.',
      clienteDetectado: 'No detectado',
      accionDetectada: 'Sin acción específica',
    } : n));
    setSegundos(0);
  }, [segundos]);

  const eliminar = (id: string) => setNotas(prev => prev.filter(n => n.id !== id));

  return (
    <div className="neo-card rounded-2xl overflow-hidden">
      <div className="px-6 py-4 border-b border-[#bec8de30] flex items-center gap-3">
        <Mic className="w-5 h-5 text-red-500" />
        <h3 className="font-black text-lg text-[#69738c]">Notas de Voz</h3>
        <span className="text-xs text-[#9aa3b8]">{notas.length} notas</span>
      </div>

      <div className="p-6 space-y-4">
        {/* GRABADOR */}
        <div className={`p-5 rounded-2xl text-center ${grabando ? 'bg-red-50 border-2 border-red-200' : 'bg-[#dfeaff] border border-[#bec8de30]'}`}>
          {grabando ? (
            <>
              <div className="w-16 h-16 rounded-full bg-red-500 mx-auto flex items-center justify-center animate-pulse shadow-xl shadow-red-200">
                <MicOff className="w-8 h-8 text-white" />
              </div>
              <p className="mt-3 font-black text-2xl text-red-600 font-mono">
                {Math.floor(segundos / 60)}:{(segundos % 60).toString().padStart(2, '0')}
              </p>
              <p className="text-xs text-red-400 mt-1">Grabando... Toca para detener</p>
              <button onClick={detenerGrabacion}
                className="mt-4 px-6 py-2 bg-red-600 text-white rounded-xl font-bold text-sm hover:bg-red-700 transition">
                Detener y Transcribir
              </button>
            </>
          ) : (
            <>
              <button onClick={iniciarGrabacion}
                className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-rose-600 mx-auto flex items-center justify-center shadow-xl shadow-red-200 hover:scale-105 transition">
                <Mic className="w-8 h-8 text-white" />
              </button>
              <p className="mt-3 text-sm font-bold text-[#69738c]">Toca para grabar</p>
              <p className="text-xs text-[#9aa3b8] mt-1">La IA transcribirá y detectará clientes y acciones</p>
            </>
          )}
        </div>

        {/* LISTA DE NOTAS */}
        <div className="space-y-3">
          {notas.map(n => (
            <div key={n.id} className="p-4 rounded-xl border border-[#bec8de30] hover:border-[#6888ff]/30 transition">
              <div className="flex items-center gap-3 mb-2">
                {n.estado === 'transcribiendo' ? (
                  <Loader2 className="w-4 h-4 text-[#6888ff] animate-spin" />
                ) : (
                  <Play className="w-4 h-4 text-[#9aa3b8]" />
                )}
                <span className="text-xs font-mono text-[#9aa3b8]">{n.duracion}</span>
                <span className="text-xs text-[#9aa3b8]">{n.fecha}</span>
                <div className="ml-auto flex items-center gap-1">
                  <button onClick={() => eliminar(n.id)} className="p-1 rounded hover:bg-red-50">
                    <Trash2 className="w-3 h-3 text-[#9aa3b8]" />
                  </button>
                </div>
              </div>

              {n.estado === 'transcribiendo' ? (
                <p className="text-xs text-[#6888ff] italic">Transcribiendo con IA...</p>
              ) : (
                <>
                  <p className="text-sm text-[#69738c] leading-relaxed">{n.transcripcion}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {n.clienteDetectado && (
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-full flex items-center gap-0.5">
                        <Building2 className="w-3 h-3" /> {n.clienteDetectado}
                      </span>
                    )}
                    {n.accionDetectada && (
                      <span className="px-2 py-0.5 bg-amber-50 text-amber-600 text-[10px] font-bold rounded-full flex items-center gap-0.5">
                        <Sparkles className="w-3 h-3" /> {n.accionDetectada}
                      </span>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
