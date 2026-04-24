/**
 * 🎨 Componentes Neumórficos Compartidos — Módulo Campañas
 * Tokens TIER 0: base #dfeaff | dark #bec8de | light #ffffff | accent #6888ff
 */

'use client'

import React, { forwardRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, useDragControls } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'

export const N = {
  base:    '#dfeaff',
  dark:    '#bec8de',
  light:   '#ffffff',
  accent:  '#6888ff',
  text:    '#69738c',
  textSub: '#9aa3b8',
} as const

// ─── Cards ─────────────────────────────────────────────────────
export function NeoCard({ children, className = '', padding = 'normal', style, onClick }: {
  children: React.ReactNode; className?: string; padding?: 'none' | 'small' | 'normal'; style?: React.CSSProperties; onClick?: () => void
}) {
  const p = padding === 'none' ? '' : padding === 'small' ? 'p-3' : 'p-5'
  return (
    <div className={`rounded-3xl ${p} ${className}`} style={{ background: N.base, boxShadow: `8px 8px 16px ${N.dark},-8px -8px 16px ${N.light}`, ...style }} onClick={onClick}>
      {children}
    </div>
  )
}

// ─── Botones ───────────────────────────────────────────────────
export function NeoButton({ children, onClick, variant = 'secondary', size = 'md', className = '', disabled = false, title, type }: {
  children: React.ReactNode; onClick?: React.MouseEventHandler<HTMLButtonElement>; variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'icon'; className?: string; disabled?: boolean; title?: string; type?: 'button' | 'submit'
}) {
  const base = "inline-flex items-center justify-center gap-1.5 font-bold transition-all duration-200 border-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
  const sizes = { sm: "px-3 py-1.5 rounded-full text-[11px]", md: "px-4 py-2 rounded-full text-xs", icon: "w-8 h-8 rounded-xl" }
  const variants = {
    primary: { background: N.accent, color: '#fff', boxShadow: `4px 4px 8px ${N.dark},-2px -2px 6px ${N.light}` },
    secondary: { background: N.base, color: N.text, boxShadow: `4px 4px 8px ${N.dark},-4px -4px 8px ${N.light}` },
    ghost: { background: 'transparent', color: N.textSub, boxShadow: 'none' },
    danger: { background: N.base, color: '#ef4444', boxShadow: `4px 4px 8px ${N.dark},-4px -4px 8px ${N.light}` },
  }
  const v = variants[variant]
  const s = sizes[size]
  return (
    <button type={type || 'button'} onClick={onClick} disabled={disabled} title={title} className={`${base} ${s} ${className}`} style={v}
      onMouseEnter={e => { if (variant === 'secondary' || variant === 'danger') { (e.currentTarget as HTMLElement).style.boxShadow = `2px 2px 4px ${N.dark},-2px -2px 4px ${N.light}` }}}
      onMouseLeave={e => { if (variant === 'secondary' || variant === 'danger') { (e.currentTarget as HTMLElement).style.boxShadow = `4px 4px 8px ${N.dark},-4px -4px 8px ${N.light}` }}}>
      {children}
    </button>
  )
}

// ─── Inputs ────────────────────────────────────────────────────
export const NeoInput = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  function NeoInput({ className = '', ...props }, ref) {
    return (
      <input ref={ref} {...props}
        className={`w-full rounded-xl px-4 py-2.5 text-sm font-medium placeholder-[#9aa3b8] border-none focus:outline-none focus:ring-2 focus:ring-[#6888ff]/30 ${className}`}
        style={{ background: N.base, boxShadow: `inset 4px 4px 8px ${N.dark},inset -4px -4px 8px ${N.light}`, color: N.text, ...(props.style || {}) }} />
    )
  }
)

// ─── Textarea ──────────────────────────────────────────────────
export function NeoTextarea({ className = '', ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea {...props}
      className={`w-full rounded-xl px-4 py-3 text-sm font-medium placeholder-[#9aa3b8] border-none focus:outline-none focus:ring-2 focus:ring-[#6888ff]/30 resize-vertical ${className}`}
      style={{ background: N.base, boxShadow: `inset 4px 4px 8px ${N.dark},inset -4px -4px 8px ${N.light}`, color: N.text, ...(props.style || {}) }} />
  )
}

// ─── Select ────────────────────────────────────────────────────
export function NeoSelect({ className = '', children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select {...props}
      className={`w-full rounded-xl px-4 py-2.5 text-sm font-medium border-none focus:outline-none focus:ring-2 focus:ring-[#6888ff]/30 appearance-none cursor-pointer ${className}`}
      style={{ background: N.base, boxShadow: `inset 4px 4px 8px ${N.dark},inset -4px -4px 8px ${N.light}`, color: N.text, ...(props.style || {}) }}>
      {children}
    </select>
  )
}

// ─── Badges ────────────────────────────────────────────────────
export function NeoBadge({ children, color = 'blue' }: { children: React.ReactNode; color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'emerald' | 'gray' }) {
  const colorMap: Record<string, string> = {
    blue: N.accent, green: '#22c55e', red: '#ef4444', yellow: '#f59e0b', purple: '#a855f7', emerald: '#14b8a6', gray: N.textSub,
  }
  const c = colorMap[color] || N.accent
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide"
      style={{ background: N.base, boxShadow: `inset 2px 2px 4px ${N.dark}, inset -2px -2px 4px ${N.light}`, color: c }}>
      {children}
    </span>
  )
}

// ─── Checkbox ──────────────────────────────────────────────────
export function NeoCheckbox({ checked, onCheckedChange, ...props }: {
  checked: boolean | 'indeterminate'; onCheckedChange: (v: boolean) => void
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'checked' | 'onChange'>) {
  const isChecked = checked === true
  return (
    <label className="relative inline-flex items-center cursor-pointer">
      <input type="checkbox" className="sr-only" checked={isChecked}
        onChange={e => onCheckedChange(e.target.checked)} {...props} />
      <span className="w-4 h-4 rounded flex items-center justify-center transition-all"
        style={{
          background: isChecked ? N.accent : N.base,
          boxShadow: isChecked
            ? `inset 2px 2px 4px ${N.dark}, inset -2px -2px 4px ${N.light}`
            : `2px 2px 4px ${N.dark}, -2px -2px 4px ${N.light}`,
        }}>
        {isChecked && <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}><polyline points="20 6 9 17 4 12" /></svg>}
      </span>
    </label>
  )
}

// ─── Ventana Flotante Draggable ────────────────────────────────
export function FloatWindow({ children, title, onClose }: { children: React.ReactNode; title: string; onClose: () => void }) {
  const dragControls = useDragControls()
  return (
    <motion.div drag dragControls={dragControls} dragListener={false}
      initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
      className="fixed z-50 rounded-2xl overflow-hidden flex flex-col"
      style={{ width: 420, maxHeight: '80vh', top: 80, right: 24, background: N.base, boxShadow: `12px 12px 24px ${N.dark},-12px -12px 24px ${N.light}` }}>
      <div onPointerDown={e => dragControls.start(e)}
        className="h-10 flex items-center justify-between px-4 cursor-grab active:cursor-grabbing shrink-0"
        style={{ borderBottom: `1px solid ${N.dark}40` }}>
        <span className="text-xs font-black uppercase tracking-wider" style={{ color: N.text }}>{title}</span>
        <div className="flex gap-2 items-center">
          <button onClick={onClose} className="w-3 h-3 rounded-full bg-red-400 shadow-[inset_1px_1px_2px_rgba(0,0,0,0.2)] hover:brightness-110 transition-all" />
        </div>
      </div>
      <div className="flex-1 overflow-auto p-4">{children}</div>
      <div className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize" />
    </motion.div>
  )
}

// ─── Header Neumórfico de Página ───────────────────────────────
export function NeoPageHeader({ title, subtitle, icon: Icon, backHref = '/campanas' }: {
  title: string; subtitle?: string; icon?: React.ElementType; backHref?: string
}) {
  const router = useRouter()
  return (
    <NeoCard padding="normal">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <NeoButton variant="secondary" size="icon" onClick={() => router.push(backHref)} title="Volver">
            <ArrowLeft className="w-4 h-4" style={{ color: N.textSub }} />
          </NeoButton>
          {Icon && (
            <div className="p-3 rounded-xl" style={{ background: N.accent, boxShadow: `4px 4px 8px ${N.dark},-2px -2px 6px ${N.light}` }}>
              <Icon className="h-6 w-6 text-white" />
            </div>
          )}
          <div>
            <h1 className="text-2xl font-black tracking-tight" style={{ color: N.text }}>{title}</h1>
            {subtitle && <p className="text-xs font-bold" style={{ color: N.textSub }}>{subtitle}</p>}
          </div>
        </div>
      </div>
    </NeoCard>
  )
}

// ─── Tabla Neumórfica (wrapper) ────────────────────────────────
export function NeoTable({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full text-sm">
        {children}
      </table>
    </div>
  )
}

export function NeoTableHead({ children }: { children: React.ReactNode }) {
  return (
    <thead>
      <tr style={{ borderBottom: `2px solid ${N.dark}40` }}>
        {children}
      </tr>
    </thead>
  )
}

export function NeoTableHeader({ children, className = '', style }: { children?: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return <th className={`px-3 py-3 text-left text-xs font-black uppercase tracking-wider ${className}`} style={{ color: N.textSub, ...style }}>{children}</th>
}

export function NeoTableRow({ children, className = '', style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return <tr className={`transition-colors ${className}`} style={{ borderBottom: `1px solid ${N.dark}30`, ...style }}>{children}</tr>
}

export function NeoTableCell({ children, className = '', style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return <td className={`px-3 py-3 ${className}`} style={{ color: N.text, ...style }}>{children}</td>
}
