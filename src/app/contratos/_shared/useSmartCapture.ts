/**
 * 🧠 HOOK: Smart Contract Capture — Captura Inteligente de Contratos
 * 
 * Conecta el frontend con el motor IA de captura inteligente.
 * Soporta: voz, texto, WhatsApp, email, quick, foto.
 * Genera borradores COMPLETOS con líneas de emisora, facturación y aprobaciones.
 * 
 * @tier TIER_0_ENTERPRISE
 */

'use client';

import { useState, useCallback } from 'react';

// ═══════════════════════════════════════════════════════════════
// TIPOS BASE
// ═══════════════════════════════════════════════════════════════

export type MetodoCaptura = 'voice' | 'text' | 'whatsapp' | 'email' | 'quick' | 'photo';

export interface CampoDetectado {
  campo: string;
  valor: string | number;
  confianza: number;
  fuente: string;
}

// ═══════════════════════════════════════════════════════════════
// LÍNEAS DE PAUTA / EMISORA
// ═══════════════════════════════════════════════════════════════

export interface LineaPautaSugerida {
  id: string;
  medioId: string;
  medioNombre: string;
  categoria: 'Radio' | 'Televisión' | 'Digital' | 'Prensa';
  productoNombre: string;
  cantidad: number;
  tarifaUnitaria: number;
  descuento: number;
  subtotal: number;
  totalNeto: number;
  fechaInicio: string;
  fechaFin: string;
  horarioInicio?: string;
  horarioFin?: string;
  duracionSpot?: number; // segundos
  confianza: number;
  fuenteDeteccion: 'ia_voz' | 'ia_texto' | 'historial_cliente' | 'manual';
  disponibilidad?: {
    estado: 'disponible' | 'limitado' | 'saturado' | 'no_disponible';
    porcentaje: number;
  };
}

// ═══════════════════════════════════════════════════════════════
// CONDICIONES DE FACTURACIÓN
// ═══════════════════════════════════════════════════════════════

export interface CondicionesFacturacion {
  modalidad: 'mensual' | 'quincenal' | 'anticipada' | 'al_termino' | 'por_cuotas';
  tipoFactura: 'factura' | 'boleta' | 'nota_credito';
  diasPago: number;
  numeroCuotas?: number;
  requiereGarantia: boolean;
  montoGarantia?: number;
  descuentoProntoPago?: number;
  confianza: number;
}

// ═══════════════════════════════════════════════════════════════
// DATOS EXTRAÍDOS (expandido)
// ═══════════════════════════════════════════════════════════════

export interface DatosExtraidos {
  // Info del cliente
  clienteNombre: string;
  clienteId?: string;
  esClienteNuevo: boolean;
  // Contrato
  tipoContrato: string;
  valorEstimado: number;
  moneda: string;
  fechaInicio: string;
  fechaFin: string;
  duracionMeses: number;
  // Medios
  mediosDetectados: string[];
  lineasPauta: LineaPautaSugerida[];
  // Comercial
  descuento: number;
  condicionesPago: string;
  facturacion: CondicionesFacturacion;
  // Metadata
  urgencia: 'baja' | 'media' | 'alta';
  notasAdicionales: string;
  confianzaGlobal: number;
  camposDetectados: CampoDetectado[];
  camposFaltantes: string[];
  // Historial (auto-fill)
  contratoAnteriorId?: string;
  lineasClonadas: boolean;
}

// ═══════════════════════════════════════════════════════════════
// CONTRATO SUGERIDO (expandido)
// ═══════════════════════════════════════════════════════════════

export interface MedioSugerido {
  tipo: string;
  programa?: string;
  cantidad: number;
  valorUnitario: number;
  confianza: number;
}

export interface ContratoSugerido {
  titulo: string;
  cliente: { nombre: string; id?: string; esNuevo: boolean };
  valor: number;
  descuento: number;
  fechaInicio: string;
  fechaFin: string;
  terminosPago: number;
  medios: MedioSugerido[];
  // Nuevos: líneas de pauta completas
  lineasPauta: LineaPautaSugerida[];
  facturacion: CondicionesFacturacion;
  // Aprobaciones
  aprobacionRequerida: boolean;
  nivelAprobacion: 'ejecutivo' | 'jefatura' | 'gerencia' | 'directorio';
  motivoAprobacion?: string;
}

// ═══════════════════════════════════════════════════════════════
// RESULTADO DE CAPTURA
// ═══════════════════════════════════════════════════════════════

export interface ResultadoCaptura {
  success: boolean;
  borradorId: string;
  datosExtraidos: DatosExtraidos;
  contratoSugerido: ContratoSugerido;
  tiempoProcesamiento: number;
  metodo: string;
  requiereValidacion: boolean;
}

export interface BorradorEnCola {
  id: string;
  cliente: string;
  valor: number;
  metodo: string;
  confianza: number;
  requiereValidacion: boolean;
  timestamp: string;
  lineasPauta: number; // cantidad de líneas detectadas
}

// ═══════════════════════════════════════════════════════════════
// RESULTADO DE CONFIRMACIÓN
// ═══════════════════════════════════════════════════════════════

export interface ResultadoConfirmacion {
  success: boolean;
  contratoId: string;
  numero: string;
  estado: 'borrador' | 'pendiente_aprobacion' | 'activo';
  aprobadores?: { nombre: string; email: string; nivel: string }[];
  pdfUrl?: string;
  mensaje: string;
}

// ═══════════════════════════════════════════════════════════════
// HOOK: SMART CAPTURE
// ═══════════════════════════════════════════════════════════════

export function useSmartCapture() {
  const [processing, setProcessing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [resultado, setResultado] = useState<ResultadoCaptura | null>(null);
  const [confirmacion, setConfirmacion] = useState<ResultadoConfirmacion | null>(null);
  const [error, setError] = useState<string | null>(null);

  const procesar = useCallback(async (
    metodo: MetodoCaptura,
    datos: Record<string, unknown>
  ): Promise<ResultadoCaptura | null> => {
    setProcessing(true);
    setError(null);
    setResultado(null);
    setConfirmacion(null);

    try {
      const response = await fetch('/api/contratos/smart-capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ metodo, ejecutivoId: 'usr-001', datos }),
      });

      const data: ResultadoCaptura = await response.json();
      if (data.success) {
        setResultado(data);
        return data;
      } else {
        setError('Error procesando captura');
        return null;
      }
    } catch {
      setError('Error de conexión');
      return null;
    } finally {
      setProcessing(false);
    }
  }, []);

  // ─────────────────────────────────────────────────
  // CONFIRMAR BORRADOR → Crear contrato real
  // ─────────────────────────────────────────────────

  const confirmarBorrador = useCallback(async (
    borradorId: string,
    contratoFinal: ContratoSugerido
  ): Promise<ResultadoConfirmacion | null> => {
    setConfirming(true);
    setError(null);

    try {
      const response = await fetch('/api/contratos/smart-capture', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          borradorId, 
          contratoFinal,
          ejecutivoId: 'usr-001',
          accion: 'confirmar'
        }),
      });

      const data: ResultadoConfirmacion = await response.json();
      if (data.success) {
        setConfirmacion(data);
        return data;
      } else {
        setError('Error creando contrato');
        return null;
      }
    } catch {
      setError('Error de conexión');
      return null;
    } finally {
      setConfirming(false);
    }
  }, []);

  // ─────────────────────────────────────────────────
  // Actualizar línea de pauta individual
  // ─────────────────────────────────────────────────

  const actualizarLinea = useCallback((lineaId: string, cambios: Partial<LineaPautaSugerida>) => {
    setResultado(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        contratoSugerido: {
          ...prev.contratoSugerido,
          lineasPauta: prev.contratoSugerido.lineasPauta.map(l =>
            l.id === lineaId ? { ...l, ...cambios } : l
          ),
        },
      };
    });
  }, []);

  // ─────────────────────────────────────────────────
  // Agregar / eliminar líneas de pauta
  // ─────────────────────────────────────────────────

  const agregarLinea = useCallback((linea: LineaPautaSugerida) => {
    setResultado(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        contratoSugerido: {
          ...prev.contratoSugerido,
          lineasPauta: [...prev.contratoSugerido.lineasPauta, linea],
        },
      };
    });
  }, []);

  const eliminarLinea = useCallback((lineaId: string) => {
    setResultado(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        contratoSugerido: {
          ...prev.contratoSugerido,
          lineasPauta: prev.contratoSugerido.lineasPauta.filter(l => l.id !== lineaId),
        },
      };
    });
  }, []);

  // ─────────────────────────────────────────────────
  // Convenience methods
  // ─────────────────────────────────────────────────

  const captureVoice = useCallback((transcripcion: string) =>
    procesar('voice', { transcripcion }), [procesar]);

  const captureText = useCallback((texto: string) =>
    procesar('text', { texto }), [procesar]);

  const captureWhatsApp = useCallback((texto: string, remitente?: string) =>
    procesar('whatsapp', { texto, remitente }), [procesar]);

  const captureQuick = useCallback((datos: {
    clienteNombre: string;
    producto?: string;
    valorEstimado?: number;
    periodoInicio?: string;
    periodoFin?: string;
    notas?: string;
  }) => procesar('quick', datos), [procesar]);

  const captureEmail = useCallback((asunto: string, cuerpo: string) =>
    procesar('email', { asunto, cuerpo }), [procesar]);

  const reset = useCallback(() => {
    setResultado(null);
    setConfirmacion(null);
    setError(null);
  }, []);

  return {
    processing, confirming, resultado, confirmacion, error,
    captureVoice, captureText, captureWhatsApp, captureQuick, captureEmail,
    confirmarBorrador, actualizarLinea, agregarLinea, eliminarLinea,
    reset,
  };
}

// ═══════════════════════════════════════════════════════════════
// HOOK: VALIDATION QUEUE
// ═══════════════════════════════════════════════════════════════

export function useValidationQueue() {
  const [borradores, setBorradores] = useState<BorradorEnCola[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchQueue = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/contratos/smart-capture');
      const data = await response.json();
      if (data.success) {
        setBorradores(data.data);
      }
    } catch {
      // Silent fail
    } finally {
      setLoading(false);
    }
  }, []);

  return { borradores, loading, refresh: fetchQueue };
}
