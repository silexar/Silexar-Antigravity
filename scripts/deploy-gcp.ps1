#!/usr/bin/env pwsh
# 🚀 SILEXAR PULSE - Automated Deployment Script
# Deploys complete GCP infrastructure with HA/DR

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet('production', 'staging', 'development')]
    [string]$Environment,
    
    [Parameter(Mandatory=$false)]
    [switch]$SkipConfirmation,
    
    [Parameter(Mandatory=$false)]
    [switch]$DestroyFirst
)

$ErrorActionPreference = "Stop"

Write-Host "🚀 SILEXAR PULSE - GCP Deployment Script" -ForegroundColor Cyan
Write-Host "Environment: $Environment" -ForegroundColor Yellow
Write-Host ""

# Configuration
$PROJECT_ID = if ($Environment -eq 'production') { 
    "silexar-pulse-prod" 
} elseif ($Environment -eq 'staging') { 
    "silexar-pulse-staging" 
} else { 
    "silexar-pulse-dev" 
}

$REGION = "us-central1"
$TERRAFORM_DIR = Join-Path $PSScriptRoot ".."

# Step 1: Verify prerequisites
Write-Host "📋 Step 1: Verifying prerequisites..." -ForegroundColor Green

# Check gcloud
try {
    $gcloudVersion = gcloud --version 2>&1 | Select-String "Google Cloud SDK"
    Write-Host "✅ Google Cloud SDK: $gcloudVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Google Cloud SDK not found. Please install it first." -ForegroundColor Red
    exit 1
}

# Check terraform
try {
    $terraformVersion = terraform --version 2>&1 | Select-Object -First 1
    Write-Host "✅ Terraform: $terraformVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Terraform not found. Please install it first." -ForegroundColor Red
    exit 1
}

# Check kubectl
try {
    $kubectlVersion = kubectl version --client 2>&1 | Select-String "Client Version"
    Write-Host "✅ kubectl: $kubectlVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ kubectl not found. Please install it first." -ForegroundColor Red
    exit 1
}

# Step 2: Configure GCP project
Write-Host ""
Write-Host "🔧 Step 2: Configuring GCP project..." -ForegroundColor Green

gcloud config set project $PROJECT_ID
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to set GCP project. Please check your credentials." -ForegroundColor Red
    exit 1
}

Write-Host "✅ GCP project set to: $PROJECT_ID" -ForegroundColor Green

# Step 3: Enable required APIs
Write-Host ""
Write-Host "🔌 Step 3: Enabling required APIs..." -ForegroundColor Green

$requiredApis = @(
    "compute.googleapis.com",
    "container.googleapis.com",
    "sqladmin.googleapis.com",
    "redis.googleapis.com",
    "storage-api.googleapis.com",
    "cloudkms.googleapis.com",
    "secretmanager.googleapis.com",
    "monitoring.googleapis.com",
    "logging.googleapis.com",
    "pubsub.googleapis.com",
    "aiplatform.googleapis.com"
)

foreach ($api in $requiredApis) {
    Write-Host "  Enabling $api..." -ForegroundColor Yellow
    gcloud services enable $api --project=$PROJECT_ID 2>&1 | Out-Null
}

Write-Host "✅ All required APIs enabled" -ForegroundColor Green

# Step 4: Create Terraform state bucket if not exists
Write-Host ""
Write-Host "🪣 Step 4: Setting up Terraform state bucket..." -ForegroundColor Green

$stateBucket = "silexar-pulse-terraform-state-$PROJECT_ID"
$bucketExists = gsutil ls -b gs://$stateBucket 2>&1 | Select-String "gs://$stateBucket"

if (-not $bucketExists) {
    Write-Host "  Creating state bucket: $stateBucket" -ForegroundColor Yellow
    gsutil mb -p $PROJECT_ID -c STANDARD -l $REGION gs://$stateBucket
    gsutil versioning set on gs://$stateBucket
    Write-Host "✅ State bucket created" -ForegroundColor Green
} else {
    Write-Host "✅ State bucket already exists" -ForegroundColor Green
}

# Step 5: Prepare Terraform variables
Write-Host ""
Write-Host "📝 Step 5: Preparing Terraform variables..." -ForegroundColor Green

$tfvarsFile = Join-Path $TERRAFORM_DIR "terraform.tfvars"
$tfvarsExample = Join-Path $TERRAFORM_DIR "terraform.tfvars.$Environment.example"

if (-not (Test-Path $tfvarsFile)) {
    if (Test-Path $tfvarsExample) {
        Copy-Item $tfvarsExample $tfvarsFile
        Write-Host "✅ Created terraform.tfvars from example" -ForegroundColor Green
        Write-Host "⚠️  Please edit terraform.tfvars with your actual values!" -ForegroundColor Yellow
        
        if (-not $SkipConfirmation) {
            $continue = Read-Host "Have you edited terraform.tfvars? (yes/no)"
            if ($continue -ne "yes") {
                Write-Host "❌ Deployment cancelled. Please edit terraform.tfvars first." -ForegroundColor Red
                exit 1
            }
        }
    } else {
        Write-Host "❌ terraform.tfvars not found and no example available" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "✅ terraform.tfvars found" -ForegroundColor Green
}

# Step 6: Destroy existing infrastructure if requested
if ($DestroyFirst) {
    Write-Host ""
    Write-Host "💥 Step 6: Destroying existing infrastructure..." -ForegroundColor Red
    
    if (-not $SkipConfirmation) {
        $confirm = Read-Host "Are you sure you want to DESTROY all infrastructure? (yes/no)"
        if ($confirm -ne "yes") {
            Write-Host "❌ Destroy cancelled" -ForegroundColor Yellow
            exit 1
        }
    }
    
    Push-Location $TERRAFORM_DIR
    terraform destroy -auto-approve
    Pop-Location
    
    Write-Host "✅ Infrastructure destroyed" -ForegroundColor Green
}

# Step 7: Initialize Terraform
Write-Host ""
Write-Host "🔧 Step 7: Initializing Terraform..." -ForegroundColor Green

Push-Location $TERRAFORM_DIR

terraform init -backend-config="bucket=$stateBucket"
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Terraform init failed" -ForegroundColor Red
    Pop-Location
    exit 1
}

Write-Host "✅ Terraform initialized" -ForegroundColor Green

# Step 8: Validate Terraform configuration
Write-Host ""
Write-Host "✅ Step 8: Validating Terraform configuration..." -ForegroundColor Green

terraform validate
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Terraform validation failed" -ForegroundColor Red
    Pop-Location
    exit 1
}

Write-Host "✅ Terraform configuration valid" -ForegroundColor Green

# Step 9: Plan Terraform deployment
Write-Host ""
Write-Host "📋 Step 9: Planning Terraform deployment..." -ForegroundColor Green

terraform plan -out=tfplan
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Terraform plan failed" -ForegroundColor Red
    Pop-Location
    exit 1
}

Write-Host "✅ Terraform plan created" -ForegroundColor Green

# Step 10: Apply Terraform configuration
Write-Host ""
Write-Host "🚀 Step 10: Applying Terraform configuration..." -ForegroundColor Green
Write-Host "⏱️  This will take approximately 15-20 minutes..." -ForegroundColor Yellow

if (-not $SkipConfirmation) {
    $confirm = Read-Host "Proceed with deployment? (yes/no)"
    if ($confirm -ne "yes") {
        Write-Host "❌ Deployment cancelled" -ForegroundColor Yellow
        Pop-Location
        exit 1
    }
}

$startTime = Get-Date

terraform apply tfplan
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Terraform apply failed" -ForegroundColor Red
    Pop-Location
    exit 1
}

$endTime = Get-Date
$duration = $endTime - $startTime

Write-Host "✅ Infrastructure deployed successfully!" -ForegroundColor Green
Write-Host "⏱️  Deployment took: $($duration.ToString('mm\:ss'))" -ForegroundColor Cyan

# Step 11: Get outputs
Write-Host ""
Write-Host "📊 Step 11: Getting deployment outputs..." -ForegroundColor Green

$gkeClusterName = terraform output -raw gke_cluster_name
$postgresConnectionName = terraform output -raw postgres_connection_name
$redisHost = terraform output -raw redis_host
$loadBalancerIp = terraform output -raw load_balancer_ip

Write-Host "  GKE Cluster: $gkeClusterName" -ForegroundColor Cyan
Write-Host "  PostgreSQL: $postgresConnectionName" -ForegroundColor Cyan
Write-Host "  Redis Host: $redisHost" -ForegroundColor Cyan
Write-Host "  Load Balancer IP: $loadBalancerIp" -ForegroundColor Cyan

Pop-Location

# Step 12: Configure kubectl
Write-Host ""
Write-Host "🔧 Step 12: Configuring kubectl..." -ForegroundColor Green

gcloud container clusters get-credentials $gkeClusterName --region $REGION --project $PROJECT_ID
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to get GKE credentials" -ForegroundColor Red
    exit 1
}

Write-Host "✅ kubectl configured" -ForegroundColor Green

# Step 13: Create namespaces
Write-Host ""
Write-Host "📦 Step 13: Creating Kubernetes namespaces..." -ForegroundColor Green

$namespaces = @("production", "staging", "monitoring")
foreach ($ns in $namespaces) {
    kubectl create namespace $ns --dry-run=client -o yaml | kubectl apply -f -
    Write-Host "  ✅ Namespace: $ns" -ForegroundColor Green
}

# Step 14: Install monitoring stack
Write-Host ""
Write-Host "📊 Step 14: Installing monitoring stack..." -ForegroundColor Green

# Add Helm repos
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts 2>&1 | Out-Null
helm repo add grafana https://grafana.github.io/helm-charts 2>&1 | Out-Null
helm repo update 2>&1 | Out-Null

# Install Prometheus
Write-Host "  Installing Prometheus..." -ForegroundColor Yellow
helm upgrade --install prometheus prometheus-community/kube-prometheus-stack `
    --namespace monitoring `
    --set prometheus.prometheusSpec.retention=30d `
    --set prometheus.prometheusSpec.storageSpec.volumeClaimTemplate.spec.resources.requests.storage=50Gi `
    --wait 2>&1 | Out-Null

Write-Host "  ✅ Prometheus installed" -ForegroundColor Green

# Install Grafana
Write-Host "  Installing Grafana..." -ForegroundColor Yellow
helm upgrade --install grafana grafana/grafana `
    --namespace monitoring `
    --set persistence.enabled=true `
    --set persistence.size=10Gi `
    --set adminPassword="SilexarPulse2024!" `
    --wait 2>&1 | Out-Null

Write-Host "  ✅ Grafana installed" -ForegroundColor Green

# Step 15: Deployment summary
Write-Host ""
Write-Host "🎉 DEPLOYMENT COMPLETED SUCCESSFULLY!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Summary:" -ForegroundColor Cyan
Write-Host "  Environment: $Environment" -ForegroundColor White
Write-Host "  Project ID: $PROJECT_ID" -ForegroundColor White
Write-Host "  Region: $REGION" -ForegroundColor White
Write-Host "  GKE Cluster: $gkeClusterName" -ForegroundColor White
Write-Host "  Load Balancer IP: $loadBalancerIp" -ForegroundColor White
Write-Host ""
Write-Host "🔗 Next Steps:" -ForegroundColor Cyan
Write-Host "  1. Configure DNS to point to Load Balancer IP: $loadBalancerIp" -ForegroundColor White
Write-Host "  2. Deploy application: kubectl apply -f k8s/production/" -ForegroundColor White
Write-Host "  3. Access Grafana: kubectl port-forward -n monitoring svc/grafana 3000:80" -ForegroundColor White
Write-Host "  4. Run health checks: .\scripts\health-check.ps1" -ForegroundColor White
Write-Host ""
Write-Host "✅ Infrastructure is ready for application deployment!" -ForegroundColor Green
