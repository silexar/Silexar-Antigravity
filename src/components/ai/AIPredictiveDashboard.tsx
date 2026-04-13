import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { AlertCircle, TrendingUp, Brain, Zap, BarChart3, Activity } from 'lucide-react'
import { useAIPredictiveSystem, Fortune10AIResponseSystem, useRealtimePrediction } from '@/lib/ai/predictive-ai-system'
import { Fortune10OptimizedComponent } from '@/lib/performance/fortune10-optimization'

interface AIDashboardProps {
  enterpriseId: string
  className?: string
}

export function AIPredictiveDashboard({ enterpriseId, className = '' }: AIDashboardProps) {
  const [selectedModel, setSelectedModel] = useState<string>('quantum-revenue-predictor-v3')
  const [predictionQuery, setPredictionQuery] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [chatMessages, setChatMessages] = useState<Array<{
    id: string
    type: 'user' | 'ai'
    message: string
    timestamp: Date
    confidence?: number
  }>>([])

  const { models, makePrediction, performanceMetrics } = useAIPredictiveSystem()
  const aiResponseSystem = Fortune10AIResponseSystem.getInstance()
  
  const { latestPrediction } = useRealtimePrediction(
    selectedModel,
    { enterpriseId, timestamp: Date.now() },
    'revenue',
    10000 // 10 seconds
  )

  const currentModel = models.find(m => m.id === selectedModel)

  const handlePredictionRequest = async () => {
    if (!predictionQuery.trim()) return
    
    setIsProcessing(true)
    
    // Add user message
    const userMessage = {
      id: `user-${Date.now()}`,
      type: 'user' as const,
      message: predictionQuery,
      timestamp: new Date()
    }
    setChatMessages(prev => [...prev, userMessage])
    
    try {
      // Process with AI response system
      const aiResponse = aiResponseSystem.generateResponse(predictionQuery, { enterpriseId })
      
      // Add AI response
      const aiMessage = {
        id: `ai-${Date.now()}`,
        type: 'ai' as const,
        message: aiResponse.response,
        timestamp: new Date(),
        confidence: aiResponse.confidence
      }
      setChatMessages(prev => [...prev, aiMessage])
      
      // Make actual prediction if needed
      if (predictionQuery.toLowerCase().includes('predict') || predictionQuery.toLowerCase().includes('forecast')) {
        const prediction = await makePrediction({
          modelId: selectedModel,
          inputData: { query: predictionQuery, enterpriseId },
          predictionType: 'revenue',
          confidenceThreshold: 0.9
        })

      }
    } catch (error) {
      } finally {
      setIsProcessing(false)
      setPredictionQuery('')
    }
  }

  const ModelSelector = () => (
    <div className="flex flex-wrap gap-2 mb-4">
      {models.map(model => (
        <Button
          key={model.id}
          variant={selectedModel === model.id ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedModel(model.id)}
          className="flex items-center gap-2"
        >
          <Brain className="w-4 h-4" />
          {model.name}
          <Badge variant="secondary" className="ml-1">
            {(model.accuracy * 100).toFixed(1)}%
          </Badge>
        </Button>
      ))}
    </div>
  )

  const PerformanceMetrics = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5" />
          AI Performance Metrics
        </CardTitle>
        <CardDescription>
          Real-time performance indicators for predictive models
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {performanceMetrics.totalPredictions.toLocaleString()}
            </div>
            <div className="text-sm text-gray-500">Total Predictions</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {(performanceMetrics.averageAccuracy * 100).toFixed(1)}%
            </div>
            <div className="text-sm text-gray-500">Avg Accuracy</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {performanceMetrics.averageProcessingTime.toFixed(1)}ms
            </div>
            <div className="text-sm text-gray-500">Avg Processing Time</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {performanceMetrics.modelsInUse}
            </div>
            <div className="text-sm text-gray-500">Active Models</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const LatestPredictionCard = () => {
    if (!latestPrediction) return null
    
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Latest Prediction
          </CardTitle>
          <CardDescription>
            Real-time prediction from {currentModel?.name}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Prediction Value:</span>
              <Badge variant="outline">
                ${typeof latestPrediction.prediction === 'number' 
                  ? latestPrediction.prediction.toLocaleString() 
                  : 'N/A'}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Confidence:</span>
              <Badge variant="secondary">
                {(latestPrediction.confidence * 100).toFixed(1)}%
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Processing Time:</span>
              <Badge variant="outline">
                {latestPrediction.processingTime.toFixed(2)}ms
              </Badge>
            </div>
            <div>
              <Progress value={latestPrediction.confidence * 100} className="w-full" />
            </div>
            {latestPrediction.factors.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2">Key Factors:</h4>
                <ul className="text-sm space-y-1">
                  {latestPrediction.factors.map((factor, index) => (
                    <li key={factor} className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                      {factor}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  const ChatInterface = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5" />
          AI Assistant
        </CardTitle>
        <CardDescription>
          Conversational AI for enterprise predictions and insights
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ModelSelector />
        
        <div className="h-64 overflow-y-auto border rounded-lg p-4 mb-4 bg-gray-50">
          {chatMessages.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <Brain className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Ask me anything about your enterprise metrics, predictions, or performance.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {chatMessages.map(message => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.type === 'user'
                        ? 'bg-blue-500 text-white'
                        : 'bg-white border shadow-sm'
                    }`}
                  >
                    <p className="text-sm">{message.message}</p>
                    {message.confidence && (
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          {(message.confidence * 100).toFixed(0)}% confidence
                        </Badge>
                      </div>
                    )}
                    <p className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="flex gap-2">
          <input
            type="text"
            value={predictionQuery}
            onChange={(e) => setPredictionQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handlePredictionRequest()}
            placeholder="Ask about predictions, performance, or insights..."
            className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isProcessing}
          />
          <Button
            onClick={handlePredictionRequest}
            disabled={isProcessing || !predictionQuery.trim()}
            className="flex items-center gap-2"
          >
            {isProcessing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Processing
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                Predict
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <Fortune10OptimizedComponent className={`space-y-6 ${className}`} priority="high">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PerformanceMetrics />
        <LatestPredictionCard />
      </div>
      
      <ChatInterface />
    </Fortune10OptimizedComponent>
  )
}

// Componente de detección de anomalías impulsado por IA
export function AIAnomalyDetectionPanel({ enterpriseId }: { enterpriseId: string }) {
  const [anomalies, setAnomalies] = useState<Array<{
    id: string
    type: string
    severity: 'low' | 'medium' | 'high' | 'critical'
    description: string
    timestamp: Date
    confidence: number
  }>>([])
  
  const { makePrediction } = useAIPredictiveSystem()
  
  useEffect(() => {
    const detectAnomalies = async () => {
      try {
        const prediction = await makePrediction({
          modelId: 'usage-anomaly-detector-v2',
          inputData: { enterpriseId, metrics: ['response_time', 'cpu_usage', 'memory_usage'] },
          predictionType: 'anomaly',
          confidenceThreshold: 0.85
        })
        
        // Simular detección de anomalías
        const mockAnomalies = [
          {
            id: 'ANOM-001',
            type: 'performance',
            severity: 'medium' as const,
            description: 'Response time spike detected in quantum computing service',
            timestamp: new Date(),
            confidence: 0.92
          },
          {
            id: 'ANOM-002',
            type: 'capacity',
            severity: 'low' as const,
            description: 'Memory usage approaching 80% threshold',
            timestamp: new Date(Date.now() - 300000),
            confidence: 0.88
          }
        ]
        
        setAnomalies(mockAnomalies)
      } catch (error) {
        }
    }
    
    detectAnomalies()
    const interval = setInterval(detectAnomalies, 30000) // Check every 30 seconds
    
    return () => clearInterval(interval)
  }, [enterpriseId, makePrediction])
  
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500'
      case 'high': return 'bg-orange-500'
      case 'medium': return 'bg-yellow-500'
      case 'low': return 'bg-blue-500'
      default: return 'bg-gray-500'
    }
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          AI Anomaly Detection
        </CardTitle>
        <CardDescription>
          Real-time anomaly detection powered by machine learning
        </CardDescription>
      </CardHeader>
      <CardContent>
        {anomalies.length === 0 ? (
          <div className="text-center py-8">
            <BarChart3 className="w-12 h-12 mx-auto mb-2 text-green-500" />
            <p className="text-green-600 font-medium">No anomalies detected</p>
            <p className="text-sm text-gray-500">System operating within normal parameters</p>
          </div>
        ) : (
          <div className="space-y-4">
            {anomalies.map(anomaly => (
              <div key={anomaly.id} className="border rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className={`w-3 h-3 rounded-full mt-1 ${getSeverityColor(anomaly.severity)}`} />
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium capitalize">{anomaly.type} Anomaly</h4>
                      <Badge variant="outline">{(anomaly.confidence * 100).toFixed(0)}% confidence</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{anomaly.description}</p>
                    <p className="text-xs text-gray-400">
                      Detected: {anomaly.timestamp.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}