'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Scissors, RotateCcw } from 'lucide-react';

interface WaveformEditorProps {
  clipUrl?: string;
  duracionTotalSegundos: number;
  onTrimChange: (inicioSegundos: number, finSegundos: number) => void;
}

export default function WaveformEditor({ duracionTotalSegundos, onTrimChange }: WaveformEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [startPercent, setStartPercent] = useState(0);
  const [endPercent, setEndPercent] = useState(100);
  const [dragging, setDragging] = useState<'start' | 'end' | null>(null);
  const [bars] = useState(() =>
    Array.from({ length: 80 }, () => 15 + Math.random() * 70)
  );

  const percentToSeconds = (pct: number) => Math.round((pct / 100) * duracionTotalSegundos);
  const secondsToTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  useEffect(() => {
    onTrimChange(percentToSeconds(startPercent), percentToSeconds(endPercent));
  }, [startPercent, endPercent]);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!dragging || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const pct = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
      if (dragging === 'start') {
        setStartPercent(Math.min(pct, endPercent - 5));
      } else {
        setEndPercent(Math.max(pct, startPercent + 5));
      }
    },
    [dragging, startPercent, endPercent]
  );

  const handleMouseUp = useCallback(() => setDragging(null), []);

  useEffect(() => {
    if (dragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [dragging, handleMouseMove, handleMouseUp]);

  const reset = () => {
    setStartPercent(0);
    setEndPercent(100);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          <Scissors className="h-4 w-4" /> Ajustar inicio y fin del clip
        </h3>
        <button
          onClick={reset}
          className="flex items-center gap-1 rounded-lg bg-slate-100 px-2 py-1 text-xs text-slate-600 hover:bg-slate-200"
        >
          <RotateCcw className="h-3 w-3" /> Reset
        </button>
      </div>

      <div
        ref={containerRef}
        className="relative h-32 select-none rounded-2xl bg-[#F0EDE8] p-2 shadow-[inset_6px_6px_12px_#d1cec9,inset_-6px_-6px_12px_#ffffff]"
      >
        {/* Waveform bars */}
        <div className="flex h-full items-center gap-[2px] overflow-hidden px-4">
          {bars.map((h, i) => {
            const pct = (i / bars.length) * 100;
            const inSelection = pct >= startPercent && pct <= endPercent;
            return (
              <div
                key={i}
                className="flex-1 rounded-full transition-colors"
                style={{
                  height: `${h}%`,
                  backgroundColor: inSelection ? '#059669' : '#cbd5e1',
                  opacity: inSelection ? 1 : 0.4,
                }}
              />
            );
          })}
        </div>

        {/* Start handle */}
        <div
          className="absolute top-0 h-full w-1 cursor-ew-resize bg-emerald-500 shadow-lg"
          style={{ left: `${startPercent}%` }}
          onMouseDown={() => setDragging('start')}
        >
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 rounded bg-emerald-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
            {secondsToTime(percentToSeconds(startPercent))}
          </div>
        </div>

        {/* End handle */}
        <div
          className="absolute top-0 h-full w-1 cursor-ew-resize bg-emerald-500 shadow-lg"
          style={{ left: `${endPercent}%` }}
          onMouseDown={() => setDragging('end')}
        >
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded bg-emerald-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
            {secondsToTime(percentToSeconds(endPercent))}
          </div>
        </div>

        {/* Selection overlay */}
        <div
          className="pointer-events-none absolute top-0 h-full bg-emerald-500/10"
          style={{
            left: `${startPercent}%`,
            width: `${endPercent - startPercent}%`,
          }}
        />
      </div>

      <div className="flex justify-between text-xs text-slate-500">
        <span>Inicio: {secondsToTime(percentToSeconds(startPercent))}</span>
        <span>Duración seleccionada: {secondsToTime(percentToSeconds(endPercent) - percentToSeconds(startPercent))}</span>
        <span>Fin: {secondsToTime(percentToSeconds(endPercent))}</span>
      </div>
    </div>
  );
}
