'use client'

import { useState } from 'react'
import CustomerWelcome from './customer-welcome'

export default function DashboardWelcomeWrapper({
  customerName,
  customerId,
}: {
  customerName: string
  customerId: string
}) {
  const [show, setShow] = useState(true)

  if (!show) return null

  return (
    <CustomerWelcome
      customerName={customerName}
      customerId={customerId}
      onComplete={() => setShow(false)}
    />
  )
}
