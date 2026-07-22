/**
 * Anzeigename für Notiz-Autoren im Admin-CRM:
 * E-Mail-Lokalteil, erster Buchstabe groß (felix@… → „Felix").
 */
export function anzeigeName(email: string | null): string | null {
  if (!email) return null
  const lokalteil = email.split('@')[0]
  if (!lokalteil) return null
  return lokalteil.charAt(0).toUpperCase() + lokalteil.slice(1)
}
