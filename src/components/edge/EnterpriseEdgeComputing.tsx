import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Globe, 
  Server, 
  Zap, 
  Activity, 
  Network, 
  Shield,
  Cpu,
  HardDrive,
  Wifi,
  RadioTower,
  Satellite,
  MapPin,
  Clock,
  TrendingUp,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

interface EdgeNode {
  id: string;
  region: string;
  location: {
    city: string;
    country: string;
    lat: number;
    lng: number;
  };
  status: 'online' | 'offline' | 'degraded';
  performance: {
    cpu: number;
    memory: number;
    network: number;
    latency: number;
  };
  load: {
    current: number;
    capacity: number;
    efficiency: number;
  };
  lastHeartbeat: number;
  version: string;
  capabilities: string[];
}

interface EdgeMetrics {
  totalNodes: number;
  onlineNodes: number;
  avgLatency: number;
  totalRequests: number;
  requestsPerSecond: number;
  dataProcessed: string;
  efficiency: number;
  coverage: {
    regions: number;
    countries: number;
    cities: number;
  };
}

interface EdgeAlert {
  id: string;
  type: 'node_offline' | 'high_latency' | 'overload' | 'version_mismatch';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  description: string;
  nodeId?: string;
  region?: string;
  timestamp: number;
}

export default function EnterpriseEdgeComputing() {
  const [edgeNodes, setEdgeNodes] = useState<EdgeNode[]>([
    {
      id: 'edge-us-east-1',
      region: 'us-east-1',
      location: { city: 'Ashburn', country: 'USA', lat: 39.0438, lng: -77.4874 },
      status: 'online',
      performance: { cpu: 45, memory: 62, network: 89, latency: 12 },
      load: { current: 2341, capacity: 5000, efficiency: 87 },
      lastHeartbeat: Date.now(),
      version: 'v2.1.4',
      capabilities: ['compute', 'cache', 'ml', 'analytics']
    },
    {
      id: 'edge-us-west-2',
      region: 'us-west-2',
      location: { city: 'Oregon', country: 'USA', lat: 45.5152, lng: -122.6784 },
      status: 'online',
      performance: { cpu: 38, memory: 55, network: 92, latency: 18 },
      load: { current: 1876, capacity: 5000, efficiency: 91 },
      lastHeartbeat: Date.now(),
      version: 'v2.1.4',
      capabilities: ['compute', 'cache', 'ml', 'analytics', 'storage']
    },
    {
      id: 'edge-eu-west-1',
      region: 'eu-west-1',
      location: { city: 'Dublin', country: 'Ireland', lat: 53.3498, lng: -6.2603 },
      status: 'online',
      performance: { cpu: 52, memory: 68, network: 85, latency: 25 },
      load: { current: 3124, capacity: 5000, efficiency: 84 },
      lastHeartbeat: Date.now(),
      version: 'v2.1.4',
      capabilities: ['compute', 'cache', 'ml']
    },
    {
      id: 'edge-ap-southeast-1',
      region: 'ap-southeast-1',
      location: { city: 'Singapore', country: 'Singapore', lat: 1.3521, lng: 103.8198 },
      status: 'degraded',
      performance: { cpu: 78, memory: 82, network: 67, latency: 45 },
      load: { current: 4231, capacity: 5000, efficiency: 72 },
      lastHeartbeat: Date.now() - 30000,
      version: 'v2.1.3',
      capabilities: ['compute', 'cache']
    }
  ]);

  const [metrics, setMetrics] = useState<EdgeMetrics>({
    totalNodes: 4,
    onlineNodes: 3,
    avgLatency: 25,
    totalRequests: 124783,
    requestsPerSecond: 145.7,
    dataProcessed: '2.3 TB',
    efficiency: 83.5,
    coverage: {
      regions: 4,
      countries: 3,
      cities: 4
    }
  });

  const [alerts, setAlerts] = useState<EdgeAlert[]>([]);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [autoRebalance, setAutoRebalance] = useState(true);

  const simulateEdgeNodeUpdates = useCallback(() => {
    setEdgeNodes(prev => prev.map(node => {
      const loadVariation = (Math.random() - 0.5) * 200;
      const performanceVariation = (Math.random() - 0.5) * 5;
      
      return {
        ...node,
        performance: {
          cpu: Math.max(0, Math.min(100, node.performance.cpu + performanceVariation)),
          memory: Math.max(0, Math.min(100, node.performance.memory + performanceVariation)),
          network: Math.max(0, Math.min(100, node.performance.network + performanceVariation)),
          latency: Math.max(5, node.performance.latency + (Math.random() - 0.5) * 10)
        },
        load: {
          ...node.load,
          current: Math.max(100, Math.min(node.load.capacity, node.load.current + loadVariation)),
          efficiency: Math.max(0, Math.min(100, node.load.efficiency + (Math.random() - 0.5) * 3))
        },
        lastHeartbeat: Date.now(),
        status: node.performance.cpu > 85 || node.performance.memory > 85 ? 'degraded' : 'online'
      };
    }));
  }, []);

  const generateEdgeAlerts = useCallback(() => {
    const newAlerts: EdgeAlert[] = [];
    const now = Date.now();

    edgeNodes.forEach(node => {
      // Node offline alert
      if (now - node.lastHeartbeat > 60000) {
        newAlerts.push({
          id: `offline-${node.id}-${now}`,
          type: 'node_offline',
          severity: 'critical',
          title: 'Edge Node Offline',
          description: `Edge node ${node.id} in ${node.location.city} has been offline for ${Math.floor((now - node.lastHeartbeat) / 1000)}s`,
          nodeId: node.id,
          region: node.region,
          timestamp: now
        });
      }

      // High latency alert
      if (node.performance.latency > 50) {
        newAlerts.push({
          id: `latency-${node.id}-${now}`,
          type: 'high_latency',
          severity: node.performance.latency > 100 ? 'critical' : 'warning',
          title: 'High Edge Latency',
          description: `Edge node ${node.id} latency is ${node.performance.latency.toFixed(0)}ms`,
          nodeId: node.id,
          region: node.region,
          timestamp: now
        });
      }

      // Overload alert
      if (node.load.efficiency < 70) {
        newAlerts.push({
          id: `overload-${node.id}-${now}`,
          type: 'overload',
          severity: node.load.efficiency < 50 ? 'critical' : 'warning',
          title: 'Edge Node Overloaded',
          description: `Edge node ${node.id} efficiency dropped to ${node.load.efficiency.toFixed(1)}%`,
          nodeId: node.id,
          region: node.region,
          timestamp: now
        });
      }

      // Version mismatch alert
      if (node.version !== 'v2.1.4') {
        newAlerts.push({
          id: `version-${node.id}-${now}`,
          type: 'version_mismatch',
          severity: 'warning',
          title: 'Version Mismatch',
          description: `Edge node ${node.id} is running outdated version ${node.version}`,
          nodeId: node.id,
          region: node.region,
          timestamp: now
        });
      }
    });

    if (newAlerts.length > 0) {
      setAlerts(prev => [...newAlerts, ...prev].slice(0, 10));
    }
  }, [edgeNodes]);

  useEffect(() => {
    const interval = setInterval(() => {
      simulateEdgeNodeUpdates();
      generateEdgeAlerts();
      
      // Update metrics
      setMetrics(prev => ({
        ...prev,
        onlineNodes: edgeNodes.filter(n => n.status === 'online').length,
        avgLatency: edgeNodes.reduce((sum, n) => sum + n.performance.latency, 0) / edgeNodes.length,
        requestsPerSecond: prev.requestsPerSecond + (Math.random() - 0.5) * 10,
        efficiency: edgeNodes.reduce((sum, n) => sum + n.load.efficiency, 0) / edgeNodes.length
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, [simulateEdgeNodeUpdates, generateEdgeAlerts, edgeNodes]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-green-600 bg-green-100';
      case 'degraded': return 'text-yellow-600 bg-yellow-100';
      case 'offline': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online': return <CheckCircle className="h-4 w-4" />;
      case 'degraded': return <AlertTriangle className="h-4 w-4" />;
      case 'offline': return <RadioTower className="h-4 w-4" />;
      default: return <Server className="h-4 w-4" />;
    }
  };

  const handleRebalance = () => {
    setEdgeNodes(prev => prev.map(node => ({
      ...node,
      load: {
        ...node.load,
        current: Math.floor(metrics.totalRequests / metrics.onlineNodes),
        efficiency: 85 + Math.random() * 10
      }
    })));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Enterprise Edge Computing</h1>
          <p className="text-muted-foreground">Distributed Processing & Global Edge Network</p>
        </div>
        <div className="flex gap-2">
          <Badge variant={autoRebalance ? "default" : "secondary"}>
            <Zap className="mr-1 h-3 w-3" />
            AUTO-REBALANCE
          </Badge>
          <Badge variant="outline">
            <Globe className="mr-1 h-3 w-3" />
            {metrics.coverage.regions} REGIONS
          </Badge>
        </div>
      </div>

      {/* Global Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Edge Nodes</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.onlineNodes}/{metrics.totalNodes}</div>
            <p className="text-xs text-muted-foreground">Online nodes</p>
            <Progress value={(metrics.onlineNodes / metrics.totalNodes) * 100} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Latency</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.avgLatency.toFixed(0)}ms</div>
            <p className="text-xs text-muted-foreground">Global average</p>
            <Progress value={Math.max(0, 100 - (metrics.avgLatency / 100) * 100)} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Request Rate</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.requestsPerSecond.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">Requests/second</p>
            <Progress value={Math.min(100, (metrics.requestsPerSecond / 200) * 100)} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Efficiency</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.efficiency.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">System efficiency</p>
            <Progress value={metrics.efficiency} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Edge Nodes Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {edgeNodes.map((node) => (
          <Card 
            key={node.id} 
            className={`cursor-pointer transition-all ${
              selectedNode === node.id ? 'ring-2 ring-blue-500' : ''
            }`}
            onClick={() => setSelectedNode(selectedNode === node.id ? null : node.id)}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {node.location.city}
              </CardTitle>
              <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(node.status)}`}>
                {getStatusIcon(node.status)}
                {node.status.toUpperCase()}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-xs text-muted-foreground">
                  {node.location.country} • {node.region}
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>CPU:</span>
                    <span>{node.performance.cpu.toFixed(0)}%</span>
                  </div>
                  <Progress value={node.performance.cpu} className="h-1" />
                  
                  <div className="flex justify-between text-xs">
                    <span>Memory:</span>
                    <span>{node.performance.memory.toFixed(0)}%</span>
                  </div>
                  <Progress value={node.performance.memory} className="h-1" />
                  
                  <div className="flex justify-between text-xs">
                    <span>Latency:</span>
                    <span>{node.performance.latency.toFixed(0)}ms</span>
                  </div>
                  <Progress 
                    value={Math.max(0, 100 - (node.performance.latency / 100) * 100)} 
                    className="h-1" 
                  />
                </div>

                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Load: {node.load.current.toLocaleString()}</span>
                  <span>Eff: {node.load.efficiency.toFixed(0)}%</span>
                </div>

                {selectedNode === node.id && (
                  <div className="pt-2 border-t">
                    <div className="text-xs space-y-1">
                      <div>Version: {node.version}</div>
                      <div>Capabilities: {node.capabilities.join(', ')}</div>
                      <div>Last heartbeat: {new Date(node.lastHeartbeat).toLocaleTimeString()}</div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Control Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Network className="h-5 w-5" />
            Edge Network Controls
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 flex-wrap">
            <Button onClick={handleRebalance} variant="default">
              <Zap className="mr-2 h-4 w-4" />
              Rebalance Load
            </Button>
            <Button 
              onClick={() => setAutoRebalance(!autoRebalance)}
              variant={autoRebalance ? "default" : "outline"}
            >
              <Activity className="mr-2 h-4 w-4" />
              Auto-Rebalance: {autoRebalance ? 'ON' : 'OFF'}
            </Button>
            <Button variant="outline">
              <Shield className="mr-2 h-4 w-4" />
              Health Check
            </Button>
            <Button variant="outline">
              <MapPin className="mr-2 h-4 w-4" />
              Deploy New Node
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Edge Network Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          {alerts.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <CheckCircle className="h-8 w-8 mx-auto mb-2" />
              <p>No active alerts</p>
              <p className="text-sm">All edge nodes operating normally</p>
            </div>
          ) : (
            <div className="space-y-3">
              {alerts.map((alert) => (
                <Alert key={alert.id}>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    <div>
                      <AlertTitle>{alert.title}</AlertTitle>
                      <AlertDescription>{alert.description}</AlertDescription>
                      <div className="text-xs text-muted-foreground mt-1">
                        {alert.region} • {new Date(alert.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                </Alert>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}