/**
 * neu-design.ts — Sistema de Diseño Neumórfico TIER 0
 * Paleta oficial Silexar Pulse
 *
 * Colores:
 *   Base:      #dfeaff  — azul lavanda perlado
 *   Dark:      #bec8de  — sombra oscura
 *   Light:     #ffffff  — contraluz
 *   Accent:    #6888ff  — azul índigo vibrante (botones activos, highlights)
 *   Text:      #69738c  — gris azulado elegante
 *   TextSub:   #9aa3b8  — texto secundario / placeholder
 */

import React from 'react'
import { useRouter } from 'next/navigation'
import { ChevronRight, ArrowLeft } from 'lucide-react'

// ─── Tokens ──────────────────────────────────────────────────────────────────
export const N = {
  base:    '#dfeaff',
  dark:    '#bec8de',
  light:   '#ffffff',
  accent:  '#6888ff',
  text:    '#69738c',
  textSub: '#9aa3b8',
} as const

// ─── Shadow helpers ──────────────────────────────────────────────────────────
export const raised  = `8px 8px 16px ${N.dark},-8px -8px 16px ${N.light}`
export const raisedSm = `4px 4px 8px ${N.dark},-4px -4px 8px ${N.light}`
export const raisedXs = `3px 3px 6px ${N.dark},-3px -3px 6px ${N.light}`
export const inset   = `inset 4px 4px 8px ${N.dark},inset -4px -4px 8px ${N.light}`
export const insetSm = `inset 2px 2px 5px ${N.dark},inset -2px -2px 5px ${N.light}`

// ─── NeuCard ─────────────────────────────────────────────────────────────────
export function NeuCard({
  children, className = '', style = {}, onClick, padding = 'p-6',
}: {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
  onClick?: () => void
  padding?: string
}) {
  const base: React.CSSProperties = { background: N.base, boxShadow: raised }
  return onClick ? (
    <button
      onClick={onClick}
      className={`rounded-3xl text-left w-full transition-all duration-300 cursor-pointer ${padding} ${className}`}
      style={base}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = raisedSm }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = raised }}
    >
      {children}
    </button>
  ) : (
    <div className={`rounded-3xl ${padding} ${className}`} style={{ ...base, ...style }}>
      {children}
    </div>
  )
}

// ─── NeuButton ───────────────────────────────────────────────────────────────
export type NeuButtonVariant = 'primary' | 'secondary' | 'danger' | 'success' | 'ghost'

export function NeuButton({
  children, onClick, variant = 'secondary', disabled = false,
  className = '', type = 'button', 'aria-label': al,
}: {
  children: React.ReactNode
  onClick?: () => void
  variant?: NeuButtonVariant
  disabled?: boolean
  className?: string
  type?: 'button' | 'submit' | 'reset'
  'aria-label'?: string
}) {
  const styles: Record<NeuButtonVariant, React.CSSProperties> = {
    primary:   { background: N.accent,  color: '#fff',    boxShadow: `4px 4px 8px ${N.dark},-2px -2px 6px ${N.light}` },
    secondary: { background: N.base,    color: N.text,    boxShadow: raised },
    danger:    { background: N.base,    color: '#ef4444', boxShadow: raisedSm },
    success:   { background: N.base,    color: '#22c55e', boxShadow: raisedSm },
    ghost:     { background: 'transparent', color: N.textSub },
  }
  const hover: Record<NeuButtonVariant, string> = {
    primary:   `3px 3px 6px ${N.dark},-1px -1px 4px ${N.light}`,
    secondary: raisedSm,
    danger:    raisedXs,
    success:   raisedXs,
    ghost:     'none',
  }
  const active: Record<NeuButtonVariant, string> = {
    primary:   insetSm,
    secondary: inset,
    danger:    insetSm,
    success:   insetSm,
    ghost:     'none',
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label={al}
      className={`
        flex items-center gap-2 justify-center rounded-2xl font-bold text-sm
        transition-all duration-200
        ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      style={styles[variant]}
      onMouseEnter={e => { if (!disabled) (e.currentTarget as HTMLElement).style.boxShadow = hover[variant] }}
      onMouseLeave={e => { if (!disabled) (e.currentTarget as HTMLElement).style.boxShadow = styles[variant].boxShadow as string }}
      onMouseDown={e  => { if (!disabled) (e.currentTarget as HTMLElement).style.boxShadow = active[variant] }}
      onMouseUp={e    => { if (!disabled) (e.currentTarget as HTMLElement).style.boxShadow = hover[variant] }}
    >
      {children}
    </button>
  )
}

// ─── NeuInput ─────────────────────────────────────────────────────────────────
export function NeuInput({
  placeholder, value, onChange, icon: Icon, type = 'text',
  name, id, required = false, className = '',
}: {
  placeholder?: string; value: string; onChange: (v: string) => void
  icon?: React.ElementType; type?: string; name?: string
  id?: string; required?: boolean; className?: string
}) {
  return (
    <div className={`relative ${className}`}>
      {Icon && (
        <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: N.textSub }} />
      )}
      <input
        id={id} name={name} type={type} placeholder={placeholder}
        value={value} required={required}
        onChange={e => onChange(e.target.value)}
        aria-label={placeholder}
        className="w-full py-3 rounded-2xl text-sm focus:outline-none transition-all"
        style={{
          background: N.base,
          boxShadow: inset,
          color: N.text,
          paddingLeft:  Icon ? '2.5rem' : '1rem',
          paddingRight: '1rem',
        }}
        onFocus={e  => { (e.currentTarget as HTMLElement).style.boxShadow = `${inset}, 0 0 0 2px ${N.accent}40` }}
        onBlur={e   => { (e.currentTarget as HTMLElement).style.boxShadow = inset }}
      />
    </div>
  )
}

// ─── NeuSelect ───────────────────────────────────────────────────────────────
export function NeuSelect({
  value, onChange, options, className = '', name, id,
}: {
  value: string; onChange: (v: string) => void
  options: { value: string; label: string }[]
  className?: string; name?: string; id?: string
}) {
  return (
    <select
      id={id} name={name} value={value}
      onChange={e => onChange(e.target.value)}
      className={`py-3 px-4 rounded-2xl text-sm focus:outline-none cursor-pointer ${className}`}
      style={{ background: N.base, boxShadow: inset, color: N.text }}
    >
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  )
}

// ─── NeuTextarea ─────────────────────────────────────────────────────────────
export function NeuTextarea({
  placeholder, value, onChange, rows = 4, name, id, required = false,
}: {
  placeholder?: string; value: string; onChange: (v: string) => void
  rows?: number; name?: string; id?: string; required?: boolean
}) {
  return (
    <textarea
      id={id} name={name} rows={rows} placeholder={placeholder}
      value={value} required={required}
      onChange={e => onChange(e.target.value)}
      aria-label={placeholder}
      className="w-full py-3 px-4 rounded-2xl text-sm focus:outline-none resize-none transition-all"
      style={{ background: N.base, boxShadow: inset, color: N.text }}
      onFocus={e  => { (e.currentTarget as HTMLElement).style.boxShadow = `${inset}, 0 0 0 2px ${N.accent}40` }}
      onBlur={e   => { (e.currentTarget as HTMLElement).style.boxShadow = inset }}
    />
  )
}

// ─── NeuBadge ────────────────────────────────────────────────────────────────
export function NeuBadge({
  children, color = N.accent, className = '',
}: {
  children: React.ReactNode; color?: string; className?: string
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${className}`}
      style={{ background: `${color}18`, color, boxShadow: insetSm }}
    >
      {children}
    </span>
  )
}

// ─── NeuSectionTitle ─────────────────────────────────────────────────────────
export function NeuSectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-2" style={{ color: N.textSub }}>
      {children}
    </h2>
  )
}

// ─── NeuPageHeader ───────────────────────────────────────────────────────────
export function NeuPageHeader({
  title, subtitle, icon: Icon, action,
}: {
  title: string
  subtitle?: string
  icon?: React.ElementType
  action?: React.ReactNode
}) {
  const router = useRouter()
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push('/dashboard')}
          className="p-2.5 rounded-xl transition-all"
          style={{ background: N.base, boxShadow: raisedSm, color: N.textSub }}
          aria-label="Volver al Dashboard"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-2xl font-black tracking-tight flex items-center gap-2" style={{ color: N.text }}>
            {Icon && <Icon className="w-6 h-6" style={{ color: N.accent }} />}
            {title}
          </h1>
          {subtitle && <p className="text-sm mt-0.5" style={{ color: N.textSub }}>{subtitle}</p>}
        </div>
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}

// ─── NeuStatCard ─────────────────────────────────────────────────────────────
export function NeuStatCard({
  label, value, icon: Icon, color, onClick,
}: {
  label: string; value: string | number
  icon: React.ElementType; color: string; onClick?: () => void
}) {
  return (
    <NeuCard padding="p-5" onClick={onClick}>
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-2xl shrink-0" style={{ background: N.base, boxShadow: raisedSm }}>
          <Icon className="w-6 h-6" style={{ color }} />
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-wider" style={{ color: N.textSub }}>{label}</p>
          <p className="text-3xl font-black mt-0.5" style={{ color: N.text }}>{value}</p>
        </div>
      </div>
    </NeuCard>
  )
}

// ─── NeuQuickLink ────────────────────────────────────────────────────────────
export function NeuQuickLink({
  label, icon: Icon, href, desc, color,
}: {
  label: string; icon: React.ElementType; href: string; desc: string; color: string
}) {
  const router = useRouter()
  return (
    <button
      onClick={() => router.push(href)}
      className="group flex items-center gap-3 p-4 rounded-2xl text-left w-full transition-all duration-300"
      style={{ background: N.base, boxShadow: raised }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = raisedSm }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = raised }}
    >
      <div className="p-2.5 rounded-xl shrink-0" style={{ background: N.base, boxShadow: raisedXs }}>
        <Icon className="w-4 h-4" style={{ color }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold truncate" style={{ color: N.text }}>{label}</p>
        <p className="text-xs truncate" style={{ color: N.textSub }}>{desc}</p>
      </div>
      <ChevronRight className="w-4 h-4 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: N.accent }} />
    </button>
  )
}

// ─── NeuTableWrapper ─────────────────────────────────────────────────────────
export function NeuTableWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-3xl overflow-hidden" style={{ background: N.base, boxShadow: raised }}>
      {children}
    </div>
  )
}

// ─── NeuTableHead ────────────────────────────────────────────────────────────
export function NeuTh({ children, center = false }: { children: React.ReactNode; center?: boolean }) {
  return (
    <th
      className={`py-4 px-4 text-xs font-black uppercase tracking-wider ${center ? 'text-center' : 'text-left'}`}
      style={{ color: N.textSub, borderBottom: `1px solid ${N.dark}40` }}
    >
      {children}
    </th>
  )
}

// ─── NeuActionButton ─────────────────────────────────────────────────────────
export function NeuActionBtn({
  icon: Icon, color, onClick, title,
}: {
  icon: React.ElementType; color: string; onClick: () => void; title: string
}) {
  return (
    <button
      onClick={onClick} title={title}
      className="p-2 rounded-xl transition-all"
      style={{ background: N.base, boxShadow: raisedXs, color }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = insetSm }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = raisedXs }}
    >
      <Icon className="w-3.5 h-3.5" />
    </button>
  )
}

// ─── NeuEmptyState ───────────────────────────────────────────────────────────
export function NeuEmptyState({
  icon: Icon, title, desc, action,
}: {
  icon: React.ElementType; title: string; desc?: string; action?: React.ReactNode
}) {
  return (
    <div className="text-center py-16">
      <div
        className="w-16 h-16 rounded-3xl mx-auto mb-4 flex items-center justify-center"
        style={{ background: N.base, boxShadow: inset }}
      >
        <Icon className="w-8 h-8" style={{ color: N.textSub }} />
      </div>
      <h3 className="text-lg font-bold mb-1" style={{ color: N.text }}>{title}</h3>
      {desc && <p className="text-sm mb-4" style={{ color: N.textSub }}>{desc}</p>}
      {action}
    </div>
  )
}

// ─── NeuSkeletonRow ──────────────────────────────────────────────────────────
export function NeuSkeletonRows({ count = 5 }: { count?: number }) {
  return (
    <div className="p-5 space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="h-12 rounded-2xl animate-pulse"
          style={{ background: N.base, boxShadow: insetSm }}
        />
      ))}
    </div>
  )
}

// ─── NeuPageLayout ───────────────────────────────────────────────────────────
export function NeuPageLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen p-6 lg:p-8" style={{ background: N.base }}>
      <div className="max-w-7xl mx-auto space-y-7">
        {children}
      </div>
    </div>
  )
}
