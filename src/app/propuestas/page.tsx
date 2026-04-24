'use client'

import { Layers } from 'lucide-react'

const N = {
  base:    '#dfeaff',
  dark:    '#bec8de',
  light:   '#ffffff',
  accent:  '#6888ff',
  text:    '#69738c',
  textSub: '#9aa3b8',
}

export default function PropuestasPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: N.base }}>
      <div className="max-w-md w-full p-8 rounded-3xl text-center" style={{ background: N.base, boxShadow: `8px 8px 16px ${N.dark},-8px -8px 16px ${N.light}` }}>
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6" style={{ background: N.base, boxShadow: `4px 4px 8px ${N.dark},-4px -4px 8px ${N.light}` }}>
          <Layers className="w-8 h-8" style={{ color: N.accent }} />
        </div>
        <h1 className="text-xl font-black mb-2" style={{ color: N.text }}>Propuestas</h1>
        <p className="text-sm mb-6" style={{ color: N.textSub }}>
          Módulo en desarrollo. Aquí podrás gestionar propuestas comerciales, cotizaciones y presentaciones para clientes.
        </p>
        <div className="px-4 py-3 rounded-2xl text-xs font-semibold" style={{ background: N.base, boxShadow: `inset 3px 3px 6px ${N.dark},inset -3px -3px 6px ${N.light}`, color: N.accent }}>
          ● En construcción — TIER 1
        </div>
      </div>
    </div>
  )
}
