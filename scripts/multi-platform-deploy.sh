#!/bin/bash
# =============================================================================
# SILEXAR PULSE - MULTI-PLATFORM DEPLOYMENT SCRIPT
# =============================================================================
# Deploys to Vercel (primary), Netlify (failover 1), and Cloudflare Pages (failover 2)
# Usage: ./scripts/multi-platform-deploy.sh [environment] [platform]
# =============================================================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# =============================================================================
# CONFIGURATION
# =============================================================================

ENVIRONMENT=${1:-production}
PLATFORM=${2:-all}

# Deployment URLs
VERCEL_URL="https://app.silexar.com"
NETLIFY_URL="https://silexar-pulse.netlify.app"
CLOUDFLARE_URL="https://silexar-pulse.pages.dev"

# API Tokens (from environment)
VERCEL_TOKEN=${VERCEL_TOKEN:-}
NETLIFY_TOKEN=${NETLIFY_TOKEN:-}
CLOUDFLARE_TOKEN=${CLOUDFLARE_TOKEN:-}
CLOUDFLARE_ACCOUNT_ID=${CLOUDFLARE_ACCOUNT_ID:-}

# Build output directory
BUILD_DIR=".next/standalone"

# =============================================================================
# FUNCTIONS
# =============================================================================

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# =============================================================================
# PREREQUISITES CHECK
# =============================================================================

check_prerequisites() {
    log_info "Checking prerequisites..."

    # Check if build directory exists
    if [ ! -d "$BUILD_DIR" ]; then
        log_warn "Build directory not found. Running build..."
        npm run build
    fi

    # Check Node.js version
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        log_error "Node.js 18+ required. Current version: $(node -v)"
        exit 1
    fi

    # Check required CLI tools
    command -v vercel >/dev/null 2>&1 || log_warn "Vercel CLI not found. Install with: npm i -g vercel"
    command -v netlify >/dev/null 2>&1 || log_warn "Netlify CLI not found. Install with: npm i -g netlify-cli"
    command -v wrangler >/dev/null 2>&1 || log_warn "Wrangler CLI not found. Install with: npm i -g wrangler"

    log_success "Prerequisites check passed"
}

# =============================================================================
# BUILD
# =============================================================================

build_app() {
    log_info "Building application..."

    # Build Next.js app
    npm run build

    log_success "Build completed"
}

# =============================================================================
# VERCEL DEPLOYMENT
# =============================================================================

deploy_vercel() {
    log_info "Deploying to Vercel..."

    if [ -z "$VERCEL_TOKEN" ]; then
        log_warn "VERCEL_TOKEN not set. Using local Vercel CLI..."
        vercel --prod --yes
    else
        vercel --token "$VERCEL_TOKEN" --prod --yes
    fi

    log_success "Vercel deployment completed: $VERCEL_URL"
}

# =============================================================================
# NETLIFY DEPLOYMENT
# =============================================================================

deploy_netlify() {
    log_info "Deploying to Netlify..."

    if [ -z "$NETLIFY_TOKEN" ]; then
        log_error "NETLIFY_TOKEN not set. Cannot deploy to Netlify."
        return 1
    fi

    # Create Netlify TOML if it doesn't exist
    if [ ! -f "netlify.toml" ]; then
        log_info "Creating netlify.toml..."
        cat > netlify.toml << 'EOF'
[build]
  command = "npm run build"
  publish = ".next"

[build.environment]
  NODE_VERSION = "20"
  NEXT_TELEMETRY_DISABLED = "1"

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"

[[redirects]]
  from = "/api/*"
  to = "/api/:splat"
  status = 200
EOF
    fi

    # Deploy to Netlify
    netlify deploy --prod --dir="$BUILD_DIR" --token="$NETLIFY_TOKEN" --message "Deploy $(git rev-parse --short HEAD)"

    log_success "Netlify deployment completed: $NETLIFY_URL"
}

# =============================================================================
# CLOUDFLARE PAGES DEPLOYMENT
# =============================================================================

deploy_cloudflare_pages() {
    log_info "Deploying to Cloudflare Pages..."

    if [ -z "$CLOUDFLARE_TOKEN" ] || [ -z "$CLOUDFLARE_ACCOUNT_ID" ]; then
        log_error "CLOUDFLARE_TOKEN or CLOUDFLARE_ACCOUNT_ID not set. Cannot deploy."
        return 1
    fi

    # Create wrangler.toml if it doesn't exist
    if [ ! -f "wrangler.toml" ]; then
        log_info "Creating wrangler.toml..."
        cat > wrangler.toml << EOF
name = "silexar-pulse"
compatibility_date = "2024-01-01"
pages_project = "silexar-pulse"
account_id = "$CLOUDFLARE_ACCOUNT_ID"

[env.production]
name = "silexar-pulse-production"

[[routes]]
  pattern = "*.silexar.com"
  zone_name = "silexar.com"
EOF
    fi

    # Deploy to Cloudflare Pages
    wrangler pages deploy "$BUILD_DIR" --project-name="silexar-pulse" --branch=production

    log_success "Cloudflare Pages deployment completed: $CLOUDFLARE_URL"
}

# =============================================================================
# VERIFY DEPLOYMENT
# =============================================================================

verify_deployment() {
    local url=$1
    local name=$2
    local max_attempts=5
    local attempt=1

    log_info "Verifying $name deployment..."

    while [ $attempt -le $max_attempts ]; do
        if curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$url/api/health" | grep -q "200"; then
            log_success "$name is healthy: $url"
            return 0
        fi
        log_warn "Attempt $attempt/$max_attempts failed for $name"
        attempt=$((attempt + 1))
        sleep 5
    done

    log_error "$name deployment verification failed after $max_attempts attempts"
    return 1
}

# =============================================================================
# HEALTH CHECK
# =============================================================================

health_check() {
    log_info "Running health checks on all platforms..."

    local all_healthy=true

    verify_deployment "$VERCEL_URL" "Vercel" || all_healthy=false
    verify_deployment "$NETLIFY_URL" "Netlify" || all_healthy=false
    verify_deployment "$CLOUDFLARE_URL" "Cloudflare Pages" || all_healthy=false

    if [ "$all_healthy" = false ]; then
        log_warn "Some deployments may not be healthy"
    else
        log_success "All deployments are healthy"
    fi
}

# =============================================================================
# UPDATE DNS (optional)
# =============================================================================

update_dns_failover() {
    log_info "Configuring DNS failover..."

    if [ -z "$CLOUDFLARE_TOKEN" ] || [ -z "$CLOUDFLARE_ZONE_ID" ]; then
        log_warn "Cloudflare credentials not set. Skipping DNS configuration."
        return
    fi

    # This would call the DNS failover API
    # For now, just log the intention
    log_info "DNS failover would be configured to point to primary deployment"
    log_info "Current primary: $VERCEL_URL"
}

# =============================================================================
# ROLLBACK (optional)
# =============================================================================

rollback_platform() {
    local platform=$1

    log_warn "Rolling back $platform..."

    case $platform in
        vercel)
            log_info "Use Vercel dashboard to rollback to previous deployment"
            ;;
        netlify)
            netlify rollback --dir="$BUILD_DIR" --token="$NETLIFY_TOKEN"
            ;;
        cloudflare)
            log_info "Use Cloudflare dashboard to rollback to previous deployment"
            ;;
    esac

    log_success "Rollback initiated for $platform"
}

# =============================================================================
# MAIN
# =============================================================================

main() {
    echo ""
    echo "========================================"
    echo "SILEXAR PULSE - MULTI-PLATFORM DEPLOY"
    echo "========================================"
    echo ""
    echo "Environment: $ENVIRONMENT"
    echo "Platform:    $PLATFORM"
    echo ""

    # Run checks
    check_prerequisites

    # Build if needed
    if [ ! -d "$BUILD_DIR" ]; then
        build_app
    fi

    # Deploy based on platform
    case $PLATFORM in
        all)
            deploy_vercel
            deploy_netlify
            deploy_cloudflare_pages
            ;;
        vercel)
            deploy_vercel
            ;;
        netlify)
            deploy_netlify
            ;;
        cloudflare)
            deploy_cloudflare_pages
            ;;
        *)
            log_error "Unknown platform: $PLATFORM"
            echo "Usage: $0 [production|staging] [all|vercel|netlify|cloudflare]"
            exit 1
            ;;
    esac

    # Health check after deployment
    health_check

    # Update DNS failover configuration
    update_dns_failover

    echo ""
    echo "========================================"
    echo "DEPLOYMENT COMPLETED"
    echo "========================================"
    echo ""
    echo "Vercel:          $VERCEL_URL"
    echo "Netlify:          $NETLIFY_URL"
    echo "Cloudflare Pages: $CLOUDFLARE_URL"
    echo ""
    echo "Run health checks with: ./scripts/multi-platform-deploy.sh health"
    echo ""
}

# Handle special commands
case $1 in
    health)
        health_check
        ;;
    rollback)
        rollback_platform "${2:-vercel}"
        ;;
    build)
        build_app
        ;;
    *)
        main
        ;;
esac