/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Section, Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = 'Casa Minga'

interface Props {
  type?: string
  message?: string
  fromEmail?: string
  pageUrl?: string
  userAgent?: string
  submittedAt?: string
}

const labelForType = (t?: string) => {
  if (t === 'bug') return '🐛 Bug signalé'
  if (t === 'question') return '❓ Question'
  if (t === 'suggestion') return '💡 Suggestion'
  return '📨 Feedback'
}

const FeedbackReceivedEmail = ({ type, message, fromEmail, pageUrl, userAgent, submittedAt }: Props) => (
  <Html lang="fr" dir="ltr">
    <Head />
    <Preview>{labelForType(type)} — {SITE_NAME}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>{labelForType(type)}</Heading>
        <Text style={text}>
          Un nouveau retour vient d'être envoyé depuis {SITE_NAME}.
        </Text>

        <Section style={card}>
          <Text style={cardLabel}>Message</Text>
          <Text style={cardQuote}>« {message || '—'} »</Text>

          {fromEmail && (
            <>
              <Text style={cardLabel}>Email de contact</Text>
              <Text style={cardValue}>{fromEmail}</Text>
            </>
          )}
          {pageUrl && (
            <>
              <Text style={cardLabel}>Page d'origine</Text>
              <Text style={cardValue}>{pageUrl}</Text>
            </>
          )}
          {submittedAt && (
            <>
              <Text style={cardLabel}>Envoyé le</Text>
              <Text style={cardValue}>{submittedAt}</Text>
            </>
          )}
          {userAgent && (
            <>
              <Text style={cardLabel}>Navigateur</Text>
              <Text style={cardValueSmall}>{userAgent}</Text>
            </>
          )}
        </Section>

        <Text style={footer}>{SITE_NAME} — modération</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: FeedbackReceivedEmail,
  subject: (d: any) => `${labelForType(d?.type)} — ${SITE_NAME}`,
  displayName: 'Feedback reçu (admin)',
  previewData: {
    type: 'bug',
    message: "Le bouton 'Rejoindre' ne fonctionne pas sur mobile.",
    fromEmail: 'utilisateur@example.com',
    pageUrl: 'https://casaminga.com/discover',
    userAgent: 'Mozilla/5.0 ...',
    submittedAt: '30 avril 2026, 14:32',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'Inter', Arial, sans-serif" }
const container = { padding: '24px 25px', maxWidth: '560px' }
const h1 = {
  fontSize: '24px', fontWeight: 'bold' as const,
  fontFamily: "'Playfair Display', Georgia, serif",
  color: '#2e2623', margin: '0 0 18px',
}
const text = { fontSize: '14px', color: '#81746e', lineHeight: '1.6', margin: '0 0 22px' }
const card = { backgroundColor: '#fbf7f4', borderRadius: '12px', padding: '18px 20px', margin: '0 0 24px' }
const cardLabel = {
  fontSize: '11px', textTransform: 'uppercase' as const, letterSpacing: '1px',
  color: '#a89890', margin: '12px 0 2px', fontWeight: '600' as const,
}
const cardValue = { fontSize: '14px', color: '#2e2623', margin: '0 0 4px', lineHeight: '1.5' }
const cardValueSmall = { fontSize: '12px', color: '#5e524d', margin: '0 0 4px', lineHeight: '1.4', wordBreak: 'break-all' as const }
const cardQuote = { fontSize: '14px', color: '#2e2623', fontStyle: 'italic' as const, margin: '0 0 8px', lineHeight: '1.6' }
const footer = { fontSize: '12px', color: '#999999', margin: '30px 0 0', lineHeight: '1.6' }
