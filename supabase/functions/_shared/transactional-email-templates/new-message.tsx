/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Button, Container, Head, Heading, Html, Preview, Section, Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = 'Casa Minga'
const SITE_URL = 'https://casaminga.com'

interface Props {
  recipientName?: string
  senderName?: string
  messagePreview?: string
  conversationId?: string
  listingTitle?: string
}

const NewMessageEmail = ({
  recipientName, senderName, messagePreview, conversationId, listingTitle,
}: Props) => (
  <Html lang="fr" dir="ltr">
    <Head />
    <Preview>Nouveau message{senderName ? ` de ${senderName}` : ''} sur Casa Minga</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Vous avez un nouveau message ✉️</Heading>
        <Text style={text}>
          {recipientName ? `Bonjour ${recipientName},` : 'Bonjour,'}{' '}
          <strong style={{ color: '#2e2623' }}>{senderName || 'Un membre'}</strong> vous a envoyé
          un message{listingTitle ? ` à propos de « ${listingTitle} »` : ''}.
        </Text>

        {messagePreview && (
          <Section style={card}>
            <Text style={cardLabel}>Aperçu du message</Text>
            <Text style={cardQuote}>« {messagePreview} »</Text>
          </Section>
        )}

        <Button
          style={button}
          href={conversationId
            ? `${SITE_URL}/dashboard/conversations/${conversationId}`
            : `${SITE_URL}/dashboard`}
        >
          Lire et répondre
        </Button>

        <Text style={footer}>
          Une conversation humaine fait toute la différence.<br />
          {SITE_NAME}
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: NewMessageEmail,
  subject: (d: any) => `Nouveau message${d?.senderName ? ` de ${d.senderName}` : ''} sur Casa Minga`,
  displayName: 'Nouveau message — notification au destinataire',
  previewData: {
    recipientName: 'Léa',
    senderName: 'Camille',
    messagePreview: 'Bonjour ! Nous serions ravis d\'en savoir plus sur votre lieu.',
    conversationId: 'abc-123',
    listingTitle: 'Chambre dans la maison commune',
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
  color: '#a89890', margin: '6px 0 8px', fontWeight: '600' as const,
}
const cardQuote = { fontSize: '14px', color: '#2e2623', fontStyle: 'italic' as const, margin: '0', lineHeight: '1.6' }
const button = {
  backgroundColor: '#d4623b', color: '#ffffff', fontSize: '14px',
  fontWeight: '500' as const, borderRadius: '8px',
  padding: '12px 22px', textDecoration: 'none',
}
const footer = { fontSize: '12px', color: '#999999', margin: '30px 0 0', lineHeight: '1.6' }
