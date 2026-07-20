export const dynamic = 'force-dynamic'

export default function WillkommenPage({
  searchParams,
}: {
  searchParams: { session_id?: string; abgebrochen?: string }
}) {
  const cancelled = searchParams.abgebrochen === '1'

  return (
    <div style={{ minHeight: '100vh', background: '#0f1115', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "system-ui, -apple-system, sans-serif", padding: '24px' }}>
      <div style={{ maxWidth: '520px', width: '100%', background: '#181b22', borderRadius: '16px', padding: '48px 40px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.08)' }}>
        {cancelled ? (
          <>
            <div style={{ fontSize: '40px', marginBottom: '16px' }}>—</div>
            <h1 style={{ color: '#e8e6e1', fontSize: '24px', margin: '0 0 12px' }}>Zahlung abgebrochen</h1>
            <p style={{ color: '#9a968e', fontSize: '15px', lineHeight: 1.6, margin: 0 }}>
              Kein Problem — der Vorgang wurde nicht abgeschlossen. Melden Sie sich bei uns, wenn Sie Fragen haben oder einen neuen Link benötigen.
            </p>
          </>
        ) : (
          <>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(34,197,94,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" width="32" height="32"><polyline points="20 6 9 17 4 12" /></svg>
            </div>
            <h1 style={{ color: '#e8e6e1', fontSize: '24px', margin: '0 0 12px' }}>Willkommen an Bord!</h1>
            <p style={{ color: '#9a968e', fontSize: '15px', lineHeight: 1.6, margin: '0 0 24px' }}>
              Ihre Zahlung war erfolgreich. Wir richten gerade Ihren Zugang ein —
              <strong style={{ color: '#e8e6e1' }}> in wenigen Minuten erhalten Sie eine E-Mail mit Ihren Login-Daten</strong> für Ihr persönliches Website-Dashboard.
            </p>
            <p style={{ color: '#6b675f', fontSize: '13px', lineHeight: 1.6, margin: 0 }}>
              Keine Mail erhalten? Prüfen Sie den Spam-Ordner oder melden Sie sich bei Ihrem Ansprechpartner.
            </p>
          </>
        )}
        <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.08)', color: '#6b675f', fontSize: '12px' }}>
          Webseiten-Verlag Deutschland
        </div>
      </div>
    </div>
  )
}
