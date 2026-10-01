import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

/**
 * Bewertungs-Autopilot: Empfänger klickt Ja oder Nein.
 *
 * GET /api/public/review/{requestId}?response=ja → Redirect zu Google Review
 * GET /api/public/review/{requestId}?response=nein → Feedback-Seite
 * POST /api/public/review/{requestId} → Feedback-Text speichern
 */

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(
  request: Request,
  { params }: { params: { requestId: string } }
) {
  const { requestId } = params
  const url = new URL(request.url)
  const response = url.searchParams.get('response')

  const { data: rr } = await supabase
    .from('review_requests')
    .select('id, site_id, status, empfaenger_name')
    .eq('id', requestId)
    .single()

  if (!rr) return new NextResponse('Nicht gefunden', { status: 404 })

  // Track Klick
  await supabase
    .from('review_requests')
    .update({ geklickt_am: new Date().toISOString() })
    .eq('id', requestId)

  // Ja → Google Review Link holen und weiterleiten
  if (response === 'ja') {
    await supabase
      .from('review_requests')
      .update({ status: 'zufrieden' })
      .eq('id', requestId)

    const { data: site } = await supabase
      .from('sites')
      .select('review_autopilot, name')
      .eq('id', rr.site_id)
      .single()

    const config = site?.review_autopilot as { google_review_url?: string } | null
    const reviewUrl = config?.google_review_url

    if (reviewUrl && (reviewUrl.startsWith('https://search.google.com/') || reviewUrl.startsWith('https://g.page/') || reviewUrl.startsWith('https://www.google.com/maps'))) {
      return NextResponse.redirect(reviewUrl)
    }

    // Fallback: Danke-Seite wenn kein Review-Link
    return dankeSeite(site?.name || 'das Unternehmen')
  }

  // Nein → Feedback-Formular anzeigen
  if (response === 'nein') {
    await supabase
      .from('review_requests')
      .update({ status: 'unzufrieden' })
      .eq('id', requestId)

    return feedbackSeite(requestId, rr.empfaenger_name)
  }

  return new NextResponse('Ungültige Anfrage', { status: 400 })
}

export async function POST(
  request: Request,
  { params }: { params: { requestId: string } }
) {
  const { requestId } = params

  let body: { feedback?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Ungültiger Body' }, { status: 400 })
  }

  const feedback = (body.feedback || '').trim().replace(/<[^>]*>/g, '').slice(0, 2000)
  if (!feedback) {
    return NextResponse.json({ error: 'Feedback fehlt' }, { status: 400 })
  }

  // Rate limit: max 3 feedback submissions per hour per request
  const { data: existing } = await supabase
    .from('review_requests')
    .select('feedback_text')
    .eq('id', requestId)
    .single()
  if (existing?.feedback_text) {
    return NextResponse.json({ error: 'Feedback wurde bereits gesendet' }, { status: 409 })
  }

  const { error } = await supabase
    .from('review_requests')
    .update({ feedback_text: feedback, status: 'unzufrieden' })
    .eq('id', requestId)

  if (error) {
    return NextResponse.json({ error: 'Speichern fehlgeschlagen' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}

function dankeSeite(firmenName: string) {
  const html = `<!DOCTYPE html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Vielen Dank!</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f9fafb;display:flex;align-items:center;justify-content:center;min-height:100vh;padding:24px}
.card{background:#fff;border-radius:16px;padding:48px 40px;text-align:center;max-width:440px;box-shadow:0 1px 3px rgba(0,0,0,.08)}
h1{font-size:24px;color:#111827;margin-bottom:12px}p{color:#6b7280;font-size:16px;line-height:1.6}
.check{width:64px;height:64px;background:#ecfdf5;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 24px}
.check svg{width:32px;height:32px;color:#059669}</style></head>
<body><div class="card">
<div class="check"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="M22 4 12 14.01l-3-3"/></svg></div>
<h1>Vielen Dank!</h1>
<p>Ihre Bewertung hilft ${firmenName} sehr. Wir wissen das zu schätzen.</p>
</div></body></html>`
  return new NextResponse(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } })
}

function feedbackSeite(requestId: string, name: string | null) {
  const anrede = name ? name.split(' ')[0] : ''
  const html = `<!DOCTYPE html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Ihr Feedback</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f9fafb;display:flex;align-items:center;justify-content:center;min-height:100vh;padding:24px}
.card{background:#fff;border-radius:16px;padding:48px 40px;max-width:480px;width:100%;box-shadow:0 1px 3px rgba(0,0,0,.08)}
h1{font-size:22px;color:#111827;margin-bottom:8px}p{color:#6b7280;font-size:15px;line-height:1.6;margin-bottom:24px}
textarea{width:100%;border:1px solid #e5e7eb;border-radius:8px;padding:14px 16px;font-family:inherit;font-size:15px;min-height:120px;resize:vertical;outline:none;transition:border-color .2s}
textarea:focus{border-color:#2563eb}
button{width:100%;background:#1f2937;color:#fff;border:none;padding:14px;border-radius:8px;font-size:15px;font-weight:600;cursor:pointer;margin-top:16px;transition:background .2s}
button:hover{background:#374151}button:disabled{opacity:.5;cursor:not-allowed}
.done{display:none;text-align:center;padding:24px 0}.done h2{font-size:20px;color:#111827;margin-bottom:8px}.done p{color:#6b7280}
</style></head>
<body><div class="card">
<div id="form">
<h1>Was können wir besser machen?</h1>
<p>${anrede ? anrede + ', w' : 'W'}ir nehmen Ihr Feedback ernst. Ihre Nachricht geht direkt an uns — nicht öffentlich.</p>
<textarea id="fb" placeholder="Was hat Ihnen nicht gefallen? Was hätten Sie sich gewünscht?"></textarea>
<button id="btn" onclick="send()">Feedback absenden</button>
</div>
<div class="done" id="done"><h2>Danke für Ihr Feedback!</h2><p>Wir werden uns darum kümmern.</p></div>
</div>
<script>
async function send(){
  const btn=document.getElementById('btn');
  const fb=document.getElementById('fb').value.trim();
  if(!fb)return;
  btn.disabled=true;btn.textContent='Wird gesendet...';
  try{
    await fetch('/api/public/review/${requestId}',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({feedback:fb})});
  }catch(e){}
  document.getElementById('form').style.display='none';
  document.getElementById('done').style.display='block';
}
</script></body></html>`
  return new NextResponse(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } })
}
