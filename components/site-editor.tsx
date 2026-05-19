'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Site, ChatMessage, SiteConfig, ConfigVersion, PageMeta, isMultiPageConfig } from '@/types'
import { MessageSquare, Settings, History, Send, Loader2, Upload, RotateCcw, Eye, AlertCircle, Check, FileText, Home, Info, Briefcase, Phone, Scale, Plus, MoreVertical, Trash2, Globe, Palette, Zap, Clock } from 'lucide-react'
import { configsEqual } from '@/lib/config-utils'

type Tab = 'chat' | 'manual' | 'history'

const PAGE_ICONS: Record<string, React.ReactNode> = {
  home: <Home className="w-4 h-4" />, about: <Info className="w-4 h-4" />,
  services: <Briefcase className="w-4 h-4" />, contact: <Phone className="w-4 h-4" />,
  'legal-imprint': <Scale className="w-4 h-4" />, 'legal-privacy': <Scale className="w-4 h-4" />,
  _global: <Globe className="w-4 h-4" />,
}

export default function SiteEditor({ site: initialSite, messages: initialMessages, versions: initialVersions }: {
  site: Site; messages: ChatMessage[]; versions: ConfigVersion[]
}) {
  const [site, setSite] = useState(initialSite)
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages)
  const [versions] = useState<ConfigVersion[]>(initialVersions)
  const [activeTab, setActiveTab] = useState<Tab>('chat')
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [deploying, setDeploying] = useState(false)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [previewKey, setPreviewKey] = useState(0)
  const [currentPage, setCurrentPage] = useState('home')
  const [showAddPage, setShowAddPage] = useState(false)
  const [pageMenu, setPageMenu] = useState<string | null>(null)
  const [pendingUpsell, setPendingUpsell] = useState<{ upsellId: string } | null>(null)
  const [upsellResponding, setUpsellResponding] = useState(false)
  const [fullscreenPreview, setFullscreenPreview] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const config = (site.draft_config || site.config) as SiteConfig
  const isMultiPage = isMultiPageConfig(config)
  const hasUnsavedChanges = !configsEqual(site.config, site.draft_config)

  const pages: PageMeta[] = isMultiPage
    ? Object.entries(config.pages).map(([key, p]) => ({ pageKey: key, template: p.template, slug: p.slug, title: p.title }))
    : [{ pageKey: 'home', template: 'home', slug: '', title: 'Startseite' }]

  const isLegalPage = currentPage.startsWith('legal-')
  const isGlobalSettings = currentPage === '_global'

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])
  useEffect(() => { if (toast) { const t = setTimeout(() => setToast(null), 4000); return () => clearTimeout(t) } }, [toast])

  const refreshPreview = useCallback(() => setPreviewKey((k) => k + 1), [])

  const autoSave = useCallback((newDraftConfig: SiteConfig) => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
    saveTimeoutRef.current = setTimeout(async () => {
      await fetch(`/api/sites/${site.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ draft_config: newDraftConfig }) })
    }, 1000)
  }, [site.id])

  function updateConfig(changes: Partial<SiteConfig>) {
    const nc = { ...config, ...changes }
    setSite((p) => ({ ...p, draft_config: nc as SiteConfig }))
    autoSave(nc as SiteConfig)
    refreshPreview()
  }

  function handlePageSwitch(pk: string) { setCurrentPage(pk); setPageMenu(null); refreshPreview() }

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim() || sending) return
    const msg = input.trim(); setInput(''); setSending(true)
    setMessages((p) => [...p, { id: crypto.randomUUID(), site_id: site.id, role: 'user', content: msg, config_changes: null, created_at: new Date().toISOString() }])
    try {
      const res = await fetch(`/api/sites/${site.id}/chat`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: msg, currentPage: isGlobalSettings ? 'home' : currentPage }) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setMessages((p) => [...p, { id: crypto.randomUUID(), site_id: site.id, role: 'assistant', content: data.response, config_changes: data.configChanges, created_at: new Date().toISOString() }])
      if (data.upsellSuggestion?.upsellId) {
        setPendingUpsell({ upsellId: data.upsellSuggestion.upsellId })
      }
      if (data.configChanges) {
        const sr = await fetch(`/api/sites/${site.id}`); if (sr.ok) { const u = await sr.json(); setSite((p) => ({ ...p, draft_config: u.draft_config })) }
        refreshPreview()
      }
    } catch (err: unknown) {
      setMessages((p) => [...p, { id: crypto.randomUUID(), site_id: site.id, role: 'assistant', content: `Fehler: ${err instanceof Error ? err.message : 'Unbekannt'}`, config_changes: null, created_at: new Date().toISOString() }])
    } finally { setSending(false) }
  }

  async function handleUpsellResponse(action: 'accept' | 'reject' | 'later') {
    if (!pendingUpsell) return
    if (action === 'accept') {
      // Redirect to checkout page
      window.location.href = `/dashboard/${site.id}/upgrade?upsell=${pendingUpsell.upsellId}`
      return
    }
    setUpsellResponding(true)
    try {
      await fetch(`/api/sites/${site.id}/upsell-response`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ upsellId: pendingUpsell.upsellId, action }),
      })
      if (action === 'later') {
        setMessages((p) => [...p, { id: crypto.randomUUID(), site_id: site.id, role: 'assistant', content: 'Kein Problem — ich merke mir das und erinnere Sie bei Gelegenheit daran.', config_changes: null, created_at: new Date().toISOString() }])
      }
    } catch { /* ignore */ }
    finally { setPendingUpsell(null); setUpsellResponding(false) }
  }

  async function handlePublish() {
    setDeploying(true); setToast(null)
    try {
      const res = await fetch(`/api/sites/${site.id}/publish`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setSite((p) => ({ ...p, config: p.draft_config, status: 'published' }))
      setToast({ type: 'success', message: `Live unter: ${data.url}` })
    } catch (err: unknown) { setToast({ type: 'error', message: err instanceof Error ? err.message : 'Fehler' }) }
    finally { setDeploying(false) }
  }

  async function handleRollback(vid: string) {
    try {
      const res = await fetch(`/api/sites/${site.id}/rollback`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ version_id: vid }) })
      const data = await res.json(); if (!res.ok) throw new Error(data.error)
      setSite((p) => ({ ...p, config: data.config, draft_config: data.config })); refreshPreview()
      setToast({ type: 'success', message: 'Rollback erfolgreich' })
    } catch (err: unknown) { setToast({ type: 'error', message: err instanceof Error ? err.message : 'Fehler' }) }
  }

  async function handleDeletePage(pk: string) {
    if (!confirm('Seite wirklich löschen?')) return
    await fetch(`/api/sites/${site.id}/pages/${pk}`, { method: 'DELETE' })
    const sr = await fetch(`/api/sites/${site.id}`); if (sr.ok) { const u = await sr.json(); setSite((p) => ({ ...p, draft_config: u.draft_config })) }
    if (currentPage === pk) setCurrentPage('home'); setPageMenu(null); refreshPreview()
  }

  async function handleAddPage(template: string, title: string, slug: string) {
    const pk = slug.replace(/[^a-z0-9-]/g, '') || template
    const res = await fetch(`/api/sites/${site.id}/pages`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ pageKey: pk, template, slug, title }) })
    if (!res.ok) { const d = await res.json(); setToast({ type: 'error', message: d.error }); return }
    const sr = await fetch(`/api/sites/${site.id}`); if (sr.ok) { const u = await sr.json(); setSite((p) => ({ ...p, draft_config: u.draft_config })) }
    setShowAddPage(false); setCurrentPage(pk); refreshPreview()
  }

  const currentPageTitle = isGlobalSettings ? 'Globale Einstellungen' : pages.find((p) => p.pageKey === currentPage)?.title || currentPage
  const navPages = pages.filter((p) => !p.pageKey.startsWith('legal-'))
  const legalPages = pages.filter((p) => p.pageKey.startsWith('legal-'))

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header — compact, Sidebar handles main nav */}
      <header style={{ padding: '0 20px', height: '46px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, borderBottom: '1px solid var(--za-border)', background: 'rgba(255,255,255,0.4)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--za-fg)' }}>Editor</span>
          {isMultiPage && <span className="glass-badge" style={{ fontSize: '8px' }}>Multi-Page</span>}
          {hasUnsavedChanges && <span style={{ fontSize: '10px', color: '#B25E10', fontWeight: 500 }}>Nicht veröffentlicht</span>}
        </div>
        <button onClick={handlePublish} disabled={deploying} className="glass-btn" style={{ padding: '6px 14px', fontSize: '10px', display: 'flex', alignItems: 'center', gap: '5px' }}>
          {deploying ? <><Loader2 className="w-3 h-3 animate-spin" /> Deploying...</> : <><Upload className="w-3 h-3" /> Veröffentlichen</>}
        </button>
      </header>


      {/* Toast */}
      {toast && (
        <div className={`glass-toast ${toast.type}`}>
          {toast.type === 'success' ? <Check className="w-4 h-4" style={{ color: 'var(--za-success)' }} /> : <AlertCircle className="w-4 h-4" style={{ color: 'var(--za-danger)' }} />}
          {toast.message}
        </div>
      )}

      <div className="editor-main-layout" style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* LEFT: Page Nav */}
        {isMultiPage && (
          <div className="glass-sidebar editor-page-nav" style={{ width: '190px', flexShrink: 0, overflowY: 'auto', padding: '12px 8px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '4px 12px 10px' }}>
              <span style={{ fontWeight: 700, fontSize: '9px', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--za-fg-4)' }}>Seiten</span>
            </div>
            {navPages.map((p) => (
              <div key={p.pageKey} style={{ position: 'relative' }} className="group">
                <button onClick={() => handlePageSwitch(p.pageKey)}
                  className={`glass-nav-item ${currentPage === p.pageKey ? 'active' : ''}`}
                  style={{ width: '100%', textAlign: 'left', cursor: 'pointer', background: currentPage === p.pageKey ? 'linear-gradient(135deg, rgba(42,111,219,0.14), rgba(11,36,79,0.06))' : 'transparent', borderColor: currentPage === p.pageKey ? 'rgba(42,111,219,0.28)' : 'transparent', color: currentPage === p.pageKey ? 'var(--za-gold-2)' : 'var(--za-fg-2)' }}>
                  {PAGE_ICONS[p.template] || <FileText className="w-4 h-4" />}
                  <span style={{ fontSize: '12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</span>
                </button>
                {p.pageKey !== 'home' && pageMenu === p.pageKey && (
                  <div style={{ position: 'absolute', right: '8px', top: '36px', background: '#fff', border: '1px solid var(--za-border)', borderRadius: '8px', boxShadow: '0 8px 24px rgba(15,30,60,0.12)', zIndex: 10, padding: '4px' }}>
                    <button onClick={() => handleDeletePage(p.pageKey)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 10px', fontSize: '11px', color: 'var(--za-danger)', background: 'none', border: 'none', cursor: 'pointer', borderRadius: '4px', width: '100%' }}>
                      <Trash2 className="w-3 h-3" /> Löschen
                    </button>
                  </div>
                )}
                {p.pageKey !== 'home' && (
                  <button onClick={() => setPageMenu(pageMenu === p.pageKey ? null : p.pageKey)}
                    style={{ position: 'absolute', right: '6px', top: '8px', padding: '2px', background: 'none', border: 'none', cursor: 'pointer', opacity: 0.3, borderRadius: '4px' }}>
                    <MoreVertical className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
            <button onClick={() => setShowAddPage(true)} className="glass-nav-item" style={{ width: '100%', textAlign: 'left', cursor: 'pointer', color: 'var(--za-gold)', background: 'transparent', border: '1px solid transparent' }}>
              <Plus className="w-4 h-4" /> <span style={{ fontSize: '12px' }}>Neue Seite</span>
            </button>

            <div style={{ margin: '8px 12px', borderTop: '1px solid var(--za-border)' }} />
            <button onClick={() => handlePageSwitch('_global')}
              className={`glass-nav-item ${isGlobalSettings ? 'active' : ''}`}
              style={{ width: '100%', textAlign: 'left', cursor: 'pointer', background: isGlobalSettings ? 'linear-gradient(135deg, rgba(42,111,219,0.14), rgba(11,36,79,0.06))' : 'transparent', borderColor: isGlobalSettings ? 'rgba(42,111,219,0.28)' : 'transparent', color: isGlobalSettings ? 'var(--za-gold-2)' : 'var(--za-fg-2)' }}>
              <Palette className="w-4 h-4" /> <span style={{ fontSize: '12px' }}>Einstellungen</span>
            </button>

            {legalPages.length > 0 && (
              <>
                <div style={{ margin: '8px 12px', borderTop: '1px solid var(--za-border)' }} />
                <div style={{ padding: '4px 12px 6px' }}>
                  <span style={{ fontWeight: 700, fontSize: '9px', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--za-fg-4)' }}>Rechtliches</span>
                </div>
                {legalPages.map((p) => (
                  <button key={p.pageKey} onClick={() => handlePageSwitch(p.pageKey)}
                    className={`glass-nav-item ${currentPage === p.pageKey ? 'active' : ''}`}
                    style={{ width: '100%', textAlign: 'left', cursor: 'pointer', background: currentPage === p.pageKey ? 'linear-gradient(135deg, rgba(42,111,219,0.14), rgba(11,36,79,0.06))' : 'transparent', borderColor: currentPage === p.pageKey ? 'rgba(42,111,219,0.28)' : 'transparent', color: currentPage === p.pageKey ? 'var(--za-gold-2)' : 'var(--za-fg-2)' }}>
                    <Scale className="w-4 h-4" /> <span style={{ fontSize: '12px' }}>{p.title}</span>
                  </button>
                ))}
              </>
            )}
          </div>
        )}

        {/* MIDDLE: Editor */}
        <div className="editor-panel" style={{ width: isMultiPage ? '380px' : '440px', borderRight: '1px solid var(--za-border)', background: 'rgba(255,255,255,0.4)', backdropFilter: 'blur(12px)', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
          {/* Context */}
          {isMultiPage && (
            <div style={{ padding: '8px 16px', borderBottom: '1px solid var(--za-border)', fontSize: '11px', color: 'var(--za-fg-3)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              {isGlobalSettings ? <Palette className="w-3 h-3" /> : PAGE_ICONS[pages.find((p) => p.pageKey === currentPage)?.template || ''] || <FileText className="w-3 h-3" />}
              Bearbeiten: <span style={{ fontWeight: 600, color: 'var(--za-fg)' }}>{currentPageTitle}</span>
            </div>
          )}
          {isLegalPage && (
            <div style={{ padding: '8px 16px', borderBottom: '1px solid rgba(178,94,16,0.15)', fontSize: '11px', color: '#B25E10', display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(178,94,16,0.05)' }}>
              <AlertCircle className="w-3 h-3" /> Rechtlich relevant — sorgfältig ausfüllen.
            </div>
          )}

          {/* Tabs */}
          {!isLegalPage && !isGlobalSettings && (
            <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--za-border)' }}>
              <div className="glass-tabs">
                {([['chat', 'Chatbot', MessageSquare], ['manual', 'Manuell', Settings], ['history', 'Verlauf', History]] as [Tab, string, typeof MessageSquare][]).map(([key, label, Icon]) => (
                  <button key={key} onClick={() => setActiveTab(key)} className={`glass-tab ${activeTab === key ? 'active' : ''}`}>
                    <Icon className="w-3 h-3" style={{ display: 'inline', verticalAlign: '-2px', marginRight: '4px' }} />{label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            {isGlobalSettings ? <GlobalSettingsEditor config={config} onChange={updateConfig} /> :
             isLegalPage ? <LegalEditor siteConfig={config} pageKey={currentPage} onSave={(pc) => { if (isMultiPageConfig(config)) updateConfig({ ...config, pages: { ...config.pages, [currentPage]: { ...config.pages[currentPage], config: pc } } }) }} /> :
             activeTab === 'chat' ? <ChatTab messages={messages} input={input} setInput={setInput} sending={sending} onSend={sendMessage} chatEndRef={chatEndRef} currentPageTitle={currentPageTitle} pendingUpsell={pendingUpsell} upsellResponding={upsellResponding} onUpsellResponse={handleUpsellResponse} /> :
             activeTab === 'manual' ? <ManualEditor config={config} currentPage={currentPage} onChange={updateConfig} isMultiPage={isMultiPage} /> :
             <HistoryTab versions={versions} onRollback={handleRollback} />}
          </div>
        </div>

        {/* RIGHT: Preview */}
        <div className="editor-preview" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: '8px 16px', borderBottom: '1px solid var(--za-border)', background: 'rgba(255,255,255,0.4)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--za-fg-3)' }}>
              <Eye className="w-4 h-4" /> Vorschau {isMultiPage && !isGlobalSettings && `— ${currentPageTitle}`}
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={refreshPreview} style={{ fontSize: '11px', color: 'var(--za-fg-4)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <RotateCcw className="w-3 h-3" /> Aktualisieren
              </button>
              <button onClick={() => setFullscreenPreview(true)} style={{ fontSize: '11px', color: 'var(--za-fg-4)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Zap className="w-3 h-3" /> Vollbild
              </button>
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <iframe key={`${previewKey}-${currentPage}`}
              src={`/api/sites/${site.id}/preview${isMultiPage ? `?page=${isGlobalSettings ? 'home' : currentPage}` : ''}`}
              style={{ width: '100%', height: '100%', border: 0 }} title="Vorschau" />
          </div>
        </div>

        {/* Fullscreen Preview Modal */}
        {fullscreenPreview && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: '#000' }}>
            <button onClick={() => setFullscreenPreview(false)} style={{
              position: 'fixed', top: '16px', right: '16px', zIndex: 10000,
              background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '8px',
              padding: '8px 16px', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
            }}>
              ✕ Schließen
            </button>
            <iframe
              src={`/api/sites/${site.id}/preview${isMultiPage ? `?page=${isGlobalSettings ? 'home' : currentPage}` : ''}`}
              style={{ width: '100%', height: '100%', border: 0 }} title="Vorschau Vollbild" />
          </div>
        )}
      </div>

      {showAddPage && <AddPageModal onAdd={handleAddPage} onClose={() => setShowAddPage(false)} existingKeys={pages.map((p) => p.pageKey)} />}
    </div>
  )
}

// --- Chat Tab ---
function ChatTab({ messages, input, setInput, sending, onSend, chatEndRef, currentPageTitle, pendingUpsell, upsellResponding, onUpsellResponse }: {
  messages: ChatMessage[]; input: string; setInput: (v: string) => void; sending: boolean; onSend: (e: React.FormEvent) => void; chatEndRef: React.RefObject<HTMLDivElement>; currentPageTitle: string;
  pendingUpsell: { upsellId: string } | null; upsellResponding: boolean; onUpsellResponse: (action: 'accept' | 'reject' | 'later') => void
}) {
  return (
    <>
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', color: 'var(--za-fg-4)', fontSize: '12px', marginTop: '40px' }}>
            <MessageSquare style={{ width: '32px', height: '32px', margin: '0 auto 12px', color: 'var(--za-fg-4)', opacity: 0.4 }} />
            <p style={{ fontWeight: 600, color: 'var(--za-fg-3)', marginBottom: '8px' }}>KI-Assistent — {currentPageTitle}</p>
            <p style={{ fontStyle: 'italic' }}>&quot;Ändere die Headline zu ...&quot;</p>
            <p style={{ fontStyle: 'italic' }}>&quot;Füge einen neuen Service hinzu&quot;</p>
          </div>
        )}
        {messages.map((msg) => (
          <div key={msg.id} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
            <div className={msg.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-bot'} style={{ maxWidth: '85%' }}>
              <p style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{msg.content}</p>
              {msg.config_changes && (
                <p style={{ marginTop: '6px', fontSize: '10px', opacity: 0.7, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Check style={{ width: '10px', height: '10px' }} /> Änderungen angewendet
                </p>
              )}
            </div>
          </div>
        ))}
        {/* Upsell-Buttons */}
        {pendingUpsell && (
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', maxWidth: '85%' }}>
              <button onClick={() => onUpsellResponse('accept')} disabled={upsellResponding}
                style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '7px 14px', fontSize: '11px', fontWeight: 600, background: 'linear-gradient(135deg, #5C9EE8, #2A6FDB)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', opacity: upsellResponding ? 0.5 : 1 }}>
                <Zap style={{ width: '12px', height: '12px' }} /> Jetzt aktivieren
              </button>
              <button onClick={() => onUpsellResponse('later')} disabled={upsellResponding}
                style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '7px 14px', fontSize: '11px', fontWeight: 500, background: 'rgba(15,30,60,0.06)', color: 'var(--za-fg-2)', border: '1px solid var(--za-border)', borderRadius: '8px', cursor: 'pointer', opacity: upsellResponding ? 0.5 : 1 }}>
                <Clock style={{ width: '12px', height: '12px' }} /> Vielleicht später
              </button>
            </div>
          </div>
        )}
        {sending && (
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <div className="chat-bubble-bot" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Loader2 style={{ width: '14px', height: '14px', animation: 'spin 1s linear infinite' }} /> Denkt nach...
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>
      <form onSubmit={onSend} style={{ padding: '12px 16px', borderTop: '1px solid var(--za-border)', flexShrink: 0, display: 'flex', gap: '8px' }}>
        <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Änderung beschreiben..." disabled={sending} className="glass-input" style={{ flex: 1 }} />
        <button type="submit" disabled={sending || !input.trim()} className="glass-btn" style={{ padding: '10px 14px' }}>
          <Send style={{ width: '14px', height: '14px' }} />
        </button>
      </form>
    </>
  )
}

// --- Manual Editor ---
function ManualEditor({ config, currentPage, onChange, isMultiPage }: { config: SiteConfig; currentPage: string; onChange: (c: Partial<SiteConfig>) => void; isMultiPage: boolean }) {
  if (!isMultiPage) {
    return (
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {(['businessName', 'tagline', 'description', 'phone', 'email', 'address'] as const).map((key) => (
          <div key={key}>
            <label style={{ display: 'block', fontSize: '10px', color: 'var(--za-fg-3)', marginBottom: '4px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{key}</label>
            <input type="text" value={String(config[key] || '')} onChange={(e) => onChange({ [key]: e.target.value })} className="glass-input" />
          </div>
        ))}
      </div>
    )
  }
  if (!isMultiPageConfig(config) || !config.pages[currentPage]) return <div style={{ padding: '16px', color: 'var(--za-fg-4)' }}>Seite nicht gefunden</div>

  const page = config.pages[currentPage]
  const pageConfig = page.config as Record<string, unknown>

  function updateField(key: string, value: unknown) {
    onChange({ ...config, pages: { ...config.pages, [currentPage]: { ...page, config: { ...pageConfig, [key]: value } } } } as Partial<SiteConfig>)
  }

  function updatePageMeta(changes: Partial<typeof page>) {
    onChange({ ...config, pages: { ...config.pages, [currentPage]: { ...page, ...changes } } } as Partial<SiteConfig>)
  }

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div>
        <label style={{ display: 'block', fontSize: '10px', color: 'var(--za-fg-3)', marginBottom: '4px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Seitentitel</label>
        <input type="text" value={page.title} onChange={(e) => updatePageMeta({ title: e.target.value })} className="glass-input" />
      </div>
      <div>
        <label style={{ display: 'block', fontSize: '10px', color: 'var(--za-fg-3)', marginBottom: '4px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>SEO — Meta-Description</label>
        <textarea value={page.metaDescription || ''} onChange={(e) => updatePageMeta({ metaDescription: e.target.value })} rows={2} className="glass-input" style={{ resize: 'vertical', fontSize: '12px' }} placeholder="Kurze Beschreibung für Google (max. 160 Zeichen)" />
        <span style={{ fontSize: '10px', color: (page.metaDescription || '').length > 160 ? 'var(--za-danger)' : 'var(--za-fg-4)', marginTop: '2px', display: 'block' }}>{(page.metaDescription || '').length}/160</span>
      </div>
      <div>
        <label style={{ display: 'block', fontSize: '10px', color: 'var(--za-fg-3)', marginBottom: '4px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>SEO — OG-Image URL</label>
        <input type="text" value={String(pageConfig.ogImage || '')} onChange={(e) => updateField('ogImage', e.target.value)} className="glass-input" style={{ fontSize: '12px', fontFamily: 'monospace' }} placeholder="https://..." />
      </div>
      {Object.entries(pageConfig).map(([key, value]) => {
        if (Array.isArray(value)) return <div key={key}><label style={{ display: 'block', fontSize: '10px', color: 'var(--za-fg-3)', marginBottom: '4px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{key}</label><p style={{ fontSize: '11px', color: 'var(--za-fg-4)' }}>Array ({value.length}) — via Chatbot bearbeiten</p></div>
        if (typeof value === 'object' && value !== null) return (
          <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '10px', color: 'var(--za-fg-3)', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600 }}>{key}</label>
            {Object.entries(value as Record<string, string>).map(([sk, sv]) => (
              <div key={sk}>
                <label style={{ display: 'block', fontSize: '9px', color: 'var(--za-fg-4)', marginBottom: '2px' }}>{sk}</label>
                <input type="text" value={String(sv || '')} onChange={(e) => updateField(key, { ...(value as Record<string, unknown>), [sk]: e.target.value })} className="glass-input" style={{ fontSize: '12px' }} />
              </div>
            ))}
          </div>
        )
        return (
          <div key={key}>
            <label style={{ display: 'block', fontSize: '10px', color: 'var(--za-fg-3)', marginBottom: '4px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{key}</label>
            {String(value || '').length > 80 ? (
              <textarea value={String(value || '')} onChange={(e) => updateField(key, e.target.value)} rows={3} className="glass-input" style={{ resize: 'vertical' }} />
            ) : (
              <input type="text" value={String(value || '')} onChange={(e) => updateField(key, e.target.value)} className="glass-input" />
            )}
          </div>
        )
      })}
    </div>
  )
}

// --- Global Settings ---
function GlobalSettingsEditor({ config, onChange }: { config: SiteConfig; onChange: (c: Partial<SiteConfig>) => void }) {
  if (!isMultiPageConfig(config)) return null
  const { site } = config
  function upd(ch: Record<string, unknown>) { onChange({ ...config, site: { ...site, ...ch } } as Partial<SiteConfig>) }
  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div><span className="za-eyebrow">Allgemein</span></div>
      <div><label style={{ display: 'block', fontSize: '10px', color: 'var(--za-fg-3)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Firmenname</label><input type="text" value={site.name} onChange={(e) => upd({ name: e.target.value })} className="glass-input" /></div>
      <div><label style={{ display: 'block', fontSize: '10px', color: 'var(--za-fg-3)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Logo-Text</label><input type="text" value={site.branding.logoText} onChange={(e) => upd({ branding: { ...site.branding, logoText: e.target.value } })} className="glass-input" /></div>
      <div><label style={{ display: 'block', fontSize: '10px', color: 'var(--za-fg-3)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Footer-Text</label><input type="text" value={site.footer.text} onChange={(e) => upd({ footer: { ...site.footer, text: e.target.value } })} className="glass-input" /></div>
      <div><span className="za-eyebrow">Farben</span></div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        {(['primary', 'secondary', 'background', 'text'] as const).map((key) => (
          <div key={key}>
            <label style={{ display: 'block', fontSize: '10px', color: 'var(--za-fg-3)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{key}</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <input type="color" value={site.colors[key]} onChange={(e) => upd({ colors: { ...site.colors, [key]: e.target.value } })} style={{ width: '28px', height: '28px', borderRadius: '6px', border: '1px solid var(--za-border)', cursor: 'pointer' }} />
              <input type="text" value={site.colors[key]} onChange={(e) => upd({ colors: { ...site.colors, [key]: e.target.value } })} className="glass-input" style={{ flex: 1, fontFamily: 'monospace', fontSize: '11px' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// --- Legal Editor ---
function LegalEditor({ siteConfig, pageKey, onSave }: { siteConfig: SiteConfig; pageKey: string; onSave: (c: Record<string, unknown>) => void }) {
  if (!isMultiPageConfig(siteConfig)) return null
  const page = siteConfig.pages[pageKey]; if (!page) return null
  const pc = page.config as Record<string, string>
  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {Object.entries(pc).map(([key, value]) => (
        <div key={key}>
          <label style={{ display: 'block', fontSize: '10px', color: 'var(--za-fg-3)', marginBottom: '4px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{key}</label>
          <input type="text" value={value || ''} onChange={(e) => onSave({ ...pc, [key]: e.target.value })} className="glass-input" />
        </div>
      ))}
    </div>
  )
}

// --- History Tab ---
function HistoryTab({ versions, onRollback }: { versions: ConfigVersion[]; onRollback: (id: string) => void }) {
  const [rolling, setRolling] = useState<string | null>(null)
  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
      {versions.length === 0 ? (
        <div style={{ textAlign: 'center', color: 'var(--za-fg-4)', fontSize: '12px', marginTop: '40px' }}><History style={{ width: '32px', height: '32px', margin: '0 auto 12px', opacity: 0.4 }} /><p>Noch keine Versionen.</p></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {versions.map((v, i) => (
            <div key={v.id} className="glass" style={{ padding: '12px 14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 2 }}>
                <div>
                  <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '999px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', ...(v.created_by === 'chatbot' ? { color: '#6B5BD4', background: 'rgba(107,91,212,0.10)' } : { color: 'var(--za-fg-3)', background: 'rgba(15,30,60,0.06)' }) }}>
                    {v.created_by === 'chatbot' ? 'KI' : v.created_by === 'user' ? 'Manuell' : 'System'}
                  </span>
                  {i === 0 && <span style={{ fontSize: '10px', color: 'var(--za-success)', fontWeight: 600, marginLeft: '8px' }}>Aktuell</span>}
                  <p style={{ fontSize: '10px', color: 'var(--za-fg-4)', marginTop: '4px' }}>{new Date(v.created_at).toLocaleString('de-DE')}</p>
                </div>
                {i > 0 && (
                  <button onClick={async () => { setRolling(v.id); await onRollback(v.id); setRolling(null) }} disabled={rolling === v.id} className="glass-btn-ghost" style={{ padding: '4px 10px', fontSize: '10px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {rolling === v.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <RotateCcw className="w-3 h-3" />} Rollback
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// --- Add Page Modal ---
function AddPageModal({ onAdd, onClose, existingKeys }: { onAdd: (t: string, ti: string, s: string) => void; onClose: () => void; existingKeys: string[] }) {
  const [template, setTemplate] = useState('about')
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const templates = [
    { value: 'about', label: 'Über uns' }, { value: 'services', label: 'Leistungen' },
    { value: 'contact', label: 'Kontakt' }, { value: 'legal-imprint', label: 'Impressum' }, { value: 'legal-privacy', label: 'Datenschutz' },
  ].filter((t) => !existingKeys.includes(t.value))

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(11,19,34,0.3)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}>
      <div className="glass" style={{ padding: '28px', width: '100%', maxWidth: '420px', margin: '0 16px' }}>
        <h3 className="za-title" style={{ marginBottom: '20px', position: 'relative', zIndex: 2 }}>Neue Seite erstellen</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', position: 'relative', zIndex: 2 }}>
          <div>
            <label style={{ display: 'block', fontSize: '10px', color: 'var(--za-fg-3)', marginBottom: '4px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Template</label>
            <select value={template} onChange={(e) => { setTemplate(e.target.value); const t = templates.find((x) => x.value === e.target.value); if (t) { setTitle(t.label); setSlug(e.target.value.replace('legal-', '')) } }} className="glass-input">
              {templates.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div><label style={{ display: 'block', fontSize: '10px', color: 'var(--za-fg-3)', marginBottom: '4px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Titel</label><input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="glass-input" /></div>
          <div><label style={{ display: 'block', fontSize: '10px', color: 'var(--za-fg-3)', marginBottom: '4px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>URL-Pfad</label><input type="text" value={slug} onChange={(e) => setSlug(e.target.value)} className="glass-input" style={{ fontFamily: 'monospace' }} /></div>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '8px' }}>
            <button onClick={onClose} className="glass-btn-ghost">Abbrechen</button>
            <button onClick={() => onAdd(template, title, slug)} disabled={!title || !slug} className="glass-btn">Erstellen</button>
          </div>
        </div>
      </div>
    </div>
  )
}
