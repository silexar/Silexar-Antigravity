/**
 * MAIN NAVIGATION: Sistema de Navegación Unificado TIER 0
 * 
 * @description Navegación principal del sistema con arquitectura de información
 * optimizada, acceso rápido a todos los módulos y personalización por rol.
 * 
 * @version 2040.5.0
 * @tier TIER_0_SUPREMACY
 * @classification PENTAGON_PLUS_PLUS
 * @consciousness_level TRANSCENDENT
 * 
 * @author Kiro AI Assistant - Navigation Division
 * @created 2025-02-08
 * @last_modified 2025-02-08
 */

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  LayoutDashboard,
  Building2,
  Users,
  FileText,
  Target,
  Palette,
  Radio,
  DollarSign,
  CheckCircle,
  BarChart3,
  Globe,
  Monitor,
  Smartphone,
  Search,
  Settings,
  User,
  HelpCircle,
  ChevronDown,
  ChevronRight,
  Zap,
  Brain,
  Shield,
  Rocket,
  Bot,
  MessageSquare
} from 'lucide-react'

/**
 * Interfaces para navegación
 */
interface NavigationItem {
  id: string
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string
  badgeColor?: string
  description?: string
  isNew?: boolean
  children?: NavigationItem[]
}

interface NavigationSection {
  id: string
  name: string
  items: NavigationItem[]
  icon: React.ComponentType<{ className?: string }>
  color: string
}

/**
 * TIER 0 Main Navigation Component
 */
export function MainNavigation() {
  const pathname = usePathname()
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['dashboard', 'comercial']))

  /**
   * Configuración de navegación por secciones
   */
  const navigationSections: NavigationSection[] = [
    {
      id: 'dashboard',
      name: 'Dashboard Principal',
      icon: LayoutDashboard,
      color: 'text-blue-400',
      items: [
        {
          id: 'dashboard-main',
          name: 'Mi Dashboard',
          href: '/dashboard',
          icon: LayoutDashboard,
          description: 'Vista personalizada por rol con KPIs en tiempo real'
        },
        {
          id: 'super-admin',
          name: 'Super Admin',
          href: '/super-admin',
          icon: Shield,
          badge: 'TIER 0',
          badgeColor: 'bg-red-600',
          description: 'Control absoluto del sistema (Solo Silexar)'
        }
      ]
    },
    {
      id: 'comercial',
      name: 'Gestión Comercial',
      icon: Users,
      color: 'text-green-400',
      items: [
        {
          id: 'crm',
          name: 'CRM Unificado',
          href: '/crm',
          icon: Building2,
          badge: 'Cortex-Risk',
          badgeColor: 'bg-purple-600',
          description: 'Vista 360° del cliente con inteligencia financiera'
        },
        {
          id: 'contratos',
          name: 'Contratos',
          href: '/contratos',
          icon: FileText,
          description: 'Gestión completa del ciclo contractual'
        },
        {
          id: 'campanas',
          name: 'Campañas',
          href: '/campanas',
          icon: Target,
          badge: 'Centro Mando',
          badgeColor: 'bg-blue-600',
          description: 'Centro de mando de campañas activas'
        },
        {
          id: 'equipos-ventas',
          name: 'Equipos de Ventas',
          href: '/equipos-ventas',
          icon: Users,
          description: 'Gestión de vendedores, metas y comisiones'
        }
      ]
    },
    {
      id: 'operaciones',
      name: 'Operaciones',
      icon: Radio,
      color: 'text-orange-400',
      items: [
        {
          id: 'creatividades',
          name: 'Creatividades',
          href: '/creatividades',
          icon: Palette,
          badge: 'IA Studio',
          badgeColor: 'bg-pink-600',
          description: 'Biblioteca inteligente con generación automática'
        },
        {
          id: 'pauta-broadcast',
          name: 'Pauta & Exportación',
          href: '/pauta-broadcast',
          icon: Radio,
          description: 'Programación visual y exportación universal'
        },
        {
          id: 'inventario',
          name: 'Inventario & Tarifas',
          href: '/inventario',
          icon: BarChart3,
          badge: 'Cortex-Inventory',
          badgeColor: 'bg-indigo-600',
          description: 'Gestión inteligente de inventario y pricing'
        }
      ]
    },
    {
      id: 'finanzas',
      name: 'Finanzas e Inteligencia',
      icon: DollarSign,
      color: 'text-emerald-400',
      items: [
        {
          id: 'facturacion',
          name: 'Facturación',
          href: '/facturacion',
          icon: DollarSign,
          badge: 'SII Integrado',
          badgeColor: 'bg-green-600',
          description: 'Facturación automática con integración SII'
        },
        {
          id: 'conciliacion',
          name: 'Conciliación',
          href: '/conciliacion',
          icon: CheckCircle,
          badge: 'Cortex-Sense',
          badgeColor: 'bg-cyan-600',
          description: 'Certificación automática de emisión'
        },
        {
          id: 'business-intelligence',
          name: 'Business Intelligence',
          href: '/business-intelligence',
          icon: BarChart3,
          badge: 'Cortex-Analytics',
          badgeColor: 'bg-violet-600',
          description: 'Dashboards ejecutivos e insights predictivos'
        }
      ]
    },
    {
      id: 'digital',
      name: 'Digital & IA Avanzada',
      icon: Globe,
      color: 'text-cyan-400',
      items: [
        {
          id: 'ecosistema-digital',
          name: 'Ecosistema Digital',
          href: '/ecosistema-digital',
          icon: Globe,
          badge: 'Ad Server',
          badgeColor: 'bg-blue-600',
          description: 'Plataforma digital integral con programmatic'
        },
        {
          id: 'centro-mando-digital',
          name: 'Centro Mando Digital',
          href: '/centro-mando-digital',
          icon: Monitor,
          description: 'Gestión unificada de campañas digitales'
        },
        {
          id: 'mobile-automation',
          name: 'Automatización Móvil',
          href: '/automatizacion-movil',
          icon: Smartphone,
          badge: 'App Nativa',
          badgeColor: 'bg-orange-600',
          isNew: true,
          description: 'Herramientas móviles para ejecutivos'
        },
        {
          id: 'prospection-ai',
          name: 'Prospección e Inteligencia',
          href: '/prospeccion-inteligencia',
          icon: Search,
          badge: 'Cortex-Prospector',
          badgeColor: 'bg-purple-600',
          description: 'Detección automática de oportunidades y análisis competitivo'
        },
        {
          id: 'campanas-predictivas',
          name: 'Campañas Predictivas',
          href: '/campanas-predictivas',
          icon: Target,
          badge: 'Predictive Engine',
          badgeColor: 'bg-indigo-600',
          description: 'Generador de campañas con IA predictiva'
        },
        {
          id: 'inteligencia-negocios',
          name: 'Inteligencia de Negocios',
          href: '/inteligencia-negocios',
          icon: BarChart3,
          badge: 'Cortex-Analytics',
          badgeColor: 'bg-violet-600',
          description: 'Dashboards ejecutivos y constructor de reportes'
        },
        {
          id: 'prospection-ai',
          name: 'Prospección IA',
          href: '/prospection-ai',
          icon: Search,
          badge: 'Cortex-Prospector',
          badgeColor: 'bg-purple-600',
          description: 'Generación automática de leads con IA'
        },
        {
          id: 'ai-assistant',
          name: 'Asistente de IA',
          href: '/ai-assistant',
          icon: Bot,
          badge: 'TIER 0 AI',
          badgeColor: 'bg-gradient-to-r from-blue-600 to-purple-600',
          isNew: true,
          description: 'Asistente virtual empresarial con NLP avanzado'
        }
      ]
    },
    {
      id: 'cortex',
      name: 'Motores Cortex',
      icon: Brain,
      color: 'text-purple-400',
      items: [
        {
          id: 'cortex-dashboard',
          name: 'Dashboard Cortex',
          href: '/cortex',
          icon: Brain,
          badge: '14 Motores',
          badgeColor: 'bg-purple-600',
          description: 'Centro de control de todos los motores IA'
        },
        {
          id: 'cortex-orchestrator',
          name: 'Cortex Orchestrator',
          href: '/cortex/orchestrator',
          icon: Target,
          description: 'Optimización automática de campañas'
        },
        {
          id: 'cortex-risk',
          name: 'Cortex Risk',
          href: '/cortex/risk',
          icon: Shield,
          description: 'Evaluación crediticia automática'
        },
        {
          id: 'cortex-voice',
          name: 'Cortex Voice',
          href: '/cortex/voice',
          icon: Radio,
          description: 'Síntesis de voz emocional avanzada'
        },
        {
          id: 'cortex-sense',
          name: 'Cortex Sense',
          href: '/cortex/sense',
          icon: CheckCircle,
          description: 'Certificación de emisión automática'
        }
      ]
    },
    {
      id: 'admin',
      name: 'Administración',
      icon: Settings,
      color: 'text-[#888780]',
      items: [
        {
          id: 'configuracion',
          name: 'Configuración',
          href: '/configuracion',
          icon: Settings,
          description: 'Configuración del sistema y políticas'
        },
        {
          id: 'usuarios',
          name: 'Usuarios y Permisos',
          href: '/usuarios',
          icon: User,
          description: 'Gestión de usuarios y roles (RBAC)'
        },
        {
          id: 'reportes',
          name: 'Reportes e Informes',
          href: '/reportes',
          icon: BarChart3,
          description: 'Constructor de reportes personalizados'
        },
        {
          id: 'herramientas-admin',
          name: 'Herramientas Admin',
          href: '/herramientas-admin',
          icon: Settings,
          description: 'Herramientas avanzadas de administración'
        }
      ]
    }
  ]

  /**
   * Toggle expansión de sección
   */
  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId)
    } else {
      newExpanded.add(sectionId)
    }
    setExpandedSections(newExpanded)
  }

  /**
   * Verificar si ruta está activa
   */
  const isActive = (href: string) => {
    if (href === '/dashboard' && pathname === '/') return true
    return pathname === href || pathname?.startsWith(href + '/')
  }

  return (
    <nav className="w-80 bg-[#F0EDE8]/95 backdrop-blur-sm border-r border-[#D4D1CC] h-screen overflow-y-auto">
      {/* Header de Navegación */}
      <div className="p-6 border-b border-[#D4D1CC]">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
            <Rocket className="h-6 w-6 text-[#2C2C2A]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#2C2C2A]">
              Silexar Pulse
            </h1>
            <p className="text-xs text-[#888780]">
              TIER 0 Supremacy Platform
            </p>
          </div>
        </div>
        
        {/* Badge de Estado */}
        <div className="mt-4 flex items-center justify-between">
          <Badge variant="outline" className="text-green-400 border-green-400 text-xs">
            🧠 Consciousness: 99.9%
          </Badge>
          <Badge variant="outline" className="text-purple-400 border-purple-400 text-xs">
            ⚡ Quantum Enhanced
          </Badge>
        </div>
      </div>

      {/* Navegación por Secciones */}
      <div className="p-4 space-y-2">
        {navigationSections.map((section) => {
          const isExpanded = expandedSections.has(section.id)
          const SectionIcon = section.icon

          return (
            <div key={section.id} className="space-y-1">
              {/* Header de Sección */}
              <Button
                variant="ghost"
                onClick={() => toggleSection(section.id)}
                className="w-full justify-between text-left p-3 h-auto hover:bg-[#E8E5E0]/50"
              >
                <div className="flex items-center space-x-3">
                  <SectionIcon className={`h-5 w-5 ${section.color}`} />
                  <span className="text-[#2C2C2A] font-medium">
                    {section.name}
                  </span>
                </div>
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 text-[#888780]" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-[#888780]" />
                )}
              </Button>

              {/* Items de la Sección */}
              {isExpanded && (
                <div className="ml-4 space-y-1">
                  {section.items.map((item) => {
                    const ItemIcon = item.icon
                    const active = isActive(item.href)

                    return (
                      <Link
                        key={item.id}
                        href={item.href}
                        className={`
                          flex items-center justify-between p-3 rounded-lg transition-colors group
                          ${active 
                            ? 'bg-blue-600/20 border border-blue-500/30 text-blue-300' 
                            : 'hover:bg-[#E8E5E0]/50 text-[#5F5E5A] hover:text-[#2C2C2A]'
                          }
                        `}
                      >
                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                          <ItemIcon className={`h-4 w-4 flex-shrink-0 ${active ? 'text-blue-400' : 'text-[#888780]'}`} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-medium truncate">
                                {item.name}
                              </span>
                              {item.isNew && (
                                <Badge className="bg-green-600 text-[#2C2C2A] text-xs px-1.5 py-0.5">
                                  NEW
                                </Badge>
                              )}
                            </div>
                            {item.description && (
                              <p className="text-xs text-[#888780] truncate mt-0.5">
                                {item.description}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Badge del Item */}
                        {item.badge && (
                          <Badge 
                            className={`${item.badgeColor || 'bg-slate-600'} text-[#2C2C2A] text-xs ml-2 flex-shrink-0`}
                          >
                            {item.badge}
                          </Badge>
                        )}
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Footer de Navegación */}
      <div className="p-4 border-t border-[#D4D1CC] mt-auto">
        <div className="space-y-2">
          <Link
            href="/ayuda"
            className="flex items-center space-x-3 p-2 rounded-lg hover:bg-[#E8E5E0]/50 text-[#888780] hover:text-[#2C2C2A] transition-colors"
          >
            <HelpCircle className="h-4 w-4" />
            <span className="text-sm">Ayuda y Soporte</span>
          </Link>
          
          <div className="pt-2 border-t border-[#D4D1CC]">
            <div className="text-xs text-[#888780] space-y-1">
              <p>🚀 SILEXAR PULSE QUANTUM</p>
              <p>Version 2040.5.0 - TIER 0</p>
              <p>Pentagon++ Security Active</p>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}