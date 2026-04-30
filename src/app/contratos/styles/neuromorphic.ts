/**
 * 🎨 SILEXAR PULSE - Neuromorphic Design System TIER 0
 * 
 * @description Sistema de diseño neuromórfico oficial con tokens
 * consistentes para todo el módulo de contratos.
 * Paleta oficial: base #dfeaff | dark #bec8de | light #ffffff | accent #6888ff
 * 
 * @version 2025.4.0
 * @tier TIER_0_FORTUNE_10
 */

// ═══════════════════════════════════════════════════════════════
// TOKENS OFICIALES NEUMORPHISM
// ═══════════════════════════════════════════════════════════════

export const N = {
  base: '#dfeaff',
  dark: '#bec8de',
  light: '#ffffff',
  accent: '#6888ff',
  text: '#69738c',
  textSub: '#9aa3b8',
} as const;

export const neuroColors = {
  // Fondos principales
  bgLight: 'from-[#dfeaff] via-[#e8f0ff] to-[#dfeaff]',
  bgCard: 'from-[#dfeaff] to-[#e8f0ff]',
  bgInset: 'from-[#e8f0ff] to-[#dfeaff]',
  
  // Sombras oficiales
  shadowLight: '#ffffff',
  shadowDark: '#bec8de',
  shadowDarker: '#a8b4cc',
  
  // Acentos - UNICAMENTE azul oficial #6888ff permitido
  accentPrimary: 'from-[#6888ff] to-[#5572ee]',
  
  // Texto
  textPrimary: 'text-[#69738c]',
  textSecondary: 'text-[#9aa3b8]',
  textMuted: 'text-[#b0b8cc]'
};

// ═══════════════════════════════════════════════════════════════
// SOMBRAS NEUMORPHIC
// ═══════════════════════════════════════════════════════════════

export const S = {
  raised: `shadow-[8px_8px_16px_${N.dark},-8px_-8px_16px_${N.light}]`,
  sm: `shadow-[4px_4px_8px_${N.dark},-4px_-4px_8px_${N.light}]`,
  xs: `shadow-[2px_2px_4px_${N.dark},-2px_-2px_4px_${N.light}]`,
  inset: `shadow-[inset_4px_4px_8px_${N.dark},inset_-4px_-4px_8px_${N.light}]`,
  insetSm: `shadow-[inset_2px_2px_5px_${N.dark},inset_-2px_-2px_5px_${N.light}]`,
  insetXs: `shadow-[inset_2px_2px_4px_${N.dark},inset_-2px_-2px_4px_${N.light}]`,
};

// ═══════════════════════════════════════════════════════════════
// CLASES NEUROMORPHIC OFICIALES
// ═══════════════════════════════════════════════════════════════

export const neuro = {
  // ═══════════════════════════════════════════════════════════════
  // CONTENEDORES
  // ═══════════════════════════════════════════════════════════════
  
  /** Página completa con fondo neumórfico oficial */
  page: `
    bg-[#dfeaff]
    min-h-screen
    text-[#69738c]
  `,
  
  /** Card elevada con sombras oficiales */
  card: `
    bg-[#dfeaff]
    rounded-3xl
    shadow-[8px_8px_16px_#bec8de,-8px_-8px_16px_#ffffff]
  `,
  
  /** Card más pequeña */
  cardSm: `
    bg-[#dfeaff]
    rounded-2xl
    shadow-[6px_6px_12px_#bec8de,-6px_-6px_12px_#ffffff]
  `,
  
  /** Card con efecto hundido/inset */
  cardInset: `
    bg-[#dfeaff]
    rounded-2xl
    shadow-[inset_4px_4px_8px_#bec8de,inset_-4px_-4px_8px_#ffffff]
  `,
  
  /** Card inset más pequeña */
  cardInsetSm: `
    bg-[#dfeaff]
    rounded-xl
    shadow-[inset_2px_2px_4px_#bec8de,inset_-2px_-2px_4px_#ffffff]
  `,
  
  // ═══════════════════════════════════════════════════════════════
  // BOTONES
  // ═══════════════════════════════════════════════════════════════
  
  /** Botón primario con acento oficial */
  btnPrimary: `
    bg-[#6888ff]
    text-white font-semibold
    rounded-xl
    shadow-[4px_4px_8px_#bec8de,-2px_-2px_6px_#ffffff]
    hover:shadow-[2px_2px_4px_#bec8de,-2px_-2px_4px_#ffffff]
    hover:bg-[#5572ee]
    active:shadow-[inset_3px_3px_6px_rgba(0,0,0,0.2)]
    transition-all duration-200
    px-6 py-3
  `,
  
  /** Botón secundario neumórfico */
  btnSecondary: `
    bg-[#dfeaff]
    text-[#69738c] font-medium
    rounded-xl
    shadow-[6px_6px_12px_#bec8de,-6px_-6px_12px_#ffffff]
    hover:shadow-[3px_3px_6px_#bec8de,-3px_-3px_6px_#ffffff]
    active:shadow-[inset_4px_4px_8px_#bec8de,inset_-4px_-4px_8px_#ffffff]
    transition-all duration-200
    px-4 py-2
  `,
  
  /** Botón primario (único estilo de acción permitido) */
  btnPrimaryAlt: `
    bg-[#6888ff]
    text-white font-semibold
    rounded-xl
    shadow-[4px_4px_8px_#bec8de,-4px_-4px_8px_#ffffff]
    hover:shadow-[2px_2px_4px_#bec8de,-2px_-2px_4px_#ffffff]
    active:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.2)]
    transition-all duration-200
    px-6 py-3
  `,
  
  /** Botón icono circular */
  btnIcon: `
    bg-[#dfeaff]
    rounded-xl
    shadow-[4px_4px_8px_#bec8de,-4px_-4px_8px_#ffffff]
    hover:shadow-[2px_2px_4px_#bec8de,-2px_-2px_4px_#ffffff]
    active:shadow-[inset_2px_2px_4px_#bec8de]
    transition-all duration-200
    p-3
  `,
  
  /** Botón flotante (FAB) */
  fab: `
    bg-[#6888ff]
    text-white
    rounded-2xl
    shadow-[8px_8px_16px_#bec8de,-8px_-8px_16px_#ffffff,0_8px_32px_rgba(104,136,255,0.4)]
    hover:shadow-[4px_4px_8px_#bec8de,-4px_-4px_8px_#ffffff,0_12px_40px_rgba(104,136,255,0.5)]
    active:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.2)]
    transition-all duration-200
    p-4
  `,
  
  // ═══════════════════════════════════════════════════════════════
  // INPUTS
  // ═══════════════════════════════════════════════════════════════
  
  /** Input de texto hundido */
  input: `
    bg-[#dfeaff]
    rounded-xl
    shadow-[inset_3px_3px_6px_#bec8de,inset_-3px_-3px_6px_#ffffff]
    border-none
    focus:ring-2 focus:ring-[#6888ff]/30 focus:outline-none
    transition-all duration-200
    px-4 py-3
    text-[#69738c]
    placeholder:text-[#9aa3b8]
    w-full
  `,
  
  /** Select hundido */
  select: `
    bg-[#dfeaff]
    rounded-xl
    shadow-[inset_3px_3px_6px_#bec8de,inset_-3px_-3px_6px_#ffffff]
    border-none
    focus:ring-2 focus:ring-[#6888ff]/30 focus:outline-none
    transition-all duration-200
    px-4 py-3 pr-10
    text-[#69738c]
    cursor-pointer
    appearance-none
    w-full
  `,
  
  /** Textarea hundida */
  textarea: `
    bg-[#dfeaff]
    rounded-xl
    shadow-[inset_3px_3px_6px_#bec8de,inset_-3px_-3px_6px_#ffffff]
    border-none
    focus:ring-2 focus:ring-[#6888ff]/30 focus:outline-none
    transition-all duration-200
    px-4 py-3
    text-[#69738c]
    placeholder:text-[#9aa3b8]
    resize-none
    w-full
  `,
  
  // ═══════════════════════════════════════════════════════════════
  // TOGGLE SWITCH
  // ═══════════════════════════════════════════════════════════════
  
  /** Toggle container (off state) */
  toggleOff: `
    relative w-14 h-7
    bg-[#dfeaff]
    rounded-full
    shadow-[inset_2px_2px_4px_#bec8de,inset_-2px_-2px_4px_#ffffff]
    cursor-pointer
    transition-all duration-300
  `,
  
  /** Toggle container (on state) */
  toggleOn: `
    relative w-14 h-7
    bg-[#6888ff]
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
    bg-[#dfeaff]
    rounded-lg
    shadow-[2px_2px_4px_#bec8de,-2px_-2px_4px_#ffffff]
    text-sm font-medium
    text-[#69738c]
  `,
  
  /** Badge con color */
  badgePrimary: `
    px-3 py-1
    bg-[#6888ff]/10
    text-[#6888ff]
    rounded-lg
    shadow-[inset_2px_2px_4px_#bec8de,inset_-2px_-2px_4px_#ffffff]
    text-sm font-medium
  `,
  
  /** Badge de estado (único estilo permitido - monocromático azul) */
  badgeStatus: `
    px-3 py-1
    bg-[#6888ff]/10
    text-[#6888ff]
    rounded-lg
    shadow-[inset_2px_2px_4px_#bec8de,inset_-2px_-2px_4px_#ffffff]
    text-sm font-medium
  `,
  
  // ═══════════════════════════════════════════════════════════════
  // UTILIDADES
  // ═══════════════════════════════════════════════════════════════
  
  /** Avatar/Icon container */
  avatar: `
    bg-[#dfeaff]
    rounded-2xl
    shadow-[inset_2px_2px_4px_#bec8de,inset_-2px_-2px_4px_#ffffff]
    flex items-center justify-center
  `,
  
  /** Divider horizontal */
  divider: `
    h-px
    bg-gradient-to-r from-transparent via-[#bec8de] to-transparent
    shadow-[0_1px_0_#ffffff]
  `,
  
  /** Progress bar container */
  progressBg: `
    h-2
    bg-[#dfeaff]
    rounded-full
    shadow-[inset_1px_1px_2px_#bec8de,inset_-1px_-1px_2px_#ffffff]
    overflow-hidden
  `,
  
  /** Progress bar fill */
  progressFill: `
    h-full
    bg-[#6888ff]
    rounded-full
    transition-all duration-500
  `,
  
  /** Slider track */
  slider: `
    w-full h-2
    bg-[#dfeaff]
    rounded-full
    shadow-[inset_1px_1px_2px_#bec8de,inset_-1px_-1px_2px_#ffffff]
    appearance-none
    cursor-pointer
  `,
  
  // ═══════════════════════════════════════════════════════════════
  // NAVIGATION
  // ═══════════════════════════════════════════════════════════════
  
  /** Nav Item Activo */
  navActive: `
    bg-[#dfeaff]
    shadow-[inset_3px_3px_6px_#bec8de,inset_-3px_-3px_6px_#ffffff]
    text-[#6888ff]
    rounded-xl
  `,
  
  /** Nav Item Inactivo */
  navInactive: `
    text-[#69738c]
    hover:shadow-[3px_3px_6px_#bec8de,-3px_-3px_6px_#ffffff]
    rounded-xl
    transition-all
  `,
  
  // ═══════════════════════════════════════════════════════════════
  // ANIMACIONES
  // ═══════════════════════════════════════════════════════════════
  
  /** Hover glow effect */
  hoverGlow: `
    hover:shadow-[0_0_30px_rgba(104,136,255,0.3)]
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
    return `shadow-[inset_${offset}px_${offset}px_${blur}px_#bec8de,inset_-${offset}px_-${offset}px_${blur}px_#ffffff]`;
  }
  
  return `shadow-[${offset}px_${offset}px_${blur}px_#bec8de,-${offset}px_-${offset}px_${blur}px_#ffffff]`;
}

/**
 * Genera gradiente según tipo
 */
export function neuroGradient(
  type: 'primary' | 'neutral' = 'neutral'
): string {
  const gradients = {
    primary: 'from-[#6888ff] to-[#5572ee]',
    neutral: 'from-[#dfeaff] to-[#e8f0ff]'
  };
  
  return `bg-gradient-to-br ${gradients[type]}`;
}

/**
 * Genera estilo inline para sombra neumórfica
 */
export function neuStyle(
  size: 'sm' | 'md' | 'lg' | 'xl' | 'none' = 'md',
  type: 'raised' | 'inset' = 'raised'
): React.CSSProperties {
  if (size === 'none') return {};
  
  const sizes = {
    sm: { offset: 4, blur: 8 },
    md: { offset: 8, blur: 16 },
    lg: { offset: 12, blur: 24 },
    xl: { offset: 16, blur: 32 }
  };
  
  const { offset, blur } = sizes[size];
  
  if (type === 'inset') {
    return {
      boxShadow: `inset ${offset}px ${offset}px ${blur}px ${N.dark}, inset -${offset}px -${offset}px ${blur}px ${N.light}`
    };
  }
  
  return {
    boxShadow: `${offset}px ${offset}px ${blur}px ${N.dark}, -${offset}px -${offset}px ${blur}px ${N.light}`
  };
}
