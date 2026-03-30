/**
 * 🛡️ Sistema Anti-Competencia TIER0++
 * 
 * Motor inteligente para evitar que competidores directos
 * queden juntos en la misma tanda publicitaria.
 * 
 * Categorías: Telefonía, Banca, Retail, Automotriz, etc.
 * Reglas: WOM ≠ Claro, Banco Chile ≠ Santander
 * 
 * @enterprise TIER0 Fortune 10 Enterprise 2050
 */

// ==================== CATEGORÍAS DE RUBROS ====================

export const CATEGORIAS_RUBROS = {
  TELEFONIA: {
    id: 'telefonia',
    nombre: 'Telefonía Móvil',
    color: '#3B82F6',
    icon: '📱',
    competidores: ['WOM', 'CLARO', 'MOVISTAR', 'ENTEL', 'VTR', 'SIMPLE'],
  },
  BANCA: {
    id: 'banca',
    nombre: 'Banca y Finanzas',
    color: '#10B981',
    icon: '🏦',
    competidores: ['BANCO CHILE', 'SANTANDER', 'BCI', 'BANCO ESTADO', 'ITAU', 'SCOTIABANK', 'SECURITY'],
  },
  RETAIL: {
    id: 'retail',
    nombre: 'Retail y Tiendas',
    color: '#F59E0B',
    icon: '🛒',
    competidores: ['FALABELLA', 'RIPLEY', 'PARIS', 'WALMART', 'JUMBO', 'LIDER', 'SODIMAC', 'EASY', 'HITES', 'ABCDIN'],
  },
  AUTOMOTRIZ: {
    id: 'automotriz',
    nombre: 'Automotriz',
    color: '#EF4444',
    icon: '🚗',
    competidores: ['TOYOTA', 'HYUNDAI', 'KIA', 'NISSAN', 'CHEVROLET', 'FORD', 'MAZDA', 'SUZUKI', 'MITSUBISHI'],
  },
  SUPERMERCADOS: {
    id: 'supermercados',
    nombre: 'Supermercados',
    color: '#8B5CF6',
    icon: '🏪',
    competidores: ['JUMBO', 'LIDER', 'SANTA ISABEL', 'UNIMARC', 'ACUENTA', 'TOTTUS'],
  },
  FARMACIAS: {
    id: 'farmacias',
    nombre: 'Farmacias',
    color: '#EC4899',
    icon: '💊',
    competidores: ['CRUZ VERDE', 'SALCOBRAND', 'AHUMADA', 'DR SIMI'],
  },
  SEGUROS: {
    id: 'seguros',
    nombre: 'Seguros',
    color: '#6366F1',
    icon: '🛡️',
    competidores: ['SURA', 'MAPFRE', 'HDI', 'BCI SEGUROS', 'CHILENA CONSOLIDADA', 'LIBERTY'],
  },
  BEBIDAS: {
    id: 'bebidas',
    nombre: 'Bebidas',
    color: '#14B8A6',
    icon: '🥤',
    competidores: ['COCA COLA', 'PEPSI', 'CCU', 'ANDINA', 'RED BULL', 'MONSTER'],
  },
  AFP: {
    id: 'afp',
    nombre: 'AFP y Previsión',
    color: '#A855F7',
    icon: '📈',
    competidores: ['AFP HABITAT', 'AFP PROVIDA', 'AFP CAPITAL', 'AFP CUPRUM', 'AFP MODELO', 'AFP PLANVITAL', 'AFP UNO'],
  },
  ISAPRES: {
    id: 'isapres',
    nombre: 'Isapres y Salud',
    color: '#22C55E',
    icon: '🏥',
    competidores: ['COLMENA', 'CRUZ BLANCA', 'BANMEDICA', 'CONSALUD', 'VIDA TRES', 'MASVIDA'],
  },
  COMIDA_RAPIDA: {
    id: 'comida_rapida',
    nombre: 'Comida Rápida',
    color: '#F97316',
    icon: '🍔',
    competidores: ['MCDONALDS', 'BURGER KING', 'KFC', 'PIZZA HUT', 'DOMINOS', 'PAPA JOHNS', 'SUBWAY'],
  },
  TECNOLOGIA: {
    id: 'tecnologia',
    nombre: 'Tecnología',
    color: '#0EA5E9',
    icon: '💻',
    competidores: ['APPLE', 'SAMSUNG', 'HUAWEI', 'XIAOMI', 'LG', 'LENOVO', 'HP', 'DELL'],
  },
} as const;

export type CategoriaRubro = keyof typeof CATEGORIAS_RUBROS;

// ==================== INTERFACES ====================

export interface AnuncianteConCategoria {
  id: string;
  nombre: string;
  nombreNormalizado: string;
  categoria: CategoriaRubro | null;
  competidoresDirectos: string[];
}

export interface ResultadoAntiCompetencia {
  esCompatible: boolean;
  conflictos: ConflictoCompetencia[];
  recomendacion: string;
  scoreCompatibilidad: number; // 0-100
}

export interface ConflictoCompetencia {
  anunciante1: string;
  anunciante2: string;
  categoria: string;
  severidad: 'critica' | 'alta' | 'media';
  mensaje: string;
}

export interface PosicionRecomendada {
  posicion: number;
  distanciaCompetidor: number;
  score: number;
  razon: string;
}

// ==================== FUNCIONES PRINCIPALES ====================

/**
 * Detecta la categoría de un anunciante por su nombre
 */
export function detectarCategoria(nombreAnunciante: string): CategoriaRubro | null {
  const nombreNormalizado = nombreAnunciante.toUpperCase().trim();
  
  for (const [categoria, datos] of Object.entries(CATEGORIAS_RUBROS)) {
    for (const competidor of datos.competidores) {
      if (nombreNormalizado.includes(competidor) || competidor.includes(nombreNormalizado)) {
        return categoria as CategoriaRubro;
      }
    }
  }
  
  return null;
}

/**
 * Obtiene los competidores directos de un anunciante
 */
export function obtenerCompetidoresDirectos(nombreAnunciante: string): string[] {
  const categoria = detectarCategoria(nombreAnunciante);
  if (!categoria) return [];
  
  const datosCategoria = CATEGORIAS_RUBROS[categoria];
  const nombreNormalizado = nombreAnunciante.toUpperCase().trim();
  
  // Retornar todos los competidores excepto el propio anunciante
  return datosCategoria.competidores.filter(c => 
    !nombreNormalizado.includes(c) && !c.includes(nombreNormalizado)
  );
}

/**
 * Verifica si dos anunciantes son competidores directos
 */
export function sonCompetidoresDirectos(anunciante1: string, anunciante2: string): boolean {
  const cat1 = detectarCategoria(anunciante1);
  const cat2 = detectarCategoria(anunciante2);
  
  // Si ambos tienen la misma categoría, son competidores
  if (cat1 && cat2 && cat1 === cat2) {
    // Evitar que sea el mismo anunciante
    const norm1 = anunciante1.toUpperCase().trim();
    const norm2 = anunciante2.toUpperCase().trim();
    if (norm1 !== norm2) {
      return true;
    }
  }
  
  return false;
}

/**
 * Analiza una tanda y detecta conflictos de competencia
 */
export function analizarTandaConflictos(
  anunciantesEnTanda: string[]
): ResultadoAntiCompetencia {
  const conflictos: ConflictoCompetencia[] = [];
  
  // Comparar cada par de anunciantes
  for (let i = 0; i < anunciantesEnTanda.length; i++) {
    for (let j = i + 1; j < anunciantesEnTanda.length; j++) {
      const a1 = anunciantesEnTanda[i];
      const a2 = anunciantesEnTanda[j];
      
      if (sonCompetidoresDirectos(a1, a2)) {
        const categoria = detectarCategoria(a1);
        const catInfo = categoria ? CATEGORIAS_RUBROS[categoria] : null;
        
        conflictos.push({
          anunciante1: a1,
          anunciante2: a2,
          categoria: catInfo?.nombre || 'Desconocida',
          severidad: 'critica',
          mensaje: `⚠️ CONFLICTO: ${a1} y ${a2} son competidores directos en ${catInfo?.nombre || 'el mismo rubro'}`,
        });
      }
    }
  }
  
  const scoreCompatibilidad = conflictos.length === 0 ? 100 : Math.max(0, 100 - (conflictos.length * 25));
  
  return {
    esCompatible: conflictos.length === 0,
    conflictos,
    recomendacion: conflictos.length === 0 
      ? '✅ Tanda sin conflictos de competencia'
      : `🚨 Se detectaron ${conflictos.length} conflicto(s). Separar anunciantes.`,
    scoreCompatibilidad,
  };
}

/**
 * Encuentra la mejor posición para insertar una cuña evitando competidores
 */
export function encontrarMejorPosicion(
  nuevaCuna: string,
  tandaActual: { posicion: number; anunciante: string }[]
): PosicionRecomendada[] {
  const competidoresNuevaCuna = obtenerCompetidoresDirectos(nuevaCuna);
  const recomendaciones: PosicionRecomendada[] = [];
  
  // Si no tiene competidores conocidos, cualquier posición es buena
  if (competidoresNuevaCuna.length === 0) {
    return [{ posicion: 0, distanciaCompetidor: Infinity, score: 100, razon: '✅ Sin competidores en categoría' }];
  }
  
  // Analizar cada posición posible
  for (let pos = 0; pos <= tandaActual.length; pos++) {
    let distanciaMinima = Infinity;
    
    for (const item of tandaActual) {
      const esCompetidor = competidoresNuevaCuna.some(c => 
        item.anunciante.toUpperCase().includes(c) || c.includes(item.anunciante.toUpperCase())
      );
      
      if (esCompetidor) {
        const distancia = Math.abs(pos - item.posicion);
        distanciaMinima = Math.min(distanciaMinima, distancia);
      }
    }
    
    // Score basado en la distancia (mayor distancia = mejor)
    const score = distanciaMinima === Infinity ? 100 : Math.min(100, distanciaMinima * 20);
    
    recomendaciones.push({
      posicion: pos,
      distanciaCompetidor: distanciaMinima,
      score,
      razon: distanciaMinima === Infinity 
        ? '✅ Sin competidores cerca'
        : distanciaMinima >= 3 
          ? '🟢 Buena separación del competidor'
          : distanciaMinima >= 2
            ? '🟡 Separación aceptable'
            : '🔴 Muy cerca del competidor',
    });
  }
  
  // Ordenar por score descendente
  return recomendaciones.sort((a, b) => b.score - a.score);
}

/**
 * Genera un ID único para una cuña planificada
 */
export function generarIdCunaPlanificada(
  campanaId: string,
  lineaId: string,
  bloqueId: string,
  posicion: number
): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 6);
  return `CUN-${timestamp}-${random}-P${posicion.toString().padStart(2, '0')}`;
}

/**
 * Obtiene información visual de una categoría
 */
export function obtenerInfoCategoria(nombreAnunciante: string): {
  categoria: string;
  color: string;
  icon: string;
} | null {
  const cat = detectarCategoria(nombreAnunciante);
  if (!cat) return null;
  
  const datos = CATEGORIAS_RUBROS[cat];
  return {
    categoria: datos.nombre,
    color: datos.color,
    icon: datos.icon,
  };
}

// ==================== EXPORT DEFAULT ====================

export default {
  CATEGORIAS_RUBROS,
  detectarCategoria,
  obtenerCompetidoresDirectos,
  sonCompetidoresDirectos,
  analizarTandaConflictos,
  encontrarMejorPosicion,
  generarIdCunaPlanificada,
  obtenerInfoCategoria,
};
