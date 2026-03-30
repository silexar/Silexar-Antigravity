# API Integration Examples

This guide provides practical examples for integrating with the Silexar Pulse Quantum API across different programming languages and use cases.

## Authentication Examples

### JavaScript/Node.js

```javascript
// Basic authentication setup
const API_BASE_URL = 'https://api.silexar.com/v1';
const API_KEY = process.env.SILEXAR_API_KEY;

class SilexarAPI {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseURL = API_BASE_URL;
  }

  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      'User-Agent': 'Silexar-Client/1.0.0',
      ...options.headers
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Request failed:', error);
      throw error;
    }
  }
}

// Usage
const client = new SilexarAPI(API_KEY);
```

### Python

```python
import os
import requests
from datetime import datetime

class SilexarAPI:
    def __init__(self, api_key=None):
        self.api_key = api_key or os.getenv('SILEXAR_API_KEY')
        self.base_url = 'https://api.silexar.com/v1'
        self.session = requests.Session()
        self.session.headers.update({
            'Authorization': f'Bearer {self.api_key}',
            'Content-Type': 'application/json',
            'User-Agent': 'Silexar-Client/1.0.0'
        })

    def make_request(self, endpoint, method='GET', data=None, params=None):
        url = f'{self.base_url}{endpoint}'
        
        try:
            response = self.session.request(
                method=method,
                url=url,
                json=data,
                params=params
            )
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f'Request failed: {e}')
            raise

# Usage
client = SilexarAPI()
```

### PHP

```php
<?php
class SilexarAPI {
    private $apiKey;
    private $baseURL = 'https://api.silexar.com/v1';
    
    public function __construct($apiKey = null) {
        $this->apiKey = $apiKey ?: $_ENV['SILEXAR_API_KEY'];
    }
    
    public function makeRequest($endpoint, $method = 'GET', $data = null, $params = []) {
        $url = $this->baseURL . $endpoint;
        
        $headers = [
            'Authorization: Bearer ' . $this->apiKey,
            'Content-Type: application/json',
            'User-Agent: Silexar-Client/1.0.0'
        ];
        
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url . ($params ? '?' . http_build_query($params) : ''));
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
        
        if ($method === 'POST') {
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        } elseif ($method === 'PUT') {
            curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'PUT');
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        } elseif ($method === 'DELETE') {
            curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'DELETE');
        }
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        if ($httpCode >= 400) {
            throw new Exception("API Error: $httpCode - $response");
        }
        
        return json_decode($response, true);
    }
}

// Usage
$client = new SilexarAPI();
?>
```

## Business Intelligence Integration Examples

### Monthly Revenue Dashboard

```javascript
// Monthly revenue tracking
async function getMonthlyRevenueDashboard() {
  try {
    const currentDate = new Date();
    const startDate = new Date(currentDate.getFullYear(), 0, 1).toISOString().split('T')[0];
    const endDate = currentDate.toISOString().split('T')[0];

    const revenueData = await client.makeRequest('/analytics/revenue', {
      method: 'GET',
      params: {
        startDate,
        endDate,
        granularity: 'monthly',
        groupBy: 'contract'
      }
    });

    // Process and display data
    const monthlyData = revenueData.revenue.map(month => ({
      month: month.date,
      revenue: month.total,
      growth: month.growth,
      recurring: month.recurring,
      oneTime: month.oneTime
    }));

    return {
      monthlyData,
      summary: revenueData.summary,
      chartData: {
        labels: monthlyData.map(m => m.month),
        datasets: [
          {
            label: 'Total Revenue',
            data: monthlyData.map(m => m.revenue),
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1
          },
          {
            label: 'Recurring Revenue',
            data: monthlyData.map(m => m.recurring),
            borderColor: 'rgb(255, 99, 132)',
            tension: 0.1
          }
        ]
      }
    };
  } catch (error) {
    console.error('Failed to fetch revenue data:', error);
    throw error;
  }
}
```

### Contract Performance Monitoring

```python
def monitor_contract_performance():
    """Monitor contract performance and renewal rates"""
    try:
        # Get contract analytics
        contracts_data = client.make_request('/analytics/contracts')
        
        # Calculate key metrics
        total_contracts = contracts_data['totalContracts']
        active_contracts = contracts_data['activeContracts']
        renewal_rate = (contracts_data['lifecycle']['renewed'] / 
                       (contracts_data['lifecycle']['renewed'] + contracts_data['lifecycle']['churned'])) * 100
        
        # Identify at-risk contracts
        at_risk_threshold = 30  # days until expiration
        at_risk_contracts = []
        
        for contract in contracts_data.get('contracts', []):
            if contract['daysUntilExpiration'] <= at_risk_threshold:
                at_risk_contracts.append({
                    'id': contract['id'],
                    'name': contract['name'],
                    'value': contract['value'],
                    'expirationDate': contract['expirationDate'],
                    'daysUntilExpiration': contract['daysUntilExpiration']
                })
        
        return {
            'summary': {
                'totalContracts': total_contracts,
                'activeContracts': active_contracts,
                'renewalRate': renewal_rate,
                'atRiskContracts': len(at_risk_contracts)
            },
            'atRiskContracts': at_risk_contracts,
            'recommendations': generate_renewal_recommendations(at_risk_contracts)
        }
        
    except Exception as e:
        print(f'Failed to monitor contract performance: {e}')
        raise

def generate_renewal_recommendations(at_risk_contracts):
    """Generate renewal recommendations based on contract analysis"""
    recommendations = []
    
    for contract in at_risk_contracts:
        if contract['value'] > 50000:
            recommendations.append({
                'contractId': contract['id'],
                'action': 'schedule_executive_meeting',
                'priority': 'high',
                'message': f'High-value contract expiring in {contract["daysUntilExpiration"]} days'
            })
        elif contract['value'] > 10000:
            recommendations.append({
                'contractId': contract['id'],
                'action': 'send_renewal_proposal',
                'priority': 'medium',
                'message': f'Medium-value contract expiring soon'
            })
    
    return recommendations
```

## Billing Integration Examples

### Automated Invoice Generation

```javascript
// Automated monthly invoice generation
async function generateMonthlyInvoices() {
  const currentDate = new Date();
  const lastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
  const lastMonthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);

  try {
    // Get active contracts
    const contracts = await client.make_request('/contracts', {
      params: {
        status: 'active',
        billingCycle: 'monthly'
      }
    });

    const generatedInvoices = [];

    for (const contract of contracts) {
      try {
        // Calculate billing amount based on usage
        const usage = await calculateContractUsage(contract.id, lastMonth, lastMonthEnd);
        
        // Create invoice
        const invoice = await client.make_request('/billing/invoices', {
          method: 'POST',
          data: {
            contractId: contract.id,
            billingPeriod: {
              start: lastMonth.toISOString().split('T')[0],
              end: lastMonthEnd.toISOString().split('T')[0]
            },
            items: [
              {
                description: `${contract.planName} - ${lastMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}`,
                quantity: 1,
                unitPrice: contract.basePrice,
                taxRate: contract.taxRate || 0.08,
                category: 'subscription'
              },
              ...usage.additionalItems
            ],
            paymentTerms: contract.paymentTerms || 'Net 30',
            notes: generateInvoiceNotes(contract, usage)
          }
        });

        generatedInvoices.push({
          contractId: contract.id,
          invoiceId: invoice.id,
          invoiceNumber: invoice.invoiceNumber,
          total: invoice.total,
          status: 'generated'
        });

      } catch (error) {
        console.error(`Failed to generate invoice for contract ${contract.id}:`, error);
        generatedInvoices.push({
          contractId: contract.id,
          status: 'failed',
          error: error.message
        });
      }
    }

    return {
      totalContracts: contracts.length,
      generatedInvoices: generatedInvoices.filter(inv => inv.status === 'generated').length,
      failedInvoices: generatedInvoices.filter(inv => inv.status === 'failed').length,
      invoices: generatedInvoices
    };

  } catch (error) {
    console.error('Failed to generate monthly invoices:', error);
    throw error;
  }
}

async function calculateContractUsage(contractId, startDate, endDate) {
  // Calculate usage-based billing items
  const usageData = await client.make_request(`/contracts/${contractId}/usage`, {
    params: {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    }
  });

  const additionalItems = [];

  // Add overage charges
  if (usageData.overages && usageData.overages.length > 0) {
    usageData.overages.forEach(overage => {
      additionalItems.push({
        description: `${overage.metric} Overage - ${overage.quantity} units`,
        quantity: overage.quantity,
        unitPrice: overage.unitPrice,
        taxRate: 0.08,
        category: 'usage'
      });
    });
  }

  return {
    totalUsage: usageData.totalUsage,
    overages: usageData.overages,
    additionalItems
  };
}

function generateInvoiceNotes(contract, usage) {
  let notes = `Monthly service invoice for ${contract.companyName}\n`;
  notes += `Service Period: ${usage.totalUsage.startDate} to ${usage.totalUsage.endDate}\n`;
  
  if (usage.overages.length > 0) {
    notes += `\nUsage overages applied as per contract terms.`;
  }
  
  notes += `\n\nThank you for choosing Silexar Pulse Quantum!`;
  return notes;
}
```

### Payment Processing Integration

```python
import stripe
import json
from datetime import datetime, timedelta

class PaymentProcessor:
    def __init__(self, stripe_api_key, silexar_client):
        stripe.api_key = stripe_api_key
        self.silexar_client = silexar_client
    
    def process_pending_invoices(self):
        """Process all pending invoices for payment"""
        try:
            # Get pending invoices
            pending_invoices = self.silexar_client.make_request('/billing/invoices', {
                'params': {
                    'status': 'sent',
                    'dueDateStart': datetime.now().strftime('%Y-%m-%d'),
                    'limit': 100
                }
            })
            
            processed_payments = []
            
            for invoice in pending_invoices['invoices']:
                try:
                    # Check if invoice is due for payment
                    due_date = datetime.fromisoformat(invoice['dueDate'].replace('Z', '+00:00'))
                    if datetime.now() >= due_date:
                        payment_result = self.process_invoice_payment(invoice)
                        processed_payments.append(payment_result)
                
                except Exception as e:
                    print(f'Failed to process invoice {invoice["id"]}: {e}')
                    processed_payments.append({
                        'invoiceId': invoice['id'],
                        'status': 'failed',
                        'error': str(e)
                    })
            
            return {
                'totalProcessed': len(processed_payments),
                'successful': len([p for p in processed_payments if p['status'] == 'success']),
                'failed': len([p for p in processed_payments if p['status'] == 'failed']),
                'results': processed_payments
            }
            
        except Exception as e:
            print(f'Failed to process pending invoices: {e}')
            raise
    
    def process_invoice_payment(self, invoice):
        """Process payment for a specific invoice"""
        try:
            # Get customer payment method
            customer = self.get_customer_by_contract(invoice['contractId'])
            
            if not customer or not customer.get('defaultPaymentMethod'):
                return {
                    'invoiceId': invoice['id'],
                    'status': 'failed',
                    'error': 'No payment method on file'
                }
            
            # Create Stripe payment intent
            payment_intent = stripe.PaymentIntent.create(
                amount=int(invoice['total'] * 100),  # Convert to cents
                currency=invoice['currency'].lower(),
                customer=customer['stripeCustomerId'],
                payment_method=customer['defaultPaymentMethod'],
                confirm=True,
                metadata={
                    'invoice_id': invoice['id'],
                    'contract_id': invoice['contractId'],
                    'payment_type': 'automatic_invoice'
                }
            )
            
            if payment_intent.status == 'succeeded':
                # Update invoice status in Silexar
                updated_invoice = self.silexar_client.make_request(
                    f'/billing/invoices/{invoice["id"]}/payment',
                    method='POST',
                    data={
                        'paymentMethod': 'stripe',
                        'paymentIntentId': payment_intent.id,
                        'amount': invoice['total'],
                        'currency': invoice['currency'],
                        'processedAt': datetime.now().isoformat()
                    }
                )
                
                return {
                    'invoiceId': invoice['id'],
                    'status': 'success',
                    'paymentIntentId': payment_intent.id,
                    'amount': invoice['total']
                }
            else:
                return {
                    'invoiceId': invoice['id'],
                    'status': 'failed',
                    'error': f'Payment intent status: {payment_intent.status}'
                }
                
        except stripe.error.StripeError as e:
            print(f'Stripe error processing invoice {invoice["id"]}: {e}')
            return {
                'invoiceId': invoice['id'],
                'status': 'failed',
                'error': f'Stripe error: {e.user_message or str(e)}'
            }
        except Exception as e:
            print(f'Error processing invoice {invoice["id"]}: {e}')
            return {
                'invoiceId': invoice['id'],
                'status': 'failed',
                'error': str(e)
            }
    
    def get_customer_by_contract(self, contract_id):
        """Get customer information by contract ID"""
        try:
            contract = self.silexar_client.make_request(f'/contracts/{contract_id}')
            customer = self.silexar_client.make_request(f'/customers/{contract["customerId"]}')
            return customer
        except Exception as e:
            print(f'Failed to get customer for contract {contract_id}: {e}')
            return None
```

## Error Handling and Retry Logic

```javascript
// Comprehensive error handling with retry logic
class RobustAPIClient {
  constructor(apiKey, options = {}) {
    this.apiKey = apiKey;
    this.baseURL = options.baseURL || 'https://api.silexar.com/v1';
    this.maxRetries = options.maxRetries || 3;
    this.retryDelay = options.retryDelay || 1000;
    this.timeout = options.timeout || 30000;
  }

  async makeRequest(endpoint, options = {}, attempt = 1) {
    const url = `${this.baseURL}${endpoint}`;
    const controller = new AbortController();
    
    // Set timeout
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'User-Agent': 'Silexar-Client/1.0.0',
          ...options.headers
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        
        // Handle specific error cases
        if (response.status === 429) {
          // Rate limiting - wait and retry
          const retryAfter = response.headers.get('Retry-After') || 60;
          throw new RateLimitError(`Rate limit exceeded. Retry after ${retryAfter} seconds`, retryAfter);
        } else if (response.status >= 500 && attempt < this.maxRetries) {
          // Server error - retry with exponential backoff
          throw new ServerError(`Server error: ${response.status}`, response.status);
        } else if (response.status === 401) {
          // Authentication error - don't retry
          throw new AuthenticationError('Invalid API key');
        } else {
          // Other errors
          throw new APIError(errorData.error?.message || `HTTP ${response.status}`, response.status, errorData);
        }
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        throw new TimeoutError('Request timeout');
      }
      
      // Retry logic for specific errors
      if (this.shouldRetry(error) && attempt < this.maxRetries) {
        const delay = this.getRetryDelay(attempt);
        console.log(`Retrying request (attempt ${attempt + 1}) after ${delay}ms delay...`);
        await this.sleep(delay);
        return this.makeRequest(endpoint, options, attempt + 1);
      }
      
      throw error;
    }
  }

  shouldRetry(error) {
    return error instanceof ServerError || error instanceof RateLimitError;
  }

  getRetryDelay(attempt) {
    // Exponential backoff with jitter
    const baseDelay = this.retryDelay;
    const maxDelay = 30000; // 30 seconds
    const jitter = Math.random() * 0.1 + 0.95; // 95-105% of calculated delay
    const delay = Math.min(baseDelay * Math.pow(2, attempt - 1) * jitter, maxDelay);
    return delay;
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Custom error classes
class APIError extends Error {
  constructor(message, statusCode, data = null) {
    super(message);
    this.name = 'APIError';
    this.statusCode = statusCode;
    this.data = data;
  }
}

class ServerError extends APIError {
  constructor(message, statusCode) {
    super(message, statusCode);
    this.name = 'ServerError';
  }
}

class RateLimitError extends APIError {
  constructor(message, retryAfter) {
    super(message, 429);
    this.name = 'RateLimitError';
    this.retryAfter = retryAfter;
  }
}

class AuthenticationError extends APIError {
  constructor(message) {
    super(message, 401);
    this.name = 'AuthenticationError';
  }
}

class TimeoutError extends APIError {
  constructor(message) {
    super(message, 408);
    this.name = 'TimeoutError';
  }
}

// Usage example
const client = new RobustAPIClient('YOUR_API_KEY');

try {
  const metrics = await client.makeRequest('/analytics/dashboard-metrics', {
    params: { timeRange: '30d' }
  });
  console.log('Dashboard metrics:', metrics);
} catch (error) {
  if (error instanceof RateLimitError) {
    console.log(`Rate limited. Retry after ${error.retryAfter} seconds`);
  } else if (error instanceof AuthenticationError) {
    console.log('Check your API key');
  } else {
    console.log('Request failed:', error.message);
  }
}
```

## Real-time Data Streaming

```javascript
// WebSocket connection for real-time updates
class SilexarRealtimeClient {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.ws = null;
    this.reconnectInterval = 5000;
    this.maxReconnectAttempts = 5;
    this.reconnectAttempts = 0;
    this.eventHandlers = new Map();
  }

  connect() {
    const wsUrl = `wss://api.silexar.com/v1/realtime?api_key=${this.apiKey}`;
    
    this.ws = new WebSocket(wsUrl);
    
    this.ws.onopen = () => {
      console.log('Connected to Silexar realtime API');
      this.reconnectAttempts = 0;
      this.subscribeToEvents();
    };
    
    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.handleMessage(data);
      } catch (error) {
        console.error('Failed to parse message:', error);
      }
    };
    
    this.ws.onclose = () => {
      console.log('Disconnected from Silexar realtime API');
      this.attemptReconnect();
    };
    
    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }

  subscribeToEvents() {
    const events = [
      'invoice.created',
      'invoice.paid',
      'contract.signed',
      'contract.renewed',
      'analytics.updated'
    ];
    
    events.forEach(event => {
      this.ws.send(JSON.stringify({
        action: 'subscribe',
        event: event
      }));
    });
  }

  handleMessage(data) {
    const handler = this.eventHandlers.get(data.type);
    if (handler) {
      handler(data.payload);
    }
  }

  on(event, handler) {
    this.eventHandlers.set(event, handler);
  }

  off(event) {
    this.eventHandlers.delete(event);
  }

  attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting reconnection ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
      
      setTimeout(() => {
        this.connect();
      }, this.reconnectInterval);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

// Usage
const realtimeClient = new SilexarRealtimeClient('YOUR_API_KEY');

// Handle invoice events
realtimeClient.on('invoice.created', (invoice) => {
  console.log('New invoice created:', invoice.invoiceNumber);
  // Update dashboard, send notifications, etc.
});

realtimeClient.on('invoice.paid', (payment) => {
  console.log('Invoice paid:', payment.invoiceId);
  // Update accounting, send confirmations, etc.
});

// Handle contract events
realtimeClient.on('contract.signed', (contract) => {
  console.log('Contract signed:', contract.id);
  // Update CRM, trigger onboarding, etc.
});

realtimeClient.on('contract.renewed', (renewal) => {
  console.log('Contract renewed:', renewal.contractId);
  // Update metrics, send notifications, etc.
});

// Connect to realtime API
realtimeClient.connect();
```

## Best Practices

### 1. Environment Configuration

```javascript
// config.js
const config = {
  development: {
    apiUrl: 'http://localhost:3000/api/v1',
    apiKey: process.env.DEV_API_KEY,
    timeout: 30000,
    maxRetries: 3
  },
  staging: {
    apiUrl: 'https://staging-api.silexar.com/v1',
    apiKey: process.env.STAGING_API_KEY,
    timeout: 20000,
    maxRetries: 2
  },
  production: {
    apiUrl: 'https://api.silexar.com/v1',
    apiKey: process.env.PRODUCTION_API_KEY,
    timeout: 15000,
    maxRetries: 2
  }
};

const environment = process.env.NODE_ENV || 'development';
module.exports = config[environment];
```

### 2. Request Caching

```javascript
// Simple in-memory cache
class RequestCache {
  constructor(ttl = 300000) { // 5 minutes default
    this.cache = new Map();
    this.ttl = ttl;
  }

  get(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.ttl) {
      return cached.data;
    }
    return null;
  }

  set(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  clear() {
    this.cache.clear();
  }

  delete(key) {
    this.cache.delete(key);
  }
}

// Usage with API client
const cache = new RequestCache();

async function getCachedDashboardMetrics() {
  const cacheKey = 'dashboard-metrics-30d';
  
  // Check cache first
  const cached = cache.get(cacheKey);
  if (cached) {
    console.log('Returning cached metrics');
    return cached;
  }

  // Fetch from API if not cached
  const metrics = await client.make_request('/analytics/dashboard-metrics', {
    params: { timeRange: '30d' }
  });

  // Cache the result
  cache.set(cacheKey, metrics);
  
  return metrics;
}
```

### 3. Comprehensive Logging

```javascript
// Structured logging
class APILogger {
  constructor() {
    this.logs = [];
  }

  log(level, message, data = {}) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
      correlationId: data.correlationId || this.generateCorrelationId()
    };

    this.logs.push(logEntry);
    
    // Console output
    console[level] || console.log(`[${level.toUpperCase()}] ${message}`, data);
    
    // In production, send to logging service
    if (process.env.NODE_ENV === 'production') {
      this.sendToLoggingService(logEntry);
    }
  }

  info(message, data) { this.log('info', message, data); }
  warn(message, data) { this.log('warn', message, data); }
  error(message, data) { this.log('error', message, data); }
  debug(message, data) { this.log('debug', message, data); }

  generateCorrelationId() {
    return Math.random().toString(36).substring(2, 15);
  }

  async sendToLoggingService(logEntry) {
    // Send to external logging service (e.g., ELK stack, Splunk, etc.)
    try {
      await fetch('https://logs.your-company.com/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(logEntry)
      });
    } catch (error) {
      console.error('Failed to send log to external service:', error);
    }
  }
}

// Usage
const logger = new APILogger();

// Log API requests
async function loggedAPIRequest(endpoint, options) {
  const correlationId = logger.generateCorrelationId();
  const startTime = Date.now();
  
  logger.info('Starting API request', {
    correlationId,
    endpoint,
    method: options.method || 'GET'
  });

  try {
    const result = await client.make_request(endpoint, options);
    const duration = Date.now() - startTime;
    
    logger.info('API request completed successfully', {
      correlationId,
      endpoint,
      duration,
      status: 'success'
    });
    
    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    
    logger.error('API request failed', {
      correlationId,
      endpoint,
      duration,
      error: error.message,
      status: error.statusCode || 'unknown'
    });
    
    throw error;
  }
}
```

This comprehensive guide provides enterprise-grade integration examples for the Silexar Pulse Quantum API, covering authentication, error handling, real-time updates, and best practices for production deployments.