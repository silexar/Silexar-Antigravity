import { create } from 'zustand'
import { EventEmitter } from 'events'

// Tipos para edge computing distribuido
interface EdgeNode {
  id: string
  region: string
  location: {
    latitude: number
    longitude: number
    city: string
    country: string
  }
  status: 'online' | 'offline' | 'maintenance'
  capacity: {
    cpu: number // percentage
    memory: number // percentage
    storage: number // percentage
    network: number // Mbps
  }
  load: {
    current: number
    max: number
    average: number
  }
  latency: number // ms
  lastHeartbeat: Date
  version: string
  services: string[]
}

interface EdgeWorkload {
  id: string
  type: 'compute' | 'storage' | 'ai-inference' | 'data-processing' | 'caching'
  priority: 'critical' | 'high' | 'medium' | 'low'
  requirements: {
    cpu: number
    memory: number
    storage: number
    network: number
  }
  constraints: {
    regions: string[]
    maxLatency: number
    dataSovereignty: boolean
    compliance: string[] // ['GDPR', 'HIPAA', 'SOX', 'Fortune10']
  }
  status: 'pending' | 'scheduled' | 'running' | 'completed' | 'failed'
  assignedNode?: string
  createdAt: Date
  startedAt?: Date
  completedAt?: Date
}

interface EdgeComputingState {
  nodes: Map<string, EdgeNode>
  workloads: Map<string, EdgeWorkload>
  globalMetrics: {
    totalNodes: number
    onlineNodes: number
    totalCapacity: number
    utilizedCapacity: number
    averageLatency: number
    globalLoad: number
  }
  loadBalancingStrategy: 'round-robin' | 'least-connections' | 'latency-based' | 'capacity-based' | 'intelligent'
  dataReplication: Map<string, string[]> // dataId -> nodeIds[]
  failoverStatus: {
    active: boolean
    primaryRegion: string
    backupRegions: string[]
    lastFailover: Date | null
  }
}

interface EdgeComputingActions {
  registerNode: (node: EdgeNode) => void
  unregisterNode: (nodeId: string) => void
  updateNodeStatus: (nodeId: string, status: EdgeNode['status']) => void
  updateNodeMetrics: (nodeId: string, metrics: Partial<EdgeNode['capacity'] & EdgeNode['load']>) => void
  scheduleWorkload: (workload: EdgeWorkload) => string
  cancelWorkload: (workloadId: string) => void
  setLoadBalancingStrategy: (strategy: EdgeComputingState['loadBalancingStrategy']) => void
  triggerFailover: (fromRegion: string, toRegion: string) => void
  replicateData: (dataId: string, nodeIds: string[]) => void
  getOptimalNode: (requirements: Partial<EdgeWorkload['requirements'] & EdgeWorkload['constraints']>) => EdgeNode | null
  getRegionalMetrics: (region: string) => {
    nodes: EdgeNode[]
    capacity: number
    utilization: number
    latency: number
  }
}

// Sistema de Edge Computing Distribuido Fortune 10
export const useEdgeComputingSystem = create<EdgeComputingState & EdgeComputingActions>((set, get) => ({
  nodes: new Map(),
  workloads: new Map(),
  globalMetrics: {
    totalNodes: 0,
    onlineNodes: 0,
    totalCapacity: 0,
    utilizedCapacity: 0,
    averageLatency: 0,
    globalLoad: 0
  },
  loadBalancingStrategy: 'intelligent',
  dataReplication: new Map(),
  failoverStatus: {
    active: false,
    primaryRegion: 'us-east-1',
    backupRegions: ['eu-west-1', 'ap-southeast-1', 'us-west-2'],
    lastFailover: null
  },

  registerNode: (node) => set((state) => {
    const newNodes = new Map(state.nodes)
    newNodes.set(node.id, node)
    
    return {
      nodes: newNodes,
      globalMetrics: calculateGlobalMetrics(newNodes, state.workloads)
    }
  }),

  unregisterNode: (nodeId) => set((state) => {
    const newNodes = new Map(state.nodes)
    newNodes.delete(nodeId)
    
    // Rebalance workloads
    const newWorkloads = rebalanceWorkloads(newNodes, state.workloads)
    
    return {
      nodes: newNodes,
      workloads: newWorkloads,
      globalMetrics: calculateGlobalMetrics(newNodes, newWorkloads)
    }
  }),

  updateNodeStatus: (nodeId, status) => set((state) => {
    const newNodes = new Map(state.nodes)
    const node = newNodes.get(nodeId)
    
    if (node) {
      node.status = status
      node.lastHeartbeat = new Date()
      newNodes.set(nodeId, node)
    }
    
    return {
      nodes: newNodes,
      globalMetrics: calculateGlobalMetrics(newNodes, state.workloads)
    }
  }),

  updateNodeMetrics: (nodeId, metrics) => set((state) => {
    const newNodes = new Map(state.nodes)
    const node = newNodes.get(nodeId)
    
    if (node) {
      Object.assign(node.capacity, metrics)
      Object.assign(node.load, metrics)
      node.lastHeartbeat = new Date()
      newNodes.set(nodeId, node)
    }
    
    return {
      nodes: newNodes,
      globalMetrics: calculateGlobalMetrics(newNodes, state.workloads)
    }
  }),

  scheduleWorkload: (workload) => {
    const { nodes, loadBalancingStrategy } = get()
    
    // Encontrar nodo óptimo basado en estrategia de balanceo
    const optimalNode = selectOptimalNode(Array.from(nodes.values()), workload, loadBalancingStrategy)
    
    if (optimalNode) {
      const newWorkloads = new Map(get().workloads)
      workload.assignedNode = optimalNode.id
      workload.status = 'scheduled'
      workload.startedAt = new Date()
      
      newWorkloads.set(workload.id, workload)
      
      set((state) => ({
        workloads: newWorkloads,
        globalMetrics: calculateGlobalMetrics(state.nodes, newWorkloads)
      }))
      
      // Simular completación de workload
      setTimeout(() => {
        const updatedWorkloads = new Map(get().workloads)
        const updatedWorkload = updatedWorkloads.get(workload.id)
        
        if (updatedWorkload) {
          updatedWorkload.status = 'completed'
          updatedWorkload.completedAt = new Date()
          updatedWorkloads.set(workload.id, updatedWorkload)
          
          set((state) => ({
            workloads: updatedWorkloads,
            globalMetrics: calculateGlobalMetrics(state.nodes, updatedWorkloads)
          }))
        }
      }, Math.random() * 5000 + 1000) // 1-6 seconds
      
      return optimalNode.id
    }
    
    throw new Error('No suitable edge node available for workload')
  },

  cancelWorkload: (workloadId) => set((state) => {
    const newWorkloads = new Map(state.workloads)
    const workload = newWorkloads.get(workloadId)
    
    if (workload && workload.status !== 'completed') {
      workload.status = 'failed'
      workload.completedAt = new Date()
      newWorkloads.set(workloadId, workload)
    }
    
    return {
      workloads: newWorkloads,
      globalMetrics: calculateGlobalMetrics(state.nodes, newWorkloads)
    }
  }),

  setLoadBalancingStrategy: (strategy) => set({ loadBalancingStrategy: strategy }),

  triggerFailover: (fromRegion, toRegion) => set((state) => {
    const newNodes = new Map(state.nodes)
    const affectedWorkloads = new Map(state.workloads)
    
    // Marcar nodos de región primaria como en mantenimiento
    for (const [nodeId, node] of newNodes) {
      if (node.region === fromRegion) {
        node.status = 'maintenance'
        newNodes.set(nodeId, node)
      }
    }
    
    // Reprogramar workloads afectados
    for (const [workloadId, workload] of affectedWorkloads) {
      if (workload.assignedNode && newNodes.get(workload.assignedNode)?.region === fromRegion) {
        workload.status = 'pending'
        workload.assignedNode = undefined
        affectedWorkloads.set(workloadId, workload)
      }
    }
    
    return {
      nodes: newNodes,
      workloads: affectedWorkloads,
      failoverStatus: {
        ...state.failoverStatus,
        active: true,
        primaryRegion: toRegion,
        lastFailover: new Date()
      },
      globalMetrics: calculateGlobalMetrics(newNodes, affectedWorkloads)
    }
  }),

  replicateData: (dataId, nodeIds) => set((state) => ({
    dataReplication: new Map(state.dataReplication).set(dataId, nodeIds)
  })),

  getOptimalNode: (requirements) => {
    const { nodes } = get()
    const availableNodes = Array.from(nodes.values()).filter(
      node => node.status === 'online'
    )
    
    if (availableNodes.length === 0) return null
    
    // Filtrar por requisitos
    const suitableNodes = availableNodes.filter(node => {
      if (requirements.regions && !requirements.regions.includes(node.region)) {
        return false
      }
      
      if (requirements.maxLatency && node.latency > requirements.maxLatency) {
        return false
      }
      
      if (requirements.cpu && node.capacity.cpu < (requirements.cpu * 100)) {
        return false
      }
      
      if (requirements.memory && node.capacity.memory < (requirements.memory * 100)) {
        return false
      }
      
      return true
    })
    
    return suitableNodes.length > 0 ? suitableNodes[0] : null
  },

  getRegionalMetrics: (region) => {
    const { nodes } = get()
    const regionalNodes = Array.from(nodes.values()).filter(node => node.region === region)
    
    const totalCapacity = regionalNodes.reduce((sum, node) => {
      return sum + (node.capacity.cpu + node.capacity.memory + node.capacity.storage) / 3
    }, 0)
    
    const averageLatency = regionalNodes.reduce((sum, node) => sum + node.latency, 0) / regionalNodes.length || 0
    
    return {
      nodes: regionalNodes,
      capacity: totalCapacity,
      utilization: regionalNodes.reduce((sum, node) => sum + node.load.current, 0) / regionalNodes.length || 0,
      latency: averageLatency
    }
  }
}))

// Funciones auxiliares
function calculateGlobalMetrics(nodes: Map<string, EdgeNode>, workloads: Map<string, EdgeWorkload>) {
  const nodeArray = Array.from(nodes.values())
  const workloadArray = Array.from(workloads.values())
  
  const onlineNodes = nodeArray.filter(node => node.status === 'online')
  const totalCapacity = onlineNodes.reduce((sum, node) => {
    return sum + (node.capacity.cpu + node.capacity.memory + node.capacity.storage) / 3
  }, 0)
  
  const utilizedCapacity = onlineNodes.reduce((sum, node) => {
    return sum + (node.load.current / node.load.max) * 100
  }, 0)
  
  const averageLatency = onlineNodes.reduce((sum, node) => sum + node.latency, 0) / onlineNodes.length || 0
  
  const globalLoad = workloadArray.filter(w => w.status === 'running').length / onlineNodes.length || 0
  
  return {
    totalNodes: nodeArray.length,
    onlineNodes: onlineNodes.length,
    totalCapacity,
    utilizedCapacity,
    averageLatency,
    globalLoad
  }
}

function selectOptimalNode(nodes: EdgeNode[], workload: EdgeWorkload, strategy: string): EdgeNode | null {
  const availableNodes = nodes.filter(node => node.status === 'online')
  
  if (availableNodes.length === 0) return null
  
  // Filtrar por restricciones
  const suitableNodes = availableNodes.filter(node => {
    if (workload.constraints.regions && !workload.constraints.regions.includes(node.region)) {
      return false
    }
    
    if (workload.constraints.maxLatency && node.latency > workload.constraints.maxLatency) {
      return false
    }
    
    // Verificar capacidad suficiente
    const requiredCpu = (workload.requirements.cpu || 0) * 100
    const requiredMemory = (workload.requirements.memory || 0) * 100
    const requiredStorage = (workload.requirements.storage || 0) * 100
    
    if (node.capacity.cpu < requiredCpu || 
        node.capacity.memory < requiredMemory || 
        node.capacity.storage < requiredStorage) {
      return false
    }
    
    return true
  })
  
  if (suitableNodes.length === 0) return null
  
  // Seleccionar basado en estrategia
  switch (strategy) {
    case 'round-robin':
      return suitableNodes[Math.floor(Math.random() * suitableNodes.length)]
    
    case 'least-connections':
      return suitableNodes.reduce((best, current) => 
        current.load.current < best.load.current ? current : best
      )
    
    case 'latency-based':
      return suitableNodes.reduce((best, current) => 
        current.latency < best.latency ? current : best
      )
    
    case 'capacity-based':
      return suitableNodes.reduce((best, current) => {
        const currentAvailable = (current.capacity.cpu + current.capacity.memory + current.capacity.storage) / 3
        const bestAvailable = (best.capacity.cpu + best.capacity.memory + best.capacity.storage) / 3
        return currentAvailable > bestAvailable ? current : best
      })
    
    case 'intelligent':
    default:
      // Puntuación inteligente basada en múltiples factores
      return suitableNodes.reduce((best, current) => {
        const currentScore = calculateIntelligentScore(current)
        const bestScore = calculateIntelligentScore(best)
        return currentScore > bestScore ? current : best
      })
  }
}

function calculateIntelligentScore(node: EdgeNode): number {
  // Puntuación basada en latencia, capacidad disponible y carga actual
  const latencyScore = Math.max(0, 100 - node.latency) // Preferir menor latencia
  const capacityScore = (node.capacity.cpu + node.capacity.memory + node.capacity.storage) / 3
  const loadScore = Math.max(0, 100 - (node.load.current / node.load.max) * 100) // Preferir menos carga
  
  return (latencyScore * 0.4) + (capacityScore * 0.4) + (loadScore * 0.2)
}

function rebalanceWorkloads(nodes: Map<string, EdgeNode>, workloads: Map<string, EdgeWorkload>): Map<string, EdgeWorkload> {
  const newWorkloads = new Map(workloads)
  
  // Reprogramar workloads asignadas a nodos inexistentes o fuera de línea
  for (const [workloadId, workload] of newWorkloads) {
    if (workload.assignedNode) {
      const assignedNode = nodes.get(workload.assignedNode)
      if (!assignedNode || assignedNode.status !== 'online') {
        workload.status = 'pending'
        workload.assignedNode = undefined
      }
    }
  }
  
  return newWorkloads
}

// Event emitter para notificaciones de edge computing
export class EdgeComputingEventEmitter extends EventEmitter {
  static instance: EdgeComputingEventEmitter
  
  static getInstance(): EdgeComputingEventEmitter {
    if (!EdgeComputingEventEmitter.instance) {
      EdgeComputingEventEmitter.instance = new EdgeComputingEventEmitter()
    }
    return EdgeComputingEventEmitter.instance
  }
  
  emitNodeStatusChange(nodeId: string, status: EdgeNode['status']) {
    this.emit('nodeStatusChange', { nodeId, status, timestamp: new Date() })
  }
  
  emitWorkloadCompleted(workloadId: string, nodeId: string) {
    this.emit('workloadCompleted', { workloadId, nodeId, timestamp: new Date() })
  }
  
  emitFailoverTriggered(fromRegion: string, toRegion: string) {
    this.emit('failoverTriggered', { fromRegion, toRegion, timestamp: new Date() })
  }
}