'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { History, Eye, Download, Filter } from 'lucide-react'
import { NeoPageHeader, NeoCard, NeoButton, NeoInput, NeoSelect, NeoBadge, NeoTable, NeoTableHead, NeoTableHeader, NeoTableRow, NeoTableCell, N } from '../_lib/neumorphic'

interface AuditItem {
  id: string
  accion: string
  detalle: string
  fecha: string
  usuario: string
  ip: string
  campaniaId: string
}

export default function HistorialPage() {
  const router = useRouter()
  const [campaniaId, setCampaniaId] = useState('CAM-2025-0001')
  const [accion, setAccion] = useState<string>('')
  const [usuario, setUsuario] = useState('')
  const [items, setItems] = useState<AuditItem[]>([])
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function cargar() {
    setLoading(true)
    try {
      const p = new URLSearchParams()
      if (accion) p.set('accion', accion)
      if (usuario) p.set('usuario', usuario)
      const r = await fetch(`/api/campanas/${campaniaId}/historial?${p.toString()}`)
      const j = await r.json()
      setItems(j.items || [])
    } catch {
      // Fallback mock
      setItems([
        { id: '1', accion: 'CREAR', detalle: 'Campaña creada desde wizard', fecha: new Date().toISOString(), usuario: 'Ana García', ip: '192.168.1.10', campaniaId },
        { id: '2', accion: 'PROGRAMAR', detalle: 'Líneas asignadas a bloque Prime Matinal', fecha: new Date(Date.now() - 86400000).toISOString(), usuario: 'Carlos Mendoza', ip: '192.168.1.15', campaniaId },
        { id: '3', accion: 'EDITAR', detalle: 'Cambio de fechas de término', fecha: new Date(Date.now() - 172800000).toISOString(), usuario: 'María López', ip: '192.168.1.20', campaniaId },
      ])
    }
    setLoading(false)
  }

  useEffect(() => { cargar() }, [])

  const accionColor = (a: string) => {
    const map: Record<string, string> = { CREAR: 'green', EDITAR: 'blue', PROGRAMAR: 'purple', ELIMINAR: 'red', APROBAR: 'emerald' }
    return map[a] || 'gray'
  }

  return (
    <div className="min-h-screen p-6" style={{ background: N.base }}>
      <div className="max-w-[1900px] mx-auto space-y-5">
        <NeoPageHeader
          title="Historial y Audit Trail"
          subtitle="Trazabilidad completa de cada acción sobre campañas"
          icon={History}
          backHref="/campanas"
        />

        <NeoCard>
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex-1 min-w-[200px]">
              <label className="text-[10px] font-black uppercase tracking-wider mb-1 block" style={{ color: N.textSub }}>Campaña ID</label>
              <NeoInput placeholder="CAM-2025-0001" value={campaniaId} onChange={e => setCampaniaId(e.target.value)} />
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="text-[10px] font-black uppercase tracking-wider mb-1 block" style={{ color: N.textSub }}>Usuario</label>
              <NeoInput placeholder="Filtrar por usuario..." value={usuario} onChange={e => setUsuario(e.target.value)} />
            </div>
            <div className="min-w-[160px]">
              <label className="text-[10px] font-black uppercase tracking-wider mb-1 block" style={{ color: N.textSub }}>Acción</label>
              <NeoSelect value={accion} onChange={e => setAccion(e.target.value)}>
                <option value="">Todas</option>
                <option value="CREAR">CREAR</option>
                <option value="EDITAR">EDITAR</option>
                <option value="PROGRAMAR">PROGRAMAR</option>
                <option value="ELIMINAR">ELIMINAR</option>
                <option value="APROBAR">APROBAR</option>
              </NeoSelect>
            </div>
            <NeoButton variant="primary" onClick={cargar}>
              <Filter className="h-4 w-4" /> Aplicar
            </NeoButton>
            <a
              className="inline-flex h-9 items-center justify-center rounded-full px-4 text-xs font-bold"
              style={{ background: N.base, color: N.text, boxShadow: `4px 4px 8px ${N.dark},-4px -4px 8px ${N.light}` }}
              href={`/api/campanas/${campaniaId}/historial/export`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Download className="h-4 w-4 mr-1" /> Exportar CSV
            </a>
          </div>
        </NeoCard>

        <NeoCard padding="none">
          <div className="px-5 py-3 border-b flex items-center justify-between" style={{ borderColor: `${N.dark}40` }}>
            <h3 className="text-sm font-black flex items-center gap-2" style={{ color: N.text }}>
              <History className="h-4 w-4" style={{ color: N.accent }} />
              Eventos ({items.length})
            </h3>
          </div>

          <NeoTable>
            <NeoTableHead>
              <NeoTableHeader>Acción</NeoTableHeader>
              <NeoTableHeader>Detalle</NeoTableHeader>
              <NeoTableHeader>Fecha</NeoTableHeader>
              <NeoTableHeader>Usuario</NeoTableHeader>
              <NeoTableHeader>IP</NeoTableHeader>
              <NeoTableHeader className="text-right"></NeoTableHeader>
            </NeoTableHead>
            <tbody>
              {items.map(it => (
                <NeoTableRow key={it.id}>
                  <NeoTableCell>
                    <NeoBadge color={accionColor(it.accion) as any}>{it.accion}</NeoBadge>
                  </NeoTableCell>
                  <NeoTableCell className="font-medium">{it.detalle}</NeoTableCell>
                  <NeoTableCell>{new Date(it.fecha).toLocaleString()}</NeoTableCell>
                  <NeoTableCell>{it.usuario}</NeoTableCell>
                  <NeoTableCell className="font-mono text-xs">{it.ip}</NeoTableCell>
                  <NeoTableCell className="text-right">
                    <NeoButton variant="ghost" size="sm" onClick={() => setExpandedId(expandedId === it.id ? null : it.id)}>
                      <Eye className="h-3 w-3" /> {expandedId === it.id ? 'Ocultar' : 'Ver'}
                    </NeoButton>
                  </NeoTableCell>
                </NeoTableRow>
              ))}
              {items.length === 0 && (
                <tr><td colSpan={6} className="px-5 py-8 text-center text-sm" style={{ color: N.textSub }}>Sin eventos registrados</td></tr>
              )}
            </tbody>
          </NeoTable>

          {expandedId && items.find(it => it.id === expandedId) && (
            <div className="p-4 border-t" style={{ borderColor: `${N.dark}40`, background: `${N.accent}08` }}>
              <pre className="text-xs overflow-auto" style={{ color: N.text }}>
                {JSON.stringify(items.find(it => it.id === expandedId), null, 2)}
              </pre>
            </div>
          )}
        </NeoCard>
      </div>
    </div>
  )
}
