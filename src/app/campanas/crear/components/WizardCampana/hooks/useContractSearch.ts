/**
 * 📋 useContractSearch - Búsqueda Inteligente de Contratos TIER0
 * 
 * Hook para buscar y vincular contratos existentes a nuevas campañas.
 * Permite auto-llenar datos desde contratos confirmados.
 * 
 * @enterprise TIER0 Fortune 10
 * @version 2050.1.0
 */

import { useState, useCallback } from 'react';

// ==================== INTERFACES ====================

export interface ContratoResumen {
  id: string;
  numero: string;
  anunciante: string;
  producto: string;
  estado: 'activo' | 'pendiente' | 'vencido' | 'cancelado';
  fechaInicio: string;
  fechaFin: string;
  valorTotal: number;
  saldoDisponible: number;
  ejecutivo: string;
  agenciaMedios?: string;
  agenciaCreativa?: string;
  emisoraPrincipal: string;
  emisorasSecundarias: string[];
  tarifaNegociada: {
    modalidad: 'paquete' | 'spot';
    valorBruto: number;
    descuentoAgencia: number;
    descuentoVolumen: number;
    comisionAgencia: number;
  };
  ordenesGeneradas: number;
  campanasActivas: number;
}

export interface DatosPreCarga {
  nombre: string;
  anunciante: string;
  producto: string;
  referenciaCliente: string;
  fechaInicio: string;
  fechaFin: string;
  ejecutivo: string;
  agenciaMedios: string;
  agenciaCreativa: string;
  emisoraPrincipal: string;
  modalidad: 'paquete' | 'spot';
  valorBruto: number;
  descuentos: { nombre: string; porcentaje: number; activo: boolean }[];
  comisionAgencia: number;
}

export interface ContractSearchState {
  isSearching: boolean;
  resultados: ContratoResumen[];
  contratoSeleccionado: ContratoResumen | null;
  datosPreCarga: DatosPreCarga | null;
  error: string | null;
}

// ==================== DATOS MOCK TIER0 ====================

const MOCK_CONTRATOS: ContratoResumen[] = [
  {
    id: 'con_001',
    numero: 'CON-2025-0001',
    anunciante: 'BANCO DE CHILE',
    producto: 'Tarjeta de Crédito Premium',
    estado: 'activo',
    fechaInicio: '2025-01-01',
    fechaFin: '2025-12-31',
    valorTotal: 85000000,
    saldoDisponible: 42000000,
    ejecutivo: 'Ana García',
    agenciaMedios: 'Carat Chile',
    agenciaCreativa: 'McCann Santiago',
    emisoraPrincipal: 'T13 Radio',
    emisorasSecundarias: ['Play FM', 'Sonar FM'],
    tarifaNegociada: {
      modalidad: 'paquete',
      valorBruto: 25000000,
      descuentoAgencia: 5,
      descuentoVolumen: 3,
      comisionAgencia: 15
    },
    ordenesGeneradas: 3,
    campanasActivas: 1
  },
  {
    id: 'con_002',
    numero: 'CON-2025-0002',
    anunciante: 'FALABELLA',
    producto: 'CMR Puntos',
    estado: 'activo',
    fechaInicio: '2025-03-01',
    fechaFin: '2025-06-30',
    valorTotal: 120000000,
    saldoDisponible: 75000000,
    ejecutivo: 'Carlos Mendoza',
    agenciaMedios: 'OMD Chile',
    agenciaCreativa: 'Prolam Y&R',
    emisoraPrincipal: 'T13 Radio',
    emisorasSecundarias: ['Tele13 Radio'],
    tarifaNegociada: {
      modalidad: 'spot',
      valorBruto: 45000000,
      descuentoAgencia: 8,
      descuentoVolumen: 5,
      comisionAgencia: 12
    },
    ordenesGeneradas: 5,
    campanasActivas: 2
  },
  {
    id: 'con_003',
    numero: 'CON-2025-0003',
    anunciante: 'ENTEL',
    producto: 'Plan Familia 5G',
    estado: 'activo',
    fechaInicio: '2025-02-15',
    fechaFin: '2025-08-15',
    valorTotal: 65000000,
    saldoDisponible: 50000000,
    ejecutivo: 'María Torres',
    agenciaMedios: 'PHD Media',
    emisoraPrincipal: 'Play FM',
    emisorasSecundarias: ['T13 Radio'],
    tarifaNegociada: {
      modalidad: 'paquete',
      valorBruto: 18000000,
      descuentoAgencia: 4,
      descuentoVolumen: 2,
      comisionAgencia: 14
    },
    ordenesGeneradas: 2,
    campanasActivas: 1
  },
  {
    id: 'con_004',
    numero: 'CON-2024-0089',
    anunciante: 'COCA-COLA',
    producto: 'Coca-Cola Sin Azúcar',
    estado: 'activo',
    fechaInicio: '2024-09-01',
    fechaFin: '2025-03-31',
    valorTotal: 200000000,
    saldoDisponible: 35000000,
    ejecutivo: 'Roberto Silva',
    agenciaMedios: 'Starcom',
    agenciaCreativa: 'Ogilvy',
    emisoraPrincipal: 'T13 Radio',
    emisorasSecundarias: ['Play FM', 'Sonar FM', 'Tele13 Radio'],
    tarifaNegociada: {
      modalidad: 'paquete',
      valorBruto: 55000000,
      descuentoAgencia: 10,
      descuentoVolumen: 8,
      comisionAgencia: 10
    },
    ordenesGeneradas: 12,
    campanasActivas: 3
  }
];

// ==================== HOOK PRINCIPAL ====================

export function useContractSearch() {
  const [state, setState] = useState<ContractSearchState>({
    isSearching: false,
    resultados: [],
    contratoSeleccionado: null,
    datosPreCarga: null,
    error: null
  });

  /**
   * Buscar contratos por término
   */
  const buscarContratos = useCallback(async (termino: string) => {
    if (!termino || termino.length < 2) {
      setState(prev => ({ ...prev, resultados: [], error: null }));
      return;
    }

    setState(prev => ({ ...prev, isSearching: true, error: null }));

    // Simular latencia de API
    await new Promise(resolve => setTimeout(resolve, 400));

    const terminoLower = termino.toLowerCase();
    const resultados = MOCK_CONTRATOS.filter(c => 
      c.numero.toLowerCase().includes(terminoLower) ||
      c.anunciante.toLowerCase().includes(terminoLower) ||
      c.producto.toLowerCase().includes(terminoLower) ||
      c.ejecutivo.toLowerCase().includes(terminoLower)
    );

    setState(prev => ({
      ...prev,
      isSearching: false,
      resultados
    }));

    return resultados;
  }, []);

  /**
   * Seleccionar contrato y generar datos de pre-carga
   */
  const seleccionarContrato = useCallback((contratoId: string) => {
    const contrato = MOCK_CONTRATOS.find(c => c.id === contratoId);
    
    if (!contrato) {
      setState(prev => ({ ...prev, error: 'Contrato no encontrado' }));
      return null;
    }

    // Generar datos para pre-llenar el wizard
    const datosPreCarga: DatosPreCarga = {
      nombre: `Campaña ${contrato.producto} - ${new Date().toLocaleDateString('es-CL', { month: 'long', year: 'numeric' })}`,
      anunciante: contrato.anunciante,
      producto: contrato.producto,
      referenciaCliente: contrato.numero,
      fechaInicio: new Date().toISOString().split('T')[0],
      fechaFin: contrato.fechaFin,
      ejecutivo: contrato.ejecutivo,
      agenciaMedios: contrato.agenciaMedios || '',
      agenciaCreativa: contrato.agenciaCreativa || '',
      emisoraPrincipal: contrato.emisoraPrincipal,
      modalidad: contrato.tarifaNegociada.modalidad,
      valorBruto: contrato.tarifaNegociada.valorBruto,
      descuentos: [
        { nombre: 'Descuento Agencia', porcentaje: contrato.tarifaNegociada.descuentoAgencia, activo: true },
        { nombre: 'Descuento Volumen', porcentaje: contrato.tarifaNegociada.descuentoVolumen, activo: true }
      ],
      comisionAgencia: contrato.tarifaNegociada.comisionAgencia
    };

    setState(prev => ({
      ...prev,
      contratoSeleccionado: contrato,
      datosPreCarga,
      error: null
    }));

    return datosPreCarga;
  }, []);

  /**
   * Verificar disponibilidad de saldo en contrato
   */
  const verificarSaldo = useCallback((contratoId: string, montoRequerido: number): {
    disponible: boolean;
    saldoActual: number;
    diferencia: number;
    mensaje: string;
  } => {
    const contrato = MOCK_CONTRATOS.find(c => c.id === contratoId);
    
    if (!contrato) {
      return {
        disponible: false,
        saldoActual: 0,
        diferencia: montoRequerido,
        mensaje: 'Contrato no encontrado'
      };
    }

    const disponible = contrato.saldoDisponible >= montoRequerido;
    const diferencia = contrato.saldoDisponible - montoRequerido;

    return {
      disponible,
      saldoActual: contrato.saldoDisponible,
      diferencia,
      mensaje: disponible 
        ? `Saldo suficiente. Quedará $${diferencia.toLocaleString()} disponible.`
        : `Saldo insuficiente. Faltan $${Math.abs(diferencia).toLocaleString()}.`
    };
  }, []);

  /**
   * Obtener historial de campañas del contrato
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const obtenerHistorialCampanas = useCallback(async (_contratoId: string) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Mock de campañas históricas
    return [
      { id: 'camp_001', nombre: 'Campaña Enero', estado: 'completada', valor: 8000000 },
      { id: 'camp_002', nombre: 'Campaña Febrero', estado: 'activa', valor: 12000000 }
    ];
  }, []);

  /**
   * Limpiar selección
   */
  const limpiarSeleccion = useCallback(() => {
    setState(prev => ({
      ...prev,
      contratoSeleccionado: null,
      datosPreCarga: null,
      resultados: []
    }));
  }, []);

  return {
    ...state,
    buscarContratos,
    seleccionarContrato,
    verificarSaldo,
    obtenerHistorialCampanas,
    limpiarSeleccion
  };
}

export default useContractSearch;
