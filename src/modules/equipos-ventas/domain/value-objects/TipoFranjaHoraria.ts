/**
 * VALUE OBJECT TIPO FRANJA HORARIA - TIER 0 ENTERPRISE
 * 
 * @description Clasificación de franjas horarias para estrategias de pricing
 * y gestión de inventario publicitario.
 * 
 * @version 2025.1.0
 * @tier TIER_0_FORTUNE_10
 */

export enum TipoFranjaHoraria {
  PRIME_TIME = 'PRIME_TIME', // Horario estelar (ej: 07:00-09:00, 18:00-20:00)
  DAY_TIME = 'DAY_TIME', // Horario diurno estándar
  OFF_PEAK = 'OFF_PEAK', // Horario valle / baja audiencia
  LATE_NIGHT = 'LATE_NIGHT', // Madrugada
  WEEKEND_SPECIAL = 'WEEKEND_SPECIAL', // Especiales fin de semana
  EVENTO_PREMIUM = 'EVENTO_PREMIUM' // Transmisiones especiales (partidos, etc)
}

export const TipoFranjaLabels: Record<TipoFranjaHoraria, string> = {
  [TipoFranjaHoraria.PRIME_TIME]: '✨ Prime Time',
  [TipoFranjaHoraria.DAY_TIME]: '☀️ Diurno Estándar',
  [TipoFranjaHoraria.OFF_PEAK]: '📉 Valle / Baja',
  [TipoFranjaHoraria.LATE_NIGHT]: '🌙 Madrugada',
  [TipoFranjaHoraria.WEEKEND_SPECIAL]: '🎉 Fin de Semana',
  [TipoFranjaHoraria.EVENTO_PREMIUM]: '🏆 Evento Premium'
};

export const FactorPrecioBase: Record<TipoFranjaHoraria, number> = {
  [TipoFranjaHoraria.PRIME_TIME]: 1.5, // 150% del precio base
  [TipoFranjaHoraria.DAY_TIME]: 1.0, // 100% del precio base
  [TipoFranjaHoraria.OFF_PEAK]: 0.7, // 70% del precio base
  [TipoFranjaHoraria.LATE_NIGHT]: 0.5, // 50% del precio base
  [TipoFranjaHoraria.WEEKEND_SPECIAL]: 1.2, // 120% del precio base
  [TipoFranjaHoraria.EVENTO_PREMIUM]: 2.5 // 250% del precio base
};
