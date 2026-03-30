/**
 * 🤖 SILEXAR PULSE - Cortex Content AI Service TIER 0
 * 
 * Servicio de IA para generación de contenido publicitario:
 * - Generación de guiones/textos
 * - Sugerencias de mejora
 * - Análisis de texto
 * - Variantes automáticas
 * 
 * @version 2050.1.0
 * @tier TIER_0_FORTUNE_10
 */

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

export interface BriefCreativo {
  anunciante: string;
  producto?: string;
  tipoContenido: 'spot' | 'mencion' | 'banner' | 'video' | 'social';
  objetivo: 'awareness' | 'consideracion' | 'conversion' | 'retencion';
  duracionSegundos?: number;
  tono: 'formal' | 'casual' | 'humoristico' | 'emotivo' | 'urgente';
  publicoObjetivo: string;
  mensajesClave: string[];
  callToAction?: string;
  restricciones?: string[];
  ejemplosPrevios?: string[];
}

export interface GuionGenerado {
  id: string;
  texto: string;
  duracionEstimada: number;
  palabras: number;
  wpm: number;
  score: number;
  sugerencias: string[];
  variantes: string[];
}

export interface AnalisisTexto {
  palabras: number;
  caracteres: number;
  oraciones: number;
  duracionEstimadaSegundos: number;
  wpm: number;
  legibilidad: 'facil' | 'media' | 'dificil';
  scoreEmocional: number;
  sentimiento: 'positivo' | 'neutral' | 'negativo';
  palabrasClave: string[];
  sugerenciasMejora: string[];
  alertas: { tipo: string; mensaje: string }[];
}

export interface VarianteContenido {
  id: string;
  tipo: 'corta' | 'larga' | 'formal' | 'casual' | 'urgente';
  texto: string;
  duracionEstimada: number;
}

// ═══════════════════════════════════════════════════════════════
// CONSTANTES
// ═══════════════════════════════════════════════════════════════

const WPM_LOCUCION_NORMAL = 150; // Palabras por minuto estándar
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const WPM_LOCUCION_RAPIDA = 180;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const WPM_LOCUCION_LENTA = 120;

const PALABRAS_PROHIBIDAS = [
  'gratis', 'garantizado', 'sin costo', 'el mejor', 'único', 'número uno',
  'milagro', 'cura', 'solución definitiva'
];

const FRASES_ENGAGEMENT = [
  'Descubre', 'Conoce', 'Aprovecha', 'No te pierdas', 'Ahora',
  'Solo por tiempo limitado', 'Exclusivo para ti', 'Tu mejor opción'
];

// ═══════════════════════════════════════════════════════════════
// SERVICIO
// ═══════════════════════════════════════════════════════════════

export class CortexContentService {
  
  // ─────────────────────────────────────────────────────────────
  // GENERACIÓN DE GUIONES
  // ─────────────────────────────────────────────────────────────

  async generarGuion(brief: BriefCreativo): Promise<GuionGenerado> {
    // En producción, esto llamaría a OpenAI/Anthropic
    // Por ahora, generamos contenido basado en plantillas inteligentes
    
    const plantilla = this.seleccionarPlantilla(brief);
    const texto = this.completarPlantilla(plantilla, brief);
    const analisis = this.analizarTexto(texto);
    
    return {
      id: `guion_${Date.now()}`,
      texto,
      duracionEstimada: analisis.duracionEstimadaSegundos,
      palabras: analisis.palabras,
      wpm: analisis.wpm,
      score: this.calcularScore(texto, brief),
      sugerencias: analisis.sugerenciasMejora,
      variantes: await this.generarVariantes(texto, brief)
    };
  }

  private seleccionarPlantilla(brief: BriefCreativo): string {
    const plantillas: Record<string, Record<string, string[]>> = {
      spot: {
        awareness: [
          '{INTRO_HOOK} {ANUNCIANTE} te presenta {PRODUCTO}. {BENEFICIO_PRINCIPAL}. {CTA}.',
          '¿{PREGUNTA_PROBLEMA}? {ANUNCIANTE} tiene la solución. {PRODUCTO}: {BENEFICIO}. {CTA}.',
          '{ANUNCIANTE}, {SLOGAN}. Porque {RAZON}. {CTA}.'
        ],
        conversion: [
          'Últimos días para aprovechar la oferta de {ANUNCIANTE}. {PRODUCTO} con {DESCUENTO}. {CTA}.',
          'Solo por hoy, {ANUNCIANTE} te ofrece {OFERTA}. No lo dejes pasar. {CTA}.',
          '{URGENCIA}. {ANUNCIANTE} {OFERTA}. {CTA}.'
        ]
      },
      mencion: {
        awareness: [
          '{LOCUTOR}, y hablando de {CATEGORIA}, nuestros amigos de {ANUNCIANTE} nos cuentan sobre {PRODUCTO}. {BENEFICIO}.',
          'Una pausa para contarte que {ANUNCIANTE} está con todo. {MENSAJE}. Más info en {CONTACTO}.'
        ],
        conversion: [
          '{LOCUTOR}, atención que {ANUNCIANTE} tiene una oferta imperdible: {OFERTA}. {URGENCIA}.',
          'Momento de ofertas con {ANUNCIANTE}. {OFERTA}. {CTA}.'
        ]
      }
    };

    const tipo = brief.tipoContenido === 'mencion' ? 'mencion' : 'spot';
    const objetivo = brief.objetivo === 'conversion' ? 'conversion' : 'awareness';
    
    const opciones = plantillas[tipo]?.[objetivo] || plantillas.spot.awareness;
    return opciones[Math.floor(Math.random() * opciones.length)];
  }

  private completarPlantilla(plantilla: string, brief: BriefCreativo): string {
    let texto = plantilla;
    
    // Reemplazos básicos
    texto = texto.replace(/{ANUNCIANTE}/g, brief.anunciante);
    texto = texto.replace(/{PRODUCTO}/g, brief.producto || 'nuestros productos');
    
    // Generar hook según tono
    const hooks: Record<string, string[]> = {
      formal: ['Estimados oyentes,', 'Atención,', 'Importante:'],
      casual: ['Hey,', 'Oye,', 'Mira esto:'],
      humoristico: ['¿Sabías que...?', 'Prepárate porque...', 'Atención, notición:'],
      emotivo: ['Porque te importa,', 'Para los que quieren más,', 'Pensando en ti,'],
      urgente: ['¡Última hora!', '¡No esperes más!', '¡Ahora o nunca!']
    };
    
    const hookOptions = hooks[brief.tono] || hooks.casual;
    texto = texto.replace(/{INTRO_HOOK}/g, hookOptions[Math.floor(Math.random() * hookOptions.length)]);
    
    // Beneficio principal
    const beneficio = brief.mensajesClave[0] || 'la mejor opción del mercado';
    texto = texto.replace(/{BENEFICIO_PRINCIPAL}/g, beneficio);
    texto = texto.replace(/{BENEFICIO}/g, beneficio);
    texto = texto.replace(/{MENSAJE}/g, brief.mensajesClave.join('. ') || 'calidad garantizada');
    
    // CTA
    const cta = brief.callToAction || 'Visítanos hoy';
    texto = texto.replace(/{CTA}/g, cta);
    
    // Placeholders genéricos
    texto = texto.replace(/{PREGUNTA_PROBLEMA}/g, 'Buscas calidad y buen precio');
    texto = texto.replace(/{SLOGAN}/g, 'siempre contigo');
    texto = texto.replace(/{RAZON}/g, 'nos importas');
    texto = texto.replace(/{URGENCIA}/g, 'Solo por tiempo limitado');
    texto = texto.replace(/{OFERTA}/g, 'increíbles descuentos');
    texto = texto.replace(/{DESCUENTO}/g, 'hasta 50% de descuento');
    texto = texto.replace(/{LOCUTOR}/g, 'Amigos');
    texto = texto.replace(/{CATEGORIA}/g, 'ofertas');
    texto = texto.replace(/{CONTACTO}/g, 'su sitio web');
    
    return texto;
  }

  // ─────────────────────────────────────────────────────────────
  // ANÁLISIS DE TEXTO
  // ─────────────────────────────────────────────────────────────

  analizarTexto(texto: string): AnalisisTexto {
    const palabras = texto.split(/\s+/).filter(p => p.length > 0).length;
    const caracteres = texto.length;
    const oraciones = texto.split(/[.!?]+/).filter(o => o.trim().length > 0).length;
    const wpm = WPM_LOCUCION_NORMAL;
    const duracionEstimadaSegundos = Math.ceil((palabras / wpm) * 60);
    
    // Legibilidad (basado en longitud promedio de palabras y oraciones)
    const promedioCaracteresPorPalabra = caracteres / palabras;
    const promedioPalabrasPorOracion = palabras / oraciones;
    let legibilidad: 'facil' | 'media' | 'dificil' = 'media';
    if (promedioCaracteresPorPalabra < 5 && promedioPalabrasPorOracion < 15) {
      legibilidad = 'facil';
    } else if (promedioCaracteresPorPalabra > 7 || promedioPalabrasPorOracion > 25) {
      legibilidad = 'dificil';
    }
    
    // Sentimiento (básico)
    const palabrasPositivas = ['mejor', 'increíble', 'oferta', 'nuevo', 'exclusivo', 'gratis'];
    const palabrasNegativas = ['no', 'nunca', 'problema', 'difícil'];
    const textoLower = texto.toLowerCase();
    const countPositivas = palabrasPositivas.filter(p => textoLower.includes(p)).length;
    const countNegativas = palabrasNegativas.filter(p => textoLower.includes(p)).length;
    const sentimiento = countPositivas > countNegativas ? 'positivo' : countNegativas > countPositivas ? 'negativo' : 'neutral';
    
    // Palabras clave
    const palabrasClave = texto
      .split(/\s+/)
      .filter(p => p.length > 5)
      .slice(0, 5)
      .map(p => p.replace(/[.,!?]/g, ''));
    
    // Sugerencias
    const sugerencias: string[] = [];
    const alertas: { tipo: string; mensaje: string }[] = [];
    
    if (duracionEstimadaSegundos > 30) {
      sugerencias.push('Considera acortar el texto para un spot de 30 segundos');
    }
    if (legibilidad === 'dificil') {
      sugerencias.push('Usa oraciones más cortas para mejor comprensión');
    }
    if (promedioPalabrasPorOracion > 20) {
      sugerencias.push('Divide las oraciones largas en fragmentos más cortos');
    }
    
    // Alertas de palabras prohibidas
    PALABRAS_PROHIBIDAS.forEach(palabra => {
      if (textoLower.includes(palabra)) {
        alertas.push({
          tipo: 'legal',
          mensaje: `La palabra "${palabra}" puede requerir respaldo legal`
        });
      }
    });
    
    return {
      palabras,
      caracteres,
      oraciones,
      duracionEstimadaSegundos,
      wpm,
      legibilidad,
      scoreEmocional: countPositivas * 10,
      sentimiento,
      palabrasClave,
      sugerenciasMejora: sugerencias,
      alertas
    };
  }

  // ─────────────────────────────────────────────────────────────
  // VARIANTES
  // ─────────────────────────────────────────────────────────────

  async generarVariantes(texto: string, brief: BriefCreativo): Promise<string[]> {
    const variantes: string[] = [];
    
    // Versión corta (reducir 30%)
    const palabras = texto.split(/\s+/);
    if (palabras.length > 15) {
      const corta = palabras.slice(0, Math.floor(palabras.length * 0.7)).join(' ');
      variantes.push(corta + (corta.endsWith('.') ? '' : '.'));
    }
    
    // Versión urgente
    const urgente = `¡Atención! ${texto.replace(/\.$/, '')}. ¡No te lo pierdas!`;
    variantes.push(urgente);
    
    // Versión con pregunta
    const pregunta = `¿Quieres ${brief.mensajesClave[0] || 'lo mejor'}? ${texto}`;
    variantes.push(pregunta);
    
    return variantes;
  }

  // ─────────────────────────────────────────────────────────────
  // MEJORAS SUGERIDAS
  // ─────────────────────────────────────────────────────────────

  async sugerirMejoras(texto: string): Promise<{ tipo: string; original: string; sugerencia: string }[]> {
    const mejoras: { tipo: string; original: string; sugerencia: string }[] = [];
    
    // Detectar frases débiles y sugerir alternativas
    const frasesDebiles: Record<string, string> = {
      'muy bueno': 'excepcional',
      'bastante': 'realmente',
      'un poco': '',
      'quizás': 'definitivamente',
      'tal vez': 'ahora',
      'puede que': 'sin duda',
      'en algún momento': 'hoy mismo'
    };
    
    Object.entries(frasesDebiles).forEach(([original, sugerencia]) => {
      if (texto.toLowerCase().includes(original)) {
        mejoras.push({
          tipo: 'fortaleza',
          original,
          sugerencia: sugerencia || '(eliminar)'
        });
      }
    });
    
    // Sugerir hooks de engagement si no hay
    const tieneHook = FRASES_ENGAGEMENT.some(f => texto.toLowerCase().includes(f.toLowerCase()));
    if (!tieneHook) {
      mejoras.push({
        tipo: 'engagement',
        original: texto.split('.')[0],
        sugerencia: `${FRASES_ENGAGEMENT[Math.floor(Math.random() * FRASES_ENGAGEMENT.length)]} ${texto.split('.')[0]}`
      });
    }
    
    return mejoras;
  }

  // ─────────────────────────────────────────────────────────────
  // HELPERS
  // ─────────────────────────────────────────────────────────────

  private calcularScore(texto: string, brief: BriefCreativo): number {
    let score = 50; // Base
    
    const analisis = this.analizarTexto(texto);
    
    // Bonificaciones
    if (texto.includes(brief.anunciante)) score += 10;
    if (brief.callToAction && texto.includes(brief.callToAction)) score += 10;
    if (analisis.legibilidad === 'facil') score += 10;
    if (analisis.sentimiento === 'positivo') score += 10;
    if (brief.duracionSegundos && analisis.duracionEstimadaSegundos <= brief.duracionSegundos) score += 10;
    
    // Penalizaciones
    if (analisis.alertas.length > 0) score -= analisis.alertas.length * 5;
    
    return Math.min(100, Math.max(0, score));
  }

  // ─────────────────────────────────────────────────────────────
  // TRANSCRIPCIÓN (placeholder)
  // ─────────────────────────────────────────────────────────────

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async transcribirAudio(_audioUrl: string): Promise<string> {
    // En producción: Whisper API, Google Speech-to-Text, etc.
    return 'Transcripción automática pendiente de integración con servicio de speech-to-text.';
  }
}

export const cortexContentService = new CortexContentService();
export default cortexContentService;
