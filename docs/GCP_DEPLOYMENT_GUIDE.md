# 🚀 SILEXAR PULSE - GCP DEPLOYMENT GUIDE
## Fase 1 Sprint 1: Infraestructura Google Cloud Platform

### 📋 PREREQUISITOS

#### 1. Herramientas Requeridas
```bash
# Instalar Google Cloud SDK
# Windows (PowerShell como Administrador)
(New-Object Net.WebClient).DownloadFile("https://dl.google.com/dl/cloudsdk/channels/rapid/GoogleCloudSDKInstaller.exe", "$env:Temp\GoogleCloudSDKInstaller.exe")
& $env:Temp\GoogleCloudSDKInstaller.exe

# Instalar Terraform
choco install terraform

# Instalar kubectl
gcloud components install kubectl

# Verificar instalaciones
gcloud --version
terraform --version
kubectl version --client
```

#### 2. Configuración de Cuenta GCP
```bash
# Autenticarse con Google Cloud
gcloud auth login

# Configurar proyecto (reemplazar con tu PROJECT_ID)
gcloud config set project YOUR_PROJECT_ID

# Habilitar facturación
# Ir a: https://console.cloud.google.com/billing

# Crear service account para Terraform
gcloud iam service-accounts create terraform-sa \
  --display-name="Terraform Service Account"

# Otorgar permisos necesarios
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:terraform-sa@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/editor"

# Crear y descargar key
gcloud iam service-accounts keys create terraform-key.json \
  --iam-account=terraform-sa@YOUR_PROJECT_ID.iam.gserviceaccount.com

# Configurar variable de entorno
$env:GOOGLE_APPLICATION_CREDENTIALS="$PWD\terraform-key.json"
```

---

### 🏗️ PASO 1: SETUP INICIAL DE TERRAFORM

#### 1.1 Crear Bucket para Terraform State
```bash
# Crear bucket para almacenar el estado de Terraform
gsutil mb -p YOUR_PROJECT_ID -c STANDARD -l us-central1 gs://silexar-pulse-terraform-state

# Habilitar versionamiento
gsutil versioning set on gs://silexar-pulse-terraform-state
```

#### 1.2 Crear Archivo de Configuración de Ambiente
```bash
# Navegar a la carpeta terraform
cd terraform

# Crear archivo terraform.tfvars para producción
@"
project_id   = "YOUR_PROJECT_ID"
region       = "us-central1"
environment  = "production"

# GKE Configuration
gke_num_nodes    = 3
gke_min_nodes    = 2
gke_max_nodes    = 10
gke_machine_type = "n2-standard-4"

# Cloud SQL Configuration
db_tier      = "db-custom-4-16384"
db_disk_size = 100
db_username  = "silexar_admin"
db_password  = "CHANGE_THIS_PASSWORD_123!"  # ⚠️ CAMBIAR ESTO

# Redis Configuration
redis_memory_size = 5
"@ | Out-File -FilePath terraform.tfvars -Encoding utf8
```

---

### 🚀 PASO 2: DEPLOYMENT DE INFRAESTRUCTURA

#### 2.1 Inicializar Terraform
```bash
# Inicializar Terraform (descarga providers)
terraform init

# Validar configuración
terraform validate

# Ver plan de ejecución
terraform plan
```

#### 2.2 Aplicar Configuración
```bash
# Aplicar configuración (esto creará toda la infraestructura)
# ⚠️ ADVERTENCIA: Esto incurrirá en costos en GCP
terraform apply

# Cuando pregunte "Do you want to perform these actions?", escribir: yes

# ⏱️ Tiempo estimado: 15-20 minutos
```

#### 2.3 Verificar Recursos Creados
```bash
# Verificar cluster GKE
gcloud container clusters list

# Verificar Cloud SQL
gcloud sql instances list

# Verificar Redis
gcloud redis instances list

# Verificar buckets
gsutil ls

# Verificar Pub/Sub topics
gcloud pubsub topics list
```

---

### 🔧 PASO 3: CONFIGURAR KUBECTL

#### 3.1 Obtener Credenciales del Cluster
```bash
# Obtener credenciales de GKE
gcloud container clusters get-credentials silexar-pulse-gke-production --region us-central1

# Verificar conexión
kubectl cluster-info
kubectl get nodes
```

#### 3.2 Crear Namespaces
```bash
# Crear namespaces para diferentes ambientes
kubectl create namespace production
kubectl create namespace staging
kubectl create namespace monitoring

# Verificar
kubectl get namespaces
```

---

### 🗄️ PASO 4: CONFIGURAR CLOUD SQL

#### 4.1 Crear Cloud SQL Proxy
```bash
# Descargar Cloud SQL Proxy
Invoke-WebRequest -Uri "https://dl.google.com/cloudsql/cloud_sql_proxy_x64.exe" -OutFile "cloud_sql_proxy.exe"

# Obtener connection name
$CONNECTION_NAME = terraform output -raw postgres_connection_name

# Ejecutar proxy (en una terminal separada)
.\cloud_sql_proxy.exe -instances=$CONNECTION_NAME=tcp:5432
```

#### 4.2 Conectar y Configurar Base de Datos
```bash
# Instalar psql (si no está instalado)
choco install postgresql

# Conectar a la base de datos
psql -h localhost -U silexar_admin -d silexar_pulse

# Ejecutar migraciones (desde la raíz del proyecto)
npm run db:migrate
```

---

### 🔐 PASO 5: CONFIGURAR SECRETS

#### 5.1 Crear Secrets en Kubernetes
```bash
# Crear secret para base de datos
kubectl create secret generic db-credentials \
  --from-literal=username=silexar_admin \
  --from-literal=password=YOUR_DB_PASSWORD \
  --from-literal=host=$CONNECTION_NAME \
  --namespace=production

# Crear secret para Redis
$REDIS_HOST = terraform output -raw redis_host
kubectl create secret generic redis-credentials \
  --from-literal=host=$REDIS_HOST \
  --from-literal=port=6379 \
  --namespace=production

# Verificar secrets
kubectl get secrets --namespace=production
```

#### 5.2 Configurar Google Secret Manager
```bash
# Crear secrets en Secret Manager
echo -n "YOUR_DB_PASSWORD" | gcloud secrets create db-password --data-file=-
echo -n "YOUR_JWT_SECRET" | gcloud secrets create jwt-secret --data-file=-
echo -n "YOUR_API_KEY" | gcloud secrets create api-key --data-file=-

# Verificar
gcloud secrets list
```

---

### 📊 PASO 6: CONFIGURAR MONITORING

#### 6.1 Instalar Prometheus y Grafana
```bash
# Agregar Helm repos
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo add grafana https://grafana.github.io/helm-charts
helm repo update

# Instalar Prometheus
helm install prometheus prometheus-community/kube-prometheus-stack \
  --namespace monitoring \
  --set prometheus.prometheusSpec.retention=30d \
  --set prometheus.prometheusSpec.storageSpec.volumeClaimTemplate.spec.resources.requests.storage=50Gi

# Instalar Grafana
helm install grafana grafana/grafana \
  --namespace monitoring \
  --set persistence.enabled=true \
  --set persistence.size=10Gi \
  --set adminPassword=CHANGE_THIS_PASSWORD

# Obtener password de Grafana
kubectl get secret --namespace monitoring grafana -o jsonpath="{.data.admin-password}" | base64 --decode
```

#### 6.2 Configurar Cloud Monitoring
```bash
# Habilitar Google Cloud Monitoring
gcloud services enable monitoring.googleapis.com
gcloud services enable logging.googleapis.com

# Crear dashboard personalizado
# Ir a: https://console.cloud.google.com/monitoring
```

---

### 🔄 PASO 7: CONFIGURAR CI/CD

#### 7.1 Configurar GitHub Actions
```yaml
# Crear archivo .github/workflows/deploy-gcp.yml
name: Deploy to GCP

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Cloud SDK
        uses: google-github-actions/setup-gcloud@v1
        with:
          service_account_key: ${{ secrets.GCP_SA_KEY }}
          project_id: ${{ secrets.GCP_PROJECT_ID }}
      
      - name: Configure kubectl
        run: |
          gcloud container clusters get-credentials silexar-pulse-gke-production --region us-central1
      
      - name: Build and Push Docker Image
        run: |
          docker build -t gcr.io/${{ secrets.GCP_PROJECT_ID }}/silexar-pulse:${{ github.sha }} .
          docker push gcr.io/${{ secrets.GCP_PROJECT_ID }}/silexar-pulse:${{ github.sha }}
      
      - name: Deploy to GKE
        run: |
          kubectl set image deployment/silexar-pulse silexar-pulse=gcr.io/${{ secrets.GCP_PROJECT_ID }}/silexar-pulse:${{ github.sha }} --namespace=production
```

---

### ✅ PASO 8: VERIFICACIÓN FINAL

#### 8.1 Health Checks
```bash
# Verificar pods
kubectl get pods --namespace=production

# Verificar services
kubectl get services --namespace=production

# Verificar logs
kubectl logs -f deployment/silexar-pulse --namespace=production

# Verificar métricas
kubectl top nodes
kubectl top pods --namespace=production
```

#### 8.2 Tests de Carga
```bash
# Instalar K6
choco install k6

# Ejecutar test de carga básico
k6 run --vus 100 --duration 30s tests/load/basic-load-test.js

# Verificar auto-scaling
kubectl get hpa --namespace=production --watch
```

---

### 🎯 CHECKLIST DE COMPLETITUD

- [ ] ✅ Google Cloud SDK instalado y configurado
- [ ] ✅ Terraform instalado y configurado
- [ ] ✅ Service account creado con permisos correctos
- [ ] ✅ Bucket de Terraform state creado
- [ ] ✅ Infraestructura desplegada con `terraform apply`
- [ ] ✅ GKE cluster operacional (3+ nodos)
- [ ] ✅ Cloud SQL PostgreSQL con read replicas
- [ ] ✅ Redis HA configurado
- [ ] ✅ Cloud Storage buckets creados
- [ ] ✅ Cloud Pub/Sub topics creados
- [ ] ✅ kubectl configurado y conectado
- [ ] ✅ Namespaces creados
- [ ] ✅ Secrets configurados en Kubernetes
- [ ] ✅ Cloud SQL Proxy funcionando
- [ ] ✅ Migraciones de base de datos ejecutadas
- [ ] ✅ Prometheus y Grafana instalados
- [ ] ✅ Cloud Monitoring habilitado
- [ ] ✅ CI/CD pipeline configurado
- [ ] ✅ Health checks pasando
- [ ] ✅ Load testing completado

---

### 🚨 TROUBLESHOOTING

#### Problema: Terraform apply falla
```bash
# Verificar permisos
gcloud projects get-iam-policy YOUR_PROJECT_ID

# Verificar APIs habilitadas
gcloud services list --enabled

# Ver logs detallados
terraform apply -debug
```

#### Problema: No se puede conectar a GKE
```bash
# Re-obtener credenciales
gcloud container clusters get-credentials silexar-pulse-gke-production --region us-central1

# Verificar firewall
gcloud compute firewall-rules list
```

#### Problema: Cloud SQL no acepta conexiones
```bash
# Verificar que Cloud SQL Proxy está corriendo
Get-Process cloud_sql_proxy

# Verificar connection name
terraform output postgres_connection_name

# Verificar que la IP privada está configurada
gcloud sql instances describe silexar-pulse-postgres-production
```

---

### 💰 ESTIMACIÓN DE COSTOS

**Costos Mensuales Estimados (Producción)**:
- GKE Cluster (3 nodos n2-standard-4): ~$350/mes
- Cloud SQL PostgreSQL (db-custom-4-16384): ~$280/mes
- Cloud SQL Read Replicas (2x): ~$560/mes
- Redis HA (5GB): ~$150/mes
- Cloud Storage (100GB): ~$2/mes
- Cloud CDN: ~$50/mes (variable según tráfico)
- Cloud Pub/Sub: ~$40/mes (variable según volumen)
- Networking: ~$100/mes
- Monitoring: ~$50/mes

**TOTAL ESTIMADO**: ~$1,582/mes para producción

**Nota**: Costos pueden variar según uso real. Configurar alertas de presupuesto en GCP.

---

### 📞 SOPORTE

Si encuentras problemas durante el deployment:
1. Revisar logs de Terraform: `terraform apply -debug`
2. Revisar logs de GKE: `kubectl logs -f deployment/silexar-pulse --namespace=production`
3. Revisar Cloud Logging: https://console.cloud.google.com/logs
4. Contactar al equipo de DevOps

**¡Deployment completado! 🎉**
