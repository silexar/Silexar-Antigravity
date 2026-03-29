"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default function HistorialPage() {
  const [campaniaId, setCampaniaId] = useState('CAM-2025-0001')
  const [accion, setAccion] = useState<string>('')
  const [usuario, setUsuario] = useState('')
  const [items, setItems] = useState<any[]>([])
  const [expandedId, setExpandedId] = useState<string | null>(null)

  async function cargar() {
    const p = new URLSearchParams()
    if (accion) p.set('accion', accion)
    if (usuario) p.set('usuario', usuario)
    const r = await fetch(`/api/campanas/${campaniaId}/historial?${p.toString()}`)
    const j = await r.json()
    setItems(j.items || [])
  }

  useEffect(() => { cargar() }, [])

  return (
    <div className="container mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-semibold">Historial y Audit Trail</h1>
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-2 flex-wrap">
          <Input placeholder="Campaña ID" value={campaniaId} onChange={e=>setCampaniaId(e.target.value)} className="w-60" />
          <Input placeholder="Usuario" value={usuario} onChange={e=>setUsuario(e.target.value)} className="w-60" />
          <Select value={accion} onValueChange={setAccion}>
            <SelectTrigger className="w-60"><SelectValue placeholder="Acción"/></SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todas</SelectItem>
              <SelectItem value="CREAR">CREAR</SelectItem>
              <SelectItem value="EDITAR">EDITAR</SelectItem>
              <SelectItem value="PROGRAMAR">PROGRAMAR</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={cargar}>Aplicar</Button>
          <a
            className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground"
            href={`/api/campanas/${campaniaId}/historial/export`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Exportar CSV
          </a>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Eventos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {items.map(it => (
              <div key={it.id} className="p-3 border rounded">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-sm font-medium">{it.accion} - {it.detalle}</div>
                    <div className="text-xs text-slate-500">{new Date(it.fecha).toLocaleString()} • {it.usuario} • {it.ip}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-xs text-slate-500">{it.campaniaId}</div>
                    <Button size="sm" variant="outline" onClick={()=> setExpandedId(expandedId===it.id?null:it.id)}>
                      {expandedId===it.id ? 'Ocultar' : 'Detalle'}
                    </Button>
                  </div>
                </div>
                {expandedId===it.id && (
                  <div className="mt-3 text-xs text-slate-600">
                    <div>ID Evento: {it.id}</div>
                    <div>Usuario: {it.usuario}</div>
                    <div>IP: {it.ip}</div>
                    <div>Payload: {JSON.stringify(it, null, 2)}</div>
                  </div>
                )}
              </div>
            ))}
            {items.length === 0 && <div className="text-sm text-slate-500">Sin eventos</div>}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
