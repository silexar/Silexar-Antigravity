/*
 End-to-end helper for Campaign Confirmations
 - Creates a sample line
 - Generates a confirmation (PDF persisted)
 - Downloads the PDF to local file
 - Sends the confirmation via email (if SMTP_* and DESTINATARIO are set)

 Usage:
   BASE_URL=http://localhost:3000 \
   CAMPAIGN_ID=<uuid optional> \
   JWT=<optional> \
   DESTINATARIO=<email optional> \
   node scripts/campanas-confirmacion-e2e.js
*/

const fs = require('fs')
const path = require('path')

async function main() {
  const baseUrl = process.env.BASE_URL || 'http://localhost:3000'
  const campaignId = process.env.CAMPAIGN_ID || require('crypto').randomUUID()
  let jwt = process.env.JWT
  if (!jwt) {
    try {
      const jwtLib = require('jsonwebtoken')
      jwt = jwtLib.sign({ sub: 'u1', role: 'TM_SENIOR', email: 'tm@acme.io' }, process.env.JWT_SECRET || 'quantum-secret-key')
    } catch {
      console.warn('[warn] No JWT provided and jsonwebtoken not available; some calls may fail')
    }
  }

  console.log(`[info] Using baseUrl=${baseUrl}`)
  console.log(`[info] Using campaignId=${campaignId}`)

  const headers = { 'Content-Type': 'application/json' }
  if (jwt) headers['Authorization'] = `Bearer ${jwt}`

  // 1) Create a sample line
  const lineBody = {
    lineNumber: 1,
    blockType: 'REPARTIDO',
    startTime: '06:00',
    endTime: '22:00',
    spots: 10,
  }
  console.log('[step] Creating sample line')
  let res = await fetch(`${baseUrl}/api/campanas/${campaignId}/lineas`, {
    method: 'POST', headers, body: JSON.stringify(lineBody)
  })
  const lineResp = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(`[lineas:POST] ${res.status} ${JSON.stringify(lineResp)}`)
  console.log('[ok] Line created')

  // 2) Generate confirmation
  console.log('[step] Generating confirmation')
  res = await fetch(`${baseUrl}/api/campanas/${campaignId}/confirmaciones/generar`, {
    method: 'POST', headers, body: JSON.stringify({ template: 'default', notasTecnicas: 'Generada via script' })
  })
  const gen = await res.json().catch(() => ({}))
  if (!res.ok || !gen?.id || !gen?.previewUrl) throw new Error(`[confirmaciones:generar] ${res.status} ${JSON.stringify(gen)}`)
  console.log(`[ok] Confirmation generated id=${gen.id}`)

  // 3) Download PDF
  console.log('[step] Downloading PDF')
  const pdfUrl = `${baseUrl}${gen.previewUrl}`
  res = await fetch(pdfUrl)
  if (!res.ok) throw new Error(`[confirmaciones:pdf:get] ${res.status}`)
  const buf = Buffer.from(await res.arrayBuffer())
  const outDir = path.resolve(process.cwd(), 'out')
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true })
  const outFile = path.join(outDir, `confirmacion_${campaignId}_${gen.id}.pdf`)
  fs.writeFileSync(outFile, buf)
  console.log(`[ok] PDF saved at ${outFile}`)

  // 4) Send via email if configured
  const destinatario = process.env.DESTINATARIO
  if (destinatario && process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    console.log('[step] Sending confirmation by email')
    res = await fetch(`${baseUrl}/api/campanas/${campaignId}/confirmaciones/${gen.id}/enviar`, {
      method: 'POST', headers, body: JSON.stringify({ destinatarios: [destinatario] })
    })
    const send = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(`[confirmaciones:enviar] ${res.status} ${JSON.stringify(send)}`)
    console.log('[ok] Email send request accepted', send)
  } else {
    console.log('[info] Skipping email send (DESTINATARIO/SMTP_* not configured)')
  }

  console.log('[done] E2E flow finished')
}

main().catch((e) => { console.error('[error]', e?.message || e); process.exit(1) })

