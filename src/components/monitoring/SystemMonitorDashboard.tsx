'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  MemoryStick, 
  Users, 
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react'
import { systemMonitor, SystemMetrics } from '@/lib/monitoring/system-monitor'

interface MetricCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  trend?: 'up' | 'down' | 'stable'
  trendValue?: string
  description?: string
}

function MetricCard({ title, value, icon, trend, trendValue, description }: MetricCardProps) {
  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />
      case 'stable':
        return <Minus className="h-4 w-4 text-yellow-500" />
      default:
        return null
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {trend && (
          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
            {getTrendIcon()}
            <span>{trendValue}</span>
          </div>
        )}
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  )
}

interface ErrorLogProps {
  errors: SystemMetrics['errors']['recent']
}

function ErrorLog({ errors }: ErrorLogProps) {
  if (errors.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">System Errors</CardTitle>
          <CardDescription>No recent errors detected</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <CheckCircle className="h-12 w-12 text-green-500" />
            <span className="ml-2 text-sm text-muted-foreground">All systems operational</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Recent Errors</CardTitle>
        <CardDescription>Last {errors.length} system errors</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {errors.map((error, index) => (
            <Alert key={`${error}-${index}`} variant={error.type === 'error' ? 'destructive' : 'default'}>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle className="text-sm">
                {error.type.toUpperCase()} - {new Date(error.timestamp).toLocaleTimeString()}
              </AlertTitle>
              <AlertDescription className="text-xs">
                {error.message}
              </AlertDescription>
            </Alert>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default function SystemMonitorDashboard() {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null)
  const [isMonitoring, setIsMonitoring] = useState(false)
  const [uptime, setUptime] = useState('0s')

  useEffect(() => {
    // Subscribe to metrics updates
    const unsubscribe = systemMonitor.subscribe((newMetrics) => {
      setMetrics(newMetrics)
    })

    // Get initial metrics
    const initialMetrics = systemMonitor.getMetrics()
    setMetrics(initialMetrics)

    // Start monitoring if not already running
    if (typeof window !== 'undefined') {
      systemMonitor.start()
      setIsMonitoring(true)
    }

    return () => {
      unsubscribe()
    }
  }, [])

  useEffect(() => {
    const updateUptime = () => {
      const uptimeMs = systemMonitor.getUptime()
      setUptime(formatUptime(uptimeMs))
    }

    updateUptime()
    const interval = setInterval(updateUptime, 1000)

    return () => clearInterval(interval)
  }, [])

  const formatUptime = useCallback((ms: number): string => {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days}d ${hours % 24}h`
    if (hours > 0) return `${hours}h ${minutes % 60}m`
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`
    return `${seconds}s`
  }, [])

  const formatBytes = useCallback((bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }, [])

  const formatTime = useCallback((ms: number): string => {
    if (ms < 1000) return `${ms.toFixed(0)}ms`
    return `${(ms / 1000).toFixed(1)}s`
  }, [])

  const handleToggleMonitoring = useCallback(() => {
    if (isMonitoring) {
      systemMonitor.stop()
      setIsMonitoring(false)
    } else {
      systemMonitor.start()
      setIsMonitoring(true)
    }
  }, [isMonitoring])

  const handleReset = useCallback(() => {
    systemMonitor.reset()
  }, [])

  if (!metrics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Loading system metrics...</p>
        </div>
      </div>
    )
  }

  const memoryStatus = useMemo(() => (
    metrics.memory.percentage > 85 ? 'destructive' : 
    metrics.memory.percentage > 70 ? 'secondary' : 'default'
  ), [metrics.memory.percentage])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">System Monitor</h2>
          <p className="text-muted-foreground">
            Real-time system performance and health monitoring
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={isMonitoring ? 'default' : 'secondary'}>
            {isMonitoring ? 'Monitoring' : 'Stopped'}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={handleToggleMonitoring}
          >
            {isMonitoring ? 'Stop' : 'Start'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Memory Usage"
          value={`${metrics.memory.percentage.toFixed(1)}%`}
          icon={<MemoryStick className="h-4 w-4 text-muted-foreground" />}
          description={formatBytes(metrics.memory.used)}
        />
        
        <MetricCard
          title="Load Time"
          value={formatTime(metrics.performance.loadTime)}
          icon={<Clock className="h-4 w-4 text-muted-foreground" />}
          description="Page load time"
        />
        
        <MetricCard
          title="API Response"
          value={formatTime(metrics.performance.apiResponseTime)}
          icon={<Activity className="h-4 w-4 text-muted-foreground" />}
          description="Average API response"
        />
        
        <MetricCard
          title="Active Sessions"
          value={metrics.user.activeSessions}
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
          description={`${metrics.user.totalInteractions} total interactions`}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Memory Usage</CardTitle>
            <CardDescription>
              {formatBytes(metrics.memory.used)} of {formatBytes(metrics.memory.total)} used
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress 
              value={metrics.memory.percentage} 
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>0%</span>
              <span className={metrics.memory.percentage > 85 ? 'text-destructive' : ''}>
                {metrics.memory.percentage.toFixed(1)}%
              </span>
              <span>100%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">System Uptime</CardTitle>
            <CardDescription>Time since monitoring started</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{uptime}</div>
            <p className="text-sm text-muted-foreground mt-1">
              Started at {new Date(Date.now() - systemMonitor.getUptime()).toLocaleTimeString()}
            </p>
          </CardContent>
        </Card>
      </div>

      <ErrorLog errors={metrics.errors.recent} />
    </div>
  )
}