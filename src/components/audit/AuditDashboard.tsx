'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, 
  FileText, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Clock,
  User,
  Activity,
  BarChart3,
  Download,
  Filter,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';
import { auditService, AuditEvent, AuditFilter } from '@/lib/audit/enterprise-audit';
import { toast } from '@/components/ui/use-toast';

interface AuditDashboardProps {
  className?: string;
}

interface AuditSummary {
  totalEvents: number;
  eventsByCategory: Record<string, number>;
  eventsBySeverity: Record<string, number>;
  eventsByResult: Record<string, number>;
  topUsers: Array<{ userId: string; count: number }>;
  complianceViolations: number;
}

interface ComplianceReport {
  requirements: Array<{
    id: string;
    name: string;
    standard: string;
    status: 'compliant' | 'non-compliant' | 'partial' | 'pending';
    nextAuditDate: Date;
    responsibleTeam: string;
  }>;
  overdue: Array<{
    id: string;
    name: string;
    nextAuditDate: Date;
  }>;
  summary: {
    total: number;
    compliant: number;
    nonCompliant: number;
    partial: number;
    pending: number;
  };
}

const severityColors = {
  low: 'bg-blue-100 text-blue-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-800',
  critical: 'bg-red-100 text-red-800',
};

const statusColors = {
  compliant: 'bg-green-100 text-green-800',
  'non-compliant': 'bg-red-100 text-red-800',
  partial: 'bg-yellow-100 text-yellow-800',
  pending: 'bg-gray-100 text-gray-800',
};

const resultIcons = {
  success: <CheckCircle className="h-4 w-4 text-green-600" />,
  failure: <XCircle className="h-4 w-4 text-red-600" />,
  denied: <AlertTriangle className="h-4 w-4 text-orange-600" />,
};

export default function AuditDashboard({ className }: AuditDashboardProps) {
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);
  const [auditSummary, setAuditSummary] = useState<AuditSummary | null>(null);
  const [complianceReport, setComplianceReport] = useState<ComplianceReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [filters, setFilters] = useState<AuditFilter>({});
  const [showFilters, setShowFilters] = useState(false);

  const loadAuditData = async () => {
    try {
      setLoading(true);
      
      // Get recent audit events (last 24 hours)
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - 24 * 60 * 60 * 1000);
      
      const events = auditService.getEventsByTimeRange(startDate, endDate);
      const summary = auditService.getAuditSummary(startDate, endDate);
      const compliance = auditService.generateComplianceReport();
      
      setAuditEvents(events.slice(0, 100)); // Show last 100 events
      setAuditSummary(summary);
      setComplianceReport(compliance);
    } catch (error) {
      console.error('Failed to load audit data:', error);
      toast({
        title: 'Failed to load audit data',
        description: 'Could not retrieve audit and compliance information',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = (newFilters: AuditFilter) => {
    setFilters(newFilters);
    const filteredEvents = auditService.getEvents(newFilters);
    setAuditEvents(filteredEvents.slice(0, 100));
  };

  const clearFilters = () => {
    setFilters({});
    loadAuditData();
  };

  const exportAuditLog = () => {
    const dataStr = JSON.stringify(auditEvents, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `audit-log-${new Date().toISOString()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: 'Audit Log Exported',
      description: 'Audit log has been exported successfully',
      variant: 'default',
    });
  };

  const generateComplianceReport = () => {
    const report = auditService.generateComplianceReport();
    const reportStr = JSON.stringify(report, null, 2);
    const reportBlob = new Blob([reportStr], { type: 'application/json' });
    const url = URL.createObjectURL(reportBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `compliance-report-${new Date().toISOString()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: 'Compliance Report Generated',
      description: 'Compliance report has been generated successfully',
      variant: 'default',
    });
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  useEffect(() => {
    loadAuditData();
  }, []);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(loadAuditData, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-spin" />
          <p className="text-muted-foreground">Loading audit and compliance data...</p>
        </div>
      </div>
    );
  }

  if (!auditSummary || !complianceReport) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <p className="text-destructive">Failed to load audit and compliance data</p>
        <Button onClick={loadAuditData} className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  const compliancePercentage = complianceReport.summary.total > 0 
    ? (complianceReport.summary.compliant / complianceReport.summary.total) * 100 
    : 0;

  return (
    <div className={className}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Shield className="h-8 w-8" />
              Enterprise Audit & Compliance
            </h1>
            <p className="text-muted-foreground">
              Comprehensive audit logging and regulatory compliance monitoring
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setAutoRefresh(!autoRefresh)}
              variant={autoRefresh ? 'default' : 'outline'}
              size="sm"
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${autoRefresh ? 'animate-spin' : ''}`} />
              Auto Refresh
            </Button>
            <Button onClick={loadAuditData} size="sm" variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh Now
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Events (24h)</CardTitle>
              <Activity className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{auditSummary.totalEvents.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Audit events in last 24 hours
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Compliance Rate</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {compliancePercentage.toFixed(1)}%
              </div>
              <Progress value={compliancePercentage} className="h-2 mt-2" />
              <p className="text-xs text-muted-foreground">
                Overall compliance status
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Security Events</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {auditSummary.eventsByCategory.security || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Security-related events
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Violations</CardTitle>
              <TrendingDown className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {auditSummary.complianceViolations}
              </div>
              <p className="text-xs text-muted-foreground">
                Compliance violations detected
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Audit Controls & Export
            </CardTitle>
            <CardDescription>
              Filter audit events and export compliance reports
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Button
                onClick={() => setShowFilters(!showFilters)}
                variant="outline"
                size="sm"
              >
                <Filter className="mr-2 h-4 w-4" />
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </Button>
              <Button
                onClick={exportAuditLog}
                variant="outline"
                size="sm"
              >
                <Download className="mr-2 h-4 w-4" />
                Export Audit Log
              </Button>
              <Button
                onClick={generateComplianceReport}
                variant="outline"
                size="sm"
              >
                <FileText className="mr-2 h-4 w-4" />
                Generate Compliance Report
              </Button>
              {Object.keys(filters).length > 0 && (
                <Button
                  onClick={clearFilters}
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:text-red-700"
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Clear Filters
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Compliance Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Compliance Requirements
            </CardTitle>
            <CardDescription>
              Current status of regulatory compliance requirements
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {complianceReport.requirements.map((requirement) => (
                <div
                  key={requirement.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex items-center gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{requirement.name}</h4>
                        <Badge variant="outline">{requirement.standard}</Badge>
                        <Badge className={statusColors[requirement.status]}>
                          {requirement.status}
                        </Badge>
                      </div>
                      <div className="mt-1 flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Next audit: {formatDate(requirement.nextAuditDate)}
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {requirement.responsibleTeam}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Audit Events */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Audit Events
            </CardTitle>
            <CardDescription>
              Latest system activity and security events
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {auditEvents.length === 0 ? (
                <div className="text-center py-8">
                  <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No audit events found</p>
                </div>
              ) : (
                auditEvents.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center justify-between rounded-lg border p-3 hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <div className="flex items-center gap-3">
                      {resultIcons[event.result]}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{event.action}</span>
                          <Badge variant="outline">{event.category}</Badge>
                          <Badge className={severityColors[event.severity]}>
                            {event.severity}
                          </Badge>
                        </div>
                        <div className="mt-1 flex items-center gap-4 text-xs text-muted-foreground">
                          <span>{event.userEmail}</span>
                          <span>{event.resource}</span>
                          <span>{event.ipAddress}</span>
                          <span>{formatTimeAgo(event.timestamp)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Best Practices */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Audit & Compliance Best Practices
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertDescription>
                <ul className="list-disc space-y-1 pl-4 text-sm">
                  <li>Implement comprehensive logging for all user actions and system events</li>
                  <li>Regularly review audit logs for suspicious activity or policy violations</li>
                  <li>Maintain immutable audit trails with cryptographic integrity verification</li>
                  <li>Ensure compliance with relevant regulatory requirements (SOX, GDPR, HIPAA, etc.)</li>
                  <li>Implement automated compliance monitoring and alerting</li>
                  <li>Conduct regular access reviews and privilege audits</li>
                  <li>Maintain data retention policies aligned with legal requirements</li>
                  <li>Provide audit reports to stakeholders and regulatory bodies as required</li>
                </ul>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}