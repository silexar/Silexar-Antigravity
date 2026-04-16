/**
 * 🎯 TIER 0 CAMPAIGN WIZARD TYPES
 * 
 * Defines the core data structures and state management for the 
 * Fortune 10 campaign creation flow.
 * 
 * @version 1.0.0
 * @tier TIER_0_SUPREMACY
 */

export type WizardStep = 
  | 'origen'
  | 'tapa'
  | 'tarifas'
  | 'facturacion'
  | 'lineas'
  | 'programacion'
  | 'revision';

export type MedioCampana = 'fm' | 'digital' | 'hibrido';

export interface EspecificacionDigitalData {
  plataformas?: string[];
  presupuestoDigital?: number;
  moneda?: 'CLP' | 'USD' | 'UF';
  tipoPresupuesto?: 'diario' | 'total';
  objetivos?: {
    alcance?: number;
    impresiones?: number;
    clics?: number;
  };
  trackingLinks?: string[];
  configuracionTargeting?: {
    edadMinima?: number;
    edadMaxima?: number;
    generos?: string[];
    regiones?: string[];
  };
  estado?: string;
  notas?: string;
}

export interface WizardState {
  currentStep: WizardStep;
  completedSteps: WizardStep[];
  canAdvance: boolean;
  isLoading: boolean;
  error?: string;
  
  // Data State
  origenData: {
    tipo: 'contrato' | 'nueva' | 'clon' | 'orden';
    contratoId?: string;
    campanaBaseId?: string;
    datosOrdenExtraidos?: unknown;
  };
  
  // Accumulated Campaign Data
  campanaDraft: {
    medio?: MedioCampana;
    // Tapa Data
    nombre?: string;
    anunciante?: string;
    producto?: string;
    referenciaCliente?: string;
    ordenAgencia?: string;
    ordenCompra?: string;
    hes?: string;
    
    fechaInicio?: string;
    fechaFin?: string;
    
    agenciaCreativa?: string;
    agenciaMedios?: string;
    ejecutivo?: string;
    emisoraPrincipal?: string;
    
    // Tarifas Data
    modalidad?: 'paquete' | 'spot';
    valorBruto?: number;
    descuentos?: { nombre: string; porcentaje: number; activo: boolean }[];
    comisionAgencia?: number;
    valorNeto?: number;

    // Facturacion Data
    estiloFacturacion?: 'posterior' | 'inmediata' | 'intercambio';
    facturacionPor?: 'mensual' | 'global' | 'por_linea';
    diasPago?: number;
    direccionFacturacion?: 'anunciante' | 'agencia' | 'otra';
    ordenFacturacion?: string;

    // Lineas Data
    lineas?: {
      id: string;
      programa: string;
      horaInicio: string;
      horaFin: string;
      dias: string[]; // ['LUN', 'MAR']
      cantidadDiaria: number;
      duracion: number;
      valorUnitario: number;
      total: number;
      emisoraId?: string;
      emisoraNombre?: string;
    }[];
    
    // Emisoras seleccionadas para validación
    emisorasSeleccionadas?: {
      id: string;
      nombre: string;
      enContrato: boolean;
    }[];

    // Control de Facturación y Bloqueo
    estado?: 'planificacion' | 'armada' | 'aprobacion' | 'confirmada' | 'programada' | 'en_aire' | 'pausada' | 'completada' | 'cancelada';
    facturada?: boolean;
    fechaFacturacion?: string;
    facturaId?: string;
    bloqueadaParaEdicion?: boolean;
    
    // Validación de especificaciones
    especificacionesValidadas?: boolean;
    motivoBloqueoEspecificaciones?: string;
    emisorasSinEspecificacion?: string[];
    
    // Digital specifications
    plataformas?: string[];
    presupuestoDigital?: number;
    moneda?: 'CLP' | 'USD' | 'UF';
    tipoPresupuesto?: 'diario' | 'total';
    objetivos?: {
      alcance?: number;
      impresiones?: number;
      clics?: number;
    };
    trackingLinks?: string[];
    configuracionTargeting?: {
      edadMinima?: number;
      edadMaxima?: number;
      generos?: string[];
      regiones?: string[];
    };
    notas?: string;
    
    // Future steps data can go here
  };
}

export interface WizardStepProps {
  isActive: boolean;
  onComplete: () => void;
  onBack: () => void;
}

export const WIZARD_STEPS: { id: WizardStep; label: string; icon: string }[] = [
  { id: 'origen', label: 'Origen', icon: 'Target' },
  { id: 'tapa', label: 'Campaña', icon: 'FileText' },
  { id: 'tarifas', label: 'Tarifas', icon: 'DollarSign' },
  { id: 'facturacion', label: 'Facturación', icon: 'Receipt' },
  { id: 'lineas', label: 'Líneas', icon: 'List' },
  { id: 'programacion', label: 'Programación', icon: 'Calendar' },
  { id: 'revision', label: 'Revisión', icon: 'CheckCircle' },
];
