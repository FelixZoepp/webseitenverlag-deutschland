// Feature-Flags für stufenweise Aktivierung externer Services
// Tag 1: alles false → System läuft im manuell-Modus (Resend-Email, Slack-Worklist)
// Sobald API verbunden → Flag auf true → automatische Aktivierung

export const flags = {
  firefliesActive: !!process.env.FIREFLIES_API_KEY,
  slackActive: !!process.env.SLACK_WEBHOOK_VERTRIEB,
}
