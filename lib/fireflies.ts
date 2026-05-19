// Fireflies.ai Integration
// Ruft Transkripte von Sales-Calls ab

const FIREFLIES_API = 'https://api.fireflies.ai/graphql'

interface FirefliesResult {
  callId: string
  transcript: string
  notes: string
}

export async function fetchFirefliesTranscript(
  meetingUrl: string
): Promise<FirefliesResult | null> {
  const apiKey = process.env.FIREFLIES_API_KEY
  if (!apiKey) {
    console.log('[FIREFLIES-STUB] API-Key nicht gesetzt, überspringe:', meetingUrl)
    return null
  }

  // Extrahiere die Meeting-ID aus der URL
  // Format: https://app.fireflies.ai/view/MEETING_ID
  const urlParts = meetingUrl.split('/')
  const meetingId = urlParts[urlParts.length - 1]

  if (!meetingId) return null

  try {
    const res = await fetch(FIREFLIES_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        query: `
          query GetTranscript($id: String!) {
            transcript(id: $id) {
              id
              title
              sentences {
                speaker_name
                text
              }
              summary {
                overview
                action_items
              }
            }
          }
        `,
        variables: { id: meetingId },
      }),
    })

    if (!res.ok) {
      console.error('Fireflies API error:', res.status, await res.text())
      return null
    }

    const json = await res.json()
    const data = json.data?.transcript

    if (!data) return null

    const transcript = (data.sentences || [])
      .map((s: { speaker_name: string; text: string }) => `${s.speaker_name}: ${s.text}`)
      .join('\n')

    const notes = [
      data.summary?.overview || '',
      data.summary?.action_items ? `\nAction Items:\n${data.summary.action_items}` : '',
    ].filter(Boolean).join('\n')

    return {
      callId: data.id,
      transcript,
      notes,
    }
  } catch (err) {
    console.error('Fireflies fetch failed:', err)
    return null
  }
}
