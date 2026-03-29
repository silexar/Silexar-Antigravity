# 📋 LISTA DE PENDIENTES PARA PASE A PRODUCCIÓN (TIER X)

Este documento detalla las tareas críticas restantes para conectar y estabilizar el sistema antes del despliegue productivo final.

## 1. Integración de Base de Datos

- [ ] **Ejecutar Migraciones:** Generar y aplicar las migraciones para `cunas-digital-schema.ts`.
  - Comando: `npm run db:generate` y `npm run db:push`.
- [ ] **Validar Foreign Keys:** Verificar que la nueva conexión `campanaId` en `ad_targeting_profiles` y `performance_predictions` funcione correctamente.
- [ ] **Indices:** Confirmar que los índices creados para las nuevas tablas sean eficientes para consultas de alta frecuencia.

## 2. Conexión Backend (API)

- [ ] **Endpoints de Campaña Digital:**
  - Actualizar el controlador de Campañas para permitir asignar `adTargetingProfiles` a nivel de campaña.
  - Crear endpoint `GET /api/campanas/:id/digital-performance` que agregue las predicciones de todas las cuñas asociadas.
- [ ] **Webhook Listener:** Implementar listener real para los webhooks de `digitalTrackers` (e.g., recibir eventos de trackers externos).
- [ ] **AI Service Integration:** Conectar el `PerformancePredictionEngine` con una API real de inferencia si la simulación actual no es suficiente para producción.

## 3. Frontend & UX

- [ ] **Dashboard de Campaña:** Agregar widget de "Digital Performance" en el dashboard principal de la campaña que consuma los datos agregados.
- [ ] **Selector de Campaña en Wizard:** En el `DigitalCunaWizard`, asegurar que al seleccionar una campaña, se pre-carguen las reglas de targeting de esa campaña.

## 4. Infraestructura & Despliegue

- [ ] **Storage Buckets:** Configurar buckets de Google Cloud Storage con políticas CORS para los nuevos tipos de assets (GLB para AR, Video pesado).
- [ ] **CDN:** Configurar CDN para la entrega de assets digitales (Cloudflare o Cloud CDN).
- [ ] **GPU Nodes:** (Opcional Tier X) Si se activa la generación en tiempo real, aprovisionar nodos con GPU para el renderizado.

## 5. Pruebas Críticas (QA)

- [ ] **Flujo Híbrido:** Crear una campaña, asignar una cuña híbrida, y verificar que los datos fluyan a ambos reportes (FM y Digital).
- [ ] **Mobile Testing:** Verificar que los eventos de toque/scroll en el simulador móvil se registran correctamente en `neuromorphicProfiles`.
- [ ] **Load Testing:** Simular 10,000 requests de targeting simultáneos para validar el `QuantumTargetingEngine`.

## 6. Seguridad Operativa

- [ ] **Validar Kill Switch:** Probar que el botón de pánico interrumpa realmente los streams de audio y desactive campañas digitales en < 500ms.
- [ ] **Test de Estrés UI:** Iniciar acciones masivas con > 100 elementos seleccionados para verificar renderizado.
- [ ] **Atajos de Teclado:** Confirmar que no haya conflictos con atajos del navegador.
