# 🚀 SILEXAR PULSE - Disaster Recovery Runbook
## Emergency Response Procedures

### 📋 OVERVIEW

**Purpose**: This runbook provides step-by-step procedures for disaster recovery scenarios.  
**RTO (Recovery Time Objective)**: < 10 minutes  
**RPO (Recovery Point Objective)**: < 1 hour  
**Last Updated**: 2025-11-23

---

## 🚨 SCENARIO 1: Complete GKE Cluster Failure

### Symptoms
- All pods are down
- Cluster is unreachable
- kubectl commands fail

### Response Procedure

#### Step 1: Verify Cluster Status (2 minutes)
```powershell
# Check cluster status
gcloud container clusters describe silexar-pulse-gke-production --region us-central1

# Check node status
gcloud compute instances list --filter="name:gke-silexar-pulse"
```

#### Step 2: Attempt Cluster Repair (3 minutes)
```powershell
# Repair cluster
gcloud container clusters update silexar-pulse-gke-production \
  --region us-central1 \
  --enable-autoscaling \
  --min-nodes 2 \
  --max-nodes 10

# If repair fails, recreate cluster from Terraform
cd terraform
terraform apply -target=google_container_cluster.primary
```

#### Step 3: Restore Application (5 minutes)
```powershell
# Get cluster credentials
gcloud container clusters get-credentials silexar-pulse-gke-production --region us-central1

# Restore Kubernetes resources
.\scripts\disaster-recovery.ps1 -Action restore -BackupTimestamp LATEST

# Verify deployment
kubectl get pods -n production
kubectl get svc -n production
```

**Total Time**: ~10 minutes  
**Success Criteria**: All pods running, services accessible

---

## 🗄️ SCENARIO 2: Database Corruption/Loss

### Symptoms
- Database connection errors
- Data inconsistencies
- Application errors related to database

### Response Procedure

#### Step 1: Assess Damage (1 minute)
```powershell
# Check database status
gcloud sql instances describe silexar-pulse-postgres-production

# Check recent backups
gcloud sql backups list --instance=silexar-pulse-postgres-production --limit=10
```

#### Step 2: Stop Application Traffic (1 minute)
```powershell
# Scale down application
kubectl scale deployment silexar-pulse --replicas=0 -n production

# Verify no traffic
kubectl get pods -n production
```

#### Step 3: Restore Database (6 minutes)
```powershell
# Restore from latest backup
.\scripts\disaster-recovery.ps1 -Action restore -Force

# Or restore to specific point in time
gcloud sql backups restore BACKUP_ID \
  --backup-instance=silexar-pulse-postgres-production \
  --backup-id=BACKUP_ID
```

#### Step 4: Verify and Resume (2 minutes)
```powershell
# Verify database
gcloud sql connect silexar-pulse-postgres-production --user=silexar_admin
# Run: SELECT COUNT(*) FROM users;

# Scale up application
kubectl scale deployment silexar-pulse --replicas=3 -n production

# Monitor logs
kubectl logs -f deployment/silexar-pulse -n production
```

**Total Time**: ~10 minutes  
**Success Criteria**: Database operational, data integrity verified

---

## 🔥 SCENARIO 3: Regional Outage

### Symptoms
- Entire region is down
- Cannot access any GCP services in primary region
- Multi-region failover required

### Response Procedure

#### Step 1: Confirm Regional Outage (1 minute)
```powershell
# Check GCP status
# Visit: https://status.cloud.google.com

# Verify region is down
gcloud compute regions describe us-central1
```

#### Step 2: Initiate Failover (4 minutes)
```powershell
# Promote read replica to master
.\scripts\disaster-recovery.ps1 -Action failover -Force

# Update DNS to point to secondary region
# Manual step: Update DNS A records
```

#### Step 3: Deploy to Secondary Region (5 minutes)
```powershell
# Switch to secondary region
gcloud config set compute/region us-east1

# Deploy infrastructure
cd terraform
terraform workspace select secondary
terraform apply -auto-approve

# Deploy application
kubectl apply -f k8s/production/
```

**Total Time**: ~10 minutes (excluding DNS propagation)  
**Success Criteria**: Application running in secondary region

---

## 💾 SCENARIO 4: Data Loss in Cloud Storage

### Symptoms
- Missing files in Cloud Storage
- 404 errors for assets
- User-uploaded content missing

### Response Procedure

#### Step 1: Identify Scope (1 minute)
```powershell
# Check bucket status
gsutil ls -L gs://silexar-pulse-assets-production

# Check versioning
gsutil versioning get gs://silexar-pulse-assets-production
```

#### Step 2: Restore from Backup (7 minutes)
```powershell
# List available backups
gsutil ls gs://silexar-pulse-backups-production/assets-*/

# Restore latest backup
$latestBackup = gsutil ls gs://silexar-pulse-backups-production/assets-* | Select-Object -Last 1
gsutil -m rsync -r $latestBackup gs://silexar-pulse-assets-production/
```

#### Step 3: Verify Restoration (2 minutes)
```powershell
# Verify file count
gsutil du -s gs://silexar-pulse-assets-production

# Test application
curl https://app.silexar.com/health/ready
```

**Total Time**: ~10 minutes  
**Success Criteria**: All assets restored, application functional

---

## 🔐 SCENARIO 5: Security Breach

### Symptoms
- Unauthorized access detected
- Suspicious activity in logs
- Security alerts triggered

### Response Procedure

#### Step 1: Immediate Containment (2 minutes)
```powershell
# Rotate all secrets
kubectl delete secret db-credentials -n production
kubectl delete secret redis-credentials -n production
kubectl delete secret app-secrets -n production

# Block suspicious IPs
gcloud compute firewall-rules create block-suspicious \
  --action DENY \
  --rules tcp:443 \
  --source-ranges SUSPICIOUS_IP_RANGE
```

#### Step 2: Audit and Investigate (5 minutes)
```powershell
# Check audit logs
gcloud logging read "resource.type=gke_cluster" \
  --limit 1000 \
  --format json \
  --freshness 1h

# Check for unauthorized access
kubectl get events --all-namespaces --sort-by='.lastTimestamp'
```

#### Step 3: Remediate and Restore (3 minutes)
```powershell
# Recreate secrets
.\scripts\create-secrets.ps1

# Restart all pods
kubectl rollout restart deployment/silexar-pulse -n production

# Verify security
.\scripts\health-check.ps1 -Detailed
```

**Total Time**: ~10 minutes  
**Success Criteria**: Breach contained, systems secured

---

## 📞 ESCALATION CONTACTS

### Level 1: On-Call Engineer
- **Name**: [TO BE FILLED]
- **Phone**: [TO BE FILLED]
- **Email**: [TO BE FILLED]

### Level 2: DevOps Lead
- **Name**: [TO BE FILLED]
- **Phone**: [TO BE FILLED]
- **Email**: [TO BE FILLED]

### Level 3: CTO
- **Name**: [TO BE FILLED]
- **Phone**: [TO BE FILLED]
- **Email**: [TO BE FILLED]

---

## 📊 POST-INCIDENT CHECKLIST

After resolving any incident:

- [ ] Document incident in incident log
- [ ] Update this runbook if procedures changed
- [ ] Conduct post-mortem meeting
- [ ] Implement preventive measures
- [ ] Test recovery procedures
- [ ] Update monitoring/alerting
- [ ] Communicate to stakeholders
- [ ] Archive incident artifacts

---

## 🧪 TESTING SCHEDULE

**Monthly**: Test database restore procedure  
**Quarterly**: Full disaster recovery drill  
**Annually**: Regional failover test

**Last Test**: [TO BE FILLED]  
**Next Test**: [TO BE FILLED]

---

## 📝 REVISION HISTORY

| Date | Version | Changes | Author |
|------|---------|---------|--------|
| 2025-11-23 | 1.0.0 | Initial creation | Silexar Pulse Team |
