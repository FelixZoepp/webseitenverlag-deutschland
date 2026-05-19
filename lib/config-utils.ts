import { SiteConfig } from '@/types'

export function mergeConfigs(base: SiteConfig, changes: Partial<SiteConfig>): SiteConfig {
  const merged = { ...base, ...changes }

  if (changes.sections && base.sections) {
    merged.sections = base.sections.map((section) => {
      const update = changes.sections?.find((s) => s.id === section.id)
      return update ? { ...section, ...update } : section
    })
    // Add new sections
    const existingIds = new Set(base.sections.map((s) => s.id))
    const newSections = changes.sections.filter((s) => !existingIds.has(s.id))
    if (newSections.length > 0) {
      merged.sections = [...(merged.sections || []), ...newSections]
    }
  }

  return merged
}

export function configsEqual(a: SiteConfig, b: SiteConfig): boolean {
  return JSON.stringify(a) === JSON.stringify(b)
}
