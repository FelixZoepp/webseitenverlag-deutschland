import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright-E2E (Mission §12, Phase H4): kompletter Stripe-Testmode-Durchlauf
 * Lead → Demo → Checkout → Webhook → Portal → Wizard → Publish → Rollback.
 *
 * Env-gated: läuft nur, wenn E2E_ENABLED=1 und die nötigen Keys gesetzt sind
 * (siehe e2e/journey.spec.ts — ohne Envs wird alles sauber geskippt).
 * Erwartet einen laufenden Dev-Server (npm run dev) auf E2E_BASE_URL
 * bzw. startet ihn selbst, wenn keiner läuft (reuseExistingServer).
 */

const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:3000'
const E2E_AKTIV = process.env.E2E_ENABLED === '1'

export default defineConfig({
  testDir: './e2e',
  timeout: 120_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [['list']],
  use: {
    baseURL: BASE_URL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  // Dev-Server nur starten, wenn der Lauf überhaupt aktiv ist —
  // sonst würde Playwright beim reinen Skip trotzdem einen Server hochziehen.
  ...(E2E_AKTIV
    ? {
        webServer: {
          command: 'npm run dev',
          url: BASE_URL,
          reuseExistingServer: true,
          timeout: 120_000,
        },
      }
    : {}),
})
