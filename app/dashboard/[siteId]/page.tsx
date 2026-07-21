import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import SiteEditor from '@/components/site-editor'
import CustomerOnboardingFlow from '@/components/customer-onboarding-flow'
import KundenStatusDashboard from '@/components/kunden-status-dashboard'
import ErsteSchritteDashboard from '@/components/erste-schritte-dashboard'
import FreigabeBanner from '@/components/freigabe-banner'
import WizardBanner from '@/components/wizard-banner'
import { wizardFortschritt, WizardStatus } from '@/lib/wizard'

export const dynamic = 'force-dynamic'

export default async function SiteEditorPage({
  params,
  searchParams,
}: {
  params: { siteId: string }
  searchParams: { view?: string }
}) {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: customer } = await supabase
    .from('customers')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!customer) redirect('/login')

  const { data: site } = await supabase
    .from('sites')
    .select('*')
    .eq('id', params.siteId)
    .eq('customer_id', customer.id)
    .single()

  if (!site) redirect('/dashboard')

  const isAdmin = customer.role === 'admin'
  const onboardingDone = customer.onboarding_completed === true
  const siteIsLive = site.status === 'published'
  const buildStatus = (customer.build_status as string) || 'WARTEND'
  const onboardingStatus = (customer.onboarding_status as string) || 'AUSSTEHEND'
  const forcePreview = searchParams.view === 'preview'

  // Bilder-Count für Status-Check
  const { count: bilderCount } = await supabase
    .from('kunden_bilder')
    .select('*', { count: 'exact', head: true })
    .eq('customer_id', customer.id)
    .eq('site_id', params.siteId)

  // ──── Phase 1: Bilder-Upload (vor Onboarding-Call) ────
  if (!isAdmin && !onboardingDone && buildStatus === 'WARTEND') {
    // Prüfe ob Bilder da sind aber noch kein Call → Onboarding-Flow
    return (
      <CustomerOnboardingFlow
        siteId={params.siteId}
        templateId={(site.template_id as string) || 'business-basic'}
        customerName={(customer.company_name as string) || (customer.contact_email as string) || 'Kunde'}
        siteName={(site.name as string) || 'Ihre Webseite'}
      />
    )
  }

  // ──── Phase 2: Warten auf Build oder Build fertig ────
  if (!isAdmin && !siteIsLive && buildStatus !== 'FERTIG' && !forcePreview) {
    return (
      <KundenStatusDashboard
        siteId={params.siteId}
        siteName={(site.name as string) || 'Ihre Webseite'}
        customerName={(customer.company_name as string) || (customer.contact_email as string) || 'Kunde'}
        onboardingStatus={onboardingStatus}
        buildStatus={buildStatus}
        onboardingTermin={customer.onboarding_termin_am as string | null}
        hasBilder={(bilderCount || 0) > 0}
        previewAvailable={false}
      />
    )
  }

  // ──── Phase 3: Build fertig, noch nicht freigegeben ────
  if (!isAdmin && buildStatus === 'FERTIG' && !siteIsLive && !forcePreview) {
    return (
      <KundenStatusDashboard
        siteId={params.siteId}
        siteName={(site.name as string) || 'Ihre Webseite'}
        customerName={(customer.company_name as string) || (customer.contact_email as string) || 'Kunde'}
        onboardingStatus={onboardingStatus}
        buildStatus={buildStatus}
        onboardingTermin={customer.onboarding_termin_am as string | null}
        hasBilder={(bilderCount || 0) > 0}
        previewAvailable={true}
      />
    )
  }

  // ──── Phase 4a: Erste Schritte (live geschaltet, Get-started-Übersicht) ────
  // Standard-Ansicht für Kunden nach dem Livegang: große Vorschau + nächste
  // Schritte (Bilder, Domain, Blog/SEO, Angaben). Editor über ?view=editor.
  if (!isAdmin && siteIsLive && searchParams.view !== 'editor') {
    const [{ data: domains }, { count: seoFreigegebenCount }, { count: seoOffenCount }] = await Promise.all([
      supabase
        .from('domains')
        .select('hostname, status')
        .eq('site_id', params.siteId)
        .order('created_at', { ascending: false }),
      supabase
        .from('seo_landingpages')
        .select('*', { count: 'exact', head: true })
        .eq('site_id', params.siteId)
        .eq('status', 'FREIGEGEBEN'),
      supabase
        .from('seo_landingpages')
        .select('*', { count: 'exact', head: true })
        .eq('site_id', params.siteId)
        .eq('status', 'WARTET_AUF_FREIGABE'),
    ])

    const aktiveDomain = (domains || []).find((d) => d.status === 'AKTIV')
    const wartendeDomain = (domains || []).find((d) => d.status !== 'AKTIV' && d.status !== 'FEHLER')
    const startFortschritt = wizardFortschritt((site.wizard_status as WizardStatus) || {})

    return (
      <ErsteSchritteDashboard
        siteId={params.siteId}
        siteName={(site.name as string) || 'Ihre Webseite'}
        customerName={(customer.company_name as string) || (customer.contact_email as string) || 'Kunde'}
        domainStatus={aktiveDomain ? 'AKTIV' : wartendeDomain ? 'AUSSTEHEND' : 'KEINE'}
        domainHostname={aktiveDomain?.hostname || wartendeDomain?.hostname || null}
        seoFreigegeben={seoFreigegebenCount || 0}
        seoOffen={seoOffenCount || 0}
        hasBilder={(bilderCount || 0) > 0}
        wizardBearbeitet={startFortschritt.bearbeitet}
        wizardGesamt={startFortschritt.gesamt}
        wizardFertig={Boolean(site.fertiggestellt_am) || startFortschritt.bearbeitet >= startFortschritt.gesamt}
      />
    )
  }

  // ──── Phase 4: Editor (freigegeben, admin, oder force-preview) ────
  const { data: messages } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('site_id', site.id)
    .order('created_at', { ascending: true })
    .limit(50)

  const { data: versions } = await supabase
    .from('config_versions')
    .select('*')
    .eq('site_id', site.id)
    .order('created_at', { ascending: false })
    .limit(20)

  const showFreigabeBanner = !isAdmin && buildStatus === 'FERTIG' && !siteIsLive

  // Fertigstellungs-Wizard-Banner (§10.1): sichtbar bis fertiggestellt, blockiert nie
  const wizardOffen = !site.fertiggestellt_am
  const fortschritt = wizardFortschritt((site.wizard_status as WizardStatus) || {})

  return (
    <>
      {showFreigabeBanner && <FreigabeBanner siteId={params.siteId} />}
      {!isAdmin && wizardOffen && (
        <WizardBanner siteId={params.siteId} bearbeitet={fortschritt.bearbeitet} gesamt={fortschritt.gesamt} />
      )}
      <SiteEditor
        site={site}
        messages={messages || []}
        versions={versions || []}
      />
    </>
  )
}
