/**
 * 🤝 SILEXAR PULSE - CRM IA Avanzado
 * 
 * @description Sistema CRM enterprise con:
 * - Pipeline visual de oportunidades
 * - Lead scoring IA
 * - Predicción de cierre
 * - Automatización de seguimiento
 * 
 * @version 2025.1.0
 * @tier TIER_0_FORTUNE_10
 */

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

export interface Lead {
  id: string;
  nombre: string;
  empresa: string;
  cargo?: string;
  email: string;
  telefono?: string;
  origen: 'web' | 'referido' | 'evento' | 'llamada' | 'linkedin' | 'otro';
  interes: string;
  presupuestoEstimado: number;
  scoreIA: number;
  etapa: 'nuevo' | 'contactado' | 'calificado' | 'propuesta' | 'negociacion' | 'cerrado_ganado' | 'cerrado_perdido';
  vendedorAsignado?: string;
  proximaAccion?: string;
  fechaProximaAccion?: Date;
  notas: string[];
  fechaCreacion: Date;
  ultimaInteraccion?: Date;
}

export interface Oportunidad {
  id: string;
  leadId: string;
  nombre: string;
  cliente: string;
  valor: number;
  probabilidad: number;
  etapa: string;
  fechaCierreEstimada: Date;
  vendedorId: string;
  vendedorNombre: string;
  productos: { nombre: string; cantidad: number; valor: number }[];
  competidores?: string[];
  factoresCierre: string[];
  factoresRiesgo: string[];
  actividades: { fecha: Date; tipo: string; descripcion: string }[];
}

export interface Pipeline {
  etapas: {
    nombre: string;
    oportunidades: Oportunidad[];
    valorTotal: number;
    cantidad: number;
  }[];
  valorTotal: number;
  valorPonderado: number;
  tasaConversion: number;
}

export interface ScoreFactores {
  factor: string;
  peso: number;
  valor: number;
  contribucion: number;
}

export interface PrediccionCierreIA {
  oportunidadId: string;
  probabilidad: number;
  factoresPositivos: string[];
  factoresNegativos: string[];
  accionesRecomendadas: string[];
  tiempoEstimadoCierre: number; // días
  confianzaPrediccion: number;
}

// ═══════════════════════════════════════════════════════════════
// CRM IA SERVICE
// ═══════════════════════════════════════════════════════════════

export class CRMIAService {

  /**
   * Calcula score de un lead usando IA
   */
  static calcularLeadScore(lead: Lead): { score: number; factores: ScoreFactores[] } {
    const factores: ScoreFactores[] = [];
    let scoreTotal = 0;
    
    // Factor: Presupuesto
    const pesoPresupuesto = 30;
    let valorPresupuesto = 0;
    if (lead.presupuestoEstimado >= 50000000) valorPresupuesto = 100;
    else if (lead.presupuestoEstimado >= 20000000) valorPresupuesto = 75;
    else if (lead.presupuestoEstimado >= 10000000) valorPresupuesto = 50;
    else if (lead.presupuestoEstimado >= 5000000) valorPresupuesto = 25;
    else valorPresupuesto = 10;
    
    const contribucionPresupuesto = (valorPresupuesto * pesoPresupuesto) / 100;
    factores.push({ factor: 'Presupuesto', peso: pesoPresupuesto, valor: valorPresupuesto, contribucion: contribucionPresupuesto });
    scoreTotal += contribucionPresupuesto;
    
    // Factor: Origen
    const pesoOrigen = 20;
    const valoresOrigen: Record<string, number> = { referido: 100, evento: 80, linkedin: 60, web: 50, llamada: 40, otro: 20 };
    const valorOrigen = valoresOrigen[lead.origen] || 20;
    const contribucionOrigen = (valorOrigen * pesoOrigen) / 100;
    factores.push({ factor: 'Origen', peso: pesoOrigen, valor: valorOrigen, contribucion: contribucionOrigen });
    scoreTotal += contribucionOrigen;
    
    // Factor: Cargo
    const pesoCargo = 15;
    let valorCargo = 50;
    if (lead.cargo) {
      const cargoLower = lead.cargo.toLowerCase();
      if (cargoLower.includes('gerente') || cargoLower.includes('director')) valorCargo = 100;
      else if (cargoLower.includes('jefe') || cargoLower.includes('encargado')) valorCargo = 75;
      else if (cargoLower.includes('coordinador') || cargoLower.includes('ejecutivo')) valorCargo = 50;
    }
    const contribucionCargo = (valorCargo * pesoCargo) / 100;
    factores.push({ factor: 'Cargo', peso: pesoCargo, valor: valorCargo, contribucion: contribucionCargo });
    scoreTotal += contribucionCargo;
    
    // Factor: Engagement (notas/interacciones)
    const pesoEngagement = 20;
    const valorEngagement = Math.min(100, lead.notas.length * 20);
    const contribucionEngagement = (valorEngagement * pesoEngagement) / 100;
    factores.push({ factor: 'Engagement', peso: pesoEngagement, valor: valorEngagement, contribucion: contribucionEngagement });
    scoreTotal += contribucionEngagement;
    
    // Factor: Recencia
    const pesoRecencia = 15;
    let valorRecencia = 50;
    if (lead.ultimaInteraccion) {
      const diasDesdeUltima = Math.floor((Date.now() - lead.ultimaInteraccion.getTime()) / (1000 * 60 * 60 * 24));
      if (diasDesdeUltima <= 7) valorRecencia = 100;
      else if (diasDesdeUltima <= 14) valorRecencia = 75;
      else if (diasDesdeUltima <= 30) valorRecencia = 50;
      else valorRecencia = 25;
    }
    const contribucionRecencia = (valorRecencia * pesoRecencia) / 100;
    factores.push({ factor: 'Recencia', peso: pesoRecencia, valor: valorRecencia, contribucion: contribucionRecencia });
    scoreTotal += contribucionRecencia;
    
    return { score: Math.round(scoreTotal), factores };
  }

  /**
   * Predice probabilidad de cierre de una oportunidad
   */
  static predecirCierre(oportunidad: Oportunidad): PrediccionCierreIA {
    let probabilidad = 30; // Base
    const factoresPositivos: string[] = [];
    const factoresNegativos: string[] = [];
    const acciones: string[] = [];
    
    // Análisis de etapa
    const etapaPesos: Record<string, number> = {
      'nuevo': 10, 'contactado': 20, 'calificado': 35, 
      'propuesta': 50, 'negociacion': 70
    };
    probabilidad = etapaPesos[oportunidad.etapa] || 30;
    
    // Análisis de actividades recientes
    const actividadesRecientes = oportunidad.actividades.filter(a => {
      const diasAtras = (Date.now() - a.fecha.getTime()) / (1000 * 60 * 60 * 24);
      return diasAtras <= 14;
    });
    
    if (actividadesRecientes.length >= 3) {
      probabilidad += 15;
      factoresPositivos.push('Alta actividad reciente');
    } else if (actividadesRecientes.length === 0) {
      probabilidad -= 15;
      factoresNegativos.push('Sin actividad en 2 semanas');
      acciones.push('Retomar contacto urgente');
    }
    
    // Análisis de competencia
    if (oportunidad.competidores && oportunidad.competidores.length > 0) {
      probabilidad -= 10;
      factoresNegativos.push(`Competencia activa (${oportunidad.competidores.length})`);
      acciones.push('Acelerar proceso de cierre');
    }
    
    // Análisis de valor
    if (oportunidad.valor > 50000000) {
      probabilidad -= 5;
      factoresNegativos.push('Monto alto requiere más aprobaciones');
      acciones.push('Identificar todos los decisores');
    }
    
    // Análisis de fecha cierre
    const diasParaCierre = Math.floor((oportunidad.fechaCierreEstimada.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (diasParaCierre < 0) {
      probabilidad -= 20;
      factoresNegativos.push('Fecha de cierre vencida');
      acciones.push('Reprogramar fecha de cierre');
    } else if (diasParaCierre <= 7) {
      factoresPositivos.push('Cierre inminente');
    }
    
    // Ajustar a rango válido
    probabilidad = Math.max(5, Math.min(95, probabilidad));
    
    return {
      oportunidadId: oportunidad.id,
      probabilidad,
      factoresPositivos,
      factoresNegativos,
      accionesRecomendadas: acciones.length > 0 ? acciones : ['Mantener seguimiento regular'],
      tiempoEstimadoCierre: diasParaCierre > 0 ? diasParaCierre : 14,
      confianzaPrediccion: actividadesRecientes.length >= 2 ? 85 : 60
    };
  }

  /**
   * Genera pipeline visual con métricas
   */
  static generarPipeline(oportunidades: Oportunidad[]): Pipeline {
    const etapasNombres = ['nuevo', 'contactado', 'calificado', 'propuesta', 'negociacion'];
    const etapas = etapasNombres.map(nombre => {
      const ops = oportunidades.filter(o => o.etapa === nombre);
      return {
        nombre,
        oportunidades: ops,
        valorTotal: ops.reduce((sum, o) => sum + o.valor, 0),
        cantidad: ops.length
      };
    });
    
    const valorTotal = oportunidades.reduce((sum, o) => sum + o.valor, 0);
    const valorPonderado = oportunidades.reduce((sum, o) => sum + (o.valor * o.probabilidad / 100), 0);
    
    // Tasa de conversión (mock)
    const cerradosGanados = 12;
    const totalOportunidades = 50;
    const tasaConversion = Math.round((cerradosGanados / totalOportunidades) * 100);
    
    return { etapas, valorTotal, valorPonderado, tasaConversion };
  }

  /**
   * Sugiere siguiente acción para un lead
   */
  static sugerirSiguienteAccion(lead: Lead): { accion: string; urgencia: 'baja' | 'media' | 'alta'; razon: string } {
    // Sin interacción reciente
    if (!lead.ultimaInteraccion) {
      return { accion: 'Primer contacto telefónico', urgencia: 'alta', razon: 'Lead sin contactar' };
    }
    
    const diasSinContacto = Math.floor((Date.now() - lead.ultimaInteraccion.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diasSinContacto > 14) {
      return { accion: 'Reactivar contacto', urgencia: 'alta', razon: `${diasSinContacto} días sin interacción` };
    }
    
    // Por etapa
    switch (lead.etapa) {
      case 'nuevo':
        return { accion: 'Llamar para calificar', urgencia: 'alta', razon: 'Lead nuevo sin calificar' };
      case 'contactado':
        return { accion: 'Enviar información de productos', urgencia: 'media', razon: 'Avanzar a calificación' };
      case 'calificado':
        return { accion: 'Agendar reunión de presentación', urgencia: 'media', razon: 'Lead calificado, momento de propuesta' };
      case 'propuesta':
        return { accion: 'Seguimiento de propuesta', urgencia: 'alta', razon: 'Propuesta enviada, cerrar venta' };
      case 'negociacion':
        return { accion: 'Negociar y cerrar', urgencia: 'alta', razon: 'Oportunidad caliente' };
      default:
        return { accion: 'Revisar estado', urgencia: 'baja', razon: 'Estado indefinido' };
    }
  }

  /**
   * Identifica leads en riesgo de perderse
   */
  static identificarLeadsEnRiesgo(leads: Lead[]): Lead[] {
    return leads.filter(lead => {
      // Sin interacción en más de 30 días
      if (lead.ultimaInteraccion) {
        const dias = (Date.now() - lead.ultimaInteraccion.getTime()) / (1000 * 60 * 60 * 24);
        if (dias > 30) return true;
      }
      
      // Score bajo
      if (lead.scoreIA < 30) return true;
      
      // Acción próxima vencida
      if (lead.fechaProximaAccion && lead.fechaProximaAccion < new Date()) return true;
      
      return false;
    });
  }

  /**
   * Genera recomendaciones de upsell/cross-sell
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static generarRecomendacionesVenta(_clienteId: string): {
    tipo: 'upsell' | 'cross_sell' | 'renovacion';
    producto: string;
    valor: number;
    probabilidad: number;
    razon: string;
  }[] {
    // Mock - en producción analizaría historial del cliente
    return [
      { tipo: 'upsell', producto: 'Patrocinio programa', valor: 500000, probabilidad: 65, razon: 'Cliente con campañas exitosas en horario matinal' },
      { tipo: 'cross_sell', producto: 'Digital Audio', valor: 250000, probabilidad: 45, razon: 'Perfil de cliente digital-first' },
      { tipo: 'renovacion', producto: 'Contrato anual', valor: 15000000, probabilidad: 80, razon: 'Contrato actual vence en 30 días' }
    ];
  }
}

export default CRMIAService;
