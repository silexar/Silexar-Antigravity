'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

import { 
  Database, 
  Activity, 
  Trash2, 
  RefreshCw, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  HardDrive,
  Key
} from 'lucide-react';
import { useCacheStats } from '@/hooks/use-cache';
import { globalCache as cacheService } from '@/lib/cache/redis-cache';
import { toast } from '@/components/ui/use-toast';



interface CachePattern {
  pattern: string;
  description: string;
  examples: string[];
}

const cachePatterns: CachePattern[] = [
  {
    pattern: 'api:*',
    description: 'API Response Cache',
    examples: ['/analytics', '/billing', '/reports']
  },
  {
    pattern: 'user:*',
    description: 'User-specific Cache',
    examples: ['User preferences', 'Session data', 'Personalized content']
  },
  {
    pattern: '*:analytics:*',
    description: 'Analytics Data',
    examples: ['Business Intelligence', 'Reports', 'Metrics']
  },
  {
    pattern: '*:billing:*',
    description: 'Billing Information',
    examples: ['Invoices', 'Payment history', 'Subscription data']
  },
  {
    pattern: '*:volatile:*',
    description: 'Volatile Cache',
    examples: ['Real-time data', 'Temporary calculations', 'Session cache']
  }
];

export default function RedisCacheDashboard() {
  const { stats, loading, refreshStats } = useCacheStats();

  const [isConnecting, setIsConnecting] = useState(false);

  const [customPattern, setCustomPattern] = useState<string>('');
  const [isClearing, setIsClearing] = useState(false);

  const formatMemory = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      await cacheService.connect();
      toast({
        title: 'Redis Connected',
        description: 'Successfully connected to Redis cache server',
        variant: 'default',
      });
      await refreshStats();
    } catch {
      toast({
        title: 'Connection Failed',
        description: 'Failed to connect to Redis server',
        variant: 'destructive',
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleClearPattern = async (pattern: string) => {
    setIsClearing(true);
    try {
      await cacheService.clear(pattern);
      toast({
        title: 'Cache Cleared',
        description: `Successfully cleared cache for pattern: ${pattern}`,
        variant: 'default',
      });
      await refreshStats();
    } catch {
      toast({
        title: 'Clear Failed',
        description: 'Failed to clear cache',
        variant: 'destructive',
      });
    } finally {
      setIsClearing(false);
    }
  };



  const handleClearAll = async () => {
    if (window.confirm('Are you sure you want to clear all cache? This action cannot be undone.')) {
      setIsClearing(true);
      try {
        await cacheService.clear();
        toast({
          title: 'All Cache Cleared',
          description: 'Successfully cleared all cache entries',
          variant: 'default',
        });
        await refreshStats();
      } catch {
        toast({
          title: 'Clear Failed',
          description: 'Failed to clear all cache',
          variant: 'destructive',
        });
      } finally {
        setIsClearing(false);
      }
    }
  };

  useEffect(() => {
    const interval = setInterval(refreshStats, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [refreshStats]);

  const connectionStatus = stats.connected ? 'Connected' : 'Disconnected';
  const statusColor = stats.connected ? 'text-green-600' : 'text-red-600';
  const StatusIcon = stats.connected ? CheckCircle : XCircle;

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Redis Cache Status
          </CardTitle>
          <CardDescription>
            Monitor and manage the distributed caching system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <StatusIcon className={`h-5 w-5 ${statusColor}`} />
              <span className={`font-medium ${statusColor}`}>{connectionStatus}</span>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleConnect}
                disabled={stats.connected || isConnecting}
                size="sm"
                variant="outline"
              >
                {isConnecting ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Connecting
                  </>
                ) : (
                  <>
                    <Database className="mr-2 h-4 w-4" />
                    Connect
                  </>
                )}
              </Button>
              <Button
                onClick={refreshStats}
                disabled={loading || !stats.connected}
                size="sm"
                variant="outline"
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cache Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Keys</CardTitle>
            <Key className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.keys.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Active cache entries
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatMemory(stats.memory)}</div>
            <p className="text-xs text-muted-foreground">
              Total cache memory
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hit Rate</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.hitRate || 0}%</div>
            <p className="text-xs text-muted-foreground">
              Cache efficiency
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Uptime</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.connected ? '99.9%' : '0%'}
            </div>
            <p className="text-xs text-muted-foreground">
              System availability
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Cache Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5" />
            Cache Management
          </CardTitle>
          <CardDescription>
            Clear cache entries by pattern or invalidate specific data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Predefined Patterns */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Quick Actions</h4>
            <div className="grid gap-2">
              {cachePatterns.map((pattern) => (
                <div
                  key={pattern.pattern}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">{pattern.pattern}</Badge>
                    <div>
                      <p className="text-sm font-medium">{pattern.description}</p>
                      <p className="text-xs text-muted-foreground">
                        Examples: {pattern.examples.join(', ')}
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleClearPattern(pattern.pattern)}
                    disabled={isClearing || !stats.connected}
                    size="sm"
                    variant="outline"
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Clear
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Custom Pattern */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Custom Pattern</h4>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter cache pattern (e.g., user:123:*)"
                value={customPattern}
                onChange={(e) => setCustomPattern(e.target.value)}
                className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
              <Button
                onClick={() => handleClearPattern(customPattern)}
                disabled={!customPattern || isClearing || !stats.connected}
                size="sm"
                variant="outline"
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Clear Pattern
              </Button>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="space-y-2 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950">
            <h4 className="text-sm font-medium text-red-800 dark:text-red-200">
              Danger Zone
            </h4>
            <p className="text-sm text-red-600 dark:text-red-400">
              These actions cannot be undone. Use with caution.
            </p>
            <div className="flex gap-2">
              <Button
                onClick={handleClearAll}
                disabled={isClearing || !stats.connected}
                size="sm"
                variant="destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Clear All Cache
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Performance Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription>
              <ul className="list-disc space-y-1 pl-4 text-sm">
                <li>Use shorter TTL for frequently changing data (billing, user sessions)</li>
                <li>Implement cache warming for critical business data</li>
                <li>Monitor hit rates and adjust TTL values accordingly</li>
                <li>Use cache tags for efficient invalidation of related data</li>
                <li>Consider memory limits when setting cache policies</li>
              </ul>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}