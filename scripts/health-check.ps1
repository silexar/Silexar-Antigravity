#!/usr/bin/env pwsh
# 🏥 SILEXAR PULSE - Health Check Script
# Verifies all infrastructure components are healthy

param(
    [Parameter(Mandatory = $false)]
    [ValidateSet('production', 'staging', 'development')]
    [string]$Environment = 'production',
    
    [Parameter(Mandatory = $false)]
    [switch]$Detailed
)

$ErrorActionPreference = "Continue"

Write-Host "🏥 SILEXAR PULSE - Health Check" -ForegroundColor Cyan
Write-Host "Environment: $Environment" -ForegroundColor Yellow
Write-Host ""

$healthStatus = @{
    Passed   = 0
    Failed   = 0
    Warnings = 0
}

function Test-Component {
    param(
        [string]$Name,
        [scriptblock]$Test,
        [string]$SuccessMessage,
        [string]$FailureMessage
    )
    
    Write-Host "🔍 Checking $Name..." -ForegroundColor Yellow -NoNewline
    
    try {
        $result = & $Test
        if ($result) {
            Write-Host " ✅" -ForegroundColor Green
            if ($Detailed -and $SuccessMessage) {
                Write-Host "   $SuccessMessage" -ForegroundColor Gray
            }
            $script:healthStatus.Passed++
            return $true
        }
        else {
            Write-Host " ❌" -ForegroundColor Red
            if ($FailureMessage) {
                Write-Host "   $FailureMessage" -ForegroundColor Red
            }
            $script:healthStatus.Failed++
            return $false
        }
    }
    catch {
        Write-Host " ❌" -ForegroundColor Red
        Write-Host "   Error: $_" -ForegroundColor Red
        $script:healthStatus.Failed++
        return $false
    }
}

# 1. GKE Cluster Health
Write-Host ""
Write-Host "📦 Kubernetes Cluster" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

Test-Component -Name "Cluster connectivity" -Test {
    $null = kubectl cluster-info 2>&1
    $LASTEXITCODE -eq 0
} -SuccessMessage "Cluster is reachable" -FailureMessage "Cannot connect to cluster"

Test-Component -Name "Nodes ready" -Test {
    $nodes = kubectl get nodes --no-headers 2>&1 | Select-String "Ready"
    $nodes.Count -ge 2
} -SuccessMessage "All nodes are ready" -FailureMessage "Some nodes are not ready"

Test-Component -Name "System pods running" -Test {
    $pods = kubectl get pods -n kube-system --no-headers 2>&1 | Select-String "Running"
    $pods.Count -ge 5
} -SuccessMessage "System pods are healthy" -FailureMessage "Some system pods are not running"

# 2. Database Health
Write-Host ""
Write-Host "🗄️  Database" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

Test-Component -Name "Cloud SQL instance" -Test {
    $instances = gcloud sql instances list --format="value(state)" 2>&1 | Select-String "RUNNABLE"
    $instances.Count -ge 1
} -SuccessMessage "Cloud SQL is running" -FailureMessage "Cloud SQL is not running"

Test-Component -Name "Database replicas" -Test {
    $replicas = gcloud sql instances list --format="value(instanceType)" 2>&1 | Select-String "READ_REPLICA"
    if ($Environment -eq 'production') {
        $replicas.Count -ge 2
    }
    else {
        $true  # Replicas not required for non-prod
    }
} -SuccessMessage "Read replicas are healthy" -FailureMessage "Read replicas are missing or unhealthy"

# 3. Redis Health
Write-Host ""
Write-Host "🔴 Redis Cache" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

Test-Component -Name "Redis instance" -Test {
    $redis = gcloud redis instances list --format="value(state)" 2>&1 | Select-String "READY"
    $redis.Count -ge 1
} -SuccessMessage "Redis is ready" -FailureMessage "Redis is not ready"

# 4. Storage Health
Write-Host ""
Write-Host "🪣 Cloud Storage" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

Test-Component -Name "Assets bucket" -Test {
    $buckets = gsutil ls 2>&1 | Select-String "silexar-pulse-assets"
    $buckets.Count -ge 1
} -SuccessMessage "Assets bucket exists" -FailureMessage "Assets bucket not found"

Test-Component -Name "Backups bucket" -Test {
    $buckets = gsutil ls 2>&1 | Select-String "silexar-pulse-backups"
    $buckets.Count -ge 1
} -SuccessMessage "Backups bucket exists" -FailureMessage "Backups bucket not found"

# 5. Pub/Sub Health
Write-Host ""
Write-Host "📨 Cloud Pub/Sub" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

Test-Component -Name "Pub/Sub topics" -Test {
    $topics = gcloud pubsub topics list --format="value(name)" 2>&1
    $topics.Count -ge 3
} -SuccessMessage "All Pub/Sub topics exist" -FailureMessage "Some Pub/Sub topics are missing"

# 6. Monitoring Health
Write-Host ""
Write-Host "📊 Monitoring Stack" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

Test-Component -Name "Prometheus" -Test {
    $prometheus = kubectl get pods -n monitoring --no-headers 2>&1 | Select-String "prometheus.*Running"
    $prometheus.Count -ge 1
} -SuccessMessage "Prometheus is running" -FailureMessage "Prometheus is not running"

Test-Component -Name "Grafana" -Test {
    $grafana = kubectl get pods -n monitoring --no-headers 2>&1 | Select-String "grafana.*Running"
    $grafana.Count -ge 1
} -SuccessMessage "Grafana is running" -FailureMessage "Grafana is not running"

# 7. Network Health
Write-Host ""
Write-Host "🌐 Networking" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

Test-Component -Name "Load Balancer" -Test {
    $lb = gcloud compute addresses list --format="value(status)" 2>&1 | Select-String "IN_USE"
    $lb.Count -ge 1
} -SuccessMessage "Load Balancer is active" -FailureMessage "Load Balancer is not active"

Test-Component -Name "VPC Network" -Test {
    $vpc = gcloud compute networks list --format="value(name)" 2>&1 | Select-String "silexar-pulse"
    $vpc.Count -ge 1
} -SuccessMessage "VPC network exists" -FailureMessage "VPC network not found"

# 8. Application Health (if deployed)
Write-Host ""
Write-Host "🚀 Application" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

$null = kubectl get deployment -n $Environment silexar-pulse 2>&1
if ($LASTEXITCODE -eq 0) {
    Test-Component -Name "Application pods" -Test {
        $pods = kubectl get pods -n $Environment --no-headers 2>&1 | Select-String "silexar-pulse.*Running"
        $pods.Count -ge 1
    } -SuccessMessage "Application pods are running" -FailureMessage "Application pods are not running"
    
    Test-Component -Name "Application service" -Test {
        $null = kubectl get svc -n $Environment silexar-pulse 2>&1
        $LASTEXITCODE -eq 0
    } -SuccessMessage "Application service exists" -FailureMessage "Application service not found"
}
else {
    Write-Host "⚠️  Application not yet deployed" -ForegroundColor Yellow
    $script:healthStatus.Warnings++
}

# Summary
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "📊 Health Check Summary" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host ""
Write-Host "  ✅ Passed:   $($healthStatus.Passed)" -ForegroundColor Green
Write-Host "  ❌ Failed:   $($healthStatus.Failed)" -ForegroundColor Red
Write-Host "  ⚠️  Warnings: $($healthStatus.Warnings)" -ForegroundColor Yellow
Write-Host ""

$totalChecks = $healthStatus.Passed + $healthStatus.Failed
$healthPercentage = [math]::Round(($healthStatus.Passed / $totalChecks) * 100, 2)

Write-Host "  Overall Health: $healthPercentage%" -ForegroundColor $(
    if ($healthPercentage -ge 90) { "Green" }
    elseif ($healthPercentage -ge 70) { "Yellow" }
    else { "Red" }
)

Write-Host ""

if ($healthStatus.Failed -eq 0) {
    Write-Host "🎉 All systems are healthy!" -ForegroundColor Green
    exit 0
}
elseif ($healthStatus.Failed -le 2) {
    Write-Host "⚠️  Some systems need attention" -ForegroundColor Yellow
    exit 1
}
else {
    Write-Host "❌ Critical issues detected!" -ForegroundColor Red
    exit 2
}
