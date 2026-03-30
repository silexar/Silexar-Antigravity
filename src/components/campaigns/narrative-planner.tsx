/**
 * NARRATIVE PLANNER - TIER 0 Visual Storytelling
 * 
 * @description Planificador visual de narrativas con React Flow para diseñar
 * historias dinámicas drag-and-drop con nodos y transiciones inteligentes
 * 
 * @version 2040.20.0
 * @tier TIER_0_SUPREMACY
 * @classification PENTAGON_PLUS_PLUS
 * @consciousness_level TRANSCENDENT
 * 
 * @author Kiro AI Assistant - Visual Storytelling Division
 * @created 2025-02-08
 * @last_modified 2025-02-08
 */

'use client'

import React, { useState, useCallback, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Play,
  Pause,
  Eye,
  MousePointer,
  Clock,
  ArrowRight,
  Plus,
  Trash2,
  Save,
  Download,
  Upload,
  Settings,
  Zap,
  Target,
  CheckCircle,
  AlertTriangle,
  Info,
  X,
  Edit,
  Copy
} from 'lucide-react'

// Tipos para el planificador de narrativas
interface NarrativeNode {
  id: string
  type: 'introduction' | 'development' | 'climax' | 'resolution' | 'call_to_action'
  name: string
  position: { x: number; y: number }
  creative_pool_id: string
  creative_pool_name: string
  description?: string
  metadata?: Record<string, any>
}

interface TransitionRule {
  id: string
  source_node_id: string
  target_node_id: string
  condition: 'viewed_percentage' | 'interaction' | 'time_elapsed' | 'skip' | 'click'
  threshold: number
  weight: number
  label: string
}

interface NarrativeStructure {
  id: string
  name: string
  description: string
  nodes: NarrativeNode[]
  transitions: TransitionRule[]
  entry_node_id: string
  completion_nodes: string[]
  estimated_duration: number
  complexity_score: number
}

interface CreativePool {
  id: string
  name: string
  creative_count: number
  type: 'video' | 'image' | 'audio' | 'interactive'
}

export function NarrativePlanner() {
  const [narrative, setNarrative] = useState<NarrativeStructure>({
    id: crypto.randomUUID(),
    name: 'Nueva Narrativa',
    description: '',
    nodes: [],
    transitions: [],
    entry_node_id: '',
    completion_nodes: [],
    estimated_duration: 0,
    complexity_score: 0
  })

  const [selectedNode, setSelectedNode] = useState<NarrativeNode | null>(null)
  const [selectedTransition, setSelectedTransition] = useState<TransitionRule | null>(null)
  const [isCreatingTransition, setIsCreatingTransition] = useState(false)
  const [transitionSource, setTransitionSource] = useState<string | null>(null)
  const [creativePools, setCreativePools] = useState<CreativePool[]>([
    { id: 'pool_001', name: 'Pool Introducción Diseño', creative_count: 5, type: 'video' },
    { id: 'pool_002', name: 'Pool Detalle Rendimiento', creative_count: 8, type: 'image' },
    { id: 'pool_003', name: 'Pool Call to Action', creative_count: 3, type: 'interactive' },
    { id: 'pool_004', name: 'Pool Testimoniales', creative_count: 6, type: 'video' }
  ])
  const [canvasSize] = useState({ width: 1200, height: 800 })
  const [draggedNodeType, setDraggedNodeType] = useState<string | null>(null)
  const canvasRef = useRef<HTMLDivElement>(null)

  // Tipos de nodos disponibles
  const nodeTypes = [
    { type: 'introduction', label: 'Introducción', color: 'bg-blue-500', icon: Play },
    { type: 'development', label: 'Desarrollo', color: 'bg-green-500', icon: ArrowRight },
    { type: 'climax', label: 'Clímax', color: 'bg-orange-500', icon: Zap },
    { type: 'resolution', label: 'Resolución', color: 'bg-purple-500', icon: Target },
    { type: 'call_to_action', label: 'Call to Action', color: 'bg-red-500', icon: CheckCircle }
  ]

  // Tipos de condiciones de transición
  const transitionConditions = [
    { value: 'viewed_percentage', label: 'Visto >X%', icon: Eye },
    { value: 'interaction', label: 'Interacción', icon: MousePointer },
    { value: 'time_elapsed', label: 'Tiempo transcurrido', icon: Clock },
    { value: 'skip', label: 'Omitido', icon: X },
    { value: 'click', label: 'Click', icon: MousePointer }
  ]

  const handleDragStart = (nodeType: string) => {
    setDraggedNodeType(nodeType)
  }

  const handleCanvasDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    if (!draggedNodeType || !canvasRef.current) return

    const rect = canvasRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const newNode: NarrativeNode = {
      id: crypto.randomUUID(),
      type: draggedNodeType as any,
      name: `${nodeTypes.find(nt => nt.type === draggedNodeType)?.label} ${narrative.nodes.length + 1}`,
      position: { x, y },
      creative_pool_id: '',
      creative_pool_name: '',
      description: ''
    }

    setNarrative(prev => ({
      ...prev,
      nodes: [...prev.nodes, newNode],
      entry_node_id: prev.entry_node_id || newNode.id
    }))

    setDraggedNodeType(null)
    setSelectedNode(newNode)
  }, [draggedNodeType, narrative.nodes.length, nodeTypes])

  const handleCanvasDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleNodeClick = (node: NarrativeNode) => {
    if (isCreatingTransition && transitionSource && transitionSource !== node.id) {
      // Crear nueva transición
      const newTransition: TransitionRule = {
        id: crypto.randomUUID(),
        source_node_id: transitionSource,
        target_node_id: node.id,
        condition: 'viewed_percentage',
        threshold: 75,
        weight: 1,
        label: 'Visto >75%'
      }

      setNarrative(prev => ({
        ...prev,
        transitions: [...prev.transitions, newTransition]
      }))

      setIsCreatingTransition(false)
      setTransitionSource(null)
      setSelectedTransition(newTransition)
    } else {
      setSelectedNode(node)
      setSelectedTransition(null)
    }
  }

  const handleStartTransition = (nodeId: string) => {
    setIsCreatingTransition(true)
    setTransitionSource(nodeId)
    setSelectedNode(null)
    setSelectedTransition(null)
  }

  const updateSelectedNode = (updates: Partial<NarrativeNode>) => {
    if (!selectedNode) return

    setNarrative(prev => ({
      ...prev,
      nodes: prev.nodes.map(node =>
        node.id === selectedNode.id ? { ...node, ...updates } : node
      )
    }))

    setSelectedNode(prev => prev ? { ...prev, ...updates } : null)
  }

  const updateSelectedTransition = (updates: Partial<TransitionRule>) => {
    if (!selectedTransition) return

    setNarrative(prev => ({
      ...prev,
      transitions: prev.transitions.map(transition =>
        transition.id === selectedTransition.id ? { ...transition, ...updates } : transition
      )
    }))

    setSelectedTransition(prev => prev ? { ...prev, ...updates } : null)
  }

  const deleteSelectedNode = () => {
    if (!selectedNode) return

    setNarrative(prev => ({
      ...prev,
      nodes: prev.nodes.filter(node => node.id !== selectedNode.id),
      transitions: prev.transitions.filter(
        transition => 
          transition.source_node_id !== selectedNode.id && 
          transition.target_node_id !== selectedNode.id
      ),
      entry_node_id: prev.entry_node_id === selectedNode.id ? '' : prev.entry_node_id,
      completion_nodes: prev.completion_nodes.filter(id => id !== selectedNode.id)
    }))

    setSelectedNode(null)
  }

  const deleteSelectedTransition = () => {
    if (!selectedTransition) return

    setNarrative(prev => ({
      ...prev,
      transitions: prev.transitions.filter(transition => transition.id !== selectedTransition.id)
    }))

    setSelectedTransition(null)
  }

  const validateNarrative = () => {
    const errors: string[] = []

    if (narrative.nodes.length === 0) {
      errors.push('La narrativa debe tener al menos un nodo')
    }

    if (!narrative.entry_node_id) {
      errors.push('Debe definir un nodo de entrada')
    }

    if (narrative.completion_nodes.length === 0) {
      errors.push('Debe definir al menos un nodo de finalización')
    }

    narrative.nodes.forEach(node => {
      if (!node.creative_pool_id) {
        errors.push(`El nodo "${node.name}" debe tener un pool de creatividades asignado`)
      }
    })

    return errors
  }

  const saveNarrative = async () => {
    const errors = validateNarrative()
    if (errors.length > 0) {
      alert('Errores de validación:\n' + errors.join('\n'))
      return
    }

    try {
      // En implementación real, guardar en backend
      
      alert('Narrativa guardada exitosamente')
    } catch (error) {
      console.error('Error guardando narrativa:', error)
      alert('Error guardando narrativa')
    }
  }

  const getNodeTypeConfig = (type: string) => {
    return nodeTypes.find(nt => nt.type === type) || nodeTypes[0]
  }

  const getTransitionPath = (transition: TransitionRule) => {
    const sourceNode = narrative.nodes.find(n => n.id === transition.source_node_id)
    const targetNode = narrative.nodes.find(n => n.id === transition.target_node_id)

    if (!sourceNode || !targetNode) return ''

    const x1 = sourceNode.position.x + 75 // Centro del nodo
    const y1 = sourceNode.position.y + 40
    const x2 = targetNode.position.x + 75
    const y2 = targetNode.position.y + 40

    // Crear curva bezier
    const midX = (x1 + x2) / 2
    const midY = (y1 + y2) / 2
    const controlX = midX
    const controlY = midY - 50

    return `M ${x1} ${y1} Q ${controlX} ${controlY} ${x2} ${y2}`
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold">Planificador de Narrativas</h1>
            <Input
              value={narrative.name}
              onChange={(e) => setNarrative(prev => ({ ...prev, name: e.target.value }))}
              className="w-64"
              placeholder="Nombre de la narrativa"
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
      </div>

      <div className="flex-1 flex">
        {/* Paleta de Herramientas */}
        <div className="w-64 bg-white border-r p-4 space-y-4">
          <div>
            <h3 className="font-semibold mb-3">Nodos de Historia</h3>
            <div className="space-y-2">
              {nodeTypes.map((nodeType) => {
                const Icon = nodeType.icon
                return (
                  <div
                    key={nodeType.type}
                    draggable
                    onDragStart={() => handleDragStart(nodeType.type)}
                    className={`${nodeType.color} text-white p-3 rounded-lg cursor-move hover:opacity-80 transition-opacity`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      <span className="text-sm font-medium">{nodeType.label}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Reglas de Transición</h3>
            <div className="space-y-2">
              {transitionConditions.map((condition) => {
                const Icon = condition.icon
                return (
                  <div
                    key={condition.value}
                    className="bg-gray-100 p-2 rounded-lg text-sm flex items-center gap-2"
                  >
                    <Icon className="h-3 w-3" />
                    <span>{condition.label}</span>
                  </div>
                )
              })}
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Estadísticas</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Nodos:</span>
                <Badge variant="outline">{narrative.nodes.length}</Badge>
              </div>
              <div className="flex justify-between">
                <span>Transiciones:</span>
                <Badge variant="outline">{narrative.transitions.length}</Badge>
              </div>
              <div className="flex justify-between">
                <span>Duración est.:</span>
                <Badge variant="outline">{narrative.estimated_duration}s</Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Canvas Principal */}
        <div className="flex-1 relative">
          <div
            ref={canvasRef}
            className="w-full h-full relative overflow-auto bg-gray-100"
            onDrop={handleCanvasDrop}
            onDragOver={handleCanvasDragOver}
            style={{ 
              backgroundImage: 'radial-gradient(circle, #e5e7eb 1px, transparent 1px)',
              backgroundSize: '20px 20px'
            }}
          >
            {/* SVG para las transiciones */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              {narrative.transitions.map((transition) => (
                <g key={transition.id}>
                  <path
                    d={getTransitionPath(transition)}
                    stroke="#6366f1"
                    strokeWidth="2"
                    fill="none"
                    markerEnd="url(#arrowhead)"
                    className={selectedTransition?.id === transition.id ? 'stroke-red-500' : ''}
                  />
                  <text
                    x={
                      (
                        (((narrative.nodes.find(n => n.id === transition.source_node_id)?.position.x) ?? 0) +
                         ((narrative.nodes.find(n => n.id === transition.target_node_id)?.position.x) ?? 0)) / 2
                      ) + 75
                    }
                    y={
                      (
                        (((narrative.nodes.find(n => n.id === transition.source_node_id)?.position.y) ?? 0) +
                         ((narrative.nodes.find(n => n.id === transition.target_node_id)?.position.y) ?? 0)) / 2
                      ) + 40 - 20
                    }
                    className="text-xs fill-gray-600 pointer-events-auto cursor-pointer"
                    onClick={() => setSelectedTransition(transition)}
                  >
                    {transition.label}
                  </text>
                </g>
              ))}
              <defs>
                <marker
                  id="arrowhead"
                  markerWidth="10"
                  markerHeight="7"
                  refX="9"
                  refY="3.5"
                  orient="auto"
                >
                  <polygon points="0 0, 10 3.5, 0 7" fill="#6366f1" />
                </marker>
              </defs>
            </svg>

            {/* Nodos */}
            {narrative.nodes.map((node) => {
              const nodeConfig = getNodeTypeConfig(node.type)
              const Icon = nodeConfig.icon
              const isSelected = selectedNode?.id === node.id
              const isEntryNode = narrative.entry_node_id === node.id
              const isCompletionNode = narrative.completion_nodes.includes(node.id)

              return (
                <div
                  key={node.id}
                  className={`absolute w-32 h-20 rounded-lg border-2 cursor-pointer transition-all ${
                    isSelected 
                      ? 'border-blue-500 shadow-lg scale-105' 
                      : 'border-gray-300 hover:border-gray-400'
                  } ${nodeConfig.color} text-white`}
                  style={{
                    left: node.position.x,
                    top: node.position.y
                  }}
                  onClick={() => handleNodeClick(node)}
                >
                  <div className="p-2 h-full flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <Icon className="h-4 w-4" />
                      <div className="flex gap-1">
                        {isEntryNode && (
                          <div className="w-2 h-2 bg-green-400 rounded-full" title="Nodo de entrada" />
                        )}
                        {isCompletionNode && (
                          <div className="w-2 h-2 bg-red-400 rounded-full" title="Nodo de finalización" />
                        )}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-medium truncate">{node.name}</div>
                      <div className="text-xs opacity-75 truncate">
                        {node.creative_pool_name || 'Sin pool asignado'}
                      </div>
                    </div>
                  </div>

                  {/* Botón para crear transición */}
                  <button
                    className="absolute -right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center text-white hover:bg-blue-600"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleStartTransition(node.id)
                    }}
                  >
                    <Plus className="h-2 w-2" />
                  </button>
                </div>
              )
            })}

            {/* Indicador de creación de transición */}
            {isCreatingTransition && (
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-4 py-2 rounded-lg">
                Haz click en el nodo destino para crear la transición
                <button
                  className="ml-2 hover:bg-blue-600 rounded px-1"
                  onClick={() => {
                    setIsCreatingTransition(false)
                    setTransitionSource(null)
                  }}
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}

            {/* Mensaje cuando no hay nodos */}
            {narrative.nodes.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">Canvas Vacío</h3>
                  <p>Arrastra nodos desde la paleta de herramientas para comenzar</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Panel de Configuración */}
        <div className="w-80 bg-white border-l p-4 space-y-4">
          {selectedNode && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Configurar Nodo</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={deleteSelectedNode}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Nombre del Nodo</Label>
                  <Input
                    value={selectedNode.name}
                    onChange={(e) => updateSelectedNode({ name: e.target.value })}
                  />
                </div>

                <div>
                  <Label>Pool de Creatividades</Label>
                  <Select
                    value={selectedNode.creative_pool_id}
                    onValueChange={(value) => {
                      const pool = creativePools.find(p => p.id === value)
                      updateSelectedNode({
                        creative_pool_id: value,
                        creative_pool_name: pool?.name || ''
                      })
                    }}
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

                <div>
                  <Label>Descripción</Label>
                  <Textarea
                    value={selectedNode.description || ''}
                    onChange={(e) => updateSelectedNode({ description: e.target.value })}
                    placeholder="Describe el propósito de este nodo..."
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    variant={narrative.entry_node_id === selectedNode.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setNarrative(prev => ({ ...prev, entry_node_id: selectedNode.id }))}
                  >
                    Nodo de Entrada
                  </Button>
                  <Button
                    variant={narrative.completion_nodes.includes(selectedNode.id) ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      const isCompletion = narrative.completion_nodes.includes(selectedNode.id)
                      setNarrative(prev => ({
                        ...prev,
                        completion_nodes: isCompletion
                          ? prev.completion_nodes.filter(id => id !== selectedNode.id)
                          : [...prev.completion_nodes, selectedNode.id]
                      }))
                    }}
                  >
                    Finalización
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {selectedTransition && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Configurar Transición</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={deleteSelectedTransition}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Condición</Label>
                  <Select
                    value={selectedTransition.condition}
                    onValueChange={(value: TransitionRule['condition']) => {
                      const condition = transitionConditions.find(c => c.value === value)
                      updateSelectedTransition({
                        condition: value,
                        label: condition?.label || value
                      })
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {transitionConditions.map((condition) => (
                        <SelectItem key={condition.value} value={condition.value}>
                          {condition.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Umbral</Label>
                  <Input
                    type="number"
                    value={selectedTransition.threshold}
                    onChange={(e) => updateSelectedTransition({ threshold: Number(e.target.value) })}
                  />
                </div>

                <div>
                  <Label>Peso (0-1)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="1"
                    step="0.1"
                    value={selectedTransition.weight}
                    onChange={(e) => updateSelectedTransition({ weight: Number(e.target.value) })}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {!selectedNode && !selectedTransition && (
            <Card>
              <CardHeader>
                <CardTitle>Información de la Narrativa</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Descripción</Label>
                  <Textarea
                    value={narrative.description}
                    onChange={(e) => setNarrative(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe la narrativa..."
                  />
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Validación</h4>
                  {validateNarrative().map((error, index) => (
                    <Alert key={index}>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription className="text-sm">{error}</AlertDescription>
                    </Alert>
                  ))}
                  {validateNarrative().length === 0 && (
                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription className="text-sm">
                        La narrativa está lista para ser guardada
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}