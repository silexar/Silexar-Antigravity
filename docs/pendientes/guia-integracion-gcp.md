# 🌐 Guía de Integración con Google Cloud Platform

## Silexar Pulse - Servicios GCP Requeridos

Esta guía documenta los pasos para integrar Silexar Pulse con los servicios de Google Cloud Platform necesarios para producción.

---

## 📋 Índice

1. [Requisitos Previos](#requisitos-previos)
2. [Vertex AI - IA Generativa](#vertex-ai---ia-generativa)
3. [Cloud Pub/Sub - Bus de Eventos](#cloud-pubsub---bus-de-eventos)
4. [Cloud Storage - Modelos FL](#cloud-storage---modelos-fl)
5. [Cloud SQL - PostgreSQL](#cloud-sql---postgresql)
6. [Variables de Entorno](#variables-de-entorno)
7. [Verificación](#verificación)

---

## Requisitos Previos

### 1. Crear Proyecto GCP

```bash
gcloud projects create silexar-pulse-prod --name="Silexar Pulse Production"
gcloud config set project silexar-pulse-prod
```

### 2. Habilitar APIs Requeridas

```bash
gcloud services enable \
  aiplatform.googleapis.com \
  pubsub.googleapis.com \
  storage.googleapis.com \
  sqladmin.googleapis.com \
  secretmanager.googleapis.com \
  cloudkms.googleapis.com
```

### 3. Crear Service Account

```bash
gcloud iam service-accounts create silexar-pulse-sa \
  --display-name="Silexar Pulse Service Account"

# Asignar roles necesarios
gcloud projects add-iam-policy-binding silexar-pulse-prod \
  --member="serviceAccount:silexar-pulse-sa@silexar-pulse-prod.iam.gserviceaccount.com" \
  --role="roles/aiplatform.user"

gcloud projects add-iam-policy-binding silexar-pulse-prod \
  --member="serviceAccount:silexar-pulse-sa@silexar-pulse-prod.iam.gserviceaccount.com" \
  --role="roles/pubsub.publisher"

gcloud projects add-iam-policy-binding silexar-pulse-prod \
  --member="serviceAccount:silexar-pulse-sa@silexar-pulse-prod.iam.gserviceaccount.com" \
  --role="roles/storage.admin"
```

---

## Vertex AI - IA Generativa

### 1. Configurar Imagen (Imagen 2)

Para generación de imágenes publicitarias.

```bash
# Verificar disponibilidad del modelo
gcloud ai models list --region=us-central1 --filter="imagegeneration"
```

**Uso en código** (`cortex-generative-ai.ts`):

```typescript
import { VertexAI } from "@google-cloud/vertexai";

const vertexAI = new VertexAI({
  project: process.env.GCP_PROJECT_ID,
  location: "us-central1",
});

// Para imágenes
const imageModel = vertexAI.getGenerativeModel({
  model: "imagegeneration@006",
});
```

### 2. Configurar Gemini Pro

Para generación de texto (copy publicitario).

```typescript
// Para texto
const textModel = vertexAI.getGenerativeModel({
  model: "gemini-1.5-pro-preview-0409",
});

const response = await textModel.generateContent({
  contents: [{ role: "user", parts: [{ text: prompt }] }],
});
```

### 3. Costos Estimados

| Modelo     | Costo                                            |
| ---------- | ------------------------------------------------ |
| Imagen 2   | $0.020 por imagen                                |
| Gemini Pro | $0.00025/1K chars input, $0.0005/1K chars output |

---

## Cloud Pub/Sub - Bus de Eventos

### 1. Crear Topics

```bash
# Topics principales del sistema
gcloud pubsub topics create ad_requests
gcloud pubsub topics create contextual_triggers
gcloud pubsub topics create user_interactions
gcloud pubsub topics create narrative_progress
gcloud pubsub topics create fl_updates
gcloud pubsub topics create enriched_ad_requests

# Dead letter topic
gcloud pubsub topics create dead_letters
```

### 2. Crear Subscriptions

```bash
# Subscriptions para procesadores
gcloud pubsub subscriptions create ad_requests_processor \
  --topic=ad_requests \
  --ack-deadline=60 \
  --dead-letter-topic=dead_letters \
  --max-delivery-attempts=5

gcloud pubsub subscriptions create contextual_triggers_processor \
  --topic=contextual_triggers \
  --ack-deadline=60

gcloud pubsub subscriptions create fl_updates_aggregator \
  --topic=fl_updates \
  --ack-deadline=120
```

### 3. Uso en Código

Actualizar `cortex-event-bus-redis.ts` para usar Pub/Sub:

```typescript
import { PubSub } from "@google-cloud/pubsub";

const pubsub = new PubSub({
  projectId: process.env.GCP_PROJECT_ID,
});

// Publicar evento
async function publishEvent(topic: string, data: object) {
  const topicRef = pubsub.topic(topic);
  const messageBuffer = Buffer.from(JSON.stringify(data));
  await topicRef.publishMessage({ data: messageBuffer });
}

// Suscribirse a eventos
async function subscribe(topic: string, handler: Function) {
  const subscription = pubsub.subscription(`${topic}_processor`);
  subscription.on("message", (message) => {
    handler(JSON.parse(message.data.toString()));
    message.ack();
  });
}
```

---

## Cloud Storage - Modelos FL

### 1. Crear Buckets

```bash
# Bucket para modelos TensorFlow Lite
gsutil mb -l us-central1 gs://silexar-fl-models/

# Bucket para creatividades generadas
gsutil mb -l us-central1 gs://silexar-creatives/

# Configurar CORS para creatividades
cat > cors.json << EOF
[
  {
    "origin": ["*"],
    "method": ["GET"],
    "responseHeader": ["Content-Type"],
    "maxAgeSeconds": 3600
  }
]
EOF
gsutil cors set cors.json gs://silexar-creatives/
```

### 2. Estructura de Modelos FL

```
gs://silexar-fl-models/
├── models/
│   ├── model-1.0.0.tflite
│   ├── model-1.0.1.tflite
│   └── model-1.0.2.tflite
├── gradients/
│   └── round_123456/
│       ├── update_001.bin
│       └── update_002.bin
└── checksums/
    └── checksums.json
```

### 3. URLs Firmadas para Descarga

```typescript
import { Storage } from "@google-cloud/storage";

const storage = new Storage();

async function getModelDownloadUrl(version: string): Promise<string> {
  const bucket = storage.bucket("silexar-fl-models");
  const file = bucket.file(`models/model-${version}.tflite`);

  const [url] = await file.getSignedUrl({
    action: "read",
    expires: Date.now() + 3600 * 1000, // 1 hora
  });

  return url;
}
```

---

## Cloud SQL - PostgreSQL

### 1. Crear Instancia

```bash
gcloud sql instances create silexar-pulse-db \
  --database-version=POSTGRES_15 \
  --tier=db-custom-4-16384 \
  --region=us-central1 \
  --storage-size=100GB \
  --storage-type=SSD \
  --availability-type=REGIONAL \
  --backup-start-time=03:00 \
  --enable-point-in-time-recovery
```

### 2. Crear Base de Datos

```bash
gcloud sql databases create silexar_pulse --instance=silexar-pulse-db

gcloud sql users create silexar_admin \
  --instance=silexar-pulse-db \
  --password="[SECURE_PASSWORD]"
```

### 3. Ejecutar Migraciones

```bash
# Conectar a la instancia
gcloud sql connect silexar-pulse-db --user=silexar_admin --database=silexar_pulse

# Ejecutar migraciones
psql -f drizzle/0000_closed_captain_britain.sql
psql -f drizzle/0001_billing_value_models.sql
psql -f drizzle/0002_fl_mraid_sdk_events.sql
```

---

## Variables de Entorno

Agregar a `.env.production`:

```env
# GCP Configuration
GCP_PROJECT_ID=silexar-pulse-prod
GCP_REGION=us-central1
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json

# Vertex AI
VERTEX_AI_LOCATION=us-central1
GEMINI_MODEL=gemini-1.5-pro-preview-0409
IMAGEN_MODEL=imagegeneration@006

# Cloud Pub/Sub
PUBSUB_TOPIC_AD_REQUESTS=ad_requests
PUBSUB_TOPIC_CONTEXTUAL_TRIGGERS=contextual_triggers
PUBSUB_TOPIC_USER_INTERACTIONS=user_interactions
PUBSUB_TOPIC_FL_UPDATES=fl_updates

# Cloud Storage
GCS_BUCKET_FL_MODELS=silexar-fl-models
GCS_BUCKET_CREATIVES=silexar-creatives

# Cloud SQL
DATABASE_URL=postgresql://silexar_admin:[PASSWORD]@/silexar_pulse?host=/cloudsql/silexar-pulse-prod:us-central1:silexar-pulse-db
```

---

## Verificación

### 1. Verificar Conectividad

```bash
# Verificar autenticación
gcloud auth application-default print-access-token

# Verificar acceso a Vertex AI
gcloud ai models list --region=us-central1

# Verificar Pub/Sub
gcloud pubsub topics list

# Verificar Storage
gsutil ls gs://silexar-fl-models/

# Verificar Cloud SQL
gcloud sql instances describe silexar-pulse-db
```

### 2. Test de Integración

```typescript
// test/integration/gcp-integration.test.ts
describe("GCP Integration", () => {
  it("should connect to Vertex AI", async () => {
    const vertexAI = new VertexAI({ project: process.env.GCP_PROJECT_ID });
    expect(vertexAI).toBeDefined();
  });

  it("should publish to Pub/Sub", async () => {
    const pubsub = new PubSub();
    const topic = pubsub.topic("ad_requests");
    const [exists] = await topic.exists();
    expect(exists).toBe(true);
  });

  it("should access Storage bucket", async () => {
    const storage = new Storage();
    const [buckets] = await storage.getBuckets();
    expect(buckets.some((b) => b.name === "silexar-fl-models")).toBe(true);
  });
});
```

---

## Costos Mensuales Estimados

| Servicio           | Uso Estimado    | Costo/Mes     |
| ------------------ | --------------- | ------------- |
| Vertex AI (Imagen) | 10,000 imágenes | $200          |
| Vertex AI (Gemini) | 1M tokens       | $250          |
| Cloud Pub/Sub      | 10M mensajes    | $40           |
| Cloud Storage      | 100 GB          | $2.60         |
| Cloud SQL (4 vCPU) | 24/7            | $250          |
| **Total Estimado** |                 | **~$742/mes** |

---

## Contacto

Para soporte con la configuración GCP:

- **Email**: soporte@silexar.com
- **Slack**: #infraestructura
