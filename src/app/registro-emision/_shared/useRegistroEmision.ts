/**
 * 🔗 HOOK: useRegistroEmision
 * 
 * Hook centralizado para todas las operaciones del módulo Registro de Emisión.
 * Usado tanto por desktop como por mobile para garantizar paridad funcional.
 * 
 * @tier TIER_0_ENTERPRISE
 * @module registro-emision
 */

'use client';

import { useState, useCallback, useEffect } from 'react';
import type { 
  Registro, 
  Stats, 
  FiltroEstado, 
  GridBlock, 
  ResultadoVerificacion,
  Material 
} from './types';

// ═══════════════════════════════════════════════════════════════
// ESTADO INICIAL
// ═══════════════════════════════════════════════════════════════

const INITIAL_STATS: Stats = {
  total: 0,
  emitidos: 0,
  confirmados: 0,
  pendientes: 0,
  noEmitidos: 0,
  porcentajeEmision: 0,
  confianzaPromedio: 0,
};

// ═══════════════════════════════════════════════════════════════
// HOOK PRINCIPAL
// ═══════════════════════════════════════════════════════════════

export function useRegistroEmision() {
  const [registros, setRegistros] = useState<Registro[]>([]);
  const [stats, setStats] = useState<Stats>(INITIAL_STATS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [filtro, setFiltro] = useState<FiltroEstado>('todos');

  // ─── FETCH REGISTROS ────────────────────────────────────────
  const fetchRegistros = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const estadoParam = filtro !== 'todos' ? `&estado=${filtro}` : '';
      const response = await fetch(`/api/registro-emision?fecha=${fecha}${estadoParam}`);
      const data = await response.json();
      if (data.success) {
        setRegistros(data.data);
        setStats(data.stats);
      } else {
        setError(data.error || 'Error al obtener registros');
      }
    } catch {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  }, [fecha, filtro]);

  // Auto-fetch on date/filter change
  useEffect(() => { fetchRegistros(); }, [fetchRegistros]);

  // ─── CAMBIAR FECHA ──────────────────────────────────────────
  const cambiarFecha = useCallback((dias: number) => {
    setFecha(prev => {
      const nuevaFecha = new Date(prev);
      nuevaFecha.setDate(nuevaFecha.getDate() + dias);
      return nuevaFecha.toISOString().split('T')[0];
    });
  }, []);

  // ─── CONFIRMAR EMISIÓN ──────────────────────────────────────
  const confirmarEmision = useCallback(async (id: string) => {
    try {
      const response = await fetch('/api/registro-emision', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, confirmado: true, confianza: 100 }),
      });
      const data = await response.json();
      if (data.success) {
        await fetchRegistros();
        return { success: true };
      }
      return { success: false, error: data.error };
    } catch {
      return { success: false, error: 'Error de conexión' };
    }
  }, [fetchRegistros]);

  // ─── REGISTRAR MANUAL ───────────────────────────────────────
  const registrarManual = useCallback(async (registro: Registro) => {
    try {
      const response = await fetch('/api/registro-emision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          spotTandaId: registro.spotTandaId,
          cunaNombre: registro.cunaNombre,
          horaProgramada: registro.horaProgra,
          metodo: 'manual',
        }),
      });
      const data = await response.json();
      if (data.success) {
        await fetchRegistros();
        return { success: true };
      }
      return { success: false, error: data.error };
    } catch {
      return { success: false, error: 'Error de conexión' };
    }
  }, [fetchRegistros]);

  return {
    // State
    registros,
    stats,
    loading,
    error,
    fecha,
    filtro,
    // Actions
    setFecha,
    setFiltro,
    cambiarFecha,
    confirmarEmision,
    registrarManual,
    refresh: fetchRegistros,
  };
}

// ═══════════════════════════════════════════════════════════════
// HOOK: GRILLA
// ═══════════════════════════════════════════════════════════════

export function useGrilla() {
  const [blocks, setBlocks] = useState<GridBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGrilla = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/registro-emision/grilla');
      const data = await response.json();
      if (data.success) {
        setBlocks(data.data);
      } else {
        setError(data.error || 'Error al obtener grilla');
      }
    } catch {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchGrilla(); }, [fetchGrilla]);

  return { blocks, loading, error, refresh: fetchGrilla };
}

// ═══════════════════════════════════════════════════════════════
// HOOK: VERIFICACIÓN SIMULADA
// ═══════════════════════════════════════════════════════════════

const MOCK_SCHEDULE: Record<string, Material[]> = {
  '2024-12-14': [
    { id: '1', nombre: 'Spot Navidad A', tipo: 'audio_pregrabado', selected: true, duracion: 30, spxCode: 'SPX-901', horaProgramada: '08:15' },
    { id: '2', nombre: 'Mención Navidad B', tipo: 'mencion_vivo', selected: true, duracion: 15, spxCode: 'SPX-902', horaProgramada: '09:00' },
    { id: '3', nombre: 'Banner Promo C', tipo: 'display_banner', selected: true, duracion: 20, spxCode: 'SPX-903', horaProgramada: '10:30' },
    { id: '4', nombre: 'Spot Año Nuevo D', tipo: 'audio_pregrabado', selected: true, duracion: 30, spxCode: 'SPX-904', horaProgramada: '12:00' },
    { id: '5', nombre: 'Mención Flash E', tipo: 'mencion_vivo', selected: true, duracion: 10, spxCode: 'SPX-905', horaProgramada: '13:15' },
  ],
};

export function useVerificacion() {
  const [step, setStep] = useState(0); // 0=idle, 1=search, 2=select, 3=processing, 4=results
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [materials, setMaterials] = useState<Material[]>([]);
  const [results, setResults] = useState<ResultadoVerificacion[]>([]);
  const [progress, setProgress] = useState(0);
  const [processing, setProcessing] = useState(false);

  const searchCampana = useCallback((query: string) => {
    setSearchQuery(query);
    if (query.length >= 2) {
      setStep(1);
    }
  }, []);

  const selectDate = useCallback((date: string) => {
    setSelectedDate(date);
    const dayMaterials = MOCK_SCHEDULE[date] || MOCK_SCHEDULE['2024-12-14'] || [];
    setMaterials(dayMaterials);
    setStep(2);
  }, []);

  const toggleMaterial = useCallback((id: string) => {
    setMaterials(prev => prev.map(m => m.id === id ? { ...m, selected: !m.selected } : m));
  }, []);

  const startVerification = useCallback(async () => {
    setStep(3);
    setProcessing(true);
    setProgress(0);

    const selected = materials.filter(m => m.selected);

    // Simulate progress
    for (let i = 0; i <= 100; i += 5) {
      await new Promise(r => setTimeout(r, 120));
      setProgress(i);
    }

    // Generate mock results
    const mockResults: ResultadoVerificacion[] = selected.map((m, idx) => ({
      materialId: m.id,
      nombreMaterial: m.nombre,
      tipoMaterial: m.tipo === 'mencion_vivo' ? 'mencion_vivo' : m.tipo === 'display_banner' ? 'display_banner' : 'audio_pregrabado',
      encontrado: idx % 4 !== 3, // 75% found
      horaEmision: m.horaProgramada,
      horaFin: m.horaProgramada ? `${parseInt(m.horaProgramada.split(':')[0])}:${String(parseInt(m.horaProgramada.split(':')[1]) + (m.duracion || 30) / 60).padStart(2, '0')}` : undefined,
      emisora: 'Radio Silexar FM',
      accuracy: 85 + Math.floor(Math.random() * 15),
      spxCode: m.spxCode,
    }));

    setResults(mockResults);
    setProcessing(false);
    setStep(4);
  }, [materials]);

  const reset = useCallback(() => {
    setStep(0);
    setSearchQuery('');
    setSelectedDate('');
    setMaterials([]);
    setResults([]);
    setProgress(0);
    setProcessing(false);
  }, []);

  return {
    step,
    searchQuery,
    selectedDate,
    materials,
    results,
    progress,
    processing,
    searchCampana,
    selectDate,
    toggleMaterial,
    startVerification,
    reset,
    setStep,
  };
}
