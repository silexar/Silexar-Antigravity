# 🚧 Integraciones Pendientes para Producción

Este documento detalla las especificaciones técnicas para las integraciones que actualmente utilizan mocks o stubs y deben ser conectadas a proveedores reales antes del despliegue en producción.

## 1. Motor de Voz AI (Multi-Provider)

Actualmente, `CortexVoice` utiliza una implementación interna simulada o básica. Para producción, se debe refactorizar para soportar múltiples proveedores mediante el patrón Adapter.

### Archivos Afectados

- `src/lib/cortex/cortex-voice.ts`
- `src/app/cunas/nuevo/components/VoiceConfigModal.tsx`

### Requerimientos

1.  **OpenAI TTS**:
    - Endpoint: `https://api.openai.com/v1/audio/speech`
    - Models: `tts-1`, `tts-1-hd`
    - Voices: `alloy`, `echo`, `fable`, `onyx`, `nova`, `shimmer`
2.  **ElevenLabs**:
    - Endpoint: `https://api.elevenlabs.io/v1/text-to-speech/{voice_id}`
    - Requiere manejo de `xi-api-key`.
    - Soporte para `similarity_boost` y `stability`.

### Arquitectura Propuesta

```typescript
interface VoiceProvider {
  synthesize(text: string, config: VoiceConfig): Promise<Blob>;
  getVoices(): Promise<VoiceDefinition[]>;
}
```

## 2. Blockchain Verification (Proof of Play)

El servicio `FutureIntegrationsService` tiene un método `Blockchain.certifyBroadcast` simulado.

### Archivos Afectados

- `src/app/cunas/nuevo/services/FutureIntegrationsService.ts`

### Requerimientos

- Conectar a red Ethereum o Polygon.
- Smart Contract para registrar hash del audio + timestamp de emisión.
- Almacenar `transactionHash` en historial de la cuña.

## 3. Monitorización IoT (Dispositivos Físicos)

La monitorización de dispositivos de playout en `FutureIntegrationsService.IoT` devuelve datos estáticos.

### Requerimientos

- Implementar protocolo MQTT o WebSocket seguro.
- Cada player en antena debe reportar heartbeat cada 30s.
- Dashboard debe suscribirse al tópico `silexar/players/{stationId}/status`.

## 4. Distribución Real (Email/FTP)

El `DistributionManager` simula el envío.

### Archivos Afectados

- `src/app/cunas/nuevo/services/DistributionManager.ts`

### Acciones

- Integrar SMTP real (SendGrid/AWS SES).
- Integrar subida FTP/SFTP a servidores de emisoras.
- Generar enlaces firmados (S3 Presigned URLs) para descarga segura.
