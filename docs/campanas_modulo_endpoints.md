# Módulo Campañas — Endpoints y Guía Rápida

Esta guía documenta los endpoints implementados para el submódulo de campañas (líneas, confirmaciones PDF, historial y utilitarios).

## Autenticación
- Header: `Authorization: Bearer <JWT>`
- Roles soportados (RBAC): `TM_SENIOR`, `EJECUTIVO`, `PROGRAMADOR`, `CLIENTE`.

## Líneas de campaña

- GET `/api/campanas/{id}/lineas`
  - Lista líneas de la campaña.
  - cURL:
    ```bash
    curl -X GET "http://localhost:3000/api/campanas/{id}/lineas"
    ```
  - PowerShell:
    ```powershell
    Invoke-RestMethod -Method Get -Uri "http://localhost:3000/api/campanas/{id}/lineas"
    ```

- POST `/api/campanas/{id}/lineas`
  - Crea línea. RBAC: `TM_SENIOR` o `PROGRAMADOR`.
  - Body:
    ```json
    {"lineNumber":1,"blockType":"REPARTIDO","startTime":"06:00","endTime":"22:00","spots":10,"fixedPosition":"","materialId":"SP001"}
    ```

- PUT `/api/campanas/{id}/lineas`
  - Actualiza por `id` en body. RBAC: `TM_SENIOR` o `PROGRAMADOR`.
  - Body:
    ```json
    {"id":"<lineId>","spots":12,"status":"PLANIFICADA"}
    ```

- DELETE `/api/campanas/{id}/lineas?id=<lineId>`
  - Elimina línea. RBAC: `TM_SENIOR` o `PROGRAMADOR`.
  - cURL:
    ```bash
    curl -X DELETE "http://localhost:3000/api/campanas/{id}/lineas?id=<lineId>" -H "Authorization: Bearer <JWT>"
    ```

- GET `/api/campanas/{id}/lineas/export`
  - Exporta CSV de líneas.
  - cURL:
    ```bash
    curl -L "http://localhost:3000/api/campanas/{id}/lineas/export" -o lineas_{id}.csv
    ```

## Confirmaciones PDF

- POST `/api/campanas/{id}/confirmaciones/generar`
  - Genera PDF con pdf-lib (fallback lite) y lo persiste. RBAC: `TM_SENIOR`, `EJECUTIVO` o `PROGRAMADOR`.
  - Body:
    ```json
    {"template":"default","logoUrl":"https://.../logo.png","notasTecnicas":"Revisión TM","incluirMetricas":true,"destinatarios":["client@acme.com"]}
    ```
  - Respuesta: `{ success, id, previewUrl }` donde `previewUrl` es `/api/campanas/{id}/confirmaciones/{confirmationId}.pdf`.

- GET `/api/campanas/{id}/confirmaciones`
  - Lista confirmaciones (sin archivo binario).

- DELETE `/api/campanas/{id}/confirmaciones?id=<confirmationId>`
  - Elimina confirmación. RBAC: `TM_SENIOR` o `EJECUTIVO`.

- GET `/api/campanas/{id}/confirmaciones/preview.pdf?template=default&notas=Texto&metricas=1`
  - Genera un PDF on-the-fly desde las líneas actuales (no persiste). Útil para probar.
  - cURL:
    ```bash
    curl -L "http://localhost:3000/api/campanas/{id}/confirmaciones/preview.pdf?template=default&notas=Test&metricas=1" -o confirmacion_preview.pdf
    ```

- GET `/api/campanas/{id}/confirmaciones/{confirmationId}.pdf`
  - Descarga el PDF persistido.
  - cURL:
    ```bash
    curl -L "http://localhost:3000/api/campanas/{id}/confirmaciones/{confirmationId}.pdf" -o confirmacion.pdf
    ```

- POST `/api/campanas/{id}/confirmaciones/{confirmationId}/enviar`
  - Envía email real con adjunto PDF si SMTP está configurado; sino responde `EMAIL_NOT_CONFIGURED`. Marca `ENVIADA` y registra historial si exitoso. RBAC: `TM_SENIOR` o `EJECUTIVO`.
  - Body: `{ "destinatarios": ["a@a.com", "b@b.com"] }`
  - Variables de entorno requeridas:
    - `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_SECURE=true|false`, `SMTP_FROM` (opcional, por defecto `SMTP_USER`).
  - Ejemplo PowerShell:
    ```powershell
    $b = @{ destinatarios = @("cliente@acme.io") } | ConvertTo-Json
    Invoke-RestMethod -Method Post -Uri "http://localhost:3000/api/campanas/{id}/confirmaciones/{confirmationId}/enviar" -Headers @{ Authorization = "Bearer <JWT>" } -ContentType "application/json" -Body $b
    ```

## Historial

- GET `/api/campanas/{id}/historial`
  - Lista entradas de auditoría con filtros opcionales (usuario/acción/fecha).

- GET `/api/campanas/{id}/historial/export`
  - Exporta CSV del historial.

## Programación (upsert líneas base)

- POST `/api/campanas/programacion/ejecutar`
  - Persiste/upsert líneas base y devuelve métricas simuladas.

## Materiales, Tarifas y Propiedades
  - cURL:
    ```bash
    curl -X POST "http://localhost:3000/api/campanas/{id}/lineas" \
      -H "Authorization: Bearer <JWT>" -H "Content-Type: application/json" \
      -d '{"lineNumber":1,"blockType":"REPARTIDO","startTime":"06:00","endTime":"22:00","spots":10}'
    ```
  - PowerShell:
    ```powershell
    $b = @{ lineNumber=1; blockType="REPARTIDO"; startTime="06:00"; endTime="22:00"; spots=10 } | ConvertTo-Json
    Invoke-RestMethod -Method Post -Uri "http://localhost:3000/api/campanas/{id}/lineas" -Headers @{ Authorization="Bearer <JWT>" } -ContentType "application/json" -Body $b
    ```
  - cURL:
    ```bash
    curl -X PUT "http://localhost:3000/api/campanas/{id}/lineas" \
      -H "Authorization: Bearer <JWT>" -H "Content-Type: application/json" \
      -d '{"id":"<lineId>","spots":12,"status":"PLANIFICADA"}'
    ```

- Materiales CRUD: `/api/campanas/{id}/materiales` (GET/POST/PUT/DELETE)
- Tarifas CRUD: `/api/campanas/{id}/tarifas` (GET/POST/PUT/DELETE)
- Propiedades: `/api/campanas/{id}/propiedades` (GET/POST/DELETE)

## Notas de operación
- Rate limit activado en endpoints de escritura.
- Validaciones de hora en líneas (startTime < endTime).
  - cURL:
    ```bash
    curl -X POST "http://localhost:3000/api/campanas/{id}/confirmaciones/generar" \
      -H "Authorization: Bearer <JWT>" -H "Content-Type: application/json" \
      -d '{"template":"default","notasTecnicas":"Revision TM","incluirMetricas":true}'
    ```
- Para probar en local:
  1. `npm run db:generate && npm run db:migrate`
  2. `npm run dev`
  3. Generar JWT (TM_SENIOR):
     ```bash
     node -e "console.log(require('jsonwebtoken').sign({ sub:'u1', role:'TM_SENIOR', email:'tm@acme.io' }, 'quantum-secret-key'))"
     ```
  4. Crear líneas, luego confirmar y abrir `previewUrl`.
  - cURL:
    ```bash
    curl -X POST "http://localhost:3000/api/campanas/{id}/confirmaciones/{confirmationId}/enviar" \
      -H "Authorization: Bearer <JWT>" -H "Content-Type: application/json" \
      -d '{"destinatarios":["cliente@acme.io"]}'
    ```

## Guía rápida: de cero a confirmación enviada
1) Crear campaña (usar UUID arbitrario) y al menos una línea.
2) Generar confirmación: `POST /api/campanas/{id}/confirmaciones/generar`.
3) Probar visualización rápida: `GET /api/campanas/{id}/confirmaciones/preview.pdf`.
4) Descargar persistida: `GET /api/campanas/{id}/confirmaciones/{confirmationId}.pdf`.
5) Configurar SMTP en `.env.local` y reiniciar dev.
6) Enviar: `POST /api/campanas/{id}/confirmaciones/{confirmationId}/enviar` con destinatarios.
