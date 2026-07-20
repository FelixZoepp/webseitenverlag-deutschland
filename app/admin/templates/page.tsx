'use client'

import { useState } from 'react'
import { Eye, X, Maximize2, Search } from 'lucide-react'
import { TEMPLATE_CATALOG, CATALOG_INDUSTRIES } from '@/lib/template-catalog'

const TEMPLATES = TEMPLATE_CATALOG
const INDUSTRIES = CATALOG_INDUSTRIES

export default function TemplatesPage() {
  const [preview, setPreview] = useState<string | null>(null)
  const [fullscreen, setFullscreen] = useState(false)
  const [filter, setFilter] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  const filtered = TEMPLATES.filter((t) => {
    if (filter && t.industry !== filter) return false
    if (search && !t.name.toLowerCase().includes(search.toLowerCase()) && !t.desc.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const premiumCount = TEMPLATES.length
  const previewTemplate = TEMPLATES.find((t) => t.id === preview)

  return (
    <>
      {/* Topbar */}
      <div className="topbar fade-up">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
          <span className="tb-eyebrow">Bibliothek</span>
          <span className="tb-heading">Templates</span>
        </div>
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: '12px', color: 'var(--za-fg-3)' }}>{premiumCount} Templates</span>
      </div>

      {/* Filter + Search */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
        <button onClick={() => setFilter(null)}
          style={{ padding: '6px 14px', borderRadius: '8px', fontSize: '11px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', border: '1px solid', letterSpacing: '0.08em', textTransform: 'uppercase', background: !filter ? 'var(--za-gold-grad)' : 'rgba(255,255,255,0.6)', color: !filter ? '#fff' : 'var(--za-fg-3)', borderColor: !filter ? 'transparent' : 'var(--za-border)' }}>
          Alle ({TEMPLATES.length})
        </button>
        {INDUSTRIES.map((ind) => {
          const count = TEMPLATES.filter((t) => t.industry === ind).length
          return (
            <button key={ind} onClick={() => setFilter(filter === ind ? null : ind)}
              style={{ padding: '6px 14px', borderRadius: '8px', fontSize: '11px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', border: '1px solid', letterSpacing: '0.08em', textTransform: 'uppercase', background: filter === ind ? 'var(--za-gold-grad)' : 'rgba(255,255,255,0.6)', color: filter === ind ? '#fff' : 'var(--za-fg-3)', borderColor: filter === ind ? 'transparent' : 'var(--za-border)' }}>
              {ind} ({count})
            </button>
          )
        })}
        <div style={{ flex: 1 }} />
        <div style={{ position: 'relative' }}>
          <Search style={{ position: 'absolute', left: '10px', top: '8px', width: '14px', height: '14px', color: 'var(--za-fg-4)' }} />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Suchen..."
            style={{ paddingLeft: '32px', padding: '7px 12px 7px 32px', fontSize: '12px', border: '1px solid var(--za-border)', borderRadius: '8px', background: 'rgba(255,255,255,0.6)', fontFamily: 'inherit', outline: 'none', width: '180px' }} />
        </div>
      </div>

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {filtered.map((t, i) => (
          <div key={t.id} className="panel fade-up" style={{ animationDelay: `${Math.min(i * 40, 400)}ms`, padding: 0, overflow: 'hidden' }}>
            {/* Color thumbnail (no iframe) */}
            <div onClick={() => setPreview(t.id)} style={{ height: '140px', position: 'relative', borderBottom: '1px solid var(--za-border)', cursor: 'pointer', background: `linear-gradient(135deg, ${t.color} 0%, ${t.color}cc 50%, ${t.color}88 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontFamily: 'var(--za-font-display)', fontSize: '28px', fontWeight: 700, color: ('dark' in t && t.dark) ? '#fff' : 'rgba(255,255,255,0.9)', letterSpacing: '-0.02em', textShadow: '0 2px 12px rgba(0,0,0,0.3)' }}>
                {t.name.split('—')[0].trim().split(' ')[0]}
              </span>
              <div style={{ position: 'absolute', bottom: '10px', right: '10px', fontSize: '10px', padding: '3px 10px', borderRadius: '999px', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)', color: '#fff', fontWeight: 500 }}>
                Vorschau →
              </div>
            </div>

            {/* Info */}
            <div style={{ padding: '16px 18px', position: 'relative', zIndex: 2 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span className="panel-title" style={{ fontSize: '13px' }}>{t.name}</span>
              </div>
              <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
                <span style={{ fontSize: '9px', padding: '2px 8px', borderRadius: '999px', background: 'rgba(224,53,75,0.10)', color: 'var(--za-gold)', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{t.industry}</span>
              </div>
              <p style={{ fontSize: '11px', color: 'var(--za-fg-3)', marginBottom: '12px', lineHeight: 1.5 }}>{t.desc}</p>
              <button onClick={() => setPreview(t.id)}
                style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 14px', background: 'var(--za-gold-grad)', color: '#fff', border: 'none', borderRadius: '7px', fontSize: '10px', fontWeight: 600, cursor: 'pointer', letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'inherit', boxShadow: '0 3px 10px -3px rgba(224,53,75,0.45)' }}>
                <Eye style={{ width: '12px', height: '12px' }} /> Vorschau
              </button>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--za-fg-4)', fontSize: '13px' }}>Keine Templates gefunden.</div>
      )}

      {/* Preview Modal */}
      {preview && previewTemplate && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(23,24,26,0.5)', backdropFilter: 'blur(8px)', zIndex: 200, display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '12px 20px', background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(18px)', borderBottom: '1px solid var(--za-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span className="panel-title">{previewTemplate.name}</span>
              <span style={{ fontSize: '10px', padding: '3px 10px', borderRadius: '999px', background: 'rgba(224,53,75,0.10)', color: 'var(--za-gold)', fontWeight: 600 }}>{previewTemplate.industry}</span>
              <code style={{ fontSize: '10px', color: 'var(--za-fg-4)', background: 'rgba(0,0,0,0.05)', padding: '2px 8px', borderRadius: '4px' }}>{previewTemplate.id}</code>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button onClick={() => setFullscreen(!fullscreen)}
                style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', background: 'rgba(255,255,255,0.65)', border: '1px solid var(--za-border)', borderRadius: '8px', fontSize: '11px', cursor: 'pointer', color: 'var(--za-fg-2)', fontFamily: 'inherit' }}>
                <Maximize2 style={{ width: '12px', height: '12px' }} /> {fullscreen ? 'Normal' : 'Fullscreen'}
              </button>
              <button onClick={() => { setPreview(null); setFullscreen(false) }}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', background: 'rgba(255,255,255,0.65)', border: '1px solid var(--za-border)', borderRadius: '8px', cursor: 'pointer', color: 'var(--za-fg-2)' }}>
                <X style={{ width: '16px', height: '16px' }} />
              </button>
            </div>
          </div>
          <div style={{ flex: 1, padding: fullscreen ? 0 : '20px', display: 'flex', justifyContent: 'center' }}>
            <div style={{ width: fullscreen ? '100%' : '90%', maxWidth: fullscreen ? 'none' : '1400px', height: '100%', borderRadius: fullscreen ? 0 : '12px', overflow: 'hidden', boxShadow: fullscreen ? 'none' : '0 16px 48px rgba(0,0,0,.2)', border: fullscreen ? 'none' : '1px solid var(--za-border)' }}>
              <iframe
                src={`/api/templates/preview?id=${preview}&name=Musterfirma+GmbH`}
                style={{ width: '100%', height: '100%', border: 0 }}
                title="Template Preview"
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
