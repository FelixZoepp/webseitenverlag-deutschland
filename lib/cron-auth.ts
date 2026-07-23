/**
 * Cron-Authentifizierung (fail-closed).
 *
 * Vercel ruft Cron-Routen mit `Authorization: Bearer ${CRON_SECRET}` auf.
 * Ist CRON_SECRET NICHT gesetzt, muss JEDER Aufruf abgelehnt werden —
 * der naive Vergleich `header !== \`Bearer ${process.env.CRON_SECRET}\``
 * würde sonst den literalen Header "Bearer undefined" akzeptieren
 * (Master-Review Befund B-15, J-006).
 */
export function istCronAutorisiert(request: Request): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) return false
  return request.headers.get('authorization') === `Bearer ${secret}`
}
