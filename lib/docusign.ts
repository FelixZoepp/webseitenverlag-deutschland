// DocuSign-Integration (Feature-Flag-gesteuert)
// Erstellt Envelopes mit Angebot + AGB + SEPA-Mandat

import { flags } from './feature-flags'

interface DocuSignDocument {
  documentId: string
  name: string
  pdfBuffer: Buffer
}

interface DocuSignRecipient {
  email: string
  name: string
}

interface EnvelopeResult {
  envelopeId: string
  status: string
}

// JWT-Token holen (DocuSign Server-to-Server Auth)
async function getAccessToken(): Promise<string> {
  const integrationKey = process.env.DOCUSIGN_INTEGRATION_KEY!
  const userId = process.env.DOCUSIGN_USER_ID!
  const privateKey = process.env.DOCUSIGN_PRIVATE_KEY!
  const baseUrl = process.env.DOCUSIGN_BASE_URL || 'https://demo.docusign.net'

  // JWT erstellen
  const now = Math.floor(Date.now() / 1000)
  const header = Buffer.from(JSON.stringify({ typ: 'JWT', alg: 'RS256' })).toString('base64url')
  const payload = Buffer.from(JSON.stringify({
    iss: integrationKey,
    sub: userId,
    aud: baseUrl.replace('https://', ''),
    iat: now,
    exp: now + 3600,
    scope: 'signature impersonation',
  })).toString('base64url')

  // Signierung mit crypto
  const crypto = await import('crypto')
  const sign = crypto.createSign('RSA-SHA256')
  sign.update(`${header}.${payload}`)
  const signature = sign.sign(privateKey, 'base64url')

  const jwt = `${header}.${payload}.${signature}`

  const tokenRes = await fetch(`${baseUrl}/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  })

  if (!tokenRes.ok) {
    throw new Error(`DocuSign token error: ${tokenRes.status} ${await tokenRes.text()}`)
  }

  const tokenData = await tokenRes.json()
  return tokenData.access_token
}

export async function createEnvelope(
  recipient: DocuSignRecipient,
  documents: DocuSignDocument[],
  emailSubject: string,
  webhookUrl: string
): Promise<EnvelopeResult | null> {
  if (!flags.docusignActive) {
    console.log('[DOCUSIGN-STUB] DocuSign nicht aktiv, überspringe Envelope-Erstellung')
    return null
  }

  const accessToken = await getAccessToken()
  const accountId = process.env.DOCUSIGN_ACCOUNT_ID!
  const baseUrl = process.env.DOCUSIGN_API_BASE_URL || 'https://demo.docusign.net/restapi'

  const envelopeDefinition = {
    emailSubject,
    documents: documents.map((d) => ({
      documentId: d.documentId,
      name: d.name,
      documentBase64: d.pdfBuffer.toString('base64'),
      fileExtension: 'pdf',
    })),
    recipients: {
      signers: [{
        email: recipient.email,
        name: recipient.name,
        recipientId: '1',
        routingOrder: '1',
        tabs: {
          signHereTabs: documents.map((d, i) => ({
            documentId: d.documentId,
            pageNumber: '1',
            xPosition: '350',
            yPosition: String(600 + i * 30),
          })),
          dateSignedTabs: [{
            documentId: documents[0].documentId,
            pageNumber: '1',
            xPosition: '100',
            yPosition: '650',
          }],
        },
      }],
    },
    eventNotification: {
      url: webhookUrl,
      requireAcknowledgment: true,
      envelopeEvents: [
        { envelopeEventStatusCode: 'completed' },
        { envelopeEventStatusCode: 'declined' },
        { envelopeEventStatusCode: 'voided' },
      ],
    },
    status: 'sent',
  }

  const res = await fetch(`${baseUrl}/v2.1/accounts/${accountId}/envelopes`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(envelopeDefinition),
  })

  if (!res.ok) {
    const errText = await res.text()
    console.error('DocuSign envelope error:', res.status, errText)
    throw new Error(`DocuSign Fehler: ${res.status}`)
  }

  const data = await res.json()
  return {
    envelopeId: data.envelopeId,
    status: data.status,
  }
}

export async function getSignedDocuments(
  envelopeId: string
): Promise<{ documentId: string; name: string; buffer: Buffer }[]> {
  if (!flags.docusignActive) return []

  const accessToken = await getAccessToken()
  const accountId = process.env.DOCUSIGN_ACCOUNT_ID!
  const baseUrl = process.env.DOCUSIGN_API_BASE_URL || 'https://demo.docusign.net/restapi'

  // Liste der Dokumente
  const listRes = await fetch(
    `${baseUrl}/v2.1/accounts/${accountId}/envelopes/${envelopeId}/documents`,
    { headers: { 'Authorization': `Bearer ${accessToken}` } }
  )

  if (!listRes.ok) return []
  const listData = await listRes.json()

  const results: { documentId: string; name: string; buffer: Buffer }[] = []

  for (const doc of listData.envelopeDocuments || []) {
    if (doc.documentId === 'certificate') continue // Audit-Trail überspringen

    const docRes = await fetch(
      `${baseUrl}/v2.1/accounts/${accountId}/envelopes/${envelopeId}/documents/${doc.documentId}`,
      { headers: { 'Authorization': `Bearer ${accessToken}` } }
    )

    if (docRes.ok) {
      const arrayBuffer = await docRes.arrayBuffer()
      results.push({
        documentId: doc.documentId,
        name: doc.name,
        buffer: Buffer.from(arrayBuffer),
      })
    }
  }

  return results
}
