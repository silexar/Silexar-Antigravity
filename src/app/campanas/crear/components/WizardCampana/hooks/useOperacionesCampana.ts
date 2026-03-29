/**
 * 🔌 SILEXAR PULSE - Hooks de Datos para Operaciones 2050
 * 
 * @description Hooks React Query para conectar componentes
 * con la base de datos a través de API routes.
 * 
 * @version 2050.1.0
 * @tier TIER_0_FORTUNE_10
 */

import { useState, useCallback, useMemo } from 'react';

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

export interface CunaGemela {
  id: string;
  cunaPrincipalId: string;
  cunaGemelaId: string;
  posicion: 'antes' | 'despues';
  separacionMaxima: number;
  mismoBloque: boolean;
  activo: boolean;
}

export interface NotaSpot {
  id: string;
  spotId: string;
  tipo: 'instruccion' | 'alerta' | 'info' | 'prioridad' | 'ubicacion';
  titulo: string;
  contenido?: string;
  prioridad: 'alta' | 'media' | 'baja';
  visibleEnLog: boolean;
  fijada: boolean;
  creadoPor: string;
  fechaCreacion: Date;
}

export interface ReglaCompetencia {
  id: string;
  anuncianteA: string;
  anuncianteB: string;
  separacionMinima: number;
  mismaTandaProhibida: boolean;
  prioridad: 'alta' | 'media' | 'baja';
  categoria: string;
  activa: boolean;
}

export interface HistorialOperacion {
  id: string;
  tipoOperacion: string;
  descripcion: string;
  entidadTipo: string;
  entidadId: string;
  datosAnteriores?: Record<string, unknown>;
  datosNuevos?: Record<string, unknown>;
  revertible: boolean;
  revertido: boolean;
  usuarioId: string;
  fechaOperacion: Date;
}

// ═══════════════════════════════════════════════════════════════
// HOOK: CUÑAS GEMELAS
// ═══════════════════════════════════════════════════════════════

export function useCunasGemelas(campanaId?: string) {
  const [vinculos, setVinculos] = useState<CunaGemela[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar vínculos
  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/campanas/cunas-gemelas${campanaId ? `?campanaId=${campanaId}` : ''}`);
      if (res.ok) {
        const data = await res.json();
        setVinculos(data);
      }
    } catch {
      setError('Error al cargar cuñas gemelas');
    } finally {
      setLoading(false);
    }
  }, [campanaId]);

  // Crear vínculo
  const vincular = useCallback(async (vinculo: Omit<CunaGemela, 'id'>) => {
    try {
      const res = await fetch('/api/campanas/cunas-gemelas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vinculo)
      });
      if (res.ok) {
        const nuevo = await res.json();
        setVinculos(prev => [...prev, nuevo]);
        return nuevo;
      }
    } catch {
      setError('Error al vincular cuñas');
    }
  }, []);

  // Desvincular
  const desvincular = useCallback(async (vinculoId: string) => {
    try {
      const res = await fetch(`/api/campanas/cunas-gemelas/${vinculoId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setVinculos(prev => prev.filter(v => v.id !== vinculoId));
      }
    } catch {
      setError('Error al desvincular cuñas');
    }
  }, []);

  return { vinculos, loading, error, cargar, vincular, desvincular };
}

// ═══════════════════════════════════════════════════════════════
// HOOK: NOTAS DE SPOTS
// ═══════════════════════════════════════════════════════════════

export function useNotasSpot(spotId: string) {
  const [notas, setNotas] = useState<NotaSpot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar notas
  const cargar = useCallback(async () => {
    if (!spotId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/campanas/spots/${spotId}/notas`);
      if (res.ok) {
        const data = await res.json();
        setNotas(data);
      }
    } catch {
      setError('Error al cargar notas');
    } finally {
      setLoading(false);
    }
  }, [spotId]);

  // Agregar nota
  const agregar = useCallback(async (nota: Omit<NotaSpot, 'id' | 'fechaCreacion' | 'creadoPor'>) => {
    try {
      const res = await fetch(`/api/campanas/spots/${spotId}/notas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nota)
      });
      if (res.ok) {
        const nueva = await res.json();
        setNotas(prev => [...prev, nueva]);
        return nueva;
      }
    } catch {
      setError('Error al agregar nota');
    }
  }, [spotId]);

  // Editar nota
  const editar = useCallback(async (nota: NotaSpot) => {
    try {
      const res = await fetch(`/api/campanas/spots/${spotId}/notas/${nota.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nota)
      });
      if (res.ok) {
        setNotas(prev => prev.map(n => n.id === nota.id ? nota : n));
      }
    } catch {
      setError('Error al editar nota');
    }
  }, [spotId]);

  // Eliminar nota
  const eliminar = useCallback(async (notaId: string) => {
    try {
      const res = await fetch(`/api/campanas/spots/${spotId}/notas/${notaId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setNotas(prev => prev.filter(n => n.id !== notaId));
      }
    } catch {
      setError('Error al eliminar nota');
    }
  }, [spotId]);

  return { notas, loading, error, cargar, agregar, editar, eliminar };
}

// ═══════════════════════════════════════════════════════════════
// HOOK: REGLAS COMPETENCIA
// ═══════════════════════════════════════════════════════════════

export function useReglasCompetencia() {
  const [reglas, setReglas] = useState<ReglaCompetencia[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar reglas
  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/campanas/reglas-competencia');
      if (res.ok) {
        const data = await res.json();
        setReglas(data);
      }
    } catch {
      setError('Error al cargar reglas');
    } finally {
      setLoading(false);
    }
  }, []);

  // Agregar regla
  const agregar = useCallback(async (regla: Omit<ReglaCompetencia, 'id'>) => {
    try {
      const res = await fetch('/api/campanas/reglas-competencia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(regla)
      });
      if (res.ok) {
        const nueva = await res.json();
        setReglas(prev => [...prev, nueva]);
        return nueva;
      }
    } catch {
      setError('Error al agregar regla');
    }
  }, []);

  // Toggle regla
  const toggle = useCallback(async (reglaId: string) => {
    try {
      const regla = reglas.find(r => r.id === reglaId);
      if (!regla) return;
      
      const res = await fetch(`/api/campanas/reglas-competencia/${reglaId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activa: !regla.activa })
      });
      if (res.ok) {
        setReglas(prev => prev.map(r => 
          r.id === reglaId ? { ...r, activa: !r.activa } : r
        ));
      }
    } catch {
      setError('Error al toggle regla');
    }
  }, [reglas]);

  // Eliminar regla
  const eliminar = useCallback(async (reglaId: string) => {
    try {
      const res = await fetch(`/api/campanas/reglas-competencia/${reglaId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setReglas(prev => prev.filter(r => r.id !== reglaId));
      }
    } catch {
      setError('Error al eliminar regla');
    }
  }, []);

  return { reglas, loading, error, cargar, agregar, toggle, eliminar };
}

// ═══════════════════════════════════════════════════════════════
// HOOK: HISTORIAL DE OPERACIONES (UNDO/REDO)
// ═══════════════════════════════════════════════════════════════

export function useHistorialOperaciones(campanaId?: string) {
  const [historial, setHistorial] = useState<HistorialOperacion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar historial
  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/campanas/historial${campanaId ? `?campanaId=${campanaId}` : ''}`);
      if (res.ok) {
        const data = await res.json();
        setHistorial(data);
      }
    } catch {
      setError('Error al cargar historial');
    } finally {
      setLoading(false);
    }
  }, [campanaId]);

  // Registrar operación
  const registrar = useCallback(async (operacion: Omit<HistorialOperacion, 'id' | 'fechaOperacion' | 'usuarioId' | 'revertido'>) => {
    try {
      const res = await fetch('/api/campanas/historial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(operacion)
      });
      if (res.ok) {
        const nueva = await res.json();
        setHistorial(prev => [nueva, ...prev]);
        return nueva;
      }
    } catch {
      setError('Error al registrar operación');
    }
  }, []);

  // Deshacer (Undo)
  const deshacer = useCallback(async (operacionId: string) => {
    try {
      const res = await fetch(`/api/campanas/historial/${operacionId}/undo`, {
        method: 'POST'
      });
      if (res.ok) {
        setHistorial(prev => prev.map(h => 
          h.id === operacionId ? { ...h, revertido: true } : h
        ));
        return true;
      }
    } catch {
      setError('Error al deshacer operación');
    }
    return false;
  }, []);

  // Última operación revertible
  const ultimaRevertible = useMemo(() => {
    return historial.find(h => h.revertible && !h.revertido);
  }, [historial]);

  return { historial, loading, error, cargar, registrar, deshacer, ultimaRevertible };
}

// ═══════════════════════════════════════════════════════════════
// HOOK: OPERACIONES BULK
// ═══════════════════════════════════════════════════════════════

export function useOperacionesBulk() {
  const [progreso, setProgreso] = useState(0);
  const [ejecutando, setEjecutando] = useState(false);
  const [resultado, setResultado] = useState<{ exito: number; error: number } | null>(null);

  // Ejecutar operación masiva
  const ejecutar = useCallback(async (
    accion: string,
    elementosIds: string[],
    parametros: Record<string, unknown>
  ) => {
    setEjecutando(true);
    setProgreso(0);
    setResultado(null);

    try {
      const total = elementosIds.length;
      let exito = 0;
      let errorCount = 0;

      for (let i = 0; i < total; i++) {
        try {
          const res = await fetch('/api/campanas/operaciones-bulk', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              accion,
              elementoId: elementosIds[i],
              parametros
            })
          });
          
          if (res.ok) {
            exito++;
          } else {
            errorCount++;
          }
        } catch {
          errorCount++;
        }
        
        setProgreso(((i + 1) / total) * 100);
      }

      setResultado({ exito, error: errorCount });
      return { exito, error: errorCount };
    } finally {
      setEjecutando(false);
    }
  }, []);

  // Resetear estado
  const resetear = useCallback(() => {
    setProgreso(0);
    setResultado(null);
  }, []);

  return { progreso, ejecutando, resultado, ejecutar, resetear };
}

export default {
  useCunasGemelas,
  useNotasSpot,
  useReglasCompetencia,
  useHistorialOperaciones,
  useOperacionesBulk
};
