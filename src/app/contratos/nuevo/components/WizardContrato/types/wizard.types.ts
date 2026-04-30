/**
 * 📋 SILEXAR PULSE - Tipos del Wizard de Contratos TIER 0
 *
 * @description Interfaces y tipos TypeScript para el sistema de creación
 * de contratos más avanzado del ecosistema publicitario.
 *
 * @version 2025.3.0
 * @tier TIER_0_FORTUNE_10
 * @classification ENTERPRISE_SECURITY
 * @futureProof 2050+
 */

// ═══════════════════════════════════════════════════════════════
// ENUMS Y CONSTANTES
// ═══════════════════════════════════════════════════════════════

export type WizardStep = 1 | 2 | 3 | 4 | 5 | 6;

export type EstadoContrato =
  | "borrador"
  | "revision"
  | "aprobacion"
  | "firmado"
  | "activo"
  | "pausado"
  | "finalizado"
  | "cancelado";

export type NivelRiesgo = "bajo" | "medio" | "alto" | "critico";

export type TipoContrato =
  | "nuevo"
  | "renovacion"
  | "programatico"
  | "marco_anual"
  | "express";

export type MedioContrato = "fm" | "digital" | "hibrido";

export type ModalidadFacturacion = "por_campana" | "cuotas";

export type TipoFactura = "posterior" | "adelantado" | "efectivo";

export type Moneda = "CLP" | "USD" | "UF";

export type NivelAprobacion =
  | "automatico"
  | "supervisor"
  | "gerente_comercial"
  | "gerente_general"
  | "directorio";

// ═══════════════════════════════════════════════════════════════
// INTERFACES DE DATOS PRINCIPALES
// ═══════════════════════════════════════════════════════════════

export interface AnuncianteSeleccionado {
  id: string;
  nombre: string;
  rut: string;
  logo?: string;
  scoreRiesgo?: number;
  nivelRiesgo?: NivelRiesgo;
  terminosPreferenciales?: {
    diasPago: number;
    limiteCredito: number;
    descuentoMaximo: number;
  };
  historialContratos?: {
    total: number;
    exitosos: number;
    valorHistorico: number;
  };
  ejecutivoAsignado?: {
    id: string;
    nombre: string;
    email: string;
  };
  industria?: string;
  esAgencia?: boolean;
  numeroDeudor?: string;
  ivaPorcentaje?: number;
}

export interface ProductoContrato {
  id: string;
  nombre: string;
  categoria: string;
  tarifaBase: number;
  descripcion?: string;
  unidad: string;
  disponibilidad: "disponible" | "limitado" | "agotado";
}

export interface CuotaFacturacion {
  indice: number;
  facturada: boolean;
  fechaFacturacion?: Date;
  numeroFactura?: string;
  montoFacturado?: number;
}

export interface TerminosPago {
  diasPago: number;
  modalidad: ModalidadFacturacion;
  tipoFactura: TipoFactura;
  numeroCuotas?: number;
  fechasPago?: Date[];
  requiereGarantia: boolean;
  montoGarantia?: number;
  descuentoProntoPago?: number;
  ivaPorcentaje?: number;
}

export interface AnalisisRiesgoCortex {
  score: number;
  maxScore: number;
  nivelRiesgo: NivelRiesgo;
  factoresPositivos: string[];
  factoresNegativos: string[];
  recomendaciones: {
    terminosPago: number;
    limiteCredito: number;
    descuentoMaximo: number;
    requiereGarantia: boolean;
  };
  indicadores: {
    historialPagos: number;
    tendenciaFacturacion: "creciente" | "estable" | "decreciente";
    industria: "estable" | "volatil" | "en_crecimiento";
    contratosExitosos: number;
  };
  fechaActualizacion: Date;
  confianza: number;
}

export interface EspecificacionDigitalData {
  plataformas: string[];
  presupuestoDigital?: number;
  moneda?: string;
  tipoPresupuesto?: "diario" | "total";
  objetivos?: Record<string, number>;
  trackingLinks?: string[];
  configuracionTargeting?: Record<string, any>;
  notas?: string;
}

export interface ValidacionInventario {
  medioId: string;
  medioNombre: string;
  estado: "disponible" | "limitado" | "saturado" | "no_disponible";
  disponibilidadPorcentaje: number;
  conflictos?: {
    tipo: "exclusividad" | "saturacion" | "bloqueo";
    descripcion: string;
    anuncianteBloqueante?: string;
  }[];
  horariosSugeridos?: {
    inicio: string;
    fin: string;
    disponibilidad: number;
  }[];
  alternativas?: {
    medioId: string;
    medioNombre: string;
    disponibilidad: number;
  }[];
}

export type TipoPauta =
  | "auspicios"
  | "prime"
  | "repartida"
  | "prime_determinada"
  | "repartida_determinada"
  | "tanda"
  | "tanda_noche"
  | "menciones";

export interface GrillaDiaSemana {
  dia: "L" | "M" | "X" | "J" | "V" | "S" | "D";
  cantidad: number;
  activo: boolean;
}

export interface EspecificacionPauta {
  id: string;
  // Nuevo modelo: emisora + paquete
  emisoraId: string;
  emisoraNombre: string;
  paqueteId: string;
  paqueteNombre: string;
  tipoPauta: TipoPauta;
  fechaInicio: Date | null;
  fechaFin: Date | null;
  // Para tipos con grilla semanal
  grillaSemanal?: GrillaDiaSemana[];
  // Para auspicios simples
  cantidad?: number;
  duracion?: number; // segundos: 15, 30, 45
  tarifaUnitaria: number;
  descuento?: number;
  totalNeto: number;
  // Legacy fields (compatibilidad)
  medioId?: string;
  medioNombre?: string;
  productoId?: string;
  productoNombre?: string;
  horarioInicio?: string;
  horarioFin?: string;
  subtotal?: number;
  validacionInventario?: ValidacionInventario;
  materialCreativo?: {
    cunaId?: string;
    estado: "disponible" | "pendiente" | "en_produccion";
  };
}

export interface AprobadorContrato {
  id: string;
  nombre: string;
  email: string;
  cargo: string;
  nivel: NivelAprobacion;
  estado: "pendiente" | "aprobado" | "rechazado" | "omitido";
  fechaRespuesta?: Date;
  comentarios?: string;
  tiempoLimite: Date;
}

export interface FlujoProbacion {
  nivelRequerido: NivelAprobacion;
  aprobadores: AprobadorContrato[];
  motivoEscalamiento?: string;
  valorContrato: number;
  porcentajeDescuento: number;
  terminosPago: number;
  esNuevoCliente: boolean;
  tieneExclusividad: boolean;
}

export interface DocumentoContrato {
  id: string;
  tipo: "contrato" | "anexo" | "orden_pauta" | "factura";
  nombre: string;
  url?: string;
  estado: "borrador" | "pendiente_firma" | "firmado" | "rechazado";
  firmantes: {
    id: string;
    nombre: string;
    email: string;
    rol: "cliente" | "empresa" | "testigo";
    estado: "pendiente" | "firmado" | "rechazado";
    fechaFirma?: Date;
  }[];
  fechaGeneracion: Date;
  fechaExpiracion?: Date;
  version: number;
}

// ═══════════════════════════════════════════════════════════════
// ESTADO DEL WIZARD
// ═══════════════════════════════════════════════════════════════

export interface WizardContratoState {
  // Navegación
  currentStep: WizardStep;
  completedSteps: WizardStep[];
  isLoading: boolean;
  isSaving: boolean;
  errors: Record<string, string>;

  // Paso 1: Información Fundamental
  numeroContrato: string;
  tipoContrato: TipoContrato;
  medio: MedioContrato;
  anunciante: AnuncianteSeleccionado | null;
  productosPrincipales: ProductoContrato[];
  campana: string;
  descripcion: string;
  fechaInicio: Date | null;
  fechaFin: Date | null;
  ejecutivoAsignado: {
    id: string;
    nombre: string;
  } | null;

  // Integración TIER 0 Módulo Propiedades
  propiedadesSeleccionadas: Array<{
    tipoCodigo: string;
    valorCodigoRef: string;
    nombre: string;
  }>;

  // Paso 2: Términos Comerciales
  analisisRiesgo: AnalisisRiesgoCortex | null;
  terminosPago: TerminosPago;
  valorBruto: number;
  descuentoPorcentaje: number;
  valorNeto: number;
  moneda: Moneda;
  esCanje: boolean;
  porcentajeCanje: number;
  comisionAgencia: number;
  facturarComisionAgencia: boolean;
  tieneComisionAgencia: boolean;
  agenciaMediosId?: string;
  agenciaCreativaId?: string;
  cuotasFacturacion: CuotaFacturacion[];

  // Paso 3: Especificaciones
  lineasEspecificacion: EspecificacionPauta[];
  validacionesInventario: ValidacionInventario[];
  requiereMaterialCreativo: boolean;
  materialesPendientes: string[];
  especificacionDigital?: EspecificacionDigitalData;

  // Paso 4: Aprobaciones
  flujoAprobacion: FlujoProbacion | null;
  notificacionesConfiguradas: boolean;
  escalamientoAutomatico: boolean;

  // Paso 5: Documentación
  documentos: DocumentoContrato[];
  firmaDigitalHabilitada: boolean;
  urlFirma?: string;

  // Paso 6: Autorización Anti-Fraude
  configuracionAntiFraude: {
    evidenciasSubidas: Array<{
      id: string;
      tipo:
        | "email_cliente"
        | "orden_compra"
        | "cotizacion_firmada"
        | "whatsapp_chat"
        | "grabacion_llamada"
        | "minuta_reunion"
        | "otro";
      nombre: string;
      url: string;
      fechaSubida: Date;
      subidoPor: { id: string; nombre: string };
      validado: boolean;
      validadoPor?: { id: string; nombre: string; fecha: Date };
      comentarios?: string;
      hash: string;
    }>;
    aprobaciones: Array<{
      nivel: "jefatura_directa" | "gerente_comercial" | "gerente_general";
      aprobadorId: string;
      aprobadorNombre: string;
      aprobadorEmail: string;
      estado: "pendiente" | "aprobado" | "rechazado";
      fecha?: Date;
      comentarios?: string;
      justificacion?: string;
      documentosAdjuntos?: Array<{ nombre: string; url: string }>;
    }>;
    justificacionDescuento?: {
      texto: string;
      documentos: Array<{ nombre: string; url: string }>;
      fechaCreacion: Date;
      creadoPor: { id: string; nombre: string };
    };
    estado:
      | "borrador"
      | "pendiente_evidencia"
      | "pendiente_aprobacion"
      | "aprobado_parcial"
      | "pendiente_reaprobacion"
      | "operativo"
      | "rechazado"
      | "suspendido";
    puedeCargarCampanas: boolean;
    motivoBloqueo?: string;
    historialCambios: Array<{
      id: string;
      campo: "descuento" | "valorBruto" | "valorNeto" | "lineas";
      valorAnterior: number | string;
      valorNuevo: number | string;
      fecha: Date;
      usuarioId: string;
      usuarioNombre: string;
      requiereReaprobacion: boolean;
    }>;
    ultimaModificacion: Date;
    versionAprobada?: number;
  };

  // Metadatos
  creadoPor: string;
  fechaCreacion: Date;
  ultimaModificacion: Date;
  version: number;
}

// ═══════════════════════════════════════════════════════════════
// ACCIONES DEL WIZARD
// ═══════════════════════════════════════════════════════════════

export type WizardAction =
  // Navegación
  | { type: "SET_STEP"; payload: WizardStep }
  | { type: "COMPLETE_STEP"; payload: WizardStep }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_SAVING"; payload: boolean }
  | { type: "SET_ERRORS"; payload: Record<string, string> }
  | { type: "CLEAR_ERROR"; payload: string }
  // Paso 1
  | { type: "SET_NUMERO_CONTRATO"; payload: string }
  | { type: "SET_TIPO_CONTRATO"; payload: TipoContrato }
  | { type: "SET_MEDIO"; payload: MedioContrato }
  | { type: "SET_ANUNCIANTE"; payload: AnuncianteSeleccionado | null }
  | { type: "ADD_PRODUCTO"; payload: ProductoContrato }
  | { type: "REMOVE_PRODUCTO"; payload: string }
  | { type: "SET_CAMPANA"; payload: string }
  | { type: "SET_DESCRIPCION"; payload: string }
  | { type: "SET_FECHAS"; payload: { inicio: Date | null; fin: Date | null } }
  | { type: "SET_EJECUTIVO"; payload: { id: string; nombre: string } | null }
  | {
    type: "SET_PROPIEDADES";
    payload: WizardContratoState["propiedadesSeleccionadas"];
  }
  // Paso 2
  | { type: "SET_ANALISIS_RIESGO"; payload: AnalisisRiesgoCortex | null }
  | { type: "SET_TERMINOS_PAGO"; payload: Partial<TerminosPago> }
  | { type: "SET_VALORES"; payload: { bruto: number; descuento: number } }
  | { type: "SET_MONEDA"; payload: Moneda }
  | { type: "SET_CANJE"; payload: { esCanje: boolean; porcentaje: number } }
  | {
    type: "SET_COMISION_AGENCIA";
    payload: { comision: number; facturar: boolean };
  }
  | { type: "SET_TIENE_COMISION"; payload: boolean }
  | { type: "SET_AGENCIA_MEDIOS"; payload: string }
  | { type: "SET_AGENCIA_CREATIVA"; payload: string }
  | { type: "SET_VALOR_NETO_MANUAL"; payload: number }
  | { type: "SET_CUOTA_FACTURADA"; payload: CuotaFacturacion }
  // Paso 3
  | { type: "ADD_LINEA_ESPECIFICACION"; payload: EspecificacionPauta }
  | {
    type: "UPDATE_LINEA_ESPECIFICACION";
    payload: { id: string; data: Partial<EspecificacionPauta> };
  }
  | { type: "REMOVE_LINEA_ESPECIFICACION"; payload: string }
  | { type: "SET_VALIDACIONES_INVENTARIO"; payload: ValidacionInventario[] }
  | { type: "SET_MATERIALES_PENDIENTES"; payload: string[] }
  | {
    type: "SET_ESPECIFICACION_DIGITAL";
    payload: Partial<EspecificacionDigitalData>;
  }
  | {
    type: "CONFIGURAR_LINEA";
    payload: {
      id: string;
      emisoraId: string;
      emisoraNombre: string;
      paqueteId: string;
      paqueteNombre: string;
      tipoPauta: TipoPauta;
      tarifaUnitaria: number;
    };
  }
  | {
    type: "SET_GRILLA_SEMANAL";
    payload: { id: string; grilla: GrillaDiaSemana[] };
  }
  | {
    type: "SET_FECHAS_ESPECIFICACION";
    payload: { id: string; fechaInicio: Date | null; fechaFin: Date | null; cantidad?: number };
  }
  | {
    type: "CALCULAR_TOTAL_ESPECIFICACION";
    payload: { id: string; descuento?: number };
  }
  // Paso 4
  | { type: "SET_FLUJO_APROBACION"; payload: FlujoProbacion | null }
  | {
    type: "UPDATE_APROBADOR";
    payload: { id: string; estado: AprobadorContrato["estado"] };
  }
  | { type: "SET_NOTIFICACIONES"; payload: boolean }
  | { type: "SET_ESCALAMIENTO_AUTO"; payload: boolean }
  // Paso 5
  | { type: "ADD_DOCUMENTO"; payload: DocumentoContrato }
  | {
    type: "UPDATE_DOCUMENTO";
    payload: { id: string; data: Partial<DocumentoContrato> };
  }
  | { type: "SET_FIRMA_DIGITAL"; payload: boolean }
  | { type: "SET_URL_FIRMA"; payload: string }
  // Paso 6: Anti-Fraude
  | {
    type: "SET_CONFIGURACION_ANTI_FRAUDE";
    payload: WizardContratoState["configuracionAntiFraude"];
  }
  | {
    type: "ADD_EVIDENCIA_NEGOCIACION";
    payload:
      WizardContratoState["configuracionAntiFraude"]["evidenciasSubidas"][0];
  }
  | { type: "REMOVE_EVIDENCIA_NEGOCIACION"; payload: string }
  | {
    type: "VALIDAR_EVIDENCIA";
    payload: {
      id: string;
      validadoPor: { id: string; nombre: string; fecha: Date };
    };
  }
  | {
    type: "SET_ESTADO_ANTI_FRAUDE";
    payload: WizardContratoState["configuracionAntiFraude"]["estado"];
  }
  // Reset
  | { type: "RESET_WIZARD" }
  | { type: "HYDRATE_STATE"; payload: Partial<WizardContratoState> };

// ═══════════════════════════════════════════════════════════════
// CONFIGURACIÓN DE PASOS
// ═══════════════════════════════════════════════════════════════

export interface StepConfig {
  id: WizardStep;
  titulo: string;
  descripcion: string;
  icono: string;
  validacion: (
    state: WizardContratoState,
  ) => { isValid: boolean; errors: string[] };
  esOpcional: boolean;
}

export const WIZARD_STEPS: StepConfig[] = [
  {
    id: 1,
    titulo: "Información Fundamental",
    descripcion: "Datos básicos del contrato y cliente",
    icono: "📋",
    validacion: (state) => {
      const errors: string[] = [];
      if (!state.anunciante) errors.push("Debe seleccionar un anunciante");
      if (!state.campana.trim()) {
        errors.push("El nombre de campaña es requerido");
      }
      if (!state.fechaInicio) errors.push("La fecha de inicio es requerida");
      if (!state.fechaFin) errors.push("La fecha de fin es requerida");
      if (
        state.fechaInicio && state.fechaFin &&
        state.fechaFin <= state.fechaInicio
      ) {
        errors.push("La fecha de fin debe ser posterior a la de inicio");
      }
      if (
        !state.propiedadesSeleccionadas ||
        state.propiedadesSeleccionadas.length === 0
      ) {
        errors.push(
          "Debe clasificar el contrato con al menos una propiedad maestra (ej. Tipo de Creatividad).",
        );
      }
      return { isValid: errors.length === 0, errors };
    },
    esOpcional: false,
  },
  {
    id: 2,
    titulo: "Facturación",
    descripcion: "Valores, descuentos y condiciones de pago",
    icono: "💰",
    validacion: (state) => {
      const errors: string[] = [];
      if (state.valorBruto <= 0) {
        errors.push("El valor del contrato debe ser mayor a 0");
      }
      if (state.terminosPago.diasPago <= 0) {
        errors.push("Los días de pago deben ser mayores a 0");
      }
      if (state.terminosPago.modalidad === "cuotas" && (!state.terminosPago.numeroCuotas || state.terminosPago.numeroCuotas < 1)) {
        errors.push("Debe especificar al menos 1 cuota");
      }
      return { isValid: errors.length === 0, errors };
    },
    esOpcional: false,
  },
  {
    id: 3,
    titulo: "Especificaciones",
    descripcion: "Detalle de pauta e inventario",
    icono: "📊",
    validacion: (state) => {
      const errors: string[] = [];
      if (state.lineasEspecificacion.length === 0) {
        errors.push("Debe agregar al menos una línea de especificación");
      }
      return { isValid: errors.length === 0, errors };
    },
    esOpcional: false,
  },
  {
    id: 4,
    titulo: "Aprobaciones",
    descripcion: "Configuración del flujo de aprobación",
    icono: "✅",
    validacion: (state) => {
      const errors: string[] = [];
      if (!state.flujoAprobacion) {
        errors.push("Debe configurar el flujo de aprobación");
      }
      return { isValid: errors.length === 0, errors };
    },
    esOpcional: false,
  },
  {
    id: 5,
    titulo: "Documentación",
    descripcion: "Generación y firma digital",
    icono: "📄",
    validacion: () => ({ isValid: true, errors: [] }),
    esOpcional: true,
  },
  {
    id: 6,
    titulo: "Autorización",
    descripcion: "Evidencias y aprobaciones anti-fraude",
    icono: "🔐",
    validacion: (state) => {
      const errors: string[] = [];
      const config = state.configuracionAntiFraude;

      // Validar que haya al menos una evidencia
      if (config.evidenciasSubidas.length === 0) {
        errors.push("Debe adjuntar al menos una evidencia de negociación");
      }

      // Validar evidencias validadas
      const evidenciasValidadas = config.evidenciasSubidas.filter((e) =>
        e.validado
      );
      if (
        config.evidenciasSubidas.length > 0 && evidenciasValidadas.length === 0
      ) {
        errors.push("Al menos una evidencia debe estar validada");
      }

      // Validar justificación para descuentos altos
      if (
        state.descuentoPorcentaje >= 65 && !config.justificacionDescuento?.texto
      ) {
        errors.push("Descuento ≥65% requiere justificación escrita");
      }

      return { isValid: errors.length === 0, errors };
    },
    esOpcional: false,
  },
];

// ═══════════════════════════════════════════════════════════════
// ESTADO INICIAL
// ═══════════════════════════════════════════════════════════════

export const getInitialWizardState = (): WizardContratoState => ({
  currentStep: 1,
  completedSteps: [],
  isLoading: false,
  isSaving: false,
  errors: {},

  numeroContrato: "",
  tipoContrato: "nuevo",
  medio: "fm",
  anunciante: null,
  productosPrincipales: [],
  campana: "",
  descripcion: "",
  fechaInicio: null,
  fechaFin: null,
  ejecutivoAsignado: null,
  propiedadesSeleccionadas: [],

  analisisRiesgo: null,
  terminosPago: {
    diasPago: 30,
    modalidad: "por_campana",
    tipoFactura: "posterior",
    numeroCuotas: 1,
    requiereGarantia: false,
    ivaPorcentaje: 19,
  },
  valorBruto: 0,
  descuentoPorcentaje: 0,
  valorNeto: 0,
  moneda: "CLP",
  esCanje: false,
  porcentajeCanje: 0,
  comisionAgencia: 0,
  facturarComisionAgencia: false,
  tieneComisionAgencia: false,
  agenciaMediosId: undefined,
  agenciaCreativaId: undefined,
  cuotasFacturacion: [],

  lineasEspecificacion: [],
  validacionesInventario: [],
  requiereMaterialCreativo: true,
  materialesPendientes: [],
  especificacionDigital: {
    plataformas: [],
    trackingLinks: [],
    moneda: "CLP",
  },

  flujoAprobacion: null,
  notificacionesConfiguradas: true,
  escalamientoAutomatico: true,

  documentos: [],
  firmaDigitalHabilitada: true,

  // Configuración Anti-Fraude inicial
  configuracionAntiFraude: {
    evidenciasSubidas: [],
    aprobaciones: [],
    estado: "borrador",
    puedeCargarCampanas: false,
    historialCambios: [],
    ultimaModificacion: new Date(),
  },

  creadoPor: "",
  fechaCreacion: new Date(),
  ultimaModificacion: new Date(),
  version: 1,
});

// ═══════════════════════════════════════════════════════════════
// UTILIDADES
// ═══════════════════════════════════════════════════════════════

export const calcularValorNeto = (bruto: number, descuento: number, comision: number = 0): number => {
  return Math.round(bruto * (1 - descuento / 100) * (1 - comision / 100));
};

export const determinarNivelAprobacion = (
  valor: number,
  descuento: number,
  diasPago: number,
  esNuevoCliente: boolean,
): NivelAprobacion => {
  // Reglas de negocio para determinar nivel de aprobación
  if (
    valor < 10000000 && descuento <= 10 && diasPago <= 30 && !esNuevoCliente
  ) {
    return "automatico";
  }
  if (valor < 50000000 && descuento <= 15 && diasPago <= 45) {
    return "supervisor";
  }
  if (valor < 100000000 && descuento <= 20 && diasPago <= 60) {
    return "gerente_comercial";
  }
  if (valor < 500000000) {
    return "gerente_general";
  }
  return "directorio";
};

export const formatCurrency = (
  value: number,
  moneda: Moneda = "CLP",
): string => {
  const formatters: Record<Moneda, Intl.NumberFormat> = {
    CLP: new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
      maximumFractionDigits: 0,
    }),
    USD: new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }),
    UF: new Intl.NumberFormat("es-CL", {
      style: "decimal",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }),
  };

  if (moneda === "UF") {
    return `UF ${formatters.UF.format(value)}`;
  }
  return formatters[moneda].format(value);
};

export const formatDate = (date: Date | null): string => {
  if (!date) return "";
  return new Intl.DateTimeFormat("es-CL", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
};

export const getNivelRiesgoColor = (nivel: NivelRiesgo): string => {
  // UNICA linea de color permitida: azul #6888ff para todos los estados
  const colors: Record<NivelRiesgo, string> = {
    bajo: "from-[#6888ff] to-[#5572ee]",
    medio: "from-[#6888ff] to-[#5572ee]",
    alto: "from-[#6888ff] to-[#5572ee]",
    critico: "from-[#6888ff] to-[#5572ee]",
  };
  return colors[nivel];
};
