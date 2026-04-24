'use client';

import { useState, useCallback, useRef } from 'react';
import type { FlujoState, PasoFlujo, Anunciante, Contrato, Campana, Emisora, SPXItem, RegistroResultado, HistorialEntry } from '../_types';

// ─── Hook para manejar el estado del flujo de búsqueda ───
export function useBusquedaFlow() {
    const [state, setState] = useState<FlujoState>({
        paso: 'anunciante',
        anunciante: null,
        contrato: null,
        campana: null,
        emisorasSeleccionadas: [],
        fecha: '',
        hora: '',
        spxSeleccionados: [],
        resultados: [],
        loading: false,
        error: null,
    });

    const debounceRef = useRef<NodeJS.Timeout | null>(null);

    // ─── Avanza al siguiente paso ───
    const avanzar = useCallback((sigPaso: PasoFlujo) => {
        setState(prev => ({ ...prev, paso: sigPaso, error: null }));
    }, []);

    // ─── Retrocede un paso ───
    const retroceder = useCallback(() => {
        setState(prev => {
            const pasos: PasoFlujo[] = ['anunciante', 'contrato', 'campana', 'radio', 'fecha', 'spx', 'resultado', 'exportar'];
            const idxActual = pasos.indexOf(prev.paso);
            if (idxActual <= 0) return prev;
            return { ...prev, paso: pasos[idxActual - 1], error: null };
        });
    }, []);

    // ─── Seleccionar anunciante y cargar contratos ───
    const seleccionarAnunciante = useCallback(async (anunciante: Anunciante) => {
        setState(prev => ({ ...prev, anunciante, loading: true, error: null }));
        try {
            const year = new Date().getFullYear();
            const resp = await fetch(`/api/contratos?anuncianteId=${anunciante.id}&estado=activo&year=${year}`);
            const json = await resp.json();
            const contratos: Contrato[] = json.data?.contratos || json.data || [];

            if (contratos.length === 0) {
                setState(prev => ({ ...prev, loading: false, error: 'No hay contratos activos para el año en curso' }));
            } else {
                setState(prev => ({ ...prev, loading: false }));
                avanzar('contrato');
            }
        } catch {
            setState(prev => ({ ...prev, loading: false, error: 'Error al cargar contratos' }));
        }
    }, [avanzar]);

    // ─── Seleccionar contrato y cargar campañas ───
    const seleccionarContrato = useCallback(async (contrato: Contrato) => {
        setState(prev => ({ ...prev, contrato, loading: true, error: null }));
        try {
            const resp = await fetch(`/api/campanas?contratoId=${contrato.id}&estado=en_aire`);
            const json = await resp.json();
            const campanas: Campana[] = json.data || [];

            if (campanas.length === 0) {
                setState(prev => ({ ...prev, loading: false, error: 'Este contrato no tiene campañas activas' }));
            } else {
                setState(prev => ({ ...prev, loading: false }));
                avanzar('campana');
            }
        } catch {
            setState(prev => ({ ...prev, loading: false, error: 'Error al cargar campañas' }));
        }
    }, [avanzar]);

    // ─── Seleccionar campaña ───
    const seleccionarCampana = useCallback(async (campana: Campana) => {
        setState(prev => ({ ...prev, campana, loading: true, error: null }));
        try {
            const resp = await fetch(`/api/emisoras?campanaId=${campana.id}`);
            const json = await resp.json();
            const emisoras: Emisora[] = json.data || [];

            setState(prev => ({ ...prev, loading: false }));
            // Si no hay emisoras o son pocas, se puede saltar el paso de radio
            if (emisoras.length <= 1) {
                avanzar('fecha');
            } else {
                avanzar('radio');
            }
        } catch {
            setState(prev => ({ ...prev, loading: false }));
            avanzar('fecha');
        }
    }, [avanzar]);

    // ─── Seleccionar emisoras (opcional) ───
    const seleccionarEmisoras = useCallback((emisoras: Emisora[]) => {
        setState(prev => ({ ...prev, emisorasSeleccionadas: emisoras }));
        avanzar('fecha');
    }, [avanzar]);

    // ─── Saltar paso de radio ───
    const saltarRadio = useCallback(() => {
        setState(prev => ({ ...prev, emisorasSeleccionadas: [] }));
        avanzar('fecha');
    }, [avanzar]);

    // ─── Seleccionar SPX items ───
    const seleccionarSPX = useCallback((spxItems: SPXItem[]) => {
        setState(prev => ({ ...prev, spxSeleccionados: spxItems }));
    }, []);

    // ─── Seleccionar fecha y cargar SPX ───
    const seleccionarFecha = useCallback(async (fecha: string) => {
        setState(prev => ({ ...prev, fecha, hora: '', loading: true, error: null }));
        try {
            const params = new URLSearchParams({ campanaId: state.campana!.id, fecha });
            if (state.emisorasSeleccionadas.length > 0) {
                params.set('emisorasIds', state.emisorasSeleccionadas.map(e => e.id).join(','));
            }
            const resp = await fetch(`/api/registro-emision/buscar/spx?${params.toString()}`);
            const json = await resp.json();
            const spxList: SPXItem[] = json.data || [];

            setState(prev => ({ ...prev, loading: false }));
            if (spxList.length === 0) {
                setState(prev => ({ ...prev, error: 'No hay SPX para la fecha seleccionada' }));
            } else {
                avanzar('spx');
            }
        } catch {
            setState(prev => ({ ...prev, loading: false, error: 'Error al cargar SPX' }));
        }
    }, [state.campana, state.emisorasSeleccionadas, avanzar]);

    // ─── Ejecutar búsqueda con rango ±10 min ───
    const ejecutarBusqueda = useCallback(async () => {
        if (!state.fecha || !state.campana) return;

        const spxSeleccionados = state.spxSeleccionados;
        setState(prev => ({ ...prev, loading: true, error: null }));

        try {
            // Calcular rango ±10 minutos para cada SPX
            const spxParams = spxSeleccionados.map(spx => {
                const [h, m] = spx.hora.split(':').map(Number);
                const totalMin = h * 60 + m;
                const inicioMin = Math.max(0, totalMin - 10);
                const finMin = totalMin + 10;
                const fmt = (t: number) => `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}:00`;
                return {
                    id: spx.id,
                    codigo: spx.codigo || spx.spxCode,
                    horaInicio: fmt(inicioMin),
                    horaFin: fmt(finMin),
                };
            });

            // Llamar al API de búsqueda
            const resp = await fetch('/api/registro-emision/buscar/registro', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    campanaId: state.campana!.id,
                    fecha: state.fecha,
                    spxList: spxParams,
                }),
            });

            const json = await resp.json();
            const resultados: RegistroResultado[] = json.data || [];

            setState(prev => ({ ...prev, resultados, loading: false }));
            avanzar('resultado');
        } catch {
            setState(prev => ({ ...prev, loading: false, error: 'Error en la búsqueda' }));
        }
    }, [state.fecha, state.campana, state.emisorasSeleccionadas, state.spxSeleccionados, avanzar]);

    // ─── Ir a exportar ───
    const irAExportar = useCallback(() => {
        avanzar('exportar');
    }, [avanzar]);

    // ─── Cerrar popup y notificar al padre ───
    const cerrarYNotificar = useCallback((historialEntry?: HistorialEntry) => {
        if (historialEntry && window.opener) {
            window.opener.postMessage({
                type: 'NUEVA_BUSQUEDA_COMPLETADA',
                payload: historialEntry,
            }, window.location.origin);
        }
        window.close();
    }, []);

    // ─── Reset completo ───
    const resetFlow = useCallback(() => {
        setState({
            paso: 'anunciante',
            anunciante: null,
            contrato: null,
            campana: null,
            emisorasSeleccionadas: [],
            fecha: '',
            hora: '',
            spxSeleccionados: [],
            resultados: [],
            loading: false,
            error: null,
        });
    }, []);

    return {
        state,
        avanzar,
        retroceder,
        seleccionarAnunciante,
        seleccionarContrato,
        seleccionarCampana,
        seleccionarEmisoras,
        saltarRadio,
        seleccionarSPX,
        seleccionarFecha,
        ejecutarBusqueda,
        irAExportar,
        cerrarYNotificar,
        resetFlow,
        debounceRef,
    };
}

// ─── Hook para búsqueda debounced de anunciantes ───
export function useAnuncianteSearch(onResults: (results: Anunciante[]) => void) {
    const debounceRef = useRef<NodeJS.Timeout | null>(null);

    const buscar = useCallback((query: string) => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        if (!query.trim()) { onResults([]); return; }

        debounceRef.current = setTimeout(() => {
            fetch(`/api/anunciantes?search=${encodeURIComponent(query)}&limit=10`)
                .then(r => r.json())
                .then(j => onResults(j.data || []))
                .catch(() => onResults([]));
        }, 300);
    }, [onResults]);

    return { buscar };
}