'use client'

/**
 * 👥 SILEXAR PULSE - Team Management (Client)
 * Gestión de equipos para clientes
 * 
 * @description Team Management:
 * - Crear y gestionar equipos
 * - Jerarquías organizacionales
 * - Asignación de miembros
 * - Métricas por equipo
 * 
 * @version 2025.1.0
 * @tier CLIENT_ADMIN
 */

import { useState, useEffect } from 'react'
import { 
  NeuromorphicCard, 
  NeuromorphicButton 
} from '@/components/ui/neuromorphic'
import {
  Users,
  Plus,
  Edit,
  Trash2,
  UserPlus,
  Crown,
  ChevronRight,
  RefreshCw
} from 'lucide-react'

interface Team {
  id: string
  name: string
  description: string
  leaderId: string
  leaderName: string
  members: TeamMember[]
  parentTeamId?: string
  createdAt: Date
  color: string
}

interface TeamMember {
  id: string
  name: string
  email: string
  role: string
  avatar?: string
  joinedAt: Date
}

export function TeamManagement() {
  const [teams, setTeams] = useState<Team[]>([])
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadTeams()
  }, [])

  const loadTeams = async () => {
    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 500))

    setTeams([
      {
        id: 'team_001',
        name: 'Marketing Digital',
        description: 'Equipo de campañas y publicidad digital',
        leaderId: 'user_001',
        leaderName: 'María González',
        members: [
          { id: 'user_001', name: 'María González', email: 'maria@company.com', role: 'Team Leader', joinedAt: new Date('2024-01-15') },
          { id: 'user_002', name: 'Carlos López', email: 'carlos@company.com', role: 'Campaign Manager', joinedAt: new Date('2024-02-01') },
          { id: 'user_003', name: 'Ana Silva', email: 'ana@company.com', role: 'Designer', joinedAt: new Date('2024-03-15') }
        ],
        createdAt: new Date('2024-01-01'),
        color: 'blue'
      },
      {
        id: 'team_002',
        name: 'Ventas',
        description: 'Equipo comercial y desarrollo de negocios',
        leaderId: 'user_004',
        leaderName: 'Pedro Martínez',
        members: [
          { id: 'user_004', name: 'Pedro Martínez', email: 'pedro@company.com', role: 'Sales Director', joinedAt: new Date('2024-01-01') },
          { id: 'user_005', name: 'Laura Rodríguez', email: 'laura@company.com', role: 'Account Executive', joinedAt: new Date('2024-02-15') }
        ],
        createdAt: new Date('2024-01-01'),
        color: 'green'
      },
      {
        id: 'team_003',
        name: 'Analytics',
        description: 'Análisis de datos y reportes',
        leaderId: 'user_006',
        leaderName: 'Jorge Fernández',
        members: [
          { id: 'user_006', name: 'Jorge Fernández', email: 'jorge@company.com', role: 'Data Lead', joinedAt: new Date('2024-01-15') }
        ],
        createdAt: new Date('2024-02-01'),
        color: 'purple'
      }
    ])

    setIsLoading(false)
  }

  const deleteTeam = (id: string) => {
    if (confirm('¿Eliminar este equipo?')) {
      setTeams(prev => prev.filter(t => t.id !== id))
      if (selectedTeam?.id === id) setSelectedTeam(null)
    }
  }

  const removeMember = (teamId: string, memberId: string) => {
    setTeams(prev => prev.map(t => 
      t.id === teamId ? { ...t, members: t.members.filter(m => m.id !== memberId) } : t
    ))
  }

  const getColorClass = (color: string) => {
    switch (color) {
      case 'blue': return 'bg-blue-500/20 text-blue-400 border-blue-500/50'
      case 'green': return 'bg-green-500/20 text-green-400 border-green-500/50'
      case 'purple': return 'bg-purple-500/20 text-purple-400 border-purple-500/50'
      case 'orange': return 'bg-orange-500/20 text-orange-400 border-orange-500/50'
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/50'
    }
  }

  const totalMembers = teams.reduce((sum, t) => sum + t.members.length, 0)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Cargando Team Management...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-400" />
          Team Management
        </h3>
        <div className="flex items-center gap-2">
          <NeuromorphicButton variant="secondary" size="sm" onClick={loadTeams}>
            <RefreshCw className="w-4 h-4 mr-1" />
            Refresh
          </NeuromorphicButton>
          <NeuromorphicButton variant="primary" size="sm">
            <Plus className="w-4 h-4 mr-1" />
            Nuevo Equipo
          </NeuromorphicButton>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 bg-slate-800/50 rounded-lg text-center">
          <p className="text-2xl font-bold text-white">{teams.length}</p>
          <p className="text-xs text-slate-400">Equipos</p>
        </div>
        <div className="p-3 bg-blue-500/10 rounded-lg text-center">
          <p className="text-2xl font-bold text-blue-400">{totalMembers}</p>
          <p className="text-xs text-slate-400">Miembros</p>
        </div>
        <div className="p-3 bg-green-500/10 rounded-lg text-center">
          <p className="text-2xl font-bold text-green-400">{teams.length}</p>
          <p className="text-xs text-slate-400">Líderes</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Teams List */}
        <NeuromorphicCard variant="embossed" className="p-4">
          <h4 className="text-white font-medium mb-3">Equipos</h4>
          <div className="space-y-2">
            {teams.map(team => (
              <div 
                key={team.id}
                onClick={() => setSelectedTeam(team)}
                className={`p-3 rounded-lg cursor-pointer border transition-colors ${
                  selectedTeam?.id === team.id 
                    ? 'border-blue-500/50 bg-slate-800' 
                    : 'border-transparent bg-slate-800/50 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${getColorClass(team.color)}`} />
                    <span className="text-white font-medium">{team.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button className="p-1 hover:bg-slate-700 rounded" aria-label="Editar">
                      <Edit className="w-3 h-3 text-blue-400" />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); deleteTeam(team.id); }} className="p-1 hover:bg-slate-700 rounded" aria-label="Eliminar">
                      <Trash2 className="w-3 h-3 text-red-400" />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-slate-500 mb-2">{team.description}</p>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Crown className="w-3 h-3 text-yellow-400" />
                    {team.leaderName}
                  </span>
                  <span className="text-slate-400">{team.members.length} miembros</span>
                </div>
              </div>
            ))}
          </div>
        </NeuromorphicCard>

        {/* Team Details */}
        <NeuromorphicCard variant="embossed" className="p-4">
          {selectedTeam ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-white font-medium">{selectedTeam.name}</h4>
                <NeuromorphicButton variant="secondary" size="sm">
                  <UserPlus className="w-4 h-4 mr-1" />
                  Agregar Miembro
                </NeuromorphicButton>
              </div>
              
              <p className="text-slate-400 text-sm">{selectedTeam.description}</p>
              
              <div className="space-y-2">
                <h5 className="text-sm text-slate-400">Miembros ({selectedTeam.members.length})</h5>
                {selectedTeam.members.map(member => (
                  <div key={member.id} className="flex items-center justify-between p-2 bg-slate-800/50 rounded">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
                        <Users className="w-4 h-4 text-slate-400" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-white text-sm">{member.name}</span>
                          {member.id === selectedTeam.leaderId && (
                            <Crown className="w-3 h-3 text-yellow-400" />
                          )}
                        </div>
                        <p className="text-xs text-slate-500">{member.role}</p>
                      </div>
                    </div>
                    {member.id !== selectedTeam.leaderId && (
                      <button 
                        onClick={() => removeMember(selectedTeam.id, member.id)}
                        className="p-1 hover:bg-slate-700 rounded"
                      >
                        <Trash2 className="w-3 h-3 text-red-400" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-slate-400">
              <div className="text-center">
                <ChevronRight className="w-8 h-8 mx-auto mb-2" />
                <p>Selecciona un equipo</p>
              </div>
            </div>
          )}
        </NeuromorphicCard>
      </div>
    </div>
  )
}

export default TeamManagement
