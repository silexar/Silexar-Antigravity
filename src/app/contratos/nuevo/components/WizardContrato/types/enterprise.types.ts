/**
 * 🏢 SILEXAR PULSE - Tipos Enterprise Extendidos TIER 0
 *
 * @description Sistema de tipos avanzado para funcionalidades enterprise
 * incluyendo gestión de obligaciones, analytics, copilot y seguridad.
 *
 * @version 2025.4.0
 * @tier TIER_0_FORTUNE_10
 * @classification ENTERPRISE_SECURITY
 * @futureProof 2050+
 */

// ═══════════════════════════════════════════════════════════════
// ESTADOS EXTENDIDOS DEL CICLO DE VIDA
// ═══════════════════════════════════════════════════════════════

export type EstadoContratoExtendido =
  | "borrador"
  | "revision_interna"
  | "revision_legal"
  | "negociacion"
  | "pendiente_cliente"
  | "aprobacion_interna"
  | "aprobacion_cliente"
  | "firmado"
  | "activo"
  | "en_ejecucion"
  | "pausa_temporal"
  | "disputa"
  | "renovacion"
  | "enmienda"
  | "cierre"
  | "finalizado"
  | "cancelado"
  | "archivado";

export type TransicionEstado = {
  desde: EstadoContratoExtendido;
  hacia: EstadoContratoExtendido;
  requiereAprobacion: boolean;
  rolesPermitidos: RolUsuario[];
  accionesRequeridas?: string[];
};

// ═══════════════════════════════════════════════════════════════
// SISTEMA DE OBLIGACIONES
// ═══════════════════════════════════════════════════════════════

export type TipoObligacion =
  | "entrega_material"
  | "pago"
  | "reporte"
  | "aprobacion_material"
  | "exclusividad"
  | "confidencialidad"
  | "entrega_pauta"
  | "facturacion"
  | "renovacion"
  | "otro";

export type EstadoObligacion =
  | "pendiente"
  | "en_progreso"
  | "completada"
  | "vencida"
  | "incumplida"
  | "dispensada"
  | "en_disputa";

export type FrecuenciaObligacion =
  | "unico"
  | "diario"
  | "semanal"
  | "quincenal"
  | "mensual"
  | "trimestral"
  | "semestral"
  | "anual";

export interface ObligacionContrato {
  id: string;
  contratoId: string;
  numeroContrato: string;

  // Información básica
  tipo: TipoObligacion;
  titulo: string;
  descripcion: string;
  clausulaOrigen: string;
  seccionContrato?: string;

  // Responsabilidad
  responsable: {
    tipo: "empresa" | "cliente" | "ambos";
    departamento?: string;
    personaId?: string;
    personaNombre?: string;
    email?: string;
  };

  // Temporalidad
  fechaInicio: Date;
  fechaLimite: Date;
  frecuencia: FrecuenciaObligacion;
  diasAnticipacionAlerta: number[];

  // Estado y tracking
  estado: EstadoObligacion;
  porcentajeCompletado: number;
  fechaCompletada?: Date;
  completadoPor?: string;

  // Evidencia
  documentosAdjuntos: {
    id: string;
    nombre: string;
    url: string;
    tipo: string;
    fechaSubida: Date;
  }[];

  // Penalizaciones
  penalizacion?: {
    tipo: "multa" | "descuento" | "rescision" | "interes_mora";
    monto?: number;
    porcentaje?: number;
    descripcion: string;
  };

  // Alertas
  alertasEnviadas: {
    fecha: Date;
    canal: "email" | "push" | "sms" | "whatsapp";
    destinatario: string;
    leida: boolean;
  }[];

  // Metadatos
  creadoPor: string;
  fechaCreacion: Date;
  ultimaModificacion: Date;
  extraidaPorIA: boolean;
  confianzaExtraccion?: number;

  // Dependencias
  dependeDe?: string[];
  bloquea?: string[];
}

export interface ResumenObligaciones {
  total: number;
  porEstado: Record<EstadoObligacion, number>;
  vencidasHoy: number;
  proximasVencer: number;
  cumplimientoPorcentaje: number;
  obligacionesCriticas: ObligacionContrato[];
}

// ═══════════════════════════════════════════════════════════════
// ANALYTICS Y PREDICCIONES
// ═══════════════════════════════════════════════════════════════

export interface ContractAnalyticsDashboard {
  // Métricas generales
  metricas: {
    valorTotalContratos: number;
    valorContratosMes: number;
    contratosPorEstado: Record<EstadoContratoExtendido, number>;
    tiempoPromedioCreacion: number; // minutos
    tiempoPromedioAprobacion: number; // horas
    tiempoPromedioNegociacion: number; // días
    tasaConversion: number; // % de borradores a firmados
  };

  // Predicciones IA
  predicciones: {
    renovaciones: PrediccionRenovacion[];
    riesgoPago: PrediccionRiesgoPago[];
    oportunidadesUpsell: OportunidadUpsell[];
    churnProbability: PrediccionChurn[];
  };

  // Análisis de rentabilidad
  rentabilidad: {
    porCliente: RentabilidadCliente[];
    porMedio: RentabilidadMedio[];
    porEjecutivo: RentabilidadEjecutivo[];
    tendenciaMensual: TendenciaRentabilidad[];
  };

  // Alertas inteligentes
  alertas: AlertaInteligente[];

  // Performance
  kpis: {
    nps: number;
    csat: number;
    tiempoResolucion: number;
    tasaCumplimientoSLA: number;
  };
}

export interface PrediccionRenovacion {
  contratoId: string;
  numeroContrato: string;
  clienteNombre: string;
  fechaVencimiento: Date;
  probabilidadRenovacion: number; // 0-100
  factoresPositivos: string[];
  factoresNegativos: string[];
  accionRecomendada: string;
  valorEstimadoRenovacion: number;
  confianza: number;
}

export interface PrediccionRiesgoPago {
  contratoId: string;
  numeroContrato: string;
  clienteNombre: string;
  montoTotal: number;
  montoPendiente: number;
  probabilidadMora: number; // 0-100
  diasEstimadosRetraso: number;
  factoresRiesgo: string[];
  accionSugerida: string;
}

export interface OportunidadUpsell {
  clienteId: string;
  clienteNombre: string;
  valorActual: number;
  valorPotencial: number;
  incrementoEstimado: number;
  productosRecomendados: string[];
  probabilidadConversion: number;
  mejorMomento: Date;
  razonamiento: string;
}

export interface PrediccionChurn {
  clienteId: string;
  clienteNombre: string;
  probabilidadChurn: number;
  factoresRiesgo: string[];
  accionesPreventivas: string[];
  impactoFinancieroEstimado: number;
  urgencia: "alta" | "media" | "baja";
}

export interface RentabilidadCliente {
  clienteId: string;
  clienteNombre: string;
  valorTotal: number;
  margenPromedio: number;
  contratosActivos: number;
  tendencia: "creciente" | "estable" | "decreciente";
  ltv: number; // Lifetime Value
  segmento: "premium" | "estandar" | "basico";
}

export interface RentabilidadMedio {
  medioId: string;
  medioNombre: string;
  ingresos: number;
  utilizacion: number;
  margenPromedio: number;
  demandaTendencia: "alta" | "media" | "baja";
}

export interface RentabilidadEjecutivo {
  ejecutivoId: string;
  ejecutivoNombre: string;
  contratosGestionados: number;
  valorTotal: number;
  tasaCierre: number;
  tiempoPromedioCierre: number;
  satisfaccionCliente: number;
}

export interface TendenciaRentabilidad {
  mes: string;
  ingresos: number;
  margen: number;
  contratos: number;
  variacionMensual: number;
}

export interface AlertaInteligente {
  id: string;
  tipo:
    | "vencimientos_contrato"
    | "vencimientos_obligacion"
    | "riesgo_pago"
    | "oportunidad_upsell"
    | "renovacion_pendiente"
    | "aprobacion_estancada"
    | "desviacion_presupuesto"
    | "conflicto_exclusividad"
    | "material_pendiente";
  titulo: string;
  descripcion: string;
  urgencia: "critica" | "alta" | "media" | "baja";
  fechaGeneracion: Date;
  fechaExpiracion?: Date;
  contratoId?: string;
  clienteId?: string;
  accionSugerida: string;
  accionUrl?: string;
  leida: boolean;
  descartada: boolean;
  accionTomada?: string;
}

// ═══════════════════════════════════════════════════════════════
// COPILOT Y IA GENERATIVA
// ═══════════════════════════════════════════════════════════════

export type IntentoCopilot =
  | "crear_contrato"
  | "buscar_contrato"
  | "modificar_contrato"
  | "aprobar_contrato"
  | "generar_clausula"
  | "analizar_riesgo"
  | "sugerir_terminos"
  | "comparar_contratos"
  | "resumir_contrato"
  | "responder_pregunta"
  | "otro";

export interface MensajeCopilot {
  id: string;
  rol: "usuario" | "asistente" | "sistema";
  contenido: string;
  timestamp: Date;

  // Contexto extraído
  intento?: IntentoCopilot;
  entidades?: {
    tipo: string;
    valor: string;
    confianza: number;
  }[];

  // Acciones sugeridas
  acciones?: AccionCopilot[];

  // Referencias
  contratosRelacionados?: string[];
  clientesRelacionados?: string[];

  // Metadatos
  modeloUsado?: string;
  tokensUsados?: number;
  tiempoRespuesta?: number;
}

export interface AccionCopilot {
  tipo: "navegar" | "crear" | "modificar" | "aprobar" | "generar" | "ejecutar";
  titulo: string;
  descripcion: string;
  url?: string;
  parametros?: Record<string, unknown>;
  requiereConfirmacion: boolean;
}

export interface SugerenciaCopilot {
  tipo: "clausula" | "termino" | "descuento" | "medio" | "fecha" | "cliente";
  valor: string | number | object;
  razonamiento: string;
  confianza: number;
  basadoEn: string[];
  aplicar: () => void;
}

export interface ContextoCopilot {
  contratoActual?: string;
  clienteActual?: string;
  pasoWizard?: number;
  historialConversacion: MensajeCopilot[];
  preferenciasUsuario: Record<string, unknown>;
  ultimasAcciones: string[];
}

// ═══════════════════════════════════════════════════════════════
// BIBLIOTECA DE CLÁUSULAS
// ═══════════════════════════════════════════════════════════════

export type CategoriaClausula =
  | "general"
  | "pago"
  | "entrega"
  | "exclusividad"
  | "confidencialidad"
  | "terminacion"
  | "penalizaciones"
  | "garantias"
  | "propiedad_intelectual"
  | "jurisdiccion"
  | "fuerza_mayor"
  | "modificaciones"
  | "notificaciones"
  | "publicidad_medios";

export type EstadoClausula =
  | "borrador"
  | "revision"
  | "aprobada"
  | "obsoleta"
  | "archivada";

export interface ClausulaLegal {
  id: string;
  codigo: string; // Ej: "CL-PAGO-001"
  nombre: string;
  categoria: CategoriaClausula;

  // Contenido
  contenido: string;
  contenidoHTML: string;
  variables: VariableClausula[];

  // Versionado
  version: number;
  estado: EstadoClausula;
  versionesAnteriores: {
    version: number;
    contenido: string;
    fecha: Date;
    cambiadoPor: string;
    motivo: string;
  }[];

  // Aprobación legal
  aprobadoPor?: string;
  fechaAprobacion?: Date;
  proximaRevision?: Date;

  // Uso
  tiposContratoAplicables: string[];
  industriasAplicables?: string[];
  esObligatoria: boolean;
  esPredeterminada: boolean;
  orden: number;

  // IA
  sugerenciaIA: boolean;
  condicionesSugerencia?: string; // JS expression
  pesoRiesgo: number; // 0-10, para análisis de riesgo

  // Metadatos
  creadoPor: string;
  fechaCreacion: Date;
  ultimaModificacion: Date;
  usosCount: number;
  tags: string[];
}

export interface VariableClausula {
  nombre: string;
  tipo:
    | "texto"
    | "numero"
    | "fecha"
    | "moneda"
    | "porcentaje"
    | "select"
    | "calculado";
  requerida: boolean;
  valorPorDefecto?: string | number;
  opciones?: { valor: string; etiqueta: string }[];
  formula?: string; // Para tipo 'calculado'
  validacion?: string; // Regex o expresión
  descripcion?: string;
  fuenteAutomatica?: string; // Path del campo del contrato
}

export interface PlantillaContrato {
  id: string;
  nombre: string;
  descripcion: string;
  categoria:
    | "radio"
    | "tv"
    | "digital"
    | "prensa"
    | "omnicanal"
    | "programatico"
    | "marco";

  // Estructura
  secciones: SeccionPlantilla[];
  clausulasIncluidas: string[]; // IDs de cláusulas
  clausulasOpcionales: string[];

  // Configuración
  esDefault: boolean;
  tiposContratoAplicables: string[];

  // Aprobación
  estado: "borrador" | "revision" | "aprobada" | "obsoleta";
  aprobadoPor?: string;
  fechaAprobacion?: Date;

  // Metadatos
  version: number;
  creadoPor: string;
  fechaCreacion: Date;
  ultimaModificacion: Date;
  usosCount: number;
}

export interface SeccionPlantilla {
  id: string;
  nombre: string;
  orden: number;
  esCondicional: boolean;
  condicion?: string;
  contenidoBase: string;
  clausulasIds: string[];
}

// ═══════════════════════════════════════════════════════════════
// SEGURIDAD Y AUDITORÍA
// ═══════════════════════════════════════════════════════════════

export type RolUsuario =
  | "admin"
  | "gerente_general"
  | "gerente_comercial"
  | "supervisor"
  | "ejecutivo"
  | "legal"
  | "finanzas"
  | "operaciones"
  | "viewer"
  | "auditor";

export type PermisoContrato =
  | "crear"
  | "ver"
  | "editar"
  | "eliminar"
  | "aprobar"
  | "firmar"
  | "exportar"
  | "archivar"
  | "ver_confidencial"
  | "editar_clausulas"
  | "gestionar_obligaciones"
  | "ver_analytics"
  | "usar_copilot";

export type TipoEventoAuditoria =
  | "crear"
  | "ver"
  | "editar"
  | "eliminar"
  | "aprobar"
  | "rechazar"
  | "firmar"
  | "enviar"
  | "descargar"
  | "exportar"
  | "archivar"
  | "restaurar"
  | "comentar"
  | "compartir"
  | "cambiar_estado"
  | "acceso_denegado"
  | "login"
  | "logout";

export interface EventoAuditoria {
  id: string;
  timestamp: Date;

  // Quién
  usuarioId: string;
  usuarioNombre: string;
  usuarioEmail: string;
  rol: RolUsuario;

  // Qué
  tipoEvento: TipoEventoAuditoria;
  recursoTipo:
    | "contrato"
    | "clausula"
    | "obligacion"
    | "documento"
    | "usuario"
    | "configuracion";
  recursoId: string;
  recursoNombre?: string;

  // Detalles
  accion: string;
  descripcion: string;
  datosAnteriores?: Record<string, unknown>;
  datosNuevos?: Record<string, unknown>;
  camposModificados?: string[];

  // Contexto
  ipAddress: string;
  userAgent: string;
  geolocalizacion?: {
    pais: string;
    ciudad: string;
    coordenadas?: [number, number];
  };
  dispositivo?: string;
  sesionId: string;

  // Seguridad
  resultado: "exito" | "fallo" | "denegado";
  motivoFallo?: string;
  nivelRiesgo: "bajo" | "medio" | "alto" | "critico";

  // Integridad
  hash: string; // SHA-256 del evento
  hashAnterior?: string; // Para cadena de integridad
  firmaDigital?: string;
}

export interface ConfiguracionSeguridad {
  // Encriptación
  encriptacion: {
    algoritmoReposo: "AES-256-GCM";
    algoritmoTransito: "TLS-1.3";
    rotacionClaves: number; // días
  };

  // Autenticación
  autenticacion: {
    mfaRequerido: boolean;
    metodosPermitidos: ("password" | "sso" | "oauth" | "biometric")[];
    tiempoSesion: number; // minutos
    intentosMaximos: number;
    bloqueoTemporal: number; // minutos
  };

  // Control de acceso
  acceso: {
    rbacHabilitado: boolean;
    abacHabilitado: boolean;
    seguridadCampo: boolean;
    ipWhitelist?: string[];
  };

  // Auditoría
  auditoria: {
    retornoArchivo: boolean;
    retencionDias: number;
    alertasEnabled: boolean;
    notificacionesSeguridad: string[];
  };

  // Compliance
  compliance: {
    soxCompliant: boolean;
    gdprCompliant: boolean;
    hipaaCompliant: boolean;
    iso27001: boolean;
    ccpaCompliant: boolean;
  };

  // Data Loss Prevention
  dlp: {
    habilitado: boolean;
    patronesSensibles: string[];
    accionViolacion: "bloquear" | "alertar" | "registrar";
  };
}

export interface PermisosPorRol {
  rol: RolUsuario;
  permisos: PermisoContrato[];
  restricciones?: {
    soloSusContratos: boolean;
    limiteValor?: number;
    tiposContratoPermitidos?: string[];
    estadosPermitidos?: EstadoContratoExtendido[];
  };
}

// ═══════════════════════════════════════════════════════════════
// VERSIONADO Y ENMIENDAS
// ═══════════════════════════════════════════════════════════════

export interface VersionContrato {
  numero: number;
  contratoId: string;

  // Snapshot completo
  snapshot: Record<string, unknown>;

  // Cambios
  cambios: CambioContrato[];
  resumenCambios: string;

  // Metadatos
  creadoPor: string;
  fechaCreacion: Date;
  motivo: string;

  // Aprobación
  requiereAprobacion: boolean;
  aprobadoPor?: string;
  fechaAprobacion?: Date;

  // Integridad
  hash: string;
}

export interface CambioContrato {
  campo: string;
  valorAnterior: unknown;
  valorNuevo: unknown;
  tipo: "agregar" | "modificar" | "eliminar";
  descripcion?: string;
}

export interface EnmiendaContrato {
  id: string;
  contratoOriginalId: string;
  numeroEnmienda: number;

  // Contenido
  titulo: string;
  descripcion: string;
  cambiosResumen: string;

  // Cambios específicos
  clausulasAgregadas: string[];
  clausulasModificadas: { id: string; antes: string; despues: string }[];
  clausulasEliminadas: string[];

  cambiosValor?: {
    valorAnterior: number;
    valorNuevo: number;
    motivo: string;
  };

  cambiosFechas?: {
    fechaFinAnterior: Date;
    fechaFinNueva: Date;
    motivo: string;
  };

  // Estado
  estado: "borrador" | "revision" | "aprobada" | "firmada" | "rechazada";

  // Aprobaciones
  aprobaciones: {
    rol: string;
    aprobador: string;
    fecha?: Date;
    estado: "pendiente" | "aprobado" | "rechazado";
    comentarios?: string;
  }[];

  // Firmas
  firmado: boolean;
  firmas?: {
    firmante: string;
    fecha: Date;
    tipo: "digital" | "manuscrita";
    certificado?: string;
  }[];

  // Metadatos
  fechaEfectiva: Date;
  creadoPor: string;
  fechaCreacion: Date;
  version: number;
}

// ═══════════════════════════════════════════════════════════════
// RENOVACIONES AUTOMÁTICAS
// ═══════════════════════════════════════════════════════════════

export interface ConfiguracionRenovacion {
  habilitada: boolean;
  tipoRenovacion: "automatica" | "condicional" | "manual";

  // Condiciones
  condiciones: {
    aumentoPrecioMaximo: number;
    ajustePorInflacion: boolean;
    indiceInflacion?: string;
    requierePagoAlDia: boolean;
    requiereNotificacion: boolean;
    diasNotificacionAnticipada: number;
  };

  // Términos nuevos
  terminosNuevos: {
    duracionMeses: number;
    clausulasActualizadas: string[];
    terminosPagoNuevos?: Partial<import("./wizard.types").TerminosPago>;
  };

  // Notificaciones
  notificaciones: {
    diasAnticipacion: number[];
    destinatarios: string[];
    canales: ("email" | "push" | "sms" | "whatsapp")[];
    frecuenciaRecordatorio: "diario" | "semanal";
    plantillaEmail?: string;
  };

  // Aprobación
  aprobacionRequerida: boolean;
  aprobadores?: string[];

  // Historial
  renovacionesAnteriores: {
    fecha: Date;
    valorAnterior: number;
    valorNuevo: number;
    duracionAnterior: number;
    duracionNueva: number;
    aprobadoPor?: string;
  }[];
}

// ═══════════════════════════════════════════════════════════════
// INTEGRACIONES ENTERPRISE
// ═══════════════════════════════════════════════════════════════

export interface ConfiguracionIntegraciones {
  // Firma digital
  firmaDigital: {
    proveedor: "docusign" | "adobesign" | "hellosign" | "ninguno";
    apiKey?: string;
    webhookUrl?: string;
    templateId?: string;
  };

  // ERP
  erp: {
    proveedor: "sap" | "oracle" | "dynamics" | "netsuite" | "ninguno";
    syncAutomatico: boolean;
    camposSync: string[];
  };

  // CRM
  crm: {
    proveedor: "salesforce" | "hubspot" | "dynamics" | "pipedrive" | "ninguno";
    syncClientes: boolean;
    syncOportunidades: boolean;
  };

  // Comunicaciones
  comunicaciones: {
    email: {
      proveedor: "sendgrid" | "ses" | "smtp";
      templatesEnabled: boolean;
    };
    whatsapp: {
      habilitado: boolean;
      businessAccountId?: string;
    };
    slack?: {
      habilitado: boolean;
      webhookUrl?: string;
      canal?: string;
    };
    teams?: {
      habilitado: boolean;
      tenantId?: string;
    };
  };

  // Media específico
  mediaPlanning: {
    wideorbit: boolean;
    dalet: boolean;
    programmatic: {
      dsps: string[];
      ssps: string[];
    };
  };
}

// ═══════════════════════════════════════════════════════════════
// MOBILE Y NOTIFICACIONES
// ═══════════════════════════════════════════════════════════════

export interface NotificacionPush {
  id: string;
  usuarioId: string;

  // Contenido
  titulo: string;
  cuerpo: string;
  icono?: string;
  imagen?: string;

  // Acción
  accion?: {
    tipo: "navegar" | "aprobar" | "rechazar" | "ver";
    url?: string;
    contratoId?: string;
    obligacionId?: string;
  };

  // Prioridad
  prioridad: "alta" | "normal" | "baja";
  requiereAccion: boolean;

  // Estado
  enviada: boolean;
  fechaEnvio?: Date;
  leida: boolean;
  fechaLectura?: Date;
  accionada: boolean;
  fechaAccion?: Date;

  // Expiración
  expira?: Date;
}

export interface PreferenciasNotificacion {
  usuarioId: string;

  canales: {
    email: boolean;
    push: boolean;
    sms: boolean;
    whatsapp: boolean;
    inApp: boolean;
  };

  tipos: {
    aprobacionesPendientes: boolean;
    vencimientosContratos: boolean;
    vencimientosObligaciones: boolean;
    nuevosContratos: boolean;
    cambiosEstado: boolean;
    alertasRiesgo: boolean;
    recordatorios: boolean;
  };

  horario: {
    horaInicio: string;
    horaFin: string;
    diasSemana: number[];
    zonaHoraria: string;
  };

  resumenDiario: boolean;
  resumenSemanal: boolean;
}

// ═══════════════════════════════════════════════════════════════
// EXPORTS DE TIPOS AUXILIARES
// ═══════════════════════════════════════════════════════════════

export type {
  AnuncianteSeleccionado,
  Moneda,
  NivelRiesgo,
  TerminosPago,
  TipoContrato,
  WizardAction,
  WizardContratoState,
  WizardStep,
} from "./wizard.types";
