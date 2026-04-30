/**
 * 🎬 SILEXAR PULSE - Material Validation Service
 *
 * @description Servicio de validación de material creativo
 * con análisis de coherencia y gestión de faltantes.
 *
 * @version 2025.4.0
 * @tier TIER_0_FORTUNE_10
 */

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

export type EstadoMaterial =
  | "ACTIVO"
  | "PENDIENTE"
  | "VENCIDO"
  | "RECHAZADO"
  | "EN_REVISION";
export type TipoMaterial = "AUDIO" | "VIDEO" | "IMAGEN" | "HTML5" | "TEXTO";

export interface MaterialCreativo {
  id: string;
  codigo: string;
  nombre: string;
  tipo: TipoMaterial;
  duracion?: number; // segundos
  formato: string;
  estado: EstadoMaterial;
  fechaCreacion: Date;
  fechaVencimientos?: Date;
  anuncianteId: string;
  campanaId?: string;
  urlPreview?: string;
  aprobadoLegal: boolean;
  aprobadoCliente: boolean;
  tags: string[];
}

export interface ValidacionMaterial {
  materialId: string;
  materialCodigo: string;
  existe: boolean;
  estadoActual: EstadoMaterial;
  esApropiado: boolean;
  problemas: ProblemaValidacion[];
  sugerencias: string[];
  compatibilidad: {
    medioTipo: string;
    compatible: boolean;
    razon?: string;
  }[];
}

export interface ProblemaValidacion {
  tipo: "DURACION" | "FORMATO" | "VENCIMIENTOS" | "APROBACION" | "COHERENCIA";
  severidad: "BAJA" | "MEDIA" | "ALTA" | "CRITICA";
  descripcion: string;
  solucion?: string;
}

export interface MaterialFaltante {
  medioId: string;
  medioNombre: string;
  medioTipo: string;
  duracionRequerida: number;
  formatoRequerido: string;
  fechaLimite: Date;
  prioridad: "BAJA" | "NORMAL" | "ALTA" | "URGENTE";
}

export interface AnalisisCoherencia {
  score: number; // 0-100
  esCoherente: boolean;
  factores: {
    nombre: string;
    valor: number;
    comentario: string;
  }[];
  recomendaciones: string[];
}

// ═══════════════════════════════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════════════════════════════

const mockMateriales: MaterialCreativo[] = [
  {
    id: "mat-001",
    codigo: "CNA-2025-00123",
    nombre: "SuperMax Navidad 30s",
    tipo: "AUDIO",
    duracion: 30,
    formato: "WAV",
    estado: "ACTIVO",
    fechaCreacion: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    fechaVencimientos: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
    anuncianteId: "anun-001",
    aprobadoLegal: true,
    aprobadoCliente: true,
    tags: ["navidad", "promocion", "retail"],
  },
  {
    id: "mat-002",
    codigo: "CNA-2025-00124",
    nombre: "SuperMax Navidad 20s",
    tipo: "AUDIO",
    duracion: 20,
    formato: "WAV",
    estado: "ACTIVO",
    fechaCreacion: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
    anuncianteId: "anun-001",
    aprobadoLegal: true,
    aprobadoCliente: true,
    tags: ["navidad", "promocion"],
  },
  {
    id: "mat-003",
    codigo: "CNA-2025-00125",
    nombre: "SuperMax Video Central",
    tipo: "VIDEO",
    duracion: 30,
    formato: "MP4",
    estado: "PENDIENTE",
    fechaCreacion: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    anuncianteId: "anun-001",
    aprobadoLegal: false,
    aprobadoCliente: true,
    tags: ["navidad", "video", "tv"],
  },
];

// ═══════════════════════════════════════════════════════════════
// SERVICIO
// ═══════════════════════════════════════════════════════════════

class MaterialValidationServiceClass {
  private static instance: MaterialValidationServiceClass;

  private constructor() {}

  static getInstance(): MaterialValidationServiceClass {
    if (!this.instance) {
      this.instance = new MaterialValidationServiceClass();
    }
    return this.instance;
  }

  // ═══════════════════════════════════════════════════════════════
  // CHECK AUTOMÁTICO
  // ═══════════════════════════════════════════════════════════════

  /**
   * Verifica materiales activos para un anunciante
   */
  async verificarMaterialesAnunciante(anuncianteId: string): Promise<{
    materialesActivos: MaterialCreativo[];
    materialesPendientes: MaterialCreativo[];
    materialesVencidos: MaterialCreativo[];
    totalMateriales: number;
  }> {
    // Simular consulta
    await new Promise((resolve) => setTimeout(resolve, 300));

    const materiales = mockMateriales.filter((m) =>
      m.anuncianteId === anuncianteId
    );

    return {
      materialesActivos: materiales.filter((m) => m.estado === "ACTIVO"),
      materialesPendientes: materiales.filter((m) =>
        m.estado === "PENDIENTE" || m.estado === "EN_REVISION"
      ),
      materialesVencidos: materiales.filter((m) => m.estado === "VENCIDO"),
      totalMateriales: materiales.length,
    };
  }

  /**
   * Valida un material específico para una campaña
   */
  async validarMaterial(params: {
    codigoMaterial: string;
    duracionRequerida: number;
    medioTipo: string;
    fechaCampana: Date;
  }): Promise<ValidacionMaterial> {
    await new Promise((resolve) => setTimeout(resolve, 200));

    const material = mockMateriales.find((m) =>
      m.codigo === params.codigoMaterial
    );

    if (!material) {
      return {
        materialId: "",
        materialCodigo: params.codigoMaterial,
        existe: false,
        estadoActual: "PENDIENTE",
        esApropiado: false,
        problemas: [{
          tipo: "COHERENCIA",
          severidad: "CRITICA",
          descripcion: "Material no encontrado en el sistema",
          solucion: "Crear o importar el material creativo",
        }],
        sugerencias: ["Crear nuevo material desde el sistema de cuñas"],
        compatibilidad: [],
      };
    }

    const problemas: ProblemaValidacion[] = [];
    const sugerencias: string[] = [];

    // Validar duración
    if (material.duracion !== params.duracionRequerida) {
      problemas.push({
        tipo: "DURACION",
        severidad: "ALTA",
        descripcion:
          `Duración ${material.duracion}s no coincide con requerida ${params.duracionRequerida}s`,
        solucion: "Editar material o seleccionar versión correcta",
      });
    }

    // Validar vencimientos
    if (
      material.fechaVencimientos &&
      material.fechaVencimientos < params.fechaCampana
    ) {
      problemas.push({
        tipo: "VENCIMIENTOS",
        severidad: "ALTA",
        descripcion: "Material vencerá antes de finalizar la campaña",
        solucion: "Renovar vigencia del material",
      });
    }

    // Validar aprobaciones
    if (!material.aprobadoLegal) {
      problemas.push({
        tipo: "APROBACION",
        severidad: "CRITICA",
        descripcion: "Material pendiente de aprobación legal",
        solucion: "Enviar a revisión legal",
      });
    }

    // Compatibilidad con medio
    const compatibilidad = this.verificarCompatibilidad(
      material,
      params.medioTipo,
    );

    return {
      materialId: material.id,
      materialCodigo: material.codigo,
      existe: true,
      estadoActual: material.estado,
      esApropiado: problemas.length === 0 && compatibilidad.compatible,
      problemas,
      sugerencias,
      compatibilidad: [compatibilidad],
    };
  }

  private verificarCompatibilidad(
    material: MaterialCreativo,
    medioTipo: string,
  ): {
    medioTipo: string;
    compatible: boolean;
    razon?: string;
  } {
    const compatibilidadMap: Record<string, TipoMaterial[]> = {
      "RADIO": ["AUDIO"],
      "TV": ["VIDEO", "AUDIO"],
      "DIGITAL": ["VIDEO", "IMAGEN", "HTML5"],
      "VIA_PUBLICA": ["IMAGEN", "VIDEO"],
    };

    const tiposCompatibles = compatibilidadMap[medioTipo] || [];
    const compatible = tiposCompatibles.includes(material.tipo);

    return {
      medioTipo,
      compatible,
      razon: compatible
        ? `Material ${material.tipo} es compatible con ${medioTipo}`
        : `Material ${material.tipo} no es compatible con ${medioTipo}. Se requiere: ${
          tiposCompatibles.join(", ")
        }`,
    };
  }

  // ═══════════════════════════════════════════════════════════════
  // ANÁLISIS DE COHERENCIA
  // ═══════════════════════════════════════════════════════════════

  /**
   * Analiza coherencia del material con la campaña
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async analizarCoherencia(_params: {
    materialId: string;
    campanaNombre: string;
    industria: string;
    objetivoCampana: string;
    audienciaTarget?: string;
  }): Promise<AnalisisCoherencia> {
    await new Promise((resolve) => setTimeout(resolve, 400));

    // Simulación de análisis IA
    const factores = [
      {
        nombre: "Relevancia temática",
        valor: 85 + Math.floor(Math.random() * 15),
        comentario: "El mensaje se alinea con el objetivo de campaña",
      },
      {
        nombre: "Tono y estilo",
        valor: 75 + Math.floor(Math.random() * 20),
        comentario: "Consistente con la marca del anunciante",
      },
      {
        nombre: "Temporalidad",
        valor: 90 + Math.floor(Math.random() * 10),
        comentario: "Apropiado para la temporada de la campaña",
      },
      {
        nombre: "Audiencia target",
        valor: 70 + Math.floor(Math.random() * 25),
        comentario: "Mensaje resonante con el público objetivo",
      },
    ];

    const scorePromedio = factores.reduce((acc, f) => acc + f.valor, 0) /
      factores.length;

    return {
      score: Math.round(scorePromedio),
      esCoherente: scorePromedio >= 70,
      factores,
      recomendaciones: scorePromedio < 80
        ? [
          "Considerar ajustar el mensaje para mayor impacto",
          "Validar con focus group del target",
        ]
        : ["Material óptimo para la campaña"],
    };
  }

  // ═══════════════════════════════════════════════════════════════
  // ALERTAS DE FALTANTE
  // ═══════════════════════════════════════════════════════════════

  /**
   * Lista materiales faltantes para una especificación
   */
  async listarMaterialFaltante(
    especificaciones: Array<{
      medioId: string;
      medioNombre: string;
      medioTipo: string;
      duracionSpot: number;
      codigoMaterialAsignado?: string;
      fechaInicio: Date;
    }>,
  ): Promise<MaterialFaltante[]> {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const faltantes: MaterialFaltante[] = [];

    for (const esp of especificaciones) {
      if (!esp.codigoMaterialAsignado) {
        const diasHastaInicio = Math.ceil(
          (esp.fechaInicio.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
        );

        faltantes.push({
          medioId: esp.medioId,
          medioNombre: esp.medioNombre,
          medioTipo: esp.medioTipo,
          duracionRequerida: esp.duracionSpot,
          formatoRequerido: this.obtenerFormatoRequerido(esp.medioTipo),
          fechaLimite: new Date(
            esp.fechaInicio.getTime() - 3 * 24 * 60 * 60 * 1000,
          ), // 3 días antes
          prioridad: diasHastaInicio <= 7
            ? "URGENTE"
            : diasHastaInicio <= 14
            ? "ALTA"
            : "NORMAL",
        });
      }
    }

    return faltantes;
  }

  private obtenerFormatoRequerido(medioTipo: string): string {
    const formatos: Record<string, string> = {
      "RADIO": "WAV/MP3",
      "TV": "MP4/MOV",
      "DIGITAL": "MP4/GIF/HTML5",
      "VIA_PUBLICA": "JPEG/PNG",
    };
    return formatos[medioTipo] || "Consultar";
  }

  // ═══════════════════════════════════════════════════════════════
  // INTEGRACIÓN DIRECTA
  // ═══════════════════════════════════════════════════════════════

  /**
   * Crea solicitud de material desde contrato
   */
  async crearSolicitudMaterial(params: {
    contratoId: string;
    anuncianteId: string;
    campanaNombre: string;
    especificaciones: Array<{
      medioTipo: string;
      duracion: number;
      cantidad: number;
      fechaRequerida: Date;
    }>;
    notas?: string;
  }): Promise<{
    solicitudId: string;
    urlModuloCunas: string;
  }> {
    await new Promise((resolve) => setTimeout(resolve, 200));

    const solicitudId = `SOL-${Date.now()}`;

    return {
      solicitudId,
      urlModuloCunas:
        `/cunas/nueva?solicitud=${solicitudId}&contrato=${params.contratoId}`,
    };
  }

  /**
   * Busca materiales sugeridos para la campaña
   */
  async buscarMaterialesSugeridos(params: {
    anuncianteId: string;
    medioTipo: string;
    duracion: number;
    tags?: string[];
  }): Promise<MaterialCreativo[]> {
    await new Promise((resolve) => setTimeout(resolve, 250));

    return mockMateriales.filter((m) =>
      m.anuncianteId === params.anuncianteId &&
      m.estado === "ACTIVO" &&
      m.duracion === params.duracion
    );
  }
}

export const MaterialValidationService = MaterialValidationServiceClass
  .getInstance();

// Hook para uso en componentes React
export function useMaterialValidation() {
  return MaterialValidationService;
}
