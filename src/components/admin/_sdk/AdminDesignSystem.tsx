/**
 * ðŸŽ¨ SILEXAR PULSE - Admin Neumorphic Design System SDK
 * Centralized Neumorphism TIER 0 Design System for Admin Components
 * 
 * @description Este archivo define los tokens y componentes base neumórficos
 * que TODOS los componentes admin DEBEN usar para mantener consistencia.
 * 
 * @tokens:
 * - base: #dfeaff (fondo universal azul lavanda perlado)
 * - dark: #bec8de (sombra oscura neumórfica)
 * - light: #ffffff (contraluz blanca)
 * - accent: #6888ff (acento activo)
 * - text: #69738c (texto primario)
 * - textSub: #9aa3b8 (texto secundario)
 * 
 * @version 2025.4.2
 * @tier NEUMORPHISM_TIER_0
 */

import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

// •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••
// TOKENS OFICIALES NEUMORPHISM TIER 0
// •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••

export const N = {
    base: '#dfeaff',
    dark: '#bec8de',
    light: '#ffffff',
    accent: '#6888ff',
    accentHover: '#5572ee',
    text: '#69738c',
    textSub: '#9aa3b8',
} as const

// •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••
// HELPERS
// •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••

type ColorKey = keyof typeof N

export function getShadow(isInset = false): string {
    if (isInset) {
        return `inset 4px 4px 8px ${N.dark},inset -4px -4px 8px ${N.light}`
    }
    return `8px 8px 16px ${N.dark},-8px -8px 16px ${N.light}`
}

export function getSmallShadow(isInset = false): string {
    if (isInset) {
        return `inset 2px 2px 4px ${N.dark},inset -2px -2px 4px ${N.light}`
    }
    return `4px 4px 8px ${N.dark},-4px -4px 8px ${N.light}`
}

export function getFloatingShadow(): string {
    return `12px 12px 24px ${N.dark},-12px -12px 24px ${N.light}`
}

// •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••
// BASE COMPONENTS
// •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••

interface NeuCardProps {
    children: React.ReactNode
    className?: string
    style?: React.CSSProperties
    glow?: boolean
}

export function NeuCard({ children, className = '', style = {}, glow = false }: NeuCardProps) {
    return (
        <div
            className={cn("rounded-3xl", glow && "relative overflow-hidden", className)}
            style={{
                background: N.base,
                boxShadow: getShadow(),
                ...style
            }}
        >
            {children}
        </div>
    )
}

interface NeuCardSmallProps {
    children: React.ReactNode
    className?: string
    style?: React.CSSProperties
}

export function NeuCardSmall({ children, className = '', style = {} }: NeuCardSmallProps) {
    return (
        <div
            className={cn("rounded-2xl", className)}
            style={{
                background: N.base,
                boxShadow: getSmallShadow(),
                ...style
            }}
        >
            {children}
        </div>
    )
}

interface NeuButtonProps {
    children: React.ReactNode
    onClick?: () => void
    variant?: 'primary' | 'secondary' | 'ghost'
    disabled?: boolean
    className?: string
    icon?: React.ReactElement
    'aria-label'?: string
}

export function NeuButton({
    children,
    onClick,
    variant = 'secondary',
    disabled = false,
    className = '',
    icon,
    'aria-label': al
}: NeuButtonProps) {
    const variants = {
        primary: {
            background: N.accent,
            color: '#fff',
            shadow: getSmallShadow()
        },
        secondary: {
            background: N.base,
            color: N.text,
            shadow: getSmallShadow()
        },
        ghost: {
            background: 'transparent',
            color: N.textSub,
            shadow: 'none'
        }
    }

    const v = variants[variant]

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            aria-label={al}
            className={cn(
                "flex items-center gap-2 justify-center rounded-2xl font-bold text-sm",
                "transition-all duration-200",
                disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer",
                className
            )}
            style={{
                background: v.background,
                color: v.color,
                boxShadow: v.shadow,
                padding: '10px 20px'
            }}
        >
            {icon && <span style={{ display: 'flex' }}>{icon}</span>}
            {children}
        </button>
    )
}

interface NeuInputProps {
    placeholder?: string
    value: string
    onChange: (v: string) => void
    icon?: React.ReactElement
    type?: string
    className?: string
}

export function NeuInput({
    placeholder,
    value,
    onChange,
    icon,
    type = 'text',
    className = ''
}: NeuInputProps) {
    return (
        <div className={cn("relative", className)}>
            {icon && (
                <span
                    className="absolute left-3.5 top-1/2 -translate-y-1/2"
                    style={{ color: N.textSub, display: 'flex' }}
                >
                    {icon}
                </span>
            )}
            <input
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={e => onChange(e.target.value)}
                aria-label={placeholder}
                className="w-full py-3 rounded-2xl text-sm focus:outline-none transition-all"
                style={{
                    background: N.base,
                    boxShadow: getShadow(true),
                    color: N.text,
                    paddingLeft: icon ? '2.5rem' : '1rem',
                    paddingRight: '1rem'
                }}
            />
        </div>
    )
}

interface NeuSelectProps {
    value: string
    onChange: (v: string) => void
    options: { value: string; label: string }[]
    className?: string
}

export function NeuSelect({ value, onChange, options, className = '' }: NeuSelectProps) {
    return (
        <select
            value={value}
            onChange={e => onChange(e.target.value)}
            className={cn("py-3 px-4 rounded-2xl text-sm focus:outline-none cursor-pointer", className)}
            style={{
                background: N.base,
                boxShadow: getShadow(true),
                color: N.text
            }}
        >
            {options.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
            ))}
        </select>
    )
}

interface StatusBadgeProps {
    status: 'success' | 'warning' | 'danger' | 'info' | 'neutral'
    label: string
    icon?: React.ReactElement
}

export function StatusBadge({ status, label, icon }: StatusBadgeProps) {
    // NEUMORPHISM TIER 0: UNICO color permitido para estados = #6888ff (accent)
    const opacities: Record<string, number> = {
        success: 1,
        warning: 0.7,
        danger: 0.5,
        info: 0.85,
        neutral: 0.6
    }
    const opacity = opacities[status] ?? 0.85

    return (
        <span
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold"
            style={{
                background: `${N.accent}15`,
                color: N.accent,
                opacity,
                boxShadow: getSmallShadow(true)
            }}
        >
            {icon && <span style={{ display: 'flex' }}>{icon}</span>}
            {label}
        </span>
    )
}

interface StatCardProps {
    title: string
    value: string | number
    subtitle?: string
    icon: React.ReactElement
    trend?: 'up' | 'down' | 'neutral'
    color?: string
}

export function StatCard({ title, value, subtitle, icon, trend, color = N.accent }: StatCardProps) {
    return (
        <NeuCard className="p-5">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-xs font-medium uppercase tracking-wide mb-1" style={{ color: N.textSub }}>
                        {title}
                    </p>
                    <p className="text-2xl font-bold" style={{ color: N.text }}>
                        {value}
                    </p>
                    {subtitle && (
                        <p className="text-xs mt-1" style={{ color: N.textSub }}>
                            {subtitle}
                        </p>
                    )}
                    {trend && (
                        <div
                            className="flex items-center gap-1 mt-2 text-xs font-semibold"
                            style={{
                                color: trend === 'neutral' ? N.textSub : N.accent
                            }}
                        >
                            {trend === 'up' && <TrendingUpIcon className="w-3 h-3" />}
                            {trend === 'down' && <TrendingDownIcon className="w-3 h-3" />}
                            {trend !== 'neutral' ? '+2.5%' : '0%'}
                        </div>
                    )}
                </div>
                <div
                    className="p-3 rounded-2xl"
                    style={{
                        backgroundColor: `${color}15`,
                        boxShadow: `inset 2px 2px 4px ${color}20, inset -2px -2px 4px white`
                    }}
                >
                    <span style={{ color, display: 'flex' }}>{icon}</span>
                </div>
            </div>
        </NeuCard>
    )
}

// Mini icon components to avoid importing from lucide
function TrendingUpIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
            <polyline points="17 6 23 6 23 12" />
        </svg>
    )
}

function TrendingDownIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
            <polyline points="17 18 23 18 23 12" />
        </svg>
    )
}

interface NeuTabsProps {
    tabs: { id: string; label: string; icon?: React.ReactElement }[]
    activeTab: string
    onChange: (id: string) => void
    className?: string
}

export function NeuTabs({ tabs, activeTab, onChange, className = '' }: NeuTabsProps) {
    return (
        <div
            className={cn("flex flex-wrap gap-2 p-2 rounded-2xl", className)}
            style={{
                background: N.base,
                boxShadow: getShadow(true)
            }}
        >
            {tabs.map((tab) => {
                const isActive = activeTab === tab.id
                return (
                    <button
                        key={tab.id}
                        onClick={() => onChange(tab.id)}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-300 text-sm font-bold"
                        style={isActive ? {
                            background: N.accent,
                            color: '#fff',
                            boxShadow: getSmallShadow()
                        } : {
                            color: N.textSub
                        }}
                    >
                        {tab.icon && <span style={{ display: 'flex' }}>{tab.icon}</span>}
                        {tab.label}
                    </button>
                )
            })}
        </div>
    )
}

interface NeuProgressProps {
    value: number
    max?: number
    color?: string
    className?: string
}

export function NeuProgress({ value, max = 100, color = N.accent, className = '' }: NeuProgressProps) {
    const percentage = Math.min(100, Math.max(0, (value / max) * 100))

    return (
        <div
            className={cn("w-full h-2 rounded-full overflow-hidden", className)}
            style={{ background: N.base, boxShadow: getSmallShadow(true) }}
        >
            <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                    width: `${percentage}%`,
                    background: color,
                    boxShadow: `0 0 8px ${color}50`
                }}
            />
        </div>
    )
}

interface NeuDividerProps {
    className?: string
}

export function NeuDivider({ className = '' }: NeuDividerProps) {
    return (
        <div
            className={cn("h-px w-full", className)}
            style={{ background: `${N.dark}40` }}
        />
    )
}
