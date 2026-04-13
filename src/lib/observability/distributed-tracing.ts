/**
 * 🔍 SILEXAR PULSE QUANTUM - DISTRIBUTED TRACING TIER 0
 * 
 * Sistema de tracing distribuido enterprise con OpenTelemetry
 * Correlación de requests, performance analysis y debugging avanzado
 * 
 * @version 2040.1.0
 * @author Silexar Pulse Quantum Team
 * @classification TIER 0 - ENTERPRISE OBSERVABILITY
 */

import { qualityLogger } from '../quality/quality-logger';
import { logger } from '@/lib/observability';

// 🔍 Trace Context
interface TraceContext {
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  baggage: Record<string, string>;
  samplingDecision: 'RECORD_AND_SAMPLE' | 'NOT_RECORD' | 'RECORD_ONLY';
}

// 📊 Span
interface Span {
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  operationName: string;
  serviceName: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  status: 'OK' | 'ERROR' | 'TIMEOUT' | 'CANCELLED';
  tags: Record<string, unknown>;
  logs: SpanLog[];
  references: SpanReference[];
  baggage: Record<string, string>;
}

// 📝 Span Log
interface SpanLog {
  timestamp: Date;
  level: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';
  message: string;
  fields: Record<string, unknown>;
}

// 🔗 Span Reference
interface SpanReference {
  type: 'CHILD_OF' | 'FOLLOWS_FROM';
  traceId: string;
  spanId: string;
}

// 🎯 Trace
interface Trace {
  traceId: string;
  spans: Span[];
  services: string[];
  duration: number;
  startTime: Date;
  endTime: Date;
  status: 'OK' | 'ERROR' | 'TIMEOUT' | 'CANCELLED';
  rootSpan: Span;
  criticalPath: Span[];
  errorSpans: Span[];
  metadata: Record<string, unknown>;
}

// 📊 Tracing Metrics
interface TracingMetrics {
  totalTraces: number;
  activeTraces: number;
  completedTraces: number;
  errorTraces: number;
  averageTraceDuration: number;
  averageSpansPerTrace: number;
  samplingRate: number;
  throughput: number;
  timestamp: Date;
}

// 🎛️ Sampling Strategy
interface SamplingStrategy {
  type: 'PROBABILISTIC' | 'RATE_LIMITING' | 'ADAPTIVE' | 'CUSTOM';
  rate: number;
  maxTracesPerSecond?: number;
  rules: SamplingRule[];
}

// 📏 Sampling Rule
interface SamplingRule {
  service: string;
  operation?: string;
  tags?: Record<string, string>;
  rate: number;
  priority: number;
}

// 🔍 Trace Query
interface TraceQuery {
  traceId?: string;
  serviceName?: string;
  operationName?: string;
  tags?: Record<string, string>;
  minDuration?: number;
  maxDuration?: number;
  startTime?: Date;
  endTime?: Date;
  limit?: number;
  status?: 'OK' | 'ERROR' | 'TIMEOUT' | 'CANCELLED';
}

/**
 * 🔍 Enterprise Distributed Tracing Class
 */
export class EnterpriseDistributedTracing {
  private tracingId: string;
  private activeSpans: Map<string, Span>;
  private completedTraces: Map<string, Trace>;
  private samplingStrategy: SamplingStrategy;
  private metrics: TracingMetrics;
  private exporters: TraceExporter[];
  private isRunning: boolean;

  constructor() {
    this.tracingId = `tracing_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    this.activeSpans = new Map();
    this.completedTraces = new Map();
    this.exporters = [];
    this.isRunning = false;

    this.samplingStrategy = {
      type: 'ADAPTIVE',
      rate: 0.1, // 10% sampling rate
      maxTracesPerSecond: 1000,
      rules: [
        {
          service: 'api-gateway',
          rate: 1.0, // 100% sampling for gateway
          priority: 1
        },
        {
          service: 'auth-service',
          rate: 0.5, // 50% sampling for auth
          priority: 2
        }
      ]
    };

    this.metrics = {
      totalTraces: 0,
      activeTraces: 0,
      completedTraces: 0,
      errorTraces: 0,
      averageTraceDuration: 0,
      averageSpansPerTrace: 0,
      samplingRate: this.samplingStrategy.rate,
      throughput: 0,
      timestamp: new Date()
    };

    this.startMetricsCollection();

    qualityLogger.info('Enterprise Distributed Tracing initialized', 'DISTRIBUTED_TRACING', {
      tracingId: this.tracingId
    });
  }

  /**
   * 🚀 Start Distributed Tracing
   */
  async start(): Promise<void> {
    try {
      this.isRunning = true;
      
      qualityLogger.info('Distributed Tracing starting', 'DISTRIBUTED_TRACING', {
        tracingId: this.tracingId
      });

      // Start background tasks
      this.startTraceCompletion();
      this.startTraceExport();
      this.startCleanup();

      qualityLogger.info('Distributed Tracing started successfully', 'DISTRIBUTED_TRACING', {
        tracingId: this.tracingId
      });

    } catch (error) {
      qualityLogger.error('Failed to start Distributed Tracing', 'DISTRIBUTED_TRACING', {
        tracingId: this.tracingId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * 🆕 Start Span
   * @param operationName - Operation name
   * @param serviceName - Service name
   * @param parentContext - Parent trace context
   * @returns New span and trace context
   */
  startSpan(
    operationName: string, 
    serviceName: string, 
    parentContext?: TraceContext
  ): { span: Span; context: TraceContext } {
    
    const traceId = parentContext?.traceId || this.generateTraceId();
    const spanId = this.generateSpanId();
    const parentSpanId = parentContext?.spanId;

    // Check sampling decision
    const samplingDecision = this.makeSamplingDecision(serviceName, operationName, parentContext);
    
    const span: Span = {
      traceId,
      spanId,
      parentSpanId,
      operationName,
      serviceName,
      startTime: new Date(),
      status: 'OK',
      tags: {},
      logs: [],
      references: parentSpanId ? [{
        type: 'CHILD_OF',
        traceId,
        spanId: parentSpanId
      }] : [],
      baggage: parentContext?.baggage || {}
    };

    const context: TraceContext = {
      traceId,
      spanId,
      parentSpanId,
      baggage: span.baggage,
      samplingDecision
    };

    // Store active span if sampled
    if (samplingDecision !== 'NOT_RECORD') {
      this.activeSpans.set(spanId, span);
      this.metrics.activeTraces++;
    }

    qualityLogger.debug('Span started', 'DISTRIBUTED_TRACING', {
      tracingId: this.tracingId,
      traceId,
      spanId,
      operationName,
      serviceName,
      sampled: samplingDecision !== 'NOT_RECORD'
    });

    return { span, context };
  }

  /**
   * 🏁 Finish Span
   * @param spanId - Span ID
   * @param status - Final status
   * @param tags - Additional tags
   */
  finishSpan(spanId: string, status: Span['status'] = 'OK', tags: Record<string, unknown> = {}): void {
    const span = this.activeSpans.get(spanId);
    if (!span) return;

    span.endTime = new Date();
    span.duration = span.endTime.getTime() - span.startTime.getTime();
    span.status = status;
    span.tags = { ...span.tags, ...tags };

    // Remove from active spans
    this.activeSpans.delete(spanId);
    this.metrics.activeTraces--;

    qualityLogger.debug('Span finished', 'DISTRIBUTED_TRACING', {
      tracingId: this.tracingId,
      traceId: span.traceId,
      spanId,
      duration: span.duration,
      status
    });

    // Check if trace is complete
    this.checkTraceCompletion(span.traceId);
  }

  /**
   * 🏷️ Add Span Tag
   * @param spanId - Span ID
   * @param key - Tag key
   * @param value - Tag value
   */
  addSpanTag(spanId: string, key: string, value: unknown): void {
    const span = this.activeSpans.get(spanId);
    if (span) {
      span.tags[key] = value;
    }
  }

  /**
   * 📝 Add Span Log
   * @param spanId - Span ID
   * @param level - Log level
   * @param message - Log message
   * @param fields - Additional fields
   */
  addSpanLog(spanId: string, level: SpanLog['level'], message: string, fields: Record<string, unknown> = {}): void {
    const span = this.activeSpans.get(spanId);
    if (span) {
      span.logs.push({
        timestamp: new Date(),
        level,
        message,
        fields
      });
    }
  }

  /**
   * 🎒 Set Baggage
   * @param context - Trace context
   * @param key - Baggage key
   * @param value - Baggage value
   */
  setBaggage(context: TraceContext, key: string, value: string): void {
    context.baggage[key] = value;
    
    // Update baggage in active span
    const span = this.activeSpans.get(context.spanId);
    if (span) {
      span.baggage[key] = value;
    }
  }

  /**
   * 🎯 Make Sampling Decision
   * @param serviceName - Service name
   * @param operationName - Operation name
   * @param parentContext - Parent context
   * @returns Sampling decision
   */
  private makeSamplingDecision(
    serviceName: string, 
    operationName: string, 
    parentContext?: TraceContext
  ): TraceContext['samplingDecision'] {
    
    // If parent is sampled, sample this span too
    if (parentContext?.samplingDecision === 'RECORD_AND_SAMPLE') {
      return 'RECORD_AND_SAMPLE';
    }

    // Check service-specific rules
    const rule = this.samplingStrategy.rules.find(r => 
      r.service === serviceName && 
      (!r.operation || r.operation === operationName)
    );

    const rate = rule?.rate || this.samplingStrategy.rate;
    
    // Apply rate limiting
    if (this.samplingStrategy.maxTracesPerSecond) {
      const currentThroughput = this.metrics.throughput;
      if (currentThroughput > this.samplingStrategy.maxTracesPerSecond) {
        return 'NOT_RECORD';
      }
    }

    // Probabilistic sampling
    return Math.random() < rate ? 'RECORD_AND_SAMPLE' : 'NOT_RECORD';
  }

  /**
   * ✅ Check Trace Completion
   * @param traceId - Trace ID
   */
  private checkTraceCompletion(traceId: string): void {
    // Check if all spans for this trace are completed
    const activeSpansForTrace = Array.from(this.activeSpans.values())
      .filter(span => span.traceId === traceId);

    if (activeSpansForTrace.length === 0) {
      // Trace is complete, build trace object
      this.buildCompleteTrace(traceId);
    }
  }

  /**
   * 🏗️ Build Complete Trace
   * @param traceId - Trace ID
   */
  private buildCompleteTrace(traceId: string): void {
    // Get all spans for this trace (from completed spans storage)
    const spans = this.getSpansForTrace(traceId);
    if (spans.length === 0) return;

    // Find root span
    const rootSpan = spans.find(span => !span.parentSpanId) || spans[0];
    
    // Calculate trace duration
    const startTime = new Date(Math.min(...spans.map(s => s.startTime.getTime())));
    const endTime = new Date(Math.max(...spans.map(s => (s.endTime || s.startTime).getTime())));
    const duration = endTime.getTime() - startTime.getTime();

    // Determine trace status
    const errorSpans = spans.filter(span => span.status === 'ERROR');
    const status = errorSpans.length > 0 ? 'ERROR' : 'OK';

    // Build critical path
    const criticalPath = this.buildCriticalPath(spans, rootSpan);

    // Get unique services
    const services = [...new Set(spans.map(span => span.serviceName))];

    const trace: Trace = {
      traceId,
      spans,
      services,
      duration,
      startTime,
      endTime,
      status,
      rootSpan,
      criticalPath,
      errorSpans,
      metadata: {
        spanCount: spans.length,
        serviceCount: services.length,
        errorCount: errorSpans.length
      }
    };

    this.completedTraces.set(traceId, trace);
    this.metrics.completedTraces++;
    this.metrics.totalTraces++;

    if (status === 'ERROR') {
      this.metrics.errorTraces++;
    }

    // Update average metrics
    this.updateAverageMetrics(trace);

    qualityLogger.info('Trace completed', 'DISTRIBUTED_TRACING', {
      tracingId: this.tracingId,
      traceId,
      duration,
      spanCount: spans.length,
      serviceCount: services.length,
      status
    });

    // Export trace
    this.exportTrace(trace);
  }

  /**
   * 🛤️ Build Critical Path
   * @param spans - All spans in trace
   * @param rootSpan - Root span
   * @returns Critical path spans
   */
  private buildCriticalPath(spans: Span[], rootSpan: Span): Span[] {
    const criticalPath: Span[] = [rootSpan];
    let currentSpan = rootSpan;

    while (true) {
      // Find child span with longest duration
      const childSpans = spans.filter(span => span.parentSpanId === currentSpan.spanId);
      if (childSpans.length === 0) break;

      const longestChild = childSpans.reduce((longest, span) => 
        (span.duration || 0) > (longest.duration || 0) ? span : longest
      );

      criticalPath.push(longestChild);
      currentSpan = longestChild;
    }

    return criticalPath;
  }

  /**
   * 📊 Update Average Metrics
   * @param trace - Completed trace
   */
  private updateAverageMetrics(trace: Trace): void {
    const totalTraces = this.metrics.totalTraces;
    
    // Update average trace duration
    this.metrics.averageTraceDuration = 
      ((this.metrics.averageTraceDuration * (totalTraces - 1)) + trace.duration) / totalTraces;
    
    // Update average spans per trace
    this.metrics.averageSpansPerTrace = 
      ((this.metrics.averageSpansPerTrace * (totalTraces - 1)) + trace.spans.length) / totalTraces;
  }

  /**
   * 📤 Export Trace
   * @param trace - Trace to export
   */
  private exportTrace(trace: Trace): void {
    for (const exporter of this.exporters) {
      try {
        exporter.export(trace);
      } catch (error) {
        qualityLogger.error('Failed to export trace', 'DISTRIBUTED_TRACING', {
          tracingId: this.tracingId,
          traceId: trace.traceId,
          exporter: exporter.name,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  }

  /**
   * 🔍 Query Traces
   * @param query - Trace query
   * @returns Matching traces
   */
  queryTraces(query: TraceQuery): Trace[] {
    let traces = Array.from(this.completedTraces.values());

    // Apply filters
    if (query.traceId) {
      traces = traces.filter(trace => trace.traceId === query.traceId);
    }

    if (query.serviceName) {
      traces = traces.filter(trace => trace.services.includes(query.serviceName!));
    }

    if (query.operationName) {
      traces = traces.filter(trace => 
        trace.spans.some(span => span.operationName === query.operationName)
      );
    }

    if (query.status) {
      traces = traces.filter(trace => trace.status === query.status);
    }

    if (query.minDuration) {
      traces = traces.filter(trace => trace.duration >= query.minDuration!);
    }

    if (query.maxDuration) {
      traces = traces.filter(trace => trace.duration <= query.maxDuration!);
    }

    if (query.startTime) {
      traces = traces.filter(trace => trace.startTime >= query.startTime!);
    }

    if (query.endTime) {
      traces = traces.filter(trace => trace.endTime <= query.endTime!);
    }

    if (query.tags) {
      traces = traces.filter(trace => 
        trace.spans.some(span => 
          Object.entries(query.tags!).every(([key, value]) => span.tags[key] === value)
        )
      );
    }

    // Sort by start time (newest first)
    traces.sort((a, b) => b.startTime.getTime() - a.startTime.getTime());

    // Apply limit
    if (query.limit) {
      traces = traces.slice(0, query.limit);
    }

    return traces;
  }

  /**
   * 📊 Get Spans for Trace
   * @param traceId - Trace ID
   * @returns Spans for trace
   */
  private getSpansForTrace(traceId: string): Span[] {
    // In real implementation, this would query a span storage
    // For now, simulate with completed spans
    const trace = this.completedTraces.get(traceId);
    return trace ? trace.spans : [];
  }

  /**
   * 🔢 Generate Trace ID
   * @returns New trace ID
   */
  private generateTraceId(): string {
    return `trace_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }

  /**
   * 🔢 Generate Span ID
   * @returns New span ID
   */
  private generateSpanId(): string {
    return `span_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }

  /**
   * 📊 Start Metrics Collection
   */
  private startMetricsCollection(): void {
    setInterval(() => {
      this.updateMetrics();
    }, 30000); // Update every 30 seconds
  }

  /**
   * 📊 Update Metrics
   */
  private updateMetrics(): void {
    this.metrics.timestamp = new Date();
    this.metrics.throughput = this.calculateThroughput();
    
    qualityLogger.debug('Tracing metrics updated', 'DISTRIBUTED_TRACING', {
      tracingId: this.tracingId,
      metrics: this.metrics
    });
  }

  /**
   * 📈 Calculate Throughput
   * @returns Current throughput (traces per second)
   */
  private calculateThroughput(): number {
    // Calculate based on recent trace completions
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    
    const recentTraces = Array.from(this.completedTraces.values())
      .filter(trace => trace.endTime.getTime() > oneMinuteAgo);
    
    return recentTraces.length / 60; // traces per second
  }

  /**
   * 🔄 Start Trace Completion
   */
  private startTraceCompletion(): void {
    setInterval(() => {
      this.processOrphanedSpans();
    }, 60000); // Check every minute
  }

  /**
   * 👻 Process Orphaned Spans
   */
  private processOrphanedSpans(): void {
    const now = Date.now();
    const timeout = 300000; // 5 minutes

    for (const [spanId, span] of this.activeSpans) {
      if (now - span.startTime.getTime() > timeout) {
        // Force finish orphaned span
        this.finishSpan(spanId, 'TIMEOUT');
        
        qualityLogger.warn('Orphaned span timed out', 'DISTRIBUTED_TRACING', {
          tracingId: this.tracingId,
          traceId: span.traceId,
          spanId,
          operationName: span.operationName
        });
      }
    }
  }

  /**
   * 📤 Start Trace Export
   */
  private startTraceExport(): void {
    setInterval(() => {
      this.batchExportTraces();
    }, 10000); // Export every 10 seconds
  }

  /**
   * 📦 Batch Export Traces
   */
  private batchExportTraces(): void {
    // Batch export logic for performance
    const traces = Array.from(this.completedTraces.values()).slice(-100);
    
    for (const exporter of this.exporters) {
      try {
        exporter.batchExport(traces);
      } catch (error) {
        qualityLogger.error('Batch export failed', 'DISTRIBUTED_TRACING', {
          tracingId: this.tracingId,
          exporter: exporter.name,
          traceCount: traces.length,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  }

  /**
   * 🧹 Start Cleanup
   */
  private startCleanup(): void {
    setInterval(() => {
      this.performCleanup();
    }, 3600000); // Cleanup every hour
  }

  /**
   * 🧹 Perform Cleanup
   */
  private performCleanup(): void {
    const now = Date.now();
    const retentionPeriod = 24 * 60 * 60 * 1000; // 24 hours

    // Clean up old completed traces
    for (const [traceId, trace] of this.completedTraces) {
      if (now - trace.endTime.getTime() > retentionPeriod) {
        this.completedTraces.delete(traceId);
      }
    }

    qualityLogger.info('Trace cleanup completed', 'DISTRIBUTED_TRACING', {
      tracingId: this.tracingId,
      remainingTraces: this.completedTraces.size
    });
  }

  /**
   * 📊 Get Tracing Metrics
   * @returns Current tracing metrics
   */
  getMetrics(): TracingMetrics {
    return { ...this.metrics };
  }

  /**
   * 🔧 Add Exporter
   * @param exporter - Trace exporter
   */
  addExporter(exporter: TraceExporter): void {
    this.exporters.push(exporter);
    
    qualityLogger.info('Trace exporter added', 'DISTRIBUTED_TRACING', {
      tracingId: this.tracingId,
      exporter: exporter.name
    });
  }

  /**
   * 🛑 Stop Distributed Tracing
   */
  async stop(): Promise<void> {
    this.isRunning = false;
    
    // Finish all active spans
    for (const spanId of this.activeSpans.keys()) {
      this.finishSpan(spanId, 'CANCELLED');
    }
    
    qualityLogger.info('Distributed Tracing stopped', 'DISTRIBUTED_TRACING', {
      tracingId: this.tracingId
    });
  }
}

/**
 * 📤 Trace Exporter Interface
 */
export interface TraceExporter {
  name: string;
  export(trace: Trace): void;
  batchExport(traces: Trace[]): void;
}

/**
 * 📤 Console Trace Exporter
 * WHY: Uses logger.debug instead of console.log so traces flow through
 * the structured logging pipeline (Sentry, Datadog, CloudWatch) rather than
 * raw stdout, which can expose internal trace data in production logs.
 */
export class ConsoleTraceExporter implements TraceExporter {
  name = 'console';

  export(trace: Trace): void {
    logger.debug('[DistributedTracing] trace', { traceId: trace.traceId, spans: trace.spans?.length });
  }

  batchExport(traces: Trace[]): void {
    traces.forEach(trace => {
      this.export(trace);
    });
  }
}

// 🛡️ Global Distributed Tracing Instance
export const enterpriseDistributedTracing = new EnterpriseDistributedTracing();

// Add console exporter by default
enterpriseDistributedTracing.addExporter(new ConsoleTraceExporter());

// 🔧 Utility Functions
export function createDistributedTracing(): EnterpriseDistributedTracing {
  return new EnterpriseDistributedTracing();
}

export function startSpan(
  operationName: string, 
  serviceName: string, 
  parentContext?: TraceContext
): { span: Span; context: TraceContext } {
  return enterpriseDistributedTracing.startSpan(operationName, serviceName, parentContext);
}

export function finishSpan(spanId: string, status?: Span['status'], tags?: Record<string, unknown>): void {
  return enterpriseDistributedTracing.finishSpan(spanId, status, tags);
}

export function queryTraces(query: TraceQuery): Trace[] {
  return enterpriseDistributedTracing.queryTraces(query);
}

export default EnterpriseDistributedTracing;