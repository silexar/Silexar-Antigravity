# 🚀 SILEXAR PULSE - Google Cloud Platform Infrastructure
# Terraform configuration for TIER0 Fortune 10 deployment
# Version: 1.0.0
# Author: Silexar Pulse Team

terraform {
  required_version = ">= 1.5.0"
  
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
    google-beta = {
      source  = "hashicorp/google-beta"
      version = "~> 5.0"
    }
  }

  # Backend configuration for state management
  # ─── Security Note (AUDIT C-INF-03) ───────────────────────────────────────
  # GCS encrypts state at rest with Google-managed keys by default.
  # To use CUSTOMER-MANAGED encryption (CMEK) at init time, run:
  #
  #   # 1. Create KMS keyring + key (once per project)
  #   gcloud kms keyrings create silexar-keyring --location=us-central1
  #   gcloud kms keys create terraform-state-key \
  #     --location=us-central1 --keyring=silexar-keyring --purpose=encryption
  #   gcloud projects add-iam-policy-binding PROJECT_ID \
  #     --member=serviceAccount:service-PROJECT_NUM@gs-project-accounts.iam.gserviceaccount.com \
  #     --role=roles/cloudkms.cryptoKeyEncrypterDecrypter
  #
  #   # 2. Pass key at init time (backend blocks don't support variable interpolation)
  #   terraform init -backend-config="kms_encryption_key=projects/PROJECT_ID/locations/us-central1/keyRings/silexar-keyring/cryptoKeys/terraform-state-key"
  #
  # IMPORTANT: Once CMEK is enabled, ALL team members and CI/CD must pass the same key at init.
  backend "gcs" {
    bucket = "silexar-pulse-terraform-state"
    prefix = "terraform/state"
    # kms_encryption_key is passed via -backend-config at init time (see instructions above)
  }
}

# Provider configuration
provider "google" {
  project = var.project_id
  region  = var.region
}

provider "google-beta" {
  project = var.project_id
  region  = var.region
}

# Local variables
locals {
  environment = var.environment
  app_name    = "silexar-pulse"
  labels = {
    environment = var.environment
    application = "silexar-pulse"
    managed-by  = "terraform"
    tier        = "tier0"
  }
}

# Enable required APIs
resource "google_project_service" "required_apis" {
  for_each = toset([
    "compute.googleapis.com",
    "container.googleapis.com",
    "sqladmin.googleapis.com",
    "redis.googleapis.com",
    "storage-api.googleapis.com",
    "cloudkms.googleapis.com",
    "secretmanager.googleapis.com",
    "monitoring.googleapis.com",
    "logging.googleapis.com",
    "cloudtrace.googleapis.com",
    "cloudfunctions.googleapis.com",
    "pubsub.googleapis.com",
    "aiplatform.googleapis.com",
    "speech.googleapis.com",
    "texttospeech.googleapis.com",
    "translate.googleapis.com",
    "vision.googleapis.com",
    "videointelligence.googleapis.com",
    "language.googleapis.com"
  ])

  service            = each.key
  disable_on_destroy = false
}

# VPC Network
resource "google_compute_network" "vpc" {
  name                    = "${local.app_name}-vpc-${local.environment}"
  auto_create_subnetworks = false
  routing_mode            = "GLOBAL"
  
  depends_on = [google_project_service.required_apis]
}

# Subnets for different environments
resource "google_compute_subnetwork" "gke_subnet" {
  name          = "${local.app_name}-gke-subnet-${local.environment}"
  ip_cidr_range = var.gke_subnet_cidr
  region        = var.region
  network       = google_compute_network.vpc.id

  secondary_ip_range {
    range_name    = "pods"
    ip_cidr_range = var.gke_pods_cidr
  }

  secondary_ip_range {
    range_name    = "services"
    ip_cidr_range = var.gke_services_cidr
  }

  private_ip_google_access = true
}

# Cloud NAT for outbound connectivity
resource "google_compute_router" "router" {
  name    = "${local.app_name}-router-${local.environment}"
  region  = var.region
  network = google_compute_network.vpc.id
}

resource "google_compute_router_nat" "nat" {
  name                               = "${local.app_name}-nat-${local.environment}"
  router                             = google_compute_router.router.name
  region                             = google_compute_router.router.region
  nat_ip_allocate_option             = "AUTO_ONLY"
  source_subnetwork_ip_ranges_to_nat = "ALL_SUBNETWORKS_ALL_IP_RANGES"

  log_config {
    enable = true
    filter = "ERRORS_ONLY"
  }
}

# Google Kubernetes Engine (GKE) Cluster
resource "google_container_cluster" "primary" {
  name     = "${local.app_name}-gke-${local.environment}"
  location = var.region

  # We can't create a cluster with no node pool defined, but we want to only use
  # separately managed node pools. So we create the smallest possible default
  # node pool and immediately delete it.
  remove_default_node_pool = true
  initial_node_count       = 1

  network    = google_compute_network.vpc.name
  subnetwork = google_compute_subnetwork.gke_subnet.name

  # IP allocation policy for VPC-native cluster
  ip_allocation_policy {
    cluster_secondary_range_name  = "pods"
    services_secondary_range_name = "services"
  }

  # Workload Identity
  workload_identity_config {
    workload_pool = "${var.project_id}.svc.id.goog"
  }

  # Network policy
  network_policy {
    enabled  = true
    provider = "CALICO"
  }

  # Addons
  addons_config {
    http_load_balancing {
      disabled = false
    }
    horizontal_pod_autoscaling {
      disabled = false
    }
    network_policy_config {
      disabled = false
    }
  }

  # Maintenance window
  maintenance_policy {
    daily_maintenance_window {
      start_time = "03:00"
    }
  }

  # Monitoring and logging
  monitoring_config {
    enable_components = ["SYSTEM_COMPONENTS", "WORKLOADS"]
    
    managed_prometheus {
      enabled = true
    }
  }

  logging_config {
    enable_components = ["SYSTEM_COMPONENTS", "WORKLOADS"]
  }

  # Security
  master_auth {
    client_certificate_config {
      issue_client_certificate = false
    }
  }

  # Private cluster configuration
  private_cluster_config {
    enable_private_nodes    = true
    enable_private_endpoint = false
    master_ipv4_cidr_block  = var.master_ipv4_cidr_block
  }

  # Binary authorization
  binary_authorization {
    evaluation_mode = "PROJECT_SINGLETON_POLICY_ENFORCE"
  }

  resource_labels = local.labels

  depends_on = [
    google_project_service.required_apis,
    google_compute_subnetwork.gke_subnet
  ]
}

# GKE Node Pool
resource "google_container_node_pool" "primary_nodes" {
  name       = "${local.app_name}-node-pool-${local.environment}"
  location   = var.region
  cluster    = google_container_cluster.primary.name
  node_count = var.gke_num_nodes

  # Auto-scaling configuration
  autoscaling {
    min_node_count = var.gke_min_nodes
    max_node_count = var.gke_max_nodes
  }

  # Node configuration
  node_config {
    preemptible  = var.environment == "production" ? false : true
    machine_type = var.gke_machine_type

    # Google recommends custom service accounts that have cloud-platform scope and permissions granted via IAM Roles.
    service_account = google_service_account.gke_sa.email
    oauth_scopes = [
      "https://www.googleapis.com/auth/cloud-platform"
    ]

    labels = local.labels

    tags = ["gke-node", "${local.app_name}-gke"]

    metadata = {
      disable-legacy-endpoints = "true"
    }

    # Workload Identity
    workload_metadata_config {
      mode = "GKE_METADATA"
    }

    # Shielded instance config
    shielded_instance_config {
      enable_secure_boot          = true
      enable_integrity_monitoring = true
    }
  }

  # Upgrade settings
  upgrade_settings {
    max_surge       = 1
    max_unavailable = 0
  }

  management {
    auto_repair  = true
    auto_upgrade = true
  }
}

# Service Account for GKE nodes
resource "google_service_account" "gke_sa" {
  account_id   = "${local.app_name}-gke-sa-${local.environment}"
  display_name = "Service Account for GKE nodes"
}

# IAM bindings for GKE service account
resource "google_project_iam_member" "gke_sa_roles" {
  for_each = toset([
    "roles/logging.logWriter",
    "roles/monitoring.metricWriter",
    "roles/monitoring.viewer",
    "roles/stackdriver.resourceMetadata.writer"
  ])

  project = var.project_id
  role    = each.key
  member  = "serviceAccount:${google_service_account.gke_sa.email}"
}

# Cloud SQL PostgreSQL Instance
resource "google_sql_database_instance" "postgres" {
  name             = "${local.app_name}-postgres-${local.environment}"
  database_version = "POSTGRES_15"
  region           = var.region

  settings {
    tier              = var.db_tier
    availability_type = var.environment == "production" ? "REGIONAL" : "ZONAL"
    disk_size         = var.db_disk_size
    disk_type         = "PD_SSD"
    disk_autoresize   = true

    backup_configuration {
      enabled                        = true
      start_time                     = "02:00"
      point_in_time_recovery_enabled = true
      transaction_log_retention_days = 7
      backup_retention_settings {
        retained_backups = 30
        retention_unit   = "COUNT"
      }
    }

    ip_configuration {
      ipv4_enabled    = false
      private_network = google_compute_network.vpc.id
      require_ssl     = true
    }

    database_flags {
      name  = "max_connections"
      value = "1000"
    }

    database_flags {
      name  = "shared_buffers"
      value = "262144" # 1GB in 8kB pages
    }

    insights_config {
      query_insights_enabled  = true
      query_string_length     = 1024
      record_application_tags = true
      record_client_address   = true
    }

    maintenance_window {
      day          = 7 # Sunday
      hour         = 3
      update_track = "stable"
    }
  }

  deletion_protection = var.environment == "production" ? true : false

  depends_on = [google_project_service.required_apis]
}

# Cloud SQL Read Replica (Production only)
resource "google_sql_database_instance" "postgres_replica" {
  count = var.environment == "production" ? 2 : 0

  name                 = "${local.app_name}-postgres-replica-${count.index + 1}-${local.environment}"
  database_version     = "POSTGRES_15"
  region               = var.region
  master_instance_name = google_sql_database_instance.postgres.name

  replica_configuration {
    failover_target = false
  }

  settings {
    tier              = var.db_tier
    availability_type = "ZONAL"
    disk_size         = var.db_disk_size
    disk_type         = "PD_SSD"

    ip_configuration {
      ipv4_enabled    = false
      private_network = google_compute_network.vpc.id
      require_ssl     = true
    }
  }

  deletion_protection = true
}

# Cloud SQL Database
resource "google_sql_database" "database" {
  name     = "silexar_pulse"
  instance = google_sql_database_instance.postgres.name
}

# Cloud SQL User
resource "google_sql_user" "users" {
  name     = var.db_username
  instance = google_sql_database_instance.postgres.name
  password = var.db_password
}

# Redis Instance for caching and session management
resource "google_redis_instance" "cache" {
  name           = "${local.app_name}-redis-${local.environment}"
  tier           = var.environment == "production" ? "STANDARD_HA" : "BASIC"
  memory_size_gb = var.redis_memory_size
  region         = var.region

  authorized_network = google_compute_network.vpc.id
  connect_mode       = "PRIVATE_SERVICE_ACCESS"

  redis_version     = "REDIS_7_0"
  display_name      = "Silexar Pulse Redis Cache"
  reserved_ip_range = var.redis_reserved_ip_range

  redis_configs = {
    maxmemory-policy = "allkeys-lru"
  }

  maintenance_policy {
    weekly_maintenance_window {
      day = "SUNDAY"
      start_time {
        hours   = 3
        minutes = 0
      }
    }
  }

  depends_on = [google_project_service.required_apis]
}

# Cloud Storage Bucket for static assets
resource "google_storage_bucket" "assets" {
  name          = "${local.app_name}-assets-${local.environment}-${var.project_id}"
  location      = var.region
  storage_class = "STANDARD"

  uniform_bucket_level_access = true

  versioning {
    enabled = true
  }

  lifecycle_rule {
    condition {
      age = 90
    }
    action {
      type          = "SetStorageClass"
      storage_class = "NEARLINE"
    }
  }

  lifecycle_rule {
    condition {
      age = 365
    }
    action {
      type          = "SetStorageClass"
      storage_class = "COLDLINE"
    }
  }

  cors {
    origin          = ["https://app.silexar.com", "https://silexar.com"]
    method          = ["GET", "HEAD"]
    response_header = ["Content-Type", "Cache-Control", "Content-Length"]
    max_age_seconds = 3600
  }

  labels = local.labels
}

# Cloud Storage Bucket for backups
resource "google_storage_bucket" "backups" {
  name          = "${local.app_name}-backups-${local.environment}-${var.project_id}"
  location      = var.region
  storage_class = "NEARLINE"

  uniform_bucket_level_access = true

  versioning {
    enabled = true
  }

  lifecycle_rule {
    condition {
      age = 30
    }
    action {
      type          = "SetStorageClass"
      storage_class = "COLDLINE"
    }
  }

  lifecycle_rule {
    condition {
      age = 365
    }
    action {
      type = "Delete"
    }
  }

  labels = local.labels
}

# Cloud Pub/Sub Topic for event streaming
resource "google_pubsub_topic" "ad_requests" {
  name = "${local.app_name}-ad-requests-${local.environment}"

  message_retention_duration = "86400s" # 24 hours

  labels = local.labels
}

resource "google_pubsub_topic" "contextual_triggers" {
  name = "${local.app_name}-contextual-triggers-${local.environment}"

  message_retention_duration = "86400s"

  labels = local.labels
}

resource "google_pubsub_topic" "user_interactions" {
  name = "${local.app_name}-user-interactions-${local.environment}"

  message_retention_duration = "86400s"

  labels = local.labels
}

# Cloud Load Balancer
resource "google_compute_global_address" "default" {
  name = "${local.app_name}-lb-ip-${local.environment}"
}

# Cloud CDN
resource "google_compute_backend_bucket" "cdn" {
  name        = "${local.app_name}-cdn-backend-${local.environment}"
  bucket_name = google_storage_bucket.assets.name
  enable_cdn  = true

  cdn_policy {
    cache_mode        = "CACHE_ALL_STATIC"
    client_ttl        = 3600
    default_ttl       = 3600
    max_ttl           = 86400
    negative_caching  = true
    serve_while_stale = 86400
  }
}

# Outputs
output "gke_cluster_name" {
  value       = google_container_cluster.primary.name
  description = "GKE cluster name"
}

output "gke_cluster_endpoint" {
  value       = google_container_cluster.primary.endpoint
  description = "GKE cluster endpoint"
  sensitive   = true
}

output "postgres_connection_name" {
  value       = google_sql_database_instance.postgres.connection_name
  description = "PostgreSQL connection name"
}

output "redis_host" {
  value       = google_redis_instance.cache.host
  description = "Redis host"
}

output "load_balancer_ip" {
  value       = google_compute_global_address.default.address
  description = "Load balancer IP address"
}

# ================================
# Terraform State Encryption & Security
# ================================

# Enable uniform bucket-level access and encryption for Terraform state
resource "google_storage_bucket_iam_binding" "terraform_state_access" {
  bucket = "silexar-pulse-terraform-state"
  role   = "roles/storage.admin"
  members = [
    "serviceAccount:terraform-sa@silexar-pulse.iam.gserviceaccount.com",
  ]
}

# KMS encryption for Terraform state
resource "google_kms_crypto_key_iam_binding" "terraform_state_key" {
  crypto_key_id = "projects/silexar-pulse/locations/global/keyRings/terraform/cryptoKeys/state"
  role          = "roles/cloudkms.cryptoKeyEncrypterDecrypter"
  members = [
    "serviceAccount:terraform-sa@silexar-pulse.iam.gserviceaccount.com",
  ]
}
