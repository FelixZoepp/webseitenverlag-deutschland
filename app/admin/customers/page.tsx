import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function AdminCustomers() {
  const supabase = createClient()
  const { data: customers } = await supabase
    .from('customers')
    .select('*, sites(count)')
    .eq('role', 'customer')
    .order('created_at', { ascending: false })

  return (
    <main className="max-w-6xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Kunden</h1>
        <Link href="/admin/customers/new" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium">
          + Neuer Kunde
        </Link>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 text-left text-xs text-gray-500 uppercase tracking-wider">
              <th className="px-6 py-3">Firma</th>
              <th className="px-6 py-3">E-Mail</th>
              <th className="px-6 py-3">Sites</th>
              <th className="px-6 py-3">Erstellt</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {(customers || []).map((c) => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="px-6 py-3">
                  <Link href={`/admin/customers/${c.id}`} className="font-medium text-gray-900 hover:text-blue-600">
                    {c.company_name || '—'}
                  </Link>
                </td>
                <td className="px-6 py-3 text-sm text-gray-600">{c.contact_email}</td>
                <td className="px-6 py-3 text-sm text-gray-600">{(c.sites as Array<Record<string, number>>)?.[0]?.count || 0}</td>
                <td className="px-6 py-3 text-sm text-gray-400">{new Date(c.created_at).toLocaleDateString('de-DE')}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!customers || customers.length === 0) && (
          <p className="px-6 py-8 text-center text-gray-400 text-sm">Noch keine Kunden.</p>
        )}
      </div>
    </main>
  )
}
