'use client'

import { useState, useEffect, useCallback } from 'react'
import { Site } from '@/types'
import { Mail, Phone, Search, Inbox, Eye, Archive, AlertTriangle, Trash2, X, Loader2, Bell, Send } from 'lucide-react'

interface Submission {
  id: string
  site_id: string
  form_type: string
  data: Record<string, unknown>
  qualifizierung: Record<string, unknown> | null
  sender_email: string | null
  sender_name: string
  status: string
  notification_sent: boolean
  created_at: string
  read_at: string | null
}

interface SubmissionResponse {
  submissions: Submission[]
  total: number
  counts: { all: number; new: number; read: number; archived: number; spam: number }
  page: number
}

type StatusFilter = 'all' | 'new' | 'read' | 'archived' | 'spam'

export default function LeadsView({ site }: { site: Site }) {
  const [data, setData] = useState<SubmissionResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<StatusFilter>('all')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Submission | null>(null)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [notifEmail, setNotifEmail] = useState('')
  const [notifEnabled, setNotifEnabled] = useState(true)
  const [sendingTest, setSendingTest] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  const loadSubmissions = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ status: filter })
    if (search) params.set('search', search)
    const res = await fetch(`/api/sites/${site.id}/submissions?${params}`)
    if (res.ok) setData(await res.json())
    setLoading(false)
  }, [site.id, filter, search])

  useEffect(() => { loadSubmissions() }, [loadSubmissions])

  useEffect(() => {
    fetch(`/api/sites/${site.id}/settings`).then(async (res) => {
      if (res.ok) {
        const d = await res.json()
        setNotifEmail(d.notification_email || '')
        setNotifEnabled(d.notification_enabled)
      }
    })
  }, [site.id])

  useEffect(() => {
    if (toast) { const t = setTimeout(() => setToast(null), 3000); return () => clearTimeout(t) }
  }, [toast])

  async function updateStatus(id: string, status: string) {
    await fetch(`/api/sites/${site.id}/submissions/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    if (selected?.id === id) setSelected((s) => s ? { ...s, status } : null)
    loadSubmissions()
  }

  async function deleteSubmission(id: string) {
    if (!confirm('Anfrage wirklich löschen?')) return
    await fetch(`/api/sites/${site.id}/submissions/${id}`, { method: 'DELETE' })
    setSelected(null)
    loadSubmissions()
  }

  async function saveSettings() {
    await fetch(`/api/sites/${site.id}/settings`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notification_email: notifEmail, notification_enabled: notifEnabled }),
    })
    setToast('Einstellungen gespeichert')
  }

  async function sendTestMail() {
    setSendingTest(true)
    const res = await fetch(`/api/sites/${site.id}/settings`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ send_test: true, notification_email: notifEmail }),
    })
    const d = await res.json()
    setToast(res.ok ? 'Test-Mail gesendet!' : d.error || 'Fehler')
    setSendingTest(false)
  }

  const counts = data?.counts || { all: 0, new: 0, read: 0, archived: 0, spam: 0 }
  const filters: { key: StatusFilter; label: string; icon: React.ReactNode }[] = [
    { key: 'all', label: 'Alle', icon: <Inbox className="w-3.5 h-3.5" /> },
    { key: 'new', label: 'Neu', icon: <Mail className="w-3.5 h-3.5" /> },
    { key: 'read', label: 'Gelesen', icon: <Eye className="w-3.5 h-3.5" /> },
    { key: 'archived', label: 'Archiviert', icon: <Archive className="w-3.5 h-3.5" /> },
    { key: 'spam', label: 'Spam', icon: <AlertTriangle className="w-3.5 h-3.5" /> },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-6 py-4 flex items-center justify-between border-b border-gray-200 bg-white">
        <div className="flex items-center gap-3">
          <h1 className="text-base font-bold text-gray-900">Anfragen</h1>
          {counts.new > 0 && (
            <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">{counts.new} neu</span>
          )}
        </div>
        <button onClick={() => setSettingsOpen(true)} className="text-gray-500 hover:text-gray-700 text-sm flex items-center gap-1">
          <Bell className="w-4 h-4" /> Einstellungen
        </button>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-6">
        {/* Filters */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          {filters.map((f) => (
            <button key={f.key} onClick={() => setFilter(f.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-colors ${
                filter === f.key ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}>
              {f.icon} {f.label}
              <span className={`text-xs ${filter === f.key ? 'text-blue-200' : 'text-gray-400'}`}>
                {counts[f.key]}
              </span>
            </button>
          ))}
          <div className="flex-1" />
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
            <input type="text" value={search} onChange={(ev) => setSearch(ev.target.value)}
              placeholder="Suchen..." onKeyDown={(ev) => ev.key === 'Enter' && loadSubmissions()}
              className="pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm w-56 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>

        {/* List */}
        {loading ? (
          <div className="text-center py-20"><Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400" /></div>
        ) : !data || data.submissions.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <Inbox className="w-12 h-12 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 mb-2">Noch keine Anfragen erhalten.</p>
            <p className="text-sm text-gray-400">Sobald jemand dein Kontaktformular ausfüllt, erscheint die Nachricht hier.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-100">
            {data.submissions.map((s) => (
              <button key={s.id} onClick={() => { setSelected(s); if (s.status === 'new') updateStatus(s.id, 'read') }}
                className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-3 transition-colors">
                <div className={`w-2 h-2 rounded-full shrink-0 ${s.status === 'new' ? 'bg-blue-500' : 'bg-gray-300'}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm ${s.status === 'new' ? 'font-semibold' : ''}`}>{s.sender_name}</span>
                    <span className="text-xs text-gray-400">{s.sender_email || String((s.data as Record<string, unknown>).phone || '')}</span>
                    {s.form_type === 'anfrage' && (
                      <span className="text-[10px] uppercase tracking-wide bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded">Anfrage</span>
                    )}
                    {s.form_type === 'reservierung' && (
                      <span className="text-[10px] uppercase tracking-wide bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">Reservierung</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 truncate mt-0.5">
                    {String((s.data as Record<string, unknown>).message || '').slice(0, 80)}
                  </p>
                </div>
                <span className="text-xs text-gray-400 shrink-0">
                  {new Date(s.created_at).toLocaleDateString('de-DE')}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg max-h-[80vh] overflow-y-auto shadow-2xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Anfrage von {selected.sender_name}</h2>
                <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
              </div>

              <div className="space-y-3 mb-6">
                {Object.entries(selected.data).map(([key, val]) => (
                  <div key={key}>
                    <label className="text-xs text-gray-500 font-medium">{key.charAt(0).toUpperCase() + key.slice(1)}</label>
                    <p className="text-sm text-gray-800 whitespace-pre-wrap">{String(val || '—')}</p>
                  </div>
                ))}
                {selected.qualifizierung && Object.keys(selected.qualifizierung).length > 0 && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                    <p className="text-xs font-semibold text-gray-600 mb-2">Qualifizierung aus dem Funnel</p>
                    <div className="space-y-2">
                      {Object.entries(selected.qualifizierung).map(([key, val]) => (
                        <div key={key}>
                          <label className="text-xs text-gray-500 font-medium">{key.charAt(0).toUpperCase() + key.slice(1)}</label>
                          <p className="text-sm text-gray-800 whitespace-pre-wrap">{String(val || '—')}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div>
                  <label className="text-xs text-gray-500 font-medium">Eingegangen</label>
                  <p className="text-sm text-gray-800">{new Date(selected.created_at).toLocaleString('de-DE')}</p>
                </div>
                {!selected.notification_sent && (
                  <p className="text-xs text-amber-600">⚠️ E-Mail-Benachrichtigung wurde nicht gesendet.</p>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {selected.sender_email ? (
                  <a href={`mailto:${selected.sender_email}?subject=Re: Ihre Anfrage bei ${site.name}`}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
                    <Mail className="w-3.5 h-3.5" /> Antworten
                  </a>
                ) : (selected.data as Record<string, unknown>).phone ? (
                  <a href={`tel:${String((selected.data as Record<string, unknown>).phone)}`}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
                    <Phone className="w-3.5 h-3.5" /> Anrufen
                  </a>
                ) : null}
                {selected.status !== 'read' && (
                  <button onClick={() => updateStatus(selected.id, 'read')}
                    className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
                    <Eye className="w-3.5 h-3.5" /> Gelesen
                  </button>
                )}
                <button onClick={() => updateStatus(selected.id, 'archived')}
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
                  <Archive className="w-3.5 h-3.5" /> Archivieren
                </button>
                <button onClick={() => updateStatus(selected.id, 'spam')}
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 text-amber-600">
                  <AlertTriangle className="w-3.5 h-3.5" /> Spam
                </button>
                <button onClick={() => deleteSubmission(selected.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-red-200 rounded-lg text-sm text-red-600 hover:bg-red-50">
                  <Trash2 className="w-3.5 h-3.5" /> Löschen
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {settingsOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md shadow-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Benachrichtigungen</h2>
              <button onClick={() => setSettingsOpen(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">E-Mail-Benachrichtigungen</p>
                  <p className="text-xs text-gray-500">Bei neuen Kontaktanfragen benachrichtigen</p>
                </div>
                <button onClick={() => setNotifEnabled(!notifEnabled)}
                  className={`w-10 h-6 rounded-full transition-colors ${notifEnabled ? 'bg-blue-600' : 'bg-gray-300'}`}>
                  <div className={`w-4 h-4 bg-white rounded-full transition-transform mx-1 ${notifEnabled ? 'translate-x-4' : ''}`} />
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">E-Mail für Benachrichtigungen</label>
                <input type="email" value={notifEmail} onChange={(ev) => setNotifEmail(ev.target.value)}
                  placeholder="Standard: Konto-E-Mail"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <p className="text-xs text-gray-400 mt-1">Wenn leer, wird deine Konto-E-Mail verwendet.</p>
              </div>

              <div className="flex gap-2">
                <button onClick={saveSettings}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700">
                  Speichern
                </button>
                <button onClick={sendTestMail} disabled={sendingTest}
                  className="flex items-center gap-1.5 px-4 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50 disabled:opacity-50">
                  {sendingTest ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  Test-Mail
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-4 right-4 bg-gray-900 text-white px-4 py-2.5 rounded-lg text-sm shadow-lg z-50">
          {toast}
        </div>
      )}
    </div>
  )
}
