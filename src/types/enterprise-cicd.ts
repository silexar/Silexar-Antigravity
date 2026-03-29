export interface DeploymentConfig {
  environment: 'development' | 'staging' | 'production';
  region: string;
  autoRollback: boolean;
  healthCheck: HealthCheckConfig;
  canary: CanaryConfig;
  blueGreen: BlueGreenConfig;
  monitoring: MonitoringConfig;
}

export interface HealthCheckConfig {
  enabled: boolean;
  interval: number;
  timeout: number;
  retries: number;
  endpoints: string[];
  successThreshold: number;
}

export interface CanaryConfig {
  enabled: boolean;
  percentage: number;
  duration: number;
  metrics: string[];
  rollbackThreshold: number;
}

export interface BlueGreenConfig {
  enabled: boolean;
  switchDelay: number;
  cleanupDelay: number;
  trafficSplit: number;
}

export interface MonitoringConfig {
  enabled: boolean;
  metricsInterval: number;
  alertThresholds: AlertThresholds;
  notificationChannels: string[];
}

export interface AlertThresholds {
  errorRate: number;
  responseTime: number;
  cpuUsage: number;
  memoryUsage: number;
  availability: number;
}

export interface DeploymentResult {
  success: boolean;
  deploymentId: string;
  version: string;
  timestamp: Date;
  duration: number;
  rollbackAvailable: boolean;
  healthStatus: HealthStatus;
  metrics: DeploymentMetrics;
}

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  checks: HealthCheck[];
  timestamp: Date;
}

export interface HealthCheck {
  name: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  responseTime: number;
  timestamp: Date;
}

export interface DeploymentMetrics {
  totalDeployments: number;
  successfulDeployments: number;
  failedDeployments: number;
  averageDeploymentTime: number;
  rollbackCount: number;
  availability: number;
}

export interface PipelineStage {
  name: string;
  status: 'pending' | 'running' | 'success' | 'failed' | 'skipped';
  startTime?: Date;
  endTime?: Date;
  duration?: number;
  logs: string[];
  artifacts: string[];
}

export interface RollbackPoint {
  environment: string;
  timestamp: Date;
  version: string;
  snapshot: {
    services: string[];
    configuration: DeploymentConfig;
    dataBackup: boolean;
  };
}

export interface MonitoringData {
  metrics: Record<string, unknown>[];
  alerts: Array<{
    timestamp: Date;
    messages: string[];
    severity: 'warning' | 'critical';
  }>;
}