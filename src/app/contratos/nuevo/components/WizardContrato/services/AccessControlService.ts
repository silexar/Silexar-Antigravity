import { logger } from "@/lib/observability";
/**
 * 🔐 SILEXAR PULSE - Granular Access Control Service TIER 0
 *
 * @description Control de acceso granular basado en roles con
 * matriz de permisos detallada por nivel organizacional.
 *
 * @version 2025.4.0
 * @tier TIER_0_FORTUNE_10
 */

// ═══════════════════════════════════════════════════════════════
// TIPOS Y ENUMS
// ═══════════════════════════════════════════════════════════════

export type RolUsuario =
  | "EJECUTIVO_JUNIOR"
  | "EJECUTIVO_SENIOR"
  | "SUPERVISOR"
  | "GERENTE_COMERCIAL"
  | "GERENTE_FACTURACION"
  | "GERENTE_COBRANZA"
  | "GERENTE_GENERAL"
  | "ADMIN_SISTEMA";

export type PermisoAccion =
  | "crear_contrato"
  | "editar_contrato"
  | "eliminar_contrato"
  | "ver_contrato"
  | "aprobar_contrato"
  | "rechazar_contrato"
  | "aprobar_descuento"
  | "configurar_terminos_pago"
  | "ver_metricas"
  | "ver_pipeline"
  | "override_validaciones"
  | "configurar_politicas"
  | "gestionar_usuarios"
  | "acceso_auditoria"
  | "exportar_datos"
  | "firmar_contratos"
  // Permisos de Facturación
  | "facturar_contrato"
  | "validar_oc"
  | "generar_factura"
  | "anular_factura"
  | "liberar_factura"
  | "firmar_para_facturacion"
  // Permisos de Cobranza
  | "gestionar_cobranza"
  | "registrar_pago"
  | "aplicar_descuento_pago"
  | "enviar_recordatorio_pago"
  | "bloquear_cliente"
  | "gestionar_mora";

export type AlcanceVisibilidad =
  | "PROPIOS" // Solo sus contratos
  | "EQUIPO" // Contratos de su equipo
  | "CARTERA" // Cartera asignada completa
  | "DEPARTAMENTO" // Todo el departamento
  | "ORGANIZACION"; // Toda la organización

export interface LimitesContrato {
  valorMaximo: number; // Valor máximo de contrato
  descuentoMaximo: number; // Descuento máximo sin aprobación
  diasPagoMaximo: number; // Máximo días de pago
  requiereSupervision: boolean; // Requiere supervisión para crear
  puedeAprobarTerminosEspeciales: boolean; // Puede aprobar términos especiales
}

export interface PermisoDetallado {
  accion: PermisoAccion;
  permitido: boolean;
  condiciones?: string[]; // Condiciones para el permiso
  limites?: Record<string, number>; // Límites numéricos
}

export interface PerfilRol {
  rol: RolUsuario;
  nombre: string;
  descripcion: string;
  nivel: number; // Nivel jerárquico (1-10)
  visibilidad: AlcanceVisibilidad;
  limites: LimitesContrato;
  permisos: PermisoDetallado[];
  puedeEscalarA: RolUsuario[]; // Roles a los que puede escalar
  requiereAprobacionDe: RolUsuario[]; // Roles que lo supervisan
}

export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  rol: RolUsuario;
  equipoId?: string;
  supervisorId?: string;
  carteraClientes?: string[];
  activo: boolean;
  fechaCreacion: Date;
  ultimoAcceso?: Date;
}

export interface ValidacionPermiso {
  permitido: boolean;
  razon?: string;
  requiereAprobacion: boolean;
  aprobadoresSugeridos: Usuario[];
  limitesExcedidos: { limite: string; valor: number; maximo: number }[];
  accionesDisponibles: string[];
}

export interface SolicitudAprobacion {
  id: string;
  solicitanteId: string;
  aprobadorId: string;
  tipo: PermisoAccion;
  recursoId: string;
  datosAdicionales: Record<string, unknown>;
  estado: "PENDIENTE" | "APROBADO" | "RECHAZADO" | "EXPIRADO";
  fechaCreacion: Date;
  fechaResolucion?: Date;
  comentarios?: string;
}

// ═══════════════════════════════════════════════════════════════
// CONFIGURACIÓN DE ROLES
// ═══════════════════════════════════════════════════════════════

const PERFILES_ROLES: PerfilRol[] = [
  // ═══════════════════════════════════════════════════════════════
  // EJECUTIVO JUNIOR
  // ═══════════════════════════════════════════════════════════════
  {
    rol: "EJECUTIVO_JUNIOR",
    nombre: "Ejecutivo Junior",
    descripcion: "Ejecutivo en entrenamiento con capacidades limitadas",
    nivel: 2,
    visibilidad: "PROPIOS",
    limites: {
      valorMaximo: 25000000, // $25M CLP
      descuentoMaximo: 10, // 10%
      diasPagoMaximo: 30, // 30 días
      requiereSupervision: true,
      puedeAprobarTerminosEspeciales: false,
    },
    permisos: [
      {
        accion: "crear_contrato",
        permitido: true,
        condiciones: ["valor <= $25M", "requiere supervisión"],
        limites: { valorMaximo: 25000000 },
      },
      {
        accion: "editar_contrato",
        permitido: true,
        condiciones: ["solo propios", "no firmados"],
      },
      { accion: "eliminar_contrato", permitido: false },
      {
        accion: "ver_contrato",
        permitido: true,
        condiciones: ["solo asignados"],
      },
      { accion: "aprobar_contrato", permitido: false },
      { accion: "rechazar_contrato", permitido: false },
      {
        accion: "aprobar_descuento",
        permitido: true,
        condiciones: ["máximo 10%"],
        limites: { descuentoMaximo: 10 },
      },
      {
        accion: "configurar_terminos_pago",
        permitido: true,
        condiciones: ["máximo 30 días"],
        limites: { diasMaximo: 30 },
      },
      {
        accion: "ver_metricas",
        permitido: true,
        condiciones: ["solo personales"],
      },
      { accion: "ver_pipeline", permitido: false },
      { accion: "override_validaciones", permitido: false },
      { accion: "configurar_politicas", permitido: false },
      { accion: "gestionar_usuarios", permitido: false },
      { accion: "acceso_auditoria", permitido: false },
      {
        accion: "exportar_datos",
        permitido: true,
        condiciones: ["solo propios"],
      },
      { accion: "firmar_contratos", permitido: false },
    ],
    puedeEscalarA: ["EJECUTIVO_SENIOR", "SUPERVISOR"],
    requiereAprobacionDe: ["EJECUTIVO_SENIOR", "SUPERVISOR"],
  },

  // ═══════════════════════════════════════════════════════════════
  // EJECUTIVO SENIOR
  // ═══════════════════════════════════════════════════════════════
  {
    rol: "EJECUTIVO_SENIOR",
    nombre: "Ejecutivo Senior",
    descripcion: "Ejecutivo experimentado con capacidades extendidas",
    nivel: 4,
    visibilidad: "CARTERA",
    limites: {
      valorMaximo: 100000000, // $100M CLP
      descuentoMaximo: 20, // 20%
      diasPagoMaximo: 45, // 45 días
      requiereSupervision: false,
      puedeAprobarTerminosEspeciales: false,
    },
    permisos: [
      {
        accion: "crear_contrato",
        permitido: true,
        condiciones: ["valor <= $100M"],
        limites: { valorMaximo: 100000000 },
      },
      {
        accion: "editar_contrato",
        permitido: true,
        condiciones: ["de su cartera"],
      },
      {
        accion: "eliminar_contrato",
        permitido: true,
        condiciones: ["solo borradores propios"],
      },
      {
        accion: "ver_contrato",
        permitido: true,
        condiciones: ["cartera completa"],
      },
      {
        accion: "aprobar_contrato",
        permitido: true,
        condiciones: ["de ejecutivos junior de su equipo"],
      },
      {
        accion: "rechazar_contrato",
        permitido: true,
        condiciones: ["de ejecutivos junior"],
      },
      {
        accion: "aprobar_descuento",
        permitido: true,
        condiciones: ["máximo 20%"],
        limites: { descuentoMaximo: 20 },
      },
      {
        accion: "configurar_terminos_pago",
        permitido: true,
        condiciones: ["máximo 45 días"],
        limites: { diasMaximo: 45 },
      },
      {
        accion: "ver_metricas",
        permitido: true,
        condiciones: ["personales y cartera"],
      },
      {
        accion: "ver_pipeline",
        permitido: true,
        condiciones: ["solo su cartera"],
      },
      { accion: "override_validaciones", permitido: false },
      { accion: "configurar_politicas", permitido: false },
      { accion: "gestionar_usuarios", permitido: false },
      {
        accion: "acceso_auditoria",
        permitido: true,
        condiciones: ["solo lectura", "su cartera"],
      },
      {
        accion: "exportar_datos",
        permitido: true,
        condiciones: ["su cartera"],
      },
      {
        accion: "firmar_contratos",
        permitido: true,
        condiciones: ["como representante comercial"],
      },
    ],
    puedeEscalarA: ["SUPERVISOR", "GERENTE_COMERCIAL"],
    requiereAprobacionDe: ["SUPERVISOR", "GERENTE_COMERCIAL"],
  },

  // ═══════════════════════════════════════════════════════════════
  // SUPERVISOR
  // ═══════════════════════════════════════════════════════════════
  {
    rol: "SUPERVISOR",
    nombre: "Supervisor Comercial",
    descripcion: "Supervisor de equipo de ventas",
    nivel: 6,
    visibilidad: "EQUIPO",
    limites: {
      valorMaximo: 500000000, // $500M CLP
      descuentoMaximo: 30, // 30%
      diasPagoMaximo: 60, // 60 días
      requiereSupervision: false,
      puedeAprobarTerminosEspeciales: true,
    },
    permisos: [
      {
        accion: "crear_contrato",
        permitido: true,
        condiciones: ["valor <= $500M"],
        limites: { valorMaximo: 500000000 },
      },
      {
        accion: "editar_contrato",
        permitido: true,
        condiciones: ["de su equipo"],
      },
      {
        accion: "eliminar_contrato",
        permitido: true,
        condiciones: ["borradores de su equipo"],
      },
      {
        accion: "ver_contrato",
        permitido: true,
        condiciones: ["contratos de su equipo"],
      },
      {
        accion: "aprobar_contrato",
        permitido: true,
        condiciones: ["hasta $500M"],
        limites: { valorMaximo: 500000000 },
      },
      { accion: "rechazar_contrato", permitido: true },
      {
        accion: "aprobar_descuento",
        permitido: true,
        condiciones: ["máximo 30%"],
        limites: { descuentoMaximo: 30 },
      },
      {
        accion: "configurar_terminos_pago",
        permitido: true,
        condiciones: ["máximo 60 días"],
        limites: { diasMaximo: 60 },
      },
      {
        accion: "ver_metricas",
        permitido: true,
        condiciones: ["de su equipo"],
      },
      {
        accion: "ver_pipeline",
        permitido: true,
        condiciones: ["de su equipo"],
      },
      {
        accion: "override_validaciones",
        permitido: true,
        condiciones: ["solo validaciones menores"],
      },
      { accion: "configurar_politicas", permitido: false },
      {
        accion: "gestionar_usuarios",
        permitido: true,
        condiciones: ["solo su equipo"],
      },
      {
        accion: "acceso_auditoria",
        permitido: true,
        condiciones: ["de su equipo"],
      },
      {
        accion: "exportar_datos",
        permitido: true,
        condiciones: ["de su equipo"],
      },
      {
        accion: "firmar_contratos",
        permitido: true,
        condiciones: ["como supervisor aprobador"],
      },
    ],
    puedeEscalarA: ["GERENTE_COMERCIAL", "GERENTE_GENERAL"],
    requiereAprobacionDe: ["GERENTE_COMERCIAL"],
  },

  // ═══════════════════════════════════════════════════════════════
  // GERENTE COMERCIAL
  // ═══════════════════════════════════════════════════════════════
  {
    rol: "GERENTE_COMERCIAL",
    nombre: "Gerente Comercial",
    descripcion: "Gerente con acceso total al área comercial",
    nivel: 8,
    visibilidad: "DEPARTAMENTO",
    limites: {
      valorMaximo: Infinity, // Sin límite
      descuentoMaximo: 50, // 50%
      diasPagoMaximo: 90, // 90 días
      requiereSupervision: false,
      puedeAprobarTerminosEspeciales: true,
    },
    permisos: [
      { accion: "crear_contrato", permitido: true },
      { accion: "editar_contrato", permitido: true },
      { accion: "eliminar_contrato", permitido: true },
      {
        accion: "ver_contrato",
        permitido: true,
        condiciones: ["acceso total pipeline"],
      },
      {
        accion: "aprobar_contrato",
        permitido: true,
        condiciones: ["sin límite de valor"],
      },
      { accion: "rechazar_contrato", permitido: true },
      {
        accion: "aprobar_descuento",
        permitido: true,
        condiciones: ["hasta 50%"],
        limites: { descuentoMaximo: 50 },
      },
      {
        accion: "configurar_terminos_pago",
        permitido: true,
        condiciones: ["hasta 90 días"],
        limites: { diasMaximo: 90 },
      },
      { accion: "ver_metricas", permitido: true, condiciones: ["totales"] },
      {
        accion: "ver_pipeline",
        permitido: true,
        condiciones: ["pipeline completo"],
      },
      {
        accion: "override_validaciones",
        permitido: true,
        condiciones: ["todas las validaciones automáticas"],
      },
      {
        accion: "configurar_politicas",
        permitido: true,
        condiciones: ["políticas de crédito"],
      },
      {
        accion: "gestionar_usuarios",
        permitido: true,
        condiciones: ["todo el departamento"],
      },
      { accion: "acceso_auditoria", permitido: true },
      { accion: "exportar_datos", permitido: true },
      {
        accion: "firmar_contratos",
        permitido: true,
        condiciones: ["como autoridad final"],
      },
    ],
    puedeEscalarA: ["GERENTE_GENERAL"],
    requiereAprobacionDe: ["GERENTE_GENERAL"],
  },

  // ═══════════════════════════════════════════════════════════════
  // GERENTE DE FACTURACIÓN
  // Firma contratos para facturación, valida OC, genera y libera facturas
  // ═══════════════════════════════════════════════════════════════
  {
    rol: "GERENTE_FACTURACION",
    nombre: "Gerente de Facturación",
    descripcion:
      "Responsable de facturación, validación de OC y emisión de facturas. Firma contratos para habilitar facturación.",
    nivel: 7,
    visibilidad: "DEPARTAMENTO",
    limites: {
      valorMaximo: Infinity, // Sin límite para facturación
      descuentoMaximo: 5, // Solo descuentos por pronto pago
      diasPagoMaximo: 90,
      requiereSupervision: false,
      puedeAprobarTerminosEspeciales: false,
    },
    permisos: [
      // Contratos - Acceso limitado a lectura y firma para facturación
      { accion: "crear_contrato", permitido: false },
      { accion: "editar_contrato", permitido: false },
      { accion: "eliminar_contrato", permitido: false },
      {
        accion: "ver_contrato",
        permitido: true,
        condiciones: ["contratos firmados para facturación"],
      },
      { accion: "aprobar_contrato", permitido: false },
      { accion: "rechazar_contrato", permitido: false },
      {
        accion: "aprobar_descuento",
        permitido: true,
        condiciones: ["solo descuento pronto pago 5%"],
        limites: { descuentoMaximo: 5 },
      },
      { accion: "configurar_terminos_pago", permitido: false },
      {
        accion: "ver_metricas",
        permitido: true,
        condiciones: ["métricas de facturación"],
      },
      {
        accion: "ver_pipeline",
        permitido: true,
        condiciones: ["contratos en facturación"],
      },
      { accion: "override_validaciones", permitido: false },
      {
        accion: "configurar_politicas",
        permitido: true,
        condiciones: ["políticas de facturación"],
      },
      {
        accion: "gestionar_usuarios",
        permitido: true,
        condiciones: ["equipo de facturación"],
      },
      { accion: "acceso_auditoria", permitido: true },
      { accion: "exportar_datos", permitido: true },
      {
        accion: "firmar_contratos",
        permitido: true,
        condiciones: ["firma para liberación a facturación"],
      },
      // Permisos específicos de facturación
      { accion: "facturar_contrato", permitido: true },
      {
        accion: "validar_oc",
        permitido: true,
        condiciones: ["validar OC contra contrato firmado"],
      },
      { accion: "generar_factura", permitido: true },
      {
        accion: "anular_factura",
        permitido: true,
        condiciones: ["con justificación y aprobación"],
      },
      {
        accion: "liberar_factura",
        permitido: true,
        condiciones: ["después de validar OC y emisión"],
      },
      {
        accion: "firmar_para_facturacion",
        permitido: true,
        condiciones: ["firma que habilita cobro"],
      },
      // Cobranza - Solo lectura
      { accion: "gestionar_cobranza", permitido: false },
      { accion: "registrar_pago", permitido: false },
      { accion: "aplicar_descuento_pago", permitido: false },
      { accion: "enviar_recordatorio_pago", permitido: false },
      { accion: "bloquear_cliente", permitido: false },
      { accion: "gestionar_mora", permitido: false },
    ],
    puedeEscalarA: ["GERENTE_GENERAL"],
    requiereAprobacionDe: ["GERENTE_GENERAL"],
  },

  // ═══════════════════════════════════════════════════════════════
  // GERENTE DE COBRANZA
  // Gestiona cobranza, registra pagos, maneja mora y bloqueos
  // ═══════════════════════════════════════════════════════════════
  {
    rol: "GERENTE_COBRANZA",
    nombre: "Gerente de Cobranza",
    descripcion:
      "Responsable de gestión de cobranza, seguimiento de pagos, mora y acciones sobre clientes morosos.",
    nivel: 7,
    visibilidad: "DEPARTAMENTO",
    limites: {
      valorMaximo: 0, // No crea contratos
      descuentoMaximo: 15, // Descuentos por arreglo de deuda
      diasPagoMaximo: 120, // Puede extender plazos para regularización
      requiereSupervision: false,
      puedeAprobarTerminosEspeciales: true, // Para planes de pago
    },
    permisos: [
      // Contratos - Solo lectura
      { accion: "crear_contrato", permitido: false },
      { accion: "editar_contrato", permitido: false },
      { accion: "eliminar_contrato", permitido: false },
      {
        accion: "ver_contrato",
        permitido: true,
        condiciones: ["contratos con saldo pendiente"],
      },
      { accion: "aprobar_contrato", permitido: false },
      { accion: "rechazar_contrato", permitido: false },
      {
        accion: "aprobar_descuento",
        permitido: true,
        condiciones: ["descuento por regularización 15%"],
        limites: { descuentoMaximo: 15 },
      },
      {
        accion: "configurar_terminos_pago",
        permitido: true,
        condiciones: ["planes de pago para mora"],
      },
      {
        accion: "ver_metricas",
        permitido: true,
        condiciones: ["métricas de cobranza"],
      },
      {
        accion: "ver_pipeline",
        permitido: true,
        condiciones: ["pipeline de cobranza"],
      },
      { accion: "override_validaciones", permitido: false },
      {
        accion: "configurar_politicas",
        permitido: true,
        condiciones: ["políticas de cobranza y mora"],
      },
      {
        accion: "gestionar_usuarios",
        permitido: true,
        condiciones: ["equipo de cobranza"],
      },
      { accion: "acceso_auditoria", permitido: true },
      { accion: "exportar_datos", permitido: true },
      { accion: "firmar_contratos", permitido: false },
      // Facturación - Solo lectura
      { accion: "facturar_contrato", permitido: false },
      { accion: "validar_oc", permitido: false },
      { accion: "generar_factura", permitido: false },
      { accion: "anular_factura", permitido: false },
      { accion: "liberar_factura", permitido: false },
      { accion: "firmar_para_facturacion", permitido: false },
      // Permisos completos de cobranza
      { accion: "gestionar_cobranza", permitido: true },
      { accion: "registrar_pago", permitido: true },
      {
        accion: "aplicar_descuento_pago",
        permitido: true,
        condiciones: ["hasta 15%"],
        limites: { descuentoMaximo: 15 },
      },
      { accion: "enviar_recordatorio_pago", permitido: true },
      {
        accion: "bloquear_cliente",
        permitido: true,
        condiciones: ["por morosidad >60 días"],
      },
      {
        accion: "gestionar_mora",
        permitido: true,
        condiciones: ["intereses, planes de pago"],
      },
    ],
    puedeEscalarA: ["GERENTE_GENERAL"],
    requiereAprobacionDe: ["GERENTE_GENERAL"],
  },

  // ═══════════════════════════════════════════════════════════════
  // GERENTE GENERAL
  // ═══════════════════════════════════════════════════════════════
  {
    rol: "GERENTE_GENERAL",
    nombre: "Gerente General",
    descripcion: "Máxima autoridad operativa",
    nivel: 9,
    visibilidad: "ORGANIZACION",
    limites: {
      valorMaximo: Infinity,
      descuentoMaximo: 100,
      diasPagoMaximo: 180,
      requiereSupervision: false,
      puedeAprobarTerminosEspeciales: true,
    },
    permisos: [
      { accion: "crear_contrato", permitido: true },
      { accion: "editar_contrato", permitido: true },
      { accion: "eliminar_contrato", permitido: true },
      { accion: "ver_contrato", permitido: true },
      { accion: "aprobar_contrato", permitido: true },
      { accion: "rechazar_contrato", permitido: true },
      { accion: "aprobar_descuento", permitido: true },
      { accion: "configurar_terminos_pago", permitido: true },
      { accion: "ver_metricas", permitido: true },
      { accion: "ver_pipeline", permitido: true },
      { accion: "override_validaciones", permitido: true },
      { accion: "configurar_politicas", permitido: true },
      { accion: "gestionar_usuarios", permitido: true },
      { accion: "acceso_auditoria", permitido: true },
      { accion: "exportar_datos", permitido: true },
      { accion: "firmar_contratos", permitido: true },
      // Facturación completa
      { accion: "facturar_contrato", permitido: true },
      { accion: "validar_oc", permitido: true },
      { accion: "generar_factura", permitido: true },
      { accion: "anular_factura", permitido: true },
      { accion: "liberar_factura", permitido: true },
      { accion: "firmar_para_facturacion", permitido: true },
      // Cobranza completa
      { accion: "gestionar_cobranza", permitido: true },
      { accion: "registrar_pago", permitido: true },
      { accion: "aplicar_descuento_pago", permitido: true },
      { accion: "enviar_recordatorio_pago", permitido: true },
      { accion: "bloquear_cliente", permitido: true },
      { accion: "gestionar_mora", permitido: true },
    ],
    puedeEscalarA: [],
    requiereAprobacionDe: [],
  },

  // ═══════════════════════════════════════════════════════════════
  // ADMIN SISTEMA
  // ═══════════════════════════════════════════════════════════════
  {
    rol: "ADMIN_SISTEMA",
    nombre: "Administrador del Sistema",
    descripcion: "Acceso técnico para configuración del sistema",
    nivel: 10,
    visibilidad: "ORGANIZACION",
    limites: {
      valorMaximo: 0, // No puede crear contratos comerciales
      descuentoMaximo: 0,
      diasPagoMaximo: 0,
      requiereSupervision: false,
      puedeAprobarTerminosEspeciales: false,
    },
    permisos: [
      { accion: "crear_contrato", permitido: false },
      { accion: "editar_contrato", permitido: false },
      { accion: "eliminar_contrato", permitido: false },
      {
        accion: "ver_contrato",
        permitido: true,
        condiciones: ["solo lectura para soporte"],
      },
      { accion: "aprobar_contrato", permitido: false },
      { accion: "rechazar_contrato", permitido: false },
      { accion: "aprobar_descuento", permitido: false },
      { accion: "configurar_terminos_pago", permitido: false },
      { accion: "ver_metricas", permitido: true },
      { accion: "ver_pipeline", permitido: true },
      {
        accion: "override_validaciones",
        permitido: true,
        condiciones: ["solo técnicas"],
      },
      { accion: "configurar_politicas", permitido: true },
      { accion: "gestionar_usuarios", permitido: true },
      { accion: "acceso_auditoria", permitido: true },
      { accion: "exportar_datos", permitido: true },
      { accion: "firmar_contratos", permitido: false },
    ],
    puedeEscalarA: [],
    requiereAprobacionDe: [],
  },
];

// ═══════════════════════════════════════════════════════════════
// SERVICIO DE CONTROL DE ACCESO
// ═══════════════════════════════════════════════════════════════

class AccessControlServiceClass {
  private static instance: AccessControlServiceClass;
  private usuarios: Map<string, Usuario> = new Map();
  private solicitudesAprobacion: Map<string, SolicitudAprobacion> = new Map();

  private constructor() {
    // Inicializar usuarios de prueba
    this.inicializarUsuariosPrueba();
  }

  static getInstance(): AccessControlServiceClass {
    if (!this.instance) {
      this.instance = new AccessControlServiceClass();
    }
    return this.instance;
  }

  private inicializarUsuariosPrueba(): void {
    const usuarios: Usuario[] = [
      {
        id: "u-001",
        nombre: "María López",
        email: "mlopez@silexar.cl",
        rol: "EJECUTIVO_JUNIOR",
        equipoId: "eq-001",
        supervisorId: "u-003",
        activo: true,
        fechaCreacion: new Date(),
      },
      {
        id: "u-002",
        nombre: "Carlos Mendoza",
        email: "cmendoza@silexar.cl",
        rol: "EJECUTIVO_SENIOR",
        equipoId: "eq-001",
        supervisorId: "u-003",
        carteraClientes: ["cli-001", "cli-002"],
        activo: true,
        fechaCreacion: new Date(),
      },
      {
        id: "u-003",
        nombre: "Ana García",
        email: "agarcia@silexar.cl",
        rol: "SUPERVISOR",
        equipoId: "eq-001",
        supervisorId: "u-004",
        activo: true,
        fechaCreacion: new Date(),
      },
      {
        id: "u-004",
        nombre: "Roberto Silva",
        email: "rsilva@silexar.cl",
        rol: "GERENTE_COMERCIAL",
        activo: true,
        fechaCreacion: new Date(),
      },
      {
        id: "u-005",
        nombre: "Patricia Muñoz",
        email: "pmunoz@silexar.cl",
        rol: "GERENTE_GENERAL",
        activo: true,
        fechaCreacion: new Date(),
      },
      // Nuevos roles de Facturación y Cobranza
      {
        id: "u-006",
        nombre: "Claudia Reyes",
        email: "creyes@silexar.cl",
        rol: "GERENTE_FACTURACION",
        activo: true,
        fechaCreacion: new Date(),
      },
      {
        id: "u-007",
        nombre: "Fernando Vargas",
        email: "fvargas@silexar.cl",
        rol: "GERENTE_COBRANZA",
        activo: true,
        fechaCreacion: new Date(),
      },
      {
        id: "u-008",
        nombre: "Sistema Admin",
        email: "admin@silexar.cl",
        rol: "ADMIN_SISTEMA",
        activo: true,
        fechaCreacion: new Date(),
      },
    ];
    usuarios.forEach((u) => this.usuarios.set(u.id, u));
  }

  // ═══════════════════════════════════════════════════════════════
  // CONSULTA DE PERMISOS
  // ═══════════════════════════════════════════════════════════════

  /**
   * Obtiene el perfil de rol completo
   */
  getPerfilRol(rol: RolUsuario): PerfilRol | undefined {
    return PERFILES_ROLES.find((p) => p.rol === rol);
  }

  /**
   * Verifica si un usuario tiene un permiso específico
   */
  tienePermiso(userId: string, accion: PermisoAccion): boolean {
    const usuario = this.usuarios.get(userId);
    if (!usuario || !usuario.activo) return false;

    const perfil = this.getPerfilRol(usuario.rol);
    if (!perfil) return false;

    const permiso = perfil.permisos.find((p) => p.accion === accion);
    return permiso?.permitido ?? false;
  }

  /**
   * Valida una acción con contexto detallado
   */
  validarAccion(params: {
    userId: string;
    accion: PermisoAccion;
    contexto: {
      valorContrato?: number;
      descuento?: number;
      diasPago?: number;
      contratoId?: string;
      propietarioId?: string;
      terminosEspeciales?: boolean;
    };
  }): ValidacionPermiso {
    const usuario = this.usuarios.get(params.userId);
    if (!usuario || !usuario.activo) {
      return {
        permitido: false,
        razon: "Usuario no encontrado o inactivo",
        requiereAprobacion: false,
        aprobadoresSugeridos: [],
        limitesExcedidos: [],
        accionesDisponibles: [],
      };
    }

    const perfil = this.getPerfilRol(usuario.rol);
    if (!perfil) {
      return {
        permitido: false,
        razon: "Rol no configurado",
        requiereAprobacion: false,
        aprobadoresSugeridos: [],
        limitesExcedidos: [],
        accionesDisponibles: [],
      };
    }

    const permiso = perfil.permisos.find((p) => p.accion === params.accion);
    if (!permiso || !permiso.permitido) {
      return {
        permitido: false,
        razon:
          `Acción "${params.accion}" no permitida para rol ${perfil.nombre}`,
        requiereAprobacion: true,
        aprobadoresSugeridos: this.obtenerAprobadores(usuario, params.accion),
        limitesExcedidos: [],
        accionesDisponibles: ["solicitar_aprobacion"],
      };
    }

    // Verificar límites
    const limitesExcedidos: {
      limite: string;
      valor: number;
      maximo: number;
    }[] = [];

    // Límite de valor de contrato
    if (
      params.contexto.valorContrato && perfil.limites.valorMaximo < Infinity
    ) {
      if (params.contexto.valorContrato > perfil.limites.valorMaximo) {
        limitesExcedidos.push({
          limite: "Valor del contrato",
          valor: params.contexto.valorContrato,
          maximo: perfil.limites.valorMaximo,
        });
      }
    }

    // Límite de descuento
    if (params.contexto.descuento !== undefined) {
      if (params.contexto.descuento > perfil.limites.descuentoMaximo) {
        limitesExcedidos.push({
          limite: "Porcentaje de descuento",
          valor: params.contexto.descuento,
          maximo: perfil.limites.descuentoMaximo,
        });
      }
    }

    // Límite de días de pago
    if (params.contexto.diasPago !== undefined) {
      if (params.contexto.diasPago > perfil.limites.diasPagoMaximo) {
        limitesExcedidos.push({
          limite: "Días de pago",
          valor: params.contexto.diasPago,
          maximo: perfil.limites.diasPagoMaximo,
        });
      }
    }

    // Términos especiales
    if (
      params.contexto.terminosEspeciales &&
      !perfil.limites.puedeAprobarTerminosEspeciales
    ) {
      limitesExcedidos.push({
        limite: "Términos especiales",
        valor: 1,
        maximo: 0,
      });
    }

    // Verificar visibilidad (propiedad del contrato)
    if (params.contexto.propietarioId && perfil.visibilidad === "PROPIOS") {
      if (params.contexto.propietarioId !== params.userId) {
        return {
          permitido: false,
          razon: "No tiene acceso a contratos de otros usuarios",
          requiereAprobacion: false,
          aprobadoresSugeridos: [],
          limitesExcedidos: [],
          accionesDisponibles: [],
        };
      }
    }

    // Si hay límites excedidos, requiere aprobación
    if (limitesExcedidos.length > 0) {
      return {
        permitido: false,
        razon: "Límites excedidos",
        requiereAprobacion: true,
        aprobadoresSugeridos: this.obtenerAprobadores(usuario, params.accion),
        limitesExcedidos,
        accionesDisponibles: ["solicitar_aprobacion", "ajustar_valores"],
      };
    }

    // Verificar si requiere supervisión
    if (perfil.limites.requiereSupervision) {
      return {
        permitido: true,
        requiereAprobacion: true,
        aprobadoresSugeridos: this.obtenerAprobadores(usuario, params.accion),
        limitesExcedidos: [],
        accionesDisponibles: ["crear_con_supervision"],
      };
    }

    return {
      permitido: true,
      requiereAprobacion: false,
      aprobadoresSugeridos: [],
      limitesExcedidos: [],
      accionesDisponibles: ["ejecutar"],
    };
  }

  /**
   * Obtiene aprobadores sugeridos para un usuario
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private obtenerAprobadores(
    usuario: Usuario,
    _accion: PermisoAccion,
  ): Usuario[] {
    const aprobadores: Usuario[] = [];
    const perfilUsuario = this.getPerfilRol(usuario.rol);

    if (!perfilUsuario) return [];

    // Obtener todos los usuarios con roles superiores
    for (const rolAprobador of perfilUsuario.requiereAprobacionDe) {
      const usuariosRol = Array.from(this.usuarios.values())
        .filter((u) => u.rol === rolAprobador && u.activo);

      // Priorizar supervisor directo
      if (usuario.supervisorId) {
        const supervisor = this.usuarios.get(usuario.supervisorId);
        if (supervisor && supervisor.rol === rolAprobador) {
          aprobadores.unshift(supervisor);
          continue;
        }
      }

      aprobadores.push(...usuariosRol);
    }

    return aprobadores;
  }

  // ═══════════════════════════════════════════════════════════════
  // SOLICITUDES DE APROBACIÓN
  // ═══════════════════════════════════════════════════════════════

  /**
   * Crea una solicitud de aprobación
   */
  async crearSolicitudAprobacion(params: {
    solicitanteId: string;
    aprobadorId: string;
    tipo: PermisoAccion;
    recursoId: string;
    datosAdicionales: Record<string, unknown>;
  }): Promise<SolicitudAprobacion> {
    const solicitud: SolicitudAprobacion = {
      id: `sol-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...params,
      estado: "PENDIENTE",
      fechaCreacion: new Date(),
    };

    this.solicitudesAprobacion.set(solicitud.id, solicitud);

    // Notificar al aprobador (simulado)
    logger.info(`Notificación enviada a aprobador ${params.aprobadorId}`);

    return solicitud;
  }

  /**
   * Procesa una solicitud de aprobación
   */
  async procesarSolicitud(params: {
    solicitudId: string;
    aprobadorId: string;
    decision: "APROBADO" | "RECHAZADO";
    comentarios?: string;
  }): Promise<SolicitudAprobacion> {
    const solicitud = this.solicitudesAprobacion.get(params.solicitudId);
    if (!solicitud) throw new Error("Solicitud no encontrada");
    if (solicitud.aprobadorId !== params.aprobadorId) {
      throw new Error("No autorizado");
    }
    if (solicitud.estado !== "PENDIENTE") {
      throw new Error("Solicitud ya procesada");
    }

    solicitud.estado = params.decision;
    solicitud.fechaResolucion = new Date();
    solicitud.comentarios = params.comentarios;

    return solicitud;
  }

  /**
   * Obtiene solicitudes pendientes para un aprobador
   */
  getSolicitudesPendientes(aprobadorId: string): SolicitudAprobacion[] {
    return Array.from(this.solicitudesAprobacion.values())
      .filter((s) => s.aprobadorId === aprobadorId && s.estado === "PENDIENTE")
      .sort((a, b) => b.fechaCreacion.getTime() - a.fechaCreacion.getTime());
  }

  // ═══════════════════════════════════════════════════════════════
  // UTILIDADES
  // ═══════════════════════════════════════════════════════════════

  /**
   * Obtiene todos los perfiles de rol disponibles
   */
  getAllPerfilesRol(): PerfilRol[] {
    return [...PERFILES_ROLES];
  }

  /**
   * Obtiene usuario por ID
   */
  getUsuario(userId: string): Usuario | undefined {
    return this.usuarios.get(userId);
  }

  /**
   * Obtiene resumen de límites para un rol
   */
  getResumenLimites(rol: RolUsuario): LimitesContrato | undefined {
    return this.getPerfilRol(rol)?.limites;
  }

  /**
   * Verifica si un usuario puede aprobar a otro
   */
  puedeAprobar(aprobadorId: string, solicitanteId: string): boolean {
    const aprobador = this.usuarios.get(aprobadorId);
    const solicitante = this.usuarios.get(solicitanteId);

    if (!aprobador || !solicitante) return false;

    const perfilAprobador = this.getPerfilRol(aprobador.rol);
    const perfilSolicitante = this.getPerfilRol(solicitante.rol);

    if (!perfilAprobador || !perfilSolicitante) return false;

    return perfilAprobador.nivel > perfilSolicitante.nivel;
  }
}

export const AccessControlService = AccessControlServiceClass.getInstance();

// Hook para uso en componentes React
export function useAccessControl() {
  return AccessControlService;
}
