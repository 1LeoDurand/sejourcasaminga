/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Hr, Html, Img, Link, Preview, Section, Text,
} from 'npm:@react-email/components@0.0.22'

/**
 * Shared brand layout for ALL Casa Minga emails — auth AND transactional
 * (markup only, no send logic). Wraps each template in a consistent chrome:
 *  - a cream letterhead header with the Casa Minga logo + wordmark,
 *  - the template body (children),
 *  - a footer with the brand mention and, when provided, an unsubscribe link.
 *
 * Design tokens mirror the app design system (src/index.css):
 *  terracotta = --primary/--terracotta (hsl 14 65% 52%), olive, azur, warm paper.
 *  Fonts follow the app (Bricolage Grotesque / Hanken Grotesk) with robust
 *  email-safe fallbacks — most mail clients ignore webfonts, so the fallback
 *  sans stack is what actually renders, and it matches the grotesque feel.
 */

const SITE_URL = 'https://sejour.casaminga.com'
const LOGO_URL = `${SITE_URL}/email-logo.png`

// Font stacks — real brand fonts first, clean sans fallbacks after.
const HEADING_FONT = "'Bricolage Grotesque', 'Trebuchet MS', 'Segoe UI', Helvetica, Arial, sans-serif"
const BODY_FONT = "'Hanken Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"

// ── Brand tokens (single source of truth for every email) ──
export const brand = {
  terracotta: '#D45A35', // --primary / --terracotta  (hsl 14 65% 52%)
  olive: '#708650',      // --olive                    (hsl 85 25% 42%)
  azur: '#377ABE',       // --azur                     (hsl 210 55% 48%)
  ink: '#2e2623',
  body: '#5e524d',
  muted: '#81746e',
  faint: '#a09289',
  paper: '#fdf9f0',      // header letterhead (matches the logo background)
  cream: '#fbf7f4',      // soft card / page background
  hairline: '#eee5df',

  headingFont: HEADING_FONT,
  bodyFont: BODY_FONT,

  main: { backgroundColor: '#fbf7f4', fontFamily: BODY_FONT, margin: '0', padding: '0' } as const,
  container: { padding: '0 0 8px', maxWidth: '560px', backgroundColor: '#ffffff', borderRadius: '16px', overflow: 'hidden' as const, margin: '24px auto', border: '1px solid #eee5df' } as const,
  content: { padding: '8px 28px 4px' } as const,

  header: { backgroundColor: '#fdf9f0', padding: '26px 28px 20px', textAlign: 'center' as const, borderBottom: '1px solid #eee5df' } as const,
  wordmark: { fontSize: '15px', fontWeight: 'bold' as const, fontFamily: HEADING_FONT, color: '#D45A35', margin: '10px 0 0', letterSpacing: '0.3px' } as const,

  h1: { fontSize: '25px', fontWeight: 'bold' as const, fontFamily: HEADING_FONT, color: '#2e2623', letterSpacing: '-0.4px', margin: '18px 0 14px', lineHeight: '1.25' } as const,
  h2: { fontSize: '18px', fontWeight: 'bold' as const, fontFamily: HEADING_FONT, color: '#2e2623', letterSpacing: '-0.2px', margin: '22px 0 12px' } as const,
  text: { fontSize: '15px', color: '#5e524d', lineHeight: '1.65', margin: '0 0 16px', fontFamily: BODY_FONT } as const,
  textSmall: { fontSize: '13px', color: '#81746e', lineHeight: '1.6', margin: '0 0 12px', fontFamily: BODY_FONT } as const,
  card: { backgroundColor: '#fbf7f4', borderRadius: '14px', padding: '16px 18px', margin: '6px 0 20px' } as const,
  button: { backgroundColor: '#D45A35', color: '#ffffff', fontSize: '15px', fontWeight: 'bold' as const, fontFamily: HEADING_FONT, borderRadius: '999px', padding: '13px 28px', textDecoration: 'none', display: 'inline-block' } as const,
  buttonAzur: { backgroundColor: '#377ABE', color: '#ffffff', fontSize: '15px', fontWeight: 'bold' as const, fontFamily: HEADING_FONT, borderRadius: '999px', padding: '13px 28px', textDecoration: 'none', display: 'inline-block' } as const,
  hr: { borderColor: '#eee5df', margin: '26px 0 18px' } as const,
  link: { color: '#D45A35', textDecoration: 'underline' } as const,
  code: { backgroundColor: '#fbf7f4', padding: '3px 9px', borderRadius: '6px', fontFamily: 'monospace', color: '#D45A35', fontSize: '14px' } as const,
}

const footerWrap = { padding: '18px 28px 22px', borderTop: '1px solid #eee5df', marginTop: '8px' } as const
const footerText = { fontSize: '12px', color: '#a09289', textAlign: 'center' as const, margin: '0 0 6px', lineHeight: '1.6', fontFamily: BODY_FONT } as const
const footerLink = { color: '#a09289', textDecoration: 'underline' } as const

interface BrandLayoutProps {
  preview: string
  children: React.ReactNode
  unsubscribeUrl?: string
  preferencesUrl?: string
}

export const BrandLayout = ({ preview, children, unsubscribeUrl, preferencesUrl }: BrandLayoutProps) => (
  <Html lang="fr" dir="ltr">
    <Head>
      <meta name="color-scheme" content="light" />
      <meta name="supported-color-schemes" content="light" />
    </Head>
    <Preview>{preview}</Preview>
    <Body style={brand.main}>
      <Container style={brand.container}>
        {/* Header — logo letterhead on cream */}
        <Section style={brand.header}>
          <Img
            src={LOGO_URL}
            alt="Casa Minga Séjours"
            width="180"
            height="126"
            style={{ margin: '0 auto', display: 'block' }}
          />
          <Text style={brand.wordmark}>Casa Minga Séjours</Text>
        </Section>

        {/* Body */}
        <Section style={brand.content}>
          {children}
        </Section>

        {/* Footer — brand mention + unsubscribe (réutilisé, jamais retiré) */}
        <Section style={footerWrap}>
          {(preferencesUrl || unsubscribeUrl) && (
            <Text style={footerText}>
              {preferencesUrl && (
                <Link href={preferencesUrl} style={footerLink}>Personnaliser la fréquence</Link>
              )}
              {preferencesUrl && unsubscribeUrl && '  ·  '}
              {unsubscribeUrl && (
                <Link href={unsubscribeUrl} style={footerLink}>Se désabonner</Link>
              )}
            </Text>
          )}
          <Text style={footerText}>
            Casa Minga Séjours — <Link href={SITE_URL} style={brand.link}>sejour.casaminga.com</Link>
          </Text>
          <Text style={footerText}>
            L'échange d'hospitalité entre lieux de vie collectifs.
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

// Re-export Hr for templates that want the shared hairline inside their body.
export { Hr }
