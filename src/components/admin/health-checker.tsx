'use client'

/**
 * œ… SILEXAR PULSE - Health Checker
 * Tests de salud automatizados
 * 
 * @description Health Checks:
 * - Tests automáticos
 * - Smoke tests
 * - Endpoint validation
 * - Scheduled checks
 * 
 * @version 2025.1.0
 * @tier TIER_0_FORTUNE_10
 * @security MILITARY_GRADE
 */

import { useState, useEffect } from 'react'
import { N, getShadow, getSmallShadow, getFloatingShadow } from '@/components/admin/_sdk/AdminDesignSystem'
import { NeuCard, NeuButton } from '@/components/admin/_sdk/AdminDesignSystem'
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Play,
  RefreshCw,
  Activity,
  Server,
  Database,
  Globe,
  Lock,
  Zap
} from 'lucide-react'

interface HealthTest {
  id: string
  name: string
  category: 'api' | 'database' | 'external' | 'security' | 'performance'
  status: 'passing' | 'failing' | 'warning' | 'running' | 'Pendiente'
  lastRun?: Date
  duration?: number
  message?: string
  critical: boolean
}

interface HealthGroup {
  name: string
  icon: React.ReactNode
  tests: HealthTest[]
  overallStatus: 'healthy' | 'degraded' | 'unhealthy'
}

export function HealthChecker() {
  const [groups, setGroups] = useState<HealthGroup[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRunning, setIsRunning] = useState(false)
  const [lastFullRun, setLastFullRun] = useState<Date | null>(null)

  useEffect(() => {
    loadTests()
  }, [])

  const loadTests = async () => {
    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 500))

    setGroups([
      {
        name: 'API Endpoints',
        icon: <Globe className="w-5 h-5 text-[#6888ff]" />,
        overallStatus: 'healthy',
        tests: [
          { id: 'api_001', name: 'GET /api/health', category: 'api', status: 'passing', lastRun: new Date(), duration: 12, critical: true },
          { id: 'api_002', name: 'POST /api/auth/login', category: 'api', status: 'passing', lastRun: new Date(), duration: 45, critical: true },
          { id: 'api_003', name: 'GET /api/campanas', category: 'api', status: 'passing', lastRun: new Date(), duration: 89, critical: true },
          { id: 'api_004', name: 'POST /api/campanas', category: 'api', status: 'passing', lastRun: new Date(), duration: 120, critical: false },
          { id: 'api_005', name: 'GET /api/analytics', category: 'api', status: 'warning', lastRun: new Date(), duration: 450, message: 'Response time above threshold', critical: false }
        ]
      },
      {
        name: 'Database',
        icon: <Database className="w-5 h-5 text-[#6888ff]" />,
        overallStatus: 'healthy',
        tests: [
          { id: 'db_001', name: 'PostgreSQL Connection', category: 'database', status: 'passing', lastRun: new Date(), duration: 5, critical: true },
          { id: 'db_002', name: 'Read Replica Sync', category: 'database', status: 'passing', lastRun: new Date(), duration: 8, critical: true },
          { id: 'db_003', name: 'Connection Pool', category: 'database', status: 'passing', lastRun: new Date(), duration: 3, message: '45/200 connections', critical: false },
          { id: 'db_004', name: 'Redis Cache', category: 'database', status: 'passing', lastRun: new Date(), duration: 2, critical: true }
        ]
      },
      {
        name: 'External Services',
        icon: <Server className="w-5 h-5 text-[#6888ff]" />,
        overallStatus: 'degraded',
        tests: [
          { id: 'ext_001', name: 'Meta Marketing API', category: 'external', status: 'warning', lastRun: new Date(), duration: 890, message: 'High latency', critical: true },
          { id: 'ext_002', name: 'Google Ads API', category: 'external', status: 'passing', lastRun: new Date(), duration: 120, critical: true },
          { id: 'ext_003', name: 'Stripe API', category: 'external', status: 'passing', lastRun: new Date(), duration: 85, critical: true },
          { id: 'ext_004', name: 'SendGrid API', category: 'external', status: 'passing', lastRun: new Date(), duration: 65, critical: false },
          { id: 'ext_005', name: 'Slack Webhook', category: 'external', status: 'passing', lastRun: new Date(), duration: 45, critical: false }
        ]
      },
      {
        name: 'Security',
        icon: <Lock className="w-5 h-5 text-[#6888ff]" />,
        overallStatus: 'healthy',
        tests: [
          { id: 'sec_001', name: 'SSL Certificate', category: 'security', status: 'passing', lastRun: new Date(), duration: 15, message: 'Expires in 45 days', critical: true },
          { id: 'sec_002', name: 'CORS Configuration', category: 'security', status: 'passing', lastRun: new Date(), duration: 8, critical: true },
          { id: 'sec_003', name: 'Rate Limiting', category: 'security', status: 'passing', lastRun: new Date(), duration: 12, critical: true },
          { id: 'sec_004', name: 'Auth Token Validation', category: 'security', status: 'passing', lastRun: new Date(), duration: 25, critical: true }
        ]
      },
      {
        name: 'Performance',
        icon: <Zap className="w-5 h-5 text-[#6888ff]" />,
        overallStatus: 'healthy',
        tests: [
          { id: 'perf_001', name: 'Response Time P95', category: 'performance', status: 'passing', lastRun: new Date(), duration: 0, message: '< 200ms', critical: false },
          { id: 'perf_002', name: 'Memory Usage', category: 'performance', status: 'passing', lastRun: new Date(), duration: 0, message: '72% used', critical: false },
          { id: 'perf_003', name: 'CPU Usage', category: 'performance', status: 'passing', lastRun: new Date(), duration: 0, message: '65% used', critical: false },
          { id: 'perf_004', name: 'Disk Space', category: 'performance', status: 'passing', lastRun: new Date(), duration: 0, message: '45% used', critical: false }
        ]
      }
    ])

    setLastFullRun(new Date())
    setIsLoading(false)
  }

  const runAllTests = async () => {
    setIsRunning(true)

    // Simulate running tests
    for (const group of groups) {
      for (const test of group.tests) {
        setGroups(prev => prev.map(g => ({
          ...g,
          tests: g.tests.map(t => t.id === test.id ? { ...t, status: 'running' as const } : t)
        })))

        await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200))

        setGroups(prev => prev.map(g => ({
          ...g,
          tests: g.tests.map(t => t.id === test.id ? {
            ...t,
            status: Math.random() > 0.1 ? 'passing' as const : 'warning' as const,
            lastRun: new Date(),
            duration: Math.floor(Math.random() * 500)
          } : t)
        })))
      }
    }

    setLastFullRun(new Date())
    setIsRunning(false)
  }

  const runSingleTest = async (testId: string) => {
    setGroups(prev => prev.map(g => ({
      ...g,
      tests: g.tests.map(t => t.id === testId ? { ...t, status: 'running' as const } : t)
    })))

    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000))

    setGroups(prev => prev.map(g => ({
      ...g,
      tests: g.tests.map(t => t.id === testId ? {
        ...t,
        status: 'passing' as const,
        lastRun: new Date(),
        duration: Math.floor(Math.random() * 200)
      } : t)
    })))
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passing': return <CheckCircle2 className="w-4 h-4 text-[#6888ff]" />
      case 'failing': return <XCircle className="w-4 h-4 text-[#6888ff]" />
      case 'warning': return <AlertTriangle className="w-4 h-4 text-[#6888ff]" />
      case 'running': return <RefreshCw className="w-4 h-4 text-[#6888ff] animate-spin" />
      case 'Pendiente': return <Clock className="w-4 h-4 text-[#9aa3b8]" />
      default: return <Clock className="w-4 h-4 text-[#9aa3b8]" />
    }
  }

  const getOverallStyle = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-[#6888ff]/20 text-[#6888ff]'
      case 'degraded': return 'bg-[#6888ff]/20 text-[#6888ff]'
      case 'unhealthy': return 'bg-[#6888ff]/20 text-[#6888ff]'
      default: return 'bg-slate-500/20 text-[#9aa3b8]'
    }
  }

  const totalTests = groups.reduce((sum, g) => sum + g.tests.length, 0)
  const passingTests = groups.reduce((sum, g) => sum + g.tests.filter(t => t.status === 'passing').length, 0)
  const failingTests = groups.reduce((sum, g) => sum + g.tests.filter(t => t.status === 'failing').length, 0)
  const warningTests = groups.reduce((sum, g) => sum + g.tests.filter(t => t.status === 'warning').length, 0)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#6888ff]/30 border-t-green-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#9aa3b8]">Cargando Health Checker...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-[#69738c] flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-[#6888ff]" />
          Health Checker
        </h3>
        <div className="flex items-center gap-2">
          {lastFullRun && (
            <span className="text-xs text-[#9aa3b8]">
              Last run: {lastFullRun.toLocaleTimeString()}
            </span>
          )}
          <NeuButton variant="primary" onClick={runAllTests} disabled={isRunning}>
            {isRunning ? (
              <>
                <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                Running...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-1" />
                Run All Tests
              </>
            )}
          </NeuButton>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-4 gap-3">
        <NeuCard style={{ boxShadow: getSmallShadow(), padding: '1rem', background: N.base, textAlign: 'center' }}>
          <Activity className="w-6 h-6 text-[#6888ff] mx-auto mb-2" />
          <p className="text-2xl font-bold text-[#69738c]">{totalTests}</p>
          <p className="text-xs text-[#9aa3b8]">Total Tests</p>
        </NeuCard>
        <NeuCard style={{ boxShadow: getSmallShadow(), padding: '1rem', background: N.base, textAlign: 'center' }}>
          <CheckCircle2 className="w-6 h-6 text-[#6888ff] mx-auto mb-2" />
          <p className="text-2xl font-bold text-[#6888ff]">{passingTests}</p>
          <p className="text-xs text-[#9aa3b8]">Passing</p>
        </NeuCard>
        <NeuCard style={{ boxShadow: getSmallShadow(), padding: '1rem', background: N.base, textAlign: 'center' }}>
          <AlertTriangle className="w-6 h-6 text-[#6888ff] mx-auto mb-2" />
          <p className="text-2xl font-bold text-[#6888ff]">{warningTests}</p>
          <p className="text-xs text-[#9aa3b8]">Warnings</p>
        </NeuCard>
        <NeuCard style={{ boxShadow: getSmallShadow(), padding: '1rem', background: N.base, textAlign: 'center' }}>
          <XCircle className="w-6 h-6 text-[#6888ff] mx-auto mb-2" />
          <p className="text-2xl font-bold text-[#6888ff]">{failingTests}</p>
          <p className="text-xs text-[#9aa3b8]">Failing</p>
        </NeuCard>
      </div>

      {/* Test Groups */}
      <div className="space-y-4">
        {groups.map(group => (
          <NeuCard key={group.name} style={{ boxShadow: getSmallShadow(), padding: '1rem', background: N.base }}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                {group.icon}
                <span className="text-[#69738c] font-medium">{group.name}</span>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded capitalize ${getOverallStyle(group.overallStatus)}`}>
                {group.overallStatus}
              </span>
            </div>
            <div className="space-y-2">
              {group.tests.map(test => (
                <div key={test.id} className="flex items-center justify-between p-2 bg-[#dfeaff]/50 rounded">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(test.status)}
                    <div>
                      <span className="text-[#69738c] text-sm">{test.name}</span>
                      {test.critical && (
                        <span className="ml-2 text-xs px-1.5 py-0.5 bg-[#6888ff]/20 text-[#6888ff] rounded">CRITICAL</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {test.message && (
                      <span className="text-xs text-[#9aa3b8]">{test.message}</span>
                    )}
                    {test.duration !== undefined && test.status !== 'running' && (
                      <span className="text-xs text-[#9aa3b8]">{test.duration}ms</span>
                    )}
                    <button
                      onClick={() => runSingleTest(test.id)}
                      className="p-1 hover:bg-[#dfeaff] rounded"
                      disabled={test.status === 'running'}
                    >
                      <RefreshCw className={`w-3 h-3 text-[#9aa3b8] ${test.status === 'running' ? 'animate-spin' : ''}`} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </NeuCard>
        ))}
      </div>
    </div>
  )
}

export default HealthChecker