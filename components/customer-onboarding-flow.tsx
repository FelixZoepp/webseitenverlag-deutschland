'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Upload, Check, Loader2, Sparkles, ChevronDown, X, Camera, ArrowRight } from 'lucide-react'
import { getImageChecklist } from '@/lib/image-checklist'

interface KundenBild {
  id: string
  slot_id: string | null
  dateiname: string
  public_url: string
  ki_zuordnung: string | null
  ki_confidence: number | null
  manuell_zugeordnet: boolean
  uploaded_at: string
}

interface Props {
  siteId: string
  templateId: string
  customerName: string
  siteName: string
}

type Phase = 'welcome' | 'upload' | 'done'

export default function CustomerOnboardingFlow({ siteId, templateId, customerName, siteName }: Props) {
  const [phase, setPhase] = useState<Phase>('welcome')
  const [bilder, setBilder] = useState<KundenBild[]>([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [completing, setCompleting] = useState(false)
  const slots = getImageChecklist(templateId)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)

  const loadBilder = useCallback(() => {
    setLoading(true)
    fetch(`/api/customer/bilder?siteId=${siteId}`)
      .then(async (r) => {
        if (r.ok) setBilder(await r.json())
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [siteId])

  useEffect(() => { loadBilder() }, [loadBilder])

  async function handleUpload(files: FileList | null) {
    if (!files || files.length === 0) return
    setUploading(true)
    for (const file of Array.from(files)) {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('siteId', siteId)
      formData.append('templateId', templateId)
      await fetch('/api/customer/bilder', { method: 'POST', body: formData })
    }
    setUploading(false)
    setTimeout(loadBilder, 2000)
    loadBilder()
  }

  async function handleSlotChange(bildId: string, slotId: string) {
    await fetch(`/api/customer/bilder/${bildId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slotId: slotId || null }),
    })
    loadBilder()
  }

  async function handleDelete(bildId: string) {
    if (!confirm('Bild löschen?')) return
    await fetch(`/api/customer/bilder/${bildId}`, { method: 'DELETE' })
    loadBilder()
  }

  async function handleComplete() {
    setCompleting(true)
    await fetch(`/api/customer/onboarding-complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ siteId }),
    })
    setCompleting(false)
    setPhase('done')
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    handleUpload(e.dataTransfer.files)
  }

  const requiredSlots = slots.filter((s) => s.required)
  const filledRequired = requiredSlots.filter((s) => bilder.some((b) => b.slot_id === s.id))
  const allRequiredFilled = filledRequired.length === requiredSlots.length
  const canFinish = bilder.length > 0

  const firstName = customerName.split(' ')[0] || customerName

  // ════════════════════════════════════════════
  // PHASE: WILLKOMMEN
  // ════════════════════════════════════════════
  if (phase === 'welcome') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div style={{ maxWidth: '520px', textAlign: 'center' }}>
          <div style={{
            width: '80px', height: '80px', borderRadius: '20px',
            background: 'linear-gradient(135deg, #1E4A82, #C9A24E)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 24px', fontSize: '36px',
          }}>
            👋
          </div>

          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#111827', marginBottom: '12px', lineHeight: 1.2 }}>
            Willkommen, {firstName}!
          </h1>

          <p style={{ fontSize: '16px', color: '#6B7280', lineHeight: 1.7, marginBottom: '32px' }}>
            Wir bauen gerade Ihre Webseite für <strong style={{ color: '#111827' }}>{siteName}</strong>.
            Damit alles perfekt wird, brauchen wir noch Ihre Bilder.
          </p>

          <div style={{
            background: '#F9FAFB', borderRadius: '16px', padding: '24px',
            border: '1px solid #E5E7EB', marginBottom: '32px', textAlign: 'left',
          }}>
            <p style={{ fontSize: '14px', fontWeight: 600, color: '#111827', marginBottom: '12px' }}>
              So funktioniert es:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { num: '1', text: 'Laden Sie Ihre Bilder hoch (Fotos, Logo, etc.)' },
                { num: '2', text: 'Unsere KI ordnet die Bilder automatisch den richtigen Bereichen zu' },
                { num: '3', text: 'Sie bestätigen — wir bauen Ihre Webseite' },
              ].map((s) => (
                <div key={s.num} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '28px', height: '28px', borderRadius: '8px', flexShrink: 0,
                    background: '#1E4A82', color: '#fff', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    fontSize: '13px', fontWeight: 700,
                  }}>{s.num}</div>
                  <span style={{ fontSize: '14px', color: '#374151' }}>{s.text}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => setPhase('upload')}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              background: '#1E4A82', color: '#fff', padding: '14px 32px',
              borderRadius: '10px', border: 'none', fontSize: '15px',
              fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
            }}
          >
            Bilder hochladen <ArrowRight style={{ width: '18px', height: '18px' }} />
          </button>

          <p style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '16px' }}>
            Dauert nur wenige Minuten
          </p>
        </div>
      </div>
    )
  }

  // ════════════════════════════════════════════
  // PHASE: FERTIG
  // ════════════════════════════════════════════
  if (phase === 'done') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div style={{ maxWidth: '480px', textAlign: 'center' }}>
          <div style={{
            width: '80px', height: '80px', borderRadius: '50%',
            background: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 24px',
          }}>
            <Check style={{ width: '40px', height: '40px', color: '#16A34A' }} />
          </div>

          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#111827', marginBottom: '12px' }}>
            Vielen Dank!
          </h1>

          <p style={{ fontSize: '16px', color: '#6B7280', lineHeight: 1.7, marginBottom: '24px' }}>
            Ihre Bilder sind eingegangen. Wir bauen jetzt Ihre Webseite und melden uns,
            sobald sie fertig ist.
          </p>

          <div style={{
            background: '#FBF9F4', borderRadius: '12px', padding: '20px',
            border: '1px solid #E5DCC3', marginBottom: '24px',
          }}>
            <p style={{ fontSize: '14px', color: '#92400E', fontWeight: 500 }}>
              {bilder.length} Bilder hochgeladen
            </p>
            <p style={{ fontSize: '13px', color: '#A18249', marginTop: '4px' }}>
              Sie erhalten eine E-Mail, sobald Ihre Webseite live ist.
            </p>
          </div>

          <p style={{ fontSize: '12px', color: '#9CA3AF' }}>
            Fragen? <a href="mailto:support@webseitenverlag.de" style={{ color: '#1E4A82' }}>support@webseitenverlag.de</a>
          </p>
        </div>
      </div>
    )
  }

  // ════════════════════════════════════════════
  // PHASE: UPLOAD
  // ════════════════════════════════════════════
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '32px 24px' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <p style={{ fontSize: '13px', color: '#1E4A82', fontWeight: 600, marginBottom: '4px' }}>
          Schritt 2 von 3
        </p>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#111827', marginBottom: '6px' }}>
          Bilder für {siteName}
        </h1>
        <p style={{ fontSize: '14px', color: '#6B7280' }}>
          Laden Sie Ihre Bilder hoch — unsere KI ordnet sie automatisch zu.
        </p>
      </div>

      {/* Fortschritt */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '12px',
        padding: '16px 20px', background: allRequiredFilled ? '#F0FDF4' : '#FBF9F4',
        borderRadius: '12px', border: `1px solid ${allRequiredFilled ? '#BBF7D0' : '#E5DCC3'}`,
        marginBottom: '24px',
      }}>
        <div style={{
          width: '40px', height: '40px', borderRadius: '10px', flexShrink: 0,
          background: allRequiredFilled ? '#DCFCE7' : '#FEF3C7',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {allRequiredFilled
            ? <Check style={{ width: '20px', height: '20px', color: '#16A34A' }} />
            : <Camera style={{ width: '20px', height: '20px', color: '#D97706' }} />}
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>
            {allRequiredFilled
              ? 'Alle Pflicht-Bilder vorhanden!'
              : `Noch ${requiredSlots.length - filledRequired.length} Pflicht-Bild(er) fehlen`}
          </p>
          <p style={{ fontSize: '12px', color: '#6B7280' }}>
            {bilder.length} von {slots.length} Bildern hochgeladen
          </p>
        </div>
        {canFinish && (
          <button
            onClick={handleComplete}
            disabled={completing}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              background: '#16A34A', color: '#fff', padding: '10px 20px',
              borderRadius: '8px', border: 'none', fontSize: '13px',
              fontWeight: 600, cursor: 'pointer',
            }}
          >
            {completing
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Wird gespeichert...</>
              : <><Check style={{ width: '16px', height: '16px' }} /> Fertig — Webseite bauen!</>}
          </button>
        )}
      </div>

      {/* Upload Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        style={{
          border: `2px dashed ${dragOver ? '#1E4A82' : '#D1D5DB'}`,
          borderRadius: '16px', padding: '40px', textAlign: 'center',
          cursor: 'pointer', marginBottom: '28px', transition: 'all 200ms',
          background: dragOver ? '#EFF6FF' : '#FAFAFA',
        }}
      >
        {uploading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <Loader2 className="w-5 h-5 animate-spin" style={{ color: '#1E4A82' }} />
            <span style={{ color: '#1E4A82', fontSize: '14px', fontWeight: 500 }}>Wird hochgeladen & analysiert...</span>
          </div>
        ) : (
          <>
            <Upload style={{ width: '36px', height: '36px', color: '#9CA3AF', margin: '0 auto 12px' }} />
            <p style={{ fontSize: '15px', fontWeight: 600, color: '#374151' }}>
              Bilder hierher ziehen oder klicken
            </p>
            <p style={{ fontSize: '13px', color: '#9CA3AF', marginTop: '6px' }}>
              JPG, PNG, WebP — max. 10 MB pro Bild
            </p>
          </>
        )}
        <input
          ref={fileInputRef} type="file" accept="image/*" multiple
          onChange={(e) => handleUpload(e.target.files)}
          style={{ display: 'none' }}
        />
      </div>

      {/* Checkliste */}
      <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', marginBottom: '14px' }}>
        Was wir brauchen
      </h2>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Loader2 className="w-5 h-5 animate-spin" style={{ color: '#9CA3AF', margin: '0 auto' }} />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '32px' }}>
          {slots.map((slot) => {
            const zugeordnetesBild = bilder.find((b) => b.slot_id === slot.id)
            const filled = !!zugeordnetesBild

            return (
              <div key={slot.id} style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '14px 16px', borderRadius: '12px',
                border: `1px solid ${filled ? '#BBF7D0' : '#E5E7EB'}`,
                background: filled ? '#F0FDF4' : '#FFFFFF',
                transition: 'all 0.2s',
              }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '8px', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: filled ? '#DCFCE7' : '#F3F4F6',
                }}>
                  {filled
                    ? <Check style={{ width: '16px', height: '16px', color: '#16A34A' }} />
                    : <Camera style={{ width: '16px', height: '16px', color: '#9CA3AF' }} />}
                </div>

                {zugeordnetesBild && (
                  <img src={zugeordnetesBild.public_url} alt={slot.label}
                    style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }} />
                )}

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>{slot.label}</span>
                    {slot.required && (
                      <span style={{ fontSize: '10px', background: '#FEF3C7', color: '#92400E', padding: '2px 8px', borderRadius: '999px', fontWeight: 600 }}>Pflicht</span>
                    )}
                    {zugeordnetesBild && !zugeordnetesBild.manuell_zugeordnet && zugeordnetesBild.ki_confidence ? (
                      <span style={{ fontSize: '10px', background: '#EDE9FE', color: '#6D28D9', padding: '2px 8px', borderRadius: '999px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <Sparkles style={{ width: '10px', height: '10px' }} /> KI {Math.round(zugeordnetesBild.ki_confidence * 100)}%
                      </span>
                    ) : null}
                  </div>
                  <p style={{ fontSize: '12px', color: '#6B7280', marginTop: '2px' }}>{slot.description}</p>
                </div>

                {zugeordnetesBild && (
                  <button onClick={() => handleDelete(zugeordnetesBild.id)} style={{
                    background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#EF4444', opacity: 0.5,
                  }}>
                    <X style={{ width: '16px', height: '16px' }} />
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Nicht zugeordnete Bilder */}
      {bilder.filter((b) => !b.slot_id || !slots.find((s) => s.id === b.slot_id)).length > 0 && (
        <>
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', marginBottom: '14px' }}>
            Noch nicht zugeordnet
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '12px', marginBottom: '32px' }}>
            {bilder
              .filter((b) => !b.slot_id || !slots.find((s) => s.id === b.slot_id))
              .map((bild) => (
                <div key={bild.id} style={{ borderRadius: '12px', border: '1px solid #E5E7EB', overflow: 'hidden', background: '#FFF' }}>
                  <img src={bild.public_url} alt={bild.dateiname} style={{ width: '100%', height: '120px', objectFit: 'cover' }} />
                  <div style={{ padding: '10px' }}>
                    <p style={{ fontSize: '11px', color: '#6B7280', marginBottom: '8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{bild.dateiname}</p>
                    <div style={{ position: 'relative' }}>
                      <select
                        value={bild.slot_id || ''}
                        onChange={(e) => handleSlotChange(bild.id, e.target.value)}
                        style={{ width: '100%', fontSize: '12px', padding: '6px 24px 6px 8px', border: '1px solid #D1D5DB', borderRadius: '8px', background: '#FFF', appearance: 'none', cursor: 'pointer' }}
                      >
                        <option value="">Zuordnen...</option>
                        {slots.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
                      </select>
                      <ChevronDown style={{ position: 'absolute', right: '6px', top: '50%', transform: 'translateY(-50%)', width: '14px', height: '14px', color: '#9CA3AF', pointerEvents: 'none' }} />
                    </div>
                    <button onClick={() => handleDelete(bild.id)} style={{
                      marginTop: '8px', width: '100%', fontSize: '11px', color: '#EF4444',
                      background: 'none', border: '1px solid #FCA5A5', borderRadius: '8px',
                      padding: '4px 0', cursor: 'pointer',
                    }}>Löschen</button>
                  </div>
                </div>
              ))}
          </div>
        </>
      )}

      {/* Footer mit Fertig-Button */}
      <div style={{
        position: 'sticky', bottom: '0', padding: '16px 0', background: 'linear-gradient(to top, #fff 60%, transparent)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <p style={{ fontSize: '13px', color: '#6B7280' }}>
          {bilder.length} Bilder hochgeladen
        </p>
        <button
          onClick={handleComplete}
          disabled={!canFinish || completing}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            background: canFinish ? '#16A34A' : '#D1D5DB',
            color: '#fff', padding: '12px 24px',
            borderRadius: '10px', border: 'none', fontSize: '14px',
            fontWeight: 600, cursor: canFinish ? 'pointer' : 'not-allowed',
            opacity: canFinish ? 1 : 0.6,
          }}
        >
          {completing
            ? <><Loader2 className="w-4 h-4 animate-spin" /> Speichern...</>
            : canFinish
              ? <><Check style={{ width: '16px', height: '16px' }} /> Fertig — Webseite bauen!</>
              : 'Bitte mindestens 1 Bild hochladen'}
        </button>
      </div>
    </div>
  )
}
