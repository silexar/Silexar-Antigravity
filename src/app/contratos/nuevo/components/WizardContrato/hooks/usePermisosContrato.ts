/**
 * 🔐 SILEXAR PULSE - Hook usePermisosContrato TIER 0
 *
 * @description Hook para gestionar permisos de contrato en el frontend,
 * incluyendo verificación de niveles de aprobación anti-fraude.
 *
 * @version 2025.4.0
 * @tier TIER_0_FORTUNE_10
 */

"use client";

import { useCallback, useMemo } from "react";

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

export type NivelJerarquico =
  | "ejecutivo"
  | "jefatura_directa"
  | "gerente_comercial"
  | "gerente_general"
  | "admin";

export interface UsuarioActual {
  id: string;
  nombre: string;
  email: string;
  nivel: NivelJerarquico;
  departamento?: string;
  supervisorId?: string;
  permisos: string[];
}

export interface PermisoAprobacion {
  puedeAprobar: boolean;
  nivelRequerido: NivelJerarquico;
  mensaje?: string;
}

export interface PermisosContrato {
  // Acciones básicas
  puedeCrear: boolean;
  puedeEditar: boolean;
  puedeEliminar: boolean;
  puedeVer: boolean;

  // Evidencias
  puedeSubirEvidencia: boolean;
  puedeValidarEvidencia: boolean;
  puedeEliminarEvidencia: boolean;

  // Aprobaciones
  puedeAprobarDescuento: (porcentaje: number) => PermisoAprobacion;
  puedeVerJustificacion: boolean;

  // Campañas
  puedeCargarCampana: (estadoContrato: string) => boolean;
  puedeBloquearCampana: boolean;

  // Admin
  puedeOverrideAprobacion: boolean;
  puedeVerHistorialCompleto: boolean;

  // Utilidades
  nivelActual: NivelJerarquico;
  esAprobador: boolean;
  esAdmin: boolean;
}

// ═══════════════════════════════════════════════════════════════
// PERMISOS POR NIVEL (mirror del backend)
// ═══════════════════════════════════════════════════════════════

const PERMISOS_ANTI_FRAUDE = {
  SUBIR_EVIDENCIA: "contrato:evidencia:subir",
  VALIDAR_EVIDENCIA: "contrato:evidencia:validar",
  ELIMINAR_EVIDENCIA: "contrato:evidencia:eliminar",
  APROBAR_DESCUENTO_BAJO: "contrato:aprobar:hasta_50",
  APROBAR_DESCUENTO_MEDIO: "contrato:aprobar:hasta_64",
  APROBAR_DESCUENTO_ALTO: "contrato:aprobar:hasta_100",
  REQUERIR_JUSTIFICACION: "contrato:justificacion:requerir",
  VER_JUSTIFICACION: "contrato:justificacion:ver",
  CARGAR_CAMPANA: "contrato:campana:cargar",
  BLOQUEAR_CAMPANA: "contrato:campana:bloquear",
  OVERRIDE_APROBACION: "contrato:aprobar:override",
  VER_HISTORIAL_COMPLETO: "contrato:historial:completo",
} as const;

const PERMISOS_POR_NIVEL: Record<NivelJerarquico, string[]> = {
  ejecutivo: [
    "contrato:crear",
    "contrato:ver",
    PERMISOS_ANTI_FRAUDE.SUBIR_EVIDENCIA,
    PERMISOS_ANTI_FRAUDE.CARGAR_CAMPANA,
  ],
  jefatura_directa: [
    "contrato:crear",
    "contrato:editar",
    "contrato:ver",
    PERMISOS_ANTI_FRAUDE.SUBIR_EVIDENCIA,
    PERMISOS_ANTI_FRAUDE.VALIDAR_EVIDENCIA,
    PERMISOS_ANTI_FRAUDE.APROBAR_DESCUENTO_BAJO,
    PERMISOS_ANTI_FRAUDE.VER_JUSTIFICACION,
    PERMISOS_ANTI_FRAUDE.CARGAR_CAMPANA,
  ],
  gerente_comercial: [
    "contrato:crear",
    "contrato:editar",
    "contrato:ver",
    PERMISOS_ANTI_FRAUDE.SUBIR_EVIDENCIA,
    PERMISOS_ANTI_FRAUDE.VALIDAR_EVIDENCIA,
    PERMISOS_ANTI_FRAUDE.ELIMINAR_EVIDENCIA,
    PERMISOS_ANTI_FRAUDE.APROBAR_DESCUENTO_BAJO,
    PERMISOS_ANTI_FRAUDE.APROBAR_DESCUENTO_MEDIO,
    PERMISOS_ANTI_FRAUDE.VER_JUSTIFICACION,
    PERMISOS_ANTI_FRAUDE.CARGAR_CAMPANA,
    PERMISOS_ANTI_FRAUDE.BLOQUEAR_CAMPANA,
  ],
  gerente_general: [
    "contrato:crear",
    "contrato:editar",
    "contrato:eliminar",
    "contrato:ver",
    PERMISOS_ANTI_FRAUDE.SUBIR_EVIDENCIA,
    PERMISOS_ANTI_FRAUDE.VALIDAR_EVIDENCIA,
    PERMISOS_ANTI_FRAUDE.ELIMINAR_EVIDENCIA,
    PERMISOS_ANTI_FRAUDE.APROBAR_DESCUENTO_BAJO,
    PERMISOS_ANTI_FRAUDE.APROBAR_DESCUENTO_MEDIO,
    PERMISOS_ANTI_FRAUDE.APROBAR_DESCUENTO_ALTO,
    PERMISOS_ANTI_FRAUDE.REQUERIR_JUSTIFICACION,
    PERMISOS_ANTI_FRAUDE.VER_JUSTIFICACION,
    PERMISOS_ANTI_FRAUDE.CARGAR_CAMPANA,
    PERMISOS_ANTI_FRAUDE.BLOQUEAR_CAMPANA,
    PERMISOS_ANTI_FRAUDE.VER_HISTORIAL_COMPLETO,
  ],
  admin: [
    "contrato:*",
    ...Object.values(PERMISOS_ANTI_FRAUDE),
  ],
};

// ═══════════════════════════════════════════════════════════════
// MOCK DE USUARIO ACTUAL (para desarrollo)
// ═══════════════════════════════════════════════════════════════

// En producción esto vendría de un contexto de autenticación
const getMockUsuarioActual = (): UsuarioActual => ({
  id: "usr_mock_001",
  nombre: "Usuario Demo",
  email: "demo@silexar.com",
  nivel: "jefatura_directa", // Cambiar para probar diferentes niveles
  departamento: "Comercial",
  permisos: [],
});

// ═══════════════════════════════════════════════════════════════
// HOOK PRINCIPAL
// ═══════════════════════════════════════════════════════════════

export function usePermisosContrato(usuario?: UsuarioActual): PermisosContrato {
  // Usar usuario proporcionado o mock
  const usuarioActual = usuario || getMockUsuarioActual();

  // Calcular permisos efectivos
  const permisosEfectivos = useMemo(() => {
    const permisosPorNivel = PERMISOS_POR_NIVEL[usuarioActual.nivel] || [];
    return [...new Set([...usuarioActual.permisos, ...permisosPorNivel])];
  }, [usuarioActual.nivel, usuarioActual.permisos]);

  // Función helper para verificar permisos
  const tienePermiso = useCallback((permiso: string): boolean => {
    if (usuarioActual.nivel === "admin") return true;
    if (permisosEfectivos.includes("contrato:*")) return true;
    return permisosEfectivos.includes(permiso);
  }, [permisosEfectivos, usuarioActual.nivel]);

  // Verificar aprobación de descuento
  const puedeAprobarDescuento = useCallback(
    (porcentaje: number): PermisoAprobacion => {
      let permisoRequerido: string;
      let nivelRequerido: NivelJerarquico;

      if (porcentaje <= 50) {
        permisoRequerido = PERMISOS_ANTI_FRAUDE.APROBAR_DESCUENTO_BAJO;
        nivelRequerido = "jefatura_directa";
      } else if (porcentaje <= 64) {
        permisoRequerido = PERMISOS_ANTI_FRAUDE.APROBAR_DESCUENTO_MEDIO;
        nivelRequerido = "gerente_comercial";
      } else {
        permisoRequerido = PERMISOS_ANTI_FRAUDE.APROBAR_DESCUENTO_ALTO;
        nivelRequerido = "gerente_general";
      }

      const puedeAprobar = tienePermiso(permisoRequerido);

      return {
        puedeAprobar,
        nivelRequerido,
        mensaje: puedeAprobar
          ? undefined
          : `Descuento de ${porcentaje}% requiere aprobación de ${
            nivelRequerido.replace("_", " ")
          }`,
      };
    },
    [tienePermiso],
  );

  // Verificar si puede cargar campañas
  const puedeCargarCampana = useCallback((estadoContrato: string): boolean => {
    if (estadoContrato !== "operativo") return false;
    return tienePermiso(PERMISOS_ANTI_FRAUDE.CARGAR_CAMPANA);
  }, [tienePermiso]);

  // Construir objeto de permisos
  const permisos = useMemo((): PermisosContrato => ({
    // Acciones básicas
    puedeCrear: tienePermiso("contrato:crear"),
    puedeEditar: tienePermiso("contrato:editar"),
    puedeEliminar: tienePermiso("contrato:eliminar"),
    puedeVer: tienePermiso("contrato:ver"),

    // Evidencias
    puedeSubirEvidencia: tienePermiso(PERMISOS_ANTI_FRAUDE.SUBIR_EVIDENCIA),
    puedeValidarEvidencia: tienePermiso(PERMISOS_ANTI_FRAUDE.VALIDAR_EVIDENCIA),
    puedeEliminarEvidencia: tienePermiso(
      PERMISOS_ANTI_FRAUDE.ELIMINAR_EVIDENCIA,
    ),

    // Aprobaciones
    puedeAprobarDescuento,
    puedeVerJustificacion: tienePermiso(PERMISOS_ANTI_FRAUDE.VER_JUSTIFICACION),

    // Campañas
    puedeCargarCampana,
    puedeBloquearCampana: tienePermiso(PERMISOS_ANTI_FRAUDE.BLOQUEAR_CAMPANA),

    // Admin
    puedeOverrideAprobacion: tienePermiso(
      PERMISOS_ANTI_FRAUDE.OVERRIDE_APROBACION,
    ),
    puedeVerHistorialCompleto: tienePermiso(
      PERMISOS_ANTI_FRAUDE.VER_HISTORIAL_COMPLETO,
    ),

    // Utilidades
    nivelActual: usuarioActual.nivel,
    esAprobador: [
      "jefatura_directa",
      "gerente_comercial",
      "gerente_general",
      "admin",
    ].includes(usuarioActual.nivel),
    esAdmin: usuarioActual.nivel === "admin",
  }), [
    tienePermiso,
    puedeAprobarDescuento,
    puedeCargarCampana,
    usuarioActual.nivel,
  ]);

  return permisos;
}

// ═══════════════════════════════════════════════════════════════
// HELPERS EXPORTADOS
// ═══════════════════════════════════════════════════════════════

export const getNivelRequeridoParaDescuento = (
  porcentaje: number,
): NivelJerarquico => {
  if (porcentaje <= 50) return "jefatura_directa";
  if (porcentaje <= 64) return "gerente_comercial";
  return "gerente_general";
};

export const requiereJustificacion = (porcentaje: number): boolean => {
  return porcentaje >= 65;
};

export const NIVELES_JERARQUICOS: { value: NivelJerarquico; label: string }[] =
  [
    { value: "ejecutivo", label: "Ejecutivo" },
    { value: "jefatura_directa", label: "Jefatura Directa" },
    { value: "gerente_comercial", label: "Gerente Comercial" },
    { value: "gerente_general", label: "Gerente General" },
    { value: "admin", label: "Administrador" },
  ];
