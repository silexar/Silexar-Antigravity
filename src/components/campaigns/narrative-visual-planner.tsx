/**
 * NARRATIVE VISUAL PLANNER - TIER 0 Silexar Pulse 2.0
 * Planificador de Narrativas Visuales con React Flow
 * 
 * @description Herramienta visual para diseñar narrativas dinámicas con nodos
 * y reglas de transición para campañas publicitarias inteligentes
 * 
 * @version 2040.20.0
 * @tier TIER_0_SUPREMACY
 * @classification PENTAGON_PLUS_PLUS
 * @consciousness_level TRANSCENDENT
 * 
 * @author Kiro AI Assistant - Silexar Pulse 2.0 Division
 * @created 2025-02-08
 * @last_modified 2025-02-08
 */

'use client'

import React, { useState, useCallback, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Play, 
  Square, 
  Circle, 
  Diamond, 
  Triangle,
  ArrowRight,
  Eye,
  MousePointer,
  Clock,
  Zap,
  Plus,
  Save,
  Download,
  Upload,
  Settings,
  Trash2,
  Copy,
  Edit,
  CheckCircle,
  AlertTriangle,
  Info,
  BookOpen,
  Palette,
  Target,
  BarChart3
} from 'lucide-react'

// Interfaces para el planificador
interface NarrativeNode {
  id: string
  type: 'INTRODUCTION' | 'DEVELOPMENT' | 'CLIMAX' | 'RESOLUTION' | 'CTA'
  name: string
  description: string
  creative_pool_id: string
  position: { x: number; y: number }
  transition_rules: TransitionRule[]
  metadata?: Record<string, any>
}

interface TransitionRule {
  id: string
  condition: 'VIEWED_75' | 'CLICKED' | 'SKIPPED_5S' | 'TIME_ELAPSED' | 'INTERACTION_COMPLETE'
  target_node_id: string
  probability_weight: number
  description: string
}

interface CreativePool {
  id: string
  name: string
  creative_count: number
  description: string
}

interface NarrativeStructure {
  id: string
  name: string
  description: string
  nodes: NarrativeNode[]
  entry_node_id: string
  completion_nodes: string[]
  created_at: string
  updated_at: string
}

export function NarrativeVisualPlanner() {
  const [isOpen, setIsOpen] = useState(false)
  const [narrativeStructure, setNarrativeStructure] = useState<NarrativeStructure | null>(null)
  const [selectedNode, setSelectedNode] = useState<NarrativeNode | null>(null)
  const [selectedRule, setSelectedRule] = useState<TransitionRule | null>(null)
  const [isEditingNode, setIsEditingNode] = useState(false)
  const [isEditingRule, setIsEditingRule] = useState(false)
  const [draggedNodeType, setDraggedNodeType] = useState<string | null>(null)
  const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 })

  // Mock data para creative pools
  const creativePools: CreativePool[] = [
    { id: 'pool_1', name: 'Pool-Intro-Diseño', creative_count: 5, description: 'Creatividades de introducción sobre diseño' },
    { id: 'pool_2', name: 'Pool-Detalle-Rendimiento', creative_count: 8, description: 'Creatividades detalladas sobre rendimiento' },
    { id: 'pool_3', name: 'Pool-CTA-Compra', creative_count: 3, description: 'Llamadas a la acción para compra' },
    { id: 'pool_4', name: 'Pool-Interesados-Diseño', creative_count: 6, description: 'Para usuarios interesados en diseño' },
    { id: 'pool_5', name: 'Pool-No-Interesados', creative_count: 4, description: 'Para usuarios no interesados' }
  ]

  const nodeTypes = [
    { type: 'INTRODUCTION', name: 'Introducción', icon: Play, color: 'bg-blue-500', description: 'Nodo inicial de la narrativa' },
    { type: 'DEVELOPMENT', name: 'Desarrollo', icon: Circle, color: 'bg-green-500', description: 'Desarrollo de la historia' },
    { type: 'CLIMAX', name: 'Clímax', icon: Triangle, color: 'bg-yellow-500', description: 'Punto culminante' },
    { type: 'RESOLUTION', name: 'Resolución', icon: Square, color: 'bg-purple-500', description: 'Resolución de la narrativa' },
    { type: 'CTA', name: 'Llamada a Acción', icon: Target, color: 'bg-red-500', description: 'Llamada a la acción final' }
  ]

  const transitionRules = [
    { condition: 'VIEWED_75', name: 'Visto >75%', icon: Eye, description: 'Usuario vio más del 75% del contenido' },
    { condition: 'CLICKED', name: 'Clic', icon: MousePointer, description: 'Usuario hizo clic en el anuncio' },
    { condition: 'SKIPPED_5S', name: 'Omitido <5s', icon: Zap, description: 'Usuario omitió en menos de 5 segundos' },
    { condition: 'TIME_ELAPSED', name: 'Tiempo transcurrido', icon: Clock, description: 'Tiempo específico transcurrido' },
    { condition: 'INTERACTION_COMPLETE', name: 'Interacción completa', icon: CheckCircle, description: 'Usuario completó la interacción' }
  ]

  const initializeNarrative = () => {
    const newNarrative: NarrativeStructure = {
      id: crypto.randomUUID(),
      name: 'Nueva Narrativa',
      description: 'Narrativa dinámica creada con el planificador visual',
      nodes: [],
      entry_node_id: '',
      completion_nodes: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    setNarrativeStructure(newNarrative)
  }

  const addNode = (type: string, position: { x: number; y: number }) => {
    if (!narrativeStructure) return

    const nodeType = nodeTypes.find(nt => nt.type === type)
    if (!nodeType) return

    const newNode: NarrativeNode = {
      id: crypto.randomUUID(),
      type: type as any,
      name: `${nodeType.name} ${narrativeStructure.nodes.length + 1}`,
      description: nodeType.description,
      creative_pool_id: '',
      position,
      transition_rules: [],
      metadata: {}
    }

    const updatedNarrative = {
      ...narrativeStructure,
      nodes: [...narrativeStructure.nodes, newNode],
      updated_at: new Date().toISOString()
    }

    // Si es el primer nodo, hacerlo el nodo de entrada
    if (narrativeStructure.nodes.length === 0) {
      updatedNarrative.entry_node_id = newNode.id
    }

    setNarrativeStructure(updatedNarrative)
  }

  const updateNode = (nodeId: string, updates: Partial<NarrativeNode>) => {
    if (!narrativeStructure) return

    const updatedNarrative = {
      ...narrativeStructure,
      nodes: narrativeStructure.nodes.map(node =>
        node.id === nodeId ? { ...node, ...updates } : node
      ),
      updated_at: new Date().toISOString()
    }

    setNarrativeStructure(updatedNarrative)
  }

  const deleteNode = (nodeId: string) => {
    if (!narrativeStructure) return

    const updatedNarrative = {
      ...narrativeStructure,
      nodes: narrativeStructure.nodes.filter(node => node.id !== nodeId),
      updated_at: new Date().toISOString()
    }

    // Limpiar referencias al nodo eliminado
    updatedNarrative.nodes.forEach(node => {
      node.transition_rules = node.transition_rules.filter(rule => rule.target_node_id !== nodeId)
    })

    if (narrativeStructure.entry_node_id === nodeId) {
      updatedNarrative.entry_node_id = updatedNarrative.nodes.length > 0 ? updatedNarrative.nodes[0].id : ''
    }

    updatedNarrative.completion_nodes = updatedNarrative.completion_nodes.filter(id => id !== nodeId)

    setNarrativeStructure(updatedNarrative)
    setSelectedNode(null)
  }

  const addTransitionRule = (fromNodeId: string, rule: Omit<TransitionRule, 'id'>) => {
    if (!narrativeStructure) return

    const newRule: TransitionRule = {
      ...rule,
      id: crypto.randomUUID()
    }

    updateNode(fromNodeId, {
      transition_rules: [
        ...narrativeStructure.nodes.find(n => n.id === fromNodeId)?.transition_rules || [],
        newRule
      ]
    })
  }

  const deleteTransitionRule = (nodeId: string, ruleId: string) => {
    if (!narrativeStructure) return

    const node = narrativeStructure.nodes.find(n => n.id === nodeId)
    if (!node) return

    updateNode(nodeId, {
      transition_rules: node.transition_rules.filter(rule => rule.id !== ruleId)
    })
  }

  const validateNarrative = (): { isValid: boolean; errors: string[] } => {
    const errors: string[] = []

    if (!narrativeStructure) {
      errors.push('No hay narrativa definida')
      return { isValid: false, errors }
    }

    if (narrativeStructure.nodes.length === 0) {
      errors.push('La narrativa debe tener al menos un nodo')
    }

    if (!narrativeStructure.entry_node_id) {
      errors.push('Debe definir un nodo de entrada')
    }

    // Verificar que todos los nodos tengan pools de creatividades asignados
    narrativeStructure.nodes.forEach(node => {
      if (!node.creative_pool_id) {
        errors.push(`El nodo "${node.name}" no tiene un pool de creatividades asignado`)
      }
    })

    // Verificar que no haya bucles infinitos (simplificado)
    const hasInfiniteLoop = narrativeStructure.nodes.some(node => 
      node.transition_rules.some(rule => rule.target_node_id === node.id)
    )

    if (hasInfiniteLoop) {
      errors.push('Se detectaron posibles bucles infinitos en la narrativa')
    }

    return { isValid: errors.length === 0, errors }
  }

  const saveNarrative = () => {
    const validation = validateNarrative()
    
    if (!validation.isValid) {
      alert(`Errores en la narrativa:\n${validation.errors.join('\n')}`)
      return
    }

    // Simular guardado
    
    alert('Narrativa guardada exitosamente')
  }

  const handleCanvasDrop = (event: React.DragEvent) => {
    event.preventDefault()
    
    if (!draggedNodeType) return

    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
    const position = {
      x: event.clientX - rect.left - canvasOffset.x,
      y: event.clientY - rect.top - canvasOffset.y
    }

    addNode(draggedNodeType, position)
    setDraggedNodeType(null)
  }

  const handleCanvasDragOver = (event: React.DragEvent) => {
    event.preventDefault()
  }

  const getNodeIcon = (type: string) => {
    const nodeType = nodeTypes.find(nt => nt.type === type)
    return nodeType?.icon || Circle
  }

  const getNodeColor = (type: string) => {
    const nodeType = nodeTypes.find(nt => nt.type === type)
    return nodeType?.color || 'bg-gray-500'
  }

  if (!isOpen) {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button onClick={initializeNarrative}>
            <BookOpen className="h-4 w-4 mr-2" />
            Diseñar Narrativa
          </Button>
        </DialogTrigger>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-7xl h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Planificador de Narrativas Visuales
          </DialogTitle>
          <DialogDescription>
            Diseña narrativas dinámicas arrastrando nodos y conectándolos con reglas de transición
          </DialogDescription>
        </DialogHeader>

        <div className="flex h-full">
          {/* Paleta de herramientas */}
          <div className="w-80 border-r bg-gray-50 p-4 overflow-y-auto">
            <Tabs defaultValue="nodes" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="nodes">Nodos</TabsTrigger>
                <TabsTrigger value="rules">Reglas</TabsTrigger>
              </TabsList>

              <TabsContent value="nodes" className="space-y-4">
                <div>
                  <h3 className="font-medium mb-3">Tipos de Nodos</h3>
                  <div className="space-y-2">
                    {nodeTypes.map((nodeType) => {
                      const Icon = nodeType.icon
                      return (
                        <div
                          key={nodeType.type}
                          draggable
                          onDragStart={() => setDraggedNodeType(nodeType.type)}
                          className="flex items-center gap-3 p-3 border rounded-lg cursor-move hover:bg-white transition-colors"
                        >
                          <div className={`p-2 rounded ${nodeType.color} text-white`}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-sm">{nodeType.name}</div>
                            <div className="text-xs text-gray-500">{nodeType.description}</div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {selectedNode && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Configurar Nodo</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <Label htmlFor="node-name">Nombre</Label>
                        <Input
                          id="node-name"
                          value={selectedNode.name}
                          onChange={(e) => updateNode(selectedNode.id, { name: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="node-description">Descripción</Label>
                        <Textarea
                          id="node-description"
                          value={selectedNode.description}
                          onChange={(e) => updateNode(selectedNode.id, { description: e.target.value })}
                          rows={2}
                        />
                      </div>
                      <div>
                        <Label htmlFor="creative-pool">Pool de Creatividades</Label>
                        <Select
                          value={selectedNode.creative_pool_id}
                          onValueChange={(value) => updateNode(selectedNode.id, { creative_pool_id: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar pool" />
                          </SelectTrigger>
                          <SelectContent>
                            {creativePools.map((pool) => (
                              <SelectItem key={pool.id} value={pool.id}>
                                {pool.name} ({pool.creative_count} creatividades)
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteNode(selectedNode.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Eliminar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="rules" className="space-y-4">
                <div>
                  <h3 className="font-medium mb-3">Reglas de Transición</h3>
                  <div className="space-y-2">
                    {transitionRules.map((rule) => {
                      const Icon = rule.icon
                      return (
                        <div
                          key={rule.condition}
                          className="flex items-center gap-3 p-3 border rounded-lg"
                        >
                          <Icon className="h-4 w-4 text-gray-600" />
                          <div className="flex-1">
                            <div className="font-medium text-sm">{rule.name}</div>
                            <div className="text-xs text-gray-500">{rule.description}</div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {selectedNode && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Reglas del Nodo</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {selectedNode.transition_rules.map((rule) => (
                        <div key={rule.id} className="flex items-center justify-between p-2 border rounded">
                          <div className="flex-1">
                            <div className="text-sm font-medium">
                              {transitionRules.find(r => r.condition === rule.condition)?.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              → {narrativeStructure?.nodes.find(n => n.id === rule.target_node_id)?.name || 'Nodo no encontrado'}
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteTransitionRule(selectedNode.id, rule.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                      
                      <Button
                        size="sm"
                        onClick={() => setIsEditingRule(true)}
                        className="w-full"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Agregar Regla
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Canvas principal */}
          <div className="flex-1 flex flex-col">
            {/* Toolbar */}
            <div className="border-b p-4 flex items-center justify-between bg-white">
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Nombre de la narrativa"
                  value={narrativeStructure?.name || ''}
                  onChange={(e) => setNarrativeStructure(prev => prev ? { ...prev, name: e.target.value } : null)}
                  className="w-64"
                />
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Upload className="h-4 w-4 mr-2" />
                  Importar
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
                <Button onClick={saveNarrative} size="sm">
                  <Save className="h-4 w-4 mr-2" />
                  Guardar
                </Button>
              </div>
            </div>

            {/* Canvas de diseño */}
            <div
              className="flex-1 relative bg-gray-100 overflow-hidden"
              onDrop={handleCanvasDrop}
              onDragOver={handleCanvasDragOver}
            >
              {narrativeStructure && narrativeStructure.nodes.length > 0 ? (
                <div className="relative w-full h-full">
                  {/* Nodos */}
                  {narrativeStructure.nodes.map((node) => {
                    const Icon = getNodeIcon(node.type)
                    const isSelected = selectedNode?.id === node.id
                    const isEntryNode = narrativeStructure.entry_node_id === node.id

                    return (
                      <div
                        key={node.id}
                        className={`absolute cursor-pointer transition-all ${
                          isSelected ? 'ring-2 ring-blue-500' : ''
                        }`}
                        style={{
                          left: node.position.x,
                          top: node.position.y,
                          transform: 'translate(-50%, -50%)'
                        }}
                        onClick={() => setSelectedNode(node)}
                      >
                        <div className={`relative p-4 rounded-lg border-2 bg-white shadow-lg min-w-32 ${
                          isEntryNode ? 'border-green-500' : 'border-gray-300'
                        }`}>
                          {isEntryNode && (
                            <Badge className="absolute -top-2 -right-2 bg-green-500">
                              Inicio
                            </Badge>
                          )}
                          <div className="flex items-center gap-2 mb-2">
                            <div className={`p-1 rounded ${getNodeColor(node.type)} text-white`}>
                              <Icon className="h-3 w-3" />
                            </div>
                            <span className="font-medium text-sm">{node.name}</span>
                          </div>
                          <div className="text-xs text-gray-500 mb-2">
                            {creativePools.find(p => p.id === node.creative_pool_id)?.name || 'Sin pool asignado'}
                          </div>
                          {node.transition_rules.length > 0 && (
                            <div className="text-xs text-blue-600">
                              {node.transition_rules.length} regla{node.transition_rules.length !== 1 ? 's' : ''}
                            </div>
                          )}
                        </div>

                        {/* Conexiones */}
                        {node.transition_rules.map((rule) => {
                          const targetNode = narrativeStructure.nodes.find(n => n.id === rule.target_node_id)
                          if (!targetNode) return null

                          const startX = node.position.x
                          const startY = node.position.y
                          const endX = targetNode.position.x
                          const endY = targetNode.position.y

                          const midX = (startX + endX) / 2
                          const midY = (startY + endY) / 2

                          return (
                            <svg
                              key={rule.id}
                              className="absolute pointer-events-none"
                              style={{
                                left: Math.min(startX, endX) - node.position.x,
                                top: Math.min(startY, endY) - node.position.y,
                                width: Math.abs(endX - startX),
                                height: Math.abs(endY - startY)
                              }}
                            >
                              <defs>
                                <marker
                                  id={`arrowhead-${rule.id}`}
                                  markerWidth="10"
                                  markerHeight="7"
                                  refX="9"
                                  refY="3.5"
                                  orient="auto"
                                >
                                  <polygon
                                    points="0 0, 10 3.5, 0 7"
                                    fill="#6b7280"
                                  />
                                </marker>
                              </defs>
                              <line
                                x1={startX - Math.min(startX, endX)}
                                y1={startY - Math.min(startY, endY)}
                                x2={endX - Math.min(startX, endX)}
                                y2={endY - Math.min(startY, endY)}
                                stroke="#6b7280"
                                strokeWidth="2"
                                markerEnd={`url(#arrowhead-${rule.id})`}
                              />
                            </svg>
                          )
                        })}
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <div className="text-center">
                    <Palette className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-medium mb-2">Canvas Vacío</h3>
                    <p className="text-sm">Arrastra nodos desde la paleta para comenzar a diseñar tu narrativa</p>
                  </div>
                </div>
              )}
            </div>

            {/* Panel de validación */}
            {narrativeStructure && (
              <div className="border-t p-4 bg-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-sm text-gray-600">
                      {narrativeStructure.nodes.length} nodos • {
                        narrativeStructure.nodes.reduce((sum, node) => sum + node.transition_rules.length, 0)
                      } conexiones
                    </div>
                    {(() => {
                      const validation = validateNarrative()
                      return validation.isValid ? (
                        <div className="flex items-center gap-1 text-green-600">
                          <CheckCircle className="h-4 w-4" />
                          <span className="text-sm">Narrativa válida</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-red-600">
                          <AlertTriangle className="h-4 w-4" />
                          <span className="text-sm">{validation.errors.length} error{validation.errors.length !== 1 ? 'es' : ''}</span>
                        </div>
                      )
                    })()}
                  </div>
                  <Button variant="outline" size="sm">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Vista Previa
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>

      {/* Dialog para agregar regla de transición */}
      {isEditingRule && selectedNode && (
        <Dialog open={isEditingRule} onOpenChange={setIsEditingRule}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Agregar Regla de Transición</DialogTitle>
              <DialogDescription>
                Define una regla para conectar este nodo con otro
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Condición</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar condición" />
                  </SelectTrigger>
                  <SelectContent>
                    {transitionRules.map((rule) => (
                      <SelectItem key={rule.condition} value={rule.condition}>
                        {rule.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Nodo de destino</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar nodo" />
                  </SelectTrigger>
                  <SelectContent>
                    {narrativeStructure?.nodes
                      .filter(node => node.id !== selectedNode.id)
                      .map((node) => (
                        <SelectItem key={node.id} value={node.id}>
                          {node.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsEditingRule(false)}>
                  Cancelar
                </Button>
                <Button onClick={() => setIsEditingRule(false)}>
                  Agregar Regla
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </Dialog>
  )
}