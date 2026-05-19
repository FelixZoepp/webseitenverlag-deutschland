'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams } from 'next/navigation'
import { Upload, Image as ImageIcon, Check, X, Loader2, Sparkles, ChevronDown } from 'lucide-react'
import { getImageChecklist, type ImageSlot } from '@/lib/image-checklist'

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

export default function BilderPage() {
  const params = useParams()
  const siteId = params.siteId as string
  const [bilder, setBilder] = useState<KundenBild[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [templateId, setTemplateId] = useState<string | null>(null)
  const [slots, setSlots] = useState<ImageSlot[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)

  // Site-Info laden um Template zu kennen
  useEffect(() => {
    fetch(`/api/sites/${siteId}`)
      .then(async (r) => {
        if (r.ok) {
          const site = await r.json()
          const tid = site.template_id || 'business-basic'
          setTemplateId(tid)
          setSlots(getImageChecklist(tid))
        }
      })
      .catch(() => {})
  }, [siteId])

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
      if (templateId) formData.append('templateId', templateId)

      await fetch('/api/customer/bilder', { method: 'POST', body: formData })
    }

    setUploading(false)
    // Kurz warten damit KI-Zuordnung greifen kann
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

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    handleUpload(e.dataTransfer.files)
  }

  // Status berechnen
  const requiredSlots = slots.filter((s) => s.required)
  const filledRequired = requiredSlots.filter((s) => bilder.some((b) => b.slot_id === s.id))
  const totalFilled = slots.filter((s) => bilder.some((b) => b.slot_id === s.id))

  return (
    <div style={{ padding: '24px 32px', maxWidth: '900px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#111827', marginBottom: '4px' }}>
          Bilder für Ihre Webseite
        </h1>
        <p style={{ fontSize: '14px', color: '#6B7280' }}>
          Laden Sie Ihre Bilder hoch — unsere KI ordnet sie automatisch den richtigen Bereichen zu.
        </p>
      </div>

      {/* Status-Bar */}
      <div style={{
        display: 'flex', gap: '16px', marginBottom: '24px',
        padding: '16px', background: '#F9FAFB', borderRadius: '12px', border: '1px solid #E5E7EB',
      }}>
        <StatusBadge label="Pflicht-Bilder" current={filledRequired.length} total={requiredSlots.length} color={filledRequired.length === requiredSlots.length ? '#10B981' : '#F59E0B'} />
        <StatusBadge label="Gesamt zugeordnet" current={totalFilled.length} total={slots.length} color="#3B82F6" />
        <StatusBadge label="Hochgeladen" current={bilder.length} total={bilder.length} color="#8B5CF6" />
      </div>

      {/* Upload Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        style={{
          border: `2px dashed ${dragOver ? '#3B82F6' : '#D1D5DB'}`,
          borderRadius: '12px', padding: '40px', textAlign: 'center',
          cursor: 'pointer', marginBottom: '24px', transition: 'all 200ms',
          background: dragOver ? '#EFF6FF' : '#FAFAFA',
        }}
      >
        {uploading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <Loader2 className="w-5 h-5 animate-spin" style={{ color: '#3B82F6' }} />
            <span style={{ color: '#3B82F6', fontSize: '14px', fontWeight: 500 }}>Wird hochgeladen...</span>
          </div>
        ) : (
          <>
            <Upload style={{ width: '32px', height: '32px', color: '#9CA3AF', margin: '0 auto 12px' }} />
            <p style={{ fontSize: '14px', fontWeight: 500, color: '#374151' }}>
              Bilder hierher ziehen oder klicken zum Auswählen
            </p>
            <p style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '4px' }}>
              JPG, PNG, WebP — max. 10 MB pro Bild
            </p>
          </>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => handleUpload(e.target.files)}
          style={{ display: 'none' }}
        />
      </div>

      {/* Checkliste */}
      <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#111827', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <ImageIcon style={{ width: '18px', height: '18px' }} />
        Bild-Checkliste
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
                padding: '12px 16px', borderRadius: '10px', border: '1px solid #E5E7EB',
                background: filled ? '#F0FDF4' : '#FFFFFF',
              }}>
                {/* Status Icon */}
                <div style={{
                  width: '28px', height: '28px', borderRadius: '8px', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: filled ? '#DCFCE7' : '#F3F4F6',
                }}>
                  {filled ? <Check style={{ width: '14px', height: '14px', color: '#16A34A' }} /> : <ImageIcon style={{ width: '14px', height: '14px', color: '#9CA3AF' }} />}
                </div>

                {/* Thumbnail */}
                {zugeordnetesBild && (
                  <img
                    src={zugeordnetesBild.public_url}
                    alt={slot.label}
                    style={{ width: '44px', height: '44px', borderRadius: '6px', objectFit: 'cover', flexShrink: 0 }}
                  />
                )}

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#111827' }}>{slot.label}</span>
                    {slot.required && <span style={{ fontSize: '10px', background: '#FEF3C7', color: '#92400E', padding: '1px 6px', borderRadius: '999px', fontWeight: 600 }}>Pflicht</span>}
                    {zugeordnetesBild && !zugeordnetesBild.manuell_zugeordnet && zugeordnetesBild.ki_confidence && (
                      <span style={{ fontSize: '10px', background: '#EDE9FE', color: '#6D28D9', padding: '1px 6px', borderRadius: '999px', display: 'flex', alignItems: 'center', gap: '2px' }}>
                        <Sparkles style={{ width: '10px', height: '10px' }} /> KI {Math.round(zugeordnetesBild.ki_confidence * 100)}%
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: '11px', color: '#6B7280', marginTop: '2px' }}>{slot.description}</p>
                  {slot.aspectRatio && <p style={{ fontSize: '10px', color: '#9CA3AF', marginTop: '1px' }}>Format: {slot.aspectRatio}</p>}
                </div>

                {/* Actions */}
                {zugeordnetesBild && (
                  <button onClick={() => handleDelete(zugeordnetesBild.id)} style={{
                    background: 'none', border: 'none', cursor: 'pointer', padding: '4px',
                    color: '#EF4444', opacity: 0.6,
                  }}>
                    <X style={{ width: '14px', height: '14px' }} />
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
          <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#111827', marginBottom: '12px' }}>
            Nicht zugeordnete Bilder
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '12px', marginBottom: '32px' }}>
            {bilder
              .filter((b) => !b.slot_id || !slots.find((s) => s.id === b.slot_id))
              .map((bild) => (
                <div key={bild.id} style={{
                  borderRadius: '10px', border: '1px solid #E5E7EB', overflow: 'hidden', background: '#FFF',
                }}>
                  <img src={bild.public_url} alt={bild.dateiname} style={{ width: '100%', height: '120px', objectFit: 'cover' }} />
                  <div style={{ padding: '8px' }}>
                    <p style={{ fontSize: '11px', color: '#6B7280', marginBottom: '6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{bild.dateiname}</p>
                    <div style={{ position: 'relative' }}>
                      <select
                        value={bild.slot_id || ''}
                        onChange={(e) => handleSlotChange(bild.id, e.target.value)}
                        style={{
                          width: '100%', fontSize: '11px', padding: '4px 20px 4px 6px', border: '1px solid #D1D5DB',
                          borderRadius: '6px', background: '#FFF', appearance: 'none', cursor: 'pointer',
                        }}
                      >
                        <option value="">— Zuordnen —</option>
                        {slots.map((s) => (
                          <option key={s.id} value={s.id}>{s.label}</option>
                        ))}
                      </select>
                      <ChevronDown style={{ position: 'absolute', right: '4px', top: '50%', transform: 'translateY(-50%)', width: '12px', height: '12px', color: '#9CA3AF', pointerEvents: 'none' }} />
                    </div>
                    <button onClick={() => handleDelete(bild.id)} style={{
                      marginTop: '6px', width: '100%', fontSize: '10px', color: '#EF4444',
                      background: 'none', border: '1px solid #FCA5A5', borderRadius: '6px',
                      padding: '3px 0', cursor: 'pointer',
                    }}>
                      Löschen
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </>
      )}
    </div>
  )
}

function StatusBadge({ label, current, total, color }: { label: string; current: number; total: number; color: string }) {
  return (
    <div style={{ flex: 1, textAlign: 'center' }}>
      <div style={{ fontSize: '20px', fontWeight: 700, color }}>{current}<span style={{ fontSize: '14px', fontWeight: 400, color: '#9CA3AF' }}>/{total}</span></div>
      <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '2px' }}>{label}</div>
    </div>
  )
}
