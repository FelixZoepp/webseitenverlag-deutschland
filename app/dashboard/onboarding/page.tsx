import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import OnboardingWizard from '@/components/onboarding-wizard'

export const dynamic = 'force-dynamic'

export default async function OnboardingPage() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  let { data: customer } = await supabase
    .from('customers')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!customer) {
    const { data: newCustomer } = await supabase
      .from('customers')
      .insert({ user_id: user.id, contact_email: user.email })
      .select()
      .single()
    customer = newCustomer
  }

  if (!customer) redirect('/login')

  return <OnboardingWizard />
}
