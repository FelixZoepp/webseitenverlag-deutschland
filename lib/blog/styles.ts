/**
 * Geteilte Artikel-Styles für Blog-Seiten.
 *
 * Extrahiert aus app/(marketing)/blog/website-fuer-handwerker/page.tsx
 * und konsistent in allen Blog-Artikeln zu verwenden.
 */
import type React from 'react'

export const h2Style: React.CSSProperties = {
  fontFamily: 'var(--font-display)',
  fontWeight: 600,
  fontSize: 'clamp(24px, 3vw, 32px)',
  lineHeight: 1.15,
  marginTop: 56,
  marginBottom: 20,
  letterSpacing: '-0.02em',
  fontVariationSettings: '"opsz" 24, "SOFT" 50',
}

export const h3Style: React.CSSProperties = {
  fontFamily: 'var(--font-display)',
  fontWeight: 600,
  fontSize: 21,
  lineHeight: 1.2,
  marginTop: 32,
  marginBottom: 12,
  fontVariationSettings: '"opsz" 24, "SOFT" 50',
}

export const ulStyle: React.CSSProperties = {
  paddingLeft: 20,
  marginBottom: 24,
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
}

export const defBox: React.CSSProperties = {
  padding: '20px 24px',
  borderRadius: 16,
  background: 'rgba(37,99,235,0.04)',
  border: '1px solid rgba(37,99,235,0.12)',
  marginBottom: 24,
  fontSize: 15,
  lineHeight: 1.65,
}

export const ctaBox: React.CSSProperties = {
  padding: '32px',
  borderRadius: 20,
  background: 'var(--cream)',
  border: '1px solid var(--border)',
  marginTop: 40,
  marginBottom: 40,
}

export const thStyle: React.CSSProperties = {
  padding: '12px 14px',
  textAlign: 'left',
  fontWeight: 600,
  fontFamily: 'var(--font-mono)',
  fontSize: 12,
  letterSpacing: '0.05em',
  textTransform: 'uppercase',
}

export const tdStyle: React.CSSProperties = {
  padding: '12px 14px',
  verticalAlign: 'top',
}
