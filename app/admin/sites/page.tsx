import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function AdminSitesPage() {
  const supabase = createClient()
  const { data: sites } = await supabase
    .from('sites')
    .select('*, customers!inner(company_name)')
    .order('created_at', { ascending: false })

  return (
    <main className="max-w-6xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Alle Sites</h1>
      <div className="bg-white rounded-lg border border-gray-200">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 text-left text-xs text-gray-500 uppercase tracking-wider">
              <th className="px-6 py-3">Name</th>
              <th className="px-6 py-3">Kunde</th>
              <th className="px-6 py-3">Domain</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Erstellt</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {(sites || []).map((site) => (
              <tr key={site.id} className="hover:bg-gray-50">
                <td className="px-6 py-3">
                  <Link href={`/dashboard/${site.id}`} className="font-medium text-gray-900 hover:text-blue-600">{site.name}</Link>
                </td>
                <td className="px-6 py-3 text-sm text-gray-600">{(site.customers as Record<string, string>)?.company_name}</td>
                <td className="px-6 py-3 text-sm text-gray-500 font-mono">{site.domain || '—'}</td>
                <td className="px-6 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    site.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>{site.status === 'published' ? 'Live' : 'Entwurf'}</span>
                </td>
                <td className="px-6 py-3 text-sm text-gray-400">{new Date(site.created_at).toLocaleDateString('de-DE')}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!sites || sites.length === 0) && (
          <p className="px-6 py-8 text-center text-gray-400 text-sm">Keine Sites.</p>
        )}
      </div>
    </main>
  )
}
