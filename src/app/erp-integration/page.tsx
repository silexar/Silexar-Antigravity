'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ERPIntegrationDashboard from '@/components/erp/ERPIntegrationDashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Database, 
  Zap, 
  Shield, 
  Activity,
  TrendingUp,
  BarChart3,
  Settings,
  CheckCircle,
  AlertCircle,
  Server,
  Link,
  Clock,
  Globe,
  Lock
} from 'lucide-react';

export default function ERPIntegrationPage() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const erpSystems = [
    {
      name: 'SAP S/4HANA',
      status: 'connected',
      modules: ['Financial Accounting', 'Controlling', 'Sales & Distribution', 'Materials Management'],
      lastSync: '2 minutes ago',
      security: 'Pentagon++'
    },
    {
      name: 'Oracle ERP Cloud',
      status: 'connected',
      modules: ['Financials', 'Procurement', 'Project Management', 'Risk Management'],
      lastSync: '5 minutes ago',
      security: 'Fortune 10'
    },
    {
      name: 'Microsoft Dynamics 365',
      status: 'connected',
      modules: ['Finance', 'Supply Chain', 'Sales', 'Customer Service'],
      lastSync: '8 minutes ago',
      security: 'Fortune 10'
    }
  ];

  const integrationMetrics = {
    totalConnections: 3,
    activeSyncs: 12,
    successRate: '99.97%',
    uptime: '99.99%',
    dataProcessed: '2.4TB',
    transactions: '1.2M'
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">ERP Integration Hub</h1>
          <p className="text-xl text-muted-foreground mt-2">
            Fortune 10 Enterprise Resource Planning Integration Platform
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Badge variant="outline" className="text-green-600 border-green-600 text-lg px-3 py-1">
            <Zap className="h-4 w-4 mr-2" />
            TIER 0
          </Badge>
          <Badge variant="outline" className="text-blue-600 border-blue-600 text-lg px-3 py-1">
            <Shield className="h-4 w-4 mr-2" />
            FORTUNE 10
          </Badge>
          <Badge variant="outline" className="text-red-600 border-red-600 text-lg px-3 py-1">
            <Lock className="h-4 w-4 mr-2" />
            PENTAGON++
          </Badge>
        </div>
      </div>

      {/* Enterprise Overview */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="border-green-200 bg-green-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800">Connected Systems</CardTitle>
            <Server className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">{integrationMetrics.totalConnections}</div>
            <p className="text-xs text-green-700">ERP systems integrated</p>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{integrationMetrics.successRate}</div>
            <p className="text-xs text-blue-700">Transaction success rate</p>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-800">Data Volume</CardTitle>
            <Database className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">{integrationMetrics.dataProcessed}</div>
            <p className="text-xs text-purple-700">Processed this month</p>
          </CardContent>
        </Card>
      </div>

      {/* Connected ERP Systems */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Database className="h-5 w-5 mr-2" />
            Connected ERP Systems
          </CardTitle>
          <CardDescription>
            Fortune 10 enterprise resource planning systems with real-time integration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {erpSystems.map((system) => (
              <div key={system.name} className="p-6 border rounded-lg bg-gradient-to-r from-gray-50 to-blue-50">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{system.name}</h3>
                      <p className="text-sm text-gray-600">Last sync: {system.lastSync}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                      {system.status.toUpperCase()}
                    </Badge>
                    <Badge className="bg-red-100 text-red-800 border-red-200">
                      {system.security}
                    </Badge>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Integrated Modules</h4>
                    <div className="space-y-1">
                      {system.modules.map((module, moduleIndex) => (
                        <div key={moduleIndex} className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-blue-600 rounded-full" />
                          <span className="text-sm text-gray-700">{module}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Security Features</h4>
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-600 rounded-full" />
                        <span className="text-sm text-gray-700">End-to-end encryption</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-600 rounded-full" />
                        <span className="text-sm text-gray-700">Multi-factor authentication</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-600 rounded-full" />
                        <span className="text-sm text-gray-700">Audit trail logging</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main Dashboard Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 lg:w-[800px]">
          <TabsTrigger value="dashboard" className="flex items-center">
            <BarChart3 className="h-4 w-4 mr-2" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="monitoring" className="flex items-center">
            <Activity className="h-4 w-4 mr-2" />
            Monitoring
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center">
            <Shield className="h-4 w-4 mr-2" />
            Security
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center">
            <TrendingUp className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          <ERPIntegrationDashboard />
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-4">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Real-time System Status</CardTitle>
                <CardDescription>Live monitoring of all ERP integrations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <div>
                        <div className="font-medium text-green-900">All Systems Operational</div>
                        <div className="text-sm text-green-700">No incidents reported</div>
                      </div>
                    </div>
                    <Badge className="bg-green-600">Healthy</Badge>
                  </div>
                  
                  <div className="grid gap-2">
                    <div className="flex justify-between text-sm">
                      <span>API Response Time</span>
                      <span className="font-bold text-green-600">245ms avg</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Error Rate</span>
                      <span className="font-bold text-green-600">0.03%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Throughput</span>
                      <span className="font-bold text-blue-600">45,230 req/min</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Integration Performance</CardTitle>
                <CardDescription>Key performance indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Data Sync Success Rate</span>
                    <span className="font-bold text-green-600">99.97%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Average Sync Time</span>
                    <span className="font-bold text-blue-600">2.3s</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Failed Transactions</span>
                    <span className="font-bold text-red-600">31 (0.03%)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Retry Success Rate</span>
                    <span className="font-bold text-green-600">94.2%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <div className="grid gap-6 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Authentication Status</CardTitle>
                <CardDescription>Security credential validation</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium">SAP OAuth2</span>
                    </div>
                    <Badge className="bg-green-600">Valid</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium">Oracle API Key</span>
                    </div>
                    <Badge className="bg-green-600">Valid</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm font-medium">Dynamics Certificate</span>
                    </div>
                    <Badge className="bg-yellow-600">Expires Soon</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Data Encryption</CardTitle>
                <CardDescription>Encryption standards and compliance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertTitle className="text-green-800">TLS 1.3 Active</AlertTitle>
                    <AlertDescription className="text-green-700">
                      Latest transport security protocol
                    </AlertDescription>
                  </Alert>
                  <Alert className="border-blue-200 bg-blue-50">
                    <CheckCircle className="h-4 w-4 text-blue-600" />
                    <AlertTitle className="text-blue-800">AES-256 Encryption</AlertTitle>
                    <AlertDescription className="text-blue-700">
                      Data at rest protection
                    </AlertDescription>
                  </Alert>
                  <Alert className="border-purple-200 bg-purple-50">
                    <CheckCircle className="h-4 w-4 text-purple-600" />
                    <AlertTitle className="text-purple-800">SOC 2 Compliant</AlertTitle>
                    <AlertDescription className="text-purple-700">
                      Enterprise security standards
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Access Control</CardTitle>
                <CardDescription>User permissions and roles</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Admin Users</span>
                    <Badge>3</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Integration Managers</span>
                    <Badge>8</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Read-Only Access</span>
                    <Badge>24</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">API Keys Active</span>
                    <Badge className="bg-green-600">12</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Transaction Volume</CardTitle>
                <CardDescription>Monthly transaction processing trends</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div>
                      <div className="font-bold text-blue-900 text-xl">{integrationMetrics.transactions}</div>
                      <div className="text-sm text-blue-700">Transactions this month</div>
                    </div>
                    <TrendingUp className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="font-bold text-gray-900">SAP</div>
                      <div className="text-sm text-gray-600">456K transactions</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="font-bold text-gray-900">Oracle</div>
                      <div className="text-sm text-gray-600">312K transactions</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cost Optimization</CardTitle>
                <CardDescription>Resource utilization and efficiency metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Resource Utilization</span>
                    <span className="font-bold text-green-600">87%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Cost Savings</span>
                    <span className="font-bold text-blue-600">$1.8M this quarter</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Auto-scaling Events</span>
                    <span className="font-bold text-purple-600">847 events</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Peak Performance</span>
                    <span className="font-bold text-orange-600">94% efficiency</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Global Infrastructure */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Globe className="h-5 w-5 mr-2" />
            Global Integration Infrastructure
          </CardTitle>
          <CardDescription>
            Worldwide enterprise integration network with Fortune 10 compliance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
              <Server className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="font-bold text-blue-900">99.99%</div>
              <div className="text-sm text-blue-700">Uptime SLA</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
              <Link className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="font-bold text-green-900">&lt;250ms</div>
              <div className="text-sm text-green-700">Response Time</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
              <Clock className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <div className="font-bold text-purple-900">24/7</div>
              <div className="text-sm text-purple-700">Support Available</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
              <Shield className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <div className="font-bold text-orange-900">SOC 2</div>
              <div className="text-sm text-orange-700">Compliance Certified</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}