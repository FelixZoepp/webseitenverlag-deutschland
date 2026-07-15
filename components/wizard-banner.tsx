import Link from 'next/link'

/** Hinweis-Banner (§10.1): sichtbar bis "Website fertigstellen" erledigt ist — blockiert nichts. */
export default function WizardBanner({
  siteId,
  bearbeitet,
  gesamt,
}: {
  siteId: string
  bearbeitet: number
  gesamt: number
}) {
  return (
    <div
      style={{
        padding: '10px 24px',
        background: 'linear-gradient(90deg, #EFF6FF, #DBEAFE)',
        borderBottom: '1px solid #BFDBFE',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
      }}
    >
      <span style={{ fontSize: '13px', color: '#1E3A8A' }}>
        Noch {gesamt - bearbeitet > 0 ? `${gesamt - bearbeitet} Schritte` : 'ein Klick'} bis Ihre Website final ist
        (Impressum, Fakten-Check &amp; Freigabe für Google).
      </span>
      <Link
        href={`/dashboard/${siteId}/fertigstellen`}
        style={{
          padding: '6px 16px',
          borderRadius: '6px',
          fontSize: '12px',
          fontWeight: 600,
          background: '#2563EB',
          color: '#fff',
          textDecoration: 'none',
          whiteSpace: 'nowrap',
        }}
      >
        Jetzt fertigstellen
      </Link>
    </div>
  )
}
