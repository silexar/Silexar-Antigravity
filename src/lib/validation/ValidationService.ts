/**
 * 🔍 SILEXAR PULSE - Validation & Alerts Service TIER 0
 * 
 * Validación inteligente de contenido publicitario:
 * - Detección de competencia
 * - Verificación legal
 * - Análisis de vencimientos
 * - Auditoría de audio
 * 
 * @version 2050.1.0
 * @tier TIER_0_FORTUNE_10
 */

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

export interface ResultadoValidacion {
  esValido: boolean;
  score: number; // 0-100
  alertas: Alerta[];
  sugerencias: string[];
  tiempoAnalisis: number;
}

export interface Alerta {
  id: string;
  tipo: 'error' | 'warning' | 'info';
  categoria: 'competencia' | 'legal' | 'duracion' | 'audio' | 'vencimientos' | 'contenido';
  titulo: string;
  mensaje: string;
  detalle?: string;
  accionRequerida: boolean;
  resolucion?: string;
}

export interface ConfiguracionValidacion {
  validarCompetencia: boolean;
  validarLegal: boolean;
  validarDuracion: boolean;
  validarAudio: boolean;
  validarVencimientos: boolean;
  duracionMaxima?: number;
  duracionMinima?: number;
  competidoresExcluidos?: string[];
  palabrasProhibidas?: string[];
}

// ═══════════════════════════════════════════════════════════════
// CONSTANTES
// ═══════════════════════════════════════════════════════════════

const COMPETIDORES_DEFAULT: Record<string, string[]> = {
  'Banco de Chile': ['Banco Santander', 'BCI', 'Banco Estado', 'Itaú', 'Scotiabank'],
  'Coca-Cola': ['Pepsi', 'Fanta', 'Sprite'],
  'Falabella': ['Ripley', 'Paris', 'La Polar', 'Hites'],
  'Movistar': ['Entel', 'Claro', 'WOM', 'VTR'],
  'LATAM': ['SKY', 'JetSmart', 'Aerolíneas Argentinas'],
  'McDonald\'s': ['Burger King', 'Wendy\'s', 'KFC', 'Carl\'s Jr'],
  'Jumbo': ['Líder', 'Unimarc', 'Tottus', 'Santa Isabel'],
  'Entel': ['Movistar', 'Claro', 'WOM']
};

const PALABRAS_LEGALES: { palabra: string; advertencia: string }[] = [
  { palabra: 'gratis', advertencia: 'La palabra "gratis" puede requerir asterisco con condiciones' },
  { palabra: 'garantizado', advertencia: 'Las garantías deben estar respaldadas legalmente' },
  { palabra: 'el mejor', advertencia: 'Afirmaciones de superioridad requieren estudios que lo respalden' },
  { palabra: 'número uno', advertencia: 'Las afirmaciones de liderazgo deben ser verificables' },
  { palabra: 'sin costo', advertencia: 'Debe aclarar si hay costos asociados indirectos' },
  { palabra: 'cura', advertencia: 'Claims de salud requieren aprobación regulatoria' },
  { palabra: 'milagro', advertencia: 'Evitar lenguaje que pueda confundirse con claims médicos' },
  { palabra: 'único', advertencia: 'Afirmaciones de exclusividad deben ser verificables' },
  { palabra: 'oferta válida', advertencia: 'Debe especificar fechas de vigencia' },
  { palabra: 'hasta', advertencia: 'Incluir condiciones cuando se usa "hasta X% de descuento"' }
];

const SILENCIOS_MAXIMOS = 2; // segundos de silencio máximo permitido
const VOLUMEN_MINIMO_LUFS = -23; // EBU R128 standard

// ═══════════════════════════════════════════════════════════════
// SERVICIO
// ═══════════════════════════════════════════════════════════════

export class ValidationService {
  
  // ─────────────────────────────────────────────────────────────
  // VALIDACIÓN COMPLETA
  // ─────────────────────────────────────────────────────────────

  async validarContenido(
    texto: string,
    anunciante: string,
    duracionSegundos?: number,
    audioMetadata?: { lufs?: number; silencioMaximo?: number },
    config: ConfiguracionValidacion = {
      validarCompetencia: true,
      validarLegal: true,
      validarDuracion: true,
      validarAudio: true,
      validarVencimientos: true
    }
  ): Promise<ResultadoValidacion> {
    const inicio = Date.now();
    const alertas: Alerta[] = [];
    const sugerencias: string[] = [];

    // 1. Validar competencia
    if (config.validarCompetencia) {
      const alertasCompetencia = this.validarCompetencia(texto, anunciante, config.competidoresExcluidos);
      alertas.push(...alertasCompetencia);
    }

    // 2. Validar legal
    if (config.validarLegal) {
      const alertasLegal = this.validarLegal(texto, config.palabrasProhibidas);
      alertas.push(...alertasLegal);
    }

    // 3. Validar duración
    if (config.validarDuracion && duracionSegundos !== undefined) {
      const alertasDuracion = this.validarDuracion(
        duracionSegundos, 
        config.duracionMaxima, 
        config.duracionMinima
      );
      alertas.push(...alertasDuracion);
    }

    // 4. Validar audio
    if (config.validarAudio && audioMetadata) {
      const alertasAudio = this.validarAudio(audioMetadata);
      alertas.push(...alertasAudio);
    }

    // Calcular score
    const errores = alertas.filter(a => a.tipo === 'error').length;
    const warnings = alertas.filter(a => a.tipo === 'warning').length;
    const score = Math.max(0, 100 - (errores * 25) - (warnings * 10));

    // Generar sugerencias
    if (errores > 0) {
      sugerencias.push('Corregir los errores críticos antes de aprobar');
    }
    if (warnings > 0) {
      sugerencias.push('Revisar las advertencias con el equipo legal o comercial');
    }
    if (alertas.length === 0) {
      sugerencias.push('El contenido cumple con todas las validaciones');
    }

    return {
      esValido: errores === 0,
      score,
      alertas,
      sugerencias,
      tiempoAnalisis: Date.now() - inicio
    };
  }

  // ─────────────────────────────────────────────────────────────
  // VALIDAR COMPETENCIA
  // ─────────────────────────────────────────────────────────────

  validarCompetencia(
    texto: string, 
    anunciante: string,
    competidoresExcluidos?: string[]
  ): Alerta[] {
    const alertas: Alerta[] = [];
    const textoLower = texto.toLowerCase();
    
    // Obtener competidores del anunciante
    const competidores = COMPETIDORES_DEFAULT[anunciante] || [];
    const todos = competidoresExcluidos 
      ? competidores.filter(c => !competidoresExcluidos.includes(c))
      : competidores;

    // También buscar en todas las marcas conocidas
    const todasLasMarcas = Object.keys(COMPETIDORES_DEFAULT)
      .filter(m => m !== anunciante);

    const marcasABuscar = [...new Set([...todos, ...todasLasMarcas])];

    for (const competidor of marcasABuscar) {
      if (textoLower.includes(competidor.toLowerCase())) {
        const esDirecto = competidores.includes(competidor);
        alertas.push({
          id: `comp_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          tipo: esDirecto ? 'error' : 'warning',
          categoria: 'competencia',
          titulo: esDirecto ? 'Mención de competidor directo' : 'Mención de otra marca',
          mensaje: `Se detectó la marca "${competidor}" en el texto`,
          detalle: esDirecto 
            ? `${competidor} es competidor directo de ${anunciante}` 
            : 'Verificar si la mención es intencional',
          accionRequerida: esDirecto,
          resolucion: 'Eliminar la mención o confirmar que es intencional con el cliente'
        });
      }
    }

    return alertas;
  }

  // ─────────────────────────────────────────────────────────────
  // VALIDAR LEGAL
  // ─────────────────────────────────────────────────────────────

  validarLegal(texto: string, palabrasAdicionales?: string[]): Alerta[] {
    const alertas: Alerta[] = [];
    const textoLower = texto.toLowerCase();

    // Validar palabras legales predefinidas
    for (const { palabra, advertencia } of PALABRAS_LEGALES) {
      if (textoLower.includes(palabra.toLowerCase())) {
        alertas.push({
          id: `legal_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          tipo: 'warning',
          categoria: 'legal',
          titulo: 'Término que requiere revisión legal',
          mensaje: `El término "${palabra}" requiere atención`,
          detalle: advertencia,
          accionRequerida: false,
          resolucion: 'Consultar con el departamento legal o agregar asterisco con condiciones'
        });
      }
    }

    // Validar palabras adicionales personalizadas
    if (palabrasAdicionales) {
      for (const palabra of palabrasAdicionales) {
        if (textoLower.includes(palabra.toLowerCase())) {
          alertas.push({
            id: `legal_custom_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            tipo: 'error',
            categoria: 'legal',
            titulo: 'Palabra prohibida detectada',
            mensaje: `La palabra "${palabra}" está en la lista de prohibidas`,
            accionRequerida: true,
            resolucion: 'Eliminar la palabra o solicitar excepción'
          });
        }
      }
    }

    // Verificar si hay fechas mencionadas sin formato completo
    const regexFecha = /\d{1,2}\s+de\s+\w+/gi;
    const fechasMencionadas = texto.match(regexFecha);
    if (fechasMencionadas) {
      // Verificar si hay año
      const tieneAno = /\d{4}/.test(texto);
      if (!tieneAno) {
        alertas.push({
          id: `legal_fecha_${Date.now()}`,
          tipo: 'info',
          categoria: 'legal',
          titulo: 'Fecha sin año especificado',
          mensaje: 'Se detectó una fecha sin año explícito',
          detalle: `Fechas encontradas: ${fechasMencionadas.join(', ')}`,
          accionRequerida: false,
          resolucion: 'Considerar agregar el año para evitar confusiones'
        });
      }
    }

    return alertas;
  }

  // ─────────────────────────────────────────────────────────────
  // VALIDAR DURACIÓN
  // ─────────────────────────────────────────────────────────────

  validarDuracion(
    duracion: number, 
    maxima?: number, 
    minima?: number
  ): Alerta[] {
    const alertas: Alerta[] = [];

    if (maxima && duracion > maxima) {
      alertas.push({
        id: `dur_max_${Date.now()}`,
        tipo: 'error',
        categoria: 'duracion',
        titulo: 'Duración excede el máximo',
        mensaje: `El audio dura ${duracion}s pero el máximo es ${maxima}s`,
        detalle: `Excedente: ${duracion - maxima} segundos`,
        accionRequerida: true,
        resolucion: 'Editar el audio para reducir la duración'
      });
    }

    if (minima && duracion < minima) {
      alertas.push({
        id: `dur_min_${Date.now()}`,
        tipo: 'warning',
        categoria: 'duracion',
        titulo: 'Duración por debajo del mínimo',
        mensaje: `El audio dura ${duracion}s pero el mínimo recomendado es ${minima}s`,
        accionRequerida: false,
        resolucion: 'Verificar si el contenido es suficiente'
      });
    }

    return alertas;
  }

  // ─────────────────────────────────────────────────────────────
  // VALIDAR AUDIO
  // ─────────────────────────────────────────────────────────────

  validarAudio(metadata: { lufs?: number; silencioMaximo?: number }): Alerta[] {
    const alertas: Alerta[] = [];

    // Validar nivel de volumen (LUFS)
    if (metadata.lufs !== undefined) {
      if (metadata.lufs < VOLUMEN_MINIMO_LUFS - 1) {
        alertas.push({
          id: `audio_lufs_${Date.now()}`,
          tipo: 'warning',
          categoria: 'audio',
          titulo: 'Volumen bajo',
          mensaje: `El nivel de audio es ${metadata.lufs} LUFS (recomendado: ${VOLUMEN_MINIMO_LUFS} LUFS)`,
          detalle: 'El audio podría sonar bajo en comparación con otros spots',
          accionRequerida: false,
          resolucion: 'Normalizar el audio a -23 LUFS según estándar EBU R128'
        });
      } else if (metadata.lufs > -14) {
        alertas.push({
          id: `audio_lufs_alto_${Date.now()}`,
          tipo: 'warning',
          categoria: 'audio',
          titulo: 'Volumen alto',
          mensaje: `El nivel de audio es ${metadata.lufs} LUFS (muy alto)`,
          detalle: 'El audio podría sonar distorsionado o molesto',
          accionRequerida: false,
          resolucion: 'Reducir el nivel de ganancia'
        });
      }
    }

    // Validar silencios
    if (metadata.silencioMaximo !== undefined && metadata.silencioMaximo > SILENCIOS_MAXIMOS) {
      alertas.push({
        id: `audio_silencio_${Date.now()}`,
        tipo: 'warning',
        categoria: 'audio',
        titulo: 'Silencio prolongado detectado',
        mensaje: `Se detectó un silencio de ${metadata.silencioMaximo} segundos`,
        detalle: `El máximo recomendado es ${SILENCIOS_MAXIMOS} segundos`,
        accionRequerida: false,
        resolucion: 'Revisar si el silencio es intencional o es un error de grabación'
      });
    }

    return alertas;
  }

  // ─────────────────────────────────────────────────────────────
  // VALIDAR VENCIMIENTOS
  // ─────────────────────────────────────────────────────────────

  validarVencimientos(
    texto: string,
    fechaFinVigencia: Date
  ): Alerta[] {
    const alertas: Alerta[] = [];
    const hoy = new Date();
    const diasRestantes = Math.ceil((fechaFinVigencia.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const textoLower = texto.toLowerCase();

    // Detectar fechas en el texto
    const mesesEspanol = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 
                          'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    
    for (const mes of mesesEspanol) {
      const regex = new RegExp(`\\d{1,2}\\s+de\\s+${mes}`, 'gi');
      const match = texto.match(regex);
      if (match) {
        const mesIndex = mesesEspanol.indexOf(mes);
        const diaMatch = match[0].match(/\d+/);
        if (diaMatch) {
          const dia = parseInt(diaMatch[0]);
          const añoActual = hoy.getFullYear();
          const fechaMencionada = new Date(añoActual, mesIndex, dia);
          
          // Si la fecha ya pasó
          if (fechaMencionada < hoy) {
            alertas.push({
              id: `venc_fecha_${Date.now()}`,
              tipo: 'error',
              categoria: 'vencimientos',
              titulo: 'Fecha vencida en el texto',
              mensaje: `El texto menciona "${match[0]}" que ya pasó`,
              accionRequerida: true,
              resolucion: 'Actualizar la fecha en el contenido'
            });
          }
        }
      }
    }

    // Alertar si la cuña está por vencer
    if (diasRestantes <= 0) {
      alertas.push({
        id: `venc_cuña_${Date.now()}`,
        tipo: 'error',
        categoria: 'vencimientos',
        titulo: 'Cuña vencida',
        mensaje: 'La vigencia de esta cuña ya expiró',
        accionRequerida: true,
        resolucion: 'Actualizar fechas de vigencia o crear nueva versión'
      });
    } else if (diasRestantes <= 3) {
      alertas.push({
        id: `venc_pronto_${Date.now()}`,
        tipo: 'warning',
        categoria: 'vencimientos',
        titulo: 'Cuña por vencer',
        mensaje: `La cuña vence en ${diasRestantes} día${diasRestantes === 1 ? '' : 's'}`,
        accionRequerida: false,
        resolucion: 'Coordinar renovación con el cliente'
      });
    } else if (diasRestantes <= 7) {
      alertas.push({
        id: `venc_semana_${Date.now()}`,
        tipo: 'info',
        categoria: 'vencimientos',
        titulo: 'Vencimiento próximo',
        mensaje: `La cuña vence en ${diasRestantes} días`,
        accionRequerida: false
      });
    }

    return alertas;
  }
}

export const validationService = new ValidationService();
export default validationService;
