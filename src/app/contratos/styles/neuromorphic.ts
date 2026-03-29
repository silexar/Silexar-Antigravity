/**
 * 🎨 SILEXAR PULSE - Neuromorphic Design System TIER 0
 * 
 * @description Sistema de diseño neuromorphic reutilizable
 * con estilos consistentes para todo el módulo de contratos.
 * 
 * @version 2025.4.0
 * @tier TIER_0_FORTUNE_10
 */

// ═══════════════════════════════════════════════════════════════
// COLORES BASE
// ═══════════════════════════════════════════════════════════════

export const neuroColors = {
  // Fondos principales
  bgLight: 'from-slate-100 via-slate-50 to-slate-100',
  bgCard: 'from-slate-50 to-slate-100',
  bgInset: 'from-slate-100 to-slate-50',
  
  // Sombras
  shadowLight: '#ffffff',
  shadowDark: '#d1d5db',
  shadowDarker: '#c9cbd0',
  
  // Acentos
  accentPrimary: 'from-indigo-500 to-purple-600',
  accentSuccess: 'from-emerald-400 to-teal-500',
  accentWarning: 'from-amber-400 to-orange-500',
  accentDanger: 'from-red-400 to-rose-500',
  
  // Texto
  textPrimary: 'text-slate-800',
  textSecondary: 'text-slate-500',
  textMuted: 'text-slate-400'
};

// ═══════════════════════════════════════════════════════════════
// CLASES NEUROMORPHIC
// ═══════════════════════════════════════════════════════════════

export const neuro = {
  // ═══════════════════════════════════════════════════════════════
  // CONTENEDORES
  // ═══════════════════════════════════════════════════════════════
  
  /** Página completa con gradiente neuromorphic */
  page: `
    bg-gradient-to-br from-slate-100 via-slate-50 to-slate-100
    min-h-screen
  `,
  
  /** Card elevada con sombras suaves */
  card: `
    bg-gradient-to-br from-slate-50 to-slate-100
    rounded-3xl
    shadow-[8px_8px_16px_#d1d5db,-8px_-8px_16px_#ffffff]
    border border-slate-200/50
  `,
  
  /** Card más pequeña */
  cardSm: `
    bg-gradient-to-br from-slate-50 to-slate-100
    rounded-2xl
    shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff]
    border border-slate-200/50
  `,
  
  /** Card con efecto hundido/inset */
  cardInset: `
    bg-gradient-to-br from-slate-100 to-slate-50
    rounded-2xl
    shadow-[inset_4px_4px_8px_#d1d5db,inset_-4px_-4px_8px_#ffffff]
    border border-slate-200/30
  `,
  
  /** Card inset más pequeña */
  cardInsetSm: `
    bg-gradient-to-br from-slate-100 to-slate-50
    rounded-xl
    shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]
    border border-slate-200/30
  `,
  
  // ═══════════════════════════════════════════════════════════════
  // BOTONES
  // ═══════════════════════════════════════════════════════════════
  
  /** Botón primario con gradiente */
  btnPrimary: `
    bg-gradient-to-br from-indigo-500 to-purple-600
    text-white font-semibold
    rounded-xl
    shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]
    hover:shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]
    hover:from-indigo-600 hover:to-purple-700
    active:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.2)]
    transition-all duration-200
    px-6 py-3
  `,
  
  /** Botón secundario neutral */
  btnSecondary: `
    bg-gradient-to-br from-slate-50 to-slate-100
    text-slate-700 font-medium
    rounded-xl
    shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]
    hover:shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]
    active:shadow-[inset_2px_2px_4px_#d1d5db]
    transition-all duration-200
    px-4 py-2
  `,
  
  /** Botón success */
  btnSuccess: `
    bg-gradient-to-br from-emerald-400 to-teal-500
    text-white font-semibold
    rounded-xl
    shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]
    hover:shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]
    active:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.2)]
    transition-all duration-200
    px-6 py-3
  `,
  
  /** Botón danger */
  btnDanger: `
    bg-gradient-to-br from-red-400 to-rose-500
    text-white font-semibold
    rounded-xl
    shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]
    hover:shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]
    active:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.2)]
    transition-all duration-200
    px-6 py-3
  `,
  
  /** Botón icono circular */
  btnIcon: `
    bg-gradient-to-br from-slate-50 to-slate-100
    rounded-xl
    shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]
    hover:shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]
    active:shadow-[inset_2px_2px_4px_#d1d5db]
    transition-all duration-200
    p-3
  `,
  
  /** Botón flotante (FAB) */
  fab: `
    bg-gradient-to-br from-indigo-500 to-purple-600
    text-white
    rounded-2xl
    shadow-[8px_8px_16px_#d1d5db,-8px_-8px_16px_#ffffff,0_8px_32px_rgba(99,102,241,0.4)]
    hover:shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff,0_12px_40px_rgba(99,102,241,0.5)]
    active:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.2)]
    transition-all duration-200
    p-4
  `,
  
  // ═══════════════════════════════════════════════════════════════
  // INPUTS
  // ═══════════════════════════════════════════════════════════════
  
  /** Input de texto */
  input: `
    bg-gradient-to-br from-slate-100 to-slate-50
    rounded-xl
    shadow-[inset_3px_3px_6px_#d1d5db,inset_-3px_-3px_6px_#ffffff]
    border-none
    focus:ring-2 focus:ring-indigo-400/50 focus:outline-none
    transition-all duration-200
    px-4 py-3
    text-slate-700
    placeholder:text-slate-400
    w-full
  `,
  
  /** Select */
  select: `
    bg-gradient-to-br from-slate-100 to-slate-50
    rounded-xl
    shadow-[inset_3px_3px_6px_#d1d5db,inset_-3px_-3px_6px_#ffffff]
    border-none
    focus:ring-2 focus:ring-indigo-400/50 focus:outline-none
    transition-all duration-200
    px-4 py-3 pr-10
    text-slate-700
    cursor-pointer
    appearance-none
    w-full
  `,
  
  /** Textarea */
  textarea: `
    bg-gradient-to-br from-slate-100 to-slate-50
    rounded-xl
    shadow-[inset_3px_3px_6px_#d1d5db,inset_-3px_-3px_6px_#ffffff]
    border-none
    focus:ring-2 focus:ring-indigo-400/50 focus:outline-none
    transition-all duration-200
    px-4 py-3
    text-slate-700
    placeholder:text-slate-400
    resize-none
    w-full
  `,
  
  // ═══════════════════════════════════════════════════════════════
  // TOGGLE SWITCH
  // ═══════════════════════════════════════════════════════════════
  
  /** Toggle container (off state) */
  toggleOff: `
    relative w-14 h-7
    bg-gradient-to-br from-slate-200 to-slate-100
    rounded-full
    shadow-[inset_2px_2px_4px_#c9cbd0,inset_-2px_-2px_4px_#ffffff]
    cursor-pointer
    transition-all duration-300
  `,
  
  /** Toggle container (on state) */
  toggleOn: `
    relative w-14 h-7
    bg-gradient-to-br from-indigo-400 to-purple-500
    rounded-full
    shadow-[inset_2px_2px_4px_rgba(0,0,0,0.2)]
    cursor-pointer
    transition-all duration-300
  `,
  
  /** Toggle knob */
  toggleKnob: `
    absolute top-1 w-5 h-5
    bg-white
    rounded-full
    shadow-[2px_2px_4px_rgba(0,0,0,0.15)]
    transition-all duration-300
  `,
  
  // ═══════════════════════════════════════════════════════════════
  // BADGES Y CHIPS
  // ═══════════════════════════════════════════════════════════════
  
  /** Badge elevado */
  badge: `
    px-3 py-1
    bg-gradient-to-br from-slate-50 to-slate-100
    rounded-lg
    shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]
    text-sm font-medium
  `,
  
  /** Badge con color */
  badgePrimary: `
    px-3 py-1
    bg-gradient-to-br from-indigo-100 to-purple-100
    text-indigo-700
    rounded-lg
    shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]
    text-sm font-medium
  `,
  
  badgeSuccess: `
    px-3 py-1
    bg-gradient-to-br from-emerald-100 to-teal-100
    text-emerald-700
    rounded-lg
    shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]
    text-sm font-medium
  `,
  
  badgeWarning: `
    px-3 py-1
    bg-gradient-to-br from-amber-100 to-orange-100
    text-amber-700
    rounded-lg
    shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]
    text-sm font-medium
  `,
  
  badgeDanger: `
    px-3 py-1
    bg-gradient-to-br from-red-100 to-rose-100
    text-red-700
    rounded-lg
    shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]
    text-sm font-medium
  `,
  
  // ═══════════════════════════════════════════════════════════════
  // UTILIDADES
  // ═══════════════════════════════════════════════════════════════
  
  /** Avatar/Icon container */
  avatar: `
    bg-gradient-to-br from-slate-100 to-slate-50
    rounded-2xl
    shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]
    flex items-center justify-center
  `,
  
  /** Divider horizontal */
  divider: `
    h-px
    bg-gradient-to-r from-transparent via-slate-300 to-transparent
    shadow-[0_1px_0_#ffffff]
  `,
  
  /** Progress bar container */
  progressBg: `
    h-2
    bg-gradient-to-r from-slate-200 to-slate-100
    rounded-full
    shadow-[inset_1px_1px_2px_#c9cbd0,inset_-1px_-1px_2px_#ffffff]
    overflow-hidden
  `,
  
  /** Progress bar fill */
  progressFill: `
    h-full
    bg-gradient-to-r from-indigo-400 to-purple-500
    rounded-full
    transition-all duration-500
  `,
  
  /** Slider track */
  slider: `
    w-full h-2
    bg-gradient-to-r from-slate-200 to-slate-100
    rounded-full
    shadow-[inset_1px_1px_2px_#c9cbd0,inset_-1px_-1px_2px_#ffffff]
    appearance-none
    cursor-pointer
  `,
  
  // ═══════════════════════════════════════════════════════════════
  // ANIMACIONES
  // ═══════════════════════════════════════════════════════════════
  
  /** Hover glow effect */
  hoverGlow: `
    hover:shadow-[0_0_30px_rgba(99,102,241,0.3)]
    transition-shadow duration-300
  `,
  
  /** Pulse animation */
  pulse: `
    animate-pulse
  `
};

// ═══════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════

/**
 * Combina clases con condicionales
 */
export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Genera sombra neuromorphic customizada
 */
export function neuroShadow(
  size: 'sm' | 'md' | 'lg' | 'xl' = 'md',
  type: 'raised' | 'inset' = 'raised'
): string {
  const sizes = {
    sm: { offset: 2, blur: 4 },
    md: { offset: 4, blur: 8 },
    lg: { offset: 8, blur: 16 },
    xl: { offset: 12, blur: 24 }
  };
  
  const { offset, blur } = sizes[size];
  
  if (type === 'inset') {
    return `shadow-[inset_${offset}px_${offset}px_${blur}px_#d1d5db,inset_-${offset}px_-${offset}px_${blur}px_#ffffff]`;
  }
  
  return `shadow-[${offset}px_${offset}px_${blur}px_#d1d5db,-${offset}px_-${offset}px_${blur}px_#ffffff]`;
}

/**
 * Genera gradiente según tipo
 */
export function neuroGradient(
  type: 'primary' | 'success' | 'warning' | 'danger' | 'neutral' = 'neutral'
): string {
  const gradients = {
    primary: 'from-indigo-500 to-purple-600',
    success: 'from-emerald-400 to-teal-500',
    warning: 'from-amber-400 to-orange-500',
    danger: 'from-red-400 to-rose-500',
    neutral: 'from-slate-50 to-slate-100'
  };
  
  return `bg-gradient-to-br ${gradients[type]}`;
}
