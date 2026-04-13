import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  TrendingUp, 
  Activity, 
  AlertTriangle, 
  Zap, 
  Shield,
  Globe,
  Server,
  Cpu,
  MemoryStick,
  HardDrive,
  Network,
  Clock,
  CheckCircle,
  Bell,
  Settings,
  BarChart3,
  Eye,
  Target,
  Radar
} from 'lucide-react';

interface PredictiveMetrics {
  timestamp: number;
  cpu: {
    current: number;
    predicted: number;
    confidence: number;
    trend: 'up' | 'down' | 'stable';
    anomalyScore: number;
  };
  memory: {
    current: number;
    predicted: number;
    confidence: number;
    trend: 'up' | 'down' | 'stable';
    anomalyScore: number;
  };
  responseTime: {
    current: number;
    predicted: number;
    confidence: number;
    trend: 'up' | 'down' | 'stable';
    anomalyScore: number;
  };
  errorRate: {
    current: number;
    predicted: number;
    confidence: number;
    trend: 'up' | 'down' | 'stable';
    anomalyScore: number;
  };
  scaling: {
    predictedInstances: number;
    confidence: number;
    estimatedCostImpact: number;
    recommendation: string;
  };
  anomalyDetection: {
    totalAnomalies: number;
    criticalAnomalies: number;
    anomalyScore: number;
    patterns: string[];
  };
}

interface PredictiveAlert {
  id: string;
  type: 'prediction' | 'anomaly' | 'recommendation' | 'foresight';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  description: string;
  timestamp: number;
  confidence: number;
  component: string;
  predictedTime?: number;
  recommendation?: string;
}

export default function AdvancedPredictiveMonitoring() {
  const [metrics, setMetrics] = useState<PredictiveMetrics>({
    timestamp: Date.now(),
    cpu: {
      current: 45,
      predicted: 52,
      confidence: 94.5,
      trend: 'up',
      anomalyScore: 0.12
    },
    memory: {
      current: 62,
      predicted: 68,
      confidence: 91.2,
      trend: 'up',
      anomalyScore: 0.08
    },
    responseTime: {
      current: 234,
      predicted: 280,
      confidence: 87.3,
      trend: 'up',
      anomalyScore: 0.15
    },
    errorRate: {
      current: 0.8,
      predicted: 1.2,
      confidence: 89.7,
      trend: 'up',
      anomalyScore: 0.21
    },
    scaling: {
      predictedInstances: 6,
      confidence: 92.1,
      estimatedCostImpact: 45,
      recommendation: 'Scale up in next 15 minutes'
    },
    anomalyDetection: {
      totalAnomalies: 3,
      criticalAnomalies: 0,
      anomalyScore: 0.18,
      patterns: ['Gradual CPU increase', 'Memory pattern change', 'Response time drift']
    }
  });

  const [alerts, setAlerts] = useState<PredictiveAlert[]>([]);
  const [isPredicting, setIsPredicting] = useState(false);
  const [predictionInterval, setPredictionInterval] = useState(5); // minutes
  const [showConfidence, setShowConfidence] = useState(true);
  const [autoScaling, setAutoScaling] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const generatePredictiveAlerts = useCallback((currentMetrics: PredictiveMetrics): PredictiveAlert[] => {
    const newAlerts: PredictiveAlert[] = [];
    const now = Date.now();

    // CPU Prediction Alert
    if (currentMetrics.cpu.predicted > 80 && currentMetrics.cpu.confidence > 85) {
      newAlerts.push({
        id: `cpu-prediction-${now}`,
        type: 'prediction',
        severity: currentMetrics.cpu.predicted > 90 ? 'critical' : 'warning',
        title: 'CPU Usage Predicted to Increase',
        description: `CPU predicted to reach ${currentMetrics.cpu.predicted.toFixed(1)}% in ${predictionInterval} minutes`,
        timestamp: now,
        confidence: currentMetrics.cpu.confidence,
        component: 'CPU',
        predictedTime: now + (predictionInterval * 60 * 1000),
        recommendation: 'Consider scaling up instances or optimizing workload distribution'
      });
    }

    // Memory Prediction Alert
    if (currentMetrics.memory.predicted > 85 && currentMetrics.memory.confidence > 85) {
      newAlerts.push({
        id: `memory-prediction-${now}`,
        type: 'prediction',
        severity: currentMetrics.memory.predicted > 95 ? 'critical' : 'warning',
        title: 'Memory Usage Predicted to Increase',
        description: `Memory predicted to reach ${currentMetrics.memory.predicted.toFixed(1)}% in ${predictionInterval} minutes`,
        timestamp: now,
        confidence: currentMetrics.memory.confidence,
        component: 'Memory',
        predictedTime: now + (predictionInterval * 60 * 1000),
        recommendation: 'Consider memory optimization or scaling'
      });
    }

    // Response Time Prediction
    if (currentMetrics.responseTime.predicted > 500 && currentMetrics.responseTime.confidence > 80) {
      newAlerts.push({
        id: `response-prediction-${now}`,
        type: 'prediction',
        severity: currentMetrics.responseTime.predicted > 1000 ? 'critical' : 'warning',
        title: 'Response Time Predicted to Degrade',
        description: `Response time predicted to reach ${currentMetrics.responseTime.predicted.toFixed(0)}ms in ${predictionInterval} minutes`,
        timestamp: now,
        confidence: currentMetrics.responseTime.confidence,
        component: 'Performance',
        predictedTime: now + (predictionInterval * 60 * 1000),
        recommendation: 'Check for bottlenecks or scale resources'
      });
    }

    // Anomaly Detection Alerts
    if (currentMetrics.anomalyDetection.anomalyScore > 0.3) {
      newAlerts.push({
        id: `anomaly-${now}`,
        type: 'anomaly',
        severity: currentMetrics.anomalyDetection.anomalyScore > 0.5 ? 'critical' : 'warning',
        title: 'Anomalous Behavior Detected',
        description: `Anomaly score: ${(currentMetrics.anomalyDetection.anomalyScore * 100).toFixed(1)}% - ${currentMetrics.anomalyDetection.patterns.join(', ')}`,
        timestamp: now,
        confidence: 95,
        component: 'AI Detection',
        recommendation: 'Review system behavior and investigate potential issues'
      });
    }

    // Auto-scaling Recommendation
    if (autoScaling && currentMetrics.scaling.confidence > 90) {
      newAlerts.push({
        id: `scaling-${now}`,
        type: 'recommendation',
        severity: 'info',
        title: 'Auto-Scaling Recommendation',
        description: currentMetrics.scaling.recommendation,
        timestamp: now,
        confidence: currentMetrics.scaling.confidence,
        component: 'Auto-Scaling',
        recommendation: `Scale to ${currentMetrics.scaling.predictedInstances} instances (Cost impact: $${currentMetrics.scaling.estimatedCostImpact}/hr)`
      });
    }

    return newAlerts;
  }, [predictionInterval, autoScaling]);

  const updatePredictiveMetrics = useCallback(() => {
    setIsPredicting(true);
    
    setTimeout(() => {
      setMetrics(prev => {
        const variation = (Math.random() - 0.5) * 10;
        const confidenceVariation = (Math.random() - 0.5) * 5;
        
        const newMetrics: PredictiveMetrics = {
          timestamp: Date.now(),
          cpu: {
            current: Math.max(0, Math.min(100, prev.cpu.current + variation)),
            predicted: Math.max(0, Math.min(100, prev.cpu.predicted + variation * 0.8)),
            confidence: Math.max(70, Math.min(99, prev.cpu.confidence + confidenceVariation)),
            trend: variation > 2 ? 'up' : variation < -2 ? 'down' : 'stable',
            anomalyScore: Math.random() * 0.3
          },
          memory: {
            current: Math.max(0, Math.min(100, prev.memory.current + variation * 0.7)),
            predicted: Math.max(0, Math.min(100, prev.memory.predicted + variation * 0.6)),
            confidence: Math.max(70, Math.min(99, prev.memory.confidence + confidenceVariation)),
            trend: variation > 1.5 ? 'up' : variation < -1.5 ? 'down' : 'stable',
            anomalyScore: Math.random() * 0.25
          },
          responseTime: {
            current: Math.max(50, prev.responseTime.current + variation * 5),
            predicted: Math.max(50, prev.responseTime.predicted + variation * 4),
            confidence: Math.max(70, Math.min(99, prev.responseTime.confidence + confidenceVariation)),
            trend: variation > 1 ? 'up' : variation < -1 ? 'down' : 'stable',
            anomalyScore: Math.random() * 0.2
          },
          errorRate: {
            current: Math.max(0, Math.min(10, prev.errorRate.current + variation * 0.1)),
            predicted: Math.max(0, Math.min(10, prev.errorRate.predicted + variation * 0.08)),
            confidence: Math.max(70, Math.min(99, prev.errorRate.confidence + confidenceVariation)),
            trend: variation > 0.5 ? 'up' : variation < -0.5 ? 'down' : 'stable',
            anomalyScore: Math.random() * 0.15
          },
          scaling: {
            predictedInstances: Math.max(2, Math.min(20, prev.scaling.predictedInstances + Math.floor(variation / 5))),
            confidence: Math.max(70, Math.min(99, prev.scaling.confidence + confidenceVariation)),
            estimatedCostImpact: Math.max(10, prev.scaling.estimatedCostImpact + variation * 2),
            recommendation: prev.scaling.recommendation
          },
          anomalyDetection: {
            totalAnomalies: Math.floor(Math.random() * 8),
            criticalAnomalies: Math.floor(Math.random() * 2),
            anomalyScore: Math.random() * 0.5,
            patterns: ['Gradual CPU increase', 'Memory pattern change', 'Response time drift', 'Error rate fluctuation']
          }
        };

        // Generate new alerts
        const newAlerts = generatePredictiveAlerts(newMetrics);
        if (newAlerts.length > 0) {
          setAlerts(prev => [...newAlerts, ...prev].slice(0, 15));
        }

        return newMetrics;
      });
      
      setIsPredicting(false);
    }, 1000);
  }, [generatePredictiveAlerts]);

  useEffect(() => {
    updatePredictiveMetrics();
    intervalRef.current = setInterval(updatePredictiveMetrics, 30000); // Update every 30 seconds

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [updatePredictiveMetrics]);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-red-500" />;
      case 'down': return <TrendingUp className="h-4 w-4 text-green-500 rotate-180" />;
      case 'stable': return <Activity className="h-4 w-4 text-blue-500" />;
      default: return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'prediction': return <Eye className="h-4 w-4 text-blue-500" />;
      case 'anomaly': return <Radar className="h-4 w-4 text-orange-500" />;
      case 'recommendation': return <Target className="h-4 w-4 text-green-500" />;
      case 'foresight': return <Brain className="h-4 w-4 text-purple-500" />;
      default: return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'border-red-500 bg-red-50';
      case 'warning': return 'border-yellow-500 bg-yellow-50';
      case 'info': return 'border-blue-500 bg-blue-50';
      default: return 'border-gray-500 bg-gray-50';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Advanced Predictive Monitoring</h1>
          <p className="text-muted-foreground">AI-Powered Predictive Analytics & Anomaly Detection</p>
        </div>
        <div className="flex gap-2">
          <Badge variant={isPredicting ? "default" : "secondary"}>
            {isPredicting ? (
              <>
                <Brain className="mr-1 h-3 w-3 animate-pulse" />
                PREDICTING...
              </>
            ) : (
              <>
                <CheckCircle className="mr-1 h-3 w-3" />
                AI ACTIVE
              </>
            )}
          </Badge>
          <Badge variant="outline">
            <Zap className="mr-1 h-3 w-3" />
            NEXT-GEN AI
          </Badge>
        </div>
      </div>

      {/* Control Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            AI Prediction Controls
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-center flex-wrap">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Prediction Interval:</label>
              <select 
                value={predictionInterval} 
                onChange={(e) => setPredictionInterval(Number(e.target.value))}
                className="px-2 py-1 border rounded text-sm"
              >
                <option value={1}>1 min</option>
                <option value={5}>5 min</option>
                <option value={10}>10 min</option>
                <option value={15}>15 min</option>
                <option value={30}>30 min</option>
              </select>
            </div>
            
            <Button
              variant={autoScaling ? "default" : "outline"}
              size="sm"
              onClick={() => setAutoScaling(!autoScaling)}
            >
              <Zap className="mr-1 h-3 w-3" />
              Auto-Scaling AI
            </Button>
            
            <Button
              variant={showConfidence ? "default" : "outline"}
              size="sm"
              onClick={() => setShowConfidence(!showConfidence)}
            >
              <BarChart3 className="mr-1 h-3 w-3" />
              Show Confidence
            </Button>
            
            <Button
              size="sm"
              onClick={updatePredictiveMetrics}
              disabled={isPredicting}
            >
              {isPredicting ? (
                <>
                  <Clock className="mr-1 h-3 w-3 animate-spin" />
                  Predicting...
                </>
              ) : (
                <>
                  <Brain className="mr-1 h-3 w-3" />
                  Run Prediction
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Predictive Metrics Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* CPU Prediction */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CPU Prediction</CardTitle>
            <Cpu className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold">{metrics.cpu.predicted.toFixed(1)}%</span>
                {getTrendIcon(metrics.cpu.trend)}
              </div>
              <div className="space-y-1 text-xs text-muted-foreground">
                <div className="flex justify-between">
                  <span>Current:</span>
                  <span>{metrics.cpu.current.toFixed(1)}%</span>
                </div>
                {showConfidence && (
                  <div className="flex justify-between">
                    <span>Confidence:</span>
                    <span>{metrics.cpu.confidence.toFixed(1)}%</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Anomaly:</span>
                  <span>{(metrics.cpu.anomalyScore * 100).toFixed(1)}%</span>
                </div>
              </div>
              <Progress value={metrics.cpu.predicted} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Memory Prediction */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Memory Prediction</CardTitle>
            <MemoryStick className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold">{metrics.memory.predicted.toFixed(1)}%</span>
                {getTrendIcon(metrics.memory.trend)}
              </div>
              <div className="space-y-1 text-xs text-muted-foreground">
                <div className="flex justify-between">
                  <span>Current:</span>
                  <span>{metrics.memory.current.toFixed(1)}%</span>
                </div>
                {showConfidence && (
                  <div className="flex justify-between">
                    <span>Confidence:</span>
                    <span>{metrics.memory.confidence.toFixed(1)}%</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Anomaly:</span>
                  <span>{(metrics.memory.anomalyScore * 100).toFixed(1)}%</span>
                </div>
              </div>
              <Progress value={metrics.memory.predicted} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Response Time Prediction */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Time</CardTitle>
            <Network className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold">{metrics.responseTime.predicted.toFixed(0)}ms</span>
                {getTrendIcon(metrics.responseTime.trend)}
              </div>
              <div className="space-y-1 text-xs text-muted-foreground">
                <div className="flex justify-between">
                  <span>Current:</span>
                  <span>{metrics.responseTime.current.toFixed(0)}ms</span>
                </div>
                {showConfidence && (
                  <div className="flex justify-between">
                    <span>Confidence:</span>
                    <span>{metrics.responseTime.confidence.toFixed(1)}%</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Anomaly:</span>
                  <span>{(metrics.responseTime.anomalyScore * 100).toFixed(1)}%</span>
                </div>
              </div>
              <Progress 
                value={Math.min(100, (metrics.responseTime.predicted / 1000) * 100)} 
                className="h-2" 
              />
            </div>
          </CardContent>
        </Card>

        {/* Scaling Prediction */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Auto-Scaling</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold">{metrics.scaling.predictedInstances}</span>
                <span className="text-xs text-muted-foreground">instances</span>
              </div>
              <div className="space-y-1 text-xs text-muted-foreground">
                <div className="flex justify-between">
                  <span>Confidence:</span>
                  <span>{metrics.scaling.confidence.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Cost Impact:</span>
                  <span>${metrics.scaling.estimatedCostImpact}/hr</span>
                </div>
              </div>
              <div className="text-xs text-green-600 font-medium">
                {metrics.scaling.recommendation}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Anomaly Detection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Radar className="h-5 w-5" />
            AI Anomaly Detection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-500">
                {metrics.anomalyDetection.totalAnomalies}
              </div>
              <div className="text-sm text-muted-foreground">Total Anomalies</div>
              <Progress 
                value={(metrics.anomalyDetection.totalAnomalies / 10) * 100} 
                className="mt-2" 
              />
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-500">
                {metrics.anomalyDetection.criticalAnomalies}
              </div>
              <div className="text-sm text-muted-foreground">Critical</div>
              <Progress 
                value={(metrics.anomalyDetection.criticalAnomalies / 5) * 100} 
                className="mt-2" 
              />
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-500">
                {(metrics.anomalyDetection.anomalyScore * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-muted-foreground">Anomaly Score</div>
              <Progress 
                value={metrics.anomalyDetection.anomalyScore * 100} 
                className="mt-2" 
              />
            </div>
          </div>
          
          <div className="mt-4">
            <h4 className="font-medium mb-2">Detected Patterns:</h4>
            <div className="flex flex-wrap gap-2">
              {metrics.anomalyDetection.patterns.slice(0, 3).map((pattern, index) => (
                <Badge key={`${pattern}-${index}`} variant="outline" className="text-xs">
                  {pattern}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Predictive Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            AI Predictive Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          {alerts.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No predictive alerts at this time</p>
              <p className="text-sm">System is operating within normal parameters</p>
            </div>
          ) : (
            <div className="space-y-3">
              {alerts.map((alert) => (
                <Alert key={alert.id} className={getSeverityColor(alert.severity)}>
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      {getAlertIcon(alert.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <AlertTitle className="text-sm font-semibold">{alert.title}</AlertTitle>
                        <Badge variant="outline" className="text-xs">
                          {alert.confidence.toFixed(0)}% confidence
                        </Badge>
                      </div>
                      <AlertDescription className="text-sm">
                        {alert.description}
                      </AlertDescription>
                      {alert.recommendation && (
                        <div className="mt-2 p-2 bg-blue-100 rounded text-xs text-blue-800">
                          <strong>Recommendation:</strong> {alert.recommendation}
                        </div>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span>{alert.component}</span>
                        <span>•</span>
                        <span>{new Date(alert.timestamp).toLocaleTimeString()}</span>
                        {alert.predictedTime && (
                          <>
                            <span>•</span>
                            <span>Predicted: {new Date(alert.predictedTime).toLocaleTimeString()}</span>
                          </>
                        )}
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