'use client'

import { useRouter } from 'next/navigation'
import { Mic2, ArrowLeft } from 'lucide-react'
import { ModuleNavMenu } from '@/components/module-nav-menu'

const N = {
  base:    '#dfeaff',
  dark:    '#bec8de',
  light:   '#ffffff',
  accent:  '#6888ff',
  text:    '#69738c',
  textSub: '#9aa3b8',
}

export default function MencionesPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen p-6 lg:p-8" style={{ background: N.base }}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/dashboard')} className="p-2.5 rounded-xl transition-all"
            style={{ background: N.base, boxShadow: `4px 4px 8px ${N.dark},-4px -4px 8px ${N.light}`, color: N.textSub }}>
            <ArrowLeft className="w-4 h-4" />
          </button>
          <ModuleNavMenu />
          <h1 className="text-2xl font-black tracking-tight flex items-center gap-2" style={{ color: N.text }}>
            <Mic2 className="w-6 h-6" style={{ color: N.accent }} />
            Menciones
          </h1>
        </div>

        <div className="max-w-md w-full p-8 rounded-3xl text-center mx-auto" style={{ background: N.base, boxShadow: `8px 8px 16px ${N.dark},-8px -8px 16px ${N.light}` }}>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6" style={{ background: N.base, boxShadow: `4px 4px 8px ${N.dark},-4px -4px 8px ${N.light}` }}>
            <Mic2 className="w-8 h-8" style={{ color: N.accent }} />
          </div>
          <h2 className="text-xl font-black mb-2" style={{ color: N.text }}>Menciones</h2>
          <p className="text-sm mb-6" style={{ color: N.textSub }}>
            Módulo en desarrollo. Aquí podrás gestionar menciones publicitarias, patrocinios y referencias en cuñas y campañas.
          </p>
          <div className="px-4 py-3 rounded-2xl text-xs font-semibold" style={{ background: N.base, boxShadow: `inset 3px 3px 6px ${N.dark},inset -3px -3px 6px ${N.light}`, color: N.accent }}>
            ● En construcción — TIER 1
          </div>
        </div>
      </div>
    </div>
  )
}
