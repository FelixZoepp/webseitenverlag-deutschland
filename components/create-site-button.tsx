'use client'

import Link from 'next/link'
import { Plus } from 'lucide-react'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function CreateSiteButton({ customerId }: { customerId: string }) {
  return (
    <Link
      href="/dashboard/onboarding"
      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium transition-colors"
    >
      <Plus className="w-4 h-4" />
      Neue Webseite
    </Link>
  )
}
