// Slack-Integration via Incoming Webhooks
// Channels: #vertrieb, #worklist, #errors, #money

const WEBHOOKS = {
  vertrieb: process.env.SLACK_WEBHOOK_VERTRIEB,
  worklist: process.env.SLACK_WEBHOOK_WORKLIST,
  errors: process.env.SLACK_WEBHOOK_ERRORS,
  money: process.env.SLACK_WEBHOOK_MONEY,
}

export type SlackChannel = keyof typeof WEBHOOKS

export async function sendSlackNotification(
  channel: SlackChannel,
  text: string
): Promise<boolean> {
  const url = WEBHOOKS[channel]
  if (!url) {
    console.log(`[SLACK-STUB] #${channel}: ${text}`)
    return false
  }

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    })
    return res.ok
  } catch (err) {
    console.error(`Slack notification failed (#${channel}):`, err)
    return false
  }
}
