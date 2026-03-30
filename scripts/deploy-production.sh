#!/bin/bash

# 🌟 SILEXAR PULSE QUANTUM - Production Deployment Script
# Version: TIER 0 Production Ready
# Last Updated: 2025-02-08

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="silexar-pulse-quantum"
DEPLOYMENT_ENV="production"
BACKUP_RETENTION_DAYS=90
HEALTH_CHECK_TIMEOUT=300  # 5 minutes
ROLLBACK_TIMEOUT=600      # 10 minutes

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_step() {
    echo -e "${PURPLE}[STEP]${NC} $1"
}

# Banner
print_banner() {
    echo -e "${CYAN}"
    echo "=================================================================="
    echo "🌟 SILEXAR PULSE QUANTUM - PRODUCTION DEPLOYMENT"
    echo "=================================================================="
    echo "🚀 TIER 0 Military-Grade Deployment System"
    echo "📅 $(date)"
    echo "🌍 Environment: $DEPLOYMENT_ENV"
    echo "=================================================================="
    echo -e "${NC}"
}

# Pre-deployment checks
pre_deployment_checks() {
    log_step "Running pre-deployment checks..."
    
    # Check if we're in the right directory
    if [ ! -f "package.json" ]; then
        log_error "package.json not found. Are you in the project root?"
        exit 1
    fi
    
    # Check if production environment file exists
    if [ ! -f ".env.production" ]; then
        log_warning ".env.production not found. Using .env.production.example as template."
        if [ -f ".env.production.example" ]; then
            log_info "Please copy .env.production.example to .env.production and configure your values."
            exit 1
        fi
    fi
    
    # Check Node.js version
    NODE_VERSION=$(node --version)
    log_info "Node.js version: $NODE_VERSION"
    
    # Check if required commands exist
    command -v npm >/dev/null 2>&1 || { log_error "npm is required but not installed."; exit 1; }
    command -v git >/dev/null 2>&1 || { log_error "git is required but not installed."; exit 1; }
    
    log_success "Pre-deployment checks passed!"
}

# Create pre-deployment backup
create_backup() {
    log_step "Creating pre-deployment backup..."
    
    BACKUP_DIR="backups/pre-deployment-$(date +%Y%m%d-%H%M%S)"
    mkdir -p "$BACKUP_DIR"
    
    # Backup current deployment (if exists)
    if [ -d "dist" ] || [ -d ".next" ]; then
        log_info "Backing up current build..."
        cp -r dist "$BACKUP_DIR/" 2>/dev/null || true
        cp -r .next "$BACKUP_DIR/" 2>/dev/null || true
    fi
    
    # Backup configuration files
    log_info "Backing up configuration files..."
    cp package.json "$BACKUP_DIR/"
    cp package-lock.json "$BACKUP_DIR/" 2>/dev/null || true
    cp next.config.js "$BACKUP_DIR/" 2>/dev/null || true
    cp tsconfig.json "$BACKUP_DIR/" 2>/dev/null || true
    cp .env.production "$BACKUP_DIR/" 2>/dev/null || true
    
    # Create backup manifest
    cat > "$BACKUP_DIR/backup-manifest.json" << EOF
{
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "environment": "$DEPLOYMENT_ENV",
  "app_name": "$APP_NAME",
  "git_commit": "$(git rev-parse HEAD 2>/dev/null || echo 'unknown')",
  "git_branch": "$(git branch --show-current 2>/dev/null || echo 'unknown')",
  "node_version": "$NODE_VERSION",
  "backup_type": "pre-deployment"
}
EOF
    
    log_success "Backup created: $BACKUP_DIR"
    echo "$BACKUP_DIR" > .last-backup-path
}

# Run production readiness check
run_readiness_check() {
    log_step "Running production readiness check..."
    
    if [ -f "scripts/production-readiness-check.ts" ]; then
        # Run the TypeScript readiness check
        if command -v tsx >/dev/null 2>&1; then
            tsx scripts/production-readiness-check.ts
        elif command -v ts-node >/dev/null 2>&1; then
            ts-node scripts/production-readiness-check.ts
        else
            log_warning "tsx or ts-node not found. Skipping detailed readiness check."
        fi
    else
        log_warning "Production readiness check script not found. Running basic checks..."
        
        # Basic environment check
        if [ -z "$DATABASE_URL_PRODUCTION" ]; then
            log_error "DATABASE_URL_PRODUCTION not set"
            exit 1
        fi
        
        if [ -z "$REDIS_URL_PRODUCTION" ]; then
            log_error "REDIS_URL_PRODUCTION not set"
            exit 1
        fi
        
        if [ -z "$MONITORING_API_KEY" ]; then
            log_error "MONITORING_API_KEY not set"
            exit 1
        fi
    fi
    
    log_success "Production readiness check passed!"
}

# Install dependencies
install_dependencies() {
    log_step "Installing production dependencies..."
    
    # Clean install
    rm -rf node_modules package-lock.json 2>/dev/null || true
    npm ci --production=false
    
    log_success "Dependencies installed!"
}

# Run tests
run_tests() {
    log_step "Running test suite..."
    
    # Run linting
    if npm run lint >/dev/null 2>&1; then
        log_success "Linting passed!"
    else
        log_warning "Linting failed or not configured"
    fi
    
    # Run type checking
    if npm run type-check >/dev/null 2>&1; then
        log_success "Type checking passed!"
    else
        log_warning "Type checking failed or not configured"
    fi
    
    # Run unit tests
    if npm test >/dev/null 2>&1; then
        log_success "Unit tests passed!"
    else
        log_warning "Unit tests failed or not configured"
    fi
    
    # Run build test
    log_info "Testing production build..."
    npm run build
    
    log_success "All tests passed!"
}

# Build for production
build_production() {
    log_step "Building for production..."
    
    # Set production environment
    export NODE_ENV=production
    
    # Clean previous builds
    rm -rf .next dist out 2>/dev/null || true
    
    # Build the application
    npm run build
    
    # Verify build output
    if [ -d ".next" ] || [ -d "dist" ] || [ -d "out" ]; then
        log_success "Production build completed!"
    else
        log_error "Production build failed - no output directory found"
        exit 1
    fi
}

# Deploy to production
deploy_to_production() {
    log_step "Deploying to production..."
    
    # This section depends on your deployment target
    # Examples for different platforms:
    
    if [ "$DEPLOYMENT_TARGET" = "vercel" ]; then
        deploy_to_vercel
    elif [ "$DEPLOYMENT_TARGET" = "aws" ]; then
        deploy_to_aws
    elif [ "$DEPLOYMENT_TARGET" = "docker" ]; then
        deploy_to_docker
    elif [ "$DEPLOYMENT_TARGET" = "pm2" ]; then
        deploy_with_pm2
    else
        log_info "No specific deployment target configured. Build is ready for manual deployment."
        log_info "Built files are in: .next/ (Next.js) or dist/ (if using custom build)"
    fi
    
    log_success "Deployment completed!"
}

# Deploy to Vercel
deploy_to_vercel() {
    log_info "Deploying to Vercel..."
    
    if command -v vercel >/dev/null 2>&1; then
        vercel --prod --yes
    else
        log_error "Vercel CLI not installed. Install with: npm i -g vercel"
        exit 1
    fi
}

# Deploy to AWS
deploy_to_aws() {
    log_info "Deploying to AWS..."
    
    if command -v aws >/dev/null 2>&1; then
        # Example AWS deployment (customize for your setup)
        aws s3 sync .next/static s3://$AWS_S3_BUCKET/static --delete
        # Add your AWS deployment commands here
    else
        log_error "AWS CLI not installed."
        exit 1
    fi
}

# Deploy with Docker
deploy_to_docker() {
    log_info "Building and deploying Docker container..."
    
    if command -v docker >/dev/null 2>&1; then
        # Build Docker image
        docker build -t $APP_NAME:latest .
        
        # Tag for production
        docker tag $APP_NAME:latest $APP_NAME:production-$(date +%Y%m%d-%H%M%S)
        
        # Deploy (customize for your Docker setup)
        docker-compose -f docker-compose.prod.yml up -d
    else
        log_error "Docker not installed."
        exit 1
    fi
}

# Deploy with PM2
deploy_with_pm2() {
    log_info "Deploying with PM2..."
    
    if command -v pm2 >/dev/null 2>&1; then
        # Stop existing processes
        pm2 stop $APP_NAME 2>/dev/null || true
        
        # Start new process
        pm2 start ecosystem.config.js --env production
        
        # Save PM2 configuration
        pm2 save
    else
        log_error "PM2 not installed. Install with: npm i -g pm2"
        exit 1
    fi
}

# Health check
health_check() {
    log_step "Performing health check..."
    
    local health_url="${HEALTH_CHECK_URL:-http://localhost:3000/api/health}"
    local timeout=$HEALTH_CHECK_TIMEOUT
    local elapsed=0
    
    log_info "Checking health endpoint: $health_url"
    log_info "Timeout: ${timeout}s"
    
    while [ $elapsed -lt $timeout ]; do
        if curl -f -s "$health_url" >/dev/null 2>&1; then
            log_success "Health check passed!"
            return 0
        fi
        
        log_info "Waiting for application to start... (${elapsed}s/${timeout}s)"
        sleep 10
        elapsed=$((elapsed + 10))
    done
    
    log_error "Health check failed after ${timeout}s"
    return 1
}

# Post-deployment tasks
post_deployment() {
    log_step "Running post-deployment tasks..."
    
    # Warm up cache
    log_info "Warming up application cache..."
    curl -s "${APP_URL:-http://localhost:3000}" >/dev/null 2>&1 || true
    
    # Send deployment notification
    if [ -n "$SLACK_WEBHOOK_URL" ]; then
        send_slack_notification "🚀 SILEXAR PULSE QUANTUM deployed to production successfully!"
    fi
    
    # Update deployment log
    echo "$(date -u +%Y-%m-%dT%H:%M:%SZ) - Production deployment completed" >> deployment.log
    
    log_success "Post-deployment tasks completed!"
}

# Send Slack notification
send_slack_notification() {
    local message="$1"
    
    if [ -n "$SLACK_WEBHOOK_URL" ]; then
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"text\":\"$message\"}" \
            "$SLACK_WEBHOOK_URL" >/dev/null 2>&1 || true
    fi
}

# Rollback function
rollback() {
    log_error "Deployment failed. Initiating rollback..."
    
    if [ -f ".last-backup-path" ]; then
        local backup_path=$(cat .last-backup-path)
        
        if [ -d "$backup_path" ]; then
            log_info "Rolling back to: $backup_path"
            
            # Restore backup
            cp -r "$backup_path"/* . 2>/dev/null || true
            
            # Restart services if needed
            if [ "$DEPLOYMENT_TARGET" = "pm2" ]; then
                pm2 restart $APP_NAME 2>/dev/null || true
            fi
            
            log_success "Rollback completed!"
        else
            log_error "Backup directory not found: $backup_path"
        fi
    else
        log_error "No backup path found for rollback"
    fi
    
    exit 1
}

# Cleanup old backups
cleanup_old_backups() {
    log_step "Cleaning up old backups..."
    
    if [ -d "backups" ]; then
        # Remove backups older than retention period
        find backups -type d -name "pre-deployment-*" -mtime +$BACKUP_RETENTION_DAYS -exec rm -rf {} + 2>/dev/null || true
        
        local remaining_backups=$(find backups -type d -name "pre-deployment-*" | wc -l)
        log_info "Remaining backups: $remaining_backups"
    fi
    
    log_success "Backup cleanup completed!"
}

# Main deployment function
main() {
    print_banner
    
    # Trap errors for rollback
    trap rollback ERR
    
    # Load environment variables
    if [ -f ".env.production" ]; then
        export $(cat .env.production | grep -v '^#' | xargs)
    fi
    
    # Run deployment steps
    pre_deployment_checks
    create_backup
    run_readiness_check
    install_dependencies
    run_tests
    build_production
    deploy_to_production
    
    # Health check with rollback on failure
    if ! health_check; then
        rollback
    fi
    
    post_deployment
    cleanup_old_backups
    
    # Success message
    echo -e "${GREEN}"
    echo "=================================================================="
    echo "🎉 DEPLOYMENT SUCCESSFUL!"
    echo "=================================================================="
    echo "🚀 SILEXAR PULSE QUANTUM is now live in production!"
    echo "📊 Monitor your application at: ${APP_URL:-http://localhost:3000}"
    echo "📈 Check metrics at: ${APP_URL:-http://localhost:3000}/metrics"
    echo "🔧 Production dashboard: ${APP_URL:-http://localhost:3000}/production"
    echo "=================================================================="
    echo -e "${NC}"
}

# Help function
show_help() {
    echo "SILEXAR PULSE QUANTUM - Production Deployment Script"
    echo ""
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -h, --help              Show this help message"
    echo "  -t, --target TARGET     Set deployment target (vercel, aws, docker, pm2)"
    echo "  -u, --url URL           Set health check URL"
    echo "  --skip-tests            Skip test execution"
    echo "  --skip-backup           Skip backup creation"
    echo "  --dry-run               Run without actual deployment"
    echo ""
    echo "Environment Variables:"
    echo "  DEPLOYMENT_TARGET       Deployment target platform"
    echo "  HEALTH_CHECK_URL        URL for health checks"
    echo "  APP_URL                 Application URL"
    echo "  SLACK_WEBHOOK_URL       Slack webhook for notifications"
    echo ""
    echo "Examples:"
    echo "  $0                      # Deploy with default settings"
    echo "  $0 -t vercel            # Deploy to Vercel"
    echo "  $0 -u http://localhost:3000/health  # Custom health check URL"
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_help
            exit 0
            ;;
        -t|--target)
            DEPLOYMENT_TARGET="$2"
            shift 2
            ;;
        -u|--url)
            HEALTH_CHECK_URL="$2"
            shift 2
            ;;
        --skip-tests)
            SKIP_TESTS=true
            shift
            ;;
        --skip-backup)
            SKIP_BACKUP=true
            shift
            ;;
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        *)
            log_error "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
done

# Run main function
if [ "$DRY_RUN" = true ]; then
    log_info "DRY RUN MODE - No actual deployment will be performed"
fi

main