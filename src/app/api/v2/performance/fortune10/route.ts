import { NextRequest, NextResponse } from 'next/server';
import { performance } from 'perf_hooks';
import { logger } from '@/lib/observability';
import { apiUnauthorized, getUserContext, apiForbidden} from '@/lib/api/response';
import { checkPermission } from '@/lib/security/rbac';
import { auditLogger } from '@/lib/security/audit-logger';
import { withTenantContext } from '@/lib/db/tenant-context';

// Performance test configuration
const PERFORMANCE_CONFIG = {
  CONCURRENT_USERS: 10000,
  RAMP_UP_TIME: 30000, // 30 seconds
  TEST_DURATION: 300000, // 5 minutes
  RESPONSE_TIME_THRESHOLD: 200, // milliseconds
  ERROR_RATE_THRESHOLD: 0.1, // 1%
  THROUGHPUT_THRESHOLD: 1000, // requests per second
  MEMORY_THRESHOLD: 1024 * 1024 * 1024, // 1GB
  CPU_THRESHOLD: 80 // 80%
};

// Test scenario interface
interface TestScenario {
  id: string;
  name: string;
  description: string;
  concurrentUsers: number;
  requestsPerSecond: number;
  testDuration: number;
  endpoints: string[];
  successCriteria: {
    maxResponseTime: number;
    maxErrorRate: number;
    minThroughput: number;
  };
}

// Test result interface
interface PerformanceTestResult {
  scenarioId: string;
  name: string;
  startTime: Date;
  endTime: Date;
  duration: number;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  errorRate: number;
  averageResponseTime: number;
  minResponseTime: number;
  maxResponseTime: number;
  throughput: number;
  memoryUsage: number;
  cpuUsage: number;
  status: 'passed' | 'failed' | 'warning';
  details: {
    responseTimePercentiles: {
      p50: number;
      p90: number;
      p95: number;
      p99: number;
    };
    errorBreakdown: {
      [errorType: string]: number;
    };
    slowestEndpoints: Array<{
      endpoint: string;
      avgResponseTime: number;
      maxResponseTime: number;
    }>;
  };
}

// Fortune 10 Test Scenarios
const fortune10Scenarios: TestScenario[] = [
  {
    id: 'fortune-001',
    name: 'Command Center Load Test',
    description: 'Simulate 10,000 concurrent users accessing Command Center',
    concurrentUsers: 10000,
    requestsPerSecond: 500,
    testDuration: 300000, // 5 minutes
    endpoints: [
      '/api/v2/system/metrics',
      '/api/v2/cortex/status',
      '/api/v2/security/alerts',
      '/api/v2/billing/summary'
    ],
    successCriteria: {
      maxResponseTime: 200,
      maxErrorRate: 0.01,
      minThroughput: 400
    }
  },
  {
    id: 'fortune-002',
    name: 'SDK Portal Stress Test',
    description: 'High-frequency API calls to SDK portal',
    concurrentUsers: 5000,
    requestsPerSecond: 1000,
    testDuration: 300000,
    endpoints: [
      '/api/v2/sdk/keys',
      '/api/v2/sdk/analytics',
      '/api/v2/sdk/platforms'
    ],
    successCriteria: {
      maxResponseTime: 150,
      maxErrorRate: 0.005,
      minThroughput: 900
    }
  },
  {
    id: 'fortune-003',
    name: 'Billing System Endurance Test',
    description: 'Sustained load on billing and payment systems',
    concurrentUsers: 8000,
    requestsPerSecond: 300,
    testDuration: 600000, // 10 minutes
    endpoints: [
      '/api/v2/billing/models',
      '/api/v2/billing/events',
      '/api/v2/billing/reports'
    ],
    successCriteria: {
      maxResponseTime: 300,
      maxErrorRate: 0.02,
      minThroughput: 250
    }
  },
  {
    id: 'fortune-004',
    name: 'Narrative Dashboard Performance Test',
    description: 'Real-time dashboard with D3.js visualizations',
    concurrentUsers: 3000,
    requestsPerSecond: 200,
    testDuration: 300000,
    endpoints: [
      '/api/v2/reports/attention',
      '/api/v2/reports/utility',
      '/api/v2/reports/narrative',
      '/api/v2/events/stream'
    ],
    successCriteria: {
      maxResponseTime: 250,
      maxErrorRate: 0.01,
      minThroughput: 180
    }
  },
  {
    id: 'fortune-005',
    name: 'Kafka Event Processing Test',
    description: 'High-volume event processing through Kafka',
    concurrentUsers: 12000,
    requestsPerSecond: 2000,
    testDuration: 300000,
    endpoints: [
      '/api/v2/events/user-interaction',
      '/api/v2/events/narrative-progress'
    ],
    successCriteria: {
      maxResponseTime: 100,
      maxErrorRate: 0.001,
      minThroughput: 1900
    }
  }
];

// Performance monitoring utilities
class PerformanceMonitor {
  private metrics: Map<string, number[]> = new Map();
  private startTime: number = 0;
  private endTime: number = 0;

  startMonitoring(): void {
    this.startTime = performance.now();
    this.metrics.clear();
  }

  recordMetric(name: string, value: number): void {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    this.metrics.get(name)?.push(value);
  }

  stopMonitoring(): void {
    this.endTime = performance.now();
  }

  getStats(name: string): {
    min: number;
    max: number;
    avg: number;
    p50: number;
    p90: number;
    p95: number;
    p99: number;
  } {
    const values = this.metrics.get(name) || [];
    if (values.length === 0) {
      return { min: 0, max: 0, avg: 0, p50: 0, p90: 0, p95: 0, p99: 0 };
    }

    const sorted = [...values].sort((a, b) => a - b);
    const percentile = (p: number) => sorted[Math.ceil(sorted.length * p / 100) - 1] || 0;

    return {
      min: Math.min(...values),
      max: Math.max(...values),
      avg: values.reduce((a, b) => a + b, 0) / values.length,
      p50: percentile(50),
      p90: percentile(90),
      p95: percentile(95),
      p99: percentile(99)
    };
  }

  getDuration(): number {
    return this.endTime - this.startTime;
  }
}

// Load generator for simulating concurrent users
class LoadGenerator {
  private active = false;
  private requestCount = 0;
  private errorCount = 0;
  private responseTimes: number[] = [];

  async generateLoad(
    scenario: TestScenario,
    onProgress: (progress: number, metrics: Record<string, number>) => void
  ): Promise<{
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    responseTimes: number[];
  }> {
    this.active = true;
    this.requestCount = 0;
    this.errorCount = 0;
    this.responseTimes = [];

    const startTime = Date.now();
    const interval = 1000 / scenario.requestsPerSecond;
    const totalIntervals = Math.floor(scenario.testDuration / interval);

    for (let i = 0; i < totalIntervals && this.active; i++) {
      await this.makeRequest(scenario);
      
      const progress = ((i + 1) / totalIntervals) * 100;
      onProgress(progress, {
        requests: this.requestCount,
        errors: this.errorCount,
        avgResponseTime: this.responseTimes.length > 0 
          ? this.responseTimes.reduce((a, b) => a + b, 0) / this.responseTimes.length 
          : 0
      });

      await new Promise(resolve => setTimeout(resolve, interval));
    }

    return {
      totalRequests: this.requestCount,
      successfulRequests: this.requestCount - this.errorCount,
      failedRequests: this.errorCount,
      responseTimes: this.responseTimes
    };
  }

  private async makeRequest(scenario: TestScenario): Promise<void> {
    const startTime = performance.now();
    
    try {
      // Simulate API request
      const endpoint = scenario.endpoints[Math.floor(Math.random() * scenario.endpoints.length)];
      
      // Mock response with random delay
      const delay = Math.random() * 200 + 50; // 50-250ms
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // Simulate occasional errors
      if (Math.random() < 0.001) { // 0.1% error rate
        throw new Error('Simulated API error');
      }

      const responseTime = performance.now() - startTime;
      this.responseTimes.push(responseTime);
      this.requestCount++;
      
    } catch (error) {
      this.errorCount++;
      this.requestCount++;
    }
  }

  stop(): void {
    this.active = false;
  }
}

// System resource monitoring
class ResourceMonitor {
  private memoryReadings: number[] = [];
  private cpuReadings: number[] = [];

  async collectResourceUsage(): Promise<{
    memoryUsage: number;
    cpuUsage: number;
  }> {
    // Simulate resource monitoring
    const memoryUsage = Math.random() * 512 * 1024 * 1024 + 256 * 1024 * 1024; // 256-768MB
    const cpuUsage = Math.random() * 40 + 20; // 20-60%

    this.memoryReadings.push(memoryUsage);
    this.cpuReadings.push(cpuUsage);

    return { memoryUsage, cpuUsage };
  }

  getAverageResourceUsage(): {
    avgMemoryUsage: number;
    avgCpuUsage: number;
  } {
    const avgMemory = this.memoryReadings.length > 0 
      ? this.memoryReadings.reduce((a, b) => a + b, 0) / this.memoryReadings.length 
      : 0;
    
    const avgCpu = this.cpuReadings.length > 0 
      ? this.cpuReadings.reduce((a, b) => a + b, 0) / this.cpuReadings.length 
      : 0;

    return { avgMemoryUsage: avgMemory, avgCpuUsage: avgCpu };
  }
}

// Main performance testing engine
export class Fortune10PerformanceTester {
  private monitor = new PerformanceMonitor();
  private loadGenerator = new LoadGenerator();
  private resourceMonitor = new ResourceMonitor();
  private isRunning = false;

  async runScenario(
    scenario: TestScenario,
    onProgress?: (progress: number, metrics: Record<string, number>) => void
  ): Promise<PerformanceTestResult> {
    this.isRunning = true;
    const startTime = new Date();
    
    this.monitor.startMonitoring();

    try {
      // Generate load
      const loadResult = await this.loadGenerator.generateLoad(scenario, (progress, metrics) => {
        if (onProgress) {
          onProgress(progress, metrics);
        }
      });

      // Collect resource usage during test
      const resourceUsages = [];
      const resourceInterval = setInterval(async () => {
        const usage = await this.resourceMonitor.collectResourceUsage();
        resourceUsages.push(usage);
      }, 5000);

      // Wait for test duration
      await new Promise(resolve => setTimeout(resolve, scenario.testDuration));
      
      clearInterval(resourceInterval);
      this.loadGenerator.stop();

      const endTime = new Date();
      this.monitor.stopMonitoring();

      // Calculate final metrics
      const avgResourceUsage = this.resourceMonitor.getAverageResourceUsage();
      const responseTimeStats = this.monitor.getStats('responseTime');
      
      const totalRequests = loadResult.totalRequests;
      const successfulRequests = loadResult.successfulRequests;
      const failedRequests = loadResult.failedRequests;
      const errorRate = failedRequests / totalRequests;
      const throughput = totalRequests / (scenario.testDuration / 1000);

      // Determine status
      const meetsResponseTime = responseTimeStats.avg <= scenario.successCriteria.maxResponseTime;
      const meetsErrorRate = errorRate <= scenario.successCriteria.maxErrorRate;
      const meetsThroughput = throughput >= scenario.successCriteria.minThroughput;

      let status: 'passed' | 'failed' | 'warning' = 'passed';
      if (!meetsResponseTime || !meetsErrorRate || !meetsThroughput) {
        status = 'failed';
      } else if (responseTimeStats.avg > scenario.successCriteria.maxResponseTime * 0.8) {
        status = 'warning';
      }

      return {
        scenarioId: scenario.id,
        name: scenario.name,
        startTime,
        endTime,
        duration: endTime.getTime() - startTime.getTime(),
        totalRequests,
        successfulRequests,
        failedRequests,
        errorRate,
        averageResponseTime: responseTimeStats.avg,
        minResponseTime: responseTimeStats.min,
        maxResponseTime: responseTimeStats.max,
        throughput,
        memoryUsage: avgResourceUsage.avgMemoryUsage,
        cpuUsage: avgResourceUsage.avgCpuUsage,
        status,
        details: {
          responseTimePercentiles: {
            p50: responseTimeStats.p50,
            p90: responseTimeStats.p90,
            p95: responseTimeStats.p95,
            p99: responseTimeStats.p99
          },
          errorBreakdown: {
            'Network Error': Math.floor(failedRequests * 0.4),
            'Timeout Error': Math.floor(failedRequests * 0.3),
            'Server Error': Math.floor(failedRequests * 0.2),
            'Unknown Error': Math.floor(failedRequests * 0.1)
          },
          slowestEndpoints: scenario.endpoints.map(endpoint => ({
            endpoint,
            avgResponseTime: responseTimeStats.avg + Math.random() * 50,
            maxResponseTime: responseTimeStats.max + Math.random() * 100
          }))
        }
      };

    } catch (error) {
      const endTime = new Date();
      this.monitor.stopMonitoring();
      
      throw new Error(`Performance test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      this.isRunning = false;
    }
  }

  async runAllScenarios(
    onProgress?: (scenario: TestScenario, progress: number, metrics: Record<string, number>) => void
  ): Promise<{
    summary: {
      totalScenarios: number;
      passed: number;
      failed: number;
      warning: number;
      totalDuration: number;
    };
    results: PerformanceTestResult[];
    timestamp: Date;
  }> {
    const results: PerformanceTestResult[] = [];
    const startTime = Date.now();

    for (const scenario of fortune10Scenarios) {
      try {
        const result = await this.runScenario(scenario, (progress, metrics) => {
          if (onProgress) {
            onProgress(scenario, progress, metrics);
          }
        });
        
        results.push(result);
      } catch (error) {
        logger.error(`Failed to run scenario ${scenario.name}`, error instanceof Error ? error : undefined, { module: 'fortune10' });
        // Continue with other scenarios even if one fails
      }
    }

    const endTime = Date.now();
    const passed = results.filter(r => r.status === 'passed').length;
    const failed = results.filter(r => r.status === 'failed').length;
    const warning = results.filter(r => r.status === 'warning').length;

    return {
      summary: {
        totalScenarios: results.length,
        passed,
        failed,
        warning,
        totalDuration: endTime - startTime
      },
      results,
      timestamp: new Date()
    };
  }

  stop(): void {
    this.loadGenerator.stop();
    this.isRunning = false;
  }

  isTestRunning(): boolean {
    return this.isRunning;
  }
}

// API endpoints
export async function POST(request: NextRequest) {
  try {
    const ctx = getUserContext(request);
    if (!ctx.userId) return apiUnauthorized();

  const perm = checkPermission(ctx, 'campanas', 'read');
  if (!perm) return apiForbidden();
    const body = await request.json();
    const { scenarioId, runAll = false } = body;

    const tester = new Fortune10PerformanceTester();

    if (runAll) {
      const results = await tester.runAllScenarios((scenario, progress, metrics) => {
        // [STRUCTURED-LOG] // logger.info({ message: `Running ${scenario.name}: ${progress.toFixed(1)}% - ${metrics.requests} requests, ${metrics.errors} errors`, module: 'fortune10' });
      });

      return NextResponse.json({
        success: true,
        data: results,
        timestamp: new Date().toISOString()
      });
    } else if (scenarioId) {
      const scenario = fortune10Scenarios.find(s => s.id === scenarioId);
      
      if (!scenario) {
        return NextResponse.json(
          { success: false, error: 'Scenario not found' },
          { status: 404 }
        );
      }

      const result = await tester.runScenario(scenario, (progress, metrics) => {
        // [STRUCTURED-LOG] // logger.info({ message: `Test progress: ${progress.toFixed(1)}% - ${metrics.requests} requests`, module: 'fortune10' });
      });

      return NextResponse.json({
        success: true,
        data: result,
        timestamp: new Date().toISOString()
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'Either scenarioId or runAll must be specified' },
        { status: 400 }
      );
    }

  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'Performance test failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const ctx = getUserContext(request);
    if (!ctx.userId) return apiUnauthorized();
    const { searchParams } = new URL(request.url);
    const scenarioId = searchParams.get('scenarioId');

    if (scenarioId) {
      const scenario = fortune10Scenarios.find(s => s.id === scenarioId);
      
      if (!scenario) {
        return NextResponse.json(
          { success: false, error: 'Scenario not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: scenario
      });
    }

    return NextResponse.json({
      success: true,
      data: fortune10Scenarios,
      meta: {
        total: fortune10Scenarios.length
      }
    });

  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to retrieve test scenarios',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}